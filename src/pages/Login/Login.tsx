import { type FormEvent, useState } from 'react';
import { Brand } from '@/components/Brand';
import { Icon } from '@/common/atoms/Icon';
import type { AuthUser } from '@/models';
import { authService } from '@/services';

export interface LoginPageProps {
  onBack: () => void;
  onLoginSuccess?: (user: AuthUser) => void;
}

export function LoginPage({ onBack, onLoginSuccess }: LoginPageProps) {
  const [correoUsuario, setCorreoUsuario] = useState('');
  const [contrasenaUsuario, setContrasenaUsuario] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const { user } = await authService.login(
        {
          correo_usuario: correoUsuario.trim(),
          contraseña_usuario: contrasenaUsuario,
        },
        rememberMe,
      );

      setSuccessMessage(`Bienvenido/a, ${user.nombres} (${user.rol}). Redirigiendo al creador de noticias...`);
      onLoginSuccess?.(user);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado al iniciar sesión.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-intro">
          <div className="login-lock">
            <Icon name="lock" size={25} />
          </div>
          <span className="eyebrow">Área privada</span>
          <h1>Acceso para Administradores y Talleristas</h1>
          <p>
            Este espacio es exclusivo para Administradores y Talleristas autorizados de la Fundación ASISCO UP.
          </p>
          <div className="login-note">
            <Icon name="check" size={16} />
            <span>
              Los talleristas pueden redactar y enviar noticias a revisión; los administradores aprueban y activan su publicación.
            </span>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card-head">
            <Brand />
            <span>Administración · Talleristas</span>
          </div>
          <h2>Iniciar sesión</h2>
          <p>Ingresa con las credenciales registradas en la plataforma ASISCO UP.</p>
          <form onSubmit={handleSubmit}>
            <label>
              Correo electrónico
              <input
                type="email"
                name="correo_usuario"
                value={correoUsuario}
                onChange={(e) => setCorreoUsuario(e.target.value)}
                placeholder="ejemplo@correo.com"
                autoComplete="email"
                disabled={loading}
                required
              />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                name="contraseña_usuario"
                value={contrasenaUsuario}
                onChange={(e) => setContrasenaUsuario(e.target.value)}
                placeholder="Tu contraseña"
                autoComplete="current-password"
                disabled={loading}
                required
              />
            </label>
            <div className="login-options">
              <label>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />{' '}
                Recordar este equipo (guardar sesión en cookies)
              </label>
            </div>
            <button className="button primary full" type="submit" disabled={loading}>
              <Icon name="lock" size={15} />{' '}
              {loading ? 'Validando credenciales...' : 'Ingresar al panel'}
            </button>
          </form>

          {errorMessage && (
            <div className="login-feedback error" role="alert">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="login-feedback" role="status">
              {successMessage}
            </div>
          )}

          <button className="back-link" type="button" onClick={onBack}>
            ← Volver a UpNews
          </button>
          <small>
            Acceso restringido únicamente a roles ADMINISTRADOR y TALLERISTA. La sesión se almacena de forma segura en cookies.
          </small>
        </div>
      </section>
    </main>
  );
}

export function Login() {
  return <LoginPage onBack={() => {}} />;
}
