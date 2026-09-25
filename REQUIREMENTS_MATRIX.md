# Requirements matrix

| ID | Requirement | Module | Route | Status |
|---|---|---|---|---|
| R01 | Application shell, roles, global search, persisted demo state | Foundation | all routes | PARTIAL |
| R02 | Executive command center, KPI, alerts, activity, workload | Dashboard | `/dashboard` | PARTIAL |
| R03 | Customer search and create | CRM | `/customers`, `/customers/new` | PARTIAL |
| R04 | Quotation list and spreadsheet-style builder | Quotation | `/quotations`, `/quotations/new` | PARTIAL |
| R05 | Totals, VAT, costing and printable A4 preview | Quotation | `/quotations/[id]/costing`, `/preview` | PARTIAL |
| R06 | Public customer response and linked job creation | Workflow | `/public/quotation/[token]`, `/jobs` | DONE |
| R07 | Engineering to delivery operational workflow | Operations | `/engineering` through `/delivery` | PARTIAL |
| R08 | Inventory, purchasing, outsourcing and production | Operations | module route families | PARTIAL |
| R09 | QC, packing and delivery workflow actions | Quality / logistics | module route families | PARTIAL |
| R10 | Reports, HR, audit and settings domain modules | Governance | module route families | PARTIAL |
| R11 | Notification center, demo guide and reset | Presentation | global | PARTIAL |
