export type NewsArt = 'screen' | 'bread' | 'heart';
export type NewsTone = 'orange' | 'cream' | 'green';

/** Noticia tal como la usan los componentes públicos (ya traducida desde el backend). */
export interface News {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  body: string;
  /** Foto real subida a Cloudinary; si no hay, se usa la ilustración (`art`). */
  imageUrl: string | null;
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

// ── Gestión (formulario "Publicar") ───────────────────────────

/** Opciones del selector de estado del formulario. */
export type NewsStatus = 'BORRADOR' | 'EN_REVISION' | 'PUBLICADO';

/** Lo que captura el formulario. El servicio lo traduce al contrato del backend. */
export interface CreateNewsPayload {
  titulo: string;
  resumen: string;
  cuerpo: string;
  proposito: string;
  etiqueta: string;
  estado: NewsStatus;
  /** Solo ADMINISTRADOR: activarla para que se vea en la web apenas se apruebe. */
  esta_activo: boolean;
  imagenUrl?: string | null;
}

/** Estados reales de una publicación en el backend. */
export type BackendNewsStatus = 'BORRADOR' | 'PENDIENTE_APROBACION' | 'PUBLICADA' | 'ARCHIVADA';

/** Respuesta del backend al crear o modificar (PublicacionInternaDto). */
export interface ManagedNews {
  id: string;
  titulo: string;
  resumen: string | null;
  cuerpo: string;
  etiqueta: string | null;
  imagenUrl: string | null;
  publicadaEn: string | null;
  estado: BackendNewsStatus;
  estaActivo: boolean;
  autorId: string;
  proposito: string | null;
  actualizadoEn: string;
}
