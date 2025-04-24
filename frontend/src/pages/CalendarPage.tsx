import React, { useState, useEffect } from 'react';
import { useNavigate }            from 'react-router-dom';
import FullCalendar, { EventClickArg, EventInput } from '@fullcalendar/react';
import dayGridPlugin             from '@fullcalendar/daygrid';
import interactionPlugin         from '@fullcalendar/interaction';
import './CalendarPage.css';

interface Entry {
  EntryId:     number;
  EntryText:   string;
  DateCreated: string;   // e.g. "2025-04-21T14:23:00.000Z"
}

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventInput[]>([]);

  useEffect(() => {
    (async () => {
      const stored = localStorage.getItem('user_data');
      const userId = stored ? JSON.parse(stored).id : null;
      if (!userId) return;

      const res = await fetch('/api/getEntries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: { UserId: userId } })
      });
      const { entries } = await res.json();

      const evs = entries.map((e: Entry) => {
        const d = new Date(e.DateCreated);     // parse into Date
        const yy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const localDate = `${yy}-${mm}-${dd}`; // local YYYY-MM-DD
        className: 'calendar-entry'

        return {
          id:    String(e.EntryId),
          title: e.EntryText.length > 30
                   ? e.EntryText.slice(0,30) + '…'
                   : e.EntryText,
          date:  localDate,
          allDay: true,                         // important!
          extendedProps: { fullText: e.EntryText }
        };
      });

      setEvents(evs);
    })();
  }, []);

  const handleEventClick = (info: EventClickArg) => {
    navigate(`/view-entry/${info.event.id}`);
  };

  return (
    <div className="fc-page">
      <header className="fc-header">
        <h1>Journal Calendar</h1>
      </header>

      <main className="fc-main">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: '',
            center: 'title',
            right: 'prev,next today'
          }}
          eventDidMount={(info) => {
            info.el.style.backgroundColor = '#a5d6a7';
            info.el.style.borderColor = '#66bb6a';
            info.el.style.color = '#000';
          }}

          events={events}
          eventClick={handleEventClick}
          height="auto"
        />
      </main>
    </div>
  );
};

export default CalendarPage;
