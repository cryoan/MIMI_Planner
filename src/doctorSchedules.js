// the hierarchy is activity > rotation > doctor

export const docActivities = {
  // duration for 1 plage of activity
  AMI: {
    name: "AMI",
    duration: 2,
  },
  AMI_Cs_U: {
    name: "AMI_Cs_U",
    duration: 1,
  },
  Cs: {
    name: "Cs",
    duration: 4,
  },
  Cs_Prison: {
    name: "Cs_Prison",
    duration: 4,
  },
  EMIT: {
    name: "EMIT",
    duration: 3,
  },
  EMATIT: {
    name: "EMATIT",
    duration: 3,
  },
  HDJ: {
    name: "HDJ",
    duration: 4,
  },
  HTC1: {
    name: "HTC1_cv",
    duration: 1,
  },
  HTC1_visite: {
    name: "HTC1_visite",
    duration: 4,
  },
  HTC2: {
    name: "HTC2_cv",
    duration: 1,
  },
  HTC2_visite: {
    name: "HTC2_visite",
    duration: 4,
  },
  TP: {
    name: "TP",
    duration: 4,
  },
  TeleCs: {
    name: "TeleCs",
    duration: 3,
  },
  MPO: {
    name: "MPO",
    duration: 3,
  },
  Chefferie: {
    name: "Chefferie",
    duration: 4,
  },
  Staff: {
    name: "Staff",
    duration: 3,
  },
};

// Standard rotation templates - complete weekly schedules
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

  HDJ: {
    Monday: { "9am-1pm": [], "2pm-6pm": [] },
    Tuesday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
    Wednesday: { "9am-1pm": [], "2pm-6pm": [] },
    Thursday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
    Friday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
  },

  EMIT: {
    Monday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
    Tuesday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
    Wednesday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
    Thursday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
    Friday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
  },

  EMATIT: {
    Monday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["EMATIT"] },
    Tuesday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["EMATIT"] },
    Wednesday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["EMATIT"] },
    Thursday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["EMATIT"] },
    Friday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["EMATIT"] },
  },

  AMI: {
    Monday: { "9am-1pm": ["AMI"], "2pm-6pm": ["AMI"] },
    Tuesday: { "9am-1pm": ["AMI"], "2pm-6pm": ["AMI"] },
    Wednesday: { "9am-1pm": ["AMI"], "2pm-6pm": ["AMI"] },
    Thursday: { "9am-1pm": ["AMI"], "2pm-6pm": ["AMI"] },
    Friday: { "9am-1pm": ["AMI"], "2pm-6pm": ["AMI"] },
  },

  MPO: {
    Monday: { "9am-1pm": ["MPO"], "2pm-6pm": ["MPO"] },
    Tuesday: { "9am-1pm": ["MPO"], "2pm-6pm": ["MPO"] },
    Wednesday: { "9am-1pm": ["MPO"], "2pm-6pm": ["MPO"] },
    Thursday: { "9am-1pm": ["MPO"], "2pm-6pm": ["MPO"] },
    Friday: { "9am-1pm": ["MPO"], "2pm-6pm": ["MPO"] },
  },
  Chefferie: {
    Monday: { "9am-1pm": [], "2pm-6pm": [] },
    Tuesday: { "9am-1pm": [], "2pm-6pm": [] },
    Wednesday: { "9am-1pm": [], "2pm-6pm": [] },
    Thursday: { "9am-1pm": [], "2pm-6pm": [] },
    Friday: { "9am-1pm": ["Chefferie"], "2pm-6pm": ["Chefferie"] },
  },
};

// Helper function to deep clone objects
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Helper function to calculate total duration of activities in a time slot
function calculateSlotDuration(activities) {
  if (!Array.isArray(activities)) {
    return 0;
  }

  return activities.reduce((total, activity) => {
    const activityInfo = docActivities[activity];
    if (activityInfo && typeof activityInfo.duration === "number") {
      return total + activityInfo.duration;
    }
    // If activity not found in docActivities, assume it takes 4 hours (full slot)
    // This is a conservative approach for unknown activities
    console.warn(
      `Activity "${activity}" not found in docActivities, assuming 4 hours duration`
    );
    return total + 4;
  }, 0);
}

// Doctor profiles with backbone constraints, skills, rotations, and weekly needs
export const doctorProfiles = {
  YC: {
    backbone: {
      Monday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Tuesday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Cs"] },
      Wednesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Thursday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Cs"] },
      Friday: { "9am-1pm": [], "2pm-6pm": ["Staff"] },
    },
    skills: ["AMI", "HTC1", "HTC1_visite", "EMIT", "EMATIT", "Chefferie"],
    rotationSetting: ["Chefferie"],
    weeklyNeeds: {
      TeleCs: {
        count: 2,
        priority: "high",
        constraints: {
          timeSlots: ["9am-1pm"],
          preferredDays: ["Tuesday", "Thursday"],
        },
      },
    },
    rotations: {
      ambu: {
        Tuesday: { "9am-1pm": ["TeleCs"] },
        Thursday: { "9am-1pm": ["TeleCs"] },
      },
      ambu_remplaHTC_Jeudi: {
        Tuesday: { "9am-1pm": ["TeleCs"] },
        Thursday: { "9am-1pm": ["HTC1", "TeleCs"], "2pm-6pm": ["HTC1", "Cs"] },
      },
      ambu_remplaHTC_Lundi: {
        Monday: { "9am-1pm": ["HTC1"], "2pm-6pm": ["HTC1", "AMI"] },
        Tuesday: { "9am-1pm": ["TeleCs", "AMI"] },
        Thursday: { "9am-1pm": ["TeleCs"] },
        Friday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      },
      off: {
        Monday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
        Tuesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
        Wednesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
        Thursday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
        Friday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      },
    },
  },

  FL: {
    backbone: {
      Monday: { "9am-1pm": ["Cs"], "2pm-6pm": ["TeleCs"] },
      Tuesday: { "9am-1pm": [], "2pm-6pm": ["Cs"] },
      Wednesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Thursday: { "9am-1pm": [], "2pm-6pm": ["TeleCs"] },
      Friday: { "9am-1pm": [], "2pm-6pm": ["Staff"] },
    },
    skills: [
      "HTC1",
      "HTC1_visite",
      "HDJ",
      "Cs_Prison",
      "TeleCs",
      "AMI_Cs_U",
      "AMI",
      "EMIT",
    ],
    rotationSetting: ["HTC1", "HDJ", "AMI"],
    weeklyNeeds: {
      TeleCs: {
        count: 2,
        priority: "medium",
        constraints: {
          timeSlots: ["9am-1pm", "2pm-6pm"],
          excludeDays: ["Wednesday"],
        },
      },
    },
    rotations: {
      HTC: {
        Monday: { "9am-1pm": ["HTC1"], "2pm-6pm": ["HTC1", "AMI"] },
        Tuesday: {
          "9am-1pm": ["HTC1_visite"],
          "2pm-6pm": ["HTC1", "Cs_Prison"],
        },
        Wednesday: { "9am-1pm": ["HTC1", "Cs"], "2pm-6pm": ["HTC1"] },
        Friday: { "9am-1pm": ["HTC1_visite"], "2pm-6pm": ["HTC1"] },
      },
      HDJ_Vendredi: {
        Monday: { "9am-1pm": ["AMI_Cs_U", "Cs"], "2pm-6pm": ["TeleCs"] },
        Tuesday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Cs_Prison"] },
        Wednesday: { "9am-1pm": ["Cs"], "2pm-6pm": ["TeleCs"] },
        Friday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
      },
      HDJ_Ven_remplaHTC_Lundi: {
        Monday: {
          "9am-1pm": ["HTC1", "Cs"],
          "2pm-6pm": ["HTC1", "TeleCs", "AMI"],
        },
        Tuesday: { "9am-1pm": ["TeleCs", "AMI"], "2pm-6pm": ["Cs_Prison"] },
        Wednesday: { "9am-1pm": ["Cs"], "2pm-6pm": ["TeleCs"] },
        Friday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
      },
      HDJ_Full: {
        Monday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
        Tuesday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["Cs_Prison"] },
        Wednesday: { "9am-1pm": ["Cs"], "2pm-6pm": ["TeleCs"] },
        Friday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
      },
      Ambu_remplaHTC_Mercredi: {
        Monday: { "9am-1pm": ["Cs"], "2pm-6pm": ["TeleCs"] },
        Tuesday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Cs_Prison"] },
        Wednesday: { "9am-1pm": ["HTC1", "Cs"], "2pm-6pm": ["HTC1", "TeleCs"] },
        Friday: { "9am-1pm": ["Cs"], "2pm-6pm": ["TeleCs"] },
      },
    },
  },

  NS: {
    backbone: {
      Monday: { "9am-1pm": [], "2pm-6pm": [] },
      Tuesday: { "9am-1pm": [], "2pm-6pm": ["Cs"] },
      Wednesday: { "9am-1pm": [], "2pm-6pm": ["Cs"] },
      Thursday: { "9am-1pm": [], "2pm-6pm": [] },
      Friday: { "9am-1pm": [], "2pm-6pm": ["Staff"] },
    },
    skills: ["HTC1", "HTC1_visite", "HDJ", "AMI_Cs_U", "AMI", "EMIT"],
    rotationSetting: ["HTC1", "AMI"],
    rotations: {},
    weeklyNeeds: {
      TeleCs: {
        count: 2,
        priority: "medium",
        constraints: {
          timeSlots: ["9am-1pm", "2pm-6pm"],
          excludeDays: ["Wednesday"],
        },
      },
    },
  },

  GC: {
    backbone: {
      Monday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Tuesday: { "9am-1pm": [], "2pm-6pm": ["Cs"] },
      Wednesday: { "9am-1pm": ["Cs"], "2pm-6pm": [] },
      Thursday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Friday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Staff"] },
    },
    skills: ["EMIT", "EMATIT"],
    rotationSetting: ["EMIT"],
    weeklyNeeds: {
      TeleCs: {
        count: 1,
        priority: "low",
        constraints: {
          timeSlots: ["9am-1pm", "2pm-6pm"],
          preferredDays: ["Tuesday", "Thursday"],
        },
      },
    },
    rotations: {
      HTC: "HTC2", // Use HTC2 template
      EMATIT_remplaHTC_Jeudi: {
        Tuesday: { "9am-1pm": ["TeleCs"] },
        Wednesday: { "9am-1pm": ["Cs"], "2pm-6pm": ["EMIT"] },
        Thursday: {
          "9am-1pm": ["HTC2", "EMATIT"],
          "2pm-6pm": ["HTC2", "EMATIT"],
        },
        Friday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["EMATIT"] },
      },
      EMIT: "EMIT", // Use EMIT template
      EMIT_remplaHTC_Mercredi: {
        Tuesday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["Cs"] },
        Wednesday: { "9am-1pm": ["HTC2", "Cs"], "2pm-6pm": ["HTC2", "EMIT"] },
        Thursday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["EMIT"] },
        Friday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
      },
    },
  },

  CL: {
    backbone: {
      Monday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Tuesday: { "9am-1pm": [], "2pm-6pm": [] },
      Wednesday: { "9am-1pm": [], "2pm-6pm": ["Cs"] },
      Thursday: { "9am-1pm": [], "2pm-6pm": ["Cs"] },
      Friday: { "9am-1pm": [], "2pm-6pm": ["Staff"] },
    },
    skills: ["HTC1", "HTC1_visite", "HDJ", "AMI"],
    rotationSetting: ["HTC1", "HDJ", "AMI"],
    weeklyNeeds: {
      TeleCs: {
        count: 2,
        priority: "medium",
        constraints: {
          timeSlots: ["9am-1pm", "2pm-6pm"],
          excludeDays: ["Wednesday"],
        },
      },
    },
    rotations: {
      HTC: "HTC1", // Use HTC1 template
      HDJ_full: {
        Tuesday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
        Wednesday: { "9am-1pm": ["TeleCs", "AMI"], "2pm-6pm": ["Cs"] },
        Thursday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["Cs"] },
        Friday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
      },
      HDJ_Vendredi: {
        Tuesday: { "9am-1pm": ["AMI"], "2pm-6pm": ["TeleCs"] },
        Wednesday: { "9am-1pm": ["AMI"], "2pm-6pm": ["Cs"] },
        Thursday: { "9am-1pm": ["AMI"], "2pm-6pm": ["Cs"] },
        Friday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
      },
      HDJ_Ven_remplaHTC_Jeudi: {
        Tuesday: { "9am-1pm": ["AMI"], "2pm-6pm": ["TeleCs"] },
        Wednesday: { "9am-1pm": ["AMI"], "2pm-6pm": ["Cs"] },
        Thursday: { "9am-1pm": ["HTC1"], "2pm-6pm": ["HTC1", "Cs"] },
        Friday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
      },
      ambu_remplaHTC_Mercredi: {
        Tuesday: { "9am-1pm": ["AMI"], "2pm-6pm": ["TeleCs"] },
        Wednesday: { "9am-1pm": ["HTC1", "AMI"], "2pm-6pm": ["HTC1", "Cs"] },
        Thursday: { "9am-1pm": ["AMI"], "2pm-6pm": ["Cs"] },
        Friday: { "9am-1pm": ["AMI_Cs_U"], "2pm-6pm": ["TeleCs"] },
      },
    },
  },

  DL: {
    backbone: {
      Monday: { "9am-1pm": ["Cs"], "2pm-6pm": ["Cs"] },
      Tuesday: { "9am-1pm": [], "2pm-6pm": [] },
      Wednesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Thursday: { "9am-1pm": [], "2pm-6pm": [] },
      Friday: { "9am-1pm": ["Cs"], "2pm-6pm": ["TeleCs"] },
    },
    skills: ["HDJ", "MPO"],
    rotationSetting: ["MPO", "HDJ"],
    weeklyNeeds: {
      TeleCs: {
        count: 2,
        priority: "medium",
        constraints: {
          timeSlots: ["9am-1pm", "2pm-6pm"],
          excludeDays: ["Wednesday"],
        },
      },
    },
    rotations: {
      HDJ: {
        Monday: { "9am-1pm": ["Cs"], "2pm-6pm": ["Cs"] },
        Tuesday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
        Thursday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
        Friday: { "9am-1pm": ["Cs"], "2pm-6pm": ["TeleCs"] },
      },
      MPO: "MPO", // Use MPO template
    },
  },

  MG: {
    backbone: {
      Monday: { "9am-1pm": [], "2pm-6pm": [] },
      Tuesday: { "9am-1pm": [], "2pm-6pm": ["Cs"] },
      Wednesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Thursday: { "9am-1pm": [], "2pm-6pm": ["Cs"] },
      Friday: { "9am-1pm": [], "2pm-6pm": ["Staff"] },
    },
    skills: ["HTC2", "HTC2_visite", "EMATIT", "EMIT", "AMI"],
    rotationSetting: ["HTC2", "EMATIT", "EMIT"],
    weeklyNeeds: {
      TeleCs: {
        count: 2,
        priority: "medium",
        constraints: {
          timeSlots: ["9am-1pm", "2pm-6pm"],
          preferredDays: ["Monday", "Tuesday", "Thursday"],
        },
      },
    },
    rotations: {
      HTC: {
        Monday: { "9am-1pm": ["HTC1", "TeleCs"], "2pm-6pm": ["HTC1"] },
        Tuesday: { "9am-1pm": ["HTC1_visite"] },
        Thursday: { "9am-1pm": ["HTC1", "TeleCs"], "2pm-6pm": ["HTC1", "Cs"] },
        Friday: { "9am-1pm": ["HTC1_visite"], "2pm-6pm": ["HTC1"] },
      },
      EMATIT_remplaHTC_Lundi: {
        Monday: {
          "9am-1pm": ["HTC1", "EMATIT"],
          "2pm-6pm": ["HTC1", "EMATIT"],
        },
        Tuesday: { "9am-1pm": ["TeleCs"] },
        Thursday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["Cs"] },
        Friday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
      },
      EMATIT: "EMATIT",
      EMATIT_AMI: {
        Monday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["TeleCs"] },
        Tuesday: { "9am-1pm": ["EMATIT"] },
        Thursday: { "9am-1pm": ["AMI", "TeleCs"], "2pm-6pm": ["Cs"] },
        Friday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["EMATIT"] },
      },
    },
  },

  RNV: {
    backbone: {
      Monday: { "9am-1pm": [], "2pm-6pm": ["Cs"] },
      Tuesday: { "9am-1pm": [], "2pm-6pm": [] },
      Wednesday: { "9am-1pm": [], "2pm-6pm": ["Cs"] },
      Thursday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Friday: { "9am-1pm": [], "2pm-6pm": ["Staff"] },
    },
    skills: ["HTC2", "HTC2_visite", "EMATIT", "EMIT"],
    rotationSetting: ["HTC2", "EMATIT", "EMIT"],
    weeklyNeeds: {
      TeleCs: {
        count: 1,
        priority: "medium",
        constraints: {
          timeSlots: ["9am-1pm", "2pm-6pm"],
          preferredDays: ["Monday", "Tuesday", "Friday"],
        },
      },
    },
    rotations: {
      HTC: {
        Monday: { "9am-1pm": ["HTC2"], "2pm-6pm": ["HTC2", "Cs"] },
        Tuesday: { "9am-1pm": ["HTC2_visite"], "2pm-6pm": ["HTC2", "TeleCs"] },
        Wednesday: { "9am-1pm": ["HTC2", "EMIT"], "2pm-6pm": ["HTC2", "Cs"] },
        Friday: { "9am-1pm": ["HTC2_visite"], "2pm-6pm": ["HTC2"] },
      },
      EMATIT: {
        Monday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Cs"] },
        Tuesday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["EMIT"] },
        Wednesday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["Cs"] },
        Friday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["EMATIT"] },
      },
      EMATIT_remplaHTC_Mercredi: {
        Monday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["Cs"] },
        Tuesday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["EMATIT"] },
        Wednesday: { "9am-1pm": ["HTC2", "EMIT"], "2pm-6pm": ["HTC2", "Cs"] },
        Friday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["EMIT"] },
      },
    },
  },

  MDLC: {
    backbone: {
      Monday: { "9am-1pm": [], "2pm-6pm": ["Cs"] },
      Tuesday: { "9am-1pm": [], "2pm-6pm": [] },
      Wednesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Thursday: { "9am-1pm": [], "2pm-6pm": ["Cs"] },
      Friday: { "9am-1pm": [], "2pm-6pm": ["Staff"] },
    },
    skills: ["HTC2", "HTC2_visite", "EMIT", "EMATIT", "AMI"],
    rotationSetting: ["HTC2", "EMIT", "EMATIT"],
    weeklyNeeds: {
      TeleCs: {
        count: 2,
        priority: "medium",
        constraints: {
          timeSlots: ["9am-1pm"],
          preferredDays: ["Monday", "Thursday"],
        },
      },
    },
    rotations: {
      HTC: {
        Monday: { "9am-1pm": ["HTC2", "TeleCs"], "2pm-6pm": ["HTC2", "Cs"] },
        Tuesday: { "9am-1pm": ["HTC2_visite"], "2pm-6pm": ["HTC2", "EMIT"] },
        Thursday: { "9am-1pm": ["HTC2"], "2pm-6pm": ["HTC2", "Cs"] },
        Friday: { "9am-1pm": ["HTC2_visite"], "2pm-6pm": ["HTC2"] },
      },
      EMIT: {
        Monday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Cs"] },
        Tuesday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
        Thursday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Cs"] },
        Friday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
      },
      EMIT_AMI: {
        Monday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Cs"] },
        Tuesday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
        Thursday: { "9am-1pm": ["AMI"], "2pm-6pm": ["Cs"] },
        Friday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["AMI"] },
      },
      EMIT_remplaHTC_Jeudi: {
        Monday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Cs"] },
        Tuesday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
        Thursday: { "9am-1pm": ["HTC2"], "2pm-6pm": ["HTC2", "Cs"] },
        Friday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
      },
      EMIT_remplaHTC_Lundi: {
        Monday: { "9am-1pm": ["HTC2", "TeleCs"], "2pm-6pm": ["HTC2", "Cs"] },
        Tuesday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
        Thursday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Cs"] },
        Friday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
      },
    },
  },

  BM: {
    backbone: {
      Monday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Tuesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Wednesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Thursday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
      Friday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["Staff"] },
    },
    skills: ["EMIT", "EMATIT"],
    rotationSetting: ["EMIT"],
    rotations: {
      EMIT: {
        Monday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
        Thursday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
      },
    },
  },
};

// Function to merge rotation template with backbone constraints
// Backbone always takes precedence and capacity-aware template merging
// Special handling for HTC rotations: HTC activities are enforced alongside Cs activities
function mergeTemplateWithBackbone(templateName, backbone) {
  const template = rotationTemplates[templateName];
  if (!template) {
    console.error(`Template ${templateName} not found`);
    return deepClone(backbone); // Return backbone if template not found
  }

  // Start with a deep copy of the backbone
  const mergedSchedule = deepClone(backbone);

  // Check if this is an HTC rotation
  const isHTCRotation = templateName === "HTC1" || templateName === "HTC2";

  // Define HTC-related activities
  const htcActivities = ["HTC1", "HTC1_visite", "HTC2", "HTC2_visite"];

  // Merge template activities based on remaining capacity in each slot
  Object.entries(template).forEach(([day, slots]) => {
    Object.entries(slots).forEach(([timeSlot, templateActivities]) => {
      if (
        mergedSchedule[day] &&
        mergedSchedule[day][timeSlot] &&
        Array.isArray(mergedSchedule[day][timeSlot])
      ) {
        // Calculate current duration of backbone activities
        const currentDuration = calculateSlotDuration(
          mergedSchedule[day][timeSlot]
        );
        const remainingCapacity = 4 - currentDuration; // Each time slot is 4 hours

        // Check if we're in HTC rotation with HTC activities
        const hasHTCActivities = templateActivities.some(activity =>
          htcActivities.includes(activity)
        );

        // Check if backbone slot contains TP (Temps Partiel - doctor unavailable)
        const hasTP = mergedSchedule[day][timeSlot].includes("TP");

        if (isHTCRotation && hasHTCActivities && !hasTP) {
          // Special case: HTC rotation with HTC activities, but NOT when TP is present
          // Add HTC activities regardless of capacity constraints, except when doctor has TP
          const htcActivitiesToAdd = templateActivities.filter(activity =>
            htcActivities.includes(activity)
          );

          if (htcActivitiesToAdd.length > 0) {
            mergedSchedule[day][timeSlot] = [
              ...mergedSchedule[day][timeSlot],
              ...htcActivitiesToAdd,
            ];
          }

          // Also add non-HTC activities if there's capacity
          const nonHTCActivities = templateActivities.filter(activity =>
            !htcActivities.includes(activity)
          );

          if (nonHTCActivities.length > 0 && remainingCapacity > 0) {
            const activitiesToAdd = [];
            let usedCapacity = 0;

            for (const activity of nonHTCActivities) {
              const activityDuration = docActivities[activity]?.duration || 4;

              if (usedCapacity + activityDuration <= remainingCapacity) {
                activitiesToAdd.push(activity);
                usedCapacity += activityDuration;
              }
            }

            if (activitiesToAdd.length > 0) {
              mergedSchedule[day][timeSlot] = [
                ...mergedSchedule[day][timeSlot],
                ...activitiesToAdd,
              ];
            }
          }
        } else {
          // Standard capacity-aware merging for non-HTC cases
          if (remainingCapacity > 0) {
            // Try to add template activities that fit in remaining capacity
            const activitiesToAdd = [];
            let usedCapacity = 0;

            for (const activity of templateActivities) {
              const activityDuration = docActivities[activity]?.duration || 4;

              // Only add if it fits in remaining capacity
              if (usedCapacity + activityDuration <= remainingCapacity) {
                activitiesToAdd.push(activity);
                usedCapacity += activityDuration;
              }
            }

            // Add the activities that fit
            if (activitiesToAdd.length > 0) {
              mergedSchedule[day][timeSlot] = [
                ...mergedSchedule[day][timeSlot],
                ...activitiesToAdd,
              ];
            }
          }
        }
      }
    });
  });

  return mergedSchedule;
}

// Generate rotations automatically from rotationSetting arrays
export function generateDoctorRotations(doctorCode) {
  const doctor = doctorProfiles[doctorCode];
  if (!doctor) {
    throw new Error(`Doctor ${doctorCode} not found`);
  }

  const { backbone, rotationSetting } = doctor;
  if (!rotationSetting) {
    // If no rotationSetting, return existing rotations or empty object
    return doctor.rotations || {};
  }

  const generatedRotations = {};

  // Generate base rotations from templates
  rotationSetting.forEach((templateName) => {
    if (rotationTemplates[templateName]) {
      // Generate simple rotation from template + backbone
      const baseRotation = mergeTemplateWithBackbone(templateName, backbone);
      generatedRotations[templateName] = baseRotation;
    } else {
      console.warn(
        `Template ${templateName} not found for doctor ${doctorCode}`
      );
    }
  });

  return generatedRotations;
}

// Generate common rotation variations based on template patterns

// Build doctor schedule by merging backbone with rotation (template or custom)
export function buildDoctorSchedule(doctorCode, rotationName) {
  const doctor = doctorProfiles[doctorCode];
  if (!doctor) {
    throw new Error(`Doctor ${doctorCode} not found`);
  }

  const rotation = doctor.rotations[rotationName];
  if (!rotation) {
    throw new Error(
      `Rotation ${rotationName} not found for doctor ${doctorCode}`
    );
  }

  // Start with doctor's backbone constraints
  const schedule = deepClone(doctor.backbone);

  if (typeof rotation === "string") {
    // It's a template reference - merge template with backbone
    const template = rotationTemplates[rotation];
    if (!template) {
      throw new Error(`Rotation template ${rotation} not found`);
    }

    Object.entries(template).forEach(([day, slots]) => {
      Object.entries(slots).forEach(([timeSlot, activities]) => {
        // Only fill if backbone slot is empty
        if (schedule[day][timeSlot].length === 0) {
          schedule[day][timeSlot] = activities;
        }
        // Backbone constraints (TP, Cs, Chefferie) take precedence
      });
    });
  } else {
    // It's a custom rotation - merge directly with backbone
    Object.entries(rotation).forEach(([day, slots]) => {
      Object.entries(slots).forEach(([timeSlot, activities]) => {
        // Custom rotations can override backbone constraints
        schedule[day][timeSlot] = activities;
      });
    });
  }

  return schedule;
}

// Generate docChunks using the new system
export const docChunks = {};

// Generate all doctor schedule combinations using computed rotations
Object.entries(doctorProfiles).forEach(([doctorCode, doctor]) => {
  // First, generate rotations from rotationSetting if available
  let rotationsToUse = doctor.rotations || {};

  if (doctor.rotationSetting) {
    try {
      const computedRotations = generateDoctorRotations(doctorCode);
      // Merge computed rotations with existing ones (existing take precedence for compatibility)
      rotationsToUse = { ...computedRotations, ...rotationsToUse };
    } catch (error) {
      console.warn(
        `Error generating computed rotations for ${doctorCode}:`,
        error
      );
    }
  }

  // Generate docChunks from all available rotations
  Object.entries(rotationsToUse).forEach(([rotationName, rotationData]) => {
    const chunkName = `${doctorCode}_${rotationName}`;
    try {
      // Build the schedule directly from the rotation data
      if (typeof rotationData === "string") {
        // It's a template reference - merge template with backbone
        const schedule = mergeTemplateWithBackbone(
          rotationData,
          doctor.backbone
        );
        docChunks[chunkName] = schedule;
      } else {
        // It's already a complete schedule
        docChunks[chunkName] = rotationData;
      }
    } catch (error) {
      console.error(`Error building schedule for ${chunkName}:`, error);
    }
  });
});

// docChunks is now automatically generated from doctorProfiles

// Validation function to test the new automated rotation system
export function validateRotationSystem() {
  const results = {
    success: true,
    errors: [],
    warnings: [],
    stats: {
      doctorsProcessed: 0,
      rotationsGenerated: 0,
      templatesUsed: new Set(),
    },
  };

  try {
    Object.entries(doctorProfiles).forEach(([doctorCode, doctor]) => {
      results.stats.doctorsProcessed++;

      if (doctor.rotationSetting) {
        try {
          const generatedRotations = generateDoctorRotations(doctorCode);
          results.stats.rotationsGenerated +=
            Object.keys(generatedRotations).length;

          // Track templates used
          doctor.rotationSetting.forEach((template) => {
            results.stats.templatesUsed.add(template);
          });

          // Check if generated rotations are valid schedules
          Object.entries(generatedRotations).forEach(
            ([rotationName, rotationData]) => {
              if (!rotationData || typeof rotationData !== "object") {
                results.errors.push(
                  `Generated rotation ${doctorCode}_${rotationName} is not a valid schedule object`
                );
                results.success = false;
                return;
              }

              // Check if schedule has proper structure
              const requiredDays = [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
              ];
              const requiredSlots = ["9am-1pm", "2pm-6pm"];

              requiredDays.forEach((day) => {
                if (!rotationData[day]) {
                  results.errors.push(
                    `Generated rotation ${doctorCode}_${rotationName} missing day: ${day}`
                  );
                  results.success = false;
                  return;
                }

                requiredSlots.forEach((slot) => {
                  if (
                    !rotationData[day][slot] ||
                    !Array.isArray(rotationData[day][slot])
                  ) {
                    results.errors.push(
                      `Generated rotation ${doctorCode}_${rotationName} has invalid slot: ${day} ${slot}`
                    );
                    results.success = false;
                  }
                });
              });
            }
          );
        } catch (error) {
          results.errors.push(
            `Error generating rotations for doctor ${doctorCode}: ${error.message}`
          );
          results.success = false;
        }
      }
    });

    results.stats.templatesUsed = Array.from(results.stats.templatesUsed);
  } catch (error) {
    results.errors.push(`Critical error during validation: ${error.message}`);
    results.success = false;
  }

  return results;
}

// Test function to compare a specific doctor's old vs new rotations
export function compareDoctorRotations(doctorCode, rotationName) {
  const doctor = doctorProfiles[doctorCode];
  if (!doctor) {
    return { error: `Doctor ${doctorCode} not found` };
  }

  const oldRotation = doctor.rotations[rotationName];
  if (!oldRotation) {
    return {
      error: `Rotation ${rotationName} not found for doctor ${doctorCode}`,
    };
  }

  let newRotation = null;
  if (doctor.rotationSetting) {
    try {
      const generatedRotations = generateDoctorRotations(doctorCode);
      newRotation = generatedRotations[rotationName];
    } catch (error) {
      return { error: `Error generating rotations: ${error.message}` };
    }
  }

  return {
    doctorCode,
    rotationName,
    oldRotation,
    newRotation,
    hasNewRotation: !!newRotation,
    identical: newRotation
      ? JSON.stringify(oldRotation) === JSON.stringify(newRotation)
      : false,
  };
}

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
    Monday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
    Tuesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
    Wednesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
    Thursday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
    Friday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
  },
};

export const docOld = {
  // emploi du temps  théorique hebdomadaire de chaque médecin pour chaque rotation (sur 3 ou 4 temps selon internistes ou infectiologues)
  YC: {
    M1: {
      //HTC
      Monday: {
        "9am-1pm": ["HTC1", "TeleCs"],
        "2pm-6pm": ["HTC1", "TeleCs"],
      },
      Tuesday: { "9am-1pm": ["HTC1"], "2pm-6pm": ["HTC1", "Cs"] },
      Wednesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Thursday: { "9am-1pm": ["HTC1"], "2pm-6pm": ["HTC1", "Cs"] },
      Friday: { "9am-1pm": ["HTC1"], "2pm-6pm": ["HTC1"] },
    },
    M2: {
      //ambulatoire avec 1 sem off
      S1: {
        Monday: {
          "9am-1pm": ["TP"],
          "2pm-6pm": ["TP"],
        },
        Tuesday: {
          "9am-1pm": ["TP"],
          "2pm-6pm": ["TP"],
        },
        Wednesday: {
          "9am-1pm": ["TP"],
          "2pm-6pm": ["TP"],
        },
        Thursday: {
          "9am-1pm": ["TP"],
          "2pm-6pm": ["TP"],
        },
        Friday: {
          "9am-1pm": ["TP"],
          "2pm-6pm": ["TP"],
        },
      },

      S2: {
        Monday: {
          "9am-1pm": ["TP"],
          "2pm-6pm": ["TP"],
        },
        Tuesday: {
          "9am-1pm": ["TeleCs"],
          "2pm-6pm": ["Cs"],
        },
        Wednesday: {
          "9am-1pm": ["TP"],
          "2pm-6pm": ["TP"],
        },
        Thursday: {
          "9am-1pm": ["TeleCs"],
          "2pm-6pm": ["Cs"],
        },
        Friday: {
          "9am-1pm": ["AMI"],
          "2pm-6pm": ["AMI"],
        },
      },
      S3_S4: {
        Monday: {
          "9am-1pm": ["TP"],
          "2pm-6pm": ["TP"],
        },
        Tuesday: {
          "9am-1pm": ["TeleCs"],
          "2pm-6pm": ["Cs"],
        },
        Wednesday: {
          "9am-1pm": ["TP"],
          "2pm-6pm": ["TP"],
        },
        Thursday: {
          "9am-1pm": ["HTC1", "TeleCs"],
          "2pm-6pm": ["HTC1", "Cs"],
        },
        Friday: {
          "9am-1pm": ["AMI"],
          "2pm-6pm": ["AMI"],
        },
      },
    },
    M3: {
      //ambulatoire
      S1_S2: {
        Monday: {
          "9am-1pm": ["TP"],
          "2pm-6pm": ["TP"],
        },
        Tuesday: {
          "9am-1pm": ["TeleCs"],
          "2pm-6pm": ["Cs"],
        },
        Wednesday: {
          "9am-1pm": ["TP"],
          "2pm-6pm": ["TP"],
        },
        Thursday: {
          "9am-1pm": ["TeleCs"],
          "2pm-6pm": ["Cs"],
        },
        Friday: {
          "9am-1pm": ["AMI"],
          "2pm-6pm": ["AMI"],
        },
      },
      S3_S4: {
        Monday: {
          "9am-1pm": ["HTC1"],
          "2pm-6pm": ["HTC1"],
        },
        Tuesday: {
          "9am-1pm": ["TeleCs"],
          "2pm-6pm": ["Cs"],
        },
        Wednesday: {
          "9am-1pm": ["TP"],
          "2pm-6pm": ["TP"],
        },
        Thursday: {
          "9am-1pm": ["TeleCs"],
          "2pm-6pm": ["Cs"],
        },
        Friday: {
          "9am-1pm": ["TP"],
          "2pm-6pm": ["TP"],
        },
      },
    },
    M4: {
      //HTC
      Monday: {
        "9am-1pm": ["HTC1", "TeleCs"],
        "2pm-6pm": ["HTC1", "TeleCs"],
      },
      Tuesday: { "9am-1pm": ["HTC1"], "2pm-6pm": ["HTC1", "Cs"] },
      Wednesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Thursday: { "9am-1pm": ["HTC1"], "2pm-6pm": ["HTC1", "Cs"] },
      Friday: { "9am-1pm": ["HTC1"], "2pm-6pm": ["HTC1"] },
    },
    M5: {
      //ambulatoire avec 1 sem off
      S1: {
        //semaine off
        Monday: {
          "9am-1pm": ["TP"],
          "2pm-6pm": ["TP"],
        },
        Tuesday: {
          "9am-1pm": ["TP"],
          "2pm-6pm": ["TP"],
        },
        Wednesday: {
          "9am-1pm": ["TP"],
          "2pm-6pm": ["TP"],
        },
        Thursday: {
          "9am-1pm": ["TP"],
          "2pm-6pm": ["TP"],
        },
        Friday: {
          "9am-1pm": ["TP"],
          "2pm-6pm": ["TP"],
        },
      },

      S2: {
        Monday: {
          "9am-1pm": ["TP"],
          "2pm-6pm": ["TP"],
        },
        Tuesday: {
          "9am-1pm": ["TeleCs"],
          "2pm-6pm": ["Cs"],
        },
        Wednesday: {
          "9am-1pm": ["TP"],
          "2pm-6pm": ["TP"],
        },
        Thursday: {
          "9am-1pm": ["TeleCs"],
          "2pm-6pm": ["Cs"],
        },
        Friday: {
          "9am-1pm": ["AMI"],
          "2pm-6pm": ["AMI"],
        },
      },
      S3_S4: {
        Monday: {
          "9am-1pm": ["HTC1"],
          "2pm-6pm": ["HTC1"],
        },
        Tuesday: {
          "9am-1pm": ["TeleCs"],
          "2pm-6pm": ["Cs"],
        },
        Wednesday: {
          "9am-1pm": ["TP"],
          "2pm-6pm": ["TP"],
        },
        Thursday: {
          "9am-1pm": ["TeleCs"],
          "2pm-6pm": ["Cs"],
        },
        Friday: {
          "9am-1pm": ["TP"],
          "2pm-6pm": ["TP"],
        },
      },
    },
    M6: {
      //ambulatoire
      S1_S2: {
        Monday: {
          "9am-1pm": ["TP"],
          "2pm-6pm": ["TP"],
        },
        Tuesday: {
          "9am-1pm": ["TeleCs"],
          "2pm-6pm": ["Cs"],
        },
        Wednesday: {
          "9am-1pm": ["TP"],
          "2pm-6pm": ["TP"],
        },
        Thursday: {
          "9am-1pm": ["TeleCs"],
          "2pm-6pm": ["Cs"],
        },
        Friday: {
          "9am-1pm": ["AMI"],
          "2pm-6pm": ["AMI"],
        },
      },
      S3_S4: {
        Monday: {
          "9am-1pm": ["TP"],
          "2pm-6pm": ["TP"],
        },
        Tuesday: {
          "9am-1pm": ["TeleCs"],
          "2pm-6pm": ["Cs"],
        },
        Wednesday: {
          "9am-1pm": ["TP"],
          "2pm-6pm": ["TP"],
        },
        Thursday: {
          "9am-1pm": ["HTC1", "TeleCs"],
          "2pm-6pm": ["HTC1", "Cs"],
        },
        Friday: {
          "9am-1pm": ["AMI"],
          "2pm-6pm": ["AMI"],
        },
      },
    },
  },
  FL: {
    M1: {
      //Mois HDJ
      S1_S2: {
        Monday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Cs"] },
        Tuesday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Cs"] },
        Wednesday: { "9am-1pm": ["Cs"], "2pm-6pm": ["TeleCs"] },
        Thursday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
        Friday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
      },
      S3_S4: {
        Monday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
        Tuesday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["Cs"] },
        Wednesday: { "9am-1pm": ["Cs"], "2pm-6pm": ["TeleCs"] },
        Thursday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
        Friday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
      },
    },

    M2: {
      //mois HTC
      Monday: { "9am-1pm": ["HTC1"], "2pm-6pm": ["HTC1"] },
      Tuesday: { "9am-1pm": ["HTC1"], "2pm-6pm": ["HTC1", "Cs"] },
      Wednesday: { "9am-1pm": ["HTC1", "Cs"], "2pm-6pm": ["HTC1"] },
      Thursday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Friday: { "9am-1pm": ["HTC1"], "2pm-6pm": ["HTC1"] },
    },
    M3: {
      //Mois HDJ idem M1 pour FL
      S1_S2: {
        Monday: { "9am-1pm": ["HTC1", "TeleCs"], "2pm-6pm": ["HTC1", "Cs"] },
        Tuesday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Cs"] },
        Wednesday: { "9am-1pm": ["Cs"], "2pm-6pm": ["TeleCs"] },
        Thursday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
        Friday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
      },
      S3_S4: {
        Monday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
        Tuesday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["Cs"] },
        Wednesday: { "9am-1pm": ["Cs"], "2pm-6pm": ["TeleCs"] },
        Thursday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
        Friday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
      },
    },
    M4: {
      //Mois Ambulatoire
      Monday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Cs"] },
      Tuesday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Cs"] },
      Wednesday: { "9am-1pm": ["HTC1", "Cs"], "2pm-6pm": ["HTC1", "TeleCs"] },
      Thursday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Friday: { "9am-1pm": ["Cs"], "2pm-6pm": ["TeleCs"] },
    },
    M5: {
      //Mois HDJ
      S1_S2: {
        Monday: { "9am-1pm": ["HTC1", "TeleCs"], "2pm-6pm": ["HTC1", "Cs"] },
        Tuesday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Cs"] },
        Wednesday: { "9am-1pm": ["Cs"], "2pm-6pm": ["TeleCs"] },
        Thursday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
        Friday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
      },
      S3_S4: {
        Monday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
        Tuesday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["Cs"] },
        Wednesday: { "9am-1pm": ["Cs"], "2pm-6pm": ["TeleCs"] },
        Thursday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
        Friday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
      },
    },
    M6: {
      //mois HTC
      Monday: { "9am-1pm": ["HTC1"], "2pm-6pm": ["HTC1"] },
      Tuesday: { "9am-1pm": ["HTC1"], "2pm-6pm": ["HTC1", "Cs"] },
      Wednesday: { "9am-1pm": ["HTC1", "Cs"], "2pm-6pm": ["HTC1"] },
      Thursday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Friday: { "9am-1pm": ["HTC1"], "2pm-6pm": ["HTC1"] },
    },
  },
  CL: {
    M1: {
      //mois Ambu
      Monday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Tuesday: { "9am-1pm": ["AMI"], "2pm-6pm": ["Cs"] },
      Wednesday: { "9am-1pm": ["HTC1", "AMI"], "2pm-6pm": ["HTC1", "TeleCs"] },
      Thursday: { "9am-1pm": ["AMI"], "2pm-6pm": ["Cs"] },
      Friday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["AMI"] },
    },
    M2: {
      //mois HDJ
      S1_S2: {
        //DL +
        Monday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
        Tuesday: { "9am-1pm": ["AMI"], "2pm-6pm": ["Cs"] },
        Wednesday: { "9am-1pm": ["AMI"], "2pm-6pm": ["TeleCs"] },
        Thursday: { "9am-1pm": ["HTC1", "AMI"], "2pm-6pm": ["HTC1", "Cs"] },
        Friday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
      },
      S3_S4: {
        //DL -
        Monday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
        Tuesday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["Cs"] },
        Wednesday: { "9am-1pm": ["AMI"], "2pm-6pm": ["TeleCs"] },
        Thursday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["Cs"] },
        Friday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
      },
    },
    M3: {
      // mois HTC
      Monday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Tuesday: { "9am-1pm": ["HTC1"], "2pm-6pm": ["HTC1", "Cs"] },
      Wednesday: { "9am-1pm": ["HTC1", "AMI"], "2pm-6pm": ["HTC1", "TeleCs"] },
      Thursday: { "9am-1pm": ["HTC1", "AMI"], "2pm-6pm": ["HTC1", "Cs"] },
      Friday: { "9am-1pm": ["HTC1"], "2pm-6pm": ["HTC1"] },
    },
    M4: {
      //mois HDJ
      S1_S2: {
        //DL +
        Monday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
        Tuesday: { "9am-1pm": ["AMI"], "2pm-6pm": ["Cs"] },
        Wednesday: { "9am-1pm": ["AMI"], "2pm-6pm": ["TeleCs"] },
        Thursday: { "9am-1pm": ["AMI"], "2pm-6pm": ["Cs"] },
        Friday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
      },
      S3_S4: {
        //DL -
        Monday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
        Tuesday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["Cs"] },
        Wednesday: { "9am-1pm": ["AMI"], "2pm-6pm": ["TeleCs"] },
        Thursday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["Cs"] },
        Friday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
      },
    },
    M5: {
      // mois HTC
      Monday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Tuesday: { "9am-1pm": ["HTC1"], "2pm-6pm": ["HTC1", "Cs"] },
      Wednesday: { "9am-1pm": ["HTC1", "AMI"], "2pm-6pm": ["HTC1", "TeleCs"] },
      Thursday: { "9am-1pm": ["HTC1", "AMI"], "2pm-6pm": ["HTC1", "Cs"] },
      Friday: { "9am-1pm": ["HTC1"], "2pm-6pm": ["HTC1"] },
    },
    M6: {
      //mois HDJ
      S1_S2: {
        //DL +
        Monday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
        Tuesday: { "9am-1pm": ["AMI"], "2pm-6pm": ["Cs"] },
        Wednesday: { "9am-1pm": ["AMI"], "2pm-6pm": ["TeleCs"] },
        Thursday: { "9am-1pm": ["HTC1", "AMI"], "2pm-6pm": ["HTC1", "Cs"] },
        Friday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
      },
      S3_S4: {
        //DL -
        Monday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
        Tuesday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["Cs"] },
        Wednesday: { "9am-1pm": ["AMI"], "2pm-6pm": ["TeleCs"] },
        Thursday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["Cs"] },
        Friday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
      },
    },
  },
  DL: {
    M1: {
      S1_S2: {
        //DL HDJ
        Monday: { "9am-1pm": ["Cs"], "2pm-6pm": ["Cs"] },
        Tuesday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
        Wednesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
        Thursday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
        Friday: { "9am-1pm": ["Cs"], "2pm-6pm": ["TeleCs"] },
      },
      S3_S4: {
        //DL MPO
        Monday: { "9am-1pm": ["MPO"], "2pm-6pm": ["MPO"] },
        Tuesday: { "9am-1pm": ["MPO"], "2pm-6pm": ["MPO"] },
        Wednesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
        Thursday: { "9am-1pm": ["MPO"], "2pm-6pm": ["MPO"] },
        Friday: { "9am-1pm": ["MPO"], "2pm-6pm": ["MPO"] },
      },
    },
    M2: {
      S1_S2: {
        //DL HDJ
        Monday: { "9am-1pm": ["Cs"], "2pm-6pm": ["Cs"] },
        Tuesday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
        Wednesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
        Thursday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
        Friday: { "9am-1pm": ["Cs"], "2pm-6pm": ["TeleCs"] },
      },
      S3_S4: {
        //DL MPO
        Monday: { "9am-1pm": ["MPO"], "2pm-6pm": ["MPO"] },
        Tuesday: { "9am-1pm": ["MPO"], "2pm-6pm": ["MPO"] },
        Wednesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
        Thursday: { "9am-1pm": ["MPO"], "2pm-6pm": ["MPO"] },
        Friday: { "9am-1pm": ["MPO"], "2pm-6pm": ["MPO"] },
      },
    },
    M3: {
      S1_S2: {
        //DL HDJ
        Monday: { "9am-1pm": ["Cs"], "2pm-6pm": ["Cs"] },
        Tuesday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
        Wednesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
        Thursday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
        Friday: { "9am-1pm": ["Cs"], "2pm-6pm": ["TeleCs"] },
      },
      S3_S4: {
        //DL MPO
        Monday: { "9am-1pm": ["MPO"], "2pm-6pm": ["MPO"] },
        Tuesday: { "9am-1pm": ["MPO"], "2pm-6pm": ["MPO"] },
        Wednesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
        Thursday: { "9am-1pm": ["MPO"], "2pm-6pm": ["MPO"] },
        Friday: { "9am-1pm": ["MPO"], "2pm-6pm": ["MPO"] },
      },
    },
    M4: {
      S1_S2: {
        //DL HDJ
        Monday: { "9am-1pm": ["Cs"], "2pm-6pm": ["Cs"] },
        Tuesday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
        Wednesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
        Thursday: { "9am-1pm": ["HDJ"], "2pm-6pm": ["HDJ"] },
        Friday: { "9am-1pm": ["Cs"], "2pm-6pm": ["TeleCs"] },
      },
      S3_S4: {
        //DL MPO
        Monday: { "9am-1pm": ["MPO"], "2pm-6pm": ["MPO"] },
        Tuesday: { "9am-1pm": ["MPO"], "2pm-6pm": ["MPO"] },
        Wednesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
        Thursday: { "9am-1pm": ["MPO"], "2pm-6pm": ["MPO"] },
        Friday: { "9am-1pm": ["MPO"], "2pm-6pm": ["MPO"] },
      },
    },
  },
  GC: {
    M1: {
      //HTC2
      Monday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Tuesday: { "9am-1pm": ["HTC2"], "2pm-6pm": ["HTC2", "Cs"] },
      Wednesday: { "9am-1pm": ["HTC2", "Cs"], "2pm-6pm": ["HTC2", "EMIT"] },
      Thursday: { "9am-1pm": ["HTC2"], "2pm-6pm": ["HTC2", "TeleCs"] },
      Friday: { "9am-1pm": ["HTC2"], "2pm-6pm": ["HTC2"] },
    },
    M2: {
      //EMATIT
      Monday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Tuesday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Cs"] },
      Wednesday: { "9am-1pm": ["Cs"], "2pm-6pm": ["EMIT"] },
      Thursday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["EMATIT"] },
      Friday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["EMATIT"] },
    },
    M3: {
      //EMIT
      Monday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Tuesday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["Cs"] },
      Wednesday: { "9am-1pm": ["HTC2", "Cs"], "2pm-6pm": ["HTC2", "EMIT"] },
      Thursday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["EMIT"] },
      Friday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
    },
    M4: {
      //EMATIT
      Monday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Tuesday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Cs"] },
      Wednesday: { "9am-1pm": ["Cs"], "2pm-6pm": ["EMIT"] },
      Thursday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["EMATIT"] },
      Friday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["EMATIT"] },
    },
  },
  MDLC: {
    M1: {
      //EMIT
      Monday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Cs"] },
      Tuesday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
      Wednesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Thursday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["Cs"] },
      Friday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
    },
    M2: {
      //EMIT+AMI
      Monday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Cs"] },
      Tuesday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
      Wednesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Thursday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["Cs"] },
      Friday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["AMI"] },
    },
    M3: {
      //HTC2
      Monday: { "9am-1pm": ["HTC2", "TeleCs"], "2pm-6pm": ["HTC2", "Cs"] },
      Tuesday: { "9am-1pm": ["HTC2"], "2pm-6pm": ["HTC2"] },
      Wednesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Thursday: { "9am-1pm": ["HTC2"], "2pm-6pm": ["HTC2", "Cs"] },
      Friday: { "9am-1pm": ["HTC2"], "2pm-6pm": ["HTC2"] },
    },
    M4: {
      //EMIT
      Monday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Cs"] },
      Tuesday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
      Wednesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Thursday: { "9am-1pm": ["HTC2"], "2pm-6pm": ["HTC2", "Cs"] },
      Friday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
    },
  },
  MG: {
    M1: {
      //EMATIT
      Monday: { "9am-1pm": ["HTC2", "EMATIT"], "2pm-6pm": ["HTC2", "EMATIT"] },
      Tuesday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Cs"] },
      Wednesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Thursday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["Cs"] },
      Friday: { "9am-1pm": ["AMI"], "2pm-6pm": ["EMATIT"] },
    },
    M2: {
      //HTC2
      Monday: { "9am-1pm": ["HTC2", "TeleCs"], "2pm-6pm": ["HTC2"] },
      Tuesday: { "9am-1pm": ["HTC2"], "2pm-6pm": ["HTC2", "Cs"] },
      Wednesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Thursday: { "9am-1pm": ["HTC2"], "2pm-6pm": ["HTC2", "Cs"] },
      Friday: { "9am-1pm": ["HTC2"], "2pm-6pm": ["HTC2"] },
    },
    M3: {
      //EMATIT + AMI
      Monday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["EMATIT"] },
      Tuesday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Cs"] },
      Wednesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Thursday: { "9am-1pm": ["AMI"], "2pm-6pm": ["Cs"] },
      Friday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["EMATIT"] },
    },
    M4: {
      //EMATIT + AMI (encore?)
      Monday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["EMATIT"] },
      Tuesday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Cs"] },
      Wednesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Thursday: { "9am-1pm": ["AMI"], "2pm-6pm": ["Cs"] },
      Friday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["EMATIT"] },
    },
  },
  RNV: {
    M1: {
      //EMATIT
      Monday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Cs"] },
      Tuesday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["EMIT"] },
      Wednesday: { "9am-1pm": ["EMATIT", "EMIT"], "2pm-6pm": ["Cs"] },
      Thursday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Friday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["EMATIT"] },
    },
    M2: {
      //EMATIT
      Monday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["Cs"] },
      Tuesday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["EMATIT"] },
      Wednesday: {
        "9am-1pm": ["HTC2", "EMATIT", "EMIT"],
        "2pm-6pm": ["HTC2", "Cs"],
      },
      Thursday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Friday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["EMIT"] },
    },
    M3: {
      //EMATIT = M1
      Monday: { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Cs"] },
      Tuesday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["EMIT"] },
      Wednesday: { "9am-1pm": ["EMATIT", "EMIT"], "2pm-6pm": ["Cs"] },
      Thursday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Friday: { "9am-1pm": ["EMATIT"], "2pm-6pm": ["EMATIT"] },
    },
    M4: {
      //HTC2
      Monday: { "9am-1pm": ["HTC2"], "2pm-6pm": ["HTC2", "Cs"] },
      Tuesday: { "9am-1pm": ["HTC2"], "2pm-6pm": ["HTC2"] },
      Wednesday: {
        "9am-1pm": ["HTC2", "TeleCs", "EMIT"],
        "2pm-6pm": ["HTC2", "Cs"],
      },
      Thursday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
      Friday: { "9am-1pm": ["HTC2"], "2pm-6pm": ["HTC2"] },
    },
  },
  BM: {
    Monday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
    Tuesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
    Wednesday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
    Thursday: { "9am-1pm": ["EMIT"], "2pm-6pm": ["EMIT"] },
    Friday: { "9am-1pm": ["TP"], "2pm-6pm": ["TP"] },
  },
};
