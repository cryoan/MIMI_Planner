import React, { createContext, useEffect, useState, useCallback } from 'react';
import { useDocSchedule } from './schedule';
import { executeCustomPlanningAlgorithm } from './customPlanningLogic.js';
import {
  doctorProfiles as initialDoctorProfiles,
  docActivities as initialDocActivities,
  wantedActivities as initialWantedActivities,
  rotationTemplates as initialRotationTemplates,
  generateDoctorRotations
} from './doctorSchedules.js';
import { expectedActivities as initialExpectedActivities } from './schedule.jsx';

export const ScheduleContext = createContext();

export const ScheduleProvider = ({ children, selectedRotationCycle }) => {
  const { doc, loading } = useDocSchedule();
  const [customScheduleData, setCustomScheduleData] = useState(null);

  // Editable data state
  const [doctorProfiles, setDoctorProfiles] = useState(() => initialDoctorProfiles);
  const [docActivities, setDocActivities] = useState(() => initialDocActivities);
  const [wantedActivities, setWantedActivities] = useState(() => initialWantedActivities);
  const [rotationTemplates, setRotationTemplates] = useState(() => initialRotationTemplates);
  const [expectedActivities, setExpectedActivities] = useState(() => initialExpectedActivities);
  const [recalculationTrigger, setRecalculationTrigger] = useState(0);

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
      const customResult = executeCustomPlanningAlgorithm(selectedRotationCycle, dynamicData);
      setCustomScheduleData(customResult);
      setRecalculationTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error recalculating schedules:', error);
    }
  }, [selectedRotationCycle, doctorProfiles, wantedActivities, docActivities, rotationTemplates]);

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
      recalculateSchedules
    }}>
      {children}
    </ScheduleContext.Provider>
  );
};
