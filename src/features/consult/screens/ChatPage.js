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
import { getConversations, sendMessage } from "../services/chatService";
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
  const scrollViewRef = useRef(null);

  // Get consultantId and patientId
  const consultantId = doctor?.consultantId || doctor?.consultantData?.userId;
  const patientId = user?.id; // User ID from AuthContext

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

  // Fetch conversations and messages on mount
  useEffect(() => {
    if (consultantId && patientId) {
      fetchConversations();
    } else {
      setIsLoading(false);
    }
  }, [consultantId, patientId]);

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
      console.log("💬 [CHAT PAGE] Fetching conversations...");
      const response = await getConversations(consultantId, patientId);

      // Handle array response
      const conversations = Array.isArray(response)
        ? response
        : response.data || [];

      if (conversations.length > 0) {
        const conversation = conversations[0]; // Get first conversation
        setConversationId(conversation.id);

        // Map messages from API to display format
        const mappedMessages = (conversation.messages || []).map((msg) => {
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

        // Sort messages by createdAt
        mappedMessages.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateA - dateB;
        });

        setMessages(mappedMessages);
        console.log("✅ [CHAT PAGE] Messages loaded:", mappedMessages.length);
      } else {
        // No conversation exists yet
        setMessages([]);
        setConversationId(null);
        console.log("ℹ️ [CHAT PAGE] No conversation found");
      }
    } catch (error) {
      console.error("❌ [CHAT PAGE] Error fetching conversations:", error);
      showError(error.message || "Failed to load messages");
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Send a message
   */
  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;
    if (!consultantId || !patientId) {
      showError("Unable to send message. Missing user information.");
      return;
    }

    const messageContent = message.trim();
    setMessage(""); // Clear input immediately for better UX

    // Optimistically add message to UI
    const tempMessage = {
      id: `temp-${Date.now()}`,
      text: messageContent,
      sender: "user",
      time: format(new Date(), "h:mm a").toLowerCase(),
      status: "sent",
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      setIsSending(true);
      console.log("📤 [CHAT PAGE] Sending message...");

      const response = await sendMessage({
        consultantId,
        patientId,
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
          // Remove temp message and add real one
          const filtered = prev.filter((msg) => msg.id !== tempMessage.id);
          return [...filtered, realMessage];
        });
      } else {
        // If API doesn't return message, keep the temp one but mark it as sent
        setMessages((prev) => prev);
      }

      console.log("✅ [CHAT PAGE] Message sent successfully");
    } catch (error) {
      console.error("❌ [CHAT PAGE] Error sending message:", error);
      showError(error.message || "Failed to send message");

      // Remove temp message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
      setMessage(messageContent); // Restore message in input
    } finally {
      setIsSending(false);
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
          onChangeText={setMessage}
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
});
