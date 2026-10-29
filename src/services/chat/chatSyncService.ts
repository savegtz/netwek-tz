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
  async sendMessage(
    conversationId: string,
    message: ChatMessage,
    extraConv?: Partial<Conversation>
  ) {
    const localKey = `zenia_msgs_${conversationId}`;
    let foundConvObj: Conversation | null = (extraConv as Conversation) || null;

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
      const allKeys = Object.keys(localStorage).filter((k) =>
        k.startsWith('zenia_user_conversations_')
      );

      // 1. Locate the conversation object if not passed
      if (!foundConvObj) {
        for (const k of allKeys) {
          try {
            const list: Conversation[] = JSON.parse(localStorage.getItem(k) || '[]');
            const found = list.find((c) => c.id === conversationId);
            if (found) {
              foundConvObj = found;
              break;
            }
          } catch (_) {}
        }
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
              foundConvObj &&
              foundConvObj.participants &&
              foundConvObj.participants.includes(userId)
            ) {
              updatedList.unshift({
                ...foundConvObj,
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
      if (foundConvObj && foundConvObj.participants) {
        for (const pId of foundConvObj.participants) {
          const pKey = `zenia_user_conversations_${pId}`;
          if (!localStorage.getItem(pKey)) {
            const initialList: Conversation[] = [
              {
                ...foundConvObj,
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
      const updates: any = {
        id: conversationId,
        lastMessage:
          message.text ||
          (message.messageType === 'audio'
            ? '🎙️ Ujumbe wa sauti'
            : message.messageType === 'invoice'
            ? '🧾 Ankara ya Malipo'
            : message.messageType === 'poll'
            ? '📊 Kura ya Maoni'
            : message.messageType === 'tip_gift'
            ? '🎁 Zawadi'
            : 'Ujumbe mpya'),
        lastMessageType: message.messageType,
        lastMessageSenderId: message.senderId,
        updatedAt: message.createdAt,
        timestamp: Date.now(),
      };

      if (foundConvObj) {
        if (foundConvObj.participants) updates.participants = foundConvObj.participants;
        if (foundConvObj.participantDetails) updates.participantDetails = foundConvObj.participantDetails;
        if (foundConvObj.isGroup !== undefined) updates.isGroup = foundConvObj.isGroup;
        if (foundConvObj.groupName) updates.groupName = foundConvObj.groupName;
        if (foundConvObj.groupAvatar) updates.groupAvatar = foundConvObj.groupAvatar;
      } else if (conversationId.startsWith('conv_')) {
        const parts = conversationId.replace('conv_', '').split('_').filter(Boolean);
        if (parts.length >= 2) {
          updates.participants = parts;
        }
      }

      await setDoc(convRef, updates, { merge: true });

      // Send real-time notification to participants in Firestore
      const recipientIds = updates.participants
        ? updates.participants.filter((p: string) => p !== message.senderId)
        : [];

      for (const recId of recipientIds) {
        if (!recId || recId === 'guest') continue;
        try {
          const notifId = `notif_msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          await setDoc(doc(db, 'notifications', notifId), {
            id: notifId,
            userId: recId,
            title: message.senderName || 'Ujumbe Mpya',
            message:
              message.text ||
              (message.messageType === 'audio'
                ? '🎙️ Ujumbe wa sauti'
                : message.messageType === 'invoice'
                ? '🧾 Ankara ya Malipo'
                : 'Ujumbe mpya'),
            type: 'message',
            avatar: message.senderAvatar,
            read: false,
            createdAt: new Date().toISOString(),
            data: { conversationId, messageId: message.id, replyText: '' },
          });
        } catch (_) {}
      }
    } catch (e) {
      console.warn('Firestore message save error:', e);
    }
  },

  // Save or sync conversation metadata directly to Firestore
  async saveConversation(conv: Conversation) {
    try {
      const convRef = doc(db, 'conversations', conv.id);
      await setDoc(
        convRef,
        {
          id: conv.id,
          participants: conv.participants || [],
          participantDetails: conv.participantDetails || {},
          isGroup: Boolean(conv.isGroup),
          groupName: conv.groupName || null,
          groupAvatar: conv.groupAvatar || null,
          lastMessage: conv.lastMessage || '',
          lastMessageType: conv.lastMessageType || 'text',
          lastMessageSenderId: conv.lastMessageSenderId || null,
          updatedAt: conv.updatedAt || 'Sasa hivi',
          timestamp: Date.now(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Firestore conversation save notice:', e);
    }
  },

  // Real-time listener on all user's conversations across devices from Firestore
  subscribeUserConversations(
    userId: string,
    userEmail: string | undefined,
    onUpdate: (conversations: Conversation[]) => void
  ): () => void {
    if (!userId || userId === 'guest') {
      return () => {};
    }

    const localKey = `zenia_user_conversations_${userId}`;
    let currentConvs: Conversation[] = [];
    try {
      const saved = localStorage.getItem(localKey);
      if (saved) {
        currentConvs = JSON.parse(saved);
        onUpdate(currentConvs);
      }
    } catch (_) {}

    const normUser = userId.trim().toLowerCase();
    const emailNorm = userEmail ? userEmail.trim().toLowerCase() : '';

    const isUserParticipant = (c: any): boolean => {
      if (c.isGroup) return true; // public / member groups
      if (Array.isArray(c.participants)) {
        if (c.participants.includes(userId)) return true;
        if (c.participants.some((p: string) => p.toLowerCase() === normUser)) return true;
        if (emailNorm && c.participants.some((p: string) => p.toLowerCase() === emailNorm)) return true;
        if (normUser.includes('admin') || normUser === '7w6ldhpczbovpimurqrpq3c' || emailNorm === 'amytzee@gmail.com') {
          if (c.participants.some((p: string) => p.toLowerCase().includes('amytzee') || p.toLowerCase().includes('admin'))) {
            return true;
          }
        }
      }
      if (c.participantDetails) {
        if (c.participantDetails[userId]) return true;
        if (emailNorm && Object.values(c.participantDetails).some((d: any) => d?.email?.toLowerCase() === emailNorm)) {
          return true;
        }
      }
      return false;
    };

    let unsubFirestore: (() => void) | null = null;
    try {
      const convsColl = collection(db, 'conversations');
      unsubFirestore = onSnapshot(
        convsColl,
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteList: Conversation[] = [];
            snapshot.forEach((snap) => {
              const data = snap.data();
              if (isUserParticipant(data)) {
                remoteList.push({
                  id: snap.id,
                  participants: data.participants || [],
                  participantDetails: data.participantDetails || {},
                  isGroup: Boolean(data.isGroup),
                  groupName: data.groupName,
                  groupAvatar: data.groupAvatar,
                  lastMessage: data.lastMessage || 'Ujumbe mpya',
                  lastMessageType: data.lastMessageType || 'text',
                  lastMessageSenderId: data.lastMessageSenderId,
                  updatedAt: data.updatedAt || 'Sasa hivi',
                  unreadCount: data.lastMessageSenderId && data.lastMessageSenderId !== userId ? 1 : 0,
                });
              }
            });

            if (remoteList.length > 0) {
              const map = new Map<string, Conversation>();
              // Keep local customization like custom lists, pinned state, muted
              currentConvs.forEach((c) => map.set(c.id, c));
              // Merge/update with remote authoritative info
              remoteList.forEach((r) => {
                const existing = map.get(r.id);
                if (existing) {
                  map.set(r.id, {
                    ...existing,
                    lastMessage: r.lastMessage,
                    lastMessageType: r.lastMessageType,
                    lastMessageSenderId: r.lastMessageSenderId,
                    updatedAt: r.updatedAt,
                    participantDetails: {
                      ...existing.participantDetails,
                      ...r.participantDetails,
                    },
                    participants: Array.from(new Set([...(existing.participants || []), ...(r.participants || [])])),
                  });
                } else {
                  map.set(r.id, r);
                }
              });

              currentConvs = Array.from(map.values());
              try {
                localStorage.setItem(localKey, JSON.stringify(currentConvs));
              } catch (_) {}
              onUpdate(currentConvs);
            }
          }
        },
        (err) => {
          console.warn('Real-time conversation listener notice:', err);
        }
      );
    } catch (e) {
      console.warn('Firestore conversation listener warning:', e);
    }

    return () => {
      if (unsubFirestore) unsubFirestore();
    };
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
