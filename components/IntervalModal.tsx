import React, { useState } from "react";
import { Modal, StyleSheet, TextInput, View, Button, Alert } from "react-native";

import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface IntervalModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (interval: number) => void;
  currentInterval: number;
}

export function IntervalModal({ visible, onClose, onSave, currentInterval }: IntervalModalProps) {
  const [intervalValue, setIntervalValue] = useState(currentInterval.toString());

  const handleSave = () => {
    const newInterval = parseInt(intervalValue);
    
    if (isNaN(newInterval) || newInterval < 5) {
      Alert.alert("Error", "Please enter a valid number (minimum 5 seconds)");
      return;
    }

    onSave(newInterval);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.centeredView}>
        <ThemedView style={styles.modalView}>
          <ThemedText type="subtitle">Change Polling Interval</ThemedText>
          <TextInput
            style={styles.input}
            value={intervalValue}
            onChangeText={setIntervalValue}
            placeholder="Enter seconds (min: 5)"
            keyboardType="numeric"
          />
          <View style={styles.buttonContainer}>
            <Button title="Cancel" onPress={onClose} />
            <Button title="Save" onPress={handleSave} />
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