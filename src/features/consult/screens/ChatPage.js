import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function ChatPage({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { doctor } = route.params || {};
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const [message, setMessage] = useState("");

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

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Good afternoon, doctor. I've been feeling a bit dizzy lately.",
      sender: "user",
      time: "9:45am",
      status: "read",
    },
    {
      id: 2,
      text: "Good afternoon! I'm sorry to hear that. How long have you been experiencing the dizziness?",
      sender: "doctor",
      time: "9:48am",
    },
    {
      id: 3,
      text: "It started about three days ago",
      sender: "user",
      time: "9:50am",
      status: "read",
    },
    {
      id: 4,
      text: "Okay. Do you also feel headaches, blurred vision, or nausea?",
      sender: "doctor",
      time: "9:51am",
    },
    {
      id: 5,
      text: "Yes, I sometimes get mild headaches with it.",
      sender: "user",
      time: "9:51am",
      status: "read",
    },
    {
      id: 6,
      text: "I recommend checking your blood pressure today. I'll also suggest a few lifestyle adjustments, but if it persists, we'll schedule a physical meeting",
      sender: "doctor",
      time: "9:55am",
    },
    {
      id: 7,
      text: "Alright, thank you doctor.",
      sender: "user",
      time: "9:57am",
      status: "read",
    },
    {
      id: 8,
      text: "You're welcome! Please take care and keep me updated",
      sender: "doctor",
      time: "9:58am",
    },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: message.trim(),
        sender: "user",
        time: new Date()
          .toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
          .toLowerCase(),
        status: "sent",
      };
      setMessages([...messages, newMessage]);
      setMessage("");
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
            <Text style={styles.doctorStatus}>Online</Text>
          </View>
        </View>

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
      </View>

      <ScrollView
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageContainer,
              msg.sender === "user" ? styles.userMessage : styles.doctorMessage,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                msg.sender === "user" ? styles.userBubble : styles.doctorBubble,
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
                    msg.sender === "user" ? styles.userTime : styles.doctorTime,
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
        ))}
      </ScrollView>

      <View
        style={[
          styles.inputContainer,
          { paddingBottom: isKeyboardVisible ? 0 : insets.bottom },
        ]}
      >
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="camera" size={24} color={Colors.grey} />
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor={Colors.grey}
          value={message}
          onChangeText={setMessage}
          multiline
        />

        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Ionicons name="send" size={20} color={Colors.white} />
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
});
