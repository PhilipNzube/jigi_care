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

// Initialize CallKeep service as early as possible
callKeepService.setup().catch(err => {
  console.error("❌ [INDEX] CallKeep setup error:", err);
});

/**
 * Handle incoming calls when the app is in the background or completely terminated
 */
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log("📥 [INDEX FCM BACKGROUND] Received message:", JSON.stringify(remoteMessage));
  
  const { data } = remoteMessage;
  if (data && data.type === "INCOMING_CALL") {
    const { uuid, callerId, callerName, conversationId, callType } = data;
    
    // CallKeep requires a UUIDv4 string. Generate a deterministic or fallback one if missing.
    const callUUID = uuid || "550e8400-e29b-41d4-a716-446655440000";
    
    console.log(`📥 [INDEX FCM BACKGROUND] Launching native CallKeep UI for caller: ${callerName}`);
    callKeepService.displayIncomingCall(
      callUUID,
      callerName || "Consultant",
      callType === "video" ? "Incoming Video Call" : "Incoming Audio Call",
      callType || "video",
      conversationId,
      callerId
    );
  } else if (data && data.type === "CANCEL_CALL") {
    console.log("📥 [INDEX FCM BACKGROUND] Call canceled. Stopping active call keep ringtone/UI.");
    callKeepService.endAllCalls();
  }
});

/**
 * Handle incoming calls in the foreground (app is open and active)
 */
messaging().onMessage(async remoteMessage => {
  console.log("📥 [INDEX FCM FOREGROUND] Received message:", JSON.stringify(remoteMessage));
  
  const { data } = remoteMessage;
  if (data && data.type === "INCOMING_CALL") {
    const { callerId, callerName, conversationId, callType } = data;
    
    // Check if user is currently on the ChatPage
    const currentRoute = navigationRef.isReady() ? navigationRef.getCurrentRoute() : null;
    const isOnChatPage = currentRoute?.name === "ChatPage";
    
    if (isOnChatPage) {
      console.log("📥 [INDEX FCM FOREGROUND] User is already on ChatPage. Custom socket UI handles display.");
      // The socket connection inside ChatPage will handle the custom UI.
      // We can also play the custom ringtone here if not already handled by socket.
    } else {
      console.log("📥 [INDEX FCM FOREGROUND] User is NOT on ChatPage. Navigating to ChatPage to show custom UI.");
      
      // Start playing the custom incoming ringtone
      startRingtone(getRingtoneURI("incoming"));
      
      // Automatically navigate to ChatPage with isIncoming parameters
      // This displays the user's custom in-app calling modal
      navigate("ChatPage", {
        bookingId: undefined,
        conversationId,
        fromUserId: callerId,
        callType,
        isIncoming: true,
        timestamp: Date.now(),
      });
    }
  } else if (data && data.type === "CANCEL_CALL") {
    console.log("📥 [INDEX FCM FOREGROUND] Call canceled. Stopping ringtone.");
    stopRingtone();
  }
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

