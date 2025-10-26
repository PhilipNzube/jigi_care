import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import AddressSection from "../components/AddressSection";

export default function ShippingAddressScreen({ navigation }) {
  const handleProcessToPayment = () => {
    navigation.navigate("Payment");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shipping Address</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <AddressSection />
      </ScrollView>

      <TouchableOpacity
        style={styles.processButton}
        onPress={handleProcessToPayment}
      >
        <Text style={styles.processButtonText}>Process to Payment</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    backgroundColor: "#F8F8F8",
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
    paddingTop: Sizes.lg,
  },
  processButton: {
    backgroundColor: "#0098B3",
    marginHorizontal: Sizes.lg,
    marginBottom: Sizes.lg,
    paddingVertical: Sizes.md,
    borderRadius: 30,
    alignItems: "center",
  },
  processButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
  },
});
