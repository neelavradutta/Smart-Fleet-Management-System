# Autonomous fleet hooks (future-ready)

Safety-critical channel stubs — **not** a full AV stack.

## Topics

- `av.intent` — planned maneuver from autonomy stack
- `av.fallback` — handoff to remote operator
- `av.geofence` — autonomous-allowed zones only

## Rules

1. Cloud never commands brakes directly without vehicle safety MCU ack
2. Geofence deny → immediate disengage request
3. Operator override always wins
