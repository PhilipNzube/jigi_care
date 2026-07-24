/**
 * Ringtone utility – plays bundled ringtones with looping.
 * Uses react-native-sound-player (playAsset for local WAV/MP3).
 *
 * Sounds in src/assets/sounds/:
 * - Incoming_calls.wav – when someone is calling you (recipient)
 * - Outgoing_calls.wav – ringback when you call someone (caller)
 */

let SoundPlayer;
let Audio;
try {
  SoundPlayer = require("react-native-sound-player").default;
  Audio = require("expo-av").Audio;
} catch (e) {
  console.warn("⚠️ [RINGTONE] Dependencies not available:", e?.message);
}

// Bundled ringtones (relative to this file: utils -> consult -> features -> src)
const INCOMING_RING = require("../../../assets/sounds/Incoming_calls.wav");
const OUTGOING_RING = require("../../../assets/sounds/Outgoing_calls.wav");

let _shouldLoop = false;
let _finishedSubscription = null;
let _currentAsset = null;

/**
 * Get the ringtone asset or URL for the given type.
 * @param {'incoming'|'outgoing'} [type] - 'incoming' = someone calling you, 'outgoing' = ringback when you call
 * @returns {number} - Asset ID (require result) for use with startRingtone
 */
export const getRingtoneURI = (type = "outgoing") => {
  return type === "incoming" ? INCOMING_RING : OUTGOING_RING;
};

/**
 * Start playing ringtone. Loops until stopRingtone() is called.
 * @param {number|string} [source] - Asset from getRingtoneURI('incoming'|'outgoing'), or HTTPS URL string (fallback)
 */
export const startRingtone = (source) => {
  if (!SoundPlayer) {
    console.warn("⚠️ [RINGTONE] SoundPlayer not available");
    return;
  }
  const asset = source ?? OUTGOING_RING;
  const isUrl = typeof asset === "string";

  // Prevent duplicate playback if the exact same ringtone is already playing
  if (_shouldLoop && _currentAsset === asset) {
    console.log("🔔 [RINGTONE] Ringtone is already playing, skipping duplicate play request.");
    return;
  }

  try {
    _shouldLoop = true;
    _currentAsset = asset;

    // Set audio mode for ducking (mute other apps)
    if (Audio) {
      Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      }).catch(e => console.warn("⚠️ [RINGTONE] setAudioMode failed:", e));
    }

    const playAgain = () => {
      if (!_shouldLoop) return;
      try {
        if (isUrl) {
          SoundPlayer.playUrl(asset);
        } else {
          SoundPlayer.playAsset(asset);
        }
      } catch (err) {
        console.warn("⚠️ [RINGTONE] Loop play failed:", err);
      }
    };

    if (_finishedSubscription) {
      _finishedSubscription.remove();
      _finishedSubscription = null;
    }
    _finishedSubscription = SoundPlayer.addEventListener("FinishedPlaying", ({ success }) => {
      if (success && _shouldLoop) playAgain();
    });

    if (isUrl) {
      SoundPlayer.playUrl(asset);
    } else {
      SoundPlayer.playAsset(asset);
    }
  } catch (error) {
    console.warn("⚠️ [RINGTONE] startRingtone failed:", error);
    _shouldLoop = false;
  }
};

/**
 * Stop the ringtone and remove the loop listener.
 */
export const stopRingtone = () => {
  _shouldLoop = false;
  _currentAsset = null;
  if (!SoundPlayer) return;
  try {
    if (_finishedSubscription) {
      _finishedSubscription.remove();
      _finishedSubscription = null;
    }
    SoundPlayer.stop();
  } catch (error) {
    console.warn("⚠️ [RINGTONE] stopRingtone error:", error?.message);
  }
};
