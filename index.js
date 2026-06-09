import { registerRootComponent } from 'expo';
import '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import callKeepService from './src/shared/services/callKeepService';
import { navigate, navigationRef } from './src/shared/navigation/navigationRef';
import {
  startRingtone,
  stopRingtone,
  getRingtoneURI,
} from './src/features/consult/utils/ringtone';

import App from './App';

// Initialize CallKeep service synchronously as early as possible (before root registration)
try {
  callKeepService.setup();
} catch (err) {
  console.error("❌ [INDEX] CallKeep setup error:", err);
}

/**
 * Handle incoming calls when the app is in the background or completely terminated
 */
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log("📥 [INDEX FCM BACKGROUND] Received message:", JSON.stringify(remoteMessage));
  
  const { data } = remoteMessage;

  // ── Incoming call ─────────────────────────────────────────────────────────
  if (data && (data.type === "INCOMING_CALL" || data.type === "incoming_call")) {
    const { uuid, callId, callerUserId, callerId, callerName, conversationId, callType, bookingId } = data;
    
    // Normalize properties according to the backend data payload template
    const callUUID = callId || uuid || "550e8400-e29b-41d4-a716-446655440000";
    const actualCallerId = callerUserId || callerId;
    const actualBookingId = bookingId === "null" || bookingId === "undefined" ? undefined : bookingId;
    
    console.log(`📥 [INDEX FCM BACKGROUND] 📞 INCOMING_CALL — caller: ${callerName}, callType: ${callType}, conversationId: ${conversationId}, callerId: ${actualCallerId}, bookingId: ${actualBookingId}`);
    callKeepService.displayIncomingCall(
      callUUID,
      callerName || "Consultant",
      callType === "video" ? "Incoming Video Call" : "Incoming Audio Call",
      callType || "video",
      conversationId,
      actualCallerId,
      actualBookingId
    );

  // ── Call cancelled by caller ───────────────────────────────────────────────
  } else if (data && (data.type === "CANCEL_CALL" || data.type === "cancel_call")) {
    console.log(`📥 [INDEX FCM BACKGROUND] ❌ CANCEL_CALL — callId: ${data.callId || 'n/a'}, conversationId: ${data.conversationId || 'n/a'}. Stopping ringtone + CallKeep UI.`);
    callKeepService.endAllCalls();

  // ── Call ended by either party ─────────────────────────────────────────────
  } else if (data && (data.type === "CALL_ENDED" || data.type === "call_ended")) {
    console.log(`📥 [INDEX FCM BACKGROUND] 🔴 CALL_ENDED — callId: ${data.callId || 'n/a'}, conversationId: ${data.conversationId || 'n/a'}, reason: ${data.reason || 'n/a'}. Stopping ringtone + CallKeep UI.`);
    stopRingtone();
    callKeepService.endAllCalls();

  } else {
    console.log(`📥 [INDEX FCM BACKGROUND] ℹ️  Unhandled FCM type: "${data?.type || 'none'}" — passing through.`);
  }
});

/**
 * Handle incoming calls in the foreground (app is open and active)
 */
messaging().onMessage(async remoteMessage => {
  console.log("📥 [INDEX FCM FOREGROUND] Received message:", JSON.stringify(remoteMessage));
  
  const { data } = remoteMessage;

  // ── Incoming call ─────────────────────────────────────────────────────────
  if (data && (data.type === "INCOMING_CALL" || data.type === "incoming_call")) {
    const { callerUserId, callerId, callerName, conversationId, callType, bookingId } = data;
    
    const actualCallerId = callerUserId || callerId;
    const actualBookingId = bookingId === "null" || bookingId === "undefined" ? undefined : bookingId;
    
    // Check if user is currently on the ChatPage
    const currentRoute = navigationRef.isReady() ? navigationRef.getCurrentRoute() : null;
    const isOnChatPage = currentRoute?.name === "ChatPage";
    
    console.log(`📥 [INDEX FCM FOREGROUND] 📞 INCOMING_CALL — caller: ${callerName}, callType: ${callType}, conversationId: ${conversationId}, callerId: ${actualCallerId}, isOnChatPage: ${isOnChatPage}`);
    
    if (isOnChatPage) {
      console.log("📥 [INDEX FCM FOREGROUND] User is already on ChatPage — socket UI will handle the in-app call modal.");
      // The socket listener inside ChatPage handles the custom UI, no navigation needed.
    } else {
      console.log("📥 [INDEX FCM FOREGROUND] User is NOT on ChatPage. Starting ringtone and navigating to ChatPage...");
      
      // Start playing the custom incoming ringtone
      startRingtone(getRingtoneURI("incoming"));
      
      // Navigate to ChatPage which renders the custom in-app incoming call UI
      navigate("ChatPage", {
        bookingId: actualBookingId,
        conversationId,
        fromUserId: actualCallerId,
        callType,
        isIncoming: true,
        timestamp: Date.now(),
      });
    }

  // ── Call cancelled by caller ───────────────────────────────────────────────
  } else if (data && (data.type === "CANCEL_CALL" || data.type === "cancel_call")) {
    console.log(`📥 [INDEX FCM FOREGROUND] ❌ CANCEL_CALL — callId: ${data.callId || 'n/a'}, conversationId: ${data.conversationId || 'n/a'}. Stopping ringtone.`);
    stopRingtone();

  // ── Call ended by either party ─────────────────────────────────────────────
  } else if (data && (data.type === "CALL_ENDED" || data.type === "call_ended")) {
    console.log(`📥 [INDEX FCM FOREGROUND] 🔴 CALL_ENDED — callId: ${data.callId || 'n/a'}, conversationId: ${data.conversationId || 'n/a'}, reason: ${data.reason || 'n/a'}. Stopping ringtone + CallKeep UI.`);
    stopRingtone();
    callKeepService.endAllCalls();

  } else {
    console.log(`📥 [INDEX FCM FOREGROUND] ℹ️  Unhandled FCM type: "${data?.type || 'none'}" — passing through.`);
  }
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

