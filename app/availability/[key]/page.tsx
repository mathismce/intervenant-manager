'use client';

import React, { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { fetchIntervenantByKey } from '@/app/lib/data';
import { updateAvailability } from '@/app/lib/data';

interface Intervenant {
  firstname: string;
  lastname: string;
  availability: {
    default: Array<{
      days: string;
      from: string;
      to: string;
    }>;
    [key: string]: Array<{
      days: string;
      from: string;
      to: string;
    }>;
  };
}

export default function Page({ params }: { params: Promise<{ key: string }> }) {
  const [key, setKey] = useState<string | null>(null);
  const [intervenant, setIntervenant] = useState<Intervenant | null>(null);
  const [loading, setLoading] = useState(true);
  const calendarRef = useRef(null);

  useEffect(() => {
    const unwrapParams = async () => {
      const { key } = await params;
      setKey(key);
    };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    const fetchData = async () => {
      if (!key) return;

      try {
        setLoading(true);
        const intervenantData = await fetchIntervenantByKey(key);
        console.log(intervenantData);
        setIntervenant(intervenantData || null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key]);

  const getStartDateOfWeek = (weekNumber: number, year: number) => {
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = (weekNumber - 1) * 7;
    const startDate = new Date(firstDayOfYear.setDate(firstDayOfYear.getDate() + daysOffset));
    const dayOfWeek = startDate.getDay();
    const diff = startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(startDate.setDate(diff));
  };

  const transformAvailabilityToEvents = (
    availability: Intervenant['availability']
  ) => {
    const dayMapping: { [key: string]: number } = {
      lundi: 1,
      mardi: 2,
      mercredi: 3,
      jeudi: 4,
      vendredi: 5,
      samedi: 6,
      dimanche: 0,
    };
  
    const events = [];
    const startDate = new Date(new Date().getFullYear(), 8, 2); // Start from the week of 2nd September
    const endDate = new Date(new Date().getFullYear() + 1, 5, 30); // End at 30th June next year
  
    const filledWeeks = new Set<number>(); // Set to keep track of filled weeks
  
    const addEvents = (slots: Array<{ days: string; from: string; to: string }>, start: Date, end: Date) => {
      for (const slot of slots) {
        const days = slot.days.split(',').map((day) => day.trim());
        for (const day of days) {
          const dayIndex = dayMapping[day];
          if (dayIndex === undefined) continue;
  
          let eventDate = new Date(start);
          while (eventDate <= end) {
            if (eventDate.getDay() === dayIndex) {
              events.push({
                title: `${slot.from} - ${slot.to}`,
                start: new Date(
                  eventDate.getFullYear(),
                  eventDate.getMonth(),
                  eventDate.getDate(),
                  parseInt(slot.from.split(':')[0]),
                  parseInt(slot.from.split(':')[1])
                ),
                end: new Date(
                  eventDate.getFullYear(),
                  eventDate.getMonth(),
                  eventDate.getDate(),
                  parseInt(slot.to.split(':')[0]),
                  parseInt(slot.to.split(':')[1])
                ),
                allDay: false,
              });
              filledWeeks.add(getWeekNumber(eventDate));
            }
            eventDate.setDate(eventDate.getDate() + 1);
          }
        }
      }
    };
  
    const getWeekNumber = (date: Date) => {
      const startOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
      return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    };
  
    // Add specific week availability events first
    for (const [week, slots] of Object.entries(availability)) {
      if (week === 'default') continue;
      const weekNumber = parseInt(week.slice(1));
      const year = weekNumber >= 36 ? new Date().getFullYear() : new Date().getFullYear() + 1;
  
      // Ignore week 52 of 2024 and week 1 of 2025
      if (weekNumber === 52 && year === 2024) continue;
      if (weekNumber === 1 && year === 2025) continue;
  
      const weekStartDate = getStartDateOfWeek(weekNumber, year);
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 6);
      addEvents(slots, weekStartDate, weekEndDate);
    }
  
    // Add default availability events for remaining weeks
    let eventDate = new Date(startDate);
    while (eventDate <= endDate) {
      const weekNumber = getWeekNumber(eventDate);
      const year = eventDate.getFullYear();
  
      // Ignore week 52 of 2024 and week 1 of 2025
      if ((weekNumber === 52 && year === 2024) || (weekNumber === 1 && year === 2025)) {
        eventDate.setDate(eventDate.getDate() + 7);
        continue;
      }
  
      if (!filledWeeks.has(weekNumber)) {
        const weekStartDate = getStartDateOfWeek(weekNumber, year);
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekEndDate.getDate() + 6);
        addEvents(availability.default, weekStartDate, weekEndDate);
      }
      eventDate.setDate(eventDate.getDate() + 7);
    }
  
    return events;
  };

  const getWeekFromDate = (date: Date): string => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `S${weekNumber}`;
  };

  const handleDateSelect = async (selectInfo: any) => {
    const { start, end } = selectInfo;
    const title = prompt('Entrez un titre pour cet événement :');
    const week = getWeekFromDate(start); // Déterminer la semaine

    if (title && intervenant) {
      const newAvailability = {
        days: start.toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase(),
        from: `${start.getHours()}:${start.getMinutes()}`,
        to: `${end.getHours()}:${end.getMinutes()}`,
      };

      try {
        // Mettre à jour la disponibilité dans la base de données
        await updateAvailability(intervenant.id, week, [newAvailability]);

        // Ajouter l'événement localement au calendrier
        const calendarApi = selectInfo.view.calendar;
        calendarApi.addEvent({
          title,
          start,
          end,
          allDay: selectInfo.allDay,
        });

        alert(`Disponibilité mise à jour pour la semaine ${week}.`);
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la disponibilité :', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
      }
    } else {
      alert('Aucun titre fourni. Événement annulé.');
    }
  };
  

  if (loading || key === null) {
    return <div>Loading...</div>;
  }

  if (!intervenant) {
    return <div><h1>La clé est expirée ou invalide.</h1></div>;
  }

  const events = transformAvailabilityToEvents(intervenant.availability);
  console.log(events);


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Bonjour {intervenant.firstname} {intervenant.lastname}
        </h1>
        <div className="border-t border-gray-200 pt-4">
          <FullCalendar
            innerRef={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            locale="fr"
            initialView="timeGridWeek"
            events={events}
            editable={true}
            selectable={true}
            select={handleDateSelect}
            weekNumbers={true}
            weekends={false}
          />
        </div>
      </div>
    </div>
  );
}