import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { activityColors, expectedActivities } from './schedule';

const PlanningOverview = ({
  schedule,
  assignmentStatus,
  year,
  month,
  getDateOfISOWeek,
  useCustomLogic,
  customLogicReport,
  customScheduleData,
  onPeriodClick
}) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeSlots = ['9am-1pm', '2pm-6pm'];

  // Extract periods from Custom Logic or create default periods
  const getPeriods = () => {
    if (useCustomLogic && customLogicReport) {
      // Use Custom Logic Phase 3 periods
      return [
        { name: 'Période 1', startWeek: 44, endWeek: 47, year: 2024 },
        { name: 'Période 2', startWeek: 48, endWeek: 51, year: 2024 },
        { name: 'Période 3', startWeek: 52, endWeek: 3, year: 2025 },
        { name: 'Période 4', startWeek: 4, endWeek: 7, year: 2025 },
        { name: 'Période 5', startWeek: 8, endWeek: 11, year: 2025 },
        { name: 'Période 6', startWeek: 12, endWeek: 15, year: 2025 },
      ];
    } else {
      // Default periods for other algorithms
      return [
        { name: 'Période 1', startWeek: 44, endWeek: 47, year: 2024 },
        { name: 'Période 2', startWeek: 48, endWeek: 51, year: 2024 },
        { name: 'Période 3', startWeek: 52, endWeek: 2, year: 2025 },
      ];
    }
  };

  // Get weeks for a period
  const getWeeksForPeriod = (period) => {
    const weeks = [];
    let currentWeek = period.startWeek;
    let currentYear = period.year;

    while (true) {
      weeks.push(`Week${currentWeek}`);

      if (currentWeek === period.endWeek) break;

      currentWeek++;
      if (currentWeek > 52) {
        currentWeek = 1;
        currentYear++;
      }
    }

    return weeks;
  };

  // Aggregate validation results for a period using direct schedule data
  const aggregateValidationForPeriod = (period) => {
    const weeks = getWeeksForPeriod(period);
    let totalMissing = 0;
    let totalDuplicates = 0;
    let totalSlots = 0;
    let validSlots = 0;

    const scheduleData = getPeriodScheduleData(period);

    if (scheduleData) {
      days.forEach(day => {
        const fullDay = dayMap[day];
        timeSlots.forEach(slot => {
          const validation = validateScheduleData(scheduleData, fullDay, slot);
          totalSlots++;
          totalMissing += validation.missing.length;
          totalDuplicates += validation.duplicates.length;

          if (!validation.hasConflicts) {
            validSlots++;
          }
        });
      });
    }

    return {
      totalMissing,
      totalDuplicates,
      totalSlots,
      validSlots,
      weeks,
      healthStatus: totalMissing + totalDuplicates === 0 ? 'good' :
                   totalMissing + totalDuplicates < 5 ? 'warning' : 'error'
    };
  };

  // Helper function to find duplicates in an array
  const findDuplicates = (arr) => {
    const duplicateActivities = ['EMIT', 'HDJ', 'AMI', 'HTC1', 'HTC2', 'EMATIT'];
    const counts = {};
    const duplicates = [];

    arr.forEach(item => {
      if (duplicateActivities.includes(item)) {
        counts[item] = (counts[item] || 0) + 1;
      }
    });

    Object.keys(counts).forEach(item => {
      if (counts[item] > 1) {
        duplicates.push(item);
      }
    });

    return duplicates;
  };

  // Direct schedule data validation function
  const validateScheduleData = (scheduleData, day, slot) => {
    if (!scheduleData) {
      return {
        missing: [],
        duplicates: [],
        hasConflicts: false
      };
    }

    // Get all activities assigned by all doctors for this day/slot
    const assigned = [];
    Object.keys(scheduleData).forEach(doctor => {
      const activities = scheduleData[doctor]?.[day]?.[slot] || [];
      assigned.push(...activities);
    });

    // Compare against expected activities
    const expected = expectedActivities[day]?.[slot] || [];
    const missing = expected.filter(activity => !assigned.includes(activity));

    // Check for duplicates
    const duplicates = findDuplicates(assigned);

    return {
      missing,
      duplicates,
      hasConflicts: missing.length > 0 || duplicates.length > 0
    };
  };

  // Get slot-level validation (AM or PM specific) using direct schedule data
  const getSlotValidation = (period, day, slot) => {
    const fullDay = dayMap[day];
    const scheduleData = getPeriodScheduleData(period);

    return validateScheduleData(scheduleData, fullDay, slot);
  };

  // Day mapping for consistency
  const dayMap = {
    'Mon': 'Monday',
    'Tue': 'Tuesday',
    'Wed': 'Wednesday',
    'Thu': 'Thursday',
    'Fri': 'Friday',
    'Sat': 'Saturday',
    'Sun': 'Sunday'
  };

  // Get period schedule data directly
  const getPeriodScheduleData = (period) => {
    if (useCustomLogic && customScheduleData && customScheduleData.periodicSchedule) {
      // Use direct period schedule from Custom Logic
      const periodData = customScheduleData.periodicSchedule[period.name];
      if (periodData && periodData.schedule) {
        return periodData.schedule;
      }

      // Fallback to finalSchedule for Period 1
      if (period.name === 'Période 1' && customScheduleData.finalSchedule) {
        return customScheduleData.finalSchedule;
      }
    }

    // Fallback to week-based schedule for non-Custom Logic or missing data
    const representativeWeek = `Week${period.startWeek}`;
    return schedule[year]?.[month]?.[representativeWeek];
  };

  // Render a mini calendar for a period
  const renderPeriodMiniCalendar = (period, validation) => {
    const weekData = getPeriodScheduleData(period);

    if (!weekData) return null;

    const weekNumber = period.startWeek;
    const dates = getDateOfISOWeek(weekNumber, period.year);

    return (
      <div className="mini-calendar" key={period.name}>
        <div className="period-header">
          <h4>{period.name}</h4>
          <span className="week-range">
            Semaines {period.startWeek}-{period.endWeek}
          </span>
          <div className={`validation-badge ${validation.healthStatus}`}>
            {validation.totalMissing + validation.totalDuplicates === 0 ? '✓' :
             `⚠️ ${validation.totalMissing + validation.totalDuplicates}`}
          </div>
        </div>

        <table className="mini-calendar-table">
          <thead>
            <tr>
              <th></th>
              {days.map((day, index) => (
                <th key={day} colSpan="2" className="mini-day-header">
                  <div className="day-name">{day}</div>
                  <div className="day-date">{dates[index].getDate()}</div>
                </th>
              ))}
            </tr>
            <tr>
              <th></th>
              {days.map((day) => (
                <React.Fragment key={day}>
                  <th className="mini-slot">AM</th>
                  <th className="mini-slot">PM</th>
                </React.Fragment>
              ))}
            </tr>
            <tr className="day-conflicts-row">
              <td className="conflicts-label">Issues</td>
              {days.map((day) => (
                <React.Fragment key={`conflicts-${day}`}>
                  {timeSlots.map((slot) => {
                    const slotValidation = getSlotValidation(period, day, slot);
                    const slotLabel = slot === '9am-1pm' ? 'AM' : 'PM';

                    return (
                      <td key={`conflicts-${day}-${slot}`} className="slot-conflict-summary">
                        {!slotValidation.hasConflicts ? (
                          <span className="conflict-ok">✓</span>
                        ) : (
                          <div className="conflict-details">
                            {slotValidation.missing.length > 0 && (
                              <div className="conflict-missing">
                                ❌ {slotValidation.missing.join(', ')}
                              </div>
                            )}
                            {slotValidation.duplicates.length > 0 && (
                              <div className="conflict-duplicate">
                                ⚠️ {slotValidation.duplicates.join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.keys(weekData).map((doctor) => (
              <tr key={doctor}>
                <td className="doctor-name">{doctor}</td>
                {days.map((day) => (
                  <React.Fragment key={doctor + day}>
                    {timeSlots.map((slot) => {
                      const fullDay = dayMap[day];
                      const activities = weekData[doctor]?.[fullDay]?.[slot] || ['free'];

                      return (
                        <td key={doctor + day + slot} className="mini-activity-cell">
                          <div className="mini-activities">
                            {activities.slice(0, 2).map((activity, idx) => (
                              <div
                                key={activity + idx}
                                className="mini-activity"
                                style={{
                                  backgroundColor: activityColors[activity] || 'white',
                                  color: activityColors[activity] ? 'white' : 'black'
                                }}
                              >
                                {activity.length > 4 ? activity.substring(0, 3) + '.' : activity}
                              </div>
                            ))}
                            {activities.length > 2 && (
                              <div className="mini-activity-more">+{activities.length - 2}</div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {(validation.totalMissing > 0 || validation.totalDuplicates > 0) && (
          <div className="period-summary">
            {validation.totalMissing > 0 && (
              <span className="missing-count">Manquants: {validation.totalMissing}</span>
            )}
            {validation.totalDuplicates > 0 && (
              <span className="duplicate-count">Doublons: {validation.totalDuplicates}</span>
            )}
          </div>
        )}
      </div>
    );
  };

  const periods = getPeriods();

  return (
    <div className="planning-overview-container">
      <div className="overview-header">
        <h3>📋 Vue d'ensemble par périodes</h3>
        <p>Aperçu des périodes de rotation avec indicateurs de validation</p>
      </div>

      <div className="period-grid">
        {periods.map(period => {
          const validation = aggregateValidationForPeriod(period);
          return (
            <div
              key={period.name}
              className="period-container"
              onClick={() => onPeriodClick && onPeriodClick(period)}
            >
              {renderPeriodMiniCalendar(period, validation)}
            </div>
          );
        })}
      </div>

      <div className="overview-legend">
        <div className="legend-item">
          <span className="legend-indicator good">✓</span>
          <span>Aucun problème</span>
        </div>
        <div className="legend-item">
          <span className="legend-indicator warning">⚠️</span>
          <span>Problèmes mineurs (&lt; 5)</span>
        </div>
        <div className="legend-item">
          <span className="legend-indicator error">⚠️</span>
          <span>Problèmes majeurs (≥ 5)</span>
        </div>
      </div>
    </div>
  );
};

export default PlanningOverview;