import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/layout/Header';
import { Home } from '@/pages/Home';
import { NewsArchive } from '@/pages/News';
import { Article } from '@/pages/Article';
import { Projects } from '@/pages/Projects';
import { About } from '@/pages/About';
import { Publish } from '@/pages/Publish';
import { Drafts } from '@/pages/Drafts';
import { Requests } from '@/pages/Requests';
import { LoginPage } from '@/pages/Login';
import { Footer } from '@/layout/Footer';
import type { AuthUser, Page } from '@/models';
import { authService } from '@/services';

/** Páginas públicas que llevan el pie de página (Home lo incluye por su cuenta). */
const PAGINAS_CON_FOOTER: Page[] = ['noticia', 'proyectos', 'nosotros'];

const RUTA_POR_PAGINA: Record<Page, string> = {
  inicio: '/',
  noticia: '/noticias',
  proyectos: '/proyectos',
  nosotros: '/nosotros',
  publicar: '/publicar',
  borradores: '/borradores',
  solicitudes: '/solicitudes',
  login: '/login',
};

function paginaDesdeRuta(pathname: string): Page {
  if (pathname === '/') return 'inicio';
  if (pathname === '/noticias') return 'noticia';
  if (pathname === '/noticia' || pathname.startsWith('/noticia/')) return 'noticia';
  if (pathname === '/proyectos') return 'proyectos';
  if (pathname === '/nosotros') return 'nosotros';
  if (pathname === '/publicar' || pathname.startsWith('/publicar/')) return 'publicar';
  if (pathname === '/borradores') return 'borradores';
  if (pathname === '/solicitudes') return 'solicitudes';
  if (pathname === '/login') return 'login';
  return 'inicio';
}

function ArticleRoute({
  onOpenNews,
  user,
}: {
  onOpenNews: (id: string) => void;
  user: AuthUser | null;
}) {
  const { newsId } = useParams<{ newsId: string }>();
  return <Article newsId={newsId ?? null} onOpenNews={onOpenNews} user={user} />;
}

function PublishEditRoute({
  user,
  onNavigate,
  onLogout,
}: {
  user: AuthUser;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}) {
  const { newsId } = useParams<{ newsId: string }>();
  return <Publish user={user} draftId={newsId ?? null} onNavigate={onNavigate} onLogout={onLogout} />;
}

function AppRoutes() {
  const location = useLocation();
  const navigateRouter = useNavigate();
  const page = paginaDesdeRuta(location.pathname);
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => authService.getCurrentSession().user);

  const navigate = useCallback((next: Page) => navigateRouter(RUTA_POR_PAGINA[next]), [navigateRouter]);
  const openNews = useCallback((id: string) => navigateRouter(`/noticia/${encodeURIComponent(id)}`), [navigateRouter]);
  const editDraft = useCallback((id: string) => navigateRouter(`/publicar/${encodeURIComponent(id)}`), [navigateRouter]);

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
        <Route path="/" element={<Home onNavigate={navigate} onOpenNews={openNews} user={authUser} />} />
        <Route path="/noticias" element={<NewsArchive onOpenNews={openNews} />} />
        <Route path="/noticia" element={<Article newsId={null} onOpenNews={openNews} user={authUser} />} />
        <Route path="/noticia/:newsId" element={<ArticleRoute onOpenNews={openNews} user={authUser} />} />
        <Route path="/proyectos" element={<Projects />} />
        <Route path="/nosotros" element={<About />} />
        <Route
          path="/publicar"
          element={
            authUser ? (
              <Publish user={authUser} onNavigate={navigate} onLogout={handleLogout} />
            ) : (
              <LoginPage onBack={() => navigate('inicio')} onLoginSuccess={handleLoginSuccess} />
            )
          }
        />
        <Route
          path="/publicar/:newsId"
          element={
            authUser ? (
              <PublishEditRoute user={authUser} onNavigate={navigate} onLogout={handleLogout} />
            ) : (
              <LoginPage onBack={() => navigate('inicio')} onLoginSuccess={handleLoginSuccess} />
            )
          }
        />
        <Route
          path="/borradores"
          element={
            authUser ? (
              <Drafts
                user={authUser}
                onNavigate={navigate}
                onEditDraft={editDraft}
                onLogout={handleLogout}
              />
            ) : (
              <LoginPage onBack={() => navigate('inicio')} onLoginSuccess={handleLoginSuccess} />
            )
          }
        />
        <Route
          path="/solicitudes"
          element={
            !authUser ? (
              <LoginPage onBack={() => navigate('inicio')} onLoginSuccess={handleLoginSuccess} />
            ) : authUser.rol === 'ADMINISTRADOR' ? (
              <Requests
                user={authUser}
                onNavigate={navigate}
                onEditRequest={editDraft}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/publicar" replace />
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
