# Smart Fleet Management System - Frontend PRD
## Complete Web & Mobile UI/UX Design & Implementation

---

## 1. EXECUTIVE SUMMARY

**Platform:** React.js (Web) + React Native (iOS/Android)  
**Design Language:** Minimalist Futuristic with Real-time Data Visualization  
**Color Palette:** Light backgrounds with neon/accent highlights  
**Target:** Fleet managers, dispatchers, drivers, executives, customers  
**Performance Target:** <100ms interaction latency, 60 FPS animations

---

## 2. DESIGN SYSTEM

### 2.1 Color Palette (Modern & Futuristic)

```css
/* Primary Colors */
--color-bg-primary: #f8f9fa;        /* Off-white background */
--color-bg-secondary: #ffffff;      /* Pure white for cards */
--color-bg-tertiary: #f0f2f5;       /* Subtle gray */

/* Accent Colors (Neon-inspired) */
--color-accent-primary: #00d9ff;    /* Cyan/Electric blue */
--color-accent-secondary: #7c3aed;  /* Vibrant purple */
--color-accent-tertiary: #10b981;   /* Emerald green */

/* Status Colors */
--color-success: #10b981;           /* Green - Active/Delivered */
--color-warning: #f59e0b;           /* Amber - Alerts/Delays */
--color-danger: #ef4444;            /* Red - Critical/Failed */
--color-info: #3b82f6;              /* Blue - Information */

/* Neutrals */
--color-text-primary: #1f2937;      /* Dark gray for text */
--color-text-secondary: #6b7280;    /* Medium gray for secondary text */
--color-text-tertiary: #9ca3af;     /* Light gray for hints */
--color-border: #e5e7eb;            /* Border color */

/* Dark mode variants */
--color-dark-bg: #0f172a;           /* Slate-900 */
--color-dark-card: #1e293b;         /* Slate-800 */
--color-dark-text: #e2e8f0;         /* Slate-200 */
```

### 2.2 Typography System

```css
/* Font Family */
--font-primary: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI";
--font-mono: "JetBrains Mono", "Courier New";

/* Font Sizes - Modular Scale (1.125x) */
--text-xs: 0.75rem;         /* 12px */
--text-sm: 0.875rem;        /* 14px */
--text-base: 1rem;          /* 16px */
--text-lg: 1.125rem;        /* 18px */
--text-xl: 1.25rem;         /* 20px */
--text-2xl: 1.5rem;         /* 24px */
--text-3xl: 2rem;           /* 32px */
--text-4xl: 2.5rem;         /* 40px */

/* Font Weights */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--lh-tight: 1.25;
--lh-normal: 1.5;
--lh-relaxed: 1.75;
```

### 2.3 Spacing System

```css
/* Consistent spacing scale (4px base) */
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### 2.4 Shadows & Elevation

```css
/* Depth system */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-glow: 0 0 20px 0 rgba(0, 217, 255, 0.3);
--shadow-glow-purple: 0 0 20px 0 rgba(124, 58, 237, 0.3);
```

### 2.5 Border Radius (Consistent Curves)

```css
--rounded-xs: 0.25rem;    /* 4px - Subtle */
--rounded-sm: 0.375rem;   /* 6px */
--rounded-md: 0.5rem;     /* 8px - Default */
--rounded-lg: 0.75rem;    /* 12px - Cards */
--rounded-xl: 1rem;       /* 16px - Large elements */
--rounded-2xl: 1.5rem;    /* 24px - Extra large */
--rounded-full: 9999px;   /* Circles */
```

### 2.6 Animation & Transitions

```css
/* Micro-interactions */
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-normal: 300ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);

/* Easing functions */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

---

## 3. WEB APPLICATION (React.js)

### 3.1 Project Structure

```
fleet-web/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── routes.tsx
│   │   └── theme.ts
│   ├── components/
│   │   ├── common/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopNav.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── Toast.tsx
│   │   ├── dashboard/
│   │   │   ├── FleetOverview.tsx
│   │   │   ├── VehicleMap.tsx
│   │   │   ├── RealtimeMetrics.tsx
│   │   │   └── AlertsPanel.tsx
│   │   ├── vehicles/
│   │   │   ├── VehicleList.tsx
│   │   │   ├── VehicleDetail.tsx
│   │   │   ├── VehicleHealth.tsx
│   │   │   └── MaintenanceScheduler.tsx
│   │   ├── routes/
│   │   │   ├── RouteOptimizer.tsx
│   │   │   ├── RouteList.tsx
│   │   │   ├── RouteVisualization.tsx
│   │   │   └── RouteDetails.tsx
│   │   ├── drivers/
│   │   │   ├── DriverList.tsx
│   │   │   ├── DriverProfile.tsx
│   │   │   ├── SafetyScorecard.tsx
│   │   │   └── BehaviorAnalytics.tsx
│   │   ├── shipments/
│   │   │   ├── ShipmentTracking.tsx
│   │   │   ├── ShipmentList.tsx
│   │   │   ├── DeliveryProof.tsx
│   │   │   └── ExceptionHandler.tsx
│   │   └── analytics/
│   │       ├── DashboardMetrics.tsx
│   │       ├── FuelAnalytics.tsx
│   │       ├── CostAnalytics.tsx
│   │       ├── PerformanceReports.tsx
│   │       └── CustomReportBuilder.tsx
│   ├── hooks/
│   │   ├── useWebSocket.ts
│   │   ├── useRealtime.ts
│   │   ├── useLocationTracking.ts
│   │   ├── useFetch.ts
│   │   └── useLocalStorage.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── websocket.ts
│   │   ├── analytics.ts
│   │   ├── mapService.ts
│   │   └── notificationService.ts
│   ├── store/
│   │   ├── slices/
│   │   │   ├── vehiclesSlice.ts
│   │   │   ├── routesSlice.ts
│   │   │   ├── driversSlice.ts
│   │   │   ├── shipmentsSlice.ts
│   │   │   ├── alertsSlice.ts
│   │   │   └── userSlice.ts
│   │   └── store.ts
│   ├── styles/
│   │   ├── globals.css
│   │   ├── animations.css
│   │   ├── utilities.css
│   │   └── variables.css
│   ├── types/
│   │   ├── vehicle.ts
│   │   ├── route.ts
│   │   ├── driver.ts
│   │   ├── shipment.ts
│   │   ├── alert.ts
│   │   └── api.ts
│   └── utils/
│       ├── formatters.ts
│       ├── validators.ts
│       ├── calculations.ts
│       └── constants.ts
├── public/
├── package.json
└── tailwind.config.ts
```

### 3.2 Core Technologies & Setup

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "@reduxjs/toolkit": "^1.9.7",
    "react-redux": "^8.1.3",
    "react-router-dom": "^6.20.0",
    "socket.io-client": "^4.7.0",
    "axios": "^1.6.0",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.0",
    "recharts": "^2.10.0",
    "date-fns": "^2.30.0",
    "zustand": "^4.4.0",
    "framer-motion": "^10.16.0",
    "react-hot-toast": "^2.4.1",
    "react-icons": "^4.13.0",
    "geolocation-utils": "^1.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "postcss-nesting": "^12.0.0",
    "eslint": "^8.55.0",
    "@typescript-eslint/eslint-plugin": "^6.16.0"
  }
}
```

### 3.3 Tailwind Configuration (Custom Theme)

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#00d9ff', // Primary cyan
          600: '#00b8d4',
          700: '#0088a3',
          800: '#005f73',
          900: '#003d4d',
        },
        // Accent purple
        accent: {
          50: '#faf5ff',
          500: '#7c3aed',
          600: '#7024ca',
          700: '#6419a6',
        },
        // Status colors
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          info: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
      spacing: {
        'px': '1px',
        '0': '0',
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '6': '1.5rem',
        '8': '2rem',
        '12': '3rem',
        '16': '4rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px 0 rgba(0, 217, 255, 0.3)',
        'glow-purple': '0 0 20px 0 rgba(124, 58, 237, 0.3)',
      },
      borderRadius: {
        'xs': '0.25rem',
        'sm': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-in': {
          'from': { transform: 'translateX(-100%)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
} satisfies Config;
```

---

## 4. PAGE LAYOUTS & SCREEN DESIGNS

### 4.1 Dashboard - Fleet Overview (Main Hub)

**Purpose:** Real-time fleet status at a glance  
**Ideal For:** Fleet managers, executives

```typescript
// src/pages/Dashboard.tsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useWebSocket } from '@/hooks/useWebSocket';
import FleetOverview from '@/components/dashboard/FleetOverview';
import VehicleMap from '@/components/dashboard/VehicleMap';
import RealtimeMetrics from '@/components/dashboard/RealtimeMetrics';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import { fetchFleetMetrics } from '@/store/slices/vehiclesSlice';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { metrics, loading } = useSelector((state: any) => state.vehicles);
  
  // Real-time WebSocket subscription
  const { data: realtimeData } = useWebSocket('vehicle.tracking');
  
  useEffect(() => {
    dispatch(fetchFleetMetrics());
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchFleetMetrics());
    }, 30000);
    
    return () => clearInterval(interval);
  }, [dispatch]);
  
  if (loading) return <DashboardSkeleton />;
  
  return (
    <div className="grid grid-cols-12 gap-6 p-6 bg-slate-50 min-h-screen">
      {/* Top KPI Cards */}
      <div className="col-span-12">
        <RealtimeMetrics metrics={metrics} />
      </div>
      
      {/* Main Map - 2/3 width */}
      <div className="col-span-8">
        <Card className="h-96 overflow-hidden">
          <VehicleMap vehicles={realtimeData.vehicles} />
        </Card>
      </div>
      
      {/* Alerts Sidebar - 1/3 width */}
      <div className="col-span-4">
        <AlertsPanel alerts={realtimeData.alerts} />
      </div>
      
      {/* Fleet Stats Grid */}
      <div className="col-span-12">
        <FleetOverview metrics={metrics} />
      </div>
    </div>
  );
};

export default Dashboard;
```

**Component: RealtimeMetrics**

```typescript
// src/components/dashboard/RealtimeMetrics.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'react-icons/hi2';

interface Metric {
  label: string;
  value: number | string;
  unit: string;
  trend?: number;
  icon: React.ReactNode;
  color: 'cyan' | 'purple' | 'green' | 'amber';
}

const RealtimeMetrics: React.FC<{ metrics: Metric[] }> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {metrics.map((metric, idx) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className={`bg-white rounded-lg p-4 border border-${metric.color}-100 shadow-sm hover:shadow-md transition-shadow`}
        >
          {/* Icon with colored background */}
          <div className={`w-12 h-12 rounded-lg bg-${metric.color}-100 flex items-center justify-center mb-3`}>
            <span className={`text-${metric.color}-600`}>{metric.icon}</span>
          </div>
          
          {/* Metric Label */}
          <p className="text-sm font-medium text-slate-600 mb-1">{metric.label}</p>
          
          {/* Value with Trend */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-slate-900">
              {metric.value}
            </span>
            <span className="text-xs text-slate-500">{metric.unit}</span>
            
            {metric.trend !== undefined && (
              <motion.div
                className={`flex items-center gap-1 ml-auto ${
                  metric.trend >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {metric.trend >= 0 ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
                <span className="text-xs font-semibold">{Math.abs(metric.trend)}%</span>
              </motion.div>
            )}
          </div>
          
          {/* Live Indicator */}
          <div className="mt-3 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-slate-500">Live</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default RealtimeMetrics;
```

**Component: VehicleMap (Real-time Tracking)**

```typescript
// src/components/dashboard/VehicleMap.tsx
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Vehicle {
  id: string;
  latitude: number;
  longitude: number;
  speed: number;
  status: 'active' | 'idle' | 'offline';
  heading: number;
}

const VehicleMap: React.FC<{ vehicles: Vehicle[] }> = ({ vehicles }) => {
  const mapRef = useRef(null);
  
  // Custom vehicle marker icon
  const createVehicleIcon = (status: string, heading: number) => {
    const statusColor = {
      active: '#10b981',
      idle: '#f59e0b',
      offline: '#6b7280',
    }[status] || '#6b7280';
    
    return L.divIcon({
      html: `
        <div class="relative" style="transform: rotate(${heading}deg)">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" fill="${statusColor}" opacity="0.2"/>
            <path d="M16 8L20 18L16 16L12 18Z" fill="${statusColor}"/>
            <circle cx="16" cy="16" r="4" fill="${statusColor}"/>
          </svg>
        </div>
      `,
      className: 'vehicle-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };
  
  const bounds = vehicles.length > 0
    ? L.latLngBounds(vehicles.map(v => [v.latitude, v.longitude]))
    : L.latLngBounds([[28.5, 77.0], [28.7, 77.3]]);
  
  return (
    <MapContainer
      ref={mapRef}
      bounds={bounds}
      zoom={12}
      scrollWheelZoom={true}
      className="w-full h-full rounded-lg"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; CartoDB'
        maxZoom={19}
      />
      
      {/* Vehicle Markers */}
      {vehicles.map((vehicle) => (
        <Marker
          key={vehicle.id}
          position={[vehicle.latitude, vehicle.longitude]}
          icon={createVehicleIcon(vehicle.status, vehicle.heading)}
        >
          <Popup>
            <div className="font-sans text-sm">
              <p className="font-semibold">{vehicle.id}</p>
              <p className="text-gray-600">Speed: {vehicle.speed} km/h</p>
              <p className="text-gray-600">Status: {vehicle.status}</p>
            </div>
          </Popup>
          <Tooltip sticky>{vehicle.id}</Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default VehicleMap;
```

---

### 4.2 Vehicles - Fleet Management

**Purpose:** Manage all vehicles, health, maintenance  
**Ideal For:** Fleet managers, maintenance teams

```typescript
// src/pages/Vehicles/VehicleList.tsx
import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import VehicleCard from '@/components/vehicles/VehicleCard';
import VehicleFilters from '@/components/vehicles/VehicleFilters';
import { fetchVehicles } from '@/store/slices/vehiclesSlice';

const VehicleList: React.FC = () => {
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    sortBy: 'name',
  });
  
  const { vehicles, loading } = useSelector((state: any) => state.vehicles);
  const dispatch = useDispatch();
  
  React.useEffect(() => {
    dispatch(fetchVehicles());
  }, [dispatch]);
  
  // Filter and sort vehicles
  const filteredVehicles = useMemo(() => {
    let result = vehicles;
    
    if (filters.status !== 'all') {
      result = result.filter((v: any) => v.status === filters.status);
    }
    
    if (filters.search) {
      result = result.filter((v: any) =>
        v.vehicleNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        v.licensePlate.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    return result.sort((a: any, b: any) => {
      if (filters.sortBy === 'name') {
        return a.vehicleNumber.localeCompare(b.vehicleNumber);
      }
      return 0;
    });
  }, [vehicles, filters]);
  
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Fleet Vehicles</h1>
        <p className="text-slate-600">Manage and monitor all vehicles in your fleet</p>
      </div>
      
      {/* Filters */}
      <VehicleFilters filters={filters} onChange={setFilters} />
      
      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredVehicles.map((vehicle: any, idx: number) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: idx * 0.05 }}
            >
              <VehicleCard vehicle={vehicle} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VehicleList;
```

**Component: VehicleCard (Status Card)**

```typescript
// src/components/vehicles/VehicleCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Vehicle {
  id: string;
  vehicleNumber: string;
  status: 'active' | 'maintenance' | 'inactive';
  healthScore: number;
  lastLocation: string;
  maintenanceDue: boolean;
  fuelLevel: number;
}

const VehicleCard: React.FC<{ vehicle: Vehicle }> = ({ vehicle }) => {
  const statusConfig = {
    active: { bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500' },
    maintenance: { bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' },
    inactive: { bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-500' },
  };
  
  const config = statusConfig[vehicle.status];
  
  return (
    <Link to={`/vehicles/${vehicle.id}`}>
      <motion.div
        className={`${config.bg} border ${config.border} rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer overflow-hidden relative group`}
        whileHover={{ y: -4 }}
      >
        {/* Background Gradient Accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/0 via-transparent to-accent-500/0 group-hover:from-brand-500/5 group-hover:to-accent-500/5 transition-all" />
        
        {/* Content */}
        <div className="relative z-10">
          {/* Header with Status */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{vehicle.vehicleNumber}</h3>
              <p className="text-sm text-slate-600">{vehicle.lastLocation}</p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-white`}>
              <div className={`w-2 h-2 rounded-full ${config.dot}`} />
              <span className="text-xs font-medium text-slate-700 capitalize">{vehicle.status}</span>
            </div>
          </div>
          
          {/* Health Score */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-600">Health Score</span>
              <span className="text-sm font-semibold text-slate-900">{vehicle.healthScore}%</span>
            </div>
            <div className="w-full h-2 bg-white rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${vehicle.healthScore}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  vehicle.healthScore > 80 ? 'bg-green-500' :
                  vehicle.healthScore > 50 ? 'bg-amber-500' :
                  'bg-red-500'
                }`}
              />
            </div>
          </div>
          
          {/* Fuel & Alerts */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm">
              <p className="text-slate-600">Fuel Level</p>
              <p className="text-lg font-semibold text-slate-900">{vehicle.fuelLevel}%</p>
            </div>
            
            {vehicle.maintenanceDue && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 rounded-lg">
                <AlertCircle size={16} className="text-amber-600" />
                <span className="text-xs font-medium text-amber-600">Maintenance Due</span>
              </div>
            )}
          </div>
          
          {/* Action */}
          <div className="flex items-center gap-2 text-brand-600 font-medium text-sm group-hover:gap-3 transition-all">
            <span>View Details</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default VehicleCard;
```

---

### 4.3 Routes & Optimization

**Purpose:** View, optimize, and manage routes  
**Ideal For:** Dispatchers, planners

```typescript
// src/pages/Routes/RouteOptimizer.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import DeliveryForm from '@/components/routes/DeliveryForm';
import RouteVisualization from '@/components/routes/RouteVisualization';
import RouteStats from '@/components/routes/RouteStats';

const RouteOptimizer: React.FC = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [optimizedRoutes, setOptimizedRoutes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  
  const handleOptimize = async (params: any) => {
    setLoading(true);
    try {
      // Trigger optimization job
      const { data } = await axios.post('/api/v1/routes/optimize', params);
      setJobId(data.job_id);
      
      // Poll for results
      const pollInterval = setInterval(async () => {
        const jobStatus = await axios.get(`/api/v1/routes/optimize/${data.job_id}`);
        
        if (jobStatus.data.status === 'completed') {
          setOptimizedRoutes(jobStatus.data.routes);
          setLoading(false);
          clearInterval(pollInterval);
        } else if (jobStatus.data.status === 'failed') {
          setLoading(false);
          clearInterval(pollInterval);
          // Handle error
        }
      }, 1000);
    } catch (error) {
      setLoading(false);
      console.error('Optimization failed:', error);
    }
  };
  
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Route Optimizer</h1>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Form Section */}
        <div className="col-span-4">
          <DeliveryForm
            onOptimize={handleOptimize}
            loading={loading}
          />
        </div>
        
        {/* Results Section */}
        {optimizedRoutes && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-8"
          >
            <div className="grid grid-cols-12 gap-6">
              {/* Stats */}
              <div className="col-span-12">
                <RouteStats routes={optimizedRoutes} />
              </div>
              
              {/* Map Visualization */}
              <div className="col-span-12">
                <div className="bg-white rounded-lg overflow-hidden shadow-md h-96">
                  <RouteVisualization routes={optimizedRoutes} />
                </div>
              </div>
              
              {/* Route List */}
              <div className="col-span-12">
                <RouteDetailsList routes={optimizedRoutes} />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RouteOptimizer;
```

---

### 4.4 Real-time Driver Behavior Monitoring

**Purpose:** Track driver safety, behavior, performance  
**Ideal For:** Operations managers, safety officers

```typescript
// src/pages/Drivers/DriverMonitoring.tsx
import React, { useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import DriverLeaderboard from '@/components/drivers/DriverLeaderboard';
import BehaviorHeatmap from '@/components/drivers/BehaviorHeatmap';
import SafetyAlerts from '@/components/drivers/SafetyAlerts';

const DriverMonitoring: React.FC = () => {
  const { data: driverEvents } = useWebSocket('driver.behavior');
  
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Driver Performance</h1>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Safety Leaderboard */}
        <div className="col-span-6">
          <DriverLeaderboard drivers={driverEvents.drivers} />
        </div>
        
        {/* Active Alerts */}
        <div className="col-span-6">
          <SafetyAlerts alerts={driverEvents.alerts} />
        </div>
        
        {/* Behavior Heatmap */}
        <div className="col-span-12">
          <BehaviorHeatmap events={driverEvents.events} />
        </div>
      </div>
    </div>
  );
};

export default DriverMonitoring;
```

**Component: DriverLeaderboard**

```typescript
// src/components/drivers/DriverLeaderboard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Medal, TrendingUp } from 'lucide-react';

interface Driver {
  id: string;
  name: string;
  score: number;
  harshEvents: number;
  incidents: number;
  rank: number;
}

const DriverLeaderboard: React.FC<{ drivers: Driver[] }> = ({ drivers }) => {
  const sortedDrivers = [...drivers].sort((a, b) => b.score - a.score);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-slate-900 mb-4">Safety Leaderboard</h2>
      
      <div className="space-y-3">
        {sortedDrivers.slice(0, 5).map((driver, idx) => (
          <motion.div
            key={driver.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`flex items-center gap-4 p-4 rounded-lg ${
              idx === 0 ? 'bg-gradient-to-r from-amber-50 to-transparent border border-amber-200' :
              idx === 1 ? 'bg-gradient-to-r from-slate-50 to-transparent border border-slate-200' :
              idx === 2 ? 'bg-gradient-to-r from-orange-50 to-transparent border border-orange-200' :
              'bg-slate-50'
            }`}
          >
            {/* Rank */}
            <div className="flex-shrink-0">
              {idx < 3 ? (
                <Medal size={24} className={
                  idx === 0 ? 'text-amber-600' :
                  idx === 1 ? 'text-slate-400' :
                  'text-orange-600'
                } />
              ) : (
                <span className="text-lg font-bold text-slate-400">{idx + 1}</span>
              )}
            </div>
            
            {/* Driver Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900">{driver.name}</p>
              <p className="text-sm text-slate-600">{driver.harshEvents} harsh events</p>
            </div>
            
            {/* Score */}
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">{driver.score}</p>
              <p className="text-xs text-slate-500">/100</p>
            </div>
            
            {/* Trend */}
            {driver.score > 85 && (
              <div className="text-green-600">
                <TrendingUp size={20} />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DriverLeaderboard;
```

---

### 4.5 Shipment Tracking (Real-time)

**Purpose:** Track deliveries in real-time  
**Ideal For:** Customers, dispatchers

```typescript
// src/pages/Shipments/TrackingPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWebSocket } from '@/hooks/useWebSocket';
import ShipmentTimeline from '@/components/shipments/ShipmentTimeline';
import ShipmentMap from '@/components/shipments/ShipmentMap';
import ShipmentDetails from '@/components/shipments/ShipmentDetails';
import DriverInfo from '@/components/shipments/DriverInfo';

const ShipmentTracking: React.FC = () => {
  const { shipmentId } = useParams();
  const [shipment, setShipment] = useState(null);
  
  // Subscribe to real-time shipment updates
  const { data: updates } = useWebSocket(`shipment:${shipmentId}:tracking`);
  
  useEffect(() => {
    // Update shipment whenever WebSocket data changes
    if (updates) {
      setShipment(prev => ({
        ...prev,
        ...updates.shipment,
        currentLocation: updates.location,
      }));
    }
  }, [updates]);
  
  if (!shipment) return <LoadingState />;
  
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-slate-600 mb-2">Tracking #</p>
        <h1 className="text-4xl font-bold text-slate-900">{shipment.id}</h1>
      </div>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Main Map - 2/3 */}
        <div className="col-span-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden h-96 mb-6">
            <ShipmentMap shipment={shipment} />
          </div>
          
          {/* Timeline */}
          <ShipmentTimeline events={shipment.events} currentStatus={shipment.status} />
        </div>
        
        {/* Details Sidebar - 1/3 */}
        <div className="col-span-4 space-y-6">
          <ShipmentDetails shipment={shipment} />
          <DriverInfo driver={shipment.driver} />
        </div>
      </div>
    </div>
  );
};

export default ShipmentTracking;
```

**Component: ShipmentTimeline**

```typescript
// src/components/shipments/ShipmentTimeline.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Event {
  id: string;
  type: string;
  timestamp: Date;
  location: string;
  description: string;
}

const ShipmentTimeline: React.FC<{ events: Event[], currentStatus: string }> = ({
  events,
  currentStatus,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Journey Timeline</h3>
      
      <div className="space-y-4 relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-500 to-transparent" />
        
        {events.map((event, idx) => {
          const isCompleted = idx < events.length - 1;
          
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex gap-4 pl-16"
            >
              {/* Timeline dot */}
              <div className="absolute left-0">
                {isCompleted ? (
                  <CheckCircle2 size={24} className="text-brand-500 fill-brand-500" />
                ) : (
                  <Clock size={24} className="text-amber-500 animate-spin" />
                )}
              </div>
              
              {/* Event content */}
              <div className="flex-1 pb-6">
                <h4 className="font-semibold text-slate-900 mb-1">{event.type}</h4>
                <p className="text-sm text-slate-600 mb-2">{event.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{event.location}</span>
                  <span className="text-xs font-medium text-brand-600">
                    {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ShipmentTimeline;
```

---

### 4.6 Analytics & Reporting Dashboard

**Purpose:** Business intelligence and custom reporting  
**Ideal For:** Executives, analysts

```typescript
// src/pages/Analytics/AnalyticsDashboard.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FleetMetrics from '@/components/analytics/FleetMetrics';
import CostAnalytics from '@/components/analytics/CostAnalytics';
import FuelAnalytics from '@/components/analytics/FuelAnalytics';
import PerformanceChart from '@/components/analytics/PerformanceChart';
import CustomReportBuilder from '@/components/analytics/CustomReportBuilder';

const AnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-600">Fleet performance and cost analysis</p>
        </div>
        
        {/* Date Range Picker */}
        <div className="flex gap-4">
          <input
            type="date"
            value={dateRange.from.toISOString().split('T')[0]}
            onChange={(e) => setDateRange(prev => ({
              ...prev,
              from: new Date(e.target.value)
            }))}
            className="px-4 py-2 border border-slate-300 rounded-lg"
          />
          <input
            type="date"
            value={dateRange.to.toISOString().split('T')[0]}
            onChange={(e) => setDateRange(prev => ({
              ...prev,
              to: new Date(e.target.value)
            }))}
            className="px-4 py-2 border border-slate-300 rounded-lg"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Top KPIs */}
        <div className="col-span-12">
          <FleetMetrics dateRange={dateRange} />
        </div>
        
        {/* Cost vs Performance */}
        <div className="col-span-6">
          <CostAnalytics dateRange={dateRange} />
        </div>
        
        <div className="col-span-6">
          <FuelAnalytics dateRange={dateRange} />
        </div>
        
        {/* Performance Trends */}
        <div className="col-span-12">
          <PerformanceChart dateRange={dateRange} />
        </div>
        
        {/* Custom Report Builder */}
        <div className="col-span-12">
          <CustomReportBuilder />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
```

**Component: PerformanceChart (Recharts)**

```typescript
// src/components/analytics/PerformanceChart.tsx
import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import axios from 'axios';

interface DateRange {
  from: Date;
  to: Date;
}

const PerformanceChart: React.FC<{ dateRange: DateRange }> = ({ dateRange }) => {
  const [data, setData] = useState([]);
  const [metric, setMetric] = useState('delivery-rate');
  
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get('/api/v1/analytics/performance', {
        params: {
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString(),
          metric,
        },
      });
      setData(response.data.data);
    };
    
    fetchData();
  }, [dateRange, metric]);
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload) return null;
    
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
        <p className="text-sm font-semibold text-slate-900">{payload[0]?.payload.date}</p>
        {payload.map((entry: any, idx: number) => (
          <p key={idx} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Performance Trends</h3>
        
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
        >
          <option value="delivery-rate">On-Time Delivery Rate</option>
          <option value="fuel-efficiency">Fuel Efficiency</option>
          <option value="cost-per-km">Cost per KM</option>
          <option value="utilization">Fleet Utilization</option>
        </select>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00d9ff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00d9ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#00d9ff"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorPerformance)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;
```

---

## 5. MOBILE APP (React Native)

### 5.1 Mobile Project Structure

```
fleet-mobile/
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── SplashScreen.tsx
│   │   ├── dashboard/
│   │   │   └── DriverDashboard.tsx
│   │   ├── tracking/
│   │   │   ├── LiveTracking.tsx
│   │   │   └── RoutePreview.tsx
│   │   ├── deliveries/
│   │   │   ├── DeliveryList.tsx
│   │   │   ├── DeliveryDetail.tsx
│   │   │   └── ProofOfDelivery.tsx
│   │   ├── profile/
│   │   │   ├── DriverProfile.tsx
│   │   │   └── PerformanceStats.tsx
│   │   └── settings/
│   │       └── SettingsScreen.tsx
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── LoadingIndicator.tsx
│   │   └── navigation/
│   │       └── BottomTabNavigator.tsx
│   ├── hooks/
│   │   ├── useLocation.ts
│   │   ├── useWebSocket.ts
│   │   └── usePermissions.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── locationService.ts
│   │   └── pushNotifications.ts
│   ├── store/
│   │   └── store.ts (Redux setup)
│   └── App.tsx
├── app.json
└── package.json
```

### 5.2 Mobile Dependencies

```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.73.0",
    "react-native-screens": "^3.26.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "@react-navigation/stack": "^6.3.0",
    "react-native-gesture-handler": "^2.14.0",
    "react-native-reanimated": "^3.6.0",
    "react-native-safe-area-context": "^4.7.0",
    "nativewind": "^2.0.11",
    "tailwindcss": "^3.4.0",
    "@react-redux/toolkit": "^1.9.7",
    "react-redux": "^8.1.3",
    "axios": "^1.6.0",
    "socket.io-client": "^4.7.0",
    "react-native-geolocation-service": "^5.3.0",
    "react-native-maps": "^1.7.1",
    "@react-native-camera-roll/camera-roll": "^6.1.1",
    "react-native-document-picker": "^9.1.1",
    "@react-native-firebase/app": "^18.0.0",
    "@react-native-firebase/messaging": "^18.0.0",
    "react-native-toast-message": "^2.1.5",
    "react-native-svg": "^13.14.0",
    "zustand": "^4.4.0"
  }
}
```

### 5.3 Driver Dashboard Screen

```typescript
// src/screens/dashboard/DriverDashboard.tsx
import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useWebSocket } from '@/hooks/useWebSocket';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const DriverDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { driver, stats } = useSelector((state: any) => state.user);
  const [todayRoute, setTodayRoute] = useState(null);
  
  // Real-time WebSocket connection
  const { data: liveUpdates } = useWebSocket('driver.updates');
  
  const scaleAnim = useSharedValue(1);
  
  useEffect(() => {
    // Animate entrance
    scaleAnim.value = withSpring(1, { damping: 10 });
    
    // Fetch today's route
    fetchTodayRoute();
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));
  
  const fetchTodayRoute = async () => {
    // Fetch from API
  };
  
  return (
    <View style={[styles.container, { backgroundColor: '#f8f9fa' }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good Morning, {driver?.name}</Text>
          <Text style={styles.subtext}>Today's Summary</Text>
        </View>
        
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Deliveries Today"
            value={stats?.deliveriesCount || 0}
            color="#00d9ff"
          />
          <StatCard
            label="Safety Score"
            value={stats?.safetyScore || 0}
            unit="/100"
            color="#10b981"
          />
          <StatCard
            label="Distance Today"
            value={stats?.distanceKm || 0}
            unit="km"
            color="#7c3aed"
          />
          <StatCard
            label="Hours On Duty"
            value={stats?.hoursOnDuty || 0}
            unit="hrs"
            color="#f59e0b"
          />
        </View>
        
        {/* Active Route */}
        {todayRoute && (
          <Animated.View style={[styles.card, animatedStyle]}>
            <Text style={styles.cardTitle}>Today's Route</Text>
            
            <View style={styles.routeInfo}>
              <Text style={styles.routeLabel}>Stops: {todayRoute.stops}</Text>
              <Text style={styles.routeLabel}>Distance: {todayRoute.distance}km</Text>
              <Text style={styles.routeLabel}>Est. Duration: {todayRoute.duration}h</Text>
            </View>
            
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.buttonText}>View Route</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        
        {/* Recent Alerts */}
        {liveUpdates?.alerts && liveUpdates.alerts.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Active Alerts</Text>
            {liveUpdates.alerts.slice(0, 3).map((alert: any) => (
              <View key={alert.id} style={styles.alertItem}>
                <View
                  style={[
                    styles.alertDot,
                    {
                      backgroundColor:
                        alert.severity === 'critical'
                          ? '#ef4444'
                          : '#f59e0b',
                    },
                  ]}
                />
                <Text style={styles.alertText}>{alert.message}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

interface StatCardProps {
  label: string;
  value: number | string;
  unit?: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, unit, color }) => {
  return (
    <View style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statValue}>
        <Text style={[styles.statNumber, { color }]}>{value}</Text>
        {unit && <Text style={styles.statUnit}>{unit}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 8,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  statValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  statUnit: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  routeInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  routeLabel: {
    fontSize: 14,
    color: '#4b5563',
    marginVertical: 4,
  },
  primaryButton: {
    backgroundColor: '#00d9ff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  alertText: {
    fontSize: 13,
    color: '#4b5563',
    flex: 1,
  },
});

export default DriverDashboard;
```

### 5.4 Live Tracking Screen (Driver)

```typescript
// src/screens/tracking/LiveTracking.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useLocation } from '@/hooks/useLocation';
import { useWebSocket } from '@/hooks/useWebSocket';

const LiveTracking: React.FC = () => {
  const mapRef = useRef<MapView>(null);
  const { location, startTracking, stopTracking } = useLocation();
  const { data: route, connected } = useWebSocket('driver.tracking');
  
  useEffect(() => {
    startTracking();
    
    return () => stopTracking();
  }, []);
  
  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        1000
      );
    }
  }, [location]);
  
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location?.latitude || 28.6139,
          longitude: location?.longitude || 77.209,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Current Position */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Your Location"
          />
        )}
        
        {/* Route Line */}
        {route?.waypoints && (
          <Polyline
            coordinates={route.waypoints.map((p: any) => ({
              latitude: p.latitude,
              longitude: p.longitude,
            }))}
            strokeColor="#00d9ff"
            strokeWidth={3}
          />
        )}
        
        {/* Delivery Markers */}
        {route?.stops?.map((stop: any) => (
          <Marker
            key={stop.id}
            coordinate={{
              latitude: stop.latitude,
              longitude: stop.longitude,
            }}
            pinColor={stop.delivered ? '#10b981' : '#f59e0b'}
            title={stop.address}
          />
        ))}
      </MapView>
      
      {/* Bottom Info Panel */}
      <View style={styles.infoPanel}>
        <Text style={styles.title}>Next Delivery</Text>
        {route?.nextStop && (
          <>
            <Text style={styles.address}>{route.nextStop.address}</Text>
            <Text style={styles.distance}>
              {Math.round(route.nextStop.distanceAway)}m away
            </Text>
          </>
        )}
        
        <TouchableOpacity style={styles.callButton}>
          <Text style={styles.callButtonText}>Call Customer</Text>
        </TouchableOpacity>
      </View>
      
      {/* Connection Status */}
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: connected ? '#10b981' : '#ef4444' },
        ]}
      >
        <Text style={styles.statusText}>
          {connected ? '● Live' : '● Offline'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  infoPanel: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  address: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  distance: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 12,
  },
  callButton: {
    backgroundColor: '#00d9ff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  callButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default LiveTracking;
```

### 5.5 Proof of Delivery Screen

```typescript
// src/screens/deliveries/ProofOfDelivery.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import DocumentPicker from 'react-native-document-picker';
import axios from 'axios';
import Toast from 'react-native-toast-message';

interface DeliveryProps {
  shipmentId: string;
  customerName: string;
}

const ProofOfDelivery: React.FC<DeliveryProps> = ({
  shipmentId,
  customerName,
}) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const signatureRef = useRef<any>(null);
  
  const handleAddPhoto = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
      });
      setPhotos([...photos, result.uri]);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to pick image',
        });
      }
    }
  };
  
  const handleCapture = async () => {
    // Use camera to capture
    // Implementation using camera library
  };
  
  const handleSignature = () => {
    // Open signature pad
  };
  
  const handleSubmit = async () => {
    if (!signature || photos.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please provide signature and at least one photo',
      });
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('shipmentId', shipmentId);
      formData.append('signature', signature);
      formData.append('notes', notes);
      
      photos.forEach((photo, idx) => {
        formData.append(`photos[${idx}]`, {
          uri: photo,
          type: 'image/jpeg',
          name: `delivery-${idx}.jpg`,
        });
      });
      
      await axios.post('/api/v1/shipments/{shipmentId}/proof-of-delivery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      Toast.show({
        type: 'success',
        text1: 'Delivery Confirmed',
        text2: 'Proof of delivery submitted',
      });
      
      // Navigate to next delivery
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Proof of Delivery</Text>
      <Text style={styles.subtitle}>Delivery to: {customerName}</Text>
      
      {/* Photo Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Photos</Text>
        <View style={styles.photoGrid}>
          {photos.map((photo, idx) => (
            <Image
              key={idx}
              source={{ uri: photo }}
              style={styles.photo}
            />
          ))}
          
          <TouchableOpacity
            style={styles.addPhotoButton}
            onPress={handleAddPhoto}
          >
            <Text style={styles.addPhotoText}>+ Add Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Signature Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Signature</Text>
        <TouchableOpacity
          style={styles.signaturePad}
          onPress={handleSignature}
        >
          {signature ? (
            <Image source={{ uri: signature }} style={styles.signatureImage} />
          ) : (
            <Text style={styles.signaturePlaceholder}>Tap to sign</Text>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes (Optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Add any delivery notes..."
          multiline
          numberOfLines={4}
          value={notes}
          onChangeText={setNotes}
        />
      </View>
      
      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Confirming...' : 'Confirm Delivery'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photo: {
    width: '48%',
    height: 120,
    borderRadius: 8,
  },
  addPhotoButton: {
    width: '48%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#9ca3af',
  },
  addPhotoText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  signaturePad: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signaturePlaceholder: {
    color: '#9ca3af',
    fontSize: 14,
  },
  signatureImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  notesInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#00d9ff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProofOfDelivery;
```

---

## 6. REAL-TIME INTEGRATION LAYER

### 6.1 WebSocket Hook (Universal)

```typescript
// src/hooks/useWebSocket.ts
import { useEffect, useRef, useCallback, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface UseWebSocketReturn<T> {
  data: T;
  connected: boolean;
  error: Error | null;
  send: (event: string, payload: any) => void;
}

export const useWebSocket = <T = any>(
  channel: string,
  options?: { reconnect?: boolean; timeout?: number }
): UseWebSocketReturn<T> => {
  const socketRef = useRef<Socket | null>(null);
  const [data, setData] = useState<T>({} as T);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    // Initialize WebSocket connection
    const token = localStorage.getItem('auth_token');
    
    socketRef.current = io(process.env.REACT_APP_WS_URL || 'http://localhost:3000', {
      auth: { token },
      reconnection: options?.reconnect !== false,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });
    
    // Connection events
    socketRef.current.on('connect', () => {
      setConnected(true);
      setError(null);
      
      // Subscribe to channel
      socketRef.current?.emit('subscribe', { channel });
    });
    
    socketRef.current.on('disconnect', () => {
      setConnected(false);
    });
    
    // Listen for messages on this channel
    socketRef.current.on(channel, (payload: T) => {
      setData(payload);
    });
    
    socketRef.current.on('error', (err: any) => {
      setError(new Error(err));
    });
    
    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('unsubscribe', { channel });
        socketRef.current.disconnect();
      }
    };
  }, [channel]);
  
  const send = useCallback((event: string, payload: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, payload);
    }
  }, []);
  
  return { data, connected, error, send };
};
```

### 6.2 Real-time Metrics Subscription

```typescript
// src/hooks/useRealtime.ts
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useWebSocket } from './useWebSocket';

export const useRealtimeMetrics = () => {
  const dispatch = useDispatch();
  const { data: metrics } = useWebSocket('fleet.metrics');
  
  useEffect(() => {
    if (metrics) {
      // Dispatch to Redux store
      dispatch({
        type: 'SET_REALTIME_METRICS',
        payload: metrics,
      });
    }
  }, [metrics, dispatch]);
  
  return metrics;
};

export const useVehicleTracking = (vehicleId: string) => {
  const { data: location } = useWebSocket(`vehicle:${vehicleId}:tracking`);
  return location;
};

export const useAlertStream = () => {
  const dispatch = useDispatch();
  const { data: alert } = useWebSocket('alerts.stream');
  
  useEffect(() => {
    if (alert) {
      dispatch({
        type: 'ADD_ALERT',
        payload: alert,
      });
    }
  }, [alert, dispatch]);
  
  return alert;
};
```

---

## 7. ADVANCED COMPONENTS & PATTERNS

### 7.1 Animated Real-time Counter

```typescript
// src/components/common/AnimatedCounter.tsx
import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  format?: (val: number) => string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1000,
  format = (v) => Math.round(v).toString(),
}) => {
  const animatedValue = useSharedValue(0);
  
  useEffect(() => {
    animatedValue.value = withSpring(value, {
      damping: 10,
      mass: 1,
      overshootClamping: false,
    });
  }, [value, animatedValue]);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: animatedValue.value / value || 1,
    };
  });
  
  return (
    <Animated.Text style={animatedStyle}>
      {format(animatedValue.value)}
    </Animated.Text>
  );
};

export default AnimatedCounter;
```

### 7.2 Real-time Map with Socket Updates

```typescript
// src/components/dashboard/LiveMap.tsx
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { useWebSocket } from '@/hooks/useWebSocket';

const LiveMapUpdater: React.FC = () => {
  const map = useMap();
  const { data: vehicles } = useWebSocket('vehicles.locations');
  
  useEffect(() => {
    if (vehicles.length > 0) {
      // Auto-pan to last updated vehicle
      const latest = vehicles[vehicles.length - 1];
      map.panTo([latest.latitude, latest.longitude]);
    }
  }, [vehicles, map]);
  
  return null;
};

const LiveMap: React.FC = () => {
  return (
    <MapContainer
      center={[28.6139, 77.209]}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© OpenStreetMap'
      />
      <LiveMapUpdater />
    </MapContainer>
  );
};

export default LiveMap;
```

---

## 8. STATE MANAGEMENT (Redux + Zustand)

### 8.1 Redux Slices

```typescript
// src/store/slices/vehiclesSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

export const fetchVehicles = createAsyncThunk(
  'vehicles/fetchVehicles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/vehicles');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

interface Vehicle {
  id: string;
  vehicleNumber: string;
  status: string;
  healthScore: number;
  // ... other fields
}

interface VehiclesState {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  metrics: any;
}

const initialState: VehiclesState = {
  vehicles: [],
  loading: false,
  error: null,
  metrics: {},
};

const vehiclesSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    updateVehicleLocation: (state, action) => {
      const vehicle = state.vehicles.find(v => v.id === action.payload.id);
      if (vehicle) {
        vehicle.currentLatitude = action.payload.latitude;
        vehicle.currentLongitude = action.payload.longitude;
      }
    },
    updateVehicleHealth: (state, action) => {
      const vehicle = state.vehicles.find(v => v.id === action.payload.id);
      if (vehicle) {
        vehicle.healthScore = action.payload.score;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateVehicleLocation, updateVehicleHealth } = vehiclesSlice.actions;
export default vehiclesSlice.reducer;
```

### 8.2 Zustand Store (Alternative for Local State)

```typescript
// src/store/uiStore.ts
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UIStore {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  selectedVehicle: string | null;
  mapZoom: number;
  
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  selectVehicle: (id: string) => void;
  setMapZoom: (zoom: number) => void;
}

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set) => ({
        theme: 'light',
        sidebarOpen: true,
        selectedVehicle: null,
        mapZoom: 12,
        
        setTheme: (theme) => set({ theme }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        selectVehicle: (id) => set({ selectedVehicle: id }),
        setMapZoom: (zoom) => set({ mapZoom: zoom }),
      }),
      { name: 'ui-store' }
    )
  )
);
```

---

## 9. PERFORMANCE OPTIMIZATION

### 9.1 Code Splitting & Lazy Loading

```typescript
// src/routes.tsx
import { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import DashboardSkeleton from '@/components/common/DashboardSkeleton';

// Lazy load route components
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Vehicles = lazy(() => import('@/pages/Vehicles/VehicleList'));
const Routes = lazy(() => import('@/pages/Routes/RouteOptimizer'));
const Analytics = lazy(() => import('@/pages/Analytics/AnalyticsDashboard'));

export const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
    ),
  },
  {
    path: '/vehicles',
    element: (
      <Suspense fallback={<DashboardSkeleton />}>
        <Vehicles />
      </Suspense>
    ),
  },
  // ... other routes
];
```

### 9.2 Memoization & Optimization

```typescript
// src/components/dashboard/VehicleMap.tsx
import React, { memo, useCallback } from 'react';

// Memoize expensive components
const VehicleMarker = memo(({ vehicle, onClick }: any) => {
  return (
    <Marker
      position={[vehicle.latitude, vehicle.longitude]}
      onClick={() => onClick(vehicle.id)}
    />
  );
});

// Use useCallback for event handlers
const VehicleMap = memo(({ vehicles }: any) => {
  const handleMarkerClick = useCallback((vehicleId: string) => {
    console.log('Selected:', vehicleId);
  }, []);
  
  return (
    <MapContainer>
      {vehicles.map((v: any) => (
        <VehicleMarker
          key={v.id}
          vehicle={v}
          onClick={handleMarkerClick}
        />
      ))}
    </MapContainer>
  );
});

export default VehicleMap;
```

### 9.3 Virtual List for Large Data Sets

```typescript
// src/components/shipments/VirtualShipmentList.tsx
import { FixedSizeList as List } from 'react-window';

interface ShipmentListProps {
  shipments: any[];
}

const VirtualShipmentList: React.FC<ShipmentListProps> = ({ shipments }) => {
  return (
    <List
      height={600}
      itemCount={shipments.length}
      itemSize={120}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style} className="px-4">
          <ShipmentRow shipment={shipments[index]} />
        </div>
      )}
    </List>
  );
};

export default VirtualShipmentList;
```

---

## 10. DESIGN TOKENS & COMPONENT LIBRARY

### 10.1 Base Button Component

```typescript
// src/components/common/Button.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-brand-500 text-white hover:bg-brand-600 hover:shadow-lg active:scale-95',
        secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300',
        ghost: 'hover:bg-slate-100 text-slate-900',
        danger: 'bg-red-500 text-white hover:bg-red-600',
        success: 'bg-green-500 text-white hover:bg-green-600',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
);

Button.displayName = 'Button';
export default Button;
```

### 10.2 Card Component

```typescript
// src/components/common/Card.tsx
import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover, glow, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-white rounded-lg border border-slate-200 p-6 shadow-sm',
        hover && 'hover:shadow-lg hover:border-slate-300 transition-all',
        glow && 'shadow-glow border-brand-300',
        className
      )}
      {...props}
    />
  )
);

Card.displayName = 'Card';
export default Card;
```

---

## 11. ACCESSIBILITY & INTERNATIONALIZATION

### 11.1 i18n Setup

```typescript
// src/utils/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        'dashboard.title': 'Fleet Dashboard',
        'vehicles.title': 'Vehicles',
        'routes.title': 'Routes',
        'analytics.title': 'Analytics',
        'delivery.delivered': 'Delivered',
        'delivery.in_transit': 'In Transit',
      },
    },
    es: {
      translation: {
        'dashboard.title': 'Panel de Flota',
        'vehicles.title': 'Vehículos',
        'routes.title': 'Rutas',
        'analytics.title': 'Analítica',
      },
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
```

### 11.2 ARIA Labels & Accessibility

```typescript
// src/components/dashboard/VehicleMap.tsx
<div
  role="region"
  aria-label="Fleet vehicle map"
  aria-live="polite"
  className="w-full h-96"
>
  <MapContainer>
    {/* Map content */}
  </MapContainer>
</div>
```

---

## 12. TESTING STRATEGY

### 12.1 Component Testing (Vitest + React Testing Library)

```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '@/components/common/Button';

describe('Button', () => {
  it('renders with correct variant', () => {
    render(<Button variant="primary">Click me</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('bg-brand-500');
  });
  
  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

---

## 13. DEPLOYMENT STRATEGY

### 13.1 Web Deployment (Vercel/Netlify)

```yaml
# vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "REACT_APP_API_URL": "@api_url",
    "REACT_APP_WS_URL": "@ws_url"
  },
  "routes": [
    {
      "src": "^/api/(.*)",
      "destination": "@backend_url/api/$1"
    }
  ]
}
```

### 13.2 Mobile Deployment (EAS)

```json
// app.json
{
  "name": "FleetApp",
  "slug": "fleet-management",
  "version": "1.0.0",
  "orientation": "portrait",
  "icon": "./assets/icon.png",
  "splash": {
    "image": "./assets/splash.png",
    "resizeMode": "contain"
  },
  "updates": {
    "fallbackToCacheTimeout": 0
  },
  "assetBundlePatterns": ["**/*"],
  "eas": {
    "projectId": "your-project-id"
  }
}
```

---

## 14. KEY PERFORMANCE INDICATORS (Frontend)

**Web:**
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 3.5s
- Lighthouse Score: > 90

**Mobile:**
- App startup time: < 2s
- Frame rate: 60 FPS
- Memory usage: < 150MB
- Battery impact: < 5% per hour

---

## 15. DESIGN PHILOSOPHY

**Core Principles:**
1. **Minimalism** - Remove unnecessary UI elements
2. **Clarity** - Information should be instantly understood
3. **Futurism** - Modern aesthetics with smooth animations
4. **Real-time** - Live updates without page refreshes
5. **Responsiveness** - Works seamlessly on all devices
6. **Accessibility** - Inclusive design for all users
7. **Performance** - Speed is a feature, not an afterthought

---

## 16. COMPONENT INVENTORY

**Common Components:**
- Button, Input, Select, Checkbox, Radio
- Card, Modal, Toast, Dropdown
- Sidebar, Navbar, Footer
- Avatar, Badge, Tag
- Loading, Skeleton, Empty State
- Pagination, Search, Filter

**Dashboard Components:**
- RealtimeMetrics, VehicleMap, AlertsPanel
- Chart (Line, Bar, Area, Pie)
- Table with sorting/filtering
- KPI Cards with animations

**Feature Components:**
- RouteVisualization, RouteDetailsList
- DriverLeaderboard, SafetyAlerts
- ShipmentTimeline, TrackingMap
- AnalyticsCharts, ReportBuilder

---

## 17. CONCLUSION

This PRD provides a complete blueprint for building a **modern, futuristic fleet management frontend** that perfectly integrates with the backend. The design system ensures consistency while the component library accelerates development. Real-time WebSocket integration keeps data fresh, and performance optimizations ensure smooth user experience at scale.

**Success Criteria:**
✅ Seamless real-time updates (<100ms latency)  
✅ Smooth 60 FPS animations  
✅ Mobile-first responsive design  
✅ Sub-second interaction response  
✅ Futuristic but professional aesthetics  
✅ <3 second page load time  
✅ 99.9% feature parity between web & mobile
