# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
# Install dependencies for both client and server
cd client && npm install
cd ../server && npm install

# Start development servers (run in separate terminals)
cd client && npm start    # Client on http://localhost:3000
cd server && node index.js # API on http://localhost:3001

# Alternative: Start both from client directory
cd client && npm run start-all
```

### Build
```bash
# Build client for production
cd client && npm run build

# Build from root
npm run build
```

### Testing
```bash
# Run client tests
cd client && npm test
```

## Architecture Overview

### Full-Stack Application Structure
- **Frontend**: React 18 app using Create React App with CRACO configuration
- **Backend**: Express.js REST API server
- **Database**: PostgreSQL with centralized connection pool (`server/db.js`)
- **Authentication**: Discord OAuth via Passport.js
- **File Storage**: Local filesystem with uploads handled via Multer

### Key Architectural Patterns

#### Frontend (`/client`)
- **Routing**: React Router v6 with protected routes pattern
- **State Management**: React Context API (see `context/JobContext.js`)
- **Styling**: Tailwind CSS v4 with custom glass morphism theme
- **Component Organization**:
  - Page components in `pages/`
  - Reusable components grouped by feature in `components/`
  - UI primitives in `components/ui/`
  - Shared templates in `templates/`
- **API Communication**: Axios with proxy to backend (configured in package.json)

#### Backend (`/server`)
- **Entry Point**: `server/index.js` sets up Express app with middleware
- **Database**: Centralized PostgreSQL pool in `db.js` using environment variables
- **Routes**: RESTful endpoints organized by resource in `routes/`
- **Services**: Business logic separated in `services/` directory
- **Authentication Flow**:
  1. Discord OAuth strategy configured in `auth/discordStrategy.js`
  2. Session management with express-session
  3. Protected endpoints check session authentication

### Environment Configuration
Required environment variables (create `.env` in server directory):
- `DATABASE_URL` or individual PG connection params (`PGUSER`, `PGHOST`, `PGDATABASE`, `PGPASSWORD`, `PGPORT`)
- `SESSION_SECRET` for Express sessions
- `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` for OAuth
- `FRONTEND_URL` for CORS configuration

### Major Features & Their Implementation

#### Asset Management System
- Database tables for assets, transfers, activity logs
- Physical transfer workflow with QR codes and signatures
- Master assemblies tracking (Missiles, Dogbones, Zippers, Flowcrosses)

#### Job Planning & Operations
- Job scheduling with calendar and table views
- MFV (Multi-Flow Valve) tracking and reporting
- Work order generation and management
- Site measurements canvas tool

#### Document Management
- File upload/download with versioning
- Category-based organization
- Drag-and-drop interface

#### Training & Competency
- Interactive training modules
- Competency matrix tracking
- Employee visit logging

### Critical File Paths
- Hardcoded logo path in `server/index.js:45`: Update `LOGOS_DIR` for deployment
- Upload directory configured in `server/utils/uploads.js`

### API Route Structure
All API routes prefixed with `/api/`:
- `/api/assets` - Asset CRUD operations
- `/api/jobs` - Job planning and scheduling
- `/api/customers` - Customer management
- `/api/documents` - Document hub operations
- `/api/workorders` - Work order processing
- `/api/transfers` - Asset transfer management
- `/api/mfv-pads` - MFV pad tracking
- `/api/master-assignments` - Master assembly assignments

### Database Schema
PostgreSQL database "The NEST" with tables for:
- Core entities: assets, customers, jobs, documents
- Relationships: transfers, assignments, activity_log
- Specialized: mfv_pads, workorders, sourcing_data

### Security Considerations
- CORS configured for specific origins
- Session-based authentication with Discord OAuth
- File uploads restricted by type and size
- SQL injection prevention via parameterized queries