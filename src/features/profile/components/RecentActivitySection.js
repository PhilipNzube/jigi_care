import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

export default function RecentActivitySection() {
  const activities = [
    {
      id: 1,
      title: "Prescription refilled: Paracetamol",
      date: "Sep 20th, 2025",
    },
    {
      id: 2,
      title: "Consultation with Dr. Sarah Johnson",
      date: "Sep 22th, 2025",
    },
    {
      id: 3,
      title: "Prescription refilled: Lisinopril",
      date: "Sep 23rd, 2025",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>

      <View style={styles.card}>
        {activities.map((activity, index) => (
          <View
            key={activity.id}
            style={[
              styles.activityItem,
              index === activities.length - 1 && styles.lastActivityItem,
            ]}
          >
            <Text style={styles.activityTitle}>{activity.title}</Text>
            <Text style={styles.activityDate}>{activity.date}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: Sizes.md,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  lastActivityItem: {
    borderBottomWidth: 0,
  },
  activityTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
  },
});



