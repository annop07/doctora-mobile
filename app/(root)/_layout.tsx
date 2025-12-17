import { Redirect, Slot } from "expo-router";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";

export default function RootLayout() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <SafeAreaView className="bg-white h-full flex justify-center items-center">
                <ActivityIndicator className="text-primary-300" size="large" />
            </SafeAreaView>
        )
    }

    // ถ้าไม่มี user ให้ redirect ไปหน้า sign-in
    if (!user) return <Redirect href='/sign-in' />

    return <Slot />
}
