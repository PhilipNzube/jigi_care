import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
} from "react-native";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";

export default function BookingConfirmationModal({
  visible,
  onClose,
  onBackToHome,
  bookingDetails,
}) {
  const { doctor, date, time, fee } = bookingDetails || {};

  const handleOverlayPress = () => {
    // Only close the modal, don't navigate
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleOverlayPress}
      >
        <TouchableOpacity
          style={styles.modal}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Image source={Images.booking} style={styles.icon} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Booking Scheduled</Text>
          <Text style={styles.subtitle}>
            Your consultation has been scheduled
          </Text>

          {/* Booking Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Doctor:</Text>
              <Text style={styles.detailValue}>
                {doctor || "Dr. Sarah Olukoya"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date & Time:</Text>
              <Text style={styles.detailValue}>
                {date && time
                  ? `${date} at ${time}`
                  : "Sep 18th, 2025. 10:00 AM"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fee:</Text>
              <Text style={styles.detailValue}>{fee || "₦4500"}</Text>
            </View>
          </View>

          {/* Button */}
          <TouchableOpacity style={styles.button} onPress={onBackToHome}>
            <Text style={styles.buttonText}>Back to Home</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Sizes.lg,
  },
  modal: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Sizes.xl,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: Sizes.lg,
  },
  icon: {
    width: 58,
    height: 58,
    borderRadius: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: Sizes.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666",
    marginBottom: Sizes.xl,
    textAlign: "center",
  },
  detailsContainer: {
    width: "100%",
    marginBottom: Sizes.xl,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.md,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    flex: 1,
    textAlign: "right",
  },
  button: {
    backgroundColor: "#0098B3",
    borderRadius: 30,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.xl,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
  },
});
