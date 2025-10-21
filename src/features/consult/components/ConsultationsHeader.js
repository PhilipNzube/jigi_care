import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

export default function ConsultationsHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Consultations</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
});
