import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Button, StyleSheet, TextInput, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
              Add API Endpoint
            </ThemedText>
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
