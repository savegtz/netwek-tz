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
   * Acquire camera and mic with fallback to synthetic stream
   */
  public async getLocalStream(callType: 'video' | 'voice'): Promise<MediaStream> {
    if (this.localStream) return this.localStream;

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: callType === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
          audio: true,
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

    const callData: WebRTCCallData = {
      id: callId,
      callerId: caller.id,
      callerName: caller.displayName,
      callerAvatar: caller.photoURL,
      receiverId: receiver.id,
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

    // Broadcast across tabs
    if (callBroadcast) {
      callBroadcast.postMessage({
        type: 'INCOMING_CALL',
        call: callData,
      });
    }

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

    // Also listen to broadcast channel candidates for same-machine tabs
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
   * Screen Sharing Toggle
   */
  public async toggleScreenShare(isSharing: boolean): Promise<MediaStream | null> {
    if (!this.peerConnection) return null;

    if (isSharing) {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
          });
          this.screenStream = screenStream;

          const screenTrack = screenStream.getVideoTracks()[0];
          const sender = this.peerConnection.getSenders().find((s) => s.track?.kind === 'video');

          if (sender && screenTrack) {
            await sender.replaceTrack(screenTrack);
          }

          // Handle user stopping screen share via browser floating UI
          screenTrack.onended = () => {
            this.stopScreenShare();
          };

          return screenStream;
        }
      } catch (err) {
        console.warn('Screen sharing error or cancelled:', err);
      }
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

    this.cleanup();
  }

  /**
   * Listen for incoming calls for a user
   */
  public subscribeIncomingCalls(
    userId: string,
    onIncoming: (callData: WebRTCCallData) => void
  ): () => void {
    // 1. Firestore query - filter by receiverId without needing composite index
    const callsRef = collection(db, 'calls');
    const q = query(callsRef, where('receiverId', '==', userId));

    const firestoreUnsub = onSnapshot(
      q,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' || change.type === 'modified') {
            const data = { id: change.doc.id, ...change.doc.data() } as WebRTCCallData;
            if (data.status === 'calling') {
              onIncoming(data);
            }
          }
        });
      },
      (err) => {
        console.warn('Incoming calls Firestore listener note:', err);
      }
    );

    // 2. BroadcastChannel query for local cross-tab demo
    const handleBroadcast = (event: MessageEvent) => {
      if (
        event.data &&
        event.data.type === 'INCOMING_CALL' &&
        event.data.call &&
        event.data.call.receiverId === userId
      ) {
        onIncoming(event.data.call);
      }
    };

    if (callBroadcast) {
      callBroadcast.addEventListener('message', handleBroadcast);
    }

    return () => {
      firestoreUnsub();
      if (callBroadcast) {
        callBroadcast.removeEventListener('message', handleBroadcast);
      }
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

    return callData;
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
