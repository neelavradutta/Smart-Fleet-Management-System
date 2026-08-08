import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 50 },
    { duration: "1m", target: 200 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.05"],
  },
};

const BASE = __ENV.API_URL || "http://localhost:3001";
const API_KEY = __ENV.API_KEY || "replace-me";
const VEHICLE_ID = __ENV.VEHICLE_ID || "00000000-0000-0000-0000-000000000001";

export default function () {
  const payload = JSON.stringify({
    vehicleId: VEHICLE_ID,
    latitude: 19.076 + Math.random() * 0.05,
    longitude: 72.877 + Math.random() * 0.05,
    speed: Math.random() * 90,
    heading: Math.random() * 360,
    timestamp: new Date().toISOString(),
  });

  const res = http.post(`${BASE}/api/v1/telemetry/gps`, payload, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
  });

  check(res, {
    "status 200": (r) => r.status === 200,
  });
  sleep(0.2);
}
