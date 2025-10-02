import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// GET /api/icons - Get all available icons
router.get('/', async (req, res) => {
  try {
    const iconsPath = path.join(__dirname, '../../public/icons');
    
    // Read all files from the icons directory
    const files = await fs.readdir(iconsPath);
    
    // Filter for image files (svg, png, jpg, jpeg)
    const iconFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.svg', '.png', '.jpg', '.jpeg'].includes(ext);
    });
    
    // Map to icon objects with name and path
    const icons = iconFiles.map(file => {
      const nameWithoutExt = path.basename(file, path.extname(file));
      // Capitalize first letter and format name
      const formattedName = nameWithoutExt
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      return {
        name: formattedName,
        filename: file,
        path: `/icons/${file}`
      };
    });
    
    // Sort alphabetically by name
    icons.sort((a, b) => a.name.localeCompare(b.name));
    
    res.json(icons);
  } catch (error) {
    console.error('Error reading icons directory:', error);
    res.status(500).json({ error: 'Failed to load icons' });
  }
});

export default router;