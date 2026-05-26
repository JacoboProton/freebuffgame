# Implementation Plan: Duobi-Jac Learning Platform

## Overview

Duobi-Jac es una plataforma de aprendizaje gamificada multipropósito construida con Next.js 14 + Node.js/Express + PostgreSQL/Prisma. El proyecto incluye gamificación completa (XP, streaks, achievements, leaderboards), mini-juegos educativos, y un panel de administración para crear contenido.

## Architecture Decisions

1. **Monorepo con Turborepo** — Estructura `/apps/web` (Next.js) y `/apps/api` (Express) compartidas bajo un repo
2. **JWT con httpOnly cookies** — Auth state gestionado lado cliente con Zustand + React Query
3. **Prisma ORM** — Database schema versioning, migrations, seed data
4. **shadcn/ui** — Componentes base customizados con Tailwind
5. **Framer Motion** — Animaciones del mascot Jac y transiciones

---

## Phase 1: Foundation (Estructura + Auth)

### Task 1.1: Setup Monorepo con Turbo
- [ ] Inicializar repo con `turbo init`
- [ ] Configurar `apps/web` (Next.js 14 App Router)
- [ ] Configurar `apps/api` (Express + TypeScript)
- [ ] Configurar `packages/shared` (tipos compartidos)
- [ ] Setup Tailwind + shadcn/ui en web
- [ ] **Verify:** `npm run build` completes sin errores

### Task 1.2: Database Schema (Prisma)
- [ ] Definir schema completo (User, Course, Module, Lesson, Enrollment, Progress, Achievement)
- [ ] Crear migrations iniciales
- [ ] **Verify:** `npm run db:push` successful

### Task 1.3: Auth System (API + Web)
- [ ] `POST /api/auth/register` — Crear usuario, hash password con bcrypt
- [ ] `POST /api/auth/login` — Validar credenciales, return JWT en cookie httpOnly
- [ ] `POST /api/auth/logout` — Clear cookie
- [ ] `GET /api/auth/me` — Devolver usuario actual
- [ ] Página de Login con form validación
- [ ] Página de Register con form validación
- [ ] Middleware de auth en API routes
- [ ] **Verify:** Registro → Login → Logout funciona end-to-end

### Task 1.4: Base Layout + Navigation
- [ ] App shell con Header y BottomNav
- [ ] Header: logo, XP bar, streak counter, avatar dropdown
- [ ] BottomNav: Home, Learn, Leaderboard, Profile
- [ ] Auth context + protected routes
- [ ] **Verify:** Responsive en mobile (375px) y desktop (1440px)

---

## Phase 2: Core Learning Experience

### Task 2.1: Course Catalog
- [ ] `GET /api/courses` — List courses con filtros
- [ ] `GET /api/courses/:id` — Course detail con modules
- [ ] Grid de cursos con CourseCard
- [ ] Filtros: categoría, dificultad, búsqueda
- [ ] **Verify:** Demo courses aparecen y son clickeables

### Task 2.2: Enrollment + Progress
- [ ] `POST /api/courses/:id/enroll` — Enroll usuario en curso
- [ ] Guardar enrollment en DB
- [ ] Dashboard muestra cursos en progreso
- [ ] **Verify:** Usuario puede ver cursos enrollados en dashboard

### Task 2.3: Lesson Engine
- [ ] `GET /api/lessons/:id` — Devolver contenido lesson
- [ ] `POST /api/lessons/:id/progress` — Guardar progress (score, XP, time)
- [ ] Multiple Choice component con feedback
- [ ] Fill in the Blank component
- [ ] Progress bar en lesson view
- [ ] Jac character en sidebar con mensajes
- [ ] **Verify:** Puedo completar una lesson y ver XP incrementado

### Task 2.4: Gamificación Core
- [ ] Sistema de XP (actualizar en cada lesson completada)
- [ ] Nivel sistema (500 XP por nivel)
- [ ] XP bar animado en header
- [ ] Level badge display
- [ ] **Verify:** XP incrementa correctamente, nivel sube al llegar a 500

---

## Phase 3: Gamificación Completa

### Task 3.1: Streak System
- [ ] Track lastActiveDate en User
- [ ] Calcular streak diario (con timezone handling)
- [ ] Streak counter en header con flame animation
- [ ] Visual warning si no ha activity hoy
- [ ] **Verify:** Streak incrementa con actividad diaria, se rompe si falta día

### Task 3.2: Achievements System
- [ ] Tabla Achievement con seed data (milestones predefinidos)
- [ ] `GET /api/achievements` — Todos achievements + unlocked del usuario
- [ ] Evaluator: check achievements después de cada action
- [ ] Modal de celebración cuando se unlockea achievement
- [ ] Confetti animation overlay
- [ ] **Verify:** Achievement unlockeado aparece con animación tras completar acción

### Task 3.3: Leaderboards
- [ ] `GET /api/leaderboard` — Top 100 por XP semanal/global
- [ ] Leaderboard page con tabs (weekly/all-time)
- [ ] Highlight tu posición
- [ ] Filter por amigos
- [ ] **Verify:** Leaderboard muestra usuarios ordenados por XP

### Task 3.4: Coins + Shop
- [ ] Sistema de coins (earn por completar lessons, achievements)
- [ ] `GET /api/shop/items` — Lista de items comprables
- [ ] `POST /api/shop/purchase` — Comprar item (deduct coins)
- [ ] Items: avatares, badges, streak freezes
- [ ] Stripe checkout integration para comprar más coins
- [ ] **Verify:** Puedo comprar item con coins, Stripe checkout funciona

### Task 3.5: Mini-Games Hub
- [ ] `GET /api/games` — Lista de juegos disponibles
- [ ] `POST /api/games/:id/score` — Submit score de minijuego
- [ ] Speed Match game (match concepts en tiempo limitado)
- [ ] Word Puzzle (ordenar letras para formar palabra)
- [ ] True/False Sprint (respuestas rápidas)
- [ ] Games award XP extra
- [ ] **Verify:** Puedo jugar minijuego y ver score en perfil

---

## Phase 4: Admin Panel

### Task 4.1: Admin Auth + Layout
- [ ] Middleware para verificar role admin
- [ ] Admin layout separado (/admin)
- [ ] Sidebar navigation para admin sections
- [ ] **Verify:** Solo admins pueden acceder /admin

### Task 4.2: Course Management
- [ ] CRUD completo de Courses
- [ ] CRUD de Modules dentro de Course
- [ ] CRUD de Lessons dentro de Module
- [ ] Editor de contenido (JSON para questions)
- [ ] Preview de lesson antes de publicar
- [ ] **Verify:** Puedo crear curso completo con modules y lessons

### Task 4.3: User Management + Analytics
- [ ] Lista de usuarios con search/pagination
- [ ] Ver stats de cualquier usuario
- [ ] Dashboard de analytics (usuarios totales, courses completados, revenue)
- [ ] **Verify:** Admin ve métricas y puede gestionar usuarios

---

## Phase 5: Polish + Demo Content

### Task 5.1: Demo Content Seed
- [ ] Seed data: 3 courses completos con contenido real
  - Fundamentos de IA (5 módulos, 15 lessons)
  - Finanzas Personales (4 módulos, 12 lessons)
  - Cocina Italiana (3 módulos, 10 lessons)
- [ ] Seed users con progress para demo
- [ ] **Verify:** Datos aparecen correctamente en la app

### Task 5.2: Animaciones + UX
- [ ] Jac character con animations (idle, happy, sad, celebrating)
- [ ] Confetti system reutilizable
- [ ] Page transitions suaves
- [ ] Loading skeletons
- [ ] Empty states con mensajes helpful
- [ ] **Verify:** UI se siente viva y responsive

### Task 5.3: Responsive + Accessibility
- [ ] Mobile-first responsive design
- [ ] Keyboard navigation completa
- [ ] ARIA labels en elementos interactivos
- [ ] Color contrast verificado
- [ ] **Verify:** Lighthouse accessibility score > 90

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex gamification logic | High | Implementar estado simple primero, iterar |
| Many lesson types | Medium | Empezar con 2-3, añadir más después |
| Stripe integration complexity | Medium | Usar Stripe Checkout (no custom flow) |
| Performance con many users | Low | Prisma query optimization + caching con React Query |
| Admin panel scope creep | High | Scope fixed: solo CRUD cursos, no analytics complejos |

---

## Dependencies

- Node.js 18+
- PostgreSQL 14+
- npm o pnpm

---

## Checkpoints

### Checkpoint 1: Foundation
- [ ] Auth funciona end-to-end
- [ ] App shell renderiza sin errores
- [ ] DB migrations successful

### Checkpoint 2: Learning Core
- [ ] Puedo enrollarme en curso
- [ ] Puedo completar lesson
- [ ] XP actualiza en UI

### Checkpoint 3: Gamification
- [ ] Streaks funcionan
- [ ] Achievements unlockean
- [ ] Leaderboard muestra rankings
- [ ] Coins se ganan y gastan

### Checkpoint 4: Admin
- [ ] Admin puede crear curso completo
- [ ] Analytics básicos visibles

### Checkpoint 5: Polish
- [ ] Demo content seeded
- [ ] Animaciones fluidas
- [ ] Mobile responsive