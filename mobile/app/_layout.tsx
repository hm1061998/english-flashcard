import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store, RootState } from '@/store';
import { setAuth, logout } from '@/store/slices/authSlice';
import * as SecureStore from 'expo-secure-store';
import apiClient from '@/api/client';

// Configure notifications behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Root Navigation Component to handle redirects
function RootNavigation() {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && segments[0] === 'login') {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, loading]);

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token) {
          // Verify token and get profile
          try {
            const response = await apiClient.get('/auth/profile', {
              headers: { Authorization: `Bearer ${token}` }
            });
            const user = response as any;
            dispatch(setAuth({ 
              user: {
                id: user.id,
                email: user.email || user.username,
                name: user.username,
              }, 
              token 
            }));
          } catch (apiError) {
            console.log('Token invalid or expired');
            await SecureStore.deleteItemAsync('auth_token');
            dispatch(logout());
          }
        }
      } catch (e) {
        console.log('Failed to restore token');
      }
    };

    checkAuth();
    Notifications.requestPermissionsAsync();
  }, [dispatch]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <RootNavigation />
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
