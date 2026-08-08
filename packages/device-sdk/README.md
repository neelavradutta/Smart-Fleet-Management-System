# SFMS Edge Device SDK (stub)

Offline-first GPS buffer → MQTT/HTTP sync when online.

## Protocol

1. Device writes points to local ring buffer (max 10k)
2. On connect: `POST /api/v1/telemetry/gps` with API key **or** MQTT topic `sfms/{fleetId}/telemetry`
3. Ack removes from buffer
4. Optional on-device harsh-brake detection before upload

## Future

- TensorFlow Lite driver-behavior model
- Fallback nearest-neighbor routing when cloud down
