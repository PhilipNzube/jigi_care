import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";

const { width, height } = Dimensions.get("window");

export default function ChatBotInterface({ visible, onClose }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi Tim 👋 I'm JigiBot, your virtual health assistant. How can I help you today?",
      sender: "bot",
      time: "9:48am",
    },
    {
      id: 2,
      text: "Can I take paracetamol with ibuprofen?",
      sender: "user",
      time: "9:51am",
    },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: message.trim(),
        sender: "user",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([...messages, newMessage]);
      setMessage("");
    }
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
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userMessageText : styles.botMessageText,
            ]}
          >
            {msg.text}
          </Text>
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
              <Ionicons name="checkmark" size={12} color={Colors.white} />
            )}
          </View>
        </View>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <KeyboardAvoidingView
      style={styles.chatOverlay}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {/* Header */}
      <View style={styles.chatHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.botLogoContainer}>
            <Image source={Images.appIcon} style={styles.botLogo} />
            <Text style={styles.botName}>JigiBot</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => {
            onClose();
          }}
        >
          <Ionicons name="close" size={20} color="#666666" />
        </TouchableOpacity>
      </View>

      {/* Chat Area */}
      <View style={styles.chatArea}>
        <ScrollView
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map(renderMessage)}
          {/* Typing Indicator */}
          <View style={styles.typingIndicator}>
            <View style={styles.typingBubble}>
              <View style={styles.typingDots}>
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Input Area */}
      <View style={styles.inputArea}>
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.cameraButton}>
            <Ionicons name="camera-outline" size={20} color="#666666" />
          </TouchableOpacity>
          <TextInput
            style={styles.messageInput}
            placeholder="Type a message..."
            placeholderTextColor="#999999"
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
          >
            <Ionicons name="send" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Background Image */}
      <View style={styles.backgroundImageContainer}>
        <Image
          source={Images.bgImg}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  chatOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#0098B3",
    zIndex: 1000,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    paddingTop: 50, // Account for status bar
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
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
  },
  messagesContent: {
    paddingBottom: Sizes.lg,
  },
  botName: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#333333",
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
    paddingTop: Sizes.md,
  },
  messagesContainer: {
    flex: 1,
  },
  messageContainer: {
    marginBottom: Sizes.sm,
  },
  userMessageContainer: {
    alignItems: "flex-end",
  },
  botMessageContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: width * 0.7,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: 16,
  },
  userMessageBubble: {
    backgroundColor: "#006666",
    borderBottomRightRadius: 4,
  },
  botMessageBubble: {
    backgroundColor: "#E0F2F7",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    lineHeight: 20,
  },
  userMessageText: {
    color: Colors.white,
  },
  botMessageText: {
    color: "#333333",
  },
  messageTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Sizes.xs,
  },
  userMessageTimeContainer: {
    justifyContent: "flex-end",
  },
  botMessageTimeContainer: {
    justifyContent: "flex-start",
  },
  messageTime: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
  },
  userMessageTime: {
    color: Colors.white,
    marginRight: Sizes.xs,
  },
  botMessageTime: {
    color: "#666666",
  },
  typingIndicator: {
    alignItems: "flex-start",
    marginTop: Sizes.sm,
  },
  typingBubble: {
    backgroundColor: "#E0F2F7",
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#666666",
    marginHorizontal: 2,
  },
  inputArea: {
    backgroundColor: Colors.white,
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.xs,
  },
  cameraButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.sm,
  },
  messageInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#333333",
    maxHeight: 100,
    paddingVertical: Sizes.sm,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0098B3",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: Sizes.sm,
  },
  backgroundImageContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: -1,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    opacity: 0.3,
  },
});
