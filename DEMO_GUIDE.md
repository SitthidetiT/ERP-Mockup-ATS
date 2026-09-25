# AUTO-TECHSYSTEM ERP Live Demo Guide

## Demo login

This is a browser-only mockup. Open `/dashboard`; no password is required. Demo state persists in local storage until **Reset Demo Data** is used.

## Roles

- Executive — company health, risk, WIP, revenue and margin
- Sales — customer and quotation flow
- Engineer — engineering, drawing and planning hand-off
- Production Planner / Production Supervisor — routing and job progress
- QC — inspection and rework story
- HR — people, attendance and leave workspace
- System Admin — notifications, audit and settings

## Featured scenario

**JOB-2026-00128 — Automation Machine Part**

Customer: Cal-Comp Automation and Industrial 4.0 Service (Thailand) Co., Ltd.  
Quotation: CALH22609-013 REV 2  
Drawing: DWG ATS-AMP-128 REV 2  
Due date: 30 September 2026

Story: quotation accepted → engineering review → drawing REV 2 → planning/material readiness → production routing: **CNC Milling → Drilling / Deburring / Tapping → Grinding → Hardening → Coating → QC** → packing/delivery → profitability.

Supporting management cases:

- JOB-2026-00129: QC FAIL → REWORK → QC PASS
- JOB-2026-00130: material shortage → purchasing attention
- JOB-2026-00131: outsource delay
- JOB-2026-00132: urgent job due soon

## Demo order

Use the **Demo Guide** control and select **เปิดหน้านี้** for each step:

1. Dashboard — point out management attention, capacity, WIP and margin.
2. CALH22609-013 REV 2 — review commercial context and items.
3. Cost calculator — explain cost and margin visibility is restricted.
4. A4 preview — show print-ready customer document.
5. Customer public link — demonstrate accept/reject/change request interaction.
6. Job board — show the connected featured job and supporting exception cases.
7. Engineering, Drawing, Planning, Production, QC, Packing/Delivery, Profitability and HR route workspaces.

## Key talking points

- One shared mock state means accepted quotations generate linked jobs and workflow actions create activity records.
- The dashboard tells the executive what requires action first: QC rework, deadline, shortage and supplier delay.
- Role selection changes the dashboard title and quick-create intent; it is a demonstration control, not security.

## Known mock integrations

Email, LINE OA and ZK Time are presentation-only integrations and do not contact external services. Export/print is limited to browser print support.

## Reset instruction

Use **Reset Demo Data**, confirm the browser dialog, then return to `/dashboard`. This restores the seeded customers, quotations, jobs, notifications and activity timeline.
