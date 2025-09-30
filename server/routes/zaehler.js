import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// Alle Zähler abrufen
router.get('/', async (req, res) => {
  try {
    const zaehler = await db.allAsync('SELECT * FROM zaehler ORDER BY name');
    res.json(zaehler);
  } catch (error) {
    console.error('Fehler beim Abrufen der Zähler:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Einen bestimmten Zähler abrufen
router.get('/:id', async (req, res) => {
  try {
    const zaehler = await db.getAsync('SELECT * FROM zaehler WHERE id = ?', [req.params.id]);
    
    if (!zaehler) {
      return res.status(404).json({ error: 'Zähler nicht gefunden' });
    }
    
    res.json(zaehler);
  } catch (error) {
    console.error('Fehler beim Abrufen des Zählers:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Neuen Zähler erstellen
router.post('/', async (req, res) => {
  const { zaehlertyp, zaehlernummer, name, vertrags_jahresverbrauch, vertrags_datum } = req.body;
  
  if (!zaehlertyp || !zaehlernummer || !name) {
    return res.status(400).json({ error: 'Zaehlertyp, Zaehlernummer und Name sind erforderlich' });
  }
  
  try {
    const result = await db.runAsync(
      'INSERT INTO zaehler (zaehlertyp, zaehlernummer, name, vertrags_jahresverbrauch, vertrags_datum) VALUES (?, ?, ?, ?, ?)',
      [zaehlertyp, zaehlernummer, name, vertrags_jahresverbrauch, vertrags_datum]
    );
    
    const newZaehler = await db.getAsync('SELECT * FROM zaehler WHERE id = ?', [result.lastID]);
    res.status(201).json(newZaehler);
  } catch (error) {
    console.error('Fehler beim Erstellen des Zählers:', error);
    
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Ein Zähler mit dieser Zählernummer existiert bereits' });
    }
    
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Zähler aktualisieren
router.put('/:id', async (req, res) => {
  const { zaehlertyp, zaehlernummer, name, vertrags_jahresverbrauch, vertrags_datum } = req.body;
  
  if (!zaehlertyp || !zaehlernummer || !name) {
    return res.status(400).json({ error: 'Zaehlertyp, Zaehlernummer und Name sind erforderlich' });
  }
  
  try {
    await db.runAsync(
      'UPDATE zaehler SET zaehlertyp = ?, zaehlernummer = ?, name = ?, vertrags_jahresverbrauch = ?, vertrags_datum = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [zaehlertyp, zaehlernummer, name, vertrags_jahresverbrauch, vertrags_datum, req.params.id]
    );
    
    const updatedZaehler = await db.getAsync('SELECT * FROM zaehler WHERE id = ?', [req.params.id]);
    
    if (!updatedZaehler) {
      return res.status(404).json({ error: 'Zähler nicht gefunden' });
    }
    
    res.json(updatedZaehler);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Zählers:', error);
    
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Ein Zähler mit dieser Zählernummer existiert bereits' });
    }
    
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Zähler löschen
router.delete('/:id', async (req, res) => {
  try {
    const zaehler = await db.getAsync('SELECT * FROM zaehler WHERE id = ?', [req.params.id]);
    
    if (!zaehler) {
      return res.status(404).json({ error: 'Zähler nicht gefunden' });
    }
    
    await db.runAsync('DELETE FROM zaehler WHERE id = ?', [req.params.id]);
    res.json({ message: 'Zähler erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Zählers:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

export default router;