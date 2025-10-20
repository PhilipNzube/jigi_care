import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../constants";

export default function InputField({
  label,
  value,
  placeholder,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  icon,
  rightIcon,
  onRightIconPress,
  error,
  style,
}) {
  return (
    <View style={[styles.fieldContainer, style]}>
      {label && <Text style={styles.fieldLabel}>{label}</Text>}
      <View
        style={[styles.inputContainer, error && styles.inputContainerError]}
      >
        {icon && (
          <View style={styles.inputIcon}>
            <Ionicons
              name={icon}
              size={20}
              color={error ? Colors.error : Colors.textSecondary}
            />
          </View>
        )}
        <TextInput
          style={[styles.textInput, error && styles.textInputError]}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={Colors.textSecondary}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Ionicons
              name={rightIcon}
              size={20}
              color={error ? Colors.error : Colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: Sizes.lg,
  },
  fieldLabel: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Sizes.md,
  },
  inputContainerError: {
    borderBottomColor: Colors.error,
  },
  inputIcon: {
    marginRight: Sizes.md,
  },
  textInput: {
    flex: 1,
    fontSize: Sizes.fontSize.md,
    fontFamily: "Poppins-Regular",
    color: Colors.textPrimary,
  },
  textInputError: {
    color: Colors.error,
  },
  rightIcon: {
    marginLeft: Sizes.sm,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.error,
    marginTop: Sizes.xs,
  },
});
