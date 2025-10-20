import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

export default function PermissionsModal({
  visible,
  currentPermission,
  onNotificationAllow,
  onNotificationSkip,
  onLocationAllow,
  onLocationSkip,
}) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.permissionsOverlay}>
        <View style={styles.permissionsContainer}>
          {currentPermission === "notifications" && (
            <View style={styles.permissionCard}>
              <Text style={styles.permissionTitle}>Stay Updated</Text>
              <Text style={styles.permissionDescription}>
                Get reminders for appointments and health tips.
              </Text>
              <View style={styles.permissionActions}>
                <TouchableOpacity
                  style={styles.allowButton}
                  onPress={onNotificationAllow}
                >
                  <Text style={styles.allowButtonText}>Allow</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={onNotificationSkip}
                >
                  <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {currentPermission === "location" && (
            <View style={styles.permissionCard}>
              <Text style={styles.permissionTitle}>Find Nearby Care</Text>
              <Text style={styles.permissionDescription}>
                Enable location to connect with pharmacies and labs around you.
              </Text>
              <View style={styles.permissionActions}>
                <TouchableOpacity
                  style={styles.allowButton}
                  onPress={onLocationAllow}
                >
                  <Text style={styles.allowButtonText}>Allow</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={onLocationSkip}
                >
                  <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  permissionsOverlay: {
    flex: 1,
    backgroundColor: "#2C2C2C",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Sizes.lg,
  },
  permissionsContainer: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  permissionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Sizes.xl,
    marginBottom: Sizes.lg,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  permissionTitle: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
  },
  permissionDescription: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    marginBottom: Sizes.xl,
    lineHeight: 22,
  },
  permissionActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  allowButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.xl,
    borderRadius: 50,
    flex: 0.4,
    alignItems: "center",
  },
  allowButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.white,
  },
  skipButton: {
    backgroundColor: Colors.white,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.xl,
    borderRadius: 50,
    flex: 0.5,
    alignItems: "center",
  },
  skipText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
  },
});
