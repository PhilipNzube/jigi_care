import { Platform, AppState, DeviceEventEmitter } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Calls from "expo-callkit-telecom";
import { navigate, navigationRef } from "../navigation/navigationRef";
import {
  startRingtone,
  stopRingtone,
  getRingtoneURI,
  startSystemRingtone,
  stopSystemRingtone,
} from "../../features/consult/utils/ringtone";
import { rejectCall, connectSocket, getSocket, endCall } from "../../features/consult/services/chatService";
import agoraService from "../../features/consult/services/agoraService";

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
    this.pendingAnsweredCall = null;
    this.isRegistered = false;
  }

  /**
   * Persist answered call metadata to memory AND AsyncStorage so cold-start launches
   * never lose the call details even if event listeners were not registered in time.
   */
  async storePendingAnsweredCall(callParams) {
    this.pendingAnsweredCall = callParams;
    try {
      await AsyncStorage.setItem("@pending_answered_call", JSON.stringify(callParams));
      console.log("📌 [CALLKIT TELECOM SERVICE] Persisted answered call details:", callParams);
    } catch (e) {
      console.warn("⚠️ [CALLKIT TELECOM SERVICE] Failed to persist answered call:", e?.message);
    }
  }

  /**
   * Retrieve and clear any pending answered call metadata.
   * Called by AppNavigator or HomeScreen once navigation stack is mounted.
   */
  async getAndClearPendingAnsweredCall() {
    let pending = this.pendingAnsweredCall;
    this.pendingAnsweredCall = null;

    if (!pending) {
      try {
        const stored = await AsyncStorage.getItem("@pending_answered_call");
        if (stored) {
          pending = JSON.parse(stored);
        }
      } catch (e) {
        console.warn("⚠️ [CALLKIT TELECOM SERVICE] Error reading stored answered call:", e?.message);
      }
    }

    try {
      await AsyncStorage.removeItem("@pending_answered_call");
    } catch (e) {}

    // Expire if call is older than 2 minutes (120000 ms)
    if (pending && pending.timestamp && Date.now() - pending.timestamp > 120000) {
      console.log("⌛ [CALLKIT TELECOM SERVICE] Expired pending answered call (>2m old)");
      return null;
    }

    return pending;
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
      stopSystemRingtone();

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
        this.activeCalls = {};

        const callParams = {
          bookingId,
          conversationId,
          fromUserId: callerId,
          callerName,
          callType: callType || "video",
          isIncoming: true,
          autoAccept: true,
          timestamp: Date.now(),
        };

        // Always store as pending in persistent storage (AsyncStorage + memory)
        await this.storePendingAnsweredCall(callParams);

        const appState = AppState.currentState;
        console.log(`📞 [CALLKIT TELECOM SERVICE] AppState on answer: ${appState}`);

        // Emit event for any already-mounted listeners
        DeviceEventEmitter.emit("callAnsweredFromTerminated", callParams);

        if (navigationRef.isReady()) {
          try {
            console.log("📞 [CALLKIT TELECOM SERVICE] Navigation ref is ready — navigating directly to ChatPage");
            navigate("ChatPage", callParams);
          } catch (e) {
            console.warn("⚠️ Direct navigate error:", e?.message);
          }
        }
      } else {
        console.warn(`⚠️ [CALLKIT TELECOM SERVICE] Answered call, but no caller metadata could be resolved.`);
      }
    });

    // Triggered when user declines or ends call in native UI
    Calls.addCallEndedListener(async (event) => {
      const { id: callSessionId } = event;
      console.log(`📞 [CALLKIT TELECOM SERVICE] Native call ended from CallKeep UI! Session ID: ${callSessionId}`);

      // 1. Stop ringtone immediately
      stopRingtone();
      stopSystemRingtone();
      this.pendingAnsweredCall = null;
      try {
        await AsyncStorage.removeItem("@pending_answered_call");
      } catch (e) {}

      // 2. Cleanup Agora audio engine
      try {
        agoraService.cleanup();
      } catch (e) {
        console.warn("⚠️ [CALLKIT TELECOM SERVICE] Error cleaning up Agora on native call end:", e?.message);
      }

      // 3. Emit event to close active call screen in app
      DeviceEventEmitter.emit("callEndedFromCallKeep", { callSessionId });

      // 4. Notify socket backend
      const localCall = Object.values(this.activeCalls)[0];
      const callerId = localCall?.callerId;

      if (callerId) {
        try {
          const socket = getSocket();
          if (socket && socket.connected) {
            console.log("📞 [CALLKIT TELECOM SERVICE] Emitting reject/end call via active socket");
            rejectCall(callerId, "Declined");
            endCall(callerId);
          } else {
            console.log("🔌 [CALLKIT TELECOM SERVICE] Socket disconnected, establishing quick connection to end call...");
            const tempSocket = connectSocket(callerId, "patient", {
              onConnect: () => {
                rejectCall(callerId, "Declined");
                endCall(callerId);
                setTimeout(() => {
                  tempSocket.disconnect();
                }, 1000);
              }
            });
          }
        } catch (e) {
          console.error("❌ [CALLKIT TELECOM SERVICE] Error emitting end/reject call:", e);
        }
      }

      // 5. Clean up local tracking
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

    // Play device system default ringtone via InCallManager when incoming call arrives in background/terminated state
    startSystemRingtone();

    console.log(`📞 [CALLKIT TELECOM SERVICE] Reporting native incoming call for ${callerName} (UUID: ${uuid})`);
    
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
   * Report an outgoing or answered in-app call to the OS so Android/iOS
   * keeps the app alive and maintains a steady connection in background.
   * @param {string} conversationId
   * @param {string} callerName - Display name shown in OS call UI
   * @param {string} callType - 'video' or 'audio'
   */
  async startOutgoingCall(conversationId, callerName, callType = "audio") {
    if (!this.isInitialized) this.setup();
    const callUUID = `call-${conversationId}`;

    try {
      console.log(`📞 [CALLKIT TELECOM SERVICE] Registering active call session with OS: ${callUUID}`);
      
      const activeSession = await Calls.getActiveCallSession();
      if (activeSession) {
        console.log(`📞 [CALLKIT TELECOM SERVICE] Active session already exists (${activeSession.id}). Reporting connected.`);
        await Calls.reportOutgoingCallConnected(activeSession.id);
        this._outgoingCallUuid = activeSession.id;
        return;
      }

      // Initiate native call session via expo-callkit-telecom
      const sessionId = await Calls.startOutgoingCall(
        {
          id: conversationId || callUUID,
          displayName: callerName || "Consultant",
        },
        {
          hasVideo: callType === "video",
        }
      );

      console.log(`✅ [CALLKIT TELECOM SERVICE] Native call session started: ${sessionId}`);
      this._outgoingCallUuid = sessionId || callUUID;

      if (sessionId) {
        await Calls.reportOutgoingCallConnected(sessionId);
      }
    } catch (err) {
      console.warn("⚠️ [CALLKIT TELECOM SERVICE] startOutgoingCall failed:", err?.message || err);
    }
  }

  /**
   * Tell the OS the call has ended (matched with startOutgoingCall).
   */
  async endOutgoingCall() {
    try {
      const activeSession = await Calls.getActiveCallSession();
      if (activeSession) {
        console.log(`📞 [CALLKIT TELECOM SERVICE] Ending active native call session: ${activeSession.id}`);
        await Calls.endCall(activeSession.id);
      } else if (this._outgoingCallUuid) {
        console.log(`📞 [CALLKIT TELECOM SERVICE] Ending OS call UUID: ${this._outgoingCallUuid}`);
        await Calls.endCall(this._outgoingCallUuid);
      }
    } catch (err) {
      console.warn("⚠️ [CALLKIT TELECOM SERVICE] endOutgoingCall failed:", err?.message || err);
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
    stopSystemRingtone();
    this.pendingAnsweredCall = null;
    try {
      await AsyncStorage.removeItem("@pending_answered_call");
    } catch (e) {}

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
