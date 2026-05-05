import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { setAuth } from '../src/store/slices/authSlice';
import { Button } from '../src/components/Button';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { FontAwesome } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  // In a real app, you would provide your Client IDs here
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
  });

  const handleMockLogin = () => {
    // For demonstration, we'll mock a successful SSO login
    dispatch(setAuth({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'English Learner',
      },
      token: 'mock-token',
    }));
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2068/2068153.png' }} 
          style={styles.logo} 
        />
        <Text style={styles.title}>English Flashcard</Text>
        <Text style={styles.subtitle}>Học tiếng Anh thông minh mỗi ngày</Text>
      </View>

      <View style={styles.authContainer}>
        <TouchableOpacity style={styles.googleButton} onPress={handleMockLogin}>
          <FontAwesome name="google" size={20} color="#DB4437" />
          <Text style={styles.googleText}>Đăng nhập với Google</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.appleButton} onPress={handleMockLogin}>
          <FontAwesome name="apple" size={20} color="#fff" />
          <Text style={styles.appleText}>Tiếp tục với Apple</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.or}>HOẶC</Text>
          <View style={styles.line} />
        </View>

        <Button 
          title="Dùng thử ngay (Khách)" 
          onPress={handleMockLogin} 
          variant="primary"
        />
      </View>

      <Text style={styles.footer}>
        Bằng cách tiếp tục, bạn đồng ý với Điều khoản và Chính sách bảo mật của chúng tôi.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 30,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  authContainer: {
    width: '100%',
  },
  googleButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  googleText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  appleButton: {
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  appleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
  },
  or: {
    marginHorizontal: 15,
    color: '#999',
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    lineHeight: 18,
  }
});
