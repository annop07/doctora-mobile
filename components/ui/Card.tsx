import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';

export interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  margin?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  style?: ViewStyle;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  margin = 'none',
  children,
  style,
  ...props
}) => {
  // Base styles
  const baseStyles = 'rounded-2xl bg-white';

  // Variant styles
  const variantStyles = {
    default: '',
    elevated: 'shadow-medium',
    outlined: 'border border-secondary-200',
  };

  // Padding styles
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  // Margin styles
  const marginStyles = {
    none: '',
    sm: 'm-2',
    md: 'm-4',
    lg: 'm-6',
  };

  const cardClasses = `${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${marginStyles[margin]}`;

  return (
    <View className={cardClasses} style={style} {...props}>
      {children}
    </View>
  );
};

export default Card;