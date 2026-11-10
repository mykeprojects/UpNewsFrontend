import { Icon } from '@/common/atoms/Icon';
import { PROJECTS } from '@/common/constants/projects';

function ProjectsPage() {
  return (
    <main className="shell content-page">
      <span className="eyebrow dark">Lo que hacemos</span>
      <h1 className="page-title">Proyectos que crecen con la comunidad</h1>
      <p className="lead narrow">Estos son los proyectos reales que desarrolla ASISCO UP. Cada uno nace del acompañamiento a personas con síndrome de Down y sus familias.</p>
      <div className="project-grid">
        {PROJECTS.map((project, i) => (
          <article key={project.name}>
            <span>0{i + 1}</span>
            <h2>{project.name}</h2>
            <p>{project.description}</p>
            {project.url ? (
              <a className="project-link" href={project.url}>
                Conocer el proyecto <Icon name="arrow" size={14} />
              </a>
            ) : (
              <button type="button" disabled title="La URL de este proyecto aún no está configurada">
                Conocer el proyecto <Icon name="arrow" size={14} />
              </button>
            )}
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
