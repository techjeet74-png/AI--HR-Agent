import {db} from "@/lib/db";
import {can,highImpactPermission} from "@/lib/auth/rbac";
import type {Role} from "@prisma/client";

export async function listEmployees(role:Role,department?:string){
 if(!can(role,"employees:read")) throw new Error("Not authorized");
 return db.employee.findMany({where:department?{department}:undefined,orderBy:{employeeCode:"asc"}});
}

export async function probationEnding(role:Role,from:Date,to:Date){
 if(!can(role,"employees:read")) throw new Error("Not authorized");
 return db.employee.findMany({where:{probationEnd:{gte:from,lte:to},status:{in:["PROBATION","ACTIVE"]}},orderBy:{probationEnd:"asc"}});
}

export async function createApproval(role:Role,userId:string,action:string,entityType:string,entityId:string,reason?:string){
 if(!can(role,"approvals:*") && !can(role,action)) throw new Error("Not authorized");
 return db.approvalRequest.create({data:{action,entityType,entityId,requestedBy:userId,reason}});
}

export function requiresApproval(permission:string){return highImpactPermission(permission);}
