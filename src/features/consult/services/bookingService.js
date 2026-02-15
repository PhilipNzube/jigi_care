/**
 * Booking Service
 * Handles booking-related API calls
 */

import { get, post, patch } from "../../../shared/services/api";

/**
 * Get upcoming appointments for patient (status: upcoming)
 * Response shape: { fullName, bookingId, speciality, date, status, consultantId, rating }
 * @returns {Promise<object>} - Response with upcoming appointments
 */
export const getUpcomingAppointments = async () => {
  console.log("📅 [BOOKING SERVICE] Fetching upcoming appointments...");

  try {
    const response = await get("/booking/patient/upcoming");

    console.log("✅ [BOOKING SERVICE] Upcoming appointments fetched successfully!");
    const appointments = response.data || [];
    console.log("✅ [BOOKING SERVICE] Appointments found:", appointments.length);

    return {
      success: true,
      data: appointments,
    };
  } catch (error) {
    console.error("❌ [BOOKING SERVICE] Error fetching upcoming appointments:", error);
    throw error;
  }
};

/**
 * Get all patient appointments (all statuses) for the Appointments screen
 * Uses same endpoint as upcoming; backend may return all or filter by query
 * @returns {Promise<object>} - { success, data: appointments[] }
 */
export const getPatientAppointments = async () => {
  console.log("📅 [BOOKING SERVICE] Fetching patient appointments...");
  try {
    const response = await get("/booking/patient/upcoming");
    const appointments = response.data || [];
    return { success: true, data: appointments };
  } catch (error) {
    console.error("❌ [BOOKING SERVICE] Error fetching patient appointments:", error);
    throw error;
  }
};

/**
 * Get available time slots for a consultant on a specific date
 * @param {string} consultantId - Consultant/Doctor user ID
 * @param {string} date - Date in ISO format (e.g., "2025-12-29T10:00:00")
 * @returns {Promise<object>} - Response with available slots
 */
export const getAvailableSlots = async (consultantId, date) => {
  console.log("📅 [BOOKING SERVICE] Fetching available slots...");
  console.log("📅 [BOOKING SERVICE] Consultant ID:", consultantId);
  console.log("📅 [BOOKING SERVICE] Date:", date);

  try {
    const endpoint = `/booking/available-slots/${consultantId}?consultantId=${encodeURIComponent(consultantId)}&date=${encodeURIComponent(date)}`;
    const response = await get(endpoint);

    console.log("✅ [BOOKING SERVICE] Available slots fetched successfully!");
    console.log("✅ [BOOKING SERVICE] Response:", JSON.stringify(response, null, 2));

    return response;
  } catch (error) {
    console.error("❌ [BOOKING SERVICE] Error fetching available slots:", error);
    throw error;
  }
};

/**
 * Mark booking as completed by patient (confirm completion)
 * @param {string} bookingId - Booking ID
 * @param {object} body - { confirmed: boolean, reason?: string }
 * @returns {Promise<object>}
 */
export const markBookingCompleted = async (bookingId, body) => {
  console.log("📅 [BOOKING SERVICE] Marking booking completed:", bookingId);
  try {
    const response = await patch(
      `/booking/${bookingId}/patient/completed`,
      body
    );
    console.log("✅ [BOOKING SERVICE] Booking marked completed");
    return response;
  } catch (error) {
    console.error("❌ [BOOKING SERVICE] Error marking completed:", error);
    throw error;
  }
};

/**
 * Mark booking as no-show (consultant did not show up)
 * @param {string} bookingId - Booking ID
 * @returns {Promise<object>}
 */
export const markBookingNoShow = async (bookingId) => {
  console.log("📅 [BOOKING SERVICE] Marking booking no-show:", bookingId);
  try {
    const response = await patch(
      `/booking/${bookingId}/patient/mark-no-show`,
      {}
    );
    console.log("✅ [BOOKING SERVICE] Booking marked no-show");
    return response;
  } catch (error) {
    console.error("❌ [BOOKING SERVICE] Error marking no-show:", error);
    throw error;
  }
};

/**
 * Create a booking
 * @param {object} bookingData - Booking data
 * @param {string} bookingData.date - Date in ISO format (e.g., "2025-12-25T09:05:30.123Z")
 * @param {number} bookingData.duration - Duration in hours
 * @param {string[]} bookingData.symptoms - Array of symptoms
 * @param {string} bookingData.consultantId - Consultant/Doctor user ID
 * @returns {Promise<object>} - Response with created booking
 */
export const createBooking = async (bookingData) => {
  console.log("📝 [BOOKING SERVICE] Creating booking...");
  console.log("📝 [BOOKING SERVICE] Booking data:", JSON.stringify(bookingData, null, 2));

  try {
    const response = await post("/booking/create", bookingData);

    console.log("✅ [BOOKING SERVICE] Booking created successfully!");
    console.log("✅ [BOOKING SERVICE] Response:", JSON.stringify(response, null, 2));

    return response;
  } catch (error) {
    console.error("❌ [BOOKING SERVICE] Error creating booking:", error);
    throw error;
  }
};

export default {
  getUpcomingAppointments,
  getPatientAppointments,
  getAvailableSlots,
  createBooking,
  markBookingCompleted,
  markBookingNoShow,
};

