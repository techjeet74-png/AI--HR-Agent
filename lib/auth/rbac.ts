import type { Role } from "@prisma/client";
const permissions: Record<Role,string[]> = {
 SUPER_ADMIN:["*"], HR_MANAGER:["employees:read","employees:write","recruitment:*","payroll:read","compliance:*","documents:*","reports:*","approvals:*","audit:read"],
 HR_EXECUTIVE:["employees:read","employees:write","recruitment:*","documents:read","reports:read"], RECRUITER:["employees:read","recruitment:*","documents:read"],
 PAYROLL:["employees:read","payroll:*","reports:read"], AUDITOR:["employees:read","payroll:read","compliance:read","reports:read","audit:read"],
 MANAGER:["employees:read","recruitment:read","reports:read"], EMPLOYEE:["employees:self","documents:self"]
};
export function can(role:Role,permission:string){const p=permissions[role]||[];return p.includes("*")||p.includes(permission)||p.some(x=>x.endsWith(":*")&&permission.startsWith(x.slice(0,-1)));}
export function highImpactPermission(permission:string){return ["payroll:write","employees:terminate","compliance:submit","documents:issue"].includes(permission);}
