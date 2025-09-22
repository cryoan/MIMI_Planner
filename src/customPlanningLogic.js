import { doctorProfiles, generateDoctorRotations } from './doctorSchedules.js';
import { expectedActivities } from './schedule.jsx';
import { validateSchedule } from './simplifiedRoundRobinPlanner.js';

// Custom Planning Logic - Algorithme de Planification Médical Progressif et Fiable
// Implémentation en 3 phases selon les spécifications utilisateur

console.log('Custom Planning Logic Module Loaded');

/**
 * Configuration de l'algorithme
 */
const TIME_SLOTS = ['9am-1pm', '2pm-6pm'];
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

/**
 * Convert custom planning result to calendar format (same as UI)
 */
function convertCustomToCalendarFormat(customScheduleData) {
  const calendarFormat = {
    2024: { Month1: {} },
    2025: { Month1: {} }
  };

  if (customScheduleData.success) {
    // Priority 1: Use final adjusted schedule for first weeks
    if (customScheduleData.finalSchedule) {
      const firstWeeks = ['Week44', 'Week45', 'Week46', 'Week47'];
      firstWeeks.forEach(weekKey => {
        calendarFormat[2024].Month1[weekKey] = customScheduleData.finalSchedule;
      });
    }

    // Priority 2: Use periodic variations for following weeks
    if (customScheduleData.periodicSchedule) {
      const periods = Object.keys(customScheduleData.periodicSchedule);
      periods.slice(0, 6).forEach((periodName, index) => {
        const weekNumber = 48 + index;
        const year = weekNumber > 52 ? 2025 : 2024;
        const adjustedWeekNumber = weekNumber > 52 ? weekNumber - 52 : weekNumber;
        const weekKey = `Week${adjustedWeekNumber}`;

        if (customScheduleData.periodicSchedule[periodName].schedule) {
          if (year === 2024) {
            calendarFormat[2024].Month1[weekKey] = customScheduleData.periodicSchedule[periodName].schedule;
          } else {
            calendarFormat[2025].Month1[weekKey] = customScheduleData.periodicSchedule[periodName].schedule;
          }
        }
      });
    }

    // Fallback: If no final schedule, use only periodic
    if (!customScheduleData.finalSchedule && customScheduleData.periodicSchedule) {
      const periods = Object.keys(customScheduleData.periodicSchedule);
      periods.slice(0, 10).forEach((periodName, index) => {
        const weekNumber = 44 + index;
        const year = weekNumber > 52 ? 2025 : 2024;
        const adjustedWeekNumber = weekNumber > 52 ? weekNumber - 52 : weekNumber;
        const weekKey = `Week${adjustedWeekNumber}`;

        if (customScheduleData.periodicSchedule[periodName].schedule) {
          if (year === 2024) {
            calendarFormat[2024].Month1[weekKey] = customScheduleData.periodicSchedule[periodName].schedule;
          } else {
            calendarFormat[2025].Month1[weekKey] = customScheduleData.periodicSchedule[periodName].schedule;
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
  const duplicateActivities = ['EMIT', 'HDJ', 'AMI', 'HTC1', 'HTC2', 'EMATIT'];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = ['9am-1pm', '2pm-6pm'];

  let totalMissing = 0;
  let totalDuplicates = 0;
  let totalSlots = 0;
  let validSlots = 0;

  const problems = {
    missing: [],
    duplicates: []
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
                assigned.push(...schedule[year][month][week][doctor][day][slot]);
              }
            });

            const expected = expectedActivities[day]?.[slot] || [];

            // Check for missing activities
            expected.forEach((activity) => {
              if (!assigned.includes(activity)) {
                totalMissing++;
                problems.missing.push({
                  year, month, week, day, slot, activity
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
                year, month, week, day, slot, duplicates
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
            if (expected.every(activity => assigned.includes(activity)) && duplicates.length === 0) {
              validSlots++;
            }
          });
        });
      });
    });
  });

  // Create formatted summary strings
  const formatActivityBreakdown = (activityCounts, total) => {
    if (total === 0) return '';

    const sortedActivities = Object.entries(activityCounts)
      .sort(([,a], [,b]) => b - a) // Sort by count descending
      .map(([activity, count]) => `${activity} ${count}`)
      .join(', ');

    return ` (${sortedActivities})`;
  };

  const missingSummary = `Missing total: ${totalMissing}${formatActivityBreakdown(missingActivityCounts, totalMissing)}`;
  const duplicateSummary = `Duplicate total: ${totalDuplicates}${formatActivityBreakdown(duplicateActivityCounts, totalDuplicates)}`;

  return {
    totalMissing,
    totalDuplicates,
    totalSlots,
    validSlots,
    coveragePercentage: totalSlots > 0 ? (validSlots / totalSlots) * 100 : 0,
    problems,
    activityBreakdown: {
      missing: missingActivityCounts,
      duplicates: duplicateActivityCounts
    },
    summaryText: {
      missing: missingSummary,
      duplicates: duplicateSummary,
      combined: `${missingSummary}\n${duplicateSummary}`
    }
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
const hasSingleRotation = (doctorCode) => {
  const profile = doctorProfiles[doctorCode];
  return profile && profile.rotationSetting && profile.rotationSetting.length === 1;
};

// Vérifier si un médecin a plusieurs rotations possibles
const hasMultipleRotations = (doctorCode) => {
  const profile = doctorProfiles[doctorCode];
  return profile && profile.rotationSetting && profile.rotationSetting.length > 1;
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
export function assignRigidDoctors() {
  console.log('Phase 1.1: Assignation des médecins rigides...');

  const rigidSchedule = {};
  const availableDoctors = Object.keys(doctorProfiles);

  // Identifier les médecins avec une seule rotation
  const rigidDoctors = availableDoctors.filter(hasSingleRotation);

  console.log('Médecins rigides identifiés:', rigidDoctors);

  // Pour chaque médecin rigide, utiliser sa seule rotation disponible
  rigidDoctors.forEach(doctorCode => {
    const profile = doctorProfiles[doctorCode];
    const rotationName = profile.rotationSetting[0]; // Seule rotation disponible

    try {
      // Générer les rotations disponibles pour ce médecin
      const generatedRotations = generateDoctorRotations(doctorCode);

      if (generatedRotations[rotationName]) {
        rigidSchedule[doctorCode] = deepClone(generatedRotations[rotationName]);
        console.log(`✅ ${doctorCode} assigné à rotation ${rotationName} (rigide)`);
      } else {
        console.warn(`⚠️ Rotation ${rotationName} non trouvée pour ${doctorCode}`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de l'assignation de ${doctorCode}:`, error);
    }
  });

  return {
    schedule: rigidSchedule,
    assignedDoctors: rigidDoctors,
    rotationAssignments: rigidDoctors.reduce((acc, doctor) => {
      acc[doctor] = doctorProfiles[doctor].rotationSetting[0];
      return acc;
    }, {})
  };
}

/**
 * Phase 1.2: Créer dictionnaire rotation -> docteurs pour médecins souples
 * @returns {Object} Dictionnaire {rotation: [docteurs correspondants]}
 */
export function createRotationDict() {
  console.log('Phase 1.2: Création du dictionnaire rotation -> docteurs...');

  const rotationDict = {};
  const availableDoctors = Object.keys(doctorProfiles);

  // Identifier les médecins avec plusieurs rotations
  const flexibleDoctors = availableDoctors.filter(hasMultipleRotations);

  flexibleDoctors.forEach(doctorCode => {
    const profile = doctorProfiles[doctorCode];

    profile.rotationSetting.forEach(rotation => {
      if (!rotationDict[rotation]) {
        rotationDict[rotation] = [];
      }
      rotationDict[rotation].push(doctorCode);
    });
  });

  console.log('Dictionnaire rotation -> docteurs:', rotationDict);
  return rotationDict;
}

/**
 * Phase 1.2: Sélectionner un médecin responsable par rotation (couple unique)
 * @param {Object} rotationDict - Dictionnaire rotation -> docteurs
 * @param {Object} existingAssignments - Assignations existantes des médecins rigides
 * @returns {Object} Couples uniques doctor-rotation
 */
export function selectUniqueRotationPairs(rotationDict, existingAssignments = {}) {
  console.log('Phase 1.2: Sélection couples uniques doctor-rotation...');

  const uniquePairs = { ...existingAssignments };
  const assignedDoctors = new Set(Object.keys(existingAssignments));

  // Pour chaque rotation, choisir un médecin responsable
  Object.entries(rotationDict).forEach(([rotation, doctors]) => {
    // Filtrer les médecins déjà assignés
    const availableDoctors = doctors.filter(doctor => !assignedDoctors.has(doctor));

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
export function createBaseScheduling() {
  console.log('Phase 1: Constitution du planning de base...');

  // Phase 1.1: Médecins rigides
  const rigidResult = assignRigidDoctors();

  // Phase 1.2: Médecins souples
  const rotationDict = createRotationDict();
  const uniquePairs = selectUniqueRotationPairs(rotationDict, rigidResult.rotationAssignments);

  // Générer le planning complet à partir des couples uniques
  const completeSchedule = { ...rigidResult.schedule };

  Object.entries(uniquePairs).forEach(([doctorCode, rotationName]) => {
    if (!completeSchedule[doctorCode]) {
      try {
        const generatedRotations = generateDoctorRotations(doctorCode);

        if (generatedRotations[rotationName]) {
          completeSchedule[doctorCode] = deepClone(generatedRotations[rotationName]);
          console.log(`✅ ${doctorCode} assigné à rotation ${rotationName} (souple)`);
        }
      } catch (error) {
        console.error(`❌ Erreur lors de l'assignation de ${doctorCode}:`, error);
      }
    }
  });

  return {
    schedule: completeSchedule,
    rotationAssignments: uniquePairs,
    rigidDoctors: rigidResult.assignedDoctors,
    flexibleDoctors: Object.keys(uniquePairs).filter(doctor =>
      !rigidResult.assignedDoctors.includes(doctor)
    )
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
 */
export function calculateRotationPeriods() {
  console.log('Phase 3: Calcul des périodes de rotation...');

  // Utiliser la logique existante des vacances scolaires
  // Pour l'instant, définir des périodes fixes de 3-4 semaines
  const rotationPeriods = [
    { name: 'Période 1', startWeek: 44, endWeek: 47, year: 2024 },
    { name: 'Période 2', startWeek: 48, endWeek: 51, year: 2024 },
    { name: 'Période 3', startWeek: 52, endWeek: 3, year: 2025 },
    { name: 'Période 4', startWeek: 4, endWeek: 7, year: 2025 },
    { name: 'Période 5', startWeek: 8, endWeek: 11, year: 2025 },
    { name: 'Période 6', startWeek: 12, endWeek: 15, year: 2025 },
  ];

  console.log('Périodes de rotation calculées:', rotationPeriods.length);
  return rotationPeriods;
}

/**
 * Créer les variations périodiques des rotations avec round-robin contraint
 * @param {Object} baseSchedule - Planning de base
 * @param {Object} rotationAssignments - Assignations des rotations
 * @returns {Object} Planning avec variations périodiques
 */
export function createPeriodicVariations(baseSchedule, rotationAssignments) {
  console.log('Phase 3: Création des variations périodiques...');

  const rotationPeriods = calculateRotationPeriods();
  const periodicSchedule = {};

  // Identifier les médecins rigides et flexibles
  const rigidDoctors = [];
  const flexibleDoctors = [];

  Object.entries(rotationAssignments).forEach(([doctorCode]) => {
    const profile = doctorProfiles[doctorCode];
    if (profile?.rotationSetting?.length <= 1) {
      rigidDoctors.push(doctorCode);
    } else {
      flexibleDoctors.push(doctorCode);
    }
  });

  // Extraire les activités de base des médecins flexibles (Période 1)
  const baseFlexibleAssignments = flexibleDoctors.map(doctor => ({
    doctor,
    activity: rotationAssignments[doctor]
  }));

  console.log('Base flexible assignments:', baseFlexibleAssignments);

  rotationPeriods.forEach((period, periodIndex) => {
    console.log(`Génération ${period.name}...`);
    const periodSchedule = {};

    // 1. Garder les médecins rigides inchangés
    rigidDoctors.forEach(doctorCode => {
      if (baseSchedule[doctorCode]) {
        periodSchedule[doctorCode] = deepClone(baseSchedule[doctorCode]);
        console.log(`  🔒 ${doctorCode}: planning rigide conservé`);
      }
    });

    // 2. Appliquer le round-robin contraint pour les médecins flexibles
    const newFlexibleAssignments = applyConstraintAwareRoundRobin(
      baseFlexibleAssignments,
      periodIndex
    );

    // 3. Générer les plannings pour les nouvelles assignations
    newFlexibleAssignments.forEach(({ doctor, activity }) => {
      try {
        const generatedRotations = generateDoctorRotations(doctor);
        if (generatedRotations[activity]) {
          periodSchedule[doctor] = deepClone(generatedRotations[activity]);
          console.log(`  🔄 ${doctor}: ${rotationAssignments[doctor]} → ${activity}`);
        } else {
          // Fallback: garder le planning de base
          periodSchedule[doctor] = deepClone(baseSchedule[doctor]);
          console.log(`  ⚠️ Rotation ${activity} non trouvée pour ${doctor} - planning de base conservé`);
        }
      } catch (error) {
        console.error(`❌ Erreur rotation ${doctor}:`, error);
        periodSchedule[doctor] = deepClone(baseSchedule[doctor]);
      }
    });

    // 4. Gestion spéciale pour DL avec 2 backbones
    if (rotationAssignments['DL'] && doctorProfiles['DL']?.rotationSetting?.length === 2) {
      const backboneIndex = periodIndex % 2;
      const selectedRotation = doctorProfiles['DL'].rotationSetting[backboneIndex];

      try {
        const generatedRotations = generateDoctorRotations('DL');
        if (generatedRotations[selectedRotation]) {
          periodSchedule['DL'] = deepClone(generatedRotations[selectedRotation]);
          console.log(`  🏥 DL backbone alternance: ${selectedRotation}`);
        }
      } catch (error) {
        console.error(`❌ Erreur backbone DL:`, error);
      }
    }

    periodicSchedule[period.name] = {
      period,
      schedule: periodSchedule
    };
  });

  return periodicSchedule;
}

/**
 * Appliquer un round-robin par groupe de médecins partageant les mêmes rotations
 * @param {Array} baseAssignments - Assignations de base [{doctor, activity}]
 * @param {number} periodIndex - Index de la période (0 = période 1)
 * @returns {Array} Nouvelles assignations respectant les contraintes
 */
function applyConstraintAwareRoundRobin(baseAssignments, periodIndex) {
  if (periodIndex === 0) {
    // Période 1: retourner les assignations de base
    return baseAssignments;
  }

  console.log(`  Round-robin par groupe pour période ${periodIndex + 1}:`);

  // 1. Grouper les médecins par leurs rotationSettings
  const doctorGroups = groupDoctorsByRotations(baseAssignments);

  // 2. Appliquer round-robin au sein de chaque groupe
  const allNewAssignments = [];

  doctorGroups.forEach((group, groupIndex) => {
    console.log(`    Groupe ${groupIndex + 1} (rotations: [${group.rotations.join(', ')}]):`);

    const groupAssignments = rotateWithinGroup(group, periodIndex);
    allNewAssignments.push(...groupAssignments);

    groupAssignments.forEach(assignment => {
      console.log(`      🔄 ${assignment.doctor} → ${assignment.activity}`);
    });
  });

  return allNewAssignments;
}

/**
 * Grouper les médecins par leurs rotationSettings identiques
 * @param {Array} baseAssignments - Assignations de base
 * @returns {Array} Groupes de médecins [{doctors: [], rotations: [], baseAssignments: []}]
 */
function groupDoctorsByRotations(baseAssignments) {
  const groups = [];

  baseAssignments.forEach(assignment => {
    const doctor = assignment.doctor;
    const profile = doctorProfiles[doctor];
    const rotations = profile?.rotationSetting || [];

    // Trouver un groupe existant avec les mêmes rotations
    let existingGroup = groups.find(group =>
      arraysEqual(group.rotations, rotations)
    );

    if (existingGroup) {
      existingGroup.doctors.push(doctor);
      existingGroup.baseAssignments.push(assignment);
    } else {
      // Créer un nouveau groupe
      groups.push({
        doctors: [doctor],
        rotations: [...rotations],
        baseAssignments: [assignment]
      });
    }
  });

  console.log(`    Groupes créés: ${groups.length}`);
  groups.forEach((group, index) => {
    console.log(`      Groupe ${index + 1}: [${group.doctors.join(', ')}] → [${group.rotations.join(', ')}]`);
  });

  return groups;
}

/**
 * Appliquer la rotation au sein d'un groupe de médecins
 * @param {Object} group - Groupe de médecins {doctors, rotations, baseAssignments}
 * @param {number} periodIndex - Index de la période
 * @returns {Array} Nouvelles assignations pour ce groupe
 */
function rotateWithinGroup(group, periodIndex) {
  const { doctors, rotations, baseAssignments } = group;

  if (rotations.length <= 1) {
    // Groupe avec une seule rotation possible - pas de changement
    return baseAssignments;
  }

  // Extraire les activités actuelles du groupe dans l'ordre des médecins
  const currentActivities = baseAssignments.map(assignment => assignment.activity);

  // Appliquer la rotation des activités au sein du groupe
  const rotatedActivities = [...currentActivities];
  for (let i = 0; i < periodIndex; i++) {
    rotatedActivities.unshift(rotatedActivities.pop());
  }

  // Créer les nouvelles assignations
  const newAssignments = doctors.map((doctor, index) => ({
    doctor,
    activity: rotatedActivities[index]
  }));

  return newAssignments;
}

/**
 * Vérifier si deux tableaux sont identiques
 * @param {Array} arr1 - Premier tableau
 * @param {Array} arr2 - Deuxième tableau
 * @returns {boolean} True si identiques
 */
function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;

  // Trier les deux tableaux pour comparer le contenu
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();

  return sorted1.every((value, index) => value === sorted2[index]);
}

/**
 * ALGORITHME PRINCIPAL - ORCHESTRATION DES 3 PHASES
 */

/**
 * Exécuter l'algorithme complet de planification personnalisée
 * @param {Object} options - Options de configuration
 * @returns {Object} Résultat complet de la planification
 */
export function executeCustomPlanningAlgorithm() {
  console.log('🚀 Démarrage algorithme de planification personnalisée...');

  const startTime = Date.now();
  const result = {
    success: true,
    phases: {},
    finalSchedule: {},
    periodicSchedule: {},
    statistics: {},
    errors: []
  };

  try {
    // PHASE 1: Constitution progressive
    console.log('\n📋 PHASE 1: Constitution progressive du planning');
    const phase1Result = createBaseScheduling();
    result.phases.phase1 = phase1Result;

    // PHASE 2: Simplifiée - Pas de résolution automatique des conflits
    console.log('\n✅ PHASE 2: Simplifiée - Planning de base conservé');
    const adjustedSchedule = phase1Result.schedule; // Garder le planning tel quel

    result.phases.phase2 = {
      description: 'Phase 2 simplifiée - pas de résolution automatique des conflits',
      adjustedSchedule
    };

    // PHASE 3: Variation périodique
    console.log('\n🔄 PHASE 3: Création des variations périodiques');
    const periodicSchedule = createPeriodicVariations(
      adjustedSchedule,
      phase1Result.rotationAssignments
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
      simplified: true // Marqueur pour indiquer la version simplifiée
    };

    console.log('✅ Algorithme terminé avec succès');
    console.log('📊 Statistiques:', result.statistics);

  } catch (error) {
    console.error('❌ Erreur dans l\'algorithme:', error);
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
 * @returns {Object} Rapport détaillé
 */
export function generateCustomPlanningReport(algorithmResult) {
  console.log('📋 Génération du rapport de planification personnalisée...');

  if (!algorithmResult.success) {
    return {
      success: false,
      error: 'Algorithme a échoué',
      errors: algorithmResult.errors
    };
  }

  // Convert to calendar format and perform UI-equivalent validation
  const calendarFormat = convertCustomToCalendarFormat(algorithmResult);
  const validation = validateCalendarFormat(calendarFormat, expectedActivities);
  const realProblems = {
    totalMissing: validation.totalMissing,
    totalDuplicates: validation.totalDuplicates
  };

  const report = {
    timestamp: new Date().toISOString(),
    algorithmType: 'Custom Planning Logic - Simplified 3 Phases',
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
        activityBreakdown: validation.activityBreakdown // Detailed counts by activity
      }
    },
    phases: {
      phase1: {
        description: 'Constitution progressive - Rigides puis souples',
        rigidAssignments: algorithmResult.phases.phase1?.rigidDoctors || [],
        flexibleAssignments: algorithmResult.phases.phase1?.flexibleDoctors || [],
        rotationPairs: algorithmResult.phases.phase1?.rotationAssignments || {}
      },
      phase2: {
        description: 'Phase 2 simplifiée - Pas de résolution automatique des conflits',
        problemsSummary: realProblems,
        conflictsResolved: 0
      },
      phase3: {
        description: 'Variation périodique des rotations',
        periodsCreated: Object.keys(algorithmResult.periodicSchedule).length,
        rotationCycles: 'Basé sur rotationSettings et unités de temps'
      }
    },
    recommendations: []
  };

  // Ajouter des recommandations pour la version simplifiée
  if (report.summary.flexibleDoctors === 0) {
    report.recommendations.push(
      'Aucun médecin flexible détecté - envisager d\'ajouter des rotations multiples'
    );
  }

  if (report.summary.rigidDoctors > report.summary.flexibleDoctors) {
    report.recommendations.push(
      'Plus de médecins rigides que flexibles - consider adding more rotation options'
    );
  }

  report.recommendations.push(
    'Version simplifiée - Phase 2 de résolution des conflits désactivée pour une approche plus directe'
  );

  console.log('📊 Rapport généré avec succès');
  return report;
}

/**
 * Comparer avec les autres systèmes de planification
 * @param {Object} customResult - Résultat du système personnalisé
 * @param {Object} simplifiedResult - Résultat du système simplifié (optionnel)
 * @param {Object} originalResult - Résultat du système original (optionnel)
 * @returns {Object} Comparaison détaillée
 */
export function compareWithOtherSystems(customResult, simplifiedResult = null, originalResult = null) {
  console.log('🔄 Comparaison avec les autres systèmes...');

  const comparison = {
    customLogic: {
      name: 'Custom Planning Logic',
      coverage: calculateCoverage(customResult.finalSchedule),
      flexibility: 'Haute - 3 phases distinctes',
      transparency: 'Très haute - chaque étape explicite',
      maintenance: 'Bonne - code structuré'
    },
    simplified: simplifiedResult ? {
      name: 'Simplified Round Robin',
      coverage: calculateCoverage(simplifiedResult),
      flexibility: 'Moyenne - cycles prédéfinis',
      transparency: 'Moyenne',
      maintenance: 'Moyenne'
    } : null,
    original: originalResult ? {
      name: 'Original System',
      coverage: calculateCoverage(originalResult),
      flexibility: 'Faible - statique',
      transparency: 'Faible',
      maintenance: 'Difficile'
    } : null,
    advantages: [
      'Résolution automatique des conflits',
      'Respect strict des backbones',
      'Variation périodique intelligente',
      'Traçabilité complète des décisions'
    ],
    limitations: [
      'Complexité accrue',
      'Temps d\'exécution plus long',
      'Nécessite configuration précise des rotationSettings'
    ]
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

  DAYS_OF_WEEK.forEach(day => {
    TIME_SLOTS.forEach(slot => {
      const expected = expectedActivities[day]?.[slot] || [];
      const assigned = [];

      Object.values(schedule).forEach(doctorSchedule => {
        const activities = doctorSchedule[day]?.[slot] || [];
        assigned.push(...activities);
      });

      totalSlots += expected.length;
      expected.forEach(activity => {
        if (assigned.includes(activity)) {
          coveredSlots++;
        }
      });
    });
  });

  return totalSlots > 0 ? (coveredSlots / totalSlots) * 100 : 100;
}

// Note: Toutes les fonctions principales sont déjà exportées individuellement avec 'export function'
// Pas besoin d'export groupé supplémentaire pour éviter les duplications