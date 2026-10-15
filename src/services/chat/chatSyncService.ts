import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { ChatMessage, Conversation } from '../../types';

// Browser-level BroadcastChannel for zero-latency instant cross-tab sync
const chatChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('zenia_live_chat_sync')
    : null;

export const ChatSyncService = {
  // Subscribe to live messages for a conversation
  subscribeMessages(
    conversationId: string,
    initialMessages: ChatMessage[],
    onUpdate: (messages: ChatMessage[]) => void
  ) {
    const localKey = `zenia_msgs_${conversationId}`;
    let currentMsgs: ChatMessage[] = [];

    // 1. Try reading from localStorage first for instant display
    try {
      const cached = localStorage.getItem(localKey);
      if (cached) {
        currentMsgs = JSON.parse(cached);
        onUpdate(currentMsgs);
      } else if (initialMessages && initialMessages.length > 0) {
        currentMsgs = initialMessages;
        onUpdate(currentMsgs);
      }
    } catch (e) {
      if (initialMessages) {
        currentMsgs = initialMessages;
        onUpdate(currentMsgs);
      }
    }

    // 2. Listen to BroadcastChannel for instant same-browser cross-tab updates
    const handleBroadcast = (event: MessageEvent) => {
      if (event.data && event.data.conversationId === conversationId && event.data.type === 'NEW_MESSAGE') {
        const incomingMsg: ChatMessage = event.data.message;
        if (!currentMsgs.some((m) => m.id === incomingMsg.id)) {
          currentMsgs = [...currentMsgs, incomingMsg];
          try {
            localStorage.setItem(localKey, JSON.stringify(currentMsgs));
          } catch (_) {}
          onUpdate(currentMsgs);
        }
      }
    };

    const handleNewMessageDirect = (incomingMsg: ChatMessage, targetConvId: string) => {
      if (targetConvId !== conversationId) return;
      if (!currentMsgs.some((m) => m.id === incomingMsg.id)) {
        currentMsgs = [...currentMsgs, incomingMsg];
        try {
          localStorage.setItem(localKey, JSON.stringify(currentMsgs));
        } catch (_) {}
        onUpdate(currentMsgs);
      }
    };

    const handleCustomMsgEvent = (e: any) => {
      if (e.detail && e.detail.message && e.detail.conversationId === conversationId) {
        handleNewMessageDirect(e.detail.message, e.detail.conversationId);
      }
    };
    window.addEventListener('zenia_new_message_event', handleCustomMsgEvent);

    const handleStorageMsg = (e: StorageEvent) => {
      if (e.key === 'zenia_live_msg_signal' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.conversationId === conversationId && parsed.message) {
            handleNewMessageDirect(parsed.message, parsed.conversationId);
          }
        } catch (_) {}
      }
    };
    window.addEventListener('storage', handleStorageMsg);

    if (chatChannel) {
      chatChannel.addEventListener('message', handleBroadcast);
    }

    // 3. Listen to Firestore collection in real-time
    let unsubscribeFirestore: (() => void) | null = null;
    try {
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      const q = query(messagesRef);

      unsubscribeFirestore = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteMsgs: ChatMessage[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              remoteMsgs.push({
                id: docSnap.id,
                conversationId,
                senderId: data.senderId,
                senderName: data.senderName,
                text: data.text || '',
                messageType: data.messageType || 'text',
                createdAt: data.createdAt || '12:00 PM',
                mediaUrl: data.mediaUrl,
                audioDuration: data.audioDuration,
                transcription: data.transcription,
                pollDetails: data.pollDetails,
                tipDetails: data.tipDetails,
                isViewOnce: data.isViewOnce,
                isViewedOnce: data.isViewedOnce,
                isSilent: data.isSilent,
                isEdited: data.isEdited,
                disappearingTimer: data.disappearingTimer,
                replyTo: data.replyTo,
              });
            });

            // Merge with local messages, keeping newest
            const merged = [...currentMsgs];
            for (const r of remoteMsgs) {
              const idx = merged.findIndex((m) => m.id === r.id);
              if (idx >= 0) {
                merged[idx] = r;
              } else {
                merged.push(r);
              }
            }

            currentMsgs = merged;
            try {
              localStorage.setItem(localKey, JSON.stringify(currentMsgs));
            } catch (_) {}
            onUpdate(currentMsgs);
          }
        },
        (error) => {
          console.warn('Firestore live message listener notice:', error.message);
        }
      );
    } catch (err) {
      console.warn('Firestore subscription failed, continuing with Broadcast & local storage:', err);
    }

    // Return cleanup function
    return () => {
      window.removeEventListener('zenia_new_message_event', handleCustomMsgEvent);
      window.removeEventListener('storage', handleStorageMsg);
      if (chatChannel) {
        chatChannel.removeEventListener('message', handleBroadcast);
      }
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  },

  // Send a real-time message to Firestore and broadcast
  async sendMessage(conversationId: string, message: ChatMessage) {
    const localKey = `zenia_msgs_${conversationId}`;

    // 1. Save to local storage
    try {
      const cached = localStorage.getItem(localKey);
      const list: ChatMessage[] = cached ? JSON.parse(cached) : [];
      if (!list.some((m) => m.id === message.id)) {
        list.push(message);
        localStorage.setItem(localKey, JSON.stringify(list));
      }
    } catch (_) {}

    // 2. Broadcast to other open tabs in the browser & local storage event
    if (chatChannel) {
      try {
        chatChannel.postMessage({
          type: 'NEW_MESSAGE',
          conversationId,
          message,
        });
      } catch (_) {}
    }

    try {
      localStorage.setItem(
        'zenia_live_msg_signal',
        JSON.stringify({ conversationId, message, _sigTime: Date.now() })
      );
      window.dispatchEvent(
        new CustomEvent('zenia_new_message_event', { detail: { conversationId, message } })
      );
    } catch (_) {}

    // Update conversation previews across all stored user accounts and ensure participants have the conversation
    try {
      // 1. Locate the conversation object
      let currentConvObj: Conversation | null = null;
      const allKeys = Object.keys(localStorage).filter((k) =>
        k.startsWith('zenia_user_conversations_')
      );
      for (const k of allKeys) {
        try {
          const list: Conversation[] = JSON.parse(localStorage.getItem(k) || '[]');
          const found = list.find((c) => c.id === conversationId);
          if (found) {
            currentConvObj = found;
            break;
          }
        } catch (_) {}
      }

      const lastMsgText =
        message.text ||
        (message.messageType === 'audio'
          ? '🎙️ Ujumbe wa sauti'
          : message.messageType === 'poll'
          ? '📊 Kura ya Maoni'
          : 'Ujumbe mpya');

      // Update existing lists
      for (const k of allKeys) {
        const raw = localStorage.getItem(k);
        if (raw) {
          try {
            const convs: Conversation[] = JSON.parse(raw);
            let modified = false;
            const userId = k.replace('zenia_user_conversations_', '');
            const updatedList = convs.map((c) => {
              if (c.id === conversationId) {
                modified = true;
                return {
                  ...c,
                  lastMessage: lastMsgText,
                  lastMessageType: message.messageType,
                  lastMessageSenderId: message.senderId,
                  updatedAt: message.createdAt,
                  unreadCount:
                    message.senderId === userId
                      ? 0
                      : (c.unreadCount || 0) + 1,
                };
              }
              return c;
            });

            // If this user is a participant but doesn't have this conversation in their list yet, add it!
            if (
              !modified &&
              currentConvObj &&
              currentConvObj.participants &&
              currentConvObj.participants.includes(userId)
            ) {
              updatedList.unshift({
                ...currentConvObj,
                lastMessage: lastMsgText,
                lastMessageType: message.messageType,
                lastMessageSenderId: message.senderId,
                updatedAt: message.createdAt,
                unreadCount: message.senderId === userId ? 0 : 1,
              });
              modified = true;
            }

            if (modified) {
              localStorage.setItem(k, JSON.stringify(updatedList));
            }
          } catch (_) {}
        }
      }

      // If participants don't even have a zenia_user_conversations_ entry yet, create one for them!
      if (currentConvObj && currentConvObj.participants) {
        for (const pId of currentConvObj.participants) {
          const pKey = `zenia_user_conversations_${pId}`;
          if (!localStorage.getItem(pKey)) {
            const initialList: Conversation[] = [
              {
                ...currentConvObj,
                lastMessage: lastMsgText,
                lastMessageType: message.messageType,
                lastMessageSenderId: message.senderId,
                updatedAt: message.createdAt,
                unreadCount: message.senderId === pId ? 0 : 1,
              },
            ];
            try {
              localStorage.setItem(pKey, JSON.stringify(initialList));
            } catch (_) {}
          }
        }
      }

      window.dispatchEvent(
        new CustomEvent('zenia_conversations_updated', {
          detail: { conversationId, message },
        })
      );
    } catch (_) {}

    // 3. Write to Firestore so other devices & remote users receive it live
    try {
      const msgRef = doc(db, 'conversations', conversationId, 'messages', message.id);
      await setDoc(msgRef, {
        ...message,
        timestamp: Date.now(),
      });

      // Update parent conversation doc
      const convRef = doc(db, 'conversations', conversationId);
      await setDoc(
        convRef,
        {
          id: conversationId,
          lastMessage:
            message.text ||
            (message.messageType === 'audio' ? 'Ujumbe wa sauti' : 'Ujumbe mpya'),
          lastMessageType: message.messageType,
          lastMessageSenderId: message.senderId,
          updatedAt: message.createdAt,
          timestamp: Date.now(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Firestore message save error:', e);
    }
  },

  // Update a message (for edits, poll votes, opening tips, view-once)
  async updateMessage(conversationId: string, messageId: string, updates: Partial<ChatMessage>) {
    const localKey = `zenia_msgs_${conversationId}`;
    try {
      const cached = localStorage.getItem(localKey);
      if (cached) {
        const list: ChatMessage[] = JSON.parse(cached);
        const updated = list.map((m) => (m.id === messageId ? { ...m, ...updates } : m));
        localStorage.setItem(localKey, JSON.stringify(updated));
      }
    } catch (_) {}

    try {
      const msgRef = doc(db, 'conversations', conversationId, 'messages', messageId);
      await setDoc(msgRef, updates, { merge: true });
    } catch (e) {
      console.warn('Firestore message update error:', e);
    }
  },

  // Delete a single message
  async deleteMessage(conversationId: string, messageId: string) {
    const localKey = `zenia_msgs_${conversationId}`;
    try {
      const cached = localStorage.getItem(localKey);
      if (cached) {
        const list: ChatMessage[] = JSON.parse(cached);
        const filtered = list.filter((m) => m.id !== messageId);
        localStorage.setItem(localKey, JSON.stringify(filtered));
      }
    } catch (_) {}

    if (chatChannel) {
      try {
        chatChannel.postMessage({
          type: 'DELETE_MESSAGE',
          conversationId,
          messageId,
        });
      } catch (_) {}
    }

    try {
      const msgRef = doc(db, 'conversations', conversationId, 'messages', messageId);
      await deleteDoc(msgRef);
    } catch (e) {
      console.warn('Firestore message delete error:', e);
    }
  },

  // Clear all messages in a conversation
  async clearAllMessages(conversationId: string) {
    const localKey = `zenia_msgs_${conversationId}`;
    try {
      localStorage.removeItem(localKey);
    } catch (_) {}

    if (chatChannel) {
      try {
        chatChannel.postMessage({
          type: 'CLEAR_MESSAGES',
          conversationId,
        });
      } catch (_) {}
    }
  },
};
