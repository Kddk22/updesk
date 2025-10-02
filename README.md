# UpDesk - Virtual Desktop Launcher

A modern, Ubuntu-inspired virtual desktop application built with Vue.js 3 and deployed with Docker.

![Desktop](https://raw.githubusercontent.com/uptec-ps/updesk/refs/heads/main/doc/img/updesk-desktop.png)

## Features

- **Desktop Interface**: Ubuntu/Gnome-inspired design with top bar, dock, and grid layout
- **Program Management**: Full CRUD operations for desktop programs/links
- **Theme Switching**: Light and dark mode toggle
- **Customizable**: Wallpaper selection and dock configuration
- **Responsive**: Works on desktop and mobile devices
- **Production Ready**: Optimized Docker builds with multi-stage compilation

## Technology Stack

- **Frontend**: Vue.js 3 with Composition API
- **State Management**: Pinia
- **Backend**: Node.js/Express API
- **Database**: SQLite with automatic initialization
- **Deployment**: Docker with multi-stage builds
- **Reverse Proxy**: Nginx (optional)

## Quick Start

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd UpDesk
```

2. Start the application:
```bash
docker-compose up -d
```

3. Open your browser and navigate to `http://localhost:3000`

### Development Mode

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. In another terminal, start the API server:
```bash
npm run server
```

4. Open `http://localhost:5173` for the frontend

## Docker Configuration

### Production Build
The application uses a multi-stage Docker build:
- **Build Stage**: Compiles Vue.js application
- **Production Stage**: Serves with Nginx for optimal performance

### Environment Variables
- `NODE_ENV`: Set to 'production' for production builds
- `PORT`: API server port (default: 3001)

### Docker Compose Services
- **app**: Main application container
- **nginx**: Reverse proxy (optional, uncomment in docker-compose.yml)

## API Endpoints

### Programs
- `GET /api/programs` - Get all programs
- `POST /api/programs` - Create new program
- `PUT /api/programs/:id` - Update program
- `DELETE /api/programs/:id` - Delete program

### Settings
- `GET /api/settings` - Get all settings
- `PUT /api/settings/:key` - Update setting

## Database Schema

### Programs Table
```sql
CREATE TABLE programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT NOT NULL,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Settings Table
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Project Structure

```
UpDesk/
├── public/                 # Static assets
│   ├── icons/             # Application icons
│   └── wallpapers/        # Background images
├── src/                   # Vue.js source code
│   ├── components/        # Vue components
│   ├── stores/           # Pinia stores
│   ├── views/            # Page components
│   └── styles/           # CSS styles
├── server/               # Express API server
│   ├── index.js          # Server entry point
│   └── database.js       # Database configuration
├── Dockerfile            # Multi-stage Docker build
├── docker-compose.yml    # Docker Compose configuration
└── nginx.conf           # Nginx configuration
```

## Customization

### Adding New Programs
1. Use the "+" button in the desktop interface
2. Fill in program details (name, URL, icon)
3. Programs are automatically saved to the database

### Changing Themes
- Click the theme toggle in the top bar
- Themes are automatically saved to user preferences

### Custom Wallpapers
- Add images to `public/wallpapers/`
- Update the wallpaper list in the settings store

## Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker (for containerized deployment)

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run server` - Start API server
- `npm run lint` - Run ESLint

### Code Style
- ESLint configuration for Vue.js
- Prettier for code formatting
- Vue 3 Composition API with `<script setup>`

## Production Deployment

### Docker Deployment
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Deployment
```bash
# Build frontend
npm run build

# Start production server
NODE_ENV=production npm run server
```

## Health Checks

The application includes health check endpoints:
- `GET /health` - API health status
- Docker health checks configured for container monitoring

## Security Features

- CORS protection
- Security headers (helmet.js)
- Input validation
- SQL injection prevention with parameterized queries

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include browser version and steps to reproduce

## Roadmap

- [ ] Drag and drop program positioning
- [ ] Custom icon upload
- [ ] Multiple desktop workspaces
- [ ] Widget system
- [ ] Mobile app version
- [ ] Cloud synchronization
