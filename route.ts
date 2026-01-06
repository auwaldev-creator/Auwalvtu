import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { parseSession, sessionCookieName } from "@/lib/session";

export async function GET() {
  try {
    const token = cookies().get(sessionCookieName)?.value;
    const session = parseSession(token);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = getAdminClient();
    const [{ data: walletSum }, { data: suspensions }, { data: alerts }] = await Promise.all([
      supabase.rpc("wallet_total"),
      supabase
        .from("profiles")
        .select("id")
        .gte("suspended_until", new Date().toISOString()),
      supabase
        .from("admin_alerts")
        .select("*")
        .eq("resolved", false)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    return NextResponse.json({
      total_wallet_value: walletSum ?? 0,
      active_suspensions: suspensions?.length ?? 0,
      alerts: alerts ?? [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
