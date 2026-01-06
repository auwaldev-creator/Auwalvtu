import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { generateAccountNumber, hashSecret } from "@/lib/security";

const payloadSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(7),
  ninOrBvn: z.string().min(8),
  bankChoice: z.string(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  pin: z.string().min(4).max(6),
  confirmPin: z.string().min(4).max(6),
  accepted: z.boolean(),
  faceSample: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = payloadSchema.parse(json);

    if (payload.password !== payload.confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }
    if (payload.pin !== payload.confirmPin) {
      return NextResponse.json({ error: "PINs do not match" }, { status: 400 });
    }
    if (!payload.accepted) {
      return NextResponse.json({ error: "Consent is required" }, { status: 400 });
    }

    const supabase = getAdminClient();

    const { data: existing, error: existingError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", payload.email);

    if (existingError) {
      console.error(existingError);
      return NextResponse.json({ error: "Database read error" }, { status: 500 });
    }

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const { data: admins, error: adminError } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin");

    if (adminError) {
      console.error(adminError);
      return NextResponse.json({ error: "Database read error" }, { status: 500 });
    }

    const role = admins?.length ? "customer" : "admin";
    const id = randomUUID();
    const accountNumber = generateAccountNumber(payload.phone + Date.now());
    const passwordHash = await hashSecret(payload.password);
    const pinHash = await hashSecret(payload.pin);

    let facePath: string | null = null;
    if (payload.faceSample) {
      const base64 = payload.faceSample.split(",")[1];
      const buffer = Buffer.from(base64, "base64");
      facePath = `faces/${id}.png`;
      const { error: uploadError } = await supabase.storage
        .from("biometrics")
        .upload(facePath, buffer, {
          contentType: "image/png",
          upsert: true,
        });
      if (uploadError) {
        console.error(uploadError);
        return NextResponse.json({ error: "Failed to store face template" }, { status: 500 });
      }
    }

    const { error: insertError } = await supabase.from("profiles").insert({
      id,
      full_name: payload.fullName,
      email: payload.email.toLowerCase(),
      phone: payload.phone,
      nin_or_bvn: payload.ninOrBvn,
      bank_choice: payload.bankChoice,
      role,
      face_template_url: facePath,
      account_number: accountNumber,
      password_hash: passwordHash,
      pin_hash: pinHash,
    });

    if (insertError) {
      console.error(insertError);
      return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
    }

    await supabase.from("wallets").insert({ user_id: id });
    await supabase.from("admin_alerts").insert({
      user_id: id,
      category: "new_registration",
      message: `${payload.fullName} joined Auwntech as ${role}`,
    });

    return NextResponse.json({ success: true, accountNumber, role });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
