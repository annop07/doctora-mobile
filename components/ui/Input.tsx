import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Image,
  TextInputProps,
  ViewStyle,
  TextStyle,
  ImageSourcePropType,
} from 'react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: ImageSourcePropType;
  rightIcon?: ImageSourcePropType;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  showPasswordToggle?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  showPasswordToggle = false,
  secureTextEntry,
  value,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handlePasswordToggle = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const isSecure = showPasswordToggle ? !isPasswordVisible : secureTextEntry;

  // Container styles
  const containerClasses = `mb-4`;

  // Input container styles
  const inputContainerClasses = `
    flex-row items-center h-input px-4 rounded-xl border
    ${error
      ? 'border-error-500 bg-error-50'
      : isFocused
        ? 'border-primary-600 bg-white'
        : 'border-secondary-200 bg-secondary-50'
    }
  `;

  // Input text styles
  const inputTextClasses = `
    flex-1 text-base font-rubik text-text-primary
    ${leftIcon ? 'ml-3' : ''}
    ${(rightIcon || showPasswordToggle) ? 'mr-3' : ''}
  `;

  // Label styles
  const labelClasses = `text-sm font-rubik-medium text-text-secondary mb-2`;

  // Error styles
  const errorClasses = `text-sm font-rubik text-error-500 mt-1`;

  return (
    <View className={containerClasses} style={containerStyle}>
      {/* Label */}
      {label && (
        <Text className={labelClasses} style={labelStyle}>
          {label}
        </Text>
      )}

      {/* Input Container */}
      <View className={inputContainerClasses}>
        {/* Left Icon */}
        {leftIcon && (
          <Image
            source={leftIcon}
            className="w-5 h-5"
            style={{ tintColor: error ? '#ef4444' : isFocused ? '#0891b2' : '#94a3b8' }}
            resizeMode="contain"
          />
        )}

        {/* Text Input */}
        <TextInput
          className={inputTextClasses}
          style={inputStyle}
          value={value}
          secureTextEntry={isSecure}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          autoCorrect={false}
          {...props}
        />

        {/* Right Icon or Password Toggle */}
        {showPasswordToggle ? (
          <TouchableOpacity onPress={handlePasswordToggle} className="p-1">
            <Text className="text-secondary-400 text-xs font-rubik">
              {isPasswordVisible ? 'ซ่อน' : 'แสดง'}
            </Text>
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity onPress={onRightIconPress} disabled={!onRightIconPress}>
            <Image
              source={rightIcon}
              className="w-5 h-5"
              style={{ tintColor: error ? '#ef4444' : isFocused ? '#0891b2' : '#94a3b8' }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Error Message */}
      {error && (
        <Text className={errorClasses} style={errorStyle}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default Input;