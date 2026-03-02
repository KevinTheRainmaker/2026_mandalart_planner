# 2026 Mandalart Planner

A 14-day, guided goal-design web app that combines retrospective prompts and a Mandalart 9x9 framework to turn annual goals into actionable plans. Built as a portfolio-grade product with a clean UX, strong testing discipline, and AI-assisted summaries.

## Summary

- 14-day guided flow from retrospective to action plans
- Mandalart-based goal hierarchy (main goal, sub-goals, action plans)
- AI-assisted recommendations and final report generation
- PDF export for reports and grid visualization
- Secure authentication with Supabase and Row Level Security

## Documentation Links

- English: README.md
- 한국어: README.ko.md
- Version History: VERSION_HISTORY.md
- 버전 이력(한국어): VERSION_HISTORY.ko.md

## Product Flow

- Day 1–2: Retrospective questions (themed prompts)
- Day 3: Define the central goal
- Day 4–5: Define eight sub-goals
- Day 6–13: Define eight action plans per sub-goal (total 64)
- Day 14: Generate AI report and Mandalart visualization

## Core Features

- Guided retrospective with optional skip to next step
- Goal hierarchy editing with autosave
- Recommendation feedback loop and custom prompt support
- AI summary generation with prompt tuning
- PDF export for report and grid
- Progress guidance and admin dashboard foundation
- Error handling and security safeguards for AI endpoints

## Tech Stack

### Frontend
- React 18.3 + TypeScript 5.3
- Vite 5, Tailwind CSS 3.4
- Zustand for state management
- React Router 6 for routing

### Backend
- Supabase (PostgreSQL, Auth, Edge Functions)
- Row Level Security for user data isolation

### AI & External Services
- Google Generative AI API (Gemini)
- jsPDF + html2canvas for PDF export

### Testing
- Vitest + Testing Library
- Test-driven development on core components and stores

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

Create a `.env` file with the following values:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SITE_URL=http://localhost:5173
```

### 4) Supabase Setup

Run the migration in the Supabase SQL editor:

```
# supabase/migrations/20260101000000_init_schema.sql
```

See `supabase/README.md` for details.

### 5) Development

```bash
npm run dev
```

### 6) Tests

```bash
npm test
npm run test:coverage
```

## Scripts

- `npm run dev`: start dev server
- `npm run build`: production build
- `npm run preview`: preview build
- `npm test`: run tests
- `npm run test:coverage`: run tests with coverage
- `npm run lint`: lint

## Security

- Row Level Security ensures per-user data access
- Magic link authentication for passwordless sign-in
- Environment variable separation for secrets

## Documentation

- `docs/PRD.md` Product Requirements
- `docs/TRD.md` Technical Requirements
- `supabase/README.md` Supabase setup

## License

MIT
