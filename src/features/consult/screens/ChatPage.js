import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAuth } from "../../../shared/context/AuthContext";
import {
  connectSocket,
  disconnectSocket,
  joinConversation,
  leaveConversation,
  sendMessageViaSocket,
  startTyping,
  stopTyping,
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsReadViaSocket,
} from "../services/chatService";
import { format, parseISO } from "date-fns";
import { showError } from "../../../shared/utils/toast";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";

export default function ChatPage({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { doctor } = route.params || {};
  const { user } = useAuth();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const scrollViewRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Get consultantId and patientId
  const consultantId = doctor?.consultantId || doctor?.consultantData?.userId;
  const patientId = user?.id; // User ID from AuthContext
  const bookingId = doctor?.bookingId || route.params?.bookingId; // Booking ID if available

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!patientId) {
      setIsLoading(false);
      return;
    }

    console.log("🔌 [CHAT PAGE] Initializing WebSocket connection...");

    const socket = connectSocket(patientId, "patient", {
      onConnect: () => {
        console.log("✅ [CHAT PAGE] WebSocket connected");
        setIsConnected(true);
      },
      onDisconnect: () => {
        console.log("❌ [CHAT PAGE] WebSocket disconnected");
        setIsConnected(false);
      },
      onError: (error) => {
        console.error("❌ [CHAT PAGE] WebSocket error:", error);
        setIsConnected(false);
      },
      onNewMessage: (data) => {
        console.log("💬 [CHAT PAGE] New message received via WebSocket:", data);
        handleNewMessage(data);
      },
      onMessageSent: (data) => {
        console.log("✅ [CHAT PAGE] Message sent confirmation:", data);
        handleMessageSent(data);
      },
      onUserTyping: (data) => {
        console.log("⌨️ [CHAT PAGE] User typing:", data);
        // Only show typing if it's not the current user
        if (data.userId !== patientId) {
          setIsTyping(true);
        }
      },
      onUserStoppedTyping: (data) => {
        console.log("⌨️ [CHAT PAGE] User stopped typing:", data);
        if (data.userId !== patientId) {
          setIsTyping(false);
        }
      },
      onMessagesRead: (data) => {
        console.log("✅ [CHAT PAGE] Messages read:", data);
        handleMessagesRead(data);
      },
    });

    return () => {
      console.log("🔌 [CHAT PAGE] Cleaning up WebSocket connection...");
      if (conversationId) {
        leaveConversation(conversationId);
      }
      disconnectSocket();
    };
  }, [patientId]);

  // Fetch conversations and messages on mount
  useEffect(() => {
    if (consultantId && patientId) {
      fetchConversations();
    } else {
      setIsLoading(false);
    }
  }, [consultantId, patientId]);

  // Join conversation room when conversationId is available
  useEffect(() => {
    if (conversationId && isConnected && patientId) {
      console.log("🚪 [CHAT PAGE] Joining conversation room:", conversationId);
      joinConversation(conversationId, patientId, "patient");
    }
  }, [conversationId, isConnected, patientId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  /**
   * Fetch conversations and messages
   */
  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      console.log("💬 [CHAT PAGE] Getting or creating conversation...");

      // Use POST endpoint to get or create conversation
      const conversation = await getConversations(
        consultantId,
        patientId,
        bookingId
      );

      let currentConversationId = null;

      if (conversation && conversation.id) {
        // Use the conversation returned from POST endpoint
        currentConversationId = conversation.id;
        setConversationId(currentConversationId);
      } else {
        console.log("ℹ️ [CHAT PAGE] No conversation found");
        setConversationId(null);
      }

      // Fetch messages if conversation exists
      if (currentConversationId) {
        const messagesResponse = await getMessages(
          currentConversationId,
          50,
          0
        );
        const conversationMessages = messagesResponse.messages || [];

        // Map messages from API to display format
        const mappedMessages = conversationMessages.map((msg) => {
          const messageDate = parseISO(msg.createdAt);
          const isUserMessage = msg.senderType === "patient";

          return {
            id: msg.id,
            text: msg.content,
            sender: isUserMessage ? "user" : "doctor",
            time: format(messageDate, "h:mm a").toLowerCase(),
            status: msg.isRead ? "read" : "sent",
            createdAt: msg.createdAt,
          };
        });

        // Sort messages by createdAt (oldest first)
        mappedMessages.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateA - dateB;
        });

        setMessages(mappedMessages);
        console.log("✅ [CHAT PAGE] Messages loaded:", mappedMessages.length);

        // Mark messages as read
        const unreadMessageIds = mappedMessages
          .filter((msg) => msg.sender === "doctor" && msg.status !== "read")
          .map((msg) => msg.id);

        if (unreadMessageIds.length > 0) {
          markMessagesAsReadViaSocket(currentConversationId, unreadMessageIds);
        }
      } else {
        setMessages([]);
        console.log("ℹ️ [CHAT PAGE] No conversation found");
      }
    } catch (error) {
      console.error("❌ [CHAT PAGE] Error fetching conversations:", error);
      showError(
        "Unable to load messages. Please check your connection and try again."
      );
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle new message from WebSocket
   * Only handles messages from others (not our own messages)
   */
  const handleNewMessage = (data) => {
    if (!data.message) return;

    const msg = data.message;
    const messageDate = parseISO(msg.createdAt);
    const isUserMessage = msg.senderType === "patient";

    // Ignore our own messages - they're handled by handleMessageSent
    if (isUserMessage && msg.senderId === patientId) {
      console.log("ℹ️ [CHAT PAGE] Ignoring own message in new_message event");
      return;
    }

    const newMessage = {
      id: msg.id,
      text: msg.content,
      sender: isUserMessage ? "user" : "doctor",
      time: format(messageDate, "h:mm a").toLowerCase(),
      status: msg.isRead ? "read" : "sent",
      createdAt: msg.createdAt,
    };

    setMessages((prev) => {
      // Check if message already exists (avoid duplicates)
      const exists = prev.some((m) => m.id === newMessage.id);
      if (exists) {
        return prev;
      }
      return [...prev, newMessage];
    });

    // Update conversation ID if needed
    if (data.conversation?.id && !conversationId) {
      setConversationId(data.conversation.id);
    }

    // Mark as read if it's a doctor message
    if (!isUserMessage && !msg.isRead) {
      markMessagesAsReadViaSocket(data.conversation?.id || conversationId, [
        msg.id,
      ]);
    }
  };

  /**
   * Handle message sent confirmation
   * Only handles our own messages
   */
  const handleMessageSent = (data) => {
    if (!data.message) return;

    const msg = data.message;
    const messageDate = parseISO(msg.createdAt);

    const realMessage = {
      id: msg.id,
      text: msg.content,
      sender: "user",
      time: format(messageDate, "h:mm a").toLowerCase(),
      status: msg.isRead ? "read" : "sent",
      createdAt: msg.createdAt,
    };

    setMessages((prev) => {
      // Remove any temp messages with same content
      const filtered = prev.filter((m) => {
        // Remove temp messages
        if (m.id.startsWith("temp-")) {
          return false;
        }
        // Remove any existing message with same ID (avoid duplicates)
        if (m.id === realMessage.id) {
          return false;
        }
        return true;
      });

      // Add the real message
      return [...filtered, realMessage];
    });

    // Update conversation ID if needed
    if (data.conversation?.id && !conversationId) {
      setConversationId(data.conversation.id);
    }
  };

  /**
   * Handle messages read update
   */
  const handleMessagesRead = (data) => {
    if (!data.messageIds || !Array.isArray(data.messageIds)) return;

    setMessages((prev) =>
      prev.map((msg) =>
        data.messageIds.includes(msg.id) ? { ...msg, status: "read" } : msg
      )
    );
  };

  /**
   * Send a message
   */
  const handleSendMessage = async () => {
    // Prevent double-tap and ensure message is not empty
    if (!message.trim() || isSending) {
      return;
    }

    if (!consultantId || !patientId) {
      showError("Unable to send message. Please try again later.");
      return;
    }

    const messageContent = message.trim();
    setMessage(""); // Clear input immediately for better UX
    stopTypingIndicator(); // Stop typing indicator

    // Set sending state immediately to prevent double-tap
    setIsSending(true);

    // Optimistically add message to UI
    const tempMessageId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempMessageId,
      text: messageContent,
      sender: "user",
      time: format(new Date(), "h:mm a").toLowerCase(),
      status: "sent",
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      console.log("📤 [CHAT PAGE] Sending message...");

      // If conversation exists, use WebSocket
      if (conversationId && isConnected) {
        console.log("📤 [CHAT PAGE] Sending via WebSocket");
        sendMessageViaSocket(conversationId, messageContent, "patient");
        // Message will be confirmed via WebSocket event (message_sent)
        // Temp message will be replaced by handleMessageSent
      } else {
        // Fallback to REST API (will create conversation if needed)
        console.log("📤 [CHAT PAGE] Sending via REST API (fallback)");
        const response = await sendMessage({
          consultantId,
          patientId,
          bookingId: bookingId || undefined,
          content: messageContent,
          senderType: "patient",
        });

        // Update conversation ID if this is a new conversation
        if (response.conversation?.id && !conversationId) {
          setConversationId(response.conversation.id);
        }

        // Replace temp message with real message from API
        if (response.message) {
          const realMessage = {
            id: response.message.id,
            text: response.message.content,
            sender: "user",
            time: format(
              parseISO(response.message.createdAt),
              "h:mm a"
            ).toLowerCase(),
            status: response.message.isRead ? "read" : "sent",
            createdAt: response.message.createdAt,
          };

          setMessages((prev) => {
            const filtered = prev.filter((msg) => msg.id !== tempMessageId);
            return [...filtered, realMessage];
          });
        } else {
          // If no message in response, remove temp message
          setMessages((prev) => prev.filter((msg) => msg.id !== tempMessageId));
        }
      }

      console.log("✅ [CHAT PAGE] Message sent successfully");
    } catch (error) {
      console.error("❌ [CHAT PAGE] Error sending message:", error);
      showError(
        "Unable to send message. Please check your connection and try again."
      );

      // Remove temp message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessageId));
      setMessage(messageContent); // Restore message in input
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Handle typing indicator
   */
  const handleTyping = (text) => {
    setMessage(text);

    if (!conversationId || !isConnected) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Start typing indicator
    startTyping(conversationId, patientId, "patient");

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTypingIndicator();
    }, 2000);
  };

  /**
   * Stop typing indicator
   */
  const stopTypingIndicator = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (conversationId && isConnected) {
      stopTyping(conversationId, patientId);
    }
  };

  const handleVoiceCall = () => {
    navigation.navigate("VoiceCall", { doctor });
  };

  const handleVideoCall = () => {
    navigation.navigate("VideoCall", { doctor });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.grey} />
        </TouchableOpacity>

        <View style={styles.doctorInfo}>
          <View style={styles.doctorAvatar}>
            <Ionicons name="person" size={20} color={Colors.primary} />
          </View>
          <View style={styles.doctorDetails}>
            <Text style={styles.doctorName}>
              {doctor?.name || "Dr. Sarah Olukoya"}
            </Text>
            {/* Online status - commented out */}
            {/* <Text style={styles.doctorStatus}>Online</Text> */}
          </View>
        </View>

        <View style={styles.headerActions}>
          {/* Voice call icon - commented out */}
          {/* <TouchableOpacity
            style={styles.actionButton}
            onPress={handleVoiceCall}
          >
            <Ionicons name="call" size={24} color={Colors.black} />
          </TouchableOpacity> */}
          {/* Video call icon - commented out */}
          {/* <TouchableOpacity
            style={styles.actionButton}
            onPress={handleVideoCall}
          >
            <Ionicons name="videocam" size={24} color={Colors.black} />
          </TouchableOpacity> */}
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            {[1, 2, 3, 4].map((index) => (
              <ShimmerLoader key={index}>
                <View
                  style={[
                    styles.messageSkeleton,
                    index % 2 === 0
                      ? styles.skeletonUserMessage
                      : styles.skeletonDoctorMessage,
                  ]}
                >
                  <View style={styles.skeletonBubble} />
                </View>
              </ShimmerLoader>
            ))}
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="chatbubbles-outline"
              size={64}
              color={Colors.grey}
            />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubText}>
              Start the conversation by sending a message
            </Text>
          </View>
        ) : (
          messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageContainer,
                msg.sender === "user"
                  ? styles.userMessage
                  : styles.doctorMessage,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  msg.sender === "user"
                    ? styles.userBubble
                    : styles.doctorBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.sender === "user" ? styles.userText : styles.doctorText,
                  ]}
                >
                  {msg.text}
                </Text>
                <View style={styles.messageFooter}>
                  <Text
                    style={[
                      styles.messageTime,
                      msg.sender === "user"
                        ? styles.userTime
                        : styles.doctorTime,
                    ]}
                  >
                    {msg.time}
                  </Text>
                  {msg.sender === "user" && (
                    <Ionicons
                      name={
                        msg.status === "read" ? "checkmark-done" : "checkmark"
                      }
                      size={16}
                      color={Colors.white}
                      style={styles.statusIcon}
                    />
                  )}
                </View>
              </View>
            </View>
          ))
        )}
        {isTyping && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>Doctor is typing...</Text>
          </View>
        )}
      </ScrollView>

      <View
        style={[
          styles.inputContainer,
          { paddingBottom: isKeyboardVisible ? 0 : insets.bottom },
        ]}
      >
        {/* Camera icon - commented out */}
        {/* <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="camera" size={24} color={Colors.grey} />
        </TouchableOpacity> */}

        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor={Colors.grey}
          value={message}
          onChangeText={handleTyping}
          multiline
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (isSending || !message.trim()) && styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={isSending || !message.trim()}
        >
          {isSending ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Ionicons name="send" size={20} color={Colors.white} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    marginRight: Sizes.sm,
  },
  doctorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  doctorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.sm,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
  },
  doctorStatus: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginLeft: Sizes.sm,
    padding: Sizes.xs,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
  },
  messageContainer: {
    marginVertical: Sizes.xs,
  },
  userMessage: {
    alignItems: "flex-end",
  },
  doctorMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: "#0098B3",
    borderBottomRightRadius: 5,
  },
  doctorBubble: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    lineHeight: 20,
  },
  userText: {
    color: Colors.white,
  },
  doctorText: {
    color: Colors.black,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Sizes.xs,
  },
  messageTime: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
  },
  userTime: {
    color: Colors.white,
    opacity: 0.8,
  },
  doctorTime: {
    color: Colors.grey,
  },
  statusIcon: {
    marginLeft: Sizes.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    backgroundColor: "#F0F0F0",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  attachButton: {
    marginRight: Sizes.sm,
    padding: Sizes.xs,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#0098B3",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Sizes.sm,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
  },
  messageSkeleton: {
    marginVertical: Sizes.xs,
  },
  skeletonUserMessage: {
    alignItems: "flex-end",
  },
  skeletonDoctorMessage: {
    alignItems: "flex-start",
  },
  skeletonBubble: {
    width: "60%",
    height: 60,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Sizes.xl * 2,
  },
  emptyText: {
    marginTop: Sizes.md,
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
  },
  emptySubText: {
    marginTop: Sizes.xs,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
    textAlign: "center",
    paddingHorizontal: Sizes.lg,
  },
  typingIndicator: {
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.xs,
  },
  typingText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
    fontStyle: "italic",
  },
});
