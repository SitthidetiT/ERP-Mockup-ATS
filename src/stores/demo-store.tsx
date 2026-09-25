"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  seedActivities,
  seedCustomers,
  seedJobs,
  seedNotifications,
  seedQuotes,
  seedInventoryItems,
  seedStores,
  seedMovements,
  seedInquiries,
  seedEngineeringReviews,
  seedSalesOrders,
  seedJobPlans,
  seedPurchaseRequests,
  seedPurchaseOrders,
  seedGoodsReceipts,
  seedProductionOrders,
  seedQcInspections,
  seedDeliveries,
  seedJobCosts,
  seedReworkOrders,
  seedCustomerComplaints,
  seedSalesFollowups,
  seedTradeOrders,
  seedDowntimes,
} from "@/data/seed";
import {
  Activity,
  Customer,
  Job,
  Notification,
  Quotation,
  Role,
  Status,
  InventoryItem,
  StoreLocation,
  StockMovement,
  SalesInquiry,
  EngineeringReview,
  SalesOrder,
  JobPlan,
  InquiryStatus,
  PurchaseRequest,
  PurchaseOrder,
  GoodsReceipt,
  ProductionOrder,
  QcInspection,
  DeliveryRecord,
  JobCost,
  ProductionOperation,
  ReworkOrder,
  CustomerComplaint,
  SalesFollowup,
  TradeOrder,
  DowntimeRecord,
} from "@/types";
import { canMoveJobTo } from "@/lib/permissions";
import {
  assigneeForStatus,
  handoffLabel,
  personForRole,
} from "@/lib/workflow-people";
type Store = {
  ready: boolean;
  customers: Customer[];
  quotes: Quotation[];
  jobs: Job[];
  activities: Activity[];
  notifications: Notification[];
  inventoryItems: InventoryItem[];
  stores: StoreLocation[];
  movements: StockMovement[];
  inquiries: SalesInquiry[];
  engineeringReviews: EngineeringReview[];
  salesOrders: SalesOrder[];
  jobPlans: JobPlan[];
  purchaseRequests: PurchaseRequest[];
  purchaseOrders: PurchaseOrder[];
  goodsReceipts: GoodsReceipt[];
  productionOrders: ProductionOrder[];
  qcInspections: QcInspection[];
  deliveries: DeliveryRecord[];
  jobCosts: JobCost[];
  reworkOrders: ReworkOrder[];
  customerComplaints: CustomerComplaint[];
  salesFollowups: SalesFollowup[];
  tradeOrders: TradeOrder[];
  downtimes: DowntimeRecord[];
  role: Role;
  addCustomer: (c: Customer) => void;
  saveQuote: (q: Quotation) => void;
  setQuoteStatus: (id: string, s: Status) => void;
  setJobStatus: (id: string, s: Status) => void;
  setInquiryStatus: (id: string, s: InquiryStatus) => void;
  setReviewResult: (id: string, result: EngineeringReview["result"]) => void;
  createSalesOrder: (quotationId: string) => void;
  approveJobPlan: (id: string) => void;
  completeFollowup: (id: string, outcome: SalesFollowup["outcome"]) => void;
  approvePurchaseRequest: (id: string) => void;
  receivePurchaseOrder: (id: string, qty: number) => void;
  postStock: (itemId: string, type: StockMovement["type"], qty: number) => void;
  reserveStock: (itemId: string, qty: number) => void;
  transferStock: (itemId: string, toLocation: string) => void;
  setOperationStatus: (
    orderId: string,
    operationId: string,
    status: ProductionOperation["status"],
  ) => void;
  recordDowntime: (orderId: string, operationId: string) => void;
  transferOperationOutput: (
    orderId: string,
    operationId: string,
    qty: number,
  ) => void;
  recordInspection: (id: string, values: number[]) => void;
  createRework: (inspectionId: string) => void;
  setComplaintStatus: (id: string, status: CustomerComplaint["status"]) => void;
  dispatchDelivery: (id: string, qty: number) => void;
  dispatchTradeOrder: (id: string, qty: number) => void;
  setRole: (role: Role) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  reset: () => void;
};
const DemoContext = createContext<Store | null>(null);
const initial = {
  customers: seedCustomers,
  quotes: seedQuotes,
  jobs: seedJobs,
  activities: seedActivities,
  notifications: seedNotifications,
  inventoryItems: seedInventoryItems,
  stores: seedStores,
  movements: seedMovements,
  inquiries: seedInquiries,
  engineeringReviews: seedEngineeringReviews,
  salesOrders: seedSalesOrders,
  jobPlans: seedJobPlans,
  purchaseRequests: seedPurchaseRequests,
  purchaseOrders: seedPurchaseOrders,
  goodsReceipts: seedGoodsReceipts,
  productionOrders: seedProductionOrders,
  qcInspections: seedQcInspections,
  deliveries: seedDeliveries,
  jobCosts: seedJobCosts,
  reworkOrders: seedReworkOrders,
  customerComplaints: seedCustomerComplaints,
  salesFollowups: seedSalesFollowups,
  tradeOrders: seedTradeOrders,
  downtimes: seedDowntimes,
  role: "Executive" as Role,
};
const stamp = () => Date.now();
function makeJobPlan(jobId: string, q: Quotation): JobPlan {
  return {
    id: `plan-${stamp()}`,
    jobId,
    revision: `REV ${q.rev}`,
    drawingNo: `DWG-${q.no}`,
    approvalStatus: "DRAFT",
    bom: q.items.map((item, index) => ({
      id: `bom-${stamp()}-${index}`,
      material: item.material,
      partNo: item.partNo,
      qtyPer: item.qty,
      unit: item.unit,
    })),
    routing: [
      {
        id: `route-${stamp()}-10`,
        sequence: 10,
        process: "เตรียม Material",
        workCenter: "Cutting",
        plannedMinutes: 120,
        outsourced: false,
        qcRequired: false,
      },
      {
        id: `route-${stamp()}-20`,
        sequence: 20,
        process: "Machining",
        workCenter: "CNC Milling",
        plannedMinutes: 480,
        outsourced: false,
        qcRequired: true,
      },
      {
        id: `route-${stamp()}-30`,
        sequence: 30,
        process: "Final QC",
        workCenter: "QC",
        plannedMinutes: 90,
        outsourced: false,
        qcRequired: true,
      },
    ],
  };
}
function makeProductionOrder(
  jobId: string,
  plan: JobPlan,
  q: Quotation,
): ProductionOrder {
  const qty = Math.max(
    1,
    q.items.reduce((n, item) => n + item.qty, 0),
  );
  return {
    id: `wo-${stamp()}`,
    no: `WO-${String(stamp()).slice(-6)}`,
    jobId,
    planId: plan.id,
    targetQty: qty,
    status: "RELEASED",
    operations: plan.routing.map((route, index) => ({
      id: `wop-${stamp()}-${index}`,
      sequence: route.sequence,
      process: route.process,
      workCenter: route.workCenter,
      operator: index === 2 ? "K. QC" : "Demo Operator",
      machine: index === 0 ? "CUT-01" : index === 1 ? "CNC-01" : undefined,
      plannedStart: `Day ${index + 1} 08:00`,
      plannedFinish: `Day ${index + 1} 17:00`,
      qtyIn: qty,
      qtyGood: 0,
      qtyRework: 0,
      qtyScrap: 0,
      status: index === 0 ? "READY" : "WAITING",
    })),
  };
}
export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const saved = localStorage.getItem("ats-demo");
        if (saved) setState({ ...initial, ...JSON.parse(saved) });
      } catch {
        localStorage.removeItem("ats-demo");
        setState(initial);
      } finally {
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem("ats-demo", JSON.stringify(state));
  }, [state, ready]);
  const store = useMemo<Store>(
    () => ({
      ready,
      ...state,
      addCustomer: (c) =>
        setState((s) => ({ ...s, customers: [c, ...s.customers] })),
      saveQuote: (q) =>
        setState((s) => ({
          ...s,
          quotes: s.quotes.some((x) => x.id === q.id)
            ? s.quotes.map((x) => (x.id === q.id ? q : x))
            : [q, ...s.quotes],
        })),
      setQuoteStatus: (id, status) =>
        setState((s) => {
          const q = s.quotes.find((x) => x.id === id);
          if (!q) return s;
          const accepted = status === "ACCEPTED";
          const existingJob = s.jobs.find((j) => j.quotationId === id);
          const newJob: Job | undefined =
            accepted && !existingJob
              ? {
                  id: `j-${stamp()}`,
                  no: `JOB-${String(stamp()).slice(-6)}`,
                  quotationId: id,
                  customer: q.customer,
                  project: q.project,
                  status: "ENGINEERING",
                  due: "15 Oct 2026",
                  progress: 8,
                  priority: "Normal",
                }
              : undefined;
          const job = existingJob ?? newJob;
          const salesOrders =
            accepted && !s.salesOrders.some((x) => x.quotationId === id)
              ? [
                  {
                    id: `so-${stamp()}`,
                    no: `SO-${String(stamp()).slice(-6)}`,
                    quotationId: id,
                    customerPoNo: "CUSTOMER-PO-PENDING",
                    customer: q.customer,
                    project: q.project,
                    orderDate: "Now",
                    requestedDelivery: q.validUntil,
                    status: "IN_PROGRESS" as const,
                  },
                  ...s.salesOrders,
                ]
              : s.salesOrders;
          const jobs = newJob ? [newJob, ...s.jobs] : s.jobs;
          const newPlan =
            accepted && job && !s.jobPlans.some((x) => x.jobId === job.id)
              ? makeJobPlan(job.id, q)
              : undefined;
          const jobPlans = newPlan ? [newPlan, ...s.jobPlans] : s.jobPlans;
          const firstItem = q.items[0];
          const newPr =
            accepted &&
            job &&
            firstItem &&
            !s.purchaseRequests.some((x) => x.jobId === job.id)
              ? {
                  id: `pr-${stamp()}`,
                  no: `PR-${String(stamp()).slice(-6)}`,
                  jobId: job.id,
                  item: firstItem.partName,
                  partNo: firstItem.partNo,
                  qty: firstItem.qty,
                  unit: firstItem.unit,
                  neededBy: q.validUntil,
                  status: "PENDING" as const,
                  requestedBy: "Production Planner",
                }
              : undefined;
          return {
            ...s,
            quotes: s.quotes.map((x) => (x.id === id ? { ...x, status } : x)),
            salesOrders,
            jobs,
            jobPlans,
            purchaseRequests: newPr
              ? [newPr, ...s.purchaseRequests]
              : s.purchaseRequests,
            activities: [
              {
                id: `a-${stamp()}`,
                at: "Now",
                user: accepted ? personForRole.Sales : personForRole[s.role],
                role: s.role,
                action: accepted
                  ? `ลูกค้ายืนยันใบเสนอราคา · ส่งต่องาน ${handoffLabel("Sales", "ENGINEERING")}`
                  : `Quotation ${status.toLowerCase()}`,
                entity: q.no,
              },
              ...s.activities,
            ],
            notifications:
              accepted && job
                ? [
                    {
                      id: `n-${stamp()}`,
                      title: "Engineering ได้รับงานใหม่จาก Sales",
                      detail: `${job.no} · ${personForRole.Sales} ส่งให้ ${assigneeForStatus.ENGINEERING?.name}`,
                      type: "ENGINEERING",
                      read: false,
                    },
                    ...s.notifications,
                  ]
                : s.notifications,
          };
        }),
      setJobStatus: (id, status) =>
        setState((s) => {
          if (!canMoveJobTo(s.role, status)) return s;
          const job = s.jobs.find((item) => item.id === id);
          if (!job) return s;
          const stages: Status[] = [
            "ENGINEERING",
            "DRAFTING",
            "PLANNING",
            "PURCHASING",
            "PRODUCTION",
            "QC",
            "PACKING",
            "DELIVERED",
            "COMPLETED",
          ];
          const currentIndex = stages.indexOf(job.status);
          const targetIndex = stages.indexOf(status);
          const isNextStage =
            currentIndex >= 0 && targetIndex === currentIndex + 1;
          const isReworkTransition =
            (job.status === "QC" && status === "REWORK") ||
            (job.status === "REWORK" && status === "QC");
          if (!isNextStage && !isReworkTransition) return s;
          const recipient = assigneeForStatus[status];
          const handoff = handoffLabel(s.role, status);
          return {
            ...s,
            jobs: s.jobs.map((j) =>
              j.id === id
                ? {
                    ...j,
                    status,
                    progress:
                      status === "COMPLETED"
                        ? 100
                        : Math.min(95, j.progress + 15),
                  }
                : j,
            ),
            activities: [
              {
                id: `a-${Date.now()}`,
                at: "Now",
                user: personForRole[s.role],
                role: s.role,
                action: `ส่งต่องาน ${handoff}`,
                entity: job.no,
              },
              ...s.activities,
            ],
            notifications: recipient
              ? [
                  {
                    id: `n-${Date.now()}`,
                    title: `งานใหม่ส่งถึง ${recipient.name}`,
                    detail: `${job.no} · จาก ${personForRole[s.role]} (${s.role}) · ขั้นตอน ${status}`,
                    type: status,
                    read: false,
                  },
                  ...s.notifications,
                ]
              : s.notifications,
          };
        }),
      setInquiryStatus: (id, status) =>
        setState((s) => ({
          ...s,
          inquiries: s.inquiries.map((x) =>
            x.id === id ? { ...x, status } : x,
          ),
          activities: [
            {
              id: `a-${Date.now()}`,
              at: "Now",
              user: personForRole[s.role],
              role: s.role,
              action:
                status === "UNDER_REVIEW"
                  ? `ส่งคำขอ ${personForRole.Sales} (Sales) → ${assigneeForStatus.ENGINEERING?.name} (Engineer)`
                  : `Inquiry moved to ${status}`,
              entity: s.inquiries.find((x) => x.id === id)?.no ?? id,
            },
            ...s.activities,
          ],
          notifications:
            status === "UNDER_REVIEW"
              ? [
                  {
                    id: `n-${Date.now()}`,
                    title: "Engineering ได้รับ Inquiry ใหม่",
                    detail: `${s.inquiries.find((x) => x.id === id)?.no ?? id} · จาก ${personForRole.Sales}`,
                    type: "ENGINEERING",
                    read: false,
                  },
                  ...s.notifications,
                ]
              : s.notifications,
        })),
      setReviewResult: (id, result) =>
        setState((s) => {
          const review = s.engineeringReviews.find((x) => x.id === id);
          return {
            ...s,
            engineeringReviews: s.engineeringReviews.map((x) =>
              x.id === id ? { ...x, result, reviewedAt: "Now" } : x,
            ),
            inquiries: s.inquiries.map((x) =>
              x.id === review?.inquiryId
                ? {
                    ...x,
                    status:
                      result === "FEASIBLE"
                        ? "FEASIBLE"
                        : result === "NEEDS_INFO"
                          ? "NEEDS_INFO"
                          : x.status,
                  }
                : x,
            ),
            activities: [
              {
                id: `a-${Date.now()}`,
                at: "Now",
                user: "Demo User",
                role: s.role,
                action: `Engineering review ${result.toLowerCase()}`,
                entity:
                  s.inquiries.find((x) => x.id === review?.inquiryId)?.no ?? id,
              },
              ...s.activities,
            ],
          };
        }),
      createSalesOrder: (quotationId) =>
        setState((s) => {
          const q = s.quotes.find((x) => x.id === quotationId);
          if (!q || s.salesOrders.some((x) => x.quotationId === quotationId))
            return s;
          const order: SalesOrder = {
            id: `so-${Date.now()}`,
            no: `SO-${String(Date.now()).slice(-6)}`,
            quotationId,
            customerPoNo: "CUSTOMER-PO-PENDING",
            customer: q.customer,
            project: q.project,
            orderDate: "Now",
            requestedDelivery: q.validUntil,
            status: "DRAFT",
          };
          return {
            ...s,
            salesOrders: [order, ...s.salesOrders],
            activities: [
              {
                id: `a-${Date.now()}`,
                at: "Now",
                user: "Demo User",
                role: s.role,
                action: "Sales order created",
                entity: order.no,
              },
              ...s.activities,
            ],
          };
        }),
      completeFollowup: (id, outcome) =>
        setState((s) => {
          const follow = s.salesFollowups.find((x) => x.id === id);
          return {
            ...s,
            salesFollowups: s.salesFollowups.map((x) =>
              x.id === id ? { ...x, outcome, contactedAt: "Now" } : x,
            ),
            quotes: s.quotes.map((x) =>
              x.id === follow?.quotationId && outcome === "LOST"
                ? { ...x, status: "REJECTED" }
                : x,
            ),
            activities: [
              {
                id: `a-${Date.now()}`,
                at: "Now",
                user: "Demo User",
                role: s.role,
                action: `Sales follow-up ${outcome.toLowerCase()}`,
                entity:
                  s.quotes.find((x) => x.id === follow?.quotationId)?.no ?? id,
              },
              ...s.activities,
            ],
          };
        }),
      approveJobPlan: (id) =>
        setState((s) => {
          const plan = s.jobPlans.find((x) => x.id === id);
          const job = s.jobs.find((x) => x.id === plan?.jobId);
          const q = s.quotes.find((x) => x.id === job?.quotationId);
          if (!plan || !job || !q) return s;
          const order = s.productionOrders.some((x) => x.planId === id)
            ? undefined
            : makeProductionOrder(job.id, plan, q);
          return {
            ...s,
            jobPlans: s.jobPlans.map((x) =>
              x.id === id ? { ...x, approvalStatus: "APPROVED" } : x,
            ),
            productionOrders: order
              ? [order, ...s.productionOrders]
              : s.productionOrders,
            jobs: s.jobs.map((x) =>
              x.id === job.id
                ? { ...x, status: "PURCHASING", progress: 45 }
                : x,
            ),
            activities: [
              {
                id: `a-${stamp()}`,
                at: "Now",
                user: "Demo User",
                role: s.role,
                action: "BOM and routing released — Work Order prepared",
                entity: plan.drawingNo,
              },
              ...s.activities,
            ],
          };
        }),
      approvePurchaseRequest: (id) =>
        setState((s) => {
          const pr = s.purchaseRequests.find((x) => x.id === id);
          if (!pr) return s;
          const po = s.purchaseOrders.some((x) => x.prId === id)
            ? undefined
            : {
                id: `po-${stamp()}`,
                no: `PO-${String(stamp()).slice(-6)}`,
                prId: id,
                jobId: pr.jobId,
                supplier: "Demo Material Supplier Co., Ltd.",
                item: pr.item,
                qtyOrdered: pr.qty,
                qtyReceived: 0,
                unit: pr.unit,
                unitPrice: 1250,
                expectedDate: pr.neededBy,
                status: "APPROVED" as const,
              };
          return {
            ...s,
            purchaseRequests: s.purchaseRequests.map((x) =>
              x.id === id ? { ...x, status: "APPROVED" } : x,
            ),
            purchaseOrders: po ? [po, ...s.purchaseOrders] : s.purchaseOrders,
            activities: [
              {
                id: `a-${stamp()}`,
                at: "Now",
                user: "Demo User",
                role: s.role,
                action: "Purchase request approved — PO created",
                entity: pr.no,
              },
              ...s.activities,
            ],
          };
        }),
      receivePurchaseOrder: (id, qty) =>
        setState((s) => {
          const po = s.purchaseOrders.find((x) => x.id === id);
          const pr = s.purchaseRequests.find((x) => x.id === po?.prId);
          const item = s.inventoryItems.find((x) => x.partNo === pr?.partNo);
          if (!po || qty <= 0) return s;
          const accepted = Math.min(
            qty,
            Math.max(0, po.qtyOrdered - po.qtyReceived),
          );
          if (accepted <= 0) return s;
          const received = po.qtyReceived + accepted;
          const complete = received >= po.qtyOrdered;
          const receipt: GoodsReceipt = {
            id: `gr-${stamp()}`,
            no: `GR-${String(stamp()).slice(-6)}`,
            poId: id,
            receivedAt: "Now",
            qty: accepted,
            acceptedQty: accepted,
            rejectedQty: 0,
            warehouse: "Store 1 - Raw Materials",
            receivedBy: "Demo User",
          };
          return {
            ...s,
            purchaseOrders: s.purchaseOrders.map((x) =>
              x.id === id
                ? {
                    ...x,
                    qtyReceived: received,
                    status: complete ? "RECEIVED" : "PARTIAL",
                  }
                : x,
            ),
            goodsReceipts: [receipt, ...s.goodsReceipts],
            inventoryItems: s.inventoryItems.map((x) =>
              x.id === item?.id
                ? { ...x, currentStock: x.currentStock + accepted }
                : x,
            ),
            movements: [
              {
                id: `mv-${stamp()}`,
                date: "Now",
                itemId: item?.id ?? pr?.partNo ?? po.id,
                itemName: po.item,
                type: "IN",
                qty: accepted,
                reference: po.no,
                user: "Demo User",
              },
              ...s.movements,
            ],
            productionOrders: s.productionOrders.map((x) =>
              x.jobId === po.jobId && complete
                ? {
                    ...x,
                    status: "RELEASED",
                    operations: x.operations.map((op, index) =>
                      index === 0 && op.status === "WAITING"
                        ? { ...op, status: "READY" }
                        : op,
                    ),
                  }
                : x,
            ),
            jobs: s.jobs.map((x) =>
              x.id === po.jobId && complete
                ? { ...x, status: "PRODUCTION", progress: 55 }
                : x,
            ),
            activities: [
              {
                id: `a-${stamp()}`,
                at: "Now",
                user: "Demo User",
                role: s.role,
                action: complete
                  ? "PO fully received — Work Order released to production"
                  : `Goods received ${accepted} ${po.unit}`,
                entity: po.no,
              },
              ...s.activities,
            ],
          };
        }),
      postStock: (itemId, type, qty) =>
        setState((s) => {
          const item = s.inventoryItems.find((x) => x.id === itemId);
          if (!item || qty <= 0) return s;
          const outbound = type === "ISSUE" || type === "OUT";
          const delta = outbound ? -qty : qty;
          if (item.currentStock + delta < 0)
            return {
              ...s,
              notifications: [
                {
                  id: `n-${Date.now()}`,
                  title: "Stock transaction blocked",
                  detail: `${item.partNo} cannot go below zero`,
                  type: "INVENTORY",
                  read: false,
                },
                ...s.notifications,
              ],
            };
          return {
            ...s,
            inventoryItems: s.inventoryItems.map((x) =>
              x.id === itemId
                ? {
                    ...x,
                    currentStock: x.currentStock + delta,
                    reservedStock: outbound
                      ? Math.max(0, (x.reservedStock ?? 0) - qty)
                      : x.reservedStock,
                  }
                : x,
            ),
            movements: [
              {
                id: `mv-${Date.now()}`,
                date: "Now",
                itemId,
                itemName: item.name,
                type,
                qty: delta,
                reference: type === "ISSUE" ? "WO-2026-00128" : "STOCK-ACTION",
                user: "Demo User",
                lotNo: item.lotNo,
              },
              ...s.movements,
            ],
            activities: [
              {
                id: `a-${Date.now()}`,
                at: "Now",
                user: "Demo User",
                role: s.role,
                action: `Stock ${type.toLowerCase()} ${qty} ${item.unit}`,
                entity: item.partNo,
              },
              ...s.activities,
            ],
          };
        }),
      reserveStock: (itemId, qty) =>
        setState((s) => ({
          ...s,
          inventoryItems: s.inventoryItems.map((x) =>
            x.id === itemId
              ? {
                  ...x,
                  reservedStock: Math.min(
                    x.currentStock,
                    (x.reservedStock ?? 0) + Math.max(0, qty),
                  ),
                }
              : x,
          ),
        })),
      transferStock: (itemId, toLocation) =>
        setState((s) => {
          const item = s.inventoryItems.find((x) => x.id === itemId);
          if (!item) return s;
          return {
            ...s,
            inventoryItems: s.inventoryItems.map((x) =>
              x.id === itemId ? { ...x, location: toLocation } : x,
            ),
            movements: [
              {
                id: `mv-${Date.now()}`,
                date: "Now",
                itemId,
                itemName: item.name,
                type: "TRANSFER",
                qty: item.currentStock,
                reference: "STORE-TRANSFER",
                user: "Demo User",
                lotNo: item.lotNo,
                fromLocation: item.location,
                toLocation,
              },
              ...s.movements,
            ],
          };
        }),
      setOperationStatus: (orderId, operationId, status) =>
        setState((s) => {
          const source = s.productionOrders.find((x) => x.id === orderId);
          if (!source) return s;
          const index = source.operations.findIndex(
            (x) => x.id === operationId,
          );
          if (index < 0) return s;
          if (
            status === "IN_PROGRESS" &&
            index > 0 &&
            source.operations[index - 1].status !== "COMPLETED"
          )
            return {
              ...s,
              notifications: [
                {
                  id: `n-${stamp()}`,
                  title: "ยังเริ่ม Operation นี้ไม่ได้",
                  detail: "กรุณาปิด Operation ก่อนหน้าให้เรียบร้อย",
                  type: "PRODUCTION",
                  read: false,
                },
                ...s.notifications,
              ],
            };
          let operations = source.operations.map((op) =>
            op.id === operationId
              ? {
                  ...op,
                  status,
                  qtyGood:
                    status === "COMPLETED"
                      ? Math.max(op.qtyGood, op.qtyIn)
                      : op.qtyGood,
                  actualStart:
                    status === "IN_PROGRESS"
                      ? (op.actualStart ?? "Now")
                      : op.actualStart,
                  actualFinish:
                    status === "COMPLETED" ? "Now" : op.actualFinish,
                }
              : op,
          );
          if (
            status === "COMPLETED" &&
            operations[index + 1]?.status === "WAITING"
          )
            operations = operations.map((op, i) =>
              i === index + 1 ? { ...op, status: "READY" } : op,
            );
          const finished = operations.every((op) => op.status === "COMPLETED");
          const productionOrders = s.productionOrders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: finished
                    ? "QC"
                    : status === "IN_PROGRESS"
                      ? "IN_PROGRESS"
                      : order.status,
                  operations,
                }
              : order,
          );
          const finalOp = operations[operations.length - 1];
          const inspection =
            finished &&
            !s.qcInspections.some((x) => x.productionOrderId === orderId)
              ? {
                  id: `qc-${stamp()}`,
                  no: `QC-${String(stamp()).slice(-6)}`,
                  productionOrderId: orderId,
                  operationId: finalOp.id,
                  stage: "FINAL" as const,
                  inspector: "K. QC",
                  status: "PENDING" as const,
                  measurements: [
                    {
                      id: `qm-${stamp()}-1`,
                      characteristic: "Overall dimension",
                      nominal: 100,
                      lowerLimit: 99.95,
                      upperLimit: 100.05,
                      unit: "mm",
                      result: "PENDING" as const,
                    },
                    {
                      id: `qm-${stamp()}-2`,
                      characteristic: "Hole diameter",
                      nominal: 10,
                      lowerLimit: 9.95,
                      upperLimit: 10.05,
                      unit: "mm",
                      result: "PENDING" as const,
                    },
                  ],
                }
              : undefined;
          return {
            ...s,
            productionOrders,
            qcInspections: inspection
              ? [inspection, ...s.qcInspections]
              : s.qcInspections,
            jobs: s.jobs.map((j) =>
              j.id === source.jobId
                ? {
                    ...j,
                    status: finished ? "QC" : "PRODUCTION",
                    progress: finished ? 88 : Math.min(85, j.progress + 8),
                  }
                : j,
            ),
            activities: [
              {
                id: `a-${stamp()}`,
                at: "Now",
                user: "Demo User",
                role: s.role,
                action: finished
                  ? "Production completed — QC inspection created"
                  : `Operation ${status.toLowerCase()}`,
                entity: source.no,
              },
              ...s.activities,
            ],
          };
        }),
      recordDowntime: (orderId, operationId) =>
        setState((s) => {
          const record: DowntimeRecord = {
            id: `dt-${Date.now()}`,
            productionOrderId: orderId,
            operationId,
            reason: "Machine setup / unplanned stop",
            startedAt: "Now",
            endedAt: "Now + 15 min",
            minutes: 15,
            recordedBy: "Demo User",
          };
          return {
            ...s,
            downtimes: [record, ...s.downtimes],
            activities: [
              {
                id: `a-${Date.now()}`,
                at: "Now",
                user: "Demo User",
                role: s.role,
                action: "Downtime recorded (15 min)",
                entity:
                  s.productionOrders.find((x) => x.id === orderId)?.no ??
                  orderId,
              },
              ...s.activities,
            ],
          };
        }),
      transferOperationOutput: (orderId, operationId, qty) =>
        setState((s) => ({
          ...s,
          productionOrders: s.productionOrders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  operations: order.operations.map((op, index, all) => {
                    if (op.id !== operationId) return op;
                    const next = all[index + 1];
                    if (!next) return op;
                    return { ...op, qtyGood: Math.max(op.qtyGood, qty) };
                  }),
                }
              : order,
          ),
          activities: [
            {
              id: `a-${Date.now()}`,
              at: "Now",
              user: "Demo User",
              role: s.role,
              action: `Partial output transferred ${qty} PCS`,
              entity:
                s.productionOrders.find((x) => x.id === orderId)?.no ?? orderId,
            },
            ...s.activities,
          ],
        })),
      recordInspection: (id, values) =>
        setState((s) => {
          const source = s.qcInspections.find((x) => x.id === id);
          if (!source) return s;
          const order = s.productionOrders.find(
            (x) => x.id === source.productionOrderId,
          );
          const measurements = source.measurements.map((m, index) => {
            const measured = values[index];
            return {
              ...m,
              measured,
              result:
                measured >= m.lowerLimit && measured <= m.upperLimit
                  ? ("PASS" as const)
                  : ("FAIL" as const),
            };
          });
          const failed = measurements.some((x) => x.result === "FAIL");
          return {
            ...s,
            qcInspections: s.qcInspections.map((x) =>
              x.id === id
                ? { ...x, measurements, status: failed ? "FAIL" : "PASS" }
                : x,
            ),
            productionOrders: s.productionOrders.map((x) =>
              x.id === source.productionOrderId
                ? { ...x, status: failed ? "QC" : "COMPLETED" }
                : x,
            ),
            jobs: s.jobs.map((x) =>
              x.id === order?.jobId
                ? {
                    ...x,
                    status: failed ? "REWORK" : "PACKING",
                    progress: failed ? 90 : 95,
                  }
                : x,
            ),
            notifications: failed
              ? [
                  {
                    id: `n-${stamp()}`,
                    title: "QC measurement failed",
                    detail: `${source.no} requires disposition`,
                    type: "QC",
                    read: false,
                  },
                  ...s.notifications,
                ]
              : s.notifications,
            activities: [
              {
                id: `a-${stamp()}`,
                at: "Now",
                user: "Demo User",
                role: s.role,
                action: failed
                  ? "QC failed — rework required"
                  : "QC inspection passed — ready for packing",
                entity: source.no,
              },
              ...s.activities,
            ],
          };
        }),
      createRework: (inspectionId) =>
        setState((s) => {
          const inspection = s.qcInspections.find((x) => x.id === inspectionId);
          const production = s.productionOrders.find(
            (x) => x.id === inspection?.productionOrderId,
          );
          if (
            !inspection ||
            s.reworkOrders.some((x) => x.inspectionId === inspectionId)
          )
            return s;
          const order: ReworkOrder = {
            id: `rw-${stamp()}`,
            no: `RW-${String(stamp()).slice(-6)}`,
            inspectionId,
            productionOrderId: inspection.productionOrderId,
            operationId: inspection.operationId,
            quantity: 1,
            reason: "Measurement outside tolerance",
            status: "OPEN",
          };
          const jobId = production?.jobId;
          const baseLabour = s.jobCosts
            .filter((cost) => cost.jobId === jobId && cost.category === "LABOUR")
            .reduce((total, cost) => total + cost.actual, 0);
          const fallbackLabour = 12000;
          const labourToDouble = baseLabour || fallbackLabour;
          const reworkCost: JobCost | undefined = jobId
            ? {
                id: `jc-${stamp()}`,
                jobId,
                category: "REWORK",
                description: `ค่าแรงแก้ไข QC Fail (2× ค่าแรงจริง ${labourToDouble.toLocaleString()})`,
                estimated: 0,
                actual: labourToDouble * 2,
              }
            : undefined;
          return {
            ...s,
            reworkOrders: [order, ...s.reworkOrders],
            jobCosts: reworkCost
              ? [reworkCost, ...s.jobCosts]
              : s.jobCosts,
            qcInspections: s.qcInspections.map((x) =>
              x.id === inspectionId ? { ...x, status: "REWORK" } : x,
            ),
            jobs: s.jobs.map((x) =>
              x.id === production?.jobId
                ? { ...x, status: "REWORK", progress: 90 }
                : x,
            ),
            activities: [
              {
                id: `a-${stamp()}`,
                at: "Now",
                user: "Demo User",
                role: s.role,
                action: `สร้าง Rework และบันทึกค่าแรงแก้ไข 2 เท่า ${reworkCost ? reworkCost.actual.toLocaleString() : 0} บาท`,
                entity: order.no,
              },
              ...s.activities,
            ],
          };
        }),
      setComplaintStatus: (id, status) =>
        setState((s) => ({
          ...s,
          customerComplaints: s.customerComplaints.map((x) =>
            x.id === id ? { ...x, status } : x,
          ),
          activities: [
            {
              id: `a-${Date.now()}`,
              at: "Now",
              user: "Demo User",
              role: s.role,
              action: `Customer complaint ${status.toLowerCase()}`,
              entity: s.customerComplaints.find((x) => x.id === id)?.no ?? id,
            },
            ...s.activities,
          ],
        })),
      dispatchDelivery: (id, qty) =>
        setState((s) => {
          const delivery = s.deliveries.find((x) => x.id === id);
          if (!delivery || qty <= 0) return s;
          const delivered = Math.min(
            delivery.packedQty,
            delivery.deliveredQty + qty,
          );
          return {
            ...s,
            deliveries: s.deliveries.map((x) =>
              x.id === id
                ? {
                    ...x,
                    deliveredQty: delivered,
                    status: delivered >= x.packedQty ? "DELIVERED" : "PARTIAL",
                    recipient: "Customer Receiving",
                  }
                : x,
            ),
            jobs: s.jobs.map((x) =>
              x.id === delivery.jobId && delivered >= delivery.packedQty
                ? { ...x, status: "DELIVERED", progress: 100 }
                : x,
            ),
            activities: [
              {
                id: `a-${Date.now()}`,
                at: "Now",
                user: "Demo User",
                role: s.role,
                action: `Delivery dispatched ${qty} PCS`,
                entity: delivery.no,
              },
              ...s.activities,
            ],
          };
        }),
      dispatchTradeOrder: (id, qty) =>
        setState((s) => {
          const order = s.tradeOrders.find((x) => x.id === id);
          const item = s.inventoryItems.find((x) => x.id === order?.itemId);
          if (!order || !item || qty <= 0 || item.currentStock < qty) return s;
          const delivered = Math.min(order.quantity, order.deliveredQty + qty);
          return {
            ...s,
            tradeOrders: s.tradeOrders.map((x) =>
              x.id === id
                ? {
                    ...x,
                    deliveredQty: delivered,
                    status: delivered >= x.quantity ? "DELIVERED" : "PARTIAL",
                  }
                : x,
            ),
            inventoryItems: s.inventoryItems.map((x) =>
              x.id === item.id
                ? { ...x, currentStock: x.currentStock - qty }
                : x,
            ),
            movements: [
              {
                id: `mv-${Date.now()}`,
                date: "Now",
                itemId: item.id,
                itemName: item.name,
                type: "OUT",
                qty: -qty,
                reference: order.no,
                user: "Demo User",
                lotNo: item.lotNo,
              },
              ...s.movements,
            ],
          };
        }),
      setRole: (role) => setState((s) => ({ ...s, role })),
      markRead: (id) =>
        setState((s) => ({
          ...s,
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),
      markAllRead: () =>
        setState((s) => ({
          ...s,
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
      reset: () => setState(initial),
    }),
    [state, ready],
  );
  return <DemoContext.Provider value={store}>{children}</DemoContext.Provider>;
}
export const useDemo = () => {
  const v = useContext(DemoContext);
  if (!v) throw new Error("DemoProvider missing");
  return v;
};
