import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// Get all settings
router.get('/', async (req, res) => {
  try {
    const settings = await db.allAsync('SELECT * FROM settings');
    
    // Convert to key-value object
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    
    res.json(settingsObj);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Get single setting
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await db.getAsync('SELECT * FROM settings WHERE key = ?', [key]);
    
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    res.json({ [setting.key]: setting.value });
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

// Update or create setting
router.put('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }

    await db.runAsync(
      `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP`,
      [key, value, value]
    );

    res.json({ [key]: value });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

// Update multiple settings
router.patch('/', async (req, res) => {
  try {
    const settings = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Settings object is required' });
    }

    for (const [key, value] of Object.entries(settings)) {
      await db.runAsync(
        `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP`,
        [key, value, value]
      );
    }

    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Delete setting
router.delete('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    
    const existingSetting = await db.getAsync('SELECT * FROM settings WHERE key = ?', [key]);
    
    if (!existingSetting) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    await db.runAsync('DELETE FROM settings WHERE key = ?', [key]);
    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Error deleting setting:', error);
    res.status(500).json({ error: 'Failed to delete setting' });
  }
});

export default router;