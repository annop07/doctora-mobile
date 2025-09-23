import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  onPress,
  ...props
}) => {
  const isDisabled = disabled || loading;

  // Base styles
  const baseButtonStyle = 'flex-row items-center justify-center rounded-xl transition-all duration-250';

  // Variant styles
  const variantStyles = {
    primary: `bg-primary-600 ${isDisabled ? 'opacity-50' : 'active:bg-primary-700'}`,
    secondary: `bg-secondary-100 ${isDisabled ? 'opacity-50' : 'active:bg-secondary-200'}`,
    outline: `border-2 border-primary-600 bg-transparent ${isDisabled ? 'opacity-50' : 'active:bg-primary-50'}`,
    ghost: `bg-transparent ${isDisabled ? 'opacity-50' : 'active:bg-secondary-100'}`,
  };

  // Size styles
  const sizeStyles = {
    sm: 'h-10 px-4',
    md: 'h-button px-6', // h-button = 48px from tailwind config
    lg: 'h-14 px-8',
  };

  // Text variant styles
  const textVariantStyles = {
    primary: 'text-white',
    secondary: 'text-secondary-700',
    outline: 'text-primary-600',
    ghost: 'text-secondary-700',
  };

  // Text size styles
  const textSizeStyles = {
    sm: 'text-sm font-rubik-medium',
    md: 'text-base font-rubik-medium',
    lg: 'text-lg font-rubik-semiBold',
  };

  const buttonClasses = `${baseButtonStyle} ${variantStyles[variant]} ${sizeStyles[size]}`;
  const textClasses = `${textVariantStyles[variant]} ${textSizeStyles[size]}`;

  return (
    <TouchableOpacity
      className={buttonClasses}
      disabled={isDisabled}
      onPress={onPress}
      style={style}
      activeOpacity={0.8}
      {...props}
    >
      {leftIcon && !loading && (
        <>{leftIcon}</>
      )}

      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#ffffff' : '#0891b2'}
        />
      ) : (
        <Text className={textClasses} style={textStyle}>
          {title}
        </Text>
      )}

      {rightIcon && !loading && (
        <>{rightIcon}</>
      )}
    </TouchableOpacity>
  );
};

export default Button;