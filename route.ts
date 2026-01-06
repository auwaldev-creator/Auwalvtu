import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { compareSecret } from "@/lib/security";
import { parseSession, sessionCookieName } from "@/lib/session";
import { randomUUID } from "crypto";

const transactionSchema = z.object({
  kind: z.string(),
  direction: z.enum(["debit", "credit"]),
  amount: z.number().positive(),
  metadata: z.record(z.string(), z.any()).optional(),
  pin: z.string().min(4).max(6),
});

function requireSession() {
  const cookie = cookies().get(sessionCookieName)?.value;
  const payload = parseSession(cookie);
  if (!payload) {
    throw new Error("Unauthorized");
  }
  return payload;
}

export async function GET() {
  try {
    const session = requireSession();
    const supabase = getAdminClient();

    const [{ data: transactions }, { data: wallet }, { data: profile }] = await Promise.all([
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", session.id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase.from("wallets").select("*").eq("user_id", session.id).maybeSingle(),
      supabase
        .from("profiles")
        .select("full_name, account_number, role, status, bank_choice")
        .eq("id", session.id)
        .maybeSingle(),
    ]);

    return NextResponse.json({ transactions: transactions ?? [], wallet, profile });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = requireSession();
    const body = await request.json();
    const payload = transactionSchema.parse(body);
    const supabase = getAdminClient();

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.id).maybeSingle();
    if (!profile) {
      return NextResponse.json({ error: "Profile missing" }, { status: 404 });
    }

    const pinMatch = await compareSecret(payload.pin, profile.pin_hash);
    if (!pinMatch) {
      const resumeAt = new Date(Date.now() + 60 * 60 * 1000);
      await supabase
        .from("profiles")
        .update({
          wrong_pin_count: (profile.wrong_pin_count ?? 0) + 1,
          last_pin_attempt_at: new Date().toISOString(),
          status: "suspended",
          suspended_until: resumeAt.toISOString(),
        })
        .eq("id", profile.id);

      await supabase.from("admin_alerts").insert({
        user_id: profile.id,
        category: "pin_lock",
        message: `${profile.full_name} suspended after wrong transaction PIN`,
      });

      return NextResponse.json({ error: "Wrong PIN; account suspended for 1 hour" }, { status: 423 });
    }

    const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", session.id).maybeSingle();
    if (!wallet) {
      return NextResponse.json({ error: "Wallet missing" }, { status: 404 });
    }

    const amount = payload.amount;
    const balanceBefore = Number(wallet.wallet_balance ?? 0);
    const balanceAfter = payload.direction === "debit" ? balanceBefore - amount : balanceBefore + amount;

    if (balanceAfter < 0) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    await supabase
      .from("wallets")
      .update({ wallet_balance: balanceAfter, updated_at: new Date().toISOString() })
      .eq("user_id", session.id);

    const reference = `ATP|${randomUUID()}`;
    await supabase.from("transactions").insert({
      user_id: session.id,
      amount,
      kind: payload.kind,
      direction: payload.direction,
      status: "successful",
      metadata: payload.metadata ?? {},
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      reference,
    });

    return NextResponse.json({ success: true, reference, balance_after: balanceAfter });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
