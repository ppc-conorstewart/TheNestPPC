# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development Setup
```bash
# Install dependencies separately (recommended due to sqlite3 build issues)
cd client && npm install
cd ../server && npm install

# Note: Root npm install may fail due to sqlite3/Python 3.13 compatibility
# This is not critical if subdirectories are installed successfully
```

### Development Servers
```bash
# Start development servers (run in separate terminals)
cd client && npm run dev    # Client on http://localhost:3000 (uses CRACO)
cd server && node index.js  # API on http://localhost:3001

# Alternative: Start both from client directory
cd client && npm run start-all
```

### Build & Production
```bash
# Build client for production
cd client && npm run build   # Uses CI=false to ignore warnings

# Build from root (if dependencies resolved)
npm run build

# Start production server
npm start  # Serves client build with 'serve' package
```

### Testing
```bash
# Run client tests
cd client && npm test

# Run server tests
cd server && npm test  # Uses Node's built-in test runner
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 with CRACO (webpack customization)
- **Backend**: Express.js REST API
- **Database**: PostgreSQL "The NEST"
- **Authentication**: Discord OAuth2 via Passport.js
- **File Storage**: Local filesystem (`server/uploads/`)

### Frontend Architecture (`/client`)
- **Build Tool**: CRACO disables ESLint plugin, configures proxy
- **Routing**: React Router v6
- **State**: React Context API (`context/JobContext.js`)
- **Styling**: Tailwind CSS v4 with PostCSS
- **Major Libraries**:
  - FullCalendar (scheduling)
  - Chart.js/Recharts (analytics)
  - Leaflet (maps)
  - Konva (canvas drawing)
  - React Beautiful DnD (drag-drop)
- **API Proxy**: Routes `/api/*` and `/auth/*` to localhost:3001

### Backend Architecture (`/server`)
- **Entry**: `index.js` configures Express middleware stack
- **Database Pool**: `db.js` manages PostgreSQL connections
- **Sessions**: express-session with Discord OAuth
- **File Uploads**: Multer with 50MB limit
- **CORS**: Dynamic validation with localhost/Railway support
- **Static Assets**: Customer logos at `server/public/assets/logos/`

### Environment Configuration

Create `.env` in server directory:

```env
# Database Option 1: Connection String
DATABASE_URL=postgresql://user:pass@host/db

# Database Option 2: Individual Parameters
PGUSER=postgres
PGHOST=localhost
PGDATABASE=The NEST
PGPASSWORD=password
PGPORT=5432
PGSSL=false

# Authentication
SESSION_SECRET=your-secret-key
DISCORD_CLIENT_ID=your-discord-id
DISCORD_CLIENT_SECRET=your-discord-secret

# URLs
FRONTEND_URL=http://localhost:3000
BOT_SERVICE_URL=http://localhost:3020  # Optional Discord bot
NEST_BOT_KEY=Paloma2025*

# Optional Features
ADMIN_IMPORT_KEY=key  # Enables /api/admin routes
```

### API Routes

All routes prefixed with `/api/`:

**Core Operations:**
- `/api/assets` - Asset inventory management
- `/api/transfers` - Asset transfer workflows
- `/api/jobs` - Job planning and scheduling
- `/api/customers` - Customer management
- `/api/workorders` - Work order generation (PDF)

**MFV System:**
- `/api/mfv` - MFV pad tracking
- `/api/master` - Master assembly assignments

**Documentation:**
- `/api/documents` - Document hub
- `/api/field-docs` - Field documentation
- `/api/torque-manuals` - Torque & service manuals
- `/api/instructional-videos-hub` - Training videos

**Supporting:**
- `/api/sourcing` - Sourcing data
- `/api/activity` - Activity logging
- `/api/service-equipment` - Equipment tracking
- `/api/projects` - Project management
- `/api/jobs-schedule` - FlyIQ scheduling

**Discord Integration:**
- `/api/discord/members` - Guild member list
- `/api/discord/channels` - Channel list
- `/api/discord/announce` - Send announcements
- `/api/hq/action-items` - Action items with DMs

### High-Level Request Flow

1. **Client Request**: React app makes API call to `/api/*`
2. **Proxy Forward**: CRACO dev server proxies to Express (port 3001)
3. **Middleware Stack**: CORS → Session → Passport → Route Handler
4. **Database Query**: Handler uses PostgreSQL connection pool
5. **Response**: JSON data or file stream returned

### Authentication Flow

1. User clicks Discord login → `/auth/discord`
2. Passport initiates OAuth with Discord
3. Callback to `/auth/discord/callback` creates session
4. User data accessible via `req.user` and `/api/user`
5. Protected routes check `req.isAuthenticated()`

### File Upload System

- **Multer Configuration**: 50MB limit, various file types
- **Storage Path**: `server/uploads/` with subdirectories
- **Static Serving**: Files available at `/uploads/*` URLs
- **Document Categories**: Organized by type in subdirectories

### Discord Bot Integration

- Optional bot service for enhanced features
- Main API proxies bot requests
- Fallback to REST API if bot unavailable
- Action items send DMs with acknowledgment buttons

### Critical Implementation Notes

- **Logo Path**: Hardcoded at `server/public/assets/logos/` (index.js:81)
- **PDF Templates**: Work orders use pdf-lib with templates in `server/templates/`
- **Action Items**: Currently stored in-memory (not persisted to database)
- **Production Mode**: Serves React build from `client/build/` when NODE_ENV=production
- **Railway Deploy**: Auto-configures CORS for Railway domains
- **Legacy Code**: Quiz endpoints `/api/questions` and `/api/module2` serve training data

### Known Issues

- **sqlite3 Build**: May fail with Python 3.13+ due to missing distutils
- **Canvas Module**: Windows ARM64 may have resource lock issues
- **Deprecation Warnings**: Several dependencies need updates (see npm warnings)

### Database Schema Overview

PostgreSQL database "The NEST" includes tables for:
- **Core Entities**: assets, customers, jobs, documents
- **Relationships**: transfers, assignments, activity_log
- **Specialized**: mfv_pads, workorders, sourcing_data
- **Master Assemblies**: Missiles, Dogbones, Zippers, Flowcrosses tracking