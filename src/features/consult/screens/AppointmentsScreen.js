import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { getPatientAppointments } from "../services/bookingService";
import { format, parseISO } from "date-fns";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";
import EmptyState from "../../../shared/components/EmptyState";

const STATUS_LABELS = {
  pending_confirmation: "Pending confirmation",
  upcoming: "Upcoming",
  in_progress: "In Progress",
  completed: "Completed",
  no_show: "No Show",
  cancelled: "Cancelled",
  disputed: "Disputed",
};

/** Badge background color by status */
const STATUS_BADGE_COLORS = {
  pending_confirmation: { bg: "#FFF3E0", text: "#E65100" },
  upcoming: { bg: "#E3F2FD", text: "#1565C0" },
  in_progress: { bg: "#E8F5E9", text: "#2E7D32" },
  completed: { bg: "#E8F5E9", text: "#1B5E20" },
  no_show: { bg: "#FFEBEE", text: "#C62828" },
  cancelled: { bg: "#F5F5F5", text: "#616161" },
  disputed: { bg: "#FFF8E1", text: "#F57F17" },
};
const DEFAULT_BADGE_COLOR = { bg: "#EEEEEE", text: "#424242" };

const getStatusLabel = (status) =>
  status ? STATUS_LABELS[status] || status.replace(/_/g, " ") : "";
const getStatusBadgeStyle = (status) =>
  STATUS_BADGE_COLORS[status] || DEFAULT_BADGE_COLOR;

const SECTION_ORDER = [
  "pending_confirmation",
  "upcoming",
  "in_progress",
  "completed",
  "no_show",
  "cancelled",
  "disputed",
];

function AppointmentCardSkeleton() {
  return (
    <ShimmerLoader>
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, { width: "60%" }]} />
        </View>
        <View style={styles.doctorInfo}>
          <View style={styles.skeletonAvatar} />
          <View style={styles.skeletonDetails}>
            <View style={[styles.skeletonLine, { width: "80%" }]} />
            <View style={[styles.skeletonLine, { width: "50%" }]} />
          </View>
        </View>
      </View>
    </ShimmerLoader>
  );
}

export default function AppointmentsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchAppointments = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const result = await getPatientAppointments();
      setAppointments(result.data || []);
    } catch (error) {
      console.error("AppointmentsScreen fetch error:", error);
      setAppointments([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useFocusEffect(
    useCallback(() => {
      if (appointments.length > 0) fetchAppointments(true);
      else fetchAppointments(false);
    }, [appointments.length, fetchAppointments]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAppointments(true);
  }, [fetchAppointments]);

  const statusesInData = React.useMemo(() => {
    const set = new Set(appointments.map((a) => a.status).filter(Boolean));
    return SECTION_ORDER.filter((s) => set.has(s));
  }, [appointments]);

  const filteredByStatus = React.useMemo(() => {
    if (filter === "all") return appointments;
    return appointments.filter((a) => a.status === filter);
  }, [appointments, filter]);

  const groupedBySection = React.useMemo(() => {
    const groups = {};
    SECTION_ORDER.forEach((status) => {
      const list = filteredByStatus.filter((a) => a.status === status);
      if (list.length > 0) {
        groups[status] = list;
      }
    });
    return groups;
  }, [filteredByStatus]);

  const openChat = (item) => {
    const doctor = {
      name: item.fullName || "Dr. Unknown",
      consultantId: item.consultantId,
      bookingId: item.bookingId,
    };
    navigation.navigate("ChatPage", {
      doctor,
      bookingId: item.bookingId,
      appointmentData: item,
      bookingStatus: item.status,
    });
  };

  if (isLoading && appointments.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Appointments</Text>
        </View>
        <View style={styles.content}>
          <AppointmentCardSkeleton />
          <AppointmentCardSkeleton />
          <AppointmentCardSkeleton />
        </View>
      </View>
    );
  }

  const filters = ["all", ...statusesInData];
  const filterLabel = (key) =>
    key === "all" ? "All" : STATUS_LABELS[key] || key;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Appointments</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((key) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.filterChip,
              filter === key && styles.filterChipActive,
            ]}
            onPress={() => setFilter(key)}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === key && styles.filterChipTextActive,
              ]}
              numberOfLines={1}
            >
              {filterLabel(key)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {appointments.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="No appointments"
            message="You don't have any appointments yet."
          />
        ) : (
          SECTION_ORDER.map((status) => {
            const list = groupedBySection[status];
            if (!list || list.length === 0) return null;
            const label = STATUS_LABELS[status] || status;
            return (
              <View key={status} style={styles.section}>
                <Text style={styles.sectionTitle}>{label}</Text>
                {list.map((item) => {
                  const date = parseISO(item.date);
                  const canOpenChat = [
                    "pending_confirmation",
                    "upcoming",
                    "in_progress",
                  ].includes(item.status);
                  const badgeStyle = getStatusBadgeStyle(item.status);
                  return (
                    <TouchableOpacity
                      key={item.bookingId || item.id}
                      style={styles.card}
                      onPress={() => canOpenChat && openChat(item)}
                      activeOpacity={canOpenChat ? 0.7 : 1}
                      disabled={!canOpenChat}
                    >
                      <View style={styles.cardTopRow}>
                        <Text style={styles.cardDateTime}>
                          {format(date, "MMM d, yyyy")} •{" "}
                          {format(date, "h:mm a")}
                        </Text>
                        {item.status ? (
                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor: badgeStyle.bg,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusBadgeText,
                                { color: badgeStyle.text },
                              ]}
                              numberOfLines={1}
                            >
                              {getStatusLabel(item.status)}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <View style={styles.doctorInfo}>
                        <View style={styles.avatar}>
                          <Ionicons
                            name="person"
                            size={24}
                            color={Colors.primary}
                          />
                        </View>
                        <View style={styles.doctorDetails}>
                          <Text style={styles.doctorName}>
                            {item.fullName || "Dr. Unknown"}
                          </Text>
                          <Text style={styles.doctorSpecialty}>
                            {item.speciality || "General Practitioner"}
                          </Text>
                        </View>
                        {item.rating != null && (
                          <View style={styles.ratingRow}>
                            <Ionicons name="star" size={14} color="#FFD700" />
                            <Text style={styles.ratingText}>
                              {parseFloat(item.rating)}
                            </Text>
                          </View>
                        )}
                      </View>
                      {canOpenChat && (
                        <View style={styles.chatHint}>
                          <Ionicons
                            name="chatbubble-outline"
                            size={16}
                            color={Colors.primary}
                          />
                          <Text style={styles.chatHintText}>Open chat</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  filtersScroll: {
    maxHeight: 44,
    marginBottom: Sizes.sm,
  },
  filtersContent: {
    paddingHorizontal: Sizes.lg,
    gap: Sizes.sm,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Sizes.xs,
  },
  filterChip: {
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: 20,
    backgroundColor: Colors.white,
    marginRight: Sizes.sm,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Sizes.lg,
    paddingBottom: Sizes.xl * 2,
  },
  section: {
    marginBottom: Sizes.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.textPrimary,
    marginBottom: Sizes.md,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.md,
    marginBottom: Sizes.md,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTop: {
    marginBottom: Sizes.sm,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Sizes.sm,
    gap: Sizes.sm,
  },
  cardDateTime: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: Sizes.sm,
    paddingVertical: 4,
    borderRadius: 12,
    maxWidth: "50%",
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
  },
  doctorInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    borderRadius: 8,
    padding: Sizes.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.md,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: Colors.textPrimary,
    marginLeft: 4,
  },
  chatHint: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Sizes.sm,
    gap: Sizes.xs,
  },
  chatHintText: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
  },
  skeletonLine: {
    height: 14,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
    marginBottom: Sizes.xs,
    width: "100%",
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.lightGray,
    marginRight: Sizes.md,
  },
  skeletonDetails: {
    flex: 1,
  },
});
