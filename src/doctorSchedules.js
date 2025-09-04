export const docActivities = {
  // duration for 1 plage of activity
  AMI: {
    name: 'AMI',
    duration: 1,
  },
  AMI_Cs_U: {
    name: 'AMI_Cs_U',
    duration: 1,
  },
  Cs: {
    name: 'Cs',
    duration: 4,
  },
  Cs_Prison: {
    name: 'Cs_Prison',
    duration: 4,
  },
  EMIT: {
    name: 'EMIT',
    duration: 3,
  },
  EMATIT: {
    name: 'EMATIT',
    duration: 2,
  },
  HDJ: {
    name: 'HDJ',
    duration: 4,
  },
  HTC1: {
    name: 'HTC1_cv',
    duration: 1,
  },
  HTC1_visite: {
    name: 'HTC1_visite',
    duration: 4,
  },
  HTC2: {
    name: 'HTC2_cv',
    duration: 1,
  },
  HTC2_visite: {
    name: 'HTC2_visite',
    duration: 4,
  },
  TP: {
    name: 'TP',
    duration: 4,
  },
  TeleCs: {
    name: 'TeleCs',
    duration: 2,
  },
  MPO: {
    name: 'MPO',
    duration: 3,
  },
  Chefferie: {
    name: 'Chefferie',
    duration: 4,
  },
};

export const docChunks = {
  ///YC
  // YC_HTC: {
  //   Monday: {
  //     '9am-1pm': ['HTC1', 'TeleCs'],
  //     '2pm-6pm': ['HTC1', 'TeleCs', 'AMI'],
  //   },
  //   Tuesday: { '9am-1pm': ['HTC1_visite'], '2pm-6pm': ['HTC1', 'Cs'] },
  //   Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
  //   Thursday: { '9am-1pm': ['HTC1'], '2pm-6pm': ['HTC1', 'Cs'] },
  //   Friday: { '9am-1pm': ['HTC1_visite'], '2pm-6pm': ['HTC1'] },
  // },

  YC_ambu: {
    Monday: {
      '9am-1pm': ['TP'],
      '2pm-6pm': ['TP'],
    },
    Tuesday: {
      '9am-1pm': ['TeleCs'],
      '2pm-6pm': ['Cs'],
    },
    Wednesday: {
      '9am-1pm': ['TP'],
      '2pm-6pm': ['TP'],
    },
    Thursday: {
      '9am-1pm': ['TeleCs'],
      '2pm-6pm': ['Cs'],
    },
    // Friday: {
    //   '9am-1pm': ['AMI_Cs_U'],
    //   '2pm-6pm': ['AMI'],
    // },
    Friday: {
      '9am-1pm': ['Chefferie'],
      '2pm-6pm': ['Chefferie'],
    },
  },
  YC_ambu_remplaHTC_Jeudi: {
    Monday: {
      '9am-1pm': ['TP'],
      '2pm-6pm': ['TP'],
    },
    Tuesday: {
      '9am-1pm': ['TeleCs'],
      '2pm-6pm': ['Cs'],
    },
    Wednesday: {
      '9am-1pm': ['TP'],
      '2pm-6pm': ['TP'],
    },
    Thursday: {
      '9am-1pm': ['HTC1', 'TeleCs'],
      '2pm-6pm': ['HTC1', 'Cs'],
    },
    // Friday: {
    //   '9am-1pm': ['AMI'],
    //   '2pm-6pm': ['AMI'],
    // },
    Friday: {
      '9am-1pm': ['Chefferie'],
      '2pm-6pm': ['Chefferie'],
    },
  },
  YC_ambu_remplaHTC_Lundi: {
    Monday: {
      '9am-1pm': ['HTC1'],
      '2pm-6pm': ['HTC1', 'AMI'],
    },
    Tuesday: {
      '9am-1pm': ['TeleCs', 'AMI'],
      '2pm-6pm': ['Cs'],
    },
    Wednesday: {
      '9am-1pm': ['TP'],
      '2pm-6pm': ['TP'],
    },
    Thursday: {
      '9am-1pm': ['TeleCs'],
      '2pm-6pm': ['Cs'],
    },
    Friday: {
      '9am-1pm': ['TP'],
      '2pm-6pm': ['TP'],
    },
  },
  YC_off: {
    Monday: {
      '9am-1pm': ['TP'],
      '2pm-6pm': ['TP'],
    },
    Tuesday: {
      '9am-1pm': ['TP'],
      '2pm-6pm': ['TP'],
    },
    Wednesday: {
      '9am-1pm': ['TP'],
      '2pm-6pm': ['TP'],
    },
    Thursday: {
      '9am-1pm': ['TP'],
      '2pm-6pm': ['TP'],
    },
    Friday: {
      '9am-1pm': ['TP'],
      '2pm-6pm': ['TP'],
    },
  },
  ///FL
  FL_HTC: {
    Monday: { '9am-1pm': ['HTC1'], '2pm-6pm': ['HTC1', 'AMI'] },
    Tuesday: { '9am-1pm': ['HTC1_visite'], '2pm-6pm': ['HTC1', 'Cs_Prison'] },
    Wednesday: { '9am-1pm': ['HTC1', 'Cs'], '2pm-6pm': ['HTC1'] },
    Thursday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Friday: { '9am-1pm': ['HTC1_visite'], '2pm-6pm': ['HTC1'] },
  },
  FL_HDJ_Vendredi: {
    Monday: { '9am-1pm': ['AMI_Cs_U', 'Cs'], '2pm-6pm': ['TeleCs'] },
    Tuesday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['Cs_Prison'] },
    Wednesday: { '9am-1pm': ['Cs'], '2pm-6pm': ['TeleCs'] },
    Thursday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Friday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
  },
  FL_HDJ_Ven_remplaHTC_Lundi: {
    Monday: { '9am-1pm': ['HTC1', 'Cs'], '2pm-6pm': ['HTC1', 'TeleCs', 'AMI'] },
    Tuesday: { '9am-1pm': ['TeleCs', 'AMI'], '2pm-6pm': ['Cs_Prison'] },
    Wednesday: { '9am-1pm': ['Cs'], '2pm-6pm': ['TeleCs'] },
    Thursday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Friday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
  },
  FL_HDJ_Full: {
    Monday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Tuesday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['Cs_Prison'] },
    Wednesday: { '9am-1pm': ['Cs'], '2pm-6pm': ['TeleCs'] },
    Thursday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
    Friday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
  },
  FL_Ambu_remplaHTC_Mercredi: {
    //Mois Ambulatoire
    Monday: { '9am-1pm': ['Cs'], '2pm-6pm': ['TeleCs'] },
    Tuesday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['Cs_Prison'] },
    Wednesday: { '9am-1pm': ['HTC1', 'Cs'], '2pm-6pm': ['HTC1', 'TeleCs'] },
    Thursday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Friday: { '9am-1pm': ['Cs'], '2pm-6pm': ['TeleCs'] },
  },
  ///CL
  CL_HTC: {
    // mois HTC
    Monday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Tuesday: { '9am-1pm': ['HTC1_visite'], '2pm-6pm': ['HTC1', 'TeleCs'] },
    Wednesday: { '9am-1pm': ['HTC1', 'AMI'], '2pm-6pm': ['HTC1', 'Cs'] },
    Thursday: { '9am-1pm': ['HTC1'], '2pm-6pm': ['HTC1', 'Cs'] },
    Friday: { '9am-1pm': ['HTC1_visite'], '2pm-6pm': ['HTC1'] },
  },

  CL_HDJ_full: {
    //DL -
    Monday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Tuesday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
    Wednesday: { '9am-1pm': ['TeleCs', 'AMI'], '2pm-6pm': ['Cs'] },
    Thursday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['Cs'] },
    Friday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
  },
  CL_HDJ_Vendredi: {
    //DL +
    Monday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Tuesday: { '9am-1pm': ['AMI'], '2pm-6pm': ['TeleCs'] },
    Wednesday: { '9am-1pm': ['AMI'], '2pm-6pm': ['Cs'] },
    Thursday: { '9am-1pm': ['AMI'], '2pm-6pm': ['Cs'] },
    Friday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
  },
  CL_HDJ_Ven_remplaHTC_Jeudi: {
    Monday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Tuesday: { '9am-1pm': ['AMI'], '2pm-6pm': ['TeleCs'] },
    Wednesday: { '9am-1pm': ['AMI'], '2pm-6pm': ['Cs'] },
    Thursday: { '9am-1pm': ['HTC1'], '2pm-6pm': ['HTC1', 'Cs'] },
    Friday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
  },
  CL_ambu_remplaHTC_Mercredi: {
    //mois Ambu
    Monday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Tuesday: { '9am-1pm': ['AMI'], '2pm-6pm': ['TeleCs'] },
    Wednesday: { '9am-1pm': ['HTC1', 'AMI'], '2pm-6pm': ['HTC1', 'Cs'] },
    Thursday: { '9am-1pm': ['AMI'], '2pm-6pm': ['Cs'] },
    Friday: { '9am-1pm': ['AMI_Cs_U'], '2pm-6pm': ['TeleCs'] },
  },
  ///DL
  DL_HDJ: {
    //DL HDJ
    Monday: { '9am-1pm': ['Cs'], '2pm-6pm': ['Cs'] },
    Tuesday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
    Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Thursday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
    Friday: { '9am-1pm': ['Cs'], '2pm-6pm': ['TeleCs'] },
  },
  DL_MPO: {
    //DL MPO
    Monday: { '9am-1pm': ['MPO'], '2pm-6pm': ['MPO'] },
    Tuesday: { '9am-1pm': ['MPO'], '2pm-6pm': ['MPO'] },
    Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Thursday: { '9am-1pm': ['MPO'], '2pm-6pm': ['MPO'] },
    Friday: { '9am-1pm': ['MPO'], '2pm-6pm': ['MPO'] },
  },
  ///GC
  GC_HTC: {
    //HTC2
    Monday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Tuesday: { '9am-1pm': ['HTC2_visite'], '2pm-6pm': ['HTC2', 'Cs'] },
    Wednesday: { '9am-1pm': ['HTC2', 'Cs'], '2pm-6pm': ['HTC2', 'EMIT'] },
    Thursday: { '9am-1pm': ['HTC2'], '2pm-6pm': ['HTC2', 'TeleCs'] },
    Friday: { '9am-1pm': ['HTC2_visite'], '2pm-6pm': ['HTC2'] },
  },
  GC_EMATIT_remplaHTC_Jeudi: {
    //EMATIT
    Monday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Tuesday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['Cs'] },
    Wednesday: { '9am-1pm': ['Cs'], '2pm-6pm': ['EMIT'] },
    Thursday: { '9am-1pm': ['HTC2', 'EMATIT'], '2pm-6pm': ['HTC2', 'EMATIT'] },
    Friday: { '9am-1pm': ['EMATIT'], '2pm-6pm': ['EMATIT'] },
  },
  GC_EMIT: {
    //EMIT
    Monday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Tuesday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['Cs'] },
    Wednesday: { '9am-1pm': ['Cs'], '2pm-6pm': ['EMIT'] },
    Thursday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['EMIT'] },
    Friday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['EMIT'] },
  },
  GC_EMIT_remplaHTC_Mercredi: {
    //EMIT
    Monday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Tuesday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['Cs'] },
    Wednesday: { '9am-1pm': ['HTC2', 'Cs'], '2pm-6pm': ['HTC2', 'EMIT'] },
    Thursday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['EMIT'] },
    Friday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['EMIT'] },
  },
  GC_EMIT_remplaHTC_Mercredi: {
    //EMIT
    Monday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Tuesday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['Cs'] },
    Wednesday: { '9am-1pm': ['HTC2', 'Cs'], '2pm-6pm': ['HTC2', 'EMIT'] },
    Thursday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['EMIT'] },
    Friday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['EMIT'] },
  },

  ///
  MG_HTC: {
    //HTC2
    Monday: { '9am-1pm': ['HTC1', 'TeleCs'], '2pm-6pm': ['HTC1'] },
    Tuesday: { '9am-1pm': ['HTC1_visite'], '2pm-6pm': ['HTC1', 'Cs'] },
    Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Thursday: { '9am-1pm': ['HTC1', 'TeleCs'], '2pm-6pm': ['HTC1', 'Cs'] },
    Friday: { '9am-1pm': ['HTC1_visite'], '2pm-6pm': ['HTC1'] },
  },
  MG_EMATIT_remplaHTC_Lundi: {
    //EMATIT
    Monday: { '9am-1pm': ['HTC1', 'EMATIT'], '2pm-6pm': ['HTC1', 'EMATIT'] },
    Tuesday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['Cs'] },
    Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Thursday: { '9am-1pm': ['EMATIT'], '2pm-6pm': ['Cs'] },
    // Friday: { '9am-1pm': ['AMI'], '2pm-6pm': ['EMATIT'] },
    Friday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['EMIT'] },
  },
  MG_EMATIT: {
    //EMATIT
    Monday: { '9am-1pm': ['EMATIT'], '2pm-6pm': ['EMATIT'] },
    Tuesday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['Cs'] },
    Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Thursday: { '9am-1pm': ['EMATIT'], '2pm-6pm': ['Cs'] },
    // Friday: { '9am-1pm': ['AMI'], '2pm-6pm': ['EMATIT'] },
    Friday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['EMIT'] },
  },
  MG_EMATIT_AMI: {
    //EMATIT + AMI
    Monday: { '9am-1pm': ['EMATIT'], '2pm-6pm': ['TeleCs'] },
    Tuesday: { '9am-1pm': ['EMATIT'], '2pm-6pm': ['Cs'] },
    Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Thursday: { '9am-1pm': ['AMI', 'TeleCs'], '2pm-6pm': ['Cs'] },
    Friday: { '9am-1pm': ['EMATIT'], '2pm-6pm': ['EMATIT'] },
  },
  RNV_HTC: {
    //HTC2
    Monday: { '9am-1pm': ['HTC2'], '2pm-6pm': ['HTC2', 'Cs'] },
    Tuesday: { '9am-1pm': ['HTC2_visite'], '2pm-6pm': ['HTC2', 'TeleCs'] },
    Wednesday: {
      '9am-1pm': ['HTC2', 'EMIT'],
      '2pm-6pm': ['HTC2', 'Cs'],
    },
    Thursday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Friday: { '9am-1pm': ['HTC2_visite'], '2pm-6pm': ['HTC2'] },
  },
  RNV_EMATIT: {
    //EMATIT
    Monday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['Cs'] },
    Tuesday: { '9am-1pm': ['EMATIT'], '2pm-6pm': ['EMIT'] },
    Wednesday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['Cs'] },
    Thursday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Friday: { '9am-1pm': ['EMATIT'], '2pm-6pm': ['EMATIT'] },
  },
  RNV_EMATIT_remplaHTC_Mercredi: {
    //EMATIT
    Monday: { '9am-1pm': ['EMATIT'], '2pm-6pm': ['Cs'] },
    Tuesday: { '9am-1pm': ['EMATIT'], '2pm-6pm': ['EMATIT'] },
    Wednesday: {
      '9am-1pm': ['HTC2', 'EMIT'],
      '2pm-6pm': ['HTC2', 'Cs'],
    },
    Thursday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Friday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['EMIT'] },
  },
  MDLC_HTC: {
    //HTC2
    Monday: { '9am-1pm': ['HTC2', 'TeleCs'], '2pm-6pm': ['HTC2', 'Cs'] },
    Tuesday: { '9am-1pm': ['HTC2_visite'], '2pm-6pm': ['HTC2', 'EMIT'] },
    Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Thursday: { '9am-1pm': ['HTC2'], '2pm-6pm': ['HTC2', 'Cs'] },
    Friday: { '9am-1pm': ['HTC2_visite'], '2pm-6pm': ['HTC2'] },
  },
  MDLC_EMIT: {
    //EMIT
    Monday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['Cs'] },
    Tuesday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['EMIT'] },
    Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Thursday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['Cs'] },
    Friday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['EMIT'] },
  },
  MDLC_EMIT_AMI: {
    //EMIT+AMI
    Monday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['Cs'] },
    Tuesday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['EMIT'] },
    Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Thursday: { '9am-1pm': ['AMI'], '2pm-6pm': ['Cs'] },
    Friday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['AMI'] },
  },
  MDLC_EMIT_remplaHTC_Jeudi: {
    Monday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['Cs'] },
    Tuesday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['EMIT'] },
    Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Thursday: { '9am-1pm': ['HTC2'], '2pm-6pm': ['HTC2', 'Cs'] },
    Friday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['EMIT'] },
  },
  MDLC_EMIT_remplaHTC_Lundi: {
    Monday: { '9am-1pm': ['HTC2', 'TeleCs'], '2pm-6pm': ['HTC2', 'Cs'] },
    Tuesday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['EMIT'] },
    Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Thursday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['Cs'] },
    Friday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['EMIT'] },
  },
};

export const doc = {
  // emploi du temps  théorique hebdomadaire de chaque médecin pour chaque rotation (sur 3 ou 4 temps selon internistes ou infectiologues)
  YC: {
    M1: docChunks.YC_ambu,
    M2: {
      S1: docChunks.YC_ambu,
      S2: docChunks.YC_ambu,
      S3_S4: docChunks.YC_ambu_remplaHTC_Jeudi,
    },

    M3: {
      S1_S2: docChunks.YC_ambu,
      S3_S4: docChunks.YC_ambu,
      //S3_S4: docChunks.YC_ambu_remplaHTC_Lundi,
    },
    //M4: docChunks.YC_ambu,
    M4: {
      // S1_S2: docChunks.YC_ambu_remplaHTC_Lundi,
      S1_S2: docChunks.YC_ambu,
      S3_S4: docChunks.YC_ambu,
    },
    M5: {
      S1: docChunks.YC_ambu,

      S2: docChunks.YC_ambu,
      S3_S4: docChunks.YC_ambu,
      // S3_S4: docChunks.YC_ambu_remplaHTC_Lundi,
    },
    M6: {
      //ambulatoire
      S1_S2: docChunks.YC_ambu,
      S3_S4: docChunks.YC_ambu_remplaHTC_Jeudi,
    },
  },
  FL: {
    M1: {
      //Mois HDJ
      S1_S2: docChunks.FL_HDJ_Vendredi,
      S3_S4: docChunks.FL_HDJ_Full,
    },

    M2: docChunks.FL_HTC,
    M3: {
      //Mois HDJ idem M1 pour FL
      S1_S2: docChunks.FL_HDJ_Ven_remplaHTC_Lundi,
      S3_S4: docChunks.FL_HDJ_Full,
    },
    M4: docChunks.FL_Ambu_remplaHTC_Mercredi,
    M5: {
      //Mois HDJ
      S1_S2: docChunks.FL_HDJ_Ven_remplaHTC_Lundi,
      S3_S4: docChunks.FL_HDJ_Full,
    },
    M6: docChunks.FL_HTC,
  },
  CL: {
    M1: docChunks.CL_ambu_remplaHTC_Mercredi,
    M2: {
      //mois HDJ
      S1_S2: docChunks.CL_HDJ_Ven_remplaHTC_Jeudi,
      S3_S4: docChunks.CL_HDJ_full,
    },
    M3: docChunks.CL_HTC,
    M4: {
      //mois HDJ
      S1_S2: docChunks.CL_HDJ_Vendredi,
      S3_S4: docChunks.CL_HDJ_full,
    },
    M5: docChunks.CL_HTC,
    M6: {
      //mois HDJ
      S1_S2: docChunks.CL_HDJ_Ven_remplaHTC_Jeudi,
      S3_S4: docChunks.CL_HDJ_full,
    },
  },
  DL: {
    M1: {
      S1_S2: docChunks.DL_HDJ,
      S3_S4: docChunks.DL_MPO,
    },
    M2: {
      S1_S2: docChunks.DL_HDJ,
      S3_S4: docChunks.DL_MPO,
    },
    M3: {
      S1_S2: docChunks.DL_HDJ,
      S3_S4: docChunks.DL_MPO,
    },
    M4: {
      S1_S2: docChunks.DL_HDJ,
      S3_S4: docChunks.DL_MPO,
    },
  },
  GC: {
    M1: docChunks.GC_HTC,
    // M2: docChunks.GC_EMATIT,
    M2: docChunks.GC_EMATIT_remplaHTC_Jeudi,
    M3: docChunks.GC_EMIT,
    // M3: docChunks.GC_EMIT_remplaHTC_Mercredi,
    // M4: docChunks.GC_EMATIT,
  },
  MDLC: {
    // M1: docChunks.MDLC_EMIT,
    M1: docChunks.MDLC_EMIT_remplaHTC_Lundi,
    M2: docChunks.MDLC_EMIT_AMI,
    M3: docChunks.MDLC_HTC,
    //M4: docChunks.MDLC_EMIT_remplaHTC_Jeudi,
  },
  MG: {
    // M1: docChunks.MG_EMATIT_remplaHTC_Lundi,
    M1: docChunks.MG_HTC,
    M2: docChunks.MG_EMATIT_AMI,
    M3: {
      S1_S2: docChunks.MG_EMATIT,
      S3_S4: docChunks.MG_EMATIT_remplaHTC_Lundi,
    },
    M4: docChunks.MG_HTC,
    M5: {
      S1_S2: docChunks.MG_EMATIT,
      S3_S4: docChunks.MG_EMATIT_remplaHTC_Lundi,
    },
    M6: docChunks.MG_EMATIT,
    // M2: docChunks.MG_EMATIT,
  },
  RNV: {
    M1: docChunks.RNV_EMATIT,
    M2: docChunks.RNV_HTC,
    M3: docChunks.RNV_EMATIT_remplaHTC_Mercredi,
    // M3: docChunks.RNV_EMATIT,
    // M4: docChunks.RNV_HTC,
  },
  BM: {
    Monday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['EMIT'] },
    Tuesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Thursday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['EMIT'] },
    Friday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
  },
};

export const docOld = {
  // emploi du temps  théorique hebdomadaire de chaque médecin pour chaque rotation (sur 3 ou 4 temps selon internistes ou infectiologues)
  YC: {
    M1: {
      //HTC
      Monday: {
        '9am-1pm': ['HTC1', 'TeleCs'],
        '2pm-6pm': ['HTC1', 'TeleCs'],
      },
      Tuesday: { '9am-1pm': ['HTC1'], '2pm-6pm': ['HTC1', 'Cs'] },
      Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
      Thursday: { '9am-1pm': ['HTC1'], '2pm-6pm': ['HTC1', 'Cs'] },
      Friday: { '9am-1pm': ['HTC1'], '2pm-6pm': ['HTC1'] },
    },
    M2: {
      //ambulatoire avec 1 sem off
      S1: {
        Monday: {
          '9am-1pm': ['TP'],
          '2pm-6pm': ['TP'],
        },
        Tuesday: {
          '9am-1pm': ['TP'],
          '2pm-6pm': ['TP'],
        },
        Wednesday: {
          '9am-1pm': ['TP'],
          '2pm-6pm': ['TP'],
        },
        Thursday: {
          '9am-1pm': ['TP'],
          '2pm-6pm': ['TP'],
        },
        Friday: {
          '9am-1pm': ['TP'],
          '2pm-6pm': ['TP'],
        },
      },

      S2: {
        Monday: {
          '9am-1pm': ['TP'],
          '2pm-6pm': ['TP'],
        },
        Tuesday: {
          '9am-1pm': ['TeleCs'],
          '2pm-6pm': ['Cs'],
        },
        Wednesday: {
          '9am-1pm': ['TP'],
          '2pm-6pm': ['TP'],
        },
        Thursday: {
          '9am-1pm': ['TeleCs'],
          '2pm-6pm': ['Cs'],
        },
        Friday: {
          '9am-1pm': ['AMI'],
          '2pm-6pm': ['AMI'],
        },
      },
      S3_S4: {
        Monday: {
          '9am-1pm': ['TP'],
          '2pm-6pm': ['TP'],
        },
        Tuesday: {
          '9am-1pm': ['TeleCs'],
          '2pm-6pm': ['Cs'],
        },
        Wednesday: {
          '9am-1pm': ['TP'],
          '2pm-6pm': ['TP'],
        },
        Thursday: {
          '9am-1pm': ['HTC1', 'TeleCs'],
          '2pm-6pm': ['HTC1', 'Cs'],
        },
        Friday: {
          '9am-1pm': ['AMI'],
          '2pm-6pm': ['AMI'],
        },
      },
    },
    M3: {
      //ambulatoire
      S1_S2: {
        Monday: {
          '9am-1pm': ['TP'],
          '2pm-6pm': ['TP'],
        },
        Tuesday: {
          '9am-1pm': ['TeleCs'],
          '2pm-6pm': ['Cs'],
        },
        Wednesday: {
          '9am-1pm': ['TP'],
          '2pm-6pm': ['TP'],
        },
        Thursday: {
          '9am-1pm': ['TeleCs'],
          '2pm-6pm': ['Cs'],
        },
        Friday: {
          '9am-1pm': ['AMI'],
          '2pm-6pm': ['AMI'],
        },
      },
      S3_S4: {
        Monday: {
          '9am-1pm': ['HTC1'],
          '2pm-6pm': ['HTC1'],
        },
        Tuesday: {
          '9am-1pm': ['TeleCs'],
          '2pm-6pm': ['Cs'],
        },
        Wednesday: {
          '9am-1pm': ['TP'],
          '2pm-6pm': ['TP'],
        },
        Thursday: {
          '9am-1pm': ['TeleCs'],
          '2pm-6pm': ['Cs'],
        },
        Friday: {
          '9am-1pm': ['TP'],
          '2pm-6pm': ['TP'],
        },
      },
    },
    M4: {
      //HTC
      Monday: {
        '9am-1pm': ['HTC1', 'TeleCs'],
        '2pm-6pm': ['HTC1', 'TeleCs'],
      },
      Tuesday: { '9am-1pm': ['HTC1'], '2pm-6pm': ['HTC1', 'Cs'] },
      Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
      Thursday: { '9am-1pm': ['HTC1'], '2pm-6pm': ['HTC1', 'Cs'] },
      Friday: { '9am-1pm': ['HTC1'], '2pm-6pm': ['HTC1'] },
    },
    M5: {
      //ambulatoire avec 1 sem off
      S1: {
        //semaine off
        Monday: {
          '9am-1pm': ['TP'],
          '2pm-6pm': ['TP'],
        },
        Tuesday: {
          '9am-1pm': ['TP'],
          '2pm-6pm': ['TP'],
        },
        Wednesday: {
          '9am-1pm': ['TP'],
          '2pm-6pm': ['TP'],
        },
        Thursday: {
          '9am-1pm': ['TP'],
          '2pm-6pm': ['TP'],
        },
        Friday: {
          '9am-1pm': ['TP'],
          '2pm-6pm': ['TP'],
        },
      },

      S2: {
        Monday: {
          '9am-1pm': ['TP'],
          '2pm-6pm': ['TP'],
        },
        Tuesday: {
          '9am-1pm': ['TeleCs'],
          '2pm-6pm': ['Cs'],
        },
        Wednesday: {
          '9am-1pm': ['TP'],
          '2pm-6pm': ['TP'],
        },
        Thursday: {
          '9am-1pm': ['TeleCs'],
          '2pm-6pm': ['Cs'],
        },
        Friday: {
          '9am-1pm': ['AMI'],
          '2pm-6pm': ['AMI'],
        },
      },
      S3_S4: {
        Monday: {
          '9am-1pm': ['HTC1'],
          '2pm-6pm': ['HTC1'],
        },
        Tuesday: {
          '9am-1pm': ['TeleCs'],
          '2pm-6pm': ['Cs'],
        },
        Wednesday: {
          '9am-1pm': ['TP'],
          '2pm-6pm': ['TP'],
        },
        Thursday: {
          '9am-1pm': ['TeleCs'],
          '2pm-6pm': ['Cs'],
        },
        Friday: {
          '9am-1pm': ['TP'],
          '2pm-6pm': ['TP'],
        },
      },
    },
    M6: {
      //ambulatoire
      S1_S2: {
        Monday: {
          '9am-1pm': ['TP'],
          '2pm-6pm': ['TP'],
        },
        Tuesday: {
          '9am-1pm': ['TeleCs'],
          '2pm-6pm': ['Cs'],
        },
        Wednesday: {
          '9am-1pm': ['TP'],
          '2pm-6pm': ['TP'],
        },
        Thursday: {
          '9am-1pm': ['TeleCs'],
          '2pm-6pm': ['Cs'],
        },
        Friday: {
          '9am-1pm': ['AMI'],
          '2pm-6pm': ['AMI'],
        },
      },
      S3_S4: {
        Monday: {
          '9am-1pm': ['TP'],
          '2pm-6pm': ['TP'],
        },
        Tuesday: {
          '9am-1pm': ['TeleCs'],
          '2pm-6pm': ['Cs'],
        },
        Wednesday: {
          '9am-1pm': ['TP'],
          '2pm-6pm': ['TP'],
        },
        Thursday: {
          '9am-1pm': ['HTC1', 'TeleCs'],
          '2pm-6pm': ['HTC1', 'Cs'],
        },
        Friday: {
          '9am-1pm': ['AMI'],
          '2pm-6pm': ['AMI'],
        },
      },
    },
  },
  FL: {
    M1: {
      //Mois HDJ
      S1_S2: {
        Monday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['Cs'] },
        Tuesday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['Cs'] },
        Wednesday: { '9am-1pm': ['Cs'], '2pm-6pm': ['TeleCs'] },
        Thursday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
        Friday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
      },
      S3_S4: {
        Monday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
        Tuesday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['Cs'] },
        Wednesday: { '9am-1pm': ['Cs'], '2pm-6pm': ['TeleCs'] },
        Thursday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
        Friday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
      },
    },

    M2: {
      //mois HTC
      Monday: { '9am-1pm': ['HTC1'], '2pm-6pm': ['HTC1'] },
      Tuesday: { '9am-1pm': ['HTC1'], '2pm-6pm': ['HTC1', 'Cs'] },
      Wednesday: { '9am-1pm': ['HTC1', 'Cs'], '2pm-6pm': ['HTC1'] },
      Thursday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
      Friday: { '9am-1pm': ['HTC1'], '2pm-6pm': ['HTC1'] },
    },
    M3: {
      //Mois HDJ idem M1 pour FL
      S1_S2: {
        Monday: { '9am-1pm': ['HTC1', 'TeleCs'], '2pm-6pm': ['HTC1', 'Cs'] },
        Tuesday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['Cs'] },
        Wednesday: { '9am-1pm': ['Cs'], '2pm-6pm': ['TeleCs'] },
        Thursday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
        Friday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
      },
      S3_S4: {
        Monday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
        Tuesday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['Cs'] },
        Wednesday: { '9am-1pm': ['Cs'], '2pm-6pm': ['TeleCs'] },
        Thursday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
        Friday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
      },
    },
    M4: {
      //Mois Ambulatoire
      Monday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['Cs'] },
      Tuesday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['Cs'] },
      Wednesday: { '9am-1pm': ['HTC1', 'Cs'], '2pm-6pm': ['HTC1', 'TeleCs'] },
      Thursday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
      Friday: { '9am-1pm': ['Cs'], '2pm-6pm': ['TeleCs'] },
    },
    M5: {
      //Mois HDJ
      S1_S2: {
        Monday: { '9am-1pm': ['HTC1', 'TeleCs'], '2pm-6pm': ['HTC1', 'Cs'] },
        Tuesday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['Cs'] },
        Wednesday: { '9am-1pm': ['Cs'], '2pm-6pm': ['TeleCs'] },
        Thursday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
        Friday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
      },
      S3_S4: {
        Monday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
        Tuesday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['Cs'] },
        Wednesday: { '9am-1pm': ['Cs'], '2pm-6pm': ['TeleCs'] },
        Thursday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
        Friday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
      },
    },
    M6: {
      //mois HTC
      Monday: { '9am-1pm': ['HTC1'], '2pm-6pm': ['HTC1'] },
      Tuesday: { '9am-1pm': ['HTC1'], '2pm-6pm': ['HTC1', 'Cs'] },
      Wednesday: { '9am-1pm': ['HTC1', 'Cs'], '2pm-6pm': ['HTC1'] },
      Thursday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
      Friday: { '9am-1pm': ['HTC1'], '2pm-6pm': ['HTC1'] },
    },
  },
  CL: {
    M1: {
      //mois Ambu
      Monday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
      Tuesday: { '9am-1pm': ['AMI'], '2pm-6pm': ['Cs'] },
      Wednesday: { '9am-1pm': ['HTC1', 'AMI'], '2pm-6pm': ['HTC1', 'TeleCs'] },
      Thursday: { '9am-1pm': ['AMI'], '2pm-6pm': ['Cs'] },
      Friday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['AMI'] },
    },
    M2: {
      //mois HDJ
      S1_S2: {
        //DL +
        Monday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
        Tuesday: { '9am-1pm': ['AMI'], '2pm-6pm': ['Cs'] },
        Wednesday: { '9am-1pm': ['AMI'], '2pm-6pm': ['TeleCs'] },
        Thursday: { '9am-1pm': ['HTC1', 'AMI'], '2pm-6pm': ['HTC1', 'Cs'] },
        Friday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
      },
      S3_S4: {
        //DL -
        Monday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
        Tuesday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['Cs'] },
        Wednesday: { '9am-1pm': ['AMI'], '2pm-6pm': ['TeleCs'] },
        Thursday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['Cs'] },
        Friday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
      },
    },
    M3: {
      // mois HTC
      Monday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
      Tuesday: { '9am-1pm': ['HTC1'], '2pm-6pm': ['HTC1', 'Cs'] },
      Wednesday: { '9am-1pm': ['HTC1', 'AMI'], '2pm-6pm': ['HTC1', 'TeleCs'] },
      Thursday: { '9am-1pm': ['HTC1', 'AMI'], '2pm-6pm': ['HTC1', 'Cs'] },
      Friday: { '9am-1pm': ['HTC1'], '2pm-6pm': ['HTC1'] },
    },
    M4: {
      //mois HDJ
      S1_S2: {
        //DL +
        Monday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
        Tuesday: { '9am-1pm': ['AMI'], '2pm-6pm': ['Cs'] },
        Wednesday: { '9am-1pm': ['AMI'], '2pm-6pm': ['TeleCs'] },
        Thursday: { '9am-1pm': ['AMI'], '2pm-6pm': ['Cs'] },
        Friday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
      },
      S3_S4: {
        //DL -
        Monday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
        Tuesday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['Cs'] },
        Wednesday: { '9am-1pm': ['AMI'], '2pm-6pm': ['TeleCs'] },
        Thursday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['Cs'] },
        Friday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
      },
    },
    M5: {
      // mois HTC
      Monday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
      Tuesday: { '9am-1pm': ['HTC1'], '2pm-6pm': ['HTC1', 'Cs'] },
      Wednesday: { '9am-1pm': ['HTC1', 'AMI'], '2pm-6pm': ['HTC1', 'TeleCs'] },
      Thursday: { '9am-1pm': ['HTC1', 'AMI'], '2pm-6pm': ['HTC1', 'Cs'] },
      Friday: { '9am-1pm': ['HTC1'], '2pm-6pm': ['HTC1'] },
    },
    M6: {
      //mois HDJ
      S1_S2: {
        //DL +
        Monday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
        Tuesday: { '9am-1pm': ['AMI'], '2pm-6pm': ['Cs'] },
        Wednesday: { '9am-1pm': ['AMI'], '2pm-6pm': ['TeleCs'] },
        Thursday: { '9am-1pm': ['HTC1', 'AMI'], '2pm-6pm': ['HTC1', 'Cs'] },
        Friday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
      },
      S3_S4: {
        //DL -
        Monday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
        Tuesday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['Cs'] },
        Wednesday: { '9am-1pm': ['AMI'], '2pm-6pm': ['TeleCs'] },
        Thursday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['Cs'] },
        Friday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
      },
    },
  },
  DL: {
    M1: {
      S1_S2: {
        //DL HDJ
        Monday: { '9am-1pm': ['Cs'], '2pm-6pm': ['Cs'] },
        Tuesday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
        Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
        Thursday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
        Friday: { '9am-1pm': ['Cs'], '2pm-6pm': ['TeleCs'] },
      },
      S3_S4: {
        //DL MPO
        Monday: { '9am-1pm': ['MPO'], '2pm-6pm': ['MPO'] },
        Tuesday: { '9am-1pm': ['MPO'], '2pm-6pm': ['MPO'] },
        Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
        Thursday: { '9am-1pm': ['MPO'], '2pm-6pm': ['MPO'] },
        Friday: { '9am-1pm': ['MPO'], '2pm-6pm': ['MPO'] },
      },
    },
    M2: {
      S1_S2: {
        //DL HDJ
        Monday: { '9am-1pm': ['Cs'], '2pm-6pm': ['Cs'] },
        Tuesday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
        Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
        Thursday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
        Friday: { '9am-1pm': ['Cs'], '2pm-6pm': ['TeleCs'] },
      },
      S3_S4: {
        //DL MPO
        Monday: { '9am-1pm': ['MPO'], '2pm-6pm': ['MPO'] },
        Tuesday: { '9am-1pm': ['MPO'], '2pm-6pm': ['MPO'] },
        Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
        Thursday: { '9am-1pm': ['MPO'], '2pm-6pm': ['MPO'] },
        Friday: { '9am-1pm': ['MPO'], '2pm-6pm': ['MPO'] },
      },
    },
    M3: {
      S1_S2: {
        //DL HDJ
        Monday: { '9am-1pm': ['Cs'], '2pm-6pm': ['Cs'] },
        Tuesday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
        Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
        Thursday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
        Friday: { '9am-1pm': ['Cs'], '2pm-6pm': ['TeleCs'] },
      },
      S3_S4: {
        //DL MPO
        Monday: { '9am-1pm': ['MPO'], '2pm-6pm': ['MPO'] },
        Tuesday: { '9am-1pm': ['MPO'], '2pm-6pm': ['MPO'] },
        Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
        Thursday: { '9am-1pm': ['MPO'], '2pm-6pm': ['MPO'] },
        Friday: { '9am-1pm': ['MPO'], '2pm-6pm': ['MPO'] },
      },
    },
    M4: {
      S1_S2: {
        //DL HDJ
        Monday: { '9am-1pm': ['Cs'], '2pm-6pm': ['Cs'] },
        Tuesday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
        Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
        Thursday: { '9am-1pm': ['HDJ'], '2pm-6pm': ['HDJ'] },
        Friday: { '9am-1pm': ['Cs'], '2pm-6pm': ['TeleCs'] },
      },
      S3_S4: {
        //DL MPO
        Monday: { '9am-1pm': ['MPO'], '2pm-6pm': ['MPO'] },
        Tuesday: { '9am-1pm': ['MPO'], '2pm-6pm': ['MPO'] },
        Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
        Thursday: { '9am-1pm': ['MPO'], '2pm-6pm': ['MPO'] },
        Friday: { '9am-1pm': ['MPO'], '2pm-6pm': ['MPO'] },
      },
    },
  },
  GC: {
    M1: {
      //HTC2
      Monday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
      Tuesday: { '9am-1pm': ['HTC2'], '2pm-6pm': ['HTC2', 'Cs'] },
      Wednesday: { '9am-1pm': ['HTC2', 'Cs'], '2pm-6pm': ['HTC2', 'EMIT'] },
      Thursday: { '9am-1pm': ['HTC2'], '2pm-6pm': ['HTC2', 'TeleCs'] },
      Friday: { '9am-1pm': ['HTC2'], '2pm-6pm': ['HTC2'] },
    },
    M2: {
      //EMATIT
      Monday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
      Tuesday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['Cs'] },
      Wednesday: { '9am-1pm': ['Cs'], '2pm-6pm': ['EMIT'] },
      Thursday: { '9am-1pm': ['EMATIT'], '2pm-6pm': ['EMATIT'] },
      Friday: { '9am-1pm': ['EMATIT'], '2pm-6pm': ['EMATIT'] },
    },
    M3: {
      //EMIT
      Monday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
      Tuesday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['Cs'] },
      Wednesday: { '9am-1pm': ['HTC2', 'Cs'], '2pm-6pm': ['HTC2', 'EMIT'] },
      Thursday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['EMIT'] },
      Friday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['EMIT'] },
    },
    M4: {
      //EMATIT
      Monday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
      Tuesday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['Cs'] },
      Wednesday: { '9am-1pm': ['Cs'], '2pm-6pm': ['EMIT'] },
      Thursday: { '9am-1pm': ['EMATIT'], '2pm-6pm': ['EMATIT'] },
      Friday: { '9am-1pm': ['EMATIT'], '2pm-6pm': ['EMATIT'] },
    },
  },
  MDLC: {
    M1: {
      //EMIT
      Monday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['Cs'] },
      Tuesday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['EMIT'] },
      Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
      Thursday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['Cs'] },
      Friday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['EMIT'] },
    },
    M2: {
      //EMIT+AMI
      Monday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['Cs'] },
      Tuesday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['EMIT'] },
      Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
      Thursday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['Cs'] },
      Friday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['AMI'] },
    },
    M3: {
      //HTC2
      Monday: { '9am-1pm': ['HTC2', 'TeleCs'], '2pm-6pm': ['HTC2', 'Cs'] },
      Tuesday: { '9am-1pm': ['HTC2'], '2pm-6pm': ['HTC2'] },
      Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
      Thursday: { '9am-1pm': ['HTC2'], '2pm-6pm': ['HTC2', 'Cs'] },
      Friday: { '9am-1pm': ['HTC2'], '2pm-6pm': ['HTC2'] },
    },
    M4: {
      //EMIT
      Monday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['Cs'] },
      Tuesday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['EMIT'] },
      Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
      Thursday: { '9am-1pm': ['HTC2'], '2pm-6pm': ['HTC2', 'Cs'] },
      Friday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['EMIT'] },
    },
  },
  MG: {
    M1: {
      //EMATIT
      Monday: { '9am-1pm': ['HTC2', 'EMATIT'], '2pm-6pm': ['HTC2', 'EMATIT'] },
      Tuesday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['Cs'] },
      Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
      Thursday: { '9am-1pm': ['EMATIT'], '2pm-6pm': ['Cs'] },
      Friday: { '9am-1pm': ['AMI'], '2pm-6pm': ['EMATIT'] },
    },
    M2: {
      //HTC2
      Monday: { '9am-1pm': ['HTC2', 'TeleCs'], '2pm-6pm': ['HTC2'] },
      Tuesday: { '9am-1pm': ['HTC2'], '2pm-6pm': ['HTC2', 'Cs'] },
      Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
      Thursday: { '9am-1pm': ['HTC2'], '2pm-6pm': ['HTC2', 'Cs'] },
      Friday: { '9am-1pm': ['HTC2'], '2pm-6pm': ['HTC2'] },
    },
    M3: {
      //EMATIT + AMI
      Monday: { '9am-1pm': ['EMATIT'], '2pm-6pm': ['EMATIT'] },
      Tuesday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['Cs'] },
      Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
      Thursday: { '9am-1pm': ['AMI'], '2pm-6pm': ['Cs'] },
      Friday: { '9am-1pm': ['EMATIT'], '2pm-6pm': ['EMATIT'] },
    },
    M4: {
      //EMATIT + AMI (encore?)
      Monday: { '9am-1pm': ['EMATIT'], '2pm-6pm': ['EMATIT'] },
      Tuesday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['Cs'] },
      Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
      Thursday: { '9am-1pm': ['AMI'], '2pm-6pm': ['Cs'] },
      Friday: { '9am-1pm': ['EMATIT'], '2pm-6pm': ['EMATIT'] },
    },
  },
  RNV: {
    M1: {
      //EMATIT
      Monday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['Cs'] },
      Tuesday: { '9am-1pm': ['EMATIT'], '2pm-6pm': ['EMIT'] },
      Wednesday: { '9am-1pm': ['EMATIT', 'EMIT'], '2pm-6pm': ['Cs'] },
      Thursday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
      Friday: { '9am-1pm': ['EMATIT'], '2pm-6pm': ['EMATIT'] },
    },
    M2: {
      //EMATIT
      Monday: { '9am-1pm': ['EMATIT'], '2pm-6pm': ['Cs'] },
      Tuesday: { '9am-1pm': ['EMATIT'], '2pm-6pm': ['EMATIT'] },
      Wednesday: {
        '9am-1pm': ['HTC2', 'EMATIT', 'EMIT'],
        '2pm-6pm': ['HTC2', 'Cs'],
      },
      Thursday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
      Friday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['EMIT'] },
    },
    M3: {
      //EMATIT = M1
      Monday: { '9am-1pm': ['TeleCs'], '2pm-6pm': ['Cs'] },
      Tuesday: { '9am-1pm': ['EMATIT'], '2pm-6pm': ['EMIT'] },
      Wednesday: { '9am-1pm': ['EMATIT', 'EMIT'], '2pm-6pm': ['Cs'] },
      Thursday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
      Friday: { '9am-1pm': ['EMATIT'], '2pm-6pm': ['EMATIT'] },
    },
    M4: {
      //HTC2
      Monday: { '9am-1pm': ['HTC2'], '2pm-6pm': ['HTC2', 'Cs'] },
      Tuesday: { '9am-1pm': ['HTC2'], '2pm-6pm': ['HTC2'] },
      Wednesday: {
        '9am-1pm': ['HTC2', 'TeleCs', 'EMIT'],
        '2pm-6pm': ['HTC2', 'Cs'],
      },
      Thursday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
      Friday: { '9am-1pm': ['HTC2'], '2pm-6pm': ['HTC2'] },
    },
  },
  BM: {
    Monday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['EMIT'] },
    Tuesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    Thursday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['EMIT'] },
    Friday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
  },
};
