import { Activity, Customer, Job, Notification, Quotation, InventoryItem, StoreLocation, StockMovement, SalesInquiry, EngineeringReview, SalesOrder, JobPlan, PurchaseRequest, PurchaseOrder, GoodsReceipt, ProductionOrder, QcInspection, DeliveryRecord, JobCost, ReworkOrder, CustomerComplaint, SalesFollowup, TradeOrder, DowntimeRecord } from "@/types";

export const seedCustomers: Customer[] = [
 {id:"c1",code:"CUS-0001",name:"Cal-Comp Automation and Industrial 4.0 Service (Thailand) Co., Ltd.",province:"Chonburi",contact:"Nattapong J.",email:"nattapong@calcomp.co.th",phone:"038-000-181",status:"Active",credit:"Credit 30 Days"},
 {id:"c2",code:"CUS-0002",name:"Siam Precision Parts Co., Ltd.",province:"Rayong",contact:"Pimchanok S.",email:"pimchanok@siamprecision.co.th",phone:"033-280-901",status:"Active",credit:"Credit 30 Days"},
 {id:"c3",code:"CUS-0003",name:"Thai Summit Manufacturing Co., Ltd.",province:"Samut Prakan",contact:"Krit P.",email:"krit@thaisummit.co.th",phone:"02-744-0100",status:"Active",credit:"Deposit 50%"},
 {id:"c4",code:"CUS-0004",name:"Eastern Automation Systems Co., Ltd.",province:"Chonburi",contact:"Arisa T.",email:"arisa@easternauto.co.th",phone:"038-945-218",status:"Active",credit:"Credit 45 Days"},
 {id:"c5",code:"CUS-0005",name:"Mitsui Components Thailand",province:"Ayutthaya",contact:"Somsak L.",email:"somsak@mitsui.co.th",phone:"035-220-456",status:"Active",credit:"Credit 30 Days"},
];
const sampleItems = [{id:"i1",partName:"Base Plate Assembly",partNo:"ATS-BP-042",material:"SS400",qty:4,unit:"PCS",unitPrice:28500,discount:0},{id:"i2",partName:"Precision Guide Block",partNo:"ATS-GB-119",material:"S45C",qty:8,unit:"PCS",unitPrice:12600,discount:1200},{id:"i3",partName:"Safety Cover Set",partNo:"ATS-SC-088",material:"SUS304",qty:2,unit:"SET",unitPrice:37200,discount:0}];
export const seedQuotes: Quotation[] = [
 {id:"q1",no:"CALH22609-013",rev:2,customerId:"c1",customer:seedCustomers[0].name,project:"Automation Machine Part",status:"ACCEPTED",created:"14 Sep 2026",validUntil:"14 Oct 2026",sales:"K. Narin",items:sampleItems,payment:"Credit 30 Days",leadTime:"4 Weeks"},
 {id:"q2",no:"ATS-2609-014",rev:0,customerId:"c2",customer:seedCustomers[1].name,project:"Conveyor Guarding",status:"ACCEPTED",created:"12 Sep 2026",validUntil:"12 Oct 2026",sales:"K. Narin",items:sampleItems.slice(0,2),payment:"Deposit 50%",leadTime:"3 Weeks"},
 {id:"q3",no:"ATS-2609-015",rev:1,customerId:"c3",customer:seedCustomers[2].name,project:"Jig & Fixture Series B",status:"INTERNAL REVIEW",created:"11 Sep 2026",validUntil:"11 Oct 2026",sales:"K. Aom",items:sampleItems.slice(1),payment:"Credit 30 Days",leadTime:"5 Weeks"}
];
export const seedJobs: Job[] = [
 {id:"j1",no:"JOB-2026-00128",quotationId:"q1",customer:seedCustomers[0].name,project:"Automation Machine Part · DWG ATS-AMP-128 REV 2",status:"PRODUCTION",due:"30 Sep 2026",progress:68,priority:"High"},
 {id:"j2",no:"JOB-2026-00129",quotationId:"q2",customer:seedCustomers[1].name,project:"Conveyor Guarding · QC FAIL → REWORK",status:"REWORK",due:"28 Sep 2026",progress:76,priority:"Critical"},
 {id:"j3",no:"JOB-2026-00130",quotationId:"q3",customer:seedCustomers[2].name,project:"Jig & Fixture Series B · Material Shortage",status:"PURCHASING",due:"02 Oct 2026",progress:34,priority:"High"},
 {id:"j4",no:"JOB-2026-00131",quotationId:"q3",customer:seedCustomers[3].name,project:"Robot Cell Bracket · Outsource Delay",status:"PLANNING",due:"27 Sep 2026",progress:41,priority:"High"},
 {id:"j5",no:"JOB-2026-00132",quotationId:"q2",customer:seedCustomers[4].name,project:"Urgent Machine Guard · Due Soon",status:"QC",due:"26 Sep 2026",progress:88,priority:"Critical"}
];
export const seedActivities: Activity[] = [
 {id:"a1",at:"09:24",user:"K. Woranuch",role:"QC",action:"QC queue updated",entity:"JOB-2026-00132"},{id:"a2",at:"09:17",user:"K. Anan",role:"Warehouse",action:"Material shortage escalated",entity:"JOB-2026-00130"},{id:"a3",at:"08:50",user:"K. Narin",role:"Sales",action:"Customer accepted quotation",entity:"CALH22609-013 REV 2"},{id:"a4",at:"08:34",user:"K. Preecha",role:"Drafting",action:"Drawing REV 2 approved",entity:"DWG ATS-AMP-128"}
];
export const seedNotifications: Notification[] = [
 {id:"n1",title:"Urgent job due tomorrow",detail:"JOB-2026-00132 requires QC disposition",type:"DEADLINE",read:false},{id:"n2",title:"Material shortage",detail:"JOB-2026-00130 · SUS304 sheet below safety stock",type:"PURCHASE",read:false},{id:"n3",title:"QC rework required",detail:"JOB-2026-00129 · Dimension tolerance out of range",type:"QC",read:false},{id:"n4",title:"Outsource delay",detail:"JOB-2026-00131 · coating supplier late",type:"DRAWING",read:true}
];

export const seedInventoryItems: InventoryItem[] = [
 {id:"inv1",partNo:"MAT-SS304-01",customerPartNo:"CCAT-SUS-2T",name:"Stainless Steel Sheet 304 2mm",category:"Raw Material",unit:"Sheet",currentStock:12,reservedStock:8,minStock:20,location:"Store 1 - Raw Materials",lotNo:"LOT-SS304-2609"},
 {id:"inv2",partNo:"MAT-AL6061-05",customerPartNo:"AL-BLOCK-5050",name:"Aluminum Block 6061 50x50",category:"Raw Material",unit:"PCS",currentStock:45,reservedStock:6,minStock:30,location:"Store 1 - Raw Materials",lotNo:"LOT-AL-2608"},
 {id:"inv3",partNo:"PRT-M8-BOLT",name:"M8 Hex Bolt 30mm",category:"Consumable",unit:"PCS",currentStock:500,reservedStock:40,minStock:200,location:"Store 2 - Parts & Components",lotNo:"LOT-BOLT-2609"},
 {id:"inv4",partNo:"PRT-BRG-6204",customerPartNo:"BRG-6204ZZ",name:"Bearing 6204ZZ",category:"Trade Good",unit:"PCS",currentStock:15,reservedStock:4,minStock:20,location:"Store 2 - Parts & Components",lotNo:"LOT-BRG-2609"},
];

export const seedStores: StoreLocation[] = [
 {id:"st1",code:"STR-01",name:"Store 1 - Raw Materials",type:"Raw Material"},
 {id:"st2",code:"STR-02",name:"Store 2 - Parts & Components",type:"Component"},
 {id:"st3",code:"STR-03",name:"Store 3 - Finished Goods",type:"Finished Goods"},
];

export const seedMovements: StockMovement[] = [
 {id:"mv1",date:"25 Sep 2026 09:15",itemId:"inv1",itemName:"Stainless Steel Sheet 304 2mm",type:"OUT",qty:-5,reference:"JOB-2026-00128",user:"K. Anan"},
 {id:"mv2",date:"24 Sep 2026 14:30",itemId:"inv3",itemName:"M8 Hex Bolt 30mm",type:"IN",qty:200,reference:"PO-2026-095",user:"K. Somchai"},
];

export const seedInquiries: SalesInquiry[] = [
 {id:"inq1",no:"INQ-2026-0042",customerId:"c1",customer:seedCustomers[0].name,project:"Automation Machine Part",description:"Base plate, guide block and safety cover from customer drawing ATS-AMP-128",requestedQty:14,requestedDue:"30 Sep 2026",owner:"K. Narin",status:"FEASIBLE",createdAt:"10 Sep 2026"},
 {id:"inq2",no:"INQ-2026-0043",customerId:"c4",customer:seedCustomers[3].name,project:"Robot Cell Bracket",description:"Review coating specification and supplier lead time",requestedQty:24,requestedDue:"10 Oct 2026",owner:"K. Aom",status:"NEEDS_INFO",createdAt:"23 Sep 2026"}
];

export const seedEngineeringReviews: EngineeringReview[] = [
 {id:"er1",inquiryId:"inq1",reviewer:"K. Somchai",result:"FEASIBLE",material:"SS400 / S45C / SUS304",processSummary:"CNC Milling → Drilling → Grinding → Hardening → Coating → QC",notes:"Drawing REV 2 approved for quotation",reviewedAt:"12 Sep 2026"},
 {id:"er2",inquiryId:"inq2",reviewer:"K. Preecha",result:"NEEDS_INFO",material:"SS400",processSummary:"Laser → Welding → Coating",notes:"Waiting for coating specification"}
];

export const seedSalesOrders: SalesOrder[] = [
 {id:"so1",no:"SO-2026-00128",quotationId:"q1",customerPoNo:"PO-CCAT-260914",customer:seedCustomers[0].name,project:"Automation Machine Part",orderDate:"14 Sep 2026",requestedDelivery:"30 Sep 2026",status:"IN_PROGRESS"}
];

export const seedJobPlans: JobPlan[] = [
 {id:"plan1",jobId:"j1",revision:"REV 2",drawingNo:"DWG ATS-AMP-128",approvalStatus:"APPROVED",bom:[
  {id:"bom1",material:"Steel Plate SS400 20mm",partNo:"MAT-SS400-20",qtyPer:4,unit:"PCS"},
  {id:"bom2",material:"Guide Block S45C",partNo:"MAT-S45C-GB",qtyPer:8,unit:"PCS"},
  {id:"bom3",material:"SUS304 Sheet 2mm",partNo:"MAT-SS304-01",qtyPer:2,unit:"SHEET"}
 ],routing:[
  {id:"op1",sequence:10,process:"CNC Milling",workCenter:"CNC Milling",plannedMinutes:480,outsourced:false,qcRequired:true},
  {id:"op2",sequence:20,process:"Drilling / Deburring / Tapping",workCenter:"Drilling",plannedMinutes:240,outsourced:false,qcRequired:false},
  {id:"op3",sequence:30,process:"Grinding",workCenter:"Grinding",plannedMinutes:180,outsourced:false,qcRequired:true},
  {id:"op4",sequence:40,process:"Hardening",workCenter:"External Supplier",plannedMinutes:1440,outsourced:true,qcRequired:true},
  {id:"op5",sequence:50,process:"Coating",workCenter:"External Supplier",plannedMinutes:1440,outsourced:true,qcRequired:true},
  {id:"op6",sequence:60,process:"Final QC",workCenter:"QC",plannedMinutes:120,outsourced:false,qcRequired:true}
 ]}
];

export const seedPurchaseRequests: PurchaseRequest[] = [
 {id:"pr1",no:"PR-2026-0088",jobId:"j3",item:"Stainless Steel Sheet 304 2mm",partNo:"MAT-SS304-01",qty:20,unit:"SHEET",neededBy:"28 Sep 2026",status:"APPROVED",requestedBy:"K. Planner"}
];
export const seedPurchaseOrders: PurchaseOrder[] = [
 {id:"po1",no:"PO-2026-0095",prId:"pr1",jobId:"j3",supplier:"Thai Metals Supply Co., Ltd.",item:"Stainless Steel Sheet 304 2mm",qtyOrdered:20,qtyReceived:8,unit:"SHEET",unitPrice:2450,expectedDate:"28 Sep 2026",status:"PARTIAL"}
];
export const seedGoodsReceipts: GoodsReceipt[] = [
 {id:"gr1",no:"GR-2026-0041",poId:"po1",receivedAt:"25 Sep 2026 09:15",qty:8,acceptedQty:8,rejectedQty:0,warehouse:"Store 1 - Raw Materials",receivedBy:"K. Anan"}
];
export const seedProductionOrders: ProductionOrder[] = [
 {id:"wo1",no:"WO-2026-00128",jobId:"j1",planId:"plan1",targetQty:14,status:"IN_PROGRESS",operations:[
  {id:"wop1",sequence:10,process:"CNC Milling",workCenter:"CNC Milling",operator:"K. Chai",machine:"CNC-M01",plannedStart:"22 Sep 08:00",plannedFinish:"22 Sep 17:00",actualStart:"22 Sep 08:12",actualFinish:"22 Sep 16:48",qtyIn:14,qtyGood:14,qtyRework:0,qtyScrap:0,status:"COMPLETED"},
  {id:"wop2",sequence:20,process:"Drilling / Deburring / Tapping",workCenter:"Drilling",operator:"K. Win",machine:"DRL-02",plannedStart:"23 Sep 08:00",plannedFinish:"23 Sep 14:00",actualStart:"23 Sep 08:05",actualFinish:"23 Sep 14:20",qtyIn:14,qtyGood:13,qtyRework:1,qtyScrap:0,status:"COMPLETED"},
  {id:"wop3",sequence:30,process:"Grinding",workCenter:"Grinding",operator:"K. Ton",machine:"GRD-01",plannedStart:"24 Sep 08:00",plannedFinish:"24 Sep 15:00",actualStart:"24 Sep 08:30",qtyIn:13,qtyGood:8,qtyRework:0,qtyScrap:0,status:"IN_PROGRESS"},
  {id:"wop4",sequence:40,process:"Final QC",workCenter:"QC",plannedStart:"25 Sep 09:00",plannedFinish:"25 Sep 12:00",qtyIn:8,qtyGood:0,qtyRework:0,qtyScrap:0,status:"READY"}
 ]}
];
export const seedQcInspections: QcInspection[] = [
 {id:"qc1",no:"QC-2026-0128",productionOrderId:"wo1",operationId:"wop4",stage:"FINAL",inspector:"K. Woranuch",status:"PENDING",measurements:[
  {id:"qm1",characteristic:"Overall width",nominal:100,lowerLimit:99.95,upperLimit:100.05,unit:"mm",result:"PENDING"},
  {id:"qm2",characteristic:"Hole diameter",nominal:10,lowerLimit:9.95,upperLimit:10.05,unit:"mm",result:"PENDING"}
 ]}
];
export const seedDeliveries: DeliveryRecord[] = [
 {id:"del1",no:"DN-2026-0068",salesOrderId:"so1",jobId:"j1",packedQty:8,deliveredQty:0,deliveryDate:"30 Sep 2026",status:"PREPARING"}
];
export const seedJobCosts: JobCost[] = [
 {id:"jc1",jobId:"j1",category:"MATERIAL",description:"Issued raw materials",estimated:65800,actual:68400},
 {id:"jc2",jobId:"j1",category:"LABOUR",description:"Internal labour",estimated:26400,actual:24800},
 {id:"jc3",jobId:"j1",category:"MACHINE",description:"Machine hours",estimated:9100,actual:10200},
 {id:"jc4",jobId:"j1",category:"OUTSOURCE",description:"Hardening and coating",estimated:12800,actual:13600},
 {id:"jc5",jobId:"j1",category:"REWORK",description:"Drilling rework",estimated:0,actual:1800}
 ,{id:"jc6",jobId:"j2",category:"MATERIAL",description:"Steel and coating materials",estimated:72000,actual:74800}
 ,{id:"jc7",jobId:"j2",category:"LABOUR",description:"ค่าแรงผลิตก่อน QC",estimated:18000,actual:19200}
 ,{id:"jc8",jobId:"j2",category:"MACHINE",description:"Laser and welding machine",estimated:14500,actual:15100}
 ,{id:"jc9",jobId:"j2",category:"OUTSOURCE",description:"Powder coating",estimated:22000,actual:23800}
 ,{id:"jc10",jobId:"j2",category:"REWORK",description:"ค่าแรงแก้ไข QC Fail (2× ค่าแรงจริง 19,200)",estimated:0,actual:38400}
];
export const seedReworkOrders: ReworkOrder[] = [];
export const seedCustomerComplaints: CustomerComplaint[] = [
 {id:"cmp1",no:"CMP-2026-0004",customer:seedCustomers[1].name,deliveryId:"del1",jobId:"j2",description:"Surface scratch found during incoming inspection",receivedAt:"24 Sep 2026",status:"INVESTIGATING"}
];
export const seedSalesFollowups: SalesFollowup[] = [
 {id:"fu1",quotationId:"q3",dueDate:"26 Sep 2026",outcome:"SCHEDULED",notes:"Confirm revised delivery lead time",owner:"K. Aom"},
 {id:"fu2",quotationId:"q2",dueDate:"20 Sep 2026",contactedAt:"20 Sep 2026",outcome:"WON",notes:"Customer PO received",owner:"K. Narin"}
];
export const seedTradeOrders: TradeOrder[] = [
 {id:"tr1",no:"TRD-2026-0012",customer:seedCustomers[3].name,itemId:"inv4",quantity:4,unitPrice:1450,unitCost:920,deliveredQty:0,status:"CONFIRMED"}
];
export const seedDowntimes: DowntimeRecord[] = [
 {id:"dt1",productionOrderId:"wo1",operationId:"wop3",reason:"Grinding wheel replacement",startedAt:"24 Sep 11:10",endedAt:"24 Sep 11:40",minutes:30,recordedBy:"K. Ton"}
];
