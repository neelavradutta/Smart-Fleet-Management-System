"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Bell,
  FileText,
  LayoutDashboard,
  Map as MapIcon,
  Menu,
  Package,
  Route,
  Shield,
  Truck,
  Users,
  X,
} from "lucide-react";
import { Toaster } from "react-hot-toast";
import { clearSession, getUser } from "@/lib/api";
import { Button } from "@/components/common/Button";
import { PageTransition } from "@/components/common/PageTransition";
import { cn } from "@/utils/cn";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, tint: "sky" },
  { href: "/dashboard/map", label: "Live map", icon: MapIcon, tint: "mint" },
  { href: "/dashboard/vehicles", label: "Vehicles", icon: Truck, tint: "sun" },
  { href: "/dashboard/drivers", label: "Drivers", icon: Users, tint: "lilac" },
  { href: "/dashboard/routes", label: "Routes", icon: Route, tint: "tan" },
  {
    href: "/dashboard/shipments",
    label: "Shipments",
    icon: Package,
    tint: "coral",
  },
  { href: "/dashboard/alerts", label: "Alerts", icon: Bell, tint: "pink" },
  {
    href: "/dashboard/geofences",
    label: "Geofences",
    icon: Shield,
    tint: "lime",
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: Activity,
    tint: "orange",
  },
  {
    href: "/dashboard/documents",
    label: "Documents",
    icon: FileText,
    tint: "fuchsia",
  },
];

const tintMap: Record<string, string> = {
  sky: "bg-sky-100 text-sky-800",
  mint: "bg-emerald-100 text-emerald-800",
  sun: "bg-amber-100 text-amber-900",
  coral: "bg-rose-100 text-rose-800",
  lilac: "bg-violet-100 text-violet-800",
  cyan: "bg-cyan-100 text-cyan-800",
  tan: "bg-tan-100 text-tan-700",
  pink: "bg-pink-100 text-pink-800",
  lime: "bg-lime-100 text-lime-800",
  orange: "bg-orange-100 text-orange-800",
  fuchsia: "bg-fuchsia-100 text-fuchsia-800",
};

const iconTile: Record<string, string> = {
  sky: "bg-sky-500 text-white",
  mint: "bg-emerald-500 text-white",
  sun: "bg-amber-500 text-white",
  coral: "bg-rose-500 text-white",
  lilac: "bg-violet-500 text-white",
  cyan: "bg-cyan-500 text-white",
  tan: "bg-tan-700 text-tan-50",
  pink: "bg-pink-500 text-white",
  lime: "bg-lime-500 text-white",
  orange: "bg-orange-500 text-white",
  fuchsia: "bg-fuchsia-500 text-white",
};

const barColor: Record<string, string> = {
  sky: "bg-sky-500",
  mint: "bg-emerald-500",
  sun: "bg-amber-500",
  coral: "bg-rose-500",
  lilac: "bg-violet-500",
  cyan: "bg-cyan-500",
  tan: "bg-tan-700",
  pink: "bg-pink-500",
  lime: "bg-lime-500",
  orange: "bg-orange-500",
  fuchsia: "bg-fuchsia-500",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [fleetName, setFleetName] = useState("Fleet");
  const [tier, setTier] = useState("PRO");
  const [open, setOpen] = useState(false);

  const activeTint =
    links.find((l) => l.href === pathname)?.tint ?? "sky";

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    setFleetName(user.fleetName);
    setTier(user.tier);
    setReady(true);
  }, [router]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
          className="w-11 h-11 rounded-2xl bg-sky-500"
        />
      </div>
    );
  }

  const Nav = (
    <>
      <div>
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
            className="w-11 h-11 rounded-2xl bg-sky-500 text-white font-display font-bold grid place-items-center shadow-soft"
          >
            SF
          </motion.div>
          <div>
            <p className="font-display font-semibold text-slate-900 leading-tight text-lg">
              SFMS
            </p>
            <span className="sf-chip">{tier}</span>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-500 truncate">{fleetName}</p>
        <div className={cn("mt-3 h-1 rounded-full", barColor[activeTint])} />
      </div>

      <nav className="flex flex-col gap-1.5 overflow-y-auto flex-1 pr-1 sf-hide-scrollbar">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className="relative">
              {active ? (
                <motion.span
                  layoutId="nav-pill"
                  className={cn(
                    "absolute inset-0 rounded-xl",
                    tintMap[link.tint],
                  )}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              ) : null}
              <motion.span
                whileHover={{ x: 4, scale: 1.01 }}
                className={cn(
                  "relative z-10 flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium",
                  active ? tintMap[link.tint] : "text-slate-700 hover:bg-slate-50",
                )}
              >
                <span className={cn("sf-icon-tile w-8 h-8", iconTile[link.tint])}>
                  <Icon size={16} />
                </span>
                {link.label}
              </motion.span>
            </Link>
          );
        })}
      </nav>

      <Button
        variant="secondary"
        className="w-full"
        onClick={() => {
          clearSession();
          router.push("/login");
        }}
      >
        Sign out
      </Button>
    </>
  );

  const isMapPage = pathname === "/dashboard/map";
  const fillViewport =
    isMapPage ||
    pathname === "/dashboard/drivers" ||
    pathname === "/dashboard/routes";

  return (
    <div
      className={cn(
        "sf-shell lg:grid lg:grid-cols-[280px_1fr]",
        fillViewport && "h-dvh max-h-dvh overflow-hidden",
      )}
    >
      <Toaster position="top-right" />
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-50 h-1",
          barColor[activeTint],
        )}
      />

      <aside className="hidden lg:flex border-r border-slate-200 bg-white px-4 py-6 flex-col gap-6 sticky top-0 h-screen overflow-hidden pt-5">
        {Nav}
      </aside>

      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between pt-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-500 text-white text-sm font-bold grid place-items-center">
            SF
          </div>
          <span className="font-display font-semibold text-slate-900">SFMS</span>
        </div>
        <motion.button
          type="button"
          aria-label="Menu"
          whileTap={{ scale: 0.92 }}
          className="p-2 rounded-xl hover:bg-sky-50"
          onClick={() => setOpen(true)}
        >
          <Menu size={20} className="text-sky-600" />
        </motion.button>
      </div>

      <AnimatePresence>
        {open ? (
          <div className="lg:hidden fixed inset-0 z-40">
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/15"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="absolute left-0 top-0 bottom-0 w-[290px] bg-white p-4 flex flex-col gap-6 shadow-pop"
            >
              <button
                type="button"
                className="self-end p-2 rounded-xl hover:bg-slate-100"
                onClick={() => setOpen(false)}
              >
                <X size={18} />
              </button>
              {Nav}
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>

      <main
        className={cn(
          "min-w-0 p-4 sm:p-6 lg:p-8 pt-5",
          fillViewport &&
            "flex min-h-0 flex-col overflow-hidden h-[calc(100dvh-3.5rem)] lg:h-full lg:max-h-full",
        )}
      >
        <PageTransition
          className={fillViewport ? "flex min-h-0 flex-1 flex-col" : undefined}
        >
          {children}
        </PageTransition>
      </main>
    </div>
  );
}
