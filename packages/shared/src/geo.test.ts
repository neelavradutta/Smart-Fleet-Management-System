import { estimateCo2Kg, haversineMeters, pointInCircle } from "./geo.js";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

assert(haversineMeters(19.076, 72.877, 19.076, 72.877) < 1, "same point ~0");
assert(
  pointInCircle(19.076, 72.877, 19.076, 72.877, 500),
  "center inside circle",
);
assert(estimateCo2Kg(100) > 20, "co2 scales with distance");
console.log("geo tests passed");
