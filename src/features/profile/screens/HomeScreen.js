import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import { Colors, Sizes } from "../../../shared/constants";
import Card from "../../../shared/components/Card";
import Button from "../../../shared/components/Button";
import { Images } from "../../../shared/utils/imageUtils";

export default function HomeScreen({ navigation }) {
  const features = [
    {
      id: 1,
      title: "Profile",
      description: "View and edit your profile",
      icon: "user",
      onPress: () => navigation.navigate("Profile"),
    },
    {
      id: 2,
      title: "Health Records",
      description: "Track your health data",
      icon: "heart",
      onPress: () => console.log("Health Records pressed"),
    },
    {
      id: 3,
      title: "Appointments",
      description: "Schedule and manage appointments",
      icon: "calendar",
      onPress: () => console.log("Appointments pressed"),
    },
    {
      id: 4,
      title: "Medications",
      description: "Track your medications",
      icon: "medicine",
      onPress: () => console.log("Medications pressed"),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <Image source={Images.appIcon} style={styles.logo} />
          <Text style={styles.title}>Welcome to JijiCare</Text>
          <Text style={styles.subtitle}>Your health companion</Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresContainer}>
          {features.map((feature) => (
            <Card key={feature.id} style={styles.featureCard}>
              <TouchableOpacity
                style={styles.featureButton}
                onPress={feature.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.featureIconContainer}>
                  <Image
                    source={Images[feature.icon] || Images.placeholder}
                    style={styles.featureIcon}
                  />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </TouchableOpacity>
            </Card>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <Button
            title="Quick Health Check"
            variant="primary"
            size="lg"
            onPress={() => console.log("Quick Health Check pressed")}
            style={styles.actionButton}
          />
          <Button
            title="Emergency Contact"
            variant="outline"
            size="lg"
            onPress={() => console.log("Emergency Contact pressed")}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Sizes.md,
  },
  header: {
    alignItems: "center",
    marginBottom: Sizes.xl,
    paddingTop: Sizes.lg,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: Sizes.md,
    // Note: You'll need to add actual logo images
  },
  title: {
    fontSize: Sizes.fontSize.title,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: Sizes.fontSize.lg,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  featuresContainer: {
    flex: 1,
    marginBottom: Sizes.xl,
  },
  featureCard: {
    marginBottom: Sizes.md,
  },
  featureButton: {
    alignItems: "center",
    padding: Sizes.sm,
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Sizes.md,
  },
  featureIcon: {
    width: 32,
    height: 32,
    tintColor: Colors.primary,
  },
  featureTitle: {
    fontSize: Sizes.fontSize.lg,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
    textAlign: "center",
  },
  featureDescription: {
    fontSize: Sizes.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  actionContainer: {
    paddingBottom: Sizes.lg,
  },
  actionButton: {
    marginBottom: Sizes.md,
  },
});
