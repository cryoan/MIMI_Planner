import React, { useContext, useMemo, useState } from "react";
import { Radar } from "react-chartjs-2";
import { ScheduleContext } from "./ScheduleContext";
import { docActivities } from "./doctorSchedules.js";
import "./Calendar.css";

const ScheduleEvaluationRadar = () => {
  const { customScheduleData, expectedActivities, selectedRotationCycle, doctorProfiles } =
    useContext(ScheduleContext);
  const [showDetails, setShowDetails] = useState(false);

  // ========== UTILITY FUNCTIONS ==========

  // Calculate Coefficient of Variation (CV) for equity metrics
  const calculateCV = (values) => {
    if (!values || values.length === 0) return 100; // No data = worst equity

    const validValues = values.filter((v) => v !== null && v !== undefined);
    if (validValues.length === 0) return 100;
    if (validValues.length === 1) return 0; // Single value = perfect equity

    const mean = validValues.reduce((a, b) => a + b, 0) / validValues.length;

    // If mean is 0 (all zeros for overload/TeleCs), that's perfect equity
    if (mean === 0) return 0;

    const variance =
      validValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      validValues.length;
    const stdDev = Math.sqrt(variance);
    const cv = (stdDev / mean) * 100;

    return cv;
  };

  // Normalize CV to 0-100 score (100 = perfect equity, 0 = worst equity)
  const normalizeCVToScore = (cv) => {
    // Lower CV = better equity = higher score
    // Scale factor: 2 (CV of 50% = score of 0)
    return Math.max(0, 100 - Math.min(cv * 2, 100));
  };

  // ========== METRIC CALCULATIONS ==========

  const metrics = useMemo(() => {
    if (!customScheduleData || !customScheduleData.periodicSchedule) {
      return null;
    }

    const periodicSchedule = customScheduleData.periodicSchedule;

    // 1. WORKLOAD EQUITY (CV of total hours per doctor)
    // Initialize ALL doctors with 0 workload first
    const doctorWorkload = {};
    Object.values(periodicSchedule).forEach((periodData) => {
      if (periodData.schedule) {
        Object.keys(periodData.schedule).forEach((doctor) => {
          if (!doctorWorkload[doctor]) doctorWorkload[doctor] = 0;
        });
      }
    });

    // Then calculate workload
    Object.values(periodicSchedule).forEach((periodData) => {
      if (periodData.schedule) {
        Object.entries(periodData.schedule).forEach(([doctor, schedule]) => {
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

    const workloadValues = Object.values(doctorWorkload);
    const workloadCV = calculateCV(workloadValues);
    const workloadScore = normalizeCVToScore(workloadCV);

    // 2. NON-OVERLOAD COVERAGE (% of non-overloaded slots)
    // Count total slots and non-overloaded slots across all doctors and periods
    let totalSlots = 0;
    let nonOverloadedSlots = 0;
    const doctorOverloadDetails = {}; // Track overloaded slots per doctor for display

    Object.values(periodicSchedule).forEach((periodData) => {
      if (periodData.schedule) {
        Object.entries(periodData.schedule).forEach(([doctor, schedule]) => {
          if (!doctorOverloadDetails[doctor]) {
            doctorOverloadDetails[doctor] = { total: 0, overloaded: 0 };
          }

          Object.entries(schedule).forEach(([day, daySchedule]) => {
            Object.entries(daySchedule).forEach(([slot, activities]) => {
              if (Array.isArray(activities) && !activities.includes("TP")) {
                totalSlots++;
                doctorOverloadDetails[doctor].total++;

                const totalDuration = activities.reduce((sum, activity) => {
                  const activityData = docActivities[activity];
                  return sum + (activityData?.duration || 1);
                }, 0);

                const MAX_SLOT_CAPACITY = 4;
                if (totalDuration <= MAX_SLOT_CAPACITY) {
                  nonOverloadedSlots++;
                } else {
                  doctorOverloadDetails[doctor].overloaded++;
                }
              }
            });
          });
        });
      }
    });

    const nonOverloadCoverage = totalSlots > 0
      ? (nonOverloadedSlots / totalSlots) * 100
      : 100;

    // Debug logging for non-overload coverage
    console.log("🔍 Non-Overload Coverage Debug:", {
      totalSlots,
      nonOverloadedSlots,
      nonOverloadCoverage,
      doctorOverloadDetails,
    });

    // 3-5. ACTIVITY COVERAGE (EMIT, EMATIT, AMI)
    const calculateActivityCoverage = (activityName) => {
      const numPeriods = Object.keys(periodicSchedule).length;

      // Count required slots per period from expectedActivities
      let requiredPerPeriod = 0;
      if (expectedActivities) {
        Object.values(expectedActivities).forEach((daySchedule) => {
          Object.values(daySchedule).forEach((slotActivities) => {
            if (Array.isArray(slotActivities)) {
              requiredPerPeriod += slotActivities.filter(
                (act) => act === activityName
              ).length;
            }
          });
        });
      }

      const totalRequired = requiredPerPeriod * numPeriods;

      // Count MISSING activities from periodicSchedule validation
      let totalMissing = 0;
      const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      const slots = ["9am-1pm", "2pm-6pm"];

      Object.values(periodicSchedule).forEach((periodData) => {
        if (periodData.schedule) {
          days.forEach((day) => {
            slots.forEach((slot) => {
              const assigned = [];
              Object.values(periodData.schedule).forEach((doctorSchedule) => {
                if (doctorSchedule[day]?.[slot]) {
                  assigned.push(...doctorSchedule[day][slot]);
                }
              });

              const expected = expectedActivities?.[day]?.[slot] || [];
              const missing = expected.filter(
                (act) => act === activityName && !assigned.includes(act)
              );
              totalMissing += missing.length;
            });
          });
        }
      });

      const totalAssigned = totalRequired - totalMissing;
      const coverage =
        totalRequired > 0
          ? Math.min((totalAssigned / totalRequired) * 100, 100)
          : 100;

      return coverage;
    };

    const emitCoverage = calculateActivityCoverage("EMIT");
    const ematitCoverage = calculateActivityCoverage("EMATIT");
    const amiCoverage = calculateActivityCoverage("AMI");

    // 6. TELECS COVERAGE (% of required TeleCs assigned)
    const numPeriods = Object.keys(periodicSchedule).length;

    // METHOD 1: Calculate from weeklyNeeds and direct schedule counting
    let method1_totalNeeded = 0;
    if (doctorProfiles) {
      Object.entries(doctorProfiles).forEach(([doctorCode, profile]) => {
        if (profile.weeklyNeeds?.TeleCs?.count) {
          method1_totalNeeded += profile.weeklyNeeds.TeleCs.count * numPeriods;
        }
      });
    }

    let method1_totalAssigned = 0;
    Object.values(periodicSchedule).forEach((periodData) => {
      if (periodData.schedule) {
        Object.values(periodData.schedule).forEach((doctorSchedule) => {
          Object.values(doctorSchedule).forEach((daySchedule) => {
            Object.values(daySchedule).forEach((activities) => {
              if (Array.isArray(activities)) {
                const telecsCount = activities.filter(
                  (act) => act === "TeleCs"
                ).length;
                method1_totalAssigned += telecsCount;
              }
            });
          });
        });
      }
    });

    // METHOD 2: Use teleCsResolution data for missing count
    let method2_totalNeeded = 0;
    let method2_totalAssigned = 0;
    let method2_totalMissing = 0;

    Object.values(periodicSchedule).forEach((periodData) => {
      if (periodData.teleCsResolution?.teleCsAssignments) {
        Object.values(periodData.teleCsResolution.teleCsAssignments).forEach((assignment) => {
          method2_totalNeeded += assignment.needed || 0;
          method2_totalAssigned += (assignment.totalAssigned || assignment.assigned || 0);
          method2_totalMissing += assignment.missing || 0;
        });
      }
    });

    // HYBRID APPROACH: Denominator from Method 1, Missing from Method 2
    // - Total needed: from doctor profile requirements (Method 1) - this is the fixed requirement
    // - Missing count: from teleCsResolution algorithm (Method 2) - this is authoritative
    // - Assigned: calculated as needed - missing
    const totalTelecsNeeded = method1_totalNeeded;
    const totalTeleCsMissing = method2_totalMissing;
    const totalTelecsAssigned = totalTelecsNeeded - totalTeleCsMissing;

    const telecsCoverage =
      totalTelecsNeeded > 0
        ? Math.min((totalTelecsAssigned / totalTelecsNeeded) * 100, 100)
        : 100;

    // Debug logging for TeleCs coverage
    console.log("🔍 TeleCs Coverage Debug - Method Comparison:", {
      method1_directCounting: {
        needed: method1_totalNeeded,
        assigned: method1_totalAssigned,
        missing: method1_totalNeeded - method1_totalAssigned,
      },
      method2_teleCsResolution: {
        needed: method2_totalNeeded,
        assigned: method2_totalAssigned,
        missing: method2_totalMissing,
      },
      HYBRID_APPROACH_USED: {
        needed: totalTelecsNeeded,
        assigned: totalTelecsAssigned,
        missing: totalTeleCsMissing,
        note: "Denominator from Method 1 (weeklyNeeds), Missing from Method 2 (teleCsResolution)",
      },
      finalCoverage: telecsCoverage,
    });

    return {
      workloadScore,
      workloadCV,
      workloadValues: doctorWorkload,
      nonOverloadCoverage,
      totalSlots,
      nonOverloadedSlots,
      doctorOverloadDetails,
      emitCoverage,
      ematitCoverage,
      amiCoverage,
      telecsCoverage,
      totalTelecsNeeded,
      totalTelecsAssigned,
      totalTeleCsMissing,
    };
  }, [customScheduleData, expectedActivities]);

  // ========== CHART CONFIGURATION ==========

  if (!metrics) {
    return (
      <div className="evaluation-radar-container">
        <p>Loading evaluation metrics...</p>
      </div>
    );
  }

  const radarData = {
    labels: [
      "Workload Equity",
      "Non-Overload Coverage",
      "EMIT Coverage",
      "EMATIT Coverage",
      "AMI Coverage",
      "TeleCs Coverage",
    ],
    datasets: [
      {
        label: selectedRotationCycle || "Current Schedule",
        data: [
          metrics.workloadScore,
          metrics.nonOverloadCoverage,
          metrics.emitCoverage,
          metrics.ematitCoverage,
          metrics.amiCoverage,
          metrics.telecsCoverage,
        ],
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        pointBackgroundColor: "rgba(54, 162, 235, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
      },
    ],
  };

  const radarOptions = {
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        min: 0,
        ticks: {
          stepSize: 20,
          callback: function (value) {
            return value;
          },
        },
        pointLabels: {
          font: {
            size: 12,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      title: {
        display: true,
        text: "Schedule Evaluation Metrics (0-100, higher is better)",
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.r.toFixed(1)}`;
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: true,
  };

  // ========== RENDER ==========

  return (
    <div className="evaluation-radar-container" style={{ marginBottom: "20px" }}>
      <div
        style={{
          backgroundColor: "#f9f9f9",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #ddd",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <Radar data={radarData} options={radarOptions} />
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          {showDetails ? "🔼 Hide Details" : "🔽 Show Metric Details"}
        </button>

        {showDetails && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: "white",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          >
            <h4 style={{ marginTop: 0 }}>📊 Detailed Metrics Breakdown</h4>

            <div style={{ marginBottom: "15px" }}>
              <strong>1. Workload Equity (Score: {metrics.workloadScore.toFixed(1)})</strong>
              <p style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>
                Coefficient of Variation: {metrics.workloadCV.toFixed(1)}% (lower
                is better)
              </p>
              <div style={{ fontSize: "13px", color: "#444" }}>
                {Object.entries(metrics.workloadValues)
                  .sort((a, b) => b[1] - a[1])
                  .map(([doctor, hours]) => (
                    <div key={doctor}>
                      • {doctor}: {hours}h
                    </div>
                  ))}
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <strong>2. Non-Overload Coverage (Score: {metrics.nonOverloadCoverage.toFixed(1)}%)</strong>
              <p style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>
                {metrics.nonOverloadedSlots} / {metrics.totalSlots} slots within capacity
              </p>
              <div style={{ fontSize: "13px", color: "#444" }}>
                {Object.entries(metrics.doctorOverloadDetails)
                  .filter(([_, details]) => details.overloaded > 0)
                  .sort((a, b) => b[1].overloaded - a[1].overloaded)
                  .map(([doctor, details]) => (
                    <div key={doctor}>
                      • {doctor}: {details.overloaded} / {details.total} slots overloaded
                    </div>
                  ))}
                {metrics.nonOverloadedSlots === metrics.totalSlots && (
                  <div style={{ color: "#4CAF50" }}>✅ All slots within capacity</div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <strong>3. Activity Coverage</strong>
              <div style={{ fontSize: "13px", color: "#444", marginTop: "5px" }}>
                • EMIT: {metrics.emitCoverage.toFixed(1)}%
                <br />
                • EMATIT: {metrics.ematitCoverage.toFixed(1)}%
                <br />• AMI: {metrics.amiCoverage.toFixed(1)}%
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <strong>4. TeleCs Coverage (Score: {metrics.telecsCoverage.toFixed(1)}%)</strong>
              <p style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>
                {metrics.totalTelecsAssigned} assigned / {metrics.totalTelecsNeeded} required
              </p>
              {metrics.totalTeleCsMissing > 0 && (
                <div style={{ fontSize: "13px", color: "#d32f2f" }}>
                  ⚠️ {metrics.totalTeleCsMissing} TeleCs missing
                </div>
              )}
              {metrics.totalTeleCsMissing === 0 && (
                <div style={{ fontSize: "13px", color: "#4CAF50" }}>
                  ✅ All TeleCs requirements met
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: "20px",
                padding: "10px",
                backgroundColor: "#e3f2fd",
                borderRadius: "4px",
              }}
            >
              <strong style={{ fontSize: "13px" }}>ℹ️ How to interpret scores:</strong>
              <ul style={{ fontSize: "12px", margin: "5px 0", paddingLeft: "20px" }}>
                <li>
                  <strong>Workload Equity</strong>: 100 = perfect equality in total hours, 0 = high variance
                </li>
                <li>
                  <strong>Non-Overload Coverage</strong>: 100 = all slots within capacity (≤4h), 0 = all slots overloaded
                </li>
                <li>
                  <strong>Coverage metrics</strong> (EMIT, EMATIT, AMI, TeleCs): 100 = all
                  required slots/resources assigned
                </li>
                <li>
                  Higher scores are always better across all metrics
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleEvaluationRadar;
