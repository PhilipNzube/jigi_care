import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { showSuccess, showError } from "../../../shared/utils/toast";
import LoadingOverlay from "../../../shared/components/LoadingOverlay";

export default function ReportProblemScreen({ navigation }) {
  const [problemType, setProblemType] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const problemTypes = [
    { id: "bug", label: "Bug/Technical Issue", icon: "bug-outline" },
    { id: "feature", label: "Feature Request", icon: "bulb-outline" },
    { id: "performance", label: "Performance Issue", icon: "speedometer-outline" },
    { id: "other", label: "Other", icon: "ellipsis-horizontal-outline" },
  ];

  const handleSubmit = async () => {
    if (!problemType) {
      showError("Please select a problem type");
      return;
    }
    if (!description.trim()) {
      showError("Please describe the problem");
      return;
    }
    if (!email.trim()) {
      showError("Please enter your email address");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      showSuccess("Problem reported successfully. We'll get back to you soon!");
      navigation.goBack();
    } catch (error) {
      showError("Unable to submit report. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report a Problem</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What type of problem are you experiencing?</Text>
            <View style={styles.card}>
              {problemTypes.map((type, index) => (
                <View key={type.id}>
                  <TouchableOpacity
                    style={[
                      styles.typeItem,
                      problemType === type.id && styles.typeItemSelected,
                    ]}
                    onPress={() => setProblemType(type.id)}
                  >
                    <View style={styles.typeItemLeft}>
                      <View
                        style={[
                          styles.iconContainer,
                          problemType === type.id && styles.iconContainerSelected,
                        ]}
                      >
                        <Ionicons
                          name={type.icon}
                          size={24}
                          color={problemType === type.id ? Colors.white : Colors.primary}
                        />
                      </View>
                      <Text
                        style={[
                          styles.typeLabel,
                          problemType === type.id && styles.typeLabelSelected,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </View>
                    {problemType === type.id && (
                      <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                  {index < problemTypes.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Describe the problem</Text>
            <View style={styles.card}>
              <TextInput
                style={styles.textArea}
                placeholder="Please provide as much detail as possible about the issue you're experiencing..."
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={8}
                value={description}
                onChangeText={setDescription}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Email (Optional)</Text>
            <Text style={styles.sectionDescription}>
              We'll use this to follow up on your report
            </Text>
            <View style={styles.card}>
              <TextInput
                style={styles.input}
                placeholder="your.email@example.com"
                placeholderTextColor={Colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>Submit Report</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={isSubmitting} />
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Sizes.lg,
  },
  section: {
    marginBottom: Sizes.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    marginBottom: Sizes.md,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  typeItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.md,
    borderRadius: 8,
  },
  typeItemSelected: {
    backgroundColor: "#0098B314",
  },
  typeItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0098B314",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.md,
  },
  iconContainerSelected: {
    backgroundColor: Colors.primary,
  },
  typeLabel: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
  },
  typeLabelSelected: {
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginLeft: Sizes.md,
  },
  textArea: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textPrimary,
    minHeight: 120,
    padding: Sizes.md,
    textAlignVertical: "top",
  },
  input: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textPrimary,
    padding: Sizes.md,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Sizes.xl,
    marginTop: Sizes.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.white,
  },
});

