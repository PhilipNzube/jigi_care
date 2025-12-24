import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { useAuth } from "../../../shared/context/AuthContext";

export default function EmergencyContactsSection() {
  const { user } = useAuth();
  const emergencyContact = user?.emergencyContact;

  // If no emergency contact, show empty state
  if (!emergencyContact || !emergencyContact.name) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <View style={styles.emptyContent}>
            <Ionicons name="person-outline" size={48} color="#B0B0B0" />
            <Text style={styles.emptyText}>No emergency contact set</Text>
            <Text style={styles.emptySubtext}>
              Add an emergency contact in your profile settings
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Create contacts array from user data
  const contacts = [{
    id: 1,
    name: emergencyContact.name,
    phone: emergencyContact.phone || "Not provided",
    relationship: emergencyContact.relationship || "Contact",
  }];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        <View style={styles.content}>
          {contacts.map((contact) => (
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
  emptyContent: {
    padding: Sizes.xl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginTop: Sizes.md,
    marginBottom: Sizes.xs,
  },
  emptySubtext: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#666666",
    textAlign: "center",
  },
});
