import { StyleSheet, Text, View, Switch, Alert } from 'react-native';
import React, { useState } from 'react';
import { Button } from '@/components/Button';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng xuất', 
          style: 'destructive',
          onPress: async () => {
            await SecureStore.deleteItemAsync('auth_token');
            dispatch(logout());
            router.replace('/login');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cài Đặt</Text>
      
      <View style={styles.row}>
        <Text style={styles.label}>Bật thông báo</Text>
        <Switch 
          value={notificationsEnabled} 
          onValueChange={setNotificationsEnabled} 
        />
      </View>

      <View style={styles.logoutContainer}>
        <Button title="Đăng xuất" onPress={handleLogout} variant="outline" />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Phiên bản ứng dụng: {Constants.expoConfig?.version || '1.0.0'}</Text>
        <Text style={styles.infoText}>Môi trường: {process.env.EXPO_PUBLIC_ENV || 'Production'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#1a1a1a',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  label: {
    fontSize: 16,
    color: '#374151',
  },
  logoutContainer: {
    marginTop: 30,
  },
  infoBox: {
    marginTop: 'auto',
    padding: 20,
    alignItems: 'center',
  },
  infoText: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 5,
  }
});
