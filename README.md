# 🚀 Full Stack AI Chat Application (Dockerized Monorepo)

A **production-grade, Dockerized full‑stack AI chat system** built with **Next.js 14 (App Router)** on the frontend and **FastAPI** on the backend.  
The project follows **clean architecture**, **service separation**, and **enterprise-ready scalability patterns**.

---

## 🧠 System Architecture

> This repository is a **root-level Docker monorepo**.  
All services are orchestrated using a **single root `docker-compose.yml`**, with shared `.env` and `.gitignore`.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          SPACECRAFT ENVIRONMENT                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐          ┌──────────────────┐          ┌─────────┐ │
│  │   Next.js 14    │  HTTPS   │   FastAPI 0.104  │   TCP    │PostgreSQL│ │
│  │   Frontend      │◄────────►│    Backend       │◄────────►│  DB 15   │ │
│  └─────────────────┘          └──────────────────┘          └─────────┘ │
│         │                             │                         │       │
│         │  WebSocket                  │  REST API               │       │
│         │  (Real-time Chat)           │  (Auth, Upload)         │       │
│  ┌──────┴──────┐             ┌───────┴───────┐        ┌────────┴───────┐│
│  │  React UI   │             │   Gemini AI   │        │     Redis      ││
│  │ shadcn/ui   │             │     API       │        │   (Cache)      ││
│  └─────────────┘             └───────────────┘        └────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Core Features

### 🔐 Authentication & Security
- JWT-based authentication (FastAPI)
- Session management using NextAuth
- Role‑ready authorization layer
- Secure password hashing & token validation

### 💬 AI Chat System
- Real‑time messaging using WebSockets
- Persistent conversation history
- Gemini AI powered responses
- Typing indicators & chat streaming ready
- File upload & contextual AI prompts

### 📁 File Handling
- Secure file upload API
- MIME & size validation
- AI‑aware document processing pipeline

### 📊 Dashboard
- System status overview
- Recent conversations
- Quick actions panel
- Scalable widget-based UI

### ⚙️ DevOps & Scalability
- Root‑level Docker orchestration
- PostgreSQL + Alembic migrations
- Redis caching support
- API versioning (`/api/v1`)
- Modular service layer

---

## 📂 Root Project Structure

```
.
├── docker-compose.yml        # Root orchestration
├── .env                      # Shared environment variables
├── .gitignore                # Global ignore rules
├── backend/                  # FastAPI service
├── frontend/                 # Next.js 14 service
└── README.md
```

---

## 🧩 Backend Structure (FastAPI)

```
backend/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── alembic/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── dependencies.py
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py
│   │   │   │   ├── chat.py
│   │   │   │   └── upload.py
│   │   │   └── api.py
│   ├── models/
│   │   ├── user.py
│   │   ├── chat.py
│   │   └── base.py
│   ├── schemas/
│   │   ├── user.py
│   │   ├── chat.py
│   │   └── upload.py
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── chat_service.py
│   │   └── gemini_service.py
│   ├── db/
│   │   ├── session.py
│   │   └── base_class.py
│   └── utils/
│       └── file_handlers.py
```

### Backend Responsibilities
- Authentication & authorization
- WebSocket chat handling
- AI integration (Gemini)
- Database persistence
- File processing
- API validation & versioning

---

## 🎨 Frontend Structure (Next.js 14)

```
frontend/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── components.json
├── .env.local
├── .gitignore
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── label.tsx
│   │   ├── toast.tsx
│   │   ├── alert.tsx
│   │   ├── badge.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── avatar.tsx
│   │   ├── progress.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   └── tooltip.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   ├── SpaceBackground.tsx
│   │   ├── Navbar.tsx
│   │   └── Container.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── AuthGuard.tsx
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── FileUpload.tsx
│   │   ├── ChatHistory.tsx
│   │   └── TypingIndicator.tsx
│   ├── dashboard/
│   │   ├── StatsCard.tsx
│   │   ├── RecentConversations.tsx
│   │   ├── SystemStatus.tsx
│   │   └── QuickActions.tsx
│   └── landing/
│       ├── Hero.tsx
│       ├── Features.tsx
│       ├── Testimonials.tsx
│       └── CTASection.tsx
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── favicon.ico
│   ├── providers.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── chat/
│   │   ├── page.tsx
│   │   ├── [conversationId]/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts
│   ├── about/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   ├── utils.ts
│   ├── constants.ts
│   └── validation.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useChat.ts
│   ├── useWebSocket.ts
│   └── useToast.ts
├── styles/
│   └── globals.css
├── types/
│   └── index.ts
└── public/
    ├── images/
    │   └── logo.svg
    └── icons/
        └── favicon.ico
```

### Frontend Capabilities
- App Router architecture
- Protected routes
- Real-time chat UI
- Responsive dashboard
- Reusable component system
- Type-safe API interaction

---

## ⚙️ Environment Variables

### Root `.env`
```env
DATABASE_URL=postgresql://user:password@db:5432/app_db
REDIS_URL=redis://redis:6379
SECRET_KEY=supersecret
GEMINI_API_KEY=your_key
NEXTAUTH_SECRET=supersecret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## 🐳 Docker Usage

### Start Entire System
```bash
docker-compose up --build
```

### Services
- Frontend → http://localhost:3000
- Backend → http://localhost:8000
- PostgreSQL → 5432
- Redis → 6379

---

## 🧪 Database Migration

```bash
alembic revision --autogenerate -m "init"
alembic upgrade head
```

---

## 🛠 Tech Stack

**Frontend**
- Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui
- NextAuth

**Backend**
- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- Redis
- Gemini AI

**DevOps**
- Docker
- Docker Compose

---

## 📈 Enterprise Readiness

- Clean architecture
- Horizontal scaling ready
- Cache support
- WebSocket + REST
- AI extensibility
- CI/CD friendly

---

## 📜 License

MIT License
