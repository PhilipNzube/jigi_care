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
import {
  getSocket,
  sendWebRTCOffer,
  sendWebRTCAnswer,
  sendWebRTCIceCandidate,
} from "./chatService";
import { Audio } from "expo-av";
import { Platform } from "react-native";

let InCallManager = null;
try {
  InCallManager = require("react-native-incall-manager").default;
} catch (e) {
  console.warn("⚠️ [WEBRTC] react-native-incall-manager not available:", e?.message);
}

// Maps to track state for each PeerConnection
// Using WeakMap ensures data is cleaned up when PeerConnection is garbage collected
const pendingCandidatesMap = new WeakMap();
const hasRemoteDescriptionMap = new WeakMap();

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  {
    urls: "stun:stun.relay.metered.ca:80",
  },
  {
    urls: "turn:global.relay.metered.ca:80",
    username: "f028920364fa5752581b1db3",
    credential: "ZNTb85d97N7Ygqct",
  },
  {
    urls: "turn:global.relay.metered.ca:80?transport=tcp",
    username: "f028920364fa5752581b1db3",
    credential: "ZNTb85d97N7Ygqct",
  },
  {
    urls: "turn:global.relay.metered.ca:443",
    username: "f028920364fa5752581b1db3",
    credential: "ZNTb85d97N7Ygqct",
  },
  {
    urls: "turns:global.relay.metered.ca:443?transport=tcp",
    username: "f028920364fa5752581b1db3",
    credential: "ZNTb85d97N7Ygqct",
  },
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
 * Request permissions for media access
 * @param {boolean} video - Whether video permission is needed
 * @param {boolean} audio - Whether audio permission is needed
 * @returns {Promise<{audio: boolean, video: boolean}>}
 */
const requestMediaPermissions = async (video = false, audio = true) => {
  const permissions = { audio: false, video: false };

  try {
    // Request audio permission
    if (audio) {
      try {
        // Check current permission status first
        const currentAudioPermission = await Audio.getPermissionsAsync();
        if (currentAudioPermission.status === "granted") {
          permissions.audio = true;
        } else {
          // Request permission if not granted
          const audioPermission = await Audio.requestPermissionsAsync();
          permissions.audio = audioPermission.status === "granted";
          if (!permissions.audio) {
            console.warn("⚠️ [WEBRTC] Audio permission denied");
          }
        }
      } catch (error) {
        console.warn("⚠️ [WEBRTC] Error requesting audio permission:", error);
        // Try to proceed anyway - some platforms might handle permissions differently
        permissions.audio = true;
      }
    }

    // Request camera permission
    // Note: react-native-webrtc handles camera permissions natively
    // We'll let it request permissions when getUserMedia is called
    if (video) {
      // Assume permission will be requested by react-native-webrtc
      // If it fails, the getUserMedia call will throw an error
      permissions.video = true;
    }

    return permissions;
  } catch (error) {
    console.error("❌ [WEBRTC] Error requesting permissions:", error);
    // If permission check fails, assume granted (for platforms that handle it differently)
    return { audio: audio, video: video };
  }
};

/**
 * Get user media (audio/video)
 * @param {boolean} video - Whether to request video
 * @param {boolean} audio - Whether to request audio
 * @returns {Promise<MediaStream>}
 */
export const getUserMedia = async (video = false, audio = true) => {
  try {
    // Request permissions first
    const permissions = await requestMediaPermissions(video, audio);

    if (audio && !permissions.audio) {
      throw new Error(
        "Audio permission denied. Please grant microphone access.",
      );
    }

    if (video && !permissions.video) {
      throw new Error("Camera permission denied. Please grant camera access.");
    }

    // Set audio mode for better call quality
    if (audio) {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
        });
      } catch (error) {
        console.warn("⚠️ [WEBRTC] Could not set audio mode:", error);
      }
    }

    const stream = await mediaDevices.getUserMedia({
      video:
        video && permissions.video
          ? {
              facingMode: "user",
              width: { ideal: 640 },
              height: { ideal: 480 },
              frameRate: 30,
            }
          : false,
      audio:
        audio && permissions.audio
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
        const remoteStream = event.streams[0];
        
        if (onRemoteStream) {
          onRemoteStream(remoteStream);
        }

        // Listen for track additions to existing streams
        // (sometimes audio arrives before video)
        remoteStream.onaddtrack = () => {
          console.log("📹 [WEBRTC] Track added to remote stream");
          if (onRemoteStream) onRemoteStream(remoteStream);
        };
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
      // ICE connection state is a better indicator of actual connection
      // When ICE is "connected", the connection is established
      if (state === "connected" || state === "completed") {
        console.log("✅ [WEBRTC] ICE connection established");
        if (onConnectionStateChange) {
          onConnectionStateChange("connected");
        }
      } else if (state === "failed" || state === "disconnected") {
        console.log("❌ [WEBRTC] ICE connection failed/disconnected");
        if (onConnectionStateChange) {
          onConnectionStateChange("failed");
        }
      }
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
export const handleOffer = async ({
  peerConnection,
  offer,
  otherUserId,
  isVideo,
}) => {
  try {
    console.log("📥 [WEBRTC] Setting remote description (offer)");
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    
    // Mark as having remote description
    hasRemoteDescriptionMap.set(peerConnection, true);
    
    // Flush queued candidates
    const queued = pendingCandidatesMap.get(peerConnection) || [];
    if (queued.length > 0) {
      console.log(`📦 [WEBRTC] Flushing ${queued.length} pending ICE candidates`);
      for (const candidate of queued) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("❌ [WEBRTC] Error adding queued ICE candidate:", e);
        }
      }
      pendingCandidatesMap.delete(peerConnection);
    }

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
    console.log("📥 [WEBRTC] Setting remote description (answer)");
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(answer),
    );
    
    // Mark as having remote description
    hasRemoteDescriptionMap.set(peerConnection, true);
    
    // Flush queued candidates
    const queued = pendingCandidatesMap.get(peerConnection) || [];
    if (queued.length > 0) {
      console.log(`📦 [WEBRTC] Flushing ${queued.length} pending ICE candidates`);
      for (const candidate of queued) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("❌ [WEBRTC] Error adding queued ICE candidate:", e);
        }
      }
      pendingCandidatesMap.delete(peerConnection);
    }

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
    // If we don't have a remote description yet, queue the candidate
    if (!hasRemoteDescriptionMap.get(peerConnection)) {
      console.log("⏸️ [WEBRTC] Queuing ICE candidate (no remote description yet)");
      let queued = pendingCandidatesMap.get(peerConnection) || [];
      queued.push(candidate);
      pendingCandidatesMap.set(peerConnection, queued);
      return;
    }

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

/**
 * Set audio route for call: speaker (loud) vs earpiece (phone to ear).
 * Uses react-native-incall-manager when available; falls back to expo-av.
 * @param {boolean} useSpeaker - true = loudspeaker, false = earpiece
 */
export const setAudioRoute = async (useSpeaker) => {
  if (InCallManager) {
    try {
      InCallManager.setSpeakerphoneOn(useSpeaker);
      if (Platform.OS === "ios") {
        InCallManager.setForceSpeakerphoneOn(useSpeaker);
      }
    } catch (error) {
      console.warn("⚠️ [WEBRTC] InCallManager set audio route failed:", error);
    }
    return;
  }
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: !useSpeaker,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
    });
  } catch (error) {
    console.warn("⚠️ [WEBRTC] Could not set audio route:", error);
  }
};

/**
 * Start in-call mode (enables speaker/earpiece control via InCallManager).
 * Call when the call becomes connected.
 * @param {'audio'|'video'} media - 'audio' for voice, 'video' for video call
 */
export const startInCall = (media = "audio") => {
  if (InCallManager) {
    try {
      InCallManager.start({ media, auto: true });
    } catch (error) {
      console.warn("⚠️ [WEBRTC] InCallManager start failed:", error);
    }
  }
};

/**
 * Stop in-call mode. Call when the call ends.
 */
export const stopInCall = () => {
  if (InCallManager) {
    try {
      InCallManager.stop();
    } catch (error) {
      console.warn("⚠️ [WEBRTC] InCallManager stop failed:", error);
    }
  }
};
