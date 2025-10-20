import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";

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
  const [currentPermission, setCurrentPermission] = useState("notifications"); // "notifications" or "location"
  const [selectedDate, setSelectedDate] = useState(new Date());

  const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];

  const spinValue = useRef(new Animated.Value(0)).current;

  // Health goals data
  const healthGoals = [
    "Consult a doctor",
    "Order Medication",
    "Track my health",
    "Book Lab Test",
    "Manage Stress",
    "Stay Healthy & Prevent illness",
  ];

  // Date picker data
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
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from(
    { length: 100 },
    (_, i) => new Date().getFullYear() - 18 - i
  );

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
    const formattedDate = `${
      months[selectedDate.getMonth()]
    } ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;
    setDateOfBirth(formattedDate);
    setShowDatePicker(false);
  };

  const handleContinue = () => {
    if (!showPermissions) {
      // First continue - show permissions modal
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setShowPermissions(true);
        setCurrentPermission("notifications");
      }, 2000);
    } else {
      // Second continue - go to home
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
    // Handle notification permission - move to location permission
    setCurrentPermission("location");
  };

  const handleNotificationSkip = () => {
    // Skip notification permission - move to location permission
    setCurrentPermission("location");
  };

  const handleLocationAllow = () => {
    // Handle location permission - go to home
    setShowPermissions(false);
    navigation.navigate("MainApp");
  };

  const handleLocationSkip = () => {
    // Skip location permission - go to home
    setShowPermissions(false);
    navigation.navigate("MainApp");
  };

  const renderGenderPicker = () => (
    <Modal
      visible={showGenderPicker}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowGenderPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.pickerTitle}>Select Gender</Text>
            <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pickerContent}>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.pickerOption,
                  gender === option && styles.selectedPickerOption,
                ]}
                onPress={() => {
                  setGender(option);
                  setShowGenderPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    gender === option && styles.selectedPickerOptionText,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderPermissionsModal = () => (
    <Modal
      visible={showPermissions}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowPermissions(false)}
    >
      <View style={styles.permissionsOverlay}>
        <View style={styles.permissionsContainer}>
          {currentPermission === "notifications" && (
            <View style={styles.permissionCard}>
              <Text style={styles.permissionTitle}>Stay Updated</Text>
              <Text style={styles.permissionDescription}>
                Get reminders for appointments and health tips.
              </Text>
              <View style={styles.permissionActions}>
                <TouchableOpacity
                  style={styles.allowButton}
                  onPress={handleNotificationAllow}
                >
                  <Text style={styles.allowButtonText}>Allow</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleNotificationSkip}
                >
                  <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {currentPermission === "location" && (
            <>
              <View style={styles.permissionCard}>
                <Text style={styles.permissionTitle}>Find Nearby Care</Text>
                <Text style={styles.permissionDescription}>
                  Enable location to connect with pharmacies and labs around
                  you.
                </Text>
                <View style={styles.permissionActions}>
                  <TouchableOpacity
                    style={styles.allowButton}
                    onPress={handleLocationAllow}
                  >
                    <Text style={styles.allowButtonText}>Allow</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleLocationSkip}
                  >
                    <Text style={styles.skipText}>Skip</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderDatePicker = () => (
    <Modal
      visible={showDatePicker}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowDatePicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.datePickerContainer}>
          <View style={styles.datePickerHeader}>
            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.datePickerTitle}>Date of Birth</Text>
            <TouchableOpacity onPress={handleDateSelect}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.datePickerContent}>
            <View style={styles.dateColumn}>
              <Text style={styles.columnLabel}>Month</Text>
              <ScrollView
                style={styles.dateScrollView}
                showsVerticalScrollIndicator={false}
                snapToInterval={40}
                decelerationRate="fast"
              >
                {months.map((month, index) => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.dateOption,
                      selectedDate.getMonth() === index &&
                        styles.selectedDateOption,
                    ]}
                    onPress={() =>
                      setSelectedDate((prev) => {
                        const newDate = new Date(prev);
                        newDate.setMonth(index);
                        return newDate;
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.dateOptionText,
                        selectedDate.getMonth() === index &&
                          styles.selectedDateOptionText,
                      ]}
                    >
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.dateColumn}>
              <Text style={styles.columnLabel}>Day</Text>
              <ScrollView
                style={styles.dateScrollView}
                showsVerticalScrollIndicator={false}
                snapToInterval={40}
                decelerationRate="fast"
              >
                {days.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dateOption,
                      selectedDate.getDate() === day &&
                        styles.selectedDateOption,
                    ]}
                    onPress={() =>
                      setSelectedDate((prev) => {
                        const newDate = new Date(prev);
                        newDate.setDate(day);
                        return newDate;
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.dateOptionText,
                        selectedDate.getDate() === day &&
                          styles.selectedDateOptionText,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.dateColumn}>
              <Text style={styles.columnLabel}>Year</Text>
              <ScrollView
                style={styles.dateScrollView}
                showsVerticalScrollIndicator={false}
                snapToInterval={40}
                decelerationRate="fast"
              >
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.dateOption,
                      selectedDate.getFullYear() === year &&
                        styles.selectedDateOption,
                    ]}
                    onPress={() =>
                      setSelectedDate((prev) => {
                        const newDate = new Date(prev);
                        newDate.setFullYear(year);
                        return newDate;
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.dateOptionText,
                        selectedDate.getFullYear() === year &&
                          styles.selectedDateOptionText,
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

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
          <View style={styles.formContainer}>
            {/* Gender Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Gender</Text>
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setShowGenderPicker(true)}
              >
                <View style={styles.inputIcon}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={Colors.textSecondary}
                  />
                </View>
                <Text
                  style={[styles.textInput, !gender && styles.placeholderText]}
                >
                  {gender || "Select Gender"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Date of Birth Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Date of Birth</Text>
              <TouchableOpacity
                style={[
                  styles.inputContainer,
                  showDatePicker && styles.inputContainerActive,
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.inputIcon}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={Colors.textSecondary}
                  />
                </View>
                <Text
                  style={[
                    styles.textInput,
                    !dateOfBirth && styles.placeholderText,
                  ]}
                >
                  {dateOfBirth || "Select Date"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
              <Text style={styles.optionalText}>
                (Optional) You can update later in your profile
              </Text>
            </View>
          </View>

          {/* Health Goals Section */}
          <View style={styles.goalsContainer}>
            <Text style={styles.goalsTitle}>Health Goals</Text>
            <View style={styles.goalsGrid}>
              {healthGoals.map((goal, index) => (
                <TouchableOpacity
                  key={goal}
                  style={[
                    styles.goalButton,
                    selectedGoals.includes(goal) && styles.goalButtonSelected,
                  ]}
                  onPress={() => handleGoalToggle(goal)}
                >
                  <Text
                    style={[
                      styles.goalButtonText,
                      selectedGoals.includes(goal) &&
                        styles.goalButtonTextSelected,
                    ]}
                  >
                    {goal}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: insets.bottom + Sizes.lg },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.continueButton,
            isLoading && styles.continueButtonLoading,
          ]}
          onPress={handleContinue}
          disabled={isLoading}
        >
          {isLoading ? (
            <Animated.Image
              source={Images.loader}
              style={[
                styles.loadingImage,
                {
                  transform: [
                    {
                      rotate: spinValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                  ],
                },
              ]}
            />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipButton}>Skip for now</Text>
        </TouchableOpacity>
      </View>

      {renderGenderPicker()}
      {renderDatePicker()}
      {renderPermissionsModal()}
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
    textAlign: "left",
    marginBottom: Sizes.sm,
  },
  description: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    textAlign: "left",
    marginBottom: Sizes.xl,
    lineHeight: 24,
  },
  formContainer: {
    marginBottom: Sizes.xl,
  },
  fieldContainer: {
    marginBottom: Sizes.lg,
  },
  fieldLabel: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Sizes.md,
  },
  inputContainerActive: {
    borderBottomColor: Colors.primary,
  },
  inputIcon: {
    marginRight: Sizes.md,
  },
  textInput: {
    flex: 1,
    fontSize: Sizes.fontSize.md,
    fontFamily: "Poppins-Regular",
    color: Colors.textPrimary,
  },
  placeholderText: {
    color: Colors.textSecondary,
  },
  optionalText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    fontStyle: "italic",
    marginTop: Sizes.xs,
  },
  goalsContainer: {
    marginBottom: Sizes.xl,
  },
  goalsTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.md,
  },
  goalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  goalButton: {
    width: (width - Sizes.lg * 2 - Sizes.sm) / 2,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.sm,
    borderRadius: 50,
    backgroundColor: "#CCF7FF",
    marginBottom: Sizes.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A2EBEB",
  },
  goalButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  goalButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#00858E",
    textAlign: "center",
  },
  goalButtonTextSelected: {
    color: Colors.white,
  },
  bottomContainer: {
    paddingHorizontal: Sizes.lg,
    paddingTop: Sizes.lg,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Sizes.md,
    borderRadius: 50,
    alignItems: "center",
    marginBottom: Sizes.md,
  },
  continueButtonLoading: {
    opacity: 0.8,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.white,
  },
  loadingImage: {
    width: 32,
    height: 32,
  },
  skipButton: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
    textAlign: "center",
  },
  // Picker Styles
  pickerContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Sizes.xl,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: Colors.textPrimary,
  },
  pickerContent: {
    paddingHorizontal: Sizes.lg,
    paddingTop: Sizes.md,
  },
  pickerOption: {
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.md,
    borderRadius: 8,
    marginBottom: Sizes.xs,
  },
  selectedPickerOption: {
    backgroundColor: "#E3F2FD",
  },
  pickerOptionText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.textPrimary,
  },
  selectedPickerOptionText: {
    color: Colors.primary,
    fontFamily: "Poppins-SemiBold",
  },
  // Date Picker Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  datePickerContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Sizes.xl,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cancelButton: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
  },
  datePickerTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: Colors.textPrimary,
  },
  doneButton: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
  },
  datePickerContent: {
    flexDirection: "row",
    paddingHorizontal: Sizes.lg,
    paddingTop: Sizes.md,
  },
  dateColumn: {
    flex: 1,
    alignItems: "center",
  },
  columnLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
    marginBottom: Sizes.sm,
  },
  dateScrollView: {
    height: 200,
    width: "100%",
  },
  dateOption: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 2,
  },
  selectedDateOption: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  dateOptionText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  selectedDateOptionText: {
    color: Colors.textPrimary,
    fontFamily: "Poppins-SemiBold",
  },
  // Permissions Modal Styles
  permissionsOverlay: {
    flex: 1,
    backgroundColor: "#2C2C2C",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Sizes.lg,
  },
  permissionsContainer: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  permissionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Sizes.xl,
    marginBottom: Sizes.lg,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  permissionTitle: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
  },
  permissionDescription: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    marginBottom: Sizes.xl,
    lineHeight: 22,
  },
  permissionActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  allowButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.xl,
    borderRadius: 50,
    flex: 0.4,
    alignItems: "center",
  },
  allowButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.white,
  },
  skipButton: {
    backgroundColor: Colors.white,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.xl,
    borderRadius: 50,
    flex: 0.5,
    alignItems: "center",
  },
  skipText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
  },
  locationLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
    marginBottom: Sizes.sm,
    marginLeft: Sizes.sm,
  },
});
