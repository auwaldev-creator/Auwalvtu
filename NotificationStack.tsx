"use client";

import { useEffect, useState } from "react";

export type ToastMessage = {
  id: string;
  title: string;
  body: string;
  tone?: "success" | "alert" | "info";
};

export function NotificationStack({
  feed = [],
}: {
  feed?: ToastMessage[];
}) {
  const [messages, setMessages] = useState(feed);

  useEffect(() => {
    setMessages(feed);
  }, [feed]);

  return (
    <div className="fixed top-6 right-6 z-50 flex w-full max-w-sm flex-col gap-4">
      {messages.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-2xl border px-4 py-3 text-sm shadow-glow backdrop-blur-md ${toneStyles(toast.tone)}`}
        >
          <strong className="block text-base">{toast.title}</strong>
          <span className="text-auwn-muted">{toast.body}</span>
        </div>
      ))}
    </div>
  );
}

function toneStyles(tone?: ToastMessage["tone"]) {
  switch (tone) {
    case "alert":
      return "border-red-400/40 bg-red-400/10";
    case "success":
      return "border-emerald-400/40 bg-emerald-400/10";
    default:
      return "border-white/20 bg-black/40";
  }
}
