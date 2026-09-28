# MailFlow — Email Outreach Campaign Platform

Full-stack email outreach platform to create campaigns, import leads via CSV, and schedule multi-step email sequences with per-lead status tracking.

Built with **TypeScript**, **Node.js**, **Express**, **MySQL**, **Redis**, **React**, and **Tailwind CSS**.

![Dashboard Preview](docs/screenshots/dashboard.png)

---

## Features

- **Campaign Management** — Create, edit, and manage outreach campaigns with multi-step email sequences
- **Lead Import** — Import leads from CSV files with field mapping and deduplication
- **Email Scheduling** — Schedule emails with configurable delays between steps
- **Queue-based Sending** — Redis-backed job queue with per-mailbox rate limiting and automatic retries
- **Open & Click Tracking** — Invisible tracking pixel for opens, redirect links for click tracking
- **Analytics Dashboard** — Real-time campaign analytics with open rates, click rates, and reply tracking
- **JWT Authentication** — Secure API with access/refresh token flow
- **Swagger Docs** — Interactive API documentation at `/api/docs`

## Tech Stack

| Layer | Tech |
|-------|------|
| **Runtime** | Node.js 18+ |
| **Language** | TypeScript 5.x |
| **API** | Express.js, REST |
| **Database** | MySQL 8.0 |
| **Cache / Queue** | Redis 7, Bull |
| **Frontend** | React 18, Tailwind CSS |
| **Auth** | JWT (access + refresh tokens) |
| **Docs** | Swagger / OpenAPI 3.0 |
| **Testing** | Jest, Supertest |

## Getting Started

### Prerequisites

- Node.js >= 18
- MySQL 8.0+
- Redis 7+

### Quick Start

1. **Clone the repo**

```bash
git clone https://github.com/OmiOjha/mailflow-outreach.git
cd mailflow-outreach
```

2. **Backend setup**

```bash
cd server
cp .env.example .env    # update with your DB/Redis credentials
npm install
npm run db:migrate      # create tables
npm run db:seed         # seed sample data (optional)
npm run dev
```

The API starts on `http://localhost:3001`. Swagger docs at `http://localhost:3001/api/docs`.

3. **Frontend setup**

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

The app starts on `http://localhost:5173`.

4. **Start the email worker**

```bash
cd server
npm run worker
```

### Docker Compose (alternative)

```bash
docker compose up -d
```

This spins up MySQL, Redis, the API, worker, and the React frontend.

## Project Structure

```
mailflow-outreach/
├── server/                  # Backend API + Worker
│   ├── src/
│   │   ├── config/          # DB, Redis, env config
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/       # Auth, validation, error handling
│   │   ├── models/          # MySQL queries & data access
│   │   ├── routes/          # Express routes
│   │   ├── services/        # Business logic
│   │   ├── workers/         # Bull queue processors
│   │   ├── utils/           # Helpers (csv parser, tracking pixel, etc)
│   │   ├── types/           # TypeScript interfaces
│   │   └── app.ts           # Express app entry
│   └── tests/               # Jest tests
│       ├── unit/
│       └── integration/
│
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level pages
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API client
│   │   ├── context/         # Auth context
│   │   └── App.tsx
│   └── ...
│
├── docker-compose.yml
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/campaigns` | List campaigns |
| `POST` | `/api/campaigns` | Create campaign |
| `GET` | `/api/campaigns/:id` | Get campaign details |
| `PUT` | `/api/campaigns/:id` | Update campaign |
| `DELETE` | `/api/campaigns/:id` | Delete campaign |
| `POST` | `/api/campaigns/:id/leads/import` | Import leads via CSV |
| `GET` | `/api/campaigns/:id/leads` | List leads for campaign |
| `POST` | `/api/campaigns/:id/steps` | Add email step |
| `PUT` | `/api/campaigns/:id/steps/:stepId` | Edit email step |
| `POST` | `/api/campaigns/:id/launch` | Launch campaign |
| `GET` | `/api/campaigns/:id/analytics` | Get campaign analytics |
| `GET` | `/api/track/open/:trackingId` | Track email open (pixel) |
| `GET` | `/api/track/click/:trackingId` | Track link click (redirect) |
| `GET` | `/api/mailboxes` | List mailboxes |
| `POST` | `/api/mailboxes` | Add mailbox |

Full docs available at `/api/docs` (Swagger UI).

## Running Tests

```bash
cd server
npm test                # run all tests
npm run test:unit       # unit tests only
npm run test:integration # integration tests only
npm run test:coverage   # with coverage report
```

## Environment Variables

See [server/.env.example](server/.env.example) and [client/.env.example](client/.env.example).

## Deployment

Deployed on [Render](https://render.com). See [render.yaml](render.yaml) for service config.

- **API**: [https://mailflow-api.onrender.com](https://mailflow-api.onrender.com)
- **Client**: [https://mailflow-outreach.onrender.com](https://mailflow-outreach.onrender.com)

## License

MIT
