import React from "react";
import icons from "@/constants/icons";
import images from "@/constants/images";
import { router } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";

interface SettingsItemProps {
  icon: ImageSourcePropType;
  title: string;
  onPress?: () => void;
  textStyle?: string;
  showArrow?: boolean;
}

const SettingItem = ({
  icon,
  title,
  onPress,
  textStyle,
  showArrow = true,
}: SettingsItemProps) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex flex-row items-center justify-between py-4 px-4 border-b border-secondary-100"
  >
    <View className="flex flex-row items-center gap-3">
      <Image source={icon} className="size-5" tintColor="#64748b" />
      <Text
        className={`text-base font-rubik-medium text-text-primary ${textStyle}`}
      >
        {title}
      </Text>
    </View>
    {showArrow && (
      <Image source={icons.rightArrow} className="size-4" tintColor="#94a3b8" />
    )}
  </TouchableOpacity>
);

const Profile = () => {
  const { user, logout } = useAuth();

  // Mock stats for display
  const upcomingCount = 2;
  const completedCount = 5;
  

  const handleLogout = async () => {
    await logout();
  };

  const handleViewAllAppointments = () => {
    router.push("/appointments");
  };


  return (
    <SafeAreaView className="bg-background-secondary h-full">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header */}
        <View className="bg-white px-5 py-4 border-b border-secondary-200">
          <View className="flex flex-row items-center justify-between">
            <Text className="text-2xl font-rubik-bold text-text-primary">
              โปรไฟล์
            </Text>
            <TouchableOpacity>
              <Image
                source={icons.bell}
                className="size-6"
                tintColor="#64748b"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Info */}
        <View className="bg-white px-5 py-6 mb-4">
          <View className="flex flex-row items-center">
            <View className="relative">
              <Image
                source={images.avatar}
                className="size-20 rounded-full border-2 border-primary-100"
              />
              <TouchableOpacity className="absolute -bottom-1 -right-1 bg-primary-600 p-2 rounded-full">
                <Image
                  source={icons.edit}
                  className="size-3"
                  tintColor="white"
                />
              </TouchableOpacity>
            </View>

            <View className="flex-1 ml-4">
              <Text className="text-xl font-rubik-bold text-text-primary">
                {user?.firstName || "ผู้ใช้"} {user?.lastName || ""}
              </Text>
              <Text className="text-sm font-rubik text-secondary-600 mt-1">
                {user?.email || "user@example.com"}
              </Text>

              {/* Stats */}
              <View className="flex flex-row mt-3">
                <View className="bg-primary-50 px-3 py-1 rounded-full mr-3">
                  <Text className="text-xs font-rubik-semiBold text-primary-600">
                    {upcomingCount} นัดที่จะมาถึง
                  </Text>
                </View>
                <View className="bg-success-50 px-3 py-1 rounded-full">
                  <Text className="text-xs font-rubik-semiBold text-success-600">
                    {completedCount} นัดเสร็จสิ้น
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>


        {/* Quick Actions */}
        <View className="bg-white mb-4">
          <SettingItem
            icon={icons.calendar}
            title="การนัดหมายของฉัน"
            onPress={handleViewAllAppointments}
          />
          <SettingItem
            icon={icons.wallet}
            title="ประวัติการชำระเงิน"
            onPress={() =>
              Alert.alert("ประวัติการชำระเงิน", "ฟีเจอร์นี้จะเปิดใช้งานในอนาคต")
            }
          />
          <SettingItem
            icon={icons.person}
            title="แก้ไขข้อมูลส่วนตัว"
            onPress={() =>
              Alert.alert("แก้ไขข้อมูลส่วนตัว", "ฟีเจอร์นี้จะเปิดใช้งานในอนาคต")
            }
          />
        </View>

        {/* Settings */}
        <View className="bg-white mb-4">
          <SettingItem
            icon={icons.bell}
            title="การแจ้งเตือน"
            onPress={() =>
              Alert.alert("การแจ้งเตือน", "ฟีเจอร์นี้จะเปิดใช้งานในอนาคต")
            }
          />
          <SettingItem
            icon={icons.info}
            title="ช่วยเหลือและสนับสนุน"
            onPress={() =>
              Alert.alert(
                "ช่วยเหลือและสนับสนุน",
                "ฟีเจอร์นี้จะเปิดใช้งานในอนาคต"
              )
            }
          />
          <SettingItem
            icon={icons.info}
            title="เกี่ยวกับเรา"
            onPress={() =>
              Alert.alert("เกี่ยวกับเรา", "ฟีเจอร์นี้จะเปิดใช้งานในอนาคต")
            }
          />
        </View>

        {/* Logout */}
        <View className="bg-white">
          <SettingItem
            icon={icons.logout}
            title="ออกจากระบบ"
            textStyle="text-error-500"
            showArrow={false}
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
export default Profile;
