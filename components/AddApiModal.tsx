import React, { useState } from "react";
import { Alert, Button, Modal, StyleSheet, TextInput, View } from "react-native";

import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface AddApiModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (endpoint: string) => void;
  existingEndpoints: string[];
}

export function AddApiModal({ visible, onClose, onAdd, existingEndpoints }: AddApiModalProps) {
  const [endpoint, setEndpoint] = useState("");

  const handleAdd = () => {
    if (!endpoint.trim()) {
      Alert.alert("Error", "Please enter a valid API endpoint");
      return;
    }

    if (existingEndpoints.includes(endpoint)) {
      Alert.alert("Error", "This API endpoint already exists");
      return;
    }

    onAdd(endpoint);
    setEndpoint("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.centeredView}>
        <ThemedView style={styles.modalView}>
          <ThemedText type="subtitle">Add API Endpoint</ThemedText>
          <TextInput
            style={styles.input}
            value={endpoint}
            onChangeText={setEndpoint}
            placeholder="https://api.example.com"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.buttonContainer}>
            <Button title="Cancel" onPress={onClose} />
            <Button title="Add" onPress={handleAdd} />
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "80%",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});
