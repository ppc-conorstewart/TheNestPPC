# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
The NEST App (Paloma Suite) is a full-stack oilfield operations management system for wellhead support, training, document management, and field operations tracking.

## Tech Stack
- **Frontend**: React 18 with CRACO configuration, Tailwind CSS 4, React Router v6
- **Backend**: Node.js + Express 5, PostgreSQL database
- **Authentication**: Discord OAuth (passport-discord)
- **Build Tools**: CRACO for client, standard Node.js for server
- **UI Libraries**: Chart.js, Leaflet, Swiper, Lottie animations, React Icons

## Development Commands

### Client (React App)
```bash
cd client
npm install                    # Install dependencies
npm start                      # Start dev server (port 3000) - uses CRACO with legacy OpenSSL
npm run build                  # Production build with CRACO
npm test                       # Run tests with CRACO
npm run start-all              # Start both client and server concurrently
```

### Server (Express API)
```bash
cd server
npm install                    # Install dependencies
node index.js                  # Start server (port 3001)
```

### Root-level Commands
```bash
npm run build                  # Builds client (cd client && npm install && npm run build)
npm start                      # Starts production server (node server.js)
```

## Architecture

### Client Structure
- `/client/src/App.jsx` - Main router with protected routes
- `/client/src/pages/` - Page components (FlyHQ, JobPlanner, TrainingHub, etc.)
- `/client/src/components/` - Reusable components including Layout and ProtectedRoute
- `/client/src/context/` - React contexts (JobContext)
- `/client/src/utils/` - Utility functions
- `/client/craco.config.js` - CRACO configuration disabling ESLint plugin, proxy setup

### Server Structure
- `/server/index.js` - Express app entry, middleware setup, route mounting
- `/server/db.js` - Centralized PostgreSQL connection pool
- `/server/routes/` - API endpoints (jobs, assets, customers, documents, etc.)
- `/server/auth/` - Discord OAuth strategy
- `/server/config/` - Configuration (uses environment variables)
- `/server/utils/` - Upload handling and utilities

### Database
- PostgreSQL with connection pooling
- Environment-based configuration (DATABASE_URL or individual PG* variables)
- SSL support configurable via PGSSL environment variable

## Key Features & Routes
- **Job Management**: JobPlanner, JobMap
- **Documentation**: DocumentationHub, MFVDocumentation, field docs
- **Training**: InteractiveTraining, TrainingHub
- **Customer Management**: CustomerHub
- **Equipment**: ServiceEquipment, work orders
- **Field Operations**: MFVField, MFVSummary, ValveReports
- **Projects & Assets**: Projects page, asset management

## Environment Variables
Required in `.env` files:
- `DATABASE_URL` or `PGUSER`, `PGHOST`, `PGDATABASE`, `PGPASSWORD`, `PGPORT`
- `SESSION_SECRET` for Express sessions
- `FRONTEND_URL` for CORS configuration
- Discord OAuth credentials

## Important Notes
- Client uses CRACO to override Create React App webpack config
- ESLint webpack plugin is disabled in CRACO config
- Server serves static files from `/uploads` directory
- CORS configured for localhost:3000 and FRONTEND_URL
- Proxy configuration in CRACO routes `/api` and `/auth` to server port 3001
- Uses legacy OpenSSL provider for client development (`NODE_OPTIONS=--openssl-legacy-provider`)