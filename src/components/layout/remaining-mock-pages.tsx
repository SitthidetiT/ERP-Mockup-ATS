"use client";

import { useState } from "react";
import { ClipboardList, Settings, Users } from "lucide-react";
import { quoteTotal, statusClass, thb } from "@/lib/format";
import { useDemo } from "@/stores/demo-store";

function Header({title,subtitle,action}:{title:string;subtitle:string;action?:React.ReactNode}) { return <div className="page-header"><div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>; }
function Badge({status}:{status:string}) { return <span className={`badge ${statusClass(status)}`}>{status.replaceAll("_"," ")}</span>; }

export function GovernanceWorkspace() {
  const {role,setRole}=useDemo(); const [signedIn,setSignedIn]=useState(true); const [delegated,setDelegated]=useState(false); const [makerChecker,setMakerChecker]=useState(true);
  return <><Header title="บัญชีผู้ใช้และการอนุมัติ" subtitle="จำลอง Login, สถานะบัญชี, การมอบหมายผู้อนุมัติ และกฎ Maker-checker"/>
    <section className="kpis"><div className="kpi green"><span>Session</span><strong>{signedIn?"เข้าสู่ระบบแล้ว":"ออกจากระบบแล้ว"}</strong><small>บัญชี Demo: demo.user@ats.local</small></div><div className="kpi blue"><span>Role ปัจจุบัน</span><strong>{role}</strong><small>Role และเมนูบันทึกใน Shared State</small></div><div className="kpi purple"><span>Maker-checker</span><strong>{makerChecker?"เปิดใช้งาน":"ปิด"}</strong><small>ผู้สร้างเอกสารอนุมัติเอกสารตนเองไม่ได้</small></div></section>
    <div className="detail-grid"><section className="panel section"><h3><Users size={18}/> บัญชี Demo</h3><label>Role<select value={role} onChange={e=>setRole(e.target.value as typeof role)}>{["Executive","System Admin","Sales","Engineer","Production Planner","Purchasing","Store / Warehouse","Production Supervisor","QC","Packing","Shipping","HR"].map(x=><option key={x}>{x}</option>)}</select></label><div className="form-actions"><button onClick={()=>setSignedIn(!signedIn)}>{signedIn?"ออกจากระบบ":"เข้าสู่ระบบ"}</button><button className="primary" onClick={()=>setMakerChecker(!makerChecker)}>สลับ Maker-checker</button></div></section>
    <section className="panel section"><h3><ClipboardList size={18}/> มอบหมายผู้อนุมัติ</h3><p>K. Manager → K. Deputy · 26–30 ก.ย. 2026</p><Badge status={delegated?"ACTIVE":"DRAFT"}/><button className="primary fullbutton" onClick={()=>setDelegated(!delegated)}>{delegated?"ยกเลิกการมอบหมาย":"เปิดใช้งานการมอบหมาย"}</button></section></div></>;
}

export function MasterDataWorkspace() {
  const {customers,inventoryItems}=useDemo(); const [active,setActive]=useState(true); const [converted,setConverted]=useState(0);
  return <><Header title="ควบคุม Master Data" subtitle="ข้อมูลผู้ติดต่อ, รหัสสินค้าลูกค้า, การแปลง UOM และการปิดใช้งานอย่างปลอดภัย"/>
    <div className="detail-grid"><section className="panel section"><h3>ผู้ติดต่อลูกค้า</h3><div className="work-row"><div><b>{customers[0]?.name}</b><p>ผู้ติดต่อหลัก: {customers[0]?.contact} · {customers[0]?.email}</p><small>Purchasing: K. Nattapong · Engineering: K. Somchai</small></div><Badge status="ACTIVE"/></div><button className="secondary">เพิ่มผู้ติดต่อ Demo</button></section>
    <section className="panel section"><h3>แปลง UOM</h3><label>จำนวนหน่วย KG<input type="number" defaultValue="12.5" onChange={e=>setConverted(Number(e.target.value)*1000)}/></label><p><b>{converted.toLocaleString()} กรัม</b> · อัตราแปลง: 1 KG = 1,000 G</p></section></div>
    <div className="panel table-panel"><table><thead><tr><th>รหัสภายใน / รหัสลูกค้า</th><th>สินค้า</th><th>ประเภท</th><th>Lot</th><th>สถานะ</th><th/></tr></thead><tbody>{inventoryItems.map(i=><tr key={i.id}><td>{i.partNo}<small>{i.customerPartNo??"ยังไม่ผูกรหัสลูกค้า"}</small></td><td>{i.name}</td><td>{i.category}</td><td>{i.lotNo}</td><td><Badge status={active?"ACTIVE":"INACTIVE"}/></td><td><button className="text-action" onClick={()=>setActive(!active)}>{active?"ปิดใช้งาน":"เปิดใช้งาน"}</button></td></tr>)}</tbody></table></div></>;
}

export function SalesExceptionsWorkspace() {
  const {quotes}=useDemo(); const quote=quotes[2]??quotes[0]; const [accepted,setAccepted]=useState<Record<string,number>>({}); const [expired,setExpired]=useState(false);
  return <><Header title="ข้อยกเว้นของ Quotation" subtitle="แจ้งเตือนหมดอายุและรองรับการยอมรับบางรายการ/บางจำนวน" action={<button className="primary" onClick={()=>setExpired(true)}>ตรวจวันหมดอายุ</button>}/>{expired&&<div className="alert critical"><span/><div><b>Quotation ใกล้หมดอายุ</b><p>ต้องติดตาม {quote.no} ก่อน {quote.validUntil}</p></div></div>}
    <div className="panel table-panel"><table><thead><tr><th>รายการ</th><th>จำนวนเสนอ</th><th>จำนวนที่ลูกค้ายอมรับ</th><th>มูลค่าที่ยอมรับ</th></tr></thead><tbody>{quote.items.map(i=><tr key={i.id}><td>{i.partName}<small>{i.partNo}</small></td><td>{i.qty} {i.unit}</td><td><input type="number" min="0" max={i.qty} value={accepted[i.id]??0} onChange={e=>setAccepted({...accepted,[i.id]:Math.min(i.qty,Number(e.target.value))})}/></td><td>{thb((accepted[i.id]??0)*i.unitPrice)}</td></tr>)}</tbody></table><div className="summary-strip"><span>ยอดเดิม {thb(quoteTotal(quote.items))}</span><b>ยอดที่ยอมรับ {thb(quote.items.reduce((n,i)=>n+(accepted[i.id]??0)*i.unitPrice,0))}</b><span>ส่วนต่างต้องให้ Sales อนุมัติ</span></div></div></>;
}

export function EngineeringChangeWorkspace() {
  const [status,setStatus]=useState("DRAFT"); const [compare,setCompare]=useState(false);
  return <><Header title="ควบคุมการเปลี่ยนแปลง Engineering" subtitle="การเปลี่ยน Material/Drawing, วิเคราะห์ผลกระทบ, อนุมัติ และจำลองเปรียบเทียบ CAD"/>
    <div className="detail-grid"><section className="panel section"><h3>ECN-2026-0011</h3><dl className="doc-meta"><div><dt>รายการเปลี่ยน</dt><dd>SS400 → S45C</dd></div><div><dt>Drawing</dt><dd>ATS-AMP-128 REV 2 → REV 3</dd></div><div><dt>ผลกระทบ</dt><dd>BOM, Routing, ต้นทุน, Work Order ที่เปิดอยู่</dd></div><div><dt>ผู้อนุมัติ</dt><dd>Engineering Manager</dd></div></dl><Badge status={status}/><div className="form-actions"><button onClick={()=>setStatus("PENDING")}>ส่งอนุมัติ</button><button className="primary" onClick={()=>setStatus("APPROVED")}>อนุมัติ</button></div></section>
    <section className="panel section"><h3>เปรียบเทียบ CAD Revision</h3><button className="secondary fullbutton" onClick={()=>setCompare(!compare)}>เปรียบเทียบ REV 2 ↔ REV 3</button>{compare&&<div className="workflow"><span className="done">รู Ø10 → Ø12</span><span className="current">แก้หมายเหตุ Material</span><span>ขนาด 2 จุดไม่เปลี่ยน</span></div>}</section></div></>;
}

export function SchedulingWorkspace() {
  const {productionOrders}=useDemo(); const [scheduled,setScheduled]=useState(false); const operations=productionOrders[0]?.operations??[];
  return <><Header title="ผู้ช่วยจัดตารางกำลังการผลิต" subtitle="จำลองการจัดตารางอัตโนมัติตาม Load ของ Work Center" action={<button className="primary" onClick={()=>setScheduled(true)}>สร้างตารางแนะนำ</button>}/><div className="panel table-panel"><table><thead><tr><th>ลำดับ</th><th>Operation</th><th>Work Center</th><th>ช่วงเวลาที่แนะนำ</th><th>ผล Capacity</th></tr></thead><tbody>{operations.map((op,i)=><tr key={op.id}><td>{op.sequence}</td><td>{op.process}</td><td>{op.workCenter}</td><td>{scheduled?`วันที่ ${i+1} · 08:00–${Math.min(17,9+Math.ceil(op.qtyIn/4))}:00`:"ยังไม่จัดตาราง"}</td><td><Badge status={scheduled?(i===2?"OVERLOAD":"AVAILABLE"):"PENDING"}/></td></tr>)}</tbody></table></div></>;
}

export function SupplierComparisonWorkspace() {
  const [selected,setSelected]=useState("SQ2"); const offers=[{id:"SQ1",supplier:"Thai Metals",price:2450,lead:5,terms:"30 days"},{id:"SQ2",supplier:"Eastern Steel",price:2520,lead:3,terms:"45 days"},{id:"SQ3",supplier:"Siam Material",price:2380,lead:8,terms:"Cash"}];
  return <><Header title="เปรียบเทียบ Supplier Quotation" subtitle="เปรียบเทียบราคา, Lead Time และเงื่อนไขชำระก่อนออก PO"/><div className="panel table-panel"><table><thead><tr><th>Supplier</th><th>ราคาต่อหน่วย</th><th>Lead Time</th><th>เงื่อนไข</th><th>การเลือก</th></tr></thead><tbody>{offers.map(x=><tr key={x.id}><td>{x.supplier}</td><td>{thb(x.price)}</td><td>{x.lead} วัน</td><td>{x.terms}</td><td><button className={selected===x.id?"primary":"text-action"} onClick={()=>setSelected(x.id)}>{selected===x.id?"เลือกแล้ว":"เลือก"}</button></td></tr>)}</tbody></table></div></>;
}
