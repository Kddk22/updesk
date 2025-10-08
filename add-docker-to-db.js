import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, 'data', 'updesk.db');

const db = new sqlite3.Database(dbPath);

// Check if Docker Manager already exists
db.get('SELECT * FROM programs WHERE name = ?', ['Docker Manager'], (err, row) => {
  if (err) {
    console.error('Error checking database:', err);
    process.exit(1);
  }
  
  if (row) {
    console.log('Docker Manager already exists in database');
    db.close();
    return;
  }
  
  // Insert Docker Manager
  db.run(
    'INSERT INTO programs (name, url, icon, position_x, position_y) VALUES (?, ?, ?, ?, ?)',
    ['Docker Manager', '/apps/docker', '/icons/docker.svg', 4, 0],
    function(err) {
      if (err) {
        console.error('EV1.1.3rror inserting Docker Manager:', err);
        process.exit(1);
      }
      
      console.log('✅ Docker Manager added to database successfully!');
      console.log(`   ID: ${this.lastID}`);
      console.log('   Name: Docker Manager');
      console.log('   URL: /apps/docker');
      console.log('   Icon: /icons/docker.svg');
      console.log('   Position: (4, 0)');
      
      db.close();
    }
  );
});