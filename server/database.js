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

// Promisify database methods with proper context handling
db.runAsync = function(...args) {
  return new Promise((resolve, reject) => {
    db.run(...args, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this); // 'this' contains lastID, changes, etc.
      }
    });
  });
};
db.getAsync = promisify(db.get.bind(db));
db.allAsync = promisify(db.all.bind(db));

// Migration function to add missing programs to existing databases
const runMigrations = async () => {
  try {
    console.log('🔄 Running database migrations...');
    
    // Migration 1: Add Docker Manager if missing
    const dockerManager = await db.getAsync(
      'SELECT * FROM programs WHERE url = ?',
      ['/apps/docker']
    );
    
    if (!dockerManager) {
      console.log('📦 Adding Docker Manager to existing database...');
      await db.runAsync(
        'INSERT INTO programs (name, url, icon, position_x, position_y) VALUES (?, ?, ?, ?, ?)',
        ['Docker Manager', '/apps/docker', '/icons/docker.svg', 4, 0]
      );
      console.log('✅ Docker Manager added successfully');
    }
    
    // Add more migrations here in the future
    // Migration 2: ...
    // Migration 3: ...
    
  } catch (error) {
    console.error('⚠️  Migration warning:', error.message);
    // Don't throw - migrations should not break the app
  }
};

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

    // UpFlow App: Tabelle für Zähler
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS zaehler (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        zaehlertyp TEXT NOT NULL,
        zaehlernummer TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        vertrags_jahresverbrauch REAL,
        vertrags_datum DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // UpFlow App: Tabelle für Zählerstände
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS zaehlerstaende (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        zaehler_id INTEGER NOT NULL,
        datum DATE NOT NULL,
        stand REAL NOT NULL,
        bemerkung TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (zaehler_id) REFERENCES zaehler (id) ON DELETE CASCADE
      )
    `);

    // UpSum App: Tabelle für Einnahmen und Ausgaben
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS transaktionen (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        datum DATE NOT NULL,
        typ TEXT NOT NULL CHECK (typ IN ('Einnahme', 'Ausgabe')),
        kategorie TEXT NOT NULL,
        betrag REAL NOT NULL,
        beschreibung TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // UpNote App: Tabelle für Notizen
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS notizen (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titel TEXT NOT NULL,
        inhalt TEXT,
        erstellungsdatum DATETIME DEFAULT CURRENT_TIMESTAMP,
        letzte_aenderung DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if we need to insert default data
    const programCount = await db.getAsync('SELECT COUNT(*) as count FROM programs');
    
    if (programCount.count === 0) {
      console.log('📦 Inserting default programs...');
      
      const defaultPrograms = [
        {
          name: 'UpFlow',
          url: '/apps/upflow',
          icon: '/icons/upflow.svg',
          position_x: 0,
          position_y: 0
        },
        {
          name: 'UpSum',
          url: '/apps/upsum',
          icon: '/icons/upsum.svg',
          position_x: 1,
          position_y: 0
        },
        {
          name: 'UpNote',
          url: '/apps/upnote',
          icon: '/icons/upnote.svg',
          position_x: 2,
          position_y: 0
        },
        {
          name: 'Port Dokumentation',
          url: '/apps/portdocumentation',
          icon: '/icons/default-app.svg',
          position_x: 3,
          position_y: 0
        },
        {
          name: 'Docker Manager',
          url: '/apps/docker',
          icon: '/icons/docker.svg',
          position_x: 4,
          position_y: 0
        },
        {
          name: 'Google',
          url: 'https://www.google.com',
          icon: '/icons/google.svg',
          position_x: 0,
          position_y: 1
        },
        {
          name: 'GitHub',
          url: 'https://github.com',
          icon: '/icons/github.svg',
          position_x: 1,
          position_y: 1
        },
        {
          name: 'YouTube',
          url: 'https://www.youtube.com',
          icon: '/icons/youtube.svg',
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

    // Run migrations for existing databases
    await runMigrations();

    console.log('✅ Database initialized successfully.');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

export { db };