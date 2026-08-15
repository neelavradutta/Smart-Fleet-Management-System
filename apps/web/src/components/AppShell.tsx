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
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    tint: "sky",
    anim: "dash",
  },
  {
    href: "/dashboard/map",
    label: "Live map",
    icon: MapIcon,
    tint: "mint",
    anim: "map",
  },
  {
    href: "/dashboard/vehicles",
    label: "Vehicles",
    icon: Truck,
    tint: "sun",
    anim: "truck",
  },
  {
    href: "/dashboard/drivers",
    label: "Drivers",
    icon: Users,
    tint: "lilac",
    anim: "users",
  },
  {
    href: "/dashboard/routes",
    label: "Routes",
    icon: Route,
    tint: "tan",
    anim: "route",
  },
  {
    href: "/dashboard/shipments",
    label: "Shipments",
    icon: Package,
    tint: "lime",
    anim: "package",
  },
  {
    href: "/dashboard/alerts",
    label: "Alerts",
    icon: Bell,
    tint: "coral",
    anim: "bell",
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: Activity,
    tint: "orange",
    anim: "pulse",
  },
  {
    href: "/dashboard/documents",
    label: "Documents",
    icon: FileText,
    tint: "fuchsia",
    anim: "file",
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
            <Link key={link.href} href={link.href} className="group relative">
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
              <span
                className={cn(
                  "relative z-10 flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium",
                  active ? tintMap[link.tint] : "text-slate-700 hover:bg-slate-50",
                )}
              >
                <span
                  className={cn(
                    "sf-icon-tile w-8 h-8",
                    iconTile[link.tint],
                    link.anim === "truck" ||
                    link.anim === "users" ||
                    link.anim === "file"
                      ? "overflow-hidden"
                      : null,
                  )}
                >
                  {link.anim === "dash" ? (
                    <span className="sf-nav-dash" aria-hidden>
                      <span className="sf-nav-dash__arm">
                        <span className="sf-nav-dash__tile sf-nav-dash__tile--1" />
                      </span>
                      <span className="sf-nav-dash__arm">
                        <span className="sf-nav-dash__tile sf-nav-dash__tile--2" />
                      </span>
                      <span className="sf-nav-dash__arm">
                        <span className="sf-nav-dash__tile sf-nav-dash__tile--3" />
                      </span>
                      <span className="sf-nav-dash__arm">
                        <span className="sf-nav-dash__tile sf-nav-dash__tile--4" />
                      </span>
                    </span>
                  ) : link.anim === "map" ? (
                    <svg
                      className="sf-nav-live"
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      aria-hidden
                    >
                      <g
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle
                          className="sf-nav-live__ping sf-nav-live__ping--1"
                          cx="12"
                          cy="8"
                          r="3.2"
                        />
                        <circle
                          className="sf-nav-live__ping sf-nav-live__ping--2"
                          cx="12"
                          cy="8"
                          r="3.2"
                        />
                        <path
                          className="sf-nav-live__map"
                          d="M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.612"
                        />
                        <g className="sf-nav-live__pin">
                          <path d="M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0" />
                          <circle cx="12" cy="8" r="2" />
                        </g>
                      </g>
                    </svg>
                  ) : link.anim === "users" ? (
                    <svg
                      className="sf-nav-users"
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      aria-hidden
                    >
                      <g
                        className="sf-nav-users__p sf-nav-users__p--1"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="9" cy="7" r="4" />
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      </g>
                      <g
                        className="sf-nav-users__p sf-nav-users__p--2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 3.128a4 4 0 0 1 0 7.744" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      </g>
                    </svg>
                  ) : link.anim === "route" ? (
                    <svg
                      className="sf-nav-route"
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      aria-hidden
                    >
                      <circle
                        className="sf-nav-route__dot"
                        cx="6"
                        cy="19"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        className="sf-nav-route__rope"
                        pathLength="1"
                        d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        className="sf-nav-route__dot"
                        cx="18"
                        cy="5"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  ) : link.anim === "package" ? (
                    <svg
                      className="sf-nav-pack"
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      aria-hidden
                    >
                      <g
                        className="sf-nav-pack__arrive"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8" />
                        <polyline points="3.29 7 12 12 20.71 7" />
                        <line x1="12" x2="12" y1="22" y2="12" />
                        <path
                          className="sf-nav-pack__flap sf-nav-pack__flap--n"
                          d="M12 2.27 20.71 7 12 7Z"
                        />
                        <path
                          className="sf-nav-pack__flap sf-nav-pack__flap--e"
                          d="M20.71 7 12 12 12 7Z"
                        />
                        <path
                          className="sf-nav-pack__flap sf-nav-pack__flap--s"
                          d="M12 12 3.29 7 12 7Z"
                        />
                        <path
                          className="sf-nav-pack__flap sf-nav-pack__flap--w"
                          d="M3.29 7 12 2.27 12 7Z"
                        />
                        <path d="m7.5 4.27 9 5.15" className="sf-nav-pack__tape" />
                        <g className="sf-nav-pack__party">
                          <circle
                            className="sf-nav-pack__burst"
                            cx="12"
                            cy="8"
                            r="2.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.2"
                          />
                          <rect
                            className="sf-nav-pack__bit sf-nav-pack__bit--1"
                            x="11.2"
                            y="7.2"
                            width="1.6"
                            height="1.6"
                            rx="0.25"
                            fill="currentColor"
                            stroke="none"
                          />
                          <rect
                            className="sf-nav-pack__bit sf-nav-pack__bit--2"
                            x="11.2"
                            y="7.2"
                            width="1.6"
                            height="1.6"
                            rx="0.25"
                            fill="currentColor"
                            stroke="none"
                          />
                          <rect
                            className="sf-nav-pack__bit sf-nav-pack__bit--3"
                            x="11.35"
                            y="7.1"
                            width="1.3"
                            height="1.8"
                            rx="0.2"
                            fill="currentColor"
                            stroke="none"
                          />
                          <rect
                            className="sf-nav-pack__bit sf-nav-pack__bit--4"
                            x="11.1"
                            y="7.35"
                            width="1.8"
                            height="1.3"
                            rx="0.2"
                            fill="currentColor"
                            stroke="none"
                          />
                          <path
                            className="sf-nav-pack__bit sf-nav-pack__bit--5"
                            d="M12 6.8v2.4M10.8 8h2.4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.4"
                          />
                          <path
                            className="sf-nav-pack__bit sf-nav-pack__bit--6"
                            d="M12 6.8v2.4M10.8 8h2.4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.4"
                          />
                        </g>
                      </g>
                    </svg>
                  ) : link.anim === "file" ? (
                    <svg
                      className="sf-nav-file"
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      aria-hidden
                    >
                      <g
                        className="sf-nav-file__page"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                        <path d="M14 2v6h6" />
                        <path
                          className="sf-nav-file__line sf-nav-file__line--1"
                          pathLength="1"
                          d="M8 9h2"
                        />
                        <path
                          className="sf-nav-file__line sf-nav-file__line--2"
                          pathLength="1"
                          d="M8 13h8"
                        />
                        <path
                          className="sf-nav-file__line sf-nav-file__line--3"
                          pathLength="1"
                          d="M8 17h8"
                        />
                      </g>
                    </svg>
                  ) : (
                    <Icon
                      size={16}
                      className={cn("sf-nav-ico", `sf-nav-ico--${link.anim}`)}
                    />
                  )}
                </span>
                {link.label}
              </span>
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
    pathname === "/dashboard/routes" ||
    pathname === "/dashboard/alerts";

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
