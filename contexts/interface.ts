export interface ApiStatusInterface {
  url: string;
  isUp: boolean;
  lastChecked: Date | null;
  error: string | null;
}

export interface AppDataInterface {
  endpoints: string[];
  intervalInMS: number;
  intervalValue: number;
  setEndpoints: (endpoints: string[]) => void;
  setIntervalValue: (intervalValue: number) => void;
  setStatuses: (statuses: ApiStatusInterface[]) => void;
  statuses: ApiStatusInterface[];
}
