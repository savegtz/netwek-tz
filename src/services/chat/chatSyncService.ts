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
import {
  normalizeUserId,
  matchesUser,
  ADMIN_CANONICAL_ID,
  SAVEGAMOUR_CANONICAL_ID,
  buildCanonicalConversationId,
} from '../user/friendshipService';

// Browser-level BroadcastChannel for zero-latency instant cross-tab sync
const chatChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('zenia_live_chat_sync')
    : null;

/**
 * Deeply sanitizes any object or array to ensure no `undefined` values exist,
 * as Firestore setDoc/updateDoc strictly rejects undefined fields.
 */
export function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) return null as any;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore) as any;
  }
  if (typeof obj === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (val !== undefined) {
        clean[key] = sanitizeForFirestore(val);
      }
    }
    return clean as any;
  }
  return obj;
}

export function getAllEquivalentConversationIds(conversationId: string): string[] {
  const set = new Set<string>();
  if (!conversationId) return [];
  set.add(conversationId);

  if (conversationId.startsWith('conv_')) {
    const raw = conversationId.replace('conv_', '');
    const rawParts = raw.split('_');
    if (rawParts.length >= 2) {
      const partA = rawParts[0];
      const partB = rawParts.slice(1).join('_');

      const aliasesFor = (p: string): string[] => {
        const norm = normalizeUserId(p);
        const list = [p, norm];
        if (norm === ADMIN_CANONICAL_ID || p === 'current_user_id' || p.toLowerCase().includes('amytzee') || p.includes('amina')) {
          list.push(ADMIN_CANONICAL_ID, 'current_user_id', 'amytzee@gmail.com', 'amytzee', 'user_amina_1', 'user_amina_kaunga', 'amina_kaunga');
        }
        if (norm === SAVEGAMOUR_CANONICAL_ID || p.toLowerCase().includes('savegamour') || p.includes('FCXkMkn1mo')) {
          list.push(SAVEGAMOUR_CANONICAL_ID, 'savegamour@gmail.com', 'savegamour', 'FCXkMkn1moZ5Vd8SR1IZuXJL', 'user_savegamour');
        }
        return Array.from(new Set(list.filter(Boolean)));
      };

      const aliasesA = aliasesFor(partA);
      const aliasesB = aliasesFor(partB);

      for (const a of aliasesA) {
        for (const b of aliasesB) {
          set.add(`conv_${[a, b].sort().join('_')}`);
          set.add(`conv_${a}_${b}`);
          set.add(`conv_${b}_${a}`);
        }
      }
    }
  }

  return Array.from(set);
}

export function getCanonicalConversationId(conversationId: string): string {
  if (!conversationId) return '';
  if (conversationId.startsWith('conv_')) {
    const raw = conversationId.replace('conv_', '');
    const rawParts = raw.split('_');
    if (rawParts.length >= 2) {
      const partA = rawParts[0];
      const partB = rawParts.slice(1).join('_');
      return buildCanonicalConversationId(partA, partB);
    }
  }
  return conversationId;
}

export const ChatSyncService = {
  // Subscribe to live messages for a conversation across canonical and alias IDs
  subscribeMessages(
    conversationId: string,
    initialMessages: ChatMessage[],
    onUpdate: (messages: ChatMessage[]) => void,
    currentUserId?: string
  ) {
    const canonicalId = getCanonicalConversationId(conversationId);
    const equivalentIds = getAllEquivalentConversationIds(conversationId);
    const localKey = `zenia_msgs_${conversationId}`;
    const canonicalLocalKey = `zenia_msgs_${canonicalId}`;
    let currentMsgs: ChatMessage[] = [];

    // 1. Try reading from localStorage first for instant display
    try {
      const mergedMap = new Map<string, ChatMessage>();
      for (const eId of equivalentIds) {
        const k = `zenia_msgs_${eId}`;
        const raw = localStorage.getItem(k);
        if (raw) {
          const list: ChatMessage[] = JSON.parse(raw);
          list.forEach((m) => mergedMap.set(m.id, m));
        }
      }

      if (mergedMap.size > 0) {
        currentMsgs = Array.from(mergedMap.values());
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

    const persistLocal = (msgs: ChatMessage[]) => {
      try {
        const json = JSON.stringify(msgs);
        localStorage.setItem(localKey, json);
        localStorage.setItem(canonicalLocalKey, json);
      } catch (_) {}
    };

    // 2. Listen to BroadcastChannel for instant same-browser cross-tab updates
    const handleBroadcast = (event: MessageEvent) => {
      if (!event.data) return;
      const targetMatches = equivalentIds.includes(event.data.conversationId);
      if (!targetMatches) return;

      if (event.data.type === 'NEW_MESSAGE') {
        const incomingMsg: ChatMessage = event.data.message;
        if (!currentMsgs.some((m) => m.id === incomingMsg.id)) {
          currentMsgs = [...currentMsgs, incomingMsg];
          persistLocal(currentMsgs);
          onUpdate(currentMsgs);
        }
      } else if (event.data.type === 'MESSAGES_SEEN') {
        let modified = false;
        currentMsgs = currentMsgs.map((m) => {
          if (!matchesUser(event.data.userId, m.senderId) && m.status !== 'seen') {
            modified = true;
            return { ...m, status: 'seen' as const };
          }
          return m;
        });
        if (modified) {
          persistLocal(currentMsgs);
          onUpdate(currentMsgs);
        }
      } else if (event.data.type === 'UPDATE_MESSAGE') {
        const { messageId, updates } = event.data;
        let modified = false;
        currentMsgs = currentMsgs.map((m) => {
          if (m.id === messageId) {
            modified = true;
            return { ...m, ...updates };
          }
          return m;
        });
        if (modified) {
          persistLocal(currentMsgs);
          onUpdate(currentMsgs);
        }
      }
    };

    const handleSeenDirect = (targetConvId: string, seenUserId: string) => {
      if (!equivalentIds.includes(targetConvId)) return;
      let modified = false;
      currentMsgs = currentMsgs.map((m) => {
        if (!matchesUser(seenUserId, m.senderId) && m.status !== 'seen') {
          modified = true;
          return { ...m, status: 'seen' as const };
        }
        return m;
      });
      if (modified) {
        persistLocal(currentMsgs);
        onUpdate(currentMsgs);
      }
    };

    const handleCustomSeenEvent = (e: any) => {
      if (e.detail && e.detail.conversationId) {
        handleSeenDirect(e.detail.conversationId, e.detail.userId);
      }
    };
    window.addEventListener('zenia_messages_seen_event', handleCustomSeenEvent);

    const handleNewMessageDirect = (incomingMsg: ChatMessage, targetConvId: string) => {
      if (!equivalentIds.includes(targetConvId)) return;
      if (!currentMsgs.some((m) => m.id === incomingMsg.id)) {
        currentMsgs = [...currentMsgs, incomingMsg];
        persistLocal(currentMsgs);
        onUpdate(currentMsgs);
      }
    };

    const handleCustomMsgEvent = (e: any) => {
      if (e.detail && e.detail.message && equivalentIds.includes(e.detail.conversationId)) {
        handleNewMessageDirect(e.detail.message, e.detail.conversationId);
      }
    };
    window.addEventListener('zenia_new_message_event', handleCustomMsgEvent);

    const handleStorageMsg = (e: StorageEvent) => {
      if (e.key === 'zenia_live_msg_signal' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (equivalentIds.includes(parsed.conversationId) && parsed.message) {
            handleNewMessageDirect(parsed.message, parsed.conversationId);
          }
        } catch (_) {}
      }
    };
    window.addEventListener('storage', handleStorageMsg);

    if (chatChannel) {
      chatChannel.addEventListener('message', handleBroadcast);
    }

    // 3. Listen to Firestore collection in real-time on all target IDs
    const unsubsFirestore: (() => void)[] = [];
    const listenTargetIds = Array.from(new Set([canonicalId, conversationId, ...equivalentIds].filter(Boolean)));

    for (const cId of listenTargetIds) {
      try {
        const messagesRef = collection(db, 'conversations', cId, 'messages');
        const q = query(messagesRef);

        const unsub = onSnapshot(
          q,
          (snapshot) => {
            if (!snapshot.empty) {
              const remoteMsgs: ChatMessage[] = [];
              snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const msgStatus = data.status || 'sent';

                // Real-time Delivery Acknowledgement (WhatsApp / Coding Cafe standard):
                // When recipient receives a sent message, mark it as delivered so sender gets double ticks
                if (currentUserId && !matchesUser(currentUserId, data.senderId) && msgStatus === 'sent') {
                  try {
                    setDoc(doc(db, 'conversations', cId, 'messages', docSnap.id), { status: 'delivered' }, { merge: true });
                  } catch (_) {}
                }

                remoteMsgs.push({
                  id: docSnap.id,
                  conversationId,
                  senderId: data.senderId,
                  senderName: data.senderName,
                  senderAvatar: data.senderAvatar,
                  text: data.text || '',
                  messageType: data.messageType || 'text',
                  createdAt: data.createdAt || '12:00 PM',
                  status: currentUserId && !matchesUser(currentUserId, data.senderId) && msgStatus === 'sent' ? 'delivered' : msgStatus,
                  reactions: data.reactions || {},
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

              // Merge with local messages, keeping newest/remote updates
              const merged = [...currentMsgs];
              for (const r of remoteMsgs) {
                const idx = merged.findIndex((m) => m.id === r.id);
                if (idx >= 0) {
                  merged[idx] = { ...merged[idx], ...r };
                } else {
                  merged.push(r);
                }
              }

              currentMsgs = merged;
              persistLocal(currentMsgs);
              onUpdate(currentMsgs);
            }
          },
          (error) => {
            console.warn('Firestore live message listener notice for', cId, error.message);
          }
        );
        unsubsFirestore.push(unsub);
      } catch (err) {
        console.warn('Firestore subscription failed for', cId, err);
      }
    }

    // Return cleanup function
    return () => {
      window.removeEventListener('zenia_messages_seen_event', handleCustomSeenEvent);
      window.removeEventListener('zenia_new_message_event', handleCustomMsgEvent);
      window.removeEventListener('storage', handleStorageMsg);
      if (chatChannel) {
        chatChannel.removeEventListener('message', handleBroadcast);
      }
      unsubsFirestore.forEach((u) => {
        try {
          u();
        } catch (_) {}
      });
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

            const isUserInParticipants =
              foundConvObj &&
              foundConvObj.participants &&
              (foundConvObj.participants.includes(userId) ||
                foundConvObj.participants.some((p) => matchesUser(userId, p)) ||
                (userId === 'current_user_id' && foundConvObj.participants.some((p) => matchesUser(ADMIN_CANONICAL_ID, p))));

            // If this user is a participant but doesn't have this conversation in their list yet, add it!
            if (!modified && isUserInParticipants && foundConvObj) {
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

        // Special handling for Admin dual-keys
        if (foundConvObj.participants.some((p) => matchesUser(ADMIN_CANONICAL_ID, p))) {
          ['current_user_id', ADMIN_CANONICAL_ID].forEach((admKeyId) => {
            const admKey = `zenia_user_conversations_${admKeyId}`;
            try {
              const raw = localStorage.getItem(admKey);
              const list: Conversation[] = raw ? JSON.parse(raw) : [];
              const idx = list.findIndex((c) => c.id === conversationId);
              const convToSave = {
                ...foundConvObj!,
                lastMessage: lastMsgText,
                lastMessageType: message.messageType,
                lastMessageSenderId: message.senderId,
                updatedAt: message.createdAt,
                unreadCount: matchesUser(ADMIN_CANONICAL_ID, message.senderId) ? 0 : 1,
              };
              if (idx >= 0) {
                list[idx] = { ...list[idx], ...convToSave };
              } else {
                list.unshift(convToSave);
              }
              localStorage.setItem(admKey, JSON.stringify(list));
            } catch (_) {}
          });
        }
      }

      window.dispatchEvent(
        new CustomEvent('zenia_conversations_updated', {
          detail: { conversationId, message, conversation: foundConvObj },
        })
      );
    } catch (_) {}

    // 3. Write to Firestore so other devices & remote users receive it live across canonical and alias paths
    try {
      const canonicalId = getCanonicalConversationId(conversationId);
      const cleanStatus = message.status === 'seen' || message.status === 'delivered' ? message.status : 'sent';
      const cleanMessage: ChatMessage = {
        ...message,
        status: cleanStatus,
      };

      const firestorePayload = sanitizeForFirestore({
        ...cleanMessage,
        timestamp: Date.now(),
      });

      // 1. Write message strictly to the single canonical conversation messages subcollection
      try {
        const msgRef = doc(db, 'conversations', canonicalId, 'messages', cleanMessage.id);
        await setDoc(msgRef, firestorePayload, { merge: true });
      } catch (err) {
        console.warn('Firestore message save error for', canonicalId, err);
      }

      // Build clean canonical participant set (strictly genuine IDs, no aliases)
      const senderCan = normalizeUserId(cleanMessage.senderId);
      const participantSet = new Set<string>();
      if (senderCan) participantSet.add(senderCan);

      if (foundConvObj?.participants && Array.isArray(foundConvObj.participants)) {
        foundConvObj.participants.forEach((p) => {
          const normP = normalizeUserId(p);
          if (normP && !normP.startsWith('user_fresh')) participantSet.add(normP);
        });
      }
      if (conversationId.startsWith('conv_')) {
        conversationId.replace('conv_', '').split('_').forEach((p) => {
          const normP = normalizeUserId(p);
          if (normP && !normP.startsWith('user_fresh')) participantSet.add(normP);
        });
      }

      const updates: any = {
        id: canonicalId,
        participants: Array.from(participantSet),
        participantDetails: {
          ...(foundConvObj?.participantDetails || {}),
        },
        lastMessage:
          cleanMessage.text ||
          (cleanMessage.messageType === 'audio'
            ? '🎙️ Ujumbe wa sauti'
            : cleanMessage.messageType === 'invoice'
            ? '🧾 Ankara ya Malipo'
            : cleanMessage.messageType === 'poll'
            ? '📊 Kura ya Maoni'
            : cleanMessage.messageType === 'tip_gift'
            ? '🎁 Zawadi'
            : 'Ujumbe mpya'),
        lastMessageType: cleanMessage.messageType,
        lastMessageSenderId: cleanMessage.senderId,
        updatedAt: cleanMessage.createdAt,
        timestamp: Date.now(),
      };

      if (foundConvObj) {
        if (foundConvObj.isGroup !== undefined) updates.isGroup = foundConvObj.isGroup;
        if (foundConvObj.groupName) updates.groupName = foundConvObj.groupName;
        if (foundConvObj.groupAvatar) updates.groupAvatar = foundConvObj.groupAvatar;
      }

      // 2. Save ONLY to the single canonical conversation document
      try {
        const convRef = doc(db, 'conversations', canonicalId);
        await setDoc(convRef, sanitizeForFirestore({ ...updates, id: canonicalId }), { merge: true });
      } catch (_) {}

      // 3. Send real-time notification to other participant(s) in Firestore
      const recipientIds = updates.participants
        ? updates.participants.filter((p: string) => !matchesUser(cleanMessage.senderId, p))
        : [];

      for (const recId of recipientIds) {
        if (!recId || recId === 'guest') continue;
        try {
          const notifId = `notif_msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          await setDoc(doc(db, 'notifications', notifId), sanitizeForFirestore({
            id: notifId,
            userId: recId,
            title: cleanMessage.senderName || 'Ujumbe Mpya',
            message:
              cleanMessage.text ||
              (cleanMessage.messageType === 'audio'
                ? '🎙️ Ujumbe wa sauti'
                : cleanMessage.messageType === 'invoice'
                ? '🧾 Ankara ya Malipo'
                : 'Ujumbe mpya'),
            type: 'message',
            avatar: cleanMessage.senderAvatar || '',
            read: false,
            createdAt: new Date().toISOString(),
            data: { conversationId: canonicalId, messageId: cleanMessage.id, senderId: cleanMessage.senderId, replyText: '' },
          }));
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
      } else if (userId === 'current_user_id' || userId === ADMIN_CANONICAL_ID) {
        const altKey = `zenia_user_conversations_${userId === 'current_user_id' ? ADMIN_CANONICAL_ID : 'current_user_id'}`;
        const altSaved = localStorage.getItem(altKey);
        if (altSaved) {
          currentConvs = JSON.parse(altSaved);
          onUpdate(currentConvs);
        }
      }
    } catch (_) {}

    const normUser = normalizeUserId(userId);
    const emailNorm = userEmail ? userEmail.trim().toLowerCase() : '';
    const isAdmin =
      normUser === ADMIN_CANONICAL_ID ||
      userId === 'current_user_id' ||
      userId === ADMIN_CANONICAL_ID ||
      emailNorm === 'amytzee@gmail.com' ||
      userId.toLowerCase().includes('amytzee');

    const isUserParticipant = (c: any): boolean => {
      if (!c) return false;
      if (c.isGroup) return true; // public / member groups

      if (Array.isArray(c.participants)) {
        for (const p of c.participants) {
          if (!p) continue;
          if (p === userId || normalizeUserId(p) === normUser || matchesUser(userId, p)) return true;
          if (emailNorm && typeof p === 'string' && p.toLowerCase() === emailNorm) return true;
          if (isAdmin) {
            const pNorm = normalizeUserId(p);
            if (
              pNorm === ADMIN_CANONICAL_ID ||
              p === 'current_user_id' ||
              p === ADMIN_CANONICAL_ID ||
              p.toLowerCase().includes('amytzee') ||
              p.toLowerCase().includes('admin') ||
              p.toLowerCase() === 'amytzee@gmail.com'
            ) {
              return true;
            }
          }
        }
      }

      if (c.participantDetails && typeof c.participantDetails === 'object') {
        for (const [pId, details] of Object.entries(c.participantDetails)) {
          if (pId === userId || normalizeUserId(pId) === normUser || matchesUser(userId, pId, details as any)) return true;
          const d = details as any;
          if (emailNorm && d?.email && d.email.toLowerCase() === emailNorm) return true;
          if (isAdmin) {
            const pNorm = normalizeUserId(pId);
            if (
              pNorm === ADMIN_CANONICAL_ID ||
              pId === 'current_user_id' ||
              pId === ADMIN_CANONICAL_ID ||
              pId.toLowerCase().includes('amytzee') ||
              pId.toLowerCase().includes('admin') ||
              d?.email === 'amytzee@gmail.com' ||
              d?.username === 'amytzee' ||
              (d?.displayName && d.displayName.toLowerCase().includes('amytzee'))
            ) {
              return true;
            }
          }
        }
      }

      // Check conversation ID if conv_ID1_ID2
      if (typeof c.id === 'string' && c.id.startsWith('conv_')) {
        const parts = c.id.replace('conv_', '').split('_');
        for (const part of parts) {
          if (part === userId || normalizeUserId(part) === normUser || matchesUser(userId, part)) return true;
          if (isAdmin) {
            const partNorm = normalizeUserId(part);
            if (
              partNorm === ADMIN_CANONICAL_ID ||
              part === 'current_user_id' ||
              part === ADMIN_CANONICAL_ID ||
              part.toLowerCase().includes('amytzee')
            ) {
              return true;
            }
          }
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
              const dedupMap = new Map<string, Conversation>();

              // Filter out demo conversations like Fresh kk and index local convs by unique party
              currentConvs.forEach((c) => {
                if (!c || c.id === 'conv_fresh_kk' || c.participants?.includes('user_fresh_kk')) return;
                const canId = getCanonicalConversationId(c.id);
                const other = c.participants?.find((p) => !matchesUser(userId, p)) || c.id;
                const key = c.isGroup ? `grp_${c.groupName || canId}` : `dm_${normalizeUserId(other)}`;
                dedupMap.set(key, { ...c, id: canId });
              });

              // Merge remote authoritative info
              remoteList.forEach((r) => {
                if (!r || r.id === 'conv_fresh_kk' || r.participants?.includes('user_fresh_kk')) return;
                const canId = getCanonicalConversationId(r.id);
                const other = r.participants?.find((p) => !matchesUser(userId, p)) || r.id;
                const key = r.isGroup ? `grp_${r.groupName || canId}` : `dm_${normalizeUserId(other)}`;
                const existing = dedupMap.get(key);
                if (existing) {
                  dedupMap.set(key, {
                    ...existing,
                    id: canId,
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
                  dedupMap.set(key, { ...r, id: canId });
                }
              });

              currentConvs = Array.from(dedupMap.values());
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
    const canonicalId = getCanonicalConversationId(conversationId);
    const equivalentIds = getAllEquivalentConversationIds(conversationId);
    const targetIds = Array.from(new Set([canonicalId, conversationId, ...equivalentIds].filter(Boolean)));
    const cleanUpdates = sanitizeForFirestore(updates);

    for (const eId of targetIds) {
      const localKey = `zenia_msgs_${eId}`;
      try {
        const cached = localStorage.getItem(localKey);
        if (cached) {
          const list: ChatMessage[] = JSON.parse(cached);
          const updated = list.map((m) => (m.id === messageId ? { ...m, ...updates } : m));
          localStorage.setItem(localKey, JSON.stringify(updated));
        }
      } catch (_) {}
    }

    if (chatChannel) {
      try {
        chatChannel.postMessage({
          type: 'UPDATE_MESSAGE',
          conversationId,
          messageId,
          updates,
        });
      } catch (_) {}
    }

    for (const tId of targetIds) {
      try {
        const msgRef = doc(db, 'conversations', tId, 'messages', messageId);
        await setDoc(msgRef, cleanUpdates, { merge: true });
      } catch (e) {
        console.warn('Firestore message update error for', tId, e);
      }
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

  // WhatsApp / Coding Cafe Real-time Typing Indicator
  setTyping(
    conversationId: string,
    userId: string,
    isTypingOrName: boolean | string,
    optionalParam?: boolean | string
  ) {
    if (!conversationId || !userId) return;
    const isTyping =
      typeof isTypingOrName === 'boolean'
        ? isTypingOrName
        : typeof optionalParam === 'boolean'
        ? optionalParam
        : false;
    const userName =
      typeof isTypingOrName === 'string'
        ? isTypingOrName
        : typeof optionalParam === 'string'
        ? optionalParam
        : 'Mtu';
    const detail = { conversationId, userId, userName, isTyping, _sigTime: Date.now() };

    if (chatChannel) {
      try {
        chatChannel.postMessage({ type: 'TYPING', ...detail });
      } catch (_) {}
    }

    try {
      localStorage.setItem(`zenia_typing_${conversationId}`, JSON.stringify(detail));
      window.dispatchEvent(new CustomEvent('zenia_typing_event', { detail }));
    } catch (_) {}
  },

  // Subscribe to partner typing state
  subscribeTyping(
    conversationId: string,
    currentUserId: string,
    onTyping: (isTyping: boolean, userName?: string) => void
  ): () => void {
    const handleBroadcast = (event: MessageEvent) => {
      if (
        event.data &&
        event.data.type === 'TYPING' &&
        event.data.conversationId === conversationId &&
        event.data.userId !== currentUserId
      ) {
        onTyping(Boolean(event.data.isTyping), event.data.userName);
      }
    };

    const handleCustom = (e: any) => {
      const d = e.detail;
      if (d && d.conversationId === conversationId && d.userId !== currentUserId) {
        onTyping(Boolean(d.isTyping), d.userName);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === `zenia_typing_${conversationId}` && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.userId !== currentUserId) {
            onTyping(Boolean(parsed.isTyping), parsed.userName);
          }
        } catch (_) {}
      }
    };

    if (chatChannel) {
      chatChannel.addEventListener('message', handleBroadcast);
    }
    window.addEventListener('zenia_typing_event', handleCustom);
    window.addEventListener('storage', handleStorage);

    return () => {
      if (chatChannel) {
        chatChannel.removeEventListener('message', handleBroadcast);
      }
      window.removeEventListener('zenia_typing_event', handleCustom);
      window.removeEventListener('storage', handleStorage);
    };
  },

  // Mark all incoming messages in a conversation as seen (Blue double ticks)
  async markMessagesAsSeen(conversationId: string, currentUserId: string) {
    const canonicalId = getCanonicalConversationId(conversationId);
    const equivalentIds = getAllEquivalentConversationIds(conversationId);
    const targetIds = Array.from(new Set([canonicalId, conversationId, ...equivalentIds].filter(Boolean)));

    // 1. Update localStorage across all equivalent conversation IDs
    try {
      for (const eId of equivalentIds) {
        const k = `zenia_msgs_${eId}`;
        const cached = localStorage.getItem(k);
        if (cached) {
          const msgs: ChatMessage[] = JSON.parse(cached);
          let changed = false;
          const updated = msgs.map((m) => {
            if (!matchesUser(currentUserId, m.senderId) && m.status !== 'seen') {
              changed = true;
              return { ...m, status: 'seen' as const };
            }
            return m;
          });
          if (changed) {
            localStorage.setItem(k, JSON.stringify(updated));
          }
        }
      }
    } catch (_) {}

    // 2. Broadcast seen event locally & cross-tab
    if (chatChannel) {
      try {
        chatChannel.postMessage({ type: 'MESSAGES_SEEN', conversationId, canonicalId, userId: currentUserId });
      } catch (_) {}
    }
    window.dispatchEvent(
      new CustomEvent('zenia_messages_seen_event', { detail: { conversationId, canonicalId, userId: currentUserId } })
    );

    // 3. Update Firestore documents so remote sender gets blue double ticks in real-time
    for (const tId of targetIds) {
      try {
        const msgsColl = collection(db, 'conversations', tId, 'messages');
        const snap = await getDocs(msgsColl);
        snap.forEach(async (docSnap) => {
          const data = docSnap.data();
          if (data && !matchesUser(currentUserId, data.senderId) && data.status !== 'seen') {
            try {
              await setDoc(doc(db, 'conversations', tId, 'messages', docSnap.id), { status: 'seen' }, { merge: true });
            } catch (_) {}
          }
        });
      } catch (err) {
        console.warn('Firestore mark seen notice:', err);
      }
    }
  },
};
