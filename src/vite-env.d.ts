/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend principal del ecosistema (login). Ej: https://proyecto-asiscoup-g1.onrender.com */
  readonly VITE_AUTH_API_URL?: string;
  /** Backend de UP News terminado en /api. Ej: http://localhost:3000/api */
  readonly VITE_NEWS_API_URL?: string;
  /** Opcionales: activan la actualización en tiempo real (Supabase Realtime). */
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
