const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const VIDEO_URL = 'https://stream.mux.com/JAvSKKI4A7g9012e0000kqkV5P1DsKMVBMEdi201UosVxQA.m3u8';
const VIDEO_TITLE = 'Carpintería - Demostración';

async function main() {
  console.log('Limpiando datos existentes del curso de Carpintería...');
  await prisma.course.deleteMany({ where: { id: 'course-carpinteria-pro' } });
  console.log('✅ Datos anteriores eliminados (cascade)');

  console.log('Creando curso de Carpintería expandido...\n');

  const course = await prisma.course.create({
    data: {
      id: 'course-carpinteria-pro',
      title: 'Carpintería para Principiantes',
      description: 'Aprende los fundamentos de la carpintería, desde el uso de herramientas básicas hasta proyectos prácticos y técnicas profesionales.',
      category: 'Oficios',
      difficulty: 'beginner',
      estimatedHours: 40,
      isPublished: true,
      isPro: true,
      price: 999,
      requiredLevel: 1,
    },
  });
  console.log('✅ Curso creado:', course.id);

  // ══════════════════════════════════════════════════════
  // MÓDULO 1: Herramientas Manuales
  // ══════════════════════════════════════════════════════
  const mod1 = await prisma.module.create({
    data: { id: 'mod-carpinteria-1', courseId: course.id, title: 'Herramientas Manuales', order: 1 },
  });

  await prisma.lesson.createMany({
    data: [
      {
        id: 'lesson-carp-1', moduleId: mod1.id, title: 'El Martillo: Tu Primera Herramienta', type: 'multiple_choice', order: 1, xpReward: 20,
        content: JSON.stringify({
          question: '¿Para qué se usa principalmente un martillo de carpintero?',
          options: ['Cortar madera', 'Golpear clavos y piezas', 'Medir dimensiones', 'Lijar superficies'],
          correctIndex: 1,
          videoUrl: VIDEO_URL,
          videoTitle: 'El Martillo - Introducción',
        }),
      },
      {
        id: 'lesson-carp-2', moduleId: mod1.id, title: 'Tipos de Martillo', type: 'multiple_choice', order: 2, xpReward: 20,
        content: JSON.stringify({ question: '¿Cuál es el peso ideal del martillo para un carpintero principiante?', options: ['250g', '350-450g', '1kg', '2kg'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-3', moduleId: mod1.id, title: 'El Serrucho de Costilla', type: 'true_false', order: 3, xpReward: 15,
        content: JSON.stringify({ statement: 'El serrucho de costilla es ideal para cortes rectos en tablas y tablones', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-4', moduleId: mod1.id, title: 'El Serrucho de Cola de Rata', type: 'multiple_choice', order: 4, xpReward: 20,
        content: JSON.stringify({ question: '¿Para qué tipo de cortes se usa el serrucho de cola de rata?', options: ['Cortes rectos largos', 'Cortes curvos y radios', 'Cortes en ángulo de 45°', 'Solo para metal'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-5', moduleId: mod1.id, title: 'El Destornillador', type: 'multiple_choice', order: 5, xpReward: 20,
        content: JSON.stringify({ question: '¿Cuántos tipos principales de punta de destornillador existen?', options: ['Solo 1', '2 (plana y de cruz)', 'Más de 10', 'Ninguno, se usan llaves'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-6', moduleId: mod1.id, title: 'Uso Correcto del Destornillador', type: 'true_false', order: 6, xpReward: 15,
        content: JSON.stringify({ statement: 'Aplicar presión hacia abajo mientras se gira el destornillador mejora la eficiencia del trabajo', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-7', moduleId: mod1.id, title: 'La Regla de Acero', type: 'multiple_choice', order: 7, xpReward: 15,
        content: JSON.stringify({ question: '¿Por qué la regla de acero es más precisa que una cinta métrica flexible?', options: ['Es más cara', 'No se flexiona ni dobla al medir', 'Es más larga', 'Es más brillante'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-8', moduleId: mod1.id, title: 'El Metro de Carpintero', type: 'multiple_choice', order: 8, xpReward: 20,
        content: JSON.stringify({ question: '¿Qué característica hace especial al metro de carpintero de 3 metros?', options: ['Es de plástico', 'Tiene gancho en el extremo que se engancha a la pieza', 'Solo tiene números grandes', 'No se rompe nunca'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-9', moduleId: mod1.id, title: 'El Nivel de Burbuja', type: 'true_false', order: 9, xpReward: 15,
        content: JSON.stringify({ statement: 'Un nivel de burbuja indica si una superficie está perfectamente horizontal o vertical', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-10', moduleId: mod1.id, title: 'Cómo Leer el Nivel', type: 'multiple_choice', order: 10, xpReward: 20,
        content: JSON.stringify({ question: '¿Qué significa cuando la burbuja está centrada entre las dos líneas?', options: ['Que la superficie está inclinada', 'Que la pieza está perfectamente nivelada', 'Que falta calibrar el nivel', 'Que el nivel está roto'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-11', moduleId: mod1.id, title: 'La Escuadra de Carpintero', type: 'multiple_choice', order: 11, xpReward: 20,
        content: JSON.stringify({ question: '¿Para qué sirve la escuadra de carpintero?', options: ['Para clavar clavos', 'Para verificar y trazar ángulos de 90° exactamente', 'Para medir longitud', 'Para lijar'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-12', moduleId: mod1.id, title: 'La Lija: Nomenclatura', type: 'multiple_choice', order: 12, xpReward: 20,
        content: JSON.stringify({ question: '¿Qué significan los números en la lija (ej: 80, 120, 220)?', options: ['El precio', 'La dureza del papel', 'La cantidad de granos por pulgada cuadrada (más alto = más fino)', 'El tamaño del papel'], correctIndex: 2 }),
      },
      {
        id: 'lesson-carp-13', moduleId: mod1.id, title: '¿Cuándo Usar Cada Grano?', type: 'multiple_choice', order: 13, xpReward: 25,
        content: JSON.stringify({ question: '¿Qué lija usarías para quitar pintura vieja antes de aplicar barniz?', options: ['220 (fino)', '120 (medio)', '80 (grueso)', '500 (extra fino)'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-14', moduleId: mod1.id, title: 'El Formón', type: 'multiple_choice', order: 14, xpReward: 25,
        content: JSON.stringify({ question: '¿Para qué se utiliza principalmente un formón?', options: ['Para pintar', 'Para tallar y hacer cortes limpios en madera', 'Para medir', 'Para cortar metal'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-15', moduleId: mod1.id, title: 'Afilado del Formón', type: 'true_false', order: 15, xpReward: 20,
        content: JSON.stringify({ statement: 'Un formón desafilado puede hacer que la madera se astille en lugar de cortarse limpiamente', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-16', moduleId: mod1.id, title: 'El Compás de Carpintero', type: 'multiple_choice', order: 16, xpReward: 20,
        content: JSON.stringify({ question: '¿Qué función cumple el compás en carpintería?', options: ['Cortar madera', 'Dibujar arcos y círculos precisos', 'Lijar', 'Atornillar'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-17', moduleId: mod1.id, title: 'El Barra de Grifa', type: 'true_false', order: 17, xpReward: 15,
        content: JSON.stringify({ statement: 'La barra de grifa (pr bar) se usa para arrancar clavos enterrados en la madera sin dañarla', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-18', moduleId: mod1.id, title: 'El Cincel y el Formón', type: 'multiple_choice', order: 18, xpReward: 25,
        content: JSON.stringify({ question: '¿Cuál es la diferencia principal entre un cincel y un formón?', options: ['No hay diferencia, son lo mismo', 'El cincel tiene mango de plástico y el formón de madera', 'El formón es para trabajo grueso y el cincel para精细 trabajo', 'El cincel es más barato'], correctIndex: 2 }),
      },
    ],
  });
  console.log('✅ Módulo 1: Herramientas Manuales (18 lecciones)');

  // ══════════════════════════════════════════════════════
  // MÓDULO 2: Herramientas Eléctricas Básicas
  // ══════════════════════════════════════════════════════
  const mod2 = await prisma.module.create({
    data: { id: 'mod-carpinteria-2', courseId: course.id, title: 'Herramientas Eléctricas', order: 2 },
  });

  await prisma.lesson.createMany({
    data: [
      {
        id: 'lesson-carp-19', moduleId: mod2.id, title: 'La Taladradora', type: 'multiple_choice', order: 1, xpReward: 20,
        content: JSON.stringify({
          question: '¿Qué tipo de taladro es más versátil para carpintería doméstica?',
          options: ['Taladro de columna', 'Taladro inalámbrico de 18V', 'Taladro de impacto', 'Taladro de palma'],
          correctIndex: 1,
          videoUrl: VIDEO_URL,
          videoTitle: 'Herramientas Eléctricas - Introducción',
        }),
      },
      {
        id: 'lesson-carp-20', moduleId: mod2.id, title: 'Velocidades del Taladro', type: 'multiple_choice', order: 2, xpReward: 20,
        content: JSON.stringify({ question: '¿Para qué se usa la velocidad baja (más torque) en un taladro?', options: ['Para mezclar pintura', 'Para hacer agujeros grandes en madera', 'Para atornillar', 'Para lijar'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-21', moduleId: mod2.id, title: 'Brocas para Madera', type: 'true_false', order: 3, xpReward: 15,
        content: JSON.stringify({ statement: 'Las brocas de centre o pala son ideales para hacer agujeros grandes en madera', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-22', moduleId: mod2.id, title: 'La Sierra Circular', type: 'multiple_choice', order: 4, xpReward: 25,
        content: JSON.stringify({ question: '¿Cuál es la principal ventaja de la sierra circular sobre el serrucho de mano?', options: ['Es más silenciosa', 'Hace cortes rectos más rápido y con menos esfuerzo', 'No necesita electricidad', 'Es más precisa'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-23', moduleId: mod2.id, title: 'Profundidad de Corte', type: 'multiple_choice', order: 5, xpReward: 20,
        content: JSON.stringify({ question: '¿A qué profundidad debe quedar la hoja de la sierra circular por debajo de la pieza?', options: ['Ras con la superficie', '1-2mm por debajo', 'La mitad del diámetro de la hoja', 'No importa'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-24', moduleId: mod2.id, title: 'La Sierra de Mesa', type: 'multiple_choice', order: 6, xpReward: 25,
        content: JSON.stringify({ question: '¿Para qué sirve principalmente una sierra de mesa?', options: ['Para lijar tablas', 'Para hacer cortes rectos precisos y repetir medidas', 'Para pintar', 'Para clavar'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-25', moduleId: mod2.id, title: 'Guía de Corte con Sierra Circular', type: 'true_false', order: 7, xpReward: 20,
        content: JSON.stringify({ statement: 'Usar una guía o regla paralelas garantiza cortes rectos con la sierra circular', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-26', moduleId: mod2.id, title: 'La Lijadora Orbital', type: 'multiple_choice', order: 8, xpReward: 20,          content: JSON.stringify({ question: '¿Por qué la lijadora orbital es buena para principiantes?', options: ['Es barata', 'El movimiento automático evita marcas direccionadas', 'No necesita lija', 'Solo funciona en metal'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-27', moduleId: mod2.id, title: 'Lijadora de Banda', type: 'multiple_choice', order: 9, xpReward: 25,
        content: JSON.stringify({ question: '¿Cuándo preferirías una lijadora de banda sobre una orbital?', options: ['Para acabado fino final', 'Para remover mucho material rápidamente en superficies grandes', 'Para esquinas', 'Para pintar'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-28', moduleId: mod2.id, title: 'El Router (Fresadora)', type: 'multiple_choice', order: 10, xpReward: 30,
        content: JSON.stringify({ question: '¿Qué tipo de trabajo se hace principalmente con una fresadora/router?', options: ['Solo hacer agujeros redondos', 'Decorar cantos, hacer ranuras y perfiles decorativos en piezas de madera', 'Medir', 'Clavar'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-29', moduleId: mod2.id, title: 'Seguridad con Herramientas Eléctricas', type: 'multiple_choice', order: 11, xpReward: 25,
        content: JSON.stringify({ question: '¿Cuál es la regla de seguridad más importante al usar herramientas eléctricas?', options: ['Usar guantes de algodón', 'Nunca trabajar sin protección ocular y mantener el área limpia', 'Trabajar con música', 'Usar zapatos de cuero fino'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-30', moduleId: mod2.id, title: 'Mantenimiento de Herramientas Eléctricas', type: 'true_false', order: 12, xpReward: 20,
        content: JSON.stringify({ statement: 'Limpiar las brocas y guardar las herramientas en un lugar seco prolonga su vida útil', correctAnswer: true }),
      },
    ],
  });
  console.log('✅ Módulo 2: Herramientas Eléctricas (12 lecciones)');

  // ══════════════════════════════════════════════════════
  // MÓDULO 3: Materiales de Madera
  // ══════════════════════════════════════════════════════
  const mod3 = await prisma.module.create({
    data: { id: 'mod-carpinteria-3', courseId: course.id, title: 'Materiales y Tipos de Madera', order: 3 },
  });

  await prisma.lesson.createMany({
    data: [
      {
        id: 'lesson-carp-31', moduleId: mod3.id, title: 'Maderas Duras vs Blandas', type: 'multiple_choice', order: 1, xpReward: 20,
        content: JSON.stringify({
          question: '¿Cuál de estas es una madera dura?',
          options: ['Pino', 'Roble', 'Cedro', 'Álamo'],
          correctIndex: 1,
          videoUrl: VIDEO_URL,
          videoTitle: 'Tipos de Madera',
        }),
      },
      {
        id: 'lesson-carp-32', moduleId: mod3.id, title: 'El Pino', type: 'true_false', order: 2, xpReward: 15,
        content: JSON.stringify({ statement: 'El pino es una madera blanda ideal para principiantes por ser fácil de trabajar', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-33', moduleId: mod3.id, title: 'El Roble', type: 'multiple_choice', order: 3, xpReward: 20,
        content: JSON.stringify({ question: '¿Cuál es la principal ventaja del roble en carpintería?', options: ['Es barato', 'Es muy resistente y duradero', 'Es flexible', 'No necesita lijar'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-34', moduleId: mod3.id, title: 'La Madera de Cedro', type: 'true_false', order: 4, xpReward: 15,
        content: JSON.stringify({ statement: 'El cedro es naturalmente resistente a insectos y humedad, por lo que se usa en exteriores', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-35', moduleId: mod3.id, title: 'El Arce', type: 'multiple_choice', order: 5, xpReward: 20,
        content: JSON.stringify({ question: '¿Para qué se usa principalmente el arce en carpintería?', options: ['Para exteriores', 'Para superficies de trabajo (mesadas) por su dureza', 'Para techos', 'Para leña'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-36', moduleId: mod3.id, title: 'La Madera de Nogal', type: 'multiple_choice', order: 6, xpReward: 20,
        content: JSON.stringify({ question: '¿Por qué la madera de nogal es valorada en carpintería fina?', options: ['Es muy barata', 'Por su color oscuro rico y veta atractiva', 'Es blanda', 'Solo se usa para leña'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-37', moduleId: mod3.id, title: 'La Madera Contrachapada', type: 'multiple_choice', order: 7, xpReward: 20,
        content: JSON.stringify({
          question: '¿Qué es la madera contrachapada (plywood)?',
          options: ['Un solo bloque de madera maciza', 'Capas de madera pegadas en dirección alterna (veta cruzada)', 'Madera plástica', 'Madera reciclada'],
          correctIndex: 1,
          videoUrl: VIDEO_URL,
          videoTitle: 'Madera Contrachapada',
        }),
      },
      {
        id: 'lesson-carp-38', moduleId: mod3.id, title: 'OSB: Tablero de Virutas Orientadas', type: 'multiple_choice', order: 8, xpReward: 20,
        content: JSON.stringify({ question: '¿Para qué se usa principalmente el OSB?', options: ['Para muebles finos', 'Para estructuras y paredes (reemplaza la madera contrachapada en construcción)', 'Para tablas de cortar', 'Para decoraciones'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-39', moduleId: mod3.id, title: 'MDF: Tablero de Fibra de Densidad Media', type: 'multiple_choice', order: 9, xpReward: 20,
        content: JSON.stringify({ question: '¿Cuál es la ventaja principal del MDF sobre la madera maciza?', options: ['Es más resistente', 'Es más económico y uniforme, ideal para paneles y muebles pintados', 'Es más bonito', ' huele mejor'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-40', moduleId: mod3.id, title: 'Melamina', type: 'true_false', order: 10, xpReward: 15,
        content: JSON.stringify({ statement: 'La melamina es un tablero MDF cubierto con papel decorativo y resina que lo hace resistente a rayaduras y humedad', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-41', moduleId: mod3.id, title: 'Elegir la Madera Correcta', type: 'multiple_choice', order: 11, xpReward: 25,
        content: JSON.stringify({ question: '¿Qué debes revisar al comprar madera en una maderería?', options: ['Solo el precio', 'Nudos, grietas, humedad y rectitud (straightness)', 'El color nada más', 'La marca del proveedor'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-42', moduleId: mod3.id, title: 'Contenido de Humedad', type: 'multiple_choice', order: 12, xpReward: 25,
        content: JSON.stringify({ question: '¿Por qué es importante el contenido de humedad de la madera?', options: ['No es importante', 'La madera con mucha humedad se contrae y deforma al secarse en el taller', 'Solo importa para exteriores', 'Solo importa para muebles finos'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-43', moduleId: mod3.id, title: 'Acondicionamiento de la Madera', type: 'true_false', order: 13, xpReward: 20,
        content: JSON.stringify({ statement: 'La madera comprada debe aclimatarse en el taller durante 1-2 semanas antes de trabajar con ella', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-44', moduleId: mod3.id, title: 'Pegamentos para Madera', type: 'multiple_choice', order: 14, xpReward: 20,
        content: JSON.stringify({ question: '¿Cuál es el pegamento más común y resistente para unir piezas de madera?', options: ['Pegamento de oficina (white glue)', 'Cola blanca (PVA) como Titebond o similar', 'Pegamento instantáneo (cyanoacrilato)', 'Cinta adhesiva'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-45', moduleId: mod3.id, title: 'Clavos vs Tornillos', type: 'multiple_choice', order: 15, xpReward: 20,
        content: JSON.stringify({ question: '¿Cuándo es mejor usar tornillos en lugar de clavos para unir madera?', options: ['Nunca, los clavos son mejores', 'Cuando necesitas una unión desmontable o más resistente al拉力', 'Para exteriores nada más', 'Para interiores nada más'], correctIndex: 1 }),
      },
    ],
  });
  console.log('✅ Módulo 3: Materiales y Tipos de Madera (15 lecciones)');

  // ══════════════════════════════════════════════════════
  // MÓDULO 4: Técnicas de Unión y Ensamblaje
  // ══════════════════════════════════════════════════════
  const mod4 = await prisma.module.create({
    data: { id: 'mod-carpinteria-4', courseId: course.id, title: 'Técnicas de Unión y Ensamblaje', order: 4 },
  });

  await prisma.lesson.createMany({
    data: [
      {
        id: 'lesson-carp-46', moduleId: mod4.id, title: 'Corte a 45 Grados', type: 'multiple_choice', order: 1, xpReward: 25,
        content: JSON.stringify({
          question: '¿Por qué se hace un corte a 45 grados en las esquinas de un marco?',
          options: ['Para ahorrar madera', 'Para que la unión sea más estética y resistente', 'Porque es más rápido', 'No tiene ninguna ventaja'],
          correctIndex: 1,
          videoUrl: VIDEO_URL,
          videoTitle: 'Corte a 45 Grados',
        }),
      },
      {
        id: 'lesson-carp-47', moduleId: mod4.id, title: 'Uso de la Caja de Ingletes', type: 'multiple_choice', order: 2, xpReward: 20,
        content: JSON.stringify({ question: '¿Para qué sirve la caja de ingletes?', options: ['Para medir', 'Para hacer cortes precisos a 45° y 90° en molduras y marcos', 'Para lijar', 'Para clavar'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-48', moduleId: mod4.id, title: 'Agujero Piloto', type: 'multiple_choice', order: 3, xpReward: 20,
        content: JSON.stringify({ question: '¿Qué se debe hacer antes de atornillar en madera para evitar que se agriete?', options: ['Nada, se atornilla directo', 'Hacer un agujero guía (piloto) del mismo diámetro que el núcleo del tornillo', 'Mojear la madera', 'Usar un martillo'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-49', moduleId: mod4.id, title: 'Unión con Clavos', type: 'true_false', order: 4, xpReward: 15,
        content: JSON.stringify({ statement: 'Es recomendable clavar en ángulo alterno para aumentar la resistencia de la unión', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-50', moduleId: mod4.id, title: 'El Encolado Correcto', type: 'multiple_choice', order: 5, xpReward: 25,
        content: JSON.stringify({ question: '¿Cuánto tiempo aproximadamente se debe apretar una unión encolada con prensas?', options: ['5 minutos', '30 minutos a 1 hora', '24 horas', 'Solo unos segundos'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-51', moduleId: mod4.id, title: 'La Unión Espiga y Mortaja', type: 'multiple_choice', order: 6, xpReward: 30,
        content: JSON.stringify({ question: '¿Qué es una unión espiga y mortaja?', options: ['Un tipo de pintura', 'Una unión donde una pieza con saliente (espiga) encaja en un hueco (mortaja) de otra', 'Un tipo de sierra', 'Una herramienta'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-52', moduleId: mod4.id, title: 'Cómo Hacer una Mortaja', type: 'true_false', order: 7, xpReward: 20,
        content: JSON.stringify({ statement: 'Para hacer una mortaja limpia, se fresa o se escarija el hueco y se limpian las paredes con un formón', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-53', moduleId: mod4.id, title: 'La Espiga Doble', type: 'multiple_choice', order: 8, xpReward: 30,
        content: JSON.stringify({ question: '¿Qué ventaja tiene la espiga doble sobre la espiga simple?', options: ['Es más rápida de hacer', 'Tiene mayor resistencia al torque y flexión', 'Es más decorativa', 'No necesita pegamento'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-54', moduleId: mod4.id, title: 'La Junta de Lengüeta y Ranura', type: 'multiple_choice', order: 9, xpReward: 25,
        content: JSON.stringify({ question: '¿Dónde se usa comúnmente la junta de lengüeta y ranura?', options: ['En marcos de cuadros', 'En paneles de madera para hacer tablas anchas (widening)', 'En exteriores', 'En juguetes'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-55', moduleId: mod4.id, title: 'Sujeciones con Prensas', type: 'true_false', order: 10, xpReward: 20,
        content: JSON.stringify({ statement: 'Las prensas de borde (F-clamps) y de mano (speed clamps) son esenciales para mantener uniones mientras seca el pegamento', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-56', moduleId: mod4.id, title: 'Tirafondos y pernos', type: 'multiple_choice', order: 11, xpReward: 20,
        content: JSON.stringify({ question: '¿Cuándo usarías tirafondos (lag screws) en lugar de tornillos comunes?', options: ['Para trabajos finos', 'Para uniones que necesitan máxima resistencia en estructuras y muebles pesados', 'Para tablas delgadas', 'Para plásticos'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-57', moduleId: mod4.id, title: 'Refuerzos con Escuadras', type: 'multiple_choice', order: 12, xpReward: 20,
        content: JSON.stringify({ question: '¿Cuál es la mejor forma de reforzar una estantería que soportará mucho peso?', options: ['Usar escuadras metálicas en las esquinas superiores e inferiores', 'Solo pegar', 'Solo clavar', 'Pintar'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-58', moduleId: mod4.id, title: 'Varillas de Montaje (Camlocks)', type: 'true_false', order: 13, xpReward: 20,
        content: JSON.stringify({ statement: 'Los sistemas de varillas de montaje (camlock, confirmat) permiten ensamblar muebles sin herramientas especiales', correctAnswer: true }),
      },
    ],
  });
  console.log('✅ Módulo 4: Técnicas de Unión y Ensamblaje (13 lecciones)');

  // ══════════════════════════════════════════════════════
  // MÓDULO 5: Acabados y Protectores
  // ══════════════════════════════════════════════════════
  const mod5 = await prisma.module.create({
    data: { id: 'mod-carpinteria-5', courseId: course.id, title: 'Acabados y Protectores', order: 5 },
  });

  await prisma.lesson.createMany({
    data: [
      {
        id: 'lesson-carp-59', moduleId: mod5.id, title: 'Preparación de la Superficie', type: 'multiple_choice', order: 1, xpReward: 25,
        content: JSON.stringify({
          question: '¿Cuál es el primer paso antes de aplicar cualquier acabado a la madera?',
          options: ['Aplicar el acabado directo', 'Lijar con lija gruesa (80-120) y progresar hasta lija fina (180-220)', 'Pintar con imprimador', 'Solo limpiar'],
          correctIndex: 1,
          videoUrl: VIDEO_URL,
          videoTitle: 'Acabados - Preparación',
        }),
      },
      {
        id: 'lesson-carp-60', moduleId: mod5.id, title: 'Lijado Entre Capas', type: 'true_false', order: 2, xpReward: 20,
        content: JSON.stringify({ statement: 'Se debe lijar entre cada capa de acabado con lija fina (220-320) para eliminar imperfecciones', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-61', moduleId: mod5.id, title: 'Barniz de Poliuretano', type: 'multiple_choice', order: 3, xpReward: 20,
        content: JSON.stringify({ question: '¿Cuál es la principal ventaja del barniz de poliuretano?', options: ['Es muy barato', 'Es altamente resistente a la humedad y al desgaste', 'Se aplica en una sola capa', 'No necesita lijado'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-62', moduleId: mod5.id, title: 'Barniz vs Lacado', type: 'multiple_choice', order: 4, xpReward: 20,
        content: JSON.stringify({ question: '¿Qué diferencia hay entre barniz y laca?', options: ['Son lo mismo', 'El barniz es más grueso y penetra la madera; la laca seca más rápido y da acabado más suave', 'La laca es para metal', 'El barniz es más brillante'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-63', moduleId: mod5.id, title: 'Aceites para Madera', type: 'multiple_choice', order: 5, xpReward: 20,
        content: JSON.stringify({ question: '¿Qué ventaja tiene el aceite de tung sobre el poliuretano?', options: ['Es más barato', 'Resalta la belleza natural de la madera y permite reparaciones fáciles', 'Seca en 5 minutos', 'Es más resistente al agua'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-64', moduleId: mod5.id, title: 'Aplicación del Aceite', type: 'true_false', order: 6, xpReward: 20,
        content: JSON.stringify({ statement: 'El aceite de tung o linaza se aplica con un trapo en capas finas y se deja penetrar 15-30 min antes de wipe off', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-65', moduleId: mod5.id, title: 'Tinte para Madera', type: 'multiple_choice', order: 7, xpReward: 20,
        content: JSON.stringify({ question: '¿Para qué sirve el tinte (stain) en carpintería?', options: ['Para proteger la madera', 'Para cambiar el color de la madera sin ocultar la veta', 'Para rellenar grietas', 'Para sellar'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-66', moduleId: mod5.id, title: 'Sellador (Primer)', type: 'multiple_choice', order: 8, xpReward: 20,
        content: JSON.stringify({ question: '¿Por qué se usa sellador antes de pintar o barnizar madera porosa?', options: ['No tiene ningún efecto', 'Para igualar la absorbencia y evitar zonas más oscuras', 'Para hacer la madera más dura', 'Es obligatorio por ley'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-67', moduleId: mod5.id, title: 'Pintura para Madera', type: 'true_false', order: 9, xpReward: 20,
        content: JSON.stringify({ statement: 'La pintura al agua (acrílica) es más amigable para principiantes porque limpia con agua y huele menos', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-68', moduleId: mod5.id, title: 'Cera para Acabado', type: 'multiple_choice', order: 10, xpReward: 20,
        content: JSON.stringify({ question: '¿Qué tipo de mueble se beneficia más de un acabado con cera?', options: ['Muebles de exterior', 'Muebles decorativos interiores que no reciben mucho uso', 'Cocinas', 'Baños'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-69', moduleId: mod5.id, title: 'Shellaс (goma laca)', type: 'multiple_choice', order: 11, xpReward: 25,
        content: JSON.stringify({ question: '¿Qué es el shellac y para qué se usa?', options: ['Es un plástico moderno', 'Es un acabado natural derivado de la resina del gusano de lacar, ideal para muebles antiques y restauración', 'Es un tipo de pintura', 'Es un pegamento'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-70', moduleId: mod5.id, title: 'Acabados para Exterior', type: 'true_false', order: 12, xpReward: 20,
        content: JSON.stringify({ statement: 'Para muebles de exterior se recomienda epoxy o poliuretano marino porque resisten UV y humedad', correctAnswer: true }),
      },
    ],
  });
  console.log('✅ Módulo 5: Acabados y Protectores (12 lecciones)');

  // ══════════════════════════════════════════════════════
  // MÓDULO 6: Seguridad en el Taller
  // ══════════════════════════════════════════════════════
  const mod6 = await prisma.module.create({
    data: { id: 'mod-carpinteria-6', courseId: course.id, title: 'Seguridad en el Taller', order: 6 },
  });

  await prisma.lesson.createMany({
    data: [
      {
        id: 'lesson-carp-71', moduleId: mod6.id, title: 'Equipo de Protección Personal', type: 'multiple_choice', order: 1, xpReward: 25,
        content: JSON.stringify({ question: '¿Cuál es el equipo de protección básico e indispensable para trabajar en un taller de carpintería?', options: ['Solo una camiseta', 'Gafas de seguridad, protección auditiva y máscara contra polvo', 'Solo guantes', 'Solo zapatos'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-72', moduleId: mod6.id, title: 'Protección Ocular', type: 'true_false', order: 2, xpReward: 20,
        content: JSON.stringify({ statement: 'Las gafas de seguridad son obligatorias al usar cualquier herramienta eléctrica que produzca astillas o polvo', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-73', moduleId: mod6.id, title: 'Protección Auditiva', type: 'multiple_choice', order: 3, xpReward: 20,
        content: JSON.stringify({ question: '¿Por qué es importante la protección auditiva en el taller?', options: ['No es importante', 'Herramientas como la sierra circular y lijadora superan los 85dB y dañan el oído con exposición prolongada', 'Solo importa para profesionales', 'Solo para exteriores'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-74', moduleId: mod6.id, title: 'Máscara contra Polvo', type: 'multiple_choice', order: 4, xpReward: 20,
        content: JSON.stringify({ question: '¿Qué tipo de máscara es más efectiva para protegerse del polvo de madera?', options: ['Un pañuelo', 'Una máscara N95 o superior para partículas', 'Ninguna, no pasa nada', 'Una máscara de pintura simple'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-75', moduleId: mod6.id, title: 'Primeros Auxilios Básicos', type: 'true_false', order: 5, xpReward: 25,
        content: JSON.stringify({ statement: 'Todo taller debe tener un botiquín con gasas, antiseptic, curitas y pinzas para heridas menores', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-76', moduleId: mod6.id, title: 'Manejo de Clavos', type: 'multiple_choice', order: 6, xpReward: 20,
        content: JSON.stringify({ question: '¿Cuál es la forma más segura de extraer un clavo enterrado en madera?', options: ['Con los dedos', 'Con una barra de grifa usando el mango como palanca', 'Golpeándolo con un martillo', 'Dejándolo ahí'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-77', moduleId: mod6.id, title: 'Corte Seguro con Sierra', type: 'true_false', order: 7, xpReward: 20,
        content: JSON.stringify({ statement: 'Antes de cortar, siempre verificar que la pieza está firme y la hoja de la sierra está bien sujeta', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-78', moduleId: mod6.id, title: 'Riesgo de Incendio', type: 'multiple_choice', order: 8, xpReward: 25,
        content: JSON.stringify({ question: '¿Qué práctica ayuda a prevenir incendios en el taller de carpintería?', options: ['Dejar trapos con aceite juntos en un rincón', 'Guardar trapos con aceite en un contenedor metálico cerrado y mantener extintor accessible', 'Trabajar sin ventilación', 'Usar guantes de lana'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-79', moduleId: mod6.id, title: 'Ergonomía en el Trabajo', type: 'multiple_choice', order: 9, xpReward: 20,
        content: JSON.stringify({ question: '¿Por qué es importante la ergonomía al trabajar en carpintería?', options: ['No es importante', 'Para prevenir lesiones de espalda, muñecas y fatiga crónica', 'Solo importa en oficinas', 'Solo para mujeres'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-80', moduleId: mod6.id, title: 'Organización del Taller', type: 'true_false', order: 10, xpReward: 20,
        content: JSON.stringify({ statement: 'Un taller organizado y limpio reduce accidentes y mejora la eficiencia del trabajo', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-81', moduleId: mod6.id, title: 'Electricidad y Herramientas', type: 'multiple_choice', order: 11, xpReward: 25,
        content: JSON.stringify({ question: '¿Qué debes verificar antes de usar una herramienta eléctrica?', options: ['Que tenga buen color', 'Que el cable no esté dañado, que esté bien conectada a tierra y que el interruptor funcione', 'Que haga ruido', 'Nada'], correctIndex: 1 }),
      },
    ],
  });
  console.log('✅ Módulo 6: Seguridad en el Taller (11 lecciones)');

  // ══════════════════════════════════════════════════════
  // MÓDULO 7: Proyectos Prácticos
  // ══════════════════════════════════════════════════════
  const mod7 = await prisma.module.create({
    data: { id: 'mod-carpinteria-7', courseId: course.id, title: 'Proyectos Prácticos paso a paso', order: 7 },
  });

  await prisma.lesson.createMany({
    data: [
      {
        id: 'lesson-carp-82', moduleId: mod7.id, title: 'Repisa para Libros', type: 'multiple_choice', order: 1, xpReward: 25,
        content: JSON.stringify({
          question: '¿Qué herramientas y materiales necesitas para hacer una repisa de madera simple?',
          options: ['Solo un martillo', 'Sierra, taladro, lija, tornillos, nivel, soporte para pared y madera de 2x10', 'Solo pegamento', 'Ninguna herramienta'],
          correctIndex: 1,
          videoUrl: VIDEO_URL,
          videoTitle: 'Repisa para Libros',
        }),
      },
      {
        id: 'lesson-carp-83', moduleId: mod7.id, title: 'Medición y Corte de la Repisa', type: 'true_false', order: 2, xpReward: 20,
        content: JSON.stringify({ statement: 'Medir dos veces y cortar una vez es la regla de oro para evitar desperdiciar material', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-84', moduleId: mod7.id, title: 'Caja de Herramientas', type: 'multiple_choice', order: 3, xpReward: 30,
        content: JSON.stringify({ question: '¿Qué tipo de unión es recomendable para una caja de herramientas resistente?', options: ['Solo pegamento', 'Unión con tornillos y encolado en las esquinas', 'Cinta adhesiva', 'Gravedad'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-85', moduleId: mod7.id, title: 'Diseño de la Caja', type: 'multiple_choice', order: 4, xpReward: 25,
        content: JSON.stringify({ question: '¿Cuál es la medida práctica para una caja de herramientas para principiantes?', options: ['50x50x50cm', '40x25x20cm (manejable y suficientemente espaciosa)', '1x1 metro', '10x10cm'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-86', moduleId: mod7.id, title: 'Mesa de Centro', type: 'multiple_choice', order: 5, xpReward: 35,
        content: JSON.stringify({ question: '¿Qué tipo de madera es ideal para una mesa de centro para principiantes?', options: ['Ébano (muy cara y dura)', 'Pino o abeto (blandas, económicas y fáciles de trabajar)', 'Madera de balsa (muy frágil)', 'Plástico'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-87', moduleId: mod7.id, title: 'Ensamblaje de la Mesa', type: 'true_false', order: 6, xpReward: 25,
        content: JSON.stringify({ statement: 'Es mejor montar la mesa sin pegamento primero para verificar que todas las piezas encajan correctamente', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-88', moduleId: mod7.id, title: 'Estante para Pared', type: 'multiple_choice', order: 7, xpReward: 25,
        content: JSON.stringify({ question: '¿Qué es lo primero que debes verificar al colgar un estante en la pared?', options: ['El color de la pared', 'Si la pared puede soportar el peso (buscar travesaños con un buscador)', 'La temperatura', 'Nada, se cuelga directo'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-89', moduleId: mod7.id, title: 'Organizador de Escritorio', type: 'multiple_choice', order: 8, xpReward: 25,
        content: JSON.stringify({ question: '¿Qué acabado es más práctico para un organizador de escritorio que se usará a diario?', options: ['Solo pintura', 'Barniz transparente o aceite de tung para proteger y facilitar limpieza', 'Ninguno, madera cruda', 'Papel adhesivo'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-90', moduleId: mod7.id, title: 'Tablero de Cortar de Cocina', type: 'multiple_choice', order: 9, xpReward: 30,
        content: JSON.stringify({ question: '¿Qué madera se recomienda para un tablero de cortar de cocina?', options: ['Madera blanda como pino (se corta fácil)', 'Madera dura como Arce, Roble o Bambú (resiste al corte)', 'Madera contrachapada fina', 'Madera tratada químicamente'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-91', moduleId: mod7.id, title: 'Jardín Vertical de Exterior', type: 'multiple_choice', order: 10, xpReward: 30,
        content: JSON.stringify({ question: '¿Qué tratamiento debe tener la madera de un jardín vertical para exterior?', options: ['Ninguno', 'Impermeabilizante o aceite de tung o linaza con agente secante', 'Solo pintura blanca', 'Plástico sobre la madera'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-92', moduleId: mod7.id, title: 'Marco de Cuadro', type: 'true_false', order: 11, xpReward: 20,
        content: JSON.stringify({ statement: 'Los marcos se hacen cortando las molduras a 45° e uniones en las esquinas usando ingletadora', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-93', moduleId: mod7.id, title: 'Banquillo Bajo', type: 'multiple_choice', order: 12, xpReward: 35,
        content: JSON.stringify({ question: '¿Qué altura es cómoda para un banquillo de trabajo (saw bench)?', options: ['20cm', '30-40cm (para poder trabajar parado y apoyo de piezas)', '80cm', '120cm'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-94', moduleId: mod7.id, title: 'Cajón con Joint de Cola de Milano', type: 'true_false', order: 13, xpReward: 25,
        content: JSON.stringify({ statement: 'Los cajones de calidad usan uniones de cola de milano en las esquinas para máxima durabilidad', correctAnswer: true }),
      },
    ],
  });
  console.log('✅ Módulo 7: Proyectos Prácticos (13 lecciones)');

  // ══════════════════════════════════════════════════════
  // MÓDULO 8: Técnicas Avanzadas
  // ══════════════════════════════════════════════════════
  const mod8 = await prisma.module.create({
    data: { id: 'mod-carpinteria-8', courseId: course.id, title: 'Técnicas Avanzadas', order: 8 },
  });

  await prisma.lesson.createMany({
    data: [
      {
        id: 'lesson-carp-95', moduleId: mod8.id, title: 'La Unión de Cola de Milano', type: 'multiple_choice', order: 1, xpReward: 35,
        content: JSON.stringify({
          question: '¿Qué hace especial a la unión de cola de milano?',
          options: ['Es la más rápida de hacer', 'Sus colas entrelazadas la hacen extremadamente fuerte sin necesidad de pegamento', 'Solo es decorativa', 'Se hace con clavos'],
          correctIndex: 1,
          videoUrl: VIDEO_URL,
          videoTitle: 'Cola de Milano',
        }),
      },
      {
        id: 'lesson-carp-96', moduleId: mod8.id, title: 'Plantilla para Cola de Milano', type: 'true_false', order: 2, xpReward: 25,
        content: JSON.stringify({ statement: 'Una plantilla (jig) de cola de milano facilita hacer cortes precisos y repetibles', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-97', moduleId: mod8.id, title: 'La Espiga Doble', type: 'multiple_choice', order: 3, xpReward: 30,
        content: JSON.stringify({ question: '¿Qué ventaja tiene la espiga doble sobre la espiga simple?', options: ['Es más rápida de hacer', 'Mayor resistencia al torque y flexión lateral', 'Es más decorativa', 'No necesita pegamento'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-98', moduleId: mod8.id, title: 'El Torno de Madera', type: 'multiple_choice', order: 4, xpReward: 35,
        content: JSON.stringify({ question: '¿Qué tipo de piezas se pueden crear con un torno de madera?', options: ['Tablas planas', 'Piezas simétricas redondas como patas de mesa, cuencos, botones y esferas', 'Cortes rectos', 'Marcos'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-99', moduleId: mod8.id, title: 'Tallado en Torno', type: 'true_false', order: 5, xpReward: 25,
        content: JSON.stringify({ statement: 'En el torno, la pieza gira a alta velocidad mientras se le da forma con herramientas de corte fijas', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-100', moduleId: mod8.id, title: 'Ensamblaje Dominguero (Knapp Joint)', type: 'multiple_choice', order: 6, xpReward: 35,
        content: JSON.stringify({ question: '¿Qué es un ensamblaje dominguero (knapp joint)?', options: ['Un tipo de pegamento', 'Una junta decorativa y fuerte con forma de semicírculo usada en muebles victorianos', 'Una sierra especial', 'Un tipo de barniz'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-101', moduleId: mod8.id, title: 'Tallado con Formón', type: 'multiple_choice', order: 7, xpReward: 30,
        content: JSON.stringify({ question: '¿Cuál es la regla de seguridad más importante al tallar con formón?', options: ['Ir rápido para no perder filo', 'Siempre tallar alejando el cuerpo de la hoja', 'No importa la dirección', 'Usar guantes de lana'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-102', moduleId: mod8.id, title: 'Madera Curvada al Vapor', type: 'multiple_choice', order: 8, xpReward: 40,
        content: JSON.stringify({ question: '¿Cómo se curva la madera con la técnica de vapor?', options: ['Con calor seco del horno', 'Exponiendo la madera a vapor caliente para flexibilizarla y luego doblarla en un molde', 'Con un martillo', 'Mojándola en agua fría'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-103', moduleId: mod8.id, title: 'Laminado Curvo', type: 'true_false', order: 9, xpReward: 30,
        content: JSON.stringify({ statement: 'Para laminados curvos se usan capas delgadas de madera (veneers) encoladas sobre una forma', correctAnswer: true }),
      },
      {
        id: 'lesson-carp-104', moduleId: mod8.id, title: 'Incrustación y Marquetería', type: 'multiple_choice', order: 10, xpReward: 40,
        content: JSON.stringify({ question: '¿Qué es la marquetería en carpintería?', options: ['Pintura sobre madera', 'Arte de incrustar piezas de madera de diferentes colores para crear diseños y patrones', 'Un tipo de clavo', 'Un método de lijar'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-105', moduleId: mod8.id, title: 'Dovetail Jig y Sierra de Cremallera', type: 'multiple_choice', order: 11, xpReward: 35,
        content: JSON.stringify({ question: '¿Qué ventaja ofrece usar un dovetail jig con sierra de cremallera?', options: ['Es más barato', 'Permite hacer juntas de cola de milano uniformes y rápidas sin tallar a mano', 'No hace falta experiencia', 'Es decorativo'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-106', moduleId: mod8.id, title: 'CNC para Carpintería', type: 'multiple_choice', order: 12, xpReward: 40,
        content: JSON.stringify({ question: '¿Qué permite una máquina CNC en un taller de carpintería?', options: ['Solo pintar', 'Cortar y grabar piezas complejas con precisión计算机izada a partir de diseños digitales', 'Solo medir', 'Solo lijar'], correctIndex: 1 }),
      },
      {
        id: 'lesson-carp-107', moduleId: mod8.id, title: 'Rebajes y Perfiles Decorativos', type: 'true_false', order: 13, xpReward: 25,
        content: JSON.stringify({ statement: 'Con una fresadora (router) y plantillas puedes hacer rebajes, ranuras y perfiles decorativos en cantos', correctAnswer: true }),
      },
    ],
  });
  console.log('✅ Módulo 8: Técnicas Avanzadas (13 lecciones)');

  // ══════════════════════════════════════════════════════
  // Actualizar horas del curso
  // ══════════════════════════════════════════════════════      const totalLessons = 18 + 12 + 15 + 13 + 12 + 11 + 13 + 13;
  await prisma.course.update({
    where: { id: course.id },
    data: { estimatedHours: 40 },
  });

  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log(`¡Listo! Curso de Carpintería con 8 módulos y ${totalLessons} lecciones.`);
  console.log('Horas estimadas: ~40 horas');
  console.log('═══════════════════════════════════════════════');
  console.log('');
  console.log('Resumen por módulo:');
  console.log('  Módulo 1: Herramientas Manuales (18 lecciones)');
  console.log('  Módulo 2: Herramientas Eléctricas (12 lecciones)');
  console.log('  Módulo 3: Materiales y Tipos de Madera (15 lecciones)');
  console.log('  Módulo 4: Técnicas de Unión y Ensamblaje (13 lecciones)');
  console.log('  Módulo 5: Acabados y Protectores (12 lecciones)');
  console.log('  Módulo 6: Seguridad en el Taller (11 lecciones)');
  console.log('  Módulo 7: Proyectos Prácticos (13 lecciones)');
  console.log('  Módulo 8: Técnicas Avanzadas (13 lecciones)');
  console.log('');
  console.log('Ve a http://localhost:3000/courses');
}

main()
  .catch(e => { console.error('ERROR:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());