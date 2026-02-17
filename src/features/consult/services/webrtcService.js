/**
 * WebRTC Service
 * Handles WebRTC peer connections, media streams, and signaling
 */

import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
} from "react-native-webrtc";
import { getSocket, sendWebRTCOffer, sendWebRTCAnswer, sendWebRTCIceCandidate } from "./chatService";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

/**
 * Create a new RTCPeerConnection
 * @returns {RTCPeerConnection}
 */
export const createPeerConnection = () => {
  const configuration = {
    iceServers: ICE_SERVERS,
  };
  return new RTCPeerConnection(configuration);
};

/**
 * Get user media (audio/video)
 * @param {boolean} video - Whether to request video
 * @param {boolean} audio - Whether to request audio
 * @returns {Promise<MediaStream>}
 */
export const getUserMedia = async (video = false, audio = true) => {
  try {
    const stream = await mediaDevices.getUserMedia({
      video: video
        ? {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }
        : false,
      audio: audio
        ? {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }
        : false,
    });
    return stream;
  } catch (error) {
    console.error("❌ [WEBRTC] Error getting user media:", error);
    throw error;
  }
};

/**
 * Setup WebRTC connection for a call
 * @param {object} params
 * @param {string} params.otherUserId - Other user's ID
 * @param {boolean} params.isInitiator - Whether this user initiated the call
 * @param {boolean} params.isVideo - Whether this is a video call
 * @param {function} params.onLocalStream - Callback when local stream is ready
 * @param {function} params.onRemoteStream - Callback when remote stream is ready
 * @param {function} params.onConnectionStateChange - Callback for connection state changes
 * @returns {Promise<{peerConnection: RTCPeerConnection, localStream: MediaStream}>}
 */
export const setupWebRTCConnection = async ({
  otherUserId,
  isInitiator,
  isVideo,
  onLocalStream,
  onRemoteStream,
  onConnectionStateChange,
}) => {
  try {
    // Get local media stream
    const localStream = await getUserMedia(isVideo, true);
    if (onLocalStream) {
      onLocalStream(localStream);
    }

    // Create peer connection
    const peerConnection = createPeerConnection();

    // Add local tracks to peer connection
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log("📹 [WEBRTC] Remote stream received");
      if (event.streams && event.streams[0]) {
        if (onRemoteStream) {
          onRemoteStream(event.streams[0]);
        }
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("🧊 [WEBRTC] Sending ICE candidate");
        sendWebRTCIceCandidate(otherUserId, event.candidate);
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      console.log("🔌 [WEBRTC] Connection state:", state);
      if (onConnectionStateChange) {
        onConnectionStateChange(state);
      }
    };

    // Handle ICE connection state changes
    peerConnection.oniceconnectionstatechange = () => {
      const state = peerConnection.iceConnectionState;
      console.log("🧊 [WEBRTC] ICE connection state:", state);
    };

    // If initiator, create and send offer
    if (isInitiator) {
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: isVideo,
      });
      await peerConnection.setLocalDescription(offer);
      console.log("📤 [WEBRTC] Sending offer");
      sendWebRTCOffer(otherUserId, offer);
    }

    return { peerConnection, localStream };
  } catch (error) {
    console.error("❌ [WEBRTC] Error setting up connection:", error);
    throw error;
  }
};

/**
 * Handle WebRTC offer (for recipient)
 * @param {object} params
 * @param {RTCPeerConnection} params.peerConnection - Peer connection
 * @param {RTCSessionDescriptionInit} params.offer - SDP offer
 * @param {string} params.otherUserId - Caller's user ID
 * @param {boolean} params.isVideo - Whether this is a video call
 */
export const handleOffer = async ({ peerConnection, offer, otherUserId, isVideo }) => {
  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: isVideo,
    });
    await peerConnection.setLocalDescription(answer);
    console.log("📤 [WEBRTC] Sending answer");
    sendWebRTCAnswer(otherUserId, answer);
  } catch (error) {
    console.error("❌ [WEBRTC] Error handling offer:", error);
    throw error;
  }
};

/**
 * Handle WebRTC answer (for caller)
 * @param {object} params
 * @param {RTCPeerConnection} params.peerConnection - Peer connection
 * @param {RTCSessionDescriptionInit} params.answer - SDP answer
 */
export const handleAnswer = async ({ peerConnection, answer }) => {
  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    console.log("✅ [WEBRTC] Answer received and set");
  } catch (error) {
    console.error("❌ [WEBRTC] Error handling answer:", error);
    throw error;
  }
};

/**
 * Handle ICE candidate
 * @param {object} params
 * @param {RTCPeerConnection} params.peerConnection - Peer connection
 * @param {RTCIceCandidateInit} params.candidate - ICE candidate
 */
export const handleIceCandidate = async ({ peerConnection, candidate }) => {
  try {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    console.log("🧊 [WEBRTC] ICE candidate added");
  } catch (error) {
    console.error("❌ [WEBRTC] Error adding ICE candidate:", error);
  }
};

/**
 * Cleanup WebRTC resources
 * @param {RTCPeerConnection} peerConnection - Peer connection to close
 * @param {MediaStream} localStream - Local stream to stop
 */
export const cleanupWebRTC = (peerConnection, localStream) => {
  try {
    if (peerConnection) {
      peerConnection.close();
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
    console.log("🧹 [WEBRTC] Cleaned up resources");
  } catch (error) {
    console.error("❌ [WEBRTC] Error cleaning up:", error);
  }
};

/**
 * Toggle audio track
 * @param {MediaStream} stream - Media stream
 * @param {boolean} enabled - Whether to enable audio
 */
export const toggleAudioTrack = (stream, enabled) => {
  if (stream) {
    stream.getAudioTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }
};

/**
 * Toggle video track
 * @param {MediaStream} stream - Media stream
 * @param {boolean} enabled - Whether to enable video
 */
export const toggleVideoTrack = (stream, enabled) => {
  if (stream) {
    stream.getVideoTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }
};
