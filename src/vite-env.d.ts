/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL del backend de UP News, sin barra final. Ej: http://localhost:3000 */
  readonly VITE_API_URL?: string;
  /** Opcionales: activan la actualización en tiempo real (Supabase Realtime). */
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
