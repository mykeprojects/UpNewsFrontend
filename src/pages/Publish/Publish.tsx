import { type ChangeEvent, type FormEvent, useState } from 'react';
import { Brand } from '@/components/Brand';
import { Icon } from '@/common/atoms/Icon';
import { DrumArt } from '@/components/illustrations/DrumArt';
import type { AuthUser, CreateNewsPayload, NewsStatus } from '@/models';
import { newsGestionService, TIPOS_IMAGEN } from '@/services';
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
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

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
      imagenUrl,
    };
  };

  const mensajeExito = (payload: CreateNewsPayload): string => {
    if (payload.estado === 'BORRADOR') return 'Borrador guardado. Puedes seguir editándolo antes de enviarlo.';
    if (payload.estado === 'EN_REVISION') {
      return 'Noticia enviada a revisión. La directora deberá aprobarla y activarla para que aparezca en la web.';
    }
    return payload.esta_activo
      ? 'Noticia aprobada y activada: ya es visible en la página principal.'
      : 'Noticia aprobada. Todavía no se muestra: actívala para que aparezca en la web.';
  };

  const limpiarFormulario = () => {
    setTitulo('');
    setResumen('');
    setCuerpo('');
    setProposito('');
    setImagenUrl(null);
    setEstaActivo(false);
  };

  const handleImagen = async (event: ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0];
    event.target.value = '';
    if (!archivo) return;
    setFeedback(null);
    setSubiendoImagen(true);
    try {
      setImagenUrl(await newsGestionService.uploadImage(archivo));
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'No se pudo subir la imagen.' });
    } finally {
      setSubiendoImagen(false);
    }
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
      await newsGestionService.createNews(payload, currentRole);
      setFeedback({ type: 'success', message: mensajeExito(payload) });
      limpiarFormulario();
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo guardar la noticia.',
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
            disabled={submitting || subiendoImagen}
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
            disabled={submitting || subiendoImagen}
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
            {imagenUrl ? <img className="photo-preview" src={imagenUrl} alt="Portada de la noticia" /> : <DrumArt compact />}
            <div>
              <strong>Foto de portada (opcional)</strong>
              <p>JPG, PNG o WebP de hasta 10 MB. Sin fotos de banco; usa material propio y autorizado.</p>
              <label className="pill photo-upload">
                {subiendoImagen ? 'Subiendo...' : imagenUrl ? 'Cambiar foto' : 'Subir foto'}
                <input type="file" accept={TIPOS_IMAGEN.join(',')} onChange={handleImagen} disabled={subiendoImagen} hidden />
              </label>
              {imagenUrl && (
                <button type="button" className="pill" onClick={() => setImagenUrl(null)}>
                  Quitar foto
                </button>
              )}
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
                    Mostrar en la web apenas se apruebe (estado PUBLICADO). Si no la activas, queda aprobada pero oculta.
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
            {imagenUrl ? <img className="photo-preview" src={imagenUrl} alt="" /> : <DrumArt compact />}
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
