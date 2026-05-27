# VedaAI Assessment Creator

A production-ready, full-stack AI-powered assessment generation platform built for educators. Teachers create assignments, configure question types, and let the AI pipeline generate structured exam papers — with live progress updates via WebSockets.

---

## Screenshots

> _Add screenshots here after running the app locally._

| Dashboard | Create Assignment | Assignment Detail |
|-----------|------------------|-------------------|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Create](docs/screenshots/create.png) | ![Detail](docs/screenshots/detail.png) |

| Generate Paper | Paper Viewer | Paper Print View |
|----------------|--------------|-----------------|
| ![Generate](docs/screenshots/generate.png) | ![Viewer](docs/screenshots/viewer.png) | ![Print](docs/screenshots/print.png) |

---

## Features

### Core
- **Assignment Dashboard** — paginated list with real-time status badges, search, and filter by status
- **Create Assignment** — multi-section form with Zod validation, drag-and-drop file upload, dynamic question config rows, and a live summary panel
- **Assignment Detail** — metadata view, question breakdown with progress bars, source file panel, generated paper panel
- **AI Paper Generation** — BullMQ job queue with Redis, deterministic mock generator (OpenAI-ready), live status updates via Socket.IO
- **Paper Viewer** — exam-paper layout with section headers, MCQ options, answer lines, model answers toggle, DRAFT watermark
- **Print / Download PDF** — browser-native print-to-PDF with print-specific CSS (sidebar hidden, model answers hidden, clean A4 layout)
- **Delete Assignment** — confirmation modal, cascade deletes generated paper

### Infrastructure
- Typed Socket.IO events with room-based subscriptions per assignment
- BullMQ queue with 3-attempt exponential backoff retry
- Atomic status transitions to prevent race conditions on double-click
- Server-side data fetching with `force-dynamic` for always-fresh lists
- Zod validation on both frontend (React Hook Form) and backend (Express middleware)
- Prisma ORM with PostgreSQL (Neon serverless)
- Hydration-safe date formatting (UTC-pinned locale strings)

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 15 (App Router) | Framework, server components, routing |
| TypeScript | Type safety |
| TailwindCSS v4 | Utility-first styling |
| shadcn/ui + Radix UI | Accessible component primitives |
| React Hook Form + Zod | Form state and validation |
| Zustand | Client state management |
| Socket.IO Client | Real-time WebSocket communication |
| Lucide React | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | HTTP server |
| TypeScript | Type safety |
| Prisma ORM | Database access layer |
| PostgreSQL (Neon) | Primary database |
| Redis | BullMQ job queue backing store |
| BullMQ | Background job processing |
| Socket.IO | WebSocket server |
| Multer | File upload handling |
| Zod | Request validation |
| OpenAI SDK | AI generation (wired, not yet active) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│  Next.js 15 App Router                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Server      │  │  Client      │  │  Socket.IO       │  │
│  │  Components  │  │  Components  │  │  Client          │  │
│  │  (fetch SSR) │  │  (RHF/Zustand│  │  (live updates)  │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
└─────────┼─────────────────┼───────────────────┼────────────┘
          │  HTTP           │  HTTP             │  WS
          ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express API Server                       │
│                                                             │
│  Routes → Middleware (Zod) → Controllers → Services        │
│                                    │                        │
│                              Prisma ORM                     │
│                                    │                        │
│                            PostgreSQL (Neon)                │
│                                                             │
│  POST /generate → BullMQ Queue → Worker                    │
│                        │              │                     │
│                      Redis        Socket.IO emit            │
└─────────────────────────────────────────────────────────────┘
```

### Generation Pipeline

```
User clicks "Generate Paper"
        │
        ▼
POST /api/assignments/:id/generate
        │  Atomic DB status check (prevents double-enqueue)
        ▼
BullMQ Queue (Redis)
        │  3 attempts, exponential backoff (2s → 4s → 8s)
        ▼
Worker picks up job
        ├─ UPDATE status = GENERATING
        ├─ emit generation:progress { GENERATING }  ──→ Browser badge updates
        ├─ generateMockPaper() / OpenAI (future)
        ├─ UPSERT generated_papers
        ├─ UPDATE status = COMPLETED
        └─ emit generation:progress { COMPLETED, paper }  ──→ Panel updates
```

---

## Project Structure

```
veda-ai-assessment/
├── frontend/                          # Next.js 15 App
│   └── src/
│       ├── app/
│       │   ├── assignments/           # Dashboard, detail, create, paper routes
│       │   └── layout.tsx
│       ├── components/
│       │   ├── assignments/           # AssignmentCard, Detail, Form, PaperViewer
│       │   ├── layout/                # Sidebar, Navbar
│       │   └── ui/                    # FormField, SectionCard
│       ├── hooks/                     # useGenerationSocket
│       ├── lib/                       # utils, validations, assignment-utils
│       ├── services/                  # assignments API client, socket
│       ├── store/                     # Zustand stores
│       └── types/
│
└── backend/                           # Express API
    └── src/
        ├── config/                    # env, database, redis, multer, openai
        ├── features/
        │   └── assignments/           # controller, service, routes, schema, types
        │       └── paper-generator.ts # Mock paper generation
        ├── middleware/                # errorHandler, validate, requestLogger
        ├── queues/                    # BullMQ queue definitions
        ├── sockets/                   # Socket.IO server + room management
        ├── types/                     # Shared TypeScript interfaces
        ├── utils/                     # logger, asyncHandler, response helpers
        ├── workers/                   # BullMQ worker processors
        ├── app.ts                     # Express app setup
        └── index.ts                   # Bootstrap + graceful shutdown
```

---

## Setup

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | >= 18 |
| npm | >= 9 |
| PostgreSQL | Any (Neon recommended) |
| Redis | >= 6 |

### 1. Clone and install

```bash
git clone https://github.com/your-username/veda-ai-assessment.git
cd veda-ai-assessment

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### 2. Configure environment variables

**Backend** — copy and fill in `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

```env
# Server
NODE_ENV=development
PORT=4000

# PostgreSQL (Neon or local)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# OpenAI (optional — mock generation works without this)
OPENAI_API_KEY=sk-your-key-here

# CORS
CORS_ORIGIN=http://localhost:3000

# JWT (for future auth)
JWT_SECRET=change-this-to-a-long-random-string
JWT_EXPIRES_IN=7d
```

**Frontend** — copy and fill in `frontend/.env.local`:

```bash
cp frontend/.env.local.example frontend/.env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
NEXT_PUBLIC_APP_NAME=Veda AI Assessment
```

### 3. Database setup

The project uses a custom migration script (compatible with Neon's serverless PostgreSQL):

```bash
cd backend

# Apply schema to database
node scripts/migrate.js

# Generate Prisma client
npm run prisma:generate

# Verify connection
node scripts/verify-db.js
```

### 4. Run the application

**Backend** (in one terminal):

```bash
cd backend
npm run dev
# Server starts on http://localhost:4000
```

**Frontend** (in another terminal):

```bash
cd frontend
npm run dev
# App starts on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/assignments`.

---

## Available Scripts

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (hot reload) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled production build |
| `npm run type-check` | TypeScript type check (no emit) |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:migrate` | Apply schema to database |
| `npm run prisma:verify` | Verify database connection |
| `npm run prisma:studio` | Open Prisma Studio GUI |

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/assignments` | Create assignment (multipart/form-data) |
| `GET` | `/api/assignments` | List assignments (paginated) |
| `GET` | `/api/assignments/:id` | Get assignment with generated paper |
| `DELETE` | `/api/assignments/:id` | Delete assignment (cascades paper) |
| `POST` | `/api/assignments/:id/generate` | Enqueue paper generation |

### Socket.IO Events

**Client → Server**

| Event | Payload | Description |
|---|---|---|
| `assignment:subscribe` | `assignmentId: string` | Join assignment room |
| `assignment:unsubscribe` | `assignmentId: string` | Leave assignment room |

**Server → Client**

| Event | Payload | Description |
|---|---|---|
| `generation:progress` | `{ assignmentId, status, message, paper?, error? }` | Live generation updates |

---

## Database Schema

```prisma
enum AssignmentStatus {
  PENDING     // Created, not yet queued
  GENERATING  // Worker is processing
  COMPLETED   // Paper saved successfully
  FAILED      // All retry attempts exhausted
}

model Assignment {
  id             String           @id @default(cuid())
  title          String
  dueDate        DateTime
  instructions   String
  sourceFileUrl  String?
  status         AssignmentStatus @default(PENDING)
  totalQuestions Int
  totalMarks     Int
  questionConfig Json             // [{ type, count, marks }]
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  generatedPaper GeneratedPaper?
}

model GeneratedPaper {
  id           String     @id @default(cuid())
  assignmentId String     @unique
  content      Json       // { title, sections, totalQuestions, totalMarks, metadata }
  createdAt    DateTime   @default(now())
  assignment   Assignment @relation(...)
}
```

---

## Queue System

BullMQ is used for reliable background processing of paper generation jobs.

- **Queue**: `paper-generation` (Redis-backed)
- **Concurrency**: 3 parallel workers
- **Retry policy**: 3 attempts with exponential backoff (2s → 4s → 8s)
- **Deduplication**: `jobId: generate-{assignmentId}` prevents duplicate jobs
- **Completed jobs**: retained (last 100)
- **Failed jobs**: retained (last 50) for debugging

The worker emits Socket.IO events at each stage so the frontend updates in real time without polling.

---

## Future Improvements

- **OpenAI integration** — swap `generateMockPaper()` for GPT-4o structured output
- **Authentication** — JWT-based auth with teacher/student roles
- **Student submission** — allow students to submit answers online
- **Auto-grading** — AI-powered answer evaluation for MCQ and short answers
- **Assignment templates** — save and reuse question configurations
- **Export formats** — DOCX export in addition to PDF
- **Analytics dashboard** — question difficulty analysis, class performance
- **Multi-tenancy** — school-level isolation with subdomain routing
- **File processing** — extract text from uploaded PDFs to feed into AI context
- **Scheduled generation** — trigger generation at a specific time via BullMQ delayed jobs

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">Built with Next.js 15, Express, Prisma, BullMQ, and Socket.IO</p>
