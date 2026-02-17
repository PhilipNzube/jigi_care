import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";
import Ionicons from "react-native-vector-icons/Ionicons";
import EndCallModal from "../components/EndCallModal";
import { getSocket, endCall } from "../services/chatService";

export default function VoiceCallPage({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { doctor, otherUserId } = route.params || {};
  const [showEndModal, setShowEndModal] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callStatus, setCallStatus] = useState("ringing"); // 'ringing' | 'connected'

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onAccepted = () => setCallStatus("connected");
    const onEnded = () => {
      setShowEndModal(false);
      navigation.goBack();
    };
    socket.on("call:accepted", onAccepted);
    socket.on("call:ended", onEnded);
    socket.on("call:rejected", onEnded);
    socket.on("call:no-answer", onEnded);
    return () => {
      socket.off("call:accepted", onAccepted);
      socket.off("call:ended", onEnded);
      socket.off("call:rejected", onEnded);
      socket.off("call:no-answer", onEnded);
    };
  }, [navigation]);

  const handleEndCall = () => {
    setShowEndModal(true);
  };

  const handleConfirmEnd = () => {
    setShowEndModal(false);
    if (otherUserId) endCall(otherUserId);
    navigation.goBack();
  };

  const handleContinueCall = () => {
    setShowEndModal(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const handleVideoCall = () => {
    navigation.navigate("VideoCall", { doctor });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.grey} />
        </TouchableOpacity>

        <View style={styles.doctorInfo}>
          <View style={styles.doctorAvatar}>
            <Ionicons name="person" size={16} color={Colors.primary} />
          </View>
          <Text style={styles.doctorName}>
            {doctor?.name || "Dr. Sarah Olukoya"}
          </Text>
        </View>

        <View style={styles.statusButton}>
          <Text style={styles.statusText}>
            {callStatus === "connected" ? "Connected" : "Ringing..."}
          </Text>
        </View>
      </SafeAreaView>

      <View style={styles.mainContent}>
        <View style={styles.doctorImageContainer}>
          <Ionicons name="person" size={80} color={Colors.white} />
        </View>

        <View style={styles.statusInfo}>
          <Text style={styles.timeText}>9:41</Text>
          <View style={styles.signalBars}>
            <View style={styles.signalBar} />
            <View style={styles.signalBar} />
            <View style={styles.signalBar} />
          </View>
        </View>
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
          style={styles.controlButton}
          onPress={handleVideoCall}
        >
          <Ionicons name="videocam" size={24} color={Colors.black} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.endCallButton]}
          onPress={handleEndCall}
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

        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="camera-reverse" size={24} color={Colors.black} />
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
  doctorImage: {
    width: 180,
    height: 180,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  statusInfo: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Sizes.xl,
  },
  timeText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
  },
  signalBars: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  signalBar: {
    width: 4,
    backgroundColor: Colors.white,
    marginLeft: 2,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: Sizes.xl,
    paddingVertical: Sizes.xl,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
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
  endCallButton: {
    backgroundColor: "#F44336",
  },
});
