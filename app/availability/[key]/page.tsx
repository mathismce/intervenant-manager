'use client';

import React, { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { fetchIntervenantByKey } from '@/app/lib/data';

interface Intervenant {
  firstname: string;
  lastname: string;
  availability: {
    default: Array<{
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

  // Déballer `params` avec React.use()
  useEffect(() => {
    const unwrapParams = async () => {
      const { key } = await params; // Déballer la promesse
      setKey(key);
    };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    const fetchData = async () => {
      if (!key) {
        return;
      }

      try {
        setLoading(true);
        const intervenantData = await fetchIntervenantByKey(key);
        console.log(intervenantData);
        if (!intervenantData) {
          setIntervenant(null);
        } else {
          setIntervenant(intervenantData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key]);

  if (loading || key === null) {
    return <div>Loading...</div>;
  }

  if (!intervenant) {
    return (
      <div>
        <h1>La clé est expirée ou invalide.</h1>
      </div>
    );
  }

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
    const today = new Date();
    const currentWeekStart = new Date(
      today.setDate(today.getDate() - today.getDay() + 1) // Commence à lundi
    );
  
    // Étendre les événements sur une période de 3 mois
    const weeksToGenerate = 52; // Nombre de semaines
    const daysInWeek = 7;
  
    // Fonction pour formater les heures
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const formattedHours = hours.padStart(2, '0');
      const formattedMinutes = minutes.padStart(2, '0');
      return `${formattedHours}:${formattedMinutes}`;
    };
  
    for (let week = 0; week < weeksToGenerate; week++) {
      const weekStart = new Date(currentWeekStart);
      weekStart.setDate(currentWeekStart.getDate() + week * daysInWeek);
  
      // Calculer la semaine sous forme `Sxx`
      const weekNumber = Math.ceil(
        (weekStart.getTime() - new Date(weekStart.getFullYear(), 0, 1).getTime()) /
          (7 * 24 * 60 * 60 * 1000)
      );
      const weekKey = `S${weekNumber}`;
  
      // Récupérer les disponibilités pour cette semaine (spécifique ou par défaut)
      const slots =
        availability[weekKey] !== undefined
          ? availability[weekKey]
          : availability.default;
  
      for (const slot of slots) {
        const days = slot.days.split(',').map((day) => day.trim());
        for (const day of days) {
          const dayIndex = dayMapping[day];
          if (dayIndex === undefined) continue;
  
          // Calculer la date pour ce jour dans cette semaine
          const eventDate = new Date(weekStart);
          eventDate.setDate(weekStart.getDate() + (dayIndex - 1));
  
          // Ajouter l'événement
          events.push({
            title: `Disponible`,
            start: `${eventDate.toISOString().split('T')[0]}T${formatTime(
              slot.from
            )}`,
            end: `${eventDate.toISOString().split('T')[0]}T${formatTime(
              slot.to
            )}`,
          });
        }
      }
    }
  
    return events;
  };
  
  
  

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
            weekNumbers={true}
            weekends={false}
          />
        </div>
      </div>
    </div>
  );
}
