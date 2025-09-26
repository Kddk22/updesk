# UpDesk Deployment Guide

## Quick Start

### Option 1: Docker Deployment (Recommended)

1. **Prerequisites**: Docker and Docker Compose installed
2. **Start the application**:
   ```bash
   docker-compose up -d
   ```
3. **Access**: Open `http://localhost:3000` in your browser

### Option 2: Development Mode

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development servers**:
   ```bash
   # Terminal 1: Start API server
   npm run server
   
   # Terminal 2: Start frontend dev server
   npm run dev
   ```

3. **Access**: Open `http://localhost:5173` in your browser

### Option 3: Production Build

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   NODE_ENV=production npm run server
   ```

3. **Access**: Open `http://localhost:3001` in your browser

## Application Features

✅ **Complete Virtual Desktop Interface**
- Ubuntu/Gnome-inspired design
- Top bar with system controls
- Dock with program shortcuts
- Grid-based program layout

✅ **Program Management**
- Add, edit, delete programs
- Custom icons and URLs
- Drag-and-drop positioning
- Persistent storage in SQLite

✅ **Theme System**
- Light and dark mode toggle
- Customizable wallpapers
- Responsive design

✅ **Production Ready**
- Multi-stage Docker builds
- Optimized asset delivery
- Health checks and monitoring
- Security headers and CORS protection

## File Structure

```
UpDesk/
├── 📁 public/
│   ├── 📁 icons/          # Application icons (SVG)
│   ├── 📁 wallpapers/     # Background images
│   └── favicon.svg        # Site favicon
├── 📁 src/
│   ├── 📁 components/     # Vue components
│   ├── 📁 stores/         # Pinia state management
│   ├── 📁 views/          # Page components
│   └── 📁 styles/         # CSS styles
├── 📁 server/
│   ├── index.js           # Express API server
│   └── database.js        # SQLite database setup
├── 🐳 Dockerfile          # Multi-stage Docker build
├── 🐳 docker-compose.yml  # Container orchestration
├── 🌐 nginx.conf          # Reverse proxy config
└── 📚 README.md           # Documentation
```

## Database Schema

The application automatically creates and initializes a SQLite database with:

### Programs Table
- `id` - Auto-increment primary key
- `name` - Program display name
- `url` - Target URL/link
- `icon` - Icon file path
- `position_x`, `position_y` - Desktop position
- `created_at` - Timestamp

### Settings Table
- `key` - Setting identifier
- `value` - Setting value (JSON)
- `updated_at` - Timestamp

## API Endpoints

### Programs API
- `GET /api/programs` - List all programs
- `POST /api/programs` - Create new program
- `PUT /api/programs/:id` - Update program
- `DELETE /api/programs/:id` - Delete program

### Settings API
- `GET /api/settings` - Get all settings
- `PUT /api/settings/:key` - Update specific setting

### System
- `GET /health` - Health check endpoint

## Environment Configuration

Copy `.env.example` to `.env` and customize:

```env
NODE_ENV=production
PORT=3001
DB_PATH=./data/updesk.db
LOG_LEVEL=info
```

## Docker Configuration

### Services
- **app**: Main application (Vue.js + Express)
- **nginx**: Reverse proxy (optional)

### Volumes
- `updesk_data`: Persistent database storage

### Ports
- `3000`: Application (via nginx)
- `3001`: Direct API access

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in docker-compose.yml
2. **Database permissions**: Ensure data directory is writable
3. **Build failures**: Clear node_modules and reinstall

### Logs
```bash
# Docker logs
docker-compose logs -f

# Development logs
npm run server  # API server logs
npm run dev     # Frontend dev server logs
```

## Security Considerations

✅ **Implemented Security Features**:
- CORS protection
- Security headers (Helmet.js)
- Input validation
- SQL injection prevention
- Health check endpoints

🔒 **Production Recommendations**:
- Use HTTPS in production
- Set secure session secrets
- Implement rate limiting
- Regular security updates

## Performance Optimization

✅ **Built-in Optimizations**:
- Multi-stage Docker builds
- Asset minification and compression
- Efficient Vue.js bundle splitting
- SQLite database optimization

## Monitoring

The application includes:
- Health check endpoints
- Docker health checks
- Structured logging
- Error handling and reporting

## Backup and Recovery

### Database Backup
```bash
# Copy SQLite database
docker cp updesk_app_1:/app/data/updesk.db ./backup.db
```

### Full Application Backup
```bash
# Backup volumes
docker-compose down
docker run --rm -v updesk_data:/data -v $(pwd):/backup alpine tar czf /backup/updesk-backup.tar.gz /data
```

## Scaling Considerations

For high-traffic deployments:
1. Use PostgreSQL instead of SQLite
2. Implement Redis for session storage
3. Add load balancer configuration
4. Consider CDN for static assets

---

**Status**: ✅ Production Ready
**Last Updated**: $(date)
**Version**: 1.0.0