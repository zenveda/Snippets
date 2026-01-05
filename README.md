# Snippets

A lightweight content reuse feature for sales reps. Create, manage, and insert short, reusable blocks of text into email composition fields using keyboard shortcuts or inline commands.

## Quick Start

1. Install all dependencies:
```bash
npm run install-all
```

2. Start both server and client:
```bash
npm run dev
```

3. Open http://localhost:5173 in your browser

## Default Users

The application comes with demo users:
- **Admin**: admin@example.com / password: `admin123`
- **User**: user@example.com / password: `user123`
- **Manager**: manager@example.com / password: `manager123`

## Features

- ✅ Create, edit, and manage snippets
- ✅ Inline `/` trigger for snippet insertion
- ✅ Keyboard shortcut (Cmd+Shift+S / Ctrl+Shift+S)
- ✅ Snippet picker button
- ✅ Versioning system
- ✅ Lifecycle states (Draft, Published, Deprecated, Archived)
- ✅ Scope-based permissions (Personal, Team, Org)
- ✅ Categories and tags
- ✅ Search functionality
- ✅ Usage tracking

## Project Structure

```
Snippets/
├── server/          # Express API server
│   ├── db/         # Database setup
│   ├── models/     # Data models
│   ├── routes/     # API routes
│   └── middleware/ # Auth middleware
└── client/         # React frontend
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── utils/
```

## API Endpoints

- `POST /api/auth/login` - Login
- `GET /api/snippets` - List snippets (with filters)
- `POST /api/snippets` - Create snippet
- `GET /api/snippets/:id` - Get snippet
- `PUT /api/snippets/:id` - Update snippet
- `DELETE /api/snippets/:id` - Delete snippet
- `POST /api/snippets/:id/insert` - Track snippet insertion
- `GET /api/categories` - List categories

## Tech Stack

- **Backend**: Node.js, Express, SQLite (better-sqlite3)
- **Frontend**: React, Vite
- **Authentication**: JWT tokens
