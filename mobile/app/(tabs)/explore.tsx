import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Platform, Modal, Switch, TouchableOpacity } from 'react-native';
import { Flashcard, FlashcardDisplaySettings } from '@/components/Flashcard';
import { Button } from '@/components/Button';
import { vocabularyDb, LocalFlashcard } from '@/database/vocabularyDb';
import { useFocusEffect } from 'expo-router';
import { calculateSRS } from '@/utils/srs';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

const SETTINGS_KEY = 'flashcard_display_settings';

const defaultSettings: FlashcardDisplaySettings = {
  showPhoneticOnFront: true,
  showPhoneticOnBack: false,
  showMeaning: true,
  showExample: true,
};

export default function ExploreScreen() {
  const [dueCards, setDueCards] = useState<LocalFlashcard[]>([]);
  const [allCards, setAllCards] = useState<LocalFlashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'due' | 'all'>('due');
  const [transitionKey, setTransitionKey] = useState(0);
  
  // Settings state
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [settings, setSettings] = useState<FlashcardDisplaySettings>(defaultSettings);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await SecureStore.getItemAsync(SETTINGS_KEY);
        if (stored) {
          setSettings(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    };
    loadSettings();
  }, []);

  const saveSettings = async (newSettings: FlashcardDisplaySettings) => {
    try {
      setSettings(newSettings);
      await SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  };

  const loadWords = useCallback(async () => {
    setLoading(true);
    try {
      const [due, all] = await Promise.all([
        vocabularyDb.getDueCards(),
        vocabularyDb.getAll()
      ]);
      
      setDueCards(due);
      setAllCards(all);
      
      if (due.length > 0) {
        setMode('due');
        setCurrentIndex(0);
      } else {
        setMode('all');
        if (all.length > 0) {
          setCurrentIndex(Math.floor(Math.random() * all.length));
        }
      }
    } catch (error) {
      console.error('Failed to load words', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWords();
    }, [loadWords])
  );

  const triggerNextAnimation = () => {
    setTransitionKey(prev => prev + 1);
  };

  const handleRate = async (grade: number) => {
    const currentList = mode === 'due' ? dueCards : allCards;
    if (currentList.length === 0) return;
    
    const word = currentList[currentIndex];
    
    const newSRS = calculateSRS(grade, {
      level: word.level || 0,
      interval: word.interval || 0,
      easiness: word.easiness || 2.5,
      nextReview: word.nextReview || 0
    });

    await vocabularyDb.updateSRS(word.id, newSRS);

    if (mode === 'due') {
      const updatedDue = dueCards.filter((_, i) => i !== currentIndex);
      setDueCards(updatedDue);
      if (updatedDue.length === 0) {
        setMode('all');
        if (allCards.length > 0) {
          setCurrentIndex(Math.floor(Math.random() * allCards.length));
        }
      } else {
        if (currentIndex >= updatedDue.length) {
          setCurrentIndex(0);
        }
      }
    } else {
      handleNext();
    }
    triggerNextAnimation();
  };

  const handleNext = () => {
    const list = mode === 'due' ? dueCards : allCards;
    if (list.length > 1) {
      let nextIndex = currentIndex;
      while (nextIndex === currentIndex) {
        nextIndex = Math.floor(Math.random() * list.length);
      }
      setCurrentIndex(nextIndex);
      triggerNextAnimation();
    }
  };

  const toggleSetting = (key: keyof FlashcardDisplaySettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color="#4f46e5" />
      </View>
    );
  }

  const currentList = mode === 'due' ? dueCards : allCards;

  if (currentList.length === 0) {
    return (
      <View style={styles.center}>
        <Animated.View entering={ZoomIn.duration(500)}>
          <Text style={styles.emptyText}>Tuyệt vời! Bạn đã học hết từ hôm nay.</Text>
          <View style={{ marginTop: 25, width: '100%' }}>
            <Button title="Tiếp tục học" onPress={() => { setMode('all'); loadWords(); }} variant="outline" />
          </View>
        </Animated.View>
      </View>
    );
  }

  const currentWord = currentList[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Học tập</Text>
          <View style={styles.modeBadge}>
            <Text style={styles.modeText}>
              {mode === 'due' ? 'Đang ôn tập' : 'Ngẫu nhiên'}
            </Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.settingsBtn} 
            onPress={() => setIsSettingsVisible(true)}
          >
            <MaterialCommunityIcons name="cog-outline" size={24} color="#64748b" />
          </TouchableOpacity>
          <View style={styles.counterBadge}>
            <Text style={styles.counter}>{currentIndex + 1} / {currentList.length}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardContainer}>
        <Animated.View 
          key={`${currentWord.id}-${transitionKey}`}
          entering={ZoomIn.duration(300)}
          style={styles.animatedCardWrapper}
        >
          <Flashcard 
            word={currentWord.word}
            definition={currentWord.definition}
            phonetic={currentWord.phonetic}
            example={currentWord.example}
            onRate={handleRate}
            showRating={true}
            settings={settings}
          />
        </Animated.View>
      </View>

      <View style={styles.actions}>
        <Animated.Text entering={FadeIn.delay(600)} style={styles.hint}>
          Chạm vào thẻ để lật xem nghĩa
        </Animated.Text>
      </View>

      {/* Settings Modal */}
      <Modal
        visible={isSettingsVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSettingsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cấu hình hiển thị</Text>
              <TouchableOpacity onPress={() => setIsSettingsVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Phiên âm (Mặt trước)</Text>
              <Switch 
                value={settings.showPhoneticOnFront} 
                onValueChange={() => toggleSetting('showPhoneticOnFront')}
                trackColor={{ false: '#e2e8f0', true: '#c7d2fe' }}
                thumbColor={settings.showPhoneticOnFront ? '#4f46e5' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Phiên âm (Mặt sau)</Text>
              <Switch 
                value={settings.showPhoneticOnBack} 
                onValueChange={() => toggleSetting('showPhoneticOnBack')}
                trackColor={{ false: '#e2e8f0', true: '#c7d2fe' }}
                thumbColor={settings.showPhoneticOnBack ? '#4f46e5' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Nghĩa tiếng Việt (Mặt sau)</Text>
              <Switch 
                value={settings.showMeaning} 
                onValueChange={() => toggleSetting('showMeaning')}
                trackColor={{ false: '#e2e8f0', true: '#c7d2fe' }}
                thumbColor={settings.showMeaning ? '#4f46e5' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Ví dụ (Mặt sau)</Text>
              <Switch 
                value={settings.showExample} 
                onValueChange={() => toggleSetting('showExample')}
                trackColor={{ false: '#e2e8f0', true: '#c7d2fe' }}
                thumbColor={settings.showExample ? '#4f46e5' : '#f4f3f4'}
              />
            </View>

            <View style={{ marginTop: 20 }}>
              <Button 
                title="Đóng" 
                onPress={() => setIsSettingsVisible(false)} 
                variant="primary"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsBtn: {
    padding: 8,
    marginRight: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -1,
  },
  modeBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  modeText: {
    fontSize: 10,
    color: '#4f46e5',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  counterBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  counter: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '700',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  animatedCardWrapper: {
    width: '100%',
  },
  actions: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  hint: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    lineHeight: 28,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingLabel: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '600',
  },
});
