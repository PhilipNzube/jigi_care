import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Colors, Sizes } from "../../../shared/constants";
import PrescriptionCard from "./PrescriptionCard";
import { getPrescriptions } from "../services/prescriptionService";
import { requestMedication, getMedicationRequests } from "../services/medicationService";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";
import { showError, showSuccess } from "../../../shared/utils/toast";
import { TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { format, parseISO } from "date-fns";

// Prescription Card Skeleton Component
function PrescriptionCardSkeleton() {
  return (
    <ShimmerLoader>
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonContent}>
          <View style={styles.skeletonMedicationInfo}>
            <View style={styles.skeletonImage} />
            <View style={styles.skeletonDetails}>
              <View style={styles.skeletonNameRow} />
              <View style={styles.skeletonDosage} />
              <View style={styles.skeletonDoctor} />
            </View>
          </View>
          <View style={styles.skeletonPillsInfo}>
            <View style={styles.skeletonPillsRow} />
            <View style={styles.skeletonProgressBar} />
            <View style={styles.skeletonRefillDate} />
          </View>
        </View>
      </View>
    </ShimmerLoader>
  );
}

// Map API prescription to UI format
const mapPrescriptionToUI = (apiPrescription) => {
  // Determine status based on pills remaining or API status
  let status = "Active";
  let statusColor = "#0098B314"; // Light blue for active

  const pillsRemaining =
    apiPrescription.pillsRemaining || apiPrescription.remainingQuantity || 0;
  const totalPills =
    apiPrescription.totalPills ||
    apiPrescription.totalQuantity ||
    apiPrescription.quantity ||
    30;
  const percentage = totalPills > 0 ? (pillsRemaining / totalPills) * 100 : 0;

  if (pillsRemaining === 0) {
    status = "Refill Needed";
    statusColor = "#EA4D4D14"; // Light red
  } else if (percentage <= 25) {
    status = "Running Low";
    statusColor = "#F2C94C1F"; // Light yellow
  }

  // Format dosage: "[mg]. [Dosage text]"
  // Convert dosage number to text: 1 = "once daily", 2 = "twice daily", etc.
  const getDosageText = (dosageNumber) => {
    if (!dosageNumber) return "As prescribed";
    const num = parseInt(dosageNumber, 10);
    let text = "";
    switch (num) {
      case 1:
        text = "once daily";
        break;
      case 2:
        text = "twice daily";
        break;
      case 3:
        text = "thrice daily";
        break;
      case 4:
        text = "four times daily";
        break;
      case 5:
        text = "five times daily";
        break;
      case 6:
        text = "six times daily";
        break;
      default:
        text = `${num} times daily`;
    }
    // Capitalize first letter
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const mg = apiPrescription.mg || apiPrescription.mgValue || "";
  const dosageNumber =
    apiPrescription.dosage || apiPrescription.dosageFrequency || null;
  const dosageText = getDosageText(dosageNumber);

  let dosage = "As prescribed";
  if (mg && dosageNumber) {
    dosage = `${mg}mg · ${dosageText}`;
  } else if (mg) {
    dosage = `${mg}mg`;
  } else if (dosageNumber) {
    dosage = dosageText;
  } else {
    // Fallback to old format if new fields don't exist
    dosage =
      apiPrescription.dosage ||
      `${apiPrescription.dose || ""}${apiPrescription.doseUnit || ""} • ${apiPrescription.frequency || "As prescribed"}` ||
      "As prescribed";
  }

  // Format doctor name
  const doctor =
    apiPrescription.doctor?.fullName ||
    apiPrescription.consultant?.fullName ||
    apiPrescription.prescribedBy ||
    "Dr. Unknown";

  // Format refill date - check for finish date first, then refill dates
  let refillDate = "No refills available";

  // Check for finish date (various possible field names)
  const finishDate =
    apiPrescription.finishDate ||
    apiPrescription.finish_date ||
    apiPrescription.endDate ||
    apiPrescription.end_date ||
    apiPrescription.expiryDate ||
    apiPrescription.expiry_date ||
    apiPrescription.expiresAt ||
    null;

  if (finishDate) {
    try {
      const formattedFinishDate = format(parseISO(finishDate), "MMM d, yyyy");
      refillDate = `Refill by ${formattedFinishDate}`;
    } catch (error) {
      // If parsing fails, try using the date as-is
      refillDate = `Refill by ${finishDate}`;
    }
  } else if (apiPrescription.refillDate) {
    try {
      const formattedDate = format(
        parseISO(apiPrescription.refillDate),
        "MMM d, yyyy"
      );
      refillDate = `Refill by ${formattedDate}`;
    } catch (error) {
      refillDate = `Refill by ${apiPrescription.refillDate}`;
    }
  } else if (apiPrescription.nextRefillDate) {
    try {
      const formattedDate = format(
        parseISO(apiPrescription.nextRefillDate),
        "MMM d, yyyy"
      );
      refillDate = `Refill by ${formattedDate}`;
    } catch (error) {
      refillDate = `Refill by ${apiPrescription.nextRefillDate}`;
    }
  }

  return {
    id: apiPrescription.id || apiPrescription._id,
    name:
      apiPrescription.medicationName ||
      apiPrescription.name ||
      apiPrescription.medication ||
      "Unknown Medication",
    dosage: dosage,
    doctor: doctor,
    status: status,
    statusColor: statusColor,
    pillsRemaining: pillsRemaining,
    totalPills: totalPills,
    refillDate: refillDate,
  };
};

export default function PrescriptionsTab({ navigation }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [requestedMedications, setRequestedMedications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [medicationName, setMedicationName] = useState("");
  const [medicationGram, setMedicationGram] = useState("");

  const fetchPrescriptions = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }

    try {
      console.log("💊 [PRESCRIPTIONS TAB] Fetching prescriptions and requests...");
      const [prescriptionsResult, requestsResult] = await Promise.all([
        getPrescriptions(),
        getMedicationRequests()
      ]);

      const mappedPrescriptions = (prescriptionsResult.data || []).map(mapPrescriptionToUI);
      setPrescriptions(mappedPrescriptions);
      setRequestedMedications(requestsResult || []);
      
      console.log(
        "✅ [PRESCRIPTIONS TAB] Data loaded:",
        mappedPrescriptions.length,
        "prescriptions,",
        (requestsResult || []).length,
        "requests"
      );
    } catch (error) {
      console.error(
        "❌ [PRESCRIPTIONS TAB] Error fetching data:",
        error
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRequestMedication = async () => {
    if (!medicationName.trim()) {
      showError("Please enter a medication name");
      return;
    }

    setIsRequesting(true);
    try {
      await requestMedication({
        name: medicationName.trim(),
        gram: medicationGram ? parseInt(medicationGram) : null
      });
      
      showSuccess("Medication request sent successfully!");
      setMedicationName("");
      setMedicationGram("");
      fetchPrescriptions(true);
    } catch (error) {
      showError(error.message || "Failed to send request");
    } finally {
      setIsRequesting(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  // Refresh when tab comes into focus (if data already exists, do silent refresh)
  useFocusEffect(
    useCallback(() => {
      if (prescriptions.length > 0) {
        // Silent refresh if data exists
        fetchPrescriptions(true);
      } else {
        // Show loading if no data
        fetchPrescriptions(false);
      }
    }, [prescriptions.length, fetchPrescriptions])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPrescriptions(true);
  }, [fetchPrescriptions]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Request Medication Section */}
        <View style={styles.requestSection}>
          <Text style={styles.sectionTitle}>Request Medication</Text>
          <Text style={styles.requestSubtitle}>Can't find your medication? Request it here.</Text>
          <View style={styles.requestCard}>
            <View style={styles.requestInputs}>
              <TextInput
                style={[styles.requestInput, { flex: 2 }]}
                placeholder="Medication Name"
                value={medicationName}
                onChangeText={setMedicationName}
                placeholderTextColor="#999"
              />
              <TextInput
                style={[styles.requestInput, { flex: 1, marginLeft: Sizes.sm }]}
                placeholder="Gram (e.g. 500)"
                value={medicationGram}
                onChangeText={setMedicationGram}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
            <TouchableOpacity 
              style={[styles.requestButton, (!medicationName.trim() || isRequesting) && styles.disabledButton]}
              onPress={handleRequestMedication}
              disabled={!medicationName.trim() || isRequesting}
            >
              {isRequesting ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.requestButtonText}>Send Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Requested Medications List */}
        {requestedMedications.length > 0 && (
          <View style={styles.requestedListSection}>
            <Text style={styles.sectionTitle}>Your Requests</Text>
            {requestedMedications.map((req) => (
              <View key={req.id} style={styles.requestListItem}>
                <View style={styles.requestListIcon}>
                  <Ionicons name="time-outline" size={20} color={Colors.primary} />
                </View>
                <View style={styles.requestListContent}>
                  <Text style={styles.requestListName}>{req.name}</Text>
                  <Text style={styles.requestListDate}>
                    {req.gram ? `${req.gram}mg · ` : ""}
                    {format(parseISO(req.createdAt || req.requestedAt), "MMM d, yyyy")}
                  </Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Pending</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Current Prescriptions</Text>

        {isLoading ? (
          <View>
            {[1, 2, 3].map((index) => (
              <PrescriptionCardSkeleton key={index} />
            ))}
          </View>
        ) : prescriptions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="medical-outline" size={64} color={Colors.grey} />
            <Text style={styles.emptyTitle}>No Prescriptions</Text>
            <Text style={styles.emptyText}>
              You don't have any active prescriptions yet. Your prescriptions
              will appear here once they are prescribed by a doctor.
            </Text>
          </View>
        ) : (
          prescriptions.map((prescription) => (
            <PrescriptionCard
              key={prescription.id}
              prescription={prescription}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Sizes.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginBottom: Sizes.md,
  },
  scrollView: {
    flex: 1,
  },
  // Skeleton styles
  skeletonCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.sm,
    marginBottom: Sizes.md,
  },
  skeletonContent: {
    padding: Sizes.md,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
  },
  skeletonMedicationInfo: {
    flexDirection: "row",
    marginBottom: Sizes.md,
  },
  skeletonImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
    marginRight: Sizes.sm,
  },
  skeletonDetails: {
    flex: 1,
  },
  skeletonNameRow: {
    height: 16,
    width: "60%",
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
    marginBottom: Sizes.xs,
  },
  skeletonDosage: {
    height: 12,
    width: "40%",
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
    marginBottom: Sizes.xs / 2,
  },
  skeletonDoctor: {
    height: 12,
    width: "50%",
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
  },
  skeletonPillsInfo: {
    marginTop: Sizes.sm,
  },
  skeletonPillsRow: {
    height: 12,
    width: "30%",
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
    marginBottom: Sizes.xs,
  },
  skeletonProgressBar: {
    height: 6,
    width: "100%",
    borderRadius: 3,
    backgroundColor: Colors.lightGray,
    marginBottom: Sizes.xs,
  },
  skeletonRefillDate: {
    height: 12,
    width: "40%",
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Sizes.xl * 2,
    paddingHorizontal: Sizes.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
    marginTop: Sizes.md,
    marginBottom: Sizes.xs,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
    color: Colors.grey,
    textAlign: "center",
    lineHeight: 20,
  },
  requestSection: {
    marginTop: Sizes.md,
    marginBottom: Sizes.xl,
  },
  requestSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    marginBottom: Sizes.md,
    marginTop: -Sizes.xs,
  },
  requestCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Sizes.md,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  requestInputs: {
    flexDirection: "row",
    marginBottom: Sizes.md,
  },
  requestInput: {
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: Colors.black,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  requestButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: Sizes.md,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  requestButtonText: {
    color: Colors.white,
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
  },
  requestedListSection: {
    marginBottom: Sizes.xl,
  },
  requestListItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.md,
    marginBottom: Sizes.sm,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  requestListIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0098B314",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.md,
  },
  requestListContent: {
    flex: 1,
  },
  requestListName: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
  },
  requestListDate: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
  },
  statusBadge: {
    backgroundColor: "#F2C94C1F",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontFamily: "Poppins-Medium",
    color: "#F2994A",
  },
});
