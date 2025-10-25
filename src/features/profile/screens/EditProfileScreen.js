import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import EditProfileHeader from "../components/EditProfileHeader";
import ProfilePictureSection from "../components/ProfilePictureSection";
import StatsSection from "../components/StatsSection";
import ProfileFieldsList from "../components/ProfileFieldsList";
import UpdateDataModal from "../modals/UpdateDataModal";
import UpdateNameModal from "../modals/UpdateNameModal";
import UpdateEmailModal from "../modals/UpdateEmailModal";
import UpdatePhoneModal from "../modals/UpdatePhoneModal";
import UpdateAddressModal from "../modals/UpdateAddressModal";
import EmergencyContactModal from "../modals/EmergencyContactModal";
import ChangePasswordModal from "../modals/ChangePasswordModal";
import DatePickerModal from "../modals/DatePickerModal";

export default function EditProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [showUpdateDataModal, setShowUpdateDataModal] = useState(false);
  const [showUpdateNameModal, setShowUpdateNameModal] = useState(false);
  const [showUpdateEmailModal, setShowUpdateEmailModal] = useState(false);
  const [showUpdatePhoneModal, setShowUpdatePhoneModal] = useState(false);
  const [showUpdateAddressModal, setShowUpdateAddressModal] = useState(false);
  const [showEmergencyContactModal, setShowEmergencyContactModal] =
    useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);

  const handleFieldPress = (field) => {
    switch (field) {
      case "weight":
      case "height":
      case "bloodType":
        setShowUpdateDataModal(true);
        break;
      case "fullName":
        setShowUpdateNameModal(true);
        break;
      case "email":
        setShowUpdateEmailModal(true);
        break;
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
        setShowChangePasswordModal(true);
        break;
      case "dateOfBirth":
      case "gender":
        setShowDatePickerModal(true);
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
        <EditProfileHeader />
        <ProfilePictureSection />
        <StatsSection />

        <View style={styles.content}>
          <ProfileFieldsList onFieldPress={handleFieldPress} />
        </View>
      </ScrollView>

      <UpdateDataModal
        visible={showUpdateDataModal}
        onClose={() => setShowUpdateDataModal(false)}
      />

      <UpdateNameModal
        visible={showUpdateNameModal}
        onClose={() => setShowUpdateNameModal(false)}
      />

      <UpdateEmailModal
        visible={showUpdateEmailModal}
        onClose={() => setShowUpdateEmailModal(false)}
      />

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

      <ChangePasswordModal
        visible={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />

      <DatePickerModal
        visible={showDatePickerModal}
        onClose={() => setShowDatePickerModal(false)}
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
