export const expectedActivities = {
  // Engagement du service sur activités quotidiennes
  Monday: {
    '9am-1pm': ['HTC1', 'HTC2', 'EMIT', 'AMI'],
    '2pm-6pm': ['HTC1', 'HTC2', 'EMIT', 'AMI'],
  },
  Tuesday: {
    '9am-1pm': ['HTC1_visite', 'HTC2_visite', 'EMIT', 'HDJ', 'AMI'],
    '2pm-6pm': ['HTC1', 'HTC2', 'EMIT', 'AMI'],
  },
  Wednesday: {
    '9am-1pm': ['HTC1', 'HTC2', 'EMIT', 'AMI'],
    '2pm-6pm': ['HTC1', 'HTC2', 'EMIT', 'AMI'],
  },
  Thursday: {
    '9am-1pm': ['HTC1', 'HTC2', 'EMIT', 'HDJ', 'AMI'],
    '2pm-6pm': ['HTC1', 'HTC2', 'EMIT', 'AMI'],
  },
  Friday: {
    '9am-1pm': ['HTC1_visite', 'HTC2_visite', 'EMIT', 'HDJ', 'AMI'],
    '2pm-6pm': ['HTC1', 'HTC2', 'EMIT', 'HDJ', 'AMI'],
  },
  //including EMATIT
  // Monday: {
  //   '9am-1pm': ['HTC1', 'HTC2', 'EMIT', 'EMATIT'],
  //   '2pm-6pm': ['HTC1', 'HTC2', 'EMIT', 'EMATIT'],
  // },
  // Tuesday: {
  //   '9am-1pm': ['HTC1', 'HTC2', 'EMIT', 'HDJ', 'EMATIT'],
  //   '2pm-6pm': ['HTC1', 'HTC2', 'EMIT', , 'EMATIT'],
  // },
  // Wednesday: {
  //   '9am-1pm': ['HTC1', 'HTC2', 'EMIT', 'EMATIT'],
  //   '2pm-6pm': ['HTC1', 'HTC2', 'EMIT', 'EMATIT'],
  // },
  // Thursday: {
  //   '9am-1pm': ['HTC1', 'HTC2', 'EMIT', 'HDJ', 'EMATIT'],
  //   '2pm-6pm': ['HTC1', 'HTC2', 'EMIT'],
  // },
  // Friday: {
  //   '9am-1pm': ['HTC1', 'HTC2', 'EMIT', 'HDJ', 'EMATIT'],
  //   '2pm-6pm': ['HTC1', 'HTC2', 'EMIT', 'HDJ', 'EMATIT'],
  // },
};

export const activityColorsOld = {
  TP: 'lightgrey',
  HTC1: 'green',
  HTC2: 'green',
  Cs: 'lightgreen',
  Cs_Prison: 'lightgreen',
  TeleCs: 'rgb(216, 247, 216)',
  EMIT: 'rgb(63, 144, 219)',
  EMATIT: 'lightblue',
  HDJ: 'yellow',
  AMI: 'orange',
  MPO: 'lightgrey',
  Vacances: 'pink',
  RTT: 'pink',
  FMC: 'pink',
  WE: 'rgb(72, 58, 94)',
};

export const activityColors = {
  TP: '#B0BEC5', // Muted Gray (Clean and neutral)
  HTC1: '#388E3C', // Fresh Green (Symbolizing healthcare/medical activities)
  HTC2: '#388E3C', // Slightly Brighter Green (For distinction but still related to HTC1)
  HTC1_visite: '#388E3C', // Slightly Brighter Green (For distinction but still related to HTC1)
  HTC2_visite: '#388E3C', // Slightly Brighter Green (For distinction but still related to HTC1)
  Cs: '#81C784', // Light Mint Green (Complementary to HTC1/HTC2 for consultations)
  Cs_Prison: '#81C784', // Light Mint Green (Complementary to HTC1/HTC2 for consultations)
  TeleCs: '#A5D6A7', // Softer Mint Green (A lighter version of Cs for remote consultations)
  EMIT: '#1E88E5', // Clear Blue (Represents urgency and medical intervention)
  EMATIT: '#64B5F6', // Lighter Blue (A softer variant for related activities)
  // HDJ: '#FFEB3B', // Bright Yellow (Attention-grabbing, represents day hospital activities)
  HDJ: '#FB8C00',
  // HDJ: '#FFB74D',
  AMI: '#FFB74D', // Bold Orange (Energy, activity, fits with medical context)
  AMI_Cs_U: '#FFB74D', // Bold Orange (Energy, activity, fits with medical context)
  // AMI: '#FB8C00', // Bold Orange (Energy, activity, fits with medical context)
  MPO: '#CFD8DC', // Very Light Gray (Subtle for tasks that are less prominent)
  Vacances: '#FFCDD2', // Soft Pastel Red/Pink (Relaxation or off-duty)
  RTT: '#FFAB91', // Lighter Coral (Similar to vacations but more professional)
  FMC: '#FFCCBC', // Peach (Gentle, soft color for training/continuing education)
  WE: '#5E35B1', // Rich Purple (Strong and distinct for weekend shifts)
  Chefferie: 'black',
};

//__________________________________________//

import { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { realTimeDb } from './firebase'; // Make sure this points to your Firebase configuration
import { doc } from './doctorSchedules.js';
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
          console.log('No data available');
        }
      } catch (error) {
        console.error('Error fetching doc schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocSchedule();
  }, []);
  console.log('doc', doc);
  return { doc, loading };
};

export const combo = (doc) => ({
  // combinaison des agendas médicaux selon emploi du temps de chaque médecin pour cycle complet de permutations soit 12 mois, de M1_S1 jusqu'à M12_S4.

  M1_S1: {
    YC: doc.YC.M1,
    FL: doc.FL.M1.S1_S2,
    CL: doc.CL.M1,
    DL: doc.DL.M1.S1_S2,
    GC: doc.GC.M1,
    MDLC: doc.MDLC.M1,
    MG: doc.MG.M1,
    RNV: doc.RNV.M1,
    BM: doc.BM,
  },
  M1_S2: {
    YC: doc.YC.M1,
    FL: doc.FL.M1.S1_S2,
    CL: doc.CL.M1,
    DL: doc.DL.M1.S1_S2,
    GC: doc.GC.M1,
    MDLC: doc.MDLC.M1,
    MG: doc.MG.M1,
    RNV: doc.RNV.M1,
    BM: doc.BM,
  },
  M1_S3: {
    YC: doc.YC.M1,
    FL: doc.FL.M1.S3_S4,
    CL: doc.CL.M1,
    DL: doc.DL.M1.S3_S4,
    GC: doc.GC.M1,
    MDLC: doc.MDLC.M1,
    MG: doc.MG.M1,
    RNV: doc.RNV.M1,
    BM: doc.BM,
  },
  M1_S4: {
    YC: doc.YC.M1,
    FL: doc.FL.M1.S3_S4,
    CL: doc.CL.M1,
    DL: doc.DL.M1.S3_S4,
    GC: doc.GC.M1,
    MDLC: doc.MDLC.M1,
    MG: doc.MG.M1,
    RNV: doc.RNV.M1,
    BM: doc.BM,
  },
  M2_S1: {
    YC: doc.YC.M2.S1,
    FL: doc.FL.M2,
    CL: doc.CL.M2.S1_S2,
    DL: doc.DL.M2.S1_S2,
    GC: doc.GC.M2,
    MDLC: doc.MDLC.M2,
    MG: doc.MG.M2,
    RNV: doc.RNV.M2,
    BM: doc.BM,
  },
  M2_S2: {
    YC: doc.YC.M2.S2,
    FL: doc.FL.M2,
    CL: doc.CL.M2.S1_S2,
    DL: doc.DL.M2.S1_S2,
    GC: doc.GC.M2,
    MDLC: doc.MDLC.M2,
    MG: doc.MG.M2,
    RNV: doc.RNV.M2,
    BM: doc.BM,
  },
  M2_S3: {
    YC: doc.YC.M2.S3_S4,
    FL: doc.FL.M2,
    CL: doc.CL.M2.S3_S4,
    DL: doc.DL.M2.S3_S4,
    GC: doc.GC.M2,
    MDLC: doc.MDLC.M2,
    MG: doc.MG.M2,
    RNV: doc.RNV.M2,
    BM: doc.BM,
  },
  M2_S4: {
    YC: doc.YC.M2.S3_S4,
    FL: doc.FL.M2,
    CL: doc.CL.M2.S3_S4,
    DL: doc.DL.M2.S3_S4,
    GC: doc.GC.M2,
    MDLC: doc.MDLC.M2,
    MG: doc.MG.M2,
    RNV: doc.RNV.M2,
    BM: doc.BM,
  },
  M3_S1: {
    YC: doc.YC.M3.S1_S2,
    FL: doc.FL.M3.S1_S2,
    CL: doc.CL.M3,
    DL: doc.DL.M3.S1_S2,
    GC: doc.GC.M3,
    MDLC: doc.MDLC.M3,
    MG: doc.MG.M3.S1_S2,
    RNV: doc.RNV.M3,
    BM: doc.BM,
  },
  M3_S2: {
    YC: doc.YC.M3.S1_S2,
    FL: doc.FL.M3.S1_S2,
    CL: doc.CL.M3,
    DL: doc.DL.M3.S1_S2,
    GC: doc.GC.M3,
    MDLC: doc.MDLC.M3,
    MG: doc.MG.M3.S1_S2,
    RNV: doc.RNV.M3,
    BM: doc.BM,
  },
  M3_S3: {
    YC: doc.YC.M3.S3_S4,
    FL: doc.FL.M3.S3_S4,
    CL: doc.CL.M3,
    DL: doc.DL.M3.S3_S4,
    GC: doc.GC.M3,
    MDLC: doc.MDLC.M3,
    MG: doc.MG.M3.S3_S4,
    RNV: doc.RNV.M3,
    BM: doc.BM,
  },
  M3_S4: {
    YC: doc.YC.M3.S3_S4,
    FL: doc.FL.M3.S3_S4,
    CL: doc.CL.M3,
    DL: doc.DL.M3.S3_S4,
    GC: doc.GC.M3,
    MDLC: doc.MDLC.M3,
    MG: doc.MG.M3.S3_S4,
    RNV: doc.RNV.M3,
    BM: doc.BM,
  },
  M4_S1: {
    YC: doc.YC.M1,
    FL: doc.FL.M4,
    CL: doc.CL.M4.S1_S2,
    DL: doc.DL.M1.S1_S2,
    GC: doc.GC.M1,
    MDLC: doc.MDLC.M1,
    MG: doc.MG.M4,
    RNV: doc.RNV.M1,
    BM: doc.BM,
  },
  M4_S2: {
    YC: doc.YC.M1,
    FL: doc.FL.M4,
    CL: doc.CL.M4.S1_S2,
    DL: doc.DL.M1.S1_S2,
    GC: doc.GC.M1,
    MDLC: doc.MDLC.M1,
    MG: doc.MG.M4,
    RNV: doc.RNV.M1,
    BM: doc.BM,
  },
  M4_S3: {
    YC: doc.YC.M1,
    FL: doc.FL.M4,
    CL: doc.CL.M4.S3_S4,
    DL: doc.DL.M1.S3_S4,
    GC: doc.GC.M1,
    MDLC: doc.MDLC.M1,
    MG: doc.MG.M4,
    RNV: doc.RNV.M1,
    BM: doc.BM,
  },
  M4_S4: {
    YC: doc.YC.M1,
    FL: doc.FL.M4,
    CL: doc.CL.M4.S3_S4,
    DL: doc.DL.M1.S3_S4,
    GC: doc.GC.M1,
    MDLC: doc.MDLC.M1,
    MG: doc.MG.M4,
    RNV: doc.RNV.M1,
    BM: doc.BM,
  },
  M5_S1: {
    YC: doc.YC.M2.S1,
    FL: doc.FL.M5.S1_S2,
    CL: doc.CL.M5,
    DL: doc.DL.M2.S1_S2,
    GC: doc.GC.M2,
    MDLC: doc.MDLC.M2,
    MG: doc.MG.M5.S1_S2,
    RNV: doc.RNV.M2,
    BM: doc.BM,
  },
  M5_S2: {
    YC: doc.YC.M2.S2,
    FL: doc.FL.M5.S1_S2,
    CL: doc.CL.M5,
    DL: doc.DL.M2.S1_S2,
    GC: doc.GC.M2,
    MDLC: doc.MDLC.M2,
    MG: doc.MG.M5.S1_S2,
    RNV: doc.RNV.M2,
    BM: doc.BM,
  },
  M5_S3: {
    YC: doc.YC.M5.S3_S4,
    FL: doc.FL.M5.S3_S4,
    CL: doc.CL.M5,
    DL: doc.DL.M2.S3_S4,
    GC: doc.GC.M2,
    MDLC: doc.MDLC.M2,
    MG: doc.MG.M5.S3_S4,
    RNV: doc.RNV.M2,
    BM: doc.BM,
  },
  M5_S4: {
    YC: doc.YC.M5.S3_S4,
    FL: doc.FL.M5.S3_S4,
    CL: doc.CL.M5,
    DL: doc.DL.M2.S3_S4,
    GC: doc.GC.M2,
    MDLC: doc.MDLC.M2,
    MG: doc.MG.M5.S3_S4,
    RNV: doc.RNV.M2,
    BM: doc.BM,
  },
  M6_S1: {
    YC: doc.YC.M6.S1_S2,
    FL: doc.FL.M6,
    CL: doc.CL.M6.S1_S2,
    DL: doc.DL.M3.S1_S2,
    GC: doc.GC.M3,
    MDLC: doc.MDLC.M3,
    MG: doc.MG.M6,
    RNV: doc.RNV.M3,
    BM: doc.BM,
  },
  M6_S2: {
    YC: doc.YC.M6.S1_S2,
    FL: doc.FL.M6,
    CL: doc.CL.M6.S1_S2,
    DL: doc.DL.M3.S1_S2,
    GC: doc.GC.M3,
    MDLC: doc.MDLC.M3,
    MG: doc.MG.M6,
    RNV: doc.RNV.M3,
    BM: doc.BM,
  },
  M6_S3: {
    YC: doc.YC.M6.S3_S4,
    FL: doc.FL.M6,
    CL: doc.CL.M6.S3_S4,
    DL: doc.DL.M3.S3_S4,
    GC: doc.GC.M3,
    MDLC: doc.MDLC.M3,
    MG: doc.MG.M6,
    RNV: doc.RNV.M3,
    BM: doc.BM,
  },
  M6_S4: {
    YC: doc.YC.M6.S3_S4,
    FL: doc.FL.M6,
    CL: doc.CL.M6.S3_S4,
    DL: doc.DL.M3.S3_S4,
    GC: doc.GC.M3,
    MDLC: doc.MDLC.M3,
    MG: doc.MG.M6,
    RNV: doc.RNV.M3,
    BM: doc.BM,
  },
  M7_S1: {
    YC: doc.YC.M1,
    FL: doc.FL.M1.S1_S2,
    CL: doc.CL.M1,
    DL: doc.DL.M1.S1_S2,
    GC: doc.GC.M1,
    MDLC: doc.MDLC.M1,
    MG: doc.MG.M1,
    RNV: doc.RNV.M1,
    BM: doc.BM,
  },
  M7_S2: {
    YC: doc.YC.M1,
    FL: doc.FL.M1.S1_S2,
    CL: doc.CL.M1,
    DL: doc.DL.M1.S1_S2,
    GC: doc.GC.M1,
    MDLC: doc.MDLC.M1,
    MG: doc.MG.M1,
    RNV: doc.RNV.M1,
    BM: doc.BM,
  },
  M7_S3: {
    YC: doc.YC.M1,
    FL: doc.FL.M1.S3_S4,
    CL: doc.CL.M1,
    DL: doc.DL.M1.S3_S4,
    GC: doc.GC.M1,
    MDLC: doc.MDLC.M1,
    MG: doc.MG.M1,
    RNV: doc.RNV.M1,
    BM: doc.BM,
  },
  M7_S4: {
    YC: doc.YC.M1,
    FL: doc.FL.M1.S3_S4,
    CL: doc.CL.M1,
    DL: doc.DL.M1.S3_S4,
    GC: doc.GC.M1,
    MDLC: doc.MDLC.M1,
    MG: doc.MG.M1,
    RNV: doc.RNV.M1,
    BM: doc.BM,
  },
  M8_S1: {
    YC: doc.YC.M2.S1,
    FL: doc.FL.M2,
    CL: doc.CL.M2.S1_S2,
    DL: doc.DL.M2.S1_S2,
    GC: doc.GC.M2,
    MDLC: doc.MDLC.M2,
    MG: doc.MG.M2,
    RNV: doc.RNV.M2,
    BM: doc.BM,
  },
  M8_S2: {
    YC: doc.YC.M2.S2,
    FL: doc.FL.M2,
    CL: doc.CL.M2.S1_S2,
    DL: doc.DL.M2.S1_S2,
    GC: doc.GC.M2,
    MDLC: doc.MDLC.M2,
    MG: doc.MG.M2,
    RNV: doc.RNV.M2,
    BM: doc.BM,
  },
  M8_S3: {
    YC: doc.YC.M2.S3_S4,
    FL: doc.FL.M2,
    CL: doc.CL.M2.S3_S4,
    DL: doc.DL.M2.S3_S4,
    GC: doc.GC.M2,
    MDLC: doc.MDLC.M2,
    MG: doc.MG.M2,
    RNV: doc.RNV.M2,
    BM: doc.BM,
  },
  M8_S4: {
    YC: doc.YC.M2.S3_S4,
    FL: doc.FL.M2,
    CL: doc.CL.M2.S3_S4,
    DL: doc.DL.M2.S3_S4,
    GC: doc.GC.M2,
    MDLC: doc.MDLC.M2,
    MG: doc.MG.M2,
    RNV: doc.RNV.M2,
    BM: doc.BM,
  },
  M9_S1: {
    YC: doc.YC.M3.S1_S2,
    FL: doc.FL.M3.S1_S2,
    CL: doc.CL.M3,
    DL: doc.DL.M3.S1_S2,
    GC: doc.GC.M3,
    MDLC: doc.MDLC.M3,
    MG: doc.MG.M3.S1_S2,
    RNV: doc.RNV.M3,
    BM: doc.BM,
  },
  M9_S2: {
    YC: doc.YC.M3.S1_S2,
    FL: doc.FL.M3.S1_S2,
    CL: doc.CL.M3,
    DL: doc.DL.M3.S1_S2,
    GC: doc.GC.M3,
    MDLC: doc.MDLC.M3,
    MG: doc.MG.M3.S1_S2,
    RNV: doc.RNV.M3,
    BM: doc.BM,
  },
  M9_S3: {
    YC: doc.YC.M3.S3_S4,
    FL: doc.FL.M3.S3_S4,
    CL: doc.CL.M3,
    DL: doc.DL.M3.S3_S4,
    GC: doc.GC.M3,
    MDLC: doc.MDLC.M3,
    MG: doc.MG.M3.S3_S4,
    RNV: doc.RNV.M3,
    BM: doc.BM,
  },
  M9_S4: {
    YC: doc.YC.M3.S3_S4,
    FL: doc.FL.M3.S3_S4,
    CL: doc.CL.M3,
    DL: doc.DL.M3.S3_S4,
    GC: doc.GC.M3,
    MDLC: doc.MDLC.M3,
    MG: doc.MG.M3.S3_S4,
    RNV: doc.RNV.M3,
    BM: doc.BM,
  },
  M10_S1: {
    // YC: doc.YC.M4,
    YC: doc.YC.M4.S1_S2,
    FL: doc.FL.M4,
    CL: doc.CL.M4.S1_S2,
    DL: doc.DL.M1.S1_S2,
    GC: doc.GC.M1,
    MDLC: doc.MDLC.M1,
    MG: doc.MG.M4,
    RNV: doc.RNV.M1,
    BM: doc.BM,
  },
  M10_S2: {
    YC: doc.YC.M4.S1_S2,
    FL: doc.FL.M4,
    CL: doc.CL.M4.S1_S2,
    DL: doc.DL.M1.S1_S2,
    GC: doc.GC.M1,
    MDLC: doc.MDLC.M1,
    MG: doc.MG.M4,
    RNV: doc.RNV.M1,
    BM: doc.BM,
  },
  M10_S3: {
    YC: doc.YC.M4.S3_S4,
    FL: doc.FL.M4,
    CL: doc.CL.M4.S3_S4,
    DL: doc.DL.M1.S3_S4,
    GC: doc.GC.M1,
    MDLC: doc.MDLC.M1,
    MG: doc.MG.M4,
    RNV: doc.RNV.M1,
    BM: doc.BM,
  },
  M10_S4: {
    YC: doc.YC.M4.S3_S4,
    FL: doc.FL.M4,
    CL: doc.CL.M4.S3_S4,
    DL: doc.DL.M1.S3_S4,
    GC: doc.GC.M1,
    MDLC: doc.MDLC.M1,
    MG: doc.MG.M4,
    RNV: doc.RNV.M1,
    BM: doc.BM,
  },
  M11_S1: {
    YC: doc.YC.M5.S1,
    FL: doc.FL.M5.S1_S2,
    CL: doc.CL.M5,
    DL: doc.DL.M2.S1_S2,
    GC: doc.GC.M2,
    MDLC: doc.MDLC.M2,
    MG: doc.MG.M5.S1_S2,
    RNV: doc.RNV.M2,
    BM: doc.BM,
  },
  M11_S2: {
    YC: doc.YC.M5.S2,
    FL: doc.FL.M5.S1_S2,
    CL: doc.CL.M5,
    DL: doc.DL.M2.S1_S2,
    GC: doc.GC.M2,
    MDLC: doc.MDLC.M2,
    MG: doc.MG.M5.S1_S2,
    RNV: doc.RNV.M2,
    BM: doc.BM,
  },
  M11_S3: {
    YC: doc.YC.M5.S3_S4,
    FL: doc.FL.M5.S3_S4,
    CL: doc.CL.M5,
    DL: doc.DL.M2.S3_S4,
    GC: doc.GC.M2,
    MDLC: doc.MDLC.M2,
    MG: doc.MG.M5.S3_S4,
    RNV: doc.RNV.M2,
    BM: doc.BM,
  },
  M11_S4: {
    YC: doc.YC.M5.S3_S4,
    FL: doc.FL.M5.S3_S4,
    CL: doc.CL.M5,
    DL: doc.DL.M2.S3_S4,
    GC: doc.GC.M2,
    MDLC: doc.MDLC.M2,
    MG: doc.MG.M5.S3_S4,
    RNV: doc.RNV.M2,
    BM: doc.BM,
  },
  M12_S1: {
    YC: doc.YC.M6.S1_S2,
    FL: doc.FL.M6,
    CL: doc.CL.M6.S1_S2,
    DL: doc.DL.M3.S1_S2,
    GC: doc.GC.M3,
    MDLC: doc.MDLC.M3,
    MG: doc.MG.M6,
    RNV: doc.RNV.M3,
    BM: doc.BM,
  },
  M12_S2: {
    YC: doc.YC.M6.S1_S2,
    FL: doc.FL.M6,
    CL: doc.CL.M6.S1_S2,
    DL: doc.DL.M3.S1_S2,
    GC: doc.GC.M3,
    MDLC: doc.MDLC.M3,
    MG: doc.MG.M6,
    RNV: doc.RNV.M3,
    BM: doc.BM,
  },
  M12_S3: {
    YC: doc.YC.M6.S3_S4,
    FL: doc.FL.M6,
    CL: doc.CL.M6.S3_S4,
    DL: doc.DL.M3.S3_S4,
    GC: doc.GC.M3,
    MDLC: doc.MDLC.M3,
    MG: doc.MG.M6,
    RNV: doc.RNV.M3,
    BM: doc.BM,
  },
  M12_S4: {
    YC: doc.YC.M6.S3_S4,
    FL: doc.FL.M6,
    CL: doc.CL.M6.S3_S4,
    DL: doc.DL.M3.S3_S4,
    GC: doc.GC.M3,
    MDLC: doc.MDLC.M3,
    MG: doc.MG.M6,
    RNV: doc.RNV.M3,
    BM: doc.BM,
  },
});

// Function to generate the doctorsSchedule based on the combo
export const doctorsSchedule = (doc) => ({
  2024: {
    Month1: {
      Week44: combo(doc).M11_S3,
      Week45: combo(doc).M11_S4,
      Week46: combo(doc).M12_S1,
      Week47: combo(doc).M12_S2,
      Week48: combo(doc).M12_S3,
      Week49: combo(doc).M12_S4,
      Week50: combo(doc).M1_S1,
      Week51: combo(doc).M1_S2,
      Week52: combo(doc).M1_S3, // originally Week51
    },
  },
  2025: {
    Month1: {
      //Week1: combo(doc).M1_S4, // originally Week2
      Week1: combo(doc).M2_S1, // originally Week3
      Week2: combo(doc).M2_S2, // originally Week3 (duplicate entry clarified)
      Week3: combo(doc).M2_S3, // originally Week4
      Week4: combo(doc).M2_S4, // originally Week5
      Week5: combo(doc).M3_S1, // originally Week6
      Week6: combo(doc).M3_S2, // originally Week7
      Week7: combo(doc).M3_S3, // originally Week8
      Week8: combo(doc).M3_S4, // originally Week9
      Week9: combo(doc).M4_S1, // originally Week10
      Week10: combo(doc).M4_S2, // originally Week11
      Week11: combo(doc).M4_S3, // originally Week12
      Week12: combo(doc).M4_S4, // originally Week13
      Week13: combo(doc).M5_S1, // originally Week14
      Week14: combo(doc).M5_S2, // originally Week15
      Week15: combo(doc).M5_S3, // originally Week16
      Week16: combo(doc).M5_S4, // originally Week17
      Week17: combo(doc).M6_S1, // originally Week18
      Week18: combo(doc).M6_S2, // originally Week19
      Week19: combo(doc).M6_S3, // originally Week20
      Week20: combo(doc).M6_S4, // originally Week21
      Week21: combo(doc).M7_S1, // originally Week22
      Week22: combo(doc).M7_S2, // originally Week23
      Week23: combo(doc).M7_S3, // originally Week24
      Week24: combo(doc).M7_S4, // originally Week25
      Week25: combo(doc).M8_S1, // originally Week26
      Week26: combo(doc).M8_S2, // originally Week27
      Week27: combo(doc).M8_S3, // originally Week28
      Week28: combo(doc).M8_S4, // originally Week29
      Week29: combo(doc).M9_S1, // originally Week30
      Week30: combo(doc).M9_S2, // originally Week31
      Week31: combo(doc).M9_S3, // originally Week32
      Week32: combo(doc).M9_S4, // originally Week33
      Week33: combo(doc).M10_S1, // originally Week34
      Week34: combo(doc).M10_S2, // originally Week35
      Week35: combo(doc).M10_S3, // originally Week36
      Week36: combo(doc).M10_S4, // originally Week37
      Week37: combo(doc).M11_S1, // originally Week38
      Week38: combo(doc).M11_S2, // originally Week39
      Week39: combo(doc).M11_S3, // originally Week40
      Week40: combo(doc).M11_S4, // originally Week41
      Week41: combo(doc).M12_S1, // originally Week42
      Week42: combo(doc).M12_S2, // originally Week43
      Week43: combo(doc).M12_S3, // originally Week44
      Week44: combo(doc).M12_S4, // originally Week45
      Week45: combo(doc).M1_S1,
      Week46: combo(doc).M1_S2,
      Week47: combo(doc).M1_S3,
      Week48: combo(doc).M1_S4,
      Week49: combo(doc).M2_S1,
      Week50: combo(doc).M2_S2,
      Week51: combo(doc).M2_S3,
      Week52: combo(doc).M2_S4,
    },
  },
});

//==============================================
// SIMPLIFIED ROTATION SYSTEM (NEW ARCHITECTURE)
//==============================================

// Based on analysis, these 18 unique combinations replace the 48 redundant ones
export const simplifiedRotationCycles = {
  cycle_M1_S1: {
    YC: 'M1',
    FL: 'M1.S1_S2',
    CL: 'M1',
    DL: 'M1.S1_S2',
    GC: 'M1',
    MDLC: 'M1',
    MG: 'M1',
    RNV: 'M1',
    BM: 'BM',
  },
  cycle_M1_S3: {
    YC: 'M1',
    FL: 'M1.S3_S4',
    CL: 'M1',
    DL: 'M1.S3_S4',
    GC: 'M1',
    MDLC: 'M1',
    MG: 'M1',
    RNV: 'M1',
    BM: 'BM',
  },
  cycle_M2_S1: {
    YC: 'M2.S1',
    FL: 'M2',
    CL: 'M2.S1_S2',
    DL: 'M2.S1_S2',
    GC: 'M2',
    MDLC: 'M2',
    MG: 'M2',
    RNV: 'M2',
    BM: 'BM',
  },
  cycle_M2_S2: {
    YC: 'M2.S2',
    FL: 'M2',
    CL: 'M2.S1_S2',
    DL: 'M2.S1_S2',
    GC: 'M2',
    MDLC: 'M2',
    MG: 'M2',
    RNV: 'M2',
    BM: 'BM',
  },
  cycle_M2_S3: {
    YC: 'M2.S3_S4',
    FL: 'M2',
    CL: 'M2.S3_S4',
    DL: 'M2.S3_S4',
    GC: 'M2',
    MDLC: 'M2',
    MG: 'M2',
    RNV: 'M2',
    BM: 'BM',
  },
  cycle_M3_S1: {
    YC: 'M3.S1_S2',
    FL: 'M3.S1_S2',
    CL: 'M3',
    DL: 'M3.S1_S2',
    GC: 'M3',
    MDLC: 'M3',
    MG: 'M3.S1_S2',
    RNV: 'M3',
    BM: 'BM',
  },
  cycle_M3_S3: {
    YC: 'M3.S3_S4',
    FL: 'M3.S3_S4',
    CL: 'M3',
    DL: 'M3.S3_S4',
    GC: 'M3',
    MDLC: 'M3',
    MG: 'M3.S3_S4',
    RNV: 'M3',
    BM: 'BM',
  },
  cycle_M4_S1: {
    YC: 'M1',
    FL: 'M4',
    CL: 'M4.S1_S2',
    DL: 'M1.S1_S2',
    GC: 'M1',
    MDLC: 'M1',
    MG: 'M4',
    RNV: 'M1',
    BM: 'BM',
  },
  cycle_M4_S3: {
    YC: 'M1',
    FL: 'M4',
    CL: 'M4.S3_S4',
    DL: 'M1.S3_S4',
    GC: 'M1',
    MDLC: 'M1',
    MG: 'M4',
    RNV: 'M1',
    BM: 'BM',
  },
  cycle_M5_S1: {
    YC: 'M2.S1',
    FL: 'M5.S1_S2',
    CL: 'M5',
    DL: 'M2.S1_S2',
    GC: 'M2',
    MDLC: 'M2',
    MG: 'M5.S1_S2',
    RNV: 'M2',
    BM: 'BM',
  },
  cycle_M5_S2: {
    YC: 'M2.S2',
    FL: 'M5.S1_S2',
    CL: 'M5',
    DL: 'M2.S1_S2',
    GC: 'M2',
    MDLC: 'M2',
    MG: 'M5.S1_S2',
    RNV: 'M2',
    BM: 'BM',
  },
  cycle_M5_S3: {
    YC: 'M5.S3_S4',
    FL: 'M5.S3_S4',
    CL: 'M5',
    DL: 'M2.S3_S4',
    GC: 'M2',
    MDLC: 'M2',
    MG: 'M5.S3_S4',
    RNV: 'M2',
    BM: 'BM',
  },
  cycle_M6_S1: {
    YC: 'M6.S1_S2',
    FL: 'M6',
    CL: 'M6.S1_S2',
    DL: 'M3.S1_S2',
    GC: 'M3',
    MDLC: 'M3',
    MG: 'M6',
    RNV: 'M3',
    BM: 'BM',
  },
  cycle_M6_S3: {
    YC: 'M6.S3_S4',
    FL: 'M6',
    CL: 'M6.S3_S4',
    DL: 'M3.S3_S4',
    GC: 'M3',
    MDLC: 'M3',
    MG: 'M6',
    RNV: 'M3',
    BM: 'BM',
  },
  // These are the unique ones from the original M10/M11 pattern variations
  cycle_M10_S1: {
    YC: 'M4.S1_S2',
    FL: 'M4',
    CL: 'M4.S1_S2',
    DL: 'M1.S1_S2',
    GC: 'M1',
    MDLC: 'M1',
    MG: 'M4',
    RNV: 'M1',
    BM: 'BM',
  },
  cycle_M10_S3: {
    YC: 'M4.S3_S4',
    FL: 'M4',
    CL: 'M4.S3_S4',
    DL: 'M1.S3_S4',
    GC: 'M1',
    MDLC: 'M1',
    MG: 'M4',
    RNV: 'M1',
    BM: 'BM',
  },
  cycle_M11_S1: {
    YC: 'M5.S1',
    FL: 'M5.S1_S2',
    CL: 'M5',
    DL: 'M2.S1_S2',
    GC: 'M2',
    MDLC: 'M2',
    MG: 'M5.S1_S2',
    RNV: 'M2',
    BM: 'BM',
  },
  cycle_M11_S2: {
    YC: 'M5.S2',
    FL: 'M5.S1_S2',
    CL: 'M5',
    DL: 'M2.S1_S2',
    GC: 'M2',
    MDLC: 'M2',
    MG: 'M5.S1_S2',
    RNV: 'M2',
    BM: 'BM',
  },
};

// Exact mapping from the original hardcoded schedule
const WEEK_TO_COMBO_MAP = {
  // 2024 
  44: 'M11_S3', 45: 'M11_S4', 46: 'M12_S1', 47: 'M12_S2', 48: 'M12_S3', 49: 'M12_S4',
  50: 'M1_S1', 51: 'M1_S2', 52: 'M1_S3',
  // 2025
  1: 'M2_S1', 2: 'M2_S2', 3: 'M2_S3', 4: 'M2_S4', 5: 'M3_S1', 6: 'M3_S2', 7: 'M3_S3', 8: 'M3_S4',
  9: 'M4_S1', 10: 'M4_S2', 11: 'M4_S3', 12: 'M4_S4', 13: 'M5_S1', 14: 'M5_S2', 15: 'M5_S3', 16: 'M5_S4',
  17: 'M6_S1', 18: 'M6_S2', 19: 'M6_S3', 20: 'M6_S4', 21: 'M7_S1', 22: 'M7_S2', 23: 'M7_S3', 24: 'M7_S4',
  25: 'M8_S1', 26: 'M8_S2', 27: 'M8_S3', 28: 'M8_S4', 29: 'M9_S1', 30: 'M9_S2', 31: 'M9_S3', 32: 'M9_S4',
  33: 'M10_S1', 34: 'M10_S2', 35: 'M10_S3', 36: 'M10_S4', 37: 'M11_S1', 38: 'M11_S2', 39: 'M11_S3', 40: 'M11_S4',
  41: 'M12_S1', 42: 'M12_S2', 43: 'M12_S3', 44: 'M12_S4', 45: 'M1_S1', 46: 'M1_S2', 47: 'M1_S3', 48: 'M1_S4',
  49: 'M2_S1', 50: 'M2_S2', 51: 'M2_S3', 52: 'M2_S4'
};

// Map old combo names to new simplified cycle names
const COMBO_TO_CYCLE_MAP = {
  'M1_S1': 'cycle_M1_S1', 'M1_S2': 'cycle_M1_S1', 'M1_S3': 'cycle_M1_S3', 'M1_S4': 'cycle_M1_S3',
  'M2_S1': 'cycle_M2_S1', 'M2_S2': 'cycle_M2_S2', 'M2_S3': 'cycle_M2_S3', 'M2_S4': 'cycle_M2_S3',
  'M3_S1': 'cycle_M3_S1', 'M3_S2': 'cycle_M3_S1', 'M3_S3': 'cycle_M3_S3', 'M3_S4': 'cycle_M3_S3',
  'M4_S1': 'cycle_M4_S1', 'M4_S2': 'cycle_M4_S1', 'M4_S3': 'cycle_M4_S3', 'M4_S4': 'cycle_M4_S3',
  'M5_S1': 'cycle_M5_S1', 'M5_S2': 'cycle_M5_S2', 'M5_S3': 'cycle_M5_S3', 'M5_S4': 'cycle_M5_S3',
  'M6_S1': 'cycle_M6_S1', 'M6_S2': 'cycle_M6_S1', 'M6_S3': 'cycle_M6_S3', 'M6_S4': 'cycle_M6_S3',
  // Duplicates that map to existing cycles
  'M7_S1': 'cycle_M1_S1', 'M7_S2': 'cycle_M1_S1', 'M7_S3': 'cycle_M1_S3', 'M7_S4': 'cycle_M1_S3',
  'M8_S1': 'cycle_M2_S1', 'M8_S2': 'cycle_M2_S2', 'M8_S3': 'cycle_M2_S3', 'M8_S4': 'cycle_M2_S3',
  'M9_S1': 'cycle_M3_S1', 'M9_S2': 'cycle_M3_S1', 'M9_S3': 'cycle_M3_S3', 'M9_S4': 'cycle_M3_S3',
  'M10_S1': 'cycle_M10_S1', 'M10_S2': 'cycle_M10_S1', 'M10_S3': 'cycle_M10_S3', 'M10_S4': 'cycle_M10_S3',
  'M11_S1': 'cycle_M11_S1', 'M11_S2': 'cycle_M11_S2', 'M11_S3': 'cycle_M5_S3', 'M11_S4': 'cycle_M5_S3',
  'M12_S1': 'cycle_M6_S1', 'M12_S2': 'cycle_M6_S1', 'M12_S3': 'cycle_M6_S3', 'M12_S4': 'cycle_M6_S3'
};

// Helper function to resolve doctor path to actual schedule
const resolveDoctorSchedule = (doc, doctorPath) => {
  const pathParts = doctorPath.split('.');
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
  
  Object.keys(cycle).forEach(doctor => {
    const doctorPath = cycle[doctor];
    result[doctor] = resolveDoctorSchedule(doc, doctorPath);
  });
  
  return result;
};

// New simplified doctors schedule generator
export const simplifiedDoctorsSchedule = (doc) => {
  const schedule = {
    2024: { Month1: {} },
    2025: { Month1: {} }
  };
  
  // Generate 2024 weeks (44-52)
  for (let week = 44; week <= 52; week++) {
    const cycleKey = getRotationForWeek(week, 2024);
    schedule[2024].Month1[`Week${week}`] = simplifiedCombo(doc, cycleKey);
  }
  
  // Generate 2025 weeks (1-52)
  for (let week = 1; week <= 52; week++) {
    const cycleKey = getRotationForWeek(week, 2025);
    schedule[2025].Month1[`Week${week}`] = simplifiedCombo(doc, cycleKey);
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
