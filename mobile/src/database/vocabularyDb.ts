import * as SQLite from 'expo-sqlite';

export interface LocalTopic {
  id: string;
  name: string;
  color?: string;
}

export interface LocalFlashcard {
  id: string;
  word: string;
  definition: string;
  phonetic?: string;
  example?: string;
  topicId?: string;
  synced: number;
  level: number;
  nextReview: number;
  interval: number;
  easiness: number;
}

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function initialize(db: SQLite.SQLiteDatabase) {
  await db.execAsync('PRAGMA foreign_keys = ON;');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      color TEXT
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS vocabulary (
      id TEXT PRIMARY KEY NOT NULL,
      word TEXT NOT NULL,
      definition TEXT NOT NULL,
      phonetic TEXT,
      example TEXT,
      topicId TEXT,
      synced INTEGER DEFAULT 0,
      level INTEGER DEFAULT 0,
      nextReview INTEGER DEFAULT 0,
      interval INTEGER DEFAULT 0,
      easiness REAL DEFAULT 2.5,
      FOREIGN KEY (topicId) REFERENCES topics (id)
    );
  `);

  try {
    const tableInfo: any = await db.getAllAsync("PRAGMA table_info(vocabulary)");
    const columns = tableInfo.map((c: any) => c.name);
    
    const migrations = [
      { name: 'topicId', type: 'TEXT' },
      { name: 'phonetic', type: 'TEXT' },
      { name: 'level', type: 'INTEGER DEFAULT 0' },
      { name: 'nextReview', type: 'INTEGER DEFAULT 0' },
      { name: 'interval', type: 'INTEGER DEFAULT 0' },
      { name: 'easiness', type: 'REAL DEFAULT 2.5' }
    ];

    for (const m of migrations) {
      if (!columns.includes(m.name)) {
        await db.execAsync(`ALTER TABLE vocabulary ADD COLUMN ${m.name} ${m.type};`);
      }
    }
  } catch (e) {
    console.log("Migration check failed", e);
  }
}

export const getDatabase = async () => {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const db = await SQLite.openDatabaseAsync('vocabulary.db');
      await initialize(db);
      dbInstance = db;
      return db;
    } catch (error) {
      initPromise = null;
      console.error("Database initialization failed:", error);
      throw error;
    }
  })();
  
  return initPromise;
};

export const topicsDb = {
  async getAll(): Promise<LocalTopic[]> {
    const database = await getDatabase();
    return await database.getAllAsync<LocalTopic>('SELECT * FROM topics');
  },

  async insert(topic: LocalTopic) {
    const database = await getDatabase();
    await database.runAsync(
      'INSERT OR REPLACE INTO topics (id, name, color) VALUES (?, ?, ?)',
      [topic.id, topic.name, topic.color || '']
    );
  },

  async delete(id: string) {
    const database = await getDatabase();
    await database.runAsync('DELETE FROM topics WHERE id = ?', [id]);
    await database.runAsync('UPDATE vocabulary SET topicId = NULL WHERE topicId = ?', [id]);
  }
};

export const vocabularyDb = {
  async getAll(limit: number = 20, offset: number = 0, topicId?: string, search?: string): Promise<LocalFlashcard[]> {
    const database = await getDatabase();
    let query = 'SELECT * FROM vocabulary';
    const params: any[] = [];
    const conditions: string[] = [];

    if (topicId) {
      conditions.push('topicId = ?');
      params.push(topicId);
    }

    if (search) {
      conditions.push('(word LIKE ? OR definition LIKE ?)');
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return await database.getAllAsync<LocalFlashcard>(query, params);
  },

  async count(topicId?: string, search?: string): Promise<number> {
    const database = await getDatabase();
    let query = 'SELECT COUNT(*) as total FROM vocabulary';
    const params: any[] = [];
    const conditions: string[] = [];

    if (topicId) {
      conditions.push('topicId = ?');
      params.push(topicId);
    }

    if (search) {
      conditions.push('(word LIKE ? OR definition LIKE ?)');
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const result: any = await database.getFirstAsync(query, params);
    return result?.total || 0;
  },

  async getDueCards(): Promise<LocalFlashcard[]> {
    const database = await getDatabase();
    const now = Date.now();
    return await database.getAllAsync<LocalFlashcard>(
      'SELECT * FROM vocabulary WHERE nextReview <= ? ORDER BY nextReview ASC',
      [now]
    );
  },

  async insert(card: Partial<LocalFlashcard> & { id: string, word: string, definition: string }) {
    const database = await getDatabase();
    await database.runAsync(
      'INSERT OR REPLACE INTO vocabulary (id, word, definition, phonetic, example, topicId, synced, level, nextReview, interval, easiness) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        card.id, 
        card.word, 
        card.definition, 
        card.phonetic || '', 
        card.example || '', 
        card.topicId || null, 
        card.synced || 0,
        card.level || 0,
        card.nextReview || 0,
        card.interval || 0,
        card.easiness || 2.5
      ]
    );
  },

  async updateSRS(id: string, srsData: { level: number, nextReview: number, interval: number, easiness: number }) {
    const database = await getDatabase();
    await database.runAsync(
      'UPDATE vocabulary SET level = ?, nextReview = ?, interval = ?, easiness = ?, synced = 0 WHERE id = ?',
      [srsData.level, srsData.nextReview, srsData.interval, srsData.easiness, id]
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
