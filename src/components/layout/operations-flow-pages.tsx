"use client";

import { useMemo, useState } from "react";
import { ClipboardList, Factory, PackageSearch } from "lucide-react";
import { quoteTotal, statusClass, thb } from "@/lib/format";
import { useDemo } from "@/stores/demo-store";

function Header({title,subtitle,action}:{title:string;subtitle:string;action?:React.ReactNode}) { return <div className="page-header"><div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>; }
function Badge({status}:{status:string}) { return <span className={`badge ${statusClass(status)}`}>{status.replaceAll("_"," ")}</span>; }

export function PurchasingWorkspace() {
  const {purchaseRequests,purchaseOrders,goodsReceipts,approvePurchaseRequest,receivePurchaseOrder}=useDemo();
  return <>
    <Header title="จัดซื้อและรับสินค้า" subtitle="PR → อนุมัติ → PO → รับบางส่วน → Inventory"/>
    <section className="kpis"><div className="kpi blue"><span>Purchase requests</span><strong>{purchaseRequests.length}</strong><small>{purchaseRequests.filter(x=>x.status==="PENDING").length} awaiting approval</small></div><div className="kpi purple"><span>Open purchase orders</span><strong>{purchaseOrders.filter(x=>x.status!=="RECEIVED").length}</strong><small>Tracked by Job</small></div><div className="kpi green"><span>Goods receipts</span><strong>{goodsReceipts.length}</strong><small>Partial receipt supported</small></div></section>
    <div className="detail-grid"><section className="panel section"><h3>Purchase requests</h3>{purchaseRequests.map(pr=><div className="work-row" key={pr.id}><div><b>{pr.no} · {pr.partNo}</b><p>{pr.item} · {pr.qty} {pr.unit} · Needed {pr.neededBy}</p></div><Badge status={pr.status}/>{pr.status!=="APPROVED"&&<button className="primary" onClick={()=>approvePurchaseRequest(pr.id)}>Approve</button>}</div>)}</section>
    <section className="panel section"><h3>Purchase orders</h3>{purchaseOrders.map(po=>{const outstanding=po.qtyOrdered-po.qtyReceived;return <div className="work-row" key={po.id}><div><b>{po.no} · {po.supplier}</b><p>{po.item} · Received {po.qtyReceived}/{po.qtyOrdered} {po.unit}</p></div><Badge status={po.status}/>{outstanding>0&&<button className="primary" onClick={()=>receivePurchaseOrder(po.id,Math.min(5,outstanding))}>Receive {Math.min(5,outstanding)}</button>}</div>})}</section></div>
    <div className="panel table-panel"><table><thead><tr><th>Receipt</th><th>PO</th><th>Received</th><th>Accepted</th><th>Rejected</th><th>Warehouse</th><th>User</th></tr></thead><tbody>{goodsReceipts.map(gr=><tr key={gr.id}><td>{gr.no}<small>{gr.receivedAt}</small></td><td>{purchaseOrders.find(x=>x.id===gr.poId)?.no}</td><td>{gr.qty}</td><td>{gr.acceptedQty}</td><td>{gr.rejectedQty}</td><td>{gr.warehouse}</td><td>{gr.receivedBy}</td></tr>)}</tbody></table></div>
  </>;
}

export function ProductionWorkspace() {
  const {productionOrders,jobs,downtimes,setOperationStatus,recordDowntime,transferOperationOutput}=useDemo(); const order=productionOrders[0]; const job=jobs.find(x=>x.id===order?.jobId);
  if(!order)return null;
  return <>
    <Header title="ปฏิบัติงานฝ่ายผลิต" subtitle={`${order.no} · ${job?.no} · บันทึกคน เครื่อง เวลา และผลผลิตราย Operation`}/>
    <section className="kpis"><div className="kpi blue"><span>Target quantity</span><strong>{order.targetQty}</strong><small>PCS</small></div><div className="kpi green"><span>Completed operations</span><strong>{order.operations.filter(x=>x.status==="COMPLETED").length}/{order.operations.length}</strong><small>Routing progress</small></div><div className="kpi purple"><span>Rework / Scrap</span><strong>{order.operations.reduce((n,x)=>n+x.qtyRework+x.qtyScrap,0)}</strong><small>Recorded output exceptions</small></div></section>
    <div className="panel section"><div className="panel-head"><div><h3>Operation traveller</h3><span>Plan and actual timestamps are kept separately</span></div><Badge status={order.status}/></div>{order.operations.map(op=><div className="work-row" key={op.id}><b>{op.sequence}</b><div><b>{op.process}</b><p>{op.workCenter} · {op.operator??"Unassigned"} · {op.machine??"No machine"}</p><small>Plan {op.plannedStart}–{op.plannedFinish} · Actual {op.actualStart??"—"}–{op.actualFinish??"—"}</small></div><div><span>IN {op.qtyIn}</span><small>Good {op.qtyGood} · Rework {op.qtyRework} · Scrap {op.qtyScrap}</small></div><Badge status={op.status}/><div className="head-actions">{op.status==="READY"&&<button className="primary" onClick={()=>setOperationStatus(order.id,op.id,"IN_PROGRESS")}>Start</button>}{op.status==="IN_PROGRESS"&&<><button onClick={()=>recordDowntime(order.id,op.id)}>Downtime</button><button onClick={()=>transferOperationOutput(order.id,op.id,Math.min(4,op.qtyIn))}>Transfer 4</button><button className="primary" onClick={()=>setOperationStatus(order.id,op.id,"COMPLETED")}>Complete</button></>}</div></div>)}</div>
    <div className="panel table-panel"><table><thead><tr><th>Operation</th><th>Reason</th><th>Start / End</th><th>Minutes</th><th>Recorded by</th></tr></thead><tbody>{downtimes.map(d=><tr key={d.id}><td>{d.operationId}</td><td>{d.reason}</td><td>{d.startedAt}<small>{d.endedAt}</small></td><td>{d.minutes}</td><td>{d.recordedBy}</td></tr>)}</tbody></table></div>
  </>;
}

export function QcWorkspace() {
  const {qcInspections,productionOrders,reworkOrders,customerComplaints,recordInspection,createRework,setComplaintStatus}=useDemo(); const inspection=qcInspections[0];
  const [values,setValues]=useState<string[]>(inspection?.measurements.map(()=>"")??[]);
  if(!inspection)return null; const order=productionOrders.find(x=>x.id===inspection.productionOrderId);
  const submit=()=>recordInspection(inspection.id,inspection.measurements.map((m,i)=>Number(values[i]||m.nominal)));
  return <>
    <Header title="ตรวจสอบคุณภาพ (QC)" subtitle={`${inspection.no} · ${order?.no} · ${inspection.stage}`} action={<div className="head-actions"><button onClick={()=>window.print()}>พิมพ์รายงาน</button><button className="primary" onClick={submit}>บันทึกผลตรวจ</button></div>}/>
    <div className="detail-grid"><section className="panel section"><div className="panel-head"><div><h3>Measurement sheet</h3><span>Automatic tolerance validation</span></div><Badge status={inspection.status}/></div><table><thead><tr><th>Characteristic</th><th>Nominal</th><th>Tolerance</th><th>Measured</th><th>Result</th></tr></thead><tbody>{inspection.measurements.map((m,i)=><tr key={m.id}><td>{m.characteristic}</td><td>{m.nominal} {m.unit}</td><td>{m.lowerLimit}–{m.upperLimit}</td><td><input type="number" step="0.01" value={values[i]??""} placeholder={String(m.measured??m.nominal)} onChange={e=>setValues(v=>v.map((x,n)=>n===i?e.target.value:x))}/></td><td><Badge status={m.result}/></td></tr>)}</tbody></table></section><aside className="panel section"><h3>Disposition</h3><p className="muted">ค่าที่เกิน tolerance จะสร้างการแจ้งเตือนและเก็บหลักฐานสำหรับ Rework/Scrap</p><div className="action-button"><span>Inspector</span><b>{inspection.inspector}</b></div><div className="action-button"><span>Stage</span><b>{inspection.stage}</b></div><div className="action-button"><span>Linked operation</span><b>{inspection.operationId}</b></div>{["FAIL","REWORK"].includes(inspection.status)&&<button className="primary fullbutton" onClick={()=>createRework(inspection.id)}>Create rework order</button>}</aside></div>
    <div className="detail-grid"><section className="panel section"><h3>Rework & reinspection</h3>{reworkOrders.length?reworkOrders.map(r=><div className="work-row" key={r.id}><div><b>{r.no}</b><p>{r.reason} · Qty {r.quantity}</p></div><Badge status={r.status}/></div>):<div className="empty">No rework order</div>}</section><section className="panel section"><h3>Customer complaints</h3>{customerComplaints.map(c=><div className="work-row" key={c.id}><div><b>{c.no} · {c.customer}</b><p>{c.description}</p></div><Badge status={c.status}/>{c.status!=="CLOSED"&&<button className="text-action" onClick={()=>setComplaintStatus(c.id,c.status==="INVESTIGATING"?"CORRECTIVE_ACTION":"CLOSED")}>Advance</button>}</div>)}</section></div>
  </>;
}

export function DeliveryWorkspace() {
  const {deliveries,salesOrders,jobs,dispatchDelivery}=useDemo();
  return <>
    <Header title="บรรจุและจัดส่ง" subtitle="Finished Goods → บรรจุ → ส่งบางส่วน → ลูกค้ารับสินค้า"/>
    <div className="panel table-panel"><table><thead><tr><th>Delivery note</th><th>Sales order / Job</th><th>Packed</th><th>Delivered</th><th>Date</th><th>Status</th><th/></tr></thead><tbody>{deliveries.map(d=>{const remaining=d.packedQty-d.deliveredQty;return <tr key={d.id}><td className="table-main">{d.no}<small>{d.recipient??"Awaiting dispatch"}</small></td><td>{salesOrders.find(x=>x.id===d.salesOrderId)?.no}<small>{jobs.find(x=>x.id===d.jobId)?.no}</small></td><td>{d.packedQty}</td><td>{d.deliveredQty}</td><td>{d.deliveryDate}</td><td><Badge status={d.status}/></td><td>{remaining>0&&<button className="text-action" onClick={()=>dispatchDelivery(d.id,Math.min(4,remaining))}>Dispatch {Math.min(4,remaining)}</button>}</td></tr>})}</tbody></table></div>
  </>;
}

export function ActualCostingWorkspace() {
  const {jobCosts,jobs,quotes}=useDemo(); const job=jobs[0]; const costs=jobCosts.filter(x=>x.jobId===job.id); const quote=quotes.find(x=>x.id===job.quotationId); const selling=quote?quoteTotal(quote.items):0; const estimated=costs.reduce((n,x)=>n+x.estimated,0); const actual=costs.reduce((n,x)=>n+x.actual,0); const margin=selling?((selling-actual)/selling)*100:0;
  const byCategory=useMemo(()=>costs.map(c=>({...c,variance:c.actual-c.estimated})),[costs]);
  return <>
    <Header title="ต้นทุนจริงและกำไรของ Job" subtitle={`${job.no} · Material, ค่าแรง, เครื่องจักร, Outsource และ Rework`}/>
    <section className="kpis"><div className="kpi blue"><span>Selling price</span><strong>{thb(selling)}</strong><small>Quotation value before VAT</small></div><div className="kpi purple"><span>Estimated / Actual</span><strong>{thb(estimated)} / {thb(actual)}</strong><small>Variance {thb(actual-estimated)}</small></div><div className="kpi green"><span>Gross profit / Margin</span><strong>{thb(selling-actual)} · {margin.toFixed(1)}%</strong><small>Actual cost basis</small></div></section>
    <div className="panel table-panel"><table><thead><tr><th>Category</th><th>Description</th><th>Estimated</th><th>Actual</th><th>Variance</th></tr></thead><tbody>{byCategory.map(c=><tr key={c.id}><td><Badge status={c.category}/></td><td>{c.description}</td><td>{thb(c.estimated)}</td><td>{thb(c.actual)}</td><td className={c.variance>0?"text-red":"text-green"}>{thb(c.variance)}</td></tr>)}</tbody></table></div>
  </>;
}

export function TraceabilityWorkspace() {
  const s=useDemo(); const job=s.jobs[0]; const quote=s.quotes.find(x=>x.id===job.quotationId); const so=s.salesOrders.find(x=>x.quotationId===quote?.id); const plan=s.jobPlans.find(x=>x.jobId===job.id); const wo=s.productionOrders.find(x=>x.jobId===job.id); const qc=s.qcInspections.find(x=>x.productionOrderId===wo?.id); const delivery=s.deliveries.find(x=>x.jobId===job.id);
  const nodes=[["Quotation",quote?.no,quote?.status],["Sales Order",so?.no,so?.status],["Job",job.no,job.status],["Drawing / BOM",plan?.drawingNo,plan?.approvalStatus],["Work Order",wo?.no,wo?.status],["QC",qc?.no,qc?.status],["Delivery",delivery?.no,delivery?.status]];
  return <><Header title="การตรวจสอบย้อนกลับตลอดกระบวนการ" subtitle="เอกสารทุกขั้นอ้างย้อนกลับถึงลูกค้าและรายการขาย"/><div className="module-grid">{nodes.map(([label,no,status])=><section className="panel section" key={String(label)}><div className="industrial-icon">{label==="Work Order"?<Factory/>:label==="Delivery"?<PackageSearch/>:<ClipboardList/>}</div><h3>{label}</h3><b>{no??"ยังไม่สร้าง"}</b><p><Badge status={String(status??"MISSING")}/></p></section>)}</div></>;
}

export function SalesFollowupWorkspace() {
  const {salesFollowups,quotes,completeFollowup}=useDemo();
  return <><Header title="ติดตาม Quotation" subtitle="กำหนดวันติดตาม บันทึกผล และเหตุผล Lost/Revision"/><div className="panel table-panel"><table><thead><tr><th>Quotation</th><th>ลูกค้า</th><th>กำหนดติดตาม</th><th>ผู้รับผิดชอบ</th><th>ผลการติดตาม</th><th>หมายเหตุ</th><th/></tr></thead><tbody>{salesFollowups.map(f=>{const q=quotes.find(x=>x.id===f.quotationId);return <tr key={f.id}><td>{q?.no}<small>REV {q?.rev}</small></td><td>{q?.customer}</td><td>{f.dueDate}<small>{f.contactedAt??"ยังไม่ได้ติดต่อ"}</small></td><td>{f.owner}</td><td><Badge status={f.outcome}/></td><td>{f.notes}</td><td><div className="head-actions"><button className="text-action" onClick={()=>completeFollowup(f.id,"WAITING")}>รอตอบกลับ</button><button className="text-action" onClick={()=>completeFollowup(f.id,"REVISE")}>แก้ Revision</button><button className="text-action" onClick={()=>completeFollowup(f.id,"LOST")}>ปิดเป็น Lost</button></div></td></tr>})}</tbody></table></div></>;
}

export function TradeGoodsWorkspace() {
  const {tradeOrders,inventoryItems,dispatchTradeOrder}=useDemo();
  return <><Header title="สินค้าซื้อมาขายไป (Trade Goods)" subtitle="ซื้อมา–ขายไปโดยไม่ผ่าน Work Order พร้อมยอดคงเหลือและกำไร"/><div className="panel table-panel"><table><thead><tr><th>Order</th><th>ลูกค้า / Item</th><th>สั่ง / ส่งแล้ว</th><th>Stock</th><th>รายได้</th><th>ต้นทุน / กำไรขั้นต้น</th><th>สถานะ</th><th/></tr></thead><tbody>{tradeOrders.map(o=>{const item=inventoryItems.find(x=>x.id===o.itemId);const remain=o.quantity-o.deliveredQty;return <tr key={o.id}><td>{o.no}</td><td>{o.customer}<small>{item?.partNo} · {item?.name}</small></td><td>{o.quantity} / {o.deliveredQty}</td><td>{item?.currentStock} {item?.unit}</td><td>{thb(o.quantity*o.unitPrice)}</td><td>{thb(o.quantity*o.unitCost)} / <b>{thb(o.quantity*(o.unitPrice-o.unitCost))}</b></td><td><Badge status={o.status}/></td><td>{remain>0&&<button className="text-action" onClick={()=>dispatchTradeOrder(o.id,Math.min(2,remain))}>ส่ง {Math.min(2,remain)}</button>}</td></tr>})}</tbody></table></div></>;
}

export function QualityReportWorkspace() {
  const {qcInspections,reworkOrders,customerComplaints,productionOrders}=useDemo(); const scrap=productionOrders.flatMap(x=>x.operations).reduce((n,x)=>n+x.qtyScrap,0);
  return <><Header title="รายงาน QC, Rework และ Scrap" subtitle="สรุปผลตรวจ ปัญหา งานแก้ ของเสีย และข้อร้องเรียน" action={<button onClick={()=>window.print()}>พิมพ์รายงาน</button>}/><section className="kpis"><div className="kpi green"><span>รายการตรวจที่ผ่าน</span><strong>{qcInspections.filter(x=>x.status==="PASS").length}</strong><small>ผลตรวจที่บันทึกแล้ว</small></div><div className="kpi red"><span>ไม่ผ่าน / Rework</span><strong>{qcInspections.filter(x=>["FAIL","REWORK"].includes(x.status)).length}</strong><small>Rework Order {reworkOrders.length} รายการ</small></div><div className="kpi purple"><span>Scrap</span><strong>{scrap}</strong><small>PCS จากทุก Operation</small></div><div className="kpi blue"><span>ข้อร้องเรียนที่ยังเปิด</span><strong>{customerComplaints.filter(x=>x.status!=="CLOSED").length}</strong><small>กรณีคุณภาพจากลูกค้า</small></div></section></>;
}
