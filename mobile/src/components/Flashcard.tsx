import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface FlashcardProps {
  word: string;
  definition: string;
  example?: string;
}

export const Flashcard = ({ word, definition, example }: FlashcardProps) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={() => setFlipped(!flipped)} 
      style={styles.card}
    >
      <View style={styles.content}>
        {!flipped ? (
          <View style={styles.side}>
            <Text style={styles.word}>{word}</Text>
            <Text style={styles.hint}>Tap to see definition</Text>
          </View>
        ) : (
          <View style={styles.side}>
            <Text style={styles.definition}>{definition}</Text>
            {example && <Text style={styles.example}>"{example}"</Text>}
          </View>
        )}
      </View>
      <View style={styles.flipIcon}>
        <MaterialCommunityIcons name="sync" size={18} color="#999" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    minHeight: 200,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginVertical: 12,
    position: 'relative',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  side: {
    alignItems: 'center',
  },
  word: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
  },
  definition: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
    lineHeight: 28,
  },
  example: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  flipIcon: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  }
});
