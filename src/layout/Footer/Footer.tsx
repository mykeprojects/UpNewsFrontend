import { Brand } from '@/components/Brand';
import { Icon, type IconName } from '@/common/atoms';
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

function esTelegram(contacto: ContactInfo): boolean {
  if (/telegram/i.test(contacto.nombre)) return true;
  return /^(?:https?:\/\/)?(?:www\.)?(?:t\.me|telegram\.(?:me|org|dog))(?:[/:?#]|$)/i.test(contacto.informacion.trim());
}

function iconoDeRedSocial(contacto: ContactInfo): IconName | null {
  const nombre = contacto.nombre.toLowerCase();
  const informacion = contacto.informacion.toLowerCase();

  if (nombre.includes('facebook') || /(?:facebook\.com|fb\.com)/i.test(informacion)) return 'facebook';
  if (nombre.includes('instagram') || /instagram\.com/i.test(informacion)) return 'instagram';
  if (/you?tube/i.test(nombre) || /(?:youtube\.com|youtu\.be)/i.test(informacion)) return 'youtube';
  if (/whats?app/i.test(nombre) || /(?:whatsapp\.com|wa\.me)/i.test(informacion)) return 'whatsapp';
  return null;
}

export function Footer({ onNavigate }: FooterProps) {
  const { data: contactos } = useContactInfo();
  const contactosVisibles = contactos?.filter((contacto) => !esTelegram(contacto));
  const contactosSociales =
    contactosVisibles?.filter(
      (contacto) => contacto.tipo === 'RED_SOCIAL' && iconoDeRedSocial(contacto) && enlaceDe(contacto),
    ) ?? [];

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
        {contactosVisibles && contactosVisibles.length > 0 && (
          <div className="footer-contact">
            <strong>Contacto</strong>
            {contactosSociales.length > 0 && (
              <div className="footer-socials">
                {contactosSociales.map((contacto) => {
                  const iconoSocial = iconoDeRedSocial(contacto);
                  const href = enlaceDe(contacto);
                  if (!iconoSocial || !href) return null;

                  return (
                    <a
                      key={`${contacto.tipo}-${contacto.nombre}`}
                      className="footer-social-link"
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={contacto.nombre}
                      title={contacto.nombre}
                    >
                      <Icon name={iconoSocial} size={22} />
                    </a>
                  );
                })}
              </div>
            )}
            {contactosVisibles.map((contacto) => {
              const href = enlaceDe(contacto);
              const seMuestraComoIcono =
                contacto.tipo === 'RED_SOCIAL' && Boolean(iconoDeRedSocial(contacto)) && Boolean(href);
              if (seMuestraComoIcono) return null;

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
