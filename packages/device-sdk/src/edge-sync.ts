export type EdgePoint = {
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  timestamp: string;
};

/** Minimal offline buffer for vehicle edge agents */
export class EdgeGpsBuffer {
  private buf: EdgePoint[] = [];
  constructor(private max = 10_000) {}

  push(point: EdgePoint) {
    this.buf.push(point);
    if (this.buf.length > this.max) this.buf.shift();
  }

  drain(n = 100): EdgePoint[] {
    return this.buf.splice(0, n);
  }

  size() {
    return this.buf.length;
  }
}

export async function syncBatch(
  apiUrl: string,
  apiKey: string,
  points: EdgePoint[],
) {
  const results = [];
  for (const p of points) {
    const res = await fetch(`${apiUrl}/api/v1/telemetry/gps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(p),
    });
    results.push(res.status);
  }
  return results;
}
