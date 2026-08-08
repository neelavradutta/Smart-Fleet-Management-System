"""Analytics sidecar — custom aggregations for heavy reports."""

from __future__ import annotations

from typing import Any

import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="SFMS Analytics", version="0.2.0")


class ReportIn(BaseModel):
    rows: list[dict[str, Any]]
    group_by: str = "day"


@app.get("/health")
def health() -> dict[str, bool]:
    return {"ok": True}


@app.post("/aggregate")
def aggregate(body: ReportIn) -> dict[str, Any]:
    if not body.rows:
        return {"data": [], "rows": 0}
    df = pd.DataFrame(body.rows)
    numeric = df.select_dtypes(include="number")
    summary = numeric.mean().to_dict() if not numeric.empty else {}
    return {"data": [{"group_by": body.group_by, **summary}], "rows": len(df)}
