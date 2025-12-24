import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

export default function BookNowButton({ doctor, onPress, navigation }) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (navigation) {
      navigation.navigate("BookConsultation", { doctor });
    }
  };

  const doctorName = doctor?.name || "Doctor";

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <Text style={styles.buttonText}>Book Consultation</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#0098B3",
    borderRadius: 50,
    paddingVertical: Sizes.md,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
  },
});
