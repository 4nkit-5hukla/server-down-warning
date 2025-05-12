import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Button, StyleSheet, TextInput, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = ["40%"];

  // Handle visibility changes
  useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible]);

  const handleSave = () => {
    const newInterval = parseInt(intervalValue);

    if (isNaN(newInterval) || newInterval < 5) {
      Alert.alert("Error", "Please enter a valid number (minimum 5 seconds)");
      return;
    }

    onSave(newInterval);
    onClose();
  };

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    [],
  );

  return (
    <GestureHandlerRootView style={{ flex: 0 }}>
      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          snapPoints={snapPoints}
          backdropComponent={renderBackdrop}
          onDismiss={onClose}
          handleIndicatorStyle={styles.indicator}
        >
          <ThemedView style={styles.contentContainer}>
            <ThemedText type="subtitle" style={styles.title}>
              Change Polling Interval
            </ThemedText>
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
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  title: {
    marginBottom: 20,
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
    marginTop: 20,
  },
  indicator: {
    width: 50,
    backgroundColor: "#ccc",
  },
});
