export type NewsArt = 'screen' | 'bread' | 'heart';
export type NewsTone = 'orange' | 'cream' | 'green';

/** Noticia tal como la usan los componentes (ya traducida desde la respuesta del backend). */
export interface News {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  body: string;
  /** Fecha corta para mostrar, ej: "10 oct" */
  date: string;
  publishedAt: string | null;
  art: NewsArt;
  tone: NewsTone;
}

export interface NewsPage {
  items: News[];
  total: number;
  page: number;
  limit: number;
}

export type NewsStatus = 'BORRADOR' | 'EN_REVISION' | 'PUBLICADO';

export interface CreateNewsPayload {
  titulo: string;
  resumen: string;
  cuerpo: string;
  proposito: string;
  etiqueta: string;
  estado: NewsStatus | string;
  esta_activo: boolean;
}

export interface CreateNewsResponse {
  id?: string | number;
  mensaje?: string;
  data?: CreateNewsPayload & { id?: string | number; fecha_creacion?: string };
}
