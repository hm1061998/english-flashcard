import React from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  interpolate,
  Extrapolation,
  withTiming
} from 'react-native-reanimated';

export enum SRSGrade {
  AGAIN = 0,
  HARD = 2,
  GOOD = 4,
  EASY = 5
}

export interface FlashcardDisplaySettings {
  showPhoneticOnFront: boolean;
  showPhoneticOnBack: boolean;
  showMeaning: boolean;
  showExample: boolean;
}

interface FlashcardProps {
  word: string;
  definition: string;
  phonetic?: string;
  example?: string;
  topicName?: string;
  onRate?: (grade: number) => void;
  showRating?: boolean;
  settings?: FlashcardDisplaySettings;
}

const defaultSettings: FlashcardDisplaySettings = {
  showPhoneticOnFront: true,
  showPhoneticOnBack: false,
  showMeaning: true,
  showExample: true,
};

export const Flashcard = ({ 
  word, 
  definition, 
  phonetic, 
  example, 
  topicName, 
  onRate, 
  showRating,
  settings = defaultSettings
}: FlashcardProps) => {
  const rotate = useSharedValue(0);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      rotate.value,
      [0, 180],
      [0, 180],
      Extrapolation.CLAMP
    );
    return {
      transform: [
        { perspective: 1200 },
        { rotateY: `${rotation}deg` },
        { scale: interpolate(rotate.value, [0, 90, 180], [1, 0.98, 1]) }
      ],
      zIndex: rotate.value <= 90 ? 1 : 0,
      opacity: rotate.value <= 90 ? 1 : 0,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      rotate.value,
      [0, 180],
      [180, 360],
      Extrapolation.CLAMP
    );
    return {
      transform: [
        { perspective: 1200 },
        { rotateY: `${rotation}deg` },
        { scale: interpolate(rotate.value, [0, 90, 180], [1, 0.98, 1]) }
      ],
      zIndex: rotate.value > 90 ? 1 : 0,
      opacity: rotate.value > 90 ? 1 : 0,
    };
  });

  const handlePress = () => {
    rotate.value = withTiming(rotate.value === 0 ? 180 : 0, {
      duration: 400,
    });
  };

  const renderRatingButtons = () => (
    <View style={styles.ratingContainer}>
      <TouchableOpacity 
        activeOpacity={0.8}
        style={[styles.rateBtn, { backgroundColor: '#FF4D4F' }]} 
        onPress={() => onRate?.(SRSGrade.AGAIN)}
      >
        <Text style={styles.rateBtnText}>Lại</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        activeOpacity={0.8}
        style={[styles.rateBtn, { backgroundColor: '#FAAD14' }]} 
        onPress={() => onRate?.(SRSGrade.HARD)}
      >
        <Text style={styles.rateBtnText}>Khó</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        activeOpacity={0.8}
        style={[styles.rateBtn, { backgroundColor: '#52C41A' }]} 
        onPress={() => onRate?.(SRSGrade.GOOD)}
      >
        <Text style={styles.rateBtnText}>Đạt</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        activeOpacity={0.8}
        style={[styles.rateBtn, { backgroundColor: '#1890FF' }]} 
        onPress={() => onRate?.(SRSGrade.EASY)}
      >
        <Text style={styles.rateBtnText}>Dễ</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      {/* Front Side */}
      <Animated.View style={[styles.card, frontAnimatedStyle]}>
        {topicName && (
          <View style={styles.topicBadge}>
            <Text style={styles.topicBadgeText}>{topicName}</Text>
          </View>
        )}
        <View style={styles.content}>
          <Text style={styles.word}>{word}</Text>
          {phonetic && settings.showPhoneticOnFront && (
            <Text style={styles.phonetic}>{phonetic}</Text>
          )}
          <View style={styles.indicator} />
        </View>
      </Animated.View>

      {/* Back Side */}
      <Animated.View style={[styles.card, styles.backCard, backAnimatedStyle]}>
        <View style={styles.content}>
          {settings.showMeaning && (
            <Text style={styles.definition}>{definition}</Text>
          )}
          
          {phonetic && settings.showPhoneticOnBack && (
            <Text style={styles.phoneticBack}>{phonetic}</Text>
          )}

          {example && settings.showExample && (
            <View style={styles.exampleWrapper}>
              <Text style={styles.example}>“{example}”</Text>
            </View>
          )}
          
          {showRating && onRate ? (
            renderRatingButtons()
          ) : (
            <View style={styles.indicator} />
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 260,
    width: '100%',
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 28,
    padding: 30,
    backfaceVisibility: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  backCard: {
    backgroundColor: '#fff',
  },
  topicBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  topicBadgeText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  word: {
    fontSize: 38,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    letterSpacing: -1,
  },
  phonetic: {
    fontSize: 18,
    color: '#64748b',
    marginTop: 8,
    fontWeight: '500',
  },
  phoneticBack: {
    fontSize: 16,
    color: '#4f46e5',
    marginTop: 8,
    fontStyle: 'italic',
  },
  definition: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    lineHeight: 32,
  },
  exampleWrapper: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  example: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 25,
  },
  rateBtn: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rateBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
  },
  indicator: {
    position: 'absolute',
    bottom: -10,
    width: 40,
    height: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 2,
  },
});
