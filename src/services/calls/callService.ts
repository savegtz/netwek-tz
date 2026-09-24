import { CallSession } from '../../types';

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'candidate' | 'hangup';
  senderId: string;
  targetId: string;
  payload: any;
}

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  signalingEndpoint?: string;
}

/**
 * CallService manages real WebRTC media streams, camera, microphone,
 * ICE candidates, and signaling contracts.
 */
class CallServiceImpl {
  private localStream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private rtcConfig: WebRTCConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  public async startMedia(video = true, audio = true): Promise<MediaStream | null> {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video, audio });
        this.localStream = stream;
        return stream;
      }
      return null;
    } catch (error) {
      console.warn('Microphone/Camera permission not granted or unavailable:', error);
      return null;
    }
  }

  public stopMedia() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }

  public toggleMute(muted: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
  }

  public toggleVideo(videoOff: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = !videoOff;
      });
    }
  }

  public getWebRTCConfig(): WebRTCConfig {
    return this.rtcConfig;
  }
}

export const CallService = new CallServiceImpl();
