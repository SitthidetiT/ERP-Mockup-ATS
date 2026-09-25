"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Boxes,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Factory,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Menu,
  PackageSearch,
  Plus,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useDemo } from "@/stores/demo-store";
import {
  QuotationWorkspaceWithParts,
  SavedQuotationPreview,
} from "@/components/layout/parts-workspace";
import {
  SavedQuotationDetailPage,
  SavedQuotationPreviewPage,
} from "@/components/layout/saved-quotation-pages";
import {
  InventoryItems,
  InventoryStores,
  StockMovements,
} from "@/components/layout/inventory-pages";
import {
  EngineeringReviewsWorkspace,
  InquiryWorkspace,
  JobPlanWorkspace,
  SalesOrdersWorkspace,
} from "@/components/layout/golden-flow-pages";
import {
  ActualCostingWorkspace,
  DeliveryWorkspace,
  ProductionWorkspace,
  PurchasingWorkspace,
  QcWorkspace,
  QualityReportWorkspace,
  SalesFollowupWorkspace,
  TraceabilityWorkspace,
  TradeGoodsWorkspace,
} from "@/components/layout/operations-flow-pages";
import {
  EngineeringChangeWorkspace,
  GovernanceWorkspace,
  MasterDataWorkspace,
  SalesExceptionsWorkspace,
  SchedulingWorkspace,
  SupplierComparisonWorkspace,
} from "@/components/layout/remaining-mock-pages";
import { HrWorkspace } from "@/components/layout/hr-pages";
import { AccountingWorkspace } from "@/components/layout/accounting-pages";
import { quoteTotal, statusClass, thb } from "@/lib/format";
import {
  canAccess,
  canMoveJobTo,
  canViewFinancials,
  canWrite,
  moduleForPath,
  primaryNavigation,
  rolePermissions,
} from "@/lib/permissions";
import type { ModuleKey } from "@/lib/permissions";
import { assigneeForStatus, handoffLabel } from "@/lib/workflow-people";
import { Customer, QuoteItem, Quotation, Role, Status } from "@/types";

const sidebarNav = [
  ["ภาพรวม", "/dashboard", LayoutDashboard],
  ["คำขอลูกค้า", "/quotations/inquiries", ClipboardList],
  ["ติดตามใบเสนอราคา", "/quotations/follow-ups", Bell],
  ["ลูกค้า", "/customers", Users],
  ["ใบเสนอราคา", "/quotations", FileText],
  ["Sales Orders", "/jobs/sales-orders", FileText],
  ["งาน / โครงการ", "/jobs", ClipboardList],
  ["Engineering Review", "/engineering/reviews", Settings],
  ["เขียนแบบ", "/drafting/j1", FileText],
  ["BOM / Routing", "/planning/job-plan", ClipboardList],
  ["จัดซื้อ", "/purchasing/requests", PackageSearch],
  ["จัดจ้างภายนอก", "/outsourcing/o1", Factory],
  ["คลังสินค้า", "/inventory/items", Boxes],
  ["สินค้าซื้อมาขายไป", "/inventory/trade-goods", PackageSearch],
  ["ฝ่ายผลิต", "/production/work-orders", Factory],
  ["ตรวจสอบคุณภาพ", "/qc/inspections", ClipboardList],
  ["บรรจุสินค้า", "/packing/j1", PackageSearch],
  ["จัดส่งสินค้า", "/delivery/d1", PackageSearch],
  ["บัญชี / การเงิน", "/accounting/overview", FileText],
  ["ต้นทุนและกำไร", "/costing/jobs/j1", FileText],
  ["รายงาน", "/reports", LayoutDashboard],
  ["ทรัพยากรบุคคล", "/hr/employees", Users],
  ["การแจ้งเตือน", "/notifications", Bell],
  ["ผู้ดูแลระบบ", "/administration/audit-log", Settings],
  ["ตั้งค่าระบบ", "/settings/roles", Settings],
] as const;
const roles: Role[] = [
  "Executive",
  "System Admin",
  "Sales",
  "Engineer",
  "Drafting",
  "Production Planner",
  "Purchasing",
  "Store / Warehouse",
  "Production Supervisor",
  "Production Operator",
  "QC",
  "Packing",
  "Shipping",
  "Accounting",
  "HR",
];
const titles: Record<string, string> = {
  dashboard: "ศูนย์บัญชาการ",
  customers: "ลูกค้า",
  quotations: "จัดการ Quotation",
  jobs: "งานและ Project",
  engineering: "Engineering Review",
  drafting: "ควบคุม Drawing",
  planning: "วางแผนการผลิต",
  purchasing: "จัดซื้อ",
  outsourcing: "ควบคุม Outsource",
  inventory: "Inventory",
  production: "ควบคุมการผลิต",
  qc: "ควบคุมคุณภาพ",
  packing: "บรรจุสินค้า",
  delivery: "จัดส่ง",
  accounting: "บัญชี / การเงิน",
  costing: "ต้นทุน Job",
  reports: "รายงานและวิเคราะห์",
  hr: "ทรัพยากรบุคคล",
  notifications: "การแจ้งเตือน",
  administration: "ผู้ดูแลระบบ",
  settings: "ตั้งค่าระบบ",
};

export function ErpApp({ path }: { path: string[] }) {
  return <Shell path={path} />;
}
function Shell({ path }: { path: string[] }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const {
    ready,
    role,
    setRole,
    notifications,
    activities,
    jobs,
    inquiries,
    engineeringReviews,
    quotes,
    salesOrders,
    salesFollowups,
    purchaseRequests,
    inventoryItems,
    productionOrders,
    qcInspections,
    deliveries,
    reset,
  } = useDemo();
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [guide, setGuide] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    entity: string;
  } | null>(null);
  const lastActivityId = useRef<string | null>(null);
  const active = path[0] || "dashboard";
  const unread = notifications.filter((n) => !n.read).length;
  const nav = sidebarNav.filter(([, href]) => {
    const moduleKey = moduleForPath(href);
    return (
      canAccess(role, href) &&
      moduleKey !== null &&
      primaryNavigation[role].includes(moduleKey)
    );
  });
  const activeHref = nav
    .filter(([, href]) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b[1].length - a[1].length)[0]?.[1];
  const ownedJobs = jobs.filter(
    (job) => assigneeForStatus[job.status]?.role === role,
  ).length;
  const workCountFor = (href: string) => {
    if (href === "/notifications") return unread;
    if (href === "/jobs") return ownedJobs;
    if (href === "/quotations/inquiries" && role === "Sales")
      return inquiries.filter((item) => item.status === "NEW").length;
    if (href === "/quotations/follow-ups" && role === "Sales")
      return salesFollowups.filter((item) =>
        ["SCHEDULED", "WAITING"].includes(item.outcome),
      ).length;
    if (href === "/quotations" && role === "Sales")
      return quotes.filter((item) =>
        ["DRAFT", "INTERNAL REVIEW", "CHANGE REQUESTED"].includes(item.status),
      ).length;
    if (href === "/jobs/sales-orders" && role === "Sales")
      return quotes.filter(
        (quote) =>
          quote.status === "ACCEPTED" &&
          !salesOrders.some((order) => order.quotationId === quote.id),
      ).length;
    if (href === "/engineering/reviews" && role === "Engineer")
      return engineeringReviews.filter((item) =>
        ["PENDING", "NEEDS_INFO"].includes(item.result),
      ).length;
    if (href === "/drafting/j1" && role === "Drafting") return ownedJobs;
    if (href === "/planning/job-plan" && role === "Production Planner")
      return ownedJobs;
    if (href === "/purchasing/requests" && role === "Purchasing")
      return purchaseRequests.filter((item) => item.status === "PENDING")
        .length;
    if (href === "/inventory/items" && role === "Store / Warehouse")
      return inventoryItems.filter((item) => item.currentStock < item.minStock)
        .length;
    if (
      href === "/production/work-orders" &&
      ["Production Supervisor", "Production Operator"].includes(role)
    )
      return productionOrders.reduce(
        (total, order) =>
          total +
          order.operations.filter((operation) =>
            ["READY", "IN_PROGRESS"].includes(operation.status),
          ).length,
        0,
      );
    if (href === "/qc/inspections" && role === "QC")
      return qcInspections.filter((item) =>
        ["PENDING", "FAIL", "REWORK"].includes(item.status),
      ).length;
    if (href === "/packing/j1" && role === "Packing") return ownedJobs;
    if (href === "/delivery/d1" && role === "Shipping")
      return deliveries.filter((item) => item.deliveredQty < item.packedQty)
        .length;
    if (href === "/accounting/overview" && role === "Accounting") return 3;
    if (href === "/hr/employees" && role === "HR") return 1;
    return 0;
  };
  useEffect(() => {
    const latest = activities[0];
    if (!ready || !latest) return;
    if (lastActivityId.current === null) {
      lastActivityId.current = latest.id;
      return;
    }
    if (lastActivityId.current === latest.id) return;
    lastActivityId.current = latest.id;
    const showTimer = window.setTimeout(
      () => setToast({ message: latest.action, entity: latest.entity }),
      0,
    );
    const hideTimer = window.setTimeout(() => setToast(null), 3500);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [activities, ready]);
  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) router.push(`/search?q=${encodeURIComponent(search)}`);
  }
  const quickTarget =
    role === "Sales"
      ? "/quotations/new"
      : role === "HR"
        ? "/hr/leave/request"
        : role === "Accounting"
          ? "/accounting/overview"
          : "/jobs";
  if (!ready) {
    return (
      <div
        role="status"
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f4f7fa",
          color: "#536276",
        }}
      >
        กำลังโหลดระบบ...
      </div>
    );
  }
  return (
    <div className="shell">
      <aside
        className={`sidebar ${collapsed ? "collapsed" : ""} ${mobile ? "mobile-open" : ""}`}
      >
        <div className="brand">
          <div className="brandmark">AT</div>
          {!collapsed && (
            <div>
              <strong>AUTO-TECHSYSTEM</strong>
              <span>Industrial ERP</span>
            </div>
          )}
          <button
            className="iconbtn closemobile"
            onClick={() => setMobile(false)}
          >
            <X />
          </button>
        </div>
        <nav>
          {nav.map(([label, href, Icon]) => {
            const workCount = workCountFor(href);
            return (
              <Link
                key={label}
                href={href}
                className={href === activeHref ? "active" : ""}
                title={
                  workCount ? `${label} · มีงาน ${workCount} รายการ` : label
                }
              >
                <Icon size={18} />
                {!collapsed && <span>{label}</span>}
                {workCount > 0 && (
                  <em
                    className="nav-work-badge"
                    aria-label={`มีงาน ${workCount} รายการ`}
                  >
                    {workCount > 99 ? "99+" : workCount}
                  </em>
                )}
              </Link>
            );
          })}
        </nav>
        <button className="collapse" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <>
              <ChevronLeft size={18} />
              <span>ย่อเมนู</span>
            </>
          )}
        </button>
      </aside>
      <div className="main">
        <header className="topbar">
          <button className="iconbtn menu" onClick={() => setMobile(true)}>
            <Menu />
          </button>
          <div className="crumb">
            <span>Operations</span>
            <ChevronRight size={14} />
            <b>{titles[active] || "Workspace"}</b>
          </div>
          <form className="global-search" onSubmit={onSearch}>
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหา quotation, job, customer..."
            />
            <kbd>⌘ K</kbd>
          </form>
          <div className="top-actions">
            <button className="quick" onClick={() => router.push(quickTarget)}>
              <Plus size={17} />{" "}
              {role === "Sales"
                ? "Quotation"
                : role === "HR"
                  ? "Leave request"
                  : "Open job"}
            </button>
            <button className="quick" onClick={() => setGuide(true)}>
              <HelpCircle size={16} /> Demo Guide
            </button>
            <button
              className="bell iconbtn"
              onClick={() => router.push("/notifications")}
            >
              <Bell size={19} />
              {unread > 0 && <i>{unread}</i>}
            </button>
            <select
              aria-label="Demo role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              {roles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <div className="avatar">KS</div>
          </div>
        </header>
        <main className="content">
          <Page path={path} />
        </main>
        <div className="present-tools">
          <button onClick={() => setGuide(true)}>
            <HelpCircle size={16} /> Demo Guide
          </button>
          <button
            onClick={() => {
              if (
                window.confirm(
                  "Reset all demo data, including customers, quotations, jobs, QC and notifications?",
                )
              ) {
                reset();
                router.push("/dashboard");
              }
            }}
          >
            Reset Demo Data
          </button>
        </div>
        {guide && <Guide close={() => setGuide(false)} />}
        {toast && (
          <div className="action-toast" role="status" aria-live="polite">
            <span className="toast-check" aria-hidden="true">
              ✓
            </span>
            <div>
              <b>ดำเนินการสำเร็จ</b>
              <span>{toast.message}</span>
              <small>{toast.entity}</small>
            </div>
            <button aria-label="ปิดการแจ้งเตือน" onClick={() => setToast(null)}>
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
function Page({ path }: { path: string[] }) {
  const { role } = useDemo();
  const root = path[0] || "dashboard";
  const pathname = `/${path.join("/")}`;
  if (root !== "public" && !canAccess(role, pathname))
    return <AccessDenied module={moduleForPath(pathname)} />;
  if (root === "dashboard") return <Dashboard />;
  if (root === "customers") return <Customers newMode={path[1] === "new"} />;
  if (root === "quotations" && path[1] === "inquiries")
    return <InquiryWorkspace />;
  if (root === "quotations" && path[1] === "follow-ups")
    return <SalesFollowupWorkspace />;
  if (root === "quotations" && path[1] === "exceptions")
    return <SalesExceptionsWorkspace />;
  if (root === "quotations") return <Quotations path={path} />;
  if (root === "public" && path[1] === "quotation")
    return <PublicQuotation id={path[2]} />;
  if (root === "jobs" && path[1] === "sales-orders")
    return <SalesOrdersWorkspace />;
  if (root === "jobs") return <Jobs />;
  if (root === "engineering" && path[1] === "reviews")
    return <EngineeringReviewsWorkspace />;
  if (root === "engineering" && path[1] === "changes")
    return <EngineeringChangeWorkspace />;
  if (root === "planning" && path[1] === "job-plan")
    return <JobPlanWorkspace />;
  if (root === "planning" && path[1] === "scheduling")
    return <SchedulingWorkspace />;
  if (root === "purchasing" && path[1] === "supplier-comparison")
    return <SupplierComparisonWorkspace />;
  if (root === "purchasing") return <PurchasingWorkspace />;
  if (root === "production") return <ProductionWorkspace />;
  if (root === "qc") return <QcWorkspace />;
  if (root === "packing" || root === "delivery") return <DeliveryWorkspace />;
  if (root === "costing") return <ActualCostingWorkspace />;
  if (root === "reports" && path[1] === "traceability")
    return <TraceabilityWorkspace />;
  if (root === "reports" && path[1] === "quality")
    return <QualityReportWorkspace />;
  if (root === "notifications") return <Notifications />;
  if (root === "accounting") return <AccountingWorkspace />;
  if (root === "hr") return <HrWorkspace />;
  if (root === "search") return <SearchPage />;
  if (root === "inventory" && path[1] === "trade-goods")
    return <TradeGoodsWorkspace />;
  if (root === "inventory" && path[1] === "items") return <InventoryItems />;
  if (root === "inventory" && path[1] === "stores") return <InventoryStores />;
  if (root === "inventory" && path[1] === "movements")
    return <StockMovements />;
  if (root === "settings" && path[1] === "governance")
    return <GovernanceWorkspace />;
  if (root === "settings" && path[1] === "master-data")
    return <MasterDataWorkspace />;
  return <ModulePage module={root} path={path} />;
}
function AccessDenied({ module }: { module: ModuleKey | null }) {
  const router = useRouter();
  const { role } = useDemo();
  const fallback =
    rolePermissions[role][0] === "dashboard"
      ? "/dashboard"
      : rolePermissions[role][0] === "jobs"
        ? "/jobs"
        : "/notifications";
  return (
    <div className="panel section access-denied">
      <span className="restricted">Access restricted</span>
      <h2>คุณไม่มีสิทธิ์เข้าถึงโมดูลนี้</h2>
      <p>
        สิทธิ์ของ role ปัจจุบันไม่ครอบคลุม {module ?? "หน้านี้"} กรุณาเปลี่ยน
        role ในแถบด้านบน หรือกลับไปยังหน้าที่ได้รับอนุญาต
      </p>
      <button className="primary" onClick={() => router.push(fallback)}>
        กลับสู่หน้าที่ได้รับสิทธิ์
      </button>
    </div>
  );
}
export function Header({
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
function Dashboard() {
  const { jobs, quotes, activities, role } = useDemo();
  const active = jobs.filter((j) => j.status !== "COMPLETED");
  const revenue = quotes.reduce((s, q) => s + quoteTotal(q.items), 0);
  const estimatedCost = Math.round(revenue * 0.72);
  const profit = revenue - estimatedCost;
  const attention = [
    {
      type: "critical",
      title: "QC rework · JOB-2026-00129",
      detail: "Reinspection is required before 28 Sep",
    },
    {
      type: "critical",
      title: "Urgent deadline · JOB-2026-00132",
      detail: "QC disposition required tomorrow",
    },
    {
      type: "warning",
      title: "Material shortage · JOB-2026-00130",
      detail: "SUS304 purchase request awaiting approval",
    },
    {
      type: "warning",
      title: "Outsource delay · JOB-2026-00131",
      detail: "Coating supplier delivery slipped one day",
    },
  ];
  return (
    <>
      <Header
        title={`${role} Command Center`}
        subtitle="Executive operational picture · 25 September 2026"
        action={
          <Link className="primary" href="/quotations/q1">
            Open featured job
          </Link>
        }
      />
      <section className="kpis">
        <Kpi
          label="Active Jobs"
          value={String(active.length)}
          note="1 urgent · 1 rework"
          tone="blue"
        />
        <Kpi
          label="Revenue"
          value={thb(revenue)}
          note="Accepted quotation pipeline"
          tone="green"
        />
        <Kpi
          label="Estimated Cost"
          value={thb(estimatedCost)}
          note="72% of revenue"
          tone="purple"
        />
        <Kpi
          label="Gross Profit / Margin"
          value={`${thb(profit)} · 28%`}
          note="Target margin protected"
          tone="green"
        />
        <Kpi
          label="WIP"
          value={thb(Math.round(estimatedCost * 0.64))}
          note="68% main job progress"
          tone="blue"
        />
        <Kpi label="Due Soon" value="2" note="Within 48 hours" tone="red" />
        <Kpi label="QC Failure" value="1" note="Rework in process" tone="red" />
        <Kpi
          label="Material Shortage"
          value="1"
          note="Purchase action required"
          tone="purple"
        />
      </section>
      <section className="dashgrid">
        <div className="panel chart">
          <div className="panel-head">
            <div>
              <h3>Revenue, cost & profit</h3>
              <span>CALH22609-013 REV 2 drives the live scenario</span>
            </div>
            <Link href="/costing/jobs/j1">Profitability</Link>
          </div>
          <div className="bars">
            <div style={{ height: "54%" }} />
            <div style={{ height: "62%" }} />
            <div style={{ height: "47%" }} />
            <div style={{ height: "70%" }} />
            <div className="bluebar" style={{ height: "84%" }} />
            <div className="bluebar" style={{ height: "68%" }} />
          </div>
          <div className="months">
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
            <span>Sep</span>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Work center capacity</h3>
              <span>Next 7 days</span>
            </div>
            <Link href="/reports/workload">View report</Link>
          </div>
          {[
            ["CNC Milling", 82],
            ["Drilling / Deburring", 76],
            ["Grinding", 64],
            ["Hardening", 89],
            ["Coating", 92],
            ["QC", 71],
          ].map(([n, p]) => (
            <div className="load" key={String(n)}>
              <div>
                <span>{n}</span>
                <b>{p}%</b>
              </div>
              <i>
                <em style={{ width: `${p}%` }} />
              </i>
            </div>
          ))}
        </div>
        <div className="panel full">
          <div className="panel-head">
            <div>
              <h3>Management attention</h3>
              <span>Ranked by severity</span>
            </div>
            <Link href="/jobs">Open job board</Link>
          </div>
          <div className="action-grid">
            {attention.slice(0, 3).map((a) => (
              <Alert key={a.title} {...a} />
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Recent activity</h3>
              <span>Shared job timeline</span>
            </div>
            <Link href="/administration/audit-log">Audit log</Link>
          </div>
          <div className="timeline">
            {activities.slice(0, 5).map((a) => (
              <div key={a.id}>
                <time>{a.at}</time>
                <i />
                <p>
                  <b>{a.action}</b>
                  <span>
                    {a.entity} · {a.user}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Jobs by stage</h3>
              <span>Live production flow</span>
            </div>
          </div>
          <div className="stage-list">
            {[
              "Engineering",
              "Planning",
              "Purchasing",
              "Production",
              "QC",
              "Rework",
            ].map((s) => (
              <div key={s}>
                <span>{s}</span>
                <b>{jobs.filter((j) => j.status === s.toUpperCase()).length}</b>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
function Kpi({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  tone: string;
}) {
  const { role } = useDemo();
  const financial = [
    "Revenue",
    "Estimated Cost",
    "Gross Profit / Margin",
    "WIP",
  ].includes(label);
  if (financial && !canViewFinancials(role)) return null;
  return (
    <div className={`kpi ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}
function Alert({
  type,
  title,
  detail,
}: {
  type: string;
  title: string;
  detail: string;
}) {
  return (
    <div className={`alert ${type}`}>
      <span />
      <div>
        <b>{title}</b>
        <p>{detail}</p>
      </div>
      <ChevronRight size={18} />
    </div>
  );
}
function Customers({ newMode }: { newMode: boolean }) {
  const { customers, addCustomer, quotes, jobs } = useDemo();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(newMode);
  const [form, setForm] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
    province: "Chonburi",
  });
  const list = customers.filter((c) =>
    `${c.name} ${c.code}`.toLowerCase().includes(query.toLowerCase()),
  );
  function create(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    addCustomer({
      id: `c-${Date.now()}`,
      code: `CUS-${String(customers.length + 1).padStart(4, "0")}`,
      status: "Active",
      credit: "Credit 30 Days",
      ...form,
    });
    setOpen(false);
  }
  return (
    <>
      <Header
        title="Customers"
        subtitle="Customer master, contacts and commercial history"
        action={
          <button className="primary" onClick={() => setOpen(true)}>
            <Plus size={17} /> Add customer
          </button>
        }
      />
      <div className="toolbar">
        <label>
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customer or code"
          />
        </label>
        <button>
          Active <ChevronDown size={15} />
        </button>
        <button>
          Province <ChevronDown size={15} />
        </button>
        <span>{list.length} records</span>
      </div>
      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact person</th>
              <th>Province</th>
              <th>Payment terms</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id}>
                <td>
                  <Link className="table-main" href={`/customers/${c.id}`}>
                    {c.name}
                    <small>{c.code}</small>
                  </Link>
                </td>
                <td>
                  {c.contact}
                  <small>{c.email}</small>
                </td>
                <td>{c.province}</td>
                <td>{c.credit}</td>
                <td>
                  <Badge status={c.status} />
                </td>
                <td>
                  <Link className="text-action" href={`/customers/${c.id}`}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="summary-strip">
        <span>Customer portfolio</span>
        <b>{customers.length} Active customers</b>
        <span>{quotes.length} Open quotations</span>
        <span>{jobs.length} Jobs in flow</span>
      </div>
      {open && (
        <Modal title="Add customer" close={() => setOpen(false)}>
          <form className="formgrid" onSubmit={create}>
            {(
              [
                ["name", "Company name"],
                ["contact", "Contact person"],
                ["email", "Email"],
                ["phone", "Phone"],
                ["province", "Province"],
              ] as const
            ).map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  required={key === "name"}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </label>
            ))}
            <div className="form-actions">
              <button type="button" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="primary">Save customer</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
function Quotations({ path }: { path: string[] }) {
  if (path[1] === "new" || path[2] === "edit")
    return <QuotationWorkspaceWithParts />;
  if (path[2] === "preview" || path[1] === "preview")
    return (
      <SavedQuotationPreviewPage
        id={path[2] === "preview" ? path[1] : undefined}
      />
    );
  if (path[2] === "costing") return <Costing />;
  if (path[1] && path[1] !== "new")
    return <SavedQuotationDetailPage id={path[1]} />;
  return <QuoteList />;
}
function QuoteList() {
  const { quotes } = useDemo();
  const [query, setQuery] = useState("");
  const list = quotes.filter((q) =>
    `${q.no} ${q.customer} ${q.project}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <Header
        title="Quotations"
        subtitle="Commercial pipeline and quotation lifecycle"
        action={
          <Link className="primary" href="/quotations/new">
            <Plus size={17} /> Create quotation
          </Link>
        }
      />
      <div className="toolbar">
        <label>
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search quotation, customer, project"
          />
        </label>
        <button>
          Status <ChevronDown size={15} />
        </button>
        <button>
          Created date <ChevronDown size={15} />
        </button>
        <button>Export CSV</button>
      </div>
      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Quotation no.</th>
              <th>Customer / project</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Valid until</th>
              <th>Sales</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.map((q) => (
              <tr key={q.id}>
                <td>
                  <Link className="table-main" href={`/quotations/${q.id}`}>
                    {q.no} <small>REV {q.rev}</small>
                  </Link>
                </td>
                <td>
                  {q.customer}
                  <small>{q.project}</small>
                </td>
                <td className="amount">{thb(quoteTotal(q.items))}</td>
                <td>
                  <Badge status={q.status} />
                </td>
                <td>{q.validUntil}</td>
                <td>{q.sales}</td>
                <td>
                  <Link
                    className="text-action"
                    href={`/quotations/${q.id}/preview`}
                  >
                    Preview
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
function QuoteBuilder() {
  const { customers, saveQuote } = useDemo();
  const router = useRouter();
  const [customerId, setCustomerId] = useState(customers[0]?.id || "");
  const [form, setForm] = useState({
    quotationNo: "CALH22609-013",
    revision: "2",
    date: "25 September 2026",
    project: "Automation Machine Part",
    reference: "",
    branch: "00001",
    address:
      "138 Moo4, Petchkasem Road, Tambol Sarapang, Amphur Khao Yoi, Phetchaburi 76140 Thailand",
    attn: "Purchasing Department",
    cc: "",
    email: "",
    payment: "Credit 30 Days",
    validity: "30 Days",
    leadTime: "4 Weeks",
    contact: "ALONGKRON K.",
    drawingNo: "ATS-AMP-128",
    drawingRev: "2",
    warranty: "รับประกัน 1 ปี",
    deposit: "100",
    delivery: "0",
    credit: "0",
    approvedBy: "Alongkron Kunchong",
    note: "Please issue a crossed cheque payable to Auto-Techsystems Co.,Ltd",
  });
  const [items, setItems] = useState<QuoteItem[]>([
    {
      id: "new-1",
      partName: "Base Plate Assembly",
      partNo: "ATS-BP-042",
      material: "SS400",
      qty: 4,
      unit: "PCS",
      unitPrice: 28500,
      discount: 0,
    },
    {
      id: "new-2",
      partName: "Precision Guide Block",
      partNo: "ATS-GB-119",
      material: "S45C",
      qty: 8,
      unit: "PCS",
      unitPrice: 12600,
      discount: 1200,
    },
  ]);
  const total = quoteTotal(items);
  const customer = customers.find((c) => c.id === customerId);
  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function update(i: number, key: keyof QuoteItem, value: string | number) {
    setItems((rows) =>
      rows.map((row, index) => (index === i ? { ...row, [key]: value } : row)),
    );
  }
  function addRow() {
    setItems([
      ...items,
      {
        id: `new-${Date.now()}`,
        partName: "New item",
        partNo: "ATS-",
        material: "SS400",
        qty: 1,
        unit: "PCS",
        unitPrice: 0,
        discount: 0,
      },
    ]);
  }
  function duplicateRow(i: number) {
    setItems([
      ...items.slice(0, i + 1),
      {
        ...items[i],
        id: `copy-${Date.now()}`,
        partName: `${items[i].partName} (copy)`,
      },
      ...items.slice(i + 1),
    ]);
  }
  function save() {
    if (!customer || !form.project.trim()) return;
    const id = `q-${Date.now()}`;
    saveQuote({
      id,
      no: form.quotationNo,
      rev: Number(form.revision) || 0,
      customerId,
      customer: customer.name,
      project: form.project,
      status: "DRAFT",
      created: form.date,
      validUntil: form.validity,
      sales: "K. Sales",
      items,
      payment: form.payment,
      leadTime: form.leadTime,
    });
    router.push(`/quotations/${id}`);
  }
  const field = (key: keyof typeof form, label: string) => (
    <label>
      {label}
      <input value={form[key]} onChange={(e) => set(key, e.target.value)} />
    </label>
  );
  return (
    <>
      <Header
        title="Quotation Workspace"
        subtitle="แก้ไขรายละเอียดและตรวจ A4 Preview ได้ในหน้าเดียว"
        action={
          <div className="head-actions">
            <button onClick={() => router.back()}>ยกเลิก</button>
            <button className="primary" onClick={save}>
              บันทึกใบเสนอราคา
            </button>
          </div>
        }
      />
      <div className="quote-workspace">
        <section className="quote-editor">
          <div className="panel section">
            <div className="panel-head compact">
              <div>
                <h3>ข้อมูลใบเสนอราคา</h3>
                <span>
                  กรอกให้ครบตามเอกสาร ATS · Preview เปลี่ยนตามข้อมูลทันที
                </span>
              </div>
              <span className="badge info">แก้ไขได้</span>
            </div>
            <div className="form-section-title">ผู้รับเอกสาร</div>
            <div className="formgrid three">
              <label>
                ลูกค้า
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              {field("branch", "สาขา")}
              {field("attn", "Attention")}
              {field("address", "ที่อยู่")}
              {field("cc", "C.c.")}
              {field("email", "อีเมลผู้รับ")}
            </div>
            <div className="form-section-title">ข้อมูลเอกสาร</div>
            <div className="formgrid three">
              {field("quotationNo", "Quotation No.")}
              {field("revision", "Revision")}
              {field("date", "วันที่")}
              {field("validity", "วันยืนราคา")}
              {field("payment", "Payment Terms")}
              {field("leadTime", "Lead Time")}
              {field("contact", "Contact Person")}
              {field("project", "ชื่อโครงการ")}
              {field("reference", "อ้างอิง / Customer PO")}
            </div>
            <div className="form-section-title">
              Drawing, เงื่อนไข และการอนุมัติ
            </div>
            <div className="formgrid three">
              {field("drawingNo", "Drawing No.")}
              {field("drawingRev", "Drawing Revision")}
              {field("warranty", "การรับประกัน")}
              {field("deposit", "Deposit upon order (%)")}
              {field("delivery", "Delivery (%)")}
              {field("credit", "Credit days (%)")}
              {field("approvedBy", "Approved By")}
              {field("note", "หมายเหตุการชำระเงิน")}
            </div>
          </div>
          <div className="panel section spreadsheet">
            <div className="panel-head">
              <div>
                <h3>รายการสินค้า</h3>
                <span>
                  แก้ไขแบบ Excel · Enter เพื่อเปลี่ยนช่อง · ยอดรวมคำนวณอัตโนมัติ
                </span>
              </div>
              <button className="secondary" onClick={addRow}>
                <Plus size={15} /> เพิ่มแถว
              </button>
            </div>
            <div className="item-grid">
              <div className="item-head">
                <span>รายการ / Part No.</span>
                <span>วัสดุ</span>
                <span>จำนวน</span>
                <span>หน่วย</span>
                <span>ราคาต่อหน่วย</span>
                <span>ส่วนลด</span>
                <span>จำนวนเงิน</span>
                <span />
              </div>
              {items.map((x, i) => (
                <div className="item-row editable-row" key={x.id}>
                  <div>
                    <input
                      aria-label="Part name"
                      value={x.partName}
                      onChange={(e) => update(i, "partName", e.target.value)}
                    />
                    <input
                      aria-label="Part number"
                      className="subinput"
                      value={x.partNo}
                      onChange={(e) => update(i, "partNo", e.target.value)}
                    />
                  </div>
                  <input
                    aria-label="Material"
                    value={x.material}
                    onChange={(e) => update(i, "material", e.target.value)}
                  />
                  <input
                    aria-label="Quantity"
                    type="number"
                    min="0"
                    value={x.qty}
                    onChange={(e) => update(i, "qty", Number(e.target.value))}
                  />
                  <input
                    aria-label="Unit"
                    value={x.unit}
                    onChange={(e) => update(i, "unit", e.target.value)}
                  />
                  <input
                    aria-label="Unit price"
                    type="number"
                    min="0"
                    value={x.unitPrice}
                    onChange={(e) =>
                      update(i, "unitPrice", Number(e.target.value))
                    }
                  />
                  <input
                    aria-label="Discount"
                    type="number"
                    min="0"
                    value={x.discount}
                    onChange={(e) =>
                      update(i, "discount", Number(e.target.value))
                    }
                  />
                  <b>{thb(x.qty * x.unitPrice - x.discount)}</b>
                  <div className="row-actions">
                    <button
                      title="Duplicate row"
                      onClick={() => duplicateRow(i)}
                    >
                      ⧉
                    </button>
                    <button
                      title="Delete row"
                      className="remove"
                      disabled={items.length === 1}
                      onClick={() =>
                        setItems(items.filter((_, index) => index !== i))
                      }
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <aside className="quote-preview-panel">
          <div className="preview-title">
            <div>
              <b>A4 Live Preview</b>
              <span>สิ่งที่ลูกค้าจะเห็น</span>
            </div>
            <button className="secondary" onClick={() => window.print()}>
              พิมพ์
            </button>
          </div>
          <LiveQuotationPreview
            customer={customer?.name ?? ""}
            project={form.project}
            payment={form.payment}
            leadTime={form.leadTime}
            reference={form.reference}
            items={items}
            total={total}
          />
          <div className="panel totals sticky-total">
            <h3>สรุปราคา</h3>
            <div>
              <span>รวมก่อน VAT</span>
              <b>{thb(total)}</b>
            </div>
            <div>
              <span>VAT 7%</span>
              <b>{thb(total * 0.07)}</b>
            </div>
            <div className="grand">
              <span>รวมสุทธิ</span>
              <b>{thb(total * 1.07)}</b>
            </div>
            <button className="primary fullbutton" onClick={save}>
              บันทึกและเปิดเอกสาร
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
function LiveQuotationPreview({
  customer,
  project,
  payment,
  leadTime,
  reference,
  items,
  total,
}: {
  customer: string;
  project: string;
  payment: string;
  leadTime: string;
  reference: string;
  items: QuoteItem[];
  total: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("Drawing / product sample");
  const [placement, setPlacement] = useState({ x: 46, y: 32, width: 180 });
  const [drag, setDrag] = useState<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const [doc, setDoc] = useState({
    to: customer,
    branch: "00001",
    address:
      "138 Moo4, Petchkasem Road, Tambol Sarapang, Amphur Khao Yoi, Phetchaburi Province 76140 Thailand",
    attn: "Purchasing Department",
    cc: "—",
    number: "CALH22609-013 REV 2",
    date: "25 September 2026",
    validity: "30 DAYS",
    payment,
    lead: leadTime,
    contact: "ALONGKRON K.",
  });
  useEffect(
    () => setDoc((d) => ({ ...d, to: customer, payment, lead: leadTime })),
    [customer, payment, leadTime],
  );
  function change(key: keyof typeof doc, value: string) {
    setDoc((d) => ({ ...d, [key]: value }));
  }
  function upload(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  }
  function beginDrag(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({
      x: e.clientX,
      y: e.clientY,
      left: placement.x,
      top: placement.y,
    });
  }
  function moveDrag(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag) return;
    setPlacement((p) => ({
      ...p,
      x: Math.max(8, Math.min(290, drag.left + e.clientX - drag.x)),
      y: Math.max(8, Math.min(215, drag.top + e.clientY - drag.y)),
    }));
  }
  const input = (key: keyof typeof doc) => (
    <input value={doc[key]} onChange={(e) => change(key, e.target.value)} />
  );
  return (
    <>
      <div className="image-designer">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => upload(e.target.files?.[0])}
        />
        <button className="secondary" onClick={() => inputRef.current?.click()}>
          แทรกรูป / Drawing
        </button>
        {image && (
          <>
            <label>
              คำบรรยาย
              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </label>
            <label>
              ขนาด
              <input
                type="range"
                min="90"
                max="290"
                value={placement.width}
                onChange={(e) =>
                  setPlacement({ ...placement, width: Number(e.target.value) })
                }
              />
            </label>
            <button className="remove-image" onClick={() => setImage(null)}>
              ลบรูป
            </button>
          </>
        )}
      </div>
      <article className="ats-a4">
        <header className="ats-header">
          <div className="ats-mark">
            ATS<span>⚙</span>
          </div>
          <div className="ats-company">
            <b>AUTO - TECH SYSTEMS CO.,LTD</b>
            <span>
              Manufacturing : 58/2,58/71 Moo 9 T.Raikhing A.Samphran
              Nakornpathom 73210 Thailand (Head Office)
            </span>
            <span>
              Tel : 065 789 5226 E-Mail : ats@auto-techsystems.com Mobile : (081
              777 1669)
            </span>
          </div>
        </header>
        <h1>Quotation</h1>
        <section className="ats-meta">
          <div className="ats-customer">
            <b>To:</b>
            <div>
              {input("to")}
              <label>Branch</label>
              {input("branch")}
              <textarea
                value={doc.address}
                onChange={(e) => change("address", e.target.value)}
              />
            </div>
            <b>Attn:</b>
            <div>{input("attn")}</div>
            <b>C.c.:</b>
            <div>{input("cc")}</div>
          </div>
          <div className="ats-document">
            <p>
              <b>Quotation No.</b>
              {input("number")}
            </p>
            <p>
              <b>Date</b>
              {input("date")}
            </p>
            <p>
              <b>Price Validity</b>
              {input("validity")}
            </p>
            <p>
              <b>Payment Terms</b>
              {input("payment")}
            </p>
            <p>
              <b>Lead Time</b>
              {input("lead")}
            </p>
            <p>
              <b>Contact Person</b>
              {input("contact")}
            </p>
          </div>
        </section>
        <table className="ats-items">
          <thead>
            <tr>
              <th>Item</th>
              <th>Part Name</th>
              <th>Drawing Form</th>
              <th>Part No.</th>
              <th>Material</th>
              <th>Finishing</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Discount</th>
              <th>Amount (THB)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((x, i) => (
              <tr key={x.id}>
                <td>{i + 1}</td>
                <td>
                  <b>{x.partName}</b>
                  <small>
                    {project} · {reference || "Standard drawing"}
                  </small>
                </td>
                <td>ATS</td>
                <td>{x.partNo}</td>
                <td>{x.material}</td>
                <td>N/A</td>
                <td>
                  {x.qty} {x.unit}
                </td>
                <td>{thb(x.unitPrice)}</td>
                <td>{thb(x.discount)}</td>
                <td>{thb(x.qty * x.unitPrice - x.discount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <section className="ats-drawing">
          <div className="drawing-note">
            DRAWING / PRODUCT IMAGE
            <br />
            <span>อัปโหลดรูป แล้วลากเพื่อจัดตำแหน่งบนเอกสาร</span>
          </div>
          {image && (
            <div
              className="placed-image"
              style={{
                left: placement.x,
                top: placement.y,
                width: placement.width,
              }}
              onPointerDown={beginDrag}
              onPointerMove={moveDrag}
              onPointerUp={() => setDrag(null)}
            >
              <img src={image} alt="Product drawing preview" />
              <span>{caption || "Product image"}</span>
              <i>ลากเพื่อย้าย</i>
            </div>
          )}
          <div className="drawing-titleblock">
            <b>AUTO-TECHSYSTEMS CO.,LTD</b>
            <span>TITLE: {project}</span>
            <span>DWG NO: ATS-AMP-128 · REV 2</span>
          </div>
        </section>
        <section className="ats-payment">
          <div>
            <b># Payment Systems</b>
            <p>
              - Deposit upon order <strong>100%</strong>
            </p>
            <p>
              - Deliver <strong>0%</strong>
            </p>
            <p>
              - Credit 30 days <strong>0%</strong>
            </p>
            <small>เงื่อนไขการชำระเงินเป็นไปตามที่ระบุในใบเสนอราคา</small>
          </div>
          <div className="ats-totals">
            <p>
              Total <b>{thb(total)}</b>
            </p>
            <p>
              VAT 7% <b>{thb(total * 0.07)}</b>
            </p>
            <strong>
              Grand Total <b>{thb(total * 1.07)}</b>
            </strong>
          </div>
        </section>
        <section className="ats-amount">
          <span>ตัวอักษร</span>
          <b>ยอดเงินตามใบเสนอราคา รวมภาษีมูลค่าเพิ่ม</b>
        </section>
        <footer className="ats-footer">
          <div>
            <b>APPROVED BY</b>
            <strong>Alongkron Kunchong</strong>
            <span>
              Alongkron Kunchong
              <br />
              Biz. Development Director
            </span>
          </div>
          <div>
            <i>____________________________</i>
            <b>Signature & Company Stamp</b>
            <span>(Please return a copy by email or fax)</span>
          </div>
          <p>
            This is a computer generated quotation no signature is required.
          </p>
        </footer>
      </article>
    </>
  );
}
function QuoteDetail({ id }: { id: string }) {
  const { quotes, setQuoteStatus } = useDemo();
  const q = quotes.find((x) => x.id === id) || quotes[0];
  const router = useRouter();
  if (!q) return null;
  const total = quoteTotal(q.items);
  return (
    <>
      <Header
        title={`${q.no} · REV ${q.rev}`}
        subtitle={`${q.customer} · ${q.project}`}
        action={
          <div className="head-actions">
            <Link className="secondary" href={`/quotations/${q.id}/preview`}>
              A4 Preview
            </Link>
            <button
              className="primary"
              onClick={() => setQuoteStatus(q.id, "SENT")}
            >
              Send quotation
            </button>
          </div>
        }
      />
      <div className="tabs">
        <button className="selected">Overview</button>
        <button onClick={() => router.push(`/quotations/${q.id}/costing`)}>
          Costing
        </button>
        <button>Revisions</button>
        <button>Activity</button>
      </div>
      <div className="detail-grid">
        <section>
          <div className="panel section">
            <div className="doc-header">
              <div className="doc-logo">AT</div>
              <div>
                <b>AUTO-TECHSYSTEM</b>
                <p>Industrial automation & precision fabrication</p>
              </div>
              <Badge status={q.status} />
            </div>
            <dl className="doc-meta">
              <div>
                <dt>Customer</dt>
                <dd>{q.customer}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{q.created}</dd>
              </div>
              <div>
                <dt>Payment</dt>
                <dd>{q.payment}</dd>
              </div>
              <div>
                <dt>Lead time</dt>
                <dd>{q.leadTime}</dd>
              </div>
            </dl>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Part no.</th>
                  <th>Material</th>
                  <th>Qty</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {q.items.map((i, n) => (
                  <tr key={i.id}>
                    <td>
                      {n + 1}. {i.partName}
                    </td>
                    <td>{i.partNo}</td>
                    <td>{i.material}</td>
                    <td>
                      {i.qty} {i.unit}
                    </td>
                    <td className="amount">
                      {thb(i.qty * i.unitPrice - i.discount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <aside className="panel totals">
          <h3>Commercial summary</h3>
          <div>
            <span>Subtotal</span>
            <b>{thb(total)}</b>
          </div>
          <div>
            <span>VAT 7%</span>
            <b>{thb(total * 0.07)}</b>
          </div>
          <div className="grand">
            <span>Grand total</span>
            <b>{thb(total * 1.07)}</b>
          </div>
          <hr />
          <button
            className="secondary fullbutton"
            onClick={() => router.push(`/public/quotation/${q.id}`)}
          >
            Open customer portal
          </button>
          {q.status !== "ACCEPTED" && (
            <button
              className="primary fullbutton"
              onClick={() => {
                setQuoteStatus(q.id, "ACCEPTED");
                router.push("/jobs");
              }}
            >
              Accept & create job
            </button>
          )}
        </aside>
      </div>
    </>
  );
}
function QuotePreview() {
  const { quotes } = useDemo();
  const q = quotes[0];
  const total = quoteTotal(q.items);
  return (
    <>
      <Header
        title="Quotation A4 Preview"
        subtitle="Printable customer-facing document"
        action={
          <div className="head-actions">
            <button onClick={() => window.print()}>Print</button>
            <button className="primary">Export PDF demo</button>
          </div>
        }
      />
      <article className="a4">
        <header>
          <div className="doc-logo large">AT</div>
          <div>
            <h2>AUTO-TECHSYSTEM CO., LTD.</h2>
            <p>88 Industrial Estate Road, Chonburi 20000 · Thailand</p>
          </div>
          <div>
            <b>QUOTATION</b>
            <p>
              {q.no} REV {q.rev}
            </p>
          </div>
        </header>
        <section className="a4info">
          <div>
            <b>To</b>
            <p>{q.customer}</p>
            <p>Attn: Nattapong J.</p>
          </div>
          <div>
            <b>Date</b>
            <p>25 September 2026</p>
            <b>Validity</b>
            <p>30 DAYS</p>
          </div>
        </section>
        <h3>{q.project}</h3>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {q.items.map((i, n) => (
              <tr key={i.id}>
                <td>{n + 1}</td>
                <td>
                  {i.partName}
                  <small>
                    {i.partNo} · {i.material}
                  </small>
                </td>
                <td>
                  {i.qty} {i.unit}
                </td>
                <td>{thb(i.unitPrice)}</td>
                <td>{thb(i.qty * i.unitPrice - i.discount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="a4total">
          <p>
            Subtotal <b>{thb(total)}</b>
          </p>
          <p>
            VAT 7% <b>{thb(total * 0.07)}</b>
          </p>
          <h3>
            Grand total <b>{thb(total * 1.07)}</b>
          </h3>
        </div>
        <footer>
          <p>
            Payment terms: {q.payment} · Lead time: {q.leadTime}
          </p>
          <p>This is a computer generated quotation.</p>
        </footer>
      </article>
    </>
  );
}
function Costing() {
  return (
    <>
      <Header
        title="Quotation cost calculator"
        subtitle="Restricted finance view · Internal use only"
        action={<span className="restricted">Restricted</span>}
      />
      <div className="detail-grid">
        <section className="panel section">
          <h3>Cost breakdown · Base Plate Assembly</h3>
          {[
            ["Material / supplier", 65800],
            ["Machining internal", 26400],
            ["Outsource finishing", 12800],
            ["Labour", 9100],
            ["Other cost", 4000],
          ].map(([name, value]) => (
            <div className="costline" key={String(name)}>
              <span>{name}</span>
              <b>{thb(Number(value))}</b>
            </div>
          ))}
          <div className="costline total">
            <span>Total estimated cost</span>
            <b>{thb(118100)}</b>
          </div>
        </section>
        <aside className="panel totals">
          <h3>Margin model</h3>
          <div>
            <span>Selling price</span>
            <b>{thb(151400)}</b>
          </div>
          <div>
            <span>Estimated cost</span>
            <b>{thb(118100)}</b>
          </div>
          <div className="grand">
            <span>Gross margin</span>
            <b>22.0%</b>
          </div>
          <button className="primary fullbutton">Apply 28% markup</button>
        </aside>
      </div>
    </>
  );
}
function Jobs() {
  const { jobs, setJobStatus, role } = useDemo();
  const stages: Status[] = [
    "ENGINEERING",
    "DRAFTING",
    "PLANNING",
    "PURCHASING",
    "PRODUCTION",
    "QC",
    "REWORK",
    "PACKING",
  ];
  const nextStage = (stage: Status): Status =>
    stage === "ENGINEERING"
      ? "DRAFTING"
      : stage === "DRAFTING"
        ? "PLANNING"
        : stage === "PLANNING"
          ? "PURCHASING"
          : stage === "PURCHASING"
            ? "PRODUCTION"
            : stage === "PRODUCTION"
              ? "QC"
              : stage === "QC"
                ? "PACKING"
                : stage === "REWORK"
                  ? "QC"
                  : "DELIVERED";
  return (
    <>
      <Header
        title="งาน / โครงการ"
        subtitle="ติดตามสถานะงานตั้งแต่รับคำสั่งซื้อจนผ่าน QC และพร้อมจัดส่ง"
      />
      <div className="kanban">
        {stages.map((stage) => (
          <div className="kanban-col" key={stage}>
            <h3>
              {stage}
              <span>{jobs.filter((j) => j.status === stage).length}</span>
            </h3>
            {jobs
              .filter((j) => j.status === stage)
              .map((j) => {
                const target = nextStage(stage);
                const owner = assigneeForStatus[j.status];
                return (
                  <div className="job-card" key={j.id}>
                    <Badge status={j.priority} />
                    <h4>{j.no}</h4>
                    <p>{j.project}</p>
                    <small>{j.customer}</small>
                    {owner && (
                      <div className="job-owner">
                        <span>ผู้รับผิดชอบ</span>
                        <b>{owner.name}</b>
                        <small>{owner.role}</small>
                      </div>
                    )}
                    <div className="progress">
                      <i style={{ width: `${j.progress}%` }} />
                    </div>
                    <footer>
                      <span>Due {j.due}</span>
                      {canMoveJobTo(role, target) ? (
                        <button onClick={() => setJobStatus(j.id, target)}>
                          ส่งต่อ: {handoffLabel(role, target)}
                        </button>
                      ) : (
                        <span className="muted">รอ Role ที่รับผิดชอบ</span>
                      )}
                    </footer>
                  </div>
                );
              })}
            {jobs.filter((j) => j.status === stage).length === 0 && (
              <div className="empty">ไม่มีงานในขั้นตอนนี้</div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
function Notifications() {
  const { notifications, markRead, markAllRead } = useDemo();
  return (
    <>
      <Header
        title="ศูนย์การแจ้งเตือน"
        subtitle="แจ้งเตือนการปฏิบัติงานและความคืบหน้า Workflow"
        action={
          <button className="secondary" onClick={markAllRead}>
            อ่านทั้งหมดแล้ว
          </button>
        }
      />
      <div className="panel notification-list">
        {notifications.map((n) => (
          <button
            className={n.read ? "" : "unread"}
            key={n.id}
            onClick={() => markRead(n.id)}
          >
            <span className={`notify-dot ${n.type.toLowerCase()}`} />
            <div>
              <b>{n.title}</b>
              <p>{n.detail}</p>
              <small>{n.type} · เมื่อสักครู่</small>
            </div>
            {!n.read && <i>ใหม่</i>}
          </button>
        ))}
      </div>
    </>
  );
}
function PublicQuotation({ id }: { id?: string }) {
  const { quotes, setQuoteStatus } = useDemo();
  const q = quotes.find((x) => x.id === id) || quotes[0];
  const [message, setMessage] = useState("");
  const total = quoteTotal(q.items);
  const responded = ["ACCEPTED", "REJECTED", "CHANGE REQUESTED"].includes(
    q.status,
  );
  return (
    <div className="public-doc">
      <div className="panel section">
        <div className="doc-header">
          <div className="doc-logo">AT</div>
          <div>
            <b>AUTO-TECHSYSTEM</b>
            <p>Portal สำหรับตอบรับ Quotation อย่างปลอดภัย</p>
          </div>
          <Badge status={q.status} />
        </div>
        <h1>
          {q.no} · REV {q.rev}
        </h1>
        <p className="muted">
          {q.customer} · {q.project}
        </p>
        <table>
          <thead>
            <tr>
              <th>รายละเอียด</th>
              <th>จำนวน</th>
              <th>มูลค่า</th>
            </tr>
          </thead>
          <tbody>
            {q.items.map((i) => (
              <tr key={i.id}>
                <td>
                  {i.partName}
                  <small>{i.partNo}</small>
                </td>
                <td>
                  {i.qty} {i.unit}
                </td>
                <td>{thb(i.qty * i.unitPrice - i.discount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="public-total">
          ยอดรวมสุทธิ <b>{thb(total * 1.07)}</b>
        </div>
        <label className="public-message">
          ข้อความจากลูกค้า
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="ข้อความเพิ่มเติมหรือรายละเอียดที่ต้องการแก้ไข"
          />
        </label>
        {responded ? (
          <div
            className={`alert ${q.status === "ACCEPTED" ? "success" : "warning"}`}
          >
            <span />
            <div>
              <b>บันทึกคำตอบเรียบร้อยแล้ว</b>
              <p>
                {q.status === "ACCEPTED"
                  ? "ระบบสร้าง Sales Order, Job, Draft BOM/Routing และ Purchase Request ให้แล้ว"
                  : "ฝ่ายขายจะได้รับสถานะและข้อความเพื่อดำเนินการต่อ"}
              </p>
            </div>
          </div>
        ) : (
          <div className="form-actions">
            <button onClick={() => setQuoteStatus(q.id, "REJECTED")}>
              ปฏิเสธ
            </button>
            <button
              className="secondary"
              onClick={() => setQuoteStatus(q.id, "CHANGE REQUESTED")}
            >
              ขอแก้ไข
            </button>
            <button
              className="primary"
              onClick={() => setQuoteStatus(q.id, "ACCEPTED")}
            >
              ยอมรับ Quotation
            </button>
          </div>
        )}
        {q.status === "ACCEPTED" && (
          <div className="form-actions">
            <Link className="secondary" href="/jobs/sales-orders">
              ดู Sales Order
            </Link>
            <Link className="primary" href="/jobs">
              ติดตาม Job
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
function SearchPage() {
  const { customers, quotes, jobs } = useDemo();
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.toLowerCase() || "";
  const matched = [
    ...quotes
      .filter((x) => `${x.no} ${x.customer}`.toLowerCase().includes(q))
      .map((x) => ({
        label: x.no,
        detail: x.customer,
        href: `/quotations/${x.id}`,
      })),
    ...jobs
      .filter((x) => `${x.no} ${x.project}`.toLowerCase().includes(q))
      .map((x) => ({ label: x.no, detail: x.project, href: "/jobs" })),
    ...customers
      .filter((x) => x.name.toLowerCase().includes(q))
      .map((x) => ({
        label: x.name,
        detail: x.code,
        href: `/customers/${x.id}`,
      })),
  ];
  return (
    <>
      <Header title="ค้นหาทั้งระบบ" subtitle={`ผลการค้นหา “${q}”`} />
      <div className="panel results">
        {matched.length ? (
          matched.map((m) => (
            <Link key={m.label} href={m.href}>
              <Search size={17} />
              <div>
                <b>{m.label}</b>
                <span>{m.detail}</span>
              </div>
              <ChevronRight size={17} />
            </Link>
          ))
        ) : (
          <div className="empty">
            ไม่พบข้อมูล ลองค้นหาด้วยเลข Quotation, เลข Job หรือชื่อลูกค้า
          </div>
        )}
      </div>
    </>
  );
}
function ModulePage({ module }: { module: string; path: string[] }) {
  const { jobs, setJobStatus } = useDemo();
  const router = useRouter();
  const labels: Record<string, { title: string; desc: string }> = {
    engineering: {
      title: "Engineering Review",
      desc: "Review requirements, technical feasibility and job approval.",
    },
    drafting: {
      title: "Drawing Control",
      desc: "Manage revisions, drawing files and 3D model preview.",
    },
    planning: {
      title: "Production Planning",
      desc: "Material availability, routing and capacity planning.",
    },
    purchasing: {
      title: "Purchasing",
      desc: "Purchase requests, approval queue and supplier orders.",
    },
    outsourcing: {
      title: "Outsource Control",
      desc: "External process orders, delivery dates and actual cost.",
    },
    inventory: {
      title: "Inventory",
      desc: "Stock overview, stores, reservations and movements.",
    },
    production: {
      title: "Production Control",
      desc: "Work orders across 13 work centers.",
    },
    qc: {
      title: "Quality Control",
      desc: "Inspection measurements, disposition and rework flow.",
    },
    packing: {
      title: "Packing",
      desc: "Packing instructions, labels and completion check.",
    },
    delivery: {
      title: "Delivery",
      desc: "Delivery note preparation and shipment confirmation.",
    },
    costing: {
      title: "Job Costing & Profitability",
      desc: "Estimated and actual cost with gross margin analysis.",
    },
    reports: {
      title: "Reports & Analytics",
      desc: "Operational reporting with filters and export-ready views.",
    },
    hr: {
      title: "Human Resources",
      desc: "People, attendance, leave approvals and announcements.",
    },
    administration: {
      title: "Audit log",
      desc: "Immutable activity trail and restricted record access.",
    },
    settings: {
      title: "System Settings",
      desc: "Roles, permissions, master data and mock integrations.",
    },
  };
  const info = labels[module] || {
    title: "Workspace",
    desc: "Interactive ERP module",
  };
  const nextStatus: Partial<Record<string, Status>> = {
    engineering: "DRAFTING",
    drafting: "PLANNING",
    planning: "PURCHASING",
    purchasing: "PRODUCTION",
    inventory: "PRODUCTION",
    production: "QC",
    qc: "PACKING",
    packing: "DELIVERED",
    delivery: "COMPLETED",
  };
  const moduleStatus: Partial<Record<string, Status>> = {
    engineering: "ENGINEERING",
    drafting: "DRAFTING",
    planning: "PLANNING",
    purchasing: "PURCHASING",
    inventory: "PURCHASING",
    production: "PRODUCTION",
    qc: "QC",
    packing: "PACKING",
    delivery: "DELIVERED",
  };
  const current = jobs.find((job) => job.status === moduleStatus[module]);
  const targetStatus = nextStatus[module];
  const advanceWorkflow = () => {
    if (current && targetStatus) setJobStatus(current.id, targetStatus);
  };
  const exportJobs = () => {
    const escapeCell = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const rows = [
      ["Job", "Project", "Status", "Due"],
      ...jobs.map((job) => [job.no, job.project, job.status, job.due]),
    ];
    const csv = rows.map((row) => row.map(escapeCell).join(",")).join("\n");
    const url = URL.createObjectURL(
      new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${module}-jobs.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  if (!current)
    return (
      <>
        <Header title={info.title} subtitle={info.desc} />
        <div className="panel empty">
          ยังไม่มี Job ที่รอดำเนินการในขั้นตอนนี้
        </div>
      </>
    );
  return (
    <>
      <Header
        title={info.title}
        subtitle={info.desc}
        action={
          targetStatus ? (
            <button className="primary" onClick={advanceWorkflow}>
              ดำเนินการไป {targetStatus.replaceAll("_", " ")}
            </button>
          ) : undefined
        }
      />
      <div className="module-grid">
        <section className="panel section">
          <div className="module-hero">
            <div className="industrial-icon">
              <Factory />
            </div>
            <div>
              <h2>{info.title}</h2>
              <p>
                This module is linked to the live demo workflow. Update an
                action below to generate an activity and refresh the command
                center.
              </p>
            </div>
          </div>
          <div className="workflow">
            <span className="done">Quotation</span>
            <i />
            <span className={module === "engineering" ? "current" : "done"}>
              Engineering
            </span>
            <i />
            <span className={module === "drafting" ? "current" : ""}>
              Drafting
            </span>
            <i />
            <span className={module === "planning" ? "current" : ""}>
              Planning
            </span>
            <i />
            <span className={module === "production" ? "current" : ""}>
              Production
            </span>
            <i />
            <span className={module === "qc" ? "current" : ""}>QC</span>
            <i />
            <span className={module === "delivery" ? "current" : ""}>
              Delivery
            </span>
          </div>
          <div className="work-row">
            <div>
              <b>{current.no}</b>
              <p>{current.project}</p>
            </div>
            <Badge status={current.status} />
            {targetStatus && (
              <button className="secondary" onClick={advanceWorkflow}>
                อัปเดตเป็น {targetStatus.replaceAll("_", " ")}
              </button>
            )}
          </div>
        </section>
        <aside className="panel section">
          <h3>Module actions</h3>
          <button
            className="action-button"
            onClick={advanceWorkflow}
            disabled={!targetStatus}
          >
            ดำเนินการขั้นถัดไป <Plus size={16} />
          </button>
          <button
            className="action-button"
            onClick={() => router.push("/jobs")}
          >
            Open related job <ChevronRight size={16} />
          </button>
          <button className="action-button" onClick={exportJobs}>
            Export CSV demo <ChevronRight size={16} />
          </button>
          <hr />
          <h3>Today&apos;s queue</h3>
          <p className="muted">3 assigned records · 1 requires attention</p>
        </aside>
      </div>
      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Record</th>
              <th>Linked job</th>
              <th>Owner</th>
              <th>Updated</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {jobs.slice(0, 4).map((j) => (
              <tr key={j.id}>
                <td className="table-main">
                  {module.toUpperCase().slice(0, 3)}-{j.no.slice(-6)}
                  <small>{j.project}</small>
                </td>
                <td>{j.no}</td>
                <td>Demo Team</td>
                <td>25 Sep 2026</td>
                <td>
                  <Badge status={j.status} />
                </td>
                <td>
                  <button
                    className="text-action"
                    onClick={() => router.push("/jobs")}
                  >
                    Open
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
export function Badge({ status }: { status: string }) {
  const statusToken = status.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-");
  return (
    <span className={`badge ${statusClass(status)} badge-${statusToken}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
function Modal({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <header>
          <h2>{title}</h2>
          <button className="iconbtn" onClick={close}>
            <X />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
function Guide({ close }: { close: () => void }) {
  const steps: [string, string][] = [
    ["Dashboard", "/dashboard"],
    ["Quotation CALH22609-013 REV 2", "/quotations/q1"],
    ["Cost Calculator", "/quotations/q1/costing"],
    ["Preview Quotation", "/quotations/q1/preview"],
    ["Customer Public Link", "/public/quotation/q1"],
    ["Accept Quotation", "/public/quotation/q1"],
    ["Job JOB-2026-00128", "/jobs"],
    ["Engineering", "/engineering/j1"],
    ["3D Drawing", "/drafting/j1"],
    ["Production Planning", "/planning/j1"],
    ["Production Tracking", "/production/work-orders/j1"],
    ["QC", "/qc/inspections/j1"],
    ["Packing / Delivery", "/packing/j1"],
    ["Profitability", "/costing/jobs/j1"],
    ["HR", "/hr/employees"],
  ];
  return (
    <div className="guide">
      <header>
        <div>
          <span>Presentation mode</span>
          <h3>Executive demo guide</h3>
        </div>
        <button className="iconbtn" onClick={close}>
          <X />
        </button>
      </header>
      {steps.map(([label, href], i) => (
        <Link onClick={close} href={href} key={label}>
          <b>{String(i + 1).padStart(2, "0")}</b>
          <span>{label}</span>
          <em>เปิดหน้านี้</em>
          <ChevronRight size={16} />
        </Link>
      ))}
    </div>
  );
}
