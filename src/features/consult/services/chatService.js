/**
 * Chat Service
 * Handles all chat-related API calls and WebSocket connections
 * Based on Jigi Care Chat System Documentation v2026-01-14
 */

import { get, post, patch } from "../../../shared/services/api";
import { io } from "socket.io-client";

const BASE_URL = "https://jiggy-care.onrender.com";
const SOCKET_URL = `${BASE_URL}/chat`;

// Store socket instance
let socketInstance = null;


/**
 * Initialize WebSocket connection
 * @param {string} userId - User ID
 * @param {string} userType - 'patient' or 'consultant'
 * @param {object} callbacks - Event callbacks
 * @returns {Socket} - Socket instance
 */
export const connectSocket = (userId, userType, callbacks = {}) => {
  console.log("🔌 [CHAT SERVICE] Connecting to WebSocket...");
  console.log("🔌 [CHAT SERVICE] URL:", SOCKET_URL);
  console.log("🔌 [CHAT SERVICE] User ID:", userId);
  console.log("🔌 [CHAT SERVICE] User Type:", userType);

  // Don't reconnect if already connected to the same user
  if (socketInstance && socketInstance.connected && socketInstance._userId === userId) {
    console.log("🔌 [CHAT SERVICE] Already connected to socket for user:", userId);
    // Update callbacks if they changed
    return socketInstance;
  }

  // Disconnect existing socket if it's for a different user
  if (socketInstance) {
    console.log("🔌 [CHAT SERVICE] Disconnecting existing socket (different user or role)...");
    socketInstance.disconnect();
  }

  socketInstance = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  // Store metadata on instance for tracking
  socketInstance._userId = userId;
  socketInstance._userType = userType;

  socketInstance.on("connect", () => {
    console.log(
      "✅ [CHAT SERVICE] Connected to chat server:",
      socketInstance.id
    );
    if (callbacks.onConnect) {
      callbacks.onConnect();
    }
  });

  socketInstance.on("disconnect", () => {
    console.log("❌ [CHAT SERVICE] Disconnected from chat server");
    if (callbacks.onDisconnect) {
      callbacks.onDisconnect();
    }
  });

  socketInstance.on("connect_error", (error) => {
    console.error("❌ [CHAT SERVICE] Connection error:", error);
    if (callbacks.onError) {
      callbacks.onError(error);
    }
  });

  // Listen for new messages
  socketInstance.on("new_message", (data) => {
    console.log("💬 [CHAT SERVICE] New message received:", data);
    if (callbacks.onNewMessage) {
      callbacks.onNewMessage(data);
    }
  });

  // Listen for message sent confirmation
  socketInstance.on("message_sent", (data) => {
    console.log("✅ [CHAT SERVICE] Message sent confirmation:", data);
    if (callbacks.onMessageSent) {
      callbacks.onMessageSent(data);
    }
  });

  // Listen for joined conversation
  socketInstance.on("joined_conversation", (data) => {
    console.log("✅ [CHAT SERVICE] Joined conversation:", data);
    if (callbacks.onJoinedConversation) {
      callbacks.onJoinedConversation(data);
    }
  });

  // Listen for left conversation
  socketInstance.on("left_conversation", (data) => {
    console.log("✅ [CHAT SERVICE] Left conversation:", data);
    if (callbacks.onLeftConversation) {
      callbacks.onLeftConversation(data);
    }
  });

  // Listen for typing indicators
  socketInstance.on("user_typing", (data) => {
    console.log("⌨️ [CHAT SERVICE] User typing:", data);
    if (callbacks.onUserTyping) {
      callbacks.onUserTyping(data);
    }
  });

  socketInstance.on("user_stopped_typing", (data) => {
    console.log("⌨️ [CHAT SERVICE] User stopped typing:", data);
    if (callbacks.onUserStoppedTyping) {
      callbacks.onUserStoppedTyping(data);
    }
  });

  // Listen for messages read
  socketInstance.on("messages_read", (data) => {
    console.log("✅ [CHAT SERVICE] Messages marked as read:", data);
    if (callbacks.onMessagesRead) {
      callbacks.onMessagesRead(data);
    }
  });

  // Listen for marked as read confirmation
  socketInstance.on("marked_as_read", (data) => {
    console.log("✅ [CHAT SERVICE] Marked as read confirmation:", data);
    if (callbacks.onMarkedAsRead) {
      callbacks.onMarkedAsRead(data);
    }
  });

  // Listen for errors
  socketInstance.on("error", (data) => {
    console.error("❌ [CHAT SERVICE] Socket error:", data);
    if (callbacks.onError) {
      callbacks.onError(data);
    }
  });

  // ----- Call events (audio/video) -----
  socketInstance.on("call:ringing", (data) => {
    console.log("📞 [CHAT SERVICE] Call ringing:", data);
    if (callbacks.onCallRinging) callbacks.onCallRinging(data);
  });
  socketInstance.on("call:incoming", (data) => {
    console.log("📞 [CHAT SERVICE] Incoming call – fromUserId:", data?.fromUserId, "full payload:", JSON.stringify(data));
    if (callbacks.onCallIncoming) callbacks.onCallIncoming(data);
  });
  socketInstance.on("call:accepted", (data) => {
    console.log("📞 [CHAT SERVICE] Call accepted – fromUserId:", data?.fromUserId, "full payload:", data ? JSON.stringify(data) : "(no payload)");
    if (callbacks.onCallAccepted) callbacks.onCallAccepted(data);
  });
  socketInstance.on("call:rejected", (data) => {
    console.log("📞 [CHAT SERVICE] Call rejected:", data);
    if (callbacks.onCallRejected) callbacks.onCallRejected(data);
  });
  socketInstance.on("call:no-answer", (data) => {
    console.log("📞 [CHAT SERVICE] No answer:", data);
    if (callbacks.onCallNoAnswer) callbacks.onCallNoAnswer(data);
  });
  socketInstance.on("call:missed", (data) => {
    console.log("📞 [CHAT SERVICE] Missed call:", data);
    if (callbacks.onCallMissed) callbacks.onCallMissed(data);
  });
  socketInstance.on("call:stop-ringing", () => {
    if (callbacks.onCallStopRinging) callbacks.onCallStopRinging();
  });
  socketInstance.on("call:connected", (data) => {
    console.log(`🏁 [CHAT SERVICE RACE] [t=${Date.now()}] call:connected received (recipient answered) – fromUserId:`, data?.fromUserId);
    if (callbacks.onCallConnected) callbacks.onCallConnected(data);
  });
  socketInstance.on("call:ended", (data) => {
    console.log("📞 [CHAT SERVICE] Call ended:", data);
    if (callbacks.onCallEnded) callbacks.onCallEnded(data);
  });

  return socketInstance;
};

/**
 * Disconnect WebSocket
 */
export const disconnectSocket = () => {
  if (socketInstance) {
    console.log("🔌 [CHAT SERVICE] Disconnecting socket...");
    socketInstance.disconnect();
    socketInstance = null;
  }
};

/**
 * Get socket instance
 * @returns {Socket|null} - Socket instance or null
 */
export const getSocket = () => {
  return socketInstance;
};

/**
 * Join a conversation room
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID
 * @param {string} userType - 'patient' or 'consultant'
 */
export const joinConversation = (conversationId, userId, userType) => {
  if (!socketInstance || !socketInstance.connected) {
    console.warn(
      "⚠️ [CHAT SERVICE] Socket not connected, cannot join conversation"
    );
    return;
  }

  console.log("🚪 [CHAT SERVICE] Joining conversation:", conversationId);
  socketInstance.emit("join_conversation", {
    conversationId,
    userId,
    userType,
  });
};

/**
 * Leave a conversation room
 * @param {string} conversationId - Conversation ID
 */
export const leaveConversation = (conversationId) => {
  if (!socketInstance || !socketInstance.connected) {
    console.warn(
      "⚠️ [CHAT SERVICE] Socket not connected, cannot leave conversation"
    );
    return;
  }

  console.log("🚪 [CHAT SERVICE] Leaving conversation:", conversationId);
  socketInstance.emit("leave_conversation", {
    conversationId,
  });
};

/**
 * Send a message via WebSocket
 * @param {string} conversationId - Conversation ID
 * @param {string} content - Message content
 * @param {string} senderType - 'patient' or 'consultant'
 */
export const sendMessageViaSocket = (conversationId, content, senderType) => {
  if (!socketInstance || !socketInstance.connected) {
    console.warn("⚠️ [CHAT SERVICE] Socket not connected, cannot send message");
    return;
  }

  console.log("📤 [CHAT SERVICE] Sending message via WebSocket:", {
    conversationId,
    content,
    senderType,
  });

  socketInstance.emit("send_message", {
    conversationId,
    content,
    senderType,
  });
};

/**
 * Start typing indicator
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID
 * @param {string} userType - 'patient' or 'consultant'
 */
export const startTyping = (conversationId, userId, userType) => {
  if (!socketInstance || !socketInstance.connected) {
    return;
  }

  socketInstance.emit("typing_start", {
    conversationId,
    userId,
    userType,
  });
};

/**
 * Stop typing indicator
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID
 */
export const stopTyping = (conversationId, userId) => {
  if (!socketInstance || !socketInstance.connected) {
    return;
  }

  socketInstance.emit("typing_stop", {
    conversationId,
    userId,
  });
};

/**
 * Mark messages as read via WebSocket
 * @param {string} conversationId - Conversation ID
 * @param {string[]} messageIds - Array of message IDs
 */
export const markMessagesAsReadViaSocket = (conversationId, messageIds) => {
  if (!socketInstance || !socketInstance.connected) {
    console.warn("⚠️ [CHAT SERVICE] Socket not connected, cannot mark as read");
    return;
  }

  console.log("✅ [CHAT SERVICE] Marking messages as read via WebSocket:", {
    conversationId,
    messageIds,
  });

  socketInstance.emit("mark_read", {
    conversationId,
    messageIds,
  });
};

// ==================== CALL (AUDIO/VIDEO) ====================
// fromUserId: In socket events (webrtc:offer, webrtc:answer, webrtc:ice-candidate, call:incoming),
// the server sends "fromUserId" = the user who sent the event. We use it to ensure we only
// apply signaling from our peer (data.fromUserId === otherUserId) and to know who is calling (incomingCall.fromUserId).

/**
 * Initiate a call (audio or video)
 * @param {string} toUserId - Recipient user ID (consultant or patient)
 * @param {string} conversationId - Conversation ID
 * @param {'video'|'audio'} callType - Call type
 */
export const initiateCall = (toUserId, conversationId, callType) => {
  if (!socketInstance || !socketInstance.connected) {
    console.warn("⚠️ [CHAT SERVICE] Socket not connected, cannot initiate call");
    return;
  }
  socketInstance.emit("call:initiate", {
    toUserId,
    conversationId,
    callType,
  });
};

/**
 * Accept an incoming call
 * @param {string} toUserId - Caller user ID (same as fromUserId from call:incoming)
 */
export const acceptCall = (toUserId) => {
  if (socketInstance && socketInstance.connected) {
    console.log("📞 [CHAT SERVICE] Emitting call:accept – toUserId (caller/fromUserId):", toUserId);
    socketInstance.emit("call:accept", { toUserId });
    return;
  }

  console.log(`⚠️ [CHAT SERVICE] Socket not connected or ready. Queuing call:accept for user: ${toUserId}...`);

  const tryEmit = () => {
    if (socketInstance && socketInstance.connected) {
      console.log(`🔌 [CHAT SERVICE] Socket now active. Emitting queued call:accept – toUserId: ${toUserId}`);
      socketInstance.emit("call:accept", { toUserId });
      return true;
    }
    return false;
  };

  // 1. Try to set up a 'connect' listener if the instance exists
  if (socketInstance) {
    socketInstance.once("connect", () => {
      console.log("🔌 [CHAT SERVICE] Socket connected event fired. Sending queued call:accept...");
      socketInstance.emit("call:accept", { toUserId });
    });
  }

  // 2. Also run a periodic check (polling fallback) to handle cases where socketInstance is replaced/connected
  const interval = setInterval(() => {
    if (tryEmit()) {
      clearInterval(interval);
    }
  }, 300);

  // Clear interval after 15 seconds to avoid memory leak
  setTimeout(() => {
    clearInterval(interval);
  }, 15000);
};

/**
 * Reject an incoming call
 * @param {string} toUserId - Caller user ID
 * @param {string} reason - Optional reason (e.g. 'Busy', 'Declined')
 */
export const rejectCall = (toUserId, reason = "Declined") => {
  if (!socketInstance || !socketInstance.connected) return;
  socketInstance.emit("call:reject", { toUserId, reason });
};

/**
 * End an active call
 * @param {string} toUserId - Other party user ID
 */
export const endCall = (toUserId) => {
  if (!socketInstance || !socketInstance.connected) return;
  socketInstance.emit("call:end", { toUserId });
};

// ==================== REST API ENDPOINTS ====================

/**
 * Get or create conversation (POST endpoint)
 * @param {string} consultantId - Consultant ID
 * @param {string} patientId - Patient ID
 * @param {string} bookingId - Booking ID (optional)
 * @returns {Promise<object>} - Conversation data
 */
export const getConversations = async (
  consultantId,
  patientId,
  bookingId = null
) => {
  console.log("💬 [CHAT SERVICE] Getting or creating conversation...");
  console.log("💬 [CHAT SERVICE] Consultant ID:", consultantId);
  console.log("💬 [CHAT SERVICE] Patient ID:", patientId);
  console.log("💬 [CHAT SERVICE] Booking ID:", bookingId);

  try {
    const body = {
      consultantId,
      patientId,
    };

    // Add bookingId if provided
    if (bookingId) {
      body.bookingId = bookingId;
    }

    const response = await post("/chat/conversations", body);
    console.log(
      "✅ [CHAT SERVICE] Conversation retrieved/created successfully:",
      JSON.stringify(response, null, 2)
    );

    // Return the conversation object (single conversation, not array)
    return response;
  } catch (error) {
    console.error(
      "❌ [CHAT SERVICE] Error getting/creating conversation:",
      error
    );
    throw error;
  }
};

/**
 * Create a new conversation or get existing one
 * @param {string} consultantId - Consultant ID
 * @param {string} patientId - Patient ID
 * @param {string} bookingId - Booking ID (optional)
 * @returns {Promise<object>} - Conversation data
 */
export const createConversation = async (
  consultantId,
  patientId,
  bookingId = null
) => {
  console.log("📝 [CHAT SERVICE] Creating conversation...");
  console.log("📝 [CHAT SERVICE] Consultant ID:", consultantId);
  console.log("📝 [CHAT SERVICE] Patient ID:", patientId);
  console.log("📝 [CHAT SERVICE] Booking ID:", bookingId);

  try {
    const body = {
      consultantId,
      patientId,
    };

    // Add bookingId if provided
    if (bookingId) {
      body.bookingId = bookingId;
    }

    const response = await post("/chat/conversations", body);
    console.log(
      "✅ [CHAT SERVICE] Conversation created successfully:",
      JSON.stringify(response, null, 2)
    );

    return response;
  } catch (error) {
    console.error("❌ [CHAT SERVICE] Error creating conversation:", error);
    throw error;
  }
};

/**
 * Get messages for a conversation
 * @param {string} conversationId - Conversation ID
 * @param {number} limit - Number of messages to return (default: 50)
 * @param {number} offset - Number of messages to skip (default: 0)
 * @returns {Promise<object>} - Conversation and messages data
 */
export const getMessages = async (conversationId, limit = 50, offset = 0) => {
  console.log("💬 [CHAT SERVICE] Fetching messages...");
  console.log("💬 [CHAT SERVICE] Conversation ID:", conversationId);
  console.log("💬 [CHAT SERVICE] Limit:", limit);
  console.log("💬 [CHAT SERVICE] Offset:", offset);

  try {
    const endpoint = `/chat/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`;
    const response = await get(endpoint);
    console.log(
      "✅ [CHAT SERVICE] Messages fetched successfully:",
      JSON.stringify(response, null, 2)
    );

    return response;
  } catch (error) {
    console.error("❌ [CHAT SERVICE] Error fetching messages:", error);
    throw error;
  }
};

/**
 * Send a message via REST API (fallback)
 * @param {object} messageData - Message data
 * @param {string} messageData.consultantId - Consultant ID
 * @param {string} messageData.patientId - Patient ID
 * @param {string} messageData.bookingId - Booking ID (optional)
 * @param {string} messageData.content - Message content
 * @param {string} messageData.senderType - 'patient' or 'consultant'
 * @returns {Promise<object>} - Message and conversation data
 */
export const sendMessage = async (messageData) => {
  console.log("📤 [CHAT SERVICE] Sending message via REST API...");
  console.log(
    "📤 [CHAT SERVICE] Message data:",
    JSON.stringify(messageData, null, 2)
  );

  try {
    const response = await post("/chat/messages", messageData);
    console.log(
      "✅ [CHAT SERVICE] Message sent successfully:",
      JSON.stringify(response, null, 2)
    );
    return response;
  } catch (error) {
    console.error("❌ [CHAT SERVICE] Error sending message:", error);
    throw error;
  }
};

/**
 * Get unread message count for a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID
 * @returns {Promise<object>} - Unread count data
 */
export const getUnreadCount = async (conversationId, userId) => {
  console.log("🔔 [CHAT SERVICE] Fetching unread count...");
  console.log("🔔 [CHAT SERVICE] Conversation ID:", conversationId);
  console.log("🔔 [CHAT SERVICE] User ID:", userId);

  try {
    const endpoint = `/chat/conversations/${conversationId}/unread?userId=${userId}`;
    const response = await get(endpoint);
    console.log(
      "✅ [CHAT SERVICE] Unread count fetched successfully:",
      JSON.stringify(response, null, 2)
    );
    return response;
  } catch (error) {
    console.error("❌ [CHAT SERVICE] Error fetching unread count:", error);
    throw error;
  }
};

/**
 * Mark messages as read via REST API
 * @param {string} conversationId - Conversation ID
 * @param {string[]} messageIds - Array of message IDs
 * @returns {Promise<object>} - Success response
 */
export const markMessagesAsRead = async (conversationId, messageIds) => {
  console.log("✅ [CHAT SERVICE] Marking messages as read via REST API...");
  console.log("✅ [CHAT SERVICE] Conversation ID:", conversationId);
  console.log("✅ [CHAT SERVICE] Message IDs:", messageIds);

  try {
    const endpoint = `/chat/conversations/${conversationId}/read`;
    const response = await post(endpoint, { messageIds });
    console.log(
      "✅ [CHAT SERVICE] Messages marked as read successfully:",
      JSON.stringify(response, null, 2)
    );
    return response;
  } catch (error) {
    console.error("❌ [CHAT SERVICE] Error marking messages as read:", error);
    throw error;
  }
};

export default {
  // WebSocket
  connectSocket,
  disconnectSocket,
  getSocket,
  joinConversation,
  leaveConversation,
  sendMessageViaSocket,
  startTyping,
  stopTyping,
  markMessagesAsReadViaSocket,
  // REST API
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  getUnreadCount,
  markMessagesAsRead,
};
