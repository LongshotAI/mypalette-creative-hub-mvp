
import React, { createContext, useContext } from 'react';
import { useAnalytics } from '@/hooks/analytics';

// Create context with all analytics functions
const AnalyticsContext = createContext<ReturnType<typeof useAnalytics> | undefined>(undefined);

/**
 * Provider component that wraps your app and makes analytics available
 * to any component that calls useAnalyticsContext()
 */
export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const analytics = useAnalytics();
  
  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
};

/**
 * Hook for using analytics functions from any component
 */
export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
};
