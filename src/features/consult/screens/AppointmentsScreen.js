import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  BackHandler,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { getPatientBookingList } from "../services/bookingService";
import { useAuth } from "../../../shared/context/AuthContext";
import { format, parseISO } from "date-fns";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";
import EmptyState from "../../../shared/components/EmptyState";
import ConnectingModal from "../../home/components/ConnectingModal";

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

const LIST_PAGE_SIZE = 20;
const FILTER_OPTIONS = ["all", ...SECTION_ORDER];

export default function AppointmentsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const patientId = user?.id;
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showConnectingModal, setShowConnectingModal] = useState(false);
  const [selectedDoctorName, setSelectedDoctorName] = useState("");

  const totalPages = Math.max(1, Math.ceil(totalItems / LIST_PAGE_SIZE));

  const fetchAppointments = useCallback(
    async (page = 1, silent = false) => {
      if (!patientId) {
        setAppointments([]);
        setIsLoading(false);
        setRefreshing(false);
        return;
      }
      if (!silent) setIsLoading(true);
      try {
        const statusParam = filter === "all" ? undefined : filter;
        const result = await getPatientBookingList(patientId, {
          status: statusParam,
          page,
          limit: LIST_PAGE_SIZE,
        });
        setAppointments(result.data || []);
        setTotalItems(result.total ?? result.data?.length ?? 0);
      } catch (error) {
        console.error("AppointmentsScreen fetch error:", error);
        setAppointments([]);
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [patientId, filter]
  );

  useEffect(() => {
    fetchAppointments(currentPage);
  }, [filter, currentPage]);

  useFocusEffect(
    useCallback(() => {
      if (patientId) fetchAppointments(currentPage, true);
    }, [patientId, currentPage, filter])
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (Platform.OS === "android") {
          navigation.navigate("BottomTabs", { screen: "home" });
          return true;
        }
        return false;
      };
      const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => sub.remove();
    }, [navigation])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAppointments(currentPage, true);
  }, [currentPage, filter, patientId]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const filterLabel = (key) =>
    key === "all" ? "All" : STATUS_LABELS[key] || key;

  const openChat = (item) => {
    const doctor = {
      name: item.fullName || item.consultantName || "Consultant",
      consultantId: item.consultantId,
      bookingId: item.bookingId || item.id,
    };
    setSelectedDoctorName(doctor.name);
    setShowConnectingModal(true);
    setTimeout(() => {
      setShowConnectingModal(false);
      navigation.navigate("ChatPage", {
        doctor,
        bookingId: item.bookingId || item.id,
        appointmentData: item,
        bookingStatus: item.status,
      });
    }, 3000);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    const pages = [];
    for (let i = startPage; i <= endPage; i++) pages.push(i);

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[
            styles.paginationButton,
            currentPage === 1 && styles.paginationButtonDisabled,
          ]}
          onPress={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={currentPage === 1 ? Colors.gray : Colors.primary}
          />
        </TouchableOpacity>
        {startPage > 1 && (
          <>
            <TouchableOpacity
              style={styles.paginationButton}
              onPress={() => handlePageChange(1)}
            >
              <Text style={styles.paginationText}>1</Text>
            </TouchableOpacity>
            {startPage > 2 && (
              <Text style={styles.paginationEllipsis}>...</Text>
            )}
          </>
        )}
        {pages.map((page) => (
          <TouchableOpacity
            key={page}
            style={[
              styles.paginationButton,
              currentPage === page && styles.paginationButtonActive,
            ]}
            onPress={() => handlePageChange(page)}
          >
            <Text
              style={[
                styles.paginationText,
                currentPage === page && styles.paginationTextActive,
              ]}
            >
              {page}
            </Text>
          </TouchableOpacity>
        ))}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <Text style={styles.paginationEllipsis}>...</Text>
            )}
            <TouchableOpacity
              style={styles.paginationButton}
              onPress={() => handlePageChange(totalPages)}
            >
              <Text style={styles.paginationText}>{totalPages}</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity
          style={[
            styles.paginationButton,
            currentPage === totalPages && styles.paginationButtonDisabled,
          ]}
          onPress={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={
              currentPage === totalPages ? Colors.gray : Colors.primary
            }
          />
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading && appointments.length === 0 && !refreshing) {
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
          {FILTER_OPTIONS.map((key) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.filterChip,
                filter === key && styles.filterChipActive,
              ]}
              onPress={() => {
                if (filter !== key) setCurrentPage(1);
                setFilter(key);
              }}
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
        <View style={styles.content}>
          <AppointmentCardSkeleton />
          <AppointmentCardSkeleton />
          <AppointmentCardSkeleton />
        </View>
      </View>
    );
  }

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
        {FILTER_OPTIONS.map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.filterChip, filter === key && styles.filterChipActive]}
            onPress={() => {
              if (filter !== key) setCurrentPage(1);
              setFilter(key);
            }}
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
            message={
              filter === "all"
                ? "You don't have any appointments yet."
                : `No ${filterLabel(filter)} appointments.`
            }
          />
        ) : (
          <View style={styles.section}>
            {appointments.map((item) => {
              const date = parseISO(item.date);
              const canOpenChat = [
                "pending_confirmation",
                "upcoming",
                "in_progress",
              ].includes(item.status);
              const badgeStyle = getStatusBadgeStyle(item.status);
              const rating =
                item.rating != null ? parseFloat(item.rating) : null;
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
                      {format(date, "MMM d, yyyy")} • {format(date, "h:mm a")}
                    </Text>
                    {item.status ? (
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: badgeStyle.bg },
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
                    <View style={styles.doctorProfileImageContainer}>
                      <Ionicons
                        name="person"
                        size={25}
                        color={Colors.primary}
                      />
                    </View>
                    <View style={styles.doctorDetails}>
                      <Text style={styles.doctorName}>
                        {item.fullName || item.consultantName || "Consultant"}
                      </Text>
                      <Text style={styles.doctorSpecialty} numberOfLines={2}>
                        {item.speciality || "Consultation"}
                      </Text>
                    </View>
                    {rating !== null && (
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text style={styles.ratingText}>{rating}</Text>
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
            {totalPages > 1 && renderPagination()}
          </View>
        )}
      </ScrollView>
      <ConnectingModal
        visible={showConnectingModal}
        doctorName={selectedDoctorName || "Consultant"}
      />
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
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Sizes.xl,
    marginBottom: Sizes.lg,
  },
  paginationButton: {
    minWidth: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  paginationButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
  },
  paginationTextActive: {
    color: Colors.white,
  },
  paginationEllipsis: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    marginHorizontal: 4,
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
    paddingTop: Sizes.lg,
    paddingHorizontal: Sizes.sm,
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
    paddingHorizontal: Sizes.lg,
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
    marginBottom: Sizes.sm,
    padding: Sizes.md,
  },
  doctorProfileImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  ratingContainer: {
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
