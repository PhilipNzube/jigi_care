import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";

// Import components
import PersonalizationForm from "../components/PersonalizationForm";
import HealthGoalsSection from "../components/HealthGoalsSection";
import PermissionsModal from "../components/PermissionsModal";
import DatePickerModal from "../components/DatePickerModal";
import GenderPickerModal from "../components/GenderPickerModal";
import LoadingButton from "../../../shared/components/LoadingButton";

const { width, height } = Dimensions.get("window");

export default function PersonalizationScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [currentPermission, setCurrentPermission] = useState("notifications");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) {
      startSpinning();
    } else {
      stopSpinning();
    }
  }, [isLoading]);

  const startSpinning = () => {
    spinValue.setValue(0);
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopSpinning = () => {
    spinValue.stopAnimation();
  };

  const handleGoalToggle = (goal) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleDateSelect = () => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const formattedDate = `${
      months[selectedDate.getMonth()]
    } ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;
    setDateOfBirth(formattedDate);
    setShowDatePicker(false);
  };

  const handleContinue = () => {
    if (!showPermissions) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setShowPermissions(true);
        setCurrentPermission("notifications");
      }, 2000);
    } else {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        navigation.navigate("MainApp");
      }, 2000);
    }
  };

  const handleSkip = () => {
    navigation.navigate("MainApp");
  };

  const handleNotificationAllow = () => {
    setCurrentPermission("location");
  };

  const handleNotificationSkip = () => {
    setCurrentPermission("location");
  };

  const handleLocationAllow = () => {
    setShowPermissions(false);
    navigation.navigate("MainApp");
  };

  const handleLocationSkip = () => {
    setShowPermissions(false);
    navigation.navigate("MainApp");
  };

  const handleGenderSelect = (selectedGender) => {
    setGender(selectedGender);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { paddingTop: insets.top + Sizes.lg }]}>
          {/* Header */}
          <Text style={styles.title}>Let's personalize your care</Text>
          <Text style={styles.description}>
            Just a few quick details to help us support your health journey.
          </Text>

          {/* Form Fields */}
          <PersonalizationForm
            gender={gender}
            dateOfBirth={dateOfBirth}
            showDatePicker={showDatePicker}
            onGenderPress={() => setShowGenderPicker(true)}
            onDatePress={() => setShowDatePicker(true)}
          />

          {/* Health Goals Section */}
          <HealthGoalsSection
            selectedGoals={selectedGoals}
            onGoalToggle={handleGoalToggle}
          />
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: insets.bottom + Sizes.lg },
        ]}
      >
        <LoadingButton
          title="Continue"
          onPress={handleContinue}
          isLoading={isLoading}
          disabled={isLoading}
          spinValue={spinValue}
          style={styles.continueButton}
        />

        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipButton}>Skip for now</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <GenderPickerModal
        visible={showGenderPicker}
        selectedGender={gender}
        onGenderSelect={handleGenderSelect}
        onClose={() => setShowGenderPicker(false)}
      />

      <DatePickerModal
        visible={showDatePicker}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        onClose={() => setShowDatePicker(false)}
      />

      <PermissionsModal
        visible={showPermissions}
        currentPermission={currentPermission}
        onNotificationAllow={handleNotificationAllow}
        onNotificationSkip={handleNotificationSkip}
        onLocationAllow={handleLocationAllow}
        onLocationSkip={handleLocationSkip}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Sizes.lg,
  },
  title: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Sizes.sm,
  },
  description: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Sizes.xl,
    lineHeight: 24,
  },
  bottomContainer: {
    paddingHorizontal: Sizes.lg,
    paddingTop: Sizes.lg,
  },
  continueButton: {
    marginBottom: Sizes.md,
  },
  skipButton: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
    textAlign: "center",
  },
});
