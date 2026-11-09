import { useCallback, useEffect, useState } from 'react';
import { Brand } from '@/components/Brand';
import { Icon } from '@/common/atoms/Icon';
import { DrumArt } from '@/components/illustrations/DrumArt';
import type { AuthUser, ManagedNews, Page } from '@/models';
import { fueCancelada, newsGestionService } from '@/services';

export interface DraftsPageProps {
  user?: AuthUser | null;
  onNavigate?: (page: Page) => void;
  onEditDraft?: (id: string) => void;
  onLogout?: () => void;
}

const formatoFechaHora = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatearFecha(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    return formatoFechaHora.format(new Date(iso));
  } catch {
    return '';
  }
}

export function Drafts({ user, onNavigate, onEditDraft, onLogout }: DraftsPageProps) {
  const isAdmin = user?.rol === 'ADMINISTRADOR';
  const [drafts, setDrafts] = useState<ManagedNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadDrafts = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await newsGestionService.listByStatus('BORRADOR', signal);
      setDrafts(data);
    } catch (err) {
      if (fueCancelada(err)) return;
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los borradores.');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadDrafts(controller.signal);
    return () => controller.abort();
  }, [loadDrafts]);

  const handleAction = async (draft: ManagedNews) => {
    setFeedback(null);
    setProcessingId(draft.id);
    try {
      if (isAdmin) {
        await newsGestionService.approveAndPublish(draft.id);
        setFeedback({
          type: 'success',
          message: `La noticia "${draft.titulo}" fue aprobada y publicada en la página principal.`,
        });
      } else {
        await newsGestionService.requestPublication(draft.id);
        setFeedback({
          type: 'success',
          message: `Se solicitó la publicación de "${draft.titulo}". El administrador la revisará pronto.`,
        });
      }
      setDrafts((prev) => prev.filter((item) => item.id !== draft.id));
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'No se pudo procesar la acción.',
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <main className="publisher">
      <div className="publisher-head">
        <div>
          <Brand />
          <h1>
            <Icon name="clock" size={19} /> Mis borradores
          </h1>
          {user && (
            <div className="publisher-user-badge">
              <span>
                Sesión activa: <strong>{user.nombres} {user.apellidos}</strong> ({user.correo_usuario})
              </span>
              <span className={`role-badge ${isAdmin ? 'admin' : 'tallerista'}`}>
                {user.rol}
              </span>
            </div>
          )}
        </div>
        <div className="publisher-nav-actions">
          <button
            type="button"
            className="button secondary"
            onClick={() => onNavigate?.('publicar')}
          >
            <Icon name="edit" size={15} /> Crear nueva noticia
          </button>
          {isAdmin && (
            <button
              type="button"
              className="button orange"
              onClick={() => onNavigate?.('solicitudes')}
            >
              <Icon name="send" size={15} /> Ver solicitudes
            </button>
          )}
          {onLogout && (
            <button type="button" className="pill" onClick={onLogout}>
              Cerrar sesión
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className={`save-notice ${feedback.type}`}>
          <div>
            <Icon name="check" size={16} /> <span>{feedback.message}</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="editor-card management-empty">
          <p className="news-status">Cargando tus borradores guardados...</p>
        </div>
      ) : error ? (
        <div className="editor-card management-empty">
          <p className="news-status error">{error}</p>
          <button type="button" className="button secondary" onClick={() => void loadDrafts()}>
            Reintentar
          </button>
        </div>
      ) : drafts.length === 0 ? (
        <div className="editor-card management-empty">
          <strong>No tienes borradores guardados en este momento</strong>
          <p>
            Cuando guardes un borrador desde la vista de crear noticia, aparecerá aquí para que puedas retomarlo, editarlo o {isAdmin ? 'publicarlo' : 'solicitar su publicación'} cuando quieras.
          </p>
          <button type="button" className="button primary" onClick={() => onNavigate?.('publicar')}>
            <Icon name="edit" size={15} /> Crear una noticia
          </button>
        </div>
      ) : (
        <section className="management-grid" aria-label="Lista de borradores">
          {drafts.map((draft) => {
            const isProcessing = processingId === draft.id;
            return (
              <article key={draft.id} className="editor-card management-card">
                <div className="management-card-media">
                  {draft.imagenUrl ? (
                    <img className="photo-preview" src={draft.imagenUrl} alt={draft.titulo} />
                  ) : (
                    <DrumArt compact />
                  )}
                  <span className="status">Borrador</span>
                </div>

                <div className="management-card-body">
                  <div className="management-meta">
                    <span className="preview-tag">{draft.etiqueta || 'Sin etiqueta'}</span>
                    {draft.actualizadoEn && (
                      <small>Actualizado: {formatearFecha(draft.actualizadoEn)}</small>
                    )}
                  </div>

                  <h2>{draft.titulo}</h2>

                  <p className="management-excerpt">
                    {draft.resumen || draft.cuerpo.slice(0, 180) + (draft.cuerpo.length > 180 ? '…' : '')}
                  </p>

                  {draft.proposito && (
                    <small className="preview-purpose">
                      <strong>Propósito:</strong> {draft.proposito}
                    </small>
                  )}

                  <div className="management-actions">
                    <button
                      type="button"
                      className="button secondary"
                      disabled={isProcessing}
                      onClick={() => onEditDraft?.(draft.id)}
                    >
                      <Icon name="edit" size={15} /> Editar borrador
                    </button>
                    <button
                      type="button"
                      className="button primary"
                      disabled={isProcessing}
                      onClick={() => void handleAction(draft)}
                    >
                      <Icon name={isAdmin ? 'check' : 'send'} size={15} />
                      {isProcessing
                        ? 'Procesando...'
                        : isAdmin
                          ? 'Publicar ahora'
                          : 'Solicitar publicación'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
