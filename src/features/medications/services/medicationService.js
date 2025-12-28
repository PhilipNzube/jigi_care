/**
 * Medication Service
 * Handles all medication-related API calls
 */

import { get } from "../../../shared/services/api";

/**
 * Search medications with filters
 * @param {Object} params - Search parameters
 * @param {string} params.search - Search query
 * @param {string} params.category - Category filter
 * @param {string} params.stockStatus - Stock status filter (in_stock, out_of_stock, low_stock)
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<Object>} - Medication search results
 */
export const searchMedications = async (params = {}) => {
  try {
    const {
      search = "",
      category = "",
      stockStatus = "",
      page = 1,
      limit = 10,
    } = params;

    // Build query string
    const queryParams = new URLSearchParams();
    if (search) queryParams.append("search", search);
    if (category) queryParams.append("category", category);
    if (stockStatus) queryParams.append("stockStatus", stockStatus);
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());

    const endpoint = `/medication/find-all?${queryParams.toString()}`;
    const response = await get(endpoint);

    return response;
  } catch (error) {
    console.error(
      "❌ [MEDICATION SERVICE] Error searching medications:",
      error
    );
    throw error;
  }
};

/**
 * Get user orders
 * @returns {Promise<Array>} - User orders
 */
export const getUserOrders = async () => {
  try {
    const response = await get("/orders/find-by-userId");
    return response.data || [];
  } catch (error) {
    console.error("❌ [MEDICATION SERVICE] Error fetching orders:", error);
    throw error;
  }
};
