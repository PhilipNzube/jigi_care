/**
 * ChatBot Service
 * Handles chatbot-related API calls
 */

import { get, post } from "../../../shared/services/api";

/**
 * Send a message to the chatbot
 * @param {string} message - User message
 * @param {string} [sessionId] - Optional session ID to continue a conversation
 * @returns {Promise<object>} - { sessionId, reply }
 */
export const sendChatBotMessage = async (message, sessionId) => {
  console.log("🤖 [CHATBOT SERVICE] Sending message:", message);
  try {
    const body = { message };
    if (sessionId) {
      body.sessionId = sessionId;
    }
    const response = await post("/chatbot/send", body);
    return response;
  } catch (error) {
    console.error("❌ [CHATBOT SERVICE] Error sending message:", error);
    throw error;
  }
};

/**
 * Get all chatbot sessions for the patient
 * @returns {Promise<Array>} - Array of sessions { sessionId, createdAt }
 */
export const getChatBotSessions = async () => {
  console.log("🤖 [CHATBOT SERVICE] Fetching sessions...");
  try {
    const response = await get("/chatbot/patient/session");
    // The API returns the array directly or inside a data property
    return Array.isArray(response) ? response : response?.data || [];
  } catch (error) {
    console.error("❌ [CHATBOT SERVICE] Error fetching sessions:", error);
    throw error;
  }
};

/**
 * Get details/history of a specific chatbot session
 * @param {string} sessionId - Session ID
 * @returns {Promise<Array>} - Array of messages { id, role, content, createdAt }
 */
export const getChatBotSessionDetails = async (sessionId) => {
  console.log("🤖 [CHATBOT SERVICE] Fetching session details:", sessionId);
  try {
    const response = await get(`/chatbot/session/${sessionId}`);
    return Array.isArray(response) ? response : response?.data || [];
  } catch (error) {
    console.error("❌ [CHATBOT SERVICE] Error fetching session details:", error);
    throw error;
  }
};

export default {
  sendChatBotMessage,
  getChatBotSessions,
  getChatBotSessionDetails,
};
