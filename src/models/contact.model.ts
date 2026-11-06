export type ContactType = 'RED_SOCIAL' | 'NUMERO_CONTACTO' | 'DIRECCION';

/** Dato de contacto público de la fundación (GET /api/contacto). */
export interface ContactInfo {
  nombre: string;
  tipo: ContactType;
  informacion: string;
}
