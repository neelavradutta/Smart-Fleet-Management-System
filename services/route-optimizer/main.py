"""OR-Tools VRP optimizer — always-on (Fly/Railway), not Vercel."""

from __future__ import annotations

import json
import math
import os
import uuid
from typing import Any

import redis
from fastapi import BackgroundTasks, FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="SFMS Route Optimizer", version="0.2.0")
redis_client = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"), decode_responses=True)


class Delivery(BaseModel):
    id: str
    lat: float
    lng: float
    timeWindow: tuple[float, float] | None = None
    demand: float = 1


class OptimizeRequest(BaseModel):
    fleet_id: str
    job_id: str | None = None
    vehicleIds: list[str] = Field(alias="vehicleIds")
    depotLat: float
    depotLng: float
    deliveryLocations: list[Delivery]
    constraints: dict[str, Any] = Field(default_factory=dict)

    model_config = {"populate_by_name": True}


def haversine_km(a: tuple[float, float], b: tuple[float, float]) -> float:
    r = 6371.0
    lat1, lon1, lat2, lon2 = map(math.radians, [a[0], a[1], b[0], b[1]])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 2 * r * math.asin(math.sqrt(h))


def solve_vrp(req: OptimizeRequest) -> dict[str, Any]:
    try:
        from ortools.constraint_solver import pywrapcp, routing_enums_pb2
    except ImportError:
        return nearest_neighbor(req)

    points = [(req.depotLat, req.depotLng)] + [(d.lat, d.lng) for d in req.deliveryLocations]
    n = len(points)
    dist = [[int(haversine_km(points[i], points[j]) * 1000) for j in range(n)] for i in range(n)]

    manager = pywrapcp.RoutingIndexManager(n, len(req.vehicleIds), 0)
    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index: int, to_index: int) -> int:
        return dist[manager.IndexToNode(from_index)][manager.IndexToNode(to_index)]

    transit = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit)
    max_dist = int(req.constraints.get("maxDistanceKm", 500) * 1000)
    routing.AddDimension(transit, 0, max_dist, True, "distance")

    params = pywrapcp.DefaultRoutingSearchParameters()
    params.first_solution_strategy = FAKESECRET_c2d3e4f5g6h7i8j9k0l1
    params.local_search_metaheuristic = FAKESECRET_e3f4g5h6i7j8k9l0m1n2
    params.time_limit.FromSeconds(30)

    solution = routing.SolveWithParameters(params)
    if not solution:
        return nearest_neighbor(req)

    routes = []
    total = 0
    for v in range(len(req.vehicleIds)):
        index = routing.Start(v)
        stops = []
        while not routing.IsEnd(index):
            node = manager.IndexToNode(index)
            if node > 0:
                d = req.deliveryLocations[node - 1]
                stops.append({"location_id": d.id, "lat": d.lat, "lng": d.lng, "sequence": len(stops)})
            prev = index
            index = solution.Value(routing.NextVar(index))
            total += routing.GetArcCostForVehicle(prev, index, v)
        if stops:
            routes.append({"vehicle_id": req.vehicleIds[v], "stops": stops})

    return {
        "status": "completed",
        "algorithm": "ortools-vrp",
        "routes": routes,
        "total_distance_m": total,
        "total_distance_km": total / 1000,
        "optimization_score": 90,
    }


def nearest_neighbor(req: OptimizeRequest) -> dict[str, Any]:
    remaining = list(req.deliveryLocations)
    cur = (req.depotLat, req.depotLng)
    ordered = []
    total = 0.0
    while remaining:
        remaining.sort(key=lambda d: haversine_km(cur, (d.lat, d.lng)))
        nxt = remaining.pop(0)
        total += haversine_km(cur, (nxt.lat, nxt.lng))
        ordered.append({"location_id": nxt.id, "lat": nxt.lat, "lng": nxt.lng, "sequence": len(ordered)})
        cur = (nxt.lat, nxt.lng)
    return {
        "status": "completed",
        "algorithm": "nearest-neighbor",
        "routes": [{"vehicle_id": req.vehicleIds[0], "stops": ordered}],
        "total_distance_km": total,
        "optimization_score": 80,
    }


def persist_job(job_id: str, payload: dict[str, Any]) -> None:
    try:
        redis_client.setex(f"job:{job_id}", 3600, json.dumps(payload))
    except Exception:
        pass


@app.get("/health")
def health() -> dict[str, bool]:
    return {"ok": True}


@app.post("/optimize")
async def optimize(req: OptimizeRequest, bg: BackgroundTasks) -> dict[str, Any]:
    job_id = req.job_id or str(uuid.uuid4())
    persist_job(job_id, {"status": "processing"})

    def run() -> None:
        result = solve_vrp(req)
        result["job_id"] = job_id
        persist_job(job_id, result)

    bg.add_task(run)
    return {"job_id": job_id, "status": "processing"}


@app.post("/reoptimize/{route_id}")
async def reoptimize(route_id: str, req: OptimizeRequest, bg: BackgroundTasks) -> dict[str, Any]:
    job_id = str(uuid.uuid4())
    persist_job(job_id, {"status": "processing", "route_id": route_id})

    def run() -> None:
        result = solve_vrp(req)
        result["job_id"] = job_id
        result["route_id"] = route_id
        persist_job(job_id, result)

    bg.add_task(run)
    return {"job_id": job_id, "status": "processing"}
