/**
 * Toast Utility
 * Provides easy-to-use functions for showing success and error messages
 */

import Toast from "react-native-toast-message";

/**
 * Show success toast
 * @param {string} message - Success message to display
 * @param {string} title - Optional title (defaults to "Success")
 */
export const showSuccess = (message, title = "Success") => {
  Toast.show({
    type: "success",
    text1: title,
    text2: message,
    position: "top",
    visibilityTime: 3000,
  });
};

/**
 * Show error toast
 * @param {string} message - Error message to display
 * @param {string} title - Optional title (defaults to "Error")
 */
export const showError = (message, title = "Error") => {
  Toast.show({
    type: "error",
    text1: title,
    text2: message,
    position: "top",
    visibilityTime: 4000,
  });
};

/**
 * Show info toast
 * @param {string} message - Info message to display
 * @param {string} title - Optional title (defaults to "Info")
 */
export const showInfo = (message, title = "Info") => {
  Toast.show({
    type: "info",
    text1: title,
    text2: message,
    position: "top",
    visibilityTime: 3000,
  });
};

/**
 * Show warning toast
 * @param {string} message - Warning message to display
 * @param {string} title - Optional title (defaults to "Warning")
 */
export const showWarning = (message, title = "Warning") => {
  Toast.show({
    type: "info",
    text1: title,
    text2: message,
    position: "bottom",
    visibilityTime: 2000,
  });
};

export default {
  showSuccess,
  showError,
  showInfo,
  showWarning,
};

