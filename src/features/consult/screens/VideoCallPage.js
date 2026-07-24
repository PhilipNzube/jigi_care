import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, DeviceEventEmitter } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";
import Ionicons from "react-native-vector-icons/Ionicons";
import EndCallModal from "../components/EndCallModal";
import { getSocket, endCall } from "../services/chatService";
import agoraService from "../services/agoraService";
import { RtcSurfaceView } from "react-native-agora";
import { showError } from "../../../shared/utils/toast";
import { startRingtone, stopRingtone, getRingtoneURI } from "../utils/ringtone";
import LoadingOverlay from "../../../shared/components/LoadingOverlay";
import callKeepService from "../../../shared/services/callKeepService";

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
  const [audioDevice, setAudioDevice] = useState("speaker");
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callStatus, setCallStatus] = useState(isInitiator ? "ringing" : "connecting");
  const [callDuration, setCallDuration] = useState(0);
  const [remoteUid, setRemoteUid] = useState(null);

  const callTimerRef = useRef(null);
  const hasEndedCallRef = useRef(false);
  const agoraJoinedRef = useRef(false);
  // Tracks the user's CHOSEN route so we can push back any unwanted hardware changes
  const audioDeviceRef = useRef("speaker");

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !otherUserId || !conversationId) return;

    const setupAgoraAndJoin = async () => {
      try {
        console.log("📹 [VIDEO CALL] Initializing Agora Engine & Joining channel...");
        await agoraService.initEngine(
          (uid) => {
            console.log("📹 [VIDEO CALL] Remote user joined Agora:", uid);
            setRemoteUid(uid);
            setCallStatus("connected");
            stopRingingSound();
          },
          (uid) => {
            console.log("📹 [VIDEO CALL] Remote user offline Agora:", uid);
            setRemoteUid(null);
          }
        );

        if (!agoraJoinedRef.current) {
          agoraJoinedRef.current = true;
          await agoraService.joinChannel(conversationId, true);
          // Sync hardware to user's chosen route after joining
          setTimeout(() => agoraService.setAudioRoute(audioDeviceRef.current), 300);
        }
      } catch (error) {
        console.error("❌ [VIDEO CALL] Error setting up Agora:", error);
        agoraJoinedRef.current = false;
        showError(error?.message || "Failed to join video call", "Call Error");
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      }
    };

    const onCallRinging = () => {
      if (isInitiator) {
        playRingingSound();
      }
    };

    const onCallAccepted = () => {
      console.log("✅ [VIDEO CALL] Call accepted");
      setCallStatus("connected");
      stopRingingSound();
    };

    const onCallConnected = () => {
      console.log("✅ [VIDEO CALL] Call connected");
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

    const onCallStopRinging = () => {
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

    // Listen for Agora's native hardware routing changes
    const audioDeviceListener = DeviceEventEmitter.addListener(
      "agoraAudioRouteChanged",
      (routing) => {
        // Map Agora routing int to label
        // 0: Headset, 1: Earpiece, 2: HeadsetNoMic, 3: Speakerphone, 4: Loudspeaker, 5: BT HFP
        let newDevice;
        if (routing === 5) newDevice = "bluetooth";
        else if (routing === 3 || routing === 4) newDevice = "speaker";
        else newDevice = "earpiece";

        if (newDevice !== audioDeviceRef.current) {
          // Hardware changed without user action — push it back
          console.log(`🎧 [VIDEO CALL] Hardware switched to ${newDevice}, forcing back to ${audioDeviceRef.current}`);
          setTimeout(() => agoraService.setAudioRoute(audioDeviceRef.current), 100);
        } else {
          setAudioDevice(newDevice);
        }
      }
    );

    // Listen for FCM call_ended notifications (reasons: 'missed', 'cancelled')
    const callEndedFcmSub = DeviceEventEmitter.addListener(
      "callEndedNotification",
      ({ conversationId: endConvId, reason }) => {
        if (!endConvId || endConvId === conversationId) {
          console.log(`🔴 [VIDEO CALL] Call ended via FCM notification (reason: ${reason})`);
          stopRingingSound();
          if (reason === "missed") {
            showError("Call missed", "Call Ended");
          } else if (reason === "cancelled") {
            showError("Call cancelled by caller", "Call Ended");
          } else {
            showError("Call ended", "Call Ended");
          }
          handleEndCall();
        }
      }
    );

    if (isInitiator) {
      playRingingSound();
    }

    setupAgoraAndJoin();

    return () => {
      socket.off("call:ringing", onCallRinging);
      socket.off("call:accepted", onCallAccepted);
      socket.off("call:connected", onCallConnected);
      socket.off("call:rejected", onCallRejected);
      socket.off("call:no-answer", onCallNoAnswer);
      socket.off("call:ended", onCallEnded);
      socket.off("call:stop-ringing", onCallStopRinging);
      audioDeviceListener.remove();
      callEndedFcmSub.remove();
      stopRingingSound();
      callKeepService.endOutgoingCall();
      agoraService.cleanup();
    };
  }, [otherUserId, conversationId, navigation]);

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
    if (otherUserId) {
      endCall(otherUserId);
    }
    agoraService.cleanup();
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

  const handleAudioRoute = (route) => {
    audioDeviceRef.current = route; // Record user's intent FIRST
    setAudioDevice(route);
    setShowAudioMenu(false);
    agoraService.setAudioRoute(route);
  };

  const toggleAudioMenu = () => {
    setShowAudioMenu(!showAudioMenu);
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    agoraService.toggleAudio(!newMuted);
  };

  const toggleVideo = () => {
    const newVideoOn = !isVideoOn;
    setIsVideoOn(newVideoOn);
    agoraService.toggleVideo(newVideoOn);
  };

  const switchCamera = () => {
    agoraService.switchCamera();
  };

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isConnected = callStatus === "connected";

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
            {isConnected
              ? formatCallDuration(callDuration)
              : callStatus === "connecting"
                ? "Connecting..."
                : "Ringing..."}
          </Text>
        </View>
      </View>

      <View style={styles.videoContainer}>
        {/* Remote video feed if connected */}
        {isConnected && remoteUid ? (
          <RtcSurfaceView
            canvas={{ uid: remoteUid }}
            style={styles.mainVideo}
            zOrderMediaOverlay={false}
          />
        ) : !isConnected && isVideoOn ? (
          /* Show local preview full screen while calling/ringing */
          <View style={styles.mainVideo}>
            <RtcSurfaceView
              canvas={{ uid: 0 }}
              style={styles.mainVideo}
              zOrderMediaOverlay={false}
            />
            <View style={styles.callingOverlay}>
              <View style={styles.doctorVideoPlaceholder}>
                <Ionicons name="person" size={80} color={Colors.white} />
              </View>
              <Text style={styles.callingStatusText}>
                {callStatus === "ringing" ? "Ringing..." : "Connecting..."}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.mainVideo}>
            <View style={styles.doctorVideoPlaceholder}>
              <Ionicons name="person" size={100} color={Colors.white} />
            </View>
          </View>
        )}

        {/* Local PIP Video Stream - when connected */}
        {isConnected && isVideoOn && (
          <View style={[styles.userVideoContainer, { top: insets.top + 60 }]}>
            <RtcSurfaceView
              canvas={{ uid: 0 }}
              style={styles.userVideo}
              zOrderMediaOverlay={true}
            />
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
                style={[
                  styles.audioOption,
                  audioDevice === "earpiece" && styles.audioOptionActive,
                ]}
                onPress={() => handleAudioRoute("earpiece")}
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={20}
                  color={audioDevice === "earpiece" ? Colors.white : Colors.black}
                />
                <Text
                  style={[
                    styles.audioOptionText,
                    audioDevice === "earpiece" && styles.audioOptionTextActive,
                  ]}
                >
                  Earpiece
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.audioOption,
                  audioDevice === "speaker" && styles.audioOptionActive,
                ]}
                onPress={() => handleAudioRoute("speaker")}
              >
                <Ionicons
                  name="volume-high"
                  size={20}
                  color={audioDevice === "speaker" ? Colors.white : Colors.black}
                />
                <Text
                  style={[
                    styles.audioOptionText,
                    audioDevice === "speaker" && styles.audioOptionTextActive,
                  ]}
                >
                  Speaker
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.audioOption,
                  audioDevice === "bluetooth" && styles.audioOptionActive,
                ]}
                onPress={() => handleAudioRoute("bluetooth")}
              >
                <Ionicons
                  name="bluetooth"
                  size={20}
                  color={audioDevice === "bluetooth" ? Colors.white : Colors.black}
                />
                <Text
                  style={[
                    styles.audioOptionText,
                    audioDevice === "bluetooth" && styles.audioOptionTextActive,
                  ]}
                >
                  Bluetooth
                </Text>
              </TouchableOpacity>
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
          style={[styles.controlButton, !isVideoOn && styles.disabledButton]}
          onPress={toggleVideo}
        >
          <Ionicons
            name={isVideoOn ? "videocam" : "videocam-off"}
            size={24}
            color={Colors.black}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={switchCamera}>
          <Ionicons name="camera-reverse" size={24} color={Colors.black} />
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

      <LoadingOverlay 
        visible={callStatus === "connecting"} 
        message="Please wait, connecting to the call..." 
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
  callingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  callingStatusText: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: Colors.white,
    marginTop: 16,
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
    zIndex: 20,
  },
  userVideo: {
    width: "100%",
    height: "100%",
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
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Sizes.xl,
    paddingVertical: Sizes.xl,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    gap: Sizes.md,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 30,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  endCallButton: {
    backgroundColor: "#F44336",
    width: 60,
    height: 60,
    borderRadius: 30,
  },
});
