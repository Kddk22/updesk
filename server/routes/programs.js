import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// Get all programs
router.get('/', async (req, res) => {
  try {
    const programs = await db.allAsync(
      'SELECT * FROM programs ORDER BY position_y, position_x'
    );
    res.json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ error: 'Failed to fetch programs' });
  }
});

// Get single program
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const program = await db.getAsync('SELECT * FROM programs WHERE id = ?', [id]);
    
    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }
    
    res.json(program);
  } catch (error) {
    console.error('Error fetching program:', error);
    res.status(500).json({ error: 'Failed to fetch program' });
  }
});

// Create new program
router.post('/', async (req, res) => {
  try {
    const { name, url, icon, position_x, position_y } = req.body;
    
    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required' });
    }

    const result = await db.runAsync(
      `INSERT INTO programs (name, url, icon, position_x, position_y, updated_at) 
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        name,
        url,
        icon || '/icons/default-app.svg',
        position_x || 0,
        position_y || 0
      ]
    );

    const newProgram = await db.getAsync(
      'SELECT * FROM programs WHERE id = ?',
      [result.lastID]
    );

    res.status(201).json(newProgram);
  } catch (error) {
    console.error('Error creating program:', error);
    res.status(500).json({ error: 'Failed to create program' });
  }
});

// Update program
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, icon, position_x, position_y } = req.body;

    const existingProgram = await db.getAsync('SELECT * FROM programs WHERE id = ?', [id]);
    
    if (!existingProgram) {
      return res.status(404).json({ error: 'Program not found' });
    }

    await db.runAsync(
      `UPDATE programs 
       SET name = ?, url = ?, icon = ?, position_x = ?, position_y = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name || existingProgram.name,
        url || existingProgram.url,
        icon || existingProgram.icon,
        position_x !== undefined ? position_x : existingProgram.position_x,
        position_y !== undefined ? position_y : existingProgram.position_y,
        id
      ]
    );

    const updatedProgram = await db.getAsync('SELECT * FROM programs WHERE id = ?', [id]);
    res.json(updatedProgram);
  } catch (error) {
    console.error('Error updating program:', error);
    res.status(500).json({ error: 'Failed to update program' });
  }
});

// Delete program
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingProgram = await db.getAsync('SELECT * FROM programs WHERE id = ?', [id]);
    
    if (!existingProgram) {
      return res.status(404).json({ error: 'Program not found' });
    }

    await db.runAsync('DELETE FROM programs WHERE id = ?', [id]);
    res.json({ message: 'Program deleted successfully' });
  } catch (error) {
    console.error('Error deleting program:', error);
    res.status(500).json({ error: 'Failed to delete program' });
  }
});

// Update program positions (bulk update for drag & drop)
router.patch('/positions', async (req, res) => {
  try {
    const { programs } = req.body;
    
    if (!Array.isArray(programs)) {
      return res.status(400).json({ error: 'Programs array is required' });
    }

    // Update positions in a transaction-like manner
    for (const program of programs) {
      await db.runAsync(
        'UPDATE programs SET position_x = ?, position_y = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [program.position_x, program.position_y, program.id]
      );
    }

    res.json({ message: 'Positions updated successfully' });
  } catch (error) {
    console.error('Error updating positions:', error);
    res.status(500).json({ error: 'Failed to update positions' });
  }
});

export default router;