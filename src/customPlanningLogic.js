import { doctorProfiles, generateDoctorRotations, docActivities } from "./doctorSchedules.js";
import { expectedActivities as staticExpectedActivities } from "./schedule.jsx";
import {
  resolveHTCConflicts,
  resolveEMITConflicts,
  resolveEMATITConflicts,
  resolveTeleCsConflicts,
  calculateCumulativeWorkloadPerDoctor
} from "./activityConflictResolver.js";

// Custom Planning Logic - Algorithme de Planification Médical Progressif et Fiable
// Implémentation en 3 phases selon les spécifications utilisateur

console.log("Custom Planning Logic Module Loaded");

/**
 * Configuration de l'algorithme
 */
const TIME_SLOTS = ["9am-1pm", "2pm-6pm"];
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

/**
 * Activity-centric rotation cycles with descriptions and metadata
 * Each cycle includes a description and periods array for better documentation
 */
export const rotation_cycles = {
  honeymoon_NS_noHDJ: {
    description: "NS 100% et sans HDJ",
    periods: [
      {
        period: 1,
        HTC1: "FL",
        HDJ: "CL",
        AMI: "NS",
        HTC2: "MG",
        EMIT: "MDLC",
        EMATIT: "RNV",
      },
      {
        period: 2,
        HTC1: "CL",
        HDJ: "FL",
        AMI: "NS",
        HTC2: "MDLC",
        EMIT: "RNV",
        EMATIT: "MG",
      },
      {
        period: 3,
        HTC1: "NS",
        HDJ: "FL",
        AMI: "CL",
        HTC2: "RNV",
        EMIT: "MG",
        EMATIT: "MDLC",
      },
      {
        period: 4,
        HTC1: "FL",
        HDJ: "CL",
        AMI: "NS",
        HTC2: "MG",
        EMIT: "MDLC",
        EMATIT: "RNV",
      },
      {
        period: 5,
        HTC1: "CL",
        HDJ: "FL",
        AMI: "NS",
        HTC2: "MDLC",
        EMIT: "RNV",
        EMATIT: "MG",
      },
      {
        period: 6,
        HTC1: "NS",
        HDJ: "CL",
        AMI: "FL",
        HTC2: "RNV",
        EMIT: "MG",
        EMATIT: "MDLC",
      },
    ],
  },
  honeymoon_NS_HDJ: {
    description: "NS 100% et avec HDJ",
    periods: [
      {
        period: 1,
        HTC1: "FL",
        HDJ: "CL",
        AMI: "NS",
        HTC2: "MG",
        EMIT: "MDLC",
        EMATIT: "RNV",
      },
      {
        period: 2,
        HTC1: "CL",
        HDJ: "NS",
        AMI: "FL",
        HTC2: "MDLC",
        EMIT: "RNV",
        EMATIT: "MG",
      },
      {
        period: 3,
        HTC1: "NS",
        HDJ: "FL",
        AMI: "CL",
        HTC2: "RNV",
        EMIT: "MG",
        EMATIT: "MDLC",
      },
      {
        period: 4,
        HTC1: "FL",
        HDJ: "CL",
        AMI: "NS",
        HTC2: "MG",
        EMIT: "MDLC",
        EMATIT: "RNV",
      },
      {
        period: 5,
        HTC1: "CL",
        HDJ: "NS",
        AMI: "FL",
        HTC2: "MDLC",
        EMIT: "RNV",
        EMATIT: "MG",
      },
      {
        period: 6,
        HTC1: "NS",
        HDJ: "FL",
        AMI: "CL",
        HTC2: "RNV",
        EMIT: "MG",
        EMATIT: "MDLC",
      },
    ],
  },
  NoMG: {
    description: "MG en dispo",
    periods: [
      {
        period: 1,
        HTC1: "CL",
        HDJ: "FL",
        AMI: "NS",
        HTC2: "MDLC",
        EMIT: "RNV",
      },
      {
        period: 2,
        HTC1: "NS",
        HDJ: "CL",
        AMI: "FL",
        HTC2: "RNV",
        EMIT: "MDLC",
      },
      {
        period: 3,
        HTC1: "FL",
        HDJ: "NS",
        AMI: "CL",
        HTC2: "RNV",
        EMIT: "MDLC",
      },
      {
        period: 4,
        HTC1: "CL",
        HDJ: "FL",
        AMI: "NS",
        HTC2: "MDLC",
        EMIT: "RNV",
      },
      {
        period: 5,
        HTC1: "NS",
        HDJ: "CL",
        AMI: "FL",
        HTC2: "RNV",
        EMIT: "MDLC",
      },
      {
        period: 6,
        HTC1: "FL",
        HDJ: "NS",
        AMI: "CL",
        HTC2: "RNV",
        EMIT: "MDLC",
      },
    ],
  },
  emergency: {
    description:
      "Emergency coverage cycle with reduced rotations and minimal changes for crisis situations",
    periods: [
      {
        period: 1,
        HTC1: "FL",
        HDJ: "CL",
        AMI: "NS",
        HTC2: "MG",
        EMIT: "MDLC",
        EMATIT: "RNV",
      },
      {
        period: 2,
        HTC1: "FL",
        HDJ: "CL",
        AMI: "NS",
        HTC2: "MG",
        EMIT: "MDLC",
        EMATIT: "RNV",
      },
      {
        period: 3,
        HTC1: "CL",
        HDJ: "FL",
        AMI: "NS",
        HTC2: "MDLC",
        EMIT: "RNV",
        EMATIT: "MG",
      },
      {
        period: 4,
        HTC1: "CL",
        HDJ: "FL",
        AMI: "NS",
        HTC2: "MDLC",
        EMIT: "RNV",
        EMATIT: "MG",
      },
      {
        period: 5,
        HTC1: "NS",
        HDJ: "FL",
        AMI: "CL",
        HTC2: "RNV",
        EMIT: "MG",
        EMATIT: "MDLC",
      },
      {
        period: 6,
        HTC1: "NS",
        HDJ: "FL",
        AMI: "CL",
        HTC2: "RNV",
        EMIT: "MG",
        EMATIT: "MDLC",
      },
    ],
  },
};

// ============================================================================
// HELPER FUNCTIONS FOR TWO-PASS ALGORITHM
// ============================================================================

/**
 * Update cumulative workload tracker with new assignments from conflict resolution
 * Compares resolved schedule against base schedule to find newly added activities
 *
 * @param {Object} dynamicWorkload - Current cumulative workload tracker (mutated in-place)
 * @param {Object} resolvedSchedule - Schedule after conflict resolution (HTC or EMIT)
 * @param {Object} baseSchedule - Original schedule before resolution
 */
function updateDynamicWorkload(dynamicWorkload, resolvedSchedule, baseSchedule) {
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const SLOTS = ["9am-1pm", "2pm-6pm"];

  Object.keys(resolvedSchedule).forEach((doctor) => {
    DAYS.forEach((day) => {
      SLOTS.forEach((slot) => {
        const resolvedActivities = resolvedSchedule[doctor]?.[day]?.[slot] || [];
        const baseActivities = baseSchedule[doctor]?.[day]?.[slot] || [];

        // Find newly added activities (in resolved but not in base)
        const addedActivities = resolvedActivities.filter(
          activity => !baseActivities.includes(activity)
        );

        // Add their duration to the dynamic workload
        addedActivities.forEach((activity) => {
          const duration = docActivities[activity]?.duration || 1;
          if (!dynamicWorkload[doctor]) {
            dynamicWorkload[doctor] = 0;
          }
          dynamicWorkload[doctor] += duration;
        });
      });
    });
  });
}

/**
 * Convert custom planning result to calendar format (same as UI)
 */
function convertCustomToCalendarFormat(customScheduleData) {
  const calendarFormat = {
    2024: { Month1: {} },
    2025: { Month1: {} },
  };

  if (customScheduleData.success) {
    // Priority 1: Use final adjusted schedule for first weeks
    if (customScheduleData.finalSchedule) {
      const firstWeeks = ["Week44", "Week45", "Week46", "Week47"];
      firstWeeks.forEach((weekKey) => {
        calendarFormat[2024].Month1[weekKey] = customScheduleData.finalSchedule;
      });
    }

    // Priority 2: Use periodic variations for following weeks
    if (customScheduleData.periodicSchedule) {
      const periods = Object.keys(customScheduleData.periodicSchedule);
      periods.slice(0, 6).forEach((periodName, index) => {
        const weekNumber = 48 + index;
        const year = weekNumber > 52 ? 2025 : 2024;
        const adjustedWeekNumber =
          weekNumber > 52 ? weekNumber - 52 : weekNumber;
        const weekKey = `Week${adjustedWeekNumber}`;

        if (customScheduleData.periodicSchedule[periodName].schedule) {
          if (year === 2024) {
            calendarFormat[2024].Month1[weekKey] =
              customScheduleData.periodicSchedule[periodName].schedule;
          } else {
            calendarFormat[2025].Month1[weekKey] =
              customScheduleData.periodicSchedule[periodName].schedule;
          }
        }
      });
    }

    // Fallback: If no final schedule, use only periodic
    if (
      !customScheduleData.finalSchedule &&
      customScheduleData.periodicSchedule
    ) {
      const periods = Object.keys(customScheduleData.periodicSchedule);
      periods.slice(0, 10).forEach((periodName, index) => {
        const weekNumber = 44 + index;
        const year = weekNumber > 52 ? 2025 : 2024;
        const adjustedWeekNumber =
          weekNumber > 52 ? weekNumber - 52 : weekNumber;
        const weekKey = `Week${adjustedWeekNumber}`;

        if (customScheduleData.periodicSchedule[periodName].schedule) {
          if (year === 2024) {
            calendarFormat[2024].Month1[weekKey] =
              customScheduleData.periodicSchedule[periodName].schedule;
          } else {
            calendarFormat[2025].Month1[weekKey] =
              customScheduleData.periodicSchedule[periodName].schedule;
          }
        }
      });
    }
  }

  return calendarFormat;
}

/**
 * Validate calendar format and count total missing/duplicates (same as UI checkAssignments)
 */
function validateCalendarFormat(schedule, expectedActivities) {
  const duplicateActivities = ["EMIT", "HDJ", "AMI", "HTC1", "HTC2", "EMATIT"];
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const timeSlots = ["9am-1pm", "2pm-6pm"];

  let totalMissing = 0;
  let totalDuplicates = 0;
  let totalSlots = 0;
  let validSlots = 0;

  const problems = {
    missing: [],
    duplicates: [],
  };

  // Track activity counts for detailed breakdown
  const missingActivityCounts = {};
  const duplicateActivityCounts = {};

  Object.keys(schedule).forEach((year) => {
    Object.keys(schedule[year]).forEach((month) => {
      Object.keys(schedule[year][month]).forEach((week) => {
        daysOfWeek.forEach((day) => {
          timeSlots.forEach((slot) => {
            totalSlots++;

            const assigned = [];

            // Collect all activities assigned by all doctors for this slot
            Object.keys(schedule[year][month][week]).forEach((doctor) => {
              if (
                schedule[year][month][week][doctor][day] &&
                schedule[year][month][week][doctor][day][slot]
              ) {
                assigned.push(
                  ...schedule[year][month][week][doctor][day][slot]
                );
              }
            });

            const expected = expectedActivities[day]?.[slot] || [];

            // Check for missing activities
            expected.forEach((activity) => {
              if (!assigned.includes(activity)) {
                totalMissing++;
                problems.missing.push({
                  year,
                  month,
                  week,
                  day,
                  slot,
                  activity,
                });

                // Count by activity type
                if (!missingActivityCounts[activity]) {
                  missingActivityCounts[activity] = 0;
                }
                missingActivityCounts[activity]++;
              }
            });

            // Check for duplicate activities
            const activityCounts = {};
            assigned.forEach((activity) => {
              if (duplicateActivities.includes(activity)) {
                if (!activityCounts[activity]) {
                  activityCounts[activity] = 0;
                }
                activityCounts[activity]++;
              }
            });

            const duplicates = Object.entries(activityCounts)
              .filter(([activity, count]) => count > 1)
              .map(([activity, count]) => `${activity} (${count})`);

            if (duplicates.length > 0) {
              totalDuplicates += duplicates.length;
              problems.duplicates.push({
                year,
                month,
                week,
                day,
                slot,
                duplicates,
              });

              // Count by activity type for duplicates
              Object.entries(activityCounts)
                .filter(([activity, count]) => count > 1)
                .forEach(([activity, count]) => {
                  if (!duplicateActivityCounts[activity]) {
                    duplicateActivityCounts[activity] = 0;
                  }
                  duplicateActivityCounts[activity] += 1; // Count each duplicate instance
                });
            }

            // Check if slot is valid (no missing and no duplicates)
            if (
              expected.every((activity) => assigned.includes(activity)) &&
              duplicates.length === 0
            ) {
              validSlots++;
            }
          });
        });
      });
    });
  });

  // Create formatted summary strings
  const formatActivityBreakdown = (activityCounts, total) => {
    if (total === 0) return "";

    const sortedActivities = Object.entries(activityCounts)
      .sort(([, a], [, b]) => b - a) // Sort by count descending
      .map(([activity, count]) => `${activity} ${count}`)
      .join(", ");

    return ` (${sortedActivities})`;
  };

  const missingSummary = `Missing total: ${totalMissing}${formatActivityBreakdown(
    missingActivityCounts,
    totalMissing
  )}`;
  const duplicateSummary = `Duplicate total: ${totalDuplicates}${formatActivityBreakdown(
    duplicateActivityCounts,
    totalDuplicates
  )}`;

  return {
    totalMissing,
    totalDuplicates,
    totalSlots,
    validSlots,
    coveragePercentage: totalSlots > 0 ? (validSlots / totalSlots) * 100 : 0,
    problems,
    activityBreakdown: {
      missing: missingActivityCounts,
      duplicates: duplicateActivityCounts,
    },
    summaryText: {
      missing: missingSummary,
      duplicates: duplicateSummary,
      combined: `${missingSummary}\n${duplicateSummary}`,
    },
  };
}

/**
 * Utilitaires de base
 */

// Structure de planning vide (utilisée dans d'autres modules)
export const getEmptySchedule = () => ({
  Monday: { "9am-1pm": [], "2pm-6pm": [] },
  Tuesday: { "9am-1pm": [], "2pm-6pm": [] },
  Wednesday: { "9am-1pm": [], "2pm-6pm": [] },
  Thursday: { "9am-1pm": [], "2pm-6pm": [] },
  Friday: { "9am-1pm": [], "2pm-6pm": [] },
});

// Deep clone utility
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// Vérifier si un médecin a une seule rotation possible
const hasSingleRotation = (doctorCode, profilesData = null) => {
  const profiles = profilesData || doctorProfiles;
  const profile = profiles[doctorCode];
  return (
    profile && profile.rotationSetting && profile.rotationSetting.length === 1
  );
};

// Vérifier si un médecin a plusieurs rotations possibles
const hasMultipleRotations = (doctorCode, profilesData = null) => {
  const profiles = profilesData || doctorProfiles;
  const profile = profiles[doctorCode];
  return (
    profile && profile.rotationSetting && profile.rotationSetting.length > 1
  );
};

/**
 * PHASE 1: CONSTITUTION PROGRESSIVE DU PLANNING
 *
 * Phase 1.1: Remplir éléments rigides (médecins avec une seule rotation)
 * Phase 1.2: Remplir éléments souples (médecins avec rotations multiples)
 */

/**
 * Phase 1.1: Assigner les médecins rigides (rotationSetting.length = 1)
 * @param {Object} timeUnit - Unité de temps considérée
 * @returns {Object} Planning avec médecins rigides assignés
 */
export function assignRigidDoctors(
  dynamicDoctorProfiles = null,
  dynamicWantedActivities = null
) {
  console.log("Phase 1.1: Assignation des médecins rigides...");

  const profilesData = dynamicDoctorProfiles || doctorProfiles;
  const rigidSchedule = {};
  const availableDoctors = Object.keys(profilesData);

  // 🔍 Debug: Log BM's backbone if it exists
  if (profilesData.BM) {
    console.log("🎯 BM backbone in assignRigidDoctors:", {
      Thursday: profilesData.BM.backbone?.Thursday,
      Friday: profilesData.BM.backbone?.Friday,
      rotationSetting: profilesData.BM.rotationSetting,
    });
  }

  // Identifier les médecins avec une seule rotation
  const rigidDoctors = availableDoctors.filter((doctorCode) =>
    hasSingleRotation(doctorCode, profilesData)
  );

  console.log("Médecins rigides identifiés:", rigidDoctors);

  // Pour chaque médecin rigide, utiliser sa seule rotation disponible
  rigidDoctors.forEach((doctorCode) => {
    const profile = profilesData[doctorCode];
    const rotationName = profile.rotationSetting[0]; // Seule rotation disponible

    try {
      // Générer les rotations disponibles pour ce médecin
      const generatedRotations = generateDoctorRotations(
        doctorCode,
        dynamicDoctorProfiles,
        dynamicWantedActivities
      );

      if (generatedRotations[rotationName]) {
        rigidSchedule[doctorCode] = deepClone(generatedRotations[rotationName]);
        console.log(
          `✅ ${doctorCode} assigné à rotation ${rotationName} (rigide)`
        );

        // 🔍 Debug: Log BM's schedule after assignment
        if (doctorCode === "BM") {
          console.log("🎯 BM's generated schedule:", {
            Thursday: rigidSchedule[doctorCode]?.Thursday,
            Friday: rigidSchedule[doctorCode]?.Friday,
          });
        }
      } else {
        console.warn(
          `⚠️ Rotation ${rotationName} non trouvée pour ${doctorCode}`
        );
      }
    } catch (error) {
      console.error(`❌ Erreur lors de l'assignation de ${doctorCode}:`, error);
    }
  });

  // 🔍 Debug: Log final rigid schedule
  console.log(
    "📋 Rigid doctors in final schedule:",
    Object.keys(rigidSchedule)
  );
  if (rigidSchedule.BM) {
    console.log("🎯 BM present in rigidSchedule:", {
      Thursday: rigidSchedule.BM?.Thursday,
      Friday: rigidSchedule.BM?.Friday,
    });
  } else {
    console.warn("⚠️ BM NOT found in rigidSchedule!");
  }

  return {
    schedule: rigidSchedule,
    assignedDoctors: rigidDoctors,
    rotationAssignments: rigidDoctors.reduce((acc, doctor) => {
      acc[doctor] = profilesData[doctor].rotationSetting[0]; // ✅ Fixed: Use dynamic profilesData instead of static doctorProfiles
      return acc;
    }, {}),
  };
}

/**
 * Phase 1.2: Créer dictionnaire rotation -> docteurs pour médecins souples
 * @returns {Object} Dictionnaire {rotation: [docteurs correspondants]}
 */
export function createRotationDict(dynamicDoctorProfiles = null) {
  console.log("Phase 1.2: Création du dictionnaire rotation -> docteurs...");

  const profilesData = dynamicDoctorProfiles || doctorProfiles;
  const rotationDict = {};
  const availableDoctors = Object.keys(profilesData);

  // Identifier les médecins avec plusieurs rotations
  const flexibleDoctors = availableDoctors.filter((doctorCode) =>
    hasMultipleRotations(doctorCode, profilesData)
  );

  flexibleDoctors.forEach((doctorCode) => {
    const profile = profilesData[doctorCode];

    profile.rotationSetting.forEach((rotation) => {
      if (!rotationDict[rotation]) {
        rotationDict[rotation] = [];
      }
      rotationDict[rotation].push(doctorCode);
    });
  });

  console.log("Dictionnaire rotation -> docteurs:", rotationDict);
  return rotationDict;
}

/**
 * Phase 1.2: Sélectionner un médecin responsable par rotation (couple unique)
 * @param {Object} rotationDict - Dictionnaire rotation -> docteurs
 * @param {Object} existingAssignments - Assignations existantes des médecins rigides
 * @returns {Object} Couples uniques doctor-rotation
 */
export function selectUniqueRotationPairs(
  rotationDict,
  existingAssignments = {}
) {
  console.log("Phase 1.2: Sélection couples uniques doctor-rotation...");

  const uniquePairs = { ...existingAssignments };
  const assignedDoctors = new Set(Object.keys(existingAssignments));

  // Pour chaque rotation, choisir un médecin responsable
  Object.entries(rotationDict).forEach(([rotation, doctors]) => {
    // Filtrer les médecins déjà assignés
    const availableDoctors = doctors.filter(
      (doctor) => !assignedDoctors.has(doctor)
    );

    if (availableDoctors.length > 0) {
      // Pour l'instant, prendre le premier disponible
      // Peut être amélioré avec une logique de rotation équitable
      const selectedDoctor = availableDoctors[0];
      uniquePairs[selectedDoctor] = rotation;
      assignedDoctors.add(selectedDoctor);

      console.log(`✅ ${rotation} → ${selectedDoctor} (couple unique)`);
    } else {
      console.warn(`⚠️ Aucun médecin disponible pour rotation ${rotation}`);
    }
  });

  return uniquePairs;
}

/**
 * Phase 1: Constitution complète du planning de base
 * @param {Object} timeUnit - Unité de temps considérée
 * @returns {Object} Planning concaténé complet
 */
export function createBaseScheduling(
  dynamicDoctorProfiles = null,
  dynamicWantedActivities = null
) {
  console.log("Phase 1: Constitution du planning de base...");

  // Phase 1.1: Médecins rigides
  const rigidResult = assignRigidDoctors(
    dynamicDoctorProfiles,
    dynamicWantedActivities
  );

  // Phase 1.2: Médecins souples
  const rotationDict = createRotationDict(dynamicDoctorProfiles);
  const uniquePairs = selectUniqueRotationPairs(
    rotationDict,
    rigidResult.rotationAssignments
  );

  // Générer le planning complet à partir des couples uniques
  const completeSchedule = { ...rigidResult.schedule };

  Object.entries(uniquePairs).forEach(([doctorCode, rotationName]) => {
    if (!completeSchedule[doctorCode]) {
      try {
        const generatedRotations = generateDoctorRotations(
          doctorCode,
          dynamicDoctorProfiles,
          dynamicWantedActivities
        );

        if (generatedRotations[rotationName]) {
          completeSchedule[doctorCode] = deepClone(
            generatedRotations[rotationName]
          );
          console.log(
            `✅ ${doctorCode} assigné à rotation ${rotationName} (souple)`
          );
        }
      } catch (error) {
        console.error(
          `❌ Erreur lors de l'assignation de ${doctorCode}:`,
          error
        );
      }
    }
  });

  return {
    schedule: completeSchedule,
    rotationAssignments: uniquePairs,
    rigidDoctors: rigidResult.assignedDoctors,
    flexibleDoctors: Object.keys(uniquePairs).filter(
      (doctor) => !rigidResult.assignedDoctors.includes(doctor)
    ),
  };
}

/**
 * PHASE 2: SIMPLIFIÉE - PAS DE RÉSOLUTION DE CONFLITS
 *
 * Pour l'instant, on garde le planning tel qu'il est généré en Phase 1
 * sans tenter de résoudre les conflits automatiquement
 */

/**
 * PHASE 3: VARIATION PÉRIODIQUE DES ROTATIONS
 *
 * Créer les variations périodiques selon les rotationSettings
 * et les unités de temps définies
 */

/**
 * Calculer les périodes de rotation basées sur les vacances scolaires
 * @returns {Array} Périodes de rotation
 *
 * NOTE: 12 periods are needed for a complete cycle:
 * - 6 honeymoon rotation positions (activities rotating among flexible doctors)
 * - × 2 DL backbone states (MPO and HDJ alternating each period)
 * = 12 unique combinations to cover the full rotation cycle
 */
export function calculateRotationPeriods() {
  console.log("Phase 3: Calcul des périodes de rotation...");

  // 12 periods covering the full academic year (2024-2025)
  // Each period is approximately 3-4 weeks
  // DL alternates backbones: odd periods = MPO, even periods = HDJ
  const rotationPeriods = [
    // First semester 2024-2025
    { name: "Période 1", startWeek: 44, endWeek: 47, year: 2024 }, // DL: MPO
    { name: "Période 2", startWeek: 48, endWeek: 51, year: 2024 }, // DL: HDJ
    { name: "Période 3", startWeek: 52, endWeek: 3, year: 2025 }, // DL: MPO
    { name: "Période 4", startWeek: 4, endWeek: 7, year: 2025 }, // DL: HDJ
    { name: "Période 5", startWeek: 8, endWeek: 11, year: 2025 }, // DL: MPO
    { name: "Période 6", startWeek: 12, endWeek: 15, year: 2025 }, // DL: HDJ

    // Second semester 2025 - completes the full cycle
    { name: "Période 7", startWeek: 16, endWeek: 19, year: 2025 }, // DL: MPO
    { name: "Période 8", startWeek: 20, endWeek: 23, year: 2025 }, // DL: HDJ
    { name: "Période 9", startWeek: 24, endWeek: 27, year: 2025 }, // DL: MPO
    { name: "Période 10", startWeek: 28, endWeek: 31, year: 2025 }, // DL: HDJ
    { name: "Période 11", startWeek: 32, endWeek: 35, year: 2025 }, // DL: MPO
    { name: "Période 12", startWeek: 36, endWeek: 39, year: 2025 }, // DL: HDJ
  ];

  console.log("Périodes de rotation calculées:", rotationPeriods.length);
  console.log(
    "📊 Full cycle coverage: 6 honeymoon rotations × 2 DL backbones = 12 periods"
  );
  return rotationPeriods;
}

/**
 * Créer les variations périodiques des rotations avec round-robin contraint
 * @param {Object} baseSchedule - Planning de base
 * @param {Object} rotationAssignments - Assignations des rotations
 * @param {string} cycleType - Type de cycle de rotation à utiliser
 * @returns {Object} Planning avec variations périodiques
 */
export function createPeriodicVariations(
  baseSchedule,
  rotationAssignments,
  cycleType = "honeymoon",
  dynamicDoctorProfiles = null,
  dynamicWantedActivities = null
) {
  console.log("Phase 3: Création des variations périodiques...");

  const profilesData = dynamicDoctorProfiles || doctorProfiles;
  const rotationPeriods = calculateRotationPeriods();
  const periodicSchedule = {};

  // Identifier les médecins rigides et flexibles
  const rigidDoctors = [];
  const flexibleDoctors = [];

  Object.entries(rotationAssignments).forEach(([doctorCode]) => {
    const profile = profilesData[doctorCode]; // ✅ Fixed: Use dynamic profilesData
    if (profile?.rotationSetting?.length <= 1) {
      rigidDoctors.push(doctorCode);
    } else {
      flexibleDoctors.push(doctorCode);
    }
  });

  console.log(`🔍 Rigid doctors:`, rigidDoctors);
  console.log(`🔍 Flexible doctors:`, flexibleDoctors);
  console.log(`🔍 All rotation assignments:`, rotationAssignments);

  // Valider le premier cycle disponible avant utilisation
  const firstCycle = Object.values(rotation_cycles)[0];
  const cycleValidation = validateHoneyMoonCycle(firstCycle.periods);
  if (!cycleValidation.valid) {
    console.warn("⚠️ Cycle invalide:", cycleValidation.missing);
  }
  console.log("🍯 Cycle validation:", cycleValidation);
  console.log("📝 Cycle description:", firstCycle.description);

  // ===========================================================================
  // PASS 1: Generate all period schedules WITHOUT conflict resolution
  // This creates the baseline for full-cycle workload calculation
  // ===========================================================================
  console.log("\n🔄 PASS 1: Generating base schedules for all periods...");
  const basePeriodicSchedule = {};

  rotationPeriods.forEach((period, periodIndex) => {
    console.log(`\n📅 Generating base schedule for ${period.name}...`);
    const periodSchedule = {};

    // 1. Garder les médecins rigides inchangés
    rigidDoctors.forEach((doctorCode) => {
      if (baseSchedule[doctorCode]) {
        periodSchedule[doctorCode] = deepClone(baseSchedule[doctorCode]);
        console.log(`  🔒 ${doctorCode}: planning rigide conservé`);
      }
    });

    // 2. Appliquer le système HoneyMoon pour les médecins flexibles
    const newFlexibleAssignments = applyHoneyMoonRotation(periodIndex, cycleType);
    console.log(
      `🔍 ${period.name} - Flexible assignments to apply:`,
      newFlexibleAssignments
    );

    // 3. Générer les plannings pour les nouvelles assignations
    newFlexibleAssignments.forEach(({ doctor, activity }) => {
      try {
        const generatedRotations = generateDoctorRotations(
          doctor,
          dynamicDoctorProfiles,
          dynamicWantedActivities,
          periodIndex
        );

        if (generatedRotations[activity]) {
          periodSchedule[doctor] = deepClone(generatedRotations[activity]);
          console.log(`  ✅ ${doctor}: assigned to ${activity} rotation`);
        } else {
          periodSchedule[doctor] = deepClone(baseSchedule[doctor]);
          console.log(`  ⚠️ Rotation ${activity} non trouvée pour ${doctor}`);
        }
      } catch (error) {
        console.error(`❌ Erreur rotation ${doctor}:`, error);
        periodSchedule[doctor] = deepClone(baseSchedule[doctor]);
      }
    });

    // 4. Gestion spéciale pour DL avec 2 backbones
    if (
      rotationAssignments["DL"] &&
      doctorProfiles["DL"]?.rotationSetting?.length === 2
    ) {
      const backboneIndex = periodIndex % 2;
      const selectedRotation = doctorProfiles["DL"].rotationSetting[backboneIndex];

      try {
        const generatedRotations = generateDoctorRotations(
          "DL",
          dynamicDoctorProfiles,
          dynamicWantedActivities,
          periodIndex
        );
        if (generatedRotations[selectedRotation]) {
          periodSchedule["DL"] = deepClone(generatedRotations[selectedRotation]);
          console.log(`  🏥 DL backbone alternance: ${selectedRotation}`);
        }
      } catch (error) {
        console.error(`❌ Erreur backbone DL:`, error);
      }
    }

    // Store base schedule WITHOUT conflict resolution
    basePeriodicSchedule[period.name] = {
      period,
      schedule: periodSchedule,
    };
  });

  // Calculate full-cycle baseline workload BEFORE any conflict resolution
  console.log("\n📊 Calculating full-cycle baseline workload (before conflict resolution)...");
  const baselineCumulativeWorkload = calculateCumulativeWorkloadPerDoctor(basePeriodicSchedule);
  console.log("📊 Baseline workload across all periods:", baselineCumulativeWorkload);

  // ===========================================================================
  // PASS 2: Apply conflict resolution with full-cycle workload visibility
  // HTC resolution runs first, then EMIT resolution sees HTC adjustments
  // ===========================================================================
  console.log("\n🔄 PASS 2: Applying conflict resolution with full-cycle fairness...");
  const finalPeriodicSchedule = {};

  // Clone baseline workload - will be updated as we add HTC/EMIT assignments
  const dynamicCumulativeWorkload = JSON.parse(JSON.stringify(baselineCumulativeWorkload));

  rotationPeriods.forEach((period, periodIndex) => {
    console.log(`\n🔧 Resolving conflicts for ${period.name}...`);

    // Start with base schedule from Pass 1
    let periodSchedule = deepClone(basePeriodicSchedule[period.name].schedule);
    let baseScheduleSnapshot = deepClone(periodSchedule); // For tracking changes

    // -------------------------------------------------------------------------
    // Step 1: Apply HTC Conflict Resolution (UNCHANGED)
    // -------------------------------------------------------------------------
    console.log(`\n🔧 Applying HTC conflict resolution for ${period.name}...`);
    const htcResolution = resolveHTCConflicts(
      periodSchedule,
      cycleType,
      periodIndex
    );

    let resolvedSchedule = periodSchedule;

    if (htcResolution.success) {
      console.log(
        `✅ HTC conflicts resolved: ${htcResolution.conflictsResolved}/${htcResolution.conflictsDetected}`
      );
      if (htcResolution.resolutionLog.length > 0) {
        htcResolution.resolutionLog.forEach((log) => console.log(`  ${log}`));
      }
      resolvedSchedule = htcResolution.schedule;

      // ✅ KEY: Update cumulative workload with HTC assignments
      console.log("📊 Updating cumulative workload with HTC assignments...");
      updateDynamicWorkload(dynamicCumulativeWorkload, resolvedSchedule, baseScheduleSnapshot);
      console.log("📊 Updated workload after HTC:", dynamicCumulativeWorkload);
    } else {
      console.warn(`⚠️ HTC conflict resolution failed for ${period.name}`);
    }

    // Update snapshot after HTC resolution
    baseScheduleSnapshot = deepClone(resolvedSchedule);

    // -------------------------------------------------------------------------
    // Step 2: Apply EMIT Conflict Resolution (WITH FULL-CYCLE + HTC WORKLOAD)
    // -------------------------------------------------------------------------
    console.log(`\n🔧 Applying EMIT conflict resolution for ${period.name}...`);
    const emitResolution = resolveEMITConflicts(
      resolvedSchedule,
      cycleType,
      periodIndex,
      basePeriodicSchedule,           // Full-cycle base schedules
      dynamicCumulativeWorkload       // Updated with baseline + HTC assignments
    );

    if (emitResolution.success) {
      console.log(
        `✅ EMIT conflicts resolved: ${emitResolution.conflictsResolved}/${emitResolution.conflictsDetected}`
      );
      if (emitResolution.resolutionLog.length > 0) {
        emitResolution.resolutionLog.forEach((log) => console.log(`  ${log}`));
      }
      resolvedSchedule = emitResolution.schedule;

      // ✅ Update cumulative workload with EMIT assignments for next step
      console.log("📊 Updating cumulative workload with EMIT assignments...");
      updateDynamicWorkload(dynamicCumulativeWorkload, resolvedSchedule, baseScheduleSnapshot);
      console.log("📊 Workload after EMIT:", dynamicCumulativeWorkload);
    } else {
      console.warn(`⚠️ EMIT conflict resolution failed for ${period.name}`);
    }

    // Update snapshot after EMIT resolution
    baseScheduleSnapshot = deepClone(resolvedSchedule);

    // -------------------------------------------------------------------------
    // Step 3: Apply EMATIT Conflict Resolution (WITH FULL-CYCLE + HTC + EMIT WORKLOAD)
    // -------------------------------------------------------------------------
    console.log(`\n🔧 Applying EMATIT conflict resolution for ${period.name}...`);
    const ematitResolution = resolveEMATITConflicts(
      resolvedSchedule,
      cycleType,
      periodIndex,
      basePeriodicSchedule,           // Full-cycle base schedules
      dynamicCumulativeWorkload       // Updated with baseline + HTC + EMIT assignments
    );

    if (ematitResolution.success) {
      console.log(
        `✅ EMATIT conflicts resolved: ${ematitResolution.conflictsResolved}/${ematitResolution.conflictsDetected}`
      );
      if (ematitResolution.resolutionLog.length > 0) {
        ematitResolution.resolutionLog.forEach((log) => console.log(`  ${log}`));
      }
      resolvedSchedule = ematitResolution.schedule;

      // ✅ Update cumulative workload with EMATIT assignments for next step
      console.log("📊 Updating cumulative workload with EMATIT assignments...");
      updateDynamicWorkload(dynamicCumulativeWorkload, resolvedSchedule, baseScheduleSnapshot);
      console.log("📊 Workload after EMATIT:", dynamicCumulativeWorkload);
    } else {
      console.warn(`⚠️ EMATIT conflict resolution failed for ${period.name}`);
    }

    // Update snapshot after EMATIT resolution
    baseScheduleSnapshot = deepClone(resolvedSchedule);

    // -------------------------------------------------------------------------
    // Step 4: Apply TeleCs Assignment (WITH FULL-CYCLE + HTC + EMIT + EMATIT WORKLOAD)
    // -------------------------------------------------------------------------
    console.log(`\n🔧 Applying TeleCs assignment for ${period.name}...`);
    const teleCsResolution = resolveTeleCsConflicts(
      resolvedSchedule,
      cycleType,
      periodIndex,
      basePeriodicSchedule,           // Full-cycle base schedules
      dynamicCumulativeWorkload       // Updated with baseline + HTC + EMIT + EMATIT assignments
    );

    if (teleCsResolution.success) {
      console.log(
        `✅ TeleCs assigned: ${teleCsResolution.conflictsResolved}/${teleCsResolution.conflictsDetected}`
      );
      if (teleCsResolution.resolutionLog.length > 0) {
        teleCsResolution.resolutionLog.forEach((log) => console.log(`  ${log}`));
      }
      resolvedSchedule = teleCsResolution.schedule;

      // ✅ Update cumulative workload with TeleCs assignments for next period
      console.log("📊 Updating cumulative workload with TeleCs assignments...");
      updateDynamicWorkload(dynamicCumulativeWorkload, resolvedSchedule, baseScheduleSnapshot);
      console.log("📊 Final workload after this period:", dynamicCumulativeWorkload);

      // Store final schedule with all four resolution logs
      finalPeriodicSchedule[period.name] = {
        period,
        schedule: resolvedSchedule,
        htcResolution: htcResolution.success ? {
          conflictsDetected: htcResolution.conflictsDetected,
          conflictsResolved: htcResolution.conflictsResolved,
          resolutionLog: htcResolution.resolutionLog,
        } : undefined,
        emitResolution: emitResolution.success ? {
          conflictsDetected: emitResolution.conflictsDetected,
          conflictsResolved: emitResolution.conflictsResolved,
          resolutionLog: emitResolution.resolutionLog,
        } : undefined,
        ematitResolution: {
          conflictsDetected: ematitResolution.conflictsDetected,
          conflictsResolved: ematitResolution.conflictsResolved,
          resolutionLog: ematitResolution.resolutionLog,
        },
        teleCsResolution: {
          conflictsDetected: teleCsResolution.conflictsDetected,
          conflictsResolved: teleCsResolution.conflictsResolved,
          resolutionLog: teleCsResolution.resolutionLog,
          teleCsAssignments: teleCsResolution.teleCsAssignments,
        },
      };
    } else {
      console.warn(`⚠️ TeleCs assignment failed for ${period.name}`);
      finalPeriodicSchedule[period.name] = {
        period,
        schedule: resolvedSchedule,
        htcResolution: htcResolution.success ? {
          conflictsDetected: htcResolution.conflictsDetected,
          conflictsResolved: htcResolution.conflictsResolved,
          resolutionLog: htcResolution.resolutionLog,
        } : undefined,
        emitResolution: emitResolution.success ? {
          conflictsDetected: emitResolution.conflictsDetected,
          conflictsResolved: emitResolution.conflictsResolved,
          resolutionLog: emitResolution.resolutionLog,
        } : undefined,
        ematitResolution: {
          conflictsDetected: ematitResolution.conflictsDetected,
          conflictsResolved: ematitResolution.conflictsResolved,
          resolutionLog: ematitResolution.resolutionLog,
        },
      };
    }
  });

  return finalPeriodicSchedule;
}

/**
 * Activity-centric rotation logic
 * Replaces complex round-robin with direct activity-to-doctor mapping
 * @param {number} periodIndex - Index de la période (0 = période 1)
 * @param {string} cycleType - Type de cycle ('honeymoon', 'summer', 'emergency')
 * @returns {Array} Nouvelles assignations selon le cycle spécifié
 */
function applyHoneyMoonRotation(periodIndex, cycleType = "honeymoon") {
  console.log(
    `  🍯 Rotation pour période ${periodIndex + 1} (cycle: ${cycleType}):`
  );

  // Sélectionner le cycle de rotation approprié
  let rotationCycleData = rotation_cycles[cycleType];
  if (!rotationCycleData) {
    const firstAvailable = Object.keys(rotation_cycles)[0];
    console.warn(
      `⚠️ Cycle ${cycleType} non trouvé, utilisation du premier cycle disponible: ${firstAvailable}`
    );
    rotationCycleData = rotation_cycles[firstAvailable];
  } else {
    console.log(`✅ Utilisation du cycle: ${cycleType}`);
  }

  // Afficher la description du cycle pour le débogage
  console.log(`    📝 Description: ${rotationCycleData.description}`);

  // Obtenir les assignations pour cette période (cycle si nécessaire)
  const rotationCycle = rotationCycleData.periods;
  const currentPeriod = rotationCycle[periodIndex % rotationCycle.length];

  // Convertir les assignations en format {doctor, activity}
  const assignments = [];
  console.log(`🔍 Current period data:`, currentPeriod);
  Object.entries(currentPeriod).forEach(([activity, doctor]) => {
    if (activity !== "period") {
      // Exclure le champ 'period'
      assignments.push({
        doctor,
        activity,
      });
      console.log(`    🍯 ${activity} → ${doctor}`);
    }
  });

  console.log(`🔍 Period ${periodIndex + 1} final assignments:`, assignments);
  return assignments;
}

/**
 * Valider qu'un cycle de rotation couvre toutes les activités requises
 * @param {Array} rotationCycle - Cycle de rotation à valider
 * @param {Array} requiredActivities - Activités requises
 * @returns {Object} Résultat de validation {valid: boolean, missing: [], extras: []}
 */
function validateHoneyMoonCycle(
  rotationCycle,
  requiredActivities = ["HTC1", "HTC2", "HDJ", "AMI", "EMIT", "EMATIT"]
) {
  const validation = {
    valid: true,
    missing: [],
    extras: [],
    periods: rotationCycle.length,
  };

  rotationCycle.forEach((period, index) => {
    const periodActivities = Object.keys(period).filter(
      (key) => key !== "period"
    );

    // Vérifier les activités manquantes
    const missing = requiredActivities.filter(
      (activity) => !periodActivities.includes(activity)
    );
    if (missing.length > 0) {
      validation.valid = false;
      validation.missing.push(`Période ${index + 1}: ${missing.join(", ")}`);
    }

    // Vérifier les activités supplémentaires
    const extras = periodActivities.filter(
      (activity) => !requiredActivities.includes(activity)
    );
    if (extras.length > 0) {
      validation.extras.push(`Période ${index + 1}: ${extras.join(", ")}`);
    }
  });

  return validation;
}

/**
 * ALGORITHME PRINCIPAL - ORCHESTRATION DES 3 PHASES
 */

/**
 * Exécuter l'algorithme complet de planification personnalisée
 * @param {string} cycleType - Type de cycle de rotation ('honeymoon', 'summer', 'emergency')
 * @param {Object} dynamicData - Dynamic data from ScheduleContext
 * @returns {Object} Résultat complet de la planification
 */
export function executeCustomPlanningAlgorithm(
  cycleType = "honeymoon",
  dynamicData = null
) {
  console.log(
    `🚀 Démarrage algorithme de planification personnalisée (cycle: ${cycleType})...`
  );

  // Extract dynamic data with fallbacks to static imports
  const {
    doctorProfiles: dynamicDoctorProfiles = doctorProfiles,
    wantedActivities: dynamicWantedActivities = null,
    docActivities: dynamicDocActivities = null,
    rotationTemplates: dynamicRotationTemplates = null,
  } = dynamicData || {};

  const startTime = Date.now();
  const result = {
    success: true,
    phases: {},
    finalSchedule: {},
    periodicSchedule: {},
    statistics: {},
    errors: [],
  };

  try {
    // PHASE 1: Constitution progressive
    console.log("\n📋 PHASE 1: Constitution progressive du planning");
    const phase1Result = createBaseScheduling(
      dynamicDoctorProfiles,
      dynamicWantedActivities
    );
    result.phases.phase1 = phase1Result;

    // PHASE 2: Simplifiée - Pas de résolution automatique des conflits
    console.log("\n✅ PHASE 2: Simplifiée - Planning de base conservé");
    const adjustedSchedule = phase1Result.schedule; // Garder le planning tel quel

    result.phases.phase2 = {
      description:
        "Phase 2 simplifiée - pas de résolution automatique des conflits",
      adjustedSchedule,
    };

    // PHASE 3: Variation périodique
    console.log("\n🔄 PHASE 3: Création des variations périodiques");
    const periodicSchedule = createPeriodicVariations(
      adjustedSchedule,
      phase1Result.rotationAssignments,
      cycleType,
      dynamicDoctorProfiles, // ✅ Pass dynamic data to Phase 3
      dynamicWantedActivities
    );

    result.phases.phase3 = periodicSchedule;
    result.periodicSchedule = periodicSchedule;
    result.finalSchedule = adjustedSchedule;

    // Statistiques
    const endTime = Date.now();
    result.statistics = {
      executionTime: endTime - startTime,
      doctorsProcessed: Object.keys(phase1Result.schedule).length,
      rigidDoctors: phase1Result.rigidDoctors.length,
      flexibleDoctors: phase1Result.flexibleDoctors.length,
      periodsGenerated: Object.keys(periodicSchedule).length,
      simplified: true, // Marqueur pour indiquer la version simplifiée
    };

    console.log("✅ Algorithme terminé avec succès");
    console.log("📊 Statistiques:", result.statistics);
  } catch (error) {
    console.error("❌ Erreur dans l'algorithme:", error);
    result.success = false;
    result.errors.push(error.message);
  }

  return result;
}

/**
 * UTILITAIRES DE VALIDATION ET RAPPORT
 */

/**
 * Générer un rapport détaillé de l'exécution
 * @param {Object} algorithmResult - Résultat de l'algorithme
 * @param {Object} dynamicExpectedActivities - Dynamic expectedActivities from ScheduleContext
 * @returns {Object} Rapport détaillé
 */
export function generateCustomPlanningReport(
  algorithmResult,
  dynamicExpectedActivities = null
) {
  console.log("📋 Génération du rapport de planification personnalisée...");

  const expectedActivities =
    dynamicExpectedActivities || staticExpectedActivities;

  if (!algorithmResult.success) {
    return {
      success: false,
      error: "Algorithme a échoué",
      errors: algorithmResult.errors,
    };
  }

  // Convert to calendar format and perform UI-equivalent validation
  const calendarFormat = convertCustomToCalendarFormat(algorithmResult);
  const validation = validateCalendarFormat(calendarFormat, expectedActivities);
  const realProblems = {
    totalMissing: validation.totalMissing,
    totalDuplicates: validation.totalDuplicates,
  };

  const report = {
    timestamp: new Date().toISOString(),
    algorithmType: "Custom Planning Logic - Simplified 3 Phases",
    success: true,
    summary: {
      totalDoctors: algorithmResult.statistics.doctorsProcessed,
      rigidDoctors: algorithmResult.statistics.rigidDoctors,
      flexibleDoctors: algorithmResult.statistics.flexibleDoctors,
      problemsIdentified: realProblems,
      periodsGenerated: algorithmResult.statistics.periodsGenerated,
      executionTime: `${algorithmResult.statistics.executionTime}ms`,
      simplified: true,
      validationResults: {
        coveragePercentage: validation.coveragePercentage,
        totalSlots: validation.totalSlots,
        validSlots: validation.validSlots,
        missingDetails: validation.problems.missing.slice(0, 5), // Show first 5 for debugging
        duplicateDetails: validation.problems.duplicates.slice(0, 5), // Show first 5 for debugging
        calendarFormatUsed: true, // Indicates this used the same validation as UI
        summaryText: validation.summaryText, // Enhanced summary with activity breakdown
        activityBreakdown: validation.activityBreakdown, // Detailed counts by activity
      },
    },
    phases: {
      phase1: {
        description: "Constitution progressive - Rigides puis souples",
        rigidAssignments: algorithmResult.phases.phase1?.rigidDoctors || [],
        flexibleAssignments:
          algorithmResult.phases.phase1?.flexibleDoctors || [],
        rotationPairs: algorithmResult.phases.phase1?.rotationAssignments || {},
      },
      phase2: {
        description:
          "Phase 2 simplifiée - Pas de résolution automatique des conflits",
        problemsSummary: realProblems,
        conflictsResolved: 0,
      },
      phase3: {
        description: "Variation périodique des rotations",
        periodsCreated: Object.keys(algorithmResult.periodicSchedule).length,
        rotationCycles: "Basé sur rotationSettings et unités de temps",
      },
    },
    recommendations: [],
  };

  // Ajouter des recommandations pour la version simplifiée
  if (report.summary.flexibleDoctors === 0) {
    report.recommendations.push(
      "Aucun médecin flexible détecté - envisager d'ajouter des rotations multiples"
    );
  }

  if (report.summary.rigidDoctors > report.summary.flexibleDoctors) {
    report.recommendations.push(
      "Plus de médecins rigides que flexibles - consider adding more rotation options"
    );
  }

  report.recommendations.push(
    "Version simplifiée - Phase 2 de résolution des conflits désactivée pour une approche plus directe"
  );

  console.log("📊 Rapport généré avec succès");
  return report;
}

/**
 * Comparer avec les autres systèmes de planification
 * @param {Object} customResult - Résultat du système personnalisé
 * @param {Object} simplifiedResult - Résultat du système simplifié (optionnel)
 * @param {Object} originalResult - Résultat du système original (optionnel)
 * @returns {Object} Comparaison détaillée
 */
export function compareWithOtherSystems(
  customResult,
  simplifiedResult = null,
  originalResult = null
) {
  console.log("🔄 Comparaison avec les autres systèmes...");

  const comparison = {
    customLogic: {
      name: "Custom Planning Logic",
      coverage: calculateCoverage(customResult.finalSchedule),
      flexibility: "Haute - 3 phases distinctes",
      transparency: "Très haute - chaque étape explicite",
      maintenance: "Bonne - code structuré",
    },
    simplified: simplifiedResult
      ? {
          name: "Simplified Round Robin",
          coverage: calculateCoverage(simplifiedResult),
          flexibility: "Moyenne - cycles prédéfinis",
          transparency: "Moyenne",
          maintenance: "Moyenne",
        }
      : null,
    original: originalResult
      ? {
          name: "Original System",
          coverage: calculateCoverage(originalResult),
          flexibility: "Faible - statique",
          transparency: "Faible",
          maintenance: "Difficile",
        }
      : null,
    advantages: [
      "Résolution automatique des conflits",
      "Respect strict des backbones",
      "Variation périodique intelligente",
      "Traçabilité complète des décisions",
    ],
    limitations: [
      "Complexité accrue",
      "Temps d'exécution plus long",
      "Nécessite configuration précise des rotationSettings",
    ],
  };

  return comparison;
}

/**
 * Calculer le taux de couverture d'un planning
 * @param {Object} schedule - Planning à analyser
 * @returns {number} Pourcentage de couverture
 */
function calculateCoverage(schedule) {
  if (!schedule) return 0;

  let totalSlots = 0;
  let coveredSlots = 0;

  Object.keys(schedule).forEach((doctor) => {
    DAYS_OF_WEEK.forEach((day) => {
      TIME_SLOTS.forEach((slot) => {
        totalSlots++;
        if (
          schedule[doctor][day] &&
          schedule[doctor][day][slot] &&
          schedule[doctor][day][slot].length > 0
        ) {
          coveredSlots++;
        }
      });
    });
  });

  return totalSlots > 0 ? (coveredSlots / totalSlots) * 100 : 0;
}
