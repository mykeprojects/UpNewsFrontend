import { Brand } from '@/components/Brand';
import { useContactInfo } from '@/hooks';
import type { ContactInfo, Page } from '@/models';

export interface FooterProps {
  onNavigate: (page: Page) => void;
}

/** Enlace adecuado según el tipo de contacto (red social, teléfono o dirección). */
function enlaceDe(contacto: ContactInfo): string | null {
  const valor = contacto.informacion.trim();
  if (contacto.tipo === 'RED_SOCIAL') return /^https?:\/\//i.test(valor) ? valor : null;
  if (contacto.tipo === 'NUMERO_CONTACTO') {
    const digitos = valor.replace(/[^\d+]/g, '');
    return digitos ? `tel:${digitos}` : null;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(valor)}`;
}

export function Footer({ onNavigate }: FooterProps) {
  const { data: contactos } = useContactInfo();

  return (
    <footer>
      <div className="shell footer-grid">
        <div>
          <Brand light />
          <p>Noticias y actividades de la Fundación ASISCO UP en Manizales.</p>
        </div>
        <div>
          <strong>Proyectos</strong>
          <button onClick={() => onNavigate('proyectos')}>Método Consuelo</button>
          <button onClick={() => onNavigate('proyectos')}>Aula UP</button>
          <button onClick={() => onNavigate('proyectos')}>SAGA-UP · SON UP</button>
        </div>
        <div>
          <strong>Participa</strong>
          <button onClick={() => onNavigate('agenda')}>Agenda</button>
          <a href="https://t.me/" target="_blank" rel="noreferrer">
            Canal de Telegram
          </a>
          <button onClick={() => onNavigate('publicar')}>Acceso fundación</button>
        </div>
        {contactos && contactos.length > 0 && (
          <div className="footer-contact">
            <strong>Contacto</strong>
            {contactos.map((contacto) => {
              const href = enlaceDe(contacto);
              const texto = `${contacto.nombre}: ${contacto.informacion}`;
              return href ? (
                <a key={`${contacto.tipo}-${contacto.nombre}`} href={href} target="_blank" rel="noreferrer">
                  {texto}
                </a>
              ) : (
                <span key={`${contacto.tipo}-${contacto.nombre}`}>{texto}</span>
              );
            })}
          </div>
        )}
      </div>
      <div className="shell footer-bottom">
        © 2026 Fundación ASISCO UP <span>Información pública y accesible para nuestra comunidad.</span>
      </div>
    </footer>
  );
}
