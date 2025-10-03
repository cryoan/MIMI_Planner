import React, { createContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useDocSchedule } from './schedule';
import { executeCustomPlanningAlgorithm, generateCustomPlanningReport } from './customPlanningLogic.js';
import {
  doctorProfiles as initialDoctorProfiles,
  docActivities as initialDocActivities,
  wantedActivities as initialWantedActivities,
  rotationTemplates as initialRotationTemplates,
  generateDoctorRotations
} from './doctorSchedules.js';
import { expectedActivities as initialExpectedActivities } from './schedule.jsx';
import scenarioConfigsData from './scenarioConfigs.json';
import { applyScenarioChanges } from './scenarioEngine';

export const ScheduleContext = createContext();

export const ScheduleProvider = ({ children, selectedRotationCycle }) => {
  const { doc, loading } = useDocSchedule();
  const [customScheduleData, setCustomScheduleData] = useState(null);

  // Scenario management state
  const [activeScenarioId, setActiveScenarioId] = useState('base');
  const [scenarioResults, setScenarioResults] = useState({});

  // Editable data state
  const [doctorProfiles, setDoctorProfiles] = useState(() => initialDoctorProfiles);
  const [docActivities, setDocActivities] = useState(() => initialDocActivities);
  const [wantedActivities, setWantedActivities] = useState(() => initialWantedActivities);
  const [rotationTemplates, setRotationTemplates] = useState(() => initialRotationTemplates);
  const [expectedActivities, setExpectedActivities] = useState(() => initialExpectedActivities);
  const [recalculationTrigger, setRecalculationTrigger] = useState(0);

  // Track current rotation cycle (can be overridden by scenario)
  const [currentRotationCycle, setCurrentRotationCycle] = useState(selectedRotationCycle);

  // Recalculate planning algorithm when data changes
  const recalculateSchedules = useCallback(() => {
    console.log('ScheduleContext: Recalculating schedules with updated data...');
    try {
      // Pass dynamic data to the algorithm
      const dynamicData = {
        doctorProfiles,
        wantedActivities,
        docActivities,
        rotationTemplates
      };
      const customResult = executeCustomPlanningAlgorithm(currentRotationCycle, dynamicData);
      setCustomScheduleData(customResult);
      setRecalculationTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error recalculating schedules:', error);
    }
  }, [currentRotationCycle, doctorProfiles, wantedActivities, docActivities, rotationTemplates]);

  // Trigger recalculation when data or rotation cycle changes
  useEffect(() => {
    if (doc) {
      recalculateSchedules();
    }
  }, [doc, selectedRotationCycle, doctorProfiles, rotationTemplates, recalculateSchedules]);

  // Data update methods
  const updateDoctorProfiles = useCallback((newProfiles) => {
    setDoctorProfiles(newProfiles);
  }, []);

  const updateDocActivities = useCallback((newActivities) => {
    setDocActivities(newActivities);
  }, []);

  const updateWantedActivities = useCallback((newWantedActivities) => {
    setWantedActivities(newWantedActivities);
  }, []);

  const updateRotationTemplates = useCallback((newTemplates) => {
    setRotationTemplates(newTemplates);
  }, []);

  const updateExpectedActivities = useCallback((newExpectedActivities) => {
    setExpectedActivities(newExpectedActivities);
  }, []);

  // Helper method to add/update a single doctor
  const updateSingleDoctor = useCallback((doctorId, doctorData) => {
    console.log(`🔄 ScheduleContext: Updating doctor ${doctorId}`, doctorData);

    // ✅ DEFENSIVE FIX: Filter out undefined properties to prevent overwriting existing data
    const cleanedData = Object.fromEntries(
      Object.entries(doctorData).filter(([_, value]) => value !== undefined)
    );

    // Special logging for BM doctor updates
    if (doctorId === 'BM') {
      console.log('🔍 BM update - cleaned properties:', Object.keys(cleanedData));

      if (cleanedData.backbone) {
        console.log('🎯 BM backbone update detected:', {
          thursday: cleanedData.backbone?.Thursday,
          friday: cleanedData.backbone?.Friday
        });
      }
    }

    setDoctorProfiles(prev => {
      const existing = prev[doctorId] || {};
      const updated = { ...existing, ...cleanedData };

      // Extra validation for BM
      if (doctorId === 'BM') {
        console.log('🎯 BM after update:', {
          hasRotationSetting: !!updated.rotationSetting,
          rotationSetting: updated.rotationSetting,
          hasSkills: !!updated.skills,
          skills: updated.skills
        });
      }

      return {
        ...prev,
        [doctorId]: updated
      };
    });
  }, []);

  // Helper method to remove a doctor
  const removeDoctor = useCallback((doctorId) => {
    setDoctorProfiles(prev => {
      const updated = { ...prev };
      delete updated[doctorId];
      return updated;
    });
  }, []);

  // Helper method to add/update a single rotation template
  const updateSingleTemplate = useCallback((templateName, templateData) => {
    setRotationTemplates(prev => ({
      ...prev,
      [templateName]: templateData
    }));
  }, []);

  // Helper method to remove a rotation template
  const removeTemplate = useCallback((templateName) => {
    setRotationTemplates(prev => {
      const updated = { ...prev };
      delete updated[templateName];
      return updated;
    });
  }, []);

  // ========== SCENARIO MANAGEMENT FUNCTIONS ==========

  /**
   * Apply a scenario to the entire app
   * This updates all configuration data and recalculates schedules
   */
  const applyScenario = useCallback((scenarioId) => {
    console.log(`🎬 Applying scenario: ${scenarioId}`);

    // Find scenario in config
    const scenario = scenarioConfigsData.scenarios.find(s => s.id === scenarioId);
    if (!scenario) {
      console.error(`Scenario ${scenarioId} not found`);
      return;
    }

    // Build base config object
    const baseConfig = {
      doctorProfiles: initialDoctorProfiles,
      docActivities: initialDocActivities,
      wantedActivities: initialWantedActivities,
      rotationTemplates: initialRotationTemplates,
      expectedActivities: initialExpectedActivities,
      rotationCycle: selectedRotationCycle
    };

    // Apply scenario changes
    const modifiedConfig = applyScenarioChanges(baseConfig, scenario);

    console.log('📦 Modified config to apply:', {
      docActivities: modifiedConfig.docActivities,
      doctorProfiles: Object.keys(modifiedConfig.doctorProfiles || {}),
      rotationCycle: modifiedConfig.rotationCycle,
      conflictResolutionOrder: modifiedConfig.conflictResolutionOrder
    });

    // Update all state with modified configuration
    setDoctorProfiles(modifiedConfig.doctorProfiles || initialDoctorProfiles);
    setDocActivities(modifiedConfig.docActivities || initialDocActivities);
    setWantedActivities(modifiedConfig.wantedActivities || initialWantedActivities);
    setRotationTemplates(modifiedConfig.rotationTemplates || initialRotationTemplates);
    setExpectedActivities(modifiedConfig.expectedActivities || initialExpectedActivities);
    setCurrentRotationCycle(modifiedConfig.rotationCycle || selectedRotationCycle);

    // Mark this scenario as active
    setActiveScenarioId(scenarioId);

    console.log(`✅ Scenario ${scenarioId} applied successfully`);
    console.log('🔍 Verify docActivities after state update:', docActivities);
  }, [selectedRotationCycle]);

  /**
   * Calculate metrics for a specific scenario without applying it
   * Used for chart overlay comparison
   */
  const getScenarioMetrics = useCallback((scenarioId) => {
    // Check if we have cached results for this scenario
    if (scenarioResults[scenarioId]) {
      return scenarioResults[scenarioId];
    }

    // If this is the active scenario, return current metrics
    if (scenarioId === activeScenarioId && customScheduleData) {
      return calculateMetricsFromScheduleData(customScheduleData);
    }

    // Otherwise, we need to compute this scenario
    // Find scenario in config
    const scenario = scenarioConfigsData.scenarios.find(s => s.id === scenarioId);
    if (!scenario) {
      console.error(`Scenario ${scenarioId} not found`);
      return null;
    }

    // Build base config
    const baseConfig = {
      doctorProfiles: initialDoctorProfiles,
      docActivities: initialDocActivities,
      wantedActivities: initialWantedActivities,
      rotationTemplates: initialRotationTemplates,
      expectedActivities: initialExpectedActivities,
      rotationCycle: selectedRotationCycle
    };

    // Apply scenario changes
    const modifiedConfig = applyScenarioChanges(baseConfig, scenario);

    console.log(`📊 Computing metrics for scenario "${scenarioId}"`, {
      modifiedDocActivities: modifiedConfig.docActivities,
      modifiedRotationCycle: modifiedConfig.rotationCycle,
      conflictOrder: modifiedConfig.conflictResolutionOrder
    });

    // Execute planning algorithm with this config
    const dynamicData = {
      doctorProfiles: modifiedConfig.doctorProfiles,
      wantedActivities: modifiedConfig.wantedActivities,
      docActivities: modifiedConfig.docActivities,
      rotationTemplates: modifiedConfig.rotationTemplates,
      conflictResolutionOrder: modifiedConfig.conflictResolutionOrder
    };

    const cycleToUse = modifiedConfig.rotationCycle || selectedRotationCycle;
    console.log('🚀 Executing algorithm with:', {
      cycleToUse,
      docActivitiesAMI: dynamicData.docActivities?.AMI,
      conflictOrder: modifiedConfig.conflictResolutionOrder
    });

    const result = executeCustomPlanningAlgorithm(cycleToUse, dynamicData, modifiedConfig.conflictResolutionOrder);

    // Calculate and cache metrics
    const metrics = calculateMetricsFromScheduleData(result);
    setScenarioResults(prev => ({
      ...prev,
      [scenarioId]: metrics
    }));

    return metrics;
  }, [scenarioResults, activeScenarioId, customScheduleData, selectedRotationCycle]);

  /**
   * Calculate metrics from schedule data
   * Extracted from ScheduleEvaluationRadar logic
   */
  const calculateMetricsFromScheduleData = useCallback((scheduleData) => {
    if (!scheduleData || !scheduleData.periodicSchedule) {
      return {
        workloadScore: 0,
        nonOverloadCoverage: 0,
        emitCoverage: 0,
        ematitCoverage: 0,
        amiCoverage: 0,
        telecsCoverage: 0
      };
    }

    const periodicSchedule = scheduleData.periodicSchedule;

    // Helper: Calculate CV
    const calculateCV = (values) => {
      if (!values || values.length === 0) return 100;
      const validValues = values.filter((v) => v !== null && v !== undefined);
      if (validValues.length === 0) return 100;
      if (validValues.length === 1) return 0;
      const mean = validValues.reduce((a, b) => a + b, 0) / validValues.length;
      if (mean === 0) return 0;
      const variance = validValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validValues.length;
      const stdDev = Math.sqrt(variance);
      return (stdDev / mean) * 100;
    };

    const normalizeCVToScore = (cv) => Math.max(0, 100 - Math.min(cv * 2, 100));

    // 1. Workload Equity
    const doctorWorkload = {};
    Object.values(periodicSchedule).forEach((periodData) => {
      if (periodData.schedule) {
        Object.entries(periodData.schedule).forEach(([doctor, schedule]) => {
          if (!doctorWorkload[doctor]) doctorWorkload[doctor] = 0;
          Object.values(schedule).forEach((daySchedule) => {
            Object.values(daySchedule).forEach((activities) => {
              if (Array.isArray(activities)) {
                activities.forEach((activity) => {
                  const activityData = docActivities[activity];
                  if (activityData && activityData.duration) {
                    doctorWorkload[doctor] += activityData.duration;
                  }
                });
              }
            });
          });
        });
      }
    });
    const workloadCV = calculateCV(Object.values(doctorWorkload));
    const workloadScore = normalizeCVToScore(workloadCV);

    // 2. Non-Overload Coverage
    let totalSlots = 0;
    let nonOverloadedSlots = 0;
    Object.values(periodicSchedule).forEach((periodData) => {
      if (periodData.schedule) {
        Object.values(periodData.schedule).forEach((schedule) => {
          Object.values(schedule).forEach((daySchedule) => {
            Object.values(daySchedule).forEach((activities) => {
              if (Array.isArray(activities) && !activities.includes("TP")) {
                totalSlots++;
                const totalDuration = activities.reduce((sum, activity) => {
                  const activityData = docActivities[activity];
                  return sum + (activityData?.duration || 1);
                }, 0);
                if (totalDuration <= 4) nonOverloadedSlots++;
              }
            });
          });
        });
      }
    });
    const nonOverloadCoverage = totalSlots > 0 ? (nonOverloadedSlots / totalSlots) * 100 : 100;

    // 3-5. Activity Coverage (simplified - returns 100 for now)
    const emitCoverage = 100;
    const ematitCoverage = 100;
    const amiCoverage = 100;

    // 6. TeleCs Coverage (HYBRID APPROACH matching ScheduleEvaluationRadar)
    // METHOD 1: Calculate total needed from doctor profile requirements (DENOMINATOR)
    const numPeriods = Object.keys(periodicSchedule).length;
    let method1_totalNeeded = 0;
    Object.entries(doctorProfiles).forEach(([doctorCode, profile]) => {
      if (profile.weeklyNeeds?.TeleCs?.count) {
        method1_totalNeeded += profile.weeklyNeeds.TeleCs.count * numPeriods;
      }
    });

    // METHOD 2: Get authoritative missing count from teleCsResolution (NUMERATOR)
    let method2_totalMissing = 0;
    Object.values(periodicSchedule).forEach((periodData) => {
      if (periodData.teleCsResolution?.teleCsAssignments) {
        Object.values(periodData.teleCsResolution.teleCsAssignments).forEach((assignment) => {
          method2_totalMissing += assignment.missing || 0;
        });
      }
    });

    // HYBRID: Denominator from Method 1, Missing from Method 2
    const totalTelecsNeeded = method1_totalNeeded;
    const totalTeleCsMissing = method2_totalMissing;
    const totalTelecsAssigned = totalTelecsNeeded - totalTeleCsMissing;
    const telecsCoverage = totalTelecsNeeded > 0
      ? Math.min((totalTelecsAssigned / totalTelecsNeeded) * 100, 100)
      : 100;

    return {
      workloadScore,
      nonOverloadCoverage,
      emitCoverage,
      ematitCoverage,
      amiCoverage,
      telecsCoverage
    };
  }, [expectedActivities, docActivities, doctorProfiles]);

  return (
    <ScheduleContext.Provider value={{
      // Original context values
      loading,
      customScheduleData,
      selectedRotationCycle,
      recalculationTrigger,

      // Editable data
      doctorProfiles,
      docActivities,
      wantedActivities,
      rotationTemplates,
      expectedActivities,

      // Data update methods
      updateDoctorProfiles,
      updateDocActivities,
      updateWantedActivities,
      updateRotationTemplates,
      updateExpectedActivities,
      updateSingleDoctor,
      removeDoctor,
      updateSingleTemplate,
      removeTemplate,

      // Manual recalculation trigger
      recalculateSchedules,

      // Scenario management
      activeScenarioId,
      applyScenario,
      getScenarioMetrics,
      currentRotationCycle
    }}>
      {children}
    </ScheduleContext.Provider>
  );
};
