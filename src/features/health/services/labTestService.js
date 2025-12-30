/**
 * Lab Test Service
 * Handles lab test-related API calls
 */

import { get, post } from "../../../shared/services/api";

/**
 * Get popular tests (no parameters)
 * @returns {Promise<object>} - Response with popular tests data
 */
export const getPopularTests = async () => {
  try {
    console.log("🔬 [LAB TEST SERVICE] Fetching popular tests...");
    const response = await get("/test");
    console.log("✅ [LAB TEST SERVICE] Popular tests fetched successfully!");
    return response;
  } catch (error) {
    console.error("❌ [LAB TEST SERVICE] Error fetching popular tests:", error);
    throw error;
  }
};

/**
 * Search tests with filters
 * @param {object} params - Search parameters
 * @param {string} params.search - Search query
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<object>} - Response with tests data
 */
export const searchTests = async ({ search = "", page = 1, limit = 10 }) => {
  try {
    console.log("🔬 [LAB TEST SERVICE] Searching tests...", { search, page, limit });
    const queryParams = new URLSearchParams();
    if (search) queryParams.append("search", search);
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    
    const endpoint = `/test?${queryParams.toString()}`;
    const response = await get(endpoint);
    console.log("✅ [LAB TEST SERVICE] Tests search successful!");
    return response;
  } catch (error) {
    console.error("❌ [LAB TEST SERVICE] Error searching tests:", error);
    throw error;
  }
};

/**
 * Get test results for patient
 * @returns {Promise<object>} - Response with test results data
 */
export const getTestResults = async () => {
  try {
    console.log("🔬 [LAB TEST SERVICE] Fetching test results...");
    const response = await get("/test-results/patient");
    console.log("✅ [LAB TEST SERVICE] Test results fetched successfully!");
    return response;
  } catch (error) {
    console.error("❌ [LAB TEST SERVICE] Error fetching test results:", error);
    throw error;
  }
};

/**
 * Get lab centers
 * @returns {Promise<object>} - Response with lab centers data
 */
export const getLabCenters = async () => {
  try {
    console.log("🔬 [LAB TEST SERVICE] Fetching lab centers...");
    const response = await get("/lab");
    console.log("✅ [LAB TEST SERVICE] Lab centers fetched successfully!");
    return response;
  } catch (error) {
    console.error("❌ [LAB TEST SERVICE] Error fetching lab centers:", error);
    throw error;
  }
};

/**
 * Book a lab test
 * @param {object} bookingData - Booking data
 * @param {string} bookingData.testId - Test ID
 * @param {string} bookingData.labId - Lab ID
 * @param {string} bookingData.collection - Collection type (home_collection or lab_collection)
 * @param {string} bookingData.date - Booking date in ISO format
 * @returns {Promise<object>} - Response with booking data
 */
export const bookTest = async (bookingData) => {
  try {
    console.log("🔬 [LAB TEST SERVICE] Booking test...", bookingData);
    const response = await post("/test-booking", bookingData);
    console.log("✅ [LAB TEST SERVICE] Test booked successfully!");
    return response;
  } catch (error) {
    console.error("❌ [LAB TEST SERVICE] Error booking test:", error);
    throw error;
  }
};

/**
 * Initialize payment for test booking
 * @param {object} paymentData - Payment initialization data
 * @param {string} paymentData.testBookingId - Test booking ID
 * @param {string} paymentData.collection - Collection type
 * @param {string} paymentData.date - Booking date in ISO format
 * @returns {Promise<object>} - Response with payment initialization data
 */
export const initializeTestPayment = async (paymentData) => {
  try {
    console.log("💳 [LAB TEST SERVICE] Initializing test payment...", paymentData);
    const response = await post("/payments/initialize/test-booking", paymentData);
    console.log("✅ [LAB TEST SERVICE] Test payment initialized successfully!");
    return response;
  } catch (error) {
    console.error("❌ [LAB TEST SERVICE] Error initializing test payment:", error);
    throw error;
  }
};

