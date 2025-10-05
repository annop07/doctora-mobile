import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Header } from '@/components';
import { Input, Button, Card } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface PatientFormData {
  prefix: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  citizenId: string;
  phone: string;
  email: string;
  consentGiven: boolean;
}

export default function PatientFormPage() {
  const params = useLocalSearchParams<{
    doctorId: string;
    doctorName: string;
    date: string;
    time: string;
    notes?: string;
  }>();

  const [formData, setFormData] = useState<PatientFormData>({
    prefix: '',
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    nationality: 'ไทย',
    citizenId: '',
    phone: '',
    email: '',
    consentGiven: false,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleInputChange = (field: keyof PatientFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      // Format as DD/MM/YYYY (Buddhist year - พ.ศ.)
      const year = date.getFullYear() + 543; // Convert to Buddhist year
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      handleInputChange('dateOfBirth', `${day}/${month}/${year}`);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.prefix || !formData.firstName || !formData.lastName) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกชื่อ-นามสกุลให้ครบถ้วน');
      return false;
    }

    if (!formData.gender) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณาเลือกเพศ');
      return false;
    }

    if (!formData.dateOfBirth) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกวันเกิด');
      return false;
    }

    if (!formData.citizenId || formData.citizenId.length !== 13) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกเลขบัตรประชาชน 13 หลัก');
      return false;
    }

    if (!formData.phone || formData.phone.length < 9) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง');
      return false;
    }

    if (!formData.email || !formData.email.includes('@')) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกอีเมลที่ถูกต้อง');
      return false;
    }

    if (!formData.consentGiven) {
      Alert.alert('กรุณายินยอม', 'กรุณายินยอมให้เก็บข้อมูลส่วนตัว');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateForm()) return;

    // Navigate to confirmation page with all data
    router.push({
      pathname: '/(root)/booking/confirmation',
      params: {
        ...params,
        // Patient data
        prefix: formData.prefix,
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        nationality: formData.nationality,
        citizenId: formData.citizenId,
        phone: formData.phone,
        email: formData.email,
      }
    });
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <Header title="ข้อมูลผู้ป่วย" showBackButton={true} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header Info */}
          <View className="px-5 py-6 bg-primary-50">
            <View className="flex-row items-center mb-2">
              <Ionicons name="information-circle" size={24} color="#0066CC" />
              <Text className="text-lg font-rubik-semiBold text-text-primary ml-2">
                กรุณากรอกข้อมูลให้ครบถ้วน
              </Text>
            </View>
            <Text className="text-sm font-rubik text-secondary-600">
              ข้อมูลของคุณจะถูกเก็บเป็นความลับและใช้เพื่อการรักษาเท่านั้น
            </Text>
          </View>

          <View className="px-5 py-6">
            {/* Personal Information */}
            <View className="mb-6">
              <Card variant="outlined" padding="lg">
              <View className="flex-row items-center mb-4">
                <Ionicons name="person" size={20} color="#0066CC" />
                <Text className="text-lg font-rubik-semiBold text-text-primary ml-2">
                  ข้อมูลส่วนตัว
                </Text>
              </View>

              {/* Prefix and Name */}
              <View className="mb-4">
                <Text className="text-sm font-rubik-medium text-secondary-700 mb-2">
                  ชื่อ-นามสกุล *
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={{ width: 100 }}>
                    <Input
                      placeholder="คำนำหน้า"
                      value={formData.prefix}
                      onChangeText={(text) => handleInputChange('prefix', text)}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input
                      placeholder="ชื่อ"
                      value={formData.firstName}
                      onChangeText={(text) => handleInputChange('firstName', text)}
                    />
                  </View>
                </View>
                <View className="mt-2">
                  <Input
                    placeholder="นามสกุล"
                    value={formData.lastName}
                    onChangeText={(text) => handleInputChange('lastName', text)}
                  />
                </View>
              </View>

              {/* Gender */}
              <View className="mb-4">
                <Text className="text-sm font-rubik-medium text-secondary-700 mb-2">
                  เพศ *
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {['ชาย', 'หญิง', 'อื่นๆ'].map((gender) => (
                    <View key={gender} style={{ flex: 1 }}>
                      <Button
                        title={gender}
                        variant={formData.gender === gender ? 'primary' : 'outline'}
                        size="sm"
                        onPress={() => handleInputChange('gender', gender)}
                      />
                    </View>
                  ))}
                </View>
              </View>

              {/* Date of Birth */}
              <View className="mb-4">
                <Text className="text-sm font-rubik-medium text-secondary-700 mb-2">
                  วันเกิด (พ.ศ.) *
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="border-2 border-secondary-200 rounded-xl px-4 py-3 bg-white"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className={`text-base font-rubik ${formData.dateOfBirth ? 'text-text-primary' : 'text-secondary-400'}`}>
                      {formData.dateOfBirth || 'เลือกวันเกิด'}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#666" />
                  </View>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    locale="en-GB"
                  />
                )}
              </View>

              {/* Nationality */}
              <View className="mb-4">
                <Text className="text-sm font-rubik-medium text-secondary-700 mb-2">
                  สัญชาติ *
                </Text>
                <Input
                  placeholder="สัญชาติ"
                  value={formData.nationality}
                  onChangeText={(text) => handleInputChange('nationality', text)}
                />
              </View>

              {/* Citizen ID */}
              <View className="mb-4">
                <Text className="text-sm font-rubik-medium text-secondary-700 mb-2">
                  เลขบัตรประชาชน *
                </Text>
                <Input
                  placeholder="0-0000-00000-00-0"
                  value={formData.citizenId}
                  onChangeText={(text) => handleInputChange('citizenId', text.replace(/\D/g, ''))}
                  keyboardType="numeric"
                  maxLength={13}
                />
              </View>
              </Card>
            </View>

            {/* Contact Information */}
            <View className="mb-6">
              <Card variant="outlined" padding="lg">
              <View className="flex-row items-center mb-4">
                <Ionicons name="call" size={20} color="#0066CC" />
                <Text className="text-lg font-rubik-semiBold text-text-primary ml-2">
                  ข้อมูลติดต่อ
                </Text>
              </View>

              {/* Phone */}
              <View className="mb-4">
                <Text className="text-sm font-rubik-medium text-secondary-700 mb-2">
                  เบอร์โทรศัพท์ *
                </Text>
                <Input
                  placeholder="0xx-xxx-xxxx"
                  value={formData.phone}
                  onChangeText={(text) => handleInputChange('phone', text.replace(/\D/g, ''))}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>

              {/* Email */}
              <View className="mb-4">
                <Text className="text-sm font-rubik-medium text-secondary-700 mb-2">
                  อีเมล *
                </Text>
                <Input
                  placeholder="example@email.com"
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              </Card>
            </View>

            {/* Consent */}
            <View className="mb-6">
              <Card variant="filled" padding="lg">
              <View className="flex-row items-center mb-3">
                <Ionicons name="shield-checkmark" size={20} color="#0066CC" />
                <Text className="text-base font-rubik-semiBold text-text-primary ml-2">
                  ความยินยอม
                </Text>
              </View>

              <Button
                title={formData.consentGiven ? '✓ ยินยอมให้เก็บข้อมูล' : 'กดเพื่อยินยอม'}
                variant={formData.consentGiven ? 'primary' : 'outline'}
                size="md"
                onPress={() => handleInputChange('consentGiven', !formData.consentGiven)}
              />

              <Text className="text-xs font-rubik text-secondary-600 mt-3 leading-5">
                อนุญาตให้มีการเก็บประวัติข้อมูลส่วนตัวและเชื่อมถึงสิทธิการดูแลรักษา
              </Text>
              </Card>
            </View>

            {/* Action Buttons */}
            <View className="flex-row justify-between space-x-3 mt-4">
              <Button
                title="กลับ"
                variant="outline"
                size="lg"
                onPress={() => router.back()}
                style={{ flex: 1 }}
              />

              <Button
                title="ต่อไป"
                variant="primary"
                size="lg"
                onPress={handleNext}
                disabled={!formData.consentGiven}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
