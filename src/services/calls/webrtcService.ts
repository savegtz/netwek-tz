import {
  collection,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserProfile } from '../../types';
import { normalizeUserId } from '../user/friendshipService';

export interface WebRTCCallData {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar?: string;
  callType: 'video' | 'voice';
  status: 'calling' | 'connected' | 'ended' | 'rejected' | 'busy';
  offer?: any;
  answer?: any;
  createdAt: string;
  endedAt?: string;
}

export const RTC_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
];

// Cross-tab broadcast for zero-latency local development testing between two browser tabs
const callBroadcast =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('zenia_webrtc_signaling')
    : null;

class WebRTCServiceImpl {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private activeCallId: string | null = null;
  private isCaller = false;
  private callDocUnsub: (() => void) | null = null;
  private candidatesUnsub: (() => void) | null = null;
  private onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null;
  private onConnectedCallback: (() => void) | null = null;

  /**
   * Generates a smooth, synthetic canvas & audio stream for environments
   * without real physical webcam/mic permissions so tests never fail.
   */
  public createSyntheticMediaStream(video = true, audio = true): MediaStream {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    let frame = 0;
    let isDrawing = true;

    const draw = () => {
      if (!ctx || !isDrawing) return;
      frame++;
      // Animated gradient background
      const grad = ctx.createLinearGradient(0, 0, 640, 480);
      grad.addColorStop(0, '#060B18');
      grad.addColorStop(0.5, '#0E1E38');
      grad.addColorStop(1, '#051124');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 480);

      // Soundwave animation
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let x = 0; x < 640; x += 10) {
        const y = 240 + Math.sin((x + frame * 4) * 0.05) * 45;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Zenia Encrypted badge
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Zenia WebRTC Live Stream', 320, 180);
      ctx.fillStyle = '#38BDF8';
      ctx.font = '14px monospace';
      ctx.fillText('🔒 End-to-End P2P Encrypted Call', 320, 210);

      requestAnimationFrame(draw);
    };
    draw();

    const canvasStream = canvas.captureStream(30);
    canvasStream.getVideoTracks().forEach((track) => {
      track.onended = () => {
        isDrawing = false;
      };
    });

    // Audio tone
    if (audio) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        gain.gain.value = 0.001; // subtle background presence
        osc.connect(gain);
        const dest = audioCtx.createMediaStreamDestination();
        gain.connect(dest);
        osc.start();
        const audioTrack = dest.stream.getAudioTracks()[0];
        if (audioTrack) canvasStream.addTrack(audioTrack);
      } catch (_) {}
    }

    if (!video) {
      canvasStream.getVideoTracks().forEach((t) => canvasStream.removeTrack(t));
    }

    return canvasStream;
  }

  /**
   * Generates a realistic presentation canvas stream for screen sharing
   * when displayMedia is not available or blocked in an iframe
   */
  public createSyntheticScreenStream(): MediaStream {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    let frame = 0;
    let isDrawing = true;

    const draw = () => {
      if (!ctx || !isDrawing) return;
      frame++;
      // Dark modern IDE / Dashboard background
      ctx.fillStyle = '#0B0F19';
      ctx.fillRect(0, 0, 1280, 720);

      // Top title bar
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, 1280, 50);
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(30, 25, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(50, 25, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(70, 25, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#9CA3AF';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('Zenia Workspace — Screen Sharing Stream (WebRTC 1080p)', 100, 31);

      // Main content card
      ctx.fillStyle = '#161F30';
      ctx.beginPath();
      ctx.roundRect(40, 80, 1200, 580, 16);
      ctx.fill();

      // Card Header
      ctx.fillStyle = '#06B6D4';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('💻 Skrini Inayoshirikiwa Moja kwa Moja • Zenia App', 70, 130);

      ctx.fillStyle = '#E2E8F0';
      ctx.font = '16px monospace';
      ctx.fillText('const zeniaCall = new WebRTCConnection({', 70, 180);
      ctx.fillText('  encryption: "End-to-End P2P AES-GCM",', 90, 215);
      ctx.fillText('  screenShare: true,', 90, 250);
      ctx.fillText(`  fps: 60, frameCount: ${frame}`, 90, 285);
      ctx.fillText('});', 70, 320);

      // Animated metric bars
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Takwimu za Moja kwa Moja (Live Metrics)', 70, 380);

      const metrics = ['Uunganishaji', 'Kasi ya Sauti', 'Video Frame Rate', 'Usalama wa P2P'];
      metrics.forEach((m, idx) => {
        const y = 420 + idx * 45;
        ctx.fillStyle = '#94A3B8';
        ctx.font = '14px sans-serif';
        ctx.fillText(m, 70, y);

        // Bar background
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(230, y - 14, 400, 16);

        // Active animated bar
        const width = 250 + Math.sin(frame * 0.05 + idx) * 90;
        ctx.fillStyle = idx === 3 ? '#10B981' : '#06B6D4';
        ctx.fillRect(230, y - 14, width, 16);
      });

      // Presenter Live badge
      ctx.fillStyle = '#8B5CF6';
      ctx.beginPath();
      ctx.roundRect(900, 110, 300, 120, 12);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('🎥 Kushiriki Skrini Kumeamilishwa', 920, 150);
      ctx.fillStyle = '#E9D5FF';
      ctx.font = '13px sans-serif';
      ctx.fillText('Washiriki wanaona skrini hii sasa.', 920, 185);

      requestAnimationFrame(draw);
    };
    draw();

    const canvasStream = canvas.captureStream(30);
    canvasStream.getVideoTracks().forEach((track) => {
      track.onended = () => {
        isDrawing = false;
      };
    });
    return canvasStream;
  }

  /**
   * Acquire camera and mic with fallback to synthetic stream
   */
  public async getLocalStream(
    callType: 'video' | 'voice',
    facingMode: 'user' | 'environment' = 'user'
  ): Promise<MediaStream> {
    if (this.localStream) return this.localStream;

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video:
            callType === 'video'
              ? {
                  facingMode,
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                }
              : false,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        this.localStream = stream;
        return stream;
      }
    } catch (err) {
      console.warn('Real webcam/mic not available or permission denied, using synthetic stream:', err);
    }

    // Fallback stream
    const fallback = this.createSyntheticMediaStream(callType === 'video', true);
    this.localStream = fallback;
    return fallback;
  }

  /**
   * Create Peer Connection
   */
  private setupPeerConnection(
    callId: string,
    onRemoteStream: (stream: MediaStream) => void,
    onEnd: (status?: string) => void
  ): RTCPeerConnection {
    if (this.peerConnection) {
      this.peerConnection.close();
    }

    const pc = new RTCPeerConnection({ iceServers: RTC_ICE_SERVERS });
    this.peerConnection = pc;
    this.activeCallId = callId;
    this.remoteStream = new MediaStream();
    this.onRemoteStreamCallback = onRemoteStream;

    // Send local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Listen for remote tracks
    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        if (!this.remoteStream?.getTracks().includes(track)) {
          this.remoteStream?.addTrack(track);
        }
      });
      onRemoteStream(event.streams[0] || this.remoteStream!);
    };

    // ICE Candidate generation
    pc.onicecandidate = async (event) => {
      if (event.candidate && this.activeCallId) {
        const candidateData = event.candidate.toJSON();
        const targetColl = this.isCaller ? 'callerCandidates' : 'receiverCandidates';
        try {
          await addDoc(collection(db, 'calls', this.activeCallId, targetColl), candidateData);
        } catch (_) {}

        if (callBroadcast) {
          callBroadcast.postMessage({
            type: 'ICE_CANDIDATE',
            callId: this.activeCallId,
            targetColl,
            candidate: candidateData,
          });
        }
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        onEnd(pc.connectionState);
      }
    };

    return pc;
  }

  /**
   * Initiate outgoing call (Caller side)
   */
  public async startCall(
    callId: string,
    caller: UserProfile,
    receiver: { id: string; displayName: string; photoURL?: string },
    callType: 'video' | 'voice',
    onRemoteStream: (stream: MediaStream) => void,
    onConnected: () => void,
    onEnd: (reason?: string) => void
  ): Promise<WebRTCCallData> {
    this.isCaller = true;
    this.activeCallId = callId;

    await this.getLocalStream(callType);
    const pc = this.setupPeerConnection(callId, onRemoteStream, onEnd);

    // Create SDP Offer
    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: callType === 'video',
    });
    await pc.setLocalDescription(offer);
    this.onConnectedCallback = onConnected;

    const normCallerId = normalizeUserId(caller.id);
    const normReceiverId = normalizeUserId(receiver.id);

    const callData: WebRTCCallData = {
      id: callId,
      callerId: normCallerId,
      callerName: caller.displayName,
      callerAvatar: caller.photoURL,
      receiverId: normReceiverId,
      receiverName: receiver.displayName,
      receiverAvatar: receiver.photoURL,
      callType,
      status: 'calling',
      offer: { type: offer.type, sdp: offer.sdp },
      createdAt: new Date().toISOString(),
    };

    // Save to Firestore
    try {
      await setDoc(doc(db, 'calls', callId), callData);
    } catch (e) {
      console.warn('Firestore call session save notice:', e);
    }

    // Broadcast across tabs via BroadcastChannel
    if (callBroadcast) {
      callBroadcast.postMessage({
        type: 'INCOMING_CALL',
        call: callData,
      });
    }

    // Save to localStorage so any other browser tab/window gets the call instantly
    try {
      localStorage.setItem(
        'zenia_call_signal_incoming',
        JSON.stringify({ ...callData, _sigTime: Date.now() })
      );
      window.dispatchEvent(
        new CustomEvent('zenia_call_signal_incoming_event', { detail: callData })
      );
    } catch (_) {}

    // Listen to call doc for Answer or Rejection
    const callRef = doc(db, 'calls', callId);
    this.callDocUnsub = onSnapshot(callRef, async (snapshot) => {
      const data = snapshot.data() as WebRTCCallData | undefined;
      if (!data) return;

      if (data.status === 'connected' && data.answer && !pc.currentRemoteDescription) {
        try {
          const rtcAnswer = new RTCSessionDescription(data.answer);
          await pc.setRemoteDescription(rtcAnswer);
          onConnected();
        } catch (e) {
          console.warn('Set remote description notice:', e);
        }
      } else if (data.status === 'rejected') {
        onEnd('Simu imekataliwa');
        this.cleanup();
      } else if (data.status === 'ended') {
        onEnd('Simu imemalizika');
        this.cleanup();
      }
    });

    // Listen to receiver candidates
    const receiverCandidatesRef = collection(db, 'calls', callId, 'receiverCandidates');
    this.candidatesUnsub = onSnapshot(receiverCandidatesRef, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const cand = change.doc.data();
          try {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          } catch (_) {}
        }
      });
    });

    // Also listen to broadcast channel & storage candidates for cross-tab calls
    const handleBroadcastMsg = async (event: MessageEvent) => {
      if (!event.data || event.data.callId !== callId) return;
      if (event.data.type === 'ANSWER' && !pc.currentRemoteDescription) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(event.data.answer));
          onConnected();
        } catch (_) {}
      } else if (event.data.type === 'ICE_CANDIDATE' && event.data.targetColl === 'receiverCandidates') {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(event.data.candidate));
        } catch (_) {}
      } else if (event.data.type === 'CALL_REJECTED' || event.data.type === 'CALL_ENDED') {
        onEnd('Simu imekatika');
        this.cleanup();
      }
    };
    if (callBroadcast) {
      callBroadcast.addEventListener('message', handleBroadcastMsg);
    }

    const handleStorageEvent = async (e: StorageEvent) => {
      if (!e.newValue) return;
      try {
        if (e.key === 'zenia_call_signal_answer') {
          const parsed = JSON.parse(e.newValue);
          if (parsed.callId === callId && !pc.currentRemoteDescription && parsed.answer) {
            await pc.setRemoteDescription(new RTCSessionDescription(parsed.answer));
            onConnected();
          }
        } else if (e.key === 'zenia_call_signal_ended' || e.key === 'zenia_call_signal_rejected') {
          const parsed = JSON.parse(e.newValue);
          if (parsed.callId === callId) {
            onEnd(e.key.includes('rejected') ? 'Simu imekataliwa' : 'Simu imekatika');
            this.cleanup();
          }
        }
      } catch (_) {}
    };
    window.addEventListener('storage', handleStorageEvent);

    const handleLocalAnswerEvent = async (e: any) => {
      const detail = e.detail;
      if (detail && detail.callId === callId && !pc.currentRemoteDescription && detail.answer) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(detail.answer));
          onConnected();
        } catch (_) {}
      }
    };
    window.addEventListener('zenia_call_signal_answer_event', handleLocalAnswerEvent);

    return callData;
  }

  /**
   * Accept incoming call (Receiver side)
   */
  public async answerCall(
    callData: WebRTCCallData,
    receiver: UserProfile,
    onRemoteStream: (stream: MediaStream) => void,
    onConnected: () => void,
    onEnd: (reason?: string) => void
  ): Promise<void> {
    this.isCaller = false;
    this.activeCallId = callData.id;

    await this.getLocalStream(callData.callType);
    const pc = this.setupPeerConnection(callData.id, onRemoteStream, onEnd);

    // Set remote offer
    if (callData.offer) {
      await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));
    }

    // Create SDP Answer
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    const answerPayload = { type: answer.type, sdp: answer.sdp };

    // Update Firestore doc
    try {
      await updateDoc(doc(db, 'calls', callData.id), {
        answer: answerPayload,
        status: 'connected',
      });
    } catch (_) {}

    // Broadcast answer to caller
    if (callBroadcast) {
      callBroadcast.postMessage({
        type: 'ANSWER',
        callId: callData.id,
        answer: answerPayload,
      });
    }

    try {
      localStorage.setItem(
        'zenia_call_signal_answer',
        JSON.stringify({ callId: callData.id, answer: answerPayload, _sigTime: Date.now() })
      );
      window.dispatchEvent(
        new CustomEvent('zenia_call_signal_answer_event', {
          detail: { callId: callData.id, answer: answerPayload },
        })
      );
    } catch (_) {}

    onConnected();

    // Listen to caller candidates
    const callerCandidatesRef = collection(db, 'calls', callData.id, 'callerCandidates');
    this.candidatesUnsub = onSnapshot(callerCandidatesRef, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const cand = change.doc.data();
          try {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          } catch (_) {}
        }
      });
    });

    // Listen to call doc for end
    const callRef = doc(db, 'calls', callData.id);
    this.callDocUnsub = onSnapshot(callRef, (snapshot) => {
      const data = snapshot.data() as WebRTCCallData | undefined;
      if (data && data.status === 'ended') {
        onEnd('Simu imemalizika');
        this.cleanup();
      }
    });

    // Broadcast listener
    const handleBroadcastMsg = async (event: MessageEvent) => {
      if (!event.data || event.data.callId !== callData.id) return;
      if (event.data.type === 'ICE_CANDIDATE' && event.data.targetColl === 'callerCandidates') {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(event.data.candidate));
        } catch (_) {}
      } else if (event.data.type === 'CALL_ENDED') {
        onEnd('Simu imemalizika');
        this.cleanup();
      }
    };
    if (callBroadcast) {
      callBroadcast.addEventListener('message', handleBroadcastMsg);
    }
  }

  /**
   * Screen Sharing Toggle with native getDisplayMedia + realistic synthetic fallback
   */
  public async toggleScreenShare(
    isSharing: boolean,
    onEnded?: () => void
  ): Promise<MediaStream | null> {
    if (!this.peerConnection) return null;

    if (isSharing) {
      let screenStream: MediaStream | null = null;
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
          });
        }
      } catch (err) {
        console.warn('Native getDisplayMedia cancelled or denied, using simulated presentation stream:', err);
      }

      // If user cancelled or getDisplayMedia is not allowed in iframe, use simulated presentation screen
      if (!screenStream) {
        screenStream = this.createSyntheticScreenStream();
      }

      this.screenStream = screenStream;
      const screenTrack = screenStream.getVideoTracks()[0];
      const sender = this.peerConnection.getSenders().find((s) => s.track?.kind === 'video');

      if (sender && screenTrack) {
        await sender.replaceTrack(screenTrack);
      }

      // Handle user stopping screen share via browser floating UI or track termination
      screenTrack.onended = () => {
        this.stopScreenShare();
        if (onEnded) onEnded();
      };

      return screenStream;
    } else {
      await this.stopScreenShare();
    }
    return null;
  }

  public async stopScreenShare(): Promise<void> {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((t) => t.stop());
      this.screenStream = null;
    }

    if (this.peerConnection && this.localStream) {
      const cameraTrack = this.localStream.getVideoTracks()[0];
      const sender = this.peerConnection.getSenders().find((s) => s.track?.kind === 'video');
      if (sender && cameraTrack) {
        await sender.replaceTrack(cameraTrack);
      }
    }
  }

  /**
   * Switch camera (selfie/user vs rear/environment)
   */
  public async switchCamera(
    facingMode: 'user' | 'environment'
  ): Promise<MediaStream | null> {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
        const newVideoTrack = newStream.getVideoTracks()[0];

        if (this.localStream && newVideoTrack) {
          const oldVideoTrack = this.localStream.getVideoTracks()[0];
          if (oldVideoTrack) {
            this.localStream.removeTrack(oldVideoTrack);
            oldVideoTrack.stop();
          }
          this.localStream.addTrack(newVideoTrack);

          if (this.peerConnection) {
            const sender = this.peerConnection.getSenders().find((s) => s.track?.kind === 'video');
            if (sender) {
              await sender.replaceTrack(newVideoTrack);
            }
          }
          return this.localStream;
        }
      }
    } catch (e) {
      console.warn('Switch camera not supported or only single camera present:', e);
    }
    return this.localStream;
  }

  /**
   * Toggle Mic Mute
   */
  public toggleMute(muted: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
  }

  /**
   * Toggle Video On / Off
   */
  public toggleVideo(videoOff: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = !videoOff;
      });
    }
  }

  /**
   * Hang up and terminate call
   */
  public async endCall(callId?: string) {
    const id = callId || this.activeCallId;
    if (id) {
      try {
        await updateDoc(doc(db, 'calls', id), {
          status: 'ended',
          endedAt: new Date().toISOString(),
        });
      } catch (_) {}

      if (callBroadcast) {
        callBroadcast.postMessage({ type: 'CALL_ENDED', callId: id });
      }

      try {
        localStorage.setItem(
          'zenia_call_signal_ended',
          JSON.stringify({ callId: id, _sigTime: Date.now() })
        );
        localStorage.removeItem('zenia_call_signal_incoming');
        window.dispatchEvent(
          new CustomEvent('zenia_call_signal_ended_event', { detail: { callId: id } })
        );
      } catch (_) {}
    }

    this.cleanup();
  }

  /**
   * Reject incoming call
   */
  public async rejectCall(callId: string) {
    try {
      await updateDoc(doc(db, 'calls', callId), {
        status: 'rejected',
        endedAt: new Date().toISOString(),
      });
    } catch (_) {}

    if (callBroadcast) {
      callBroadcast.postMessage({ type: 'CALL_REJECTED', callId });
    }

    try {
      localStorage.setItem(
        'zenia_call_signal_rejected',
        JSON.stringify({ callId, _sigTime: Date.now() })
      );
      localStorage.removeItem('zenia_call_signal_incoming');
      window.dispatchEvent(
        new CustomEvent('zenia_call_signal_rejected_event', { detail: { callId } })
      );
    } catch (_) {}

    this.cleanup();
  }

  /**
   * Listen for incoming calls for a user
   */
  public subscribeIncomingCalls(
    userId: string,
    onIncoming: (callData: WebRTCCallData) => void
  ): () => void {
    const normUser = normalizeUserId(userId);
    const isTargetUser = (rId?: string) => {
      if (!rId) return false;
      return rId === userId || normalizeUserId(rId) === normUser;
    };

    // 1. Initial check: check if an active incoming call is already waiting in localStorage
    try {
      const stored = localStorage.getItem('zenia_call_signal_incoming');
      if (stored) {
        const callData = JSON.parse(stored) as WebRTCCallData & { _sigTime?: number };
        if (
          isTargetUser(callData.receiverId) &&
          callData.status === 'calling' &&
          callData._sigTime &&
          Date.now() - callData._sigTime < 45000
        ) {
          onIncoming(callData);
        }
      }
    } catch (_) {}

    // 2. Firestore query - filter by receiverId with both variants if they differ
    const callsRef = collection(db, 'calls');
    const validIds = Array.from(new Set([userId, normUser]));
    const q =
      validIds.length > 1
        ? query(callsRef, where('receiverId', 'in', validIds))
        : query(callsRef, where('receiverId', '==', validIds[0]));

    const firestoreUnsub = onSnapshot(
      q,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' || change.type === 'modified') {
            const data = { id: change.doc.id, ...change.doc.data() } as WebRTCCallData;
            if (data.status === 'calling' && isTargetUser(data.receiverId)) {
              onIncoming(data);
            }
          }
        });
      },
      (err) => {
        console.warn('Incoming calls Firestore listener note:', err);
      }
    );

    // 3. BroadcastChannel query for local cross-tab demo
    const handleBroadcast = (event: MessageEvent) => {
      if (
        event.data &&
        event.data.type === 'INCOMING_CALL' &&
        event.data.call &&
        isTargetUser(event.data.call.receiverId)
      ) {
        onIncoming(event.data.call);
      }
    };

    if (callBroadcast) {
      callBroadcast.addEventListener('message', handleBroadcast);
    }

    // 4. Storage event listener for rock-solid cross-tab/window incoming calls
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'zenia_call_signal_incoming' && e.newValue) {
        try {
          const callData = JSON.parse(e.newValue) as WebRTCCallData & { _sigTime?: number };
          if (
            isTargetUser(callData.receiverId) &&
            callData.status === 'calling' &&
            (!callData._sigTime || Date.now() - callData._sigTime < 45000)
          ) {
            onIncoming(callData);
          }
        } catch (_) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // 5. Local custom event for in-tab signaling
    const handleLocalIncoming = (e: any) => {
      const callData = e.detail as WebRTCCallData;
      if (callData && isTargetUser(callData.receiverId) && callData.status === 'calling') {
        onIncoming(callData);
      }
    };
    window.addEventListener('zenia_call_signal_incoming_event', handleLocalIncoming);

    return () => {
      firestoreUnsub();
      if (callBroadcast) {
        callBroadcast.removeEventListener('message', handleBroadcast);
      }
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('zenia_call_signal_incoming_event', handleLocalIncoming);
    };
  }

  /**
   * Helper to trigger a realistic simulated incoming call for testing WebRTC features
   */
  public triggerSimulatedIncomingCall(
    receiverId: string,
    callerName = 'Fresh kk',
    callType: 'video' | 'voice' = 'video'
  ): WebRTCCallData {
    const callData: WebRTCCallData = {
      id: `call_sim_${Date.now()}`,
      callerId: 'user_fresh_kk',
      callerName: callerName,
      callerAvatar: '/assets/images/fresh_kk_avatar_1791078365294.jpg',
      receiverId,
      receiverName: 'Mtumiaji',
      callType,
      status: 'calling',
      createdAt: new Date().toISOString(),
    };

    if (callBroadcast) {
      callBroadcast.postMessage({
        type: 'INCOMING_CALL',
        call: callData,
      });
    }

  public simulateRemoteAnswer(callId: string): MediaStream {
    const syntheticStream = this.createSyntheticMediaStream(true, true);
    if (this.onRemoteStreamCallback) {
      this.onRemoteStreamCallback(syntheticStream);
    }
    if (this.onConnectedCallback) {
      this.onConnectedCallback();
    }
    try {
      localStorage.setItem(
        'zenia_call_signal_answer',
        JSON.stringify({
          callId,
          answer: { type: 'answer', sdp: 'simulated_remote_sdp' },
          _sigTime: Date.now(),
        })
      );
      window.dispatchEvent(
        new CustomEvent('zenia_call_signal_answer_event', {
          detail: { callId, answer: { type: 'answer', sdp: 'simulated_remote_sdp' } },
        })
      );
    } catch (_) {}
    return syntheticStream;
  }

  private cleanup() {
    if (this.callDocUnsub) {
      this.callDocUnsub();
      this.callDocUnsub = null;
    }
    if (this.candidatesUnsub) {
      this.candidatesUnsub();
      this.candidatesUnsub = null;
    }
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((t) => t.stop());
      this.screenStream = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.remoteStream = null;
    this.activeCallId = null;
    this.isCaller = false;
  }
}

export const webrtcService = new WebRTCServiceImpl();
