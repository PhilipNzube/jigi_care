// Common types used across the app
export const UserTypes = {
  PATIENT: "patient",
  DOCTOR: "doctor",
  ADMIN: "admin",
};

export const AppointmentStatus = {
  SCHEDULED: "scheduled",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

export const HealthRecordTypes = {
  VITAL_SIGNS: "vital_signs",
  LAB_RESULTS: "lab_results",
  MEDICATION: "medication",
  SYMPTOM: "symptom",
  DIAGNOSIS: "diagnosis",
};

export const MedicationStatus = {
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  PAUSED: "paused",
};
