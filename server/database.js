import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'updesk.db');

// Create database connection
const db = new sqlite3.Database(dbPath);

// Promisify database methods
db.runAsync = promisify(db.run.bind(db));
db.getAsync = promisify(db.get.bind(db));
db.allAsync = promisify(db.all.bind(db));

export const initDatabase = async () => {
  try {
    console.log('🗄️  Initializing database...');
    
    // Create programs table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS programs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        icon TEXT DEFAULT '/icons/default-app.svg',
        position_x INTEGER DEFAULT 0,
        position_y INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create settings table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if we need to insert default data
    const programCount = await db.getAsync('SELECT COUNT(*) as count FROM programs');
    
    if (programCount.count === 0) {
      console.log('📦 Inserting default programs...');
      
      const defaultPrograms = [
        {
          name: 'Google',
          url: 'https://www.google.com',
          icon: '/icons/google.svg',
          position_x: 0,
          position_y: 0
        },
        {
          name: 'GitHub',
          url: 'https://github.com',
          icon: '/icons/github.svg',
          position_x: 1,
          position_y: 0
        },
        {
          name: 'YouTube',
          url: 'https://www.youtube.com',
          icon: '/icons/youtube.svg',
          position_x: 2,
          position_y: 0
        },
        {
          name: 'VS Code Web',
          url: 'https://vscode.dev',
          icon: '/icons/vscode.svg',
          position_x: 0,
          position_y: 1
        },
        {
          name: 'Stack Overflow',
          url: 'https://stackoverflow.com',
          icon: '/icons/stackoverflow.svg',
          position_x: 1,
          position_y: 1
        },
        {
          name: 'MDN Web Docs',
          url: 'https://developer.mozilla.org',
          icon: '/icons/mdn.svg',
          position_x: 2,
          position_y: 1
        }
      ];

      for (const program of defaultPrograms) {
        await db.runAsync(
          'INSERT INTO programs (name, url, icon, position_x, position_y) VALUES (?, ?, ?, ?, ?)',
          [program.name, program.url, program.icon, program.position_x, program.position_y]
        );
      }
    }

    // Insert default settings
    const settingsCount = await db.getAsync('SELECT COUNT(*) as count FROM settings');
    
    if (settingsCount.count === 0) {
      console.log('⚙️  Inserting default settings...');
      
      const defaultSettings = [
        { key: 'theme', value: 'light' },
        { key: 'wallpaper', value: '/wallpapers/ubuntu-default.jpg' },
        { key: 'dock_position', value: 'left' },
        { key: 'show_dock', value: 'true' },
        { key: 'auto_hide_dock', value: 'false' }
      ];

      for (const setting of defaultSettings) {
        await db.runAsync(
          'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
          [setting.key, setting.value]
        );
      }
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

export { db };