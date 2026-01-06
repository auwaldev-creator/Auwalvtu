"use client";

import { CameraCapture } from "@/components/CameraCapture";
import { Stepper } from "@/components/Stepper";
import { useState } from "react";

const steps = ["Personal", "Identity", "Security"];

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  ninOrBvn: string;
  bankChoice: string;
  password: string;
  confirmPassword: string;
  pin: string;
  confirmPin: string;
  accepted: boolean;
  faceSample?: string;
};

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    phone: "",
    ninOrBvn: "",
    bankChoice: "Auwntech • Providus Bank",
    password: "",
    confirmPassword: "",
    pin: "",
    confirmPin: "",
    accepted: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canContinue = () => {
    if (currentStep === 1) {
      return form.fullName && form.email && form.phone && form.ninOrBvn;
    }
    if (currentStep === 2) {
      return Boolean(form.faceSample);
    }
    return (
      form.password.length >= 8 &&
      form.password === form.confirmPassword &&
      form.pin.length >= 4 &&
      form.pin === form.confirmPin &&
      form.accepted
    );
  };

  const next = () => {
    if (!canContinue()) return;
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const back = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    if (!canContinue()) return;
    setLoading(true);
    setMessage(null);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error ?? "Unable to create account");
    } else {
      setMessage("Account created! Redirecting to dashboard...");
      window.location.href = "/dashboard";
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="rounded-3xl border border-white/10 bg-black/30 p-8 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/60">Create account</p>
            <h1 className="text-3xl font-semibold text-white">Opay-style onboarding, Auwntech security</h1>
          </div>
          <Stepper step={currentStep} total={steps.length} />
        </div>
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/60">
          {steps.map((title, index) => (
            <div key={title} className={`rounded-full px-4 py-1 ${index + 1 === currentStep ? "bg-white/10" : "bg-white/5"}`}>
              Step {index + 1}: {title}
            </div>
          ))}
        </div>
        <div className="mt-8 space-y-6">
          {currentStep === 1 && (
            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm text-white/70">
                Full name
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </label>
              <label className="text-sm text-white/70">
                Email address
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </label>
              <label className="text-sm text-white/70">
                Phone number
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </label>
              <label className="text-sm text-white/70">
                NIN or BVN
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  value={form.ninOrBvn}
                  onChange={(e) => setForm({ ...form, ninOrBvn: e.target.value })}
                />
              </label>
            </div>
          )}
          {currentStep === 2 && (
            <div className="space-y-6">
              <p className="text-white/70">
                Allow camera access to capture a live portrait. Auwntech encrypts every biometric template before storing in Supabase.
              </p>
              <CameraCapture onCapture={(dataUrl) => setForm({ ...form, faceSample: dataUrl })} />
              {form.faceSample && (
                <img src={form.faceSample} alt="Face sample" className="h-32 w-32 rounded-2xl border border-white/10 object-cover" />
              )}
              <label className="text-sm text-white/70">
                Preferred bank partner
                <select
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  value={form.bankChoice}
                  onChange={(e) => setForm({ ...form, bankChoice: e.target.value })}
                >
                  <option>Auwntech • Providus Bank</option>
                  <option>Auwntech • Moniepoint</option>
                </select>
              </label>
            </div>
          )}
          {currentStep === 3 && (
            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm text-white/70">
                Create password
                <input
                  type="password"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </label>
              <label className="text-sm text-white/70">
                Confirm password
                <input
                  type="password"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                />
              </label>
              <label className="text-sm text-white/70">
                Create 4-6 digit PIN
                <input
                  maxLength={6}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  value={form.pin}
                  onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/[^0-9]/g, "") })}
                />
              </label>
              <label className="text-sm text-white/70">
                Confirm PIN
                <input
                  maxLength={6}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  value={form.confirmPin}
                  onChange={(e) => setForm({ ...form, confirmPin: e.target.value.replace(/[^0-9]/g, "") })}
                />
              </label>
              <label className="col-span-full flex items-center gap-3 text-white/70">
                <input type="checkbox" checked={form.accepted} onChange={(e) => setForm({ ...form, accepted: e.target.checked })} />
                I consent to biometric storage and agree to Auwntech terms.
              </label>
              <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                Summary: password and PIN secure every transaction. Admin is notified if someone enters wrong credentials more than allowed attempts.
              </div>
            </div>
          )}
        </div>
        {message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}
        <div className="mt-8 flex flex-wrap gap-4">
          {currentStep > 1 && (
            <button onClick={back} className="rounded-full border border-white/20 px-6 py-3 text-white">
              Back
            </button>
          )}
          {currentStep < steps.length && (
            <button
              onClick={next}
              disabled={!canContinue()}
              className="rounded-full bg-gradient-to-r from-teal-500 to-emerald-300 px-6 py-3 font-semibold text-black disabled:opacity-30"
            >
              Continue
            </button>
          )}
          {currentStep === steps.length && (
            <button
              onClick={handleSubmit}
              disabled={!canContinue() || loading}
              className="rounded-full bg-gradient-to-r from-teal-500 to-emerald-300 px-6 py-3 font-semibold text-black disabled:opacity-30"
            >
              {loading ? "Creating..." : "Create account"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
