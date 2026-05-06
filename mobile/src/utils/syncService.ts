import NetInfo from '@react-native-community/netinfo';
import { vocabularyDb, topicsDb, LocalFlashcard, LocalTopic } from '../database/vocabularyDb';
import apiClient from '../api/client';

export const syncService = {
  /**
   * Syncs topics between local and remote
   */
  async syncTopics() {
    const state = await NetInfo.fetch();
    if (!state.isConnected) return { success: false, reason: 'offline' };

    try {
      const response = await apiClient.get('/topics');
      const remoteTopics: any[] = response as any;

      if (Array.isArray(remoteTopics)) {
        for (const remote of remoteTopics) {
          await topicsDb.insert({
            id: remote.id,
            name: remote.name,
            color: remote.color,
          });
        }
      }
      return { success: true, count: remoteTopics.length };
    } catch (error) {
      console.error('Sync topics failed:', error);
      return { success: false, error };
    }
  },

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

      for (const word of unsyncedWords) {
        try {
          let topicIdToSync = word.topicId;
          const isLocalId = topicIdToSync && topicIdToSync.length > 10 && !topicIdToSync.includes('-');

          try {
            await apiClient.post('/flashcards', {
              word: word.word,
              meaning: word.definition,
              phonetic: word.phonetic || '', // Gửi chuỗi rỗng nếu không có để tránh lỗi NOT NULL trên server
              example: word.example,
              topicId: isLocalId ? undefined : (topicIdToSync || undefined),
            });
            await vocabularyDb.markAsSynced(word.id);
          } catch (postErr: any) {
            if (postErr.response?.status === 400 && isLocalId) {
              console.log(`Retrying sync for word ${word.id} without local topicId...`);
              await apiClient.post('/flashcards', {
                word: word.word,
                meaning: word.definition,
                phonetic: word.phonetic || '',
                example: word.example,
              });
              await vocabularyDb.markAsSynced(word.id);
            } else if (postErr.response?.status === 409) {
              // Word already exists on server, mark as synced
              // The next pull will merge it correctly
              console.log(`Word "${word.word}" already exists on server, marking as synced.`);
              await vocabularyDb.markAsSynced(word.id);
            } else {
              throw postErr;
            }
          }
        } catch (err) {
          console.error(`Failed to sync word ${word.id}:`, err);
        }
      }

      return { success: true, count: unsyncedWords.length };
    } catch (error) {
      console.error('Push sync failed:', error);
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
      const response = await apiClient.get('/flashcards?limit=1000');
      const remoteWords: any[] = response as any;

      if (Array.isArray(remoteWords)) {
        const localWords = await vocabularyDb.getAll();
        const localIds = new Set(localWords.map(w => w.id));
        const localWordsByName = new Map(localWords.map(w => [w.word.toLowerCase(), w]));

        for (const remote of remoteWords) {
          const localData = {
            id: remote.id,
            word: remote.word,
            definition: remote.meaning || remote.definition,
            phonetic: remote.phonetic,
            example: remote.example,
            topicId: remote.topic?.id || remote.topicId,
          };

          const existingLocal = localWordsByName.get(remote.word.toLowerCase());

          if (existingLocal && existingLocal.synced === 0) {
            await vocabularyDb.delete(existingLocal.id);
            await vocabularyDb.insert(localData);
          } else if (!localIds.has(remote.id)) {
            await vocabularyDb.insert(localData);
          }
          await vocabularyDb.markAsSynced(remote.id);
        }
        return { success: true, count: remoteWords.length };
      }
      return { success: true, count: 0 };
    } catch (error) {
      console.error('Pull sync failed:', error);
      return { success: false, error };
    }
  },

  async fullSync() {
    await this.syncTopics();
    const pushResult = await this.pushLocalChanges();
    const pullResult = await this.pullRemoteChanges();
    return { pushResult, pullResult };
  }
};
