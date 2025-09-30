import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// Alle Notizen abrufen
router.get('/', async (req, res) => {
  try {
    const notizen = await db.allAsync('SELECT * FROM notizen ORDER BY letzte_aenderung DESC');
    res.json(notizen);
  } catch (error) {
    console.error('Fehler beim Abrufen der Notizen:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Eine bestimmte Notiz abrufen
router.get('/:id', async (req, res) => {
  try {
    const notiz = await db.getAsync('SELECT * FROM notizen WHERE id = ?', [req.params.id]);
    
    if (!notiz) {
      return res.status(404).json({ error: 'Notiz nicht gefunden' });
    }
    
    res.json(notiz);
  } catch (error) {
    console.error('Fehler beim Abrufen der Notiz:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Neue Notiz erstellen
router.post('/', async (req, res) => {
  const { titel, inhalt } = req.body;
  
  if (!titel) {
    return res.status(400).json({ error: 'Titel ist erforderlich' });
  }
  
  try {
    const result = await db.runAsync(
      'INSERT INTO notizen (titel, inhalt) VALUES (?, ?)',
      [titel, inhalt || '']
    );
    
    const newNotiz = await db.getAsync('SELECT * FROM notizen WHERE id = ?', [result.lastID]);
    res.status(201).json(newNotiz);
  } catch (error) {
    console.error('Fehler beim Erstellen der Notiz:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Notiz aktualisieren
router.put('/:id', async (req, res) => {
  const { titel, inhalt } = req.body;
  
  if (!titel) {
    return res.status(400).json({ error: 'Titel ist erforderlich' });
  }
  
  try {
    const notiz = await db.getAsync('SELECT * FROM notizen WHERE id = ?', [req.params.id]);
    
    if (!notiz) {
      return res.status(404).json({ error: 'Notiz nicht gefunden' });
    }
    
    await db.runAsync(
      'UPDATE notizen SET titel = ?, inhalt = ?, letzte_aenderung = CURRENT_TIMESTAMP WHERE id = ?',
      [titel, inhalt || '', req.params.id]
    );
    
    const updatedNotiz = await db.getAsync('SELECT * FROM notizen WHERE id = ?', [req.params.id]);
    res.json(updatedNotiz);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Notiz:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Notiz löschen
router.delete('/:id', async (req, res) => {
  try {
    const notiz = await db.getAsync('SELECT * FROM notizen WHERE id = ?', [req.params.id]);
    
    if (!notiz) {
      return res.status(404).json({ error: 'Notiz nicht gefunden' });
    }
    
    await db.runAsync('DELETE FROM notizen WHERE id = ?', [req.params.id]);
    res.json({ message: 'Notiz erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen der Notiz:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Notizen nach Titel suchen
router.get('/suche/:suchbegriff', async (req, res) => {
  try {
    const suchbegriff = `%${req.params.suchbegriff}%`;
    
    const notizen = await db.allAsync(
      'SELECT * FROM notizen WHERE titel LIKE ? OR inhalt LIKE ? ORDER BY letzte_aenderung DESC',
      [suchbegriff, suchbegriff]
    );
    
    res.json(notizen);
  } catch (error) {
    console.error('Fehler bei der Suche nach Notizen:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

export default router;