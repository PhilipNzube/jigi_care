/**
 * Base API Service
 * Handles all HTTP requests with base URL configuration
 */

import { getToken, storeToken, storeRefreshToken } from "../utils/storage";

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
    skipAuth = false, // Option to skip auto-adding auth token
    ...otherOptions
  } = options;

  const url = `${BASE_URL}${endpoint}`;

  // Get stored access token if not explicitly provided and auth is not skipped
  let accessToken = token;
  if (!accessToken && !skipAuth) {
    accessToken = await getToken();
  }

  const requestHeaders = {
    "Content-Type": "application/json",
    "x-client-type": "mobile", // Add x-client-type header to all requests
    ...headers,
  };

  // Add authorization token if available
  if (accessToken) {
    requestHeaders.Authorization = `Bearer ${accessToken}`;
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
    console.log("🌐 [API REQUEST] Making request to:", url);
    console.log("🌐 [API REQUEST] Method:", method);
    console.log("🌐 [API REQUEST] Headers:", JSON.stringify(requestHeaders, null, 2));
    if (body) {
      console.log("🌐 [API REQUEST] Body:", body);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    console.log("🌐 [API RESPONSE] Status:", response.status);
    console.log("🌐 [API RESPONSE] Full response data:", JSON.stringify(data, null, 2));

    // Extract tokens from response headers
    // NOTE: We ONLY store tokens from backend response headers (x-access-token, x-refresh-token)
    // We do NOT store Google idToken or any other tokens - only backend-issued tokens
    const accessTokenHeader = response.headers.get("x-access-token");
    const refreshTokenHeader = response.headers.get("x-refresh-token");

    if (accessTokenHeader) {
      console.log("🔑 [API RESPONSE] Received x-access-token in headers");
      console.log("🔑 [API RESPONSE] Access token (last 10 chars):", "***" + accessTokenHeader.slice(-10));
      await storeToken(accessTokenHeader);
      console.log("✅ [API RESPONSE] Access token stored successfully");
    }

    if (refreshTokenHeader) {
      console.log("🔑 [API RESPONSE] Received x-refresh-token in headers");
      console.log("🔑 [API RESPONSE] Refresh token (last 10 chars):", "***" + refreshTokenHeader.slice(-10));
      await storeRefreshToken(refreshTokenHeader);
      console.log("✅ [API RESPONSE] Refresh token stored successfully");
    }

    // Handle non-2xx responses
    if (!response.ok) {
      console.error("❌ [API RESPONSE] Error response:", JSON.stringify(data, null, 2));
      const error = new Error(data.message || "An error occurred");
      error.statusCode = data.statusCode || response.status;
      error.data = data;
      throw error;
    }

    console.log("✅ [API RESPONSE] Success!");
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
  console.log("🌐 [API GET] Making GET request to:", endpoint);
  console.log("🌐 [API GET] Options:", JSON.stringify(options, null, 2));
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

