import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  const jobId = String(b.jobId || "");
  const candidateId = String(b.candidateId || "");
  const [job, c] = await Promise.all([
    prisma.job.findUnique({
      where: { id: jobId },
      include: { skillRequirements: { include: { skill: true } } },
    }),
    prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { candidateSkills: { include: { skill: true } }, applications: true },
    }),
  ]);
  if (!job || !c) return NextResponse.json({ error: "Job or candidate not found" }, { status: 404 });
  const map = new Map(c.candidateSkills.map((x) => [x.skill.name.toLowerCase(), x.level]));
  let total = 0, earned = 0;
  for (const r of job.skillRequirements) {
    total += r.weight;
    earned += Math.min((map.get(r.skill.name.toLowerCase()) || 0) / Math.max(r.requiredLevel, 1), 1) * r.weight;
  }
  const skillScore = total ? Math.round((earned / total) * 100) : 0;
  return NextResponse.json({
    candidate: { id: c.id, name: c.name },
    job: { id: job.id, title: job.title },
    skillScore,
    recommendation: skillScore >= 80 ? "STRONG_MATCH" : skillScore >= 60 ? "REVIEW" : "LOW_MATCH",
    matchedSkills: job.skillRequirements.map((r) => ({
      skill: r.skill.name,
      required: r.requiredLevel,
      candidate: map.get(r.skill.name.toLowerCase()) || 0,
    })),
    humanReviewRequired: true,
  });
}