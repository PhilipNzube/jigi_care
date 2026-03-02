import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { getBiometricEnabled, storeBiometricEnabled } from "../../../shared/utils/storage";

export default function SecuritySection() {
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadBiometricPreference = async () => {
      const enabled = await getBiometricEnabled();
      setIsBiometricEnabled(enabled);
      animatedValue.setValue(enabled ? 1 : 0);
    };
    loadBiometricPreference();
  }, []);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isBiometricEnabled ? 1 : 0,
      duration: 250,
      useNativeDriver: false, // Color and Layout properties don't support native driver well for this use case
    }).start();
  }, [isBiometricEnabled]);

  const toggleBiometric = async () => {
    const newValue = !isBiometricEnabled;
    setIsBiometricEnabled(newValue);
    await storeBiometricEnabled(newValue);
  };

  const toggleBackgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E0E0E0", Colors.primary],
  });

  const thumbPosition = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22], // 50 (width) - 26 (thumb width) - 2 (spacing) = 22
  });

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.content}>
          <TouchableOpacity style={styles.securityItem} onPress={toggleBiometric} activeOpacity={0.7}>
            <View style={styles.iconContainer}>
              <Ionicons name="finger-print" size={20} color="#0098B3" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Biometric Log in</Text>
              <Text style={styles.subtitle}>Use fingerprint or face id</Text>
            </View>
            <View style={styles.toggleContainer}>
              <Animated.View style={[styles.toggleBase, { backgroundColor: toggleBackgroundColor }]}>
                <Animated.View style={[styles.toggleThumb, { left: thumbPosition }]} />
              </Animated.View>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.securityItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark" size={20} color="#E91E63" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Data Encryption</Text>
              <Text style={styles.subtitle}>HIPAA compliant encryption</Text>
            </View>
            <View style={styles.activeTag}>
              <Text style={styles.activeText}>Active</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginLeft: Sizes.sm,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.sm,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  content: {
    padding: Sizes.md,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
  },
  securityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Sizes.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 152, 179, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666666",
  },
  toggleContainer: {
    marginLeft: Sizes.sm,
  },
  toggleBase: {
    width: 50,
    height: 30,
    borderRadius: 15,
    position: "relative",
    justifyContent: "center",
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.white,
    position: "absolute",
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  activeTag: {
    backgroundColor: "#E0F7FA",
    paddingHorizontal: Sizes.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeText: {
    color: "#0098B3",
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: Sizes.sm,
  },
});
