# gasopname

A weekly stock-taking ("opname") worksheet web app for construction site
engineers — a purpose-built replacement for the "OPNAME BOBOL KARANGJATI"
Google Sheets workbook.

It tracks weekly realized volumes per contract line item, manages contractors
(mandor), work orders (SPK) with their budget breakdowns (RAB), cash advances
(kasbon), and weekly payment submissions (pengajuan) with frozen snapshots.

> **Note:** the UI is fully in Indonesian (Bahasa Indonesia), desktop-first —
> that is the language of the engineers who use it daily.

## Features

- **Projects** — construction packages with name, engineer, company, start date, and status.
- **Mandors** — contractors with bank account details; one mandor can hold many SPKs across projects.
- **SPKs (work orders)** — per-mandor contracts with value, job type, and retention percentage (default 5%), each carrying its RAB line items (description, unit, contracted volume, fixed unit price).
- **Weekly opname** — record realized volume per RAB item per week (MGG); value = volume × unit price. Over-volume (cumulative beyond contracted volume) raises a warning without blocking.
- **Kasbon** — cash advances tied to a mandor, with deductions (potongan) taken from payments.
- **Pengajuan** — weekly per-SPK submissions with a `draft → diajukan → dibayar` flow. Moving to `diajukan` freezes the numbers as a snapshot and locks the week.
- **Dashboard** — project overview with key figures (sisa opname, sisa kasbon, retention).

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui (Radix), TanStack Router + Query, react-hook-form + Zod, Recharts
- **Backend:** Hono API running on Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite), migrations in `app/migrations/`
- **Testing:** Vitest (+ Testing Library, jsdom, better-sqlite3)

## Project Structure

```text
gasopname/
├── app/                  # the web app
│   ├── src/pages/        # dashboard, projects, mandors, spks, opname, kasbons, landing
│   ├── src/components/   # UI components (shadcn-based)
│   ├── server/           # Hono API (routes: projects, mandors, spks, opnames, kasbons, dashboard)
│   ├── migrations/       # D1 SQL migrations
│   ├── tests/            # Vitest suites
│   └── wrangler.jsonc    # Cloudflare Workers config
├── docs/                 # ADRs and agent notes
├── raw/                  # source data exported from the original workbook (JSON)
├── DESIGN.md             # UI/design decisions
├── GLOSSARY.md           # domain glossary (Indonesian construction terms)
├── PLAN.md               # build plan
└── REFERENCE.md          # workbook reference
```

## Getting Started

```bash
cd app
npm install
```

Run the frontend dev server:

```bash
npm run dev
```

Run the Worker (API + D1) locally:

```bash
npm run dev:worker
```

Build for production:

```bash
npm run build
```

Run the test suite:

```bash
npm test
```

## Domain Glossary (short)

| Term | Meaning |
|---|---|
| Proyek | Construction project / package |
| Mandor | Contractor / foreman |
| SPK | Work order contract per mandor |
| RAB | Budget line-item breakdown inside an SPK |
| MGG | Week unit of opname (1 MGG = 7 days from project start) |
| Opname | Weekly realized-volume recording per RAB item |
| Kasbon | Cash advance given to a mandor |
| Pengajuan | Weekly payment submission per SPK |
| Retensi | Retention percentage withheld (default 5%) |

See `GLOSSARY.md` for the full glossary.
