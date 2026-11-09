import { useCallback, useEffect, useState } from 'react';
import { Brand } from '@/components/Brand';
import { Icon } from '@/common/atoms/Icon';
import { DrumArt } from '@/components/illustrations/DrumArt';
import type { AuthUser, ManagedNews, Page } from '@/models';
import { fueCancelada, newsGestionService } from '@/services';
import { YouTubeVideo } from '@/common/molecules/YouTubeVideo/YouTubeVideo';

export interface RequestsPageProps {
  user?: AuthUser | null;
  onNavigate?: (page: Page) => void;
  onEditRequest?: (id: string) => void;
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

export function Requests({ user, onNavigate, onEditRequest, onLogout }: RequestsPageProps) {
  const isAdmin = user?.rol === 'ADMINISTRADOR';
  const [requests, setRequests] = useState<ManagedNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadRequests = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await newsGestionService.listByStatus('PENDIENTE_APROBACION', signal);
      if (signal?.aborted) return;
      setRequests(data);
      setError(null);
    } catch (err) {
      if (signal?.aborted || fueCancelada(err)) return;
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las solicitudes.');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadRequests(controller.signal);
    return () => controller.abort();
  }, [loadRequests]);

  const handleApproveAndPublish = async (req: ManagedNews) => {
    setFeedback(null);
    setProcessingId(req.id);
    try {
      await newsGestionService.approveAndPublish(req.id);
      setFeedback({
        type: 'success',
        message: `La solicitud "${req.titulo}" ha sido aprobada y publicada en la página principal.`,
      });
      setRequests((prev) => prev.filter((item) => item.id !== req.id));
      if (expandedId === req.id) {
        setExpandedId(null);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'No se pudo aprobar y publicar la solicitud.',
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
            <Icon name="send" size={19} /> Solicitudes de publicación
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
            <Icon name="edit" size={15} /> Crear noticia
          </button>
          <button
            type="button"
            className="button secondary"
            onClick={() => onNavigate?.('borradores')}
          >
            <Icon name="clock" size={15} /> Mis borradores
          </button>
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
          <p className="news-status">Cargando solicitudes pendientes de aprobación...</p>
        </div>
      ) : error ? (
        <div className="editor-card management-empty">
          <p className="news-status error">{error}</p>
          <button type="button" className="button secondary" onClick={() => void loadRequests()}>
            Reintentar
          </button>
        </div>
      ) : requests.length === 0 ? (
        <div className="editor-card management-empty">
          <strong>No hay solicitudes pendientes por revisar</strong>
          <p>
            Cuando los talleristas soliciten la publicación de una noticia, aparecerá en esta lista para que puedas revisarla y decidir su publicación.
          </p>
          <button type="button" className="button secondary" onClick={() => onNavigate?.('publicar')}>
            Volver a crear noticia
          </button>
        </div>
      ) : (
        <section className="requests-list" aria-label="Solicitudes de talleristas">
          {requests.map((req) => {
            const isExpanded = expandedId === req.id;
            const isProcessing = processingId === req.id;

            return (
              <article key={req.id} className="editor-card request-card">
                <div className="request-card-top">
                  <div className="request-card-media">
                    {req.tipoEvidencia === 'VIDEO' && req.imagenUrl ? (
                      <YouTubeVideo url={req.imagenUrl} title={req.titulo} />
                    ) : req.imagenUrl ? (
                      <img className="photo-preview" src={req.imagenUrl} alt={req.titulo} />
                    ) : (
                      <DrumArt compact />
                    )}
                  </div>

                  <div className="request-card-info">
                    <div className="management-meta">
                      <span className="preview-tag">{req.etiqueta || 'Noticias'}</span>
                      <span className="status">Pendiente de aprobación</span>
                      {req.actualizadoEn && (
                        <small>Enviada: {formatearFecha(req.actualizadoEn)}</small>
                      )}
                    </div>

                    <h2>{req.titulo}</h2>

                    {req.resumen && (
                      <p className="management-excerpt">
                        <strong>Resumen:</strong> {req.resumen}
                      </p>
                    )}

                    {req.proposito && (
                      <small className="preview-purpose">
                        <strong>Propósito:</strong> {req.proposito}
                      </small>
                    )}

                    <div className="management-actions">
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => setExpandedId(isExpanded ? null : req.id)}
                      >
                        {isExpanded ? 'Ocultar contenido completo' : 'Leer solicitud completa'}
                      </button>

                      {onEditRequest && (
                        <button
                          type="button"
                          className="button secondary"
                          disabled={isProcessing}
                          onClick={() => onEditRequest(req.id)}
                        >
                          <Icon name="edit" size={15} /> Editar
                        </button>
                      )}

                      <button
                        type="button"
                        className="button primary"
                        disabled={isProcessing}
                        onClick={() => void handleApproveAndPublish(req)}
                      >
                        <Icon name="check" size={15} />
                        {isProcessing ? 'Publicando...' : 'Aprobar y publicar'}
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="request-detail-preview">
                    <h3>Cuerpo completo de la noticia</h3>
                    <div className="request-body-text">
                      {req.cuerpo.split('\n').map((paragraph, index) =>
                        paragraph.trim() ? <p key={index}>{paragraph}</p> : <br key={index} />,
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
