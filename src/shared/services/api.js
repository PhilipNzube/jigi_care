/**
 * Base API Service
 * Handles all HTTP requests with base URL configuration
 */

import {
  getToken,
  storeToken,
  storeRefreshToken,
  getRefreshToken,
} from "../utils/storage";

const BASE_URL = "https://jiggy-care.onrender.com/api/v1";

// Mutex/lock for refresh token mechanism - ensures only one refresh call at a time
let refreshTokenPromise = null;

// Endpoints that should NOT trigger refresh token logic (login/signup)
const EXCLUDED_ENDPOINTS = [
  "/auth/signin",
  "/auth/signup",
  "/users/signup",
  "/auth/google/mobile-signin",
  "/auth/refresh",
];

/**
 * Check if endpoint should be excluded from refresh token logic
 * @param {string} endpoint - API endpoint
 * @returns {boolean} - True if endpoint should be excluded
 */
const isExcludedEndpoint = (endpoint) => {
  return EXCLUDED_ENDPOINTS.some((excluded) => endpoint.includes(excluded));
};

/**
 * Refresh access token using refresh token
 * @returns {Promise<void>} - Resolves when token is refreshed
 */
const refreshAccessToken = async () => {
  // If a refresh is already in progress, wait for it
  if (refreshTokenPromise) {
    console.log("🔄 [REFRESH TOKEN] Refresh already in progress, waiting...");
    return refreshTokenPromise;
  }

  // Start new refresh
  refreshTokenPromise = (async () => {
    try {
      console.log("🔄 [REFRESH TOKEN] Starting token refresh...");

      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const url = `${BASE_URL}/auth/refresh`;
      const requestHeaders = {
        "Content-Type": "application/json",
        "x-client-type": "mobile",
        "x-refresh-token": refreshToken, // Pass stored refresh token in header
      };

      console.log("🔄 [REFRESH TOKEN] Making PATCH request to:", url);
      console.log(
        "🔄 [REFRESH TOKEN] Sending x-refresh-token in header (last 10 chars):",
        "***" + refreshToken.slice(-10)
      );

      const response = await fetch(url, {
        method: "PATCH",
        headers: requestHeaders,
      });

      const data = await response.json();

      console.log(
        "🔄 [REFRESH TOKEN] Refresh response status:",
        response.status
      );
      console.log(
        "🔄 [REFRESH TOKEN] Refresh response data:",
        JSON.stringify(data, null, 2)
      );

      if (!response.ok) {
        throw new Error(data.message || "Failed to refresh token");
      }

      // Extract tokens from response headers - ALWAYS store if present
      const accessTokenHeader = response.headers.get("x-access-token");
      const refreshTokenHeader = response.headers.get("x-refresh-token");

      console.log("🔑 [REFRESH TOKEN] Checking response headers for tokens...");
      console.log(
        "🔑 [REFRESH TOKEN] x-access-token present:",
        !!accessTokenHeader
      );
      console.log(
        "🔑 [REFRESH TOKEN] x-refresh-token present:",
        !!refreshTokenHeader
      );

      // Always store access token if present
      if (accessTokenHeader) {
        console.log(
          "🔑 [REFRESH TOKEN] Received new x-access-token in headers"
        );
        try {
          await storeToken(accessTokenHeader);
          console.log(
            "✅ [REFRESH TOKEN] New access token stored successfully"
          );
        } catch (storeError) {
          console.error(
            "❌ [REFRESH TOKEN] Error storing access token:",
            storeError
          );
          throw new Error("Failed to store new access token");
        }
      } else {
        console.warn(
          "⚠️ [REFRESH TOKEN] No x-access-token found in response headers"
        );
      }

      // Always store refresh token if present
      if (refreshTokenHeader) {
        console.log(
          "🔑 [REFRESH TOKEN] Received new x-refresh-token in headers"
        );
        try {
          await storeRefreshToken(refreshTokenHeader);
          console.log(
            "✅ [REFRESH TOKEN] New refresh token stored successfully"
          );
        } catch (storeError) {
          console.error(
            "❌ [REFRESH TOKEN] Error storing refresh token:",
            storeError
          );
          throw new Error("Failed to store new refresh token");
        }
      } else {
        console.warn(
          "⚠️ [REFRESH TOKEN] No x-refresh-token found in response headers"
        );
      }

      // Verify at least one token was stored
      if (!accessTokenHeader && !refreshTokenHeader) {
        console.error(
          "❌ [REFRESH TOKEN] No tokens found in response headers!"
        );
        throw new Error(
          "Refresh token response did not include new tokens in headers"
        );
      }

      console.log("✅ [REFRESH TOKEN] Token refresh completed successfully");
    } catch (error) {
      console.error("❌ [REFRESH TOKEN] Error refreshing token:", error);
      throw error;
    } finally {
      // Clear the promise so next refresh can proceed
      refreshTokenPromise = null;
    }
  })();

  return refreshTokenPromise;
};

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
    console.log(
      "🌐 [API REQUEST] Headers:",
      JSON.stringify(requestHeaders, null, 2)
    );
    if (body) {
      console.log("🌐 [API REQUEST] Body:", body);
    }

    let response = await fetch(url, config);
    let data = await response.json();

    console.log("🌐 [API RESPONSE] Status:", response.status);
    console.log(
      "🌐 [API RESPONSE] Full response data:",
      JSON.stringify(data, null, 2)
    );

    // Check for unauthorized error (401 or 400 with "Unauthorized" message) and attempt token refresh
    // Only for endpoints that are NOT excluded (login/signup)
    const isUnauthorized =
      response.status === 401 ||
      (response.status === 400 &&
        ((data.error && data.error.toLowerCase().includes("unauthorized")) ||
          (data.message &&
            data.message.toLowerCase().includes("unauthorized"))));

    if (isUnauthorized && !isExcludedEndpoint(endpoint)) {
      console.log(
        "🔐 [API REQUEST] Unauthorized error detected (status:",
        response.status,
        "), attempting token refresh..."
      );

      try {
        // Refresh the token
        await refreshAccessToken();

        // Retry the original request with new token
        const newAccessToken = await getToken();
        if (newAccessToken) {
          requestHeaders.Authorization = `Bearer ${newAccessToken}`;
          config.headers = requestHeaders;

          console.log(
            "🔄 [API REQUEST] Retrying original request with new token..."
          );
          response = await fetch(url, config);
          data = await response.json();

          console.log("🔄 [API RESPONSE] Retry status:", response.status);
          console.log(
            "🔄 [API RESPONSE] Retry response data:",
            JSON.stringify(data, null, 2)
          );
        }
      } catch (refreshError) {
        console.error("❌ [API REQUEST] Token refresh failed:", refreshError);
        // If refresh fails, throw the original unauthorized error
        const error = new Error(
          data.message || "Unauthorized. Please sign in again."
        );
        error.statusCode = response.status;
        error.data = data;
        throw error;
      }
    }

    // Extract tokens from response headers
    // NOTE: We ONLY store tokens from backend response headers (x-access-token, x-refresh-token)
    // We do NOT store Google idToken or any other tokens - only backend-issued tokens
    const accessTokenHeader = response.headers.get("x-access-token");
    const refreshTokenHeader = response.headers.get("x-refresh-token");

    if (accessTokenHeader) {
      console.log("🔑 [API RESPONSE] Received x-access-token in headers");
      console.log(
        "🔑 [API RESPONSE] Access token (last 10 chars):",
        "***" + accessTokenHeader.slice(-10)
      );
      await storeToken(accessTokenHeader);
      console.log("✅ [API RESPONSE] Access token stored successfully");
    }

    if (refreshTokenHeader) {
      console.log("🔑 [API RESPONSE] Received x-refresh-token in headers");
      console.log(
        "🔑 [API RESPONSE] Refresh token (last 10 chars):",
        "***" + refreshTokenHeader.slice(-10)
      );
      await storeRefreshToken(refreshTokenHeader);
      console.log("✅ [API RESPONSE] Refresh token stored successfully");
    }

    // Handle non-2xx responses
    if (!response.ok) {
      console.error(
        "❌ [API RESPONSE] Error response:",
        JSON.stringify(data, null, 2)
      );
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
