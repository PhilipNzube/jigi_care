/**
 * Medication Service
 * Handles all medication-related API calls
 */

import { get, post, del, patch } from "../../../shared/services/api";

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

/**
 * Get medication by ID
 * @param {string} id - Medication ID
 * @returns {Promise<object>} - Medication details
 */
export const getMedicationById = async (id) => {
  try {
    const response = await get(`/medication/find-one/${id}`);
    if (response && response.id) {
      return response;
    }
    return null;
  } catch (error) {
    console.error("❌ [MEDICATION SERVICE] Error fetching medication:", error);
    throw error;
  }
};

/**
 * Get cart
 * @returns {Promise<object>} - Cart data with items
 */
export const getCart = async () => {
  try {
    const response = await get("/cart");
    if (response && response.success && response.data) {
      return response.data;
    }
    return { items: [], id: null, patientId: null };
  } catch (error) {
    console.error("❌ [MEDICATION SERVICE] Error fetching cart:", error);
    throw error;
  }
};

/**
 * Update cart (add/update items)
 * @param {Array} items - Array of { medicationId, quantity }
 * @returns {Promise<object>} - Updated cart data
 */
export const updateCart = async (items) => {
  try {
    const response = await post("/cart", { items });
    if (response && response.success && response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("❌ [MEDICATION SERVICE] Error updating cart:", error);
    throw error;
  }
};

/**
 * Add item to cart
 * @param {string} medicationId - Medication ID
 * @param {number} quantity - Quantity to add
 * @returns {Promise<object>} - Updated cart data
 */
export const addItemToCart = async (medicationId, quantity = 1) => {
  try {
    const response = await post("/cart/items", {
      medicationId,
      quantity,
    });
    if (response && response.id) {
      return response;
    }
    return null;
  } catch (error) {
    console.error("❌ [MEDICATION SERVICE] Error adding item to cart:", error);
    throw error;
  }
};

/**
 * Update cart item quantity
 * @param {string} medicationId - Medication ID
 * @param {number} quantity - New quantity
 * @returns {Promise<object>} - Updated cart data
 */
export const updateCartItemQuantity = async (medicationId, quantity) => {
  try {
    const response = await patch("/cart", {
      items: [
        {
          medicationId,
          quantity,
        },
      ],
    });
    if (response && (response.id || (response.success && response.data))) {
      return response.id || response.data;
    }
    return null;
  } catch (error) {
    console.error(
      "❌ [MEDICATION SERVICE] Error updating cart item quantity:",
      error
    );
    throw error;
  }
};

/**
 * Delete item from cart
 * @param {string} medicationId - Medication ID to delete
 * @returns {Promise<object>} - Updated cart data
 */
export const deleteCartItem = async (medicationId) => {
  try {
    const response = await del(`/cart/items/${medicationId}`);
    if (response && response.id) {
      return response;
    }
    return null;
  } catch (error) {
    console.error("❌ [MEDICATION SERVICE] Error deleting cart item:", error);
    throw error;
  }
};

/**
 * Clear entire cart
 * @returns {Promise<object>} - Empty cart data
 */
export const clearCart = async () => {
  try {
    const response = await del("/cart");
    if (response && response.success) {
      return response.data || [];
    }
    return [];
  } catch (error) {
    console.error("❌ [MEDICATION SERVICE] Error clearing cart:", error);
    throw error;
  }
};
