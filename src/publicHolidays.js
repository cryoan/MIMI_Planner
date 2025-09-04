import { getISOWeek } from 'date-fns';

// Data for public holidays
const holidays = {
  2024: {
    "Jour de l'An": 'Lundi 1er janvier 2024',
    'Lundi de Pâques': 'Lundi 1er avril 2024',
    'Fête du Travail': 'Mercredi 1er mai 2024',
    'Victoire de 1945': 'Mercredi 8 mai 2024',
    Ascension: 'Jeudi 9 mai 2024',
    'Lundi de Pentecôte': 'Lundi 20 mai 2024',
    'Fête nationale': 'Dimanche 14 juillet 2024',
    Assomption: 'Jeudi 15 août 2024',
    Toussaint: 'Vendredi 1er novembre 2024',
    'Armistice de 1918': 'Lundi 11 novembre 2024',
    Noël: 'Mercredi 25 décembre 2024',
  },
  2025: {
    "Jour de l'An": 'Mercredi 1er janvier 2025',
    'Lundi de Pâques': 'Lundi 21 avril 2025',
    'Fête du Travail': 'Jeudi 1er mai 2025',
    'Victoire de 1945': 'Jeudi 8 mai 2025',
    Ascension: 'Jeudi 29 mai 2025',
    'Lundi de Pentecôte': 'Lundi 9 juin 2025',
    'Fête nationale': 'Lundi 14 juillet 2025',
    Assomption: 'Vendredi 15 août 2025',
    Toussaint: 'Samedi 1er novembre 2025',
    'Armistice de 1918': 'Mardi 11 novembre 2025',
    Noël: 'Jeudi 25 décembre 2025',
  },
};

// Data for vacation periods
const vacationData = {
  2024: {
    'Vacances de la Toussaint': {
      Début: 'samedi 19 octobre 2024',
      Fin: 'lundi 4 novembre 2024',
    },
    'Vacances de Noël': {
      Début: 'samedi 21 décembre 2024',
      Fin: 'lundi 6 janvier 2025',
    },
  },
  2025: {
    'Vacances d’hiver': {
      Début: 'samedi 8 février 2025',
      Fin: 'lundi 24 février 2025',
    },
    'Vacances de printemps': {
      Début: 'samedi 5 avril 2025',
      Fin: 'mardi 22 avril 2025',
    },
    'Pont de l’Ascension': {
      Début: 'mercredi 28 mai 2025',
      Fin: 'lundi 2 juin 2025',
    },
    'Grandes vacances': {
      Début: 'samedi 5 juillet 2025',
      Fin: 'samedi 5 septembre 2025',
    },
  },
};

// Helper function to parse French date strings into JavaScript Date objects
const parseFrenchDate = (dateString) => {
  const frenchToEnglishDays = {
    lundi: 'Monday',
    mardi: 'Tuesday',
    mercredi: 'Wednesday',
    jeudi: 'Thursday',
    vendredi: 'Friday',
    samedi: 'Saturday',
    dimanche: 'Sunday',
  };

  const frenchToEnglishMonths = {
    janvier: 'January',
    février: 'February',
    mars: 'March',
    avril: 'April',
    mai: 'May',
    juin: 'June',
    juillet: 'July',
    août: 'August',
    septembre: 'September',
    octobre: 'October',
    novembre: 'November',
    décembre: 'December',
  };

  let dateComponents = dateString.toLowerCase().split(' ');
  dateComponents[0] = frenchToEnglishDays[dateComponents[0]];
  dateComponents[2] = frenchToEnglishMonths[dateComponents[2]];

  return new Date(dateComponents.join(' '));
};

// Function to convert public holidays data into the desired format
const transformPublicHolidays = (holidays) => {
  const publicHolidays = {};

  Object.keys(holidays).forEach((year) => {
    Object.keys(holidays[year]).forEach((holidayName) => {
      const holidayDate = parseFrenchDate(holidays[year][holidayName]);
      const weekNumber = `Week${getISOWeek(holidayDate)}`;
      const dayOfWeek = holidayDate.toLocaleString('en-US', {
        weekday: 'long',
      });

      // Initialize year, week, and day if not present
      if (!publicHolidays[year]) publicHolidays[year] = {};
      if (!publicHolidays[year][weekNumber])
        publicHolidays[year][weekNumber] = {};
      if (!publicHolidays[year][weekNumber][dayOfWeek]) {
        publicHolidays[year][weekNumber][dayOfWeek] = {
          event: {
            name: holidayName,
            type: 'holiday',
            description: holidayName,
            timeSlots: ['9am-1pm', '2pm-6pm'],
            fullDay: true,
          },
        };
      }
    });
  });

  return publicHolidays;
};

// Helper function to convert the vacation data to the publicHolidays structure
const convertToPublicHolidayFormat = (vacationData) => {
  const publicHolidays = {};

  Object.keys(vacationData).forEach((year) => {
    Object.keys(vacationData[year]).forEach((vacationName) => {
      const startDate = parseFrenchDate(
        vacationData[year][vacationName]['Début']
      );
      const endDate = parseFrenchDate(vacationData[year][vacationName]['Fin']);

      let currentDate = startDate;

      // Loop through the days from start to end date of the vacation
      while (currentDate < endDate) {
        const currentYear = currentDate.getFullYear();
        const weekNumber = `Week${getISOWeek(currentDate)}`;
        const dayOfWeek = currentDate.toLocaleString('en-US', {
          weekday: 'long',
        });

        // Initialize year if not yet present
        if (!publicHolidays[currentYear]) {
          publicHolidays[currentYear] = {};
        }

        // Initialize week and day if not yet present
        if (!publicHolidays[currentYear][weekNumber]) {
          publicHolidays[currentYear][weekNumber] = {};
        }

        // Assign the event only if it's not already present
        if (!publicHolidays[currentYear][weekNumber][dayOfWeek]) {
          publicHolidays[currentYear][weekNumber][dayOfWeek] = {
            event: {
              name: vacationName,
              type: 'holiday',
              description: vacationName,
              timeSlots: ['9am-1pm', '2pm-6pm'],
              fullDay: true,
            },
          };
        }

        currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
      }
    });
  });

  return publicHolidays;
};

// Merge public holidays and vacation periods
const mergeHolidayData = (publicHolidayData, vacationData) => {
  const formattedPublicHolidays = transformPublicHolidays(publicHolidayData);
  const formattedVacationHolidays = convertToPublicHolidayFormat(vacationData);

  // Merge both datasets
  Object.keys(formattedVacationHolidays).forEach((year) => {
    if (!formattedPublicHolidays[year]) formattedPublicHolidays[year] = {};

    Object.keys(formattedVacationHolidays[year]).forEach((week) => {
      if (!formattedPublicHolidays[year][week]) {
        formattedPublicHolidays[year][week] =
          formattedVacationHolidays[year][week];
      } else {
        // Merge day data within the same week
        Object.assign(
          formattedPublicHolidays[year][week],
          formattedVacationHolidays[year][week]
        );
      }
    });
  });

  return formattedPublicHolidays;
};

// Merge the holiday and vacation data
export const publicHolidays = mergeHolidayData(holidays, vacationData);

console.log('Public Holidays:', publicHolidays);
