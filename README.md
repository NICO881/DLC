# Digital Library — Digital Learning Centre

The knowledge center of a Digital Learning Centre, built for a school environment
in Uganda. Stores, organizes, and delivers curriculum-aligned learning resources
to students, teachers, subject coordinators, and administrators, with offline
and online access.

This repo contains:

```
digital-library/
├── backend/     Django + Django REST Framework API (PostgreSQL or SQLite)
└── frontend/    React + Vite + Tailwind CSS single-page app
```

---

## 1. Prerequisites

| Tool       | Version (minimum) | Check with        |
|------------|--------------------|--------------------|
| Python     | 3.10+              | `python3 --version` |
| pip        | latest             | `pip --version`     |
| Node.js    | 18+                | `node --version`    |
| npm        | 9+                 | `npm --version`     |
| PostgreSQL | 14+ (optional)     | `psql --version`    |

PostgreSQL is only required if you want to run against it directly (matches
the spec's tech stack for the school server). For local development, the
backend defaults to **SQLite** — zero setup required.

---

## 2. Backend setup (Django + DRF)

```bash
cd backend

# 1. Create and activate a virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment variables
cp .env.example .env
# Open .env and adjust values if needed. Defaults work out of the box with SQLite.

# 4. Run database migrations
python manage.py migrate

# 5. (Optional but recommended) Seed demo data — creates one user per role
#    plus a small curriculum tree and a sample resource.
python manage.py seed_demo_data

# 6. Create your own admin/superuser account (alternative to seeding)
python manage.py createsuperuser

# 7. Start the development server
python manage.py runserver
```

The API is now running at **http://localhost:8000/api/**.
Django admin is at **http://localhost:8000/admin/**.

### Demo accounts (after running `seed_demo_data`)

| Role                | Username      | Password        |
|----------------------|---------------|------------------|
| Administrator        | `admin`       | `Admin@12345`    |
| Subject Coordinator   | `coordinator` | `Coord@12345`    |
| Teacher               | `teacher`     | `Teach@12345`    |
| Student               | `student`     | `Student@12345`  |

`seed_demo_data` currently seeds 6 placeholder subjects (Mathematics, Biology,
Chemistry, ICT, Geography, English) with one topic/subtopic each, matching the
Student Dashboard's subject tile grid. To swap in the real, official NCDC
Uganda subject/topic list: edit `subject_defs` near the top of
`library/management/commands/seed_demo_data.py`, then re-run:

```bash
python manage.py seed_demo_data
```

No frontend changes are needed — the dashboard reads subjects live from the
database via `/api/subjects/`.

### Forgot password / reset flow

`POST /api/auth/password-reset/` (body: `{"email": "..."}`) emails a reset
link. With the default `.env` settings, the email is printed straight to
the **backend terminal** (the console email backend) instead of actually
being sent — copy the link from the terminal output during local testing.
`POST /api/auth/password-reset/confirm/` (body: `{"uid", "token", "new_password"}`)
completes the reset. To send real emails, set `EMAIL_BACKEND` to the SMTP
backend in `.env` and fill in your SMTP credentials.

### Switching to PostgreSQL (school server / production)

Edit `.env`:

```env
DB_ENGINE=postgresql
DB_NAME=digital_library
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
```

Then create the database and re-run migrations:

```bash
createdb digital_library     # or: psql -c "CREATE DATABASE digital_library;"
python manage.py migrate
python manage.py seed_demo_data   # optional
```

### Running the backend smoke tests

A scripted end-to-end test (login, role permissions, upload, lifecycle
transitions, bookmarks, downloads, analytics, audit logs) lives at
`backend/tests/smoke_test.py`. Run it with:

```bash
cd backend
python tests/smoke_test.py
```

It uses Django's test client directly, so no running server is required.
Note: it requires `testserver` in `ALLOWED_HOSTS` (already included in `.env.example`).

---

## 3. Frontend setup (React + Vite + Tailwind)

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Configure the API URL (defaults to the local backend above)
cp .env .env.local   # if you want to override without touching tracked .env
# VITE_API_BASE_URL=http://localhost:8000/api

# 3. Start the development server
npm run dev
```

The app is now running at **http://localhost:5173/**.

Sign in with any of the demo accounts above. Each role lands on a different
dashboard (Student / Teacher / Coordinator / Admin), matching the permission
matrix in the spec.

### Building for production

```bash
npm run build      # outputs static files to frontend/dist/
npm run preview     # preview the production build locally
```

Deploy the contents of `frontend/dist/` behind any static file server
(Nginx, Apache, or the same Ubuntu server hosting the backend).

---

## 4. Project structure reference

### Backend (`backend/`)

```
config/             Django project settings, root URLs
accounts/           Custom User model (4 roles), auth endpoints, permissions
library/
  models/           curriculum.py, resource.py, interactions.py, system.py
  serializers/      Mirrors the models package
  views/             Mirrors the models package, plus analytics.py
  filters.py         Smart Search filtering (django-filter)
  management/commands/seed_demo_data.py
tests/smoke_test.py  End-to-end API smoke test
```

### Frontend (`frontend/src/`)

```
api/                 axios wrappers per backend resource (auth, resources, etc.)
context/AuthContext.jsx   Global auth state
components/
  layout/            AppShell, Sidebar, Header, ProtectedRoute
  resources/         ResourceCard (shelf motif), ResourceViewer
  curriculum/        Cascading curriculum selector
  ui/                Button, Card, Badge, Select, FormField primitives
pages/
  auth/              LoginPage
  student/           Dashboard, Bookmarks, Downloads
  teacher/           Dashboard, Upload, Edit, Share
  coordinator/       Review Queue, Curriculum Management
  admin/             Dashboard, Analytics, Storage Monitoring, Users, Audit Logs
  shared/            Browse/Search, Resource Detail, Notifications, Profile
utils/                resourceTypes.js (icons/colors), navigation.js
```

---

## 5. Design system

A custom Tailwind theme reflecting the school context:

- **Ink blue** (`ink-*`) — structural color (sidebar, headers)
- **Clay/terracotta** (`clay-*`) — primary accent, buttons, active states
- **Paper** (`paper`) — warm off-white background
- **Leaf green** (`leaf-*`) — published / success states
- **Gold** (`gold-*`) — pending / in-review states
- **Roboto Slab** for headings, **Inter** for body text
- A "shelf spine" motif on `ResourceCard` — a colored tab keyed to resource
  type, evoking a labeled book spine on a shelf

---

## 6. What's implemented (Phase 1 + groundwork for later phases)

✅ Custom role-based User model (Student / Teacher / Coordinator / Admin)
✅ Curriculum hierarchy (Education Level → Class → Subject → Topic → Subtopic → Learning Outcome → Competency)
✅ Forgot-password email reset flow (console email backend for local dev; swap to real SMTP via `.env`)
✅ Resource upload, edit, archive, restore, soft-delete
✅ Resource Lifecycle state machine (Draft → Pending Review → Published → Inactive → Archived) with role-gated transitions
✅ Smart Search (subject, topic, keyword, class, type, language) + free-text search
✅ Bookmarks, Progress Tracking, Ratings, Download Manager, Resource Sharing
✅ Notifications, Audit Logs
✅ Usage Analytics + Storage Monitoring dashboards
✅ PDF/Video/Audio/Image viewers
✅ Offline/online connectivity indicator (frontend)
✅ Role-specific dashboards and navigation matching the permission matrix
✅ Redesigned Student Dashboard: subject tile grid (read live from the curriculum DB), prominent search bar, and content shelves (Recent Resources, Past Papers, Favorites, Bookmarks, Popular Videos)

🚧 Not yet implemented (left as clear extension points): version control UI,
real-time notifications (Celery/Redis are wired into settings but tasks
aren't written yet), AI tutoring/quiz generation (Phase 4), MinIO/Elasticsearch
swap-in for storage/search at scale.
