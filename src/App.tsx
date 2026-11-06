import { useEffect, useState } from 'react';
import { Header } from '@/layout/Header';
import { Home } from '@/pages/Home';
import { Article } from '@/pages/Article';
import { Agenda } from '@/pages/Agenda';
import { Projects } from '@/pages/Projects';
import { About } from '@/pages/About';
import { Publish } from '@/pages/Publish';
import { LoginPage } from '@/pages/Login';
import { Footer } from '@/layout/Footer';
import type { AuthUser, Page } from '@/models';
import { authService } from '@/services';

/** Páginas públicas que llevan el pie de página (Home lo incluye por su cuenta). */
const PAGINAS_CON_FOOTER: Page[] = ['noticia', 'agenda', 'proyectos', 'nosotros'];

export default function App() {
  const [page, setPage] = useState<Page>('inicio');
  const [newsId, setNewsId] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => authService.getCurrentSession().user);

  const navigate = (next: Page) => {
    if (next === 'noticia') setNewsId(null); // "Noticias" en el menú abre la más reciente
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openNews = (id: string) => {
    setNewsId(id);
    setPage('noticia');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const { token } = authService.getCurrentSession();
    if (token) {
      void authService.getProfile().then((verifiedUser) => setAuthUser(verifiedUser ?? null));
    }

    const handleUnauthorized = () => {
      setAuthUser(null);
      setPage('login');
    };

    window.addEventListener('upnews:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('upnews:unauthorized', handleUnauthorized);
  }, []);

  const handleLoginSuccess = (user: AuthUser) => {
    setAuthUser(user);
    navigate('publicar');
  };

  const handleLogout = () => {
    authService.logout();
    setAuthUser(null);
    navigate('inicio');
  };

  return (
    <div className="app">
      <Header page={page} onNavigate={navigate} user={authUser} onLogout={handleLogout} />
      {page === 'inicio' && <Home onNavigate={navigate} onOpenNews={openNews} />}
      {page === 'noticia' && <Article newsId={newsId} onOpenNews={openNews} />}
      {page === 'agenda' && <Agenda />}
      {page === 'proyectos' && <Projects />}
      {page === 'nosotros' && <About />}
      {PAGINAS_CON_FOOTER.includes(page) && <Footer onNavigate={navigate} />}
      {page === 'publicar' &&
        (authUser ? (
          <Publish user={authUser} onLogout={handleLogout} />
        ) : (
          <LoginPage onBack={() => navigate('inicio')} onLoginSuccess={handleLoginSuccess} />
        ))}
      {page === 'login' && <LoginPage onBack={() => navigate('inicio')} onLoginSuccess={handleLoginSuccess} />}
    </div>
  );
}
