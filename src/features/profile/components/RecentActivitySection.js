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
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.content}>
          {activities.map((activity, index) => (
            <View key={activity.id}>
              <View style={styles.activityItem}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDate}>{activity.date}</Text>
              </View>
              {index < activities.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
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
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginLeft: Sizes.sm,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.sm,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  content: {
    padding: Sizes.md,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
  },
  activityItem: {
    paddingVertical: Sizes.sm,
  },
  activityTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666666",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: Sizes.sm,
  },
});
