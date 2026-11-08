import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/layout/Header';
import { Home } from '@/pages/Home';
import { Article } from '@/pages/Article';
import { Projects } from '@/pages/Projects';
import { About } from '@/pages/About';
import { Publish } from '@/pages/Publish';
import { LoginPage } from '@/pages/Login';
import { Footer } from '@/layout/Footer';
import type { AuthUser, Page } from '@/models';
import { authService } from '@/services';

/** Páginas públicas que llevan el pie de página (Home lo incluye por su cuenta). */
const PAGINAS_CON_FOOTER: Page[] = ['noticia', 'proyectos', 'nosotros'];

const RUTA_POR_PAGINA: Record<Page, string> = {
  inicio: '/',
  noticia: '/noticia',
  proyectos: '/proyectos',
  nosotros: '/nosotros',
  publicar: '/publicar',
  login: '/login',
};

function paginaDesdeRuta(pathname: string): Page {
  if (pathname === '/') return 'inicio';
  if (pathname === '/noticia' || pathname.startsWith('/noticia/')) return 'noticia';
  if (pathname === '/proyectos') return 'proyectos';
  if (pathname === '/nosotros') return 'nosotros';
  if (pathname === '/publicar') return 'publicar';
  if (pathname === '/login') return 'login';
  return 'inicio';
}

function ArticleRoute({ onOpenNews }: { onOpenNews: (id: string) => void }) {
  const { newsId } = useParams<{ newsId: string }>();
  return <Article newsId={newsId ?? null} onOpenNews={onOpenNews} />;
}

function AppRoutes() {
  const location = useLocation();
  const navigateRouter = useNavigate();
  const page = paginaDesdeRuta(location.pathname);
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => authService.getCurrentSession().user);

  const navigate = useCallback((next: Page) => navigateRouter(RUTA_POR_PAGINA[next]), [navigateRouter]);
  const openNews = useCallback((id: string) => navigateRouter(`/noticia/${encodeURIComponent(id)}`), [navigateRouter]);

  useEffect(() => {
    const { token } = authService.getCurrentSession();
    if (token) {
      void authService.getProfile().then((verifiedUser) => setAuthUser(verifiedUser ?? null));
    }

    const handleUnauthorized = () => {
      setAuthUser(null);
      navigate('login');
    };

    window.addEventListener('upnews:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('upnews:unauthorized', handleUnauthorized);
  }, [navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

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
      <Routes>
        <Route path="/" element={<Home onNavigate={navigate} onOpenNews={openNews} />} />
        <Route path="/noticia" element={<Article newsId={null} onOpenNews={openNews} />} />
        <Route path="/noticia/:newsId" element={<ArticleRoute onOpenNews={openNews} />} />
        <Route path="/proyectos" element={<Projects />} />
        <Route path="/nosotros" element={<About />} />
        <Route
          path="/publicar"
          element={
            authUser ? (
              <Publish user={authUser} onLogout={handleLogout} />
            ) : (
              <LoginPage onBack={() => navigate('inicio')} onLoginSuccess={handleLoginSuccess} />
            )
          }
        />
        <Route path="/login" element={<LoginPage onBack={() => navigate('inicio')} onLoginSuccess={handleLoginSuccess} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {PAGINAS_CON_FOOTER.includes(page) && <Footer onNavigate={navigate} />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
