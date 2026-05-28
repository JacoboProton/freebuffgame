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

  // ===========================================
  // ACHIEVEMENTS
  // ===========================================
  const achievements = [
    { key: 'first_lesson', title: 'Primera Lección', description: 'Completa tu primera lección', icon: '🎯', xpReward: 10 },
    { key: 'first_xp', title: 'Primeros XP', description: 'Gana tus primeros 10 XP', icon: '⭐', xpReward: 5 },
    { key: 'xp_100', title: 'Centauro', description: 'Alcanza 100 XP totales', icon: '💯', xpReward: 20 },
    { key: 'xp_500', title: 'Guerrero', description: 'Alcanza 500 XP totales', icon: '⚔️', xpReward: 50 },
    { key: 'xp_1000', title: 'Campeón', description: 'Alcanza 1000 XP totales', icon: '🏆', xpReward: 100 },
    { key: 'xp_5000', title: 'Leyenda', description: 'Alcanza 5000 XP totales', icon: '👑', xpReward: 250 },
    { key: 'streak_3', title: 'Tres en Raya', description: 'Mantén una racha de 3 días', icon: '🔥', xpReward: 15 },
    { key: 'streak_7', title: 'Semana Perfecta', description: 'Mantén una racha de 7 días', icon: '🌟', xpReward: 50 },
    { key: 'streak_30', title: 'Mes de Acero', description: 'Mantén una racha de 30 días', icon: '💪', xpReward: 200 },
    { key: 'course_complete', title: 'Graduado', description: 'Completa tu primer curso', icon: '🎓', xpReward: 100 },
    { key: 'course_3_complete', title: 'Polymath', description: 'Completa 3 cursos', icon: '🧠', xpReward: 200 },
    { key: 'perfect_score', title: 'Perfecto', description: 'Obtén 100% en una lección', icon: '💯', xpReward: 25 },
    { key: 'speed_demon', title: 'Velocista', description: 'Completa una lección en menos de 1 minuto', icon: '⚡', xpReward: 30 },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: achievement,
      create: achievement,
    });
  }
  console.log('✅ Achievements created');

  // ===========================================
  // GAMES
  // ===========================================
  const games = [
    { key: 'speed_match', title: 'Speed Match', description: 'Combina conceptos antes de que se acabe el tiempo', icon: '🎮', xpReward: 30 },
    { key: 'word_puzzle', title: 'Word Puzzle', description: 'Ordena las letras para formar palabras', icon: '🧩', xpReward: 25 },
    { key: 'true_false_sprint', title: 'True/False Sprint', description: 'Responde verdadero o falso lo más rápido posible', icon: '⚡', xpReward: 20 },
    { key: 'quiz_duel', title: 'Quiz Duel', description: 'Compite contra otros en quizzes', icon: '🏆', xpReward: 50 },
  ];

  for (const game of games) {
    await prisma.game.upsert({
      where: { key: game.key },
      update: game,
      create: game,
    });
  }
  console.log('✅ Games created');

  // ===========================================
  // SHOP ITEMS
  // ===========================================
  const shopItems = [
    { key: 'avatar_cool', name: 'Avatar Cool', description: 'Un avatar genial para tu perfil', type: 'avatar', price: 100, icon: '😎' },
    { key: 'avatar_ninja', name: 'Avatar Ninja', description: 'Un ninja misterioso', type: 'avatar', price: 150, icon: '🥷' },
    { key: 'avatar_astronaut', name: 'Avatar Astronauta', description: 'Un astronauta espacial', type: 'avatar', price: 200, icon: '🚀' },
    { key: 'avatar_wizard', name: 'Avatar Mago', description: 'Un mago poderoso', type: 'avatar', price: 180, icon: '🧙' },
    { key: 'streak_freeze', name: 'Freeze de Racha', description: 'Protege tu racha por un día', type: 'streak_freeze', price: 50, icon: '🧊' },
    { key: 'badge_vip', name: 'Badge VIP', description: 'Un badge exclusivo para usuarios VIP', type: 'badge', price: 300, icon: '👑' },
    { key: 'theme_ocean', name: 'Tema Océano', description: 'Cambia el color de tu interfaz a azul océano', type: 'theme', price: 150, icon: '🌊' },
    { key: 'theme_forest', name: 'Tema Bosque', description: 'Cambia el color de tu interfaz a verde bosque', type: 'theme', price: 150, icon: '🌲' },
  ];

  for (const item of shopItems) {
    await prisma.shopItem.upsert({
      where: { key: item.key },
      update: item,
      create: item,
    });
  }
  console.log('✅ Shop items created');

  // ===========================================
  // COURSE CREATION HELPER
  // ===========================================
  
  const createCourse = async (
    id: string,
    title: string,
    description: string,
    category: string,
    difficulty: string,
    estimatedHours: number,
    imageUrl: string,
    options: { isPro?: boolean; price?: number; requiredLevel?: number } = {}
  ) => {
    return prisma.course.upsert({
      where: { id },
      update: { title, description, category, difficulty, estimatedHours, imageUrl, isPublished: true, ...options },
      create: { id, title, description, category, difficulty, estimatedHours, imageUrl, isPublished: true, ...options },
    });
  };

  const createModule = async (id: string, courseId: string, title: string, order: number) => {
    return prisma.module.upsert({
      where: { id },
      update: { title, order },
      create: { id, courseId, title, order },
    });
  };

  const createLesson = async (id: string, moduleId: string, title: string, type: string, content: any, xpReward: number, order: number) => {
    return prisma.lesson.upsert({
      where: { id },
      update: { title, type, content, xpReward, order },
      create: { id, moduleId, title, type, content, xpReward, order },
    });
  };

  // ===========================================
  // PROGRAMMING COURSES - EXPANDED
  // ===========================================
  console.log('\n📚 Creating/Expanding Programming Courses...');

  // JavaScript Fundamentals - EXPANDED
  const jsCourse = await createCourse(
    'course-js-fundamentals',
    'JavaScript Fundamentals',
    'Aprende los fundamentos de JavaScript, el lenguaje de programación más popular del mundo. Desde variables hasta funciones, domina la base del desarrollo web.',
    'Programación',
    'beginner',
    15,
    'https://placehold.co/600x400/2563eb/white?text=JavaScript'
  );

  // Module 1: Introducción
  const jsModule1 = await createModule('js-module-1', jsCourse.id, 'Introducción a JavaScript', 1);
  await createLesson('js-lesson-1-1', jsModule1.id, '¿Qué es JavaScript?', 'multiple_choice', {
    question: '¿JavaScript es un lenguaje de programación que se ejecuta principalmente en:',
    options: ['El servidor', 'El navegador web', 'Bases de datos', 'Sistemas operativos'],
    correctIndex: 1,
  }, 20, 1);
  await createLesson('js-lesson-1-2', jsModule1.id, 'Variables con let y const', 'multiple_choice', {
    question: '¿Cuál es la forma correcta de declarar una variable constante en JavaScript?',
    options: ['var PI = 3.14', 'let PI = 3.14', 'const PI = 3.14', 'constant PI = 3.14'],
    correctIndex: 2,
  }, 20, 2);
  await createLesson('js-lesson-1-3', jsModule1.id, 'Tipos de datos', 'fill_blank', {
    sentence: 'El tipo de dato para texto en JavaScript se llama ___',
    correctAnswer: 'string',
    hint: 'Piensa en "cadena" de texto',
  }, 25, 3);

  // Module 2: Control de Flujo
  const jsModule2 = await createModule('js-module-2', jsCourse.id, 'Control de Flujo', 2);
  await createLesson('js-lesson-2-1', jsModule2.id, 'Condicionales if/else', 'multiple_choice', {
    question: '¿Qué resultado produce: if (5 > 3) { console.log("Sí") } else { console.log("No") }?',
    options: ['No', 'Sí', 'Error', 'undefined'],
    correctIndex: 1,
  }, 20, 1);
  await createLesson('js-lesson-2-2', jsModule2.id, 'Bucles for', 'true_false', {
    statement: 'El bucle for se usa para repetir código un número específico de veces.',
    correctAnswer: true,
  }, 15, 2);
  await createLesson('js-lesson-2-3', jsModule2.id, 'Bucles while', 'multiple_choice', {
    question: '¿Cuándo es preferible usar un bucle while en vez de for?',
    options: ['Cuando sabemos exactamente cuántas iteraciones necesitamos', 'Cuando no sabemos cuántas iteraciones necesitamos', 'Nunca, for siempre es mejor', 'Solo para arrays'],
    correctIndex: 1,
  }, 20, 3);

  // Module 3: Funciones
  const jsModule3 = await createModule('js-module-3', jsCourse.id, 'Funciones', 3);
  await createLesson('js-lesson-3-1', jsModule3.id, 'Crear funciones', 'multiple_choice', {
    question: '¿Cuál es la sintaxis correcta para crear una función flecha (arrow function)?',
    options: ['function miFunc() {}', 'func miFunc() {}', 'const miFunc = () => {}', 'def miFunc() {}'],
    correctIndex: 2,
  }, 25, 1);
  await createLesson('js-lesson-3-2', jsModule3.id, 'Parámetros y argumentos', 'fill_blank', {
    sentence: 'Los valores que pasamos a una función se llaman ___',
    correctAnswer: 'argumentos',
    hint: 'Son los "datos" que recibe la función',
  }, 25, 2);
  await createLesson('js-lesson-3-3', jsModule3.id, 'Valores de retorno', 'multiple_choice', {
    question: '¿Qué palabra clave se usa para retornar un valor en una función?',
    options: ['return', 'give', 'output', 'send'],
    correctIndex: 0,
  }, 20, 3);

  // NEW Module 4: Arrays
  const jsModule4 = await createModule('js-module-4', jsCourse.id, 'Arrays (Arreglos)', 4);
  await createLesson('js-lesson-4-1', jsModule4.id, '¿Qué es un array?', 'multiple_choice', {
    question: 'Un array en JavaScript es:',
    options: ['Un tipo de número', 'Una colección ordenada de elementos', 'Un texto largo', 'Una función especial'],
    correctIndex: 1,
  }, 20, 1);
  await createLesson('js-lesson-4-2', jsModule4.id, 'Acceder a elementos', 'fill_blank', {
    sentence: 'Para acceder al primer elemento de un array, usamos el índice ___',
    correctAnswer: '0',
    hint: 'Los índices empiezan en 0, no en 1',
  }, 20, 2);
  await createLesson('js-lesson-4-3', jsModule4.id, 'Métodos comunes de arrays', 'multiple_choice', {
    question: '¿Qué método añade un elemento al final de un array?',
    options: ['push()', 'pop()', 'shift()', 'unshift()'],
    correctIndex: 0,
  }, 25, 3);
  await createLesson('js-lesson-4-4', jsModule4.id, 'map() y filter()', 'true_false', {
    statement: 'El método map() transforma cada elemento de un array y devuelve un nuevo array.',
    correctAnswer: true,
  }, 30, 4);

  // NEW Module 5: Objetos
  const jsModule5 = await createModule('js-module-5', jsCourse.id, 'Objetos', 5);
  await createLesson('js-lesson-5-1', jsModule5.id, '¿Qué es un objeto?', 'multiple_choice', {
    question: 'En JavaScript, un objeto es:',
    options: ['Un tipo de función', 'Una colección de propiedades clave-valor', 'Solo para hacer matemáticas', 'Un tipo de array'],
    correctIndex: 1,
  }, 20, 1);
  await createLesson('js-lesson-5-2', jsModule5.id, 'Crear y usar objetos', 'fill_blank', {
    sentence: 'Para acceder a la propiedad "name" de un objeto "user", escribimos user.___',
    correctAnswer: 'name',
    hint: 'Se usa punto o corchetes',
  }, 20, 2);
  await createLesson('js-lesson-5-3', jsModule5.id, 'Métodos en objetos', 'multiple_choice', {
    question: '¿Cómo defines un método dentro de un objeto?',
    options: ['method: function() {}', 'method() {}', 'function method() {}', 'Solo con arrow functions'],
    correctIndex: 0,
  }, 25, 3);
  await createLesson('js-lesson-5-4', jsModule5.id, 'Destructuring', 'true_false', {
    statement: 'El destructuring permite extraer propiedades de un objeto en variables separadas.',
    correctAnswer: true,
  }, 30, 4);

  // NEW Module 6: DOM Basics
  const jsModule6 = await createModule('js-module-6', jsCourse.id, 'Manipulación del DOM', 6);
  await createLesson('js-lesson-6-1', jsModule6.id, '¿Qué es el DOM?', 'multiple_choice', {
    question: 'El DOM (Document Object Model) representa:',
    options: ['Una base de datos', 'La estructura de tu página web como objetos', 'Un tipo de archivo CSS', 'El servidor'],
    correctIndex: 1,
  }, 20, 1);
  await createLesson('js-lesson-6-2', jsModule6.id, 'selectElementById', 'true_false', {
    statement: 'document.getElementById("miId") selecciona el elemento con ese ID.',
    correctAnswer: true,
  }, 20, 2);
  await createLesson('js-lesson-6-3', jsModule6.id, 'Modificar elementos', 'fill_blank', {
    sentence: 'Para cambiar el texto de un elemento, usamos la propiedad ___.textContent',
    correctAnswer: 'element',
    hint: 'La variable que guarda el elemento seleccionado',
  }, 25, 3);
  await createLesson('js-lesson-6-4', jsModule6.id, 'Event listeners', 'multiple_choice', {
    question: '¿Qué método añade un listener de evento a un elemento?',
    options: ['addEvent()', 'onClick()', 'addEventListener()', 'listenEvent()'],
    correctIndex: 2,
  }, 25, 4);

  console.log('✅ JavaScript Fundamentals course expanded (6 módulos, 18 lecciones)');

  // Python para Principiantes - EXPANDED
  const pythonCourse = await createCourse(
    'course-python-beginner',
    'Python para Principiantes',
    'Descubre Python, el lenguaje más fácil de aprender y uno de los más potentes. Ideal para automatización, análisis de datos e inteligencia artificial.',
    'Programación',
    'beginner',
    18,
    'https://placehold.co/600x400/43a047/white?text=Python'
  );

  // Module 1: Primeros Pasos
  const pyModule1 = await createModule('py-module-1', pythonCourse.id, 'Primeros Pasos con Python', 1);
  await createLesson('py-lesson-1-1', pyModule1.id, '¿Qué es Python?', 'multiple_choice', {
    question: '¿Python fue creado por quién?',
    options: ['Bill Gates', 'Guido van Rossum', 'Steve Jobs', 'Mark Zuckerberg'],
    correctIndex: 1,
  }, 15, 1);
  await createLesson('py-lesson-1-2', pyModule1.id, 'Tu primer programa', 'true_false', {
    statement: 'Para mostrar texto en Python se usa la función print()',
    correctAnswer: true,
  }, 15, 2);
  await createLesson('py-lesson-1-3', pyModule1.id, 'Variables en Python', 'multiple_choice', {
    question: '¿Cómo se declara una variable en Python?',
    options: ['int x = 5', 'var x = 5', 'x = 5', 'let x = 5'],
    correctIndex: 2,
  }, 20, 3);

  // Module 2: Estructuras de Datos
  const pyModule2 = await createModule('py-module-2', pythonCourse.id, 'Estructuras de Datos', 2);
  await createLesson('py-lesson-2-1', pyModule2.id, 'Listas', 'multiple_choice', {
    question: '¿Cuál es la forma correcta de crear una lista en Python?',
    options: ['list = (1, 2, 3)', 'list = [1, 2, 3]', 'list = {1, 2, 3}', 'list = <1, 2, 3>'],
    correctIndex: 1,
  }, 20, 1);
  await createLesson('py-lesson-2-2', pyModule2.id, 'Diccionarios', 'fill_blank', {
    sentence: 'Los diccionarios en Python usan pares de clave:___',
    correctAnswer: 'valor',
    hint: 'Ejemplo: {"nombre": "Juan"}',
  }, 25, 2);
  await createLesson('py-lesson-2-3', pyModule2.id, 'Tuplas y Sets', 'multiple_choice', {
    question: '¿Cuál es la diferencia principal entre una lista y una tupla?',
    options: ['No hay diferencia', 'Las tuplas son inmutables', 'Las listas son más rápidas', 'Las tuplas no pueden contener números'],
    correctIndex: 1,
  }, 25, 3);

  // Module 3: Funciones y Módulos
  const pyModule3 = await createModule('py-module-3', pythonCourse.id, 'Funciones y Módulos', 3);
  await createLesson('py-lesson-3-1', pyModule3.id, 'Definir funciones', 'multiple_choice', {
    question: '¿Cuál es la palabra clave para definir una función en Python?',
    options: ['function', 'func', 'def', 'lambda'],
    correctIndex: 2,
  }, 20, 1);
  await createLesson('py-lesson-3-2', pyModule3.id, 'Importar módulos', 'true_false', {
    statement: 'Para usar código de otro archivo en Python se usa "import"',
    correctAnswer: true,
  }, 15, 2);
  await createLesson('py-lesson-3-3', pyModule3.id, 'Parámetros por defecto', 'fill_blank', {
    sentence: 'En Python, los parámetros pueden tener valores ___',
    correctAnswer: 'por defecto',
    hint: 'Se asignan al definir la función',
  }, 20, 3);

  // NEW Module 4: Programación Orientada a Objetos
  const pyModule4 = await createModule('py-module-4', pythonCourse.id, 'Programación Orientada a Objetos', 4);
  await createLesson('py-lesson-4-1', pyModule4.id, '¿Qué son las clases?', 'multiple_choice', {
    question: 'En Python, una clase es:',
    options: ['Un tipo de archivo', 'Un molde para crear objetos', 'Una función especial', 'Solo para datos numéricos'],
    correctIndex: 1,
  }, 20, 1);
  await createLesson('py-lesson-4-2', pyModule4.id, 'Crear una clase', 'true_false', {
    statement: 'Para crear una clase en Python usamos la palabra clave "class"',
    correctAnswer: true,
  }, 20, 2);
  await createLesson('py-lesson-4-3', pyModule4.id, 'El método __init__', 'fill_blank', {
    sentence: 'El método ___ se llama automáticamente al crear un objeto',
    correctAnswer: '__init__',
    hint: 'Tiene dos guiones bajos antes y después',
  }, 25, 3);
  await createLesson('py-lesson-4-4', pyModule4.id, 'Herencia', 'multiple_choice', {
    question: '¿Qué permite la herencia en POO?',
    options: ['Crear copias de objetos', 'Crear una nueva clase basada en una existente', 'Eliminar clases', 'Solo trabajar con números'],
    correctIndex: 1,
  }, 25, 4);

  // NEW Module 5: Manejo de Archivos
  const pyModule5 = await createModule('py-module-5', pythonCourse.id, 'Manejo de Archivos', 5);
  await createLesson('py-lesson-5-1', pyModule5.id, 'Abrir archivos', 'multiple_choice', {
    question: '¿Cuál es la forma correcta de abrir un archivo para leer en Python?',
    options: ['open("archivo.txt", "r")', 'open("archivo.txt", "w")', 'file.open("archivo.txt")', 'read("archivo.txt")'],
    correctIndex: 0,
  }, 20, 1);
  await createLesson('py-lesson-5-2', pyModule5.id, 'Leer y escribir', 'true_false', {
    statement: 'El modo "w" sobrescribe el contenido del archivo, mientras que "a" añade al final.',
    correctAnswer: true,
  }, 20, 2);
  await createLesson('py-lesson-5-3', pyModule5.id, 'Context manager (with)', 'fill_blank', {
    sentence: 'Usar la sentencia ___ asegura que los archivos se cierren correctamente',
    correctAnswer: 'with',
    hint: 'Se usa con "as" para asignar el archivo a una variable',
  }, 25, 3);
  await createLesson('py-lesson-5-4', pyModule5.id, 'Módulos os y pathlib', 'multiple_choice', {
    question: '¿Qué módulo de Python usarías para trabajar con rutas de archivos?',
    options: ['math', 'os y pathlib', 'random', 'json'],
    correctIndex: 1,
  }, 25, 4);

  console.log('✅ Python para Principiantes course expanded (5 módulos, 14 lecciones)');

  // HTML & CSS Basics - EXPANDED
  const htmlCssCourse = await createCourse(
    'course-html-css',
    'HTML & CSS desde Cero',
    'Aprende a crear páginas web stunning. HTML para estructura y CSS para diseño. El primer paso para convertirte en desarrollador web.',
    'Programación',
    'beginner',
    12,
    'https://placehold.co/600x400/e65100/white?text=HTML+%26+CSS'
  );

  // Module 1: Introducción a HTML
  const htmlModule1 = await createModule('html-module-1', htmlCssCourse.id, 'Introducción a HTML', 1);
  await createLesson('html-lesson-1-1', htmlModule1.id, '¿Qué es HTML?', 'multiple_choice', {
    question: 'HTML significa:',
    options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyper Transfer Markup Language'],
    correctIndex: 0,
  }, 15, 1);
  await createLesson('html-lesson-1-2', htmlModule1.id, 'Etiquetas básicas', 'multiple_choice', {
    question: '¿Qué etiqueta se usa para el título principal de una página?',
    options: ['<header>', '<title>', '<h1>', '<heading>'],
    correctIndex: 2,
  }, 20, 2);
  await createLesson('html-lesson-1-3', htmlModule1.id, 'Enlaces e imágenes', 'fill_blank', {
    sentence: 'La etiqueta para insertar una imagen es <___>',
    correctAnswer: 'img',
    hint: 'Img viene de "image" en inglés',
  }, 20, 3);
  await createLesson('html-lesson-1-4', htmlModule1.id, 'Listas en HTML', 'true_false', {
    statement: 'Las etiquetas <ul> y <ol> se usan para listas desordenadas y ordenadas respectivamente.',
    correctAnswer: true,
  }, 15, 4);

  // Module 2: Introducción a CSS
  const htmlModule2 = await createModule('html-module-2', htmlCssCourse.id, 'Introducción a CSS', 2);
  await createLesson('html-lesson-2-1', htmlModule2.id, '¿Qué es CSS?', 'true_false', {
    statement: 'CSS se usa para dar estilo y diseño a las páginas web.',
    correctAnswer: true,
  }, 15, 1);
  await createLesson('html-lesson-2-2', htmlModule2.id, 'Selectores CSS', 'multiple_choice', {
    question: '¿Cómo se selecciona un elemento por su clase en CSS?',
    options: ['#nombre-clase', '.nombre-clase', 'element.nombre-clase', 'class=nombre-clase'],
    correctIndex: 1,
  }, 20, 2);
  await createLesson('html-lesson-2-3', htmlModule2.id, 'Colores y fuentes', 'multiple_choice', {
    question: '¿Cuál es la propiedad CSS para cambiar el color del texto?',
    options: ['text-color', 'font-color', 'color', 'text-style'],
    correctIndex: 2,
  }, 20, 3);
  await createLesson('html-lesson-2-4', htmlModule2.id, 'Box Model', 'fill_blank', {
    sentence: 'Las propiedades padding, border y ___ forman el Box Model de CSS',
    correctAnswer: 'margin',
    hint: 'Es el espacio exterior del elemento',
  }, 25, 4);

  // NEW Module 3: Flexbox y Grid
  const htmlModule3 = await createModule('html-module-3', htmlCssCourse.id, 'Flexbox y Grid', 3);
  await createLesson('html-lesson-3-1', htmlModule3.id, '¿Qué es Flexbox?', 'multiple_choice', {
    question: 'Flexbox es un método de CSS para:',
    options: ['Crear animaciones', 'Diseñar layouts en una dimensión', 'Crear bases de datos', 'Encryptar código'],
    correctIndex: 1,
  }, 20, 1);
  await createLesson('html-lesson-3-2', htmlModule3.id, 'Propiedades de Flexbox', 'true_false', {
    statement: 'justify-content alinea elementos en el eje principal de un contenedor flex.',
    correctAnswer: true,
  }, 20, 2);
  await createLesson('html-lesson-3-3', htmlModule3.id, 'Introducción a CSS Grid', 'fill_blank', {
    sentence: 'Para crear un contenedor grid usamos display: ___',
    correctAnswer: 'grid',
    hint: '(grid = cuadrícula)',
  }, 25, 3);
  await createLesson('html-lesson-3-4', htmlModule3.id, 'Grid vs Flexbox', 'multiple_choice', {
    question: '¿Cuándo es mejor usar Grid en vez de Flexbox?',
    options: ['Para layouts de una dimensión', 'Para layouts de dos dimensiones (filas y columnas)', 'Solo para formularios', 'Para crear animaciones'],
    correctIndex: 1,
  }, 25, 4);

  // NEW Module 4: Responsive Design
  const htmlModule4 = await createModule('html-module-4', htmlCssCourse.id, 'Diseño Responsivo', 4);
  await createLesson('html-lesson-4-1', htmlModule4.id, '¿Qué es diseño responsivo?', 'multiple_choice', {
    question: 'El diseño responsivo significa:',
    options: ['Crear sitios muy rápidos', 'Que la web se adapte a diferentes tamaños de pantalla', 'Solo funciona en móviles', 'Usar muchas imágenes'],
    correctIndex: 1,
  }, 20, 1);
  await createLesson('html-lesson-4-2', htmlModule4.id, 'Viewport meta tag', 'true_false', {
    statement: 'El tag <meta name="viewport"> es necesario para que funcione el diseño responsivo.',
    correctAnswer: true,
  }, 15, 2);
  await createLesson('html-lesson-4-3', htmlModule4.id, 'Media queries', 'fill_blank', {
    sentence: 'Las ___ permiten aplicar estilos diferentes según el tamaño de pantalla',
    correctAnswer: 'media queries',
    hint: 'Son como "preguntas" al navegador sobre el tamaño',
  }, 25, 3);
  await createLesson('html-lesson-4-4', htmlModule4.id, 'Unidades relativas', 'multiple_choice', {
    question: '¿Cuál NO es una unidad relativa en CSS?',
    options: ['rem', 'em', 'px', 'vw'],
    correctIndex: 2,
  }, 20, 4);

  console.log('✅ HTML & CSS course expanded (4 módulos, 16 lecciones)');

  // ===========================================
  // MATH COURSES - EXPANDED
  // ===========================================
  console.log('\n📐 Creating/Expanding Math Courses...');

  // Matemáticas Básicas - EXPANDED
  const mathBasicCourse = await createCourse(
    'course-math-basic',
    'Matemáticas Básicas',
    'Refresca tus habilidades matemáticas fundamentales. Operaciones básicas, fracciones, porcentajes y más. La base para todo lo demás.',
    'Matemáticas',
    'beginner',
    10,
    'https://placehold.co/600x400/7b1fa2/white?text=Matem%C3%A1ticas'
  );

  // Module 1: Operaciones Básicas
  const mathModule1 = await createModule('math-module-1', mathBasicCourse.id, 'Operaciones Básicas', 1);
  await createLesson('math-lesson-1-1', mathModule1.id, 'Suma y resta', 'multiple_choice', {
    question: '¿Cuánto es 125 + 347?',
    options: ['462', '472', '482', '452'],
    correctIndex: 1,
  }, 15, 1);
  await createLesson('math-lesson-1-2', mathModule1.id, 'Multiplicación', 'multiple_choice', {
    question: '¿Cuánto es 15 × 8?',
    options: ['100', '120', '130', '110'],
    correctIndex: 1,
  }, 15, 2);
  await createLesson('math-lesson-1-3', mathModule1.id, 'División', 'true_false', {
    statement: 'El resultado de dividir 48 entre 6 es 8.',
    correctAnswer: true,
  }, 15, 3);
  await createLesson('math-lesson-1-4', mathModule1.id, 'Orden de operaciones', 'multiple_choice', {
    question: '¿Cuál es el resultado de 2 + 3 × 4?',
    options: ['20', '14', '24', '11'],
    correctIndex: 1,
  }, 20, 4);

  // Module 2: Fracciones
  const mathModule2 = await createModule('math-module-2', mathBasicCourse.id, 'Fracciones', 2);
  await createLesson('math-lesson-2-1', mathModule2.id, '¿Qué es una fracción?', 'multiple_choice', {
    question: 'En la fracción 3/4, ¿qué representa el número 4?',
    options: ['El numerador', 'El denominador', 'El resultado', 'La fracción'],
    correctIndex: 1,
  }, 20, 1);
  await createLesson('math-lesson-2-2', mathModule2.id, 'Sumar fracciones', 'fill_blank', {
    sentence: 'Para sumar fracciones con el mismo denominador, se suman los ___',
    correctAnswer: 'numeradores',
    hint: 'Arriba están los numeradores',
  }, 25, 2);
  await createLesson('math-lesson-2-3', mathModule2.id, 'Fracciones a decimales', 'multiple_choice', {
    question: '¿Cuánto es 1/2 en forma decimal?',
    options: ['0.25', '0.5', '0.75', '1.0'],
    correctIndex: 1,
  }, 20, 3);
  await createLesson('math-lesson-2-4', mathModule2.id, 'Multiplicar fracciones', 'true_false', {
    statement: 'Para multiplicar fracciones, se multiplica numerador por numerador y denominador por denominador.',
    correctAnswer: true,
  }, 25, 4);

  // Module 3: Porcentajes
  const mathModule3 = await createModule('math-module-3', mathBasicCourse.id, 'Porcentajes', 3);
  await createLesson('math-lesson-3-1', mathModule3.id, '¿Qué es un porcentaje?', 'multiple_choice', {
    question: 'El 50% de 200 es:',
    options: ['50', '100', '150', '200'],
    correctIndex: 1,
  }, 20, 1);
  await createLesson('math-lesson-3-2', mathModule3.id, 'Calcular porcentajes', 'true_false', {
    statement: 'Para calcular el 20% de 150, multiplicamos 150 × 0.20',
    correctAnswer: true,
  }, 20, 2);
  await createLesson('math-lesson-3-3', mathModule3.id, 'Porcentaje a fracción', 'fill_blank', {
    sentence: 'El 25% equivale a la fracción 1/__',
    correctAnswer: '4',
    hint: '25% = 25/100 = 1/4',
  }, 20, 3);
  await createLesson('math-lesson-3-4', mathModule3.id, 'Cambio porcentual', 'multiple_choice', {
    question: 'Si un producto pasa de $50 a $60, ¿cuál es el aumento porcentual?',
    options: ['10%', '20%', '30%', '15%'],
    correctIndex: 1,
  }, 25, 4);

  // NEW Module 4: Geometría Básica
  const mathModule4 = await createModule('math-module-4', mathBasicCourse.id, 'Geometría Básica', 4);
  await createLesson('math-lesson-4-1', mathModule4.id, 'Figuras geométricas', 'multiple_choice', {
    question: '¿Cuántos lados tiene un hexágono?',
    options: ['5', '6', '7', '8'],
    correctIndex: 1,
  }, 15, 1);
  await createLesson('math-lesson-4-2', mathModule4.id, 'Perímetro', 'true_false', {
    statement: 'El perímetro de un rectángulo se calcula como 2 × (largo + ancho)',
    correctAnswer: true,
  }, 20, 2);
  await createLesson('math-lesson-4-3', mathModule4.id, 'Área de figuras', 'fill_blank', {
    sentence: 'El área de un rectángulo se calcula como largo × ___',
    correctAnswer: 'ancho',
    hint: 'También puedes pensar como base × altura',
  }, 20, 3);
  await createLesson('math-lesson-4-4', mathModule4.id, 'Círculo y π', 'multiple_choice', {
    question: 'Si el radio de un círculo es 5, ¿cuál es su diámetro?',
    options: ['2.5', '5', '10', '25'],
    correctIndex: 2,
  }, 20, 4);

  // NEW Module 5: Estadísticas Básicas
  const mathModule5 = await createModule('math-module-5', mathBasicCourse.id, 'Estadísticas Básicas', 5);
  await createLesson('math-lesson-5-1', mathModule5.id, 'Media (promedio)', 'multiple_choice', {
    question: '¿Cuál es la media de 4, 8, 6 y 10?',
    options: ['6', '7', '8', '9'],
    correctIndex: 1,
  }, 20, 1);
  await createLesson('math-lesson-5-2', mathModule5.id, 'Mediana', 'true_false', {
    statement: 'La mediana es el valor que queda en medio cuando ordenamos los datos.',
    correctAnswer: true,
  }, 20, 2);
  await createLesson('math-lesson-5-3', mathModule5.id, 'Moda', 'fill_blank', {
    sentence: 'La ___ es el valor que más se repite en un conjunto de datos',
    correctAnswer: 'moda',
    hint: 'Es la más "popular"',
  }, 20, 3);
  await createLesson('math-lesson-5-4', mathModule5.id, 'Rango', 'multiple_choice', {
    question: 'El rango de los datos 3, 7, 2, 9, 1 es:',
    options: ['6', '7', '8', '9'],
    correctIndex: 2,
  }, 20, 4);

  console.log('✅ Matemáticas Básicas course expanded (5 módulos, 18 lecciones)');

  // Álgebra Elemental - EXPANDED
  const algebraCourse = await createCourse(
    'course-algebra',
    'Álgebra Elemental',
    'Domina las ecuaciones y expresiones algebraicas. Aprende a resolver problemas del mundo real usando el lenguaje de las matemáticas.',
    'Matemáticas',
    'intermediate',
    15,
    'https://placehold.co/600x400/00838f/white?text=%C3%81lgebra'
  );

  // Module 1: Expresiones Algebraicas
  const algModule1 = await createModule('alg-module-1', algebraCourse.id, 'Expresiones Algebraicas', 1);
  await createLesson('alg-lesson-1-1', algModule1.id, '¿Qué es una variable?', 'multiple_choice', {
    question: 'En la expresión 2x + 5 = 15, ¿qué es x?',
    options: ['Un número fijo', 'Una variable que desconocemos', 'El resultado', 'Un operador'],
    correctIndex: 1,
  }, 20, 1);
  await createLesson('alg-lesson-1-2', algModule1.id, 'Términos y coeficientes', 'fill_blank', {
    sentence: 'En el término 4x², el número 4 es el ___',
    correctAnswer: 'coeficiente',
    hint: 'Es el factor numérico del término',
  }, 25, 2);
  await createLesson('alg-lesson-1-3', algModule1.id, 'Simplificar expresiones', 'multiple_choice', {
    question: '¿Cuánto es 3x + 2x?',
    options: ['5x', '6x', '5x²', '6'],
    correctIndex: 0,
  }, 20, 3);
  await createLesson('alg-lesson-1-4', algModule1.id, 'Polinomios', 'true_false', {
    statement: 'Un polinomio es una expresión algebraica con múltiples términos.',
    correctAnswer: true,
  }, 20, 4);

  // Module 2: Ecuaciones
  const algModule2 = await createModule('alg-module-2', algebraCourse.id, 'Ecuaciones', 2);
  await createLesson('alg-lesson-2-1', algModule2.id, 'Ecuaciones de primer grado', 'multiple_choice', {
    question: 'Si 2x + 6 = 14, ¿cuánto vale x?',
    options: ['4', '5', '6', '8'],
    correctIndex: 0,
  }, 25, 1);
  await createLesson('alg-lesson-2-2', algModule2.id, 'Resolver ecuaciones', 'true_false', {
    statement: 'Para resolver x + 5 = 12, restamos 5 de ambos lados.',
    correctAnswer: true,
  }, 20, 2);
  await createLesson('alg-lesson-2-3', algModule2.id, 'Ecuaciones con paréntesis', 'fill_blank', {
    sentence: 'Para resolver 2(x + 3) = 10, primero ___ ambos lados por 2',
    correctAnswer: 'dividimos',
    hint: 'O aplicamos la propiedad distributiva primero',
  }, 25, 3);
  await createLesson('alg-lesson-2-4', algModule2.id, 'Ecuaciones con fracciones', 'multiple_choice', {
    question: '¿Cuál es el primer paso para resolver x/3 + 2 = 5?',
    options: ['Multiplicar por 3', 'Restar 2 de ambos lados', 'Ambos A y B son válidos', 'Dividir entre 3'],
    correctIndex: 2,
  }, 25, 4);

  // Module 3: Sistemas de Ecuaciones
  const algModule3 = await createModule('alg-module-3', algebraCourse.id, 'Sistemas de Ecuaciones', 3);
  await createLesson('alg-lesson-3-1', algModule3.id, '¿Qué es un sistema?', 'multiple_choice', {
    question: 'Un sistema de ecuaciones es un conjunto de...',
    options: ['Una ecuación muy larga', 'Dos o más ecuaciones con las mismas variables', 'Varias operaciones', 'Un tipo especial de fracción'],
    correctIndex: 1,
  }, 20, 1);
  await createLesson('alg-lesson-3-2', algModule3.id, 'Método de sustitución', 'fill_blank', {
    sentence: 'El método de sustitución consiste en ___ una variable de una ecuación.',
    correctAnswer: 'despejar',
    hint: 'Dejar la variable sola en un lado',
  }, 25, 2);
  await createLesson('alg-lesson-3-3', algModule3.id, 'Método de eliminación', 'true_false', {
    statement: 'El método de eliminación busca que una variable tenga coeficientes opuestos para eliminarla.',
    correctAnswer: true,
  }, 25, 3);
  await createLesson('alg-lesson-3-4', algModule3.id, 'Interpretación gráfica', 'multiple_choice', {
    question: '¿Qué representa el punto donde se cruzan dos rectas en un sistema?',
    options: ['No tiene significado', 'La solución del sistema', 'Un error', 'El promedio'],
    correctIndex: 1,
  }, 25, 4);

  // NEW Module 4: Polinomios
  const algModule4 = await createModule('alg-module-4', algebraCourse.id, 'Polinomios', 4);
  await createLesson('alg-lesson-4-1', algModule4.id, 'Suma de polinomios', 'multiple_choice', {
    question: '¿Cuánto es (2x + 3) + (5x - 1)?',
    options: ['7x + 2', '7x + 4', '10x + 2', '3x - 2'],
    correctIndex: 0,
  }, 20, 1);
  await createLesson('alg-lesson-4-2', algModule4.id, 'Multiplicación de polinomios', 'true_false', {
    statement: 'Para multiplicar (x + 2)(x + 3), usamos la propiedad distributiva multiple veces.',
    correctAnswer: true,
  }, 25, 2);
  await createLesson('alg-lesson-4-3', algModule4.id, 'Productos notables', 'fill_blank', {
    sentence: 'El producto notable (a + b)² es igual a a² + 2ab + ___',
    correctAnswer: 'b²',
    hint: 'Es el cuadrado del segundo término',
  }, 25, 3);
  await createLesson('alg-lesson-4-4', algModule4.id, 'Factorización básica', 'multiple_choice', {
    question: '¿Cuál es la factorización correcta de x² - 9?',
    options: ['(x + 3)(x + 3)', '(x - 3)(x + 3)', '(x - 9)(x + 1)', 'No se puede factorizar'],
    correctIndex: 1,
  }, 25, 4);

  // NEW Module 5: Funciones
  const algModule5 = await createModule('alg-module-5', algebraCourse.id, 'Funciones', 5);
  await createLesson('alg-lesson-5-1', algModule5.id, '¿Qué es una función?', 'multiple_choice', {
    question: 'Una función f(x) asigna a cada entrada:',
    options: ['Varios resultados', 'Exactamente una salida', 'Ningun resultado', 'Solo números negativos'],
    correctIndex: 1,
  }, 20, 1);
  await createLesson('alg-lesson-5-2', algModule5.id, 'Dominio y rango', 'true_false', {
    statement: 'El dominio de una función es el conjunto de todos los valores de entrada posibles.',
    correctAnswer: true,
  }, 20, 2);
  await createLesson('alg-lesson-5-3', algModule5.id, 'Funciones lineales', 'fill_blank', {
    sentence: 'La gráfica de una función lineal es siempre una ___',
    correctAnswer: 'recta',
    hint: 'Línea sin curvas',
  }, 20, 3);
  await createLesson('alg-lesson-5-4', algModule5.id, 'Pendiente e intercepto', 'multiple_choice', {
    question: 'En la ecuación y = mx + b, ¿qué representa m?',
    options: ['El intercepto Y', 'La pendiente', 'El origen', 'Una constante'],
    correctIndex: 1,
  }, 25, 4);

  console.log('✅ Álgebra Elemental course expanded (5 módulos, 18 lecciones)');

  // ===========================================
  // LANGUAGE COURSES - EXPANDED
  // ===========================================
  console.log('\n🌍 Creating/Expanding Language Courses...');

  // Inglés para Principiantes - EXPANDED
  const englishCourse = await createCourse(
    'course-english-beginner',
    'Inglés para Principiantes',
    'Tu primer paso para dominar el inglés. Vocabulario esencial, frases útiles y gramática básica para comunicarte desde el primer día.',
    'Idiomas',
    'beginner',
    20,
    'https://placehold.co/600x400/1565c0/white?text=Ingl%C3%A9s'
  );

  // Module 1: Saludos y Presentaciones
  const engModule1 = await createModule('eng-module-1', englishCourse.id, 'Saludos y Presentaciones', 1);
  await createLesson('eng-lesson-1-1', engModule1.id, 'Saludos básicos', 'multiple_choice', {
    question: '¿Cómo dices "Hola, ¿cómo estás?" en inglés?',
    options: ['Hello, how are you?', 'Goodbye, see you', 'Thank you very much', 'Nice to meet you'],
    correctIndex: 0,
  }, 15, 1);
  await createLesson('eng-lesson-1-2', engModule1.id, 'Presentarte', 'fill_blank', {
    sentence: 'Mi nombre es = My ___ is',
    correctAnswer: 'name',
    hint: 'Name significa nombre',
  }, 15, 2);
  await createLesson('eng-lesson-1-3', engModule1.id, 'Despedidas', 'multiple_choice', {
    question: '¿Qué dices cuando te despides de alguien?',
    options: ['Hello', 'Thank you', 'Goodbye', 'Please'],
    correctIndex: 2,
  }, 15, 3);
  await createLesson('eng-lesson-1-4', engModule1.id, 'Frases para conocer gente', 'true_false', {
    statement: '"Nice to meet you" se usa cuando conoces a alguien por primera vez.',
    correctAnswer: true,
  }, 15, 4);

  // Module 2: Números y Colores
  const engModule2 = await createModule('eng-module-2', englishCourse.id, 'Números y Colores', 2);
  await createLesson('eng-lesson-2-1', engModule2.id, 'Números del 1 al 20', 'multiple_choice', {
    question: '¿Cómo se dice "once" en inglés?',
    options: ['10', '11', '12', '13'],
    correctIndex: 1,
  }, 15, 1);
  await createLesson('eng-lesson-2-2', engModule2.id, 'Números mayores', 'true_false', {
    statement: '"Twenty" significa 20.',
    correctAnswer: true,
  }, 15, 2);
  await createLesson('eng-lesson-2-3', engModule2.id, 'Colores básicos', 'multiple_choice', {
    question: '¿Qué color es "blue"?',
    options: ['Rojo', 'Azul', 'Verde', 'Amarillo'],
    correctIndex: 1,
  }, 15, 3);
  await createLesson('eng-lesson-2-4', engModule2.id, 'Números ordinales', 'fill_blank', {
    sentence: '1st, 2nd, 3rd... estos son números ___',
    correctAnswer: 'ordinales',
    hint: 'Indican posición o orden',
  }, 20, 4);

  // Module 3: Días y Meses
  const engModule3 = await createModule('eng-module-3', englishCourse.id, 'Días y Meses', 3);
  await createLesson('eng-lesson-3-1', engModule3.id, 'Los días de la semana', 'fill_blank', {
    sentence: 'Monday, Tuesday, Wednesday... El día que falta es ___',
    correctAnswer: 'thursday',
    hint: 'Viene antes del viernes (Friday)',
  }, 20, 1);
  await createLesson('eng-lesson-3-2', engModule3.id, 'Los meses del año', 'multiple_choice', {
    question: '¿En qué mes estás si hoy es January 15?',
    options: ['Febrero', 'Enero', 'Marzo', 'Diciembre'],
    correctIndex: 1,
  }, 15, 2);
  await createLesson('eng-lesson-3-3', engModule3.id, 'Fechas importantes', 'true_false', {
    statement: 'Para decir "Nací el 5 de mayo" en inglés dices: "I was born on May 5th"',
    correctAnswer: true,
  }, 20, 3);
  await createLesson('eng-lesson-3-4', engModule3.id, 'La hora', 'multiple_choice', {
    question: '¿Cómo dices "3:30" en inglés?',
    options: ['Three and thirty', 'Half past three', 'Three thirty minutes', 'Three point thirty'],
    correctIndex: 1,
  }, 20, 4);

  // NEW Module 4: Verbos Básicos
  const engModule4 = await createModule('eng-module-4', englishCourse.id, 'Verbos Básicos', 4);
  await createLesson('eng-lesson-4-1', engModule4.id, 'El verbo "to be"', 'multiple_choice', {
    question: '¿Cuál es la forma correcta para "yo soy"?',
    options: ['I is', 'I am', 'I be', 'I are'],
    correctIndex: 1,
  }, 20, 1);
  await createLesson('eng-lesson-4-2', engModule4.id, 'Verbos de acción', 'true_false', {
    statement: '"To run" significa correr y "to eat" significa comer.',
    correctAnswer: true,
  }, 15, 2);
  await createLesson('eng-lesson-4-3', engModule4.id, 'Presente simple', 'fill_blank', {
    sentence: 'She ___ (work) en una oficina. Completa con presente simple.',
    correctAnswer: 'works',
    hint: 'Añade "s" o "es" en tercera persona singular',
  }, 20, 3);
  await createLesson('eng-lesson-4-4', engModule4.id, 'Verbos regulares e irregulares', 'multiple_choice', {
    question: '¿Cuál es el pasado de "go"?',
    options: ['Goed', 'Went', 'Gone', 'Going'],
    correctIndex: 1,
  }, 25, 4);

  // NEW Module 5: La Familia
  const engModule5 = await createModule('eng-module-5', englishCourse.id, 'La Familia', 5);
  await createLesson('eng-lesson-5-1', engModule5.id, 'Miembros de la familia', 'multiple_choice', {
    question: '¿Qué significa "sibling"?',
    options: ['Padre o madre', 'Hermano o hermana', 'Abuelo', 'Tío'],
    correctIndex: 1,
  }, 20, 1);
  await createLesson('eng-lesson-5-2', engModule5.id, 'Relaciones familiares', 'true_false', {
    statement: '"Niece" es la hija de tu hermano o hermana, y "nephew" es el hijo.',
    correctAnswer: true,
  }, 20, 2);
  await createLesson('eng-lesson-5-3', engModule5.id, 'Describir tu familia', 'fill_blank', {
    sentence: 'I have two brothers and one ___. Mi única hermana.',
    correctAnswer: 'sister',
    hint: 'Contrario de brother',
  }, 20, 3);
  await createLesson('eng-lesson-5-4', engModule5.id, 'Frases con familia', 'multiple_choice', {
    question: '¿Qué significa "I grew up with my grandparents"?',
    options: ['Vivo con mis abuelos', 'Crecí con mis abuelos', 'Visitó a mis abuelos', 'Llamé a mis abuelos'],
    correctIndex: 1,
  }, 25, 4);

  console.log('✅ Inglés para Principiantes course expanded (5 módulos, 18 lecciones)');

  // Inglés Intermedio - EXPANDED
  const englishIntCourse = await createCourse(
    'course-english-intermediate',
    'Inglés Intermedio',
    'Mejora tu inglés con gramática más avanzada, vocabulario profesional y frases idiomáticas. Prepárate para conversaciones reales.',
    'Idiomas',
    'intermediate',
    25,
    'https://placehold.co/600x400/0d47a1/white?text=Ingl%C3%A9s+Inter'
  );

  // Module 1: Tiempos Verbales
  const engIntModule1 = await createModule('eng-int-module-1', englishIntCourse.id, 'Tiempos Verbales', 1);
  await createLesson('eng-int-lesson-1-1', engIntModule1.id, 'Present Simple vs Present Continuous', 'multiple_choice', {
    question: '¿Cuál es correcta para describir algo que pasa ahora? "She ___ coffee"',
    options: ['drinks', 'is drinking', 'drink', 'will drink'],
    correctIndex: 1,
  }, 25, 1);
  await createLesson('eng-int-lesson-1-2', engIntModule1.id, 'Past Simple', 'fill_blank', {
    sentence: 'Yesterday I ___ (go) to the store. Completa con past simple de "go"',
    correctAnswer: 'went',
    hint: 'Es una forma irregular',
  }, 25, 2);
  await createLesson('eng-int-lesson-1-3', engIntModule1.id, 'Future will vs going to', 'true_false', {
    statement: '"I will study tomorrow" y "I am going to study tomorrow" significan lo mismo.',
    correctAnswer: false,
  }, 20, 3);
  await createLesson('eng-int-lesson-1-4', engIntModule1.id, 'Present Perfect', 'multiple_choice', {
    question: '¿Cuándo usamos el Present Perfect?',
    options: ['Solo para el pasado', 'Para acciones que empezaron en el pasado y continúan o tienen resultado presente', 'Para el futuro', 'Nunca'],
    correctIndex: 1,
  }, 30, 4);

  // Module 2: Vocabulario Avanzado
  const engIntModule2 = await createModule('eng-int-module-2', englishIntCourse.id, 'Vocabulario Avanzado', 2);
  await createLesson('eng-int-lesson-2-1', engIntModule2.id, 'Phrasal verbs comunes', 'multiple_choice', {
    question: '¿Qué significa "give up"?',
    options: ['Dar algo', 'Rendirse', 'Levantarse', 'Regalar'],
    correctIndex: 1,
  }, 25, 1);
  await createLesson('eng-int-lesson-2-2', engIntModule2.id, 'Palabras compuestas', 'fill_blank', {
    sentence: 'Una ___ online es algo que haces por internet.',
    correctAnswer: 'class',
    hint: 'Una clase pero por internet',
  }, 20, 2);
  await createLesson('eng-int-lesson-2-3', engIntModule2.id, 'Idioms comunes', 'true_false', {
    statement: '"To be in a good mood" significa estar de buen humor.',
    correctAnswer: true,
  }, 25, 3);
  await createLesson('eng-int-lesson-2-4', engIntModule2.id, 'Preposiciones de lugar', 'multiple_choice', {
    question: '¿Dónde está el libro si está "on the table"?',
    options: ['Debajo de la mesa', 'Encima de la mesa', 'Dentro de la mesa', 'Al lado de la mesa'],
    correctIndex: 1,
  }, 20, 4);

  // NEW Module 3: Reading Comprehension
  const engIntModule3 = await createModule('eng-int-module-3', englishIntCourse.id, 'Reading Comprehension', 3);
  await createLesson('eng-int-lesson-3-1', engIntModule3.id, 'Estrategias de lectura', 'multiple_choice', {
    question: '¿Cuál es la mejor estrategia cuando no entiendes una palabra en un texto?',
    options: ['Traducir palabra por palabra', 'Buscar contexto para deducir el significado', 'Dejar de leer', 'Memorizar el diccionario'],
    correctIndex: 1,
  }, 20, 1);
  await createLesson('eng-int-lesson-3-2', engIntModule3.id, 'Skimming y Scanning', 'true_false', {
    statement: 'Skimming es leer rápidamente para tener una idea general, mientras que scanning es buscar información específica.',
    correctAnswer: true,
  }, 25, 2);
  await createLesson('eng-int-lesson-3-3', engIntModule3.id, 'Inferir significado', 'fill_blank', {
    sentence: 'Cuando inferimos, usamos pistas del ___ para entender algo no dicho directamente.',
    correctAnswer: 'contexto',
    hint: 'La situación o entorno que rodea las palabras',
  }, 25, 3);
  await createLesson('eng-int-lesson-3-4', engIntModule3.id, 'Main idea y detalles', 'multiple_choice', {
    question: 'La "main idea" de un párrafo es:',
    options: ['Todos los detalles', 'La idea principal o central', 'La primera oración', 'La última oración'],
    correctIndex: 1,
  }, 20, 4);

  // NEW Module 4: Writing Skills
  const engIntModule4 = await createModule('eng-int-module-4', englishIntCourse.id, 'Writing Skills', 4);
  await createLesson('eng-int-lesson-4-1', engIntModule4.id, 'Estructura de un párrafo', 'multiple_choice', {
    question: 'Un párrafo efectivo generalmente incluye:',
    options: ['Solo la idea principal', 'Idea principal + detalles de apoyo', 'Cuántas más oraciones mejor', 'Solo ejemplos'],
    correctIndex: 1,
  }, 20, 1);
  await createLesson('eng-int-lesson-4-2', engIntModule4.id, 'Conectores lógicos', 'true_false', {
    statement: 'Words like "however", "therefore" y "furthermore" son conectores que mejoran la cohesión del texto.',
    correctAnswer: true,
  }, 20, 2);
  await createLesson('eng-int-lesson-4-3', engIntModule4.id, 'Diferentes tipos de texto', 'fill_blank', {
    sentence: 'Para escribir una ___ necesitas presentar argumentos a favor y en contra.',
    correctAnswer: 'essay',
    hint: 'Un texto estructurado con introducción, desarrollo y conclusión',
  }, 25, 3);
  await createLesson('eng-int-lesson-4-4', engIntModule4.id, 'Formal vs informal', 'multiple_choice', {
    question: '¿Cuál es más apropiado para un email de trabajo?',
    options: ['Hey, what up?', 'Dear Mr. Smith, I am writing to...', 'Sup?', 'Gonna do it soon'],
    correctIndex: 1,
  }, 20, 4);

  console.log('✅ Inglés Intermedio course expanded (4 módulos, 16 lecciones)');

  // ===========================================
  // ADDITIONAL COURSES - EXPANDED
  // ===========================================
  console.log('\n🎓 Creating/Expanding Additional Courses...');

  // Fundamentos de IA - EXPANDED
  const aiCourse = await createCourse(
    'course-ai-fundamentals',
    'Fundamentos de Inteligencia Artificial',
    'Aprende los conceptos básicos de la IA, machine learning y redes neuronales. Ideal para principiantes curious about AI.',
    'IA & Tech',
    'beginner',
    12,
    'https://placehold.co/600x400/6a1b9a/white?text=IA+Fundamentos'
  );

  // Module 1: ¿Qué es la IA?
  const aiModule1 = await createModule('ai-module-1', aiCourse.id, '¿Qué es la IA?', 1);
  await createLesson('ai-lesson-1-1', aiModule1.id, 'Introducción a la IA', 'multiple_choice', {
    question: '¿Qué es la Inteligencia Artificial?',
    options: ['Un tipo de robot avanzado', 'Sistemas que pueden aprender y tomar decisiones', 'Solo relacionado con computadoras', 'Un lenguaje de programación'],
    correctIndex: 1,
  }, 20, 1);
  await createLesson('ai-lesson-1-2', aiModule1.id, 'Tipos de IA', 'fill_blank', {
    sentence: 'La IA que puede aprender de datos se llama machine ___.',
    correctAnswer: 'learning',
    hint: 'Son dos palabras',
  }, 25, 2);
  await createLesson('ai-lesson-1-3', aiModule1.id, 'IA en nuestra vida diaria', 'true_false', {
    statement: 'Los asistentes de voz como Siri son ejemplos de IA.',
    correctAnswer: true,
  }, 15, 3);
  await createLesson('ai-lesson-1-4', aiModule1.id, 'Historia de la IA', 'multiple_choice', {
    question: '¿En qué década se acuñó el término "Inteligencia Artificial"?',
    options: ['1950s', '1960s', '1970s', '1980s'],
    correctIndex: 1,
  }, 20, 4);

  // Module 2: Machine Learning
  const aiModule2 = await createModule('ai-module-2', aiCourse.id, 'Machine Learning', 2);
  await createLesson('ai-lesson-2-1', aiModule2.id, '¿Qué es Machine Learning?', 'multiple_choice', {
    question: '¿Cuál es la principal característica del Machine Learning?',
    options: ['No necesita datos', 'Aprende automáticamente de los datos', 'Siempre da respuestas perfectas', 'Solo funciona en computadoras potentes'],
    correctIndex: 1,
  }, 20, 1);
  await createLesson('ai-lesson-2-2', aiModule2.id, 'Tipos de aprendizaje', 'multiple_choice', {
    question: 'Si un algoritmo aprende de datos etiquetados, ¿qué tipo de aprendizaje es?',
    options: ['Aprendizaje no supervisado', 'Aprendizaje supervisado', 'Aprendizaje por refuerzo', 'Deep learning'],
    correctIndex: 1,
  }, 25, 2);
  await createLesson('ai-lesson-2-3', aiModule2.id, 'Datos de entrenamiento', 'true_false', {
    statement: 'Los datos de entrenamiento se usan para que el modelo aprenda patrones.',
    correctAnswer: true,
  }, 20, 3);
  await createLesson('ai-lesson-2-4', aiModule2.id, 'Overfitting y underfitting', 'fill_blank', {
    sentence: 'Overfitting ocurre cuando el modelo memoriza los datos de entrenamiento en lugar de ___ de ellos.',
    correctAnswer: 'aprender',
    hint: 'Generalizar',
  }, 25, 4);

  // NEW Module 3: Deep Learning
  const aiModule3 = await createModule('ai-module-3', aiCourse.id, 'Deep Learning', 3);
  await createLesson('ai-lesson-3-1', aiModule3.id, '¿Qué son las redes neuronales?', 'multiple_choice', {
    question: 'Una red neuronal artificial está inspirada en:',
    options: ['El sistema solar', 'El cerebro humano', 'Los océanos', 'Los animales'],
    correctIndex: 1,
  }, 20, 1);
  await createLesson('ai-lesson-3-2', aiModule3.id, 'Capas y nodos', 'true_false', {
    statement: 'Una red neuronal tiene capas de entrada, capas ocultas y capas de salida.',
    correctAnswer: true,
  }, 20, 2);
  await createLesson('ai-lesson-3-3', aiModule3.id, 'TensorFlow y PyTorch', 'fill_blank', {
    sentence: '___ y PyTorch son frameworks populares para crear redes neuronales.',
    correctAnswer: 'TensorFlow',
    hint: 'Framework de Google',
  }, 25, 3);
  await createLesson('ai-lesson-3-4', aiModule3.id, 'Aplicaciones de deep learning', 'multiple_choice', {
    question: '¿Cuál es un ejemplo de aplicación de deep learning?',
    options: ['Calculadora', 'Reconocimiento de imágenes', 'Bloc de notas', 'Reloj'],
    correctIndex: 1,
  }, 20, 4);

  // NEW Module 4: NLP (Procesamiento de Lenguaje Natural)
  const aiModule4 = await createModule('ai-module-4', aiCourse.id, 'Procesamiento de Lenguaje Natural', 4);
  await createLesson('ai-lesson-4-1', aiModule4.id, '¿Qué es NLP?', 'multiple_choice', {
    question: 'NLP (Natural Language Processing) permite a las computers:',
    options: ['Solo procesar números', 'Entender y generar lenguaje humano', 'Ver imágenes', 'Controlar robots'],
    correctIndex: 1,
  }, 20, 1);
  await createLesson('ai-lesson-4-2', aiModule4.id, 'Tokenización', 'true_false', {
    statement: 'La tokenización es el proceso de dividir texto en palabras o fragmentos más pequeños.',
    correctAnswer: true,
  }, 20, 2);
  await createLesson('ai-lesson-4-3', aiModule4.id, 'Transformers y BERT', 'fill_blank', {
    sentence: 'BERT usa la arquitectura de ___ para entender contexto bidireccional.',
    correctAnswer: 'transformer',
    hint: 'Son un tipo de arquitectura de red neuronal',
  }, 30, 3);
  await createLesson('ai-lesson-4-4', aiModule4.id, 'Aplicaciones de NLP', 'multiple_choice', {
    question: '¿Cuál NO es una aplicación de NLP?',
    options: ['Traducción automática', 'Chatbots', 'Reconocimiento facial', 'Análisis de sentimiento'],
    correctIndex: 2,
  }, 25, 4);

  console.log('✅ AI Fundamentals course expanded (4 módulos, 16 lecciones)');

  // Finanzas Personales - EXPANDED
  const finanzasCourse = await createCourse(
    'course-finanzas',
    'Finanzas Personales para Principiantes',
    'Aprende a gestionar tu dinero, crear presupuestos y hacer inversiones inteligentes desde cero.',
    'Finanzas',
    'beginner',
    10,
    'https://placehold.co/600x400/388e3c/white?text=Finanzas'
  );

  // Module 1: Presupuesto Básico
  const finModule1 = await createModule('fin-module-1', finanzasCourse.id, 'Presupuesto Básico', 1);
  await createLesson('fin-lesson-1-1', finModule1.id, '¿Qué es un presupuesto?', 'multiple_choice', {
    question: '¿Para qué sirve un presupuesto?',
    options: ['Para gastar todo tu dinero', 'Para saber cuánto dinero tienes y en qué gastarlo', 'Solo para empresas', 'Para pedir préstamos'],
    correctIndex: 1,
  }, 20, 1);
  await createLesson('fin-lesson-1-2', finModule1.id, 'Gastos fijos vs variables', 'matching', {
    pairs: [
      { left: 'Renta', right: 'Gasto fijo' },
      { left: 'Comida', right: 'Gasto variable' },
      { left: 'Internet', right: 'Gasto fijo' },
      { left: 'Entretenimiento', right: 'Gasto variable' },
    ],
  }, 30, 2);
  await createLesson('fin-lesson-1-3', finModule1.id, 'Métodos de presupuesto', 'true_false', {
    statement: 'El método 50/30/20 sugiere destinar 50% a necesidades, 30% a deseos y 20% a ahorros.',
    correctAnswer: true,
  }, 25, 3);
  await createLesson('fin-lesson-1-4', finModule1.id, 'Seguimiento de gastos', 'multiple_choice', {
    question: '¿Por qué es importante registrar todos los gastos?',
    options: ['No es importante', 'Para saber exactamente dónde va tu dinero', 'Solo para impresionar', 'No sirve para nada'],
    correctIndex: 1,
  }, 20, 4);

  // Module 2: Ahorrar e Invertir
  const finModule2 = await createModule('fin-module-2', finanzasCourse.id, 'Ahorrar e Invertir', 2);
  await createLesson('fin-lesson-2-1', finModule2.id, 'Regla 50/30/20', 'multiple_choice', {
    question: 'Según la regla 50/30/20, ¿cuánto deberías destinar a necesidades?',
    options: ['20%', '30%', '50%', '40%'],
    correctIndex: 2,
  }, 20, 1);
  await createLesson('fin-lesson-2-2', finModule2.id, 'Interés compuesto', 'true_false', {
    statement: 'El interés compuesto hace que tu dinero crezca más rápido que el interés simple.',
    correctAnswer: true,
  }, 25, 2);
  await createLesson('fin-lesson-2-3', finModule2.id, 'Fondos de emergencia', 'fill_blank', {
    sentence: 'Un fondo de emergencia debería tener al menos ___ meses de gastos.',
    correctAnswer: '3',
    hint: 'Lo recomendado son 3-6 meses',
  }, 20, 3);
  await createLesson('fin-lesson-2-4', finModule2.id, 'Deuda buena vs deuda mala', 'multiple_choice', {
    question: '¿Cuál sería una "deuda buena"?',
    options: ['Crédito para vacaciones', 'Hipoteca para tu vivienda', 'Compra de roupas de lujo', 'Financiamiento de un auto nuevo'],
    correctIndex: 1,
  }, 25, 4);

  // NEW Module 3: Inversiones Básicas
  const finModule3 = await createModule('fin-module-3', finanzasCourse.id, 'Inversiones Básicas', 3);
  await createLesson('fin-lesson-3-1', finModule3.id, '¿Qué es invertir?', 'multiple_choice', {
    question: 'Invertir es:',
    options: ['Gastar todo tu dinero', 'Poner tu dinero a trabajar para generar más dinero', 'Guardar dinero bajo el colchón', 'No hacer nada con tu dinero'],
    correctIndex: 1,
  }, 20, 1);
  await createLesson('fin-lesson-3-2', finModule3.id, 'Riesgo y rendimiento', 'true_false', {
    statement: 'A mayor riesgo en una inversión, generalmente mayor rendimiento potencial.',
    correctAnswer: true,
  }, 20, 2);
  await createLesson('fin-lesson-3-3', finModule3.id, 'Diversificación', 'fill_blank', {
    sentence: 'La ___ significa no poner todos los huevos en la misma canasta.',
    correctAnswer: 'diversificación',
    hint: 'Estrategia de distribuir inversiones',
  }, 25, 3);
  await createLesson('fin-lesson-3-4', finModule3.id, 'Tipos de inversiones', 'multiple_choice', {
    question: '¿Cuál es un ejemplo de inversión de bajo riesgo?',
    options: ['Acciones de tecnología', 'Criptomonedas', 'Bonos del gobierno', 'Startups'],
    correctIndex: 2,
  }, 25, 4);

  // NEW Module 4: Errores Financieros Comunes
  const finModule4 = await createModule('fin-module-4', finanzasCourse.id, 'Errores Financieros Comunes', 4);
  await createLesson('fin-lesson-4-1', finModule4.id, 'Vivir por encima de tus posibilidades', 'multiple_choice', {
    question: '¿Cuál es el error de gastar más de lo que ganas?',
    options: ['No tiene consecuencias', 'Te lleva a deudas y estrés financiero', 'Te hace más feliz', 'Es inteligente'],
    correctIndex: 1,
  }, 20, 1);
  await createLesson('fin-lesson-4-2', finModule4.id, 'No tener ahorros', 'true_false', {
    statement: 'No tener ahorros de emergencia puede llevarte a pedir prestado en momentos de crisis.',
    correctAnswer: true,
  }, 20, 2);
  await createLesson('fin-lesson-4-3', finModule4.id, 'Invertir sin conocimiento', 'fill_blank', {
    sentence: 'Antes de invertir, es importante educarse para no perder ___',
    correctAnswer: 'dinero',
    hint: 'Recurso valioso',
  }, 20, 3);
  await createLesson('fin-lesson-4-4', finModule4.id, 'Ignorar la inflación', 'multiple_choice', {
    question: '¿Por qué es importante considerar la inflación?',
    options: ['No es importante', 'El dinero pierde valor con el tiempo, afectando tu poder de compra', 'Solo afecta a los ricos', 'La inflación siempre beneficia'],
    correctIndex: 1,
  }, 25, 4);

  console.log('✅ Finanzas Personales course expanded (4 módulos, 16 lecciones)');

  // ===========================================
  // PRO COURSES (Premium Content)
  // ===========================================
  console.log('\n👑 Creating/Expanding PRO Courses...');

  // JavaScript Avanzado PRO (Nivel 5+)
  const jsAdvancedCourse = await createCourse(
    'course-js-advanced',
    'JavaScript Avanzado: Mastery PRO',
    'Domina patrones de diseño, async/await, closures, proxies y más. Este curso te llevará de ser un programador básico a un developer avanzado con habilidades profesionales.',
    'Programación',
    'advanced',
    20,
    'https://placehold.co/600x400/1a237e/white?text=JS+Avanzado+PRO',
    { isPro: true, price: 2999, requiredLevel: 5 }
  );

  const jsAdvModule1 = await createModule('js-adv-module-1', jsAdvancedCourse.id, 'Patrones de Diseño', 1);
  await createLesson('js-adv-lesson-1-1', jsAdvModule1.id, 'Module Pattern', 'multiple_choice', {
    question: '¿Qué problema resuelve el Module Pattern en JavaScript?',
    options: ['La velocidad de ejecución', 'El encapsulamiento de código y privacidad', 'La memoria usada', 'El parseo de HTML'],
    correctIndex: 1,
  }, 30, 1);
  await createLesson('js-adv-lesson-1-2', jsAdvModule1.id, 'Factory Pattern', 'multiple_choice', {
    question: '¿Cuándo es preferible usar el Factory Pattern?',
    options: ['Para crear objetos simples', 'Para crear múltiples objetos del mismo tipo sin usar new', 'Para heredar propiedades', 'Para cerrar ciclos de eventos'],
    correctIndex: 1,
  }, 30, 2);

  const jsAdvModule2 = await createModule('js-adv-module-2', jsAdvancedCourse.id, 'Async/Await Profundo', 2);
  await createLesson('js-adv-lesson-2-1', jsAdvModule2.id, 'Promesas Avanzadas', 'multiple_choice', {
    question: '¿Qué hace Promise.allSettled()?',
    options: ['Cancela todas las promesas', 'Espera a que todas se resuelvan sin importar si fallan', 'Detiene la primera que falla', 'Combina promesas en una sola'],
    correctIndex: 1,
  }, 35, 1);
  await createLesson('js-adv-lesson-2-2', jsAdvModule2.id, 'Manejo de errores async', 'true_false', {
    statement: 'En async/await, puedes usar try/catch para manejar errores de forma elegante.',
    correctAnswer: true,
  }, 25, 2);

  const jsAdvModule3 = await createModule('js-adv-module-3', jsAdvancedCourse.id, 'Memory Management', 3);
  await createLesson('js-adv-lesson-3-1', jsAdvModule3.id, 'Closures y Garbage Collection', 'multiple_choice', {
    question: '¿Cuándo se libera la memoria de un closure?',
    options: ['Inmediatamente después de ejecutarse', 'Cuando no hay referencias al closure', 'Nunca, los closures son permanentes', 'Cuando la función externa termina'],
    correctIndex: 1,
  }, 35, 1);

  console.log('✅ JavaScript Avanzado PRO created');

  // React Mastery PRO (Nivel 8+)
  const reactCourse = await createCourse(
    'course-react-mastery',
    'React Mastery: De Cero a Hero PRO',
    'Aprende React como un profesional. Hooks avanzados, context, Redux, patrones de rendimiento, testing y más. El curso definitivo para dominar React.',
    'Programación',
    'advanced',
    30,
    'https://placehold.co/600x400/00acc1/white?text=React+Mastery',
    { isPro: true, price: 4999, requiredLevel: 8 }
  );

  const reactModule1 = await createModule('react-module-1', reactCourse.id, 'Hooks Avanzados', 1);
  await createLesson('react-lesson-1-1', reactModule1.id, 'useReducer vs useState', 'multiple_choice', {
    question: '¿Cuándo es mejor usar useReducer en lugar de useState?',
    options: ['Para valores simples', 'Cuando hay lógica de estado compleja con múltiples sub-valores', 'Nunca, useState es siempre mejor', 'Solo en componentes de clase'],
    correctIndex: 1,
  }, 30, 1);
  await createLesson('react-lesson-1-2', reactModule1.id, 'useMemo y useCallback', 'fill_blank', {
    sentence: 'useMemo se usa para ___ un valor calculado expensive.',
    correctAnswer: 'memorizar',
    hint: 'Guardar en caché para no recalcular',
  }, 30, 2);

  const reactModule2 = await createModule('react-module-2', reactCourse.id, 'Context API Mastery', 2);
  await createLesson('react-lesson-2-1', reactModule2.id, 'Context vs Props Drilling', 'true_false', {
    statement: 'Context es la mejor solución para TODOS los casos de props drilling.',
    correctAnswer: false,
  }, 25, 1);
  await createLesson('react-lesson-2-2', reactModule2.id, 'Performance con Context', 'multiple_choice', {
    question: '¿Cómo se puede optimizar el rendimiento de Context?',
    options: ['Usando más providers', 'Dividiendo contextos por funcionalidad y usando memo', 'Eliminando todos los estados locales', 'Usando Redux siempre'],
    correctIndex: 1,
  }, 30, 2);

  const reactModule3 = await createModule('react-module-3', reactCourse.id, 'Testing en React', 3);
  await createLesson('react-lesson-3-1', reactModule3.id, 'Testing Library vs enzyme', 'multiple_choice', {
    question: '¿Cuál es la filosofía principal de @testing-library/react?',
    options: ['Testear implementación interna', 'Testear el comportamiento del usuario', 'Testear componentes por props', 'Mockear todos los hooks'],
    correctIndex: 1,
  }, 30, 1);

  console.log('✅ React Mastery PRO created');

  // Trading & Investing PRO (Nivel 3+)
  const tradingCourse = await createCourse(
    'course-trading-pro',
    'Trading e Inversiones: Estrategia PRO',
    'Aprende análisis técnico, manejo de riesgo, estrategias de inversión y psicología del trading. Conviértete en un inversor inteligente y disciplinado.',
    'Finanzas',
    'intermediate',
    15,
    'https://placehold.co/600x400/388e3c/white?text=Trading+PRO',
    { isPro: true, price: 3999, requiredLevel: 3 }
  );

  const tradingModule1 = await createModule('trading-module-1', tradingCourse.id, 'Fundamentos del Trading', 1);
  await createLesson('trading-lesson-1-1', tradingModule1.id, '¿Qué es el Trading?', 'multiple_choice', {
    question: 'La diferencia principal entre trading e inversión a largo plazo es:',
    options: ['El capital inicial', 'El horizonte de tiempo y frecuencia de operaciones', 'Los mercados donde se opera', 'El país donde se reside'],
    correctIndex: 1,
  }, 25, 1);
  await createLesson('trading-lesson-1-2', tradingModule1.id, 'Análisis Técnico vs Fundamental', 'true_false', {
    statement: 'El análisis técnico se basa exclusivamente en precios históricos y volúmenes.',
    correctAnswer: true,
  }, 20, 2);

  const tradingModule2 = await createModule('trading-module-2', tradingCourse.id, 'Gestión de Riesgo', 2);
  await createLesson('trading-lesson-2-1', tradingModule2.id, 'Regla del 1%', 'multiple_choice', {
    question: 'Según la regla del 1%, ¿cuánto deberías arriesgar por operación?',
    options: ['1% del capital total', '10% del capital total', 'Todo lo que puedas', 'Depende del mercado'],
    correctIndex: 0,
  }, 30, 1);
  await createLesson('trading-lesson-2-2', tradingModule2.id, 'Ratio Riesgo/Beneficio', 'fill_blank', {
    sentence: 'Un ratio R/R de 1:2 significa que por cada $1 arriesgado, aspiras ganar $___.',
    correctAnswer: '2',
    hint: 'El segundo número es la ganancia esperada',
  }, 25, 2);

  console.log('✅ Trading PRO created');

  // Python Mastery PRO (Nivel 6+)
  const pythonProCourse = await createCourse(
    'course-python-mastery',
    'Python Mastery: Expert PRO',
    'Domina Python como un experto. Decoradores, generators, metaclasses, async/await, testing profesional y patrones de diseño avanzados. Para programadores que quieren alcanzar el siguiente nivel.',
    'Programación',
    'advanced',
    25,
    'https://placehold.co/600x400/1b5e20/white?text=Python+Mastery',
    { isPro: true, price: 3499, requiredLevel: 6 }
  );

  const pyProModule1 = await createModule('py-pro-module-1', pythonProCourse.id, 'Temas Avanzados', 1);
  await createLesson('py-pro-lesson-1-1', pyProModule1.id, 'Decoradores en Profundidad', 'multiple_choice', {
    question: '¿Qué es un decorador en Python?',
    options: ['Una forma de renombrar funciones', 'Una función que extiende el comportamiento de otra función sin modificarla', 'Un tipo de comentario especial', 'Un método para depurar código'],
    correctIndex: 1,
  }, 30, 1);
  await createLesson('py-pro-lesson-1-2', pyProModule1.id, 'Generators y Iterators', 'true_false', {
    statement: 'Los generators son funciones que usan "yield" en lugar de "return".',
    correctAnswer: true,
  }, 25, 2);
  await createLesson('py-pro-lesson-1-3', pyProModule1.id, 'Context Managers', 'fill_blank', {
    sentence: 'La sentencia ___ se usa para trabajar con context managers en Python.',
    correctAnswer: 'with',
    hint: 'Se usa con "as" para asignar el objeto',
  }, 30, 3);

  const pyProModule2 = await createModule('py-pro-module-2', pythonProCourse.id, 'Testing Profesional', 2);
  await createLesson('py-pro-lesson-2-1', pyProModule2.id, 'pytest Avanzado', 'multiple_choice', {
    question: '¿Qué hace pytest.mark.parametrize?',
    options: ['Parametriza los tests para ejecutarlos en paralelo', 'Crea múltiples fixtures con diferentes parámetros', 'Permite ejecutar el mismo test con diferentes inputs', 'Configura el timeout de los tests'],
    correctIndex: 2,
  }, 30, 1);
  await createLesson('py-pro-lesson-2-2', pyProModule2.id, 'Mocking y Patching', 'multiple_choice', {
    question: '¿Para qué sirve unittest.mock.patch?',
    options: ['Para hacer debugging de funciones', 'Para reemplazar temporalmente partes del código durante tests', 'Para acelerar la ejecución de tests', 'Para crear mocks de bases de datos'],
    correctIndex: 1,
  }, 35, 2);

  console.log('✅ Python Mastery PRO created');

  // DevOps Fundamentals PRO (Nivel 7+)
  const devopsCourse = await createCourse(
    'course-devops-pro',
    'DevOps Fundamentals: CI/CD PRO',
    'Aprende CI/CD, Docker, Kubernetes, automatización de infraestructura y monitoreo. Conviértete en un DevOps engineer profesional y domina las herramientas que usan las empresas top.',
    'IA & Tech',
    'advanced',
    30,
    'https://placehold.co/600x400/bf360c/white?text=DevOps+PRO',
    { isPro: true, price: 5999, requiredLevel: 7 }
  );

  const devopsModule1 = await createModule('devops-module-1', devopsCourse.id, 'Contenedores con Docker', 1);
  await createLesson('devops-lesson-1-1', devopsModule1.id, '¿Qué es Docker?', 'multiple_choice', {
    question: '¿Qué problema resuelve Docker?',
    options: ['Solo acelera el desarrollo web', 'Permite crear entornos aislados y reproducibles llamados contenedores', 'Mejora la seguridad de las bases de datos', 'Reemplaza a los lenguajes de programación'],
    correctIndex: 1,
  }, 25, 1);
  await createLesson('devops-lesson-1-2', devopsModule1.id, 'Dockerfile y Docker Compose', 'true_false', {
    statement: 'Un Dockerfile es un archivo que contiene instrucciones para crear una imagen Docker.',
    correctAnswer: true,
  }, 20, 2);

  const devopsModule2 = await createModule('devops-module-2', devopsCourse.id, 'CI/CD con GitHub Actions', 2);
  await createLesson('devops-lesson-2-1', devopsModule2.id, '¿Qué es CI/CD?', 'multiple_choice', {
    question: 'CI/CD significa:',
    options: ['Code Integration / Code Delivery', 'Continuous Integration / Continuous Deployment', 'Centralized Integration / Centralized Deployment', 'Cloud Infrastructure / Cloud Development'],
    correctIndex: 1,
  }, 30, 1);
  await createLesson('devops-lesson-2-2', devopsModule2.id, 'Workflows en GitHub Actions', 'fill_blank', {
    sentence: 'El archivo YAML que define un workflow en GitHub Actions debe estar en la carpeta ___/.',
    correctAnswer: '.github',
    hint: 'Empieza con punto y tiene "github"',
  }, 30, 2);

  const devopsModule3 = await createModule('devops-module-3', devopsCourse.id, 'Kubernetes Básico', 3);
  await createLesson('devops-lesson-3-1', devopsModule3.id, '¿Qué es Kubernetes?', 'multiple_choice', {
    question: '¿Qué es Kubernetes (K8s)?',
    options: ['Un lenguaje de programación', 'Un sistema para orquestrar contenedores en producción', 'Una herramienta de monitoreo de redes', 'Un tipo de base de datos distribuida'],
    correctIndex: 1,
  }, 30, 1);

  console.log('✅ DevOps Fundamentals PRO created');

  // Data Science con Python PRO (Nivel 5+)
  const dataScienceCourse = await createCourse(
    'course-data-science-pro',
    'Data Science con Python: Analytics PRO',
    'Aprende análisis de datos con Pandas, visualización con matplotlib/seaborn, y fundamentos de machine learning con scikit-learn. Ideal para quienes quieren entrar al mundo del data science.',
    'IA & Tech',
    'intermediate',
    25,
    'https://placehold.co/600x400/880e4f/white?text=Data+Science',
    { isPro: true, price: 4499, requiredLevel: 5 }
  );

  const dsModule1 = await createModule('ds-module-1', dataScienceCourse.id, 'Pandas para Análisis', 1);
  await createLesson('ds-lesson-1-1', dsModule1.id, 'DataFrames y Series', 'multiple_choice', {
    question: '¿Qué es un DataFrame en Pandas?',
    options: ['Una única celda de datos', 'Una estructura de datos bidimensional similar a una tabla', 'Un tipo de gráfico', 'Una función de agregación'],
    correctIndex: 1,
  }, 25, 1);
  await createLesson('ds-lesson-1-2', dsModule1.id, 'Operaciones de Limpieza', 'true_false', {
    statement: 'El método dropna() elimina filas con valores faltantes.',
    correctAnswer: true,
  }, 20, 2);

  const dsModule2 = await createModule('ds-module-2', dataScienceCourse.id, 'Visualización de Datos', 2);
  await createLesson('ds-lesson-2-1', dsModule2.id, 'Matplotlib Basics', 'multiple_choice', {
    question: '¿Qué tipo de gráfico usarías para mostrar la distribución de una variable?',
    options: ['Gráfico de líneas', 'Histograma', 'Gráfico de barras', 'Gráfico de pastel'],
    correctIndex: 1,
  }, 25, 1);
  await createLesson('ds-lesson-2-2', dsModule2.id, 'Seaborn para Visualización', 'fill_blank', {
    sentence: 'Para crear un pairplot en Seaborn, usas la función ___().',
    correctAnswer: 'pairplot',
    hint: 'Son dos palabras separadas por un guión bajo',
  }, 25, 2);

  console.log('✅ Data Science con Python PRO created');

  // SQL Mastery PRO (Nivel 4+)
  const sqlCourse = await createCourse(
    'course-sql-mastery',
    'SQL Mastery: Database Expert PRO',
    'Domina SQL desde lo básico hasta consultas avanzadas, subqueries, window functions, optimización de queries y diseño de bases de datos. El curso definitivo para convertirte en un expert en bases de datos.',
    'Programación',
    'intermediate',
    20,
    'https://placehold.co/600x400/0a3d62/white?text=SQL+Mastery',
    { isPro: true, price: 2999, requiredLevel: 4 }
  );

  const sqlModule1 = await createModule('sql-module-1', sqlCourse.id, 'Consultas Avanzadas', 1);
  await createLesson('sql-lesson-1-1', sqlModule1.id, 'Joins en Profundidad', 'multiple_choice', {
    question: '¿Cuál es la diferencia entre INNER JOIN y LEFT JOIN?',
    options: ['INNER JOIN es más rápido', 'LEFT JOIN incluye todas las filas de la tabla izquierda, INNER JOIN solo las que coinciden', 'No hay diferencia', 'LEFT JOIN solo funciona con números'],
    correctIndex: 1,
  }, 30, 1);
  await createLesson('sql-lesson-1-2', sqlModule1.id, 'Subqueries', 'true_false', {
    statement: 'Una subquery es una query dentro de otra query.',
    correctAnswer: true,
  }, 25, 2);

  const sqlModule2 = await createModule('sql-module-2', sqlCourse.id, 'Window Functions', 2);
  await createLesson('sql-lesson-2-1', sqlModule2.id, '¿Qué son las Window Functions?', 'multiple_choice', {
    question: '¿Qué hace la window function ROW_NUMBER()?',
    options: ['Cuenta todas las filas de la tabla', 'Asigna un número único secuencial a cada fila dentro de una partición', 'Calcula la suma acumulada', 'Calcula promedios móviles'],
    correctIndex: 1,
  }, 35, 1);
  await createLesson('sql-lesson-2-2', sqlModule2.id, 'PARTITION BY vs GROUP BY', 'fill_blank', {
    sentence: 'La cláusula ___ se usa en window functions para dividir el resultado en grupos.',
    correctAnswer: 'PARTITION BY',
    hint: 'Tiene dos palabras',
  }, 30, 2);

  console.log('✅ SQL Mastery PRO created');

  // ===========================================
  // CARPINTERÍA COURSE
  // ===========================================
  console.log('\n🪵 Creating Carpintería course...');

  const carpinteriaCourse = await createCourse(
    'course-carpinteria-pro',
    'Carpintería para Principiantes',
    'Aprende los fundamentos de la carpintería, desde el uso de herramientas básicas hasta proyectos prácticos. Ideal para quienes quieren adquirir habilidades en oficios.',
    'Oficios',
    'beginner',
    12,
    'https://placehold.co/600x400/8d6e63/white?text=Carpinter%C3%ADa',
    { isPro: true, price: 999, requiredLevel: 1 }
  );

  // Module 1: Herramientas Básicas
  const carpModule1 = await createModule('carp-module-1', carpinteriaCourse.id, 'Herramientas Básicas', 1);
  await createLesson('carp-lesson-1-1', carpModule1.id, 'El Martillo', 'multiple_choice', {
    question: '¿Para qué se usa principalmente un martillo de carpintero?',
    options: ['Para medir', 'Para golpear y clavar', 'Para cortar', 'Para lijar'],
    correctIndex: 1,
  }, 15, 1);
  await createLesson('carp-lesson-1-2', carpModule1.id, 'El Serrucho', 'true_false', {
    statement: 'El serrucho de costilla es ideal para cortes rectos en madera.',
    correctAnswer: true,
  }, 15, 2);
  await createLesson('carp-lesson-1-3', carpModule1.id, 'El Destornillador', 'multiple_choice', {
    question: '¿Cuántos tipos básicos de destornilladores existen?',
    options: ['1', '2', '3', '4'],
    correctIndex: 1,
  }, 15, 3);

  // Module 2: Medición y Trazado
  const carpModule2 = await createModule('carp-module-2', carpinteriaCourse.id, 'Medición y Trazado', 2);
  await createLesson('carp-lesson-2-1', carpModule2.id, 'La Cinta Métrica', 'multiple_choice', {
    question: '¿Cuál es la unidad de medida más común en carpintería?',
    options: ['Centímetros', 'Pulgadas y centímetros', 'Metros', 'Kilómetros'],
    correctIndex: 1,
  }, 15, 1);
  await createLesson('carp-lesson-2-2', carpModule2.id, 'El Lápiz de Carpintero', 'true_false', {
    statement: 'El lápiz de carpintero tiene forma plana para no rodar.',
    correctAnswer: true,
  }, 15, 2);
  await createLesson('carp-lesson-2-3', carpModule2.id, 'Técnicas de Trazado', 'fill_blank', {
    sentence: 'Para trazar líneas rectas usamos una ___ junto con el lápiz.',
    correctAnswer: 'escuadra',
    hint: 'Herramienta en forma de L',
  }, 20, 3);

  // Module 3: Proyectos Prácticos
  const carpModule3 = await createModule('carp-module-3', carpinteriaCourse.id, 'Proyectos Prácticos', 3);
  await createLesson('carp-lesson-3-1', carpModule3.id, 'Construir una Cajita', 'multiple_choice', {
    question: '¿Qué tipo de unión se usa para las esquinas de una cajita simple?',
    options: ['Unión a 45 grados', 'Unión a 90 grados con clavosen', 'Unión con pegamento solo', 'No importa el tipo'],
    correctIndex: 1,
  }, 25, 1);
  await createLesson('carp-lesson-3-2', carpModule3.id, 'Lijado y Acabado', 'true_false', {
    statement: 'Se debe lijar en dirección de la veta de la madera para un mejor acabado.',
    correctAnswer: true,
  }, 20, 2);
  await createLesson('carp-lesson-3-3', carpModule3.id, 'Aplicación de Barniz', 'fill_blank', {
    sentence: 'Antes de aplicar barniz, la madera debe estar ___ y limpia.',
    correctAnswer: 'lijada',
    hint: 'Suave al tacto',
  }, 20, 3);
  await createLesson('carp-lesson-3-4', carpModule3.id, 'Seguridad en el Taller', 'multiple_choice', {
    question: '¿Por qué es importante usar gafas de protección al cortar madera?',
    options: ['Para ver mejor', 'Para proteger los ojos de astillas y polvo', 'Es solo moda', 'No es necesario'],
    correctIndex: 1,
  }, 20, 4);

  console.log('✅ Carpintería para Principiantes PRO created (3 módulos, 10 lecciones)');

  console.log('\n👑 PRO Courses Summary:');
  console.log('   - JavaScript Avanzado: $29.99 (Nivel 5+) - 3 módulos, 4 lecciones');
  console.log('   - React Mastery: $49.99 (Nivel 8+) - 3 módulos, 4 lecciones');
  console.log('   - Trading e Inversiones: $39.99 (Nivel 3+) - 2 módulos, 4 lecciones');
  console.log('   - Python Mastery: $34.99 (Nivel 6+) - 2 módulos, 5 lecciones');
  console.log('   - DevOps Fundamentals: $59.99 (Nivel 7+) - 3 módulos, 4 lecciones');
  console.log('   - Data Science con Python: $44.99 (Nivel 5+) - 2 módulos, 4 lecciones');
  console.log('   - SQL Mastery: $29.99 (Nivel 4+) - 2 módulos, 4 lecciones');

  // ===========================================
  // DEMO DATA
  // ===========================================
  console.log('\n👤 Creating demo enrollments and progress...');

  const jsLesson1 = await prisma.lesson.findUnique({ where: { id: 'js-lesson-1-1' } });
  const jsLesson2 = await prisma.lesson.findUnique({ where: { id: 'js-lesson-1-2' } });
  const mathLesson1 = await prisma.lesson.findUnique({ where: { id: 'math-lesson-1-1' } });
  const engLesson1 = await prisma.lesson.findUnique({ where: { id: 'eng-lesson-1-1' } });

  const jsEnrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: demo.id, courseId: jsCourse.id } },
    update: {},
    create: { userId: demo.id, courseId: jsCourse.id },
  });

  const mathEnrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: demo.id, courseId: mathBasicCourse.id } },
    update: {},
    create: { userId: demo.id, courseId: mathBasicCourse.id },
  });

  const engEnrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: demo.id, courseId: englishCourse.id } },
    update: {},
    create: { userId: demo.id, courseId: englishCourse.id },
  });

  if (jsLesson1) {
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: demo.id, lessonId: jsLesson1.id } },
      update: {},
      create: {
        userId: demo.id,
        lessonId: jsLesson1.id,
        completed: true,
        score: 100,
        xpEarned: 20,
        timeSpent: 120,
        attempts: 1,
        completedAt: new Date(),
      },
    });
  }

  if (jsLesson2) {
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: demo.id, lessonId: jsLesson2.id } },
      update: {},
      create: {
        userId: demo.id,
        lessonId: jsLesson2.id,
        completed: true,
        score: 80,
        xpEarned: 16,
        timeSpent: 180,
        attempts: 2,
        completedAt: new Date(),
      },
    });
  }

  if (mathLesson1) {
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: demo.id, lessonId: mathLesson1.id } },
      update: {},
      create: {
        userId: demo.id,
        lessonId: mathLesson1.id,
        completed: true,
        score: 100,
        xpEarned: 15,
        timeSpent: 90,
        attempts: 1,
        completedAt: new Date(),
      },
    });
  }

  if (engLesson1) {
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: demo.id, lessonId: engLesson1.id } },
      update: {},
      create: {
        userId: demo.id,
        lessonId: engLesson1.id,
        completed: true,
        score: 90,
        xpEarned: 14,
        timeSpent: 100,
        attempts: 1,
        completedAt: new Date(),
      },
    });
  }

  console.log('✅ Demo enrollments and progress created');

  // ===========================================
  // SYSTEM SETTINGS (Default Configuration)
  // ===========================================
  console.log('\n⚙️ Creating system settings...');

  const systemSettings = [
    { key: 'site_name', value: 'FreeBuffGame', type: 'string', category: 'general', label: 'Nombre del Sitio', description: 'Nombre público de la plataforma', isPublic: true },
    { key: 'site_description', value: 'Aprende jugando con cursos interactivos, juegos y recompensas', type: 'string', category: 'general', label: 'Descripción del Sitio', description: 'Descripción para SEO y páginas públicas', isPublic: true },
    { key: 'contact_email', value: 'soporte@freebuffgame.com', type: 'string', category: 'general', label: 'Email de Contacto', description: 'Email para contacto del admin', isPublic: true },
    { key: 'maintenance_mode', value: 'false', type: 'boolean', category: 'general', label: 'Modo Mantenimiento', description: 'Bloquea el acceso a usuarios no-admin', isPublic: false },
    { key: 'enable_google_auth', value: 'true', type: 'boolean', category: 'features', label: 'Autenticación Google', description: 'Permite login con Google OAuth', isPublic: true },
    { key: 'enable_stripe_payments', value: 'false', type: 'boolean', category: 'features', label: 'Pagos con Stripe', description: 'Habilita compras con Stripe', isPublic: true },
    { key: 'enable_achievements', value: 'true', type: 'boolean', category: 'features', label: 'Sistema de Logros', description: 'Habilita el sistema de logros y recompensas XP', isPublic: true },
    { key: 'enable_leaderboard', value: 'true', type: 'boolean', category: 'features', label: 'Tabla de Posiciones', description: 'Muestra ranking de usuarios por XP', isPublic: true },
    { key: 'enable_shop', value: 'true', type: 'boolean', category: 'features', label: 'Tienda Virtual', description: 'Habilita la tienda de avatares y temas', isPublic: true },
    { key: 'enable_friends', value: 'true', type: 'boolean', category: 'features', label: 'Sistema de Amigos', description: 'Permite agregar y gestionar amigos', isPublic: true },
    { key: 'enable_streaks', value: 'true', type: 'boolean', category: 'features', label: 'Sistema de Rachas', description: 'Tracking de racha diaria de estudio', isPublic: true },
    { key: 'max_upload_size_mb', value: '10', type: 'number', category: 'limits', label: 'Tamaño Máximo de Upload (MB)', description: 'Tamaño máximo de archivos subidos por usuario', isPublic: false },
    { key: 'daily_xp_cap', value: '500', type: 'number', category: 'limits', label: 'Límite Diario de XP', description: 'XP máximo que un usuario puede ganar por día (0 = sin límite)', isPublic: false },
    { key: 'max_friends', value: '100', type: 'number', category: 'limits', label: 'Máximo de Amigos', description: 'Límite de amigos que un usuario puede tener', isPublic: false },
    { key: 'cooldown_hours_shop', value: '24', type: 'number', category: 'limits', label: 'Cooldown de Compra (horas)', description: 'Horas entre compras en la tienda', isPublic: false },
    { key: 'auto_moderation', value: 'false', type: 'boolean', category: 'content', label: 'Auto-Moderación', description: 'Revisa contenido automáticamente con IA', isPublic: false },
    { key: 'report_threshold', value: '3', type: 'number', category: 'content', label: 'Umbral de Reportes', description: 'Reportes antes de revisar automáticamente', isPublic: false },
    { key: 'require_approval_courses', value: 'true', type: 'boolean', category: 'content', label: 'Aprobación de Cursos', description: 'Requiere aprobación de admin para publicar cursos', isPublic: false },
  ];

  for (const setting of systemSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: setting,
      create: setting,
    });
  }
  console.log('✅ System settings created');

  // ===========================================
  // NOTIFICATION TEMPLATES
  // ===========================================
  console.log('\n📬 Creating notification templates...');

  const notificationTemplates = [
    { key: 'welcome_user', title: '¡Bienvenido a FreeBuffGame!', message: '¡Hola {name}! Bienvenido a la plataforma de aprendizaje gamificado. Empieza tu primera lección y ganar XP desde el primer momento.', type: 'system', variables: ['name'] },
    { key: 'achievement_unlocked', title: '🏆 ¡Nuevo Logro Desbloqueado!', message: '¡Felicidades {name}! Has desbloqueado "{achievement}" y ganas {xp} XP extra.', type: 'achievement', variables: ['name', 'achievement', 'xp'] },
    { key: 'level_up', title: '⬆️ ¡Subiste de Nivel!', message: '¡Increíble {name}! Has alcanzado el nivel {level}. Sigue así, champion!', type: 'achievement', variables: ['name', 'level'] },
    { key: 'streak_milestone', title: '🔥 ¡Racha de {streak} días!', message: '{name}, has mantenido una racha de {streak} días. Estás en racha, no pares!', type: 'streak', variables: ['name', 'streak'] },
    { key: 'course_completed', title: '🎓 ¡Curso Completado!', message: '¡Felicidades {name}! Has completado "{course}". Tu conocimiento sigue creciendo!', type: 'course', variables: ['name', 'course'] },
    { key: 'streak_lost', title: '💔 Racha Perdida', message: '{name}, tu racha de {streak} días se ha roto. ¡Pero no te preocupes, puedes empezar una nueva hoy!', type: 'streak', variables: ['name', 'streak'] },
  ];

  for (const template of notificationTemplates) {
    await prisma.notificationTemplate.upsert({
      where: { key: template.key },
      update: template,
      create: template,
    });
  }
  console.log('✅ Notification templates created');

  // ===========================================
  // SUMMARY
  // ===========================================
  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📚 Courses created (EXPANDED):');
  console.log('   PROGRAMMING:');
  console.log('   - JavaScript Fundamentals (6 módulos, 18 lecciones) ✅ EXPANDED');
  console.log('   - Python para Principiantes (5 módulos, 14 lecciones) ✅ EXPANDED');
  console.log('   - HTML & CSS desde Cero (4 módulos, 16 lecciones) ✅ EXPANDED');
  console.log('   MATH:');
  console.log('   - Matemáticas Básicas (5 módulos, 18 lecciones) ✅ EXPANDED');
  console.log('   - Álgebra Elemental (5 módulos, 18 lecciones) ✅ EXPANDED');
  console.log('   LANGUAGES:');
  console.log('   - Inglés para Principiantes (5 módulos, 18 lecciones) ✅ EXPANDED');
  console.log('   - Inglés Intermedio (4 módulos, 16 lecciones) ✅ EXPANDED');
  console.log('   OTHER:');
  console.log('   - Fundamentos de IA (4 módulos, 16 lecciones) ✅ EXPANDED');
  console.log('   - Finanzas Personales (4 módulos, 16 lecciones) ✅ EXPANDED');
  console.log('   PRO: 7 cursos con 4-5 módulos cada uno');
  console.log('   TOTAL: ~175 lecciones en 16 cursos');
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