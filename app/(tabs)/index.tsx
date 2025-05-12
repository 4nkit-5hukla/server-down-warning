import { useEffect, useState } from "react";
import { Alert, Button, ScrollView, StyleSheet, View } from "react-native";

import { AddApiModal } from "@/components/AddApiModal";
import { ApiList } from "@/components/ApiList";
import { HelloWave } from "@/components/HelloWave";
import { IntervalModal } from "@/components/IntervalModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAppData } from "@/contexts/Appdata";
import { useApiMonitor } from "@/services/ApiMonitorService";

export default function HomeScreen() {
  const { endpoints, intervalValue, setEndpoints, statuses, setIntervalValue } = useAppData();
  const { isMonitoring, startMonitoring, stopMonitoring, snoozeAlarm } = useApiMonitor();
  const [addApiModalVisible, setAddApiModalVisible] = useState(false);
  const [intervalModalVisible, setIntervalModalVisible] = useState(false);
  const hasFailures = statuses.some((status) => !status.isUp);

  // Show alert when failures are detected
  useEffect(() => {
    if (hasFailures && isMonitoring) {
      Alert.alert("API Failure Detected", "One or more APIs are not responding correctly.", [{ text: "OK" }]);
    }
  }, [hasFailures, isMonitoring]);

  const handleAddEndpoint = (endpoint: string) => {
    setEndpoints([...endpoints, endpoint]);
  };

  const handleRemoveEndpoint = (endpoint: string) => {
    setEndpoints(endpoints.filter((e) => e !== endpoint));
  };

  return (
    <ScrollView>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome User!</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.headContainer}>
        <ThemedText type="subtitle">API List</ThemedText>
        <ThemedText type="subtitle">{intervalValue} Sec</ThemedText>
      </ThemedView>
      <ThemedView style={styles.headContainer}>
        <Button title="Add API" onPress={() => setAddApiModalVisible(true)} />
        <Button title="Change Interval" onPress={() => setIntervalModalVisible(true)} />
      </ThemedView>

      <ThemedView style={styles.monitoringContainer}>
        <ThemedText type="subtitle">Monitoring Status</ThemedText>
        <View style={styles.monitoringControls}>
          <Button
            title={isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
            onPress={isMonitoring ? stopMonitoring : startMonitoring}
            color={isMonitoring ? "red" : "green"}
          />
          <ThemedText style={styles.statusText}>{isMonitoring ? "Active" : "Inactive"}</ThemedText>
        </View>
        {hasFailures && isMonitoring && (
          <View style={styles.alarmControls}>
            <Button title="Snooze Alarm" onPress={snoozeAlarm} color="orange" />
            <ThemedText style={styles.alarmText}>⚠️ API Failures Detected</ThemedText>
          </View>
        )}
      </ThemedView>
      {endpoints.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText>No API endpoints added yet</ThemedText>
        </ThemedView>
      ) : (
        <ApiList onRemove={handleRemoveEndpoint} />
      )}
      <AddApiModal
        visible={addApiModalVisible}
        onClose={() => setAddApiModalVisible(false)}
        onAdd={handleAddEndpoint}
        existingEndpoints={endpoints}
      />

      <IntervalModal
        visible={intervalModalVisible}
        onClose={() => setIntervalModalVisible(false)}
        onSave={setIntervalValue}
        currentInterval={intervalValue}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 8,
  },
  headContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    gap: 8,
    marginBottom: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  monitoringContainer: {
    padding: 16,
    marginBottom: 16,
  },
  monitoringControls: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 16,
  },
  alarmControls: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 16,
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    padding: 8,
    borderRadius: 8,
  },
  statusText: {
    fontWeight: "bold",
  },
  alarmText: {
    fontWeight: "bold",
    color: "red",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
});
