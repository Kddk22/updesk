import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// Alle Transaktionen abrufen
router.get('/', async (req, res) => {
  try {
    const transaktionen = await db.allAsync('SELECT * FROM transaktionen ORDER BY datum DESC');
    res.json(transaktionen);
  } catch (error) {
    console.error('Fehler beim Abrufen der Transaktionen:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Eine bestimmte Transaktion abrufen
router.get('/:id', async (req, res) => {
  try {
    const transaktion = await db.getAsync('SELECT * FROM transaktionen WHERE id = ?', [req.params.id]);
    
    if (!transaktion) {
      return res.status(404).json({ error: 'Transaktion nicht gefunden' });
    }
    
    res.json(transaktion);
  } catch (error) {
    console.error('Fehler beim Abrufen der Transaktion:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Neue Transaktion erstellen
router.post('/', async (req, res) => {
  const { datum, typ, kategorie, betrag, beschreibung } = req.body;
  
  if (!datum || !typ || !kategorie || betrag === undefined) {
    return res.status(400).json({ error: 'Datum, Typ, Kategorie und Betrag sind erforderlich' });
  }
  
  if (typ !== 'Einnahme' && typ !== 'Ausgabe') {
    return res.status(400).json({ error: 'Typ muss entweder "Einnahme" oder "Ausgabe" sein' });
  }
  
  try {
    const result = await db.runAsync(
      'INSERT INTO transaktionen (datum, typ, kategorie, betrag, beschreibung) VALUES (?, ?, ?, ?, ?)',
      [datum, typ, kategorie, betrag, beschreibung]
    );
    
    const newTransaktion = await db.getAsync('SELECT * FROM transaktionen WHERE id = ?', [result.lastID]);
    res.status(201).json(newTransaktion);
  } catch (error) {
    console.error('Fehler beim Erstellen der Transaktion:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Transaktion aktualisieren
router.put('/:id', async (req, res) => {
  const { datum, typ, kategorie, betrag, beschreibung } = req.body;
  
  if (!datum || !typ || !kategorie || betrag === undefined) {
    return res.status(400).json({ error: 'Datum, Typ, Kategorie und Betrag sind erforderlich' });
  }
  
  if (typ !== 'Einnahme' && typ !== 'Ausgabe') {
    return res.status(400).json({ error: 'Typ muss entweder "Einnahme" oder "Ausgabe" sein' });
  }
  
  try {
    const transaktion = await db.getAsync('SELECT * FROM transaktionen WHERE id = ?', [req.params.id]);
    
    if (!transaktion) {
      return res.status(404).json({ error: 'Transaktion nicht gefunden' });
    }
    
    await db.runAsync(
      'UPDATE transaktionen SET datum = ?, typ = ?, kategorie = ?, betrag = ?, beschreibung = ? WHERE id = ?',
      [datum, typ, kategorie, betrag, beschreibung, req.params.id]
    );
    
    const updatedTransaktion = await db.getAsync('SELECT * FROM transaktionen WHERE id = ?', [req.params.id]);
    res.json(updatedTransaktion);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Transaktion:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Transaktion löschen
router.delete('/:id', async (req, res) => {
  try {
    const transaktion = await db.getAsync('SELECT * FROM transaktionen WHERE id = ?', [req.params.id]);
    
    if (!transaktion) {
      return res.status(404).json({ error: 'Transaktion nicht gefunden' });
    }
    
    await db.runAsync('DELETE FROM transaktionen WHERE id = ?', [req.params.id]);
    res.json({ message: 'Transaktion erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen der Transaktion:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Zusammenfassung der Transaktionen (Summen nach Typ)
router.get('/zusammenfassung/bilanz', async (req, res) => {
  try {
    // Summe der Einnahmen
    const einnahmen = await db.getAsync(
      'SELECT SUM(betrag) as summe FROM transaktionen WHERE typ = "Einnahme"'
    );
    
    // Summe der Ausgaben
    const ausgaben = await db.getAsync(
      'SELECT SUM(betrag) as summe FROM transaktionen WHERE typ = "Ausgabe"'
    );
    
    // Bilanz berechnen
    const einnahmenSumme = einnahmen.summe || 0;
    const ausgabenSumme = ausgaben.summe || 0;
    const bilanz = einnahmenSumme - ausgabenSumme;
    
    res.json({
      einnahmen: einnahmenSumme,
      ausgaben: ausgabenSumme,
      bilanz: bilanz
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Zusammenfassung:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Zusammenfassung nach Kategorien
router.get('/zusammenfassung/kategorien', async (req, res) => {
  try {
    const kategorien = await db.allAsync(
      'SELECT kategorie, typ, SUM(betrag) as summe FROM transaktionen GROUP BY kategorie, typ ORDER BY kategorie'
    );
    
    res.json(kategorien);
  } catch (error) {
    console.error('Fehler beim Abrufen der Kategorien-Zusammenfassung:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

export default router;