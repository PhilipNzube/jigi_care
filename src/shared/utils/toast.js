/**
 * Toast Utility
 * Bottom-position toasts that stay longer and show full messages (Flutter-style)
 */

import Toast from "react-native-toast-message";

const BOTTOM_CONFIG = {
  position: "bottom",
  visibilityTime: 5500,
  topOffset: 0,
  bottomOffset: 60,
  // Show full message without cutting off or ellipsis
  text1NumberOfLines: 0,
  text2NumberOfLines: 0,
};

/**
 * Show success toast (bottom, long enough to read)
 * @param {string} message - Success message to display
 * @param {string} title - Optional title (defaults to "Success")
 */
export const showSuccess = (message, title = "Success") => {
  Toast.show({
    type: "success",
    text1: title,
    text2: message,
    ...BOTTOM_CONFIG,
    visibilityTime: 4000,
  });
};

/**
 * Show error toast (bottom, full message, catches attention)
 * @param {string} message - Error message to display (full message shown)
 * @param {string} title - Optional title (defaults to "Error")
 */
export const showError = (message, title = "Error") => {
  Toast.show({
    type: "error",
    text1: title,
    text2: message,
    ...BOTTOM_CONFIG,
    visibilityTime: 6000,
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
    ...BOTTOM_CONFIG,
    visibilityTime: 4000,
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
    ...BOTTOM_CONFIG,
    visibilityTime: 4000,
  });
};

export default {
  showSuccess,
  showError,
  showInfo,
  showWarning,
};

