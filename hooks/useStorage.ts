import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

/**
 * A custom hook for managing storage operations with a generic type.
 * @param key - The storage key for retrieving and storing the value
 * @param defaultValue - The default value to use if no stored value exists
 * @returns A tuple containing:
 *  - The current stored value
 *  - A function to set a new value
 *  - A function to delete the stored value
 */
export const useStorage = <S>(key: string, defaultValue: S): [S, (value: S) => void, () => void] => {
  const [storedValue, setStoredValue] = useState<S>(defaultValue);
  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(key);
        if (jsonValue !== null) {
          try {
            setStoredValue(JSON.parse(jsonValue));
          } catch (error: any) {
            setStoredValue(error.name === "SyntaxError" ? (jsonValue as unknown as S) : defaultValue);
          }
        }
      } catch (error) {
        console.log("Error loading from storage:", error);
      }
    };
    loadStoredValue();
  }, [key, defaultValue]);

  const setValue = async (value: S) => {
    try {
      setStoredValue(value);

      if (value === undefined || value === null) {
        await AsyncStorage.removeItem(key);
      } else {
        const valueToStore = typeof value === "object" ? JSON.stringify(value) : String(value);
        await AsyncStorage.setItem(key, valueToStore);
      }
    } catch (error) {
      console.log("Error saving to storage:", error);
    }
  };

  const delValue = async () => {
    try {
      await AsyncStorage.removeItem(key);
      setStoredValue(defaultValue);
    } catch (error) {
      console.log("Error removing from storage:", error);
    }
  };
  return [storedValue, setValue, delValue];
};
