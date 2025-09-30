import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// Alle Zählerstände für einen bestimmten Zähler abrufen
router.get('/zaehler/:zaehlerId', async (req, res) => {
  try {
    const zaehlerstaende = await db.allAsync(
      'SELECT * FROM zaehlerstaende WHERE zaehler_id = ? ORDER BY datum DESC',
      [req.params.zaehlerId]
    );
    res.json(zaehlerstaende);
  } catch (error) {
    console.error('Fehler beim Abrufen der Zählerstände:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Einen bestimmten Zählerstand abrufen
router.get('/:id', async (req, res) => {
  try {
    const zaehlerstand = await db.getAsync('SELECT * FROM zaehlerstaende WHERE id = ?', [req.params.id]);
    
    if (!zaehlerstand) {
      return res.status(404).json({ error: 'Zählerstand nicht gefunden' });
    }
    
    res.json(zaehlerstand);
  } catch (error) {
    console.error('Fehler beim Abrufen des Zählerstands:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Neuen Zählerstand erstellen
router.post('/', async (req, res) => {
  const { zaehler_id, datum, stand, bemerkung } = req.body;
  
  if (!zaehler_id || !datum || stand === undefined) {
    return res.status(400).json({ error: 'Zaehler_id, Datum und Stand sind erforderlich' });
  }
  
  try {
    // Prüfen, ob der Zähler existiert
    const zaehler = await db.getAsync('SELECT * FROM zaehler WHERE id = ?', [zaehler_id]);
    
    if (!zaehler) {
      return res.status(404).json({ error: 'Zähler nicht gefunden' });
    }
    
    const result = await db.runAsync(
      'INSERT INTO zaehlerstaende (zaehler_id, datum, stand, bemerkung) VALUES (?, ?, ?, ?)',
      [zaehler_id, datum, stand, bemerkung]
    );
    
    const newZaehlerstand = await db.getAsync('SELECT * FROM zaehlerstaende WHERE id = ?', [result.lastID]);
    res.status(201).json(newZaehlerstand);
  } catch (error) {
    console.error('Fehler beim Erstellen des Zählerstands:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Zählerstand aktualisieren
router.put('/:id', async (req, res) => {
  const { zaehler_id, datum, stand, bemerkung } = req.body;
  
  if (!zaehler_id || !datum || stand === undefined) {
    return res.status(400).json({ error: 'Zaehler_id, Datum und Stand sind erforderlich' });
  }
  
  try {
    // Prüfen, ob der Zählerstand existiert
    const zaehlerstand = await db.getAsync('SELECT * FROM zaehlerstaende WHERE id = ?', [req.params.id]);
    
    if (!zaehlerstand) {
      return res.status(404).json({ error: 'Zählerstand nicht gefunden' });
    }
    
    await db.runAsync(
      'UPDATE zaehlerstaende SET zaehler_id = ?, datum = ?, stand = ?, bemerkung = ? WHERE id = ?',
      [zaehler_id, datum, stand, bemerkung, req.params.id]
    );
    
    const updatedZaehlerstand = await db.getAsync('SELECT * FROM zaehlerstaende WHERE id = ?', [req.params.id]);
    res.json(updatedZaehlerstand);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Zählerstands:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Zählerstand löschen
router.delete('/:id', async (req, res) => {
  try {
    const zaehlerstand = await db.getAsync('SELECT * FROM zaehlerstaende WHERE id = ?', [req.params.id]);
    
    if (!zaehlerstand) {
      return res.status(404).json({ error: 'Zählerstand nicht gefunden' });
    }
    
    await db.runAsync('DELETE FROM zaehlerstaende WHERE id = ?', [req.params.id]);
    res.json({ message: 'Zählerstand erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Zählerstands:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Differenzverbrauch und Prognose für einen Zähler berechnen
router.get('/analyse/:zaehlerId', async (req, res) => {
  try {
    // Zähler abrufen
    const zaehler = await db.getAsync('SELECT * FROM zaehler WHERE id = ?', [req.params.zaehlerId]);
    
    if (!zaehler) {
      return res.status(404).json({ error: 'Zähler nicht gefunden' });
    }
    
    // Die letzten zwei Zählerstände abrufen
    const zaehlerstaende = await db.allAsync(
      'SELECT * FROM zaehlerstaende WHERE zaehler_id = ? ORDER BY datum DESC LIMIT 2',
      [req.params.zaehlerId]
    );
    
    let differenz = null;
    let prognose = null;
    
    // Differenz berechnen, wenn mindestens zwei Zählerstände vorhanden sind
    if (zaehlerstaende.length >= 2) {
      differenz = zaehlerstaende[0].stand - zaehlerstaende[1].stand;
    }
    
    // Alle Zählerstände für Durchschnittsberechnung abrufen
    const alleZaehlerstaende = await db.allAsync(
      'SELECT * FROM zaehlerstaende WHERE zaehler_id = ? ORDER BY datum ASC',
      [req.params.zaehlerId]
    );
    
    // Prognose berechnen, wenn mindestens zwei Zählerstände vorhanden sind
    if (alleZaehlerstaende.length >= 2) {
      const ersterStand = alleZaehlerstaende[0];
      const letzterStand = alleZaehlerstaende[alleZaehlerstaende.length - 1];
      
      // Zeitdifferenz in Tagen berechnen
      const erstesDatum = new Date(ersterStand.datum);
      const letztesDatum = new Date(letzterStand.datum);
      const zeitdifferenzTage = (letztesDatum - erstesDatum) / (1000 * 60 * 60 * 24);
      
      if (zeitdifferenzTage > 0) {
        // Verbrauch pro Tag berechnen
        const verbrauchGesamt = letzterStand.stand - ersterStand.stand;
        const verbrauchProTag = verbrauchGesamt / zeitdifferenzTage;
        
        // Hochrechnung auf ein Jahr
        const hochrechnungJahr = verbrauchProTag * 365;
        
        // Wenn ein Vertrags-Jahresverbrauch vorhanden ist, diesen für die Prognose verwenden
        if (zaehler.vertrags_jahresverbrauch) {
          // Gewichteter Durchschnitt: 70% bisheriger Verbrauch, 30% Vertragswert
          prognose = (hochrechnungJahr * 0.7) + (zaehler.vertrags_jahresverbrauch * 0.3);
        } else {
          prognose = hochrechnungJahr;
        }
      }
    } else if (zaehler.vertrags_jahresverbrauch) {
      // Wenn nur ein oder kein Zählerstand vorhanden ist, aber ein Vertragswert existiert
      prognose = zaehler.vertrags_jahresverbrauch;
    }
    
    res.json({
      differenz,
      prognose,
      zaehlerstaende: alleZaehlerstaende
    });
  } catch (error) {
    console.error('Fehler bei der Analyse:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

export default router;