import { Role, Status } from "@/types";

export type ModuleKey = "dashboard" | "sales" | "customers" | "quotations" | "jobs" | "engineering" | "drafting" | "planning" | "purchasing" | "outsourcing" | "inventory" | "production" | "qc" | "packing" | "delivery" | "costing" | "reports" | "hr" | "notifications" | "administration" | "settings";

export const rolePermissions: Record<Role, ModuleKey[]> = {
  "Executive": ["dashboard","jobs","costing","reports","notifications"],
  "System Admin": ["dashboard","sales","customers","quotations","jobs","engineering","drafting","planning","purchasing","outsourcing","inventory","production","qc","packing","delivery","costing","reports","hr","notifications","administration","settings"],
  "Sales": ["dashboard","sales","customers","quotations","jobs","notifications"],
  "Engineer": ["dashboard","jobs","engineering","drafting","notifications"],
  "Drafting": ["dashboard","jobs","drafting","notifications"],
  "Production Planner": ["dashboard","jobs","planning","purchasing","inventory","production","reports","notifications"],
  "Purchasing": ["dashboard","jobs","purchasing","outsourcing","inventory","notifications"],
  "Store / Warehouse": ["dashboard","jobs","inventory","purchasing","notifications"],
  "Production Supervisor": ["dashboard","jobs","production","qc","packing","reports","notifications"],
  "Production Operator": ["jobs","production","notifications"],
  "QC": ["dashboard","jobs","qc","notifications"],
  "Packing": ["jobs","packing","delivery","notifications"],
  "Shipping": ["jobs","packing","delivery","notifications"],
  "HR": ["dashboard","hr","notifications"],
};

/** The concise sidebar is intentionally smaller than the complete access set. */
export const primaryNavigation: Record<Role, ModuleKey[]> = {
  "Executive": ["dashboard", "jobs", "reports", "notifications"],
  "System Admin": ["dashboard", "quotations", "jobs", "production", "hr", "administration", "settings", "notifications"],
  "Sales": ["dashboard", "customers", "quotations", "jobs", "notifications"],
  "Engineer": ["dashboard", "jobs", "engineering", "drafting", "notifications"],
  "Drafting": ["dashboard", "jobs", "drafting", "notifications"],
  "Production Planner": ["dashboard", "jobs", "planning", "purchasing", "notifications"],
  "Purchasing": ["dashboard", "jobs", "purchasing", "inventory", "notifications"],
  "Store / Warehouse": ["dashboard", "jobs", "inventory", "notifications"],
  "Production Supervisor": ["dashboard", "jobs", "production", "qc", "notifications"],
  "Production Operator": ["jobs", "production", "notifications"],
  "QC": ["dashboard", "jobs", "qc", "notifications"],
  "Packing": ["jobs", "packing", "delivery", "notifications"],
  "Shipping": ["jobs", "delivery", "notifications"],
  "HR": ["dashboard", "hr", "notifications"],
};

export function moduleForPath(pathname: string): ModuleKey | null {
  if (pathname === "/" || pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/customers")) return "customers";
  if (pathname.startsWith("/quotations") || pathname.startsWith("/public/quotation")) return "quotations";
  if (pathname.startsWith("/jobs")) return "jobs";
  if (pathname.startsWith("/engineering")) return "engineering";
  if (pathname.startsWith("/drafting")) return "drafting";
  if (pathname.startsWith("/planning")) return "planning";
  if (pathname.startsWith("/purchasing")) return "purchasing";
  if (pathname.startsWith("/outsourcing")) return "outsourcing";
  if (pathname.startsWith("/inventory")) return "inventory";
  if (pathname.startsWith("/production")) return "production";
  if (pathname.startsWith("/qc")) return "qc";
  if (pathname.startsWith("/packing")) return "packing";
  if (pathname.startsWith("/delivery")) return "delivery";
  if (pathname.startsWith("/costing")) return "costing";
  if (pathname.startsWith("/reports")) return "reports";
  if (pathname.startsWith("/hr")) return "hr";
  if (pathname.startsWith("/notifications")) return "notifications";
  if (pathname.startsWith("/administration")) return "administration";
  if (pathname.startsWith("/settings")) return "settings";
  return null;
}

export function canAccess(role: Role, pathname: string) {
  const module = moduleForPath(pathname);
  return module === null || rolePermissions[role].includes(module);
}

const writableModules: Record<Role, ModuleKey[]> = {
  "Executive": [],
  "System Admin": ["sales","customers","quotations","jobs","engineering","drafting","planning","purchasing","outsourcing","inventory","production","qc","packing","delivery","costing","reports","hr","notifications","administration","settings"],
  "Sales": ["customers","quotations"],
  "Engineer": ["engineering"],
  "Drafting": ["drafting"],
  "Production Planner": ["planning"],
  "Purchasing": ["purchasing","outsourcing"],
  "Store / Warehouse": ["inventory"],
  "Production Supervisor": ["production"],
  "Production Operator": ["production"],
  "QC": ["qc"],
  "Packing": ["packing"],
  "Shipping": ["delivery"],
  "HR": ["hr"],
};

export function canWrite(role: Role, module: ModuleKey | null) {
  return module !== null && writableModules[role].includes(module);
}

export function canViewFinancials(role: Role) {
  return role === "Executive" || role === "System Admin";
}

export function canMoveJobTo(role: Role, target: Status) {
  if (role === "System Admin") return true;
  const targets: Partial<Record<Role, Status[]>> = {
    "Engineer": ["DRAFTING"],
    "Drafting": ["PLANNING"],
    "Production Planner": ["PURCHASING", "PRODUCTION"],
    "Purchasing": ["PLANNING"],
    "Store / Warehouse": ["PLANNING"],
    "Production Supervisor": ["QC"],
    "Production Operator": ["QC"],
    "QC": ["REWORK", "PACKING"],
    "Packing": ["DELIVERED"],
    "Shipping": ["COMPLETED"],
  };
  return targets[role]?.includes(target) ?? false;
}
