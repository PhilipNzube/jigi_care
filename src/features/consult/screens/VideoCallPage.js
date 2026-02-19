import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";
import Ionicons from "react-native-vector-icons/Ionicons";
import EndCallModal from "../components/EndCallModal";
import {
  getSocket,
  endCall,
  getAndClearPendingOffer,
  getAndClearPendingIceCandidates,
} from "../services/chatService";
import {
  setupWebRTCConnection,
  handleOffer,
  handleAnswer,
  handleIceCandidate,
  cleanupWebRTC,
  toggleAudioTrack,
  toggleVideoTrack,
  setAudioRoute,
  startInCall,
  stopInCall,
} from "../services/webrtcService";
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
import { startRingtone, stopRingtone, getRingtoneURI } from "../utils/ringtone";

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
  const [videoRefreshKey, setVideoRefreshKey] = useState(0);
  const [remoteVideoRefreshKey, setRemoteVideoRefreshKey] = useState(0);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const callTimerRef = useRef(null);
  const webrtcSetupRef = useRef(false);
  const hasEndedCallRef = useRef(false);

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
              setVideoRefreshKey((k) => k + 1);
              setRemoteVideoRefreshKey((k) => k + 1);
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
              // When remote stream tracks change, refresh remote video view
              stream.getTracks().forEach((track) => {
                track.addEventListener("ended", () =>
                  setRemoteVideoRefreshKey((k) => k + 1),
                );
                track.addEventListener("mute", () =>
                  setRemoteVideoRefreshKey((k) => k + 1),
                );
                track.addEventListener("unmute", () =>
                  setRemoteVideoRefreshKey((k) => k + 1),
                );
              });
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

    const t = () => `[t=${Date.now()}]`;

    const initializeCall = async () => {
      try {
        // If recipient: ringtone already started on ChatPage when incoming UI appeared; don't start again.
        // If initiator: wait for call:ringing event to play ringback (see onCallRinging).
        if (!isInitiator) {
          console.log(`🏁 [VIDEO RACE] ${t()} Recipient: initializeCall done. NOT calling setupWebRTC – waiting for call:connected. peerConnectionRef.current=${!!peerConnectionRef.current}`);
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
      const hasPc = !!peerConnectionRef.current;
      const fromMatch = data.fromUserId === otherUserId;
      console.log(`🏁 [VIDEO RACE] ${t()} webrtc:offer received. fromUserId=${data?.fromUserId} otherUserId=${otherUserId} fromMatch=${fromMatch} hasPeerConnection=${hasPc}`);
      if (data.fromUserId === otherUserId && peerConnectionRef.current) {
        try {
          console.log(`🏁 [VIDEO RACE] ${t()} Handling offer (peer connection ready)`);
          await handleOffer({
            peerConnection: peerConnectionRef.current,
            offer: data.offer,
            otherUserId,
            isVideo: true,
          });
        } catch (error) {
          console.error("❌ [VIDEO CALL] Error handling offer:", error);
        }
      } else if (!hasPc) {
        console.warn(`🏁 [VIDEO RACE] ${t()} RACE? Skipping offer – peerConnectionRef is null (call:connected/setupWebRTC not done yet)`);
      }
    };

    const onWebRTCAnswer = async (data) => {
      const hasPc = !!peerConnectionRef.current;
      console.log(`🏁 [VIDEO RACE] ${t()} webrtc:answer received. hasPeerConnection=${hasPc}`);
      if (data.fromUserId === otherUserId && peerConnectionRef.current) {
        try {
          await handleAnswer({
            peerConnection: peerConnectionRef.current,
            answer: data.answer,
          });
        } catch (error) {
          console.error("❌ [VIDEO CALL] Error handling answer:", error);
        }
      } else if (!hasPc) {
        console.warn(`🏁 [VIDEO RACE] ${t()} RACE? Skipping answer – peerConnectionRef is null`);
      }
    };

    const onWebRTCIceCandidate = async (data) => {
      const hasPc = !!peerConnectionRef.current;
      if (!hasPc && data.fromUserId === otherUserId) {
        console.warn(`🏁 [VIDEO RACE] ${t()} webrtc:ice-candidate received but peerConnectionRef is null (skipping)`);
      }
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

    const onCallConnected = async () => {
      console.log(`🏁 [VIDEO RACE] ${t()} call:connected received (recipient). Will call setupWebRTC now. peerConnectionRef.current before=${!!peerConnectionRef.current}`);
      console.log("✅ [VIDEO CALL] Call connected (you answered) – fromUserId (caller) = otherUserId:", otherUserId);
      setCallStatus("connected");
      stopRingingSound();
      // Recipient gets call:connected (not call:accepted) — set up WebRTC here so local camera appears
      if (!isInitiator && !webrtcSetupRef.current) {
        console.log(`🏁 [VIDEO RACE] ${t()} setupWebRTC starting (async)...`);
        await setupWebRTC();
        console.log(`🏁 [VIDEO RACE] ${t()} setupWebRTC finished. peerConnectionRef.current now=${!!peerConnectionRef.current}`);
        // Apply offer that may have arrived before this screen mounted (e.g. while on ChatPage)
        const pending = getAndClearPendingOffer(otherUserId);
        if (pending?.offer && peerConnectionRef.current) {
          try {
            console.log("📥 [VIDEO CALL] Applying pending offer (received before call screen mounted)");
            await handleOffer({
              peerConnection: peerConnectionRef.current,
              offer: pending.offer,
              otherUserId,
              isVideo: true,
            });
            const iceCandidates = getAndClearPendingIceCandidates(otherUserId);
            for (const candidate of iceCandidates || []) {
              await handleIceCandidate({
                peerConnection: peerConnectionRef.current,
                candidate,
              });
            }
          } catch (e) {
            console.error("❌ [VIDEO CALL] Error applying pending offer:", e);
          }
        }
      }
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
      stopInCall();
      cleanupWebRTC(peerConnectionRef.current, localStreamRef.current);
    };
  }, [otherUserId, navigation]);

  // Start InCallManager when connected so speaker/earpiece toggle works
  useEffect(() => {
    if (callStatus === "connected") {
      startInCall("video");
      setAudioRoute(isSpeakerOn);
    }
  }, [callStatus]);

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

  const playRingingSound = () => {
    const type = isInitiator ? "outgoing" : "incoming";
    startRingtone(getRingtoneURI(type));
  };

  const stopRingingSound = () => {
    stopRingtone();
  };

  const handleEndCall = () => {
    if (hasEndedCallRef.current) return;
    hasEndedCallRef.current = true;
    stopRingingSound();
    stopInCall();
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

  const toggleSpeaker = async () => {
    const next = !isSpeakerOn;
    setIsSpeakerOn(next);
    await setAudioRoute(next);
  };

  // Periodic refresh of local video view to avoid frozen frame
  useEffect(() => {
    if (callStatus !== "connected" || !localStream) return;
    const t = setInterval(() => setVideoRefreshKey((k) => k + 1), 15000);
    return () => clearInterval(t);
  }, [callStatus, localStream]);

  // More frequent refresh for remote (caller) video so their feed keeps updating on recipient's screen
  useEffect(() => {
    if (callStatus !== "connected" || !remoteStream) return;
    const t = setInterval(() => setRemoteVideoRefreshKey((k) => k + 1), 2500);
    return () => clearInterval(t);
  }, [callStatus, remoteStream]);

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
        {/* Remote video feed (caller) - key refreshes so their video keeps updating */}
        {remoteStream ? (
          <RTCView
            key={`remote-${remoteVideoRefreshKey}-${videoRefreshKey}-${remoteStream.id}`}
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
              key={`local-${videoRefreshKey}-${localStream.id}`}
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
            name={isSpeakerOn ? "volume-high" : "phone-portrait-outline"}
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
