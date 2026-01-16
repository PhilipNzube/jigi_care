/**
 * Consultant Service
 * Handles consultant-related API calls
 */

import { get, post } from "../../../shared/services/api";

/**
 * Get list of all consultants
 * @returns {Promise<object>} - Response with consultant list data
 */
export const getConsultantsList = async () => {
  console.log("📋 [CONSULTANT LIST] Fetching consultants list...");

  try {
    const endpoint = `/consultant/list`;
    console.log("📋 [CONSULTANT LIST] Making GET request to:", endpoint);

    const response = await get(endpoint);

    console.log("✅ [CONSULTANT LIST] Fetch successful!");
    console.log("✅ [CONSULTANT LIST] Full response data:", JSON.stringify(response, null, 2));

    // Handle response format - response.data contains the array
    const consultants = response.data || response.consultants || response || [];
    console.log("✅ [CONSULTANT LIST] Consultants found:", consultants.length);

    return {
      success: true,
      data: consultants,
      response, // Include full response for logging
    };
  } catch (error) {
    console.error("❌ [CONSULTANT LIST] Fetch error:", error);
    console.error("❌ [CONSULTANT LIST] Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
};

/**
 * Search for consultants
 * @param {string} query - Search query (e.g., "dentist", "cardiologist")
 * @returns {Promise<object>} - Response with consultant data
 */
export const searchConsultants = async (query) => {
  console.log("🔍 [CONSULTANT SEARCH] Starting consultant search...");
  console.log("🔍 [CONSULTANT SEARCH] Query:", query);

  if (!query || query.trim() === "") {
    console.log("⚠️ [CONSULTANT SEARCH] Empty query, returning empty results");
    return { success: true, data: [] };
  }

  try {
    const endpoint = `/consultant/search-consultant?query=${encodeURIComponent(query.trim())}`;
    console.log("🔍 [CONSULTANT SEARCH] Making GET request to:", endpoint);

    const response = await get(endpoint);

    console.log("✅ [CONSULTANT SEARCH] Search successful!");
    console.log("✅ [CONSULTANT SEARCH] Full response data:", JSON.stringify(response, null, 2));
    console.log("✅ [CONSULTANT SEARCH] Response type:", typeof response);
    console.log("✅ [CONSULTANT SEARCH] Response keys:", Object.keys(response || {}));

    // Handle response format - could be response.data or response directly
    const consultants = response.data || response.consultants || response || [];
    console.log("✅ [CONSULTANT SEARCH] Consultants found:", consultants.length);
    console.log("✅ [CONSULTANT SEARCH] Consultants data:", JSON.stringify(consultants, null, 2));

    return {
      success: true,
      data: consultants,
      response, // Include full response for logging
    };
  } catch (error) {
    console.error("❌ [CONSULTANT SEARCH] Search error:", error);
    console.error("❌ [CONSULTANT SEARCH] Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
};

/**
 * Get reviews for a consultant
 * @param {string} consultantId - Consultant ID
 * @returns {Promise<object>} - Response with reviews data
 */
export const getConsultantReviews = async (consultantId) => {
  console.log("⭐ [CONSULTANT REVIEWS] Fetching reviews for consultant:", consultantId);

  if (!consultantId) {
    console.log("⚠️ [CONSULTANT REVIEWS] No consultant ID provided");
    return { success: true, data: [] };
  }

  try {
    const endpoint = `/rating/consultant?consultantId=${encodeURIComponent(consultantId)}`;
    console.log("⭐ [CONSULTANT REVIEWS] Making GET request to:", endpoint);

    const response = await get(endpoint);

    console.log("✅ [CONSULTANT REVIEWS] Fetch successful!");
    console.log("✅ [CONSULTANT REVIEWS] Full response data:", JSON.stringify(response, null, 2));

    // Handle response format - response.data contains the array
    const reviews = response.data || response.reviews || [];
    console.log("✅ [CONSULTANT REVIEWS] Reviews found:", reviews.length);

    return {
      success: true,
      data: reviews,
      response, // Include full response for logging
    };
  } catch (error) {
    console.error("❌ [CONSULTANT REVIEWS] Fetch error:", error);
    console.error("❌ [CONSULTANT REVIEWS] Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
};

/**
 * Create a rating/review for a consultant
 * @param {string} consultantId - Consultant ID
 * @param {number} rating - Rating value (e.g., 4.5)
 * @param {string} message - Review message
 * @returns {Promise<object>} - Response with rating data
 */
export const createRating = async (consultantId, rating, message) => {
  console.log("⭐ [CREATE RATING] Creating rating for consultant:", consultantId);
  console.log("⭐ [CREATE RATING] Rating:", rating);
  console.log("⭐ [CREATE RATING] Message:", message);

  if (!consultantId) {
    throw new Error("Consultant ID is required");
  }

  if (!rating || rating < 0 || rating > 5) {
    throw new Error("Rating must be between 0 and 5");
  }

  try {
    const endpoint = `/rating/create`;
    const body = {
      consultantId,
      rating,
      message: message || "",
    };

    console.log("⭐ [CREATE RATING] Making POST request to:", endpoint);
    console.log("⭐ [CREATE RATING] Request body:", JSON.stringify(body, null, 2));

    const response = await post(endpoint, body);

    console.log("✅ [CREATE RATING] Rating created successfully!");
    console.log("✅ [CREATE RATING] Full response data:", JSON.stringify(response, null, 2));

    return response;
  } catch (error) {
    console.error("❌ [CREATE RATING] Create error:", error);
    console.error("❌ [CREATE RATING] Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
};

export default {
  getConsultantsList,
  searchConsultants,
  getConsultantReviews,
  createRating,
};



