import { StoryArt } from '@/components/illustrations/StoryArt';

function AboutPage() {
  return (
    <main className="shell content-page about-page">
      <div>
        <span className="eyebrow dark">Fundación ASISCO UP</span>
        <h1 className="page-title">Una comunidad que acompaña capacidades</h1>
        <p className="lead">Trabajamos en Manizales junto a personas con síndrome de Down, sus familias y una red de profesionales comprometidos con la inclusión.</p>
        <p>Nuestro portal cuenta historias y abre espacios de participación. La información privada de los participantes se gestiona únicamente en las plataformas autorizadas de la fundación.</p>
      </div>
      <div className="about-art">
        <StoryArt type="heart" />
      </div>
    </main>
  );
}

/** El Footer lo pone App una sola vez (antes salía duplicado). */
export function About() {
  return <AboutPage />;
}
