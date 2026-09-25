import { Activity, Customer, Job, Notification, Quotation, InventoryItem, StoreLocation, StockMovement } from "@/types";

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
 {id:"inv1",partNo:"MAT-SS304-01",name:"Stainless Steel Sheet 304 2mm",category:"Raw Material",unit:"Sheet",currentStock:12,minStock:20,location:"Store 1 - Raw Materials"},
 {id:"inv2",partNo:"MAT-AL6061-05",name:"Aluminum Block 6061 50x50",category:"Raw Material",unit:"PCS",currentStock:45,minStock:30,location:"Store 1 - Raw Materials"},
 {id:"inv3",partNo:"PRT-M8-BOLT",name:"M8 Hex Bolt 30mm",category:"Fastener",unit:"PCS",currentStock:500,minStock:200,location:"Store 2 - Parts & Components"},
 {id:"inv4",partNo:"PRT-BRG-6204",name:"Bearing 6204ZZ",category:"Component",unit:"PCS",currentStock:15,minStock:20,location:"Store 2 - Parts & Components"},
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
