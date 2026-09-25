"use client";

import Link from "next/link";
import {
  ChevronRight,
  ClipboardList,
  FileText,
  PackageSearch,
} from "lucide-react";
import { useDemo } from "@/stores/demo-store";
import { statusClass } from "@/lib/format";

const flow = [
  "Inquiry",
  "Engineering",
  "Quotation",
  "Sales Order",
  "Job",
  "BOM / Routing",
];

function Header({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
function Badge({ status }: { status: string }) {
  return (
    <span className={`badge ${statusClass(status)}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

function FlowStrip({ active }: { active: string }) {
  return (
    <div className="workflow">
      {flow.map((step, index) => (
        <span
          key={step}
          className={
            step === active
              ? "current"
              : index < flow.indexOf(active)
                ? "done"
                : ""
          }
        >
          {step}
          {index < flow.length - 1 && <ChevronRight size={14} />}
        </span>
      ))}
    </div>
  );
}

export function InquiryWorkspace() {
  const { inquiries, engineeringReviews, setInquiryStatus, setReviewResult } =
    useDemo();
  return (
    <>
      <Header
        title="คำขอจากลูกค้า (Inquiry)"
        subtitle="รับคำขอลูกค้าและส่ง Engineering ตรวจความเป็นไปได้"
        action={
          <Link className="primary" href="/quotations/new">
            สร้าง Quotation
          </Link>
        }
      />
      <FlowStrip active="Inquiry" />
      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Inquiry</th>
              <th>ลูกค้า / Project</th>
              <th>ความต้องการ</th>
              <th>ผู้รับผิดชอบ</th>
              <th>สถานะ</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => {
              const review = engineeringReviews.find(
                (x) => x.inquiryId === inquiry.id,
              );
              return (
                <tr key={inquiry.id}>
                  <td className="table-main">
                    {inquiry.no}
                    <small>{inquiry.createdAt}</small>
                  </td>
                  <td>
                    {inquiry.customer}
                    <small>{inquiry.project}</small>
                  </td>
                  <td>
                    {inquiry.requestedQty} PCS
                    <small>Due {inquiry.requestedDue}</small>
                  </td>
                  <td>{inquiry.owner}</td>
                  <td>
                    <Badge status={inquiry.status} />
                  </td>
                  <td>
                    {inquiry.status === "NEW" ? (
                      <button
                        className="text-action"
                        onClick={() =>
                          setInquiryStatus(inquiry.id, "UNDER_REVIEW")
                        }
                      >
                        ส่งตรวจสอบ
                      </button>
                    ) : review?.result === "NEEDS_INFO" ? (
                      <button
                        className="text-action"
                        onClick={() => setReviewResult(review.id, "FEASIBLE")}
                      >
                        ยืนยันข้อมูล
                      </button>
                    ) : (
                      <Link className="text-action" href="/engineering/reviews">
                        เปิดผล Review
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function EngineeringReviewsWorkspace() {
  const { inquiries, engineeringReviews, setReviewResult } = useDemo();
  return (
    <>
      <Header
        title="Engineering Feasibility Review"
        subtitle="ตรวจ Drawing, Material และ Process ก่อนออก Quotation"
      />
      <FlowStrip active="Engineering" />
      <div className="module-grid">
        {engineeringReviews.map((review) => {
          const inquiry = inquiries.find((x) => x.id === review.inquiryId);
          return (
            <section className="panel section" key={review.id}>
              <div className="panel-head">
                <div>
                  <h3>
                    {inquiry?.no} · {inquiry?.project}
                  </h3>
                  <span>{inquiry?.customer}</span>
                </div>
                <Badge status={review.result} />
              </div>
              <dl className="doc-meta">
                <div>
                  <dt>ผู้ตรวจ</dt>
                  <dd>{review.reviewer}</dd>
                </div>
                <div>
                  <dt>Material</dt>
                  <dd>{review.material}</dd>
                </div>
                <div>
                  <dt>กำหนดที่ลูกค้าต้องการ</dt>
                  <dd>{inquiry?.requestedDue}</dd>
                </div>
                <div>
                  <dt>ผลการตรวจ</dt>
                  <dd>{review.result}</dd>
                </div>
              </dl>
              <p>{review.processSummary}</p>
              <p className="muted">{review.notes}</p>
              <div className="form-actions">
                {review.result === "FEASIBLE" ? (
                  <span className="action-complete">
                    ตรวจสอบเสร็จแล้ว · ผลิตได้
                  </span>
                ) : (
                  <>
                    <button
                      disabled={review.result === "NEEDS_INFO"}
                      onClick={() => setReviewResult(review.id, "NEEDS_INFO")}
                    >
                      {review.result === "NEEDS_INFO"
                        ? "ส่งคำขอข้อมูลแล้ว"
                        : "ขอข้อมูลเพิ่ม"}
                    </button>
                    <button
                      className="primary"
                      onClick={() => setReviewResult(review.id, "FEASIBLE")}
                    >
                      ยืนยันว่าผลิตได้
                    </button>
                  </>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

export function SalesOrdersWorkspace() {
  const { quotes, salesOrders, createSalesOrder } = useDemo();
  const candidates = quotes.filter(
    (q) =>
      q.status === "ACCEPTED" &&
      !salesOrders.some((so) => so.quotationId === q.id),
  );
  return (
    <>
      <Header
        title="Sales Order"
        subtitle="เอกสารยืนยันคำสั่งซื้อที่เชื่อม Quotation กับ Job"
        action={
          candidates[0] ? (
            <button
              className="primary"
              onClick={() => createSalesOrder(candidates[0].id)}
            >
              สร้างจาก {candidates[0].no}
            </button>
          ) : undefined
        }
      />
      <FlowStrip active="Sales Order" />
      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Sales Order</th>
              <th>Customer PO</th>
              <th>ลูกค้า / Project</th>
              <th>วันที่สั่งซื้อ</th>
              <th>กำหนดส่ง</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {salesOrders.map((order) => (
              <tr key={order.id}>
                <td className="table-main">
                  {order.no}
                  <small>
                    อ้างอิง {quotes.find((q) => q.id === order.quotationId)?.no}
                  </small>
                </td>
                <td>{order.customerPoNo}</td>
                <td>
                  {order.customer}
                  <small>{order.project}</small>
                </td>
                <td>{order.orderDate}</td>
                <td>{order.requestedDelivery}</td>
                <td>
                  <Badge status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function JobPlanWorkspace() {
  const { jobs, jobPlans, approveJobPlan } = useDemo();
  const plan = jobPlans[0];
  const job = jobs.find((x) => x.id === plan?.jobId);
  if (!plan) return null;
  return (
    <>
      <Header
        title="BOM และ Production Routing"
        subtitle={`${job?.no} · ${job?.project}`}
        action={
          <button
            className="primary"
            disabled={plan.approvalStatus === "APPROVED"}
            onClick={() => approveJobPlan(plan.id)}
          >
            <ClipboardList size={17} />{" "}
            {plan.approvalStatus === "APPROVED"
              ? "Released แล้ว"
              : "Release Revision และสร้าง Work Order"}
          </button>
        }
      />
      <FlowStrip active="BOM / Routing" />
      <section className="kpis">
        <div className="kpi blue">
          <span>Drawing</span>
          <strong>{plan.drawingNo}</strong>
          <small>{plan.revision}</small>
        </div>
        <div className="kpi green">
          <span>สถานะ Release</span>
          <strong>{plan.approvalStatus}</strong>
          <small>ฝ่ายผลิตใช้ได้เฉพาะ Revision ที่ Release แล้ว</small>
        </div>
        <div className="kpi purple">
          <span>รายการ BOM</span>
          <strong>{plan.bom.length}</strong>
          <small>ความต้องการ Material</small>
        </div>
        <div className="kpi blue">
          <span>Operation</span>
          <strong>{plan.routing.length}</strong>
          <small>
            Outsource {plan.routing.filter((x) => x.outsourced).length} ขั้นตอน
          </small>
        </div>
      </section>
      <div className="detail-grid">
        <section className="panel section">
          <h3>
            <PackageSearch size={18} /> Bill of Materials
          </h3>
          <table>
            <thead>
              <tr>
                <th>Part no.</th>
                <th>Material</th>
                <th>Qty / Job</th>
              </tr>
            </thead>
            <tbody>
              {plan.bom.map((line) => (
                <tr key={line.id}>
                  <td>{line.partNo}</td>
                  <td>{line.material}</td>
                  <td>
                    {line.qtyPer} {line.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="panel section">
          <h3>
            <ClipboardList size={18} /> Routing
          </h3>
          {plan.routing.map((op) => (
            <div className="work-row" key={op.id}>
              <b>{op.sequence}</b>
              <div>
                <b>{op.process}</b>
                <p>
                  {op.workCenter} · {op.plannedMinutes} min
                </p>
              </div>
              {op.outsourced && <Badge status="OUTSOURCE" />}
              {op.qcRequired && <FileText size={17} />}
            </div>
          ))}
        </section>
      </div>
      <div className="panel section">
        <h3>
          <FileText size={18} /> Traceability
        </h3>
        <p>
          {job?.no} → {plan.drawingNo} {plan.revision} → BOM {plan.bom.length}{" "}
          lines → Routing {plan.routing.length} operations
        </p>
      </div>
    </>
  );
}
