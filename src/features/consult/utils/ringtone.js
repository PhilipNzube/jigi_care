/**
 * Ringtone utility – plays HTTPS ringtone with looping.
 * Uses react-native-sound-player (works with remote URLs).
 */

let SoundPlayer;
try {
  SoundPlayer = require("react-native-sound-player").default;
} catch (e) {
  console.warn("⚠️ [RINGTONE] react-native-sound-player not available:", e?.message);
  SoundPlayer = null;
}

const DEFAULT_RINGTONE_URL =
  "https://assets.mixkit.co/sfx/preview/mixkit-phone-call-ringing-1002.mp3";

let _shouldLoop = false;
let _finishedSubscription = null;

/**
 * Get the default ringtone URL (caller ringback / incoming ring).
 */
export const getRingtoneURI = () => DEFAULT_RINGTONE_URL;

/**
 * Start playing ringtone from URL. Loops until stopRingtone() is called.
 * @param {string} [url] - HTTPS URL of the ringtone (default: Mixkit phone ring).
 */
export const startRingtone = (url = DEFAULT_RINGTONE_URL) => {
  if (!SoundPlayer) {
    console.warn("⚠️ [RINGTONE] SoundPlayer not available");
    return;
  }
  try {
    _shouldLoop = true;

    const loopAgain = () => {
      if (_shouldLoop) {
        try {
          SoundPlayer.playUrl(url);
        } catch (err) {
          console.warn("⚠️ [RINGTONE] Loop play failed:", err);
        }
      }
    };

    if (_finishedSubscription) {
      _finishedSubscription.remove();
      _finishedSubscription = null;
    }
    _finishedSubscription = SoundPlayer.addEventListener("FinishedPlaying", ({ success }) => {
      if (success && _shouldLoop) loopAgain();
    });

    SoundPlayer.playUrl(url);
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
