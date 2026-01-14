/**
 * Chat Service
 * Handles all chat-related API calls and WebSocket connections
 * Based on Jiggy Care Chat System Documentation v2026-01-14
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

  // Disconnect existing socket if any
  if (socketInstance) {
    console.log("🔌 [CHAT SERVICE] Disconnecting existing socket...");
    socketInstance.disconnect();
  }

  socketInstance = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

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

// ==================== REST API ENDPOINTS ====================

/**
 * Get conversations for a user
 * @param {string} consultantId - Consultant ID (optional)
 * @param {string} patientId - Patient ID (optional)
 * @returns {Promise<Array>} - Array of conversations
 */
export const getConversations = async (consultantId, patientId) => {
  console.log("💬 [CHAT SERVICE] Fetching conversations...");
  console.log("💬 [CHAT SERVICE] Consultant ID:", consultantId);
  console.log("💬 [CHAT SERVICE] Patient ID:", patientId);

  try {
    let endpoint = "/chat/conversations";
    const params = [];

    if (consultantId) {
      params.push(`consultantId=${consultantId}`);
    }
    if (patientId) {
      params.push(`patientId=${patientId}`);
    }

    if (params.length > 0) {
      endpoint += `?${params.join("&")}`;
    }

    const response = await get(endpoint);
    console.log(
      "✅ [CHAT SERVICE] Conversations fetched successfully:",
      JSON.stringify(response, null, 2)
    );

    // Handle array response directly
    return Array.isArray(response) ? response : response.data || [];
  } catch (error) {
    console.error("❌ [CHAT SERVICE] Error fetching conversations:", error);
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
