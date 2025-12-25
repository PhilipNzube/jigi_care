/**
 * Notification Service
 * Handles Server-Sent Events (SSE) for real-time notifications
 */

import { getToken } from "../../../shared/utils/storage";

const BASE_URL = "https://jiggy-care.onrender.com/api/v1";

/**
 * Connect to notification stream using Server-Sent Events
 * @param {function} onNotification - Callback when notification is received
 * @param {function} onError - Callback when error occurs
 * @returns {function} - Function to close the connection
 */
export const connectNotificationStream = (onNotification, onError) => {
  let reader = null;
  let isConnected = false;
  let abortController = null;

  const connect = async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.error("❌ [NOTIFICATION SERVICE] No token available");
        if (onError) onError(new Error("No authentication token"));
        return null;
      }

      const url = `${BASE_URL}/notification/stream`;
      console.log(
        "🔔 [NOTIFICATION SERVICE] Connecting to notification stream..."
      );

      abortController = new AbortController();

      // Use fetch with ReadableStream for SSE
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "text/event-stream",
          "x-client-type": "mobile",
          Authorization: `Bearer ${token}`,
        },
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Response body is not available");
      }

      reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const readStream = async () => {
        try {
          isConnected = true;
          console.log(
            "✅ [NOTIFICATION SERVICE] Connected to notification stream"
          );

          while (isConnected) {
            const { done, value } = await reader.read();

            if (done) {
              console.log("🔔 [NOTIFICATION SERVICE] Stream closed");
              isConnected = false;
              break;
            }

            // Decode chunk and add to buffer
            buffer += decoder.decode(value, { stream: true });

            // Process complete lines
            const lines = buffer.split("\n");
            buffer = lines.pop() || ""; // Keep incomplete line in buffer

            let currentId = null;
            let currentData = null;

            for (const line of lines) {
              const trimmedLine = line.trim();

              if (trimmedLine.startsWith("id:")) {
                currentId = trimmedLine.substring(3).trim();
              } else if (trimmedLine.startsWith("data:")) {
                const dataStr = trimmedLine.substring(5).trim();
                if (dataStr) {
                  try {
                    currentData = JSON.parse(dataStr);
                  } catch (e) {
                    console.error(
                      "❌ [NOTIFICATION SERVICE] Error parsing JSON:",
                      e,
                      "Data:",
                      dataStr
                    );
                  }
                }
              } else if (trimmedLine === "") {
                // Empty line indicates end of event
                if (currentData && currentId) {
                  console.log(
                    "🔔 [NOTIFICATION SERVICE] Received notification:",
                    currentId
                  );
                  if (onNotification) {
                    onNotification(currentData);
                  }
                  currentId = null;
                  currentData = null;
                }
              }
            }
          }
        } catch (error) {
          if (error.name === "AbortError") {
            console.log("🔔 [NOTIFICATION SERVICE] Stream aborted");
          } else {
            console.error(
              "❌ [NOTIFICATION SERVICE] Stream read error:",
              error
            );
            isConnected = false;
            if (onError) onError(error);
          }
        }
      };

      // Start reading the stream
      readStream();

      // Return cleanup function
      return () => {
        console.log("🔔 [NOTIFICATION SERVICE] Closing notification stream...");
        isConnected = false;
        if (abortController) {
          abortController.abort();
        }
        if (reader) {
          reader.cancel().catch(() => {
            // Ignore cancel errors
          });
        }
      };
    } catch (error) {
      console.error("❌ [NOTIFICATION SERVICE] Connection error:", error);
      isConnected = false;
      if (onError) onError(error);
      return null;
    }
  };

  const cleanup = connect();
  return cleanup;
};

export default {
  connectNotificationStream,
};
