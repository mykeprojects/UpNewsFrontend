# UPNews Frontend

Aplicación web frontend para **UPNews**, desarrollada con **React 19**, **TypeScript**, **Vite** y **Tailwind CSS v4**.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu equipo:

- **[Node.js](https://nodejs.org/)** (versión `20.x` o superior recomendada)
- **npm** (incluido automáticamente al instalar Node.js, versión `10.x` o superior)
- **[Git](https://git-scm.com/)**

Puedes verificar que estén instalados corriendo en tu terminal:

```bash
node -v
npm -v
```

---

## 📦 Gestión de Dependencias (`package.json`)

En este proyecto de **Node.js / React**, las dependencias se gestionan a través de:

- **`package.json`**: Declara todas las librerías que necesita el proyecto (`dependencies` y `devDependencies`), sus versiones y los comandos de ejecución (`scripts`).
- **`package-lock.json`**: Guarda el árbol exacto de versiones instaladas para garantizar que a todos los integrantes del equipo les funcione igual sin conflictos de versiones.

---

## 🚀 Instalación Paso a Paso

Sigue estos comandos en tu terminal para descargar e instalar todas las dependencias del frontend:

### 1. Clonar el repositorio (si aún no lo tienes)
```bash
git clone <URL_DEL_REPOSITORIO>
cd frontend-upnews
```

### 2. Instalar las dependencias
Ejecuta el siguiente comando en la raíz del proyecto. Este comando leerá automáticamente `package.json` y descargará todas las librerías necesarias dentro de la carpeta `node_modules`:

```bash
npm install
```

> **Alternativa (instalación limpia):** Si deseas instalar estrictamente las versiones exactas bloqueadas en `package-lock.json`, puedes ejecutar:
> ```bash
> npm ci
> ```

### 3. Configurar las variables de entorno
Copia la plantilla y ajústala (el archivo `.env` no se sube al repositorio):

```bash
cp .env.example .env
```

| Variable | Para qué sirve |
|---|---|
| `VITE_AUTH_API_URL` | Backend principal del ecosistema: login de la fundación (`/api/auth/login`, `/api/auth/perfil`). |
| `VITE_NEWS_API_URL` | Backend de UP News **terminado en `/api`**. En local: `http://localhost:3000/api`. |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Opcionales: activan el tiempo real (la portada se actualiza sola cuando se activa una noticia). |

### Cómo se conecta con el backend de UP News

| Pantalla | Endpoint |
|---|---|
| Portada | `GET /api/publicaciones` (público, paginado; solo noticias activas) |
| Histórico `/noticias` | `GET /api/publicaciones/historico` (público, paginado; aprobadas activas o inactivas) |
| Filtros de etiqueta y detalle | `GET /api/publicaciones/etiquetas`, `/api/publicaciones/:id` (públicos) |
| Pie de página (contacto) | `GET /api/contacto` (público) |
| Publicar (con sesión) | `POST /api/gestion/publicaciones`; si la directora publica: `/:id/aprobar` o `/:id/aprobar-y-activar` |
| Foto de portada | `POST /api/gestion/upload-signature` y subida directa a Cloudinary |

El histórico acepta `pagina`, `limite` (máximo 50), `etiqueta` (`Comunidad`, `Eventos`, `Salud` o `Consejos`, sin distinguir mayúsculas) y `busqueda` (coincidencias en el título). El detalle por id también permite consultar publicaciones aprobadas inactivas.

Las peticiones de gestión llevan `Authorization: Bearer <token>` (lo agrega el interceptor de Axios en `src/services/http.client.ts`).

---

## 💻 Comandos para Ejecutar el Proyecto

Una vez instaladas las dependencias, puedes utilizar los siguientes comandos:

### Iniciar el servidor de desarrollo
Levanta la aplicación en modo desarrollo con recarga rápida (Hot Module Replacement):
```bash
npm run dev
```
Luego abre en tu navegador la URL que indique la terminal (por defecto `http://localhost:5173`).

### Compilar para producción
Genera los archivos optimizados para producción en la carpeta `dist/`:
```bash
npm run build
```

### Previsualizar la versión de producción
Sirve localmente la versión compilada para verificar cómo se verá en producción:
```bash
npm run preview
```

### Formatear el código
Ejecuta `oxfmt` para dar formato consistente al código del proyecto:
```bash
npm run format
```

---

## 📁 Estructura Principal del Proyecto

```text
frontend-upnews/
├── src/
│   ├── assets/        # Imágenes y recursos estáticos
│   ├── common/        # Componentes reutilizables (atoms, molecules, organisms, constants)
│   ├── components/    # Componentes específicos de vistas
│   ├── hooks/         # Custom React Hooks
│   ├── layout/        # Componentes de estructura (Navbar, Footer, etc.)
│   ├── models/        # Interfaces y tipos de TypeScript
│   ├── pages/         # Vistas principales (Home, Article, Publish, Projects, Agenda, About, Login)
│   ├── styles/        # Estilos globales y configuración de Tailwind CSS
│   ├── App.tsx        # Componente raíz de la aplicación
│   └── main.tsx       # Punto de entrada de React
├── index.html         # Plantilla HTML principal
├── package.json       # Configuración de dependencias y scripts de npm
├── package-lock.json  # Bloqueo de versiones exactas de dependencias
├── tsconfig.json      # Configuración de TypeScript
└── vite.config.ts     # Configuración de Vite
```
