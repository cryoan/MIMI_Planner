import React, { createContext, useEffect, useState } from 'react';
import { useDocSchedule, combo } from './schedule';

export const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
  const { doc, loading } = useDocSchedule();
  const [currentCombo, setCurrentCombo] = useState(null);

  useEffect(() => {
    if (doc) {
      setCurrentCombo(combo(doc));
    }
  }, [doc]);

  return (
    <ScheduleContext.Provider value={{ loading, currentCombo }}>
      {children}
    </ScheduleContext.Provider>
  );
};
