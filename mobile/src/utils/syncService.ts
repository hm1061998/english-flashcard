import NetInfo from '@react-native-community/netinfo';
import { vocabularyDb, LocalFlashcard } from '../database/vocabularyDb';
import apiClient from '../api/client';

export const syncService = {
  /**
   * Pushes local non-synced data to the backend
   */
  async pushLocalChanges() {
    const state = await NetInfo.fetch();
    if (!state.isConnected) return { success: false, reason: 'offline' };

    try {
      const allWords = await vocabularyDb.getAll();
      const unsyncedWords = allWords.filter(w => w.synced === 0);

      if (unsyncedWords.length === 0) return { success: true, count: 0 };

      console.log(`Syncing ${unsyncedWords.length} words...`);

      // Batch upload or one by one
      for (const word of unsyncedWords) {
        try {
          await apiClient.post('/vocabulary', {
            id: word.id,
            word: word.word,
            definition: word.definition,
            example: word.example,
          });
          
          await vocabularyDb.markAsSynced(word.id);
        } catch (err) {
          console.error(`Failed to sync word ${word.id}:`, err);
          // Continue with next word
        }
      }

      return { success: true, count: unsyncedWords.length };
    } catch (error) {
      console.error('Sync process failed:', error);
      return { success: false, error };
    }
  },

  /**
   * Pulls latest data from backend and updates local DB
   */
  async pullRemoteChanges() {
    const state = await NetInfo.fetch();
    if (!state.isConnected) return { success: false, reason: 'offline' };

    try {
      const response = await apiClient.get('/vocabulary');
      const remoteWords: any[] = response.data;

      const localWords = await vocabularyDb.getAll();
      const localIds = new Set(localWords.map(w => w.id));

      for (const remote of remoteWords) {
        if (!localIds.has(remote.id)) {
          await vocabularyDb.insert({
            id: remote.id,
            word: remote.word,
            definition: remote.definition,
            example: remote.example,
          });
          // Mark as synced since it came from server
          await vocabularyDb.markAsSynced(remote.id);
        }
      }

      return { success: true, count: remoteWords.length };
    } catch (error) {
      console.error('Pull sync failed:', error);
      return { success: false, error };
    }
  },

  async fullSync() {
    const pushResult = await this.pushLocalChanges();
    const pullResult = await this.pullRemoteChanges();
    return { pushResult, pullResult };
  }
};
