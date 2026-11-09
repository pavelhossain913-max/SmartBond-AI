import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authed } from "@/lib/auth";

const Create = z.object({ title: z.string().min(1).max(200), due: z.string().datetime().optional(),
  remindAt: z.string().datetime().optional(), repeat: z.enum(["daily","weekly","monthly"]).optional() });
const Patch = z.object({ id: z.string().uuid(), done: z.boolean().optional(), confirmReminder: z.string().uuid().optional() });

export async function GET(req: NextRequest) {
  const a = await authed(req); if (!a) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: tasks } = await a.sb.from("tasks").select("*").order("created_at", { ascending: false });
  const { data: reminders } = await a.sb.from("reminders").select("*");
  return NextResponse.json({ tasks, reminders });
}
export async function POST(req: NextRequest) {
  const a = await authed(req); if (!a) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const p = Create.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { data: t, error } = await a.sb.from("tasks").insert({ user_id: a.user.id, title: p.data.title, due: p.data.due }).select().single();
  if (error) return NextResponse.json({ error: "Server error" }, { status: 500 });
  // Reminders are created UNCONFIRMED; nothing fires until the user confirms.
  if (p.data.remindAt) await a.sb.from("reminders").insert({ user_id: a.user.id, task_id: t.id, remind_at: p.data.remindAt, repeat: p.data.repeat, confirmed: false });
  return NextResponse.json({ task: t });
}
export async function PATCH(req: NextRequest) {
  const a = await authed(req); if (!a) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const p = Patch.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  if (p.data.done !== undefined) await a.sb.from("tasks").update({ done: p.data.done }).eq("id", p.data.id);
  if (p.data.confirmReminder) await a.sb.from("reminders").update({ confirmed: true }).eq("id", p.data.confirmReminder);
  return NextResponse.json({ ok: true });
}
export async function DELETE(req: NextRequest) {
  const a = await authed(req); if (!a) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id || !/^[0-9a-f-]{36}$/.test(id)) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  await a.sb.from("tasks").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
