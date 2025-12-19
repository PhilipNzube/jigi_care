/**
 * Base API Service
 * Handles all HTTP requests with base URL configuration
 */

const BASE_URL = "https://jiggy-care.onrender.com/api/v1";

/**
 * Makes an API request
 * @param {string} endpoint - API endpoint (e.g., '/users/signup')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise} - Response data
 */
export const apiRequest = async (endpoint, options = {}) => {
  const {
    method = "GET",
    body,
    headers = {},
    token,
    ...otherOptions
  } = options;

  const url = `${BASE_URL}${endpoint}`;

  const requestHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  // Add authorization token if provided
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const config = {
    method,
    headers: requestHeaders,
    ...otherOptions,
  };

  // Add body for POST, PUT, PATCH requests
  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    // Handle non-2xx responses
    if (!response.ok) {
      const error = new Error(data.message || "An error occurred");
      error.statusCode = data.statusCode || response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // Re-throw if it's already our custom error
    if (error.statusCode) {
      throw error;
    }

    // Handle network errors
    const networkError = new Error(
      error.message || "Network error. Please check your connection."
    );
    networkError.statusCode = 0;
    networkError.isNetworkError = true;
    throw networkError;
  }
};

/**
 * GET request helper
 */
export const get = (endpoint, options = {}) => {
  return apiRequest(endpoint, { ...options, method: "GET" });
};

/**
 * POST request helper
 */
export const post = (endpoint, body, options = {}) => {
  return apiRequest(endpoint, { ...options, method: "POST", body });
};

/**
 * PUT request helper
 */
export const put = (endpoint, body, options = {}) => {
  return apiRequest(endpoint, { ...options, method: "PUT", body });
};

/**
 * PATCH request helper
 */
export const patch = (endpoint, body, options = {}) => {
  return apiRequest(endpoint, { ...options, method: "PATCH", body });
};

/**
 * DELETE request helper
 */
export const del = (endpoint, options = {}) => {
  return apiRequest(endpoint, { ...options, method: "DELETE" });
};

export default {
  apiRequest,
  get,
  post,
  put,
  patch,
  delete: del,
};

