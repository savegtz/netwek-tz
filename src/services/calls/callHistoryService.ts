import { userService } from '../user/userService';

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
    let list: CallRecord[] = [];
    try {
      const data = localStorage.getItem(this.getStorageKey(userId));
      if (data) {
        list = JSON.parse(data);
      } else {
        list = this.getDefaultHistory();
      }
    } catch (e) {
      console.warn('Failed to load call history:', e);
      list = this.getDefaultHistory();
    }

    // Filter out any calls with deleted users
    return list.filter((call) => {
      if (userService.isIdentifierDeleted(call.remoteUserId)) return false;
      if (userService.isIdentifierDeleted(call.remoteUserName)) return false;
      return true;
    });
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

  public deleteCallRecord(recordId: string, userId?: string) {
    try {
      const current = this.getCallHistory(userId);
      const updated = current.filter((r) => r.id !== recordId);
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(CALL_HISTORY_EVENT, { detail: updated }));
    } catch (e) {
      console.warn('Failed to delete call record:', e);
    }
  }

  public clearCallHistory(userId?: string) {
    try {
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify([]));
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
      } else {
        callback(this.getCallHistory());
      }
    };
    window.addEventListener(CALL_HISTORY_EVENT, handler);
    return () => window.removeEventListener(CALL_HISTORY_EVENT, handler);
  }

  private getDefaultHistory(): CallRecord[] {
    const defaults: CallRecord[] = [
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
        remoteUserId: 'user_amina',
        remoteUserName: 'Amina Kaunga',
        remoteUserAvatar: '/assets/images/amina_avatar_1790280951312.jpg',
        callType: 'voice',
        direction: 'outgoing',
        status: 'connected',
        durationSeconds: 310,
        timestamp: 'Jana, 16:20 Jioni',
      },
    ];

    return defaults.filter((call) => {
      if (userService.isIdentifierDeleted(call.remoteUserId)) return false;
      if (userService.isIdentifierDeleted(call.remoteUserName)) return false;
      return true;
    });
  }
}

export const callHistoryService = new CallHistoryServiceImpl();
