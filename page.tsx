"use client";

import { useEffect, useState } from "react";

interface Alert {
  id: string;
  category: string;
  message: string;
  created_at: string;
}

export default function AdminPage() {
  const [overview, setOverview] = useState<{ total_wallet_value: number; active_suspensions: number; alerts: Alert[] } | null>(null);
  const [adjustForm, setAdjustForm] = useState({ targetUserId: "", amount: "", direction: "credit", note: "" });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadOverview = async () => {
      const response = await fetch("/api/admin/overview", { cache: "no-store" });
      const data = await response.json();
      if (response.ok) {
        setOverview({
          total_wallet_value: Number(data.total_wallet_value),
          active_suspensions: data.active_suspensions,
          alerts: data.alerts ?? [],
        });
      } else {
        setMessage(data.error ?? "Unable to load admin data");
      }
    };
    loadOverview();
  }, []);

  const handleAdjust = async () => {
    setMessage(null);
    const payload = {
      targetUserId: adjustForm.targetUserId,
      amount: Number(adjustForm.amount),
      direction: adjustForm.direction,
      note: adjustForm.note,
    };
    const response = await fetch("/api/admin/funds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "Unable to adjust funds");
      return;
    }
    setMessage(`Adjustment successful (ref ${data.reference})`);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-12">
      <div>
        <p className="text-sm text-white/60">Admin authority</p>
        <h1 className="text-3xl font-semibold text-white">System-wide controls</h1>
      </div>
      {message && <p className="text-sm text-emerald-300">{message}</p>}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <p className="text-white/60">Total wallet value</p>
          <p className="text-3xl font-semibold text-white">₦{overview?.total_wallet_value?.toLocaleString()}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <p className="text-white/60">Active suspensions</p>
          <p className="text-3xl font-semibold text-white">{overview?.active_suspensions ?? 0}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <p className="text-white/60">Alerts awaiting review</p>
          <p className="text-3xl font-semibold text-white">{overview?.alerts?.length ?? 0}</p>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-2xl font-semibold text-white">Fund adjustments</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-white/70">
            Target user ID
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              value={adjustForm.targetUserId}
              onChange={(e) => setAdjustForm({ ...adjustForm, targetUserId: e.target.value })}
            />
          </label>
          <label className="text-sm text-white/70">
            Amount (₦)
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              value={adjustForm.amount}
              onChange={(e) => setAdjustForm({ ...adjustForm, amount: e.target.value })}
            />
          </label>
          <label className="text-sm text-white/70">
            Direction
            <select
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              value={adjustForm.direction}
              onChange={(e) => setAdjustForm({ ...adjustForm, direction: e.target.value })}
            >
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
          </label>
          <label className="text-sm text-white/70">
            Note (optional)
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              value={adjustForm.note}
              onChange={(e) => setAdjustForm({ ...adjustForm, note: e.target.value })}
            />
          </label>
        </div>
        <button
          onClick={handleAdjust}
          className="mt-6 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 px-4 py-3 text-lg font-semibold text-black"
        >
          Apply adjustment
        </button>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-2xl font-semibold text-white">Alert feed</h2>
        <div className="mt-4 space-y-4">
          {overview?.alerts?.map((alert) => (
            <div key={alert.id} className="border-l-4 border-red-400/70 bg-white/[0.02] px-4 py-3">
              <p className="font-semibold text-white">{alert.category}</p>
              <p className="text-sm text-white/70">{alert.message}</p>
              <p className="text-xs text-white/40">{new Date(alert.created_at).toLocaleString()}</p>
            </div>
          ))}
          {overview?.alerts?.length === 0 && <p className="text-sm text-white/60">No pending alerts.</p>}
        </div>
      </section>
    </div>
  );
}
