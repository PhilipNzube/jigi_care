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

export default function HelpSupportScreen({ navigation }) {
  const helpItems = [
    {
      id: 1,
      title: "Report a Problem",
      icon: "bug-outline",
      description: "Report bugs or issues",
      screen: "ReportProblem",
    },
    {
      id: 2,
      title: "Privacy Policy",
      icon: "shield-checkmark-outline",
      description: "Learn about our privacy practices",
      screen: "PrivacyPolicy",
    },
  ];

  const handleItemPress = (item) => {
    if (item.screen) {
      navigation.navigate(item.screen);
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
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Help</Text>
          <View style={styles.card}>
            {helpItems.map((item, index) => (
              <View key={item.id}>
                <TouchableOpacity
                  style={styles.helpItem}
                  onPress={() => handleItemPress(item)}
                >
                  <View style={styles.helpItemLeft}>
                    <View style={styles.iconContainer}>
                      <Ionicons name={item.icon} size={24} color={Colors.primary} />
                    </View>
                    <View style={styles.helpItemText}>
                      <Text style={styles.helpItemTitle}>{item.title}</Text>
                      <Text style={styles.helpItemDescription}>
                        {item.description}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
                {index < helpItems.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
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
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
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
  helpItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.md,
  },
  helpItemLeft: {
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
  helpItemText: {
    flex: 1,
  },
  helpItemTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  helpItemDescription: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginLeft: Sizes.md,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.md,
  },
  contactText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textPrimary,
    marginLeft: Sizes.md,
  },
});

