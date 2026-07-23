import { Platform, AppState, DeviceEventEmitter } from "react-native";
import * as Calls from "expo-callkit-telecom";
import { navigate, navigationRef } from "../navigation/navigationRef";
import {
  startRingtone,
  stopRingtone,
  getRingtoneURI,
} from "../../features/consult/utils/ringtone";
import { rejectCall, connectSocket, getSocket } from "../../features/consult/services/chatService";

/**
 * CallKeep Service (expo-callkit-telecom Adapter)
 * 
 * Manages the native OS call UI integrations (using Jetpack Core-Telecom on Android
 * and CallKit on iOS) for incoming calls in background or terminated states.
 */
class CallKeepService {
  constructor() {
    this.isInitialized = false;
    this.activeCalls = {}; // Map of UUID -> { callerId, callerName, conversationId, callType, bookingId }
    this.isRegistered = false;
  }

  /**
   * Setup CallKeep (expo-callkit-telecom) and configure native event listeners.
   * Call this as early as possible in your app's lifecycle (e.g. index.js).
   */
  setup() {
    if (this.isInitialized) {
      console.log("📞 [CALLKIT TELECOM SERVICE] Already initialized");
      return;
    }

    try {
      console.log("📞 [CALLKIT TELECOM SERVICE] Setting up listeners...");
      this.registerEventListeners();
      this.isInitialized = true;
      console.log("✅ [CALLKIT TELECOM SERVICE] Configuration registered successfully");
    } catch (error) {
      console.error("❌ [CALLKIT TELECOM SERVICE] Failed to setup service:", error);
    }
  }

  /**
   * Request calling permissions asynchronously.
   * Call this when the UI has mounted (e.g. inside App.js init).
   */
  async requestPermissions() {
    if (Platform.OS !== "android") return;

    try {
      // Request POST_NOTIFICATIONS on Android 13+ (API 33+)
      if (Platform.Version >= 33) {
        const { PermissionsAndroid } = require("react-native");
        console.log("📞 [CALLKIT TELECOM SERVICE] Requesting POST_NOTIFICATIONS runtime permission...");
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        console.log("📞 [CALLKIT TELECOM SERVICE] POST_NOTIFICATIONS status:", granted);
      }
    } catch (err) {
      console.warn("⚠️ [CALLKIT TELECOM SERVICE] Failed requesting calling permissions:", err);
    }
  }

  /**
   * Register CallKit/Telecom native event callbacks
   */
  registerEventListeners() {
    if (this.isRegistered) return;

    // Triggered when user answers native call UI
    Calls.addCallAnsweredListener(async (event) => {
      const { id: callSessionId, requestId } = event;
      console.log(`📞 [CALLKIT TELECOM SERVICE] Native call answered! Session ID: ${callSessionId}, Request ID: ${requestId}`);
      
      // Stop the ringtone immediately when call is answered
      stopRingtone();

      try {
        // 1. Confirm that incoming call media is connected (fulfills native OS flow)
        await Calls.fulfillIncomingCallConnected(requestId);
      } catch (err) {
        console.error("❌ [CALLKIT TELECOM SERVICE] Error fulfilling answered call:", err);
      }

      // 2. Fetch call session details to retrieve metadata (supports terminated cold starts)
      let bookingId, conversationId, callerId, callType, callerName;
      
      try {
        const session = await Calls.getActiveCallSession();
        console.log("📞 [CALLKIT TELECOM SERVICE] Retrieved active session details on answer:", JSON.stringify(session));
        
        if (session && session.incomingCallEvent?.metadata) {
          const metadata = session.incomingCallEvent.metadata;
          bookingId = metadata.bookingId;
          conversationId = metadata.conversationId;
          callerId = metadata.callerUserId;
          callType = metadata.callType;
          callerName = metadata.callerName;
        }
      } catch (err) {
        console.warn("⚠️ [CALLKIT TELECOM SERVICE] Failed to fetch active session details:", err);
      }

      // Fallback to local map if active session details were not loaded
      if (!callerId) {
        // Attempt to find any active call details in our memory map
        const localCall = Object.values(this.activeCalls)[0];
        if (localCall) {
          console.log("📞 [CALLKIT TELECOM SERVICE] Falling back to local memory details:", localCall);
          bookingId = localCall.bookingId;
          conversationId = localCall.conversationId;
          callerId = localCall.callerId;
          callType = localCall.callType;
          callerName = localCall.callerName;
        }
      }

      if (callerId) {
        // Clean up locally
        this.activeCalls = {};

        // Check if app is in terminated (cold-start) state
        // In that case navigation stack is not ready yet — we emit an event
        // and let AppNavigator handle routing once the stack is mounted.
        const appState = AppState.currentState;
        console.log(`📞 [CALLKIT TELECOM SERVICE] AppState on answer: ${appState}`);

        if (appState === "active" || appState === "background") {
          navigate("ChatPage", {
            bookingId,
            conversationId,
            fromUserId: callerId,
            callerName,
            callType: callType || "video",
            isIncoming: true,
            autoAccept: true,
            timestamp: Date.now(),
          });
        } else {
          // Terminated cold-start: store as pending AND emit event
          console.log("📞 [CALLKIT TELECOM SERVICE] Cold-start answer — emitting callAnsweredFromTerminated");
          DeviceEventEmitter.emit("callAnsweredFromTerminated", {
            bookingId,
            conversationId,
            fromUserId: callerId,
            callerName,
            callType: callType || "video",
            timestamp: Date.now(),
          });
        }
      } else {
        console.warn(`⚠️ [CALLKIT TELECOM SERVICE] Answered call, but no caller metadata could be resolved.`);
      }
    });

    // Triggered when user declines or ends call in native UI
    Calls.addCallEndedListener(async (event) => {
      const { id: callSessionId } = event;
      console.log(`📞 [CALLKIT TELECOM SERVICE] Native call ended! Session ID: ${callSessionId}`);

      // Stop the ringtone immediately
      stopRingtone();

      // Locate details in our local map before clean up
      const localCall = Object.values(this.activeCalls)[0];
      const callerId = localCall?.callerId;

      if (callerId) {
        // Notify backend of rejection so the caller stops ringing
        try {
          const socket = getSocket();
          if (socket && socket.connected) {
            console.log("📞 [CALLKIT TELECOM SERVICE] Emitting reject call via active socket");
            rejectCall(callerId, "Declined");
          } else {
            console.log("🔌 [CALLKIT TELECOM SERVICE] Socket disconnected, establishing quick connection to reject call...");
            const tempSocket = connectSocket(callerId, "patient", {
              onConnect: () => {
                console.log("🔌 [CALLKIT TELECOM SERVICE] Temp socket connected, rejecting call...");
                rejectCall(callerId, "Declined");
                setTimeout(() => {
                  tempSocket.disconnect();
                }, 1000);
              }
            });
          }
        } catch (e) {
          console.error("❌ [CALLKIT TELECOM SERVICE] Error emitting reject call:", e);
        }
      }

      // Clean up local tracking
      this.activeCalls = {};
    });

    this.isRegistered = true;
    console.log("✅ [CALLKIT TELECOM SERVICE] Registered native call listeners");
  }

  /**
   * Display an incoming call UI via expo-callkit-telecom
   * 
   * @param {string} uuid - Unique call UUID (UUIDv4)
   * @param {string} callerName - Name of the caller
   * @param {string} handle - Handle/Number to display (e.g. video call or audio call)
   * @param {string} callType - 'video' or 'audio'
   * @param {string} conversationId - Chat conversation ID
   * @param {string} callerId - User ID of the caller
   * @param {string} bookingId - Booking ID of the consultation
   */
  async displayIncomingCall(uuid, callerName, handle, callType, conversationId, callerId, bookingId) {
    if (!this.isInitialized) {
      console.warn("⚠️ [CALLKIT TELECOM SERVICE] Display call requested before service was initialized. Initializing now...");
      this.setup();
    }

    // Save call details for mapping when callbacks are triggered
    this.activeCalls[uuid] = {
      callerId,
      callerName,
      conversationId,
      callType,
      bookingId,
    };

    console.log(`📞 [CALLKIT TELECOM SERVICE] Reporting native incoming call for ${callerName} (UUID: ${uuid})`);
    
    // Start custom audio ringtone ONLY if app is in foreground or background
    // When terminated, the native OS handles ringtone via expo-callkit-telecom
    const appState = AppState.currentState;
    if (appState === "active" || appState === "background") {
      try {
        startRingtone(getRingtoneURI("incoming"));
        console.log(`✅ [CALLKIT TELECOM SERVICE] Ringtone started (app state: ${appState})`);
      } catch (e) {
        console.warn("⚠️ [CALLKIT TELECOM SERVICE] Failed to play custom ringtone:", e);
      }
    } else {
      console.log("📞 [CALLKIT TELECOM SERVICE] Skipping custom ringtone — app is terminated, native handles it");
    }
    
    try {
      await Calls.reportIncomingCall({
        eventId: uuid, // unique event identifier for deduplication
        serverCallId: conversationId || uuid, // backend call room/chat ID
        hasVideo: callType === "video",
        caller: {
          id: callerId,
          displayName: callerName || "Consultant",
        },
        metadata: {
          bookingId,
          conversationId,
          callerUserId: callerId,
          callType,
          callerName, // Persist callerName in metadata
        }
      });
      console.log(`✅ [CALLKIT TELECOM SERVICE] Reported incoming call successfully to native system`);
    } catch (err) {
      console.error("❌ [CALLKIT TELECOM SERVICE] Failed to report incoming call natively:", err);
    }
  }

  /**
   * Report an outgoing or answered in-app call to the OS so Android
   * keeps the app alive and shows the active call indicator.
   * @param {string} conversationId
   * @param {string} callerName - Display name shown in OS call UI
   * @param {string} callType - 'video' or 'audio'
   */
  async startOutgoingCall(conversationId, callerName, callType = "audio") {
    if (!this.isInitialized) this.setup();
    const uuid = `call-${conversationId}`;

    try {
      console.log(`📞 [CALLKIT TELECOM SERVICE] Reporting outgoing/accepted call to OS: ${uuid}`);
      await Calls.reportCallConnected(uuid, {
        hasVideo: callType === "video",
        displayName: callerName || "Consultant",
        handle: callType === "video" ? "Video Call" : "Voice Call",
      });
      this._outgoingCallUuid = uuid;
      console.log(`✅ [CALLKIT TELECOM SERVICE] OS call reported: ${uuid}`);
    } catch (err) {
      console.warn("⚠️ [CALLKIT TELECOM SERVICE] reportCallConnected failed (non-critical):", err?.message);
    }
  }

  /**
   * Tell the OS the call has ended (matched with startOutgoingCall).
   */
  async endOutgoingCall() {
    if (!this._outgoingCallUuid) return;
    try {
      console.log(`📞 [CALLKIT TELECOM SERVICE] Ending OS-registered call: ${this._outgoingCallUuid}`);
      await Calls.endCall(this._outgoingCallUuid);
    } catch (err) {
      console.warn("⚠️ [CALLKIT TELECOM SERVICE] endCall failed (non-critical):", err?.message);
    } finally {
      this._outgoingCallUuid = null;
    }
  }

  /**
   * Stop any active calls natively
   */
  async endAllCalls() {
    console.log("📞 [CALLKIT TELECOM SERVICE] Ending all native calls");
    
    // Stop the ringtone
    stopRingtone();
    
    try {
      const session = await Calls.getActiveCallSession();
      if (session) {
        console.log(`📞 [CALLKIT TELECOM SERVICE] Ending call session: ${session.id}`);
        await Calls.endCall(session.id);
      }
    } catch (err) {
      console.error("❌ [CALLKIT TELECOM SERVICE] Error ending active call session:", err);
    }
    
    this.activeCalls = {};
  }
}

export default new CallKeepService();
