export type NewsArt = 'screen' | 'bread' | 'heart';
export type NewsTone = 'orange' | 'cream' | 'green';

export interface News {
  category: string;
  title: string;
  excerpt: string;
  art: NewsArt;
  tone: NewsTone;
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
