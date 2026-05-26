import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@duobijac.com' },
    update: {},
    create: {
      email: 'admin@duobijac.com',
      passwordHash: adminPassword,
      name: 'Jac Admin',
      role: 'admin',
      xp: 5000,
      level: 11,
      coins: 500,
      currentStreak: 15,
      longestStreak: 30,
    },
  });
  console.log('✅ Admin user created');

  // Create demo user
  const demoPassword = await bcrypt.hash('demo123', 12);
  const demo = await prisma.user.upsert({
    where: { email: 'demo@duobijac.com' },
    update: {},
    create: {
      email: 'demo@duobijac.com',
      passwordHash: demoPassword,
      name: 'Aprendiz Demo',
      role: 'user',
      xp: 750,
      level: 2,
      coins: 150,
      currentStreak: 5,
      longestStreak: 12,
    },
  });
  console.log('✅ Demo user created');

  // Create achievements
  const achievements = [
    { key: 'first_lesson', title: 'Primera Lección', description: 'Completa tu primera lección', icon: '🎯', xpReward: 10 },
    { key: 'first_xp', title: 'Primeros XP', description: 'Gana tus primeros 10 XP', icon: '⭐', xpReward: 5 },
    { key: 'xp_100', title: 'Centauro', description: 'Alcanza 100 XP totales', icon: '💯', xpReward: 20 },
    { key: 'xp_500', title: 'Guerrero', description: 'Alcanza 500 XP totales', icon: '⚔️', xpReward: 50 },
    { key: 'xp_1000', title: 'Campeón', description: 'Alcanza 1000 XP totales', icon: '🏆', xpReward: 100 },
    { key: 'streak_3', title: 'Tres en Raya', description: 'Mantén una racha de 3 días', icon: '🔥', xpReward: 15 },
    { key: 'streak_7', title: 'Semana Perfecta', description: 'Mantén una racha de 7 días', icon: '🌟', xpReward: 50 },
    { key: 'streak_30', title: 'Mes de Acero', description: 'Mantén una racha de 30 días', icon: '💪', xpReward: 200 },
    { key: 'course_complete', title: 'Graduado', description: 'Completa tu primer curso', icon: '🎓', xpReward: 100 },
    { key: 'perfect_score', title: 'Perfecto', description: 'Obtén 100% en una lección', icon: '💯', xpReward: 25 },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: achievement,
      create: achievement,
    });
  }
  console.log('✅ Achievements created');

  // Create games
  const games = [
    { key: 'speed_match', title: 'Speed Match', description: 'Combina conceptos antes de que se acabe el tiempo', icon: '🎮', xpReward: 30 },
    { key: 'word_puzzle', title: 'Word Puzzle', description: 'Ordena las letras para formar palabras', icon: '🧩', xpReward: 25 },
    { key: 'true_false_sprint', title: 'True/False Sprint', description: 'Responde verdadero o falso lo más rápido posible', icon: '⚡', xpReward: 20 },
  ];

  for (const game of games) {
    await prisma.game.upsert({
      where: { key: game.key },
      update: game,
      create: game,
    });
  }
  console.log('✅ Games created');

  // Create shop items
  const shopItems = [
    { key: 'avatar_cool', name: 'Avatar Cool', description: 'Un avatar genial para tu perfil', type: 'avatar', price: 100, icon: '😎' },
    { key: 'avatar_ninja', name: 'Avatar Ninja', description: 'Un ninja misterioso', type: 'avatar', price: 150, icon: '🥷' },
    { key: 'avatar_astronaut', name: 'Avatar Astronauta', description: 'Un astronauta espacial', type: 'avatar', price: 200, icon: '🚀' },
    { key: 'streak_freeze', name: 'Freeze de Racha', description: 'Protege tu racha por un día', type: 'streak_freeze', price: 50, icon: '🧊' },
    { key: 'badge_vip', name: 'Badge VIP', description: 'Un badge exclusivo para usuarios VIP', type: 'badge', price: 300, icon: '👑' },
  ];

  for (const item of shopItems) {
    await prisma.shopItem.upsert({
      where: { key: item.key },
      update: item,
      create: item,
    });
  }
  console.log('✅ Shop items created');

  // Create AI Fundamentals Course
  const aiCourse = await prisma.course.upsert({
    where: { id: 'course-ai-fundamentals' },
    update: {},
    create: {
      id: 'course-ai-fundamentals',
      title: 'Fundamentos de Inteligencia Artificial',
      description: 'Aprende los conceptos básicos de la IA, machine learning y redes neuronales. Ideal para principiantes curious about AI.',
      category: 'IA & Tech',
      difficulty: 'beginner',
      estimatedHours: 8,
      isPublished: true,
    },
  });

  // Module 1: ¿Qué es la IA?
  const module1 = await prisma.module.upsert({
    where: { id: 'ai-module-1' },
    update: {},
    create: {
      id: 'ai-module-1',
      courseId: aiCourse.id,
      title: '¿Qué es la Inteligencia Artificial?',
      order: 1,
    },
  });

  const lesson1_1 = await prisma.lesson.upsert({
    where: { id: 'ai-lesson-1-1' },
    update: {},
    create: {
      id: 'ai-lesson-1-1',
      moduleId: module1.id,
      title: 'Introducción a la IA',
      type: 'multiple_choice',
      content: {
        question: '¿Qué es la Inteligencia Artificial?',
        options: [
          'Un tipo de robot avanzado',
          'Sistemas que pueden aprender y tomar decisiones',
          'Solo relacionado con computadoras',
          'Un lenguaje de programación',
        ],
        correctIndex: 1,
      },
      xpReward: 20,
      order: 1,
    },
  });

  const lesson1_2 = await prisma.lesson.upsert({
    where: { id: 'ai-lesson-1-2' },
    update: {},
    create: {
      id: 'ai-lesson-1-2',
      moduleId: module1.id,
      title: 'Tipos de IA',
      type: 'fill_blank',
      content: {
        sentence: 'La IA que puede aprender de datos se llama ___ learning.',
        correctAnswer: 'machine',
        hint: 'Es una palabra de dos partes',
      },
      xpReward: 25,
      order: 2,
    },
  });

  const lesson1_3 = await prisma.lesson.upsert({
    where: { id: 'ai-lesson-1-3' },
    update: {},
    create: {
      id: 'ai-lesson-1-3',
      moduleId: module1.id,
      title: 'IA en nuestra vida diaria',
      type: 'true_false',
      content: {
        statement: 'Los asistentes de voz como Siri son ejemplos de IA.',
        correctAnswer: true,
      },
      xpReward: 15,
      order: 3,
    },
  });

  // Module 2: Machine Learning
  const module2 = await prisma.module.upsert({
    where: { id: 'ai-module-2' },
    update: {},
    create: {
      id: 'ai-module-2',
      courseId: aiCourse.id,
      title: 'Machine Learning',
      order: 2,
    },
  });

  const lesson2_1 = await prisma.lesson.upsert({
    where: { id: 'ai-lesson-2-1' },
    update: {},
    create: {
      id: 'ai-lesson-2-1',
      moduleId: module2.id,
      title: '¿Qué es Machine Learning?',
      type: 'multiple_choice',
      content: {
        question: '¿Cuál es la principal característica del Machine Learning?',
        options: [
          'No necesita datos',
          'Aprende automáticamente de los datos',
          'Siempre da respuestas perfectas',
          'Solo funciona en computadoras potentes',
        ],
        correctIndex: 1,
      },
      xpReward: 20,
      order: 1,
    },
  });

  console.log('✅ AI Course created with modules and lessons');

  // Create Finanzas Personales Course
  const finanzasCourse = await prisma.course.upsert({
    where: { id: 'course-finanzas' },
    update: {},
    create: {
      id: 'course-finanzas',
      title: 'Finanzas Personales para Principiantes',
      description: 'Aprende a gestionar tu dinero, crear presupuestos y hacer inversiones inteligentes desde cero.',
      category: 'Finanzas',
      difficulty: 'beginner',
      estimatedHours: 6,
      isPublished: true,
    },
  });

  const finModule1 = await prisma.module.upsert({
    where: { id: 'fin-module-1' },
    update: {},
    create: {
      id: 'fin-module-1',
      courseId: finanzasCourse.id,
      title: 'Presupuesto Básico',
      order: 1,
    },
  });

  await prisma.lesson.upsert({
    where: { id: 'fin-lesson-1-1' },
    update: {},
    create: {
      id: 'fin-lesson-1-1',
      moduleId: finModule1.id,
      title: '¿Qué es un presupuesto?',
      type: 'multiple_choice',
      content: {
        question: '¿Para qué sirve un presupuesto?',
        options: [
          'Para gastar todo tu dinero',
          'Para saber cuánto dinero tienes y en qué gastarlo',
          'Solo para empresas',
          'Para pedir préstamos',
        ],
        correctIndex: 1,
      },
      xpReward: 20,
      order: 1,
    },
  });

  await prisma.lesson.upsert({
    where: { id: 'fin-lesson-1-2' },
    update: {},
    create: {
      id: 'fin-lesson-1-2',
      moduleId: finModule1.id,
      title: 'Gastos fijos vs variables',
      type: 'matching',
      content: {
        pairs: [
          { left: 'Renta', right: 'Gasto fijo' },
          { left: 'Comida', right: 'Gasto variable' },
          { left: 'Internet', right: 'Gasto fijo' },
          { left: 'Entretenimiento', right: 'Gasto variable' },
        ],
      },
      xpReward: 30,
      order: 2,
    },
  });

  console.log('✅ Finanzas Course created');

  // Create Inglés Course
  const inglesCourse = await prisma.course.upsert({
    where: { id: 'course-ingles' },
    update: {},
    create: {
      id: 'course-ingles',
      title: 'Inglés para Principiantes',
      description: 'Domina las bases del inglés con lecciones interactivas, vocabulario esencial y pronunciación práctica.',
      category: 'Idiomas',
      difficulty: 'beginner',
      estimatedHours: 12,
      isPublished: true,
    },
  });

  const engModule1 = await prisma.module.upsert({
    where: { id: 'eng-module-1' },
    update: {},
    create: {
      id: 'eng-module-1',
      courseId: inglesCourse.id,
      title: 'Saludos y Presentaciones',
      order: 1,
    },
  });

  await prisma.lesson.upsert({
    where: { id: 'eng-lesson-1-1' },
    update: {},
    create: {
      id: 'eng-lesson-1-1',
      moduleId: engModule1.id,
      title: 'Saludos básicos',
      type: 'multiple_choice',
      content: {
        question: '¿Cómo se dice \"Hola, ¿cómo estás?\" en inglés?',
        options: [
          'Hello, how are you?',
          'Goodbye, see you',
          'Thank you very much',
          'Yes, I understand',
        ],
        correctIndex: 0,
      },
      xpReward: 15,
      order: 1,
    },
  });

  console.log('✅ Inglés Course created');

  // Create demo enrollments and progress for demo user
  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: demo.id, courseId: aiCourse.id } },
    update: {},
    create: {
      userId: demo.id,
      courseId: aiCourse.id,
    },
  });

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: demo.id, lessonId: lesson1_1.id } },
    update: {},
    create: {
      userId: demo.id,
      lessonId: lesson1_1.id,
      completed: true,
      score: 100,
      xpEarned: 20,
      timeSpent: 120,
      attempts: 1,
      completedAt: new Date(),
    },
  });

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: demo.id, lessonId: lesson1_2.id } },
    update: {},
    create: {
      userId: demo.id,
      lessonId: lesson1_2.id,
      completed: true,
      score: 80,
      xpEarned: 20,
      timeSpent: 180,
      attempts: 2,
      completedAt: new Date(),
    },
  });

  console.log('✅ Demo enrollment and progress created');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📝 Test accounts:');
  console.log('   Admin: admin@duobijac.com / admin123');
  console.log('   Demo: demo@duobijac.com / demo123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });