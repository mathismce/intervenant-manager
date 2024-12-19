// const transformAvailabilityToEvents = (
  //   availability: Intervenant['availability']
  // ) => {
  //   const dayMapping: { [key: string]: number } = {
  //     lundi: 1,
  //     mardi: 2,
  //     mercredi: 3,
  //     jeudi: 4,
  //     vendredi: 5,
  //     samedi: 6,
  //     dimanche: 0,
  //   };
  
  //   const events = [];
  //   const startDate = new Date(new Date().getFullYear(), 8, 2); // Start from the week of 2nd September
  //   const endDate = new Date(new Date().getFullYear() + 1, 5, 30); // End at 30th June next year
  
  //   const filledWeeks = new Set<number>(); // Set to keep track of filled weeks
  
  //   const addEvents = (slots: Array<{ days: string; from: string; to: string }>, start: Date, end: Date) => {
  //     for (const slot of slots) {
  //       const days = slot.days.split(',').map((day) => day.trim());
  //       for (const day of days) {
  //         const dayIndex = dayMapping[day];
  //         if (dayIndex === undefined) continue;
  
  //         let eventDate = new Date(start);
  //         while (eventDate <= end) {
  //           if (eventDate.getDay() === dayIndex) {
  //             events.push({
  //               title: `${slot.from} - ${slot.to}`,
  //               start: new Date(
  //                 eventDate.getFullYear(),
  //                 eventDate.getMonth(),
  //                 eventDate.getDate(),
  //                 parseInt(slot.from.split(':')[0]),
  //                 parseInt(slot.from.split(':')[1])
  //               ),
  //               end: new Date(
  //                 eventDate.getFullYear(),
  //                 eventDate.getMonth(),
  //                 eventDate.getDate(),
  //                 parseInt(slot.to.split(':')[0]),
  //                 parseInt(slot.to.split(':')[1])
  //               ),
  //               allDay: false,
  //             });
  //             filledWeeks.add(getWeekNumber(eventDate));
  //           }
  //           eventDate.setDate(eventDate.getDate() + 1);
  //         }
  //       }
  //     }
  //   };
  
  //   const getWeekNumber = (date: Date) => {
  //     const startOfYear = new Date(date.getFullYear(), 0, 1);
  //     const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
  //     return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  //   };
  
  //   // Add specific week availability events first
  //   for (const [week, slots] of Object.entries(availability)) {
  //     if (week === 'default') continue;
  //     const weekNumber = parseInt(week.slice(1));
  //     const year = weekNumber >= 36 ? new Date().getFullYear() : new Date().getFullYear() + 1;
  
  //     // Ignore week 52 of 2024 and week 1 of 2025
  //     if (weekNumber === 52 && year === 2024) continue;
  //     if (weekNumber === 1 && year === 2025) continue;
  
  //     const weekStartDate = getStartDateOfWeek(weekNumber, year);
  //     const weekEndDate = new Date(weekStartDate);
  //     weekEndDate.setDate(weekEndDate.getDate() + 6);
  //     addEvents(slots, weekStartDate, weekEndDate);
  //   }
  
  //   // Add default availability events for remaining weeks
  //   let eventDate = new Date(startDate);
  //   while (eventDate <= endDate) {
  //     const weekNumber = getWeekNumber(eventDate);
  //     const year = eventDate.getFullYear();
  
  //     // Ignore week 52 of 2024 and week 1 of 2025
  //     if ((weekNumber === 52 && year === 2024) || (weekNumber === 1 && year === 2025)) {
  //       eventDate.setDate(eventDate.getDate() + 7);
  //       continue;
  //     }
  
  //     if (!filledWeeks.has(weekNumber)) {
  //       const weekStartDate = getStartDateOfWeek(weekNumber, year);
  //       const weekEndDate = new Date(weekStartDate);
  //       weekEndDate.setDate(weekEndDate.getDate() + 6);
  //       addEvents(availability.default, weekStartDate, weekEndDate);
  //     }
  //     eventDate.setDate(eventDate.getDate() + 7);
  //   }
  
  //   return events;
  // };