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
  const [estado, setEstado] = useState<NewsStatus>(isAdmin ? 'PUBLICADO' : 'EN_REVISION');
  const [estaActivo, setEstaActivo] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
    payload?: CreateNewsPayload;
  } | null>(null);

  const buildPayload = (overrideStatus?: NewsStatus): CreateNewsPayload => {
    const finalStatus = overrideStatus ?? estado;
    return {
      titulo: titulo.trim(),
      resumen: resumen.trim(),
      cuerpo: cuerpo.trim(),
      proposito: proposito.trim(),
      etiqueta: etiqueta.trim(),
      estado: !isAdmin && finalStatus === 'PUBLICADO' ? 'EN_REVISION' : finalStatus,
      esta_activo: isAdmin ? estaActivo : false,
    };
  };

  const submitNews = async (overrideStatus?: NewsStatus) => {
    setFeedback(null);

    const payload = buildPayload(overrideStatus);

    if (!payload.titulo || !payload.resumen || !payload.cuerpo || !payload.proposito || !payload.etiqueta) {
      setFeedback({
        type: 'error',
        message: 'Por favor completa todos los campos obligatorios: título, resumen, cuerpo, propósito y etiqueta.',
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

    setSubmitting(true);
    try {
      await newsService.createNews(payload, currentRole);
      setFeedback({
        type: 'success',
        message: isAdmin
          ? payload.esta_activo
            ? 'Noticia creada y activada correctamente. Se enviará la notificación para renderizar en el portal.'
            : 'Noticia guardada correctamente.'
          : 'Noticia enviada a revisión. Un administrador deberá aprobarla y activarla para su publicación.',
        payload,
      });
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'No se pudo conectar con el backend de noticias.';
      setFeedback({
        type: 'warning',
        message: `Petición preparada con Bearer Token desde cookies (Interceptor Axios). Respuesta del servidor de noticias: ${errorMsg}`,
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
              : estado === 'EN_REVISION'
                ? 'En revisión'
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
            Título (`titulo`) *
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
            Propósito (`proposito`) *
            <input
              type="text"
              name="proposito"
              value={proposito}
              onChange={(e) => setProposito(e.target.value)}
              placeholder="Ej: Informar e invitar a la comunidad de familias al cierre de talleres artísticos"
              required
            />
          </label>

          <div className="field-group">
            <span>Etiqueta (`etiqueta`) *</span>
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
              required
            />
          </div>

          <label>
            Resumen (`resumen`) *
            <textarea
              name="resumen"
              value={resumen}
              onChange={(e) => setResumen(e.target.value)}
              placeholder="Breve descripción sobre la noticia que se mostrará en las tarjetas y vista previa..."
              required
            />
          </label>

          <label>
            Cuerpo de la noticia (`cuerpo`) *
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
              Estado (`estado`)
              <select
                name="estado"
                className="status-select"
                value={estado}
                onChange={(e) => setEstado(e.target.value as NewsStatus)}
              >
                <option value="BORRADOR">BORRADOR</option>
                <option value="EN_REVISION">EN_REVISION (Pendiente de aprobación)</option>
                {isAdmin && <option value="PUBLICADO">PUBLICADO (Aprobado por Admin)</option>}
              </select>
            </label>

            <div className="field-group">
              <span>Activación y Notificación (`esta_activo`)</span>
              {isAdmin ? (
                <label className="check-row admin-toggle">
                  <input
                    type="checkbox"
                    name="esta_activo"
                    checked={estaActivo}
                    onChange={(e) => setEstaActivo(e.target.checked)}
                  />
                  <span>
                    Activar noticia (`esta_activo: {estaActivo ? 'true' : 'false'}`) — envía notificación al frontend para renderizar.
                  </span>
                </label>
              ) : (
                <div className="locked-field-notice">
                  <Icon name="lock" size={14} />
                  <div>
                    <strong>Campo exclusivo de Administrador (`esta_activo: false`)</strong>
                    <p>
                      Como Tallerista, puedes crear la noticia y enviarla a revisión. Un Administrador deberá aprobarla y activar <code>esta_activo</code> para que se publique y notifique al portal.
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
