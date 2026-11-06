import axios from 'axios';
import type { CreateNewsPayload, CreateNewsResponse, UserRole } from '@/models';
import { newsApiClient } from './http.client';

export const newsService = {
  /**
   * Envía la creación de la noticia al segundo backend utilizando newsApiClient.
   * El interceptor de Axios adjunta automáticamente `Authorization: Bearer <token>`
   * leyendo el token almacenado en las cookies.
   */
  async createNews(
    payload: CreateNewsPayload,
    userRole: UserRole,
  ): Promise<CreateNewsResponse> {
    const sanitizedPayload: CreateNewsPayload = {
      ...payload,
      // Regla de negocio: solo el ADMINISTRADOR puede activar `esta_activo`.
      // Si el usuario es TALLERISTA, siempre se envía en `false` hasta que un Admin la apruebe.
      esta_activo: userRole === 'ADMINISTRADOR' ? Boolean(payload.esta_activo) : false,
      estado:
        userRole === 'TALLERISTA' && payload.estado === 'PUBLICADO'
          ? 'EN_REVISION'
          : payload.estado,
    };

    try {
      const response = await newsApiClient.post<CreateNewsResponse>(
        '/noticias',
        sanitizedPayload,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          (error.response?.data as { mensaje?: string; message?: string })?.mensaje ||
          (error.response?.data as { mensaje?: string; message?: string })?.message;
        if (message) {
          throw new Error(message);
        }
      }
      throw error;
    }
  },
};
