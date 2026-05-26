# Duobi-Jac - Plataforma Educativa Gamificada

![Duobi-Jac](https://img.shields.io/badge/Status-En%20Desarrollo-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Turborepo](https://img.shields.io/badge/Turborepo-2.0-orange)

**Duobi-Jac** es una plataforma educativa gamificada donde puedes aprender jugando. Completa cursos, gana XP, sube de nivel, desbloquea logros y competes en el leaderboard.

## 🎮 Características

- **Cursos Interactivos**: Aprende con lecciones gamificadas
- **Sistema de XP y Niveles**: Gan XP por cada lección completada
- **Logros y Recompensas**: Desbloquea logros al alcanzar metas
- **Leaderboard Global**: Compite con otros usuarios
- **Tienda Virtual**: Canjea tus monedas por recompensas
- **Multi-idioma**: Soporte para español e inglés

## 🏗️ Arquitectura del Proyecto

```
freebuffgame/
├── apps/
│   └── web/              # Frontend Next.js 14
│       ├── src/
│       │   ├── app/      # App Router (pages y layouts)
│       │   ├── components/  # Componentes React
│       │   ├── lib/      # Utilidades y API client
│       │   └── stores/   # Zustand stores
│       └── prisma/       # Schema de base de datos
├── packages/
│   └── ui/               # Componentes UI compartidos
├── turbo.json            # Configuración Turborepo
└── package.json          # Workspace raíz
```

## 🚀 Inicio Rápido

### Prerequisites

- Node.js 18+
- npm o pnpm

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd freebuffgame

# Instalar dependencias
npm install

# Copiar variables de entorno
cp apps/web/.env.example apps/web/.env
# Editar .env con tus credenciales

# Iniciar desarrollo
npm run dev
```

### Desarrollo por componente

```bash
# Solo frontend (Next.js)
npm run dev:web

# Todos los servicios en paralelo
npm run dev
```

## 🌐 Despliegue

El proyecto está desplegado en [InsForge](https://insforge.dev):

- **Frontend**: https://rxktk3y4.insforge.site
- **Dashboard**: https://insforge.dev/dashboard/project/27e8dcec-6ccd-487d-8b3b-0d1b3b86d508

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utility-first
- **Framer Motion** - Animaciones
- **Zustand** - State management
- **TanStack Query** - Data fetching

### Backend (Futuro)
- **NestJS** - API backend
- **PostgreSQL** - Base de datos
- **Prisma** - ORM

### Infraestructura
- **Turborepo** - Monorepo build system
- **InsForge** - Hosting y base de datos
- **GitHub Actions** - CI/CD (futuro)

## 📝 Scripts Disponibles

```bash
npm run dev          # Iniciar todos los servicios
npm run dev:web      # Solo frontend
npm run build        # Build para producción
npm run lint         # Linting de código
npm run test         # Ejecutar tests
```

## 🔐 Variables de Entorno

```env
# Database
DATABASE_URL=postgresql://...

# InsForge
NEXT_PUBLIC_INSFORGE_URL=https://...
NEXT_PUBLIC_INSFORGE_ANON_KEY=...
INSFORGE_API_KEY=...

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# API
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 📄 Licencia

MIT License - ver archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Jacobo González Díaz** - [jacobogonzalezdiaz@protonmail.com](mailto:jacobogonzalezdiaz@protonmail.com)

---

Hecho con ❤️ para la comunidad de aprendizaje gratuito.