/**
 * OneSignal Configuration
 *
 * OneSignal App ID for push notifications
 * Get this from: https://onesignal.com/apps
 */
export const ONESIGNAL_APP_ID = "d5a2b8da-cb9b-4374-b13c-c749838f6768";

// Check if OneSignal App ID is configured
export const isOneSignalConfigured = () => {
  return (
    ONESIGNAL_APP_ID &&
    ONESIGNAL_APP_ID.length > 0 &&
    ONESIGNAL_APP_ID !== "YOUR_ONESIGNAL_APP_ID_HERE"
  );
};

export default {
  ONESIGNAL_APP_ID,
  isOneSignalConfigured,
};
