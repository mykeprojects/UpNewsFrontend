import { supabase } from '@/lib/supabase';

/**
 * Tiempo real: cuando el bot publica, edita o archiva una noticia, Supabase avisa y
 * los componentes vuelven a pedir los datos al backend (el backend sigue siendo la
 * única fuente de verdad; Realtime solo dice "algo cambió").
 * Si no hay VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY, no hace nada.
 */
type Listener = () => void;
const listeners = new Set<Listener>();
let channel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;

export function onNewsChanged(listener: Listener): () => void {
  listeners.add(listener);
  if (supabase && !channel) {
    channel = supabase
      .channel('upnews-publicaciones')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'publicacion' }, () => {
        listeners.forEach((notify) => notify());
      })
      .subscribe();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && channel && supabase) {
      void supabase.removeChannel(channel);
      channel = null;
    }
  };
}
