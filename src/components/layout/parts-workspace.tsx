"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useRouter } from "next/navigation";
import { quoteTotal, thb } from "@/lib/format";
import { useDemo } from "@/stores/demo-store";
import { QuoteItem, Quotation, QuotationDocument, QuotationImageBox } from "@/types";

const seedParts = [
  "2IK6RGN-6W", "Gear", "Speed", "KHFS5-2060-4000", "MTSRK16-710-F25-R12-T10-Q12-S23-E10-KR0",
  "MTSGR16", "LHFC16", "Shaft 635 x 16", "CDJP2B16-15D", "PZ-V11", "P-2025-ME-SCH-C00001-17",
  "AS1201F-M5-06A", "P-2025-ME-SCH-C00001-16", "P-2025-ME-SCH-C00001-18", "CTS M5 x 12",
  "socket head cap screw_iso(ISO 4762 M3 x 10 - 10S)", "pan head cross recess screw(ISO 7045-M3x20-Z-20)", "P-2025-ME-SCH-C00001-05", "1583_400W_ECMA-C20604RS", "P-2025-ME-SCH-C00007-05", "P-2025-ME-SCH-C00001-04", "P-2025-ME-SCH-C00001-07", "SMT-KSD-CONVEYOR 800-P003.222", "C-FFL69577", "C-HBPA20-P8-6", "TTPA16T5150-A-P10_b", "C-TTPA26T5150-A-N14", "6001ZZ", "POM Parts", "Assembly", "# รับประกัน 1 ปี",
];

type Doc = QuotationDocument;
type ImageBox = QuotationImageBox;

export function QuotationWorkspaceWithParts() {
  const { customers, saveQuote } = useDemo();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [customerId, setCustomerId] = useState(customers[0]?.id || "");
  const [doc, setDoc] = useState<Doc>({
    quotationNo: "CALH22609-013", revision: "2", date: "23 September 2026", validity: "30 DAYS",
    payment: "30 DAYS", leadTime: "4 Week", contact: "ALONGKRON K.", project: "Con_Load_Tary_Sip",
    branch: "00001", attn: "K. Pramote Suckasem (PET-6PE)", cc: "",
    address: "138 Moo4, Petchkasem Road, Tambol Sarapang, Amphur Khao Yoi, Phetchaburi 76140 Thailand",
    reference: "", drawingNo: "ATS-AMP-128", drawingRev: "2",
    deposit: "100", delivery: "0", credit: "0", approvedBy: "Alongkron Kunchong", approvedRole: "Biz. Development Director",
    thaiNote: "การจ่ายเงินโดยใช้เช็คโปรดสั่งจ่ายในนามของ บริษัท ออโต้-เทคซิสเต็มส์ จำกัด บริษัท จะคิดดอกเบี้ย 1.5% ต่อเดือน เมื่อชำระช้าเกินกำหนด",
    englishNote: "Please Issue a crossed cheque payable to Auto-TechSystems Co.,Ltd Insert at 15% per month will be charged on overdue account",
    amountWords: "",
  });
  const [item, setItem] = useState<QuoteItem>({
    id: "item-1", partName: "Con_Load_Tary_Sip", partNo: "CLTS", material: "AL", qty: 1, unit: "Set",
    unitPrice: 230000, discount: 0, size: "794W x 3200L x 307H mm.", drawingForm: "Calcomp", finishing: "N/A", parts: seedParts,
  });
  const [image, setImage] = useState<string | null>(null);
  const [imageBox, setImageBox] = useState<ImageBox>({ x: 3, y: 3, width: 94, height: 72 });
  const [drag, setDrag] = useState<{ clientX: number; clientY: number; box: ImageBox } | null>(null);
  const customer = customers.find((c) => c.id === customerId);
  const total = quoteTotal([item]);

  const field = (key: keyof Doc, label: string) => <label key={key}>{label}<input value={doc[key]} onChange={(e) => setDoc((value) => ({ ...value, [key]: e.target.value }))} /></label>;
  const itemField = (key: keyof QuoteItem, label: string, type = "text") => <label key={key}>{label}<input type={type} value={String(item[key] ?? "")} onChange={(e) => setItem((value) => ({ ...value, [key]: type === "number" ? Number(e.target.value) : e.target.value }))} /></label>;
  const save = () => {
    if (!customer) return;
    const id = `q-${Date.now()}`;
    saveQuote({ id, no: doc.quotationNo, rev: Number(doc.revision) || 0, customerId, customer: customer.name, project: doc.project, status: "DRAFT", created: doc.date, validUntil: doc.validity, sales: "K. Sales", items: [item], payment: doc.payment, leadTime: doc.leadTime, document: doc, drawingImage: image, drawingImageBox: imageBox });
    router.push(`/quotations/${id}`);
  };
  const uploadImage = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  };
  const beginMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!image) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ clientX: event.clientX, clientY: event.clientY, box: imageBox });
  };
  const moveImage = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    const drawing = event.currentTarget.parentElement?.getBoundingClientRect();
    if (!drawing) return;
    const x = drag.box.x + ((event.clientX - drag.clientX) / drawing.width) * 100;
    const y = drag.box.y + ((event.clientY - drag.clientY) / drawing.height) * 100;
    setImageBox((box) => ({ ...box, x: Math.max(0, Math.min(100 - box.width, x)), y: Math.max(0, Math.min(100 - box.height, y)) }));
  };

  return <main className="parts-workspace">
    <header className="parts-head"><div><h1>พื้นที่ทำใบเสนอราคา</h1><p>แก้ไขข้อมูล รายการ Parts และรูปสินค้าได้ในหน้าเดียว</p></div><button className="primary" onClick={save}>บันทึกใบเสนอราคา</button></header>
    <div className="quote-workspace">
      <section className="quote-editor">
        <div className="panel section quote-detail-form"><h3>ข้อมูลผู้รับเอกสาร</h3><p className="form-help">ข้อมูลส่วนนี้แสดงในช่อง To, Attn. และ C.c. ของใบเสนอราคา</p><div className="formgrid three">
          <label>ลูกค้า / To<select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>{customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          {field("branch", "Branch")}{field("attn", "Attn.")}{field("cc", "C.c.")}
          <label className="wide-field">ที่อยู่<input value={doc.address} onChange={(e) => setDoc((value) => ({ ...value, address: e.target.value }))} /></label>
        </div><h3 className="form-group-title">รายละเอียดใบเสนอราคา</h3><div className="formgrid three">
          {field("quotationNo", "Quotation No.")}{field("revision", "Revision")}{field("project", "ชื่อโครงการ / ชื่อ Drawing")}{field("date", "Date")}{field("validity", "Price Validity")}{field("payment", "Payment Terms")}{field("leadTime", "Lead Time")}{field("contact", "Contact Person")}
        </div></div>
        <div className="panel section spreadsheet item-composer"><div className="panel-head compact"><div><h3>รายการสินค้า 1</h3><span>Size และ Parts เป็นรายละเอียดของ Item นี้ จึงอยู่รวมกันในส่วนเดียว</span></div></div>
          <div className="formgrid three">{itemField("partName", "Part Name")}{itemField("drawingForm", "Drawing Form")}{itemField("partNo", "Part No.")}{itemField("material", "Material")}{itemField("finishing", "Finishing")}{itemField("qty", "Quantity", "number")}{itemField("unit", "Unit")}{itemField("unitPrice", "Unit Price", "number")}{itemField("discount", "Discount", "number")}{itemField("size", "Size")}</div>
          <label className="parts-inline">Parts / BOM ของรายการนี้ <small>1 บรรทัด = 1 Part และจะแสดงรวมใต้ Part Name ใน A4</small><textarea value={(item.parts ?? []).join("\n")} onChange={(e) => setItem((value) => ({ ...value, parts: e.target.value.split("\n") }))} /></label>
        </div>
        <div className="panel section quote-detail-form"><h3>เงื่อนไข ราคา และผู้อนุมัติ</h3><div className="formgrid three">
          {field("deposit", "Deposit upon order (%)")}{field("delivery", "Deliver (%)")}{field("credit", "Credit 30 days (%)")}{field("approvedBy", "Approved By")}{field("approvedRole", "ตำแหน่งผู้อนุมัติ")}{field("amountWords", "จำนวนเงินตัวอักษร (เว้นว่างเพื่อคำนวณ)")}
          <label className="wide-field">เงื่อนไขการชำระเงินภาษาไทย<input value={doc.thaiNote} onChange={(e) => setDoc((value) => ({ ...value, thaiNote: e.target.value }))} /></label>
          <label className="wide-field">Payment note (English)<input value={doc.englishNote} onChange={(e) => setDoc((value) => ({ ...value, englishNote: e.target.value }))} /></label>
        </div></div>
        <div className="panel section image-control-panel"><div><h3>รูปสินค้า / Technical Drawing</h3><p>พรีวิวเริ่มต้นเป็นพื้นที่ว่าง เลือกรูปแล้วลาก ปรับกว้าง และปรับสูงได้โดยไม่ตัดภาพ</p></div>
          <input ref={fileInput} className="hidden-file-input" type="file" accept="image/*" onChange={(e) => uploadImage(e.target.files?.[0])} />
          <div className="image-control-actions"><button className="secondary" onClick={() => fileInput.current?.click()}>แทรกรูป / Drawing</button>{image && <button className="secondary danger-button" onClick={() => { setImage(null); if (fileInput.current) fileInput.current.value = ""; }}>ลบรูป</button>}</div>
          <div className="drawing-fields">{field("drawingNo", "Drawing No.")}{field("drawingRev", "Drawing Revision")}</div>
          {image && <div className="image-sliders">
            <label>ความกว้าง <input type="range" min="15" max="100" value={imageBox.width} onChange={(e) => setImageBox((box) => ({ ...box, width: Number(e.target.value), x: Math.min(box.x, 100 - Number(e.target.value)) }))} /><output>{imageBox.width}%</output></label>
            <label>ความสูง <input type="range" min="15" max="100" value={imageBox.height} onChange={(e) => setImageBox((box) => ({ ...box, height: Number(e.target.value), y: Math.min(box.y, 100 - Number(e.target.value)) }))} /><output>{imageBox.height}%</output></label>
            <button className="secondary reset-image-button" onClick={() => setImageBox({ x: 3, y: 3, width: 94, height: 72 })}>จัดรูปกลับตำแหน่งเริ่มต้น</button>
          </div>}
        </div>
      </section>
      <aside className="quote-preview-panel"><div className="preview-title"><div><b>A4 Live Preview</b><span>Item, Parts และรูปสินค้าตามเอกสารตัวอย่าง</span></div><button className="secondary" onClick={() => window.print()}>พิมพ์</button></div>
        <PartsPreview customer={customer?.name ?? ""} doc={doc} item={item} total={total} image={image} imageBox={imageBox} onPointerDown={beginMove} onPointerMove={moveImage} onPointerUp={() => setDrag(null)} />
      </aside>
    </div>
  </main>;
}

function PartsPreview({ customer, doc, item, total, image, imageBox, onPointerDown, onPointerMove, onPointerUp }: { customer: string; doc: Doc; item: QuoteItem; total: number; image: string | null; imageBox: ImageBox; onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void; onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void; onPointerUp: () => void }) {
  const money = (value: number) => value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return <article className="reference-sheet">
    <header className="ref-header"><div className="ref-logo" role="img" aria-label="ATS AUTO-TECH SYSTEMS CO.,LTD" /><div><h2>AUTO - TECH SYSTEMS CO.,LTD</h2><p>Manufacturing : 58/2,58/71 Moo 9 T.Raikhing A.Samphran Nakornpathom 73210 Thailand (Head Office)</p><p>Tel : 065 789 5226&nbsp; E-Mail : ats@auto-techsystems.com&nbsp; Mobile : (081 777 1669) TAX: 0735556004823</p></div></header>
    <h1>Quotation</h1>
    <section className="ref-meta"><div className="ref-recipient"><i>To:</i><div><b>{customer}</b><p>Branch {doc.branch} : {doc.address}</p></div><i>Attn:</i><b>{doc.attn},</b><i>C.c.:</i><span>{doc.cc}</span></div><div className="ref-doc">
      {[["Quotation No.", `${doc.quotationNo} REV ${doc.revision} ${doc.project}`], ["Date",doc.date],["Price Validity",doc.validity],["Payment Terms",doc.payment],["Lead Time",doc.leadTime],["Contact Person",doc.contact]].map(([label,value])=><div key={label}><i>{label}</i><span>{value}</span></div>)}
    </div></section>
    <div className="ref-items">
      <div className="ref-columns ref-column-head">{["Item","Part Name","Drawing Form","Part No.","Material","Finishing","Quantity","Unit Price","Discount","Amount (THB)"].map(label=><b key={label}>{label}</b>)}</div>
      <div className="ref-columns ref-item-values"><b>1</b><b>{item.partName}</b><span>{item.drawingForm}</span><span>{item.partNo}</span><span>{item.material}</span><span>{item.finishing}</span><span>{item.qty} {item.unit}</span><b>{item.unitPrice.toLocaleString("en-US")}</b><span>{item.discount ? money(item.discount) : ""}</span><b>{money(total)}</b></div>
      <div className="ref-parts-drawing"><div className="ref-index-lines" /><div className="ref-bom"><div>Size : {item.size}</div><b>Parts :</b>{item.parts?.map((part,index)=><div key={index}>{part || "\u00a0"}</div>)}</div>
        <div className="ref-drawing">
          {!image && <div className="ref-drawing-empty"><b>DRAWING / PRODUCT IMAGE</b><span>แทรกรูปจากแบบฟอร์มด้านซ้าย</span></div>}
          {image && <div className="drawing-uploaded-image" style={{left:`${imageBox.x}%`,top:`${imageBox.y}%`,width:`${imageBox.width}%`,height:`${imageBox.height}%`}} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}><img src={image} alt="Product drawing in quotation" draggable={false}/><i>ลากเพื่อย้ายตำแหน่ง</i></div>}
          <div className="ref-drawing-title"><b>AUTO-TECHSYSTEMS CO.,LTD</b><div><span>TITLE :</span><strong>{doc.project}</strong></div><div><span>DWG NO. : {doc.drawingNo}</span><span>REV. : {doc.drawingRev}</span></div></div>
        </div>
      </div>
    </div>
    <section className="ref-payment"><div><b># Payment Systems</b><p>- Deposit upon order <b>{doc.deposit}%</b></p><p>- Deliver <b>{doc.delivery}%</b></p><p>- Cradit 30 days <b>{doc.credit}%</b></p></div><div/><div/></section>
    <section className="ref-totals"><div>{doc.thaiNote}</div><i>Total</i><b>{money(total)}</b><div>{doc.englishNote}</div><i>VAT 7%</i><b>{money(total*.07)}</b><div className="ref-inwords"><span>ตัวอักษร</span><b>{doc.amountWords || thaiBaht(total*1.07)}</b></div><i>Grand Total</i><b>{money(total*1.07)}</b></section>
    <footer className="ref-footer"><div><b>APPROVED BY</b><div className="ref-signature">{doc.approvedBy}</div><b>{doc.approvedBy}</b><em>{doc.approvedRole}</em></div><div className="ref-customer-sign"><b>Signature&amp;Company Stamp</b><em>(Please return a copy by email or fax)</em></div><p>This is a computer generated quotation no signature is required.</p></footer>
  </article>;
}

export function SavedQuotationPreview({ quotation }: { quotation: Quotation }) {
  const firstItem = quotation.items[0] ?? { id: "empty", partName: quotation.project, partNo: "", material: "", qty: 0, unit: "", unitPrice: 0, discount: 0, parts: [] };
  const doc: Doc = quotation.document ?? {
    quotationNo: quotation.no, revision: String(quotation.rev), date: quotation.created, validity: quotation.validUntil,
    payment: quotation.payment, leadTime: quotation.leadTime, contact: "ALONGKRON K.", project: quotation.project,
    branch: "00001", attn: "Purchasing Department", cc: "", address: "138 Moo4, Petchkasem Road, Tambol Sarapang, Amphur Khao Yoi, Phetchaburi 76140 Thailand",
    reference: "", drawingNo: "ATS-AMP-128", drawingRev: String(quotation.rev), deposit: "100", delivery: "0", credit: "0",
    approvedBy: "Alongkron Kunchong", approvedRole: "Biz. Development Director",
    thaiNote: "การจ่ายเงินโดยใช้เช็คโปรดสั่งจ่ายในนามของ บริษัท ออโต้-เทคซิสเต็มส์ จำกัด บริษัท จะคิดดอกเบี้ย 1.5% ต่อเดือน เมื่อชำระช้าเกินกำหนด",
    englishNote: "Please Issue a crossed cheque payable to Auto-TechSystems Co.,Ltd Insert at 15% per month will be charged on overdue account", amountWords: "",
  };
  const noopPointer = () => undefined;
  return <PartsPreview customer={quotation.customer} doc={doc} item={firstItem} total={quoteTotal(quotation.items)} image={quotation.drawingImage ?? null} imageBox={quotation.drawingImageBox ?? { x: 3, y: 3, width: 94, height: 72 }} onPointerDown={noopPointer} onPointerMove={noopPointer} onPointerUp={noopPointer} />;
}

function thaiBaht(amount: number): string {
  const digits = ["ศูนย์","หนึ่ง","สอง","สาม","สี่","ห้า","หก","เจ็ด","แปด","เก้า"];
  const read = (n: number): string => {
    if (n >= 1000000) return read(Math.floor(n / 1000000)) + "ล้าน" + (n % 1000000 ? read(n % 1000000) : "");
    const s = String(n);
    return s.split("").map((d,i) => {
      const v = Number(d), p = s.length-i-1;
      if (!v) return "";
      const word = p === 1 ? (v === 1 ? "" : v === 2 ? "ยี่" : digits[v]) : p === 0 && v === 1 && n > 10 ? "เอ็ด" : digits[v];
      return word + ["","สิบ","ร้อย","พัน","หมื่น","แสน"][p];
    }).join("");
  };
  const cents = Math.round(Math.max(0,amount)*100);
  return (read(Math.floor(cents/100)) || "ศูนย์") + "บาท" + (cents%100 ? read(cents%100)+"สตางค์" : "ถ้วน");
}
