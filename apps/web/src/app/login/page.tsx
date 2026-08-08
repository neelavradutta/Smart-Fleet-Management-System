"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { api, getUser, setSession, type SessionUser } from "@/lib/api";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { staggerContainer, staggerItem } from "@/lib/motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("owner@demo.fleet");
  const [password, setPassword] = useState("demo12345");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getUser()) router.replace("/dashboard");
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await api<{ token: string; user: SessionUser }>(
        "/api/v1/auth/login",
        { method: "POST", body: JSON.stringify({ email, password }) },
      );
      setSession(result.token, result.user);
      toast.success("Welcome back");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen grid place-items-center p-6 overflow-hidden">
      <Toaster />
      <span className="sf-orb left-[8%] top-[12%] h-48 w-48 bg-sky-300" />
      <span
        className="sf-orb right-[10%] top-[18%] h-56 w-56 bg-fuchsia-300"
        style={{ animationDelay: "1.2s" }}
      />
      <span
        className="sf-orb bottom-[10%] left-[28%] h-40 w-40 bg-amber-300"
        style={{ animationDelay: "0.6s" }}
      />
      <span
        className="sf-orb right-[22%] bottom-[14%] h-36 w-36 bg-lime-300"
        style={{ animationDelay: "1.8s" }}
      />
      <span
        className="sf-orb left-[45%] top-[8%] h-32 w-32 bg-rose-300"
        style={{ animationDelay: "0.9s" }}
      />
      <span
        className="sf-orb left-[15%] bottom-[22%] h-28 w-28 bg-cyan-300"
        style={{ animationDelay: "1.5s" }}
      />

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="relative z-10 w-full max-w-md"
      >
        <motion.div variants={staggerItem} className="mb-8 text-center">
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="mx-auto mb-4 w-16 h-16 rounded-3xl bg-sky-500 text-white font-display font-bold text-2xl grid place-items-center shadow-soft"
          >
            SF
          </motion.div>
          <h1 className="font-display text-5xl font-semibold tracking-tight text-sky-700">
            SFMS
          </h1>
          <p className="mt-2 text-slate-500 text-balance">
            Bright fleet control — sign in and watch ops move live.
          </p>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card glow accent="sky" className="p-8">
            <form onSubmit={onSubmit} className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  className="mt-1.5 w-full rounded-xl border-slate-200 bg-sky-50/40 focus:border-sky-400 focus:ring-sky-400 transition-shadow"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Password
                </span>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  className="mt-1.5 w-full rounded-xl border-slate-200 bg-emerald-50/40 focus:border-emerald-400 focus:ring-emerald-400 transition-shadow"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              <Button className="w-full" size="lg" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
            <p className="mt-4 text-xs text-center text-slate-400">
              Demo: owner@demo.fleet / demo12345
            </p>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
