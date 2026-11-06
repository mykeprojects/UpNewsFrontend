import { useEffect, useState } from 'react';
import { onNewsChanged } from '@/services/news';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Ejecuta una consulta al backend cuando cambian sus dependencias y la repite
 * cuando llega un aviso de tiempo real. Cancela la petición anterior si el
 * componente cambia o se desmonta.
 */
export function useApi<T>(fetcher: (signal: AbortSignal) => Promise<T>, deps: unknown[]): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({ data: null, loading: true, error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => onNewsChanged(() => setVersion((v) => v + 1)), []);

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null }));
    fetcher(controller.signal)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error: Error) => {
        // Si se canceló (cambió la página o llegó un aviso nuevo), se ignora el error.
        if (!controller.signal.aborted) setState({ data: null, loading: false, error: error.message });
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version]);

  return state;
}
