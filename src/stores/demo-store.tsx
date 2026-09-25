"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { seedActivities, seedCustomers, seedJobs, seedNotifications, seedQuotes, seedInventoryItems, seedStores, seedMovements } from "@/data/seed";
import { Activity, Customer, Job, Notification, Quotation, Role, Status, InventoryItem, StoreLocation, StockMovement } from "@/types";
import { canMoveJobTo } from "@/lib/permissions";
type Store = { customers: Customer[]; quotes: Quotation[]; jobs: Job[]; activities: Activity[]; notifications: Notification[]; inventoryItems: InventoryItem[]; stores: StoreLocation[]; movements: StockMovement[]; role: Role; addCustomer:(c:Customer)=>void; saveQuote:(q:Quotation)=>void; setQuoteStatus:(id:string,s:Status)=>void; setJobStatus:(id:string,s:Status)=>void; setRole:(role:Role)=>void; markRead:(id:string)=>void; markAllRead:()=>void; reset:()=>void; };
const DemoContext=createContext<Store | null>(null);
const initial={customers:seedCustomers,quotes:seedQuotes,jobs:seedJobs,activities:seedActivities,notifications:seedNotifications,inventoryItems:seedInventoryItems,stores:seedStores,movements:seedMovements,role:"Executive" as Role};
export function DemoProvider({children}:{children:React.ReactNode}) { const [state,setState]=useState(initial); const [ready,setReady]=useState(false);
 useEffect(()=>{const saved=localStorage.getItem("ats-demo");if(saved) setState({ ...initial, ...JSON.parse(saved) });setReady(true)},[]);
 useEffect(()=>{if(ready)localStorage.setItem("ats-demo",JSON.stringify(state))},[state,ready]);
 const store=useMemo<Store>(()=>({...state,
 addCustomer:c=>setState(s=>({...s,customers:[c,...s.customers]})),
 saveQuote:q=>setState(s=>({...s,quotes:s.quotes.some(x=>x.id===q.id)?s.quotes.map(x=>x.id===q.id?q:x):[q,...s.quotes]})),
 setQuoteStatus:(id,status)=>setState(s=>{const q=s.quotes.find(x=>x.id===id); const jobs=status==="ACCEPTED"&&q&&!s.jobs.some(j=>j.quotationId===id)?[{id:`j-${Date.now()}`,no:`JOB-${String(Date.now()).slice(-6)}`,quotationId:id,customer:q.customer,project:q.project,status:"ENGINEERING" as Status,due:"15 Oct 2026",progress:8,priority:"Normal" as const},...s.jobs]:s.jobs;return {...s,quotes:s.quotes.map(x=>x.id===id?{...x,status}:x),jobs,activities:[{id:`a-${Date.now()}`,at:"Now",user:"Demo User",role:s.role,action:`Quotation ${status.toLowerCase()}`,entity:q?.no??id},...s.activities]}}),
 setJobStatus:(id,status)=>setState(s=>{if(!canMoveJobTo(s.role,status))return s;return {...s,jobs:s.jobs.map(j=>j.id===id?{...j,status,progress:status==="COMPLETED"?100:Math.min(95,j.progress+15)}:j),activities:[{id:`a-${Date.now()}`,at:"Now",user:"Demo User",role:s.role,action:`Workflow moved to ${status}`,entity:s.jobs.find(j=>j.id===id)?.no??id},...s.activities]}}),
 setRole:role=>setState(s=>({...s,role})), markRead:id=>setState(s=>({...s,notifications:s.notifications.map(n=>n.id===id?{...n,read:true}:n)})),markAllRead:()=>setState(s=>({...s,notifications:s.notifications.map(n=>({...n,read:true}))})),reset:()=>setState(initial)}),[state]);
 return <DemoContext.Provider value={store}>{children}</DemoContext.Provider> }
export const useDemo=()=>{const v=useContext(DemoContext);if(!v)throw new Error("DemoProvider missing");return v};
