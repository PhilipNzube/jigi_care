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
  setAudioRoute,
  startInCall,
  stopInCall,
  checkBluetoothAvailable,
  getInitialAudioRoute,
} from "../services/webrtcService";
import { showError } from "../../../shared/utils/toast";
import {
  logStreamInfo,
  monitorStreamTracks,
  logPeerConnectionStats,
  monitorPeerConnection,
  checkStreamingStatus,
} from "../utils/webrtcDebug";
import { startRingtone, stopRingtone, getRingtoneURI } from "../utils/ringtone";

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
  const [audioDevice, setAudioDevice] = useState("earpiece");
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [isBluetoothPresent, setIsBluetoothPresent] = useState(false);
  const [callStatus, setCallStatus] = useState("ringing");
  const [callDuration, setCallDuration] = useState(0);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const callTimerRef = useRef(null);
  const webrtcSetupRef = useRef(false);
  const hasEndedCallRef = useRef(false);

  // Setup socket listeners and WebRTC
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !otherUserId) return;

    const setupWebRTC = async () => {
      if (webrtcSetupRef.current) {
        console.log("⚠️ [VOICE CALL] WebRTC setup already in progress or completed");
        return;
      }
      webrtcSetupRef.current = true;

      try {
        console.log("🔧 [VOICE CALL] Starting WebRTC setup...", {
          isInitiator,
          otherUserId,
        });
        
        const { peerConnection, localStream: stream } =
          await setupWebRTCConnection({
            otherUserId,
            isInitiator,
            isVideo: false,
            onLocalStream: (stream) => {
              console.log("✅ [VOICE CALL] Local stream received:", {
                streamId: stream?.id,
                audioTracks: stream?.getAudioTracks()?.length || 0,
                videoTracks: stream?.getVideoTracks()?.length || 0,
              });
              setLocalStream(stream);
              localStreamRef.current = stream;
              // Debug: Log local stream info
              logStreamInfo(stream, "Local");
              monitorStreamTracks(stream, "Local");
            },
            onRemoteStream: (stream) => {
              console.log("✅ [VOICE CALL] Remote stream received:", {
                streamId: stream?.id,
                audioTracks: stream?.getAudioTracks()?.length || 0,
                videoTracks: stream?.getVideoTracks()?.length || 0,
              });
              setRemoteStream(stream);
              console.log("✅ [VOICE CALL] Setting status to 'connected' - remote stream arrived");
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
              console.log("🔄 [VOICE CALL] Connection state changed:", state);
              if (state === "connected") {
                console.log("✅ [VOICE CALL] Peer connection connected - updating status");
                setCallStatus("connected");
                stopRingingSound();
              } else if (state === "connecting") {
                console.log("🔄 [VOICE CALL] Peer connection connecting...");
                setCallStatus("connecting");
              } else if (state === "disconnected" || state === "failed") {
                console.log("❌ [VOICE CALL] Peer connection failed/disconnected");
                handleEndCall();
              }
            },
          });

        console.log("✅ [VOICE CALL] WebRTC setup completed:", {
          hasPeerConnection: !!peerConnection,
          hasLocalStream: !!stream,
          peerConnectionState: peerConnection?.connectionState,
          iceConnectionState: peerConnection?.iceConnectionState,
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

    const t = () => `[t=${Date.now()}]`;

    const initializeCall = async () => {
      try {
        // Set up WebRTC immediately for BOTH initiator AND recipient.
        // Previously the recipient did nothing here and waited for call:connected,
        // but that event fires while still on ChatPage for cold-start / background
        // answers, so VoiceCallPage never received it and froze on "Ringing".
        console.log(`🏁 [VOICE CALL] ${t()} Initializing call (isInitiator=${isInitiator}). Calling setupWebRTC immediately for both roles.`);
        await setupWebRTC();

        // For recipient: drain any buffered offer + ICE candidates that arrived
        // before this screen mounted.
        if (!isInitiator) {
          const pending = getAndClearPendingOffer(otherUserId);
          if (pending?.offer && peerConnectionRef.current) {
            try {
              console.log("📥 [VOICE CALL] Draining buffered offer from chatService after immediate setupWebRTC");
              await handleOffer({
                peerConnection: peerConnectionRef.current,
                offer: pending.offer,
                otherUserId,
                isVideo: false,
              });
              const iceCandidates = getAndClearPendingIceCandidates(otherUserId);
              for (const candidate of iceCandidates || []) {
                await handleIceCandidate({
                  peerConnection: peerConnectionRef.current,
                  candidate,
                });
              }
              console.log(`✅ [VOICE CALL] Buffered offer + ${iceCandidates?.length ?? 0} ICE candidates applied`);
            } catch (e) {
              console.error("❌ [VOICE CALL] Error applying buffered offer:", e);
            }
          } else {
            console.log(`🏁 [VOICE CALL] ${t()} No buffered offer found – will apply via live webrtc:offer event`);
          }
        }
      } catch (error) {
        console.error("❌ [VOICE CALL] Error initializing call:", error);
        navigation.goBack();
      }
    };

    // WebRTC signaling handlers
    const onWebRTCOffer = async (data) => {
      const hasPc = !!peerConnectionRef.current;
      const fromMatch = data.fromUserId === otherUserId;
      console.log(`🏁 [VOICE RACE] ${t()} webrtc:offer received. fromUserId=${data?.fromUserId} otherUserId=${otherUserId} fromMatch=${fromMatch} hasPeerConnection=${hasPc}`);
      if (data.fromUserId === otherUserId && peerConnectionRef.current) {
        try {
          console.log(`🏁 [VOICE RACE] ${t()} Handling offer (peer connection ready)`);
          await handleOffer({
            peerConnection: peerConnectionRef.current,
            offer: data.offer,
            otherUserId,
            isVideo: false,
          });
        } catch (error) {
          console.error("❌ [VOICE CALL] Error handling offer:", error);
        }
      } else if (!hasPc) {
        console.warn(`🏁 [VOICE RACE] ${t()} RACE? Skipping offer – peerConnectionRef is null (call:connected/setupWebRTC not done yet)`);
      }
    };

    const onWebRTCAnswer = async (data) => {
      const hasPc = !!peerConnectionRef.current;
      console.log(`🏁 [VOICE RACE] ${t()} webrtc:answer received. hasPeerConnection=${hasPc}`);
      if (data.fromUserId === otherUserId && peerConnectionRef.current) {
        try {
          console.log("📥 [VOICE CALL] WebRTC answer received");
          await handleAnswer({
            peerConnection: peerConnectionRef.current,
            answer: data.answer,
          });
          console.log("✅ [VOICE CALL] Answer processed, waiting for connection...");
        } catch (error) {
          console.error("❌ [VOICE CALL] Error handling answer:", error);
        }
      } else if (!hasPc) {
        console.warn(`🏁 [VOICE RACE] ${t()} RACE? Skipping answer – peerConnectionRef is null`);
      }
    };

    const onWebRTCIceCandidate = async (data) => {
      const hasPc = !!peerConnectionRef.current;
      if (!hasPc && data.fromUserId === otherUserId) {
        console.warn(`🏁 [VOICE RACE] ${t()} webrtc:ice-candidate received but peerConnectionRef is null (skipping)`);
      }
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
      console.log("✅ [VOICE CALL] Call accepted - setting status to connecting");
      setCallStatus("connecting");
      stopRingingSound();
      // If recipient, set up WebRTC now that call is accepted
      if (!isInitiator && !webrtcSetupRef.current) {
        await setupWebRTC();
      }
      // If initiator, the status will change to "connected" when:
      // 1. Remote stream arrives (onRemoteStream callback)
      // 2. Peer connection state changes to "connected" (onConnectionStateChange)
    };

    const onCallConnected = async () => {
      console.log(`🏁 [VOICE RACE] ${t()} call:connected received (recipient). Will call setupWebRTC now. peerConnectionRef.current before=${!!peerConnectionRef.current}`);
      console.log("✅ [VOICE CALL] Call connected (you answered) – fromUserId (caller) = otherUserId:", otherUserId);
      setCallStatus("connected");
      stopRingingSound();
      // Recipient gets call:connected (not call:accepted) — set up WebRTC here so mic works
      if (!isInitiator && !webrtcSetupRef.current) {
        console.log(`🏁 [VOICE RACE] ${t()} setupWebRTC starting (async)...`);
        await setupWebRTC();
        console.log(`🏁 [VOICE RACE] ${t()} setupWebRTC finished. peerConnectionRef.current now=${!!peerConnectionRef.current}`);
        // Apply offer that may have arrived before this screen mounted (e.g. while on ChatPage)
        const pending = getAndClearPendingOffer(otherUserId);
        if (pending?.offer && peerConnectionRef.current) {
          try {
            console.log("📥 [VOICE CALL] Applying pending offer (received before call screen mounted)");
            await handleOffer({
              peerConnection: peerConnectionRef.current,
              offer: pending.offer,
              otherUserId,
              isVideo: false,
            });
            const iceCandidates = getAndClearPendingIceCandidates(otherUserId);
            for (const candidate of iceCandidates || []) {
              await handleIceCandidate({
                peerConnection: peerConnectionRef.current,
                candidate,
              });
            }
          } catch (e) {
            console.error("❌ [VOICE CALL] Error applying pending offer:", e);
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
      stopInCall();
      cleanupWebRTC(peerConnectionRef.current, localStreamRef.current);
    };
  }, [otherUserId, navigation]);

  // Sync initial audio routing icons with hardware state
  useEffect(() => {
    const initAudio = async () => {
      const initialRoute = await getInitialAudioRoute(false);
      setAudioDevice(initialRoute);
      setIsBluetoothPresent(checkBluetoothAvailable());
    };
    initAudio();
  }, []);

  // Monitor bluetooth presence changes
  useEffect(() => {
    if (callStatus === "connected") {
      setIsBluetoothPresent(checkBluetoothAvailable());
    }
  }, [callStatus]);

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
        const peerConnection = peerConnectionRef.current;
        const localStatus = checkStreamingStatus(localStream);
        const remoteStatus = checkStreamingStatus(remoteStream);
        
        // Log to console for debugging
        console.log("📊 [VOICE CALL] Stream Status:", {
          local: localStatus,
          remote: remoteStatus,
          peerConnectionState: peerConnection?.connectionState || "not initialized",
          iceConnectionState: peerConnection?.iceConnectionState || "not initialized",
          signalingState: peerConnection?.signalingState || "not initialized",
          iceGatheringState: peerConnection?.iceGatheringState || "not initialized",
          hasPeerConnection: !!peerConnection,
          hasLocalStream: !!localStream,
          hasRemoteStream: !!remoteStream,
        });
        
        // Warn if critical components are missing
        if (!peerConnection) {
          console.warn("⚠️ [VOICE CALL] Peer connection not initialized!");
        }
        if (!localStream) {
          console.warn("⚠️ [VOICE CALL] Local stream not available!");
        }
        if (localStream && localStatus.audioTracks === 0) {
          console.warn("⚠️ [VOICE CALL] Local stream has no audio tracks!");
        }
      }, 3000);

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

  const handleAudioRoute = async (route) => {
    setAudioDevice(route);
    setShowAudioMenu(false);
    await setAudioRoute(route);
  };

  const toggleAudioMenu = () => {
    setShowAudioMenu(!showAudioMenu);
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
        <View>
          {showAudioMenu && (
            <View style={styles.audioPopup}>
              <TouchableOpacity 
                style={[styles.audioOption, audioDevice === 'earpiece' && styles.audioOptionActive]} 
                onPress={() => handleAudioRoute('earpiece')}
              >
                <Ionicons name="phone-portrait-outline" size={20} color={audioDevice === 'earpiece' ? Colors.white : Colors.black} />
                <Text style={[styles.audioOptionText, audioDevice === 'earpiece' && styles.audioOptionTextActive]}>Earpiece</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.audioOption, audioDevice === 'speaker' && styles.audioOptionActive]} 
                onPress={() => handleAudioRoute('speaker')}
              >
                <Ionicons name="volume-high" size={20} color={audioDevice === 'speaker' ? Colors.white : Colors.black} />
                <Text style={[styles.audioOptionText, audioDevice === 'speaker' && styles.audioOptionTextActive]}>Speaker</Text>
              </TouchableOpacity>
              
              {isBluetoothPresent && (
                <TouchableOpacity 
                  style={[styles.audioOption, audioDevice === 'bluetooth' && styles.audioOptionActive]} 
                  onPress={() => handleAudioRoute('bluetooth')}
                >
                  <Ionicons name="bluetooth" size={20} color={audioDevice === 'bluetooth' ? Colors.white : Colors.black} />
                  <Text style={[styles.audioOptionText, audioDevice === 'bluetooth' && styles.audioOptionTextActive]}>Bluetooth</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          <TouchableOpacity style={styles.controlButton} onPress={toggleAudioMenu}>
            <Ionicons
              name={
                audioDevice === "speaker"
                  ? "volume-high"
                  : audioDevice === "bluetooth"
                    ? "bluetooth"
                    : "phone-portrait-outline"
              }
              size={24}
              color={Colors.black}
            />
          </TouchableOpacity>
        </View>

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
  completeModalBtnSubmitText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
  },
  audioPopup: {
    position: "absolute",
    bottom: 70,
    left: -40,
    width: 140,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.xs,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    zIndex: 1000,
  },
  audioOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Sizes.sm,
    paddingHorizontal: Sizes.md,
    borderRadius: 8,
    gap: Sizes.sm,
  },
  audioOptionActive: {
    backgroundColor: "#0098B3",
  },
  audioOptionText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
  },
  audioOptionTextActive: {
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
