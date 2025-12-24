/**
 * Chat Service
 * Handles all chat-related API calls
 */

import { get, post } from "../../../shared/services/api";

/**
 * Get conversations between a patient and consultant
 * @param {string} consultantId - The consultant's user ID
 * @param {string} patientId - The patient's user ID
 * @returns {Promise} - Conversation data with messages
 */
export const getConversations = async (consultantId, patientId) => {
  console.log("💬 [CHAT SERVICE] Fetching conversations...");
  console.log("💬 [CHAT SERVICE] Consultant ID:", consultantId);
  console.log("💬 [CHAT SERVICE] Patient ID:", patientId);
  try {
    const endpoint = `/chat/conversations?consultantId=${consultantId}&patientId=${patientId}`;
    const response = await get(endpoint);
    console.log("✅ [CHAT SERVICE] Conversations fetched successfully:", JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error("❌ [CHAT SERVICE] Error fetching conversations:", error);
    throw error;
  }
};

/**
 * Send a message
 * @param {object} messageData - Message data
 * @param {string} messageData.consultantId - The consultant's user ID
 * @param {string} messageData.patientId - The patient's user ID
 * @param {string} messageData.content - Message content
 * @param {string} messageData.senderType - "patient" or "consultant"
 * @returns {Promise} - Message and conversation data
 */
export const sendMessage = async (messageData) => {
  console.log("📤 [CHAT SERVICE] Sending message...");
  console.log("📤 [CHAT SERVICE] Message data:", JSON.stringify(messageData, null, 2));
  try {
    const response = await post("/chat/messages", messageData);
    console.log("✅ [CHAT SERVICE] Message sent successfully:", JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error("❌ [CHAT SERVICE] Error sending message:", error);
    throw error;
  }
};

/**
 * Get unread message count for a conversation
 * @param {string} conversationId - The conversation ID
 * @param {string} userId - The user ID (patient or consultant)
 * @returns {Promise} - Unread count data
 */
export const getUnreadCount = async (conversationId, userId) => {
  console.log("🔔 [CHAT SERVICE] Fetching unread count...");
  console.log("🔔 [CHAT SERVICE] Conversation ID:", conversationId);
  console.log("🔔 [CHAT SERVICE] User ID:", userId);
  try {
    const endpoint = `/chat/conversations/${conversationId}/unread?userId=${userId}`;
    const response = await get(endpoint);
    console.log("✅ [CHAT SERVICE] Unread count fetched successfully:", JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error("❌ [CHAT SERVICE] Error fetching unread count:", error);
    throw error;
  }
};

export default {
  getConversations,
  sendMessage,
  getUnreadCount,
};

