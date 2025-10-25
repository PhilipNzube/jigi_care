import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function EmergencyContactsSection() {
  const contacts = [
    {
      id: 1,
      name: "John Doe",
      phone: "+234 1000 000 000",
      relationship: "Spouse",
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        <View style={styles.content}>
          {contacts.map((contact, index) => (
            <View key={contact.id}>
              <View style={styles.contactItem}>
                <View style={styles.contactInfo}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="person" size={20} color="#E91E63" />
                  </View>
                  <View style={styles.contactDetails}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                  </View>
                </View>
                <View style={styles.relationshipTag}>
                  <Text style={styles.relationshipText}>
                    {contact.relationship}
                  </Text>
                </View>
              </View>
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
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#E024780F",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.md,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#666666",
  },
  relationshipTag: {
    backgroundColor: "#E024780F",
    paddingHorizontal: Sizes.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  relationshipText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#E91E63",
  },
});
