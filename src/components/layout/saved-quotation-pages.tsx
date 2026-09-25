"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SavedQuotationPreview } from "@/components/layout/parts-workspace";
import { quoteTotal, thb } from "@/lib/format";
import { useDemo } from "@/stores/demo-store";

export function SavedQuotationDetailPage({ id }: { id: string }) {
  const { quotes, saveQuote, setQuoteStatus } = useDemo();
  const router = useRouter();
  const quotation = quotes.find((item) => item.id === id) ?? quotes[0];
  if (!quotation) return null;
  const total = quoteTotal(quotation.items);

  return <>
    <header className="page-header saved-quote-header"><div><h1>{quotation.no} · REV {quotation.rev}</h1><p>{quotation.customer} · {quotation.project}</p></div><div className="head-actions"><Link className="secondary" href={`/quotations/${quotation.id}/preview`}>เปิด A4 เต็มหน้า</Link><button className="secondary" onClick={() => { const id=`${quotation.id}-r${quotation.rev+1}-${Date.now()}`; saveQuote({...quotation,id,rev:quotation.rev+1,status:"DRAFT",created:"Now"}); router.push(`/quotations/${id}`); }}>สร้าง Revision ใหม่</button>{quotation.status==="APPROVED"&&<button className="primary" onClick={() => setQuoteStatus(quotation.id, "SENT")}>ส่งใบเสนอราคาทางอีเมล</button>}</div></header>
    <div className="saved-quotation-layout">
      <section className="saved-quotation-document"><div className="saved-document-toolbar"><div><b>ตัวอย่างใบเสนอราคาก่อนส่ง</b><span>รูปแบบเดียวกับหน้าสร้างและเอกสารที่พิมพ์</span></div><button className="secondary" onClick={() => window.print()}>พิมพ์</button></div><SavedQuotationPreview quotation={quotation} /></section>
      <aside className="panel totals saved-quotation-sidebar"><h3>สรุปใบเสนอราคา</h3><div><span>สถานะ</span><span className="badge info">{quotation.status}</span></div><div><span>รวมก่อน VAT</span><b>{thb(total)}</b></div><div><span>VAT 7%</span><b>{thb(total * .07)}</b></div><div className="grand"><span>รวมสุทธิ</span><b>{thb(total * 1.07)}</b></div>{quotation.status==="DRAFT"&&<button className="primary fullbutton" onClick={()=>setQuoteStatus(quotation.id,"INTERNAL REVIEW")}>ส่งอนุมัติ</button>}{quotation.status==="INTERNAL REVIEW"&&<button className="primary fullbutton" onClick={()=>setQuoteStatus(quotation.id,"APPROVED")}>อนุมัติใบเสนอราคา</button>}{["APPROVED","SENT","WAITING CUSTOMER"].includes(quotation.status)&&<button className="secondary fullbutton" onClick={() => router.push(`/public/quotation/${quotation.id}`)}>เปิดหน้าลูกค้า</button>}{quotation.status==="APPROVED"&&<button className="primary fullbutton" onClick={() => setQuoteStatus(quotation.id, "SENT")}>ยืนยันส่งอีเมล</button>}{quotation.status !== "ACCEPTED" && quotation.status==="SENT" && <button className="secondary fullbutton" onClick={() => { setQuoteStatus(quotation.id, "ACCEPTED"); router.push("/jobs/sales-orders"); }}>ลูกค้ายอมรับ → Sales Order</button>}</aside>
    </div>
  </>;
}

export function SavedQuotationPreviewPage({ id }: { id?: string }) {
  const { quotes, setQuoteStatus } = useDemo();
  const quotation = quotes.find((item) => item.id === id) ?? quotes[0];
  if (!quotation) return null;
  return <><header className="page-header saved-quote-header"><div><h1>ตัวอย่างใบเสนอราคา A4</h1><p>{quotation.no} REV {quotation.rev} · ตรวจสอบก่อนพิมพ์หรือส่งอีเมล</p></div><div className="head-actions"><button onClick={() => window.print()}>พิมพ์</button><button className="primary" onClick={() => setQuoteStatus(quotation.id, "SENT")}>ส่งใบเสนอราคาทางอีเมล</button></div></header><div className="quotation-standalone-preview"><SavedQuotationPreview quotation={quotation} /></div></>;
}
