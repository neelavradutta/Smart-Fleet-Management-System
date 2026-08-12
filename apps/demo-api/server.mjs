import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { randomUUID } from "node:crypto";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: ["http://localhost:3000", "http://127.0.0.1:3000"], credentials: true },
});

app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  }),
);
app.use(express.json());

const fleetId = "11111111-1111-1111-1111-111111111111";

const vehicles = [
  {
    id: "22222222-2222-2222-2222-222222222221",
    vehicleNumber: "TRK-001",
    licensePlate: "MH12AB1234",
    vehicleType: "TRUCK",
    make: "Tata",
    model: "Prima",
    variant: "4928.S",
    year: 2023,
    color: "Pearl White",
    fuelType: "DIESEL",
    carbonCopy: "2956",
    engineNumber: "TATA-ENG-4928-001",
    chassisNumber: "MAT4123456TRK001A",
    vin: "MAT4123456TRK001A",
    capacityWeightKg: 16000,
    capacityVolumeM3: 42,
    status: "ACTIVE",
    currentDriverName: "Rajesh Kumar",
    checkInAt: new Date().toISOString().slice(0, 10) + "T06:42:00.000Z",
    checkOutAt: null,
    driverHistory: [
      {
        fullName: "Rajesh Kumar",
        checkInAt: new Date().toISOString().slice(0, 10) + "T06:42:00.000Z",
        checkOutAt: null,
        safetyScore: "94.5",
        totalMiles: 12450,
      },
      {
        fullName: "Vikram Patel",
        checkInAt: new Date(Date.now() - 86400000).toISOString().slice(0, 10) + "T08:10:00.000Z",
        checkOutAt: new Date(Date.now() - 86400000).toISOString().slice(0, 10) + "T18:35:00.000Z",
        safetyScore: "88.0",
        totalMiles: 15200,
      },
      {
        fullName: "Anita Shah",
        checkInAt: new Date(Date.now() - 172800000).toISOString().slice(0, 10) + "T07:05:00.000Z",
        checkOutAt: new Date(Date.now() - 172800000).toISOString().slice(0, 10) + "T17:20:00.000Z",
        safetyScore: "98.0",
        totalMiles: 9800,
      },
    ],
    currentLatitude: "19.076090",
    currentLongitude: "72.877426",
    lastLocationUpdate: new Date(Date.now() - 45000).toISOString(),
    registrationDate: "2023-03-14",
    registrationExpiry: "2028-03-13",
    registrationAuthority: "RTO Pune (MH12)",
    registrationStatus: "ACTIVE",
    insuranceProvider: "ICICI Lombard",
    policyNumber: "IL-MH-TRK001-2023",
    insuranceStartDate: "2025-03-14",
    insuranceExpiryDate: "2026-03-13",
    insuranceStatus: "ACTIVE",
    pucCertificateNumber: "PUC-PUN-88421",
    pucIssueDate: "2025-08-01",
    pucExpiryDate: "2026-01-31",
    fitnessCertificate: "FIT-MH12-99231 · Valid",
    permitStatus: "ACTIVE",
    permitExpiry: "2027-03-13",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    vehicleNumber: "VAN-014",
    licensePlate: "MH14CD5678",
    vehicleType: "VAN",
    make: "Mahindra",
    model: "Supro",
    variant: "Cargo VX",
    year: 2022,
    color: "Silver Mist",
    fuelType: "DIESEL",
    carbonCopy: "2179",
    engineNumber: "MH-SUP-ENG-014",
    chassisNumber: "MA1VAN014XYZ98765",
    vin: "MA1VAN014XYZ98765",
    capacityWeightKg: 1200,
    capacityVolumeM3: 8.5,
    status: "ACTIVE",
    currentDriverName: "Anita Shah",
    checkInAt: new Date().toISOString().slice(0, 10) + "T07:15:00.000Z",
    checkOutAt: null,
    driverHistory: [
      {
        fullName: "Anita Shah",
        checkInAt: new Date().toISOString().slice(0, 10) + "T07:15:00.000Z",
        checkOutAt: null,
        safetyScore: "98.0",
        totalMiles: 9800,
      },
      {
        fullName: "Rajesh Kumar",
        checkInAt: new Date(Date.now() - 259200000).toISOString().slice(0, 10) + "T09:00:00.000Z",
        checkOutAt: new Date(Date.now() - 259200000).toISOString().slice(0, 10) + "T16:45:00.000Z",
        safetyScore: "94.5",
        totalMiles: 12450,
      },
    ],
    currentLatitude: "19.218330",
    currentLongitude: "72.978090",
    lastLocationUpdate: new Date(Date.now() - 120000).toISOString(),
    registrationDate: "2022-06-21",
    registrationExpiry: "2027-06-20",
    registrationAuthority: "RTO Thane (MH14)",
    registrationStatus: "ACTIVE",
    insuranceProvider: "Bajaj Allianz",
    policyNumber: "BA-VAN014-77821",
    insuranceStartDate: "2025-06-21",
    insuranceExpiryDate: "2026-06-20",
    insuranceStatus: "ACTIVE",
    pucCertificateNumber: "PUC-THN-55102",
    pucIssueDate: "2025-07-12",
    pucExpiryDate: "2026-01-11",
    fitnessCertificate: "FIT-MH14-44118 · Valid",
    permitStatus: "ACTIVE",
    permitExpiry: "2026-12-31",
  },
  {
    id: "22222222-2222-2222-2222-222222222223",
    vehicleNumber: "BIKE-07",
    licensePlate: "MH01EF9012",
    vehicleType: "BIKE",
    make: "Hero",
    model: "Splendor",
    variant: "Plus i3s",
    year: 2021,
    color: "Black with Green",
    fuelType: "PETROL",
    carbonCopy: "150",
    engineNumber: "HERO-SPL-ENG-07",
    chassisNumber: "MBLBIKE07SPLNDR21",
    vin: "MBLBIKE07SPLNDR21",
    capacityWeightKg: 150,
    capacityVolumeM3: 0.4,
    status: "MAINTENANCE",
    currentDriverName: null,
    checkInAt: null,
    checkOutAt: null,
    driverHistory: [
      {
        fullName: "Vikram Patel",
        checkInAt: new Date(Date.now() - 432000000).toISOString().slice(0, 10) + "T10:20:00.000Z",
        checkOutAt: new Date(Date.now() - 432000000).toISOString().slice(0, 10) + "T14:05:00.000Z",
        safetyScore: "88.0",
        totalMiles: 15200,
      },
    ],
    currentLatitude: "19.113640",
    currentLongitude: "72.869720",
    lastLocationUpdate: new Date(Date.now() - 86400000).toISOString(),
    registrationDate: "2021-09-05",
    registrationExpiry: "2026-09-04",
    registrationAuthority: "RTO Mumbai Central (MH01)",
    registrationStatus: "ACTIVE",
    insuranceProvider: "HDFC Ergo",
    policyNumber: "HE-BIKE07-33019",
    insuranceStartDate: "2025-09-05",
    insuranceExpiryDate: "2026-09-04",
    insuranceStatus: "ACTIVE",
    pucCertificateNumber: "PUC-MUM-22910",
    pucIssueDate: "2025-06-18",
    pucExpiryDate: "2025-12-17",
    fitnessCertificate: "N/A — two-wheeler",
    permitStatus: "N/A",
    permitExpiry: "—",
  },
  {
    id: "22222222-2222-2222-2222-222222222224",
    vehicleNumber: "TRK-009",
    licensePlate: "MH12GH3456",
    vehicleType: "TRUCK",
    make: "Ashok Leyland",
    model: "Boss",
    variant: "1215 Tipper",
    year: 2020,
    color: "Ash Grey",
    fuelType: "DIESEL",
    carbonCopy: "2956",
    engineNumber: "AL-BOSS-ENG-009",
    chassisNumber: "MB1TRK009BOSS2020",
    vin: "MB1TRK009BOSS2020",
    capacityWeightKg: 14000,
    capacityVolumeM3: 38,
    status: "INACTIVE",
    currentDriverName: null,
    checkInAt: null,
    checkOutAt: null,
    driverHistory: [
      {
        fullName: "Rajesh Kumar",
        checkInAt: new Date(Date.now() - 1209600000).toISOString().slice(0, 10) + "T06:30:00.000Z",
        checkOutAt: new Date(Date.now() - 1209600000).toISOString().slice(0, 10) + "T19:10:00.000Z",
        safetyScore: "94.5",
        totalMiles: 12450,
      },
      {
        fullName: "Anita Shah",
        checkInAt: new Date(Date.now() - 1814400000).toISOString().slice(0, 10) + "T07:40:00.000Z",
        checkOutAt: new Date(Date.now() - 1814400000).toISOString().slice(0, 10) + "T15:55:00.000Z",
        safetyScore: "98.0",
        totalMiles: 9800,
      },
    ],
    currentLatitude: "19.033050",
    currentLongitude: "73.029660",
    lastLocationUpdate: new Date(Date.now() - 604800000).toISOString(),
    registrationDate: "2020-01-18",
    registrationExpiry: "2025-01-17",
    registrationAuthority: "RTO Pune (MH12)",
    registrationStatus: "INACTIVE",
    insuranceProvider: "New India Assurance",
    policyNumber: "NIA-TRK009-11002",
    insuranceStartDate: "2024-01-18",
    insuranceExpiryDate: "2025-01-17",
    insuranceStatus: "EXPIRED",
    pucCertificateNumber: "PUC-PUN-10088",
    pucIssueDate: "2024-11-02",
    pucExpiryDate: "2025-05-01",
    fitnessCertificate: "FIT-MH12-10009 · Expired",
    permitStatus: "INACTIVE",
    permitExpiry: "2025-01-17",
  },
];

const drivers = [
  {
    id: "33333333-3333-3333-3333-333333333331",
    driverCode: "DRV-1001",
    fullName: "Rajesh Kumar",
    email: "rajesh@demo.fleet",
    phone: "+91 9800011111",
    licenseNumber: "MH1420110012345",
    status: "ON_DUTY",
    safetyScore: "94.5",
    recentScores: [90.0, 91.2, 92.0, 93.1, 94.0],
    onTimePct: 96,
    incidentCount: 1,
    recentOverall: [86.2, 87.4, 88.1, 88.9, 89.6],
    totalMiles: 12450,
    tripsToday: 8,
    employeeId: "EMP-1024",
    dateOfBirth: "14 Mar 1988",
    nationality: "Indian",
    gender: "Male",
    address: "12/4 Andheri East, Mumbai, MH\n400069",
    emergencyContact: "+91 9800011112",
    profileCreatedAt: "12 Jan 2022",
    licenseType: "Transport",
    licenseClass: "HMV",
    licenseIssueDate: "22 Jun 2011",
    licenseExpiry: "21 Jun 2031",
    licenseAuthority: "RTO Andheri, Mumbai",
    licenseStatus: "Valid",
    licenseVerification: "Verified",
    licenseRestrictions: "Corrective lenses",
    employmentType: "Full-time",
    joiningDate: "12 Jan 2022",
    department: "Operations",
    assignedBranch: "Andheri Hub",
    supervisor: "Meera Joshi",
    shift: "Morning · 06:00–14:00",
    reasonForLeaving: null,
    leavingDate: null,
  },
  {
    id: "33333333-3333-3333-3333-333333333332",
    driverCode: "DRV-1002",
    fullName: "Anita Shah",
    email: "anita@demo.fleet",
    phone: "+91 9800022222",
    licenseNumber: "MH1420150098765",
    status: "OFF_DUTY",
    safetyScore: "98.0",
    recentScores: [99.2, 98.8, 99.0, 98.4, 97.6],
    onTimePct: 99,
    incidentCount: 0,
    recentOverall: [86.8, 85.9, 85.4, 84.9, 84.2],
    totalMiles: 9800,
    tripsToday: 3,
    employeeId: "EMP-1088",
    dateOfBirth: "02 Nov 1992",
    nationality: "Indian",
    gender: "Female",
    address: "88 Bandra West, Mumbai, MH\n400050",
    emergencyContact: "+91 9800022223",
    profileCreatedAt: "03 Mar 2023",
    licenseType: "Transport",
    licenseClass: "LMV + HMV",
    licenseIssueDate: "09 Sep 2015",
    licenseExpiry: "08 Sep 2035",
    licenseAuthority: "RTO Bandra, Mumbai",
    licenseStatus: "Valid",
    licenseVerification: "Verified",
    licenseRestrictions: "None",
    employmentType: "Full-time",
    joiningDate: "03 Mar 2023",
    department: "Operations",
    assignedBranch: "Bandra Depot",
    supervisor: "Meera Joshi",
    shift: "Evening · 14:00–22:00",
    reasonForLeaving: null,
    leavingDate: null,
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    driverCode: "DRV-1003",
    fullName: "Vikram Patel",
    email: "vikram@demo.fleet",
    phone: "+91 9800033333",
    licenseNumber: "MH1420180054321",
    status: "ON_LEAVE",
    safetyScore: "88.0",
    recentScores: [86.0, 87.0, 87.5, 88.2, 88.0],
    onTimePct: 91,
    incidentCount: 2,
    recentOverall: [74.0, 75.2, 76.1, 76.8, 76.7],
    totalMiles: 15200,
    tripsToday: 0,
    employeeId: "EMP-1142",
    dateOfBirth: "27 Jul 1985",
    nationality: "Indian",
    gender: "Male",
    address: "41 Viman Nagar, Pune, MH\n411014",
    emergencyContact: "+91 9800033334",
    profileCreatedAt: "18 Aug 2021",
    licenseType: "Transport",
    licenseClass: "HMV",
    licenseIssueDate: "14 Feb 2018",
    licenseExpiry: "13 Feb 2028",
    licenseAuthority: "RTO Pune",
    licenseStatus: "Valid",
    licenseVerification: "Verified",
    licenseRestrictions: "No night driving (medical)",
    employmentType: "Full-time",
    joiningDate: "18 Aug 2021",
    department: "Long haul",
    assignedBranch: "Pune Yard",
    supervisor: "Arjun Desai",
    shift: "Rotating",
    reasonForLeaving: null,
    leavingDate: null,
  },
  {
    id: "33333333-3333-3333-3333-333333333334",
    driverCode: "DRV-1004",
    fullName: "Suresh Mehta",
    email: "suresh@demo.fleet",
    phone: "+91 9800044444",
    licenseNumber: "MH1420100077001",
    status: "OFFBOARDED",
    safetyScore: "81.0",
    recentScores: [84.0, 83.2, 82.1, 81.4, 81.0],
    onTimePct: 84,
    incidentCount: 5,
    recentOverall: [78.4, 77.1, 76.2, 75.4, 75.0],
    totalMiles: 22140,
    tripsToday: 0,
    employeeId: "EMP-0961",
    dateOfBirth: "05 Jan 1980",
    nationality: "Indian",
    gender: "Male",
    address: "6 Thane West, Thane, MH\n400601",
    emergencyContact: "+91 9800044445",
    profileCreatedAt: "09 Feb 2020",
    licenseType: "Transport",
    licenseClass: "HMV",
    licenseIssueDate: "30 Apr 2010",
    licenseExpiry: "29 Apr 2030",
    licenseAuthority: "RTO Thane",
    licenseStatus: "Surrendered",
    licenseVerification: "Archived",
    licenseRestrictions: "None",
    employmentType: "Full-time",
    joiningDate: "09 Feb 2020",
    department: "Operations",
    assignedBranch: "Thane Depot",
    supervisor: "Meera Joshi",
    shift: "—",
    reasonForLeaving: "Resigned — personal reasons",
    leavingDate: "15 Jun 2026",
  },
];

const alerts = [
  {
    id: randomUUID(),
    alertType: "GEOFENCE_VIOLATION",
    alertSeverity: "CRITICAL",
    alertMessage: "TRK-001 entered Restricted Zone — Andheri",
    isResolved: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    alertType: "HARSH_DRIVING",
    alertSeverity: "WARNING",
    alertMessage: "Speeding 92 > 80 on VAN-014",
    isResolved: false,
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: randomUUID(),
    alertType: "MAINTENANCE_DUE",
    alertSeverity: "INFO",
    alertMessage: "BIKE-07 oil change due in 3 days",
    isResolved: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

const geofences = [
  {
    id: randomUUID(),
    name: "Andheri Restricted",
    geofenceType: "RESTRICTED",
    centerLatitude: "19.1197",
    centerLongitude: "72.8468",
    radiusMeters: 800,
  },
  {
    id: randomUUID(),
    name: "BKC Depot",
    geofenceType: "DEPOT",
    centerLatitude: "19.0660",
    centerLongitude: "72.8697",
    radiusMeters: 400,
  },
];

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function estimateCo2Kg(distanceKm) {
  return distanceKm * 0.21;
}

function distanceFromStops(stops) {
  let km = 0;
  for (let i = 1; i < stops.length; i++) {
    km += haversineKm(
      Number(stops[i - 1].lat),
      Number(stops[i - 1].lng),
      Number(stops[i].lat),
      Number(stops[i].lng),
    );
  }
  return km;
}

function orderStopsNearest(stops) {
  if (!stops.length) return [];
  if (stops.length < 3) {
    return stops.map((s, i) => ({ ...s, seq: i + 1 }));
  }
  const [start, ...rest] = stops;
  const remaining = [...rest];
  const ordered = [start];
  let curLat = Number(start.lat);
  let curLng = Number(start.lng);
  while (remaining.length) {
    remaining.sort(
      (a, b) =>
        haversineKm(curLat, curLng, Number(a.lat), Number(a.lng)) -
        haversineKm(curLat, curLng, Number(b.lat), Number(b.lng)),
    );
    const next = remaining.shift();
    ordered.push(next);
    curLat = Number(next.lat);
    curLng = Number(next.lng);
  }
  return ordered.map((s, i) => ({ ...s, seq: i + 1 }));
}

function isoOffset(ms) {
  return new Date(Date.now() + ms).toISOString();
}

function vehicleLookup(id) {
  const v = vehicles.find((x) => x.id === id);
  return {
    vehicleId: id ?? null,
    vehicleNumber: v?.vehicleNumber ?? null,
    licensePlate: v?.licensePlate ?? null,
  };
}

function driverLookup(id) {
  const d = drivers.find((x) => x.id === id);
  return {
    driverId: id ?? null,
    driverName: d?.fullName ?? null,
    driverCode: d?.driverCode ?? null,
  };
}

function makeStop(seq, label, address, lat, lng, etaMs, status) {
  return {
    id: `stop-${seq}-${label.replace(/\s+/g, "-").toLowerCase()}`,
    seq,
    label,
    address,
    lat,
    lng,
    eta: isoOffset(etaMs),
    status,
  };
}

const V_TRK001 = "22222222-2222-2222-2222-222222222221";
const V_VAN014 = "22222222-2222-2222-2222-222222222222";
const V_BIKE07 = "22222222-2222-2222-2222-222222222223";
const V_TRK009 = "22222222-2222-2222-2222-222222222224";
const D_RAJESH = "33333333-3333-3333-3333-333333333331";
const D_ANITA = "33333333-3333-3333-3333-333333333332";
const D_VIKRAM = "33333333-3333-3333-3333-333333333333";

const routes = [
  {
    id: "44444444-4444-4444-4444-444444444441",
    code: "RT-1001",
    name: "West Express",
    corridor: "Bandra → Andheri",
    depot: "BKC Depot",
    routeType: "DELIVERY",
    routeStatus: "ACTIVE",
    ...vehicleLookup(V_TRK001),
    ...driverLookup(D_RAJESH),
    plannedDistanceKm: "42.80",
    actualDistanceKm: "28.10",
    plannedDurationMinutes: 210,
    actualDurationMinutes: 132,
    plannedStartTime: isoOffset(-3 * 3600000),
    actualStartTime: isoOffset(-2.8 * 3600000),
    plannedEndTime: isoOffset(1.5 * 3600000),
    actualEndTime: null,
    totalStops: 8,
    completedStops: 5,
    optimizationScore: "91.0",
    efficiencyScore: "87.4",
    co2Kg: "8.988",
    createdAt: isoOffset(-86400000),
    updatedAt: isoOffset(-600000),
    stops: [
      makeStop(1, "BKC Depot", "G Block, Bandra Kurla Complex", 19.066, 72.8697, -2.8 * 3600000, "COMPLETED"),
      makeStop(2, "Bandra West", "Linking Road hub", 19.0596, 72.8295, -2.2 * 3600000, "COMPLETED"),
      makeStop(3, "Mahim", "Cadell Road drop", 19.035, 72.842, -1.6 * 3600000, "COMPLETED"),
      makeStop(4, "Dadar", "Plaza depot bay", 19.0178, 72.8478, -1.1 * 3600000, "COMPLETED"),
      makeStop(5, "Worli", "Sea Face warehouse", 19.0176, 72.8156, -0.4 * 3600000, "COMPLETED"),
      makeStop(6, "Andheri West", "Lokhandwala cluster", 19.136, 72.829, 0.5 * 3600000, "PENDING"),
      makeStop(7, "Andheri East", "Chakala industrial", 19.1197, 72.8468, 1.1 * 3600000, "PENDING"),
      makeStop(8, "BKC Depot", "Return to depot", 19.066, 72.8697, 1.5 * 3600000, "PENDING"),
    ],
  },
  {
    id: "44444444-4444-4444-4444-444444444442",
    code: "RT-1002",
    name: "Island Loop",
    corridor: "Worli → BKC",
    depot: "BKC Depot",
    routeType: "DELIVERY",
    routeStatus: "ACTIVE",
    ...vehicleLookup(V_VAN014),
    ...driverLookup(D_ANITA),
    plannedDistanceKm: "31.40",
    actualDistanceKm: "18.20",
    plannedDurationMinutes: 150,
    actualDurationMinutes: 168,
    plannedStartTime: isoOffset(-4 * 3600000),
    actualStartTime: isoOffset(-3.7 * 3600000),
    plannedEndTime: isoOffset(-0.4 * 3600000),
    actualEndTime: null,
    totalStops: 6,
    completedStops: 2,
    optimizationScore: "84.0",
    efficiencyScore: "71.2",
    co2Kg: "6.594",
    createdAt: isoOffset(-72000000),
    updatedAt: isoOffset(-180000),
    stops: [
      makeStop(1, "Worli", "Sea Face warehouse", 19.0176, 72.8156, -3.6 * 3600000, "COMPLETED"),
      makeStop(2, "Lower Parel", "Kamala Mills", 19.0, 72.83, -2.8 * 3600000, "COMPLETED"),
      makeStop(3, "Dadar", "Plaza depot bay", 19.0178, 72.8478, -1.5 * 3600000, "PENDING"),
      makeStop(4, "Mahim", "Cadell Road drop", 19.035, 72.842, -0.8 * 3600000, "PENDING"),
      makeStop(5, "Bandra West", "Linking Road hub", 19.0596, 72.8295, -0.2 * 3600000, "PENDING"),
      makeStop(6, "BKC Depot", "Return to depot", 19.066, 72.8697, -0.4 * 3600000, "PENDING"),
    ],
  },
  {
    id: "44444444-4444-4444-4444-444444444443",
    code: "RT-1003",
    name: "Powai Circuit",
    corridor: "BKC → Powai",
    depot: "BKC Depot",
    routeType: "COLLECTION",
    routeStatus: "PLANNED",
    ...vehicleLookup(V_BIKE07),
    ...driverLookup(D_VIKRAM),
    plannedDistanceKm: "24.60",
    actualDistanceKm: null,
    plannedDurationMinutes: 120,
    actualDurationMinutes: null,
    plannedStartTime: isoOffset(2 * 3600000),
    actualStartTime: null,
    plannedEndTime: isoOffset(4 * 3600000),
    actualEndTime: null,
    totalStops: 5,
    completedStops: 0,
    optimizationScore: "88.0",
    efficiencyScore: null,
    co2Kg: "5.166",
    createdAt: isoOffset(-36000000),
    updatedAt: isoOffset(-36000000),
    stops: [
      makeStop(1, "BKC Depot", "G Block, Bandra Kurla Complex", 19.066, 72.8697, 2 * 3600000, "PENDING"),
      makeStop(2, "Kurla", "LBS Marg pickup", 19.0726, 72.884, 2.4 * 3600000, "PENDING"),
      makeStop(3, "Ghatkopar", "Station east bay", 19.086, 72.908, 2.9 * 3600000, "PENDING"),
      makeStop(4, "Powai", "Lake View hub", 19.1176, 72.906, 3.4 * 3600000, "PENDING"),
      makeStop(5, "BKC Depot", "Return to depot", 19.066, 72.8697, 4 * 3600000, "PENDING"),
    ],
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    code: "RT-1004",
    name: "Thane Collection",
    corridor: "Thane → BKC",
    depot: "Thane Depot",
    routeType: "COLLECTION",
    routeStatus: "PLANNED",
    ...vehicleLookup(V_VAN014),
    ...driverLookup(D_ANITA),
    plannedDistanceKm: "38.90",
    actualDistanceKm: null,
    plannedDurationMinutes: 180,
    actualDurationMinutes: null,
    plannedStartTime: isoOffset(5 * 3600000),
    actualStartTime: null,
    plannedEndTime: isoOffset(8 * 3600000),
    actualEndTime: null,
    totalStops: 6,
    completedStops: 0,
    optimizationScore: "86.5",
    efficiencyScore: null,
    co2Kg: "8.169",
    createdAt: isoOffset(-18000000),
    updatedAt: isoOffset(-18000000),
    stops: [
      makeStop(1, "Thane West", "Station road yard", 19.2183, 72.9781, 5 * 3600000, "PENDING"),
      makeStop(2, "Mulund", "Check naka bay", 19.172, 72.956, 5.5 * 3600000, "PENDING"),
      makeStop(3, "Bhandup", "LBS industrial", 19.144, 72.937, 6 * 3600000, "PENDING"),
      makeStop(4, "Kanjurmarg", "East pickup", 19.13, 72.928, 6.5 * 3600000, "PENDING"),
      makeStop(5, "Kurla", "LBS Marg pickup", 19.0726, 72.884, 7.2 * 3600000, "PENDING"),
      makeStop(6, "BKC Depot", "Return to depot", 19.066, 72.8697, 8 * 3600000, "PENDING"),
    ],
  },
  {
    id: "44444444-4444-4444-4444-444444444445",
    code: "RT-1005",
    name: "Andheri Hub Day",
    corridor: "Andheri East → Goregaon",
    depot: "Andheri Hub",
    routeType: "DELIVERY",
    routeStatus: "COMPLETED",
    ...vehicleLookup(V_TRK001),
    ...driverLookup(D_RAJESH),
    plannedDistanceKm: "29.10",
    actualDistanceKm: "30.40",
    plannedDurationMinutes: 165,
    actualDurationMinutes: 172,
    plannedStartTime: isoOffset(-28 * 3600000),
    actualStartTime: isoOffset(-27.8 * 3600000),
    plannedEndTime: isoOffset(-25.2 * 3600000),
    actualEndTime: isoOffset(-25 * 3600000),
    totalStops: 7,
    completedStops: 7,
    optimizationScore: "93.0",
    efficiencyScore: "90.1",
    co2Kg: "6.111",
    createdAt: isoOffset(-48 * 3600000),
    updatedAt: isoOffset(-25 * 3600000),
    stops: [
      makeStop(1, "Andheri East", "Chakala industrial", 19.1197, 72.8468, -27.8 * 3600000, "COMPLETED"),
      makeStop(2, "Marol", "MIDC cluster", 19.117, 72.882, -27.3 * 3600000, "COMPLETED"),
      makeStop(3, "Jogeshwari", "West drop", 19.136, 72.845, -26.8 * 3600000, "COMPLETED"),
      makeStop(4, "Goregaon", "Link Road hub", 19.1663, 72.8526, -26.3 * 3600000, "COMPLETED"),
      makeStop(5, "Malad", "Mindspace bay", 19.186, 72.848, -25.8 * 3600000, "COMPLETED"),
      makeStop(6, "Goregaon", "Return sweep", 19.1663, 72.8526, -25.4 * 3600000, "COMPLETED"),
      makeStop(7, "Andheri Hub", "Yard close", 19.1197, 72.8468, -25 * 3600000, "COMPLETED"),
    ],
  },
  {
    id: "44444444-4444-4444-4444-444444444446",
    code: "RT-1006",
    name: "Navi Mumbai Service",
    corridor: "Vashi → Belapur",
    depot: "BKC Depot",
    routeType: "SERVICE",
    routeStatus: "CANCELLED",
    ...vehicleLookup(V_BIKE07),
    ...driverLookup(D_VIKRAM),
    plannedDistanceKm: "22.00",
    actualDistanceKm: null,
    plannedDurationMinutes: 90,
    actualDurationMinutes: null,
    plannedStartTime: isoOffset(-6 * 3600000),
    actualStartTime: null,
    plannedEndTime: isoOffset(-4.5 * 3600000),
    actualEndTime: null,
    totalStops: 4,
    completedStops: 0,
    optimizationScore: "79.0",
    efficiencyScore: null,
    co2Kg: "4.620",
    createdAt: isoOffset(-20 * 3600000),
    updatedAt: isoOffset(-8 * 3600000),
    stops: [
      makeStop(1, "Vashi", "Sector 17 workshop", 19.077, 72.998, -6 * 3600000, "SKIPPED"),
      makeStop(2, "Nerul", "Palm Beach service", 19.033, 73.019, -5.5 * 3600000, "SKIPPED"),
      makeStop(3, "Belapur", "CBD bay", 19.018, 73.039, -5 * 3600000, "SKIPPED"),
      makeStop(4, "BKC Depot", "Return to depot", 19.066, 72.8697, -4.5 * 3600000, "SKIPPED"),
    ],
  },
  {
    id: "44444444-4444-4444-4444-444444444447",
    code: "RT-1007",
    name: "Pune Long Haul",
    corridor: "BKC → Pune",
    depot: "Pune Yard",
    routeType: "DELIVERY",
    routeStatus: "PLANNED",
    ...vehicleLookup(V_TRK009),
    ...driverLookup(D_VIKRAM),
    plannedDistanceKm: "154.20",
    actualDistanceKm: null,
    plannedDurationMinutes: 240,
    actualDurationMinutes: null,
    plannedStartTime: isoOffset(18 * 3600000),
    actualStartTime: null,
    plannedEndTime: isoOffset(22 * 3600000),
    actualEndTime: null,
    totalStops: 4,
    completedStops: 0,
    optimizationScore: "82.0",
    efficiencyScore: null,
    co2Kg: "32.382",
    createdAt: isoOffset(-12 * 3600000),
    updatedAt: isoOffset(-12 * 3600000),
    stops: [
      makeStop(1, "BKC Depot", "G Block, Bandra Kurla Complex", 19.066, 72.8697, 18 * 3600000, "PENDING"),
      makeStop(2, "Panvel", "Highway staging", 18.989, 73.117, 19.2 * 3600000, "PENDING"),
      makeStop(3, "Lonavala", "Express halt", 18.748, 73.407, 20.4 * 3600000, "PENDING"),
      makeStop(4, "Pune Yard", "Viman Nagar", 18.5679, 73.9143, 22 * 3600000, "PENDING"),
    ],
  },
  {
    id: "44444444-4444-4444-4444-444444444448",
    code: "RT-1008",
    name: "Bandra Retail Sweep",
    corridor: "Bandra West → Mahim",
    depot: "Bandra Depot",
    routeType: "SWEEP",
    routeStatus: "COMPLETED",
    ...vehicleLookup(V_VAN014),
    ...driverLookup(D_ANITA),
    plannedDistanceKm: "18.40",
    actualDistanceKm: "17.90",
    plannedDurationMinutes: 95,
    actualDurationMinutes: 88,
    plannedStartTime: isoOffset(-10 * 3600000),
    actualStartTime: isoOffset(-9.9 * 3600000),
    plannedEndTime: isoOffset(-8.4 * 3600000),
    actualEndTime: isoOffset(-8.45 * 3600000),
    totalStops: 5,
    completedStops: 5,
    optimizationScore: "95.0",
    efficiencyScore: "96.2",
    co2Kg: "3.864",
    createdAt: isoOffset(-30 * 3600000),
    updatedAt: isoOffset(-8.4 * 3600000),
    stops: [
      makeStop(1, "Bandra Depot", "Turner Road", 19.0596, 72.8295, -9.9 * 3600000, "COMPLETED"),
      makeStop(2, "Khar", "Linking Road south", 19.07, 72.837, -9.5 * 3600000, "COMPLETED"),
      makeStop(3, "Santacruz", "SV Road cluster", 19.081, 72.841, -9.1 * 3600000, "COMPLETED"),
      makeStop(4, "Mahim", "Cadell Road drop", 19.035, 72.842, -8.7 * 3600000, "COMPLETED"),
      makeStop(5, "Bandra Depot", "Yard close", 19.0596, 72.8295, -8.45 * 3600000, "COMPLETED"),
    ],
  },
];

function nextRouteCode() {
  const nums = routes.map((r) => {
    const m = String(r.code ?? "").match(/(\d+)$/);
    return m ? Number(m[1]) : 1000;
  });
  return `RT-${Math.max(1000, ...nums) + 1}`;
}

function applyRoutePatch(id, patch = {}) {
  const row = routes.find((x) => x.id === id);
  if (!row) return null;
  const next = { ...patch };
  delete next.id;
  delete next.source;
  if (next.vehicleId) Object.assign(next, vehicleLookup(next.vehicleId));
  if (next.driverId) Object.assign(next, driverLookup(next.driverId));
  if (Array.isArray(next.stops) && next.stops.length) {
    next.totalStops = next.stops.length;
    next.completedStops = next.stops.filter((s) => s.status === "COMPLETED").length;
    const km = distanceFromStops(next.stops);
    if (next.plannedDistanceKm == null) next.plannedDistanceKm = km.toFixed(2);
    if (next.co2Kg == null) next.co2Kg = estimateCo2Kg(km).toFixed(3);
  }
  Object.assign(row, next);
  row.updatedAt = new Date().toISOString();
  io.emit("route_update", row);
  return row;
}

const shipments = [
  {
    id: randomUUID(),
    customerName: "Acme Retail",
    deliveryAddress: "Bandra West Hub",
    shipmentStatus: "IN_TRANSIT",
    trackingToken: "demotrackacme001",
    expectedDeliveryTime: new Date(Date.now() + 7200000).toISOString(),
  },
  {
    id: randomUUID(),
    customerName: "FreshMart",
    deliveryAddress: "Powai Lake View",
    shipmentStatus: "ASSIGNED",
    trackingToken: "demotrackfresh002",
    expectedDeliveryTime: new Date(Date.now() + 14400000).toISOString(),
  },
];

const documents = [
  {
    id: randomUUID(),
    title: "Rajesh — Driving License",
    docType: "LICENSE",
    expiresAt: "2026-09-15",
    fileUrl: "https://example.com/docs/license-rajesh.pdf",
  },
  {
    id: randomUUID(),
    title: "TRK-001 — Insurance",
    docType: "INSURANCE",
    expiresAt: "2026-12-01",
    fileUrl: "https://example.com/docs/ins-trk001.pdf",
  },
  {
    id: randomUUID(),
    title: "TRK-001 — Fitness Certificate",
    docType: "PERMIT",
    expiresAt: "2027-03-20",
    fileUrl: "https://example.com/docs/fit-trk001.pdf",
  },
  {
    id: randomUUID(),
    title: "VAN-014 — Insurance",
    docType: "INSURANCE",
    expiresAt: "2026-08-30",
    fileUrl: "https://example.com/docs/ins-van014.pdf",
  },
  {
    id: randomUUID(),
    title: "BIKE-07 — RC Book",
    docType: "RC",
    expiresAt: "2028-01-10",
    fileUrl: "https://example.com/docs/rc-bike07.pdf",
  },
  {
    id: randomUUID(),
    title: "TRK-009 — Insurance (expired hold)",
    docType: "INSURANCE",
    expiresAt: "2026-02-01",
    fileUrl: "https://example.com/docs/ins-trk009.pdf",
  },
];

function applyDriverPatch(id, patch = {}, source = "software") {
  const d = drivers.find((x) => x.id === id);
  if (!d) return null;
  const next = { ...patch };
  delete next.source;
  delete next.id;
  for (const [key, value] of Object.entries(next)) {
    if (value === undefined) continue;
    d[key] = value;
  }
  d.updatedAt = new Date().toISOString();
  d.lastUpdateSource = source === "manual" ? "manual" : "software";
  io.emit("driver_update", d);
  return d;
}

app.get("/health", (_req, res) => res.json({ ok: true, mode: "demo" }));

app.post("/api/v1/auth/login", (req, res) => {
  const { email, password } = req.body ?? {};
  if (email === "owner@demo.fleet" && password === "demo12345") {
    return res.json({
      token: "demo-token",
      user: {
        id: "u1",
        email,
        fullName: "Demo Owner",
        role: "OWNER",
        fleetId,
        fleetName: "Demo Logistics",
        tier: "PRO",
      },
    });
  }
  res.status(401).json({ error: "Invalid email or password" });
});

// Public tracking — BEFORE auth middleware
app.get("/api/v1/track/:token", (req, res) => {
  const s = shipments.find((x) => x.trackingToken === req.params.token);
  if (!s) return res.status(404).json({ error: "Tracking not found" });
  res.json({
    data: {
      shipmentStatus: s.shipmentStatus,
      customerName: s.customerName,
      deliveryAddress: s.deliveryAddress,
      expectedDeliveryTime: s.expectedDeliveryTime ?? null,
      actualDeliveryTime: s.actualDeliveryTime ?? null,
    },
  });
});

function requireAuth(req, res, next) {
  const h = req.headers.authorization || "";
  if (h === "Bearer demo-token" || req.headers["x-api-key"] === "demo-key") {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized — login again" });
}

app.use("/api/v1", requireAuth);

app.get("/api/v1/fleets/me", (_req, res) => {
  res.json({
    data: {
      id: fleetId,
      name: "Demo Logistics",
      subscriptionTier: "PRO",
      settings: { maxVehicles: 100, maxDrivers: 200 },
    },
  });
});

function seedSeries(base, n = 12, jitter = 3) {
  const out = [];
  let v = base;
  for (let i = n - 1; i >= 0; i--) {
    v = Math.max(0, v + (Math.random() - 0.45) * jitter);
    const t = new Date(Date.now() - i * 5000);
    out.push({
      t: t.toISOString(),
      label: t.toLocaleTimeString([], { minute: "2-digit", second: "2-digit" }),
      value: Number(v.toFixed(1)),
    });
  }
  return out;
}

const analyticsLive = {
  onTimeDeliveryRate: 92,
  totalDistanceKm: 1280,
  totalCo2Kg: 268.8,
  avgCostPerKm: 18.5,
  avgUtilization: 78,
  avgSafetyScore:
    drivers.reduce((s, d) => s + Number(d.safetyScore), 0) / drivers.length,
  esgScore: 79,
  carbonOffsetsKg: 27,
  greenRouteHint: "Prefer shorter optimized routes to cut CO2 10-15%",
  series: {
    onTime: seedSeries(92, 16, 2.2),
    distance: seedSeries(12, 16, 1.4),
    cost: seedSeries(18.5, 16, 0.6),
    co2: seedSeries(4.2, 16, 0.5),
  },
};

function analyticsSnapshot() {
  return {
    totalVehicles: vehicles.length,
    activeVehicles: vehicles.filter((v) => v.status === "ACTIVE").length,
    totalDrivers: drivers.length,
    avgSafetyScore: Number(analyticsLive.avgSafetyScore.toFixed(1)),
    onTimeDeliveryRate: Number(analyticsLive.onTimeDeliveryRate.toFixed(1)),
    totalDistanceKm: Number(analyticsLive.totalDistanceKm.toFixed(1)),
    totalCo2Kg: Number(analyticsLive.totalCo2Kg.toFixed(1)),
    avgUtilization: Number(analyticsLive.avgUtilization.toFixed(1)),
    avgCostPerKm: Number(analyticsLive.avgCostPerKm.toFixed(2)),
    esgScore: Number(analyticsLive.esgScore.toFixed(1)),
    carbonOffsetsKg: Number(analyticsLive.carbonOffsetsKg.toFixed(1)),
    greenRouteHint: analyticsLive.greenRouteHint,
    series: analyticsLive.series,
    updatedAt: new Date().toISOString(),
  };
}

app.get("/api/v1/analytics/fleet-overview", (_req, res) => {
  const s = analyticsSnapshot();
  res.json({
    data: {
      totalVehicles: s.totalVehicles,
      activeVehicles: s.activeVehicles,
      totalDrivers: s.totalDrivers,
      avgSafetyScore: s.avgSafetyScore,
      onTimeDeliveryRate: s.onTimeDeliveryRate,
      totalDistanceKm: s.totalDistanceKm,
      totalCo2Kg: s.totalCo2Kg,
      avgUtilization: s.avgUtilization,
      avgCostPerKm: s.avgCostPerKm,
      series: s.series,
      updatedAt: s.updatedAt,
    },
  });
});

app.get("/api/v1/analytics/esg", (_req, res) => {
  const s = analyticsSnapshot();
  res.json({
    data: {
      totalDistanceKm: s.totalDistanceKm,
      totalCo2Kg: s.totalCo2Kg,
      esgScore: s.esgScore,
      greenRouteHint: s.greenRouteHint,
      carbonOffsetsKg: s.carbonOffsetsKg,
      updatedAt: s.updatedAt,
    },
  });
});

app.get("/api/v1/analytics/live", (_req, res) => {
  res.json({ data: analyticsSnapshot() });
});

app.get("/api/v1/vehicles", (_req, res) => res.json({ data: vehicles }));
app.post("/api/v1/vehicles", (req, res) => {
  const b = req.body ?? {};
  const row = {
    id: randomUUID(),
    vehicleNumber: b.vehicleNumber ?? `NEW-${vehicles.length + 1}`,
    licensePlate: b.licensePlate ?? null,
    vehicleType: b.vehicleType ?? "TRUCK",
    make: b.make ?? null,
    model: b.model ?? null,
    variant: b.variant ?? null,
    year: b.year ?? null,
    color: b.color ?? null,
    fuelType: b.fuelType ?? null,
    carbonCopy: b.carbonCopy ?? b.transmission ?? null,
    engineNumber: b.engineNumber ?? null,
    chassisNumber: b.chassisNumber ?? null,
    vin: b.vin ?? b.chassisNumber ?? null,
    capacityWeightKg: b.capacityWeightKg ?? null,
    capacityVolumeM3: b.capacityVolumeM3 ?? null,
    status: b.status ?? "ACTIVE",
    currentDriverName: b.currentDriverName ?? null,
    checkInAt: b.checkInAt ?? null,
    checkOutAt: b.checkOutAt ?? null,
    driverHistory: Array.isArray(b.driverHistory) ? b.driverHistory : [],
    currentLatitude: String(b.currentLatitude ?? "19.076090"),
    currentLongitude: String(b.currentLongitude ?? "72.877426"),
    lastLocationUpdate: b.lastLocationUpdate ?? new Date().toISOString(),
    registrationDate: b.registrationDate ?? null,
    registrationExpiry: b.registrationExpiry ?? null,
    registrationAuthority: b.registrationAuthority ?? null,
    registrationStatus: b.registrationStatus ?? "ACTIVE",
    insuranceProvider: b.insuranceProvider ?? null,
    policyNumber: b.policyNumber ?? null,
    insuranceStartDate: b.insuranceStartDate ?? null,
    insuranceExpiryDate: b.insuranceExpiryDate ?? null,
    insuranceStatus: b.insuranceStatus ?? "ACTIVE",
    pucCertificateNumber: b.pucCertificateNumber ?? null,
    pucIssueDate: b.pucIssueDate ?? null,
    pucExpiryDate: b.pucExpiryDate ?? null,
    fitnessCertificate: b.fitnessCertificate ?? null,
    permitStatus: b.permitStatus ?? null,
    permitExpiry: b.permitExpiry ?? null,
  };
  vehicles.unshift(row);
  res.status(201).json({ data: row });
});
app.get("/api/v1/drivers", (_req, res) => res.json({ data: drivers }));
app.post("/api/v1/drivers", (req, res) => {
  const b = req.body ?? {};
  if (!b.fullName || !b.email || !b.licenseNumber) {
    return res.status(400).json({ error: "Full name, email, and license number required." });
  }
  const n = drivers.length + 1;
  const created = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const row = {
    id: randomUUID(),
    driverCode: b.driverCode || `DRV-${String(1000 + n).padStart(4, "0")}`,
    fullName: b.fullName,
    email: b.email,
    phone: b.phone ?? null,
    licenseNumber: b.licenseNumber,
    status: b.status || "ON_DUTY",
    safetyScore: "100.0",
    recentScores: [],
    onTimePct: 100,
    incidentCount: 0,
    recentOverall: [],
    totalMiles: 0,
    tripsToday: 0,
    employeeId: b.employeeId || `EMP-${String(1200 + n)}`,
    dateOfBirth: b.dateOfBirth ?? null,
    address: b.address ?? null,
    nationality: b.nationality ?? null,
    gender: b.gender ?? null,
    emergencyContact: b.emergencyContact ?? null,
    profileCreatedAt: created,
    licenseType: b.licenseType ?? null,
    licenseClass: b.licenseClass ?? null,
    licenseIssueDate: b.licenseIssueDate ?? null,
    licenseExpiry: b.licenseExpiry ?? null,
    licenseAuthority: b.licenseAuthority ?? null,
    licenseStatus: b.licenseStatus ?? "Valid",
    licenseVerification: b.licenseVerification ?? "Pending",
    licenseRestrictions: b.licenseRestrictions ?? null,
    employmentType: b.employmentType ?? "Full-time",
    joiningDate: b.joiningDate ?? null,
    department: b.department ?? null,
    assignedBranch: b.assignedBranch ?? null,
    supervisor: b.supervisor ?? null,
    shift: b.shift ?? null,
    reasonForLeaving: null,
    leavingDate: null,
    licenseDocument: b.licenseDocument || "None",
    idProof: b.idProof || "None",
    employmentDocuments: b.employmentDocuments || "None",
    trainingCertificates: b.trainingCertificates || "None",
    medicalCertificate: b.medicalCertificate || "None",
    otherDocuments: b.otherDocuments || "None",
  };
  drivers.unshift(row);
  io.emit("driver_update", row);
  res.status(201).json({ data: row });
});
app.get("/api/v1/drivers/:id", (req, res) => {
  const d = drivers.find((x) => x.id === req.params.id);
  if (!d) return res.status(404).json({ error: "Not found" });
  res.json({ data: d });
});
app.patch("/api/v1/drivers/:id", (req, res) => {
  const d = applyDriverPatch(req.params.id, req.body ?? {}, req.body?.source);
  if (!d) return res.status(404).json({ error: "Not found" });
  res.json({ data: d });
});
app.get("/api/v1/alerts", (_req, res) => res.json({ data: alerts }));
app.get("/api/v1/geofences", (_req, res) => res.json({ data: geofences }));
app.get("/api/v1/routes", (_req, res) => res.json({ data: routes }));
app.post("/api/v1/routes", (req, res) => {
  const b = req.body ?? {};
  const stops = Array.isArray(b.stops) ? b.stops : [];
  if (!b.name || String(b.name).trim().length < 1) {
    return res.status(400).json({ error: "Route name required." });
  }
  if (stops.length < 2) {
    return res.status(400).json({ error: "Need at least two stops." });
  }
  const normalized = stops.map((s, i) => ({
    id: s.id || `stop-${i + 1}`,
    seq: s.seq ?? i + 1,
    label: s.label || `Stop ${i + 1}`,
    address: s.address ?? "",
    lat: Number(s.lat),
    lng: Number(s.lng),
    eta: s.eta ?? null,
    status: s.status || "PENDING",
  }));
  const rawKm = distanceFromStops(normalized);
  const optimized = orderStopsNearest(normalized);
  const km = distanceFromStops(optimized);
  const saved = Math.max(0, rawKm - km);
  const score = Math.min(99, 82 + saved * 1.8).toFixed(1);
  const v = vehicleLookup(b.vehicleId);
  const d = driverLookup(b.driverId);
  const first = optimized[0]?.label;
  const last = optimized[optimized.length - 1]?.label;
  const row = {
    id: randomUUID(),
    code: b.code || nextRouteCode(),
    name: String(b.name).trim(),
    corridor: b.corridor || (first && last ? `${first} → ${last}` : "Custom"),
    depot: b.depot || "BKC Depot",
    routeType: b.routeType || "DELIVERY",
    routeStatus: b.routeStatus || "PLANNED",
    ...v,
    ...d,
    plannedDistanceKm: km.toFixed(2),
    actualDistanceKm: null,
    plannedDurationMinutes: b.plannedDurationMinutes ?? Math.round(km * 3.2 + 20),
    actualDurationMinutes: null,
    plannedStartTime: b.plannedStartTime || null,
    actualStartTime: null,
    plannedEndTime: b.plannedEndTime || null,
    actualEndTime: null,
    totalStops: optimized.length,
    completedStops: 0,
    optimizationScore: score,
    efficiencyScore: null,
    co2Kg: estimateCo2Kg(km).toFixed(3),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stops: optimized,
  };
  routes.unshift(row);
  io.emit("route_update", row);
  res.status(201).json({ data: row });
});
app.get("/api/v1/routes/:id", (req, res) => {
  const row = routes.find((x) => x.id === req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json({ data: row });
});
app.patch("/api/v1/routes/:id", (req, res) => {
  const row = applyRoutePatch(req.params.id, req.body ?? {});
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json({ data: row });
});
app.get("/api/v1/shipments", (_req, res) => res.json({ data: shipments }));
app.get("/api/v1/documents", (_req, res) => res.json({ data: documents }));
app.get("/api/v1/documents/expiring", (_req, res) => {
  res.json({
    data: documents.filter((d) => d.expiresAt && d.expiresAt <= "2026-10-01"),
  });
});

app.post("/api/v1/geofences", (req, res) => {
  const row = {
    id: randomUUID(),
    name: req.body.name ?? "New zone",
    geofenceType: req.body.geofenceType ?? "CUSTOMER_ZONE",
    centerLatitude: String(req.body.centerLatitude ?? 19.076),
    centerLongitude: String(req.body.centerLongitude ?? 72.877),
    radiusMeters: req.body.radiusMeters ?? 500,
  };
  geofences.unshift(row);
  res.status(201).json({ data: row });
});

app.post("/api/v1/shipments", (req, res) => {
  const trackingToken = randomUUID().replace(/-/g, "").slice(0, 16);
  const row = {
    id: randomUUID(),
    customerName: req.body.customerName ?? "Customer",
    deliveryAddress: req.body.deliveryAddress ?? "Delivery address",
    shipmentStatus: "CREATED",
    trackingToken,
    expectedDeliveryTime: new Date(Date.now() + 86400000).toISOString(),
  };
  shipments.unshift(row);
  res.status(201).json({ data: row });
});

app.patch("/api/v1/shipments/:id/status", (req, res) => {
  const s = shipments.find((x) => x.id === req.params.id);
  if (!s) return res.status(404).json({ error: "Not found" });
  s.shipmentStatus = req.body.status ?? s.shipmentStatus;
  if (s.shipmentStatus === "DELIVERED") {
    s.actualDeliveryTime = new Date().toISOString();
  }
  io.emit("shipment_update", s);
  res.json({ data: s });
});

app.post("/api/v1/shipments/:id/proof-of-delivery", (req, res) => {
  const s = shipments.find((x) => x.id === req.params.id);
  if (!s) return res.status(404).json({ error: "Not found" });
  s.shipmentStatus = "DELIVERED";
  s.actualDeliveryTime = new Date().toISOString();
  s.podNotes = req.body.notes ?? "";
  res.json({ data: s });
});

app.post("/api/v1/routes/optimize", (req, res) => {
  const locs = req.body.deliveryLocations ?? [
    { id: "a", lat: 19.1, lng: 72.9, label: "Andheri East" },
    { id: "b", lat: 19.12, lng: 72.85, label: "Andheri West" },
    { id: "c", lat: 19.08, lng: 72.92, label: "Powai" },
  ];
  const vehicleId = req.body.vehicleIds?.[0] ?? vehicles[0]?.id;
  const depotLat = Number(req.body.depotLat ?? 19.066);
  const depotLng = Number(req.body.depotLng ?? 72.8697);
  const remaining = [...locs];
  let curLat = depotLat;
  let curLng = depotLng;
  const ordered = [];
  while (remaining.length) {
    remaining.sort(
      (a, b) =>
        haversineKm(curLat, curLng, a.lat, a.lng) -
        haversineKm(curLat, curLng, b.lat, b.lng),
    );
    const next = remaining.shift();
    ordered.push(next);
    curLat = next.lat;
    curLng = next.lng;
  }
  const stops = [
    {
      id: "depot-start",
      seq: 1,
      label: "BKC Depot",
      address: "G Block, Bandra Kurla Complex",
      lat: depotLat,
      lng: depotLng,
      eta: isoOffset(3600000),
      status: "PENDING",
    },
    ...ordered.map((s, i) => ({
      id: s.id || `opt-${i + 1}`,
      seq: i + 2,
      label: s.label || `Stop ${i + 1}`,
      address: s.address ?? "",
      lat: s.lat,
      lng: s.lng,
      eta: isoOffset((i + 2) * 1800000),
      status: "PENDING",
    })),
  ];
  const km = distanceFromStops(stops);
  const v = vehicleLookup(vehicleId);
  const first = stops[0]?.label;
  const last = stops[stops.length - 1]?.label;
  const row = {
    id: randomUUID(),
    code: nextRouteCode(),
    name: "Optimized sample day",
    corridor: first && last ? `${first} → ${last}` : "Sample",
    depot: "BKC Depot",
    routeType: "DELIVERY",
    routeStatus: "PLANNED",
    ...v,
    ...driverLookup(D_RAJESH),
    plannedDistanceKm: km.toFixed(2),
    actualDistanceKm: null,
    plannedDurationMinutes: Math.round(km * 3.2 + 20),
    actualDurationMinutes: null,
    plannedStartTime: isoOffset(3600000),
    actualStartTime: null,
    plannedEndTime: isoOffset(3600000 + Math.round(km * 3.2 + 20) * 60000),
    actualEndTime: null,
    totalStops: stops.length,
    completedStops: 0,
    optimizationScore: "88.0",
    efficiencyScore: null,
    co2Kg: estimateCo2Kg(km).toFixed(3),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stops,
  };
  routes.unshift(row);
  io.emit("route_update", row);
  res.status(202).json({
    status: "completed",
    jobId: randomUUID(),
    routeId: row.id,
    routes: [row],
  });
});

app.patch("/api/v1/alerts/:id/resolve", (req, res) => {
  const a = alerts.find((x) => x.id === req.params.id);
  if (!a) return res.status(404).json({ error: "Not found" });
  a.isResolved = true;
  res.json({ data: a });
});

app.post("/api/v1/telemetry/gps", (req, res) => {
  const v = vehicles.find((x) => x.id === req.body.vehicleId);
  if (v) {
    v.currentLatitude = String(req.body.latitude);
    v.currentLongitude = String(req.body.longitude);
  }
  const payload = {
    vehicleId: req.body.vehicleId,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    speed: req.body.speed ?? 0,
    heading: req.body.heading ?? 0,
    timestamp: new Date().toISOString(),
  };
  io.to(`fleet:${fleetId}:tracking`).emit("location_update", payload);
  io.emit("location_update", payload);

  if ((req.body.speed ?? 0) > 80) {
    const alert = {
      id: randomUUID(),
      alertType: "HARSH_DRIVING",
      alertSeverity: "WARNING",
      alertMessage: `Speeding ${Math.round(req.body.speed)} km/h`,
      isResolved: false,
      createdAt: new Date().toISOString(),
    };
    alerts.unshift(alert);
    io.emit("alert", alert);
    const name = v?.currentDriverName;
    if (name) {
      const driver = drivers.find((x) => x.fullName === name);
      if (driver) {
        const n = Number(String(driver.speedingEvents ?? "0").replace(/\D/g, "")) || 0;
        const speedMph = Math.round((req.body.speed ?? 0) * 0.621371);
        const prevMax = Number(String(driver.maxSpeed ?? "0").replace(/\D/g, "")) || 0;
        applyDriverPatch(
          driver.id,
          {
            speedingEvents: String(n + 1),
            lastActiveDate: new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            maxSpeed: `${Math.max(prevMax, speedMph)} mph`,
          },
          "software",
        );
      }
    }
  }
  res.json({ success: true });
});

io.on("connection", (socket) => {
  const fid = socket.handshake.auth?.fleetId || fleetId;
  socket.join(`fleet:${fid}:tracking`);
});

function pushSeries(key, value) {
  const now = new Date();
  analyticsLive.series[key].push({
    t: now.toISOString(),
    label: now.toLocaleTimeString([], { minute: "2-digit", second: "2-digit" }),
    value: Number(value.toFixed(1)),
  });
  if (analyticsLive.series[key].length > 24) {
    analyticsLive.series[key].shift();
  }
}

/** Simulate live GPS so map feels alive */
setInterval(() => {
  for (const v of vehicles.filter((x) => x.status === "ACTIVE")) {
    const lat = Number(v.currentLatitude) + (Math.random() - 0.5) * 0.004;
    const lng = Number(v.currentLongitude) + (Math.random() - 0.5) * 0.004;
    v.currentLatitude = lat.toFixed(6);
    v.currentLongitude = lng.toFixed(6);
    const payload = {
      vehicleId: v.id,
      latitude: lat,
      longitude: lng,
      speed: 20 + Math.random() * 45,
      heading: Math.random() * 360,
      timestamp: new Date().toISOString(),
    };
    io.emit("location_update", payload);
  }
}, 3500);

/** Live analytics drift + broadcast */
setInterval(() => {
  const tickDistance = 0.8 + Math.random() * 2.4;
  analyticsLive.totalDistanceKm += tickDistance;
  analyticsLive.totalCo2Kg += tickDistance * 0.21;
  analyticsLive.onTimeDeliveryRate = Math.min(
    99.5,
    Math.max(84, analyticsLive.onTimeDeliveryRate + (Math.random() - 0.48) * 1.4),
  );
  analyticsLive.avgCostPerKm = Math.min(
    26,
    Math.max(14, analyticsLive.avgCostPerKm + (Math.random() - 0.5) * 0.35),
  );
  analyticsLive.avgUtilization = Math.min(
    96,
    Math.max(55, analyticsLive.avgUtilization + (Math.random() - 0.5) * 1.8),
  );
  analyticsLive.avgSafetyScore = Math.min(
    99,
    Math.max(80, analyticsLive.avgSafetyScore + (Math.random() - 0.5) * 0.4),
  );
  analyticsLive.esgScore = Math.min(
    95,
    Math.max(60, analyticsLive.esgScore + (Math.random() - 0.45) * 0.5),
  );
  analyticsLive.carbonOffsetsKg += Math.random() * 0.15;

  pushSeries("onTime", analyticsLive.onTimeDeliveryRate);
  pushSeries("distance", tickDistance * 4);
  pushSeries("cost", analyticsLive.avgCostPerKm);
  pushSeries("co2", tickDistance * 0.21 * 8);

  io.emit("analytics_update", analyticsSnapshot());
}, 3000);

const PORT = Number(process.env.PORT || 3001);
httpServer.listen(PORT, () => {
  console.log(`Demo API on http://localhost:${PORT}`);
  console.log("Login: owner@demo.fleet / demo12345");
});
