import { OneSignal } from "react-native-onesignal";
import { ONESIGNAL_APP_ID } from "../config/onesignalConfig";

/**
 * OneSignal Push Notification Service (react-native-onesignal v5 API)
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

      // Initialize OneSignal (v5 API)
      OneSignal.initialize(ONESIGNAL_APP_ID);

      // Optionally request permission for push notifications
      try {
        const granted = await OneSignal.Notifications.requestPermission(false);
        console.log("OneSignal permission result:", granted);
      } catch (permError) {
        console.warn("OneSignal permission request:", permError?.message || permError);
      }

      this.isInitialized = true;
      console.log("OneSignal initialized successfully");
    } catch (error) {
      console.error("Error initializing OneSignal:", error);
    }
  }

  /**
   * Set an external user ID (e.g., your app's user ID)
   * This allows you to send notifications to specific users (v5: login)
   */
  async setExternalUserId(userId) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      OneSignal.login(userId);
      console.log("OneSignal external user ID set:", userId);
    } catch (error) {
      console.error("Error setting OneSignal external user ID:", error);
    }
  }

  /**
   * Remove the external user ID (e.g., on logout) (v5: logout)
   */
  async removeExternalUserId() {
    try {
      OneSignal.logout();
      console.log("OneSignal external user ID removed");
    } catch (error) {
      console.error("Error removing OneSignal external user ID:", error);
    }
  }

  /**
   * Set notification opened handler
   * This is called when a user taps on a notification (v5: 'click' event)
   */
  setNotificationOpenedHandler(handler) {
    OneSignal.Notifications.addEventListener("click", handler);
  }

  /**
   * Set notification received handler
   * This is called when a notification is received while the app is in foreground (v5: 'foregroundWillDisplay')
   */
  setNotificationWillShowInForegroundHandler(handler) {
    OneSignal.Notifications.addEventListener("foregroundWillDisplay", handler);
  }

  /**
   * Get the device's push subscription ID
   */
  async getPushToken() {
    try {
      const id = await OneSignal.User.pushSubscription.getIdAsync();
      return id ?? null;
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
      const [id, optedIn] = await Promise.all([
        OneSignal.User.pushSubscription.getIdAsync(),
        OneSignal.User.pushSubscription.getOptedInAsync(),
      ]);
      return {
        isSubscribed: optedIn ?? false,
        userId: id ?? null,
      };
    } catch (error) {
      console.error("Error getting OneSignal subscription status:", error);
      return { isSubscribed: false, userId: null };
    }
  }
}

// Export a singleton instance
export default new OneSignalService();
