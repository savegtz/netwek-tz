export interface CallRecord {
  id: string;
  callId: string;
  remoteUserId: string;
  remoteUserName: string;
  remoteUserAvatar?: string;
  callType: 'video' | 'voice';
  direction: 'incoming' | 'outgoing' | 'missed';
  status: 'connected' | 'missed' | 'rejected' | 'busy';
  durationSeconds: number;
  timestamp: string;
  note?: string;
}

const CALL_HISTORY_EVENT = 'zenia_call_history_updated';

class CallHistoryServiceImpl {
  private getStorageKey(userId?: string): string {
    return `zenia_call_history_${userId || 'current'}`;
  }

  public getCallHistory(userId?: string): CallRecord[] {
    try {
      const data = localStorage.getItem(this.getStorageKey(userId));
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load call history:', e);
    }
    return this.getDefaultHistory();
  }

  public addCallRecord(record: Omit<CallRecord, 'id'>, userId?: string): CallRecord {
    const newRecord: CallRecord = {
      ...record,
      id: `record_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };

    try {
      const current = this.getCallHistory(userId);
      const updated = [newRecord, ...current.slice(0, 49)]; // keep up to 50 calls
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(CALL_HISTORY_EVENT, { detail: updated }));
    } catch (e) {
      console.warn('Failed to save call record:', e);
    }

    return newRecord;
  }

  public clearCallHistory(userId?: string) {
    try {
      localStorage.removeItem(this.getStorageKey(userId));
      window.dispatchEvent(new CustomEvent(CALL_HISTORY_EVENT, { detail: [] }));
    } catch (e) {
      console.warn('Failed to clear call history:', e);
    }
  }

  public subscribe(callback: (records: CallRecord[]) => void): () => void {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<CallRecord[]>;
      if (customEvent.detail) {
        callback(customEvent.detail);
      }
    };
    window.addEventListener(CALL_HISTORY_EVENT, handler);
    return () => window.removeEventListener(CALL_HISTORY_EVENT, handler);
  }

  private getDefaultHistory(): CallRecord[] {
    return [
      {
        id: 'hist_1',
        callId: 'call_seed_1',
        remoteUserId: 'user_fresh_kk',
        remoteUserName: 'Fresh kk',
        remoteUserAvatar: '/assets/images/fresh_kk_avatar_1791078365294.jpg',
        callType: 'video',
        direction: 'incoming',
        status: 'connected',
        durationSeconds: 142,
        timestamp: 'Leo, 11:42 Asubuhi',
      },
      {
        id: 'hist_2',
        callId: 'call_seed_2',
        remoteUserId: 'user_alex',
        remoteUserName: 'Alex Mwangi',
        remoteUserAvatar: '/assets/images/alex_portrait_1791059432462.jpg',
        callType: 'voice',
        direction: 'missed',
        status: 'missed',
        durationSeconds: 0,
        timestamp: 'Leo, 09:15 Asubuhi',
        note: 'Simu imekosekana',
      },
      {
        id: 'hist_3',
        callId: 'call_seed_3',
        remoteUserId: 'user_sarah',
        remoteUserName: 'Sarah Juma',
        remoteUserAvatar: '/assets/images/sarah_portrait_1791059459448.jpg',
        callType: 'video',
        direction: 'outgoing',
        status: 'connected',
        durationSeconds: 310,
        timestamp: 'Jana, 16:20 Jioni',
      },
      {
        id: 'hist_4',
        callId: 'call_seed_4',
        remoteUserId: 'user_amina',
        remoteUserName: 'Amina Salum',
        remoteUserAvatar: '/assets/images/amina_avatar_1790280951312.jpg',
        callType: 'voice',
        direction: 'incoming',
        status: 'connected',
        durationSeconds: 84,
        timestamp: 'Jana, 14:05 Mchana',
      },
    ];
  }
}

export const callHistoryService = new CallHistoryServiceImpl();
