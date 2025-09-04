const docPattern = {
  YC: {
    1: {
      name: 'HTC',
      week: {
        Monday: {
          '9am-1pm': ['HTC1', 'TeleCs'],
          '2pm-6pm': ['HTC1', 'TeleCs'],
        },
        Tuesday: { '9am-1pm': ['HTC1'], '2pm-6pm': ['HTC1', 'Cs'] },
        Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
        Thursday: { '9am-1pm': ['HTC1'], '2pm-6pm': ['HTC1', 'Cs'] },
        Friday: { '9am-1pm': ['HTC1'], '2pm-6pm': ['HTC1'] },
      },
    },
    2: {
      name: 'recup TP',
      week: {
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
    },
    3: {
      name: 'basic',
      week: {
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
    },
    4: {
      name: 'basic + rempla HTC Jeudi',
      week: {
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
    5: {
      name: 'basic + rempla HTC Lundi',
      week: {
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
  },
};

const docOld = {
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
    M1: {
      Monday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['EMIT'] },
      Tuesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
      Wednesday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
      Thursday: { '9am-1pm': ['EMIT'], '2pm-6pm': ['EMIT'] },
      Friday: { '9am-1pm': ['TP'], '2pm-6pm': ['TP'] },
    },
  },
};
