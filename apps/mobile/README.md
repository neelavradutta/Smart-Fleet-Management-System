# SFMS Mobile (React Native / Expo)

Scaffold from [Smart_Fleet_Frontend_PRD.md](../../Smart_Fleet_Frontend_PRD.md) §5.

## Screens (stubs)

- `src/screens/auth/LoginScreen.tsx`
- `src/screens/dashboard/DriverDashboard.tsx`
- `src/screens/tracking/LiveTracking.tsx`
- `src/screens/deliveries/ProofOfDelivery.tsx`

## Boot

```bash
cd apps/mobile
npx create-expo-app@latest . --template blank-typescript
# merge stub screens, then:
npx expo start
```

Design tokens match web: cyan `#00d9ff`, purple `#7c3aed`, light `#f8f9fa`.
