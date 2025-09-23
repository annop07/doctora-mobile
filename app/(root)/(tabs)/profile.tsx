import { settings } from '@/constants/data';
import icons from '@/constants/icons'
import images from '@/constants/images'
import { router } from 'expo-router';
import { View, Text, ScrollView, Image, TouchableOpacity, Settings, ImageSourcePropType } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface SettingsItemProps {
  icon: ImageSourcePropType;
  title: string;
  onPress?: () => void;
  textStyle?: string;
  showArrow?: boolean;
}
const handleLoggout = () => {
  // ออกจากระบบและกลับไปหน้า sign-in
  router.replace('/sign-in');
}

const SettingItem = ({ icon, title, onPress, textStyle, showArrow = true }
  : SettingsItemProps) => (
  <TouchableOpacity onPress={onPress} className='flex flex-row items-center justify-between py-3'>
    <View className='flex flex-row items-center gap-3'>
      <Image source={icon} className='size-6' />
      <Text className={`text-lg font-rubik-medium text-black-300 
          ${textStyle}`}>
        {title}
      </Text>
    </View>
    {showArrow && <Image source={icons.rightArrow} className='size-5' />}
  </TouchableOpacity>
)

const Profile = () => {


  return (
    <SafeAreaView>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32 px-7"
      >
        <View className='flex flex-row items-center justify-between mt-5 '>
          <Text className='text-xl font-rubik-bold'>Profile</Text>
          <Image source={icons.bell} className='size-5' />

        </View>
        <View className='flex flex-row justify-center mt-5'>

          <View className='flex flex-col items-center relative mt-5'>
            <Image source={images.avatar} className='size-44 relative rounded-full' />
            <TouchableOpacity className='absolute bottom-11 right-2'>
              <Image source={icons.edit} className='size-9' />
            </TouchableOpacity>

            <Text className='text-2xl font-rubik-bold mt-2'>Mevryb | MRY</Text>
          </View>
        </View>

        <View className='flex flex-col mt-10'>
          <SettingItem icon={icons.calendar} title="My Booking" />
          <SettingItem icon={icons.wallet} title="Payment" />
        </View>

        <View className='flex flex-col mt-5 border-5 pt-5 border-primary-200'>
          {settings.slice(2).map((item, index) => (
            <SettingItem key={index} {...item} />
          ))}
        </View>

         <View className='flex flex-col mt-5 border-5 pt-5 border-primary-200'>
            <SettingItem icon={icons.logout} title="Logout" 
            textStyle='text-danger' showArrow={false} onPress={handleLoggout}/>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}
export default Profile