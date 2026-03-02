# 2026 Mandal-Art Planner
<a href='https://github.com/KevinTheRainmaker/2026_mandalart_planner/blob/main/README.md'>Korean</a> | <a href='https://github.com/KevinTheRainmaker/2026_mandalart_planner/blob/main/README.eng.md'>English</a>

A Mandal-Art guide that combines reflection questions with the 9x9 Mandal-Art framework to transform annual goals into actionable plans.

## Overview

* Guided flow from reflection to action planning
* 2025 reflection through AI chat
* Mandal-Art–based goal hierarchy (core goal, sub-goals, action plans)
* AI recommendations and final report generation
* Exportable report and grid PDF

## Product Flow

* Step 1–2: Reflection questions and central goal setting
* Step 3–4: Define 8 sub-goals
* Step 5–12: Create 8 action plans for each sub-goal (64 total)
* Step 13: Generate AI report and Mandal-Art visualization

## Core Features

* Chat-based UI for 2025 reflection
* Editable goal hierarchy with auto-save
* Recommendation feedback loop with custom prompt support
* AI-generated summary and evaluation report (based on the SMART framework)
* Mandal-Art grid visualization and PDF export
* Admin dashboard (activated when logged in with an admin account)

## Tech Stack

### Frontend

* React 18.3 + TypeScript 5.3
* Vite 5, Tailwind CSS 3.4
* Zustand for state management
* React Router 6 for routing

### Backend

* Supabase (PostgreSQL, Auth, Edge Functions)
* Row Level Security

### AI & External Services

* Google Generative AI API (Gemini)
* jsPDF + html2canvas (PDF generation)

### Testing

* Vitest + Testing Library
* TDD for core components and stores

## Project Structure

```
src/
├── components/
│   ├── common/
│   ├── auth/
│   ├── days/
│   ├── mandala/
│   ├── timeline/
│   └── admin/
├── pages/
├── store/
├── hooks/
├── lib/
├── types/
├── constants/
├── utils/
└── styles/
```

## Getting Started

### 1) Clone

```bash
git clone https://github.com/KevinTheRainmaker/2026_mandalart_planner.git
cd 2026_mandalart_planner
```

### 2) Install

```bash
npm install
```

### 3) Environment Variables

Set the following values in your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SITE_URL=http://localhost:5173
```

### 4) Supabase Setup

Run the following migration in the Supabase SQL Editor:

```
# supabase/migrations/20260101000000_init_schema.sql
```

For more details, refer to `supabase/README.md`.

### 5) Development

```bash
npm run dev
```

### 6) Testing

```bash
npm test
npm run test:coverage
```

## Scripts

* `npm run dev`: Start development server
* `npm run build`: Production build
* `npm run preview`: Preview production build
* `npm test`: Run tests
* `npm run test:coverage`: Run tests with coverage
* `npm run lint`: Run linter

## Security

* User data isolation via Row Level Security
* Passwordless authentication using magic links
* Sensitive information separated via environment variables

## License

MIT
