"use client";

import { useState } from "react";
import { thb } from "@/lib/format";

type InvoiceStatus = "DRAFT" | "ISSUED" | "PARTIAL" | "PAID" | "OVERDUE";
const initialInvoices = [
  {
    id: "INV-2026-0098",
    customer: "Cal-Comp Automation",
    job: "JOB-2026-00128",
    amount: 342000,
    due: "15 Oct 2026",
    status: "DRAFT" as InvoiceStatus,
  },
  {
    id: "INV-2026-0097",
    customer: "Siam Precision Parts",
    job: "JOB-2026-00129",
    amount: 185400,
    due: "05 Oct 2026",
    status: "ISSUED" as InvoiceStatus,
  },
  {
    id: "INV-2026-0094",
    customer: "Eastern Automation",
    job: "JOB-2026-00125",
    amount: 96000,
    due: "24 Sep 2026",
    status: "OVERDUE" as InvoiceStatus,
  },
  {
    id: "INV-2026-0091",
    customer: "Mitsui Components",
    job: "JOB-2026-00121",
    amount: 128500,
    due: "20 Sep 2026",
    status: "PAID" as InvoiceStatus,
  },
];
const payables = [
  [
    "BILL-2026-0142",
    "Thai Metals Supply",
    "PO-2026-0095",
    49000,
    "28 Sep 2026",
    "PENDING",
  ],
  [
    "BILL-2026-0141",
    "Eastern Coating",
    "OUT-2026-0031",
    28500,
    "30 Sep 2026",
    "APPROVED",
  ],
  [
    "BILL-2026-0138",
    "CNC Tooling Service",
    "PO-2026-0089",
    16750,
    "25 Sep 2026",
    "PAID",
  ],
] as const;

function tone(status: string) {
  if (["PAID", "APPROVED"].includes(status)) return "success";
  if (status === "OVERDUE") return "danger";
  if (["PENDING", "PARTIAL"].includes(status)) return "warning";
  return "info";
}

export function AccountingWorkspace() {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [notice, setNotice] = useState("");
  const updateInvoice = (id: string, status: InvoiceStatus) => {
    setInvoices((items) =>
      items.map((item) => (item.id === id ? { ...item, status } : item)),
    );
    setNotice(`${id} เปลี่ยนสถานะเป็น ${status} โดย K. Ratchanee`);
  };
  const receivable = invoices
    .filter((item) => item.status !== "PAID")
    .reduce((sum, item) => sum + item.amount, 0);
  const payable = payables
    .filter((item) => item[5] !== "PAID")
    .reduce((sum, item) => sum + item[3], 0);
  return (
    <>
      <div className="page-header">
        <div>
          <h1>บัญชีและการเงิน</h1>
          <p>Accounts Receivable, Accounts Payable, Invoice และการรับชำระ</p>
        </div>
      </div>
      {notice && (
        <div className="hr-notice" role="status">
          ✓ {notice}
          <button onClick={() => setNotice("")}>ปิด</button>
        </div>
      )}
      <section className="kpis">
        <div className="kpi blue">
          <span>ลูกหนี้คงค้าง (AR)</span>
          <strong>{thb(receivable)}</strong>
          <small>
            {invoices.filter((item) => item.status !== "PAID").length} invoices
          </small>
        </div>
        <div className="kpi purple">
          <span>เจ้าหนี้คงค้าง (AP)</span>
          <strong>{thb(payable)}</strong>
          <small>รอชำระ 2 รายการ</small>
        </div>
        <div className="kpi red">
          <span>เกินกำหนด</span>
          <strong>
            {invoices.filter((item) => item.status === "OVERDUE").length}
          </strong>
          <small>
            {thb(
              invoices
                .filter((item) => item.status === "OVERDUE")
                .reduce((sum, item) => sum + item.amount, 0),
            )}
          </small>
        </div>
        <div className="kpi green">
          <span>รับชำระเดือนนี้</span>
          <strong>{thb(428500)}</strong>
          <small>ตาม Bank reconciliation</small>
        </div>
      </section>
      <div className="panel table-panel">
        <div className="panel-head">
          <div>
            <h3>ใบแจ้งหนี้ / ลูกหนี้การค้า</h3>
            <span>Invoice queue assigned to K. Ratchanee</span>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>ลูกค้า / Job</th>
              <th>ยอดเงิน</th>
              <th>ครบกำหนด</th>
              <th>สถานะ</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="table-main">{invoice.id}</td>
                <td>
                  {invoice.customer}
                  <small>{invoice.job}</small>
                </td>
                <td>{thb(invoice.amount)}</td>
                <td>{invoice.due}</td>
                <td>
                  <span className={`badge ${tone(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </td>
                <td>
                  {invoice.status === "DRAFT" ? (
                    <button
                      className="text-action"
                      onClick={() => updateInvoice(invoice.id, "ISSUED")}
                    >
                      ออก Invoice
                    </button>
                  ) : ["ISSUED", "PARTIAL", "OVERDUE"].includes(
                      invoice.status,
                    ) ? (
                    <button
                      className="text-action"
                      onClick={() => updateInvoice(invoice.id, "PAID")}
                    >
                      บันทึกรับชำระ
                    </button>
                  ) : (
                    <span className="muted">ปิดรายการแล้ว</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="panel table-panel accounting-ap">
        <div className="panel-head">
          <div>
            <h3>เจ้าหนี้การค้า / Supplier Bills</h3>
            <span>รายการรอตรวจสอบและชำระ</span>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Bill</th>
              <th>Supplier</th>
              <th>อ้างอิง</th>
              <th>ยอดเงิน</th>
              <th>ครบกำหนด</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {payables.map((bill) => (
              <tr key={bill[0]}>
                <td className="table-main">{bill[0]}</td>
                <td>{bill[1]}</td>
                <td>{bill[2]}</td>
                <td>{thb(bill[3])}</td>
                <td>{bill[4]}</td>
                <td>
                  <span className={`badge ${tone(bill[5])}`}>{bill[5]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
