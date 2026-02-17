import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function ContactUsScreen({ navigation }) {
  // Report a problem - commented out per requirement
  // const helpItems = [
  //   { id: 1, title: "Report a Problem", icon: "bug-outline", screen: "ReportProblem" },
  // ];

  const handlePhonePress = () => {
    Linking.openURL(`tel:08069407850`);
  };

  const handleEmailPress = () => {
    Linking.openURL(`mailto:Jigicareltd@gmail.com`);
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
        <Text style={styles.headerTitle}>Contact Us</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={handlePhonePress}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="call-outline" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.contactText}>08069407850</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.contactItem}
              onPress={handleEmailPress}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="mail-outline" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.contactText}>Jigicareltd@gmail.com</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <View style={styles.contactItem}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="location-outline"
                  size={24}
                  color={Colors.primary}
                />
              </View>
              <Text style={styles.contactText}>
                D4/4 Irewolede Estate, Ilawe road,{"\n"}Ado-Ekiti, Ekiti State
              </Text>
            </View>
          </View>
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
  section: {
    marginBottom: Sizes.xl,
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
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.md,
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
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginLeft: Sizes.md,
  },
  contactText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textPrimary,
    marginLeft: Sizes.md,
    flex: 1,
    paddingRight: Sizes.sm,
  },
});
