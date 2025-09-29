import React, { createContext, useEffect, useState } from 'react';
import { useDocSchedule } from './schedule';
import { executeCustomPlanningAlgorithm } from './customPlanningLogic.js';

export const ScheduleContext = createContext();

export const ScheduleProvider = ({ children, selectedRotationCycle = "honeymoon_NS_noHDJ" }) => {
  const { doc, loading } = useDocSchedule();
  const [customScheduleData, setCustomScheduleData] = useState(null);

  useEffect(() => {
    if (doc) {
      console.log(`ScheduleContext: Executing custom planning algorithm with cycle: ${selectedRotationCycle}...`);
      const customResult = executeCustomPlanningAlgorithm(selectedRotationCycle);
      setCustomScheduleData(customResult);
    }
  }, [doc, selectedRotationCycle]);

  return (
    <ScheduleContext.Provider value={{ loading, customScheduleData, selectedRotationCycle }}>
      {children}
    </ScheduleContext.Provider>
  );
};
