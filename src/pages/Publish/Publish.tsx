import { type FormEvent, useState } from 'react';
import { Brand } from '@/components/Brand';
import { Icon } from '@/common/atoms/Icon';
import { DrumArt } from '@/components/illustrations/DrumArt';
import type { AuthUser, CreateNewsPayload, NewsStatus } from '@/models';
import { newsService } from '@/services';
import { getAuthTokenFromCookie } from '@/utils/cookies.util';

const DEFAULT_TAGS = ['Historias', 'Talleres', 'Eventos', 'La Fundación'] as const;

export interface PublishPageProps {
  user?: AuthUser | null;
  onLogout?: () => void;
}

export function PublishPage({ user, onLogout }: PublishPageProps) {
  const isAdmin = user?.rol === 'ADMINISTRADOR';
  const currentRole = user?.rol ?? 'TALLERISTA';

  const [titulo, setTitulo] = useState('');
  const [resumen, setResumen] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [proposito, setProposito] = useState('');
  const [etiqueta, setEtiqueta] = useState<string>(DEFAULT_TAGS[0]);
  const [estado, setEstado] = useState<NewsStatus>(isAdmin ? 'PUBLICADO' : 'PENDIENTE_APROBACION');
  const [estaActivo, setEstaActivo] = useState<boolean>(isAdmin);

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
    payload?: CreateNewsPayload;
  } | null>(null);

  const buildPayload = (overrideStatus?: NewsStatus): CreateNewsPayload => {
    const finalStatus = overrideStatus ?? estado;
    const trimmedResumen = resumen.trim();
    const trimmedProposito = proposito.trim();
    const trimmedEtiqueta = etiqueta.trim();

    return {
      titulo: titulo.trim(),
      cuerpo: cuerpo.trim(),
      ...(trimmedResumen ? { resumen: trimmedResumen } : {}),
      ...(trimmedProposito ? { proposito: trimmedProposito } : {}),
      ...(trimmedEtiqueta ? { etiqueta: trimmedEtiqueta } : {}),
      estado: finalStatus === 'BORRADOR' ? 'BORRADOR' : 'PENDIENTE_APROBACION',
    };
  };

  const submitNews = async (overrideStatus?: NewsStatus) => {
    setFeedback(null);

    const finalStatus = overrideStatus ?? estado;
    const payload = buildPayload(overrideStatus);

    if (!payload.titulo || !payload.cuerpo) {
      setFeedback({
        type: 'error',
        message: 'Por favor completa los campos obligatorios: título y cuerpo de la noticia.',
      });
      return;
    }

    const tokenInCookie = getAuthTokenFromCookie();
    if (!tokenInCookie) {
      setFeedback({
        type: 'error',
        message: 'No se encontró un token de sesión activo en las cookies. Por favor inicia sesión nuevamente.',
      });
      return;
    }

    const shouldApproveAndActivate =
      isAdmin && finalStatus !== 'BORRADOR' && (finalStatus === 'PUBLICADO' || estaActivo);

    setSubmitting(true);
    try {
      await newsService.createNews(payload, currentRole, {
        approveAndActivate: shouldApproveAndActivate,
      });
      setFeedback({
        type: 'success',
        message: isAdmin
          ? shouldApproveAndActivate
            ? 'Noticia creada, aprobada y activada correctamente. Ya está publicada en el portal.'
            : 'Noticia guardada correctamente.'
          : 'Noticia enviada a revisión (PENDIENTE_APROBACION). Un administrador deberá aprobarla y activarla para su publicación.',
        payload,
      });
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'No se pudo conectar con el backend de noticias.';
      setFeedback({
        type: 'warning',
        message: `No se pudo completar el envío al servidor de noticias: ${errorMsg}`,
        payload,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitNews();
  };

  return (
    <main className="publisher">
      <div className="publisher-head">
        <div>
          <Brand />
          <h1>
            <Icon name="edit" size={19} /> Crear nueva noticia
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
        <div>
          <span className="status">
            {estado === 'BORRADOR'
              ? 'Borrador'
              : estado === 'PENDIENTE_APROBACION'
                ? 'Pendiente de aprobación'
                : 'Publicado'}
          </span>
          <button
            type="button"
            className="button secondary"
            disabled={submitting}
            onClick={() => {
              setEstado('BORRADOR');
              void submitNews('BORRADOR');
            }}
          >
            Guardar borrador
          </button>
          <button
            type="submit"
            form="create-news-form"
            className="button primary"
            disabled={submitting}
          >
            {submitting
              ? 'Enviando...'
              : isAdmin
                ? 'Guardar y publicar noticia'
                : 'Enviar a aprobación'}
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
          {feedback.payload && (
            <pre className="payload-preview">
              {JSON.stringify(feedback.payload, null, 2)}
            </pre>
          )}
        </div>
      )}

      <form id="create-news-form" className="publisher-grid" onSubmit={handleFormSubmit}>
        <section className="editor-card">
          <label>
            Título *
            <input
              type="text"
              name="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: El grupo de música prepara su primera muestra para las familias"
              required
            />
          </label>

          <label>
            Propósito (opcional)
            <input
              type="text"
              name="proposito"
              value={proposito}
              onChange={(e) => setProposito(e.target.value)}
              placeholder="Ej: Informar e invitar a la comunidad de familias al cierre de talleres artísticos"
            />
          </label>

          <div className="field-group">
            <span>Etiqueta (opcional)</span>
            <div className="chip-row">
              {DEFAULT_TAGS.map((tag) => (
                <button
                  type="button"
                  className={etiqueta === tag ? 'selected' : ''}
                  key={tag}
                  onClick={() => setEtiqueta(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
            <input
              type="text"
              name="etiqueta"
              className="mt-2"
              value={etiqueta}
              onChange={(e) => setEtiqueta(e.target.value)}
              placeholder="Selecciona una etiqueta o escribe una personalizada"
            />
          </div>

          <label>
            Resumen (opcional)
            <textarea
              name="resumen"
              value={resumen}
              onChange={(e) => setResumen(e.target.value)}
              placeholder="Breve descripción sobre la noticia que se mostrará en las tarjetas y vista previa..."
            />
          </label>

          <label>
            Cuerpo de la noticia *
            <textarea
              name="cuerpo"
              className="article-input"
              value={cuerpo}
              onChange={(e) => setCuerpo(e.target.value)}
              placeholder="Redacta aquí el contenido completo de la noticia..."
              required
            />
          </label>

          <div className="photo-field">
            <DrumArt compact />
            <div>
              <strong>Ilustración de portada</strong>
              <p>Sin fotos de banco. Usa material autorizado o una ilustración editorial.</p>
              <button type="button" className="pill">
                Cambiar portada
              </button>
            </div>
          </div>
          <div className="warning">
            Antes de publicar, confirma la autorización de uso de imagen de todas las personas que aparezcan.
          </div>
        </section>

        <aside className="publisher-side">
          <div className="editor-card">
            <h2>Estado y Aprobación</h2>

            <label>
              Estado
              <select
                name="estado"
                className="status-select"
                value={estado}
                onChange={(e) => setEstado(e.target.value as NewsStatus)}
              >
                <option value="BORRADOR">Borrador</option>
                <option value="PENDIENTE_APROBACION">Pendiente de aprobación</option>
                {isAdmin && <option value="PUBLICADO">Publicado</option>}
              </select>
            </label>

            <div className="field-group">
              <span>Activación y Notificación</span>
              {isAdmin ? (
                <label className="check-row admin-toggle">
                  <input
                    type="checkbox"
                    name="esta_activo"
                    checked={estaActivo}
                    onChange={(e) => setEstaActivo(e.target.checked)}
                  />
                  <span>
                    Activar noticia — envía notificación al portal para publicar.
                  </span>
                </label>
              ) : (
                <div className="locked-field-notice">
                  <Icon name="lock" size={14} />
                  <div>
                    <strong>Campo exclusivo de Administrador</strong>
                    <p>
                      Como Tallerista, puedes crear la noticia y enviarla a revisión. Un Administrador deberá aprobarla y activarla para que se publique y notifique al portal.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="editor-card preview">
            <h2>Vista previa de la tarjeta</h2>
            <DrumArt compact />
            <span className="preview-tag">{etiqueta || 'Etiqueta'}</span>
            <strong>{titulo || 'Título de la noticia'}</strong>
            <p>{resumen || 'El resumen de la noticia aparecerá aquí a medida que escribas.'}</p>
            {proposito && (
              <small className="preview-purpose">
                <strong>Propósito:</strong> {proposito}
              </small>
            )}
          </div>
        </aside>
      </form>
    </main>
  );
}

export function Publish(props: PublishPageProps) {
  return <PublishPage {...props} />;
}
