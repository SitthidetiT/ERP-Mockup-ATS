# AUTO-TECHSYSTEM ERP Mockup

Interactive Next.js presentation mockup for an industrial ERP approval demo. It uses browser-only persisted mock state—no API, database, Docker, or paid service.

## Run

`npm install` then `npm run dev`

Start at `/dashboard`. Use the role selector in the top bar, **Demo Guide** for the executive presentation sequence, and **Reset Demo Data** to restore seeded records. The featured management story is **JOB-2026-00128 — Automation Machine Part**, linked to quotation **CALH22609-013 REV 2**.

## UX decisions

- A restrained navy industrial shell keeps tables and operational status readable at 1440px.
- Status changes are surfaced as activities and persist in `localStorage` under `ats-demo`.
- The quotation builder uses dense, spreadsheet-like editing rather than oversized cards.
- The catch-all route provides a coherent interactive module workspace for all required route families, while the high-value CRM, quotation, job workflow, notification, costing, document preview and dashboard flows have dedicated views.

## Demonstrable flow

Sales creates a quotation → opens preview/customer portal → accepts quotation → a linked job appears in the job board → moves it through Engineering/Planning/Production/QC/Packing/Delivery → activity and dashboard state update.

For the full executive walk-through, roles, talking points and mock-integration notes see [DEMO_GUIDE.md](DEMO_GUIDE.md).

The role switcher now enforces demo navigation and client-side route access. See [ROLE_PERMISSIONS.md](ROLE_PERMISSIONS.md) for the module × role matrix.
