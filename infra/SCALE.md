# Scale playbook (Phase 4)

## Targets (adapted from PRD)

| Metric | Target |
|--------|--------|
| Live position freshness | < 5s |
| Admin CRUD p99 | < 200ms |
| Optimize job | < 30s / ~50 stops |
| Ingest (start) | 1k vehicles @ 1Hz, grow to 100k |

## Horizontal scale

1. **API gateway**: Fly/Railway replicas ≥ 2 + Socket.IO Redis adapter
2. **Kafka**: partition `vehicle-telemetry` by `vehicleId`
3. **Timescale**: compression 7d, continuous aggregates hourly, read replica for trails
4. **Vercel**: UI only — never device ingest
5. **Workers**: scale `telemetry-worker` with consumer group

## Multi-region (later)

- Active-passive DB first
- Sticky WS per region
- Avoid dual-write until CRDT/event sourcing ready

## Load test

```bash
k6 run -e API_URL=https://gateway.example -e API_KEY=... -e VEHICLE_ID=... infra/load/telemetry-k6.js
```
