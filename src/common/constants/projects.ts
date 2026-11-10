export interface Project {
  name: string;
  description: string;
  /** Set this to the destination URL when the project page is available. */
  url: string | null;
}

export const PROJECTS: Project[] = [
  {
    name: 'Método Consuelo',
    description: 'Acompañamiento educativo que reconoce las capacidades y el ritmo de cada persona.',
    url: null,
  },
  {
    name: 'Aula UP',
    description: 'Espacios para aprender, crear y fortalecer habilidades para la vida.',
    url: null,
  },
  {
    name: 'SAGA-UP',
    description: 'Acompañamiento seguro para las familias y los procesos de cada participante.',
    url: null,
  },
  {
    name: 'SON UP',
    description: 'Música, expresión y trabajo en equipo para nuestra comunidad.',
    url: null,
  },
];
