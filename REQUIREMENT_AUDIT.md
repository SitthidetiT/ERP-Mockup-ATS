# AUTO-TECHSYSTEM ERP — Requirement Gap Audit

Audit source: `src/components/layout/erp-app.tsx`, `src/stores/demo-store.tsx`, `src/app/[[...slug]]/page.tsx`, seed data and production build. Statuses below describe the post-remediation source state; `PARTIAL` means a present, interactive presentation mock that lacks the requested deep domain implementation.

## Remediation and verification performed

- Added an interactive `/public/quotation/[token]` response view. Accept, reject and change-request transitions persist via the shared demo store; acceptance creates a linked job.
- Added persisted **mark all read** interaction in Notification Center.
- Verified every sidebar target resolves through the App Router optional catch-all route. This is route availability, not evidence that the required domain screen exists; those gaps remain explicitly marked below.
- Source scan found no `href="#"`, `TODO` action, or `console.log`. It did find several plain buttons in generic workspaces, recorded as partial interactions rather than reporting them as complete functionality.
- Verified `npm run typecheck` and `npm run build` after remediation (both pass).

## End-to-end flow audit

| Flow | Result | Evidence / gap |
|---|---|---|
| A Customer → quote → items → preview → public response → job | PARTIAL | Customer create, quote save/items/totals, preview and public accept are shared-state paths. Cost is display-only; send email is not a modal yet. |
| B Job → engineering → drafting → planning → routing | PARTIAL | Job state can transition but engineering/drafting/planning are generic workspace actions; no drawing/routing entity. |
| C Shortage → PR → PO → receive → inventory | MISSING | No material, purchase, receipt or stock state. |
| D Production → work order → start/complete → QC | PARTIAL | Job moves Production→QC; no work-order entity/start timestamps. |
| E QC fail → rework → QC again → packing → delivery | PARTIAL | QC→Packing→Delivery status path exists; fail/rework/reinspection records are absent. |
| F Actual cost → revenue → profit → margin | PARTIAL | Estimate/margin display exists; actual costs are not persisted. |
| G Employee → attendance → leave → approval → notification | MISSING | No employee, attendance or leave data model. |

| ID | Requirement | Status | Route | File/Component | Problem / Required Fix |
|---|---|---|---|---|---|
| 1 | Dashboard | PARTIAL | `/dashboard` | `Dashboard` | KPI/activity work; charts/alerts need data-driven filters. |
| 2 | Customers | PARTIAL | `/customers` | `Customers` | Create/search works; detail/edit/contact tabs absent. |
| 3 | Quotation | PARTIAL | `/quotations` | `QuoteList` | List/state works; filter/export demo limited. |
| 4 | Quotation Builder | PARTIAL | `/quotations/new` | `QuoteBuilder` | Save works; document fields not all persisted. |
| 5 | Spreadsheet Item Editor | PARTIAL | `/quotations/new` | `QuoteBuilder` | Inline add/edit/delete/calculation works; copy/drag/keyboard reorder absent. |
| 6 | Image/Document Designer | MISSING | — | — | No upload, positioning or item image model. |
| 7 | Cost Calculator | PARTIAL | `/quotations/[id]/costing` | `Costing` | Display only; not tied to item cost state. |
| 8 | Revision | MISSING | `/quotations/[id]` | `QuoteDetail` | Revision tab was inert; revision records/actions absent. |
| 9 | A4 Quotation Preview | PARTIAL | `/quotations/[id]/preview` | `QuotePreview` | Print works; preview selected first quote rather than route record. |
| 10 | Send Email Mock | MISSING | `/quotations/[id]` | `QuoteDetail` | Send button only changed status. |
| 11 | Customer Public Response Link | PARTIAL | `/public/quotation/[token]` | catch-all `ModulePage` | URL exists but did not expose quotation. |
| 12 | Customer Accept / Reject / Change | PARTIAL | public quotation route | — | Only internal accept existed; reject/change absent. |
| 13 | Job Creation | DONE | quotation → `/jobs` | demo store | Accepted quote creates linked job. |
| 14 | Job Workflow | PARTIAL | `/jobs` | `Jobs` | Board moves stages but workflow is shortened. |
| 15 | Engineering Review | PARTIAL | `/engineering/[jobId]` | `ModulePage` | Generic workflow action only. |
| 16 | Drafting | PARTIAL | `/drafting/[jobId]` | `ModulePage` | Generic workspace only. |
| 17 | Drawing Revision | MISSING | `/drafting/[jobId]` | — | No drawing revisions. |
| 18 | File Attachment | MISSING | — | — | No attachment state/uploader. |
| 19 | 3D Viewer | MISSING | — | — | No viewer/mock viewer. |
| 20 | Production Planning | PARTIAL | `/planning/[jobId]` | `ModulePage` | Generic action only. |
| 21 | Route Builder | MISSING | `/planning/[jobId]` | — | No ordered routing. |
| 22 | Material Requirement | MISSING | `/planning/[jobId]` | — | No BOM/MRP state. |
| 23 | Stock Availability | MISSING | `/inventory/items` | — | No stock calculations. |
| 24 | Purchasing | PARTIAL | `/purchasing/*` | `ModulePage` | Generic screen only; no PR/PO lifecycle. |
| 25 | Outsourcing | PARTIAL | `/outsourcing/[id]` | `ModulePage` | Generic screen only. |
| 26–28 | Store 1–3 | MISSING | `/inventory/stores` | — | No separate stores. |
| 29 | Stock Movement | MISSING | `/inventory/movements` | — | No movement state. |
| 30–42 | 13 work centers | MISSING | `/production/work-centers/[slug]` | — | Route catches URL but no work-center data/capacity. |
| 43 | Work Orders | PARTIAL | `/production/work-orders` | `ModulePage` | Generic table, no work-order entities. |
| 44–50 | Progress / deadline / priority / workload / capacity / alerts / tracking | PARTIAL | dashboard/jobs | `Dashboard`,`Jobs` | Visual values, only job progress/state persists. |
| 51–56 | QC inspection / measurement / pass/fail / rework/reinspection | PARTIAL | `/qc/*` | `ModulePage` | Basic move to packing only; no inspection records. |
| 57 | Customer Return | MISSING | `/qc/customer-returns` | — | No return lifecycle. |
| 58–61 | Packing / list / delivery / note | PARTIAL | `/packing/*`,`/delivery/*` | `ModulePage` | Generic completion action; documents absent. |
| 62–66 | Costing / actual vs estimate / profit / margin / restricted permission | PARTIAL | `/costing/*` | `Costing`,`ModulePage` | Estimate/margin visible; actuals and role enforcement absent. |
| 67–75 | Employees / HR / calendar / attendance / leave / ZK / LINE | PARTIAL | `/hr/*`,`/settings/integrations/*` | `ModulePage` | URLs and generic actions only, no HR entities. |
| 76 | Notification Center | PARTIAL | `/notifications` | `Notifications` | Mark-one works; mark-all was inert. |
| 77 | Activity Log | PARTIAL | dashboard | demo store | Generated on quote/job transitions only. |
| 78 | Audit Log | PARTIAL | `/administration/audit-log` | `ModulePage` | No audit record table/drawer. |
| 79 | Role Switcher | PARTIAL | global | `Shell` | Persists role but no permission matrix enforcement. |
| 80 | Permission Matrix | MISSING | `/settings/roles` | — | No matrix. |
| 81 | Global Search | PARTIAL | `/search` | `SearchPage` | Searches core records; uses client window instead of route search params. |
| 82 | Reports | PARTIAL | `/reports/*` | `ModulePage` | No real report filters/export data. |
| 83 | Printable Documents | PARTIAL | quotation preview | `QuotePreview` | Quotation print only. |
| 84 | Mock Data | PARTIAL | global | `seed.ts` | 5 customers/3 quotations/4 jobs, below required quantities. |
| 85 | Reset Demo | DONE | global | `Shell`,`DemoProvider` | Restores seeded persisted state. |
| 86 | Presentation Mode | PARTIAL | global | `Guide` | Guide works, but several steps route to generic jobs. |
| 87 | Responsive UI | PARTIAL | global | `globals.css` | Desktop/tablet/mobile rules present; no visual-browser QA performed. |
| 88 | Build | DONE | project | package scripts | `npm run build` passed after audit baseline. |
