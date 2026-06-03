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
  Animated,
  Modal,
  Dimensions,
  Linking,
  BackHandler,
} from "react-native";
const { width, height } = Dimensions.get("window");
import { Video, ResizeMode } from "expo-av";
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
  initiateCall,
  acceptCall,
  rejectCall,
} from "../services/chatService";
import {
  markBookingCompleted,
  markBookingNoShow,
  getBookingById,
} from "../services/bookingService";
import { startRingtone, stopRingtone, getRingtoneURI } from "../utils/ringtone";
import { startInCall, setAudioRoute, getInitialAudioRoute } from "../services/webrtcService";
import { format, parseISO } from "date-fns";
import { showError, showSuccess } from "../../../shared/utils/toast";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { uploadFile } from "../../../shared/services/uploadService";
import LoadingOverlay from "../../../shared/components/LoadingOverlay";

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
  const isNearBottomRef = useRef(true);
  const shouldAutoScrollRef = useRef(true);

  const patientId = user?.id;
  const bookingId = doctor?.bookingId || route.params?.bookingId;
  const appointmentData = route.params?.appointmentData || localDoctor || {};
  const bookingStatus = appointmentData?.status || route.params?.bookingStatus || "";
  const consultantConfirmed = appointmentData?.consultantConfirmed === true;
  const [actionLoading, setActionLoading] = useState({
    complete: false,
    noShow: false,
  });
  const [incomingCall, setIncomingCall] = useState(null);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [completeReason, setCompleteReason] = useState("");
  const [localDoctor, setLocalDoctor] = useState(doctor || null);
  const [isFetchingDoctor, setIsFetchingDoctor] = useState(false);
  const [isAttachmentModalVisible, setIsAttachmentModalVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isMediaLoading, setIsMediaLoading] = useState(false);

  // Handle hardware back press when media viewer is open
  useEffect(() => {
    const backAction = () => {
      if (selectedImage || selectedVideo) {
        setSelectedImage(null);
        setSelectedVideo(null);
        setIsMediaLoading(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [selectedImage, selectedVideo]);

  // Effect to fetch doctor details if missing (e.g. from notification)
  useEffect(() => {
    const fetchDoctorDetails = async () => {
      // If we don't have doctor info but we have a bookingId and patientId
      if (!localDoctor && bookingId && patientId) {
        console.log("🔍 [CHAT PAGE] Fetching missing doctor details for booking:", bookingId);
        setIsFetchingDoctor(true);
        try {
          const booking = await getBookingById(patientId, bookingId);
          if (booking) {
            console.log("✅ [CHAT PAGE] Doctor details fetched:", booking.consultantName);
            setLocalDoctor({
              name: booking.fullName || booking.consultantName || "Consultant",
              consultantId: booking.consultantId,
              bookingId: booking.bookingId || booking.id,
              ...booking,
            });
          } else {
            console.warn("⚠️ [CHAT PAGE] Booking not found for ID:", bookingId);
          }
        } catch (error) {
          console.error("❌ [CHAT PAGE] Error fetching doctor details:", error);
        } finally {
          setIsFetchingDoctor(false);
        }
      }
    };

    fetchDoctorDetails();
  }, [bookingId, patientId, localDoctor]);

  // Handle incoming call parameter from notification or CallKeep answer event
  useEffect(() => {
    if (route.params?.isIncoming && localDoctor && !incomingCall) {
      console.log("📞 [CHAT PAGE] Handling incoming call from notification params");
      
      const timestamp = route.params?.timestamp;
      const now = Date.now();
      
      // If notification is older than 60 seconds, it's likely expired
      if (timestamp && now - timestamp > 60000) {
        console.log("⚠️ [CHAT PAGE] Call notification is too old. Ignoring.");
        showError("Call has already ended");
        navigation.setParams({ isIncoming: false });
        return;
      }

      // Determine the caller's ID - prefer the one from notification params
      const fromUserId = route.params.fromUserId || localDoctor?.consultantId;
      
      if (!fromUserId) {
        console.log("⚠️ [CHAT PAGE] Could not determine fromUserId for incoming call. Waiting...");
        return;
      }

      const callData = {
        fromUserId: fromUserId,
        conversationId: route.params.conversationId || conversationId,
        callType: route.params.callType || "video",
      };

      if (route.params?.autoAccept) {
        console.log("📞 [CHAT PAGE] Auto-accept parameter is true. Accepting call immediately...");
        
        // Setup incoming call state so handlers can clean up and read it
        setIncomingCall(callData);
        
        // Clear the parameters immediately to prevent double execution on focus change
        navigation.setParams({ isIncoming: false, fromUserId: undefined, autoAccept: false });
        
        // Eagerly execute acceptance sequence
        setTimeout(async () => {
          try {
            // Eagerly start audio/video mode before navigating
            console.log("🔊 [CHAT PAGE] Starting eager audio mode for auto-accepted:", callData.callType);
            const initialRoute = await getInitialAudioRoute(callData.callType === "video");
            await startInCall(callData.callType);
            await setAudioRoute(initialRoute);

            stopRingtone();
            console.log("📞 [CHAT PAGE] Auto-answering call – fromUserId (caller):", callData.fromUserId, "conversationId:", callData.conversationId);
            
            acceptCall(callData.fromUserId);
            const minimalDoctor = { name: "Consultant", consultantId: callData.fromUserId, ...localDoctor };
            setIncomingCall(null);
            
            if (callData.callType === "video") {
              navigation.navigate("VideoCall", {
                doctor: minimalDoctor,
                conversationId: callData.conversationId,
                callType: callData.callType,
                otherUserId: callData.fromUserId,
                isInitiator: false,
              });
            } else {
              navigation.navigate("VoiceCall", {
                doctor: minimalDoctor,
                conversationId: callData.conversationId,
                callType: callData.callType,
                otherUserId: callData.fromUserId,
                isInitiator: false,
              });
            }
          } catch (error) {
            console.error("❌ [CHAT PAGE] Error during auto-accepting call:", error);
            setIncomingCall(null);
          }
        }, 100);
      } else {
        setIncomingCall(callData);
        startRingtone(getRingtoneURI("incoming"));

        // Clear the parameter immediately
        navigation.setParams({ isIncoming: false, fromUserId: undefined });
      }
    }
  }, [route.params?.isIncoming, route.params?.fromUserId, route.params?.autoAccept, localDoctor, incomingCall, conversationId, navigation]);

  // Get consultantId, patientId, bookingId, and appointment status
  const consultantId = localDoctor?.consultantId || localDoctor?.consultantData?.userId;

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

    const userRole = user?.role || "patient";
    const socket = connectSocket(patientId, userRole, {
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
      onWebRTCOffer: (data) => {
        console.log("📥 [CHAT PAGE] Socket WebRTC offer received:", data.fromUserId);
      },
      onMessagesRead: (data) => {
        console.log("✅ [CHAT PAGE] Messages read:", data);
        handleMessagesRead(data);
      },
      onCallIncoming: (data) => {
        console.log("📥 [CHAT PAGE] Socket confirmed incoming call:", data);
        
        setIncomingCall({
          fromUserId: data.fromUserId,
          conversationId: data.conversationId,
          callType: data.callType,
        });
        startRingtone(getRingtoneURI("incoming"));
      },
      onCallRinging: () => {},
      onCallAccepted: () => {
        // Clear incoming call state when call is accepted
        setIncomingCall(null);
      },
      onCallRejected: (data) => {
        stopRingtone();
        setIncomingCall(null);
        showError(data?.reason || "Call declined", "Call declined");
      },
      onCallNoAnswer: () => {
        stopRingtone();
        setIncomingCall(null);
        showError("No answer", "Call ended");
      },
      onCallMissed: () => {
        stopRingtone();
        setIncomingCall(null);
      },
      onCallStopRinging: () => {},
      onCallConnected: () => {},
      onCallEnded: () => {
        stopRingtone();
        setIncomingCall(null);
      },
    });

    return () => {
      console.log("🔌 [CHAT PAGE] Unmounting ChatPage socket effect (preserving connection for calls)");
      // We don't disconnect or leave here because we might be navigating to a Call screen
      // disconnectSocket();
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

  // Scroll to bottom when messages change (only if user is near bottom)
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0 && shouldAutoScrollRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Handle scroll events to track if user is near bottom
  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const paddingToBottom = 100; // Threshold for "near bottom"
    const isNearBottom = 
      contentOffset.y + layoutMeasurement.height >= contentSize.height - paddingToBottom;
    
    isNearBottomRef.current = isNearBottom;
    shouldAutoScrollRef.current = isNearBottom;
  };

  // Mark messages as read when screen comes into focus
  /**
   * Silently refresh messages (no loading shimmer)
   */
  const refreshMessagesSilently = async () => {
    if (!conversationId) return;
    try {
      const messagesResponse = await getMessages(conversationId, 50, 0);
      const conversationMessages = messagesResponse.messages || [];

      const mappedMessages = conversationMessages.map((msg) => {
        const messageDate = parseISO(msg.createdAt);
        const isUserMessage = msg.senderType === "patient";

        return {
          id: msg.id,
          text: msg.content || msg.fileUrl || "",
          fileType: msg.fileType || null,
          sender: isUserMessage ? "user" : "doctor",
          time: format(messageDate, "h:mm a").toLowerCase(),
          status: msg.isRead ? "read" : "sent",
          createdAt: msg.createdAt,
        };
      });

      mappedMessages.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateA - dateB;
      });

      setMessages(mappedMessages);

      // Mark new unread messages as read
      const unreadMessageIds = mappedMessages
        .filter((msg) => msg.sender === "doctor" && msg.status !== "read")
        .map((msg) => msg.id);

      if (unreadMessageIds.length > 0) {
        markMessagesAsReadViaSocket(conversationId, unreadMessageIds);
        setMessages((prev) =>
          prev.map((msg) =>
            unreadMessageIds.includes(msg.id) ? { ...msg, status: "read" } : msg
          )
        );
      }
    } catch (error) {
      console.error("❌ [CHAT PAGE] Error silently refreshing messages:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      // Silently refresh messages when returning to chat (e.g., from call)
      if (conversationId) {
        refreshMessagesSilently();
      }

      if (conversationId && messages.length > 0) {
        // Get all unread doctor messages
        const unreadMessageIds = messages
          .filter((msg) => msg.sender === "doctor" && msg.status !== "read")
          .map((msg) => msg.id);

        if (unreadMessageIds.length > 0) {
          console.log("📖 [CHAT PAGE] Marking messages as read on focus");
          markMessagesAsReadViaSocket(conversationId, unreadMessageIds);
          
          // Update local state
          setMessages((prev) =>
            prev.map((msg) =>
              unreadMessageIds.includes(msg.id) ? { ...msg, status: "read" } : msg
            )
          );
        }
      }
    }, [conversationId])
  );

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
            text: msg.content || msg.fileUrl || "",
            fileType: msg.fileType || (isVideoUrl(msg.content || msg.fileUrl) ? "video" : (isImageUrl(msg.content || msg.fileUrl) ? "image" : (isFileUrl(msg.content || msg.fileUrl) ? "file" : "text"))),
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
      const message = error?.message || "";
      const isTooEarly =
        message.includes("Conversation can only be started 30 minutes") ||
        message.includes("Please wait");
      const isExpired =
        message.includes("conversation window has expired") ||
        message.includes("appointment timeframe");
      if (isTooEarly) {
        showError(message, "Chat not available");
        setConversationId(null);
        setMessages([]);
        setIsLoading(false);
        navigation.goBack();
        return;
      }
      if (isExpired) {
        showError(message, "Chat not available");
        setConversationId(null);
        setMessages([]);
        setIsLoading(false);
        navigation.goBack();
        return;
      }
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
      text: msg.content || msg.fileUrl || "",
      fileType: msg.fileType || (isVideoUrl(msg.content || msg.fileUrl) ? "video" : (isImageUrl(msg.content || msg.fileUrl) ? "image" : (isFileUrl(msg.content || msg.fileUrl) ? "file" : "text"))),
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
      // If it's a doctor message and user is near bottom, auto-scroll
      if (!isUserMessage && isNearBottomRef.current) {
        shouldAutoScrollRef.current = true;
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
      text: msg.content || msg.fileUrl || "",
      fileType: msg.fileType || null,
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

      // If user is near bottom, auto-scroll for own messages
      if (isNearBottomRef.current) {
        shouldAutoScrollRef.current = true;
      }

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
  const handleSendMessage = async (contentOverride = null) => {
    // If called from onPress, contentOverride might be an event object
    const actualContent = (typeof contentOverride === 'string' && contentOverride) || (contentOverride === null && message) || null;
    
    if (!actualContent || !actualContent.trim() || isSending) {
      return;
    }

    if (!consultantId || !patientId) {
      showError("Unable to send message. Please try again later.");
      return;
    }

    const messageContent = actualContent.trim();
    if (!contentOverride) setMessage(""); // Clear input immediately for better UX
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
    shouldAutoScrollRef.current = true;

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
          const msg = response.message;
          const realMessage = {
            id: msg.id,
            text: msg.content || msg.fileUrl || "",
            fileType: msg.fileType || null,
            sender: "user",
            time: format(
              parseISO(msg.createdAt),
              "h:mm a"
            ).toLowerCase(),
            status: msg.isRead ? "read" : "sent",
            createdAt: msg.createdAt,
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
        handleSendMessage(response.data.fileUrl);
      } else {
        showError("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showError("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const isImageUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const lowerUrl = url.toLowerCase();
    return (
      lowerUrl.match(/\.(jpeg|jpg|gif|png|webp|bmp)(\?|$)/i) || 
      (lowerUrl.includes('cloudinary.com') && lowerUrl.includes('/image/upload/')) ||
      lowerUrl.includes('firebasestorage.googleapis.com') ||
      lowerUrl.includes('googleusercontent.com') ||
      lowerUrl.startsWith('data:image/')
    );
  };

  const isVideoUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const lowerUrl = url.toLowerCase();
    return (
      lowerUrl.match(/\.(mp4|mov|avi|wmv|flv|mkv|webm)(\?|$)/i) || 
      (lowerUrl.includes('cloudinary.com') && lowerUrl.includes('/video/upload/'))
    );
  };

  const isFileUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const lowerUrl = url.toLowerCase();
    return (
      lowerUrl.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)/i) || 
      (lowerUrl.includes('cloudinary.com') && lowerUrl.includes('/raw/upload/')) ||
      lowerUrl.includes('drive.google.com') ||
      lowerUrl.includes('s3.amazonaws.com')
    );
  };

  const handleVoiceCall = async () => {
    if (!conversationId || !consultantId) {
      showError("Conversation not ready. Please wait.", "Cannot call");
      return;
    }
    
    try {
      // Eagerly start audio mode
      const initialRoute = await getInitialAudioRoute(false);
      await startInCall("audio");
      await setAudioRoute(initialRoute);
      
      initiateCall(consultantId, conversationId, "audio");
      navigation.navigate("VoiceCall", {
        doctor: localDoctor,
        conversationId,
        callType: "audio",
        otherUserId: consultantId,
        isInitiator: true,
      });
    } catch (error) {
      console.error("❌ [CHAT PAGE] Error starting voice call:", error);
    }
  };

  const handleVideoCall = async () => {
    if (!conversationId || !consultantId) {
      showError("Conversation not ready. Please wait.", "Cannot call");
      return;
    }
    
    try {
      // Eagerly start video mode
      const initialRoute = await getInitialAudioRoute(true);
      await startInCall("video");
      await setAudioRoute(initialRoute);

      initiateCall(consultantId, conversationId, "video");
      navigation.navigate("VideoCall", {
        doctor: localDoctor,
        conversationId,
        callType: "video",
        otherUserId: consultantId,
        isInitiator: true,
      });
    } catch (error) {
      console.error("❌ [CHAT PAGE] Error starting video call:", error);
    }
  };

  const handleAcceptIncomingCall = async () => {
    if (!incomingCall) return;
    
    try {
      const { fromUserId, conversationId: convId, callType } = incomingCall;
      
      // Eagerly start audio/video mode before navigating
      // This ensures the hardware is ready before the connection is established
      console.log("🔊 [CHAT PAGE] Starting eager audio mode for:", callType);
      const initialRoute = await getInitialAudioRoute(callType === "video");
      await startInCall(callType);
      await setAudioRoute(initialRoute);

      stopRingtone();
      console.log("📞 [CHAT PAGE] Answering call – fromUserId (caller):", fromUserId, "conversationId:", convId, "callType:", callType);
      acceptCall(fromUserId);
      const minimalDoctor = { name: "Consultant", consultantId: fromUserId, ...localDoctor };
      setIncomingCall(null);
      if (callType === "video") {
        navigation.navigate("VideoCall", {
          doctor: minimalDoctor,
          conversationId: convId,
          callType,
          otherUserId: fromUserId,
          isInitiator: false,
        });
      } else {
        navigation.navigate("VoiceCall", {
          doctor: minimalDoctor,
          conversationId: convId,
          callType,
          otherUserId: fromUserId,
          isInitiator: false,
        });
      }
    } catch (error) {
      console.error("❌ [CHAT PAGE] Error accepting incoming call:", error);
    }
  };

  const handleRejectIncomingCall = () => {
    if (incomingCall) {
      stopRingtone();
      rejectCall(incomingCall.fromUserId, "Declined");
      setIncomingCall(null);
    }
  };

  const openCompleteModal = () => {
    setCompleteReason("");
    setCompleteModalVisible(true);
  };

  const closeCompleteModal = () => {
    setCompleteModalVisible(false);
    setCompleteReason("");
  };

  const handleSubmitMarkComplete = async () => {
    if (!bookingId || actionLoading.complete) return;
    const reason = (completeReason || "").trim() || "Appointment completed by patient";
    closeCompleteModal();
    setActionLoading((prev) => ({ ...prev, complete: true }));
    try {
      await markBookingCompleted(bookingId, { confirmed: true, reason });
      showSuccess("Appointment marked as completed.");
      navigation.goBack();
    } catch (err) {
      const msg =
        err?.data?.message || err?.message || "Could not mark as completed.";
      showError(msg, "Error");
    } finally {
      setActionLoading((prev) => ({ ...prev, complete: false }));
    }
  };

  const handleMarkNoShow = async () => {
    if (!bookingId || actionLoading.noShow) return;
    setActionLoading((prev) => ({ ...prev, noShow: true }));
    try {
      await markBookingNoShow(bookingId);
      showSuccess("Appointment marked as no-show.");
      navigation.goBack();
    } catch (err) {
      const msg =
        err?.data?.message || err?.message || "Could not mark as no-show.";
      showError(msg, "Error");
    } finally {
      setActionLoading((prev) => ({ ...prev, noShow: false }));
    }
  };

  // Typing Indicator Component with Animated Dots
  const TypingIndicator = () => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const animateDot = (dot, delay) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        );
      };

      const animations = [
        animateDot(dot1, 0),
        animateDot(dot2, 200),
        animateDot(dot3, 400),
      ];

      animations.forEach((anim) => anim.start());

      return () => {
        animations.forEach((anim) => anim.stop());
      };
    }, []);

    const dot1Opacity = dot1.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    });

    const dot2Opacity = dot2.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    });

    const dot3Opacity = dot3.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    });

    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <Animated.View
            style={[styles.typingDot, { opacity: dot1Opacity }]}
          />
          <Animated.View
            style={[styles.typingDot, { opacity: dot2Opacity }]}
          />
          <Animated.View
            style={[styles.typingDot, { opacity: dot3Opacity }]}
          />
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <Modal
        visible={!!incomingCall}
        transparent
        animationType="fade"
        onRequestClose={handleRejectIncomingCall}
      >
        <View style={styles.incomingCallOverlay}>
          <View style={styles.incomingCallCard}>
            <Text style={styles.incomingCallTitle}>
              Incoming {incomingCall?.callType === "video" ? "video" : "audio"} call
            </Text>
            <Text style={styles.incomingCallSubtitle}>
              {localDoctor?.name || "Consultant"}
            </Text>
            <View style={styles.incomingCallActions}>
              <TouchableOpacity
                style={[styles.incomingCallBtn, styles.declineBtn]}
                onPress={handleRejectIncomingCall}
              >
                <Ionicons name="call" size={28} color={Colors.white} />
                <Text style={styles.declineBtnText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.incomingCallBtn, styles.acceptBtn]}
                onPress={handleAcceptIncomingCall}
              >
                <Ionicons name="call" size={28} color={Colors.white} />
                <Text style={styles.acceptBtnText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={completeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeCompleteModal}
      >
        <View style={styles.completeModalOverlay}>
          <View style={styles.completeModalContent}>
            <Text style={styles.completeModalTitle}>Mark appointment complete</Text>
            <Text style={styles.completeModalSubtitle}>
              Add a reason for confirming (optional)
            </Text>
            <TextInput
              style={styles.completeModalInput}
              placeholder="e.g. Session completed successfully"
              placeholderTextColor={Colors.textSecondary}
              value={completeReason}
              onChangeText={setCompleteReason}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <View style={styles.completeModalActions}>
              <TouchableOpacity
                style={[styles.completeModalBtn, styles.completeModalBtnCancel]}
                onPress={closeCompleteModal}
              >
                <Text style={styles.completeModalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.completeModalBtn, styles.completeModalBtnSubmit]}
                onPress={handleSubmitMarkComplete}
              >
                <Text style={styles.completeModalBtnSubmitText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.grey} />
        </TouchableOpacity>

        <View style={styles.doctorInfo}>
          <View style={styles.doctorAvatar}>
            {!localDoctor || isFetchingDoctor ? (
              <ShimmerLoader>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.lightGray }} />
              </ShimmerLoader>
            ) : (
              <Ionicons name="person" size={20} color={Colors.primary} />
            )}
          </View>
          <View style={styles.doctorDetails}>
            {!localDoctor || isFetchingDoctor ? (
              <ShimmerLoader>
                <View style={{ width: 120, height: 16, borderRadius: 4, backgroundColor: Colors.lightGray }} />
              </ShimmerLoader>
            ) : (
              <Text style={styles.doctorName}>
                {localDoctor.name}
              </Text>
            )}
            {/* Online status - commented out */}
            {/* <Text style={styles.doctorStatus}>Online</Text> */}
          </View>
        </View>

        {!(isLoading || isFetchingDoctor || !localDoctor) && (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleVoiceCall}
            >
              <Ionicons name="call" size={24} color={Colors.black} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleVideoCall}
            >
              <Ionicons name="videocam" size={24} color={Colors.black} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {!isLoading && bookingStatus === "pending_confirmation" && (
        <View style={styles.pendingBanner}>
          <Ionicons name="information-circle" size={20} color={Colors.white} />
          <Text style={styles.pendingBannerText}>
            Please confirm your appointment with the consultant when the session is done.
          </Text>
          <TouchableOpacity
            style={[styles.pendingBannerBtn, styles.appointmentActionBtn]}
            onPress={openCompleteModal}
            disabled={actionLoading.complete}
          >
            {actionLoading.complete ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={18} color={Colors.white} />
                <Text style={[styles.appointmentActionText, styles.completeText]}>
                  Confirm
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && bookingId && bookingStatus === "upcoming" && (
        <View style={styles.appointmentActions}>
          <TouchableOpacity
            style={[styles.appointmentActionBtn, styles.noShowBtn]}
            onPress={handleMarkNoShow}
            disabled={actionLoading.noShow}
          >
            {actionLoading.noShow ? (
              <ActivityIndicator size="small" color={Colors.error} />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={18} color={Colors.error} />
                <Text style={[styles.appointmentActionText, styles.noShowText]}>
                  No show
                </Text>
              </>
            )}
          </TouchableOpacity>
          {consultantConfirmed && (
            <TouchableOpacity
              style={[styles.appointmentActionBtn, styles.completeBtn]}
              onPress={openCompleteModal}
              disabled={actionLoading.complete}
            >
              {actionLoading.complete ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={18} color={Colors.white} />
                  <Text style={[styles.appointmentActionText, styles.completeText]}>
                    Mark complete
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Sizes.lg }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
        {isLoading || isFetchingDoctor || !localDoctor ? (
          <View style={{ paddingHorizontal: Sizes.md, paddingTop: Sizes.md }}>
            {[1, 2, 3, 4, 5, 6].map((i) => {
              const isUser = i % 2 === 0;
              return (
                <View 
                  key={i} 
                  style={[
                    styles.messageContainer, 
                    isUser ? styles.userMessage : styles.doctorMessage,
                    { marginBottom: Sizes.xl }
                  ]}
                >
                  <View style={{ 
                    flexDirection: isUser ? 'row-reverse' : 'row', 
                    alignItems: 'flex-end',
                    gap: Sizes.sm
                  }}>
                    {/* Avatar Shimmer */}
                    <ShimmerLoader>
                      <View style={{ 
                        width: 36, 
                        height: 36, 
                        borderRadius: 18, 
                        backgroundColor: Colors.lightGray 
                      }} />
                    </ShimmerLoader>
                    
                    <View style={{ alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                      {/* Bubble Shimmer */}
                      <ShimmerLoader>
                        <View style={[
                          styles.messageBubble, 
                          isUser ? styles.userBubble : styles.doctorBubble,
                          { 
                            width: i % 3 === 0 ? 240 : i % 2 === 0 ? 160 : 200, 
                            height: i % 5 === 0 ? 90 : 50, 
                            backgroundColor: isUser ? 'rgba(0, 152, 179, 0.15)' : Colors.white,
                            borderWidth: isUser ? 0 : 1,
                            borderColor: '#EEEEEE'
                          }
                        ]} />
                      </ShimmerLoader>
                      
                      {/* Time Shimmer */}
                      <ShimmerLoader>
                        <View style={{ 
                          width: 45, 
                          height: 10, 
                          borderRadius: 5, 
                          backgroundColor: Colors.lightGray, 
                          marginTop: 8,
                          opacity: 0.4
                        }} />
                      </ShimmerLoader>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={64}
              color={Colors.lightGray}
            />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubText}>
              Start a conversation with {localDoctor?.name || "the consultant"}.
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
                  (msg.fileType === 'image' || isImageUrl(msg.text) || msg.fileType === 'video' || isVideoUrl(msg.text)) && { padding: 0, overflow: 'hidden' }
                ]}
              >
                {msg.fileType === 'image' || isImageUrl(msg.text) ? (
                  <TouchableOpacity 
                    style={styles.imageWrapper}
                    onPress={() => setSelectedImage(msg.text)}
                  >
                    <Image 
                      source={{ uri: msg.text?.trim() }} 
                      style={styles.messageImage} 
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ) : msg.fileType === 'video' || isVideoUrl(msg.text) ? (
                  <TouchableOpacity 
                    style={styles.imageWrapper}
                    onPress={() => setSelectedVideo(msg.text)}
                  >
                    <View style={styles.videoPlaceholder}>
                      <Video
                        source={{ uri: msg.text?.trim() }}
                        style={styles.messageImage}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay={false}
                        isMuted={true}
                      />
                      <View style={styles.playButtonOverlay}>
                        <Ionicons name="play" size={40} color={Colors.white} />
                      </View>
                    </View>
                  </TouchableOpacity>
                ) : msg.fileType === 'file' || isFileUrl(msg.text) ? (
                  <TouchableOpacity 
                    style={styles.fileContainer}
                    onPress={() => Linking.openURL(msg.text)}
                  >
                    <Ionicons 
                      name="document-text" 
                      size={32} 
                      color={msg.sender === "user" ? Colors.white : Colors.primary} 
                    />
                    <View>
                      <Text style={[styles.fileText, msg.sender === "user" ? styles.userText : styles.doctorText]}>
                        Document Attachment
                      </Text>
                      <Text style={{ fontSize: 11, color: msg.sender === "user" ? 'rgba(255,255,255,0.7)' : Colors.grey }}>
                        Tap to open
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <Text
                    style={[
                      styles.messageText,
                      msg.sender === "user" ? styles.userText : styles.doctorText,
                    ]}
                  >
                    {msg.text}
                  </Text>
                )}
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
        {isTyping && <TypingIndicator />}
      </ScrollView>

      {isLoading || isFetchingDoctor || !localDoctor ? null : (
        <View
          style={[
            styles.inputContainer,
            { paddingBottom: isKeyboardVisible ? 0 : insets.bottom },
          ]}
        >
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={() => setIsAttachmentModalVisible(true)}
          >
            <Ionicons name="add-circle" size={28} color="#0098B3" />
          </TouchableOpacity>

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
            onPress={() => handleSendMessage()}
            disabled={isSending || !message.trim()}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Ionicons name="send" size={20} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>
      )}

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

      {/* Image Viewer Modal */}
      <Modal
        visible={!!selectedImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setSelectedImage(null);
          setIsMediaLoading(false);
        }}
      >
        <View style={styles.mediaViewerContainer}>
          <TouchableOpacity 
            style={styles.mediaViewerClose}
            onPress={() => {
              setSelectedImage(null);
              setIsMediaLoading(false);
            }}
          >
            <Ionicons name="close" size={30} color={Colors.white} />
          </TouchableOpacity>
          
          {isMediaLoading && (
            <View style={styles.mediaLoaderContainer}>
              <ActivityIndicator size="large" color={Colors.white} />
            </View>
          )}

          <Image 
            source={{ uri: selectedImage }} 
            style={styles.fullMedia} 
            resizeMode="contain" 
            onLoadStart={() => setIsMediaLoading(true)}
            onLoadEnd={() => setIsMediaLoading(false)}
          />
        </View>
      </Modal>

      {/* Video Viewer Modal */}
      <Modal
        visible={!!selectedVideo}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setSelectedVideo(null);
          setIsMediaLoading(false);
        }}
      >
        <View style={styles.mediaViewerContainer}>
          <TouchableOpacity 
            style={styles.mediaViewerClose}
            onPress={() => {
              setSelectedVideo(null);
              setIsMediaLoading(false);
            }}
          >
            <Ionicons name="close" size={30} color={Colors.white} />
          </TouchableOpacity>

          {isMediaLoading && (
            <View style={styles.mediaLoaderContainer}>
              <ActivityIndicator size="large" color={Colors.white} />
            </View>
          )}

          <Video
            source={{ uri: selectedVideo }}
            style={styles.fullMedia}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            onLoadStart={() => setIsMediaLoading(true)}
            onLoad={() => setIsMediaLoading(false)}
            onError={() => setIsMediaLoading(false)}
          />
        </View>
      </Modal>

      {/* Uploading Loader */}
      <LoadingOverlay visible={isUploading} />
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
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonOverlay: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaViewerClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullMedia: {
    width: width,
    height: height,
  },
  mediaLoaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  typingContainer: {
    marginVertical: Sizes.xs,
    alignItems: "flex-start",
  },
  typingBubble: {
    backgroundColor: "#E0F2F7",
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
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
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  uploadingBox: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: Sizes.xl,
    borderRadius: 16,
    alignItems: 'center',
    gap: Sizes.md,
  },
  uploadingText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  imageWrapper: {
    width: width * 0.65,
    height: 200,
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
  typingDots: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderBottomLeftRadius: 5,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.grey,
    marginHorizontal: 2,
  },
  pendingBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.warning,
    paddingVertical: Sizes.sm,
    paddingHorizontal: Sizes.md,
    gap: Sizes.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
    minHeight: 48,
  },
  pendingBannerText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
  },
  pendingBannerBtn: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  appointmentActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: Sizes.sm,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    backgroundColor: "#F5F5F5",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    minHeight: 48,
  },
  appointmentActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Sizes.sm,
    paddingHorizontal: Sizes.md,
    borderRadius: 20,
    gap: Sizes.xs,
  },
  noShowBtn: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  completeBtn: {
    backgroundColor: Colors.primary,
  },
  appointmentActionText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
  },
  noShowText: {
    color: Colors.error,
  },
  completeText: {
    color: Colors.white,
  },
  incomingCallOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: Sizes.lg,
  },
  incomingCallCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Sizes.xl,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
  },
  incomingCallTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
    marginBottom: Sizes.xs,
  },
  incomingCallSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
    marginBottom: Sizes.xl,
  },
  incomingCallActions: {
    flexDirection: "row",
    gap: Sizes.md,
  },
  incomingCallBtn: {
    flex: 1,
    paddingVertical: Sizes.md,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: Sizes.xs,
  },
  declineBtn: {
    backgroundColor: Colors.error,
  },
  acceptBtn: {
    backgroundColor: "#4CAF50",
  },
  declineBtnText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: Colors.white,
  },
  acceptBtnText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: Colors.white,
  },
  completeModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Sizes.lg,
  },
  completeModalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Sizes.xl,
    width: "100%",
    maxWidth: 400,
  },
  completeModalTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  completeModalSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    marginBottom: Sizes.md,
  },
  completeModalInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textPrimary,
    minHeight: 80,
    marginBottom: Sizes.lg,
  },
  completeModalActions: {
    flexDirection: "row",
    gap: Sizes.md,
    justifyContent: "flex-end",
  },
  completeModalBtn: {
    paddingVertical: Sizes.sm,
    paddingHorizontal: Sizes.lg,
    borderRadius: 12,
  },
  completeModalBtnCancel: {
    backgroundColor: "#F5F5F5",
  },
  completeModalBtnCancelText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
  },
  completeModalBtnSubmit: {
    backgroundColor: Colors.primary,
  },
  completeModalBtnSubmitText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
  },
});
