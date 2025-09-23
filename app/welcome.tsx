import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '@/components/ui';
import images from '@/constants/images';

const Welcome = () => {
  const handleSignInPress = () => {
    router.push('/sign-in');
  };

  const handleSignUpPress = () => {
    router.push('/sign-up');
  };

  return (
    <SafeAreaView className="bg-white h-full">
      {/* Banner Section */}
      <View className="flex-[3] bg-gradient-to-b from-primary-100 to-primary-50 justify-center items-center px-6">
        <Image
          source={images.banner}
          className="w-full h-64"
          resizeMode="contain"
        />
      </View>

      {/* Content Section */}
      <View className="flex-[2] px-6 py-8 justify-center">
        {/* Logo */}
        <View className="items-center mb-8">
          <Image
            source={images.logo}
            className="w-48 h-24"
            resizeMode="contain"
          />
        </View>

        {/* Welcome Text */}
        <View className="items-center mb-8">
          <Text className="text-2xl font-rubik-bold text-center text-text-primary mb-2">
            ยินดีต้อนรับสู่ Doctora
          </Text>
          <Text className="text-base font-rubik text-center text-secondary-600 leading-6">
            แพลตฟอร์มจองนัดหมายกับแพทย์{'\n'}ที่ง่าย รวดเร็ว และเชื่อถือได้
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="space-y-4">
          <Button
            title="เข้าสู่ระบบ"
            onPress={handleSignInPress}
            variant="primary"
            size="lg"
          />

          <View className="mt-4">
            <Button
              title="สมัครสมาชิก"
              onPress={handleSignUpPress}
              variant="outline"
              size="lg"
            />
          </View>
        </View>

        {/* Footer Text */}
        <View className="items-center mt-6">
          <Text className="text-xs font-rubik text-center text-secondary-400">
            เมื่อคุณดำเนินการต่อ หมายความว่าคุณยอมรับ{'\n'}
            <Text className="text-primary-600">เงื่อนไขการใช้งาน</Text>
            {' '}และ{' '}
            <Text className="text-primary-600">นโยบายความเป็นส่วนตัว</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Welcome;