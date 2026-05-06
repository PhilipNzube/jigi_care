import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";
import { useAuth } from "../../../shared/context/AuthContext";
import { 
  sendChatBotMessage, 
  getChatBotSessions, 
  getChatBotSessionDetails 
} from "../services/chatBotService";
import { format, parseISO } from "date-fns";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { uploadFile } from "../../../shared/services/uploadService";
import LoadingOverlay from "../../../shared/components/LoadingOverlay";
import { showError } from "../../../shared/utils/toast";

const { width, height } = Dimensions.get("window");

// Animated Typing Indicator Component
const TypingDots = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animate(dot1, 0);
    animate(dot2, 200);
    animate(dot3, 400);
  }, []);

  const getStyle = (dot) => ({
    opacity: dot.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
    transform: [
      {
        translateY: dot.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -3],
        }),
      },
    ],
  });

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, getStyle(dot1)]} />
      <Animated.View style={[styles.dot, getStyle(dot2)]} />
      <Animated.View style={[styles.dot, getStyle(dot3)]} />
    </View>
  );
};

export default function ChatBotInterface({ visible, onClose }) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingResponses, setPendingResponses] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isSessionsVisible, setIsSessionsVisible] = useState(false);
  const [isAttachmentModalVisible, setIsAttachmentModalVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const scrollViewRef = useRef(null);
  
  // Get first name from user
  const getFirstName = () => {
    if (!user) return "there";
    const fullName = user?.fullName || user?.name || "";
    const firstName = fullName.split(" ")[0];
    return firstName || "there";
  };

  const firstName = getFirstName();
  
  const [messages, setMessages] = useState([]);

  // Initialize messages with welcome message
  const setWelcomeMessage = () => {
    setMessages([
      {
        id: "welcome",
        text: `Hi ${firstName} 👋 I'm JigiBot, your virtual health assistant. How can I help you today?`,
        sender: "bot",
        time: format(new Date(), "hh:mm a"),
      },
    ]);
  };

  useEffect(() => {
    if (visible) {
      setWelcomeMessage();
      fetchSessions();
    }
  }, [visible, user]);

  const fetchSessions = async () => {
    try {
      const data = await getChatBotSessions();
      // Ensure unique session IDs to avoid React key warnings
      const uniqueSessions = [];
      const seenIds = new Set();
      (data || []).forEach(session => {
        if (session.sessionId && !seenIds.has(session.sessionId)) {
          seenIds.add(session.sessionId);
          uniqueSessions.push(session);
        }
      });
      setSessions(uniqueSessions);
    } catch (error) {
      console.error("Error fetching chatbot sessions:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    const timestamp = format(new Date(), "hh:mm a");
    
    // Add user message to UI
    const newUserMsg = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: userMessage,
      sender: "user",
      time: timestamp,
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setMessage("");
    setPendingResponses(prev => prev + 1);

    try {
      const response = await sendChatBotMessage(userMessage, activeSessionId);
      
      if (response && response.reply) {
        // Update active session ID if it was a new session
        if (!activeSessionId && response.sessionId) {
          setActiveSessionId(response.sessionId);
          fetchSessions(); // Refresh sessions list
        }

        const botReply = {
          id: `bot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: response.reply,
          sender: "bot",
          time: format(new Date(), "hh:mm a"),
        };
        setMessages(prev => [...prev, botReply]);
      }
    } catch (error) {
      console.error("Error sending message to chatbot:", error);
      // Add error message to UI
      const errorMsg = {
        id: `error-${Date.now()}`,
        text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        sender: "bot",
        time: format(new Date(), "hh:mm a"),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setPendingResponses(prev => Math.max(0, prev - 1));
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showError("Permission to access gallery was denied");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });
      if (!result.canceled) {
        uploadAndSendMessage(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    } finally {
      setIsAttachmentModalVisible(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        showError("Permission to access camera was denied");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
      });
      if (!result.canceled) {
        uploadAndSendMessage(result.assets[0]);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
    } finally {
      setIsAttachmentModalVisible(false);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        uploadAndSendMessage(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking document:", error);
    } finally {
      setIsAttachmentModalVisible(false);
    }
  };

  const uploadAndSendMessage = async (file) => {
    setIsUploading(true);
    try {
      const response = await uploadFile(file);
      if (response && response.success && response.data?.fileUrl) {
        // We use handleSendMessage's logic but with the file URL
        const fileUrl = response.data.fileUrl;
        
        // Add user message with file to UI
        const timestamp = format(new Date(), "hh:mm a");
        const newUserMsg = {
          id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: fileUrl,
          sender: "user",
          time: timestamp,
        };
        
        setMessages(prev => [...prev, newUserMsg]);
        setPendingResponses(prev => prev + 1);

        // Send to chatbot API
        const botResponse = await sendChatBotMessage(fileUrl, activeSessionId);
        if (botResponse && botResponse.reply) {
          if (!activeSessionId && botResponse.sessionId) {
            setActiveSessionId(botResponse.sessionId);
            fetchSessions();
          }

          const botReply = {
            id: `bot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: botResponse.reply,
            sender: "bot",
            time: format(new Date(), "hh:mm a"),
          };
          setMessages(prev => [...prev, botReply]);
        }
      } else {
        showError("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showError("Failed to upload file");
    } finally {
      setIsUploading(false);
      setPendingResponses(prev => Math.max(0, prev - 1));
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const isImageUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    return url.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i) || (url.includes('cloudinary.com') && url.includes('/image/upload/'));
  };

  const isFileUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    return url.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/i) || (url.includes('cloudinary.com') && url.includes('/raw/upload/'));
  };

  const handleSessionSelect = async (sessionId) => {
    setIsSessionsVisible(false);
    setIsLoadingHistory(true);
    setActiveSessionId(sessionId);
    
    try {
      const history = await getChatBotSessionDetails(sessionId);
      const mappedHistory = history.map(msg => ({
        id: msg.id,
        text: msg.content,
        sender: msg.role === "user" ? "user" : "bot",
        time: format(parseISO(msg.createdAt), "hh:mm a"),
      }));
      
      if (mappedHistory.length > 0) {
        setMessages(mappedHistory);
      } else {
        setWelcomeMessage();
      }
    } catch (error) {
      console.error("Error fetching session details:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const startNewChat = () => {
    setActiveSessionId(null);
    setWelcomeMessage();
    setIsSessionsVisible(false);
  };

  const renderMessage = (msg) => {
    const isUser = msg.sender === "user";
    return (
      <View
        key={msg.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.botMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userMessageBubble : styles.botMessageBubble,
          ]}
        >
          {isImageUrl(msg.text) ? (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: msg.text }} style={styles.messageImage} resizeMode="cover" />
            </View>
          ) : isFileUrl(msg.text) ? (
            <View style={styles.fileContainer}>
              <Ionicons 
                name="document-text" 
                size={24} 
                color={isUser ? Colors.white : Colors.primary} 
              />
              <Text style={[styles.fileText, isUser ? styles.userMessageText : styles.botMessageText]}>
                Document
              </Text>
            </View>
          ) : (
            <Text
              style={[
                styles.messageText,
                isUser ? styles.userMessageText : styles.botMessageText,
              ]}
            >
              {msg.text}
            </Text>
          )}
          <View
            style={[
              styles.messageTimeContainer,
              isUser
                ? styles.userMessageTimeContainer
                : styles.botMessageTimeContainer,
            ]}
          >
            <Text
              style={[
                styles.messageTime,
                isUser ? styles.userMessageTime : styles.botMessageTime,
              ]}
            >
              {msg.time}
            </Text>
            {isUser && (
              <Ionicons name="checkmark-done" size={12} color={Colors.white} />
            )}
          </View>
        </View>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.chatOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.chatHeader}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.historyButton}
              onPress={() => setIsSessionsVisible(true)}
            >
              <Ionicons name="time-outline" size={24} color="#333" />
            </TouchableOpacity>
            <View style={styles.botLogoContainer}>
              <Image source={Images.appIcon} style={styles.botLogo} />
              <View>
                <Text style={styles.botName}>JigiBot</Text>
                <Text style={styles.botStatus}>Online</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
          >
            <Ionicons name="close" size={20} color="#666666" />
          </TouchableOpacity>
        </View>

        {/* Chat Area */}
        <View style={styles.chatArea}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messagesContent}
          >
            {isLoadingHistory ? (
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
            ) : (
              <>
                {messages.map(renderMessage)}
                {pendingResponses > 0 && (
                  <View style={styles.typingIndicator}>
                    <View style={styles.typingBubble}>
                      <TypingDots />
                    </View>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>

        {/* Input Area */}
        <View style={styles.inputArea}>
          <View style={styles.inputContainer}>
            {/* <TouchableOpacity 
              style={styles.attachButton}
              onPress={() => setIsAttachmentModalVisible(true)}
            >
              <Ionicons name="add-circle" size={28} color="#0098B3" />
            </TouchableOpacity> */}
            <TextInput
              style={styles.messageInput}
              placeholder="Type a message..."
              placeholderTextColor="#999999"
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!message.trim()}
            >
              <Ionicons name="send" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sessions Sidebar/Modal */}
        <Modal
          visible={isSessionsVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsSessionsVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setIsSessionsVisible(false)}
          >
            <View style={styles.sessionsContainer}>
              <View style={styles.sessionsHeader}>
                <Text style={styles.sessionsTitle}>Chat History</Text>
                <TouchableOpacity onPress={() => setIsSessionsVisible(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.newChatButton}
                onPress={startNewChat}
              >
                <Ionicons name="add" size={20} color={Colors.white} />
                <Text style={styles.newChatText}>New Conversation</Text>
              </TouchableOpacity>

              <ScrollView style={styles.sessionsList}>
                {sessions.length === 0 ? (
                  <Text style={styles.emptySessionsText}>No previous conversations</Text>
                ) : (
                  sessions.map((session) => (
                    <TouchableOpacity
                      key={session.sessionId}
                      style={[
                        styles.sessionItem,
                        activeSessionId === session.sessionId && styles.activeSessionItem
                      ]}
                      onPress={() => handleSessionSelect(session.sessionId)}
                    >
                      <View style={styles.sessionIconContainer}>
                        <Ionicons name="chatbubble-outline" size={20} color="#0098B3" />
                      </View>
                      <View>
                        <Text style={styles.sessionDate}>
                          {format(parseISO(session.createdAt), "MMM dd, yyyy")}
                        </Text>
                        <Text style={styles.sessionTime}>
                          {format(parseISO(session.createdAt), "hh:mm a")}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Attachment Selection Modal */}
        <Modal
          visible={isAttachmentModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setIsAttachmentModalVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setIsAttachmentModalVisible(false)}
          >
            <View style={styles.attachmentModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Send Attachment</Text>
                <TouchableOpacity onPress={() => setIsAttachmentModalVisible(false)}>
                  <Ionicons name="close" size={24} color={Colors.black} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.attachmentOptions}>
                <TouchableOpacity style={styles.attachmentOption} onPress={handleTakePhoto}>
                  <View style={[styles.optionIcon, { backgroundColor: '#E3F2FD' }]}>
                    <Ionicons name="camera" size={24} color="#1565C0" />
                  </View>
                  <Text style={styles.optionLabel}>Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.attachmentOption} onPress={handlePickImage}>
                  <View style={[styles.optionIcon, { backgroundColor: '#E8F5E9' }]}>
                    <Ionicons name="image" size={24} color="#2E7D32" />
                  </View>
                  <Text style={styles.optionLabel}>Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.attachmentOption} onPress={handlePickDocument}>
                  <View style={[styles.optionIcon, { backgroundColor: '#FFF3E0' }]}>
                    <Ionicons name="document" size={24} color="#E65100" />
                  </View>
                  <Text style={styles.optionLabel}>Document</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        <LoadingOverlay visible={isUploading} />

        {/* Background Image */}
        <View style={styles.backgroundImageContainer}>
          <Image
            source={Images.bgImg}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  chatOverlay: {
    flex: 1,
    backgroundColor: "#F8FBFB",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F7F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.md,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  botLogoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  botLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Sizes.sm,
    borderWidth: 2,
    borderColor: "#0098B3",
  },
  botName: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#333333",
  },
  botStatus: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#4CAF50",
    marginTop: -4,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: Sizes.lg,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: Sizes.lg,
    paddingBottom: 40,
  },
  messageContainer: {
    marginBottom: Sizes.md,
  },
  userMessageContainer: {
    alignItems: "flex-end",
  },
  botMessageContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: 18,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  userMessageBubble: {
    backgroundColor: "#0098B3",
    borderBottomRightRadius: 4,
  },
  botMessageBubble: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  messageText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    lineHeight: 22,
  },
  userMessageText: {
    color: Colors.white,
  },
  botMessageText: {
    color: "#333333",
  },
  imageWrapper: {
    width: width * 0.65,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 4,
  },
  messageImage: {
    width: '100%',
    height: '100%',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Sizes.sm,
    paddingVertical: Sizes.xs,
  },
  fileText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  messageTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  userMessageTimeContainer: {
    justifyContent: "flex-end",
  },
  botMessageTimeContainer: {
    justifyContent: "flex-start",
  },
  messageTime: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",
  },
  userMessageTime: {
    color: "rgba(255, 255, 255, 0.8)",
    marginRight: 4,
  },
  botMessageTime: {
    color: "#999999",
  },
  typingIndicator: {
    alignItems: "flex-start",
    marginTop: 4,
  },
  typingBubble: {
    backgroundColor: Colors.white,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.md,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    minWidth: 60,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0098B3",
    marginHorizontal: 3,
  },
  inputArea: {
    backgroundColor: Colors.white,
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7F8",
    borderRadius: 28,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.xs,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  attachButton: {
    marginRight: Sizes.xs,
    padding: 4,
  },
  messageInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#333333",
    maxHeight: 120,
    paddingVertical: Sizes.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0098B3",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: Sizes.sm,
  },
  sendButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  backgroundImageContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
    zIndex: -1,
    opacity: 0.05,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    paddingVertical: Sizes.lg,
  },
  messageSkeleton: {
    marginVertical: Sizes.sm,
  },
  skeletonUserMessage: {
    alignItems: "flex-end",
  },
  skeletonDoctorMessage: {
    alignItems: "flex-start",
  },
  skeletonBubble: {
    width: "70%",
    height: 60,
    borderRadius: 18,
    backgroundColor: "#E0E0E0",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  attachmentModalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Sizes.lg,
    paddingBottom: Sizes.xl * 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Sizes.xl,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.black,
  },
  attachmentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  attachmentOption: {
    alignItems: 'center',
    gap: Sizes.xs,
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: Colors.textPrimary,
  },
  sessionsContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Sizes.lg,
    height: height * 0.7,
  },
  sessionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.lg,
  },
  sessionsTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#333",
  },
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0098B3",
    paddingVertical: Sizes.md,
    borderRadius: 12,
    marginBottom: Sizes.lg,
  },
  newChatText: {
    color: Colors.white,
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    marginLeft: 8,
  },
  sessionsList: {
    flex: 1,
  },
  sessionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Sizes.md,
    borderRadius: 12,
    backgroundColor: "#F5F7F8",
    marginBottom: Sizes.sm,
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeSessionItem: {
    backgroundColor: "#E0F2F7",
    borderColor: "#0098B3",
  },
  sessionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.md,
  },
  sessionDate: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
  },
  sessionTime: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#666",
  },
  emptySessionsText: {
    textAlign: "center",
    color: "#999",
    marginTop: 40,
    fontFamily: "Poppins-Regular",
  },
});
