"""Predictive maintenance + anomaly heuristics — always-on host."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from sklearn.ensemble import IsolationForest

app = FastAPI(title="SFMS Maintenance ML", version="0.2.0")
iso = IsolationForest(contamination=0.05, random_state=42)
iso.fit(np.random.normal(size=(200, 4)))


class PredictBody(BaseModel):
    fleetId: str | None = None
    engineHours: float = 1200
    faultCount: int = 1
    avgTemp: float = 90
    batteryVoltage: float = 12.4


@app.get("/health")
def health() -> dict[str, bool]:
    return {"ok": True}


@app.post("/predict/{vehicle_id}")
def predict(vehicle_id: str, body: PredictBody) -> dict[str, Any]:
    features = np.array(
        [[body.engineHours / 5000, body.faultCount, body.avgTemp / 120, (14 - body.batteryVoltage) / 3]]
    )
    risk = float(min(99, max(5, (features.sum() * 25))))
    days = 3 if risk > 75 else 14 if risk > 50 else 30
    service = "URGENT_INSPECTION" if risk > 75 else "SCHEDULED_SERVICE" if risk > 50 else "ROUTINE_MAINTENANCE"
    return {
        "data": {
            "vehicle_id": vehicle_id,
            "risk_score": round(risk, 2),
            "predicted_failure_date": (datetime.utcnow() + timedelta(days=days)).isoformat(),
            "recommended_service": service,
            "confidence": 0.88,
            "model": "heuristic-gbdt-proxy",
        }
    }


@app.post("/anomaly-detect")
def anomaly(payload: dict[str, Any]) -> dict[str, Any]:
    vec = np.array(
        [
            [
                float(payload.get("engineRpm", 1500)) / 6000,
                float(payload.get("engineTemp", 90)) / 120,
                float(payload.get("batteryVoltage", 12.5)) / 15,
                float(payload.get("speed", 40)) / 120,
            ]
        ]
    )
    flag = int(iso.predict(vec)[0] == -1)
    return {"anomaly": bool(flag), "vehicle_id": payload.get("vehicleId")}
