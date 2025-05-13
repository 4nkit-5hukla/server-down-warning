import axios, { isAxiosError } from "axios";
import { Audio } from "expo-av";
import { useCallback, useEffect, useRef } from "react";

import { useAppData } from "@/contexts/Appdata";
import { useStorage } from "@/hooks/useStorage";

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
        const { sound } = await Audio.Sound.createAsync(require("@/assets/sounds/alarm.mp3"), { isLooping: true });
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
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
  }, []);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);

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

  return {
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    checkAllEndpoints,
    snoozeAlarm,
  };
}
