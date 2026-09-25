export const thb = (value: number) => new Intl.NumberFormat("th-TH", { style:"currency", currency:"THB", maximumFractionDigits:0 }).format(value);
export const quoteTotal = (items: {qty:number;unitPrice:number;discount:number}[]) => items.reduce((sum,item)=>sum+item.qty*item.unitPrice-item.discount,0);
export const statusClass = (status: string) => status === "COMPLETED" || status === "ACCEPTED" || status === "DELIVERED" ? "success" : status === "OVERDUE" || status === "FAILED" ? "danger" : status === "WAITING CUSTOMER" || status === "QC" ? "warning" : "info";
