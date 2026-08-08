"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapVehicle = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  speed?: number;
  status?: "active" | "idle" | "offline";
  heading?: number;
};

const STATUS = {
  active: { fill: "#16a34a", label: "Active" },
  idle: { fill: "#d97706", label: "Idle" },
  offline: { fill: "#64748b", label: "Offline" },
} as const;

const iconCache = new Map<string, L.DivIcon>();

function getVehicleIcon(
  label: string,
  status: keyof typeof STATUS,
  heading: number,
) {
  const bucket = Math.round(heading / 15) * 15;
  const key = `${status}|${bucket}|${label}`;
  const hit = iconCache.get(key);
  if (hit) return hit;

  const s = STATUS[status] ?? STATUS.active;
  const short = label.length > 10 ? `${label.slice(0, 9)}…` : label;
  const icon = L.divIcon({
    html: `
      <div class="sf-map-marker">
        <div class="sf-map-pin" style="transform:rotate(${bucket}deg)">
          <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2C11.7 2 5 8.7 5 17c0 11.2 15 29 15 29s15-17.8 15-29C35 8.7 28.3 2 20 2z" fill="${s.fill}" stroke="#fff" stroke-width="2"/>
            <circle cx="20" cy="17" r="7" fill="#fff"/>
            <path d="M20 12.5 L23 20 L20 18.2 L17 20Z" fill="${s.fill}"/>
          </svg>
        </div>
        <div class="sf-map-label">${short}</div>
      </div>
    `,
    className: "sf-map-icon",
    iconSize: [40, 56],
    iconAnchor: [20, 48],
    popupAnchor: [0, -44],
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
}: {
  vehicles: MapVehicle[];
  focusId?: string | null;
}) {
  const map = useMap();
  const fittedKey = useRef<string>("");
  const vehiclesRef = useRef(vehicles);
  vehiclesRef.current = vehicles;

  useEffect(() => {
    const el = map.getContainer();
    const invalidate = () => {
      map.invalidateSize({ animate: false });
    };

    invalidate();
    const t1 = window.setTimeout(invalidate, 50);
    const t2 = window.setTimeout(invalidate, 250);
    const t3 = window.setTimeout(invalidate, 600);

    const ro = new ResizeObserver(() => invalidate());
    ro.observe(el);
    if (el.parentElement) ro.observe(el.parentElement);

    const onVis = () => {
      if (document.visibilityState === "visible") invalidate();
    };
    window.addEventListener("resize", invalidate);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      ro.disconnect();
      window.removeEventListener("resize", invalidate);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [map]);

  useEffect(() => {
    const idsKey = vehicles
      .map((v) => v.id)
      .sort()
      .join("|");
    if (!vehicles.length || fittedKey.current === idsKey) return;
    const bounds = L.latLngBounds(
      vehicles.map((v) => [v.latitude, v.longitude] as [number, number]),
    );
    map.invalidateSize({ animate: false });
    map.fitBounds(bounds.pad(0.28), { animate: true, maxZoom: 15 });
    fittedKey.current = idsKey;
  }, [vehicles, map]);

  useEffect(() => {
    if (!focusId) return;
    const v = vehicles.find((x) => x.id === focusId);
    if (!v) return;
    map.flyTo([v.latitude, v.longitude], Math.max(map.getZoom(), 14), {
      duration: 0.7,
    });
  }, [focusId, vehicles, map]);

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

export function VehicleMap({
  vehicles,
  focusId = null,
}: {
  vehicles: MapVehicle[];
  focusId?: string | null;
}) {
  const center = useMemo<[number, number]>(() => {
    if (!vehicles[0]) return [19.076, 72.877];
    return [vehicles[0].latitude, vehicles[0].longitude];
  }, [vehicles]);

  return (
    <div className="sf-map-shell">
      <MapContainer
        center={center}
        zoom={13}
        minZoom={3}
        maxZoom={19}
        scrollWheelZoom
        zoomControl={false}
        attributionControl
        preferCanvas={false}
        className="sf-leaflet"
        style={{ width: "100%", height: "100%", background: "#dceee0" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          maxZoom={20}
          subdomains="abcd"
          updateWhenIdle={false}
          updateWhenZooming
          keepBuffer={4}
          errorTileUrl="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        />

        <ZoomControl position="bottomright" />
        <MapLifecycle vehicles={vehicles} focusId={focusId} />

        {vehicles.map((vehicle) => {
          const status = vehicle.status ?? "active";
          return (
            <Marker
              key={vehicle.id}
              position={[vehicle.latitude, vehicle.longitude]}
              icon={getVehicleIcon(
                vehicle.label,
                status,
                vehicle.heading ?? 0,
              )}
              zIndexOffset={
                focusId === vehicle.id
                  ? 1000
                  : status === "active"
                    ? 400
                    : 200
              }
            >
              <Popup className="sf-map-popup" autoPan>
                <div className="sf-popup-body">
                  <p className="sf-popup-title">{vehicle.label}</p>
                  <div className="sf-popup-row">
                    <span
                      className="sf-popup-dot"
                      style={{ background: STATUS[status].fill }}
                    />
                    {STATUS[status].label}
                  </div>
                  <p>
                    Speed: <strong>{Math.round(vehicle.speed ?? 0)}</strong>{" "}
                    km/h
                  </p>
                  <p className="sf-popup-coords">
                    {vehicle.latitude.toFixed(5)},{" "}
                    {vehicle.longitude.toFixed(5)}
                  </p>
                </div>
              </Popup>
              <Tooltip direction="top" offset={[0, -42]} opacity={0.95}>
                {vehicle.label} · {Math.round(vehicle.speed ?? 0)} km/h
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
