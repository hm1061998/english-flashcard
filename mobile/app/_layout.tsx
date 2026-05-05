import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store, RootState } from '../src/store';
import { setAuth } from '../src/store/slices/authSlice';
import * as SecureStore from 'expo-secure-store';

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
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && inAuthGroup) {
      // Redirect to the login page
      router.replace('/login');
    } else if (isAuthenticated && segments[0] === 'login') {
      // Redirect to the home page
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
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
          // In real app, verify token with backend
          // dispatch(setAuth({ user: decodedUser, token }));
        }
      } catch (e) {
        console.log('Failed to restore token');
      }
    };

    checkAuth();
    // Request notification permissions
    Notifications.requestPermissionsAsync();
  }, []);

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
