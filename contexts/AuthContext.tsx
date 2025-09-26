import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import {
  AuthContextType,
  User,
  LoginRequest,
  RegisterRequest,
  ApiError,
  UserRole,
} from "@/types";
import { authService } from "@/services/auth";
import { storageService } from "@/utils/storage";

// Mock mode for development (set to true to bypass API calls)
const MOCK_AUTH_MODE = false; // Set to true for testing, false for real API

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async (): Promise<void> => {
    try {
      setLoading(true);
      const [storedToken, storedUser] = await Promise.all([
        storageService.getAuthToken(),
        storageService.getUserData(),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      } else {
        await clearAuthData();
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      await clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setLoading(true);

      if (MOCK_AUTH_MODE) {
        // Mock login for development
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay

        const mockUser: User = {
          id: "1",
          email: credentials.email,
          firstName: "ผู้ใช้",
          lastName: "ทดสอบ",
          role: UserRole.PATIENT,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const mockToken = "mock-jwt-token";

        await Promise.all([
          storageService.setAuthToken(mockToken),
          storageService.setUserData(mockUser),
        ]);

        setToken(mockToken);
        setUser(mockUser);

        router.replace("/(root)/(tabs)");
        return;
      }

      const authResponse = await authService.login(credentials);
      console.log("🔍 AuthContext - authResponse:", authResponse);
      console.log("🔍 AuthContext - authResponse.token:", authResponse?.token);

      await Promise.all([
        storageService.setAuthToken(authResponse.token),
        storageService.setUserData({
          id: authResponse.id,
          email: authResponse.email,
          firstName: authResponse.firstName,
          lastName: authResponse.lastName,
          role: authResponse.role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      ]);

      setToken(authResponse.token);
      setUser({
        id: authResponse.id,
        email: authResponse.email,
        firstName: authResponse.firstName,
        lastName: authResponse.lastName,
        role: authResponse.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      router.replace("/(root)/(tabs)");
    } catch (error) {
      console.error("Login error:", error);
      const apiError = error as ApiError;
      Alert.alert(
        "เข้าสู่ระบบไม่สำเร็จ",
        apiError.message || "กรุณาตรวจสอบอีเมลและรหัสผ่าน"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      setLoading(true);
      await authService.register(userData);
      Alert.alert(
        "สมัครสมาชิกสำเร็จ",
        "กรุณาเข้าสู่ระบบด้วยอีเมลและรหัสผ่านที่คุณสมัคร",
        [{ text: "ตกลง", onPress: () => router.replace("/sign-in") }]
      );
    } catch (error) {
      const apiError = error as ApiError;
      Alert.alert(
        "สมัครสมาชิกไม่สำเร็จ",
        apiError.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (error) {
      console.warn("Logout API call failed:", error);
    } finally {
      await clearAuthData();
      setLoading(false);
      router.replace("/sign-in");
    }
  };

  const clearAuthData = async (): Promise<void> => {
    try {
      await storageService.clearAllAuthData();
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  };

  const isAuthenticated = !!(token && user);

  const contextValue: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
