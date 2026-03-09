# 🗳️ Online Voting System

A full-stack online voting system built with **React** (frontend), **Flask** (backend), and **PostgreSQL** (database).

## Features

- ✅ User registration & login (JWT-secured)
- ✅ One vote per user (enforced at DB + API level)
- ✅ Admin panel: add/edit/delete candidates, control election
- ✅ Real-time vote tally & results chart
- ✅ Password hashing (bcrypt)
- ✅ Admin can open/close voting and show/hide results

---

## Project Structure

```
voting-system/
├── backend/          # Flask API
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── seed.py
│   │   └── routes/
│   │       ├── auth.py
│   │       ├── candidates.py
│   │       ├── votes.py
│   │       └── admin.py
│   ├── run.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/         # React + Vite
    ├── src/
    │   ├── App.jsx
    │   ├── api/axios.js
    │   ├── context/AuthContext.jsx
    │   ├── components/Navbar.jsx
    │   └── pages/
    │       ├── LoginPage.jsx
    │       ├── RegisterPage.jsx
    │       ├── VotePage.jsx
    │       ├── ResultsPage.jsx
    │       └── AdminPage.jsx
    ├── index.html
    └── package.json
```

---

## Prerequisites

- Python 3.10+
- Node.js 18+ & npm
- PostgreSQL 14+

---

## Backend Setup

### 1. Create PostgreSQL database

```sql
CREATE DATABASE voting_db;
```

### 2. Configure environment

```bash
cd voting-system/backend
copy .env.example .env
```

Edit `.env`:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/voting_db
JWT_SECRET_KEY=your-super-secret-key-change-this
ADMIN_EMAIL=admin@voting.com
ADMIN_PASSWORD=Admin@1234
```

### 3. Install dependencies & run

```bash
cd voting-system/backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt

# Seed database (creates admin user + default election)
python -m app.seed

# Start server
python run.py
```

Backend runs at: **http://localhost:5000**

---

## Frontend Setup

```bash
cd voting-system/frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## Default Admin Credentials

| Field    | Value              |
|----------|--------------------|
| Email    | admin@voting.com   |
| Password | Admin@1234         |

> ⚠️ Change these in `.env` before deploying to production!

---

## API Endpoints

### Auth
| Method | Endpoint            | Description        |
|--------|---------------------|--------------------|
| POST   | /api/auth/register  | Register voter     |
| POST   | /api/auth/login     | Login              |
| GET    | /api/auth/me        | Get current user   |

### Candidates (authenticated)
| Method | Endpoint                    | Description         |
|--------|-----------------------------|---------------------|
| GET    | /api/candidates/            | List candidates     |
| GET    | /api/candidates/:id         | Get candidate       |

### Votes (authenticated)
| Method | Endpoint            | Description         |
|--------|---------------------|---------------------|
| POST   | /api/votes/cast     | Cast a vote         |
| GET    | /api/votes/results  | Get results         |
| GET    | /api/votes/status   | Get election status |

### Admin (admin only)
| Method | Endpoint                      | Description              |
|--------|-------------------------------|--------------------------|
| GET    | /api/admin/candidates         | List all candidates      |
| POST   | /api/admin/candidates         | Add candidate            |
| PUT    | /api/admin/candidates/:id     | Update candidate         |
| DELETE | /api/admin/candidates/:id     | Delete candidate         |
| GET    | /api/admin/election           | Get election settings    |
| PUT    | /api/admin/election           | Update election settings |
| GET    | /api/admin/stats              | Get statistics           |
| GET    | /api/admin/users              | List all voters          |

---

## Security Features

- **Password hashing** — bcrypt with salt rounds
- **JWT authentication** — 1-hour expiry tokens
- **Duplicate vote prevention** — unique constraint on `votes.user_id` + `has_voted` flag
- **Admin-only routes** — server-side role check on every admin endpoint
- **CORS** — restricted to API routes only
- **Input validation** — all inputs validated server-side
