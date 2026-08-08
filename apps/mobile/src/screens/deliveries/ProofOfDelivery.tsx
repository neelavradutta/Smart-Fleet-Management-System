import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";

/** ePOD — PRD §5.5 (wire camera/signature libs in Expo build) */
export default function ProofOfDelivery({
  customerName = "Customer",
}: {
  customerName?: string;
}) {
  const [notes, setNotes] = useState("");

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Proof of Delivery</Text>
      <Text style={styles.sub}>Delivery to: {customerName}</Text>
      <Text style={styles.section}>Photos / signature — attach in Expo build</Text>
      <TextInput
        style={styles.notes}
        placeholder="Delivery notes…"
        multiline
        value={notes}
        onChangeText={setNotes}
      />
      <TouchableOpacity style={styles.btn}>
        <Text style={styles.btnText}>Confirm delivery</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 16 },
  title: { fontSize: 24, fontWeight: "700", color: "#1f2937" },
  sub: { color: "#6b7280", marginBottom: 20 },
  section: {
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    padding: 24,
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 16,
  },
  notes: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    marginBottom: 16,
  },
  btn: {
    backgroundColor: "#00d9ff",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
