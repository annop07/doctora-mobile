import { Tabs } from 'expo-router'
import { View, Text, Image } from 'react-native'

import icons from '@/constants/icons'
const TabIcon = ({focused, icon , title}: 
    {focused: boolean, icon: any, title: string}) => (
    <View className='flex-1 mt-3 flex flex-col items-center'>
        <Image source={icon} tintColor={focused ? '#0061FF' : '#666876'} 
        resizeMode='contain' className='size-6'/>
        <Text className={`${focused ? 'text-primary-300 font-rubik-medium'
            : 'text-black-200 font-rubik'} text-xs w-full text-center mt-1
        }`}>
            {title}
        </Text>
    </View>
)


const TabsLayout = () => {
    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarStyle:{
                    backgroundColor: 'white',
                    position: 'absolute',
                    borderTopColor: '#0061FF1A',
                    borderTopWidth: 1,
                    minHeight: 70,
                }
            }}
        >
            <Tabs.Screen
                name='index' //ชื่อไฟล์ที่จะลิงก์
                options={{
                    title: 'Home',
                    headerShown: false,
                    tabBarIcon: ({focused}) =>(
                       <TabIcon icon={icons.home} 
                                focused={focused} 
                                title="Home"/>
                    )
                }}
            /> 
            <Tabs.Screen
                name='explore'
                options={{
                    title: 'Explore',
                    headerShown: false,
                    tabBarIcon: ({focused}) =>(
                       <TabIcon icon={icons.search}
                                focused={focused}
                                title="Explore"/>
                    )
                }}
            />
            <Tabs.Screen
                name='appointments'
                options={{
                    title: 'Appointments',
                    headerShown: false,
                    tabBarIcon: ({focused}) =>(
                       <TabIcon icon={icons.calendar}
                                focused={focused}
                                title="Appointments"/>
                    )
                }}
            />
            <Tabs.Screen
                name='profile'
                options={{
                    title: 'Profile',
                    headerShown: false,
                    tabBarIcon: ({focused}) =>(
                       <TabIcon icon={icons.person}
                                focused={focused}
                                title="Profile"/>
                    )
                }}
            /> 
        </Tabs>
    )
}
export default TabsLayout