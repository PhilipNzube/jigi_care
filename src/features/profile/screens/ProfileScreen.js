import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import ProfileHeader from "../components/ProfileHeader";
import UserInfoCard from "../components/UserInfoCard";
import StatsCards from "../components/StatsCards";
import SecuritySection from "../components/SecuritySection";
import LogoutButton from "../components/LogoutButton";
import LogoutModal from "../modals/LogoutModal";

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleEditProfile = () => {
    navigation.navigate("EditProfile");
  };

  const handleSettings = () => {
    navigation.navigate("ProfileSettings");
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ImageBackground source={Images.bgImg} style={styles.backgroundImage}>
        <ProfileHeader onSettings={handleSettings} />
        <UserInfoCard onEdit={handleEditProfile} />
        <StatsCards />
      </ImageBackground>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <SecuritySection />
        <LogoutButton onPress={handleLogout} />
      </ScrollView>

      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          // Handle logout logic
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  backgroundImage: {
    height: 300,
  },
  content: {
    flex: 1,
    paddingHorizontal: Sizes.lg,
    paddingTop: Sizes.lg,
  },
});
