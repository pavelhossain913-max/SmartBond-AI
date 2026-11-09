import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
// Returns a user-scoped client (RLS applies) or null.
export async function authed(req: NextRequest) {
  const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
  if (!token) return null;
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: { user } } = await sb.auth.getUser(token);
  return user ? { sb, user } : null;
}
