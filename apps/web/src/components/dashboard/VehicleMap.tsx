"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import type { Marker as LeafletMarker } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { VehicleMapPopup } from "./VehicleMapPopup";

export type MapVehicle = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  speed?: number;
  status?: "active" | "idle" | "offline";
  heading?: number;
  vehicleType?: string;
  plate?: string;
  makeModel?: string;
  updatedAt?: string;
  /** Remaining distance to delivery (km) */
  distanceKm?: number;
  /** Estimated minutes to delivery */
  etaMinutes?: number | null;
};

const STATUS = {
  active: { fill: "#16a34a", label: "Active" },
  idle: { fill: "#dc2626", label: "Idle" },
  offline: { fill: "#64748b", label: "Offline" },
} as const;

const iconCache = new Map<string, L.DivIcon>();

function getVehicleIcon(
  label: string,
  status: keyof typeof STATUS,
  heading: number,
) {
  const bucket = Math.round(heading / 15) * 15;
  const key = `v2|${status}|${bucket}|${label}`;
  const hit = iconCache.get(key);
  if (hit) return hit;

  const s = STATUS[status] ?? STATUS.active;
  const short = label.length > 9 ? `${label.slice(0, 8)}…` : label;
  const icon = L.divIcon({
    html: `
      <div class="sf-map-marker">
        <div class="sf-map-arrow" style="transform:rotate(${bucket}deg)">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="10" fill="${s.fill}" stroke="#fff" stroke-width="2"/>
            <path d="M11 5.2L15.2 15.2L11 12.6L6.8 15.2Z" fill="#fff"/>
          </svg>
        </div>
        <div class="sf-map-label">${short}</div>
      </div>
    `,
    className: "sf-map-icon",
    iconSize: [54, 36],
    iconAnchor: [27, 11],
    popupAnchor: [0, -14],
  });
  iconCache.set(key, icon);
  if (iconCache.size > 200) {
    const first = iconCache.keys().next().value;
    if (first) iconCache.delete(first);
  }
  return icon;
}

/** Leaflet must remeasure after layout/transition — fixes grey half-map. */
function MapLifecycle({
  vehicles,
  focusId,
  focusToken,
}: {
  vehicles: MapVehicle[];
  focusId?: string | null;
  focusToken?: string | null;
}) {
  const map = useMap();
  const fittedKey = useRef<string>("");
  const vehiclesRef = useRef(vehicles);
  const lastFocusRef = useRef<string | null>(null);
  vehiclesRef.current = vehicles;

  useEffect(() => {
    // New deep-link token → allow fly again for same vehicle id
    lastFocusRef.current = null;
  }, [focusToken]);

  useEffect(() => {
    const el = map.getContainer();
    let resizeTimer: number | undefined;
    const invalidate = () => {
      map.invalidateSize({ animate: false });
    };
    const invalidateDebounced = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(invalidate, 80);
    };

    invalidate();
    const t1 = window.setTimeout(invalidate, 80);
    const t2 = window.setTimeout(invalidate, 300);

    const ro = new ResizeObserver(invalidateDebounced);
    ro.observe(el);
    if (el.parentElement) ro.observe(el.parentElement);

    const onVis = () => {
      if (document.visibilityState === "visible") invalidate();
    };
    window.addEventListener("resize", invalidateDebounced);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(resizeTimer);
      ro.disconnect();
      window.removeEventListener("resize", invalidateDebounced);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [map]);

  // Fit fleet once — skip when deep-link / panel focus targets one unit
  useEffect(() => {
    const idsKey = vehicles
      .map((v) => v.id)
      .sort()
      .join("|");
    if (!vehicles.length || fittedKey.current === idsKey) return;
    if (focusId) {
      // Still mark fitted so clearing focus later does not sudden-fit mid-session
      fittedKey.current = idsKey;
      return;
    }
    const bounds = L.latLngBounds(
      vehicles.map((v) => [v.latitude, v.longitude] as [number, number]),
    );
    map.invalidateSize({ animate: false });
    map.fitBounds(bounds.pad(0.28), { animate: false, maxZoom: 15 });
    fittedKey.current = idsKey;
  }, [vehicles, map, focusId]);

  // Same behaviour as fleet list click: pan + zoom onto that vehicle
  useEffect(() => {
    if (!focusId) {
      lastFocusRef.current = null;
      return;
    }
    const v = vehiclesRef.current.find((x) => x.id === focusId);
    if (!v) return;
    if (lastFocusRef.current === focusId) return;
    lastFocusRef.current = focusId;
    map.invalidateSize({ animate: false });
    map.flyTo([v.latitude, v.longitude], 16, {
      duration: 0.55,
      easeLinearity: 0.25,
    });
  }, [focusId, map, vehicles]);

  useEffect(() => {
    const ctrl = new L.Control({ position: "topright" });
    ctrl.onAdd = () => {
      const wrap = L.DomUtil.create("div", "sf-map-tools");
      const recenter = L.DomUtil.create("button", "sf-map-recenter", wrap);
      recenter.type = "button";
      recenter.title = "Fit all vehicles";
      recenter.textContent = "Fit fleet";
      L.DomEvent.disableClickPropagation(wrap);
      L.DomEvent.on(recenter, "click", () => {
        const list = vehiclesRef.current;
        if (!list.length) return;
        const bounds = L.latLngBounds(
          list.map((v) => [v.latitude, v.longitude] as [number, number]),
        );
        map.invalidateSize({ animate: false });
        map.fitBounds(bounds.pad(0.28), { animate: true, maxZoom: 15 });
      });
      return wrap;
    };
    ctrl.addTo(map);
    return () => {
      ctrl.remove();
    };
  }, [map]);

  return null;
}

function MapZoomButtons({ map }: { map: L.Map }) {
  return (
    <div className="sf-map-zoom-stack">
      <motion.button
        type="button"
        className="sf-map-zoom-btn sf-map-zoom-btn--in"
        aria-label="Zoom in"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => map.zoomIn()}
      >
        <Plus size={15} strokeWidth={2.75} />
      </motion.button>

      <motion.button
        type="button"
        className="sf-map-zoom-btn sf-map-zoom-btn--out"
        aria-label="Zoom out"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => map.zoomOut()}
      >
        <Minus size={15} strokeWidth={2.75} />
      </motion.button>
    </div>
  );
}

function MapZoomControl() {
  const map = useMap();
  const [host, setHost] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctrl = new L.Control({ position: "bottomright" });
    ctrl.onAdd = () => {
      const wrap = L.DomUtil.create("div", "sf-map-zoom");
      L.DomEvent.disableClickPropagation(wrap);
      L.DomEvent.disableScrollPropagation(wrap);
      setHost(wrap);
      return wrap;
    };
    ctrl.addTo(map);
    return () => {
      ctrl.remove();
      setHost(null);
    };
  }, [map]);

  if (!host) return null;
  return createPortal(<MapZoomButtons map={map} />, host);
}

/** Shift popup inside map box — map camera stays put. */
function FitPopupInBounds() {
  const map = useMap();

  useEffect(() => {
    const timers: number[] = [];
    const basePos = new WeakMap<L.Popup, L.Point>();

    type PatchPopup = L.Popup & {
      _updatePosition: () => void;
      __sfUpdate?: () => void;
    };

    const nudge = (popup: L.Popup) => {
      const el = popup.getElement();
      if (!el) return;

      let base = basePos.get(popup);
      if (!base) {
        const pos = L.DomUtil.getPosition(el);
        if (!pos) return;
        base = pos.clone();
        basePos.set(popup, base);
      } else {
        L.DomUtil.setPosition(el, base);
      }

      const mapRect = map.getContainer().getBoundingClientRect();
      const popRect = el.getBoundingClientRect();
      const pad = 14;
      let dx = 0;
      let dy = 0;

      if (popRect.left < mapRect.left + pad) {
        dx = mapRect.left + pad - popRect.left;
      }
      if (popRect.right > mapRect.right - pad) {
        dx = mapRect.right - pad - popRect.right;
      }
      if (popRect.top < mapRect.top + pad) {
        dy = mapRect.top + pad - popRect.top;
      }
      if (popRect.bottom > mapRect.bottom - pad) {
        dy = mapRect.bottom - pad - popRect.bottom;
      }

      if (dx || dy) {
        L.DomUtil.setPosition(
          el,
          base.add(L.point(Math.round(dx), Math.round(dy))),
        );
      }
    };

    const schedule = (popup: L.Popup) => {
      basePos.delete(popup);
      const run = () => nudge(popup);
      requestAnimationFrame(() => {
        run();
        timers.push(window.setTimeout(run, 60));
        timers.push(window.setTimeout(run, 180));
        timers.push(window.setTimeout(run, 350));
      });
    };

    const onOpen = (e: L.PopupEvent) => {
      const popup = e.popup as PatchPopup;
      if (!popup.__sfUpdate) {
        popup.__sfUpdate = popup._updatePosition.bind(popup);
        popup._updatePosition = function patchedUpdatePosition() {
          popup.__sfUpdate?.();
          basePos.delete(popup);
          requestAnimationFrame(() => nudge(popup));
        };
      }
      schedule(popup);
    };

    const onClose = (e: L.PopupEvent) => {
      const popup = e.popup as PatchPopup;
      if (popup.__sfUpdate) {
        popup._updatePosition = popup.__sfUpdate;
        delete popup.__sfUpdate;
      }
      basePos.delete(popup);
    };

    map.on("popupopen", onOpen);
    map.on("popupclose", onClose);
    return () => {
      map.off("popupopen", onOpen);
      map.off("popupclose", onClose);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [map]);

  return null;
}

function VehicleMarker({
  vehicle,
  status,
  focused,
}: {
  vehicle: MapVehicle;
  status: "active" | "idle" | "offline";
  focused: boolean;
}) {
  const markerRef = useRef<LeafletMarker | null>(null);

  useEffect(() => {
    if (!focused) return;
    const marker = markerRef.current;
    if (!marker) return;
    const t = window.setTimeout(() => {
      marker.openPopup();
    }, 400);
    return () => window.clearTimeout(t);
  }, [focused]);

  return (
    <Marker
      ref={markerRef}
      position={[vehicle.latitude, vehicle.longitude]}
      icon={getVehicleIcon(vehicle.label, status, vehicle.heading ?? 0)}
      zIndexOffset={focused ? 1000 : status === "active" ? 400 : 200}
    >
      <Popup
        className="sf-map-popup"
        autoPan={false}
        maxWidth={280}
        closeButton={false}
      >
        <VehicleMapPopup vehicle={vehicle} />
      </Popup>
      <Tooltip direction="top" offset={[0, -12]} opacity={0.95}>
        {vehicle.label} · {Math.round(vehicle.speed ?? 0)} km/h ·{" "}
        {(vehicle.distanceKm ?? 0).toFixed(1)} km left
      </Tooltip>
    </Marker>
  );
}

export function VehicleMap({
  vehicles,
  focusId = null,
  focusToken = null,
}: {
  vehicles: MapVehicle[];
  focusId?: string | null;
  focusToken?: string | null;
}) {
  // Freeze initial center — never rebind to moving GPS (causes camera shake)
  const initialCenter = useRef<[number, number] | null>(null);
  if (!initialCenter.current) {
    initialCenter.current = vehicles[0]
      ? [vehicles[0].latitude, vehicles[0].longitude]
      : [19.076, 72.877];
  }

  return (
    <div className="sf-map-shell">
      <MapContainer
        center={initialCenter.current}
        zoom={13}
        minZoom={3}
        maxZoom={19}
        scrollWheelZoom
        zoomControl={false}
        attributionControl={false}
        className="sf-leaflet"
        style={{ width: "100%", height: "100%", background: "#c8d9c4" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> HOT'
          maxZoom={20}
          maxNativeZoom={19}
          subdomains="abc"
          updateWhenIdle={false}
          updateWhenZooming
          keepBuffer={6}
          className="sf-map-tiles"
          errorTileUrl="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        />

        <MapZoomControl />
        <MapLifecycle
          vehicles={vehicles}
          focusId={focusId}
          focusToken={focusToken}
        />
        <FitPopupInBounds />

        {vehicles.map((vehicle) => {
          const status = vehicle.status ?? "active";
          const focused = focusId === vehicle.id;
          return (
            <VehicleMarker
              key={vehicle.id}
              vehicle={vehicle}
              status={status}
              focused={focused}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
