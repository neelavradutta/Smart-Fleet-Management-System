import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

/** Driver hub — PRD §5.3 */
export default function DriverDashboard() {
  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.greeting}>Good morning, Driver</Text>
        <Text style={styles.sub}>Today&apos;s summary</Text>
        <View style={styles.grid}>
          {[
            ["Deliveries", "8", "#00d9ff"],
            ["Safety", "96", "#10b981"],
            ["Distance", "124", "#7c3aed"],
            ["Hours", "6.5", "#f59e0b"],
          ].map(([label, value, color]) => (
            <View key={label} style={[styles.stat, { borderLeftColor: color }]}>
              <Text style={styles.statLabel}>{label}</Text>
              <Text style={[styles.statValue, { color }]}>{value}</Text>
            </View>
          ))}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today&apos;s route</Text>
          <Text style={styles.routeLine}>Stops: 12 · 86 km · ~5h</Text>
          <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnText}>View route</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 16 },
  greeting: { fontSize: 28, fontWeight: "700", color: "#1f2937" },
  sub: { fontSize: 14, color: "#6b7280", marginBottom: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 },
  stat: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    borderLeftWidth: 4,
    elevation: 2,
  },
  statLabel: { fontSize: 12, color: "#6b7280", marginBottom: 6 },
  statValue: { fontSize: 24, fontWeight: "700" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#1f2937", marginBottom: 8 },
  routeLine: { color: "#4b5563", marginBottom: 12 },
  btn: {
    backgroundColor: "#00d9ff",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "600" },
});
