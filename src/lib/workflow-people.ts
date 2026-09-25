import type { Role, Status } from "@/types";

export const personForRole: Record<Role, string> = {
  Executive: "K. Kittipong",
  "System Admin": "K. Supakit",
  Sales: "K. Narin",
  Engineer: "K. Somchai",
  Drafting: "K. Preecha",
  "Production Planner": "K. Anan",
  Purchasing: "K. Malee",
  "Store / Warehouse": "K. Wichai",
  "Production Supervisor": "K. Chai",
  "Production Operator": "K. Ton",
  QC: "K. Woranuch",
  Packing: "K. Fon",
  Shipping: "K. Nop",
  Accounting: "K. Ratchanee",
  HR: "K. Siriporn",
};

export const assigneeForStatus: Partial<
  Record<Status, { name: string; role: Role }>
> = {
  ENGINEERING: { name: "K. Somchai", role: "Engineer" },
  DRAFTING: { name: "K. Preecha", role: "Drafting" },
  PLANNING: { name: "K. Anan", role: "Production Planner" },
  PURCHASING: { name: "K. Malee", role: "Purchasing" },
  PRODUCTION: { name: "K. Chai", role: "Production Supervisor" },
  QC: { name: "K. Woranuch", role: "QC" },
  REWORK: { name: "K. Ton", role: "Production Operator" },
  PACKING: { name: "K. Fon", role: "Packing" },
  DELIVERED: { name: "K. Nop", role: "Shipping" },
  COMPLETED: { name: "K. Narin", role: "Sales" },
};

export function handoffLabel(fromRole: Role, target: Status) {
  const recipient = assigneeForStatus[target];
  const sender = personForRole[fromRole];
  return recipient
    ? `${sender} (${fromRole}) → ${recipient.name} (${recipient.role})`
    : `${sender} (${fromRole})`;
}
