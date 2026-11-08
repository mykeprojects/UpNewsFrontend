import { Brand } from '@/components/Brand';
import type { Page } from '@/models';

export interface FooterProps {
  onNavigate: (page: Page) => void;
}

export function Footer({ onNavigate }: FooterProps) {
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
          <button onClick={() => onNavigate('publicar')}>Acceso fundación</button>
        </div>
      </div>
      <div className="shell footer-bottom">
        © 2026 Fundación ASISCO UP <span>Información pública y accesible para nuestra comunidad.</span>
      </div>
    </footer>
  );
}
