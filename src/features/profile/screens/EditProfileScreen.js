import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  BackHandler,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import EditProfileHeader from "../components/EditProfileHeader";
import ProfilePictureSection from "../components/ProfilePictureSection";
import CombinedProfileSection from "../components/CombinedProfileSection";
import UpdateDataModal from "../modals/UpdateDataModal";
import UpdateNameModal from "../modals/UpdateNameModal";
// import UpdateEmailModal from "../modals/UpdateEmailModal";
import UpdatePhoneModal from "../modals/UpdatePhoneModal";
import UpdateAddressModal from "../modals/UpdateAddressModal";
import EmergencyContactModal from "../modals/EmergencyContactModal";
import ChangePasswordModal from "../modals/ChangePasswordModal";
import ChangePasswordEmailModal from "../modals/ChangePasswordEmailModal";
import DatePickerModal from "../modals/DatePickerModal";
import GenderModal from "../modals/GenderModal";
import { useAuth } from "../../../shared/context/AuthContext";

export default function EditProfileScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [showUpdateDataModal, setShowUpdateDataModal] = useState(false);
  const [showUpdateNameModal, setShowUpdateNameModal] = useState(false);
  // const [showUpdateEmailModal, setShowUpdateEmailModal] = useState(false);
  const [showUpdatePhoneModal, setShowUpdatePhoneModal] = useState(false);
  const [showUpdateAddressModal, setShowUpdateAddressModal] = useState(false);
  const [showEmergencyContactModal, setShowEmergencyContactModal] =
    useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showChangePasswordEmailModal, setShowChangePasswordEmailModal] =
    useState(false);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [passwordResetOTP, setPasswordResetOTP] = useState(null);

  // Check if we're returning from OTP verification
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.passwordResetOTP) {
        setPasswordResetOTP(route.params.passwordResetOTP);
        setShowChangePasswordModal(true);
        // Clear the param to avoid showing it again
        navigation.setParams({ passwordResetOTP: undefined });
      }
    }, [route.params, navigation])
  );

  // Handle Android back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (Platform.OS === "android") {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            // Navigate to Profile if there's no previous screen
            navigation.navigate("BottomTabs", { screen: "profile" });
          }
          return true; // Prevent default back behavior
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [navigation])
  );

  const handleFieldPress = (field) => {
    switch (field) {
      case "weight":
      case "height":
      case "bloodType":
        setSelectedField(field);
        setShowUpdateDataModal(true);
        break;
      case "fullName":
        setShowUpdateNameModal(true);
        break;
      // case "email":
      //   setShowUpdateEmailModal(true);
      //   break;
      case "phoneNumber":
        setShowUpdatePhoneModal(true);
        break;
      case "address":
        setShowUpdateAddressModal(true);
        break;
      case "emergencyContact":
        setShowEmergencyContactModal(true);
        break;
      case "changePassword":
        setShowChangePasswordEmailModal(true);
        break;
      case "dateOfBirth":
        setShowDatePickerModal(true);
        break;
      case "gender":
        setShowGenderModal(true);
        break;
      default:
        break;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <EditProfileHeader navigation={navigation} />
        <ProfilePictureSection />

        <View style={styles.content}>
          <CombinedProfileSection onFieldPress={handleFieldPress} />
        </View>
      </ScrollView>

      <UpdateDataModal
        visible={showUpdateDataModal}
        onClose={() => {
          setShowUpdateDataModal(false);
          setSelectedField(null);
        }}
        field={selectedField}
      />

      <UpdateNameModal
        visible={showUpdateNameModal}
        onClose={() => setShowUpdateNameModal(false)}
      />

      {/* <UpdateEmailModal
        visible={showUpdateEmailModal}
        onClose={() => setShowUpdateEmailModal(false)}
      /> */}

      <UpdatePhoneModal
        visible={showUpdatePhoneModal}
        onClose={() => setShowUpdatePhoneModal(false)}
      />

      <UpdateAddressModal
        visible={showUpdateAddressModal}
        onClose={() => setShowUpdateAddressModal(false)}
      />

      <EmergencyContactModal
        visible={showEmergencyContactModal}
        onClose={() => setShowEmergencyContactModal(false)}
      />

      <ChangePasswordEmailModal
        visible={showChangePasswordEmailModal}
        onClose={() => setShowChangePasswordEmailModal(false)}
        onVerify={(email) => {
          setShowChangePasswordEmailModal(false);
          // Navigate to OTP verification screen
          navigation.navigate("EmailVerification", {
            email,
            from: "changePassword",
            returnScreen: "EditProfile",
          });
        }}
      />

      <ChangePasswordModal
        visible={showChangePasswordModal}
        onClose={() => {
          setShowChangePasswordModal(false);
          setPasswordResetOTP(null);
        }}
        otp={passwordResetOTP}
        email={user?.email}
      />

      <DatePickerModal
        visible={showDatePickerModal}
        onClose={() => setShowDatePickerModal(false)}
      />

      <GenderModal
        visible={showGenderModal}
        onClose={() => setShowGenderModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Sizes.lg,
    paddingTop: Sizes.lg,
    paddingBottom: Sizes.xl,
  },
});
