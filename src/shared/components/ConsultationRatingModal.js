import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../constants";

export default function ConsultationRatingModal({ visible, onSkip, onSubmit, doctorName }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity 
            key={star} 
            onPress={() => setRating(star)}
            style={styles.star}
          >
            <Ionicons 
              name={star <= rating ? "star" : "star-outline"} 
              size={36} 
              color={star <= rating ? "#FFD700" : "#BDBDBD"} 
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit({ rating, feedback });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onSkip}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>

          <Text style={styles.title}>Rate Your Consultation</Text>
          <Text style={styles.subtitle}>
            How was your experience with {doctorName || "your doctor"}?
          </Text>

          {renderStars()}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Tell us more about your experience (optional)"
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={4}
              value={feedback}
              onChangeText={setFeedback}
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={rating === 0}
          >
            <Text style={styles.submitButtonText}>Submit Feedback</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
            <Text style={styles.skipButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Sizes.lg,
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    width: "100%",
    padding: Sizes.xl,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: Sizes.md,
    right: Sizes.md,
    padding: Sizes.xs,
  },
  title: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginTop: Sizes.md,
    marginBottom: Sizes.xs,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Sizes.xl,
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: Sizes.xl,
  },
  star: {
    paddingHorizontal: Sizes.xs,
  },
  inputContainer: {
    width: "100%",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: Sizes.md,
    marginBottom: Sizes.xl,
  },
  textInput: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textPrimary,
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    width: "100%",
    paddingVertical: Sizes.md,
    backgroundColor: "#0098B3",
    borderRadius: 12,
    alignItems: "center",
    marginBottom: Sizes.md,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
  },
  skipButton: {
    paddingVertical: Sizes.sm,
  },
  skipButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
  },
});
