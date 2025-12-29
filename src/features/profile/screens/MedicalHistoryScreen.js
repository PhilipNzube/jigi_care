import React, { useState, useEffect } from "react";
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
import { format, parseISO } from "date-fns";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";

export default function MedicalHistoryScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [medicalHistory, setMedicalHistory] = useState([]);

  useEffect(() => {
    // Simulate loading medical history data
    setTimeout(() => {
      setMedicalHistory([
        {
          id: 1,
          type: "Prescription",
          title: "Acetaminophen",
          date: "2025-01-15",
          doctor: "Dr. John Doe",
          status: "Active",
        },
        {
          id: 2,
          type: "Lab Test",
          title: "Blood Test",
          date: "2025-01-10",
          doctor: "Dr. Jane Smith",
          status: "Completed",
        },
        {
          id: 3,
          type: "Appointment",
          title: "General Checkup",
          date: "2025-01-05",
          doctor: "Dr. John Doe",
          status: "Completed",
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "#0098B3";
      case "completed":
        return "#4CAF50";
      case "pending":
        return "#F2C94C";
      default:
        return Colors.textSecondary;
    }
  };

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case "prescription":
        return "medical";
      case "lab test":
        return "flask";
      case "appointment":
        return "calendar";
      default:
        return "document";
    }
  };

  const renderSkeleton = () => (
    <ShimmerLoader>
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <View style={{ width: 100, height: 14, borderRadius: 4, marginBottom: Sizes.xs }} />
          <View style={{ width: 80, height: 20, borderRadius: 12 }} />
        </View>
        <View style={{ width: 200, height: 16, borderRadius: 4, marginBottom: Sizes.xs }} />
        <View style={{ width: 150, height: 14, borderRadius: 4 }} />
      </View>
    </ShimmerLoader>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical History</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <>
            {renderSkeleton()}
            {renderSkeleton()}
            {renderSkeleton()}
          </>
        ) : medicalHistory.length > 0 ? (
          medicalHistory.map((item) => {
            const date = parseISO(item.date);
            const formattedDate = format(date, "MMM dd, yyyy");

            return (
              <View key={item.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <View style={styles.historyType}>
                    <Ionicons
                      name={getTypeIcon(item.type)}
                      size={20}
                      color={Colors.primary}
                    />
                    <Text style={styles.historyTypeText}>{item.type}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(item.status)}14` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(item.status) },
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.historyTitle}>{item.title}</Text>
                <View style={styles.historyDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons
                      name="person-outline"
                      size={16}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.detailText}>{item.doctor}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.detailText}>{formattedDate}</Text>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No medical history available</Text>
          </View>
        )}
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
  historyCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.md,
    marginBottom: Sizes.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.sm,
  },
  historyType: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyTypeText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
    marginLeft: Sizes.xs,
    textTransform: "uppercase",
  },
  statusBadge: {
    paddingHorizontal: Sizes.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },
  historyTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
  },
  historyDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Sizes.md,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    marginLeft: Sizes.xs,
  },
  emptyContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.xxl,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Sizes.xl,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
    marginTop: Sizes.md,
  },
});

