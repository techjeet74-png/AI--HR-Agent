import{db}from"@/lib/db";
type Row={employeeId?:string;employeeCode?:string;employeeName?:string;expected?:Record<string,any>;actual?:Record<string,any>};
export async function reconcile(periodLabel:string,category:string,rows:Row[],createdBy?:string){
 const run=await db.reconciliationRun.create({data:{periodLabel,category,createdBy,inputSummary:{rows:rows.length}}});
 const employees=await db.employee.findMany({select:{id:true,employeeCode:true,firstName:true,lastName:true}});
 const byCode=new Map(employees.map(e=>[e.employeeCode,e]));
 const exceptions:any[]=[];
 for(const r of rows){
  const emp=r.employeeId?employees.find(e=>e.id===r.employeeId):r.employeeCode?byCode.get(r.employeeCode):undefined;
  if(!emp){exceptions.push({runId:run.id,exceptionType:"EMPLOYEE_NOT_FOUND",severity:"HIGH",finding:"Employee could not be matched to the HR master.",actualValue:r.employeeCode||r.employeeId||r.employeeName||"missing"});continue;}
  for(const k of new Set([...Object.keys(r.expected||{}),...Object.keys(r.actual||{})])){
   const ev=r.expected?.[k],av=r.actual?.[k];
   if(ev===undefined||av===undefined){exceptions.push({runId:run.id,employeeId:emp.id,exceptionType:"MISSING_VALUE",severity:"MEDIUM",field:k,expectedValue:ev==null?undefined:String(ev),actualValue:av==null?undefined:String(av),finding:`Missing ${k} value on one side of the reconciliation.`});continue;}
   const en=Number(ev),an=Number(av);
   const comparable=Number.isFinite(en)&&Number.isFinite(an);
   if(comparable&&Math.abs(en-an)>0.01)exceptions.push({runId:run.id,employeeId:emp.id,exceptionType:"VALUE_VARIANCE",severity:Math.abs(en-an)>=1000?"HIGH":"MEDIUM",field:k,expectedValue:String(ev),actualValue:String(av),variance:String(an-en),finding:`${k} differs between payroll-derived and statutory-source values.`});
   else if(!comparable&&String(ev)!==String(av))exceptions.push({runId:run.id,employeeId:emp.id,exceptionType:"VALUE_MISMATCH",severity:"MEDIUM",field:k,expectedValue:String(ev),actualValue:String(av),finding:`${k} differs between the two supplied datasets.`});
  }
 }
 if(rows.length===0)exceptions.push({runId:run.id,exceptionType:"NO_INPUT_ROWS",severity:"HIGH",finding:"No reconciliation input records were supplied."});
 await db.reconciliationException.createMany({data:exceptions});
 const summary={rows:rows.length,exceptions:exceptions.length,high:exceptions.filter(x=>x.severity==="HIGH").length,medium:exceptions.filter(x=>x.severity==="MEDIUM").length};
 await db.reconciliationRun.update({where:{id:run.id},data:{status:"REVIEW_REQUIRED",resultSummary:summary}});
 return{runId:run.id,summary};
}