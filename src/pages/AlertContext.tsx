import { AlertData, AlertInfo } from '@/components/Alert';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AlertContextValues {
    alerts: AlertInfo[],
    addAlert: (alert: AlertData) => void,
    removeAlert: (id: number) => void
}

const initialContextValue: AlertContextValues = {
    alerts: [],
    addAlert: () => {},
    removeAlert: () => {},
};

const AlertContext = createContext<AlertContextValues>(initialContextValue);

export const useAlert = () => {
  return useContext(AlertContext);
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<AlertInfo[]>([]);

  const addAlert = (alert: AlertData) => {
    setAlerts((prevAlerts) => [...prevAlerts, { ...alert, id: prevAlerts.length }]);
  };

  const removeAlert = (id: number) => {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
  };

  const contextValues: AlertContextValues = {
    alerts,
    addAlert,
    removeAlert,
  };

  return (
    <AlertContext.Provider value={contextValues}>
      {children}
    </AlertContext.Provider>
  );
};
