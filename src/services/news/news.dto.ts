/**
 * Forma EXACTA de las respuestas del backend (PublicacionPublicaDto en el backend).
 * Si el backend cambia su contrato, solo se tocan este archivo y news.mapper.ts.
 */
export interface PublicacionDto {
  id: string;
  titulo: string;
  resumen: string | null;
  cuerpo: string;
  etiqueta: string | null;
  imagenUrl: string | null;
  publicadaEn: string | null;
}

export interface PaginaDto<T> {
  items: T[];
  total: number;
  pagina: number;
  limite: number;
}
