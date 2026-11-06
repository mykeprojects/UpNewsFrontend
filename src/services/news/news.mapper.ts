import type { News, NewsArt, NewsPage, NewsTone } from '@/models';
import type { PaginaDto, PublicacionDto } from './news.dto';

/**
 * Traduce la respuesta del backend (español, campos de API) al modelo que usan los componentes.
 * Las ilustraciones y colores se eligen a partir de la etiqueta, para no depender de imágenes todavía.
 */
const VISUAL_POR_CATEGORIA: Record<string, { art: NewsArt; tone: NewsTone }> = {
  talleres: { art: 'screen', tone: 'orange' },
  eventos: { art: 'screen', tone: 'orange' },
  'la fundación': { art: 'bread', tone: 'cream' },
  historias: { art: 'heart', tone: 'green' },
  comunidad: { art: 'heart', tone: 'green' },
};
const VISUALES: { art: NewsArt; tone: NewsTone }[] = Object.values(VISUAL_POR_CATEGORIA);

function visualPara(categoria: string) {
  const conocido = VISUAL_POR_CATEGORIA[categoria.toLowerCase()];
  if (conocido) return conocido;
  // Categoría nueva: siempre el mismo visual para la misma palabra.
  const hash = [...categoria].reduce((acc, letra) => acc + letra.charCodeAt(0), 0);
  return VISUALES[hash % VISUALES.length];
}

const formatoFecha = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' });

function fechaCorta(iso: string | null): string {
  return iso ? formatoFecha.format(new Date(iso)).replace('.', '') : '';
}

function extracto(dto: PublicacionDto): string {
  if (dto.resumen) return dto.resumen;
  const texto = dto.cuerpo.replace(/\s+/g, ' ').trim();
  return texto.length > 160 ? `${texto.slice(0, 157)}…` : texto;
}

export function toNews(dto: PublicacionDto): News {
  const category = dto.etiqueta ?? 'Noticias';
  return {
    id: dto.id,
    category,
    title: dto.titulo,
    excerpt: extracto(dto),
    body: dto.cuerpo,
    date: fechaCorta(dto.publicadaEn),
    publishedAt: dto.publicadaEn,
    ...visualPara(category),
  };
}

export function toNewsPage(dto: PaginaDto<PublicacionDto>): NewsPage {
  return { items: dto.items.map(toNews), total: dto.total, page: dto.pagina, limit: dto.limite };
}
