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

export default function App() {
  const [page, setPage] = useState<Page>('inicio');
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    return authService.getCurrentSession().user;
  });

  const navigate = (next: Page) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const { token } = authService.getCurrentSession();
    if (token) {
      void authService.getProfile().then((verifiedUser) => {
        if (verifiedUser) {
          setAuthUser(verifiedUser);
        } else {
          setAuthUser(null);
        }
      });
    }

    const handleUnauthorized = () => {
      setAuthUser(null);
      setPage('login');
    };

    window.addEventListener('upnews:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('upnews:unauthorized', handleUnauthorized);
    };
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
      <Header
        page={page}
        onNavigate={navigate}
        user={authUser}
        onLogout={handleLogout}
      />
      {page === 'inicio' && <Home onNavigate={navigate} />}
      {page === 'noticia' && (
        <>
          <Article />
          <Footer onNavigate={navigate} />
        </>
      )}
      {page === 'agenda' && (
        <>
          <Agenda />
          <Footer onNavigate={navigate} />
        </>
      )}
      {page === 'proyectos' && (
        <>
          <Projects />
          <Footer onNavigate={navigate} />
        </>
      )}
      {page === 'nosotros' && (
        <>
          <About />
          <Footer onNavigate={navigate} />
        </>
      )}
      {page === 'publicar' &&
        (authUser ? (
          <Publish user={authUser} onLogout={handleLogout} />
        ) : (
          <LoginPage
            onBack={() => navigate('inicio')}
            onLoginSuccess={handleLoginSuccess}
          />
        ))}
      {page === 'login' && (
        <LoginPage
          onBack={() => navigate('inicio')}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}
