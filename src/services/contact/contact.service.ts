import type { ContactInfo } from '@/models';
import { mensajeDeError, newsApiClient } from '../http.client';

/** Información de contacto pública de la fundación (GET /api/contacto). */
export const contactService = {
  async list(signal?: AbortSignal): Promise<ContactInfo[]> {
    try {
      const { data } = await newsApiClient.get<ContactInfo[]>('/contacto', { signal });
      return data;
    } catch (error) {
      if (signal?.aborted) throw error;
      throw new Error(mensajeDeError(error, 'No se pudo cargar la información de contacto'));
    }
  },
};
