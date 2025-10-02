# SSL Certificates

This directory contains SSL certificates for HTTPS support.

## Development/Testing

For development and testing, self-signed certificates are generated using the `generate-ssl-certs.sh` script in the root directory.

```bash
./generate-ssl-certs.sh
```

**Note:** Browsers will show a security warning for self-signed certificates. This is normal for development.

## Production

For production environments, replace the self-signed certificates with proper certificates from:

1. **Let's Encrypt** (Free, automated)
   - Use Certbot or similar tools
   - Recommended for most use cases

2. **Commercial Certificate Authority**
   - Purchase from providers like DigiCert, Sectigo, etc.
   - Required for some enterprise environments

### Installing Production Certificates

1. Place your certificate in `ssl/cert.pem`
2. Place your private key in `ssl/key.pem`
3. Ensure proper permissions:
   ```bash
   chmod 600 ssl/key.pem
   chmod 644 ssl/cert.pem
   ```
4. Restart the Docker containers:
   ```bash
   docker-compose restart nginx
   ```

## Certificate Files

- `cert.pem` - SSL certificate (public)
- `key.pem` - Private key (keep secure!)

**Important:** Never commit `key.pem` to version control!