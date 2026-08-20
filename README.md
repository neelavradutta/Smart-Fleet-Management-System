# Smart Fleet Management System (SFMS)..

Vercel-first hybrid fleet platform — full PRD feature set across Phases 0–4.

## Architecture

| Layer | Deploy |
|-------|--------|
| `apps/web` Next.js admin + public track | **Vercel** |
| `apps/api-gateway` REST + Socket.IO | **Fly.io / Railway** |
| `apps/telemetry-worker` Kafka drain | Fly / Railway |
| `services/route-optimizer` OR-Tools | Fly / Railway |
| `services/maintenance-ml` sklearn | Fly / Railway |
| `services/analytics` pandas | Fly / Railway |
| Postgres/Timescale, Redis, Mongo, Kafka, MQTT | Docker / managed |

## Features shipped

- Real-time GPS, trails, geofences, speeding + spoof heuristics, WS live map
- Route assign + optimize (OR-Tools or nearest-neighbor fallback) + CO₂
- Shipments, ePOD, public `/track/:token`
- Driver behavior scoring, HOS stub, leaderboard
- Fuel anomaly, predictive maintenance, analytics/ESG/custom reports
- Documents vault, webhooks outbox, usage billing meters, dynamic pricing (ENTERPRISE)
- Feature flags by tier, GDPR export, audit logs, OpenAPI, k6 load test
- Edge SDK buffer stub + AV hooks stub

## Quick start

```bash
# Docker Desktop required for data plane
docker compose up -d postgres redis mongo kafka mosquitto

cp .env.example .env
pnpm install
pnpm --filter @sfms/shared build
pnpm db:migrate
pnpm db:seed

pnpm dev:gateway    # :3001
pnpm dev:web        # :3000  → deploy this to Vercel
pnpm dev:worker     # kafka/redis drain

# optional Python
pip install -r services/route-optimizer/requirements.txt
uvicorn main:app --app-dir services/route-optimizer --port 5001
pip install -r services/maintenance-ml/requirements.txt
uvicorn main:app --app-dir services/maintenance-ml --port 5002
```

Demo login after seed: `owner@demo.fleet` / `demo12345`

## Vercel

- Project root: `apps/web`
- Env: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL` → public gateway URL

## Docs

- API: [`apps/api-gateway/openapi.yaml`](apps/api-gateway/openapi.yaml)
- Scale: [`infra/SCALE.md`](infra/SCALE.md)
- Load: `pnpm loadtest` (needs k6 + running gateway)
