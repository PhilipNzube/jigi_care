/**
 * Agora Service
 * Handles Agora RTC Engine lifecycle, channel joining, token fetching, and call media controls
 */

import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
} from "react-native-agora";
import { get } from "../../../shared/services/api";
import InCallManager from "react-native-incall-manager";
import { PermissionsAndroid, Platform } from "react-native";
import * as Calls from "expo-callkit-telecom";

const APP_ID = "20f2238665744f4a890994eaf313adc5";

class AgoraService {
  engine = null;
  isInitialized = false;
  currentChannel = null;

  /**
   * Request Android camera and audio permissions if needed
   * @param {boolean} video - Whether video permission is required
   * @param {boolean} audio - Whether audio permission is required
   */
  async checkPermissions(video, audio = true) {
    if (Platform.OS === "android") {
      try {
        const permissions = [];
        if (audio) permissions.push(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
        if (video) permissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);

        if (permissions.length > 0) {
          const granted = await PermissionsAndroid.requestMultiple(permissions);

          for (const permission of permissions) {
            if (granted[permission] !== PermissionsAndroid.RESULTS.GRANTED) {
              throw new Error(`Permission ${permission} not granted`);
            }
          }
        }
        console.log("✅ [AGORA SERVICE] All native permissions granted");
      } catch (err) {
        console.error("❌ [AGORA SERVICE] Permission error:", err);
        throw err;
      }
    }
  }

  /**
   * Initialize Agora RTC Engine and set up event listeners
   * @param {function} onUserJoined - Callback when remote user joins channel (uid)
   * @param {function} onUserOffline - Callback when remote user leaves channel (uid)
   */
  async initEngine(onUserJoined, onUserOffline) {
    if (this.isInitialized && this.engine) {
      console.log("🎬 [AGORA SERVICE] Engine already initialized");
      return;
    }

    try {
      console.log("🎬 [AGORA SERVICE] Initializing Agora Engine...");
      this.engine = createAgoraRtcEngine();
      this.engine.initialize({ appId: APP_ID });

      this.engine.registerEventHandler({
        onJoinChannelSuccess: (connection, elapsed) => {
          console.log("✅ [AGORA SERVICE] Joined channel successfully:", connection.channelId);
        },
        onUserJoined: (connection, remoteUid, elapsed) => {
          console.log("✅ [AGORA SERVICE] Remote user joined:", remoteUid);
          if (onUserJoined) onUserJoined(remoteUid);
        },
        onUserOffline: (connection, remoteUid, reason) => {
          console.log("🔴 [AGORA SERVICE] Remote user offline:", remoteUid, "reason:", reason);
          if (onUserOffline) onUserOffline(remoteUid);
        },
        onError: (err, msg) => {
          console.error("❌ [AGORA SERVICE] Error event:", err, msg);
        },
        onAudioRoutingChanged: (routing) => {
          console.log("🎧 [AGORA SERVICE] Audio routing changed natively:", routing);
          import("react-native").then(({ DeviceEventEmitter }) => {
            DeviceEventEmitter.emit("agoraAudioRouteChanged", routing);
          });
        },
      });

      this.isInitialized = true;
    } catch (e) {
      console.error("❌ [AGORA SERVICE] Error initializing Agora engine:", e);
      throw e;
    }
  }

  /**
   * Join an Agora RTC Channel
   * Fetches token from GET /api/v1/agora/token?channelName=${channelName}
   * @param {string} channelName - Conversation ID / Channel name
   * @param {boolean} isVideo - Whether this is a video call
   */
  async joinChannel(channelName, isVideo) {
    // uid is returned by the backend and must match what the token was generated for
    if (!this.engine) {
      throw new Error("Agora engine not initialized");
    }

    await this.checkPermissions(isVideo, true);

    try {
      console.log(`🔑 [AGORA SERVICE] Fetching token for channelName: ${channelName}`);
      const response = await get(`/agora/token?channelName=${encodeURIComponent(channelName)}`);
      console.log(`🔑 [AGORA SERVICE] Raw token response:`, JSON.stringify(response));

      const token =
        typeof response === "string"
          ? response
          : response?.token || response?.data?.token || response?.data;

      // Use the UID the backend used to generate the token — must match exactly
      const uid =
        typeof response === "object"
          ? (response?.uid || response?.data?.uid || 0)
          : 0;

      console.log(`🔑 [AGORA SERVICE] Resolved token (first 30 chars): ${typeof token === "string" ? token.substring(0, 30) : token}`);
      console.log(`🔑 [AGORA SERVICE] Using UID: ${uid}`);

      if (!token) {
        throw new Error("Failed to fetch valid Agora token from backend");
      }

      if (isVideo) {
        this.engine.enableVideo();
        this.engine.startPreview();
      } else {
        this.engine.enableAudio();
      }

      // Start InCallManager BEFORE joining — this locks in the audio session
      // mode before Agora's native layer touches the hardware.
      // For voice calls we want speaker; for video calls same.
      InCallManager.start({ media: isVideo ? "video" : "audio", auto: false, ringback: "" });
      InCallManager.setForceSpeakerphoneOn(!isVideo); // Voice → speaker by default

      console.log(`📡 [AGORA SERVICE] Joining channel: ${channelName} with UID: ${uid}`);
      this.engine.joinChannel(token, channelName, uid, {
        channelProfile: ChannelProfileType.ChannelProfileCommunication,
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        publishMicrophoneTrack: true,
        publishCameraTrack: isVideo,
        autoSubscribeAudio: true,
        autoSubscribeVideo: isVideo,
      });

      this.currentChannel = channelName;
    } catch (e) {
      console.error("❌ [AGORA SERVICE] Failed to join channel:", e);
      throw e;
    }
  }

  /**
   * Leave current Agora channel
   */
  leaveChannel() {
    if (this.engine) {
      console.log("🔌 [AGORA SERVICE] Leaving channel...");
      try {
        this.engine.leaveChannel();
        this.engine.stopPreview();
        this.engine.disableVideo();
        this.engine.disableAudio();
      } catch (e) {
        console.warn("⚠️ [AGORA SERVICE] Exception leaving channel:", e);
      }
      this.currentChannel = null;
    }
    InCallManager.stop();
  }

  /**
   * Toggle local microphone
   * @param {boolean} enabled - true to un-mute, false to mute
   */
  toggleAudio(enabled) {
    if (this.engine) {
      this.engine.enableLocalAudio(enabled);
    }
  }

  /**
   * Toggle local camera
   * @param {boolean} enabled - true to enable video, false to disable
   */
  toggleVideo(enabled) {
    if (this.engine) {
      this.engine.enableLocalVideo(enabled);
    }
  }

  /**
   * Switch between front and rear cameras
   */
  switchCamera() {
    if (this.engine) {
      this.engine.switchCamera();
    }
  }

  /**
   * Set the audio routing device natively via Agora & System AudioManager
   * @param {string} route - "speaker", "earpiece", or "bluetooth"
   */
  setAudioRoute(route) {
    console.log(`🎧 [AGORA SERVICE] Enforcing audio route: ${route}`);
    const isSpeaker = route === "speaker";
    const isBluetooth = route === "bluetooth";

    if (this.engine) {
      try {
        if (isSpeaker) {
          this.engine.setEnableSpeakerphone(true);
          this.engine.setRouteInCommunicationMode(3); // 3: Speakerphone
        } else if (isBluetooth) {
          this.engine.setEnableSpeakerphone(false);
          this.engine.setRouteInCommunicationMode(5); // 5: BluetoothDeviceHfp
        } else {
          this.engine.setEnableSpeakerphone(false);
          this.engine.setRouteInCommunicationMode(1); // 1: Earpiece
        }
      } catch (e) {
        console.warn("⚠️ [AGORA SERVICE] Engine setAudioRoute error:", e?.message);
      }
    }

    // Force system AudioManager via InCallManager & Calls port overrides
    try {
      if (isSpeaker) {
        InCallManager.setForceSpeakerphoneOn(true);
        InCallManager.chooseAudioRoute("SPEAKER_PHONE");
        if (Calls.setAudioSessionPortOverride) Calls.setAudioSessionPortOverride(true);
      } else if (isBluetooth) {
        InCallManager.setForceSpeakerphoneOn(false);
        InCallManager.chooseAudioRoute("BLUETOOTH");
        if (Calls.setAudioSessionPortOverride) Calls.setAudioSessionPortOverride(false);
      } else {
        InCallManager.setForceSpeakerphoneOn(false);
        InCallManager.chooseAudioRoute("EARPIECE");
        if (Calls.setAudioSessionPortOverride) Calls.setAudioSessionPortOverride(false);
      }
    } catch (e) {
      console.warn("⚠️ [AGORA SERVICE] System audio override error:", e?.message);
    }
  }

  /**
   * Cleanup and release Agora engine
   */
  cleanup() {
    this.leaveChannel();
    if (this.engine) {
      try {
        this.engine.unregisterEventHandler({});
        this.engine.release();
      } catch (e) {
        console.warn("⚠️ [AGORA SERVICE] Exception releasing engine:", e);
      }
      this.engine = null;
      this.isInitialized = false;
    }
    InCallManager.setForceSpeakerphoneOn(false);
  }
}

export const agoraService = new AgoraService();
export default agoraService;
