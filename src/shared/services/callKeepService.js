import { Platform, AppState } from "react-native";
import RNCallKeep from "react-native-callkeep";
import { navigate, navigationRef } from "../navigation/navigationRef";
import {
  startRingtone,
  stopRingtone,
  getRingtoneURI,
} from "../../features/consult/utils/ringtone";
import { rejectCall, connectSocket, getSocket } from "../../features/consult/services/chatService";

/**
 * CallKeep Service
 * 
 * Manages the native OS call UI integrations (react-native-callkeep)
 * for incoming calls in background or terminated states.
 */
class CallKeepService {
  constructor() {
    this.isInitialized = false;
    this.activeCalls = {}; // Map of UUID -> { callerId, callerName, conversationId, callType }
    this.isRegistered = false;
  }

  /**
   * Setup CallKeep and configure native event listeners.
   * Call this as early as possible in your app's lifecycle (e.g. index.js).
   */
  async setup() {
    if (this.isInitialized) {
      console.log("📞 [CALLKEEP SERVICE] Already initialized");
      return;
    }

    try {
      // Request runtime permissions on Android
      if (Platform.OS === "android") {
        // Request POST_NOTIFICATIONS on Android 13+ (API 33+)
        if (Platform.Version >= 33) {
          const { PermissionsAndroid } = require("react-native");
          try {
            console.log("📞 [CALLKEEP SERVICE] Requesting POST_NOTIFICATIONS permission...");
            await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );
          } catch (err) {
            console.warn("⚠️ [CALLKEEP SERVICE] Failed to request POST_NOTIFICATIONS permission:", err);
          }
        }
      }

      const options = {
        ios: {
          appName: "JigiCare",
        },
        android: {
          alertTitle: "Permissions required",
          alertDescription: "This application needs to access your phone accounts",
          cancelButton: "Cancel",
          okButton: "ok",
          imageName: "phone_account_icon",
          additionalPermissions: [],
          foregroundService: {
            channelId: "com.jigicare.app.calling",
            channelName: "Incoming Call Service",
            notificationTitle: "Jigi Care is handling a call",
            notificationIcon: "ic_launcher",
          },
          selfManaged: false, // Shows the native Android Telecom UI
        },
      };

      console.log("📞 [CALLKEEP SERVICE] Initializing CallKeep with options...");
      await RNCallKeep.setup(options);
      
      // Register Android Connection Service explicitly
      if (Platform.OS === "android") {
        RNCallKeep.registerPhoneAccount();
        RNCallKeep.registerAndroidEvents();
        
        // Check and prompt for Phone Account permission
        try {
          const hasPhoneAccount = await RNCallKeep.checkPhoneAccountPermission();
          console.log("📞 [CALLKEEP SERVICE] Phone account permission status:", hasPhoneAccount);
        } catch (err) {
          console.warn("⚠️ [CALLKEEP SERVICE] Phone account permission check failed:", err);
        }
      }

      this.registerEventListeners();
      this.isInitialized = true;
      console.log("✅ [CALLKEEP SERVICE] CallKeep initialized successfully");
    } catch (error) {
      console.error("❌ [CALLKEEP SERVICE] Failed to initialize CallKeep:", error);
    }
  }

  /**
   * Register CallKeep native event callbacks
   */
  registerEventListeners() {
    if (this.isRegistered) return;

    // Triggered when user answers native call UI
    RNCallKeep.addEventListener("answerCall", async ({ callUUID }) => {
      console.log(`📞 [CALLKEEP SERVICE] Native call answered! UUID: ${callUUID}`);
      stopRingtone();

      const callDetails = this.activeCalls[callUUID];
      if (callDetails) {
        const { callerId, callerName, conversationId, callType } = callDetails;
        console.log(`📞 [CALLKEEP SERVICE] Answering call details:`, callDetails);

        // Tell CallKeep native side that we accepted
        RNCallKeep.answerIncomingCall(callUUID);
        
        // Android requires bringing the app to foreground on answer (often handled natively, 
        // but navigating will trigger window focus)
        RNCallKeep.backToForeground();

        // Navigate to ChatPage with autoAccept parameter
        // ChatPage will pick up this parameter, connect socket, and accept the WebRTC offer
        navigate("ChatPage", {
          bookingId: undefined,
          conversationId,
          fromUserId: callerId,
          callType,
          isIncoming: true,
          autoAccept: true,
          timestamp: Date.now(),
        });
      } else {
        console.warn(`⚠️ [CALLKEEP SERVICE] Answered call, but no details found for UUID: ${callUUID}`);
      }
    });

    // Triggered when user declines or ends call in native UI
    RNCallKeep.addEventListener("endCall", async ({ callUUID }) => {
      console.log(`📞 [CALLKEEP SERVICE] Native call ended/declined! UUID: ${callUUID}`);
      stopRingtone();

      const callDetails = this.activeCalls[callUUID];
      if (callDetails) {
        const { callerId } = callDetails;
        
        // Notify backend of rejection so the caller stops ringing
        try {
          const socket = getSocket();
          if (socket && socket.connected) {
            console.log("📞 [CALLKEEP SERVICE] Emitting reject call via active socket");
            rejectCall(callerId, "Declined");
          } else {
            console.log("🔌 [CALLKEEP SERVICE] Socket disconnected, establishing quick connection to reject call...");
            const tempSocket = connectSocket(callerId, "patient", {
              onConnect: () => {
                console.log("🔌 [CALLKEEP SERVICE] Temp socket connected, rejecting call...");
                rejectCall(callerId, "Declined");
                // Small delay to allow emit to reach server, then cleanup
                setTimeout(() => {
                  tempSocket.disconnect();
                }, 1000);
              }
            });
          }
        } catch (e) {
          console.error("❌ [CALLKEEP SERVICE] Error emitting reject call:", e);
        }

        // Clean up from active calls
        delete this.activeCalls[callUUID];
      }

      RNCallKeep.endCall(callUUID);
    });

    this.isRegistered = true;
    console.log("✅ [CALLKEEP SERVICE] Registered native call listeners");
  }

  /**
   * Display an incoming call UI via react-native-callkeep
   * 
   * @param {string} uuid - Unique call UUID (UUIDv4)
   * @param {string} callerName - Name of the caller (e.g. Dr. Name)
   * @param {string} handle - Handle/Number to display (e.g. video call or audio call)
   * @param {string} callType - 'video' or 'audio'
   * @param {string} conversationId - Chat conversation ID
   * @param {string} callerId - User ID of the caller
   */
  displayIncomingCall(uuid, callerName, handle, callType, conversationId, callerId) {
    if (!this.isInitialized) {
      console.warn("⚠️ [CALLKEEP SERVICE] Display call requested before CallKeep was initialized. Initializing now...");
      this.setup();
    }

    // Save call details for mapping when callbacks are triggered
    this.activeCalls[uuid] = {
      callerId,
      callerName,
      conversationId,
      callType,
    };

    console.log(`📞 [CALLKEEP SERVICE] Displaying native call for ${callerName} (UUID: ${uuid})`);
    
    // Trigger react-native-callkeep native incoming call overlay
    RNCallKeep.displayIncomingCall(
      uuid,
      handle || "Jigi Care Call",
      callerName || "Consultant",
      "number",
      callType === "video"
    );

    // Play the custom incoming call audio ringtone
    // Since App is in background/terminated, this will be played by our Headless JS task
    startRingtone(getRingtoneURI("incoming"));
  }

  /**
   * Stop any active ringtone and clear native calls
   */
  endAllCalls() {
    console.log("📞 [CALLKEEP SERVICE] Ending all native calls and stopping ringtone");
    stopRingtone();
    
    Object.keys(this.activeCalls).forEach(uuid => {
      RNCallKeep.endCall(uuid);
    });
    
    this.activeCalls = {};
  }
}

export default new CallKeepService();
