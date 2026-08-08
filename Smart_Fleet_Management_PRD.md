# Smart Fleet Management System - Backend PRD
## Complete Architecture & Implementation Guide

---

## 1. EXECUTIVE SUMMARY

**Product Name:** Smart Fleet Management System (SFMS)  
**Version:** 1.0  
**Status:** PRD - Architecture & Design Phase  
**Target Deployment:** AWS/GCP with Edge Computing Support

The Smart Fleet Management System is an enterprise-grade IoT platform that provides real-time fleet monitoring, predictive maintenance, route optimization, and intelligent resource allocation for logistics companies managing 100s to 1000s of vehicles.

---

## 2. SYSTEM ARCHITECTURE OVERVIEW

### 2.1 High-Level Architecture

```
IoT Devices/Vehicles
    ↓ (MQTT/HTTP)
    ↓
Edge Gateway Layer (Kafka/NATS)
    ↓
Node.js Express API Gateway + WebSocket Server
    ↓
Microservices Layer (Python + Node.js)
    ├─ GPS & Location Service
    ├─ Route Optimization Engine
    ├─ Predictive Maintenance
    ├─ Fuel & Resource Manager
    ├─ Alert & Notification Engine
    ├─ Analytics & Reporting
    └─ Billing & Driver Management
    ↓
Data Layer
    ├─ TimescaleDB (Real-time metrics)
    ├─ Redis (Cache + Pub/Sub)
    ├─ MongoDB (Document storage)
    └─ S3/Cloud Storage (Archives)
    ↓
Real-time Layer (WebSocket/Server-Sent Events)
    ↓
Frontend (Future)
```

### 2.2 Technology Stack Rationale

#### Backend Services
- **Node.js + Express.js**: API gateway, real-time WebSocket handling, event streaming
- **Python (FastAPI/Uvicorn)**: Heavy computational tasks (route optimization, ML predictions)
- **TypeScript**: Type safety across Node.js services
- **Docker & Kubernetes**: Containerization and orchestration

#### Real-time Communication
- **Socket.IO or Raw WebSocket**: Live vehicle tracking, push notifications
- **Kafka/NATS**: Event streaming for decoupled microservices
- **Redis Streams**: Message queuing for critical operations

#### Databases
- **TimescaleDB** (PostgreSQL extension): Time-series vehicle telemetry
- **MongoDB**: Flexible document storage for configs, alerts, historical data
- **Redis**: Cache layer, real-time state, Pub/Sub messaging
- **Elasticsearch**: Advanced search and analytics on logs

#### Cloud & Infrastructure
- **AWS/GCP/Azure**: Primary cloud platform
- **Lambda/Cloud Functions**: Serverless compute for background jobs
- **S3/Cloud Storage**: Long-term data archival
- **CloudFront/CDN**: Content delivery
- **VPC & Security Groups**: Network isolation

#### IoT & Edge
- **MQTT Broker (Mosquitto/AWS IoT Core)**: Device communication
- **Protocol Buffers**: Efficient message serialization
- **Edge Compute (Optional)**: On-vehicle processing

---

## 3. CORE FEATURES & REQUIREMENTS

### 3.1 Real-time GPS Tracking & Geofencing

**Requirements:**
- Sub-second GPS position updates for active vehicles
- Historical location trails (30-90 days retention)
- Geofence creation and violation alerts
- Route replaying with speed/acceleration analytics
- Multi-vehicle dashboard with live map visualization

**Backend Implementation:**
```
Data Flow:
Vehicle GPS Data (1-5 Hz) → MQTT/HTTP → Node.js Ingestion API 
→ Kafka Event Stream → TimescaleDB (batched writes)
→ Redis cache (current position) → WebSocket broadcast to clients
```

**Key Endpoints:**
- `POST /api/v1/telemetry/gps` - Ingest GPS coordinates
- `GET /api/v1/vehicles/:id/location/current` - Get last known position
- `GET /api/v1/vehicles/:id/location/trail` - Get historical path
- `POST /api/v1/geofences` - Create/manage geofences
- `WS /ws/tracking/:vehicleId` - Real-time location stream

### 3.2 Route Optimization Engine (Python)

**Requirements:**
- Optimize multi-stop delivery routes using AI/ML
- Consider vehicle capacity, time windows, traffic patterns
- Real-time re-routing based on traffic, accidents, vehicle status
- Saved routes with performance metrics
- Integration with Google Maps/OSRM APIs

**Algorithm Stack:**
- OR-Tools (Google): Vehicle Routing Problem (VRP) with time windows
- OSRM: Open-source routing engine (self-hosted alternative)
- Machine Learning: LSTM for traffic prediction
- Graph algorithms: Dijkstra, A* for path finding

**Key Endpoints:**
- `POST /api/v1/routes/optimize` - Generate optimal route (async job)
- `GET /api/v1/routes/:id/stops` - Get stops for a route
- `PUT /api/v1/routes/:id/reroute` - Trigger re-optimization
- `GET /api/v1/routes/:id/metrics` - Performance analytics

### 3.3 Predictive Maintenance Alerts

**Requirements:**
- Monitor vehicle OBD-II data (engine temp, RPM, fault codes)
- Predict maintenance needs 1-3 weeks in advance
- Schedule maintenance appointments
- Service history tracking
- Parts inventory management
- Maintenance cost analytics

**ML Models:**
- Time-series anomaly detection (Isolation Forest, ARIMA)
- Gradient boosting for failure prediction
- Maintenance cycle optimization

**Data Collection:**
```
OBD-II Device → MQTT → Python ML Engine
Parameters: Engine hours, fault codes, fluid levels, battery voltage
Output: Risk score (0-100), predicted failure date, recommended service
```

**Key Endpoints:**
- `POST /api/v1/vehicles/:id/obd-data` - Ingest OBD metrics
- `GET /api/v1/vehicles/:id/health-score` - Overall vehicle health
- `GET /api/v1/vehicles/:id/maintenance/predictions` - Forecast maintenance needs
- `POST /api/v1/maintenance/schedule` - Book maintenance
- `GET /api/v1/fleet/maintenance-report` - Fleet-wide maintenance overview

### 3.4 Fuel Monitoring & Optimization

**Requirements:**
- Real-time fuel consumption tracking
- Fuel efficiency benchmarking
- Anomaly detection (fuel theft, leakage)
- Driver behavior impact on fuel usage
- Cost prediction and budgeting

**Key Metrics:**
- Fuel consumption per km (MPG/L per 100km)
- Idle time fuel waste
- Acceleration/deceleration efficiency
- Weather-adjusted baselines

**Key Endpoints:**
- `POST /api/v1/telemetry/fuel` - Log fuel level readings
- `GET /api/v1/vehicles/:id/fuel/efficiency` - Efficiency metrics
- `GET /api/v1/fleet/fuel-report` - Aggregate fuel analytics
- `POST /api/v1/fuel/alerts` - Anomaly detection triggers
- `GET /api/v1/vehicles/:id/fuel/predictions` - Fuel cost forecasts

### 3.5 Driver Management & Behavior Monitoring

**Requirements:**
- Driver profiles with license/documentation tracking
- Driver behavior scoring (harsh acceleration, speeding, harsh braking)
- Hours of Service (HOS) compliance tracking
- Driver safety training recommendations
- Performance-based incentives

**Scoring Algorithm:**
```
Safety Score = 100 - (speeding_penalty + harsh_accel_penalty + harsh_brake_penalty + harsh_turn_penalty)
Weight events by severity and frequency
Track trends over 7/30/90 day periods
```

**Key Endpoints:**
- `POST /api/v1/drivers` - Create driver profile
- `GET /api/v1/drivers/:id/performance` - Driver scorecard
- `POST /api/v1/drivers/:id/behavior-events` - Log safety events
- `GET /api/v1/drivers/:id/hos/compliance` - Hours of service tracking
- `GET /api/v1/fleet/driver-leaderboard` - Performance rankings

### 3.6 Shipment Tracking & Proof of Delivery

**Requirements:**
- End-to-end shipment tracking from pickup to delivery
- Electronic Proof of Delivery (ePOD) with signatures/photos
- Shipment status notifications (customer-facing)
- Damaged goods reporting with photo documentation
- Exception handling (failed deliveries, delays)

**Workflow:**
```
Order Created → Assigned to Route → Picked up → In Transit 
→ Approaching delivery → Delivered → ePOD captured → Closed
```

**Key Endpoints:**
- `POST /api/v1/shipments` - Create shipment
- `PATCH /api/v1/shipments/:id/status` - Update status
- `POST /api/v1/shipments/:id/proof-of-delivery` - Submit ePOD
- `GET /api/v1/shipments/:id/tracking` - Customer-facing tracking
- `GET /api/v1/shipments/exceptions` - Failed/delayed shipments

### 3.7 Predictive Analytics & Reporting

**Requirements:**
- Fleet utilization dashboards
- Cost per delivery analytics
- On-time delivery performance
- Revenue forecasting
- Predictive capacity planning
- Custom report builder

**Analytics Pipeline:**
```
Raw Data (TimescaleDB/MongoDB) 
→ Aggregation Layer (Python dbt/Pandas)
→ Data Warehouse (Elasticsearch/Clickhouse)
→ BI Tools (Grafana/Superset)
```

**Key Metrics (KPIs):**
- Average delivery time per km
- Fleet utilization rate (%)
- On-time delivery rate (%)
- Cost per km
- Fuel efficiency trends
- Vehicle downtime percentage
- Driver turnover rate

**Key Endpoints:**
- `GET /api/v1/analytics/fleet-overview` - Dashboard metrics
- `POST /api/v1/analytics/custom-report` - Generate custom reports
- `GET /api/v1/analytics/predictions/capacity` - Capacity forecasts
- `GET /api/v1/analytics/vehicle/:id/performance` - Per-vehicle analytics

---

## 4. ADVANCED FEATURES

### 4.1 Dynamic Pricing & Load Balancing

**Concept:** Optimize fleet utilization by dynamically suggesting prices based on supply-demand

**Features:**
- Real-time pricing suggestions based on vehicle availability
- Surge pricing during peak hours
- Discount predictions for off-peak utilization
- Revenue optimization algorithms
- Customer demand forecasting

**Implementation:**
- ML model predicts demand 1-7 days ahead
- Auto-adjust pricing to maximize revenue
- A/B testing framework for pricing strategies

### 4.2 Carbon Footprint Tracking & ESG Reporting

**Features:**
- Calculate CO2 emissions per delivery
- Green route options (fewer emissions vs. faster)
- ESG compliance reporting
- Carbon offset tracking
- Green delivery incentives

**Calculation:**
```
CO2 = Distance (km) × Vehicle_Emission_Factor + IdleTime_Penalty
ESG Score tracks sustainability metrics over time
```

### 4.3 Advanced Anomaly Detection

**Use Cases:**
- Theft detection (unusual route deviations, idle in high-risk areas)
- Driver impairment detection (erratic driving patterns)
- Vehicle malfunction detection (CAN bus fault codes)
- GPS spoofing detection (impossible speeds, location jumps)

**Methods:**
- Isolation Forest for multivariate outlier detection
- LSTM autoencoders for sequence anomalies
- Statistical process control (Z-score, Mahalanobis distance)

### 4.4 Multi-Tenant Architecture

**Requirements:**
- Multiple logistics companies on single platform
- Isolated data per tenant
- Tenant-specific branding
- Usage-based billing
- API rate limiting per tenant

**Implementation:**
- Tenant ID as partition key across all tables
- Row-level security (RLS) in database
- JWT tokens with tenant scoping
- Separate Redis namespaces per tenant

### 4.5 Mobile Edge Computing

**Concept:** Offload compute to vehicle-mounted devices

**Use Cases:**
- On-device route optimization (fallback if cloud unavailable)
- Real-time brake/acceleration detection
- Offline-first GPS logging
- ML inference at the edge (driver behavior)

**Technologies:**
- TensorFlow Lite for lightweight inference
- Sync when connected via MQTT

### 4.6 Autonomous Fleet Capabilities (Future-Ready)

**Architecture for future AV integration:**
- Separate autonomy service with safety-critical messaging
- Fallback to remote operator
- Geofencing for autonomous zones
- Integration hooks for autonomous vehicle platforms

### 4.7 Dynamic Surge Pricing & Demand Prediction

**Advanced feature:**
- Real-time surge detection
- ML-based demand forecasting using historical + external data
- Automated price adjustments
- Revenue optimization per route/zone

---

## 5. DATABASE SCHEMA (Key Tables)

### 5.1 TimescaleDB (Time-Series Data)

```sql
-- Vehicles telemetry (1-5 Hz ingestion)
CREATE TABLE vehicle_telemetry (
    time TIMESTAMPTZ NOT NULL,
    vehicle_id UUID NOT NULL,
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    altitude DECIMAL(8, 2),
    speed DECIMAL(5, 2),
    heading DECIMAL(5, 2),
    accuracy DECIMAL(5, 2),
    
    engine_rpm INT,
    engine_temp DECIMAL(5, 2),
    fuel_level DECIMAL(5, 2),
    battery_voltage DECIMAL(4, 2),
    
    acceleration_x DECIMAL(5, 2),
    acceleration_y DECIMAL(5, 2),
    acceleration_z DECIMAL(5, 2),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY TIME (time INTERVAL '1 day');

CREATE INDEX ON vehicle_telemetry (vehicle_id, time DESC);
SELECT create_hypertable('vehicle_telemetry', 'time', if_not_exists => TRUE);

-- OBD-II fault codes
CREATE TABLE vehicle_obd_faults (
    time TIMESTAMPTZ NOT NULL,
    vehicle_id UUID NOT NULL,
    fault_code VARCHAR(10),
    fault_description TEXT,
    severity ENUM ('INFO', 'WARNING', 'CRITICAL'),
    created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY TIME (time INTERVAL '1 day');

CREATE INDEX ON vehicle_obd_faults (vehicle_id, severity, time DESC);
```

### 5.2 PostgreSQL/MongoDB (Transactional & Document Data)

```sql
-- Vehicles master data
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fleet_id UUID NOT NULL REFERENCES fleets(id),
    vehicle_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type ENUM ('VAN', 'TRUCK', 'BIKE', 'CAR'),
    make VARCHAR(50),
    model VARCHAR(50),
    year INT,
    license_plate VARCHAR(20),
    vin VARCHAR(17) UNIQUE,
    
    capacity_weight_kg INT,
    capacity_volume_m3 DECIMAL(8, 2),
    
    status ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'RETIRED'),
    last_location_update TIMESTAMPTZ,
    current_latitude DECIMAL(9, 6),
    current_longitude DECIMAL(9, 6),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drivers
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fleet_id UUID NOT NULL REFERENCES fleets(id),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    license_number VARCHAR(50),
    license_expiry DATE,
    status ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE'),
    
    safety_score DECIMAL(3, 1) DEFAULT 100,
    total_miles BIGINT DEFAULT 0,
    assigned_vehicle_id UUID REFERENCES vehicles(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Routes & Deliveries
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fleet_id UUID NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id),
    driver_id UUID REFERENCES drivers(id),
    
    route_status ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'),
    route_type ENUM ('DELIVERY', 'COLLECTION', 'SERVICE', 'SWEEP'),
    
    planned_distance_km DECIMAL(8, 2),
    actual_distance_km DECIMAL(8, 2),
    
    planned_duration_minutes INT,
    actual_duration_minutes INT,
    
    planned_start_time TIMESTAMP,
    actual_start_time TIMESTAMP,
    planned_end_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    
    total_stops INT,
    completed_stops INT,
    
    optimization_score DECIMAL(3, 1),
    efficiency_score DECIMAL(3, 1),
    
    route_json JSONB, -- Optimized stop sequence
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipments
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fleet_id UUID NOT NULL,
    route_id UUID REFERENCES routes(id),
    
    shipment_status ENUM ('CREATED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED'),
    
    customer_id VARCHAR(100),
    customer_name VARCHAR(100),
    customer_phone VARCHAR(20),
    customer_email VARCHAR(100),
    
    pickup_address TEXT,
    delivery_address TEXT,
    pickup_location POINT, -- PostGIS
    delivery_location POINT,
    
    weight_kg DECIMAL(8, 2),
    volume_m3 DECIMAL(8, 2),
    
    expected_delivery_time TIMESTAMP,
    actual_delivery_time TIMESTAMP,
    
    pod_signature_url TEXT,
    pod_photo_urls TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts & Notifications
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fleet_id UUID NOT NULL,
    alert_type ENUM ('GEOFENCE_VIOLATION', 'MAINTENANCE_DUE', 'HARSH_DRIVING', 'FUEL_ANOMALY', 'DELAY', 'BREAKDOWN'),
    alert_severity ENUM ('INFO', 'WARNING', 'CRITICAL'),
    
    vehicle_id UUID REFERENCES vehicles(id),
    driver_id UUID REFERENCES drivers(id),
    
    alert_message TEXT,
    alert_data JSONB,
    
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Geofences
CREATE TABLE geofences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fleet_id UUID NOT NULL,
    
    name VARCHAR(100),
    geofence_type ENUM ('DEPOT', 'RESTRICTED', 'CUSTOMER_ZONE', 'PARKING'),
    polygon POLYGON, -- PostGIS
    
    center_location POINT,
    radius_meters INT,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance Records
CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    
    maintenance_type ENUM ('OIL_CHANGE', 'TIRE_ROTATION', 'BRAKE_SERVICE', 'ENGINE_INSPECTION', 'OTHER'),
    description TEXT,
    
    scheduled_date DATE,
    completed_date DATE,
    
    cost DECIMAL(10, 2),
    parts_replaced TEXT[],
    
    mechanic_name VARCHAR(100),
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fleet configuration & settings
CREATE TABLE fleet_settings (
    fleet_id UUID PRIMARY KEY REFERENCES fleets(id),
    
    max_vehicles INT,
    max_drivers INT,
    billing_cycle ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY'),
    
    alert_thresholds JSONB, -- {speeding_threshold: 80, harsh_accel_g: 0.4, ...}
    geofence_notification BOOLEAN DEFAULT TRUE,
    
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.3 MongoDB (Flexible Document Storage)

```javascript
// Tenant/Fleet collection
db.fleets.insertOne({
    _id: ObjectId(),
    name: "FastLogistics Inc",
    industry: "ECOMMERCE",
    subscription_tier: "ENTERPRISE",
    
    api_keys: ["key_xxxxx"],
    webhooks: [
        { event: "delivery.completed", url: "https://..." }
    ],
    
    custom_fields: {
        custom_alert_rules: [...]
    },
    
    created_at: new Date()
})

// Alert configurations per fleet
db.alert_configs.insertOne({
    _id: ObjectId(),
    fleet_id: "fleet-uuid",
    
    rules: [
        {
            name: "Speeding Alert",
            condition: { speed: { $gt: 80 } },
            severity: "WARNING",
            notification_channels: ["sms", "email", "push"]
        }
    ]
})

// Driver session logs
db.driver_sessions.insertOne({
    _id: ObjectId(),
    driver_id: "driver-uuid",
    vehicle_id: "vehicle-uuid",
    
    shift_start: new Date(),
    shift_end: new Date(),
    
    behavioral_events: [
        {
            event_type: "HARSH_ACCELERATION",
            timestamp: new Date(),
            location: { lat: 28.123, lng: 77.456 },
            severity: "WARNING"
        }
    ],
    
    shift_summary: {
        total_distance_km: 156.3,
        total_duration_hours: 8.5,
        harsh_events_count: 3,
        safety_score: 92
    }
})
```

---

## 6. CORE MICROSERVICES & APIs

### 6.1 Node.js Express API Gateway

**Responsibilities:**
- Request routing and authentication
- Rate limiting and quotas
- WebSocket connection management
- API versioning
- Request/response logging

```javascript
// Minimal, production-grade structure
// api-gateway/src/server.ts

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { validateApiKey, validateTenant } from './middleware/auth';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: process.env.FRONTEND_URL },
  adapter: require('socket.io-redis'), // Redis adapter for multi-instance
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: (req) => {
    const tier = req.tenantTier; // STARTER: 100, PRO: 1000, ENTERPRISE: 10000
    return tier === 'ENTERPRISE' ? 10000 : tier === 'PRO' ? 1000 : 100;
  },
  keyGenerator: (req) => req.tenantId, // Per-tenant rate limiting
  store: new RedisStore(), // Use Redis for distributed rate limiting
});

app.use('/api/', limiter);

// Authentication middleware
app.use(validateApiKey);
app.use(validateTenant);

// Route handlers
app.use('/api/v1/telemetry', require('./routes/telemetry'));
app.use('/api/v1/vehicles', require('./routes/vehicles'));
app.use('/api/v1/routes', require('./routes/routes'));
app.use('/api/v1/shipments', require('./routes/shipments'));
app.use('/api/v1/drivers', require('./routes/drivers'));
app.use('/api/v1/analytics', require('./routes/analytics'));
app.use('/api/v1/alerts', require('./routes/alerts'));

// WebSocket handlers
io.on('connection', (socket) => {
  const { vehicleId, tenantId } = socket.handshake.auth;
  
  // Subscribe to vehicle tracking room
  socket.join(`vehicle:${vehicleId}:tracking`);
  
  socket.on('subscribe_vehicle', (vid) => {
    socket.join(`vehicle:${vid}:tracking`);
  });
  
  socket.on('unsubscribe_vehicle', (vid) => {
    socket.leave(`vehicle:${vid}:tracking`);
  });
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message,
    requestId: req.id
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
```

### 6.2 Telemetry Ingestion Service (Node.js)

**High-throughput ingestion from IoT devices**

```javascript
// telemetry-service/src/ingestion.ts

import { Router } from 'express';
import { kafka } from '../infrastructure/kafka';
import { redis } from '../infrastructure/redis';
import { db } from '../infrastructure/database';

const router = Router();

// Ingest GPS and sensor data
router.post('/gps', async (req, res) => {
  const { vehicleId, tenantId, data } = req.body;
  
  try {
    const { latitude, longitude, speed, heading, timestamp } = data;
    
    // Validation
    if (!isValidGPS(latitude, longitude)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }
    
    // 1. Store to Kafka for stream processing
    await kafka.producer.send({
      topic: 'vehicle-telemetry',
      messages: [
        {
          key: vehicleId,
          value: JSON.stringify({
            vehicleId,
            tenantId,
            timestamp,
            latitude,
            longitude,
            speed,
            heading,
            ...data
          }),
          partition: hashVehicleId(vehicleId), // Same vehicle to same partition
        },
      ],
    });
    
    // 2. Update Redis cache (current position)
    await redis.set(
      `vehicle:${vehicleId}:location`,
      JSON.stringify({ latitude, longitude, speed, timestamp }),
      'EX',
      300 // 5 min TTL
    );
    
    // 3. Broadcast to WebSocket subscribers
    io.to(`vehicle:${vehicleId}:tracking`).emit('location_update', {
      vehicleId,
      latitude,
      longitude,
      speed,
      heading,
      timestamp,
    });
    
    // 4. Async: Write to TimescaleDB (batch insert)
    // Batching handled by separate worker to reduce latency
    await redis.lpush(`telemetry:batch:${tenantId}`, JSON.stringify({
      vehicleId,
      ...data,
      timestamp
    }));
    
    res.json({ success: true, messageId: req.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ingestion failed' });
  }
});

// Batch write to TimescaleDB (runs every 5 seconds)
setInterval(async () => {
  const tenants = await redis.keys('telemetry:batch:*');
  
  for (const tenantKey of tenants) {
    const tenantId = tenantKey.split(':')[2];
    const records = await redis.lrange(tenantKey, 0, -1);
    
    if (records.length === 0) continue;
    
    await db.query(
      `INSERT INTO vehicle_telemetry 
       (time, vehicle_id, latitude, longitude, speed, heading, tenant_id, ...)
       VALUES ${records.map((_, i) => `($${i * 10 + 1}, ...)`).join(',')}`,
      records.flatMap(r => Object.values(JSON.parse(r)))
    );
    
    await redis.del(tenantKey);
  }
}, 5000);

export default router;
```

### 6.3 Route Optimization Service (Python + FastAPI)

**Core optimization logic**

```python
# route-service/src/optimizer.py

from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import asyncio
from datetime import datetime

import ortools.routing.enums as routing_enums
from ortools.routing.routing_index_manager import RoutingIndexManager
from ortools.routing.routing_model import RoutingModel
import numpy as np
from sqlalchemy import create_engine, text
from redis import Redis
import aiohttp

app = FastAPI()
db_engine = create_engine(os.getenv('DATABASE_URL'))
redis_client = Redis.from_url(os.getenv('REDIS_URL'))

class RouteOptimizationRequest(BaseModel):
    fleet_id: str
    vehicle_ids: List[str]
    delivery_locations: List[dict]  # {id, lat, lng, time_window, demand}
    depot_lat: float
    depot_lng: float
    constraints: dict  # max_distance, max_duration, max_stops

class RouteOptimizationResult(BaseModel):
    optimized_routes: List[dict]
    total_distance: float
    total_duration: float
    optimization_score: float

@app.post("/optimize", response_model=RouteOptimizationResult)
async def optimize_routes(request: RouteOptimizationRequest, bg_tasks: BackgroundTasks):
    """Optimize multi-vehicle routing with constraints"""
    
    job_id = str(uuid.uuid4())
    
    # Store job status
    await redis_client.setex(f"job:{job_id}", 3600, json.dumps({
        "status": "processing",
        "created_at": datetime.utcnow().isoformat()
    }))
    
    # Process async
    bg_tasks.add_task(run_optimization, request, job_id)
    
    return {"job_id": job_id, "status": "processing"}

async def run_optimization(request: RouteOptimizationRequest, job_id: str):
    """Heavy computation in background"""
    
    try:
        # 1. Fetch distance/duration matrix from OSRM or Google Maps
        distance_matrix = await fetch_distance_matrix(
            [{"lat": request.depot_lat, "lng": request.depot_lng}] + 
            request.delivery_locations
        )
        
        # 2. Setup OR-Tools VRP
        manager = RoutingIndexManager(
            len(request.delivery_locations) + 1,
            len(request.vehicle_ids),
            0  # depot index
        )
        
        routing = RoutingModel(manager)
        
        # Distance callback
        def distance_callback(from_index, to_index):
            return distance_matrix[manager.IndexToNode(from_index)][manager.IndexToNode(to_index)]
        
        transit_callback_index = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
        
        # Add capacity dimension
        routing.AddDimension(
            transit_callback_index,
            0,  # slack
            request.constraints.get('max_distance_km', 500) * 1000,
            True,
            'distance'
        )
        
        # Add time dimension for time windows
        time_callback_index = routing.RegisterTransitCallback(
            lambda f, t: distance_matrix[manager.IndexToNode(f)][manager.IndexToNode(t)] / 50  # Speed: 50 km/h
        )
        
        routing.AddDimension(
            time_callback_index,
            0,
            request.constraints.get('max_duration_minutes', 600) * 60,
            True,
            'time'
        )
        
        # Add time window constraints
        for i, location in enumerate(request.delivery_locations):
            if location.get('time_window'):
                index = manager.NodeToIndex(i + 1)
                tw_start, tw_end = location['time_window']
                routing.CumulVar('time', index).SetRange(tw_start * 60, tw_end * 60)
        
        # Solve
        search_parameters = routing.DefaultSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums.FirstSolutionStrategy.AUTOMATIC
        )
        search_parameters.local_search_metaheuristic = (
            routing_enums.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
        )
        search_parameters.time_limit.seconds = 30  # 30 sec max solve time
        
        solution = routing.SolveFromAssignmentWithParameters(
            initial_assignment,
            search_parameters
        )
        
        # 3. Extract solution
        routes = []
        total_distance = 0
        
        for vehicle_id in range(len(request.vehicle_ids)):
            route = []
            index = routing.Start(vehicle_id)
            
            while not routing.IsEnd(index):
                node = manager.IndexToNode(index)
                route.append({
                    "location_id": request.delivery_locations[node - 1]['id'] if node > 0 else 'depot',
                    "sequence": len(route),
                })
                index = solution.Value(routing.NextVar(index))
            
            if len(route) > 1:  # Only include routes with deliveries
                routes.append({
                    "vehicle_id": request.vehicle_ids[vehicle_id],
                    "stops": route,
                    "distance": solution.RouteDistance(vehicle_id),
                    "duration": solution.RouteDurationValue(vehicle_id),
                })
                total_distance += solution.RouteDistance(vehicle_id)
        
        # 4. Save to database
        async with db_engine.connect() as conn:
            conn.execute(text("""
                INSERT INTO routes (fleet_id, vehicle_id, route_json, optimization_score, status)
                VALUES (:fleet_id, :vehicle_id, :route_json, :score, 'PLANNED')
            """), [
                {
                    "fleet_id": request.fleet_id,
                    "vehicle_id": r["vehicle_id"],
                    "route_json": json.dumps(r),
                    "score": calculate_optimization_score(r)
                }
                for r in routes
            ])
        
        # 5. Update job status
        await redis_client.setex(f"job:{job_id}", 3600, json.dumps({
            "status": "completed",
            "routes": routes,
            "total_distance": total_distance,
            "timestamp": datetime.utcnow().isoformat()
        }))
        
    except Exception as e:
        await redis_client.setex(f"job:{job_id}", 3600, json.dumps({
            "status": "failed",
            "error": str(e)
        }))

@app.post("/reoptimize/{route_id}")
async def reoptimize_route(route_id: str, bg_tasks: BackgroundTasks):
    """Real-time re-optimization based on current vehicle positions and new deliveries"""
    
    job_id = str(uuid.uuid4())
    bg_tasks.add_task(run_reoptimization, route_id, job_id)
    
    return {"job_id": job_id}

async def run_reoptimization(route_id: str, job_id: str):
    """Reoptimize active route with new deliveries/traffic"""
    
    # Fetch active route and current vehicle position
    # Fetch new deliveries added since route start
    # Fetch traffic-adjusted distance matrix
    # Re-run optimization with remaining stops
    # Broadcast new route to vehicle via WebSocket
    pass

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)
```

### 6.4 Predictive Maintenance Service (Python)

```python
# maintenance-service/src/predictor.py

from fastapi import FastAPI
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import asyncio
from datetime import datetime, timedelta

app = FastAPI()

# Load pre-trained models
maintenance_model = joblib.load('models/maintenance_predictor.pkl')
scaler = joblib.load('models/scaler.pkl')

class MaintenancePrediction(BaseModel):
    vehicle_id: str
    predicted_failure_date: datetime
    risk_score: float  # 0-100
    recommended_service: str
    confidence: float

@app.post("/predict/{vehicle_id}", response_model=MaintenancePrediction)
async def predict_maintenance(vehicle_id: str):
    """Predict maintenance needs based on vehicle health metrics"""
    
    # Fetch recent OBD-II data
    obd_data = await fetch_recent_obd_data(vehicle_id, days=30)
    
    # Extract features
    features = extract_features(obd_data)
    features_scaled = scaler.transform([features])
    
    # Predict
    risk_score = maintenance_model.predict_proba(features_scaled)[0][1] * 100
    
    # Map risk to service type and timeline
    if risk_score > 75:
        service_type = "URGENT_INSPECTION"
        days_to_failure = 3
    elif risk_score > 50:
        service_type = "SCHEDULED_SERVICE"
        days_to_failure = 14
    else:
        service_type = "ROUTINE_MAINTENANCE"
        days_to_failure = 30
    
    predicted_failure = datetime.utcnow() + timedelta(days=days_to_failure)
    
    # Save prediction to database
    await save_maintenance_prediction({
        "vehicle_id": vehicle_id,
        "risk_score": risk_score,
        "predicted_failure_date": predicted_failure,
        "service_type": service_type
    })
    
    # Trigger alert if high risk
    if risk_score > 70:
        await create_alert({
            "vehicle_id": vehicle_id,
            "alert_type": "MAINTENANCE_CRITICAL",
            "message": f"Urgent maintenance needed in {days_to_failure} days"
        })
    
    return MaintenancePrediction(
        vehicle_id=vehicle_id,
        predicted_failure_date=predicted_failure,
        risk_score=risk_score,
        recommended_service=service_type,
        confidence=0.92
    )

@app.post("/anomaly-detect")
async def detect_obd_anomalies():
    """Real-time anomaly detection on OBD data streams"""
    
    # Subscribe to Kafka topic
    async for message in kafka_consumer.subscribe(['obd-data']):
        obd_data = json.loads(message.value)
        
        # Isolation Forest for multivariate anomaly detection
        is_anomaly = isolation_forest.predict([extract_features(obd_data)]) == -1
        
        if is_anomaly:
            await create_alert({
                "vehicle_id": obd_data['vehicle_id'],
                "alert_type": "OBD_ANOMALY",
                "severity": "WARNING",
                "data": obd_data
            })
```

### 6.5 Analytics & Reporting Service (Python)

```python
# analytics-service/src/analytics.py

from fastapi import FastAPI
import pandas as pd
from sqlalchemy import create_engine, text
from datetime import datetime, timedelta

app = FastAPI()
db_engine = create_engine(os.getenv('DATABASE_URL'))

class FleetAnalytics(BaseModel):
    total_vehicles: int
    active_vehicles: int
    avg_utilization: float
    on_time_delivery_rate: float
    avg_cost_per_km: float
    total_distance_km: float
    avg_fuel_efficiency: float
    avg_safety_score: float

@app.get("/fleet-overview/{fleet_id}", response_model=FleetAnalytics)
async def get_fleet_overview(fleet_id: str, days: int = 30):
    """Real-time fleet KPI dashboard"""
    
    query = text("""
        SELECT
            COUNT(DISTINCT v.id) as total_vehicles,
            COUNT(DISTINCT CASE WHEN v.status = 'ACTIVE' THEN v.id END) as active_vehicles,
            AVG(EXTRACT(EPOCH FROM (r.actual_end_time - r.actual_start_time)) / 
                EXTRACT(EPOCH FROM (r.planned_end_time - r.planned_start_time))) as utilization,
            
            SUM(CASE WHEN r.actual_end_time <= r.planned_end_time THEN 1 ELSE 0 END)::float / 
            COUNT(r.id) as on_time_rate,
            
            AVG((r.cost / r.actual_distance_km)) as cost_per_km,
            SUM(r.actual_distance_km) as total_distance,
            
            AVG(100.0 / SUM(1 + harsh_events_count) OVER (PARTITION BY d.id)) as avg_safety_score
        
        FROM vehicles v
        LEFT JOIN routes r ON v.id = r.vehicle_id AND r.created_at > NOW() - INTERVAL '{days} days'
        LEFT JOIN drivers d ON v.assigned_driver_id = d.id
        WHERE v.fleet_id = :fleet_id
        GROUP BY v.fleet_id
    """)
    
    result = await db_engine.execute(query, {"fleet_id": fleet_id})
    row = result.fetchone()
    
    return FleetAnalytics(
        total_vehicles=row.total_vehicles,
        active_vehicles=row.active_vehicles,
        avg_utilization=row.utilization * 100,
        on_time_delivery_rate=row.on_time_rate * 100,
        avg_cost_per_km=row.cost_per_km,
        total_distance_km=row.total_distance,
        avg_fuel_efficiency=calculate_fuel_efficiency(fleet_id, days),
        avg_safety_score=row.avg_safety_score
    )

@app.post("/custom-report")
async def generate_custom_report(report_config: dict):
    """Generate custom reports with flexible metrics"""
    
    # Build dynamic SQL based on report_config
    metrics = report_config.get('metrics', ['distance', 'cost', 'on_time_rate'])
    group_by = report_config.get('group_by', 'day')  # day, week, month, vehicle
    filters = report_config.get('filters', {})
    
    sql = build_dynamic_sql(metrics, group_by, filters)
    
    df = pd.read_sql(sql, db_engine)
    
    # Generate report (PDF, CSV, Excel)
    report_format = report_config.get('format', 'pdf')
    report_buffer = generate_report_file(df, report_format)
    
    # Store and return
    report_url = await upload_to_s3(report_buffer, f"reports/{uuid.uuid4()}.{report_format}")
    
    return {"report_url": report_url, "rows": len(df)}
```

---

## 7. REAL-TIME COMMUNICATION ARCHITECTURE

### 7.1 WebSocket Event Streaming

**Events flowing through WebSocket:**
- Vehicle GPS updates
- Alert notifications
- Route updates
- Driver behavior events
- Shipment status changes

```javascript
// WebSocket event payload structure
{
  "event": "vehicle.location_updated",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "data": {
    "vehicleId": "vehicle-uuid",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "speed": 45.2,
    "heading": 125,
    "accuracy": 8.5
  },
  "metadata": {
    "tenantId": "fleet-uuid",
    "source": "gps-device"
  }
}
```

### 7.2 Kafka Event Streaming (Internal)

**Topics:**
- `vehicle-telemetry` - All GPS/sensor data (high volume)
- `obd-data` - OBD-II fault codes
- `route-events` - Route status changes
- `delivery-events` - Shipment status updates
- `alerts` - System alerts
- `driver-behavior` - Safety events

```javascript
// Kafka consumer for stream processing
const kafka = new Kafka({
  clientId: 'fleet-processor',
  brokers: ['kafka-broker-1:9092', 'kafka-broker-2:9092'],
});

const consumer = kafka.consumer({ groupId: 'fleet-analytics-group' });

await consumer.subscribe({ 
  topics: ['vehicle-telemetry', 'driver-behavior'],
  fromBeginning: true 
});

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    const event = JSON.parse(message.value.toString());
    
    if (topic === 'vehicle-telemetry') {
      // Real-time analytics
      await updateVehicleLocationCache(event);
      
      // Check geofence violations
      const violation = await checkGeofenceViolation(event);
      if (violation) {
        await kafka.producer.send({
          topic: 'alerts',
          messages: [{
            value: JSON.stringify({
              type: 'GEOFENCE_VIOLATION',
              vehicleId: event.vehicleId,
              timestamp: new Date()
            })
          }]
        });
      }
    }
  }
});
```

---

## 8. DEPLOYMENT & INFRASTRUCTURE

### 8.1 Kubernetes Deployment

```yaml
# kubernetes/api-gateway-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: fleet-system/api-gateway:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: redis-config
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
# Route Optimization Service
apiVersion: apps/v1
kind: Deployment
metadata:
  name: route-optimizer
spec:
  replicas: 2
  selector:
    matchLabels:
      app: route-optimizer
  template:
    metadata:
      labels:
        app: route-optimizer
    spec:
      containers:
      - name: optimizer
        image: fleet-system/route-optimizer:latest
        ports:
        - containerPort: 5001
        resources:
          requests:
            memory: "1Gi"
            cpu: "1"
          limits:
            memory: "2Gi"
            cpu: "2"

---
# HPA for API Gateway
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 8.2 Database Scalability Strategy

**Write Scaling:**
- Kafka as write buffer for high-volume telemetry
- Async batch writes to TimescaleDB (5-second batches)
- TimescaleDB partitioning by time (1-day chunks)
- Hypertables for automatic compression of old data

**Read Scaling:**
- Redis cache for "current position" queries
- Read replicas for historical data queries
- Elasticsearch for complex log searches
- Materialized views for common aggregations

**Compression Strategy:**
```sql
-- Compress data older than 7 days
SELECT add_compression_policy('vehicle_telemetry', INTERVAL '7 days');

-- Continuous aggregates for performance
CREATE MATERIALIZED VIEW vehicle_hourly_metrics AS
SELECT 
  time_bucket('1 hour', time) as bucket,
  vehicle_id,
  AVG(speed) as avg_speed,
  MAX(speed) as max_speed,
  COUNT(*) as record_count
FROM vehicle_telemetry
GROUP BY bucket, vehicle_id
WITH DATA;
```

---

## 9. SECURITY ARCHITECTURE

### 9.1 API Authentication & Authorization

```javascript
// JWT-based multi-tenant security
import jwt from 'jsonwebtoken';

const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) return res.status(401).json({ error: 'Missing API key' });
  
  // Fetch fleet config from cache
  const fleetConfig = cache.get(`api-key:${apiKey}`);
  if (!fleetConfig) return res.status(401).json({ error: 'Invalid API key' });
  
  req.fleetId = fleetConfig.fleet_id;
  req.tenantTier = fleetConfig.tier;
  next();
};

const generateAuthToken = (fleetId, userId, permissions = []) => {
  return jwt.sign(
    {
      fleetId,
      userId,
      permissions,
      iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    },
    process.env.JWT_SECRET,
    { algorithm: 'HS256' }
  );
};
```

### 9.2 Data Encryption

- TLS 1.3 for all API communication
- AES-256-GCM for sensitive data at rest
- End-to-end encryption for driver communications
- Encrypted backups to S3

### 9.3 Multi-Tenant Data Isolation

```sql
-- Row-Level Security (RLS) Policy
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY vehicles_tenant_isolation ON vehicles
  USING (fleet_id = current_setting('app.current_tenant')::UUID);

-- Every query automatically filtered by tenant
SET app.current_tenant = '12345-fleet-uuid';
SELECT * FROM vehicles; -- Only returns vehicles for this fleet
```

---

## 10. MONITORING & OBSERVABILITY

### 10.1 Metrics Collection

```javascript
// Prometheus metrics
import prometheus from 'prom-client';

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  buckets: [100, 500, 1000, 2000, 5000]
});

const kafkaConsumerLag = new prometheus.Gauge({
  name: 'kafka_consumer_lag',
  help: 'Lag of Kafka consumers',
  labelNames: ['topic', 'partition']
});

const websocketConnections = new prometheus.Gauge({
  name: 'websocket_active_connections',
  help: 'Active WebSocket connections',
  labelNames: ['type']
});
```

### 10.2 Distributed Tracing

```javascript
// Jaeger/OpenTelemetry integration
import { NodeTracerProvider } from '@opentelemetry/node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const jaegerExporter = new JaegerExporter({
  serviceName: 'fleet-api-gateway',
  host: process.env.JAEGER_HOST,
  port: 6831,
});

const tracerProvider = new NodeTracerProvider();
tracerProvider.addSpanProcessor(
  new SimpleSpanProcessor(jaegerExporter)
);
```

### 10.3 Alerting Strategy

**Critical Alerts:**
- API latency > 1 second (p99)
- Database connection pool exhausted
- Kafka consumer lag > 10 minutes
- WebSocket disconnection rate > 5%
- Telemetry ingestion drop > 10%

---

## 11. IMPLEMENTATION ROADMAP

### Phase 1: MVP (Weeks 1-4)
- ✅ API Gateway + authentication
- ✅ Telemetry ingestion (GPS, basic OBD)
- ✅ Vehicle and driver CRUD endpoints
- ✅ Real-time WebSocket for tracking
- ✅ Basic route assignment (no optimization)
- ✅ Alert engine (geofence, speeding)

### Phase 2: Core Features (Weeks 5-8)
- ✅ Route optimization (OR-Tools integration)
- ✅ Predictive maintenance (ML models)
- ✅ Fuel monitoring and anomaly detection
- ✅ Shipment tracking with ePOD
- ✅ Driver behavior scoring
- ✅ Analytics dashboards

### Phase 3: Advanced Features (Weeks 9-12)
- ✅ Dynamic pricing/demand forecasting
- ✅ Carbon footprint tracking
- ✅ Multi-tenant billing system
- ✅ Mobile edge computing support
- ✅ Advanced anomaly detection
- ✅ Custom report builder

### Phase 4: Scale & Optimization (Weeks 13+)
- ✅ Kubernetes/multi-region deployment
- ✅ Performance optimization (caching, compression)
- ✅ Advanced ML models (failure prediction)
- ✅ Autonomous fleet integration hooks
- ✅ Third-party integrations (ERP, accounting)

---

## 12. KEY PERFORMANCE INDICATORS (KPIs)

**System Level:**
- API latency (p99): < 200ms
- WebSocket latency: < 100ms
- Telemetry ingestion throughput: > 100K events/sec
- Data freshness: < 5 seconds for live tracking
- System availability: 99.95% (44 min/month downtime)

**Business Level:**
- Route optimization savings: 15-20% reduction in distance/cost
- On-time delivery improvement: +5-10%
- Fuel efficiency gain: 8-12% reduction in consumption
- Maintenance cost reduction: 20-25% through predictive scheduling
- Driver safety improvement: 30% reduction in harsh events

---

## 13. TESTING STRATEGY

### 13.1 Load Testing

```bash
# Telemetry ingestion load test (100K vehicles, 1 Hz)
# Tools: K6/Locust

import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '5m', target: 100000 }, // Ramp up
    { duration: '10m', target: 100000 }, // Stay at peak
    { duration: '5m', target: 0 }, // Ramp down
  ],
};

export default function () {
  const payload = {
    vehicleId: `vehicle-${__VU}`,
    latitude: 28.6139 + Math.random() * 0.1,
    longitude: 77.2090 + Math.random() * 0.1,
    speed: Math.random() * 100,
    timestamp: new Date().toISOString()
  };
  
  const response = http.post('http://localhost:3000/api/v1/telemetry/gps', 
    JSON.stringify(payload)
  );
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'latency < 100ms': (r) => r.timings.duration < 100,
  });
}
```

### 13.2 Unit & Integration Testing

```javascript
// Jest test suite
describe('Route Optimizer', () => {
  it('should optimize route with time windows', async () => {
    const request = {
      vehicle_ids: ['v1', 'v2'],
      deliveries: [
        { id: 'd1', lat: 28.61, lng: 77.20, time_window: [9, 12] },
        { id: 'd2', lat: 28.62, lng: 77.21, time_window: [14, 16] }
      ]
    };
    
    const result = await optimizer.optimize(request);
    
    expect(result.routes).toHaveLength(2);
    expect(result.routes[0].distance).toBeLessThan(50);
    expect(result.optimization_score).toBeGreaterThan(80);
  });
});
```

---

## 14. COST ESTIMATION

**Monthly Infrastructure Costs (100 vehicles, 1000 deliveries/day):**

| Component | Monthly Cost | Notes |
|-----------|------------|-------|
| AWS RDS (TimescaleDB) | $500-800 | db.t3.large instances, 2 replicas |
| ElastiCache (Redis) | $150-300 | cache.r6g.xlarge |
| MSK (Managed Kafka) | $400-600 | 3 brokers, 500GB storage |
| EKS (Kubernetes) | $300 | Cluster management only |
| EC2 (Compute) | $1500-2000 | API Gateway, Services, Workers |
| S3/Data Transfer | $200-400 | Telemetry + report storage |
| CloudFront CDN | $100-200 | Content distribution |
| **Total** | **$3200-4300** | Scales linearly with vehicle count |

---

## 15. CONCLUSION & SUCCESS CRITERIA

**This PRD provides:**
1. ✅ Enterprise-grade architecture with proven patterns
2. ✅ Minimal but advanced code examples from senior engineers
3. ✅ Scalability to 10,000+ vehicles per instance
4. ✅ Real-time capabilities (<5s data latency)
5. ✅ ML/AI integration for predictions
6. ✅ Multi-tenant SaaS-ready design
7. ✅ Security & compliance framework
8. ✅ Operational excellence (observability, monitoring)

**Success is achieved when:**
- System handles 100K+ telemetry events/second
- Route optimization runs in < 30 seconds
- API p99 latency stays < 200ms under load
- WebSocket connections scale to 100K+
- Predictive maintenance accuracy > 85%
- On-time delivery improves by 10%+
