/**
 * WebRTC Debugging Utilities
 * Helper functions to verify audio/video streaming
 */

/**
 * Log detailed information about a media stream
 * @param {MediaStream} stream - Media stream to inspect
 * @param {string} label - Label for logging (e.g., "Local" or "Remote")
 */
export const logStreamInfo = (stream, label = "Stream") => {
  if (!stream) {
    console.log(`❌ [WEBRTC DEBUG] ${label}: No stream`);
    return;
  }

  console.log(`\n📹 [WEBRTC DEBUG] ===== ${label} Stream Info =====`);
  console.log(`Stream ID: ${stream.id}`);
  console.log(`Active: ${stream.active}`);
  
  const audioTracks = stream.getAudioTracks();
  const videoTracks = stream.getVideoTracks();
  
  console.log(`\n🎤 Audio Tracks: ${audioTracks.length}`);
  audioTracks.forEach((track, index) => {
    console.log(`  Track ${index + 1}:`);
    console.log(`    ID: ${track.id}`);
    console.log(`    Enabled: ${track.enabled}`);
    console.log(`    Muted: ${track.muted}`);
    console.log(`    ReadyState: ${track.readyState}`);
    console.log(`    Kind: ${track.kind}`);
    if (track.getSettings) {
      const settings = track.getSettings();
      console.log(`    Settings:`, settings);
    }
  });

  console.log(`\n📹 Video Tracks: ${videoTracks.length}`);
  videoTracks.forEach((track, index) => {
    console.log(`  Track ${index + 1}:`);
    console.log(`    ID: ${track.id}`);
    console.log(`    Enabled: ${track.enabled}`);
    console.log(`    Muted: ${track.muted}`);
    console.log(`    ReadyState: ${track.readyState}`);
    console.log(`    Kind: ${track.kind}`);
    if (track.getSettings) {
      const settings = track.getSettings();
      console.log(`    Settings:`, settings);
    }
  });
  
  console.log(`==========================================\n`);
};

/**
 * Monitor stream track states
 * @param {MediaStream} stream - Media stream to monitor
 * @param {string} label - Label for logging
 * @returns {function} Cleanup function to stop monitoring
 */
export const monitorStreamTracks = (stream, label = "Stream") => {
  if (!stream) {
    console.warn(`⚠️ [WEBRTC DEBUG] Cannot monitor ${label}: No stream`);
    return () => {};
  }

  const audioTracks = stream.getAudioTracks();
  const videoTracks = stream.getVideoTracks();
  const allTracks = [...audioTracks, ...videoTracks];

  const trackListeners = allTracks.map((track) => {
    const onEnded = () => {
      console.log(`🛑 [WEBRTC DEBUG] ${label} track ended:`, track.id);
    };
    const onMute = () => {
      console.log(`🔇 [WEBRTC DEBUG] ${label} track muted:`, track.id);
    };
    const onUnmute = () => {
      console.log(`🔊 [WEBRTC DEBUG] ${label} track unmuted:`, track.id);
    };

    track.addEventListener("ended", onEnded);
    track.addEventListener("mute", onMute);
    track.addEventListener("unmute", onUnmute);

    return () => {
      track.removeEventListener("ended", onEnded);
      track.removeEventListener("mute", onMute);
      track.removeEventListener("unmute", onUnmute);
    };
  });

  return () => {
    trackListeners.forEach((cleanup) => cleanup());
  };
};

/**
 * Log peer connection statistics
 * @param {RTCPeerConnection} peerConnection - Peer connection to inspect
 * @param {string} label - Label for logging
 */
export const logPeerConnectionStats = async (peerConnection, label = "PeerConnection") => {
  if (!peerConnection) {
    console.log(`❌ [WEBRTC DEBUG] ${label}: No peer connection`);
    return;
  }

  try {
    const stats = await peerConnection.getStats();
    console.log(`\n📊 [WEBRTC DEBUG] ===== ${label} Statistics =====`);
    
    stats.forEach((report) => {
      if (report.type === "media-source" || report.type === "remote-inbound-rtp" || report.type === "inbound-rtp" || report.type === "outbound-rtp") {
        console.log(`\n${report.type}:`);
        console.log(`  ID: ${report.id}`);
        if (report.kind) console.log(`  Kind: ${report.kind}`);
        if (report.mediaType) console.log(`  Media Type: ${report.mediaType}`);
        if (report.bytesReceived) console.log(`  Bytes Received: ${report.bytesReceived}`);
        if (report.bytesSent) console.log(`  Bytes Sent: ${report.bytesSent}`);
        if (report.packetsReceived) console.log(`  Packets Received: ${report.packetsReceived}`);
        if (report.packetsSent) console.log(`  Packets Sent: ${report.packetsSent}`);
        if (report.packetsLost) console.log(`  Packets Lost: ${report.packetsLost}`);
        if (report.jitter) console.log(`  Jitter: ${report.jitter}`);
        if (report.roundTripTime) console.log(`  Round Trip Time: ${report.roundTripTime}ms`);
        if (report.framesPerSecond) console.log(`  FPS: ${report.framesPerSecond}`);
        if (report.frameWidth) console.log(`  Resolution: ${report.frameWidth}x${report.frameHeight}`);
      }
    });
    
    console.log(`==========================================\n`);
  } catch (error) {
    console.error(`❌ [WEBRTC DEBUG] Error getting stats:`, error);
  }
};

/**
 * Monitor peer connection state changes
 * @param {RTCPeerConnection} peerConnection - Peer connection to monitor
 * @param {string} label - Label for logging
 */
export const monitorPeerConnection = (peerConnection, label = "PeerConnection") => {
  if (!peerConnection) {
    console.warn(`⚠️ [WEBRTC DEBUG] Cannot monitor ${label}: No peer connection`);
    return () => {};
  }

  const logState = (state, stateType) => {
    console.log(`🔄 [WEBRTC DEBUG] ${label} ${stateType}: ${state}`);
  };

  // Monitor connection state
  peerConnection.addEventListener("connectionstatechange", () => {
    logState(peerConnection.connectionState, "Connection State");
  });

  // Monitor ICE connection state
  peerConnection.addEventListener("iceconnectionstatechange", () => {
    logState(peerConnection.iceConnectionState, "ICE Connection State");
  });

  // Monitor ICE gathering state
  peerConnection.addEventListener("icegatheringstatechange", () => {
    logState(peerConnection.iceGatheringState, "ICE Gathering State");
  });

  // Monitor signaling state
  peerConnection.addEventListener("signalingstatechange", () => {
    logState(peerConnection.signalingState, "Signaling State");
  });

  // Monitor when tracks are added
  peerConnection.addEventListener("track", (event) => {
    console.log(`📹 [WEBRTC DEBUG] ${label} track received:`, {
      trackId: event.track.id,
      kind: event.track.kind,
      streamId: event.streams[0]?.id,
    });
  });

  return () => {
    // Cleanup handled by peer connection cleanup
  };
};

/**
 * Check if media is actually streaming
 * @param {MediaStream} stream - Stream to check
 * @returns {object} Status object with streaming info
 */
export const checkStreamingStatus = (stream) => {
  if (!stream) {
    return {
      isStreaming: false,
      hasAudio: false,
      hasVideo: false,
      audioTracks: 0,
      videoTracks: 0,
      activeTracks: 0,
    };
  }

  const audioTracks = stream.getAudioTracks();
  const videoTracks = stream.getVideoTracks();
  const allTracks = [...audioTracks, ...videoTracks];
  
  const activeTracks = allTracks.filter(
    (track) => track.readyState === "live" && track.enabled
  );

  return {
    isStreaming: activeTracks.length > 0,
    hasAudio: audioTracks.length > 0 && audioTracks.some((t) => t.readyState === "live" && t.enabled),
    hasVideo: videoTracks.length > 0 && videoTracks.some((t) => t.readyState === "live" && t.enabled),
    audioTracks: audioTracks.length,
    videoTracks: videoTracks.length,
    activeTracks: activeTracks.length,
    streamId: stream.id,
    streamActive: stream.active,
  };
};

/**
 * Periodic stats monitoring
 * @param {RTCPeerConnection} peerConnection - Peer connection
 * @param {MediaStream} localStream - Local stream
 * @param {MediaStream} remoteStream - Remote stream
 * @param {number} interval - Interval in milliseconds (default: 5000)
 * @returns {function} Cleanup function
 */
export const startStatsMonitoring = (
  peerConnection,
  localStream,
  remoteStream,
  interval = 5000
) => {
  const statsInterval = setInterval(async () => {
    console.log("\n📊 [WEBRTC DEBUG] ===== Periodic Stats Check =====");
    
    if (localStream) {
      const localStatus = checkStreamingStatus(localStream);
      console.log("Local Stream Status:", localStatus);
    }
    
    if (remoteStream) {
      const remoteStatus = checkStreamingStatus(remoteStream);
      console.log("Remote Stream Status:", remoteStatus);
    }
    
    if (peerConnection) {
      await logPeerConnectionStats(peerConnection, "PeerConnection");
    }
    
    console.log("==========================================\n");
  }, interval);

  return () => {
    clearInterval(statsInterval);
  };
};
