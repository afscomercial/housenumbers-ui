# Railway Deployment Guide

This guide explains how to deploy the Housenumbers UI (Remix app) to Railway.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Push your code to a GitHub repository
3. **API Deployed**: Ensure the housenumbers-api is already deployed and accessible

## Deployment Steps

### 1. Connect to Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository containing the Remix UI code

### 2. Configure Environment Variables

In the Railway dashboard, set these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `SESSION_SECRET` | `your-super-secure-session-secret-key-here` | Secret for session encryption |
| `API_BASE_URL` | `https://your-api-domain.railway.app` | URL of your deployed API |
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `3000` | Port for the application (Railway sets this automatically) |

**Important**: Replace `https://your-api-domain.railway.app` with the actual URL of your deployed housenumbers-api.

### 3. Deploy

1. Railway will automatically detect the `Dockerfile` and `railway.toml`
2. The build process will:
   - Install dependencies
   - Build the Remix application
   - Create a production-ready container
3. The app will be deployed and accessible at your Railway-provided URL

### 4. Custom Domain (Optional)

1. In the Railway dashboard, go to your project
2. Click on "Settings" → "Domains"
3. Add your custom domain and follow the DNS configuration instructions

## Configuration Files

The deployment uses these configuration files:

### Dockerfile
- Multi-stage build for optimal image size
- Node.js 20 Alpine base image
- Non-root user for security
- Production-optimized setup

### railway.toml
- Specifies Dockerfile build strategy
- Configures restart policy
- Sets start command

### .dockerignore
- Excludes unnecessary files from Docker build
- Reduces image size and build time

## Environment Variables Reference

```bash
# Required
SESSION_SECRET=your-super-secure-session-secret-key-here
API_BASE_URL=https://your-api-domain.railway.app

# Automatically set by Railway
NODE_ENV=production
PORT=3000
```

## Build Process

The Dockerfile performs these steps:

1. **Base Image**: Uses Node.js 20 Alpine for small footprint
2. **Dependencies**: Installs only production dependencies
3. **Build**: Runs `npm run build` to create optimized Remix build
4. **Security**: Creates non-root user for runtime
5. **Startup**: Starts with `npm start` command

## Post-Deployment

After successful deployment:

1. **Test the Application**: Visit your Railway URL
2. **Verify API Connection**: Ensure the app can connect to your API
3. **Test Authentication**: Login with default credentials (admin/password)
4. **Create Summary**: Test the AI summarization functionality

## Troubleshooting

### Common Issues

**Build Failures**:
- Check that all dependencies are listed in `package.json`
- Ensure Node.js version compatibility (>=20.0.0)
- Verify Dockerfile syntax

**Runtime Errors**:
- Check environment variables are set correctly
- Verify API_BASE_URL points to your deployed API
- Check Railway logs for detailed error messages

**API Connection Issues**:
- Ensure API is deployed and accessible
- Verify CORS settings on the API allow your domain
- Check network connectivity between services

### Railway CLI (Optional)

Install Railway CLI for easier management:

```bash
# Install
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs

# Set environment variables
railway variables set SESSION_SECRET=your-secret-here
```

## Security Considerations

1. **Environment Variables**: Never commit secrets to version control
2. **Session Secret**: Use a strong, random session secret
3. **HTTPS**: Railway provides HTTPS by default
4. **Non-root User**: Dockerfile runs as non-root user for security

## Performance Optimization

1. **Docker**: Multi-stage build for smaller images
2. **Dependencies**: Only production dependencies in final image
3. **Caching**: Docker layer caching for faster builds
4. **CDN**: Consider using Railway's edge caching features

## Support

For issues with:
- **Railway Platform**: Check [Railway Docs](https://docs.railway.app)
- **This Application**: Check repository issues or documentation
- **Remix Framework**: Check [Remix Docs](https://remix.run/docs)

## Additional Notes

- Railway automatically detects the port from your application
- The application will restart automatically if it crashes
- Railway provides automatic HTTPS certificates
- Monitor resource usage in the Railway dashboard