import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";
import Ionicons from "react-native-vector-icons/Ionicons";
import EndCallModal from "../components/EndCallModal";
import {
  getSocket,
  endCall,
  sendWebRTCOffer,
  sendWebRTCAnswer,
  sendWebRTCIceCandidate,
} from "../services/chatService";
import {
  setupWebRTCConnection,
  handleOffer,
  handleAnswer,
  handleIceCandidate,
  cleanupWebRTC,
  toggleAudioTrack,
} from "../services/webrtcService";
import { useAudioPlayer } from "expo-audio";
import { showError } from "../../../shared/utils/toast";
import {
  logStreamInfo,
  monitorStreamTracks,
  logPeerConnectionStats,
  monitorPeerConnection,
  checkStreamingStatus,
} from "../utils/webrtcDebug";

export default function VoiceCallPage({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const {
    doctor,
    otherUserId,
    conversationId,
    callType,
    isInitiator = true,
  } = route.params || {};
  const [showEndModal, setShowEndModal] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callStatus, setCallStatus] = useState("ringing"); // 'ringing' | 'connecting' | 'connected'
  const [callDuration, setCallDuration] = useState(0);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const callTimerRef = useRef(null);
  const webrtcSetupRef = useRef(false);

  // Use expo-audio player for ringtone
  // Different tones for caller (ringback) vs recipient (incoming)
  const ringbackToneURI =
    "https://assets.mixkit.co/sfx/preview/mixkit-phone-ring-1060.mp3"; // Ringback for caller
  const incomingRingtoneURI =
    "https://assets.mixkit.co/sfx/preview/mixkit-phone-ring-1060.mp3"; // Incoming for recipient
  const ringtonePlayer = useAudioPlayer(
    isInitiator ? ringbackToneURI : incomingRingtoneURI,
  );

  // Setup socket listeners and WebRTC
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !otherUserId) return;

    const setupWebRTC = async () => {
      if (webrtcSetupRef.current) return;
      webrtcSetupRef.current = true;

      try {
        const { peerConnection, localStream: stream } =
          await setupWebRTCConnection({
            otherUserId,
            isInitiator,
            isVideo: false,
            onLocalStream: (stream) => {
              setLocalStream(stream);
              localStreamRef.current = stream;
              // Debug: Log local stream info
              logStreamInfo(stream, "Local");
              monitorStreamTracks(stream, "Local");
            },
            onRemoteStream: (stream) => {
              setRemoteStream(stream);
              setCallStatus("connected");
              stopRingingSound();
              // Debug: Log remote stream info
              logStreamInfo(stream, "Remote");
              monitorStreamTracks(stream, "Remote");
              // Log peer connection stats when remote stream arrives
              setTimeout(async () => {
                if (peerConnectionRef.current) {
                  await logPeerConnectionStats(peerConnectionRef.current, "VoiceCall");
                }
              }, 2000);
            },
            onConnectionStateChange: (state) => {
              if (state === "connected") {
                setCallStatus("connected");
                stopRingingSound();
              } else if (state === "disconnected" || state === "failed") {
                handleEndCall();
              }
            },
          });

        peerConnectionRef.current = peerConnection;
        
        // Debug: Monitor peer connection
        monitorPeerConnection(peerConnection, "VoiceCall");
        
        // Debug: Log peer connection stats after a delay
        setTimeout(async () => {
          await logPeerConnectionStats(peerConnection, "VoiceCall");
        }, 3000);
        
        // Debug: Monitor peer connection
        monitorPeerConnection(peerConnection, "VoiceCall");
        
        // Debug: Log peer connection stats after a delay
        setTimeout(async () => {
          await logPeerConnectionStats(peerConnection, "VoiceCall");
        }, 3000);
      } catch (error) {
        console.error("❌ [VOICE CALL] Error setting up WebRTC:", error);
        webrtcSetupRef.current = false;
        const errorMessage = error?.message || "Failed to start call";
        if (
          errorMessage.includes("permission") ||
          errorMessage.includes("Permission")
        ) {
          showError(
            "Microphone permission is required for voice calls. Please grant permission in settings.",
            "Permission Required",
          );
        } else {
          showError(errorMessage, "Call Error");
        }
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      }
    };

    const initializeCall = async () => {
      try {
        // If recipient (incoming call), play incoming ringtone immediately
        // If initiator (outgoing call), wait for call:ringing event to play ringback
        if (!isInitiator) {
          playRingingSound();
        }

        // If initiator, set up WebRTC immediately
        // If recipient, wait for call:accepted
        if (isInitiator) {
          await setupWebRTC();
        }
      } catch (error) {
        console.error("❌ [VOICE CALL] Error initializing call:", error);
        navigation.goBack();
      }
    };

    // WebRTC signaling handlers
    const onWebRTCOffer = async (data) => {
      if (data.fromUserId === otherUserId && peerConnectionRef.current) {
        try {
          await handleOffer({
            peerConnection: peerConnectionRef.current,
            offer: data.offer,
            otherUserId,
            isVideo: false,
          });
        } catch (error) {
          console.error("❌ [VOICE CALL] Error handling offer:", error);
        }
      }
    };

    const onWebRTCAnswer = async (data) => {
      if (data.fromUserId === otherUserId && peerConnectionRef.current) {
        try {
          await handleAnswer({
            peerConnection: peerConnectionRef.current,
            answer: data.answer,
          });
        } catch (error) {
          console.error("❌ [VOICE CALL] Error handling answer:", error);
        }
      }
    };

    const onWebRTCIceCandidate = async (data) => {
      if (data.fromUserId === otherUserId && peerConnectionRef.current) {
        try {
          await handleIceCandidate({
            peerConnection: peerConnectionRef.current,
            candidate: data.candidate,
          });
        } catch (error) {
          console.error("❌ [VOICE CALL] Error handling ICE candidate:", error);
        }
      }
    };

    // Call event handlers
    const onCallAccepted = async () => {
      setCallStatus("connecting");
      stopRingingSound();
      // If recipient, set up WebRTC now that call is accepted
      if (!isInitiator && !webrtcSetupRef.current) {
        await setupWebRTC();
      }
    };

    const onCallConnected = () => {
      setCallStatus("connected");
      stopRingingSound();
    };

    const onCallRejected = () => {
      stopRingingSound();
      handleEndCall();
    };

    const onCallNoAnswer = () => {
      stopRingingSound();
      handleEndCall();
    };

    const onCallEnded = () => {
      stopRingingSound();
      handleEndCall();
    };

    const onCallRinging = () => {
      // Caller receives this - start ringback tone
      if (isInitiator) {
        playRingingSound();
      }
    };

    const onCallStopRinging = () => {
      // Caller receives this when recipient answers - stop ringback
      if (isInitiator) {
        stopRingingSound();
      }
    };

    // Register socket listeners
    socket.on("call:ringing", onCallRinging);
    socket.on("call:accepted", onCallAccepted);
    socket.on("call:connected", onCallConnected);
    socket.on("call:rejected", onCallRejected);
    socket.on("call:no-answer", onCallNoAnswer);
    socket.on("call:ended", onCallEnded);
    socket.on("call:stop-ringing", onCallStopRinging);
    socket.on("webrtc:offer", onWebRTCOffer);
    socket.on("webrtc:answer", onWebRTCAnswer);
    socket.on("webrtc:ice-candidate", onWebRTCIceCandidate);

    // Initialize call
    initializeCall();

    return () => {
      socket.off("call:ringing", onCallRinging);
      socket.off("call:accepted", onCallAccepted);
      socket.off("call:connected", onCallConnected);
      socket.off("call:rejected", onCallRejected);
      socket.off("call:no-answer", onCallNoAnswer);
      socket.off("call:ended", onCallEnded);
      socket.off("call:stop-ringing", onCallStopRinging);
      socket.off("webrtc:offer", onWebRTCOffer);
      socket.off("webrtc:answer", onWebRTCAnswer);
      socket.off("webrtc:ice-candidate", onWebRTCIceCandidate);
      stopRingingSound();
      cleanupWebRTC(peerConnectionRef.current, localStreamRef.current);
    };
  }, [otherUserId, navigation]);

  // Call duration timer
  useEffect(() => {
    if (callStatus === "connected") {
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
    }
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [callStatus]);

  // Monitor stream status for debugging
  useEffect(() => {
    if (callStatus === "connected") {
      const statusInterval = setInterval(() => {
        const localStatus = checkStreamingStatus(localStream);
        const remoteStatus = checkStreamingStatus(remoteStream);
        
        // Log to console for debugging
        console.log("📊 [VOICE CALL] Stream Status:", {
          local: localStatus,
          remote: remoteStatus,
          peerConnectionState: peerConnectionRef.current?.connectionState,
          iceConnectionState: peerConnectionRef.current?.iceConnectionState,
        });
      }, 3000);

      return () => clearInterval(statusInterval);
    }
  }, [callStatus, localStream, remoteStream]);

  // Handle ringtone looping
  const ringtoneLoopRef = useRef(null);
  const isRingingRef = useRef(false);

  useEffect(() => {
    if (callStatus === "ringing" && !isRingingRef.current) {
      isRingingRef.current = true;
      // Check if ringtone finished and loop it
      const checkAndLoop = () => {
        try {
          if (ringtonePlayer && ringtonePlayer.status?.isLoaded) {
            // Check if playback finished and restart
            if (
              ringtonePlayer.status.didJustFinish ||
              (ringtonePlayer.status.duration &&
                ringtonePlayer.status.currentTime >=
                  ringtonePlayer.status.duration - 0.1)
            ) {
              ringtonePlayer.seekTo(0);
              ringtonePlayer.play();
            }
          }
        } catch (error) {
          // Player might be released, stop looping
          if (ringtoneLoopRef.current) {
            clearInterval(ringtoneLoopRef.current);
            ringtoneLoopRef.current = null;
          }
        }
      };

      ringtoneLoopRef.current = setInterval(checkAndLoop, 200);
    } else if (callStatus !== "ringing") {
      isRingingRef.current = false;
      if (ringtoneLoopRef.current) {
        clearInterval(ringtoneLoopRef.current);
        ringtoneLoopRef.current = null;
      }
    }

    return () => {
      if (ringtoneLoopRef.current) {
        clearInterval(ringtoneLoopRef.current);
        ringtoneLoopRef.current = null;
      }
    };
  }, [callStatus, ringtonePlayer]);

  const playRingingSound = () => {
    try {
      if (!ringtonePlayer) return;
      // Use expo-audio player - proper phone ringtone
      ringtonePlayer.seekTo(0); // Reset to start
      ringtonePlayer.play(); // Start playing (will loop via useEffect)
    } catch (error) {
      console.warn("⚠️ [VOICE CALL] Could not play ringing sound:", error);
    }
  };

  const stopRingingSound = () => {
    try {
      if (!ringtonePlayer) return;
      // Check if player is still valid before pausing
      if (ringtonePlayer.status?.isLoaded) {
        ringtonePlayer.pause();
        ringtonePlayer.seekTo(0);
      }
    } catch (error) {
      // Player already released, ignore
      console.warn(
        "⚠️ [VOICE CALL] Error stopping ringing sound (player may be released):",
        error.message,
      );
    }
  };

  const handleEndCall = () => {
    stopRingingSound();
    if (otherUserId) {
      endCall(otherUserId);
    }
    cleanupWebRTC(peerConnectionRef.current, localStreamRef.current);
    setCallDuration(0);
    navigation.goBack();
  };

  const handleEndCallPress = () => {
    setShowEndModal(true);
  };

  const handleConfirmEnd = () => {
    setShowEndModal(false);
    handleEndCall();
  };

  const handleContinueCall = () => {
    setShowEndModal(false);
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (localStreamRef.current) {
      toggleAudioTrack(localStreamRef.current, !newMuted);
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // Note: Speaker control would need additional native module or expo-av audio routing
  };

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleEndCallPress}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.grey} />
        </TouchableOpacity>

        <View style={styles.doctorInfo}>
          <View style={styles.doctorAvatar}>
            <Ionicons name="person" size={16} color={Colors.primary} />
          </View>
          <Text style={styles.doctorName}>{doctor?.name || "Consultant"}</Text>
        </View>

        <View style={styles.statusButton}>
          <Text style={styles.statusText}>
            {callStatus === "connected"
              ? "Connected"
              : callStatus === "connecting"
                ? "Connecting..."
                : "Ringing..."}
          </Text>
        </View>
      </SafeAreaView>

      <View style={styles.mainContent}>
        <View style={styles.doctorImageContainer}>
          <Ionicons name="person" size={80} color={Colors.white} />
        </View>

        {callStatus === "connected" && (
          <View style={styles.statusInfo}>
            <Text style={styles.timeText}>
              {formatCallDuration(callDuration)}
            </Text>
          </View>
        )}
      </View>

      <View
        style={[
          styles.controlsContainer,
          { paddingBottom: insets.bottom + Sizes.lg },
        ]}
      >
        <TouchableOpacity style={styles.controlButton} onPress={toggleSpeaker}>
          <Ionicons
            name={isSpeakerOn ? "volume-high" : "volume-low"}
            size={24}
            color={Colors.black}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.endCallButton]}
          onPress={handleEndCallPress}
        >
          <Ionicons name="call" size={24} color={Colors.white} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
          <Ionicons
            name={isMuted ? "mic-off" : "mic"}
            size={24}
            color={Colors.black}
          />
        </TouchableOpacity>
      </View>

      <EndCallModal
        visible={showEndModal}
        onClose={handleContinueCall}
        onConfirm={handleConfirmEnd}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0098B3",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    marginRight: Sizes.sm,
  },
  doctorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  doctorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.sm,
  },
  doctorName: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
  },
  statusButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.xs,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Sizes.xl,
  },
  doctorImageContainer: {
    width: 200,
    height: 200,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Sizes.xl,
  },
  statusInfo: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  timeText: {
    fontSize: 24,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Sizes.xl,
    paddingVertical: Sizes.xl,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    gap: Sizes.lg,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  endCallButton: {
    backgroundColor: "#F44336",
    width: 64,
    height: 64,
    borderRadius: 32,
  },
});
