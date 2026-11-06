import { Icon } from '@/common/atoms/Icon';

function ProjectsPage() {
  const projects = [
    ['Método Consuelo', 'Acompañamiento educativo que reconoce las capacidades y el ritmo de cada persona.'],
    ['Aula UP', 'Espacios para aprender, crear y fortalecer habilidades para la vida.'],
    ['SAGA-UP', 'Acompañamiento seguro para las familias y los procesos de cada participante.'],
    ['SON UP', 'Música, expresión y trabajo en equipo para nuestra comunidad.'],
  ];
  return (
    <main className="shell content-page">
      <span className="eyebrow dark">Lo que hacemos</span>
      <h1 className="page-title">Proyectos que crecen con la comunidad</h1>
      <p className="lead narrow">Estos son los proyectos reales que desarrolla ASISCO UP. Cada uno nace del acompañamiento a personas con síndrome de Down y sus familias.</p>
      <div className="project-grid">
        {projects.map(([name, copy], i) => (
          <article key={name}>
            <span>0{i + 1}</span>
            <h2>{name}</h2>
            <p>{copy}</p>
            <button>
              Conocer el proyecto <Icon name="arrow" size={14} />
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}

/** El Footer lo pone App una sola vez (antes salía duplicado). */
export function Projects() {
  return <ProjectsPage />;
}
