import axios, { isAxiosError } from "axios";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";

import { ApiStatusInterface } from "@/contexts";
import { useAppData } from "@/contexts/Appdata";
import { useStorage } from "@/hooks/useStorage";

// Define the background task name
const BACKGROUND_FETCH_TASK = "background-api-monitor";

// Register the task before using it
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    // Fetch stored data
    const storedEndpoints = await getStoredEndpoints();
    const isMonitoring = await getIsMonitoring();

    // If not monitoring, return no backoff
    if (!isMonitoring || storedEndpoints.length === 0) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Check all endpoints
    const results = await Promise.all(storedEndpoints.map((url) => checkEndpointInBackground(url)));

    // Store the results
    await storeResults(results);

    // Return success
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error("Background task error:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Helper functions for the background task
async function getStoredEndpoints() {
  try {
    const jsonValue = await global.localStorage.getItem("endpoints");
    return jsonValue ? (JSON.parse(jsonValue) as string[]) : [];
  } catch (error) {
    console.error("Failed to get stored endpoints:", error);
    return [];
  }
}

async function getIsMonitoring() {
  try {
    const jsonValue = await global.localStorage.getItem("monitoring");
    return jsonValue ? JSON.parse(jsonValue) : false;
  } catch (error) {
    console.error("Failed to get monitoring status:", error);
    return false;
  }
}

async function storeResults(results: ApiStatusInterface[]) {
  try {
    await global.localStorage.setItem("statuses", JSON.stringify(results));
  } catch (error) {
    console.error("Failed to store results:", error);
  }
}

async function checkEndpointInBackground(url: string) {
  try {
    // Get current statuses
    const jsonValue = await global.localStorage.getItem("statuses");
    const statuses = jsonValue ? (JSON.parse(jsonValue) as ApiStatusInterface[]) : [];
    const status = statuses.find((s) => s.url === url);

    const response = await axios.get(url, { timeout: 10000 });
    const currentUpStatus = response.status >= 200 && response.status < 300;
    const currentStatusReturn = {
      url,
      isUp: currentUpStatus,
      lastChecked: new Date(),
      error: null,
    };

    return status
      ? status.isUp === currentUpStatus
        ? { ...status, lastChecked: new Date() }
        : currentStatusReturn
      : currentStatusReturn;
  } catch (error) {
    let errorMessage = "Unknown error";

    if (isAxiosError(error)) {
      errorMessage = error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      url,
      isUp: false,
      lastChecked: new Date(),
      error: errorMessage,
    };
  }
}

export function useApiMonitor() {
  const { endpoints, intervalInMS, statuses, setStatuses } = useAppData();
  const [isMonitoring, setIsMonitoring] = useStorage<boolean>("monitoring", false);
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endpointsRef = useRef(endpoints);
  const isMonitoringRef = useRef(isMonitoring);
  const soundRef = useRef<Audio.Sound | null>(null);
  const intervalInMSRef = useRef(intervalInMS);
  const previousHasFailuresRef = useRef(false);
  const hasFailures = statuses.some((status) => !status.isUp);

  // Load sound effect
  useEffect(() => {
    const loadSound = async () => {
      try {
        // Configure audio session to use alarm volume stream
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          playThroughEarpieceAndroid: false,
        });

        const { sound } = await Audio.Sound.createAsync(require("@/assets/sounds/alarm.mp3"), {
          isLooping: true,
          shouldPlay: false,
        });

        // Set the sound to play at maximum volume
        await sound.setVolumeAsync(1.0);

        soundRef.current = sound;
      } catch (error) {
        console.error("Failed to load alarm sound:", error);
      }
    };

    loadSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Play alarm when failures are detected
  useEffect(() => {
    const playAlarm = async () => {
      if (hasFailures && isMonitoring && !previousHasFailuresRef.current) {
        try {
          if (soundRef.current) {
            await soundRef.current.playAsync();
          }
        } catch (error) {
          console.error("Failed to play alarm sound:", error);
        }
      } else if ((!hasFailures || !isMonitoring) && previousHasFailuresRef.current) {
        try {
          if (soundRef.current) {
            await soundRef.current.stopAsync();
          }
        } catch (error) {
          console.error("Failed to stop alarm sound:", error);
        }
      }

      previousHasFailuresRef.current = hasFailures && isMonitoring;
    };

    playAlarm();
  }, [hasFailures, isMonitoring]);

  // Update refs when values change
  useEffect(() => {
    endpointsRef.current = endpoints;
  }, [endpoints]);

  useEffect(() => {
    isMonitoringRef.current = isMonitoring;
  }, [isMonitoring]);

  useEffect(() => {
    intervalInMSRef.current = intervalInMS;
  }, [intervalInMS]);

  // Function to check a single endpoint
  const checkEndpoint = async (url: string) => {
    try {
      const status = statuses.find((s) => s.url === url);
      const response = await axios.get(url, { timeout: 10000 });
      const currentUpStatus = response.status >= 200 && response.status < 300;
      const currentStatusReturn = {
        url,
        isUp: currentUpStatus,
        lastChecked: new Date(),
        error: null,
      };
      return status
        ? status.isUp === currentUpStatus
          ? { ...status, lastChecked: new Date() }
          : currentStatusReturn
        : currentStatusReturn;
    } catch (error) {
      let errorMessage = "Unknown error";

      if (isAxiosError(error)) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        url,
        isUp: false,
        lastChecked: new Date(),
        error: errorMessage,
      };
    }
  };

  // Function to check all endpoints
  const checkAllEndpoints = async () => {
    if (!isMonitoringRef.current || endpointsRef.current.length === 0) return;

    try {
      const results = await Promise.all(endpointsRef.current.map((url) => checkEndpoint(url)));
      setStatuses(results);
    } catch (error) {
      console.error("Error checking endpoints:", error);
    }
  };

  // Register background fetch task
  const registerBackgroundFetch = async () => {
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: Math.max(60, intervalInMSRef.current / 1000), // Minimum 60 seconds (iOS limitation)
        stopOnTerminate: false, // Continue running when app is terminated
        startOnBoot: true, // Run task on device boot
      });
      console.log("Background fetch task registered");
    } catch (error) {
      console.error("Background fetch registration failed:", error);
    }
  };

  // Unregister background fetch task
  const unregisterBackgroundFetch = async () => {
    try {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
      console.log("Background fetch task unregistered");
    } catch (error) {
      console.error("Background fetch unregistration failed:", error);
    }
  };

  // Set up and tear down the monitoring interval
  const setupMonitoring = useCallback(() => {
    // Clear any existing interval
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    // If not monitoring, don't set up a new interval
    if (!isMonitoringRef.current) return;

    // Initial check
    checkAllEndpoints();

    // Set up new interval with the current interval time
    intervalIdRef.current = setInterval(checkAllEndpoints, intervalInMSRef.current);

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, []);

  // Start monitoring
  const startMonitoring = useCallback(async () => {
    setIsMonitoring(true);

    // Register background fetch if on a real device
    if (Platform.OS !== "web") {
      await registerBackgroundFetch();
    }
  }, [setIsMonitoring]);

  // Stop monitoring
  const stopMonitoring = useCallback(async () => {
    setIsMonitoring(false);

    // Unregister background fetch
    if (Platform.OS !== "web") {
      await unregisterBackgroundFetch();
    }

    // Stop alarm when monitoring is stopped
    if (soundRef.current) {
      soundRef.current.stopAsync().catch((error) => {
        console.error("Failed to stop alarm sound:", error);
      });
    }
  }, [setIsMonitoring]);

  // Function to snooze the alarm
  const snoozeAlarm = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
      } catch (error) {
        console.error("Failed to stop alarm sound:", error);
      }
    }
    previousHasFailuresRef.current = false;
  }, []);

  // Set up or tear down monitoring when isMonitoring changes
  useEffect(() => {
    return setupMonitoring();
  }, [isMonitoring, setupMonitoring]);

  // Update interval when intervalInMS changes
  useEffect(() => {
    if (isMonitoring) {
      return setupMonitoring();
    }
  }, [intervalInMS, isMonitoring, setupMonitoring]);

  // Check for existing background fetch registration on component mount
  useEffect(() => {
    const checkBackgroundFetch = async () => {
      if (Platform.OS === "web") return;

      const status = await BackgroundFetch.getStatusAsync();
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);

      console.log(`Background fetch status: ${status}, registered: ${isRegistered}`);

      // If monitoring is active but task is not registered, register it
      if (isMonitoring && !isRegistered) {
        await registerBackgroundFetch();
      }
      // If monitoring is not active but task is registered, unregister it
      else if (!isMonitoring && isRegistered) {
        await unregisterBackgroundFetch();
      }
    };

    checkBackgroundFetch();

    // Clean up on unmount
    return () => {
      if (Platform.OS !== "web" && !isMonitoring) {
        unregisterBackgroundFetch();
      }
    };
  }, []);

  return {
    isMonitoring,
    hasFailures,
    startMonitoring,
    stopMonitoring,
    checkAllEndpoints,
    snoozeAlarm,
  };
}
