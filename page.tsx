import Link from "next/link";
import { NotificationStack } from "@/components/NotificationStack";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <NotificationStack
        feed={[
          {
            id: "1",
            title: "₦5,000 received from Musa Adamu",
            body: "Wallet topped up instantly. Balance ₦42,760.11",
            tone: "success",
          },
          {
            id: "2",
            title: "Face ID verified",
            body: "Push alerts stay on for every activity.",
          },
        ]}
      />
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white/70">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Auwntech • Virtual Top-up Suite
        </div>
        <h1 className="mt-5 text-4xl font-semibold leading-tight text-white md:text-6xl">
          Dark, calm, and trusted VTU services for every internal transfer.
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg text-white/70">
          Send airtime, bundle data, move funds internally, or add money via your personal Auwntech account number. Multi-factor security and instant push notifications keep every action transparent.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-full bg-gradient-to-r from-teal-500 to-emerald-300 px-8 py-3 text-base font-semibold text-black"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white/20 px-8 py-3 text-base font-semibold text-white"
          >
            Sign In
          </Link>
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-left text-white/70">
          <div>
            <span className="text-3xl font-semibold text-white">₦112M+</span>
            <p>Processed safely since launch</p>
          </div>
          <div>
            <span className="text-3xl font-semibold text-white">99.995%</span>
            <p>Platform uptime</p>
          </div>
          <div>
            <span className="text-3xl font-semibold text-white">45K</span>
            <p>Verified Auwntech members</p>
          </div>
        </div>
      </section>
    </div>
  );
}
