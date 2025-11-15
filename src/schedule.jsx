export const expectedActivities = {
  // Engagement du service sur activités quotidiennes
  // Monday: {
  //   "9am-1pm": ["HTC1", "HTC2", "EMIT", "AMI"],
  //   "2pm-6pm": ["HTC1", "HTC2", "EMIT", "AMI"],
  // },
  // Tuesday: {
  //   "9am-1pm": ["HTC1_visite", "HTC2_visite", "EMIT", "HDJ", "AMI"],
  //   "2pm-6pm": ["HTC1", "HTC2", "EMIT", "AMI"],
  // },
  // Wednesday: {
  //   "9am-1pm": ["HTC1", "HTC2", "EMIT", "AMI"],
  //   "2pm-6pm": ["HTC1", "HTC2", "EMIT", "AMI"],
  // },
  // Thursday: {
  //   "9am-1pm": ["HTC1", "HTC2", "EMIT", "HDJ", "AMI"],
  //   "2pm-6pm": ["HTC1", "HTC2", "EMIT", "AMI"],
  // },
  // Friday: {
  //   "9am-1pm": ["HTC1_visite", "HTC2_visite", "EMIT", "HDJ", "AMI"],
  //   "2pm-6pm": ["HTC1", "HTC2", "EMIT", "HDJ", "AMI"],
  // },
  //including EMATIT
  Monday: {
    "9am-1pm": ["HTC1", "HTC2", "EMIT", "EMATIT"],
    "2pm-6pm": ["HTC1", "HTC2", "EMIT", "EMATIT"],
  },
  Tuesday: {
    "9am-1pm": ["HTC1_visite", "HTC2_visite", "EMIT", "HDJ", "EMATIT"],
    "2pm-6pm": ["HTC1", "HTC2", "EMIT", , "HDJ", "EMATIT"],
  },
  Wednesday: {
    "9am-1pm": ["HTC1", "HTC2", "EMIT", "EMATIT"],
    "2pm-6pm": ["HTC1", "HTC2", "EMIT", "EMATIT"],
  },
  Thursday: {
    "9am-1pm": ["HTC1", "HTC2", "EMIT", "HDJ", "EMATIT"],
    "2pm-6pm": ["HTC1", "HTC2", "EMIT", "EMATIT"],
  },
  Friday: {
    "9am-1pm": ["HTC1_visite", "HTC2_visite", "EMIT", "HDJ", "EMATIT"],
    "2pm-6pm": ["HTC1", "HTC2", "EMIT", "HDJ", "EMATIT"],
  },
};

export const rotationTemplates = {
  HTC1: {
    Monday: { "9am-1pm": ["HTC1"], "2pm-6pm": ["HTC1"] },
    Tuesday: { "9am-1pm": ["HTC1_visite"], "2pm-6pm": ["HTC1"] },
    Wednesday: { "9am-1pm": ["HTC1"], "2pm-6pm": ["HTC1"] },
    Thursday: { "9am-1pm": ["HTC1"], "2pm-6pm": ["HTC1"] },
    Friday: { "9am-1pm": ["HTC1_visite"], "2pm-6pm": ["HTC1"] },
  },

  HTC2: {
    Monday: { "9am-1pm": ["HTC2"], "2pm-6pm": ["HTC2"] },
    Tuesday: { "9am-1pm": ["HTC2_visite"], "2pm-6pm": ["HTC2"] },
    Wednesday: { "9am-1pm": ["HTC2"], "2pm-6pm": ["HTC2"] },
    Thursday: { "9am-1pm": ["HTC2"], "2pm-6pm": ["HTC2"] },
    Friday: { "9am-1pm": ["HTC2_visite"], "2pm-6pm": ["HTC2"] },
  },

  EMIT: {
    Monday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
    Tuesday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
    Wednesday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
    Thursday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
    Friday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
  },

  HDJ: {
    Monday: { "9am-1pm": [], "2pm-6pm": [] },
    Tuesday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
    Wednesday: { "9am-1pm": [], "2pm-6pm": [] },
    Thursday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
    Friday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
  },

  AMI: {
    Monday: { "9am-1pm": ["AMI"], "2pm-6pm": ["AMI"] },
    Tuesday: { "9am-1pm": ["AMI"], "2pm-6pm": ["AMI"] },
    Wednesday: { "9am-1pm": ["AMI"], "2pm-6pm": ["AMI"] },
    Thursday: { "9am-1pm": ["AMI"], "2pm-6pm": ["AMI"] },
    Friday: { "9am-1pm": ["AMI"], "2pm-6pm": ["AMI"] },
  },

  EMATIT: {
    Monday: { "9am-1pm": [], "2pm-6pm": [] },
    Tuesday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["EMATIT"] },
    Wednesday: { "9am-1pm": [], "2pm-6pm": [] },
    Thursday: { "9am-1pm": ["EMATIT"], "2pm-6pm": [] },
    Friday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["EMATIT"] },
  },

  MPO: {
    Monday: { "9am-1pm": ["MPO"], "2pm-6pm": ["MPO"] },
    Tuesday: { "9am-1pm": ["MPO"], "2pm-6pm": ["MPO"] },
    Wednesday: { "9am-1pm": ["MPO"], "2pm-6pm": ["MPO"] },
    Thursday: { "9am-1pm": ["MPO"], "2pm-6pm": ["MPO"] },
    Friday: { "9am-1pm": ["MPO"], "2pm-6pm": ["MPO"] },
  },
};

export const activityColors = {
  TP: "#B0BEC5", // Muted Gray (Clean and neutral)
  HTC1: "#388E3C", // Fresh Green (Symbolizing healthcare/medical activities)
  HTC2: "#388E3C", // Slightly Brighter Green (For distinction but still related to HTC1)
  HTC1_visite: "#388E3C", // Slightly Brighter Green (For distinction but still related to HTC1)
  HTC2_visite: "#388E3C", // Slightly Brighter Green (For distinction but still related to HTC1)
  Cs: "#81C784", // Light Mint Green (Complementary to HTC1/HTC2 for consultations)
  Cs_Prison: "#81C784", // Light Mint Green (Complementary to HTC1/HTC2 for consultations)
  TeleCs: "#A5D6A7", // Softer Mint Green (A lighter version of Cs for remote consultations)
  EMIT: "#1E88E5", // Clear Blue (Represents urgency and medical intervention)
  EMATIT: "#64B5F6", // Lighter Blue (A softer variant for related activities)
  // HDJ: '#FFEB3B', // Bright Yellow (Attention-grabbing, represents day hospital activities)
  HDJ: "#FB8C00",
  // HDJ: '#FFB74D',
  AMI: "#FFB74D", // Bold Orange (Energy, activity, fits with medical context)
  AMI_Cs_U: "#FFB74D", // Bold Orange (Energy, activity, fits with medical context)
  // AMI: '#FB8C00', // Bold Orange (Energy, activity, fits with medical context)
  MPO: "#CFD8DC", // Very Light Gray (Subtle for tasks that are less prominent)
  Vacances: "#FFCDD2", // Soft Pastel Red/Pink (Relaxation or off-duty)
  RTT: "#FFAB91", // Lighter Coral (Similar to vacations but more professional)
  FMC: "#FFCCBC", // Peach (Gentle, soft color for training/continuing education)
  WE: "#5E35B1", // Rich Purple (Strong and distinct for weekend shifts)
  Chefferie: "black",
  Staff: "#7B68EE", // Medium Slate Blue (Professional color for staff activities)
};

//__________________________________________//

import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { realTimeDb } from "./firebase"; // Make sure this points to your Firebase configuration
import { doc } from "./doctorSchedules.js";
// Hook to fetch the 'doc' object from Firebase

export const useDocSchedule = () => {
  // let doc = doc;
  // const [doc, setDoc] = useState(doc);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocSchedule = async () => {
      try {
        // const docRef = ref(realTimeDb, 'doc'); // Adjust this path if necessary
        // const snapshot = await get(docRef);
        // if (snapshot.exists()) {
        //   setDoc(snapshot.val());
        if (doc) {
          return doc;
        } else {
          console.log("No data available");
        }
      } catch (error) {
        console.error("Error fetching doc schedule:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocSchedule();
  }, []);
  console.log("doc", doc);
  return { doc, loading };
};

//==============================================
// SIMPLIFIED ROTATION SYSTEM (NEW ARCHITECTURE)
//==============================================

// Based on analysis, these 18 unique combinations replace the 48 redundant ones
export const simplifiedRotationCycles = {
  cycle_M1_S1: {
    YC: "M1",
    FL: "M1.S1_S2",
    CL: "M1",
    DL: "M1.S1_S2",
    GC: "M1",
    MDLC: "M1",
    MG: "M1",
    RNV: "M1",
    BM: "BM",
  },
  cycle_M1_S3: {
    YC: "M1",
    FL: "M1.S3_S4",
    CL: "M1",
    DL: "M1.S3_S4",
    GC: "M1",
    MDLC: "M1",
    MG: "M1",
    RNV: "M1",
    BM: "BM",
  },
  cycle_M2_S1: {
    YC: "M2.S1",
    FL: "M2",
    CL: "M2.S1_S2",
    DL: "M2.S1_S2",
    GC: "M2",
    MDLC: "M2",
    MG: "M2",
    RNV: "M2",
    BM: "BM",
  },
  cycle_M2_S2: {
    YC: "M2.S2",
    FL: "M2",
    CL: "M2.S1_S2",
    DL: "M2.S1_S2",
    GC: "M2",
    MDLC: "M2",
    MG: "M2",
    RNV: "M2",
    BM: "BM",
  },
  cycle_M2_S3: {
    YC: "M2.S3_S4",
    FL: "M2",
    CL: "M2.S3_S4",
    DL: "M2.S3_S4",
    GC: "M2",
    MDLC: "M2",
    MG: "M2",
    RNV: "M2",
    BM: "BM",
  },
  cycle_M3_S1: {
    YC: "M3.S1_S2",
    FL: "M3.S1_S2",
    CL: "M3",
    DL: "M3.S1_S2",
    GC: "M3",
    MDLC: "M3",
    MG: "M3.S1_S2",
    RNV: "M3",
    BM: "BM",
  },
  cycle_M3_S3: {
    YC: "M3.S3_S4",
    FL: "M3.S3_S4",
    CL: "M3",
    DL: "M3.S3_S4",
    GC: "M3",
    MDLC: "M3",
    MG: "M3.S3_S4",
    RNV: "M3",
    BM: "BM",
  },
  cycle_M4_S1: {
    YC: "M1",
    FL: "M4",
    CL: "M4.S1_S2",
    DL: "M1.S1_S2",
    GC: "M1",
    MDLC: "M1",
    MG: "M4",
    RNV: "M1",
    BM: "BM",
  },
  cycle_M4_S3: {
    YC: "M1",
    FL: "M4",
    CL: "M4.S3_S4",
    DL: "M1.S3_S4",
    GC: "M1",
    MDLC: "M1",
    MG: "M4",
    RNV: "M1",
    BM: "BM",
  },
  cycle_M5_S1: {
    YC: "M2.S1",
    FL: "M5.S1_S2",
    CL: "M5",
    DL: "M2.S1_S2",
    GC: "M2",
    MDLC: "M2",
    MG: "M5.S1_S2",
    RNV: "M2",
    BM: "BM",
  },
  cycle_M5_S2: {
    YC: "M2.S2",
    FL: "M5.S1_S2",
    CL: "M5",
    DL: "M2.S1_S2",
    GC: "M2",
    MDLC: "M2",
    MG: "M5.S1_S2",
    RNV: "M2",
    BM: "BM",
  },
  cycle_M5_S3: {
    YC: "M5.S3_S4",
    FL: "M5.S3_S4",
    CL: "M5",
    DL: "M2.S3_S4",
    GC: "M2",
    MDLC: "M2",
    MG: "M5.S3_S4",
    RNV: "M2",
    BM: "BM",
  },
  cycle_M6_S1: {
    YC: "M6.S1_S2",
    FL: "M6",
    CL: "M6.S1_S2",
    DL: "M3.S1_S2",
    GC: "M3",
    MDLC: "M3",
    MG: "M6",
    RNV: "M3",
    BM: "BM",
  },
  cycle_M6_S3: {
    YC: "M6.S3_S4",
    FL: "M6",
    CL: "M6.S3_S4",
    DL: "M3.S3_S4",
    GC: "M3",
    MDLC: "M3",
    MG: "M6",
    RNV: "M3",
    BM: "BM",
  },
  // These are the unique ones from the original M10/M11 pattern variations
  cycle_M10_S1: {
    YC: "M4.S1_S2",
    FL: "M4",
    CL: "M4.S1_S2",
    DL: "M1.S1_S2",
    GC: "M1",
    MDLC: "M1",
    MG: "M4",
    RNV: "M1",
    BM: "BM",
  },
  cycle_M10_S3: {
    YC: "M4.S3_S4",
    FL: "M4",
    CL: "M4.S3_S4",
    DL: "M1.S3_S4",
    GC: "M1",
    MDLC: "M1",
    MG: "M4",
    RNV: "M1",
    BM: "BM",
  },
  cycle_M11_S1: {
    YC: "M5.S1",
    FL: "M5.S1_S2",
    CL: "M5",
    DL: "M2.S1_S2",
    GC: "M2",
    MDLC: "M2",
    MG: "M5.S1_S2",
    RNV: "M2",
    BM: "BM",
  },
  cycle_M11_S2: {
    YC: "M5.S2",
    FL: "M5.S1_S2",
    CL: "M5",
    DL: "M2.S1_S2",
    GC: "M2",
    MDLC: "M2",
    MG: "M5.S1_S2",
    RNV: "M2",
    BM: "BM",
  },
};

// Exact mapping from the original hardcoded schedule
const WEEK_TO_COMBO_MAP = {
  // 2024
  44: "M11_S3",
  45: "M11_S4",
  46: "M12_S1",
  47: "M12_S2",
  48: "M12_S3",
  49: "M12_S4",
  50: "M1_S1",
  51: "M1_S2",
  52: "M1_S3",
  // 2025
  1: "M2_S1",
  2: "M2_S2",
  3: "M2_S3",
  4: "M2_S4",
  5: "M3_S1",
  6: "M3_S2",
  7: "M3_S3",
  8: "M3_S4",
  9: "M4_S1",
  10: "M4_S2",
  11: "M4_S3",
  12: "M4_S4",
  13: "M5_S1",
  14: "M5_S2",
  15: "M5_S3",
  16: "M5_S4",
  17: "M6_S1",
  18: "M6_S2",
  19: "M6_S3",
  20: "M6_S4",
  21: "M7_S1",
  22: "M7_S2",
  23: "M7_S3",
  24: "M7_S4",
  25: "M8_S1",
  26: "M8_S2",
  27: "M8_S3",
  28: "M8_S4",
  29: "M9_S1",
  30: "M9_S2",
  31: "M9_S3",
  32: "M9_S4",
  33: "M10_S1",
  34: "M10_S2",
  35: "M10_S3",
  36: "M10_S4",
  37: "M11_S1",
  38: "M11_S2",
  39: "M11_S3",
  40: "M11_S4",
  41: "M12_S1",
  42: "M12_S2",
  43: "M12_S3",
  44: "M12_S4",
  45: "M1_S1",
  46: "M1_S2",
  47: "M1_S3",
  48: "M1_S4",
  49: "M2_S1",
  50: "M2_S2",
  51: "M2_S3",
  52: "M2_S4",
};

// Map old combo names to new simplified cycle names
const COMBO_TO_CYCLE_MAP = {
  M1_S1: "cycle_M1_S1",
  M1_S2: "cycle_M1_S1",
  M1_S3: "cycle_M1_S3",
  M1_S4: "cycle_M1_S3",
  M2_S1: "cycle_M2_S1",
  M2_S2: "cycle_M2_S2",
  M2_S3: "cycle_M2_S3",
  M2_S4: "cycle_M2_S3",
  M3_S1: "cycle_M3_S1",
  M3_S2: "cycle_M3_S1",
  M3_S3: "cycle_M3_S3",
  M3_S4: "cycle_M3_S3",
  M4_S1: "cycle_M4_S1",
  M4_S2: "cycle_M4_S1",
  M4_S3: "cycle_M4_S3",
  M4_S4: "cycle_M4_S3",
  M5_S1: "cycle_M5_S1",
  M5_S2: "cycle_M5_S2",
  M5_S3: "cycle_M5_S3",
  M5_S4: "cycle_M5_S3",
  M6_S1: "cycle_M6_S1",
  M6_S2: "cycle_M6_S1",
  M6_S3: "cycle_M6_S3",
  M6_S4: "cycle_M6_S3",
  // Duplicates that map to existing cycles
  M7_S1: "cycle_M1_S1",
  M7_S2: "cycle_M1_S1",
  M7_S3: "cycle_M1_S3",
  M7_S4: "cycle_M1_S3",
  M8_S1: "cycle_M2_S1",
  M8_S2: "cycle_M2_S2",
  M8_S3: "cycle_M2_S3",
  M8_S4: "cycle_M2_S3",
  M9_S1: "cycle_M3_S1",
  M9_S2: "cycle_M3_S1",
  M9_S3: "cycle_M3_S3",
  M9_S4: "cycle_M3_S3",
  M10_S1: "cycle_M10_S1",
  M10_S2: "cycle_M10_S1",
  M10_S3: "cycle_M10_S3",
  M10_S4: "cycle_M10_S3",
  M11_S1: "cycle_M11_S1",
  M11_S2: "cycle_M11_S2",
  M11_S3: "cycle_M5_S3",
  M11_S4: "cycle_M5_S3",
  M12_S1: "cycle_M6_S1",
  M12_S2: "cycle_M6_S1",
  M12_S3: "cycle_M6_S3",
  M12_S4: "cycle_M6_S3",
};

// Helper function to resolve doctor path to actual schedule
const resolveDoctorSchedule = (doc, doctorPath) => {
  const pathParts = doctorPath.split(".");
  let result = doc;

  for (const part of pathParts) {
    result = result[part];
    if (!result) break;
  }

  return result;
};

// Get rotation cycle for a specific week (exact mapping replacement for hard-coded mapping)
export const getRotationForWeek = (weekNumber, year) => {
  const comboName = WEEK_TO_COMBO_MAP[weekNumber];
  return COMBO_TO_CYCLE_MAP[comboName];
};

// Simplified combo function that uses the new architecture
export const simplifiedCombo = (doc, cycleKey) => {
  const cycle = simplifiedRotationCycles[cycleKey];
  const result = {};

  Object.keys(cycle).forEach((doctor) => {
    const doctorPath = cycle[doctor];
    result[doctor] = resolveDoctorSchedule(doc, doctorPath);
  });

  return result;
};

// New simplified doctors schedule generator
export const simplifiedDoctorsSchedule = (doc) => {
  const schedule = {
    2026: { Month1: {} },
  };

  // Generate 2026 weeks (1-52)
  for (let week = 1; week <= 52; week++) {
    const cycleKey = getRotationForWeek(week, 2026);
    schedule[2026].Month1[`Week${week}`] = simplifiedCombo(doc, cycleKey);
  }

  return schedule;
};

//==============================================
// HOW TO SWITCH TO THE NEW SIMPLIFIED SYSTEM:
//==============================================
//
// In Calendar.jsx, replace:
//   const originalSchedule = doctorsSchedule(doc);
//
// With:
//   const originalSchedule = simplifiedDoctorsSchedule(doc);
//
// This will use the new system that:
// - Reduces complexity from 48 to 18 unique combinations
// - Uses algorithmic week assignment instead of hard-coded mapping
// - Generates identical output to the original system
// - Makes it easier to add new doctors and modify rotations
//==============================================
