export type UserRole = 'ADMINISTRADOR' | 'TALLERISTA';

export const ALLOWED_ROLES: readonly UserRole[] = ['ADMINISTRADOR', 'TALLERISTA'] as const;

export interface LoginCredentials {
  correo_usuario: string;
  contraseña_usuario: string;
}

export interface BackendRoleItem {
  id_rol?: number;
  nombre_rol?: string;
}

export interface AuthUser {
  id?: string | number;
  id_usuario?: number;
  nombres: string;
  apellidos: string;
  correo_usuario: string;
  rol: UserRole;
  tipo_documento?: string;
  numero_identificacion?: string;
  telefono?: string;
}

export interface LoginResponse {
  token?: string;
  access_token?: string;
  accessToken?: string;
  jwt?: string;
  usuario?: Partial<AuthUser> & {
    rol?: string;
    roles?: Array<string | BackendRoleItem>;
  };
  user?: Partial<AuthUser> & {
    rol?: string;
    roles?: Array<string | BackendRoleItem>;
  };
  data?: {
    token?: string;
    access_token?: string;
    usuario?: Partial<AuthUser> & {
      rol?: string;
      roles?: Array<string | BackendRoleItem>;
    };
    user?: Partial<AuthUser> & {
      rol?: string;
      roles?: Array<string | BackendRoleItem>;
    };
    rol?: string;
  };
  rol?: string;
  roles?: Array<string | BackendRoleItem>;
  mensaje?: string;
  message?: string;
  error?: string;
}
