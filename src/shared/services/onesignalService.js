import OneSignal from "react-native-onesignal";
import { ONESIGNAL_APP_ID } from "../config/onesignalConfig";

/**
 * OneSignal Push Notification Service
 *
 * Handles initialization and management of OneSignal push notifications
 */
class OneSignalService {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Initialize OneSignal with the app ID
   */
  async initialize() {
    if (this.isInitialized) {
      console.log("OneSignal already initialized");
      return;
    }

    try {
      if (!ONESIGNAL_APP_ID) {
        console.warn("OneSignal App ID is not configured");
        return;
      }

      // Initialize OneSignal
      OneSignal.setAppId(ONESIGNAL_APP_ID);

      // Request permission for push notifications
      const permissionResult = await OneSignal.promptForPushNotificationsWithUserResponse();
      console.log("OneSignal permission result:", permissionResult);

      // Get the device's push token
      const deviceState = await OneSignal.getDeviceState();
      console.log("OneSignal device state:", deviceState);

      this.isInitialized = true;
      console.log("OneSignal initialized successfully");
    } catch (error) {
      console.error("Error initializing OneSignal:", error);
    }
  }

  /**
   * Set an external user ID (e.g., your app's user ID)
   * This allows you to send notifications to specific users
   */
  async setExternalUserId(userId) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      await OneSignal.setExternalUserId(userId);
      console.log("OneSignal external user ID set:", userId);
    } catch (error) {
      console.error("Error setting OneSignal external user ID:", error);
    }
  }

  /**
   * Remove the external user ID (e.g., on logout)
   */
  async removeExternalUserId() {
    try {
      await OneSignal.removeExternalUserId();
      console.log("OneSignal external user ID removed");
    } catch (error) {
      console.error("Error removing OneSignal external user ID:", error);
    }
  }

  /**
   * Set notification opened handler
   * This is called when a user taps on a notification
   */
  setNotificationOpenedHandler(handler) {
    OneSignal.setNotificationOpenedHandler(handler);
  }

  /**
   * Set notification received handler
   * This is called when a notification is received while the app is in foreground
   */
  setNotificationWillShowInForegroundHandler(handler) {
    OneSignal.setNotificationWillShowInForegroundHandler(handler);
  }

  /**
   * Get the device's push token
   */
  async getPushToken() {
    try {
      const deviceState = await OneSignal.getDeviceState();
      return deviceState?.userId || null;
    } catch (error) {
      console.error("Error getting OneSignal push token:", error);
      return null;
    }
  }

  /**
   * Get the device's subscription status
   */
  async getSubscriptionStatus() {
    try {
      const deviceState = await OneSignal.getDeviceState();
      return {
        isSubscribed: deviceState?.isSubscribed || false,
        userId: deviceState?.userId || null,
      };
    } catch (error) {
      console.error("Error getting OneSignal subscription status:", error);
      return { isSubscribed: false, userId: null };
    }
  }
}

// Export a singleton instance
export default new OneSignalService();
