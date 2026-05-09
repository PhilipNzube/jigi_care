import { OneSignal, LogLevel } from "react-native-onesignal";
import { ONESIGNAL_APP_ID } from "../config/onesignalConfig";
import { navigationRef, navigate } from "../navigation/navigationRef";
import {
  startRingtone,
  stopRingtone,
  getRingtoneURI,
} from "../../features/consult/utils/ringtone";

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

      // Enable verbose logging for debugging (remove in production if needed)
      OneSignal.Debug.setLogLevel(LogLevel.Verbose);

      // Initialize OneSignal (v5 API)
      OneSignal.initialize(ONESIGNAL_APP_ID);

      // --- Default Event Listeners ---

      // Handle notification clicks
      OneSignal.Notifications.addEventListener("click", (event) => {
        console.log("OneSignal: notification clicked:", event);

        // Stop any ringtone when clicking a notification
        stopRingtone();

        const { notification } = event;
        const data = notification.additionalData;

        if (data) {
          console.log("OneSignal: Navigating with data:", data);

          // Category-based navigation
          const category = data.category || "Message";

          if (category === "Call") {
            // If it's a call, we go to ChatPage first which handles the incoming call UI
            navigate("ChatPage", {
              bookingId: data.bookingId,
              conversationId: data.conversationId,
              fromUserId: data.fromUserId, // Ensure we pass who is calling
              callType: data.callType || "video",
              isIncoming: true,
              timestamp: Date.now(),
            });
          } else if (category === "booking" || category === "Appointment" || category === "FollowUp") {
            setTimeout(() => {
              navigate("MainApp", {
                screen: "BottomTabs",
                params: { screen: "appointments" }
              });
            }, 1000);
          } else if (category === "order") {
            setTimeout(() => {
              navigate("MainApp", {
                screen: "BottomTabs",
                params: { screen: "medication" }
              });
            }, 1000);
          } else if (data.bookingId || data.conversationId) {
            // Default to ChatPage for messages or generic notifications if we have chat-related IDs
            navigate("ChatPage", {
              bookingId: data.bookingId,
              conversationId: data.conversationId,
              fromUserId: data.fromUserId,
            });
          }
        }
      });

      // Handle foreground notifications (v5 requirement)
      OneSignal.Notifications.addEventListener("foregroundWillDisplay", (event) => {
        console.log("OneSignal: notification received in foreground:", event);
        
        const data = event.notification.additionalData;
        
        // If it's a call in foreground, start the ringtone
        if (data && data.category === "Call") {
          console.log("OneSignal: Call notification in foreground, starting ringtone");
          startRingtone(getRingtoneURI("incoming"));
        }

        // Display the notification by default
        event.notification.display();
      });

      // Optionally request permission for push notifications
      try {
        const granted = await OneSignal.Notifications.requestPermission(true);
        console.log("OneSignal permission result:", granted);
      } catch (permError) {
        console.warn(
          "OneSignal permission request error:",
          permError?.message || permError
        );
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
