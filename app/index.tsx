import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="กำลังโหลด..." />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(root)/(tabs)" />;
  }

  return <Redirect href="/welcome" />;
}