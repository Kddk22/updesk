import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, 'data', 'updesk.db');

const db = new sqlite3.Database(dbPath);

db.all('SELECT * FROM programs', [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  
  console.log('📋 Programs in database:');
  console.log('========================');
  rows.forEach(row => {
    console.log(`ID: ${row.id}`);
    console.log(`Name: ${row.name}`);
    console.log(`URL: ${row.url}`);
    console.log(`Icon: ${row.icon}`);
    console.log(`Position: (${row.position_x}, ${row.position_y})`);
    console.log('------------------------');
  });
  
  db.close();
});