import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import { Colors, Sizes, Fonts } from "../constants";

const { width, height } = Dimensions.get("window");

export default function LogoutCountdownModal({ visible, countdown }) {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [opacityAnim] = useState(new Animated.Value(0));
  const [progressAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Entry animation
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // Pulsing and progress movement
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.15,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(progressAnim, {
          toValue: (5 - countdown) / 5,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      opacityAnim.setValue(0);
      progressAnim.setValue(0);
    }
  }, [visible, countdown]);

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <View style={styles.glassContainer}>
          <View style={styles.header}>
            <Text style={styles.brandingText}>JIGI CARE</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>PROTECTED</Text>
            </View>
          </View>

          <View style={styles.mainContent}>
            <View style={styles.countdownRing}>
              {/* Outer ring represent progress */}
              <View style={styles.ringBase} />
              <Animated.Text 
                style={[
                  styles.countdownNumber, 
                  { 
                    transform: [{ scale: scaleAnim }],
                    color: countdown <= 2 ? Colors.error : Colors.primary 
                  }
                ]}
              >
                {countdown}
              </Animated.Text>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>System Logout</Text>
              <Text style={styles.message}>
                Declining the Privacy Policy prevents access to JIGI Care services. 
                Logging out to ensure your data remains secure.
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.progressBarBg}>
                <Animated.View 
                    style={[
                        styles.progressBarFill, 
                        { 
                            width: progressAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0%', '100%']
                            }),
                            backgroundColor: countdown <= 2 ? Colors.error : Colors.primary
                        }
                    ]} 
                />
            </View>
            <Text style={styles.footerText}>Secure Connection Active</Text>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 20, 30, 0.95)", // Deep dark professional overlay
    justifyContent: "center",
    alignItems: "center",
  },
  glassContainer: {
    backgroundColor: Colors.white,
    borderRadius: 30,
    width: width * 0.88,
    padding: Sizes.xl,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: Sizes.xxl,
  },
  brandingText: {
    fontSize: 14,
    fontFamily: Fonts.poppins.bold,
    color: Colors.textDisabled,
    letterSpacing: 3,
  },
  statusBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    paddingHorizontal: Sizes.sm,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.3)",
  },
  statusText: {
    fontSize: 10,
    fontFamily: Fonts.poppins.bold,
    color: Colors.success,
  },
  mainContent: {
    alignItems: "center",
    width: "100%",
  },
  countdownRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    marginBottom: Sizes.xl,
    borderWidth: 8,
    borderColor: "#F0F2F5",
  },
  countdownNumber: {
    fontSize: 72,
    fontFamily: Fonts.poppins.bold,
    textAlign: "center",
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontFamily: Fonts.poppins.bold,
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
  },
  message: {
    fontSize: 14,
    fontFamily: Fonts.poppins.regular,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: Sizes.sm,
  },
  footer: {
    width: "100%",
    marginTop: Sizes.xxl,
    alignItems: "center",
  },
  progressBarBg: {
    width: "100%",
    height: 6,
    backgroundColor: "#F0F2F5",
    borderRadius: 3,
    marginBottom: Sizes.sm,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  footerText: {
    fontSize: 11,
    fontFamily: Fonts.poppins.medium,
    color: Colors.textDisabled,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
});
