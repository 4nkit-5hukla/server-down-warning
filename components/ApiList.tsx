import React from "react";
import { FlatList, StyleSheet, TouchableOpacity } from "react-native";

import { useAppData } from "@/contexts/Appdata";

import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { IconSymbol } from "./ui/IconSymbol";

interface ApiListProps {
  onRemove: (endpoint: string) => void;
}

export function ApiList({ onRemove }: ApiListProps) {
  const { endpoints, statuses } = useAppData();

  return (
    <FlatList
      data={endpoints}
      keyExtractor={(item) => item}
      renderItem={({ item }) => {
        const status = statuses.find((s) => s.url === item);
        const isUp = status ? status.isUp : false;
        const lastChecked =
          status && status.lastChecked ? new Date(status.lastChecked).toLocaleTimeString() : "Not checked yet";
        return (
          <ThemedView style={styles.apiItem}>
            <IconSymbol
              size={24}
              style={styles.statusIcon}
              color={isUp ? "green" : "red"}
              name={isUp ? "checkmark.circle.fill" : "xmark.circle.fill"}
            />
            <ThemedView style={styles.apiInfo}>
              <ThemedText style={styles.apiText}>{item}</ThemedText>
              <ThemedText style={styles.apiStatus}>
                {isUp ? "Online" : "Offline"} • Last checked: {lastChecked}
              </ThemedText>
              {status && status.error && !isUp && <ThemedText style={styles.apiError}>{status.error}</ThemedText>}
            </ThemedView>
            <TouchableOpacity onPress={() => onRemove(item)}>
              <IconSymbol name="trash.fill" size={20} color="red" />
            </TouchableOpacity>
          </ThemedView>
        );
      }}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    width: "100%",
  },
  apiItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  apiInfo: {
    flex: 1,
    marginLeft: 10,
  },
  apiText: {
    fontWeight: "bold",
  },
  apiStatus: {
    fontSize: 12,
    marginTop: 4,
  },
  apiError: {
    fontSize: 12,
    color: "red",
    marginTop: 4,
  },
  statusIcon: {
    marginRight: 8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
});
