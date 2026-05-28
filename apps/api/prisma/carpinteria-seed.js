const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Creando curso de Carpintería...');

  const course = await prisma.course.create({
    data: {
      id: 'course-carpinteria-pro',
      title: 'Carpintería para Principiantes',
      description: 'Aprende los fundamentos de la carpintería, desde el uso de herramientas básicas hasta proyectos prácticos.',
      category: 'Oficios',
      difficulty: 'beginner',
      estimatedHours: 8,
      isPublished: true,
      isPro: true,
      price: 999,
      requiredLevel: 1,
    },
  });
  console.log('✅ Curso creado:', course.id);

  const module = await prisma.module.create({
    data: {
      id: 'mod-carpinteria-1',
      courseId: course.id,
      title: 'Herramientas Básicas',
      order: 1,
    },
  });
  console.log('✅ Módulo creado');

  await prisma.lesson.createMany({
    data: [
      {
        id: 'lesson-carp-1',
        moduleId: module.id,
        title: 'El Martillo',
        type: 'multiple_choice',
        content: JSON.stringify({ question: '¿Para qué se usa un martillo?', options: ['Cortar', 'Golpear', 'Medir', 'Pegar'], correctIndex: 1 }),
        xpReward: 20,
        order: 1,
      },
      {
        id: 'lesson-carp-2',
        moduleId: module.id,
        title: 'El Serrucho',
        type: 'true_false',
        content: JSON.stringify({ statement: 'El serrucho corta madera', correctAnswer: true }),
        xpReward: 15,
        order: 2,
      },
    ],
  });
  console.log('✅ Lecciones creadas');
  console.log('');
  console.log('¡Listo! Ve a http://localhost:3000/courses');
}

main()
  .catch(e => { console.error('ERROR:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());