import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";
import Ionicons from "react-native-vector-icons/Ionicons";
import EndCallModal from "../components/EndCallModal";
import { getSocket, endCall } from "../services/chatService";
import {
  setupWebRTCConnection,
  handleOffer,
  handleAnswer,
  handleIceCandidate,
  cleanupWebRTC,
  toggleAudioTrack,
  toggleVideoTrack,
} from "../services/webrtcService";
import { useAudioPlayer } from "expo-audio";
import { RTCView } from "react-native-webrtc";
import { showError } from "../../../shared/utils/toast";
import {
  logStreamInfo,
  monitorStreamTracks,
  logPeerConnectionStats,
  monitorPeerConnection,
  checkStreamingStatus,
  startStatsMonitoring,
} from "../utils/webrtcDebug";

export default function VideoCallPage({ navigation, route }) {
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
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callStatus, setCallStatus] = useState("ringing"); // 'ringing' | 'connecting' | 'connected'
  const [callDuration, setCallDuration] = useState(0);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [streamStatus, setStreamStatus] = useState({
    localAudio: false,
    localVideo: false,
    remoteAudio: false,
    remoteVideo: false,
  });

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
            isVideo: true,
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
                  await logPeerConnectionStats(
                    peerConnectionRef.current,
                    "VideoCall",
                  );
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
        monitorPeerConnection(peerConnection, "VideoCall");

        // Debug: Log peer connection stats after a delay
        setTimeout(async () => {
          await logPeerConnectionStats(peerConnection, "VideoCall");
        }, 3000);

        // Debug: Monitor peer connection
        monitorPeerConnection(peerConnection, "VideoCall");

        // Debug: Start periodic stats monitoring (every 5 seconds)
        // Uncomment to enable:
        // const statsCleanup = startStatsMonitoring(
        //   peerConnection,
        //   localStreamRef.current,
        //   null,
        //   5000
        // );
      } catch (error) {
        console.error("❌ [VIDEO CALL] Error setting up WebRTC:", error);
        webrtcSetupRef.current = false;
        const errorMessage = error?.message || "Failed to start call";
        if (
          errorMessage.includes("permission") ||
          errorMessage.includes("Permission")
        ) {
          const isVideo =
            errorMessage.includes("Camera") || errorMessage.includes("camera");
          const isAudio =
            errorMessage.includes("Audio") ||
            errorMessage.includes("microphone");
          if (isVideo && isAudio) {
            showError(
              "Camera and microphone permissions are required for video calls. Please grant permissions in settings.",
              "Permissions Required",
            );
          } else if (isVideo) {
            showError(
              "Camera permission is required for video calls. Please grant permission in settings.",
              "Permission Required",
            );
          } else {
            showError(
              "Microphone permission is required for video calls. Please grant permission in settings.",
              "Permission Required",
            );
          }
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
        console.error("❌ [VIDEO CALL] Error initializing call:", error);
        navigation.goBack();
      }
    };

    const onWebRTCOffer = async (data) => {
      if (data.fromUserId === otherUserId && peerConnectionRef.current) {
        try {
          await handleOffer({
            peerConnection: peerConnectionRef.current,
            offer: data.offer,
            otherUserId,
            isVideo: true,
          });
        } catch (error) {
          console.error("❌ [VIDEO CALL] Error handling offer:", error);
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
          console.error("❌ [VIDEO CALL] Error handling answer:", error);
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
          console.error("❌ [VIDEO CALL] Error handling ICE candidate:", error);
        }
      }
    };

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

        setStreamStatus({
          localAudio: localStatus.hasAudio,
          localVideo: localStatus.hasVideo,
          remoteAudio: remoteStatus.hasAudio,
          remoteVideo: remoteStatus.hasVideo,
        });

        // Log to console for debugging
        console.log("📊 [VIDEO CALL] Stream Status:", {
          local: localStatus,
          remote: remoteStatus,
        });
      }, 2000);

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
      console.warn("⚠️ [VIDEO CALL] Could not play ringing sound:", error);
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
        "⚠️ [VIDEO CALL] Error stopping ringing sound (player may be released):",
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

  const toggleVideo = () => {
    const newVideoOn = !isVideoOn;
    setIsVideoOn(newVideoOn);
    if (localStreamRef.current) {
      toggleVideoTrack(localStreamRef.current, newVideoOn);
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
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
              ? formatCallDuration(callDuration)
              : callStatus === "connecting"
                ? "Connecting..."
                : "Ringing..."}
          </Text>
        </View>
      </View>


      <View style={styles.videoContainer}>
        {/* Remote video feed */}
        {remoteStream ? (
          <RTCView
            streamURL={remoteStream.toURL()}
            style={styles.mainVideo}
            objectFit="cover"
            mirror={false}
          />
        ) : (
          <View style={styles.mainVideo}>
            <View style={styles.doctorVideoPlaceholder}>
              <Ionicons name="person" size={100} color={Colors.white} />
            </View>
          </View>
        )}

        {/* Local video feed - Picture-in-picture */}
        {localStream && isVideoOn ? (
          <View style={[styles.userVideoContainer, { top: insets.top + 60 }]}>
            <RTCView
              streamURL={localStream.toURL()}
              style={styles.userVideo}
              objectFit="cover"
              mirror={true}
            />
          </View>
        ) : localStream ? (
          <View style={[styles.userVideoContainer, { top: insets.top + 60 }]}>
            <View style={styles.userVideoPlaceholder}>
              <Ionicons name="person" size={40} color={Colors.white} />
            </View>
          </View>
        ) : null}
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
          style={[styles.controlButton, !isVideoOn && styles.disabledButton]}
          onPress={toggleVideo}
        >
          <Ionicons
            name={isVideoOn ? "videocam" : "videocam-off"}
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
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
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
  videoContainer: {
    flex: 1,
    position: "relative",
  },
  mainVideo: {
    flex: 1,
    backgroundColor: "#000000",
  },
  doctorVideoPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  userVideoContainer: {
    position: "absolute",
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#000000",
    borderWidth: 2,
    borderColor: Colors.white,
    // top is set dynamically in component to account for header height
  },
  userVideo: {
    width: "100%",
    height: "100%",
  },
  userVideoPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
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
  disabledButton: {
    backgroundColor: "#E0E0E0",
  },
  endCallButton: {
    backgroundColor: "#F44336",
    width: 64,
    height: 64,
    borderRadius: 32,
  },
});
