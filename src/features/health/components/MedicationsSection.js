import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { searchMedications } from "../../medications/services/medicationService";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";
import { format } from "date-fns";

const MedicationsSection = ({ navigation }) => {
  const [medications, setMedications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMedications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await searchMedications({
        page: 1,
        limit: 3,
      });
      
      const items = response.items || [];
      setMedications(items);
    } catch (error) {
      console.error("❌ [MEDICATIONS SECTION] Error fetching medications:", error);
      setMedications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const formatDosage = (medication) => {
    const gram = medication.gram || "";
    if (gram) {
      return `${gram}mg`;
    }
    return "As prescribed";
  };

  const getStatusInfo = (medication) => {
    const stockStatus = medication.stockStatus || "in_stock";
    
    switch (stockStatus) {
      case "out_of_stock":
        return { text: "Out of Stock", bgColor: "#EA4D4D1F", textColor: "#EA4D4D" };
      case "low_stock":
        return { text: "Running Low", bgColor: "#F2C94C1F", textColor: "#856404" };
      case "in_stock":
      default:
        return { text: "In Stock", bgColor: "#0098B314", textColor: "#0098B3" };
    }
  };

  const renderSkeleton = () => (
    <ShimmerLoader>
      <View style={styles.medicationCard}>
        <View style={styles.medicationHeader}>
          <View style={{ width: 150, height: 12, borderRadius: 4, marginBottom: Sizes.sm }} />
          <View style={{ width: 60, height: 20, borderRadius: 4 }} />
        </View>
        <View style={styles.medicationContent}>
          <View style={styles.medicationItem}>
            <View style={styles.medicationImageContainer}>
              <View style={styles.medicationImage} />
            </View>
            <View style={styles.medicationInfo}>
              <View style={{ width: 120, height: 14, borderRadius: 4, marginBottom: Sizes.xs }} />
              <View style={{ width: 100, height: 12, borderRadius: 4, marginBottom: Sizes.xs }} />
              <View style={{ width: 150, height: 12, borderRadius: 4 }} />
            </View>
            <View style={{ width: 80, height: 24, borderRadius: 12 }} />
          </View>
        </View>
      </View>
    </ShimmerLoader>
  );

  const renderMedicationCard = (medication, index) => {
    const statusInfo = getStatusInfo(medication);
    const medicationName = medication.name || "Unknown Medication";
    const dosage = formatDosage(medication);
    const description = medication.description || "";
    
    // Format date - use current date/time for today's medications
    const now = new Date();
    const formattedDate = format(now, "MMM dd, yyyy");
    const formattedTime = format(now, "h:mm a");

    return (
      <View key={medication.id || index} style={styles.medicationCard}>
        <View style={styles.medicationHeader}>
          <Text style={styles.medicationDate}>
            {formattedDate} • {formattedTime}
          </Text>
          {/* <View style={styles.statusRow}>
            <View style={styles.checkbox}>
              <Ionicons name="checkmark" size={16} color={Colors.white} />
            </View>
            <Text style={styles.statusText}>Taken</Text>
          </View> */}
        </View>
        <View style={styles.medicationContent}>
          <View style={styles.medicationItem}>
            <View style={styles.medicationImageContainer}>
              <View style={styles.medicationImage} />
            </View>
            <View style={styles.medicationInfo}>
              <Text style={styles.medicationName}>{medicationName}</Text>
              <Text style={styles.medicationDosage}>{dosage}</Text>
              {description ? (
                <Text style={styles.medicationDescription} numberOfLines={2}>
                  {description}
                </Text>
              ) : null}
            </View>
            <View style={styles.medicationStatus}>
              <View style={[styles.statusTag, { backgroundColor: statusInfo.bgColor }]}>
                <Text style={[styles.statusTagText, { color: statusInfo.textColor }]}>
                  {statusInfo.text}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Medications</Text>
        <TouchableOpacity onPress={() => navigation?.navigate("ViewAllMedications")}>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        renderSkeleton()
      ) : medications.length > 0 ? (
        medications.map(renderMedicationCard)
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No medications available</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.md,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#007AFF",
  },
  medicationCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.sm,
    marginBottom: Sizes.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  medicationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.sm,
  },
  medicationDate: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  medicationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  medicationImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FF6B6B",
    marginRight: Sizes.md,
    justifyContent: "center",
    alignItems: "center",
  },
  medicationImage: {
    width: 24,
    height: 24,
    backgroundColor: Colors.white,
    borderRadius: 4,
  },
  medicationInfo: {
    flex: 1,
    marginRight: Sizes.sm,
  },
  medicationName: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#000",
    marginBottom: Sizes.xs,
  },
  medicationDosage: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#5B6B62",
    marginBottom: Sizes.xs,
  },
  medicationDescription: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  medicationStatus: {
    alignItems: "flex-end",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Sizes.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.xs,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#C89A0F",
  },
  statusTag: {
    paddingHorizontal: Sizes.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTagText: {
    fontSize: 10,
    fontFamily: "Poppins-Medium",
  },
  medicationContent: {
    padding: Sizes.md,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
  },
  emptyContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
});

export default MedicationsSection;
