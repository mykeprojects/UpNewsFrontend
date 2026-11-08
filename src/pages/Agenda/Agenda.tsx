import { useState } from 'react';
import { DrumArt } from '@/components/illustrations/DrumArt';
import { Icon } from '@/common/atoms/Icon';
import { events } from '@/common/constants';
import { EventRow } from '@/common/molecules/EventRow';

function AgendaPage() {
  const [selected, setSelected] = useState(1);
  return (
    <main className="agenda-page">
      <div className="shell">
        <h1 className="page-title">Agenda</h1>
        <div className="month-selector">
          <button>‹</button>
          <span>Octubre y noviembre de 2026</span>
          <button>›</button>
        </div>
        <div className="agenda-layout">
          <div className="agenda-list">
            {events.map((event, index) => (
              <div onClick={() => setSelected(index)} key={event.title}>
                <EventRow event={event} featured={selected === index} />
              </div>
            ))}
          </div>
          <aside className="event-detail">
            <DrumArt compact />
            <span className="eyebrow dark">Inscripciones abiertas</span>
            <h2>{events[selected].title}</h2>
            <p>
              <Icon name="calendar" size={15} /> {events[selected].day} de{' '}
              {events[selected].month === 'NOV' ? 'noviembre' : events[selected].month === 'DIC' ? 'diciembre' : 'octubre'} de 2026
            </p>
            <p>
              <Icon name="clock" size={15} /> {events[selected].time}
            </p>
            <label>
              Nombre completo
              <input placeholder="Escribe tu nombre" />
            </label>
            <label>
              Celular
              <input placeholder="Tu número de contacto" />
            </label>
            <fieldset>
              <legend>¿Quiénes piensan asistir?</legend>
              <div className="counter">
                <button>−</button>
                <strong>2</strong>
                <button>+</button>
                <span>personas</span>
              </div>
            </fieldset>
            <div className="share-buttons">
              <button className="pill">
                <Icon name="send" size={14} /> WhatsApp
              </button>
            </div>
            <button className="button primary full">Confirmar inscripción</button>
            <small>La fundación confirmará tu cupo por teléfono.</small>
          </aside>
        </div>
      </div>
    </main>
  );
}

/** El Footer lo pone App una sola vez (antes salía duplicado). */
export function Agenda() {
  return <AgendaPage />;
}
