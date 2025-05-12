import { createContext, FC, ReactNode, useContext } from "react";

import { useStorage } from "@/hooks/useStorage";

import { ApiStatusInterface, AppDataInterface } from ".";

const AppContext = createContext<AppDataInterface | undefined>(undefined);

const AppData = AppContext.Provider;

const AppDataProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [endpoints, setEndpoints] = useStorage<string[]>("endpoints", []);
  const [intervalValue, setIntervalValue] = useStorage<number>("interval", 5);
  const [statuses, setStatuses] = useStorage<ApiStatusInterface[]>("statuses", []);
  const intervalInMS = intervalValue * 1000;

  const data: AppDataInterface = {
    endpoints,
    intervalInMS,
    intervalValue,
    setEndpoints,
    setIntervalValue,
    setStatuses,
    statuses,
  };

  return <AppData value={data}>{children}</AppData>;
};

export const useAppData = () => {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw Error("Item must be used inside of AppDataProvider, otherwise it will not function correctly.");
  }

  return context;
};

export default AppDataProvider;
