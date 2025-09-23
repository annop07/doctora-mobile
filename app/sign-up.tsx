import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, LoadingSpinner } from '@/components/ui';
import { UserRole } from '@/types';
import images from '@/constants/images';
import icons from '@/constants/icons';

const SignUp = () => {
  const { register, loading, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(root)/(tabs)');
    }
  }, [isAuthenticated]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (!password.trim()) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน';
    } else if (password.length < 6) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'กรุณายืนยันรหัสผ่าน';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await register({
        email: email.trim(),
        password: password.trim(),
        firstName: '',
        lastName: '',
        role: UserRole.PATIENT,
      });
    } catch (error) {
      // Error is handled in AuthContext
      console.error('Registration failed:', error);
    }
  };

  const handleSignInPress = () => {
    router.push('/sign-in');
  };

  if (loading) {
    return (
      <SafeAreaView className="bg-white h-full">
        <LoadingSpinner message="กำลังสร้างบัญชี..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Banner Section */}
        <View className="flex-[2] bg-gradient-to-b from-primary-100 to-primary-50 justify-center items-center px-6">
          <Image
            source={images.banner}
            className="w-full h-60"
            resizeMode="contain"
          />
        </View>

        {/* Content Section */}
        <View className="flex-1 px-6 py-6">
          {/* Logo */}
          <View className="items-center mb-6">
            <Image
              source={images.logo}
              className="w-40 h-20"
              resizeMode="contain"
            />
          </View>

          {/* Sign Up Form */}
          <View className="space-y-4">
            <Input
              placeholder="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              leftIcon={icons.person}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Input
              placeholder="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              leftIcon={icons.shield}
              error={errors.password}
              secureTextEntry
              showPasswordToggle
              autoComplete="password"
            />

            <Input
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
              }}
              leftIcon={icons.shield}
              error={errors.confirmPassword}
              secureTextEntry
              showPasswordToggle
              autoComplete="password"
            />

            <Button
              title="สมัครสมาชิก"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              variant="primary"
              size="lg"
            />
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-secondary-200" />
            <Text className="mx-4 text-sm font-rubik text-secondary-500">หรือ</Text>
            <View className="flex-1 h-px bg-secondary-200" />
          </View>

          {/* Social Login */}
          <TouchableOpacity
            className="flex-row items-center justify-center h-button border border-secondary-200 rounded-xl bg-white"
            onPress={() => {
              // TODO: Implement Google Sign-In
              console.log('Google sign-up pressed');
            }}
          >
            <Image
              source={icons.google}
              className="w-5 h-5 mr-3"
              resizeMode="contain"
            />
            <Text className="text-base font-rubik-medium text-text-primary">
              Continue with Google
            </Text>
          </TouchableOpacity>

          {/* Sign In Link */}
          <View className="flex-row justify-center items-center mt-6">
            <Text className="text-sm font-rubik text-secondary-600">
              มีบัญชีแล้ว?
            </Text>
            <TouchableOpacity onPress={handleSignInPress} className="ml-1">
              <Text className="text-sm font-rubik-semiBold text-primary-600">
                เข้าสู่ระบบ
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;