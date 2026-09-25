"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Plus, Search, ChevronDown } from "lucide-react";
import { useDemo } from "@/stores/demo-store";
import { Header, Badge } from "@/components/layout/erp-app";

export function InventoryItems() {
  const { inventoryItems, postStock, reserveStock, transferStock } = useDemo();
  const [query, setQuery] = useState("");
  
  const list = inventoryItems.filter(i => 
    `${i.partNo} ${i.name} ${i.category}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <Header 
        title="รายการสินค้าใน Stock"
        subtitle="Master Item และจำนวนคงเหลือที่พร้อมใช้งาน"
        action={<button className="primary"><Plus size={17}/> เพิ่ม Item</button>}
      />
      <div className="toolbar">
        <label>
          <Search size={16}/>
          <input 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            placeholder="ค้นหา Part Number หรือชื่อสินค้า"
          />
        </label>
        <button>ประเภท <ChevronDown size={15}/></button>
        <button>คลัง <ChevronDown size={15}/></button>
        <span>{list.length} รายการ</span>
      </div>
      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Part / รายละเอียด</th>
              <th>ประเภท</th>
              <th>ตำแหน่งจัดเก็บ</th>
              <th>คงเหลือ / จอง / ใช้ได้</th>
              <th>สถานะ</th>
              <th/>
            </tr>
          </thead>
          <tbody>
            {list.map(i => {
              const status = i.currentStock <= i.minStock ? "FAILED" : "COMPLETED";
              const statusText = i.currentStock <= i.minStock ? "Low Stock" : "In Stock";
              return (
                <tr key={i.id}>
                  <td>
                    <span className="table-main">
                      {i.name}
                      <small>{i.partNo}{i.customerPartNo ? ` · Customer ${i.customerPartNo}` : ""} · {i.lotNo??"No lot"}</small>
                    </span>
                  </td>
                  <td>{i.category}</td>
                  <td>{i.location}</td>
                  <td>
                    <b>{i.currentStock}</b> / {i.reservedStock??0} / {i.currentStock-(i.reservedStock??0)} <small>{i.unit}</small>
                  </td>
                  <td><Badge status={status} /> {statusText !== "In Stock" && <small className="muted">Min: {i.minStock}</small>}</td>
                  <td><div className="head-actions"><button className="text-action" onClick={()=>reserveStock(i.id,1)}>จอง</button><button className="text-action" onClick={()=>postStock(i.id,"ISSUE",1)}>เบิก</button><button className="text-action" onClick={()=>postStock(i.id,"RETURN",1)}>คืน</button><button className="text-action" onClick={()=>postStock(i.id,"ADJUST",1)}>+ ปรับยอด</button><button className="text-action" onClick={()=>transferStock(i.id,i.location.startsWith("Store 1")?"Store 2 - Parts & Components":"Store 1 - Raw Materials")}>โอนคลัง</button></div></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function InventoryStores() {
  const { stores } = useDemo();
  
  return (
    <>
      <Header 
        title="คลังและตำแหน่งจัดเก็บ"
        subtitle="จัดการคลังสินค้า พื้นที่ และ Zone จัดเก็บ"
        action={<button className="primary"><Plus size={17}/> เพิ่มคลัง</button>}
      />
      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>ชื่อคลัง</th>
              <th>ประเภทคลัง</th>
              <th>รหัส</th>
              <th/>
            </tr>
          </thead>
          <tbody>
            {stores.map(s => (
              <tr key={s.id}>
                <td>
                    <span className="table-main">
                      {s.name}
                    </span>
                </td>
                <td>{s.type}</td>
                <td>{s.code}</td>
                <td><span className="text-action">ตั้งค่าแล้ว</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function StockMovements() {
  const { movements } = useDemo();
  
  return (
    <>
      <Header 
        title="ความเคลื่อนไหว Stock"
        subtitle="ประวัติรับเข้า จ่ายออก และโอนคลังทั้งหมด"
        action={<button className="primary">ส่งออก CSV</button>}
      />
      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>วันที่ / เวลา</th>
              <th>Item</th>
              <th>ประเภท</th>
              <th>จำนวน</th>
              <th>เอกสารอ้างอิง</th>
              <th>ผู้ทำรายการ</th>
            </tr>
          </thead>
          <tbody>
            {movements.map(m => (
              <tr key={m.id}>
                <td>{m.date}</td>
                <td>
                  <span className="table-main">
                    {m.itemName}
                    <small>{m.lotNo??"No lot"}{m.fromLocation?` · ${m.fromLocation} → ${m.toLocation}`:""}</small>
                  </span>
                </td>
                <td><Badge status={m.type === "IN" ? "COMPLETED" : m.type === "OUT" ? "ENGINEERING" : "INTERNAL_REVIEW"} /> {m.type}</td>
                <td>
                  <b className={m.qty > 0 ? "text-green" : "text-red"}>
                    {m.qty > 0 ? "+" : ""}{m.qty}
                  </b>
                </td>
                <td>{m.reference}</td>
                <td>{m.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
