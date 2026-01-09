# Deployment Guide for Whogohost

This guide will walk you through deploying the Naira Cardigans e-commerce platform to Whogohost.

## Prerequisites

1. Whogohost hosting account with Node.js support
2. MongoDB Atlas account (free tier available)
3. Cloudinary account (free tier available)
4. Paystack account
5. Domain name configured

## Step-by-Step Deployment

### 1. Prepare MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist all IP addresses (0.0.0.0/0) for production
5. Get your connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/naira-cardigans
   ```

### 2. Configure Cloudinary

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your credentials from the dashboard:
   - Cloud Name
   - API Key
   - API Secret

### 3. Configure Paystack

1. Sign up at [Paystack](https://paystack.com/)
2. Complete business verification
3. Get your API keys from Settings → API Keys & Webhooks
4. Note: Use test keys for testing, live keys for production

### 4. Build the Application Locally

```bash
# Navigate to client directory
cd client

# Build the React app
npm run build

# This creates a 'dist' folder with production files
cd ..
```

### 5. Prepare Files for Upload

Create a production-ready package by excluding development files:

**Files to upload:**
- `server/` folder (all files)
- `client/dist/` folder (built React app)
- `package.json`
- `.env` (with production values)
- `README.md`

**Files to exclude:**
- `node_modules/`
- `client/node_modules/`
- `client/src/`
- `.git/`
- Development files

### 6. Upload to Whogohost

#### Option A: Using cPanel File Manager

1. Log in to your Whogohost cPanel
2. Navigate to File Manager
3. Go to `public_html` or your app directory
4. Upload the files (you may need to zip them first)
5. Extract the files

#### Option B: Using FTP

1. Use FileZilla or any FTP client
2. Connect using credentials from Whogohost
3. Upload all files to the appropriate directory

### 7. Install Dependencies via SSH

1. Access SSH terminal in cPanel or use SSH client
2. Navigate to your application directory:
   ```bash
   cd public_html/your-app-folder
   ```

3. Install dependencies:
   ```bash
   npm install --production
   ```

### 8. Configure Environment Variables

Create `.env` file in the root directory with production values:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/naira-cardigans

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Paystack (use live keys for production)
PAYSTACK_SECRET_KEY=sk_live_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_public_key

# Server
PORT=5000
NODE_ENV=production

# Frontend URL (your domain)
CLIENT_URL=https://yourdomain.com
```

### 9. Setup Node.js Application in cPanel

1. In cPanel, find "Setup Node.js App"
2. Click "Create Application"
3. Configure:
   - **Node.js version:** 18.x or higher
   - **Application mode:** Production
   - **Application root:** Path to your app folder
   - **Application URL:** Your domain or subdomain
   - **Application startup file:** `server/index.js`
   - **Environment variables:** Add all from .env

4. Click "Create"

### 10. Configure Static Files

Since we're serving React from the backend, update `server/index.js` to serve static files:

Add this before your routes:

```javascript
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// ... your API routes ...

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
```

### 11. Configure Paystack Webhook

1. Go to Paystack Dashboard
2. Navigate to Settings → Webhooks
3. Add webhook URL: `https://yourdomain.com/api/webhooks/paystack`
4. Save and copy the webhook secret
5. Ensure it matches `PAYSTACK_SECRET_KEY` in your `.env`

### 12. Test the Deployment

1. Visit your domain
2. Check if the admin dashboard loads
3. Test creating a product
4. Test uploading images
5. Test setting shipping rates
6. Verify analytics dashboard

### 13. SSL Certificate

1. In cPanel, go to "SSL/TLS Status"
2. Enable AutoSSL for your domain
3. Or install Let's Encrypt certificate
4. Ensure your site runs on HTTPS

## Troubleshooting

### Application won't start
- Check Node.js version (should be 18+)
- Verify `server/index.js` path is correct
- Check error logs in cPanel

### Database connection fails
- Verify MongoDB Atlas connection string
- Ensure IP whitelist includes 0.0.0.0/0
- Check database user credentials

### Images won't upload
- Verify Cloudinary credentials
- Check file size limits
- Ensure proper permissions

### Webhook not working
- Verify webhook URL is accessible
- Check Paystack webhook secret
- Review webhook logs in Paystack dashboard

## Monitoring

1. **Application Logs:** Check in cPanel Node.js App section
2. **MongoDB Logs:** Check in Atlas dashboard
3. **Paystack Logs:** Check in Paystack dashboard

## Backup Strategy

1. **Database:** Use MongoDB Atlas automated backups
2. **Images:** Cloudinary stores all images
3. **Code:** Keep Git repository updated

## Performance Optimization

1. Enable gzip compression
2. Use CDN for static assets
3. Implement caching headers
4. Monitor MongoDB performance
5. Optimize images in Cloudinary

## Security Checklist

- ✅ HTTPS enabled
- ✅ Environment variables secured
- ✅ MongoDB authentication enabled
- ✅ Paystack webhook signature validation
- ✅ CORS properly configured
- ✅ Rate limiting implemented (recommended)
- ✅ Input validation with Zod

## Support

For Whogohost-specific issues:
- Contact Whogohost support
- Check their Node.js documentation

For application issues:
- Review application logs
- Check MongoDB Atlas logs
- Verify API credentials

