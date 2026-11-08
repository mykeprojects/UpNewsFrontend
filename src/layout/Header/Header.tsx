import { useState } from 'react';
import { Brand } from '@/components/Brand';
import { Icon } from '@/common/atoms/Icon';
import type { AuthUser, Page } from '@/models';

export interface HeaderProps {
  page: Page;
  onNavigate: (page: Page) => void;
  user?: AuthUser | null;
  onLogout?: () => void;
}

export function Header({ page, onNavigate, user, onLogout }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const go = (next: Page) => {
    onNavigate(next);
    setOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <header className="site-header">
      <div className="header-inner">
        <div onClick={() => go('inicio')}>
          <Brand />
        </div>
        <nav className={open ? 'main-nav open' : 'main-nav'} aria-label="Navegación principal">
          <button className={page === 'inicio' ? 'active' : ''} onClick={() => go('inicio')}>
            Inicio
          </button>
          <button className={page === 'noticia' ? 'active' : ''} onClick={() => go('noticia')}>
            Noticias
          </button>
          <button className={page === 'proyectos' ? 'active' : ''} onClick={() => go('proyectos')}>
            Proyectos
          </button>
          <button className={page === 'nosotros' ? 'active' : ''} onClick={() => go('nosotros')}>
            ¿Quiénes somos?
          </button>
          {user && (
            <button className={page === 'publicar' ? 'active' : ''} onClick={() => go('publicar')}>
              Crear noticia
            </button>
          )}
        </nav>
        <div className="header-actions">
          <button
            className="nav-donate"
            onClick={() => {
              setOpen(false);
              document.getElementById('donar')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Icon name="heart" size={14} /> Donar
          </button>
          {user ? (
            <>
              <button
                className="admin-access"
                aria-label="Panel de creación de noticias"
                title={`Conectado como ${user.nombres} (${user.rol})`}
                onClick={() => go('publicar')}
              >
                <Icon name="edit" size={14} />
                <span>{user.rol}</span>
              </button>
              {onLogout && (
                <button
                  className="admin-access"
                  aria-label="Cerrar sesión"
                  title="Cerrar sesión"
                  onClick={onLogout}
                >
                  <Icon name="close" size={14} />
                  <span>Salir</span>
                </button>
              )}
            </>
          ) : null}
          <button className="menu-button" onClick={() => setOpen(!open)} aria-label={open ? 'Cerrar menú' : 'Abrir menú'}>
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </div>
    </header>
  );
}
