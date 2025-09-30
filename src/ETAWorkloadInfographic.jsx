import React, { useContext } from "react";
import { computeRemainingRotationTasks } from "./doctorSchedules.js";
import { activityColors } from "./schedule.jsx";
import { ScheduleContext } from "./ScheduleContext";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

// Register Chart.js components
ChartJS.register(Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const ETAWorkloadInfographic = React.memo(() => {
  const {
    doctorProfiles,
    wantedActivities,
    docActivities,
    recalculationTrigger,
  } = useContext(ScheduleContext);

  console.log("ETAWorkloadInfographic: Received updated data", {
    doctorsCount: Object.keys(doctorProfiles).length,
    activitiesCount: Object.keys(docActivities).length,
    recalculationTrigger,
  });

  // Helper function to get activity duration in hours
  const getActivityHours = (activity) => {
    if (activity === "Available") return 0;
    return docActivities[activity]?.duration || 4; // Default to 4 hours if not found
  };

  // Calculate TeleCs weekly needs from doctorProfiles
  const calculateTeleCsNeeds = () => {
    let totalTeleCsHours = 0;
    const teleCsPerDoctor = {};

    Object.entries(doctorProfiles).forEach(([doctorCode, doctor]) => {
      if (doctor.weeklyNeeds?.TeleCs) {
        const weeklyHours =
          doctor.weeklyNeeds.TeleCs.count *
          (docActivities.TeleCs?.duration || 3);
        teleCsPerDoctor[doctorCode] = weeklyHours;
        totalTeleCsHours += weeklyHours;
      }
    });

    return { totalTeleCsHours, teleCsPerDoctor };
  };

  // Calculate total activity distribution: backbone + HTC templates + TeleCs needs
  const calculateWorkloadDistribution = () => {
    const activityCounts = {};
    const activityHours = {};
    const doctors = Object.keys(doctorProfiles);
    const totalDoctors = doctors.length;
    const totalHalfDays = totalDoctors * 10; // Each doctor has 10 half-days per week
    const totalHours = totalDoctors * 40; // Each doctor has 40 hours per week (10 * 4 hours)

    // Calculate TeleCs needs
    const { totalTeleCsHours, teleCsPerDoctor } = calculateTeleCsNeeds();

    // Count all backbone activities across all doctors
    doctors.forEach((doctorCode) => {
      const doctor = doctorProfiles[doctorCode];
      if (doctor.backbone) {
        Object.values(doctor.backbone).forEach((daySchedule) => {
          Object.values(daySchedule).forEach((timeSlotActivities) => {
            timeSlotActivities.forEach((activity) => {
              activityCounts[activity] = (activityCounts[activity] || 0) + 1;
              const hours = getActivityHours(activity);
              activityHours[activity] = (activityHours[activity] || 0) + hours;
            });
          });
        });
      }
    });

    // Add remaining rotation tasks from templates (excludes activities already covered by backbones)
    // Process all templates from wantedActivities (includes Chefferie, excludes MPO)
    Object.keys(wantedActivities).forEach((templateName) => {
      try {
        const remainingTasks = computeRemainingRotationTasks(
          templateName,
          wantedActivities,
          doctorProfiles
        );

        // Count remaining activities and their hours (avoiding double-counting with backbone)
        Object.values(remainingTasks).forEach((daySchedule) => {
          Object.values(daySchedule).forEach((timeSlotActivities) => {
            timeSlotActivities.forEach((activity) => {
              activityCounts[activity] = (activityCounts[activity] || 0) + 1;
              const hours = getActivityHours(activity);
              activityHours[activity] = (activityHours[activity] || 0) + hours;
            });
          });
        });
      } catch (error) {
        console.warn(
          `Error calculating remaining tasks for ${templateName}:`,
          error
        );
      }
    });

    // Add TeleCs from weekly needs
    if (totalTeleCsHours > 0) {
      const teleCsSessions = totalTeleCsHours / docActivities.TeleCs.duration;
      activityCounts["TeleCs"] =
        (activityCounts["TeleCs"] || 0) + teleCsSessions;
      activityHours["TeleCs"] =
        (activityHours["TeleCs"] || 0) + totalTeleCsHours;
    }

    // Create slot-based array for backwards compatibility with existing statistics
    const activityArray = [];
    Object.entries(activityCounts).forEach(([activity, count]) => {
      for (let i = 0; i < count; i++) {
        activityArray.push(activity);
      }
    });

    // Fill remaining slots with "Available" for slot-based statistics
    const remainingSlots = totalHalfDays - activityArray.length;
    for (let i = 0; i < remainingSlots; i++) {
      activityArray.push("Available");
    }

    // Calculate total used hours
    const totalUsedHours = Object.values(activityHours).reduce(
      (sum, hours) => sum + hours,
      0
    );
    const remainingHours = totalHours - totalUsedHours;

    return {
      activityArray,
      totalDoctors,
      totalHalfDays,
      totalHours,
      activityCounts,
      activityHours,
      totalUsedHours,
      remainingHours,
      totalTeleCsHours,
      teleCsPerDoctor,
    };
  };

  // Calculate shared activity distribution using remaining rotation tasks
  const calculateSharedWorkloadDistribution = () => {
    const sharedActivityHours = {};
    const sharedActivityCounts = {};

    // Calculate TeleCs needs (same as before since TeleCs aren't backbone-assigned)
    const { totalTeleCsHours, teleCsPerDoctor } = calculateTeleCsNeeds();

    // Get remaining tasks for each template in wantedActivities
    Object.keys(wantedActivities).forEach((templateName) => {
      try {
        const remainingTasks = computeRemainingRotationTasks(templateName);

        // Count remaining activities and their hours
        Object.values(remainingTasks).forEach((daySchedule) => {
          Object.values(daySchedule).forEach((timeSlotActivities) => {
            timeSlotActivities.forEach((activity) => {
              sharedActivityCounts[activity] =
                (sharedActivityCounts[activity] || 0) + 1;
              const hours = getActivityHours(activity);
              sharedActivityHours[activity] =
                (sharedActivityHours[activity] || 0) + hours;
            });
          });
        });
      } catch (error) {
        console.warn(
          `Error calculating remaining tasks for ${templateName}:`,
          error
        );
      }
    });

    // Add TeleCs from weekly needs (unchanged)
    if (totalTeleCsHours > 0) {
      const teleCsSessions = totalTeleCsHours / docActivities.TeleCs.duration;
      sharedActivityCounts["TeleCs"] =
        (sharedActivityCounts["TeleCs"] || 0) + teleCsSessions;
      sharedActivityHours["TeleCs"] =
        (sharedActivityHours["TeleCs"] || 0) + totalTeleCsHours;
    }

    // Calculate total shared hours
    const totalSharedHours = Object.values(sharedActivityHours).reduce(
      (sum, hours) => sum + hours,
      0
    );

    return {
      sharedActivityCounts,
      sharedActivityHours,
      totalSharedHours,
      totalTeleCsHours,
      teleCsPerDoctor,
    };
  };

  const {
    activityArray,
    totalDoctors,
    totalHalfDays,
    totalHours,
    activityCounts,
    activityHours,
    totalUsedHours,
    remainingHours,
    totalTeleCsHours,
    teleCsPerDoctor,
  } = calculateWorkloadDistribution();

  const { sharedActivityCounts, sharedActivityHours, totalSharedHours } =
    calculateSharedWorkloadDistribution();

  // Helper function to generate different sorting orders
  // Available options: 'hours-desc', 'hours-asc', 'count-desc', 'count-asc', 'alphabetical', 'color-groups', 'custom'
  const getDefaultActivityOrder = (sortBy = "hours-desc") => {
    const activities = Object.keys(activityCounts).filter(
      (activity) => activity !== "Available"
    );

    switch (sortBy) {
      case "hours-desc":
        return activities.sort(
          (a, b) => (activityHours[b] || 0) - (activityHours[a] || 0)
        );

      case "hours-asc":
        return activities.sort(
          (a, b) => (activityHours[a] || 0) - (activityHours[b] || 0)
        );

      case "count-desc":
        return activities.sort(
          (a, b) => (activityCounts[b] || 0) - (activityCounts[a] || 0)
        );

      case "count-asc":
        return activities.sort(
          (a, b) => (activityCounts[a] || 0) - (activityCounts[b] || 0)
        );

      case "alphabetical":
        return activities.sort();

      case "color-groups":
        return activities.sort((a, b) => {
          const colorA = getActivityColor(a);
          const colorB = getActivityColor(b);
          if (colorA === colorB) {
            // If same color, sort by hours desc
            return (activityHours[b] || 0) - (activityHours[a] || 0);
          }
          return colorA.localeCompare(colorB);
        });

      case "custom":
        // Define your custom priority order here
        const customOrder = [
          "TP",
          "HTC1",
          "HTC1_visite",
          "HTC2_visite",
          "HTC2",
          "Cs",
          "TeleCs",
          "EMIT",
          "EMATIT",
          "Staff",
          "HDJ",
          "AMI",
        ];
        return activities.sort((a, b) => {
          const indexA = customOrder.indexOf(a);
          const indexB = customOrder.indexOf(b);
          if (indexA === -1 && indexB === -1) return a.localeCompare(b);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });

      default:
        return activities.sort(
          (a, b) => (activityHours[b] || 0) - (activityHours[a] || 0)
        );
    }
  };

  // State for sortable legend and drag operations
  const [activityOrder, setActivityOrder] = React.useState(() => {
    // Initialize with custom priority order
    return getDefaultActivityOrder("custom");
  });

  const [dragState, setDragState] = React.useState({
    draggedItem: null,
    draggedOverItem: null,
  });

  // State for collapsible sections
  const [isGridExpanded, setIsGridExpanded] = React.useState(false);
  const [isBarChartExpanded, setIsBarChartExpanded] = React.useState(false);
  const [isSharedChartExpanded, setIsSharedChartExpanded] = React.useState(false);

  // Create hourArray based on custom activity order
  const createCustomHourArray = () => {
    const hourArray = [];
    const overflowActivities = {};
    let totalRequiredHours = 0;

    // Calculate total required hours for all activities
    activityOrder.forEach((activity) => {
      const totalHours = activityHours[activity] || 0;
      totalRequiredHours += totalHours;
    });

    // Add each activity based on custom order and hour duration
    activityOrder.forEach((activity) => {
      const totalHours = activityHours[activity] || 0;
      for (let i = 0; i < totalHours; i++) {
        if (hourArray.length < totalHours) {
          hourArray.push(activity);
        } else {
          // Track overflow activities
          if (!overflowActivities[activity]) {
            overflowActivities[activity] = 0;
          }
          overflowActivities[activity]++;
        }
      }
    });

    // Calculate overflow statistics
    const totalOverflowHours = Math.max(0, totalRequiredHours - totalHours);
    const hasOverflow = totalOverflowHours > 0;

    // If we have overflow, extend the array to show all activities
    if (hasOverflow) {
      // Clear and rebuild array to show all activities
      hourArray.length = 0;
      activityOrder.forEach((activity) => {
        const totalHours = activityHours[activity] || 0;
        for (let i = 0; i < totalHours; i++) {
          hourArray.push(activity);
        }
      });
    } else {
      // Fill remaining hours with "Available" only if no overflow
      for (let i = 0; i < remainingHours; i++) {
        hourArray.push("Available");
      }
    }

    return {
      hourArray,
      overflowActivities,
      totalOverflowHours,
      hasOverflow,
      totalRequiredHours,
    };
  };

  const {
    hourArray,
    overflowActivities,
    totalOverflowHours,
    hasOverflow,
    totalRequiredHours,
  } = createCustomHourArray();

  // Get color for activity
  const getActivityColor = (activity) => {
    if (activity === "Available") {
      return "#f5f5f5"; // Light gray for available slots
    }
    return activityColors[activity] || "#ddd";
  };

  // Function to generate bar chart data for activity durations
  const generateBarChartData = () => {
    // Create combined activities object
    const combinedActivities = {};
    const activityBreakdown = {}; // Track individual components for tooltips

    // Filter out 'Available' activities and get activities with hours > 0
    const activities = activityOrder.filter(
      (activity) =>
        activity !== "Available" && (activityHours[activity] || 0) > 0
    );

    // Process all activities and group HTC activities
    activities.forEach((activity) => {
      if (activity === "HTC1" || activity === "HTC1_visite") {
        const combinedKey = "HTC1 (Total)";
        combinedActivities[combinedKey] =
          (combinedActivities[combinedKey] || 0) +
          (activityHours[activity] || 0);
        if (!activityBreakdown[combinedKey])
          activityBreakdown[combinedKey] = {};
        activityBreakdown[combinedKey][activity] = activityHours[activity] || 0;
      } else if (activity === "HTC2" || activity === "HTC2_visite") {
        const combinedKey = "HTC2 (Total)";
        combinedActivities[combinedKey] =
          (combinedActivities[combinedKey] || 0) +
          (activityHours[activity] || 0);
        if (!activityBreakdown[combinedKey])
          activityBreakdown[combinedKey] = {};
        activityBreakdown[combinedKey][activity] = activityHours[activity] || 0;
      } else {
        // Keep other activities as-is
        combinedActivities[activity] = activityHours[activity] || 0;
        activityBreakdown[activity] = {
          [activity]: activityHours[activity] || 0,
        };
      }
    });

    // Sort by combined hours descending
    const sortedActivities = Object.keys(combinedActivities).sort(
      (a, b) => combinedActivities[b] - combinedActivities[a]
    );

    // Create data arrays
    const labels = sortedActivities;
    const data = sortedActivities.map(
      (activity) => combinedActivities[activity]
    );
    const backgroundColor = sortedActivities.map((activity) => {
      // Use HTC1 color for both HTC1 and HTC2 totals, or original color for others
      if (activity.startsWith("HTC1") || activity.startsWith("HTC2")) {
        return getActivityColor("HTC1"); // Both use same green color
      }
      return getActivityColor(activity.replace(" (Total)", ""));
    });

    return {
      labels,
      datasets: [
        {
          label: "Duration (hours)",
          data,
          backgroundColor,
          borderColor: backgroundColor.map((color) => color),
          borderWidth: 1,
          hoverBackgroundColor: backgroundColor.map((color) => color + "80"), // Add transparency on hover
        },
      ],
      activityBreakdown, // Include breakdown data for tooltips
    };
  };

  const { activityBreakdown: mainActivityBreakdown, ...barChartData } =
    generateBarChartData();

  // Function to generate bar chart data for shared activity durations
  const generateSharedBarChartData = () => {
    // Create combined activities object
    const combinedActivities = {};
    const activityBreakdown = {}; // Track individual components for tooltips

    // Process all shared activities
    Object.keys(sharedActivityHours).forEach((activity) => {
      if (
        activity === "Available" ||
        activity === "TeleCs" ||
        activity === "Chefferie" ||
        activity === "MPO" ||
        (sharedActivityHours[activity] || 0) === 0
      )
        return;

      if (activity === "HTC1" || activity === "HTC1_visite") {
        const combinedKey = "HTC1 (Total)";
        combinedActivities[combinedKey] =
          (combinedActivities[combinedKey] || 0) +
          (sharedActivityHours[activity] || 0);
        if (!activityBreakdown[combinedKey])
          activityBreakdown[combinedKey] = {};
        activityBreakdown[combinedKey][activity] =
          sharedActivityHours[activity] || 0;
      } else if (activity === "HTC2" || activity === "HTC2_visite") {
        const combinedKey = "HTC2 (Total)";
        combinedActivities[combinedKey] =
          (combinedActivities[combinedKey] || 0) +
          (sharedActivityHours[activity] || 0);
        if (!activityBreakdown[combinedKey])
          activityBreakdown[combinedKey] = {};
        activityBreakdown[combinedKey][activity] =
          sharedActivityHours[activity] || 0;
      } else {
        // Keep other activities as-is
        combinedActivities[activity] = sharedActivityHours[activity] || 0;
        activityBreakdown[activity] = {
          [activity]: sharedActivityHours[activity] || 0,
        };
      }
    });

    // Sort by combined hours descending
    const activities = Object.keys(combinedActivities).sort(
      (a, b) => combinedActivities[b] - combinedActivities[a]
    );

    // Create data arrays
    const labels = activities;
    const data = activities.map((activity) => combinedActivities[activity]);
    const backgroundColor = activities.map((activity) => {
      // Use HTC1 color for both HTC1 and HTC2 totals, or original color for others
      if (activity.startsWith("HTC1") || activity.startsWith("HTC2")) {
        return getActivityColor("HTC1"); // Both use same green color
      }
      return getActivityColor(activity.replace(" (Total)", ""));
    });

    return {
      labels,
      datasets: [
        {
          label: "Shared Duration (hours)",
          data,
          backgroundColor,
          borderColor: backgroundColor.map((color) => color),
          borderWidth: 1,
          hoverBackgroundColor: backgroundColor.map((color) => color + "80"), // Add transparency on hover
        },
      ],
      activityBreakdown, // Include breakdown data for tooltips
    };
  };

  const { activityBreakdown, ...sharedBarChartData } =
    generateSharedBarChartData();

  // Drag and drop handlers
  const handleDragStart = (e, activity) => {
    setDragState({ ...dragState, draggedItem: activity });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", activity);
  };

  const handleDragOver = (e, activity) => {
    e.preventDefault();
    if (dragState.draggedItem !== activity) {
      setDragState({ ...dragState, draggedOverItem: activity });
    }
  };

  const handleDragLeave = () => {
    setDragState({ ...dragState, draggedOverItem: null });
  };

  const handleDrop = (e, dropActivity) => {
    e.preventDefault();
    const draggedActivity = dragState.draggedItem;

    if (draggedActivity && draggedActivity !== dropActivity) {
      const newOrder = [...activityOrder];
      const draggedIndex = newOrder.indexOf(draggedActivity);
      const dropIndex = newOrder.indexOf(dropActivity);

      // Remove dragged item and insert at new position
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(dropIndex, 0, draggedActivity);

      setActivityOrder(newOrder);
    }

    setDragState({ draggedItem: null, draggedOverItem: null });
  };

  const handleDragEnd = () => {
    setDragState({ draggedItem: null, draggedOverItem: null });
  };

  // Reset to default order
  const resetOrder = () => {
    setActivityOrder(getDefaultActivityOrder("custom"));
  };

  // Create hour-based grid data - fill from bottom to top, left to right
  const createGridData = () => {
    const grid = [];
    const hoursPerRow = 40; // 40 hours = 10 slots of 4 hours each
    const totalArrayHours = hourArray.length;

    // Calculate how many rows we need (standard doctors + overflow rows)
    const standardHours = totalDoctors * hoursPerRow;
    const needsExtraRows = totalArrayHours > standardHours;
    const extraHours = Math.max(0, totalArrayHours - standardHours);
    const extraRows = Math.ceil(extraHours / hoursPerRow);
    const totalRows = totalDoctors + extraRows;

    // Initialize grid with calculated rows
    for (let row = 0; row < totalRows; row++) {
      grid.push(new Array(hoursPerRow).fill("Available"));
    }

    // Fill from bottom to top, left to right using hour array
    let hourIndex = 0;
    for (let row = totalRows - 1; row >= 0; row--) {
      for (let col = 0; col < hoursPerRow; col++) {
        if (hourIndex < hourArray.length) {
          grid[row][col] = hourArray[hourIndex];
          hourIndex++;
        }
      }
    }

    return {
      grid,
      totalRows,
      extraRows,
      needsExtraRows,
      standardRows: totalDoctors,
    };
  };

  const {
    grid: gridData,
    totalRows,
    extraRows,
    needsExtraRows,
    standardRows,
  } = createGridData();

  // Get color for activity (moved up to fix initialization order)

  // Render simple hour-based cell
  const renderHourCell = (activity, isOverflowRow = false) => {
    const color = getActivityColor(activity);
    const isOverflowActivity = isOverflowRow && activity !== "Available";

    return (
      <div
        className="eta-hour-cell"
        style={{
          backgroundColor: color,
          width: "100%",
          height: "100%",
          borderRadius: "1px",
          opacity: isOverflowActivity ? 0.8 : 1,
          border: isOverflowActivity ? "1px solid #dc3545" : "none",
          boxSizing: "border-box",
        }}
      />
    );
  };

  return (
    <div className="eta-workload-infographic">
      <div className="infographic-header">
        <h3>Activités prévues et ETP disponibles</h3>
      </div>

      {/* Collapsible Section 1: ETA Grid */}
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          marginBottom: "20px",
          backgroundColor: "#fff",
        }}
      >
        <div
          onClick={() => setIsGridExpanded(!isGridExpanded)}
          style={{
            padding: "15px 20px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px 8px 0 0",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: isGridExpanded ? "1px solid #ddd" : "none",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "18px", color: "#333" }}>
            {isGridExpanded ? "▼" : "▶"} ETA Grid Visualization
          </h3>
        </div>

        {isGridExpanded && (
          <div style={{ padding: "20px" }}>
            {hasOverflow && (
              <div
                style={{
                  backgroundColor: "#fff3cd",
                  border: "1px solid #ffeaa7",
                  borderRadius: "6px",
                  padding: "12px",
                  margin: "0 0 10px 0",
                  fontSize: "14px",
                }}
              >
                <div
                  style={{
                    fontWeight: "bold",
                    color: "#856404",
                    marginBottom: "8px",
                  }}
                >
                  🔄 Grid Extended to Show All Activities
                </div>
                <div style={{ color: "#856404", fontSize: "13px" }}>
                  Standard capacity exceeded. Additional {extraRows} row
                  {extraRows > 1 ? "s" : ""} added to display all{" "}
                  {totalRequiredHours} required hours. Overflow section marked
                  by orange dashed line separator. Overflow activities have red
                  borders and light red background.
                </div>
              </div>
            )}

            <div className="eta-grid-container">
        <div className="eta-grid">
          {gridData.map((row, rowIndex) => {
            const isOverflowRow = rowIndex < extraRows;
            const isFirstStandardRow = !isOverflowRow && rowIndex === extraRows;
            const displayRowIndex = isOverflowRow
              ? `Overflow ${extraRows - rowIndex}`
              : `Doctor ${rowIndex - extraRows + 1}`;

            return (
              <div key={rowIndex}>
                {/* Visual separator before first standard row (between overflow and standard sections) */}
                {isFirstStandardRow && (
                  <div
                    style={{
                      height: "4px",
                      background:
                        "repeating-linear-gradient(to right, #ff9500 0, #ff9500 8px, transparent 8px, transparent 16px)",
                      margin: "8px 0",
                      borderRadius: "2px",
                      boxShadow: "0 1px 3px rgba(255, 149, 0, 0.3)",
                    }}
                  />
                )}

                <div
                  className="eta-row"
                  style={{
                    backgroundColor: isOverflowRow ? "#fff5f5" : "transparent",
                    border: isOverflowRow ? "1px solid #fecaca" : "none",
                    borderRadius: isOverflowRow ? "4px" : "0",
                    padding: isOverflowRow ? "2px" : "0",
                  }}
                >
                  <div className="eta-row-cells">
                    {row.map((activity, hourIndex) => {
                      // Calculate slot position and hour within slot
                      const slotNumber = Math.floor(hourIndex / 4) + 1;
                      const hourInSlot = (hourIndex % 4) + 1;
                      const isSlotBoundary = (hourIndex + 1) % 4 === 0;
                      const isSlotStart = hourIndex % 4 === 0;

                      // Build CSS classes
                      let cellClasses = "eta-cell";
                      if (isSlotBoundary && hourIndex < 39)
                        cellClasses += " slot-boundary";
                      if (isSlotStart && hourIndex > 0)
                        cellClasses += " slot-start";

                      const tooltipText = isOverflowRow
                        ? `${activity} | OVERFLOW | Hour ${hourIndex + 1} | ${(
                            1 / 40
                          ).toFixed(3)} ETP | EXCEEDS CAPACITY`
                        : `${activity} | Hour ${hourIndex + 1} | ${(
                            1 / 40
                          ).toFixed(3)} ETP`;

                      return (
                        <div
                          key={hourIndex}
                          className={cellClasses}
                          title={tooltipText}
                        >
                          {renderHourCell(activity, isOverflowRow)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="eta-legend">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <h4 style={{ margin: 0 }}>Activity Legend</h4>
            <button
              onClick={resetOrder}
              style={{
                padding: "4px 8px",
                fontSize: "12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                background: "#f8f9fa",
                cursor: "pointer",
              }}
              title="Reset to default order"
            >
              ↺ Reset
            </button>
          </div>
          <div
            style={{ fontSize: "12px", color: "#6c757d", marginBottom: "10px" }}
          >
            💡 Drag activities to reorder the grid visualization
          </div>
          {activityOrder.map((activity) => {
            const count = activityCounts[activity] || 0;
            const hours = activityHours[activity] || 0;
            const activityHoursPerSlot = getActivityHours(activity);
            const isDragging = dragState.draggedItem === activity;
            const isDraggedOver = dragState.draggedOverItem === activity;

            return (
              <div
                key={activity}
                className="legend-item"
                draggable
                onDragStart={(e) => handleDragStart(e, activity)}
                onDragOver={(e) => handleDragOver(e, activity)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, activity)}
                onDragEnd={handleDragEnd}
                style={{
                  opacity: isDragging ? 0.5 : 1,
                  borderTop: isDraggedOver ? "2px solid #007bff" : "none",
                  paddingTop: isDraggedOver ? "8px" : "10px",
                  cursor: "grab",
                  userSelect: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div style={{ color: "#6c757d", fontSize: "12px" }}>⋮⋮</div>
                <div
                  className="legend-color"
                  style={{ backgroundColor: getActivityColor(activity) }}
                ></div>
                <span>
                  {activity}: {(hours / 40).toFixed(1)} ETP ({hours}h)
                </span>
              </div>
            );
          })}
          {hasOverflow && (
            <div
              style={{
                marginTop: "15px",
                padding: "10px",
                backgroundColor: "#f8f9fa",
                borderRadius: "4px",
                border: "1px solid #dee2e6",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "12px",
                  marginBottom: "8px",
                  color: "#495057",
                }}
              >
                Overflow Indicators:
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    width: "16px",
                    height: "12px",
                    backgroundColor: "#fff5f5",
                    border: "1px solid #fecaca",
                    borderRadius: "2px",
                  }}
                ></div>
                <span style={{ fontSize: "11px", color: "#6c757d" }}>
                  Light red background = Overflow row
                </span>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <div
                  style={{
                    width: "16px",
                    height: "12px",
                    backgroundColor: "#007bff",
                    border: "1px solid #dc3545",
                    borderRadius: "2px",
                    opacity: 0.8,
                  }}
                ></div>
                <span style={{ fontSize: "11px", color: "#6c757d" }}>
                  Red border + reduced opacity = Exceeding activity
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
          </div>
        )}
      </div>

      {/* Collapsible Section 2: Activity Duration Breakdown */}
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          marginBottom: "20px",
          backgroundColor: "#fff",
        }}
      >
        <div
          onClick={() => setIsBarChartExpanded(!isBarChartExpanded)}
          style={{
            padding: "15px 20px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px 8px 0 0",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: isBarChartExpanded ? "1px solid #ddd" : "none",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "18px", color: "#333" }}>
            {isBarChartExpanded ? "▼" : "▶"} Activity Duration Breakdown
          </h3>
        </div>

        {isBarChartExpanded && (
          <div
            className="bar-chart-section"
            style={{
              padding: "20px",
              backgroundColor: "#f9f9f9",
            }}
          >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <div style={{ width: "800px", height: "400px" }}>
            <Bar
              data={barChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false, // Hide legend since colors are self-explanatory
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const activity = context.label;
                        const hours = context.parsed.y;
                        const etpValue = (hours / 40).toFixed(1);
                        const percentage = (
                          (hours / totalUsedHours) *
                          100
                        ).toFixed(1);

                        const result = [`${activity}`];

                        // Check if this is a combined activity
                        if (
                          mainActivityBreakdown[activity] &&
                          Object.keys(mainActivityBreakdown[activity]).length >
                            1
                        ) {
                          // Combined activity - show breakdown
                          result.push(`Total: ${hours}h (${etpValue} ETP)`);
                          result.push("Breakdown:");
                          Object.entries(
                            mainActivityBreakdown[activity]
                          ).forEach(([subActivity, subHours]) => {
                            if (subHours > 0) {
                              result.push(`  • ${subActivity}: ${subHours}h`);
                            }
                          });
                        } else {
                          // Single activity - show standard info
                          result.push(`${hours}h (${etpValue} ETP)`);
                        }

                        result.push(`${percentage}% of total used time`);
                        return result;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: "Activities",
                    },
                    ticks: {
                      maxRotation: 45,
                      minRotation: 45,
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: "Duration (hours)",
                    },
                    beginAtZero: true,
                    ticks: {
                      callback: function (value) {
                        return value + "h";
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
        <div
          style={{ fontSize: "14px", color: "#6c757d", textAlign: "center" }}
        >
          <p>
            <strong>Individual Activity Duration:</strong> Each bar represents
            the total weekly hours for that activity.
          </p>
          <p style={{ fontSize: "12px", fontStyle: "italic" }}>
            Hover over bars for detailed information including ETP values and
            percentage of total time.
          </p>
        </div>
          </div>
        )}
      </div>

      {/* Collapsible Section 3: Shared Activities */}
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          marginBottom: "20px",
          backgroundColor: "#fff",
        }}
      >
        <div
          onClick={() => setIsSharedChartExpanded(!isSharedChartExpanded)}
          style={{
            padding: "15px 20px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px 8px 0 0",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: isSharedChartExpanded ? "1px solid #ddd" : "none",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "18px", color: "#333" }}>
            {isSharedChartExpanded ? "▼" : "▶"} Durée des activités à partager
          </h3>
        </div>

        {isSharedChartExpanded && (
          <div
            className="shared-bar-chart-section"
            style={{
              padding: "20px",
              backgroundColor: "#f0f8ff",
            }}
          >
        <div
          style={{
            marginBottom: "15px",
            padding: "10px",
            backgroundColor: "#e6f3ff",
            borderRadius: "6px",
            border: "1px solid #b3d9ff",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: "#0066cc",
              fontWeight: "bold",
              marginBottom: "5px",
            }}
          >
            💡 About Shared Activities
          </div>
          <div
            style={{ fontSize: "13px", color: "#004499", lineHeight: "1.4" }}
          >
            This chart shows <strong>remaining workload</strong> available for
            rotation assignments after subtracting activities already covered by
            doctor backbones. For example, if BM's backbone covers EMIT on
            Thursday/Friday, those hours are excluded from shared EMIT workload.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <div style={{ width: "800px", height: "400px" }}>
            <Bar
              data={sharedBarChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false, // Hide legend since colors are self-explanatory
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const activity = context.label;
                        const sharedHours = context.parsed.y;
                        const etpValue = (sharedHours / 40).toFixed(1);
                        const percentage =
                          totalSharedHours > 0
                            ? ((sharedHours / totalSharedHours) * 100).toFixed(
                                1
                              )
                            : "0";

                        const result = [`${activity} - Shared Workload`];

                        // Check if this is a combined activity
                        if (
                          activityBreakdown[activity] &&
                          Object.keys(activityBreakdown[activity]).length > 1
                        ) {
                          // Combined activity - show breakdown
                          result.push(
                            `Total Shared: ${sharedHours}h (${etpValue} ETP)`
                          );
                          result.push("Breakdown:");
                          Object.entries(activityBreakdown[activity]).forEach(
                            ([subActivity, hours]) => {
                              if (hours > 0) {
                                result.push(`  • ${subActivity}: ${hours}h`);
                              }
                            }
                          );

                          // Calculate total hours for backbone calculation
                          const totalHours = Object.keys(
                            activityBreakdown[activity]
                          ).reduce((sum, subActivity) => {
                            return sum + (activityHours[subActivity] || 0);
                          }, 0);
                          const backboneHours = totalHours - sharedHours;
                          result.push(`Total Backbone: ${backboneHours}h`);
                          result.push(`Total Overall: ${totalHours}h`);
                        } else {
                          // Single activity - show standard info
                          const originalActivity = activity.replace(
                            " (Total)",
                            ""
                          );
                          const totalHours =
                            activityHours[originalActivity] || 0;
                          const backboneHours = totalHours - sharedHours;
                          result.push(
                            `Shared: ${sharedHours}h (${etpValue} ETP)`
                          );
                          result.push(`Backbone: ${backboneHours}h`);
                          result.push(`Total: ${totalHours}h`);
                        }

                        result.push(`${percentage}% of shared workload`);
                        return result;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: "Activities",
                    },
                    ticks: {
                      maxRotation: 45,
                      minRotation: 45,
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: "Shared Duration (hours)",
                    },
                    beginAtZero: true,
                    ticks: {
                      callback: function (value) {
                        return value + "h";
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
        <div
          style={{ fontSize: "14px", color: "#6c757d", textAlign: "center" }}
        >
          <p>
            <strong>Total Shared Workload:</strong> {totalSharedHours}h (
            {(totalSharedHours / 40).toFixed(1)} ETP) •
            <strong> Total Original Workload:</strong> {totalUsedHours}h (
            {(totalUsedHours / 40).toFixed(1)} ETP)
          </p>
          <p style={{ fontSize: "12px", fontStyle: "italic" }}>
            <strong>Reduction from Backbone Coverage:</strong>{" "}
            {totalUsedHours - totalSharedHours}h (
            {((totalUsedHours - totalSharedHours) / 40).toFixed(1)} ETP) • Shows
            hours already handled by doctor backbones and not available for
            rotation assignments.
          </p>
        </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default ETAWorkloadInfographic;
