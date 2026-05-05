import * as SQLite from 'expo-sqlite';

export interface LocalFlashcard {
  id: string;
  word: string;
  definition: string;
  example?: string;
  synced: number; // 0 for false, 1 for true
}

let db: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async () => {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('vocabulary.db');
  
  // Initialize table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS vocabulary (
      id TEXT PRIMARY KEY NOT NULL,
      word TEXT NOT NULL,
      definition TEXT NOT NULL,
      example TEXT,
      synced INTEGER DEFAULT 0
    );
  `);
  
  return db;
};

export const vocabularyDb = {
  async getAll(): Promise<LocalFlashcard[]> {
    const database = await getDatabase();
    const result = await database.getAllAsync<LocalFlashcard>('SELECT * FROM vocabulary');
    return result;
  },

  async insert(card: Omit<LocalFlashcard, 'synced'>) {
    const database = await getDatabase();
    await database.runAsync(
      'INSERT INTO vocabulary (id, word, definition, example, synced) VALUES (?, ?, ?, ?, ?)',
      [card.id, card.word, card.definition, card.example || '', 0]
    );
  },

  async update(card: LocalFlashcard) {
    const database = await getDatabase();
    await database.runAsync(
      'UPDATE vocabulary SET word = ?, definition = ?, example = ?, synced = ? WHERE id = ?',
      [card.word, card.definition, card.example || '', card.synced, card.id]
    );
  },

  async delete(id: string) {
    const database = await getDatabase();
    await database.runAsync('DELETE FROM vocabulary WHERE id = ?', [id]);
  },

  async markAsSynced(id: string) {
    const database = await getDatabase();
    await database.runAsync('UPDATE vocabulary SET synced = 1 WHERE id = ?', [id]);
  }
};
