import { StyleSheet, Text, View, Switch } from 'react-native';
import React, { useState } from 'react';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.row}>
        <Text style={styles.label}>Enable Notifications</Text>
        <Switch 
          value={notificationsEnabled} 
          onValueChange={setNotificationsEnabled} 
        />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>App Version: 1.0.0</Text>
        <Text style={styles.infoText}>Environment: {process.env.EXPO_PUBLIC_ENV}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 16,
  },
  infoBox: {
    marginTop: 'auto',
    padding: 20,
    alignItems: 'center',
  },
  infoText: {
    color: '#999',
    fontSize: 12,
  }
});
