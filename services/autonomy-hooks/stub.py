"""AV integration stub — publish/subscribe contracts only."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal


Mode = Literal["MANUAL", "ASSIST", "AUTONOMY", "FALLBACK"]


@dataclass
class AutonomyEvent:
    vehicle_id: str
    mode: Mode
    geofence_ok: bool
    operator_override: bool


def next_mode(event: AutonomyEvent) -> Mode:
    if event.operator_override or not event.geofence_ok:
        return "FALLBACK"
    return event.mode


if __name__ == "__main__":
    e = AutonomyEvent("v1", "AUTONOMY", geofence_ok=False, operator_override=False)
    print(next_mode(e))
