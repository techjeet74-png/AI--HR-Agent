# Agrolt HR AI Agent

AI-powered HR Command Center for Agrolt Solutions Pvt Ltd.

## Modules
- AI HR Copilot
- Recruitment and ATS
- Employee lifecycle
- Attendance and leave
- Payroll controls
- PF/ESIC/statutory compliance
- HR document generation
- HR policy/SOP knowledge base
- HR MIS and analytics
- Role-based access and approval workflow
- Audit trail for sensitive HR actions

## Agrolt workflow controls
- Payroll approvals: by 3rd of every month
- Salary processing cut-off: 5th
- Salary credit: 7th
- Sensitive HR/payroll changes require authorized approval

## Architecture
Next.js + TypeScript → HR Agent Orchestrator → AI model → governed HR tools → PostgreSQL/Odoo/HR data → dashboards and audit log.

## Security
The AI agent must never invent HR records and must not directly perform high-impact employee or payroll actions without authorization.

## Development
```bash
npm install
npm run dev
```
