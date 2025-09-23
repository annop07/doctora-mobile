import { Redirect, Slot } from "expo-router";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
    // จำลอง context สำหรับการทดสอบ
    const loading = false;
    const isLoggedIn = true; // เปลี่ยนเป็น true เพื่อให้เข้าไปใน tabs ได้

    if(loading){
        return (
            <SafeAreaView className="bg-white h-full flex justify-center items-center">
                <ActivityIndicator className="text-primary-300" size="large" />
            </SafeAreaView>
        )
    }

    if(!isLoggedIn) return <Redirect href='/sign-in'/>

    return <Slot />
}
