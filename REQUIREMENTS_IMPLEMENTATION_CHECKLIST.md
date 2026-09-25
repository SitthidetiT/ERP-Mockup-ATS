# ERP Interactive Mockup — Requirement Implementation Checklist

Baseline: requirement register from the audio-summary task (`SYS-01` through `NFR-10`).

Status meanings:

- `DONE` — demonstrable interactive mock flow exists and persists in the shared demo state.
- `PARTIAL` — screen/data exists, but one or more acceptance criteria are not yet interactive.
- `MISSING` — no meaningful mock implementation yet.
- Infrastructure requirements are intentionally not marked done by a browser-only mockup.

## A. Users, permissions and history

| ID | Status | Current implementation / gap |
|---|---|---|
| SYS-01 | PARTIAL | Interactive sign-in/out and account status mock exists; no authenticated backend. |
| SYS-02 | DONE | Role switcher, role navigation and route guard. |
| SYS-03 | PARTIAL | Route and job-transition checks exist; CRUD/approve/export actions are not all separately enforced. |
| SYS-04 | PARTIAL | Financial KPI visibility is restricted; all cost actions are not protected. |
| SYS-05 | PARTIAL | Activity records actor/time/action, but not immutable old/new snapshots. |
| SYS-06 | DONE | Core workflow transitions append persisted activities. |
| SYS-07 | PARTIAL | Dashboard/notifications show work queues; personal approval inbox is not complete. |
| SYS-08 | DONE | Delegation mock supports activation/revocation and effective period display. |
| SYS-09 | PARTIAL | Maker-checker rule can be demonstrated; API enforcement requires production backend. |

## B. Shared master data

| ID | Status | Current implementation / gap |
|---|---|---|
| MST-01 | PARTIAL | Customer create/search/list exists; edit/deactivate/detail does not. |
| MST-02 | PARTIAL | Multiple contacts are presented in master-data workspace; contact CRUD is not persisted. |
| MST-03 | PARTIAL | Supplier is shown on PO; supplier master CRUD is absent. |
| MST-04 | PARTIAL | Inventory item list and categories exist; complete item master CRUD is absent. |
| MST-05 | DONE | Inventory master displays internal and customer part numbers separately. |
| MST-06 | PARTIAL | Product/drawing revision fields exist; product-group master is absent. |
| MST-07 | PARTIAL | Departments/work centers/machines appear in flows; master CRUD is absent. |
| MST-08 | DONE | Interactive UOM conversion demonstrates controlled KG↔G calculation. |
| MST-09 | PARTIAL | Deactivate/reactivate behavior is demonstrated without deleting records; persistence is incomplete. |

## C. Sales and quotations

| ID | Status | Current implementation / gap |
|---|---|---|
| SAL-01 | DONE | Customer inquiry workspace and persisted status changes. |
| SAL-02 | DONE | Engineering feasibility review with result actions. |
| SAL-03 | DONE | Multi-line quotation editor. |
| SAL-04 | DONE | Customer, contact/document fields, validity, payment and lead time. |
| SAL-05 | PARTIAL | Drawing image and revision exist; attachment library is not complete. |
| SAL-06 | DONE | Discount, subtotal, VAT and grand total calculation. |
| SAL-07 | DONE | New revision action preserves the prior quotation record. |
| SAL-08 | DONE | Draft → internal review → approval interaction. |
| SAL-09 | DONE | Company-style A4 preview and browser print. |
| SAL-10 | PARTIAL | Sent state persists; delivery channel/date/email record is not stored. |
| SAL-11 | DONE | Follow-up records include due date, owner, contact date, notes and outcome actions. |
| SAL-12 | PARTIAL | Accept/reject/change request persists; contact history is not a separate entity. |
| SAL-13 | PARTIAL | Interactive expiry check and attention alert exist; scheduled automation is production-only. |
| SAL-14 | DONE | Accepted quotation creates linked Sales Order and Job. |
| SAL-15 | PARTIAL | Per-line partial quantity acceptance and value difference are interactive; accepted order persistence is incomplete. |
| SAL-16 | PARTIAL | Lost outcome and reason are persisted; aggregate win/loss chart is absent. |

## D. Engineering and controlled documents

| ID | Status | Current implementation / gap |
|---|---|---|
| ENG-01 | DONE | Job is created with quotation/customer linkage. |
| ENG-02 | DONE | Feasibility/material/process review. |
| ENG-03 | PARTIAL | Quotation drawing upload exists; general Job attachment workspace is absent. |
| ENG-04 | PARTIAL | Drawing revision and release status exist; file-revision history is incomplete. |
| ENG-05 | PARTIAL | BOM/routing release action exists; production release is not blocked in every path. |
| ENG-06 | DONE | ECN mock captures change, drawing revision, impact, approver and approval state. |
| ENG-07 | DONE | BOM list linked to Job plan. |
| ENG-08 | DONE | Ordered routing with work center, duration, outsource and QC flags. |
| ENG-09 | PARTIAL | Interactive revision-difference mock exists; real CAD geometry comparison is not integrated. |

## E. PPC and production orders

| ID | Status | Current implementation / gap |
|---|---|---|
| PPC-01 | DONE | Work order links Job, released plan, target quantity and operations. |
| PPC-02 | PARTIAL | Data model supports multiple orders; creation UI is absent. |
| PPC-03 | DONE | Sequenced operation traveller. |
| PPC-04 | DONE | Planned and actual dates are shown separately. |
| PPC-05 | PARTIAL | Outsource operations are flagged; trade-goods path is absent. |
| PPC-06 | DONE | Job board and production operation status. |
| PPC-07 | PARTIAL | Due/rework/shortage alerts exist but thresholds are fixed. |
| PPC-08 | PARTIAL | Capacity visualization exists but uses fixed demo values. |
| PPC-09 | PARTIAL | Scheduling assistant generates suggested slots and overload states; no optimization engine. |

## F. Purchasing and outsourcing

| ID | Status | Current implementation / gap |
|---|---|---|
| PUR-01 | PARTIAL | Job-linked PR is shown; create form is absent. |
| PUR-02 | DONE | PR approval action and activity record. |
| PUR-03 | PARTIAL | PO data and PR link exist; PO creation form is absent. |
| PUR-04 | PARTIAL | PO approval status exists; explicit approval action is incomplete. |
| PUR-05 | DONE | Repeated partial receipts update outstanding quantity and receipt history. |
| PUR-06 | PARTIAL | Routing marks outsourced operations; send/return quantities are absent. |
| PUR-07 | DONE | Outsource actual cost appears in Job profitability. |
| PUR-08 | DONE | Interactive supplier offer comparison covers price, lead time, terms and selection. |

## G. Inventory

| ID | Status | Current implementation / gap |
|---|---|---|
| INV-01 | PARTIAL | Three stores exist; bin/location master is absent. |
| INV-02 | PARTIAL | Item categories and stores exist; WIP/trade/FG ledgers are incomplete. |
| INV-03 | DONE | PO receipt produces receipt history and stock movement. |
| INV-04 | DONE | Issue action creates a work-order-referenced stock movement. |
| INV-05 | DONE | Return action restores stock and records the movement. |
| INV-06 | PARTIAL | Adjustment transaction exists; approval step is not separated. |
| INV-07 | DONE | Outbound transaction is blocked and notified before stock becomes negative. |
| INV-08 | DONE | On-hand, reserved and available quantities are shown and persisted. |
| INV-09 | DONE | Transfer changes store and records source/destination. |
| INV-10 | PARTIAL | Lot is shown on items and movements; genealogy across production output is incomplete. |
| INV-11 | PARTIAL | Low-stock status exists; responsible-user alert/action is absent. |

## H. Shop-floor execution

| ID | Status | Current implementation / gap |
|---|---|---|
| PRO-01 | PARTIAL | Production access is role-limited; assignments are not filtered per employee. |
| PRO-02 | PARTIAL | Start/complete persists; pause/resume is not exposed. |
| PRO-03 | PARTIAL | Good/rework/scrap quantities are shown; operator input form is absent. |
| PRO-04 | DONE | Machine is recorded per operation. |
| PRO-05 | PARTIAL | Actual timestamps and cost category exist; automatic duration costing is incomplete. |
| PRO-06 | DONE | Downtime action records reason, start/end, minutes and operator. |
| PRO-07 | PARTIAL | Status controls exist; mandatory-field validation is incomplete. |
| PRO-08 | PARTIAL | Partial-transfer action and activity exist; downstream WIP quantity ledger is incomplete. |

## I. QC, defects and rework

| ID | Status | Current implementation / gap |
|---|---|---|
| QC-01 | DONE | Inspection links production order and operation and supports inspection stage. |
| QC-02 | DONE | Revision-ready characteristic list. |
| QC-03 | DONE | Nominal/lower/upper/measured values with automatic result. |
| QC-04 | DONE | Failed measurement creates a QC notification. |
| QC-05 | PARTIAL | Inspector is stored; instrument/time fields are incomplete. |
| QC-06 | PARTIAL | Pass/fail exists; concession/hold/scrap dispositions are incomplete. |
| QC-07 | PARTIAL | Failed inspection can create a linked rework order; closing through reinspection is incomplete. |
| QC-08 | PARTIAL | Operation scrap quantity exists; approved scrap record/report is absent. |
| QC-09 | DONE | Complaint is linked to delivery/Job and advances through investigation/corrective action/closed. |
| QC-10 | DONE | Inspection sheet has a customer-facing print action. |

## J. Packing, delivery and trade goods

| ID | Status | Current implementation / gap |
|---|---|---|
| DEL-01 | PARTIAL | Finished quantity is available to packing; explicit FG receipt is absent. |
| DEL-02 | PARTIAL | Packing quantity exists; package/label detail is absent. |
| DEL-03 | DONE | Delivery note links Sales Order and Job and prevents delivery above packed quantity. |
| DEL-04 | DONE | Repeated partial dispatch is supported. |
| DEL-05 | PARTIAL | Delivery-note data exists; printable company PDF is absent. |
| TRD-01 | DONE | Trade Good item category, order, stock and quantity view exist. |
| TRD-02 | DONE | Trade order dispatch reduces inventory without a production order. |
| TRD-03 | DONE | Revenue, cost and gross profit are calculated per trade order. |

## K. Costing, reports and alerts

| ID | Status | Current implementation / gap |
|---|---|---|
| CST-01 | PARTIAL | Actual material cost is displayed; it is not calculated from issue transactions yet. |
| CST-02 | DONE | Rework cost is separated from normal cost. |
| CST-03 | DONE | Material, labour, machine, outsource, rework and other categories are supported. |
| CST-04 | DONE | Selling price, actual cost, profit and margin are calculated. |
| REP-01 | PARTIAL | Dashboard covers requested queues; several cards remain fixed demo data. |
| REP-02 | PARTIAL | Job status/deadline list exists; filter/CSV is incomplete. |
| REP-03 | PARTIAL | Stock and movement lists exist; full document drill-down is incomplete. |
| REP-04 | DONE | Printable quality report summarizes pass/fail, rework, scrap and complaints. |
| REP-05 | DONE | Job-cost category and variance report. |
| REP-06 | PARTIAL | Deadline/shortage/rework alerts exist with fixed thresholds. |
| REP-07 | PARTIAL | Capacity view exists with fixed values rather than operation-hours aggregation. |

## L. Files, deployment and non-functional requirements

| ID | Status | Current implementation / gap |
|---|---|---|
| NFR-01 | MISSING | No authenticated company-network deployment. |
| NFR-02 | MISSING | No NAS integration. |
| NFR-03 | MISSING | No database/file backup and restore. |
| NFR-04 | MISSING | No Docker production stack. |
| NFR-05 | PARTIAL | Responsive, shallow navigation exists; formal key-user usability test is pending. |
| NFR-06 | PARTIAL | Domain components/state are being separated; no production persistence layer. |
| NFR-07 | PARTIAL | Seed/reset demo exists; separate UAT environment does not. |
| NFR-08 | PARTIAL | Demo and role guides exist; role-specific operating/admin manuals do not. |
| NFR-09 | MISSING | Concurrent-user/performance target and test. |
| NFR-10 | MISSING | RTO/RPO and recovery plan. |

## Summary

This checklist measures the **interactive mockup**, not production readiness. Items involving authentication, API enforcement, PostgreSQL, NAS, backups, Docker, integrations and performance cannot become `DONE` until the production implementation phase.
