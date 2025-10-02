# UpDesk - Virtual Desktop Launcher

![Docker Pulls](https://img.shields.io/docker/pulls/uptecps/updesk)
![Docker Image Size](https://img.shields.io/docker/image-size/uptecps/updesk)
![Docker Stars](https://img.shields.io/docker/stars/uptecps/updesk)

Modern Virtual Desktop Launcher with Ubuntu-style Taskbar, built with Vue.js and Node.js.

## 🚀 Quick Start

### Using Docker Compose (Recommended)

```bash
# Download docker-compose file
curl -O https://raw.githubusercontent.com/uptec-ps/updesk/main/docker-compose.hub.yml

# Download nginx config and SSL script
curl -O https://raw.githubusercontent.com/uptec-ps/updesk/main/nginx.conf
curl -O https://raw.githubusercontent.com/uptec-ps/updesk/main/generate-ssl-certs.sh
chmod +x generate-ssl-certs.sh

# Generate SSL certificates
./generate-ssl-certs.sh

# Start UpDesk
docker-compose -f docker-compose.hub.yml up -d
```

Access at:
- **HTTP:** http://localhost
- **HTTPS:** https://localhost

### Using Docker Run

```bash
# Run UpDesk backend only (Port 3001)
docker run -d \
  --name updesk \
  -p 3001:3001 \
  -v updesk_data:/app/data \
  -e NODE_ENV=production \
  uptecps/updesk:latest
```

Access at: http://localhost:3001

## 📋 Features

- 🖥️ **Virtual Desktop Environment** - Ubuntu-inspired desktop interface
- 📊 **Integrated Apps** - FlowUp, Port Documentation, UpNote, UpSum
- 🎨 **Customizable** - Themes, wallpapers, and layouts
- 🔒 **Secure** - HTTPS support with Nginx reverse proxy
- 💾 **Persistent Storage** - SQLite database with Docker volumes
- 🚀 **Production Ready** - Optimized multi-stage Docker build

## 🏗️ Architecture

- **Frontend:** Vue.js 3 with Vite
- **Backend:** Node.js with Express
- **Database:** SQLite
- **Reverse Proxy:** Nginx (optional)
- **Ports:** 3001 (backend), 80 (HTTP), 443 (HTTPS)

## 📦 Volumes

- `/app/data` - SQLite database (persistent)
- `/app/public/wallpapers` - Custom wallpapers (optional)
- `/app/public/icons` - Custom icons (optional)

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Node environment |
| `PORT` | `3001` | Backend port |

## 🔒 Production Deployment

For production with Let's Encrypt SSL:

```bash
# Get Let's Encrypt certificate
certbot certonly --standalone -d your-domain.com

# Copy certificates
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/key.pem

# Update nginx.conf with your domain
# Start with docker-compose
docker-compose -f docker-compose.hub.yml up -d
```

## 📊 Health Check

```bash
# Check application health
curl http://localhost:3001/api/health

# With HTTPS
curl -k https://localhost/health
```

## 🔄 Updates

```bash
# Pull latest version
docker-compose -f docker-compose.hub.yml pull

# Restart with new version
docker-compose -f docker-compose.hub.yml up -d
```

## 🐛 Troubleshooting

### Port already in use
```bash
# Check what's using the port
sudo lsof -i :80
sudo lsof -i :443

# Stop conflicting services
sudo systemctl stop apache2
sudo systemctl stop nginx
```

### View logs
```bash
# All logs
docker-compose -f docker-compose.hub.yml logs -f

# UpDesk only
docker logs -f updesk
```

### Reset database
```bash
# Backup first
docker cp updesk:/app/data/database.db ./backup.db

# Remove volume
docker-compose -f docker-compose.hub.yml down -v
docker-compose -f docker-compose.hub.yml up -d
```

## 📚 Documentation

- **GitHub:** https://github.com/uptec-ps/updesk
- **Installation Guide:** [INSTALL.md](https://github.com/uptec-ps/updesk/blob/main/INSTALL.md)
- **Docker Setup:** [DOCKER-SETUP.md](https://github.com/uptec-ps/updesk/blob/main/DOCKER-SETUP.md)

## 🏷️ Tags

- `latest` - Latest stable release
- `v1.x.x` - Specific version
- `main` - Latest from main branch

## 💡 Examples

### With custom wallpapers
```bash
mkdir wallpapers
cp my-image.jpg wallpapers/
docker run -d -p 3001:3001 \
  -v updesk_data:/app/data \
  -v ./wallpapers:/app/public/wallpapers:ro \
  uptecps/updesk:latest
```

### With environment variables
```bash
docker run -d -p 3001:3001 \
  -v updesk_data:/app/data \
  -e NODE_ENV=production \
  -e PORT=3001 \
  uptecps/updesk:latest
```

### Behind reverse proxy
```bash
# UpDesk backend
docker run -d --name updesk \
  --network my-network \
  -v updesk_data:/app/data \
  uptecps/updesk:latest

# Nginx proxy
docker run -d --name nginx \
  --network my-network \
  -p 80:80 -p 443:443 \
  -v ./nginx.conf:/etc/nginx/nginx.conf:ro \
  nginx:alpine
```

## 📄 License

See [LICENSE](https://github.com/uptec-ps/updesk/blob/main/LICENSE) file in the repository.

## 🤝 Contributing

Contributions welcome! See [GitHub repository](https://github.com/uptec-ps/updesk) for details.

---

**Built with ❤️ by UpTec**