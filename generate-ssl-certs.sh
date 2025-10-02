#!/bin/bash

# Script to generate self-signed SSL certificates for UpDesk
# For production, replace these with proper certificates from Let's Encrypt or a CA

SSL_DIR="./ssl"
DAYS_VALID=365

echo "Generating self-signed SSL certificates for UpDesk..."

# Create SSL directory if it doesn't exist
mkdir -p "$SSL_DIR"

# Generate private key and certificate
openssl req -x509 -nodes -days $DAYS_VALID -newkey rsa:2048 \
    -keyout "$SSL_DIR/key.pem" \
    -out "$SSL_DIR/cert.pem" \
    -subj "/C=DE/ST=State/L=City/O=UpDesk/OU=Development/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1"

# Set appropriate permissions
chmod 600 "$SSL_DIR/key.pem"
chmod 644 "$SSL_DIR/cert.pem"

echo "✓ SSL certificates generated successfully!"
echo "  Certificate: $SSL_DIR/cert.pem"
echo "  Private Key: $SSL_DIR/key.pem"
echo ""
echo "   Note: These are self-signed certificates for development/testing."
echo "   Browsers will show a security warning. For production, use proper certificates."
echo ""
echo "To start the application with HTTPS support:"
echo "  docker-compose up -d"
echo ""
echo "Access the application at:"
echo "  HTTP:  http://localhost"
echo "  HTTPS: https://localhost"