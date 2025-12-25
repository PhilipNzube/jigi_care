/**
 * Booking Service
 * Handles booking-related API calls
 */

import { get, post } from "../../../shared/services/api";

/**
 * Get upcoming appointments for patient
 * @returns {Promise<object>} - Response with upcoming appointments
 */
export const getUpcomingAppointments = async () => {
  console.log("📅 [BOOKING SERVICE] Fetching upcoming appointments...");

  try {
    const response = await get("/booking/patient/upcoming");

    console.log("✅ [BOOKING SERVICE] Upcoming appointments fetched successfully!");
    console.log("✅ [BOOKING SERVICE] Response:", JSON.stringify(response, null, 2));

    // Handle response format - response.data contains the array
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
  getAvailableSlots,
  createBooking,
};

