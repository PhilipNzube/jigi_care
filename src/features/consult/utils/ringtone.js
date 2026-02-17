/**
 * Ringtone utility
 * Provides proper phone ringtone sounds for calls
 */

import { AudioPlayer, useAudioPlayer } from "expo-audio";

/**
 * Get a proper phone ringtone URL
 * Uses a classic phone ringtone pattern
 */
export const getRingtoneURI = () => {
  // Using a proper phone ringtone from a reliable source
  // This is a classic phone ringtone (dual-tone pattern)
  return "https://www.soundjay.com/misc/sounds/phone-ring-01.wav";
  
  // Alternative ringtone URLs if the above doesn't work:
  // return "https://assets.mixkit.co/sfx/preview/mixkit-phone-ring-1060.mp3";
  // return "https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-one/phone_ring_old_telephone.mp3";
};

/**
 * Create and play a ringtone using expo-audio
 * @returns {Promise<AudioPlayer>}
 */
export const createRingtonePlayer = async () => {
  try {
    const player = new AudioPlayer(getRingtoneURI(), {
      shouldPlay: true,
      isLooping: true,
      volume: 0.7,
    });
    
    await player.load();
    await player.play();
    
    return player;
  } catch (error) {
    console.warn("⚠️ [RINGTONE] Could not create ringtone player:", error);
    throw error;
  }
};

/**
 * Stop and cleanup ringtone player
 * @param {AudioPlayer} player
 */
export const stopRingtonePlayer = async (player) => {
  try {
    if (player) {
      await player.pause();
      await player.unload();
    }
  } catch (error) {
    console.warn("⚠️ [RINGTONE] Error stopping ringtone:", error);
  }
};
