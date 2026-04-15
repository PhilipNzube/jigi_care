import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../constants";

const { height } = Dimensions.get("window");

export default function PrivacyPolicyModal({ visible, onAccept, onReject, isUnder18 }) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const handleScroll = ({ nativeEvent }) => {
    if (hasScrolledToBottom) return;

    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    // Check if user has reached the bottom (with a small buffer)
    const paddingToBottom = 20;
    const isAtBottom = 
      layoutMeasurement.height + contentOffset.y >= 
      contentSize.height - paddingToBottom;

    if (isAtBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const sections = [
    {
      title: "1. Introduction",
      content: "At Jigi Care, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services."
    },
    {
      title: "2. Information We Collect",
      content: "We collect information that you provide directly to us, including:\n\n• Personal identification information (name, email, phone number, date of birth)\n• Health and medical information (medical history, vital signs, lab results, prescriptions)\n• Payment information (processed securely through third-party processors)\n• Device information and Usage data"
    },
    {
      title: "3. Children's Privacy",
      content: "Patients under the age of 18 are not permitted to use the platform independently. A parent or legal guardian must provide explicit consent and manage the account for any user under the age of 18. If you believe we have collected information from a child without parental consent, please contact us immediately."
    },
    {
      title: "4. Information Sharing",
      content: "We do not sell your personal information. We share data only with healthcare providers (doctors, labs) to deliver services, or when required by law."
    },
    {
      title: "5. Data Security",
      content: "We implement industry-standard security measures including encryption of data in transit and at rest, and secure authentication controls."
    },
    {
      title: "6. Your Rights",
      content: "You have the right to access, review, and request corrections to your personal information, or request deletion of your account and data."
    },
    {
      title: "7. Contact Us",
      content: "If you have questions regarding this policy, contact us:\n\nEmail: privacy@jigicare.com\nPhone: +234 800 000 0000"
    }
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text 
            style={styles.title}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            allowFontScaling={true}
          >
            Privacy Policy Update
          </Text>
          <Text 
            style={styles.subtitle}
            numberOfLines={2}
            adjustsFontSizeToFit={true}
          >
            Please review and accept our updated Privacy Policy to continue using Jigi Care.
          </Text>

          {isUnder18 && (
            <View style={styles.ageWarning}>
              <Ionicons name="information-circle" size={18} color="#FF9800" />
              <Text 
                style={styles.ageWarningText}
                numberOfLines={2}
                adjustsFontSizeToFit={true}
              >
                As you are under 18, parental consent is required to access our services.
              </Text>
            </View>
          )}

          <ScrollView 
            style={styles.content} 
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={true}
          >
            {sections.map((section, index) => (
              <View key={index} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.text}>{section.content}</Text>
              </View>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.rejectButton} 
              onPress={onReject}
            >
              <Text 
                style={styles.rejectButtonText}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.7}
              >
                Decline
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.acceptButton,
                !hasScrolledToBottom && styles.acceptButtonDisabled
              ]} 
              onPress={onAccept}
              disabled={!hasScrolledToBottom}
            >
              <Text 
                style={styles.acceptButtonText}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.6}
              >
                {isUnder18 ? "Request Consent" : "Accept & Continue"}
              </Text>
            </TouchableOpacity>
          </View>
          {!hasScrolledToBottom && (
            <Text 
              style={styles.scrollNotice}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              Please scroll down to read and accept
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: Sizes.lg,
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    width: "100%",
    maxHeight: height * 0.82,
    padding: Sizes.lg,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Sizes.xs,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Sizes.sm,
    paddingHorizontal: Sizes.sm,
  },
  ageWarning: {
    flexDirection: "row",
    backgroundColor: "#FFF3E0",
    padding: Sizes.sm,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: Sizes.sm,
  },
  ageWarningText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#E65100",
    marginLeft: Sizes.xs,
  },
  content: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: Sizes.md,
    marginBottom: Sizes.md,
  },
  section: {
    marginBottom: Sizes.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  text: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Sizes.md,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: Sizes.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    height: 54,
  },
  rejectButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
    width: "90%",
    textAlign: "center",
  },
  acceptButton: {
    flex: 2,
    paddingVertical: Sizes.md,
    borderRadius: 12,
    backgroundColor: "#0098B3",
    alignItems: "center",
    justifyContent: "center",
    height: 54,
  },
  acceptButtonDisabled: {
    backgroundColor: "#B0BEC5",
  },
  acceptButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
    width: "95%",
    textAlign: "center",
  },
  scrollNotice: {
    fontSize: 11,
    color: Colors.error,
    textAlign: "center",
    marginTop: Sizes.xs,
    fontFamily: "Poppins-Regular",
  },
});
