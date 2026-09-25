"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Plus, Search, ChevronDown } from "lucide-react";
import { useDemo } from "@/stores/demo-store";
import { Header, Badge } from "@/components/layout/erp-app";

export function InventoryItems() {
  const { inventoryItems } = useDemo();
  const [query, setQuery] = useState("");
  
  const list = inventoryItems.filter(i => 
    `${i.partNo} ${i.name} ${i.category}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <Header 
        title="Stock Items" 
        subtitle="Master item list and current stock availability" 
        action={<button className="primary"><Plus size={17}/> Add new item</button>}
      />
      <div className="toolbar">
        <label>
          <Search size={16}/>
          <input 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            placeholder="Search part number or name"
          />
        </label>
        <button>Category <ChevronDown size={15}/></button>
        <button>Store <ChevronDown size={15}/></button>
        <span>{list.length} records</span>
      </div>
      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Part / Description</th>
              <th>Category</th>
              <th>Store Location</th>
              <th>On Hand</th>
              <th>Status</th>
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
                    <Link className="table-main" href="#">
                      {i.name}
                      <small>{i.partNo}</small>
                    </Link>
                  </td>
                  <td>{i.category}</td>
                  <td>{i.location}</td>
                  <td>
                    <b>{i.currentStock}</b> <small>{i.unit}</small>
                  </td>
                  <td><Badge status={status} /> {statusText !== "In Stock" && <small className="muted">Min: {i.minStock}</small>}</td>
                  <td><Link className="text-action" href="#">Adjust</Link></td>
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
        title="Stores & Locations" 
        subtitle="Manage physical storage locations and zones" 
        action={<button className="primary"><Plus size={17}/> Add store</button>}
      />
      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Store Name</th>
              <th>Store Type</th>
              <th>Code</th>
              <th/>
            </tr>
          </thead>
          <tbody>
            {stores.map(s => (
              <tr key={s.id}>
                <td>
                  <Link className="table-main" href="#">
                    {s.name}
                  </Link>
                </td>
                <td>{s.type}</td>
                <td>{s.code}</td>
                <td><Link className="text-action" href="#">View items</Link></td>
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
        title="Stock Movements" 
        subtitle="Audit log of all IN, OUT, and TRANSFER operations" 
        action={<button className="primary">Export CSV</button>}
      />
      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Date / Time</th>
              <th>Item</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Reference</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {movements.map(m => (
              <tr key={m.id}>
                <td>{m.date}</td>
                <td>
                  <Link className="table-main" href="#">
                    {m.itemName}
                  </Link>
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
