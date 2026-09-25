export type Role = "Executive" | "System Admin" | "Sales" | "Engineer" | "Drafting" | "Production Planner" | "Purchasing" | "Store / Warehouse" | "Production Supervisor" | "Production Operator" | "QC" | "Packing" | "Shipping" | "HR";
export type Status = "DRAFT" | "INTERNAL REVIEW" | "APPROVED" | "SENT" | "WAITING CUSTOMER" | "ACCEPTED" | "CHANGE REQUESTED" | "REJECTED" | "ENGINEERING" | "DRAFTING" | "PLANNING" | "PURCHASING" | "PRODUCTION" | "QC" | "REWORK" | "PACKING" | "DELIVERED" | "COMPLETED" | "OVERDUE" | "FAILED";
export interface Customer { id: string; code: string; name: string; province: string; contact: string; email: string; phone: string; status: "Active" | "Inactive"; credit: string; }
export interface QuoteItem { id: string; partName: string; partNo: string; material: string; qty: number; unit: string; unitPrice: number; discount: number; size?: string; parts?: string[]; drawingForm?: string; finishing?: string; }
export interface QuotationDocument { quotationNo: string; revision: string; date: string; validity: string; payment: string; leadTime: string; contact: string; project: string; branch: string; attn: string; cc: string; address: string; reference: string; drawingNo: string; drawingRev: string; deposit: string; delivery: string; credit: string; approvedBy: string; approvedRole: string; thaiNote: string; englishNote: string; amountWords: string; }
export interface QuotationImageBox { x: number; y: number; width: number; height: number; }
export interface Quotation { id: string; no: string; rev: number; customerId: string; customer: string; project: string; status: Status; created: string; validUntil: string; sales: string; items: QuoteItem[]; payment: string; leadTime: string; document?: QuotationDocument; drawingImage?: string | null; drawingImageBox?: QuotationImageBox; }
export interface Job { id: string; no: string; quotationId: string; customer: string; project: string; status: Status; due: string; progress: number; priority: "Normal" | "High" | "Critical"; }
export interface Activity { id: string; at: string; user: string; role: string; action: string; entity: string; }
export interface Notification { id: string; title: string; detail: string; type: string; read: boolean; }
export interface InventoryItem { id: string; partNo: string; name: string; category: string; unit: string; currentStock: number; minStock: number; location: string; reservedStock?:number; lotNo?:string; customerPartNo?:string; }
export interface StoreLocation { id: string; code: string; name: string; type: string; }
export interface StockMovement { id: string; date: string; itemId: string; itemName: string; type: "IN" | "OUT" | "ISSUE" | "RETURN" | "TRANSFER" | "ADJUST"; qty: number; reference: string; user: string; lotNo?:string; fromLocation?:string; toLocation?:string; }

export type ApprovalStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
export type InquiryStatus = "NEW" | "UNDER_REVIEW" | "FEASIBLE" | "NEEDS_INFO" | "CLOSED";

export interface SalesInquiry {
  id: string;
  no: string;
  customerId: string;
  customer: string;
  project: string;
  description: string;
  requestedQty: number;
  requestedDue: string;
  owner: string;
  status: InquiryStatus;
  createdAt: string;
}

export interface EngineeringReview {
  id: string;
  inquiryId: string;
  reviewer: string;
  result: "PENDING" | "FEASIBLE" | "NEEDS_INFO" | "NOT_FEASIBLE";
  material: string;
  processSummary: string;
  notes: string;
  reviewedAt?: string;
}

export interface SalesOrder {
  id: string;
  no: string;
  quotationId: string;
  customerPoNo: string;
  customer: string;
  project: string;
  orderDate: string;
  requestedDelivery: string;
  status: ApprovalStatus | "IN_PROGRESS" | "COMPLETED";
}

export interface BomLine { id: string; material: string; partNo: string; qtyPer: number; unit: string; }
export interface RoutingOperation { id: string; sequence: number; process: string; workCenter: string; plannedMinutes: number; outsourced: boolean; qcRequired: boolean; }
export interface JobPlan { id: string; jobId: string; revision: string; drawingNo: string; approvalStatus: ApprovalStatus; bom: BomLine[]; routing: RoutingOperation[]; }

export interface PurchaseRequest { id:string; no:string; jobId:string; item:string; partNo:string; qty:number; unit:string; neededBy:string; status:ApprovalStatus; requestedBy:string; }
export interface PurchaseOrder { id:string; no:string; prId:string; jobId:string; supplier:string; item:string; qtyOrdered:number; qtyReceived:number; unit:string; unitPrice:number; expectedDate:string; status:"DRAFT"|"PENDING"|"APPROVED"|"PARTIAL"|"RECEIVED"; }
export interface GoodsReceipt { id:string; no:string; poId:string; receivedAt:string; qty:number; acceptedQty:number; rejectedQty:number; warehouse:string; receivedBy:string; }
export interface ProductionOperation { id:string; sequence:number; process:string; workCenter:string; operator?:string; machine?:string; plannedStart:string; plannedFinish:string; actualStart?:string; actualFinish?:string; qtyIn:number; qtyGood:number; qtyRework:number; qtyScrap:number; status:"WAITING"|"READY"|"IN_PROGRESS"|"PAUSED"|"QC"|"COMPLETED"; }
export interface ProductionOrder { id:string; no:string; jobId:string; planId:string; targetQty:number; status:"DRAFT"|"RELEASED"|"IN_PROGRESS"|"QC"|"COMPLETED"; operations:ProductionOperation[]; }
export interface QcMeasurement { id:string; characteristic:string; nominal:number; lowerLimit:number; upperLimit:number; measured?:number; unit:string; result:"PENDING"|"PASS"|"FAIL"; }
export interface QcInspection { id:string; no:string; productionOrderId:string; operationId:string; stage:"IN_PROCESS"|"FINAL"; inspector:string; status:"PENDING"|"PASS"|"FAIL"|"REWORK"; measurements:QcMeasurement[]; }
export interface DeliveryRecord { id:string; no:string; salesOrderId:string; jobId:string; packedQty:number; deliveredQty:number; deliveryDate:string; status:"PREPARING"|"PARTIAL"|"DELIVERED"; recipient?:string; }
export interface JobCost { id:string; jobId:string; category:"MATERIAL"|"LABOUR"|"MACHINE"|"OUTSOURCE"|"REWORK"|"OTHER"; description:string; estimated:number; actual:number; }
export interface ReworkOrder { id:string; no:string; inspectionId:string; productionOrderId:string; operationId:string; quantity:number; reason:string; status:"OPEN"|"IN_PROGRESS"|"READY_FOR_REINSPECTION"|"CLOSED"; }
export interface CustomerComplaint { id:string; no:string; customer:string; deliveryId:string; jobId:string; description:string; receivedAt:string; status:"OPEN"|"INVESTIGATING"|"CORRECTIVE_ACTION"|"CLOSED"; }
export interface SalesFollowup { id:string; quotationId:string; dueDate:string; contactedAt?:string; outcome:"SCHEDULED"|"WAITING"|"WON"|"LOST"|"REVISE"; notes:string; owner:string; }
export interface TradeOrder { id:string; no:string; customer:string; itemId:string; quantity:number; unitPrice:number; unitCost:number; deliveredQty:number; status:"DRAFT"|"CONFIRMED"|"PARTIAL"|"DELIVERED"; }
export interface DowntimeRecord { id:string; productionOrderId:string; operationId:string; reason:string; startedAt:string; endedAt?:string; minutes:number; recordedBy:string; }
