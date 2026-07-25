# WABA CRM (Algo Matrix)

WABA CRM is an advanced WhatsApp Business API (WABA) CRM and Automation platform. It allows businesses to manage WhatsApp conversations, build drag-and-drop conversational workflows, send targeted campaigns, and manage subscription billing.

## 🚀 Features

- **Shared Inbox**: Multi-agent chat interface with real-time updates and media support.
- **Drag & Drop Automation Builder**: Create complex chatbots with keyword triggers, delays, API requests, AI nodes, and condition logic.
- **Campaign Management**: Send bulk broadcast messages to targeted contacts and tags.
- **Contact Management**: Import, export, merge, and organize contacts with tags and custom attributes.
- **AI Integration**: AI-assisted suggested replies, sentiment analysis, auto-reply, and conversation summaries.
- **Billing & Subscriptions**: Multi-gateway billing (Razorpay & Paytm) with automated GST invoicing and plan limits.
- **Analytics**: Live dashboard displaying delivery rates, reply rates, revenue, and agent performance.

## 🏗️ Architecture

This project is a monorepo managed with [Turborepo](https://turbo.build/repo).

### Apps
- `api`: Backend server built with **NestJS**. Handles REST APIs, Webhooks, and business logic.
- `client`: Frontend SaaS dashboard built with **Next.js** (App Router) and TailwindCSS.
- `admin`: Admin dashboard for platform management built with **Next.js**.
- `worker`: Background job processor built with **NestJS** and **BullMQ** for campaigns and heavy tasks.

### Packages
- `@algo-matrix/database`: Centralized **Prisma** schema and client generation for PostgreSQL.
- `@algo-matrix/ui`: Shared React components built with Radix UI and TailwindCSS.
- `@algo-matrix/shared`: Shared utilities, types, and constants.
- `@algo-matrix/whatsapp`: Core logic for interacting with the WhatsApp Cloud API.
- `@algo-matrix/services`: Shared services and integrations.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+, React, TailwindCSS, Lucide Icons, Recharts, React Flow (for automation builder).
- **Backend**: NestJS, Node.js, Express.
- **Database**: PostgreSQL (via Prisma ORM), Redis (via BullMQ for queuing/caching).
- **Tooling**: Turborepo, pnpm, ESLint, Prettier.

## 💻 Getting Started

### Prerequisites
- Node.js (v18+)
- pnpm (v8+)
- PostgreSQL
- Redis

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sarkar9265/waba-crm.git
   cd waba-crm
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up Environment Variables:**
   Copy the `.env.example` to `.env` in the root directory and configure your PostgreSQL and Redis connections, along with your WhatsApp and payment gateway API keys.

4. **Initialize the Database:**
   ```bash
   # Generate the Prisma client
   pnpm --filter database prisma generate

   # Run migrations
   pnpm --filter database prisma migrate dev
   ```

5. **Run the Development Server:**
   ```bash
   # Starts the API, Client, Worker, and Admin apps concurrently
   npx turbo run dev
   ```

- The **Client Dashboard** will be running at `http://localhost:3000`
- The **API** will be running at `http://localhost:3001`
- The **Admin Dashboard** will be running at `http://localhost:3002`

## 📦 Deployment

For production deployments, the project can be built using Turborepo and deployed using PM2 and Cloudflare Tunnels (or Docker).

```bash
# Build all apps
npx turbo run build
```

See `deployment_guide.md` (if available) for detailed VPS and PM2 deployment instructions.

## 📜 License

UNLICENSED - Proprietary Software
