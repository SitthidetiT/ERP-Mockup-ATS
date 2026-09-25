import { ErpApp } from "@/components/layout/erp-app";
export default async function CatchAll({params}:{params:Promise<{slug?:string[]}>}) { const {slug=[]}=await params; return <ErpApp path={slug}/>; }
