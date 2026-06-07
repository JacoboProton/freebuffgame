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
      estimatedHours: 15,
      isPublished: true,
      isPro: true,
      price: 999,
      requiredLevel: 1,
    },
  });
  console.log('✅ Curso creado:', course.id);

  // ── Módulo 1: Herramientas Básicas ──
  const mod1 = await prisma.module.create({
    data: { id: 'mod-carpinteria-1', courseId: course.id, title: 'Herramientas Básicas', order: 1 },
  });

  await prisma.lesson.createMany({
    data: [
      {
        id: 'lesson-carp-1', moduleId: mod1.id, title: 'El Martillo', type: 'multiple_choice', order: 1, xpReward: 20,
        content: JSON.stringify({ question: '¿Para qué se usa un martillo de carpintero?', options: ['Cortar madera', 'Golpear clavos y piezas', 'Medir dimensiones', 'Lijar superficies'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-2', moduleId: mod1.id, title: 'El Serrucho', type: 'true_false', order: 2, xpReward: 15,
        content: JSON.stringify({ statement: 'El serrucho de cola de rata se usa para cortes curvos en madera', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-3', moduleId: mod1.id, title: 'El Destornillador', type: 'multiple_choice', order: 3, xpReward: 20,
        content: JSON.stringify({ question: '¿Cuántos tipos principales de punta de destornillador existen?', options: ['Solo 1', '2 (plana y de cruz)', 'Más de 10', 'Ninguno, se usan llaves'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-4', moduleId: mod1.id, title: 'La Regla y el Metro', type: 'multiple_choice', order: 4, xpReward: 15,
        content: JSON.stringify({ question: '¿Cuál es la herramienta más precisa para medir en carpintería?', options: ['Un hilo', 'Una regla de acero', 'Un palito', 'La mano'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-5', moduleId: mod1.id, title: 'El Nivel', type: 'true_false', order: 5, xpReward: 15,
        content: JSON.stringify({ statement: 'Un nivel de burbuja indica si una superficie está perfectamente horizontal o vertical', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-6', moduleId: mod1.id, title: 'La Lija', type: 'multiple_choice', order: 6, xpReward: 20,
        content: JSON.stringify({ question: '¿Qué significan los números en la lija (ej: 80, 120, 220)?', options: ['El precio', 'La dureza del papel', 'La cantidad de granos por pulgada cuadrada', 'El tamaño del papel'], correctIndex: 2 }),
      },
      {
        id: 'lesson-carp-7', moduleId: mod1.id, title: 'El Formón', type: 'multiple_choice', order: 7, xpReward: 25,
        content: JSON.stringify({ question: '¿Para qué se utiliza principalmente un formón?', options: ['Para pintar', 'Para tallar y tallar madera', 'Para medir', 'Para cortar metal'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-8', moduleId: mod1.id, title: 'El Compás', type: 'multiple_choice', order: 8, xpReward: 20,
        content: JSON.stringify({ question: '¿Qué función cumple el compás en carpintería?', options: ['Cortar madera', 'Dibujar arcos y círculos', 'Lijar', 'Atornillar'], correctIndex: 1 }),
      },
    ],
  });
  console.log('✅ Módulo 1: Herramientas Básicas (8 lecciones)');

  // ── Módulo 2: Materiales de Madera ──
  const mod2 = await prisma.module.create({
    data: { id: 'mod-carpinteria-2', courseId: course.id, title: 'Materiales de Madera', order: 2 },
  });

  await prisma.lesson.createMany({
    data: [
      {
        id: 'lesson-carp-9', moduleId: mod2.id, title: 'Tipos de Madera', type: 'multiple_choice', order: 1, xpReward: 20,
        content: JSON.stringify({ question: '¿Cuál de estas es una madera dura?', options: ['Pino', 'Roble', 'Cedro', 'Álamo'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-10', moduleId: mod2.id, title: 'Madera Contrachapada', type: 'multiple_choice', order: 2, xpReward: 20,
        content: JSON.stringify({ question: '¿Qué es la madera contrachapada?', options: ['Un solo bloque de madera', 'Capas de madera pegadas en dirección alterna', 'Madera plástica', 'Madera reciclada'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-11', moduleId: mod2.id, title: 'El Pino', type: 'true_false', order: 3, xpReward: 15,
        content: JSON.stringify({ statement: 'El pino es una madera blanda ideal para principiantes por ser fácil de trabajar', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-12', moduleId: mod2.id, title: 'El Roble', type: 'multiple_choice', order: 4, xpReward: 20,
        content: JSON.stringify({ question: '¿Cuál es la principal ventaja del roble en carpintería?', options: ['Es barato', 'Es muy resistente y duradero', 'Es flexible', 'No necesita lijar'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-13', moduleId: mod2.id, title: 'La Madera de Cedro', type: 'true_false', order: 5, xpReward: 15,
        content: JSON.stringify({ statement: 'El cedro es resistente a insectos y humedad, por lo que se usa en exteriores', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-14', moduleId: mod2.id, title: 'Elegir la Madera Correcta', type: 'multiple_choice', order: 6, xpReward: 25,
        content: JSON.stringify({ question: '¿Qué debes revisar al comprar madera en una maderería?', options: ['Solo el precio', 'Nudos, grietas, humedad y straightness', 'El color nada más', 'La marca del proveedor'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-15', moduleId: mod2.id, title: 'Materiales de Unión', type: 'multiple_choice', order: 7, xpReward: 20,
        content: JSON.stringify({ question: '¿Cuál es el pegamento más resistente para madera?', options: ['Pegamento de oficina', 'Cola blanca (PVA)', 'Pegamento instantáneo', 'Cinta adhesiva'], correctIndex: 1 }),
      },
    ],
  });
  console.log('✅ Módulo 2: Materiales de Madera (7 lecciones)');

  // ── Módulo 3: Técnicas de Corte y Unión ──
  const mod3 = await prisma.module.create({
    data: { id: 'mod-carpinteria-3', courseId: course.id, title: 'Técnicas de Corte y Unión', order: 3 },
  });

  await prisma.lesson.createMany({
    data: [
      {
        id: 'lesson-carp-16', moduleId: mod3.id, title: 'Corte a 45 Grados', type: 'multiple_choice', order: 1, xpReward: 25,
        content: JSON.stringify({ question: '¿Por qué se hace un corte a 45 grados en las esquas de un marco?', options: ['Para ahorrar madera', 'Para que la unión sea más estética y resistente', 'Porque es más rápido', 'No tiene ninguna ventaja'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-17', moduleId: mod3.id, title: 'Unión con Tornillos', type: 'multiple_choice', order: 2, xpReward: 20,
        content: JSON.stringify({ question: '¿Qué se debe hacer antes de atornillar en madera para evitar que se agriete?', options: ['Nada, se atornilla directo', 'Hacer un agujero guía (piloto)', 'Mojear la madera', 'Usar un martillo'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-18', moduleId: mod3.id, title: 'Unión con Clavos', type: 'true_false', order: 3, xpReward: 15,
        content: JSON.stringify({ statement: 'Es recomendable humedecer la punta de los clavos antes de clavarlos para que la madera no se agriete', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-19', moduleId: mod3.id, title: 'El Encolado', type: 'multiple_choice', order: 4, xpReward: 25,
        content: JSON.stringify({ question: '¿Cuánto tiempo aproximadamente se debe apretar una unión encolada?', options: ['5 minutos', '30 minutos a 1 hora', '24 horas', 'Solo unos segundos'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-20', moduleId: mod3.id, title: 'La Unión Espiga y Mortaja', type: 'multiple_choice', order: 5, xpReward: 30,
        content: JSON.stringify({ question: '¿Qué es una unión espiga y mortaja?', options: ['Un tipo de pintura', 'Una unión donde una pieza encaja en un hueco de otra', 'Un tipo de corte', 'Una herramienta'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-21', moduleId: mod3.id, title: 'Corte con Sierra de Mano', type: 'multiple_choice', order: 6, xpReward: 20,
        content: JSON.stringify({ question: '¿Cómo se debe iniciar un corte con sierra de mano?', options: ['Con mucha fuerza desde el inicio', 'Con movimientos suaves en ángulo hasta crear una guía', 'Golpeando la sierra', 'Con un martillo'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-22', moduleId: mod3.id, title: 'Ellijado Correcto', type: 'multiple_choice', order: 7, xpReward: 20,
        content: JSON.stringify({ question: '¿En qué dirección se debe lijar la madera?', options: ['En círculos', 'En la dirección de la veta (vetas de la madera)', 'En cualquier dirección', 'Solo horizontalmente'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-23', moduleId: mod3.id, title: 'Desbaste y Acabado', type: 'multiple_choice', order: 8, xpReward: 25,
        content: JSON.stringify({ question: '¿Cuál es el orden correcto para el acabado de una pieza de madera?', options: ['Pintar → Lijar → Aplicar barniz', 'Lijar con lija gruesa → lija fina → barniz o aceite', 'Barnizar primero → lijar después', 'Solo pintar y listo'], correctIndex: 1 }),
      },
    ],
  });
  console.log('✅ Módulo 3: Técnicas de Corte y Unión (8 lecciones)');

  // ── Módulo 4: Proyectos Prácticos ──
  const mod4 = await prisma.module.create({
    data: { id: 'mod-carpinteria-4', courseId: course.id, title: 'Proyectos Prácticos', order: 4 },
  });

  await prisma.lesson.createMany({
    data: [
      {
        id: 'lesson-carp-24', moduleId: mod4.id, title: 'Repisa para Libros', type: 'multiple_choice', order: 1, xpReward: 25,
        content: JSON.stringify({ question: '¿Qué herramientas básicas necesitas para hacer una repisa de madera simple?', options: ['Solo un martillo', 'Sierra, taladro, lija, tornillos y madera', 'Solo pegamento', 'Ninguna herramienta'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-25', moduleId: mod4.id, title: 'Caja de Herramientas', type: 'multiple_choice', order: 2, xpReward: 30,
        content: JSON.stringify({ question: '¿Qué tipo de unión es recomendable para una caja de herramientas resistente?', options: ['Solo pegamento', 'Unión con tornillos y encolado', 'Cinta adhesiva', 'Gravedad'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-26', moduleId: mod4.id, title: 'Mesa de Centro', type: 'multiple_choice', order: 3, xpReward: 35,
        content: JSON.stringify({ question: '¿Qué tipo de madera es ideal para una mesa de centro para principiantes?', options: ['Ébano (muy cara y dura)', 'Pino o abeto (blandas y económicas)', 'Madera de balsa (muy frágil)', 'Plástico'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-27', moduleId: mod4.id, title: 'Estante para Pared', type: 'multiple_choice', order: 4, xpReward: 25,
        content: JSON.stringify({ question: '¿Qué es lo primero que debes verificar al colgar un estante en la pared?', options: ['El color de la pared', 'Si la pared puede soportar el peso (buscar travesaños)', 'La temperatura de la habitación', 'Nada, se cuelga directo'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-28', moduleId: mod4.id, title: 'Organizador de Escritorio', type: 'multiple_choice', order: 5, xpReward: 25,
        content: JSON.stringify({ question: '¿Qué acabado es más práctico para un organizador de escritorio que se usará a diario?', options: ['Solo pintura', 'Barniz transparente o aceite para madera', 'Ninguno, madera cruda', 'Papel adhesivo'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-29', moduleId: mod4.id, title: 'Tablero de Cortar', type: 'multiple_choice', order: 6, xpReward: 20,
        content: JSON.stringify({ question: '¿Qué madera se recomienda para un tablero de cortar de cocina?', options: ['Madera blanda como pino', 'Madera dura como roble o bambú', 'Madera contrachapada fina', 'Madera tratada químicamente'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-30', moduleId: mod4.id, title: 'Jardín Vertical', type: 'multiple_choice', order: 7, xpReward: 30,
        content: JSON.stringify({ question: '¿Qué tratamiento debe tener la madera de un jardín vertical para exterior?', options: ['Ninguno', 'Impermeabilizante o aceite resistente a la intemperie', 'Solo pintura blanca', 'Plástico sobre la madera'], correctIndex: 1 }),
      },
    ],
  });
  console.log('✅ Módulo 4: Proyectos Prácticos (7 lecciones)');

  console.log('');
  console.log(`¡Listo! Curso con 4 módulos y 30 lecciones.`);
  console.log('Ve a http://localhost:3000/courses');
}

main()
  .catch(e => { console.error('ERROR:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
