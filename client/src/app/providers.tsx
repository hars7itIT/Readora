import React, { createContext, useContext } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface AppContextType {
  online: boolean;
}

const AppContext = createContext<AppContextType>({ online: true });

export const useAppEnvironment = () => useContext(AppContext);

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const online = useOnlineStatus();

  return <AppContext.Provider value={{ online }}>{children}</AppContext.Provider>;
};
