import {NextResponse} from "next/server";
import {classifyHRIntent,getHRSystemPrompt} from "@/lib/agents/hr-agent";

export async function POST(request:Request){
 const body=await request.json().catch(()=>({}));
 const message=typeof body.message==="string"?body.message.trim():"";
 if(!message) return NextResponse.json({error:"message is required"},{status:400});
 const intent=classifyHRIntent(message);
 return NextResponse.json({
   ok:true,
   intent,
   systemPrompt:getHRSystemPrompt(),
   response:"HR Agent foundation is ready. Connect your approved LLM provider and HR database to execute this request.",
   requiresApproval:["payroll","compliance","employee_lifecycle"].includes(intent)
 });
}