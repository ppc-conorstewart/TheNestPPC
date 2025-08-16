# The NEST App (Paloma Suite)

A full-stack oilfield operations management suite for wellhead support, training, document management, and field operations tracking.

---

## Features

- **Modern UI:** React (Vite), custom Tailwind theme, responsive layouts
- **Backend API:** Node.js + Express, fully RESTful, scalable
- **Database:** PostgreSQL (production), supports robust relational data
- **Authentication:** Discord OAuth (passport-discord)
- **Document Hub:** Drag-and-drop uploads, secure file storage, versioning
- **Employee Training:** Interactive checklists, scheduling, progress tracking
- **Field Operations:** Job Planner, asset management, work order processing
- **Reporting:** Real-time charts and analytics

---

## Quick Start (Local Development)

```sh
# 1. Clone the repository
git clone https://github.com/your-org/the-nest-app.git
cd the-nest-app

# 2. Install dependencies for both client and server
cd client && npm install
cd ../server && npm install

# 3. Set up local .env files in root and /server with your own secrets

# 4. Start both servers (in two terminals):
cd client && npm run dev
cd ../server && npm run dev

# Client: http://localhost:3000
# API:    http://localhost:3001 (default, check .env)
"# TheNestPPC" 
