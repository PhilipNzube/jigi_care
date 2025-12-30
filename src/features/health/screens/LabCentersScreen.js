import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { getLabCenters } from "../services/labTestService";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";

// Lab Center Card Component
const LabCenterCard = ({ labCenter }) => {
  return (
    <View style={styles.labCard}>
      <View style={styles.labHeader}>
        <View style={styles.labIconContainer}>
          <Ionicons name="business" size={24} color={Colors.primary} />
        </View>
        <View style={styles.labInfo}>
          <Text style={styles.labName}>{labCenter.name}</Text>
          <View style={styles.labDetails}>
            <View style={styles.labDetailRow}>
              <Ionicons name="location" size={16} color={Colors.textSecondary} />
              <Text style={styles.labAddress} numberOfLines={2}>
                {labCenter.address}
              </Text>
            </View>
            {labCenter.phone && (
              <View style={styles.labDetailRow}>
                <Ionicons name="call" size={16} color={Colors.textSecondary} />
                <Text style={styles.labPhone}>{labCenter.phone}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

// Skeleton Component
function LabCenterCardSkeleton() {
  return (
    <ShimmerLoader>
      <View style={styles.labCard}>
        <View style={{ width: "100%", height: 120, borderRadius: 12 }} />
      </View>
    </ShimmerLoader>
  );
}

export default function LabCentersScreen({ navigation }) {
  const [labCenters, setLabCenters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLabCenters();
  }, []);

  const fetchLabCenters = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      }
      const response = await getLabCenters();
      const centersData = response.data || [];
      setLabCenters(centersData);
    } catch (error) {
      console.error("❌ [LAB CENTERS] Error fetching lab centers:", error);
      setLabCenters([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchLabCenters(true);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lab Centers</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {isLoading ? (
          <>
            <LabCenterCardSkeleton />
            <LabCenterCardSkeleton />
            <LabCenterCardSkeleton />
          </>
        ) : labCenters.length > 0 ? (
          <View style={styles.labsContainer}>
            {labCenters.map((labCenter) => (
              <LabCenterCard key={labCenter.id} labCenter={labCenter} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No lab centers available</Text>
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
  labsContainer: {
    marginTop: Sizes.md,
    gap: Sizes.md,
  },
  labCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  labHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  labIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.md,
  },
  labInfo: {
    flex: 1,
  },
  labName: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
  },
  labDetails: {
    gap: Sizes.xs,
  },
  labDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Sizes.xs,
  },
  labAddress: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    flex: 1,
  },
  labPhone: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
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

