import { useState } from 'react';
import { Header } from '@/layout/Header';
import { Home } from '@/pages/Home';
import { Article } from '@/pages/Article';
import { Agenda } from '@/pages/Agenda';
import { Projects } from '@/pages/Projects';
import { About } from '@/pages/About';
import { Publish } from '@/pages/Publish';
import { LoginPage } from '@/pages/Login';
import { Footer } from '@/layout/Footer';
import type { Page } from '@/models';

export default function App() {
  const [page, setPage] = useState<Page>('inicio');
  const [newsId, setNewsId] = useState<string | null>(null);

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

  return (
    <div className="app">
      <Header page={page} onNavigate={navigate} />
      {page === 'inicio' && <Home onNavigate={navigate} onOpenNews={openNews} />}
      {page === 'noticia' && <Article newsId={newsId} onOpenNews={openNews} />}
      {page === 'agenda' && <Agenda />}
      {page === 'proyectos' && <Projects />}
      {page === 'nosotros' && <About />}
      {['noticia', 'agenda', 'proyectos', 'nosotros'].includes(page) && <Footer onNavigate={navigate} />}
      {page === 'publicar' && <Publish />}
      {page === 'login' && <LoginPage onBack={() => navigate('inicio')} />}
    </div>
  );
}
