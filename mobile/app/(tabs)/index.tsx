import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Flashcard } from '../../src/components/Flashcard';
import { Button } from '../../src/components/Button';
import { scheduleLocalNotification } from '../../src/utils/notifications';
import { vocabularyDb, LocalFlashcard } from '../../src/database/vocabularyDb';
import { syncService } from '../../src/utils/syncService';
import NetInfo from '@react-native-community/netinfo';
import { Feather } from '@expo/vector-icons';

export default function HomeScreen() {
  const [localWords, setLocalWords] = useState<LocalFlashcard[]>([]);
  const [newWord, setNewWord] = useState('');
  const [newDef, setNewDef] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadWords();
    
    // Subscribe to network state
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(!!state.isConnected);
      if (state.isConnected) {
        handleSync();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await syncService.fullSync();
      await loadWords();
    } catch (error) {
      console.log('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const loadWords = async () => {
    try {
      const words = await vocabularyDb.getAll();
      setLocalWords(words);
    } catch (error) {
      console.error('Failed to load words', error);
    }
  };

  const handleAddWord = async () => {
    if (!newWord || !newDef) {
      Alert.alert('Lỗi', 'Vui lòng nhập từ và định nghĩa');
      return;
    }

    try {
      const id = Date.now().toString();
      await vocabularyDb.insert({
        id,
        word: newWord,
        definition: newDef,
        example: 'Added offline',
      });
      setNewWord('');
      setNewDef('');
      loadWords();
      
      // If online, try to sync immediately
      if (isOnline) {
        handleSync();
      } else {
        Alert.alert('Đã lưu', 'Từ vựng đã được lưu cục bộ. Sẽ đồng bộ khi có mạng.');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu từ vựng');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dự án English Flashcard</Text>
        <View style={styles.statusBadge}>
          {isOnline ? (
            <View style={styles.onlineStatus}>
              <Feather name="wifi" size={16} color="#4CD964" />
              <Text style={[styles.statusText, { color: '#4CD964' }]}>Trực tuyến</Text>
            </View>
          ) : (
            <View style={styles.offlineStatus}>
              <Feather name="wifi-off" size={16} color="#FF3B30" />
              <Text style={[styles.statusText, { color: '#FF3B30' }]}>Ngoại tuyến</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Thêm từ mới</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Nhập từ tiếng Anh..." 
          value={newWord}
          onChangeText={setNewWord}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Nhập nghĩa tiếng Việt..." 
          value={newDef}
          onChangeText={setNewDef}
        />
        <Button title="Lưu từ vựng" onPress={handleAddWord} loading={isSyncing && isOnline} />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Từ vựng của bạn ({localWords.length})</Text>
        {isSyncing && <ActivityIndicator size="small" color="#007AFF" />}
      </View>
      
      {localWords.length > 0 ? (
        localWords.map((item) => (
          <View key={item.id} style={styles.cardWrapper}>
            <Flashcard 
              word={item.word} 
              definition={item.definition}
              example={item.example}
            />
            {!item.synced && (
              <View style={styles.syncBadge}>
                <Text style={styles.syncBadgeText}>Chờ đồng bộ</Text>
              </View>
            )}
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>Chưa có từ vựng nào được lưu.</Text>
      )}

      <View style={styles.buttonContainer}>
        <Button 
          title="Đồng bộ ngay" 
          onPress={handleSync} 
          variant="outline"
          loading={isSyncing}
        />
        <Button 
          title="Gửi thông báo thử nghiệm" 
          onPress={() => scheduleLocalNotification('Học thôi!', 'Đã đến giờ rồi.')} 
        />
      </View>

      <Text style={styles.env}>API URL: {process.env.EXPO_PUBLIC_API_URL}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 5,
    textTransform: 'uppercase',
  },
  sectionHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  form: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#eee',
  },
  input: {
    backgroundColor: '#f1f3f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  cardWrapper: {
    width: '100%',
    marginBottom: 10,
    position: 'relative',
  },
  syncBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFCC00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 10,
  },
  syncBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
    marginVertical: 20,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
  },
  env: {
    fontSize: 12,
    color: '#999',
    marginTop: 40,
    marginBottom: 20,
  },
});
