# TrackingCF Frontend

Interfaz web moderna para visualizar y analizar la actividad de usuarios en Codeforces. Diseñado para grupos de amigos, comunidades o instituciones que deseen monitorear el progreso de sus miembros usando de parámetro la actividad en CodeForces.

## 🎯 Características

- **Leaderboard en tiempo real** con sistema de puntuación personalizado
- **Sistema de rachas visual** con badges SVG (fuego naranja/gris)
- **Perfiles de usuario** con estadísticas detalladas y gráficos
- **Filtros por periodo** (Última semana, mes actual, año actual o desde siempre)
- **Últimas submissions** con avatares y colores por rating
- **Gráfica de actividad:** Score diario de los últimos 7 días
- **Tema oscuro/claro** con persistencia de preferencias
- **Diseño responsivo** optimizado para móviles y escritorio

## 📋 Requisitos Previos

- **Node.js** 16+ y npm
- **Backend de TrackingCF** corriendo (ver [repositorio backend](https://github.com/zlarosav/TrackingCF-backend))

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/zlarosav/TrackingCF-frontend.git
cd TrackingCF-frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo `.env.local.example` y renómbralo a `.env.local`:

```bash
cp .env.local.example .env.local
```

Edita el archivo `.env.local` con la URL de tu backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Para producción, cambia a tu URL de backend desplegado:

```env
NEXT_PUBLIC_API_URL=https://tu-backend.com/api
```

## 📝 Comandos Disponibles

### Desarrollo

```bash
npm run dev    # Iniciar servidor de desarrollo en http://localhost:3000
```

### Producción

```bash
npm run build  # Compilar para producción
npm start      # Iniciar servidor de producción
```

### Utilidades

```bash
npm run lint   # Ejecutar linter de código
```

## 🌐 Páginas Disponibles

- **`/`** - Leaderboard principal con ranking de usuarios y sistema de rachas
- **`/user/[handle]`** - Perfil detallado de usuario con estadísticas y gráficas
- **`/resources`** - Biblioteca de recursos de programación competitiva (Roadmaps, webs, etc.)
- **`/about`** - Información sobre el proyecto y créditos

## 🔥 Sistema de Rachas Visual

**Componente StreakBadge:**
- 🔥 **Naranja:** Racha activa (submission hoy)
- 🔥 **Gris:** Racha inactiva (submission ayer)
- Sin badge: Sin racha (>1 día sin submissions)

**Display:**
- Aparece en la tabla principal junto al nombre del usuario
- Aparece en el perfil del usuario
- Usa SVG icon (no emoji) para mejor control de estilos

## 🎨 Componentes Principales

### Leaderboard (`/`)
- Tabla de usuarios ordenable por cualquier columna
- Filtro de periodo (semana/mes/año/total)
- Sistema de colores por rating de Codeforces
- Badges de racha junto a nombres de usuarios
- Timestamp "Actualizado: XX" en timezone del backend

### Perfil de Usuario (`/user/[handle]`)
- Header con avatar, rating y badge de racha
- Gráfica de actividad de últimos 7 días (score diario)
- Tabla de últimas submissions con colores por dificultad
- Cards de estadísticas categorizadas

### Recursos (`/resources`)
- Grid de tarjetas de recursos con enlaces externos
- Categorías: Roadmaps, Canales de YouTube, Plataformas de Práctica
- Diseño responsive con tarjetas de altura variable

### Acerca de (`/about`)
- Información del proyecto
- Card de repositorio Open Source
- Créditos y stack tecnológico

### Componentes Reutilizables
- `StreakBadge` - Badge de racha SVG
- `LatestSubmissions` - Tabla de submissions recientes con colores dinámicos
- `PeriodFilter` - Selector de periodo
- `ChartView` - Gráfica de actividad semanal con auto-scaling
- `HeaderLogo` - Logo SVG con soporte para modo oscuro/claro

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Styling:** Tailwind CSS + shadcn/ui
- **Charts:** Recharts (gráfica de score diario)
- **Icons:** Lucide React + SVG custom
- **HTTP Client:** axios
- **Theme:** next-themes (dark/light mode)

## 🎨 Componentes UI (shadcn/ui)

El proyecto utiliza **shadcn/ui**, una colección de componentes reutilizables:

- Radix UI (primitivos accesibles)
- Tailwind CSS (estilos)
- class-variance-authority (variantes)

Los componentes están ubicados en `src/components/ui/` y son totalmente customizables.

## 📊 Sistema de Colores por Rating

Los nombres de usuarios se colorean según su rating de Codeforces:

- **Rojo:** 2400+ (Legendary Grandmaster, International Grandmaster, Grandmaster)
- **Naranja:** 2200-2399 (International Master, Master)
- **Violeta:** 1900-2199 (Candidate Master)
- **Azul:** 1600-1899 (Expert)
- **Cyan:** 1400-1599 (Specialist)
- **Verde:** 1200-1399 (Pupil)
- **Gris:** <1200 (Newbie) o sin rating

## 📦 Despliegue

### Opción 1: Vercel (Recomendado)

1. Haz fork del repositorio
2. Conecta tu repositorio en [Vercel](https://vercel.com)
3. Configura la variable de entorno `NEXT_PUBLIC_API_URL`
4. Deploy automático ✅

### Opción 2: Otras Plataformas con Soporte Node.js

Puedes desplegar en cualquier plataforma que soporte Next.js:
- **Netlify** (con Next.js Runtime)
- **Railway**
- **Render**
- **Fly.io**

**Pasos generales:**

```bash
npm run build
npm start
```

Esto iniciará un servidor Next.js en el puerto 3000.

**Importante:** Asegúrate de configurar `NEXT_PUBLIC_API_URL` en tu plataforma de deployment.

## ⚙️ Configuración Avanzada

### Cambio de plataforma de hosting

Si usas otra plataforma que no sea Vercel:

1. Revisa `next.config.js` y ajusta según la plataforma
2. Asegúrate de que soporte Next.js y Node.js (SSR)
3. Configura correctamente las variables de entorno

### Personalización de estilos

- **Colores y tema:** Edita `tailwind.config.js`
- **Estilos globales:** Modifica `src/app/globals.css`
- **Componentes UI:** Personaliza en `src/components/ui/`
- **Badge de racha:** Edita `src/components/StreakBadge.jsx`

### Sistema de Puntuación

El score se calcula según dificultad:
- Sin rating: 1 punto
- 800-900: 1 punto
- 1000: 2 puntos
- 1100: 3 puntos
- 1200+: 5 puntos

## 🔗 Conexión con Backend

El frontend se conecta al backend mediante `NEXT_PUBLIC_API_URL`. Asegúrate de que:

1. El backend esté corriendo y accesible
2. Las configuraciones de CORS en el backend incluyan tu dominio frontend
3. La URL del backend sea correcta (sin `/` al final)

**Endpoints consumidos:**
- `GET /api/users` - Lista de usuarios con rachas
- `GET /api/users/:handle` - Usuario individual con racha
- `GET /api/submissions` - Últimas submissions globales
- `GET /api/submissions/:handle` - Submissions de un usuario
- `GET /api/submissions/:handle/stats` - Estadísticas por periodo

## 📱 Responsive Design

El frontend está optimizado para:
- 📱 **Móviles:** Layout en columna, tablas scrolleables
- 💻 **Tablets:** Layout adaptativo
- 🖥️ **Desktop:** Layout completo con todas las columnas

## 🚀 Optimizaciones

- ✅ Sin polling automático (reduce carga en backend)
- ✅ Datos se cargan solo al:
  - Recargar página (F5)
  - Cambiar filtros de periodo
- ✅ React StrictMode optimizado (sin useEffect duplicados)
- ✅ Imágenes optimizadas con Next.js Image
- ✅ Code splitting automático con Next.js

## 🤝 Contribuciones

Este es un proyecto open source. Siéntete libre de hacer fork, reportar issues o enviar pull requests.

## 📄 Licencia

MIT
