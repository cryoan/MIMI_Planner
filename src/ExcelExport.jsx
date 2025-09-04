import React from 'react';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useDocSchedule, doctorsSchedule } from './schedule';
import { publicHolidays } from './publicHolidays.js';

export const activityColors = {
  TP: '#B0BEC5',
  HTC1: '#388E3C',
  HTC2: '#388E3C',
  HTC1_visite: '#388E3C',
  HTC2_visite: '#388E3C',
  Cs: '#81C784',
  Cs_Prison: '#81C784',
  TeleCs: '#A5D6A7',
  EMIT: '#1E88E5',
  EMATIT: '#64B5F6',
  HDJ: '#FB8C00',
  AMI: '#FFB74D',
  AMI_Cs_U: '#FFB74D',
  MPO: '#CFD8DC',
  Vacances: '#FFCDD2',
  RTT: '#FFAB91',
  FMC: '#FFCCBC',
  WE: '#5E35B1',
  Chefferie: 'black'
};

const ExcelExport = () => {
  const { doc, loading } = useDocSchedule();

  const exportToExcel = async () => {
    if (!doc) return;

    const schedule = doctorsSchedule(doc);
    const workbook = new ExcelJS.Workbook();

    // Process each year
    Object.entries(schedule).forEach(([year, yearData]) => {
      Object.entries(yearData).forEach(([month, monthData]) => {
        const worksheet = workbook.addWorksheet(`${year}_${month}`);

        // Set uniform column widths
        worksheet.columns = Array(11).fill({ width: 15 });

        // Main header row
        worksheet.addRow([`${year} - ${month}`]);
        worksheet.mergeCells('A1:J1');

        // Process each week
        Object.entries(monthData).forEach(([week, weekData], index) => {
          const weekNumber = parseInt(week.replace('Week', ''));
          const dates = getDateOfISOWeek(weekNumber, parseInt(year));

          // Add a row indicating the week number, and make it bold
          const weekRow = worksheet.addRow([`Week ${weekNumber}`]);
          weekRow.font = { bold: true };
          worksheet.mergeCells(`A${weekRow.number}:J${weekRow.number}`);

          // Generate the days row with dates, and merge day names over AM and PM columns
          const daysRow = [
            'Alternates',
            `Monday (${format(dates[0], 'dd/MM', { locale: fr })})`,
            '',
            `Tuesday (${format(dates[1], 'dd/MM', { locale: fr })})`,
            '',
            `Wednesday (${format(dates[2], 'dd/MM', { locale: fr })})`,
            '',
            `Thursday (${format(dates[3], 'dd/MM', { locale: fr })})`,
            '',
            `Friday (${format(dates[4], 'dd/MM', { locale: fr })})`,
            '',
          ];
          worksheet.addRow(daysRow);

          // Merge day name cells across AM and PM columns, center align, and make them bold
          const dayRowIndex = worksheet.lastRow.number;
          ['B', 'D', 'F', 'H', 'J'].forEach((col) => {
            worksheet.mergeCells(
              `${col}${dayRowIndex}:${String.fromCharCode(
                col.charCodeAt(0) + 1
              )}${dayRowIndex}`
            );
            const cell = worksheet.getCell(`${col}${dayRowIndex}`);
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.font = { bold: true };
          });

          // AM/PM headers and center alignment
          const ampmRow = [
            '',
            'AM',
            'PM',
            'AM',
            'PM',
            'AM',
            'PM',
            'AM',
            'PM',
            'AM',
            'PM',
          ];
          worksheet.addRow(ampmRow);
          worksheet.getRow(dayRowIndex + 1).eachCell((cell) => {
            cell.alignment = { horizontal: 'center' };
          });

          // Add doctor rows with conditional formatting
          Object.entries(weekData).forEach(([doctor, doctorSchedule]) => {
            const doctorRow = Array(11).fill('');
            doctorRow[0] = doctor;

            ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(
              (day, dayIndex) => {
                const amIndex = dayIndex * 2 + 1;
                const pmIndex = amIndex + 1;

                // AM activities
                const amActivities = doctorSchedule[day]?.['9am-1pm'] || [];
                doctorRow[amIndex] = amActivities.join(', ');

                // PM activities
                const pmActivities = doctorSchedule[day]?.['2pm-6pm'] || [];
                doctorRow[pmIndex] = pmActivities.join(', ');
              }
            );

            const row = worksheet.addRow(doctorRow);

            // Apply background colors with gradients or solid color for multiple activities
            row.eachCell((cell, colNumber) => {
              if (colNumber > 1 && cell.value) {
                const activities = cell.value.split(', ');
                let fill;

                if (activities.length > 2) {
                  // More than two activities: Solid red
                  fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF0000' },
                  };
                } else if (activities.length === 2) {
                  // Two activities: Gradient between two colors
                  const color1 = activityColors[activities[0]].replace('#', '');
                  const color2 = activityColors[activities[1]].replace('#', '');
                  fill = {
                    type: 'gradient',
                    gradient: 'linear',
                    degree: 0,
                    stops: [
                      { position: 0, color: { argb: color1 } },
                      { position: 1, color: { argb: color2 } },
                    ],
                  };
                } else if (activities.length === 1) {
                  // Single activity: Use defined color
                  const color =
                    activityColors[activities[0]]?.replace('#', '') || 'FFFFFF';
                  fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: color },
                  };
                }

                if (fill) {
                  cell.fill = fill;
                }
              }
            });
          });

          // Add empty rows for assistants and interns after doctor schedules
          const emptyRows = [
            'assistant',
            'DJ',
            'interne1',
            'interne2',
            'interne3',
            'interne4',
          ];
          emptyRows.forEach((rowName) => {
            worksheet.addRow([rowName, ...Array(10).fill('')]);
          });

          // Add Vacances row with data from publicHolidays
          const vacancesRow = ['Vacances'];
          ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(
            (day, index) => {
              const date = dates[index];
              const weekData =
                publicHolidays[year]?.[`Week${weekNumber}`]?.[day];
              const holidayDescription = weekData?.event?.description || '';
              // Add the same holiday description for both AM and PM
              vacancesRow.push(holidayDescription, holidayDescription);
            }
          );
          const vRow = worksheet.addRow(vacancesRow);
          vRow.eachCell((cell, colNumber) => {
            if (colNumber > 1 && cell.value) {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFEDD7FF' }, // Light purple color
              };
            }
          });

          // Add Astreinte row
          worksheet.addRow(['Astreinte', ...Array(10).fill('')]);

          // Add empty rows for events and problems
          worksheet.addRow(['évènement', ...Array(10).fill('')]);
          worksheet.addRow(['problèmes', ...Array(10).fill('')]);

          // Add borders around each day block
          const dayBlocks = ['B', 'D', 'F', 'H', 'J'];
          dayBlocks.forEach((col) => {
            const topLeftCell = worksheet.getCell(`${col}${dayRowIndex}`);
            const topRightCell = worksheet.getCell(
              `${String.fromCharCode(col.charCodeAt(0) + 1)}${dayRowIndex}`
            );
            const bottomLeftCell = worksheet.getCell(
              `${col}${worksheet.lastRow.number}`
            );
            const bottomRightCell = worksheet.getCell(
              `${String.fromCharCode(col.charCodeAt(0) + 1)}${
                worksheet.lastRow.number
              }`
            );

            // Apply a thick black border around the day block
            topLeftCell.border = {
              top: { style: 'thick', color: { argb: '000000' } },
              left: { style: 'thick', color: { argb: '000000' } },
            };
            topRightCell.border = {
              top: { style: 'thick', color: { argb: '000000' } },
              right: { style: 'thick', color: { argb: '000000' } },
            };
            bottomLeftCell.border = {
              bottom: { style: 'thick', color: { argb: '000000' } },
              left: { style: 'thick', color: { argb: '000000' } },
            };
            bottomRightCell.border = {
              bottom: { style: 'thick', color: { argb: '000000' } },
              right: { style: 'thick', color: { argb: '000000' } },
            };
          });

          // Insert a blank row after each week's data for readability
          worksheet.addRow([]);
        });
      });
    });

    // Save the workbook
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'MIMI_Planning.xlsx';
    link.click();
  };

  const getDateOfISOWeek = (week, year) => {
    const simple = new Date(year, 0, 4 + (week - 1) * 7);
    const dayOfWeek = simple.getDay();
    const ISOWeekStart = new Date(
      simple.setDate(
        simple.getDate() - simple.getDay() + (dayOfWeek <= 4 ? 1 : 8)
      )
    );
    return Array.from(
      new Array(7),
      (_, i) =>
        new Date(
          ISOWeekStart.getFullYear(),
          ISOWeekStart.getMonth(),
          ISOWeekStart.getDate() + i
        )
    );
  };

  return (
    <button
      onClick={exportToExcel}
      style={{
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        margin: '10px 0',
      }}
      disabled={loading}
    >
      {loading ? 'Loading...' : 'Export to Excel'}
    </button>
  );
};

export default ExcelExport;