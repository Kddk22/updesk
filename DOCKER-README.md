# UpDesk - Virtual Desktop Launcher

![Docker Pulls](https://img.shields.io/docker/pulls/uptecps/updesk)
![Docker Image Size](https://img.shields.io/docker/image-size/uptecps/updesk)
![Docker Stars](https://img.shields.io/docker/stars/uptecps/updesk)

Modern Virtual Desktop Launcher with Ubuntu-style Taskbar, built with Vue.js and Node.js.

## 🚀 Quick Start

### Using Docker Compose (Recommended)

```bash
# Clone repository or download files
git clone https://github.com/uptec-ps/updesk.git
cd updesk

# Generate SSL certificates
./generate-ssl-certs.sh

# Start UpDesk
docker-compose up -d
```

Access at:
- **HTTP:** http://localhost
- **HTTPS:** https://localhost

### Using Docker Run

```bash
# Run UpDesk backend only (Port 5002)
docker run -d \
  --name updesk-backend \
  -p 5002:5002 \
  -v updesk_data:/app/data \
  -e NODE_ENV=production \
  uptecps/updesk:latest
```

Access at: http://localhost:5002

## 📋 Features

- 🖥️ **Virtual Desktop Environment** - Ubuntu-inspired desktop interface
- 📊 **Integrated Apps** - FlowUp, Port Documentation, UpNote, UpSum
- 🎨 **Customizable** - Themes, wallpapers, and layouts
- 🔒 **Secure** - HTTPS support with Apache reverse proxy
- 💾 **Persistent Storage** - SQLite database with Docker volumes
- 🚀 **Production Ready** - Optimized multi-stage Docker build

## 🏗️ Architecture

- **Frontend:** Vue.js 3 with Vite
- **Backend:** Node.js with Express
- **Database:** SQLite
- **Reverse Proxy:** Apache HTTP Server 2.4
- **Ports:** 5002 (backend), 80 (HTTP), 443 (HTTPS)

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

# Update apache.conf with your domain
# Start with docker-compose
docker-compose up -d
```

## 📊 Health Check

```bash
# Check application health
curl http://localhost:5002/api/health

# With HTTPS
curl -k https://localhost/api/health
```

## 🔄 Updates

```bash
# Pull latest version
docker-compose pull

# Restart with new version
docker-compose up -d
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
docker-compose logs -f

# Backend only
docker logs -f updesk-backend

# Apache only
docker logs -f updesk-app
```

### Reset database
```bash
# Backup first
docker cp updesk-backend:/app/data/updesk.db ./backup.db

# Remove volume
docker-compose down -v
docker-compose up -d
```

## 📚 Documentation

- **GitHub:** https://github.com/uptec-ps/updesk
- **Installation Guide:** [INSTALL.md](https://github.com/uptec-ps/updesk/blob/main/INSTALL.md)
- **Migration Guide:** [MIGRATION-TO-APACHE.md](https://github.com/uptec-ps/updesk/blob/main/MIGRATION-TO-APACHE.md)

## 🏷️ Tags

- `latest` - Latest stable release (Apache-based)
- `v2.x.x` - Version 2.0+ with Apache
- `main` - Latest from main branch

## 💡 Examples

### With custom wallpapers
```bash
mkdir wallpapers
cp my-image.jpg wallpapers/
docker run -d -p 5002:5002 \
  -v updesk_data:/app/data \
  -v ./wallpapers:/app/public/wallpapers:ro \
  uptecps/updesk:latest
```

### With environment variables
```bash
docker run -d -p 5002:5002 \
  -v updesk_data:/app/data \
  -e NODE_ENV=production \
  -e PORT=5002 \
  uptecps/updesk:latest
```

### Behind reverse proxy
```bash
# UpDesk backend
docker run -d --name updesk-backend \
  --network my-network \
  -v updesk_data:/app/data \
  uptecps/updesk:latest

# Apache proxy
docker run -d --name updesk-app \
  --network my-network \
  -p 80:80 -p 443:443 \
  -v ./apache.conf:/usr/local/apache2/conf/extra/httpd-vhosts.conf:ro \
  -v ./apache-httpd.conf:/usr/local/apache2/conf/httpd.conf:ro \
  httpd:2.4-alpine
```

## 📄 License

See [LICENSE](https://github.com/uptec-ps/updesk/blob/main/LICENSE) file in the repository.

## 🤝 Contributing

Contributions welcome! See [GitHub repository](https://github.com/uptec-ps/updesk) for details.

---

**Built with ❤️ by UpTec**