import axios from 'axios';
import {
  ALLOWED_ROLES,
  type AuthUser,
  type BackendRoleItem,
  type LoginCredentials,
  type LoginResponse,
  type UserRole,
} from '@/models';
import {
  clearAuthSessionCookies,
  getAuthTokenFromCookie,
  getAuthUserFromCookie,
  saveAuthSessionCookies,
} from '@/utils/cookies.util';
import { authApiClient } from './http.client';

function normalizeAllowedRole(rawRole?: string | null): UserRole | null {
  if (!rawRole) return null;
  const upper = rawRole.trim().toUpperCase();
  if (upper === 'ADMINISTRADOR' || upper === 'ADMIN') {
    return 'ADMINISTRADOR';
  }
  if (upper === 'TALLERISTA') {
    return 'TALLERISTA';
  }
  return null;
}

function extractRoleFromRolesArray(
  roles?: unknown,
): UserRole | null {
  if (!Array.isArray(roles)) return null;

  // Priorizar ADMINISTRADOR si el usuario tiene ambos roles
  const normalizedList: UserRole[] = [];
  for (const item of roles) {
    if (typeof item === 'string') {
      const role = normalizeAllowedRole(item);
      if (role) normalizedList.push(role);
    } else if (item && typeof item === 'object') {
      const roleObj = item as BackendRoleItem & { rol?: string; name?: string };
      const role = normalizeAllowedRole(roleObj.nombre_rol || roleObj.rol || roleObj.name);
      if (role) normalizedList.push(role);
    }
  }

  if (normalizedList.includes('ADMINISTRADOR')) return 'ADMINISTRADOR';
  if (normalizedList.includes('TALLERISTA')) return 'TALLERISTA';
  return null;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function extractToken(data: LoginResponse): string | null {
  return (
    data.token ||
    data.access_token ||
    data.accessToken ||
    data.jwt ||
    data.data?.token ||
    data.data?.access_token ||
    null
  );
}

export const authService = {
  async login(
    credentials: LoginCredentials,
    rememberMe = false,
  ): Promise<{ token: string; user: AuthUser }> {
    try {
      const response = await authApiClient.post<LoginResponse>('/api/auth/login', credentials);
      const data = response.data;
      const token = extractToken(data);

      if (!token) {
        throw new Error('El servidor no devolvió un token de sesión válido.');
      }

      const rawUser = data.usuario || data.user || data.data?.usuario || data.data?.user;
      const jwtClaims = decodeJwtPayload(token);

      let profileData: Record<string, unknown> | null = null;
      try {
        const profileRes = await authApiClient.get<Record<string, unknown>>('/api/auth/perfil', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        profileData =
          (profileRes.data?.usuario as Record<string, unknown>) ||
          (profileRes.data?.user as Record<string, unknown>) ||
          (profileRes.data?.data as Record<string, unknown>) ||
          profileRes.data;
      } catch {
        // Si /api/auth/perfil falla pero ya tenemos datos en el login o en el JWT, continuamos con ellos
      }

      const allowedRole =
        extractRoleFromRolesArray(profileData?.roles) ||
        extractRoleFromRolesArray(rawUser?.roles) ||
        extractRoleFromRolesArray(data.roles) ||
        extractRoleFromRolesArray(jwtClaims?.roles) ||
        normalizeAllowedRole(
          (profileData?.rol as string | undefined) ||
            (profileData?.role as string | undefined) ||
            rawUser?.rol ||
            data.rol ||
            data.data?.rol ||
            (jwtClaims?.rol as string | undefined) ||
            (jwtClaims?.role as string | undefined),
        );

      if (!allowedRole || !ALLOWED_ROLES.includes(allowedRole)) {
        clearAuthSessionCookies();
        throw new Error(
          'Acceso denegado. Este portal es exclusivo para usuarios con rol ADMINISTRADOR o TALLERISTA.',
        );
      }

      const userId =
        (profileData?.id_usuario as number | undefined) ??
        (profileData?.id as string | number | undefined) ??
        rawUser?.id_usuario ??
        rawUser?.id ??
        (jwtClaims?.id_usuario as number | undefined) ??
        (jwtClaims?.id as string | number | undefined);

      const user: AuthUser = {
        id: userId,
        id_usuario: typeof userId === 'number' ? userId : undefined,
        nombres:
          (profileData?.nombres as string | undefined) ||
          rawUser?.nombres ||
          (jwtClaims?.nombres as string | undefined) ||
          'Usuario',
        apellidos:
          (profileData?.apellidos as string | undefined) ||
          rawUser?.apellidos ||
          (jwtClaims?.apellidos as string | undefined) ||
          '',
        correo_usuario:
          (profileData?.correo_usuario as string | undefined) ||
          rawUser?.correo_usuario ||
          credentials.correo_usuario,
        rol: allowedRole,
        tipo_documento:
          (profileData?.tipo_documento as string | undefined) || rawUser?.tipo_documento,
        numero_identificacion:
          (profileData?.numero_identificacion as string | undefined) ||
          rawUser?.numero_identificacion,
        telefono: (profileData?.telefono as string | undefined) || rawUser?.telefono,
      };

      saveAuthSessionCookies(token, user, rememberMe);

      return { token, user };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const backendMessage =
          (error.response?.data as { mensaje?: string; message?: string; error?: string })
            ?.mensaje ||
          (error.response?.data as { mensaje?: string; message?: string; error?: string })
            ?.message ||
          (error.response?.data as { mensaje?: string; message?: string; error?: string })?.error;

        if (backendMessage) {
          throw new Error(backendMessage);
        }
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw new Error('Credenciales incorrectas. Verifica tu correo y contraseña.');
        }
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('No fue posible conectar con el servidor de autenticación.');
    }
  },

  async getProfile(): Promise<AuthUser | null> {
    const token = getAuthTokenFromCookie();
    if (!token) return null;

    try {
      const response = await authApiClient.get<Record<string, unknown>>('/api/auth/perfil');
      const raw =
        (response.data?.usuario as Record<string, unknown>) ||
        (response.data?.user as Record<string, unknown>) ||
        (response.data?.data as Record<string, unknown>) ||
        response.data;

      const allowedRole =
        extractRoleFromRolesArray(raw?.roles) ||
        normalizeAllowedRole(
          (raw?.rol as string | undefined) || (raw?.role as string | undefined),
        );

      if (!allowedRole) {
        clearAuthSessionCookies();
        return null;
      }

      const cachedUser = getAuthUserFromCookie();
      const userId =
        (raw?.id_usuario as number | undefined) ??
        (raw?.id as string | number | undefined) ??
        cachedUser?.id_usuario ??
        cachedUser?.id;

      const updatedUser: AuthUser = {
        id: userId,
        id_usuario: typeof userId === 'number' ? userId : undefined,
        nombres: (raw?.nombres as string | undefined) || cachedUser?.nombres || 'Usuario',
        apellidos: (raw?.apellidos as string | undefined) || cachedUser?.apellidos || '',
        correo_usuario:
          (raw?.correo_usuario as string | undefined) || cachedUser?.correo_usuario || '',
        rol: allowedRole,
        tipo_documento:
          (raw?.tipo_documento as string | undefined) || cachedUser?.tipo_documento,
        numero_identificacion:
          (raw?.numero_identificacion as string | undefined) || cachedUser?.numero_identificacion,
        telefono: (raw?.telefono as string | undefined) || cachedUser?.telefono,
      };

      saveAuthSessionCookies(token, updatedUser);
      return updatedUser;
    } catch {
      return getAuthUserFromCookie();
    }
  },

  getCurrentSession(): { token: string | null; user: AuthUser | null } {
    const token = getAuthTokenFromCookie();
    const user = getAuthUserFromCookie();
    if (!token || !user || !ALLOWED_ROLES.includes(user.rol)) {
      return { token: null, user: null };
    }
    return { token, user };
  },

  logout(): void {
    clearAuthSessionCookies();
  },
};
