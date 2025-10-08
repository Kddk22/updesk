import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { initDatabase } from './database.js';
import programsRouter from './routes/programs.js';
import settingsRouter from './routes/settings.js';
import zaehlerRouter from './routes/zaehler.js';
import zaehlerstaendeRouter from './routes/zaehlerstaende.js';
import transaktionenRouter from './routes/transaktionen.js';
import notizenRouter from './routes/notizen.js';
import iconsRouter from './routes/icons.js';
import updatesRouter from './routes/updates.js';
import dockerRouter from './routes/docker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5002;
const NODE_ENV = process.env.NODE_ENV || 'production';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression());

// CORS middleware
app.use(cors({
  origin: NODE_ENV === 'production' ? false : ['http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize database
await initDatabase();

// API routes
app.use('/api/programs', programsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/zaehler', zaehlerRouter);
app.use('/api/zaehlerstaende', zaehlerstaendeRouter);
app.use('/api/transaktionen', transaktionenRouter);
app.use('/api/notizen', notizenRouter);
app.use('/api/icons', iconsRouter);
app.use('/api/updates', updatesRouter);
app.use('/api/docker', dockerRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  
  // Serve Vue app for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: NODE_ENV === 'production' ? 'Internal Server Error' : err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} in ${NODE_ENV} mode`);
});