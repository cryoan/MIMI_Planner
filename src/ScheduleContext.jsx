import React, { createContext, useEffect, useState } from 'react';
import { useDocSchedule } from './schedule';
import { executeCustomPlanningAlgorithm } from './customPlanningLogic.js';

export const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
  const { doc, loading } = useDocSchedule();
  const [customScheduleData, setCustomScheduleData] = useState(null);

  useEffect(() => {
    if (doc) {
      console.log('ScheduleContext: Executing custom planning algorithm...');
      const customResult = executeCustomPlanningAlgorithm();
      setCustomScheduleData(customResult);
    }
  }, [doc]);

  return (
    <ScheduleContext.Provider value={{ loading, customScheduleData }}>
      {children}
    </ScheduleContext.Provider>
  );
};
