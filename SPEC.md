# SPEC.md — Duobi-Jac Learning Platform

## 1. Concept & Vision

**Duobi-Jac** es una plataforma de aprendizaje gamificada multipropósito, donde la mascota es un cabrito energetic y divertido llamado **Jac**. A diferencia de Duolingo (enfocado solo en idiomas), Duobi-Jac acepta cualquier tema: idiomas, inteligencia artificial, finanzas personales, cocina, programación, historia, ciencia — literalmente cualquier cosa que alguien quiera aprender.

La experiencia debe sentirse como un juego adictivo pero educativo: streaks diarios, XP, niveles, achievements,Minijuegos entre lecciones, leaderboards sociales, y un sentido real de progreso. Jac el cabrito guía al usuario con personalidad (mensajes animados, celebraciones, consuelos cuando falla).

**Tagline:** *“Aprende cualquier cosa. Con Jac, todo es posible.”*

---

## 2. Design Language

### Aesthetic Direction
Inspirado en apps modernas de gamificación (Duolingo, Habitica, Headspace) pero con personalidad propia. Colors vivos pero no kitsch. Ilustraciones friendly y approachable. El cabrito Jac aparece en momentos clave como mascot animada.

### Color Palette
```
Primary (Verde Energía):     #22C55E  — El verde de Jac, éxito, progreso
Primary Dark:                #16A34A  — Hover states
Secondary (Azul Profundo):   #3B82F6  — Info, XP, elementos secundarios
Accent (Amarillo Sol):       #FACC15  — Achievements, stars, rewards
Accent Alt (Coral):          #F97316  — Streaks, urgency, flame
Background:                  #FAFAFA  — Fondo claro principal
Background Alt:              #F3F4F6  — Cards, sections
Surface:                     #FFFFFF  — Componentes elevados
Text Primary:                #1F2937  — Texto principal
Text Secondary:              #6B7280  — Texto secundario
Error:                       #EF4444  — Rojo para errores
Success:                     #22C55E  — Verde para éxito
```

### Typography
- **Headings:** `Nunito` (Google Font) — Rounded, friendly, approachable
- **Body:** `Inter` (Google Font) — Legible, moderna, excelente para UI
- **Monospace (código):** `JetBrains Mono`

### Spatial System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96
- Border radius: 8px (small), 12px (medium), 16px (large), 24px (extra-large), 9999px (pill)
- Shadows: Usar sombras sutiles, nunca black-opacity-50

### Motion Philosophy
- **Micro-interactions:** 150ms ease-out para hover, 200ms para state changes
- **Page transitions:** 300ms ease-in-out con fade + slight translate
- **Celebrations:** Spring animations para achievements (scale overshoot 1.1 → 1.0)
- **Character animations:** Jac tiene idle animation (breathing), celebration (bouncing), sad (droopy ears)

### Visual Assets
- **Icons:** Lucide React (consistent, clean)
- **Illustrations:** SVG del cabrito Jac en diferentes poses/estados
- **Decorative:** Shapes geométricas suaves, badges de achievements, confetti para celebraciones

---

## 3. Layout & Structure

### App Shell
```
┌─────────────────────────────────────────────────────────────┐
│  Header: Logo + Nav + XP Bar + Streak + Avatar              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                     Main Content Area                       │
│                   (Routes change here)                      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Bottom Nav (Mobile): Home | Learn | Leaderboard | Profile  │
└─────────────────────────────────────────────────────────────┘
```

### Pages

#### 1. Home/Dashboard
- Hero con Jac animated + mensaje personalizado
- Progress del día (XP goal visual)
- Current streak con flame animation
- Lecciones en progreso (continue learning)
- Recommended courses por interés
- Daily challenge preview

#### 2. Course Catalog
- Grid de cursos por categoría
- Filtros: idioma, nivel, duración, rating
- Cada curso: thumbnail, título, % completado, módulos count
- Search con sugerencias

#### 3. Lesson View (Core Experience)
- Progress bar con paso actual
- Content area (puede ser: quiz, fill-blank, multiple choice, matching, typing practice, video embed)
- XP counter animado
- Timer opcional (para challenges)
- Jac reactions en derecha

#### 4. Mini-Games Hub
- Grid de juegos disponibles
- Cada juego: icono, nombre, XP reward, best score
- Juegos: Speed Match, Word Puzzle, True/False Sprint, Fill Blitz

#### 5. Leaderboard
- Rankings semanales/mensuales
- Tu posición con highlight
- Lista de amigos/top learners
- Filter por curso

#### 6. Profile & Stats
- Stats: total XP, streak actual, lessons completed, time spent
- Achievements grid
- Activity heatmap
- Customizable avatar con items de reward

---

## 4. Features & Interactions

### Gamification System

#### XP & Levels
- Cada lesson bien completada = 10-50 XP basado en dificultad
- Bonus por speed completion, no mistakes
- Nivel se incrementa cada 500 XP
- Level badge visible en perfil y header

#### Streaks
- Streak actual prominently displayed con flame icon
- Si pierde un día: streak se rompe, mensaje de Jac triste
- Freeze streak: item comprable con coins gained

#### Coins & Shop
- Earn coins por completar lessons, maintain streaks, achievements
- Shop: avatares, badges, streak freezes, themes

#### Achievements
- Unlock badges por milestones (First lesson, 7-day streak, 100 XP, etc.)
- Achievement popup con confetti

#### Daily Goals
- Meta diaria de XP (default 50)
- Progress ring en dashboard
- Celebration cuando se completa

### Learning Flow

#### Course Structure
```
Course
├── Module 1
│   ├── Lesson 1.1 (Quiz: Multiple choice)
│   ├── Lesson 1.2 (Fill in the blank)
│   └── Lesson 1.3 (Mini-game: Speed match)
├── Module 2
│   ├── Lesson 2.1 (Matching pairs)
│   └── ...
└── Final Quiz (Review + badge)
```

#### Lesson Types
1. **Multiple Choice:** 4 opciones, feedback inmediato
2. **Fill in the Blank:** Input con autocomplete
3. **Matching:** Drag & drop pairs
4. **True/False:** Quick tap response
5. **Typing:** Practice writing/typing
6. **Listening:** Audio playback + respond (para idiomas)
7. **Mini-Game Integration:** Juegos intercalados para break

#### Lesson Flow
1. Intro: objetivo de la lesson (Jac says it)
2. Exercise 1: pregunta easy
3. Exercise 2: pregunta medium
4. ...
5. Final exercise: challenging
6. Complete: XP gained + Jac celebrates + show mistakes

#### Error Handling
- Wrong answer: shake animation, red highlight, Jac shows correct answer
- Hint system: 3 hints por lesson (reduce XP bonus)
- Skip option: pero no XP gained

### Social Features

#### Leaderboards
- Weekly XP leaderboard
- Course-specific leaderboards
- Friends list

#### Sharing
- Share achievements to social
- Invite friends (bonus coins)

---

## 5. Component Inventory

### Navigation Components

#### Header
- Logo (Duobi-Jac text + Jac icon)
- Nav links (desktop)
- XP progress bar (shows % to next level)
- Streak counter (flame icon + number)
- Avatar dropdown
- States: default, scrolled (shadow), lesson mode (minimal)

#### BottomNav (Mobile)
- 4 tabs: Home, Learn, Leaderboard, Profile
- Active state: filled icon + label
- Badge on Learn if in-progress lesson

### Card Components

#### CourseCard
- Thumbnail (image or gradient)
- Title, category tag
- Progress bar (% completo)
- Duration estimate
- Hover: lift + shadow increase
- Locked state: grayscale + lock icon

#### LessonCard
- Number badge
- Title
- Type icon (quiz, game, video)
- Completion checkmark
- Duration
- States: locked, available, in-progress, completed

#### AchievementCard
- Icon/badge artwork
- Title
- Description
- Date unlocked
- States: locked (grayscale silhouette), unlocked (full color + glow)

### Interactive Components

#### Button
- Variants: primary, secondary, ghost, danger
- Sizes: sm, md, lg
- States: default, hover (scale 1.02), active (scale 0.98), disabled (opacity 50%), loading (spinner)
- Icon support: left, right, icon-only

#### XPBadge
- Animated counter
- Coin icon
- Pop animation on gain

#### StreakCounter
- Flame icon (animated flicker)
- Number
- Glow effect if streak > 7

#### ProgressBar
- Linear with rounded ends
- Animated fill
- Optional label

#### QuizOption
- Card-style buttons
- States: default, hover, selected, correct (green border + check), incorrect (red border + shake)
- Feedback text below

#### Input
- Label above
- Placeholder text
- States: default, focused (ring), error (red border + message), disabled
- Helper text support

### Feedback Components

#### Toast
- Success, error, info variants
- Icon + message + optional action
- Auto-dismiss 3s
- Stack multiple

#### Modal
- Overlay con blur
- Title, content, actions
- Close button
- Animation: scale + fade in

#### ConfettiOverlay
- Triggered on achievements, course completion
- Celebratory particle effect
- Jac bouncing in corner

### Character Components

#### JacCharacter
- SVG del cabrito
- Animations: idle, happy, sad, celebrating, thinking
- Speech bubble con mensaje
- Props: mood, message, position

---

## 6. Technical Approach

### Stack
- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **State:** Zustand (client) + React Query (server)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT + cookies (httpOnly)
- **Animations:** Framer Motion

### Architecture

```
/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/
│   │   │   ├── (auth)/        # Login, register
│   │   │   ├── (main)/        # Dashboard, courses, lessons
│   │   │   ├── (game)/        # Mini-games
│   │   │   ├── leaderboard/
│   │   │   └── profile/
│   │   ├── components/
│   │   ├── lib/
│   │   └── stores/
│   └── api/                    # Express backend
│       ├── src/
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── middlewares/
│       │   └── utils/
│       └── prisma/
│           └── schema.prisma
├── packages/
│   └── shared/                 # Shared types, constants
└── SPEC.md
```

### Data Model

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  name          String
  avatar        String?
  xp            Int       @default(0)
  level         Int       @default(1)
  coins         Int       @default(0)
  currentStreak Int       @default(0)
  longestStreak Int       @default(0)
  lastActiveAt  DateTime  @default(now())
  createdAt     DateTime  @default(now())
  
  enrollments   Enrollment[]
  progress      LessonProgress[]
  achievements  UserAchievement[]
}

model Course {
  id          String   @id @default(cuid())
  title       String
  description String
  category    String
  imageUrl    String?
  difficulty  String   // beginner, intermediate, advanced
  estimatedHours Int
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  modules     Module[]
  enrollments Enrollment[]
}

model Module {
  id       String @id @default(cuid())
  courseId String
  title    String
  order    Int
  
  course   Course @relation(fields: [courseId], references: [id])
  lessons  Lesson[]
}

model Lesson {
  id        String @id @default(cuid())
  moduleId  String
  title     String
  type      String // multiple_choice, fill_blank, matching, typing, game
  content   Json   // Question data
  xpReward  Int    @default(20)
  order     Int
  
  module    Module @relation(fields: [moduleId], references: [id])
  progress  LessonProgress[]
}

model Enrollment {
  id        String   @id @default(cuid())
  userId    String
  courseId  String
  startedAt DateTime @default(now())
  completed Boolean  @default(false)
  
  user      User   @relation(fields: [userId], references: [id])
  course    Course @relation(fields: [courseId], references: [id])
  
  @@unique([userId, courseId])
}

model LessonProgress {
  id          String   @id @default(cuid())
  userId      String
  lessonId    String
  completed   Boolean  @default(false)
  score       Int      @default(0)
  xpEarned    Int      @default(0)
  timeSpent   Int      // seconds
  attempts    Int      @default(0)
  completedAt DateTime?
  
  user        User   @relation(fields: [userId], references: [id])
  lesson      Lesson @relation(fields: [lessonId], references: [id])
  
  @@unique([userId, lessonId])
}

model Achievement {
  id          String @id @default(cuid())
  key         String @unique
  title       String
  description String
  icon        String
  xpReward    Int    @default(10)
  
  userAchievements UserAchievement[]
}

model UserAchievement {
  id            String   @id @default(cuid())
  userId        String
  achievementId String
  unlockedAt    DateTime @default(now())
  
  user          User        @relation(fields: [userId], references: [id])
  achievement   Achievement @relation(fields: [achievementId], references: [id])
  
  @@unique([userId, achievementId])
}
```

### API Design

#### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Login, returns JWT in httpOnly cookie
- `POST /api/auth/logout` — Clear cookie
- `GET /api/auth/me` — Current user

#### Courses
- `GET /api/courses` — List all published courses
- `GET /api/courses/:id` — Course detail with modules
- `POST /api/courses/:id/enroll` — Enroll in course

#### Lessons
- `GET /api/lessons/:id` — Lesson content
- `POST /api/lessons/:id/progress` — Submit progress

#### Gamification
- `GET /api/user/stats` — User stats (XP, streak, level)
- `GET /api/leaderboard` — Top users
- `GET /api/achievements` — All achievements + user's unlocked

#### Games
- `POST /api/games/:id/score` — Submit mini-game score

### Example Content (Demo)

#### Course: Fundamentos de Inteligencia Artificial
```json
{
  title: 'Fundamentos de Inteligencia Artificial',
  category: 'AI & Tech',
  difficulty: 'beginner',
  modules: [
    {
      title: '¿Qué es la IA?',
      lessons: [
        { type: 'multiple_choice', title: '¿Qué es la Inteligencia Artificial?', xp: 20 },
        { type: 'fill_blank', title: 'Tipos de IA', xp: 25 },
        { type: 'game', title: 'Speed Match: Conceptos de IA', xp: 30 }
      ]
    },
    {
      title: 'Machine Learning',
      lessons: [
        { type: 'multiple_choice', title: '¿Qué es Machine Learning?', xp: 20 },
        { type: 'matching', title: 'Tipos de aprendizaje', xp: 30 },
        { type: 'typing', title: 'Algoritmos comunes', xp: 25 }
      ]
    }
  ]
}
```

#### Course: Finanzas Personales para Principiantes
```json
{
  title: 'Finanzas Personales para Principiantes',
  category: 'Finance',
  difficulty: 'beginner',
  modules: [
    {
      title: 'Presupuesto Básico',
      lessons: [
        { type: 'multiple_choice', title: '¿Qué es un presupuesto?', xp: 20 },
        { type: 'fill_blank', title: 'Gastos fijos vs variables', xp: 25 }
      ]
    }
  ]
}
```

---

## 7. Commands

```bash
# Development
npm run dev          # Start all apps (web + api) with turbo
npm run dev:web      # Start only web (Next.js)
npm run dev:api      # Start only api (Express)

# Build
npm run build        # Build all apps

# Database
npm run db:push      # Push Prisma schema to DB
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed with demo content

# Testing
npm run test         # Run all tests
npm run test:web     # Test only web app
npm run lint         # Lint all
```

---

## 8. Success Criteria

### Phase 1 (Foundation)
- [ ] User can register and login
- [ ] Dashboard shows user stats (XP, level, streak)
- [ ] Course catalog displays demo courses
- [ ] User can enroll in a course

### Phase 2 (Learning Experience)
- [ ] User can navigate through course modules and lessons
- [ ] Multiple choice questions work with feedback
- [ ] Fill in the blank exercises work
- [ ] XP is awarded and persists
- [ ] Streak updates on daily activity

### Phase 3 (Gamification)
- [ ] Achievements system works
- [ ] Leaderboard shows rankings
- [ ] Mini-games accessible and award XP
- [ ] Coins earned and displayed

### Phase 4 (Polish)
- [ ] Jac animations play at appropriate moments
- [ ] Confetti celebration on achievements
- [ ] Responsive design works on mobile
- [ ] All states handled (loading, error, empty)

---

## 9. Open Questions

~~1. **Payment/Shop:** ~~Decided: Pagos in-app con Stripe~~
~~2. **Multiplayer:** ~~Decided: Ambos (amigos + global)~~
~~3. **Content Creation:** ~~Decided: Panel de admin completo~~

## 10. Additional Features

### Payment System (Stripe)
- Checkout integrado con Stripe para comprar coins/gems
- Planes de subscription opcionales (Premium)
- Webhooks para validar pagos

### Admin Panel
- CRUD completo de cursos, módulos, lecciones
- Editor de contenido (Rich text para preguntas)
- Dashboard de analytics (views, completions, revenue)
- Gestión de usuarios

### Social
- Añadir amigos por username/email
- Leaderboard global y de amigos
- Compartir achievements

---