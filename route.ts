import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { parseSession, sessionCookieName } from "@/lib/session";
import { randomUUID } from "crypto";

const adjustSchema = z.object({
  targetUserId: z.string().uuid(),
  amount: z.number().positive(),
  direction: z.enum(["credit", "debit"]),
  note: z.string().optional(),
});

function requireAdmin() {
  const token = cookies().get(sessionCookieName)?.value;
  const session = parseSession(token);
  if (!session || session.role !== "admin") {
    throw new Error("Forbidden");
  }
  return session;
}

export async function POST(request: Request) {
  try {
    const admin = requireAdmin();
    const payload = adjustSchema.parse(await request.json());
    const supabase = getAdminClient();

    const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", payload.targetUserId).maybeSingle();
    if (!wallet) {
      return NextResponse.json({ error: "Wallet missing" }, { status: 404 });
    }

    const balanceBefore = Number(wallet.wallet_balance ?? 0);
    const balanceAfter = payload.direction === "debit" ? balanceBefore - payload.amount : balanceBefore + payload.amount;

    if (balanceAfter < 0) {
      return NextResponse.json({ error: "Insufficient funds for debit" }, { status: 400 });
    }

    await supabase
      .from("wallets")
      .update({ wallet_balance: balanceAfter, updated_at: new Date().toISOString() })
      .eq("user_id", payload.targetUserId);

    const reference = `ADM|${randomUUID()}`;
    await supabase.from("transactions").insert({
      user_id: payload.targetUserId,
      amount: payload.amount,
      kind: "admin_adjustment",
      direction: payload.direction,
      status: "successful",
      metadata: { note: payload.note ?? null, admin_id: admin.id },
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      reference,
    });

    await supabase.from("admin_alerts").insert({
      user_id: payload.targetUserId,
      category: "admin_adjustment",
      message: `Admin ${admin.id} ${payload.direction === "credit" ? "added" : "deducted"} ₦${payload.amount.toFixed(2)}`,
    });

    return NextResponse.json({ success: true, reference, balance_after: balanceAfter });
  } catch (error: any) {
    const status = error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
