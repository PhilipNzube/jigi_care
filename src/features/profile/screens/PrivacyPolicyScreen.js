import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function PrivacyPolicyScreen({ navigation }) {
  const sections = [
    {
      id: 1,
      title: "Introduction",
      content:
        "At Jiggy Care, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.",
    },
    {
      id: 2,
      title: "Information We Collect",
      content:
        "We collect information that you provide directly to us, including:\n\n• Personal identification information (name, email, phone number, date of birth)\n• Health and medical information (medical history, vital signs, lab results, prescriptions)\n• Payment information (processed securely through third-party payment processors)\n• Device information (device type, operating system, unique device identifiers)\n• Usage data (how you interact with our app, features used, time spent)",
    },
    {
      id: 3,
      title: "How We Use Your Information",
      content:
        "We use the information we collect to:\n\n• Provide, maintain, and improve our services\n• Process your medical consultations, lab test bookings, and medication orders\n• Send you important updates, notifications, and reminders\n• Personalize your experience and provide relevant health recommendations\n• Ensure the security and integrity of our services\n• Comply with legal obligations and protect our rights",
    },
    {
      id: 4,
      title: "Information Sharing and Disclosure",
      content:
        "We do not sell your personal information. We may share your information only in the following circumstances:\n\n• With healthcare providers (doctors, labs) to deliver services you request\n• With service providers who assist us in operating our app (under strict confidentiality agreements)\n• When required by law or to protect our rights and safety\n• With your explicit consent for any other purpose",
    },
    {
      id: 5,
      title: "Data Security",
      content:
        "We implement industry-standard security measures to protect your information:\n\n• Encryption of data in transit and at rest\n• Secure authentication and access controls\n• Regular security audits and updates\n• Compliance with healthcare data protection regulations (HIPAA, where applicable)\n\nHowever, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.",
    },
    {
      id: 6,
      title: "Your Rights",
      content:
        "You have the right to:\n\n• Access and review your personal information\n• Request corrections to inaccurate data\n• Request deletion of your account and data\n• Opt-out of certain communications\n• Withdraw consent for data processing\n• Request a copy of your data in a portable format",
    },
    {
      id: 7,
      title: "Data Retention",
      content:
        "We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Medical records may be retained longer as required by healthcare regulations. You can request deletion of your account at any time through the app settings.",
    },
    {
      id: 8,
      title: "Children's Privacy",
      content:
        "Our services are not intended for children under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.",
    },
    {
      id: 9,
      title: "Changes to This Policy",
      content:
        "We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the 'Last Updated' date. Your continued use of our services after such changes constitutes acceptance of the updated policy.",
    },
    {
      id: 10,
      title: "Contact Us",
      content:
        "If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:\n\nEmail: privacy@jiggycare.com\nPhone: +234 800 000 0000\nAddress: Jiggy Care, Lagos, Nigeria",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Text style={styles.lastUpdated}>Last Updated: December 30, 2025</Text>
        </View>

        {sections.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              <Text style={styles.sectionContent}>{section.content}</Text>
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using Jiggy Care, you acknowledge that you have read and understood this Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    backgroundColor: "#F5F5F5",
    position: "relative",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: Sizes.lg,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    flex: 1,
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: Sizes.lg,
  },
  introSection: {
    marginTop: Sizes.md,
    marginBottom: Sizes.lg,
  },
  lastUpdated: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    textAlign: "center",
  },
  section: {
    marginBottom: Sizes.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: Colors.textPrimary,
    marginBottom: Sizes.md,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionContent: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  footer: {
    marginTop: Sizes.lg,
    marginBottom: Sizes.xl,
    padding: Sizes.md,
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  footerText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});

