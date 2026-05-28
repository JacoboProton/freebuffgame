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
  
  // Updated createCourse helper with PRO support
  const createCourse = async (
    id: string,
    title: string,
    description: string,
    category: string,
    difficulty: string,
    estimatedHours: number,
    options: { isPro?: boolean; price?: number; requiredLevel?: number } = {}
  ) => {
    return prisma.course.upsert({
      where: { id },
      update: { title, description, category, difficulty, estimatedHours, isPublished: true, ...options },
      create: { id, title, description, category, difficulty, estimatedHours, isPublished: true, ...options },
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
  // PROGRAMMING COURSES
  // ===========================================
  console.log('\n📚 Creating Programming Courses...');

  // JavaScript Fundamentals
  const jsCourse = await createCourse(
    'course-js-fundamentals',
    'JavaScript Fundamentals',
    'Aprende los fundamentos de JavaScript, el lenguaje de programación más popular del mundo. Desde variables hasta funciones, domina la base del desarrollo web.',
    'Programación',
    'beginner',
    10
  );

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

  console.log('✅ JavaScript Fundamentals course created');

  // Python para Principiantes
  const pythonCourse = await createCourse(
    'course-python-beginner',
    'Python para Principiantes',
    'Descubre Python, el lenguaje más fácil de aprender y uno de los más potentes. Ideal para automatización, análisis de datos e inteligencia artificial.',
    'Programación',
    'beginner',
    12
  );

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

  console.log('✅ Python para Principiantes course created');

  // HTML & CSS Basics
  const htmlCssCourse = await createCourse(
    'course-html-css',
    'HTML & CSS desde Cero',
    'Aprende a crear páginas web stunning. HTML para estructura y CSS para diseño. El primer paso para convertirte en desarrollador web.',
    'Programación',
    'beginner',
    8
  );

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

  console.log('✅ HTML & CSS course created');

  // ===========================================
  // MATH COURSES
  // ===========================================
  console.log('\n📐 Creating Math Courses...');

  // Matemáticas Básicas
  const mathBasicCourse = await createCourse(
    'course-math-basic',
    'Matemáticas Básicas',
    'Refresca tus habilidades matemáticas fundamentales. Operaciones básicas, fracciones, porcentajes y más. La base para todo lo demás.',
    'Matemáticas',
    'beginner',
    6
  );

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

  console.log('✅ Matemáticas Básicas course created');

  // Álgebra Elemental
  const algebraCourse = await createCourse(
    'course-algebra',
    'Álgebra Elemental',
    'Domina las ecuaciones y expresiones algebraicas. Aprende a resolver problemas del mundo real usando el lenguaje de las matemáticas.',
    'Matemáticas',
    'intermediate',
    10
  );

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

  console.log('✅ Álgebra Elemental course created');

  // ===========================================
  // LANGUAGE COURSES
  // ===========================================
  console.log('\n🌍 Creating Language Courses...');

  // Inglés para Principiantes
  const englishCourse = await createCourse(
    'course-english-beginner',
    'Inglés para Principiantes',
    'Tu primer paso para dominar el inglés. Vocabulario esencial, frases útiles y gramática básica para comunicarte desde el primer día.',
    'Idiomas',
    'beginner',
    15
  );

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

  console.log('✅ Inglés para Principiantes course created');

  // Inglés Intermedio
  const englishIntCourse = await createCourse(
    'course-english-intermediate',
    'Inglés Intermedio',
    'Mejora tu inglés con gramática más avanzada, vocabulario profesional y frases idiomáticas. Prepárate para conversaciones reales.',
    'Idiomas',
    'intermediate',
    18
  );

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

  console.log('✅ Inglés Intermedio course created');

  // ===========================================
  // ADDITIONAL COURSES
  // ===========================================
  console.log('\n🎓 Creating Additional Courses...');

  // Fundamentos de IA (ya existente)
  const aiCourse = await createCourse(
    'course-ai-fundamentals',
    'Fundamentos de Inteligencia Artificial',
    'Aprende los conceptos básicos de la IA, machine learning y redes neuronales. Ideal para principiantes curious about AI.',
    'IA & Tech',
    'beginner',
    8
  );

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

  console.log('✅ AI Fundamentals course created');

  // Finanzas Personales
  const finanzasCourse = await createCourse(
    'course-finanzas',
    'Finanzas Personales para Principiantes',
    'Aprende a gestionar tu dinero, crear presupuestos y hacer inversiones inteligentes desde cero.',
    'Finanzas',
    'beginner',
    6
  );

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

  console.log('✅ Finanzas Personales course created');

  // ===========================================
  // PRO COURSES (Premium Content)
  // ===========================================
  console.log('\n👑 Creating PRO Courses...');

  // JavaScript Avanzado PRO (Nivel 5+)
  const jsAdvancedCourse = await createCourse(
    'course-js-advanced',
    'JavaScript Avanzado: Mastery PRO',
    'Domina patrones de diseño, async/await, closures, proxies y más. Este curso te llevará de ser un programador básico a un developer avanzado con habilidades profesionales.',
    'Programación',
    'advanced',
    20,
    { isPro: true, price: 2999, requiredLevel: 5 } // $29.99, requires level 5
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
    { isPro: true, price: 4999, requiredLevel: 8 } // $49.99, requires level 8
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
    { isPro: true, price: 3999, requiredLevel: 3 } // $39.99, requires level 3
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

  // ===========================================
  // ADDITIONAL PRO COURSES
  // ===========================================

  // Python Mastery PRO (Nivel 6+)
  const pythonProCourse = await createCourse(
    'course-python-mastery',
    'Python Mastery: Expert PRO',
    'Domina Python como un experto. Decoradores, generators, metaclasses, async/await, testing profesional y patrones de diseño avanzados. Para programadores que quieren alcanzar el siguiente nivel.',
    'Programación',
    'advanced',
    25,
    { isPro: true, price: 3499, requiredLevel: 6 } // $34.99, requires level 6
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
    { isPro: true, price: 5999, requiredLevel: 7 } // $59.99, requires level 7
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
    { isPro: true, price: 4499, requiredLevel: 5 } // $44.99, requires level 5
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
    { isPro: true, price: 2999, requiredLevel: 4 } // $29.99, requires level 4
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

  console.log('\n👑 PRO Courses Summary:');
  console.log('   - JavaScript Avanzado: $29.99 (Nivel 5+) - 3 módulos, 5 lecciones');
  console.log('   - React Mastery: $49.99 (Nivel 8+) - 3 módulos, 5 lecciones');
  console.log('   - Trading e Inversiones: $39.99 (Nivel 3+) - 2 módulos, 4 lecciones');
  console.log('   - Python Mastery: $34.99 (Nivel 6+) - 2 módulos, 5 lecciones');
  console.log('   - DevOps Fundamentals: $59.99 (Nivel 7+) - 3 módulos, 5 lecciones');
  console.log('   - Data Science con Python: $44.99 (Nivel 5+) - 2 módulos, 4 lecciones');
  console.log('   - SQL Mastery: $29.99 (Nivel 4+) - 2 módulos, 4 lecciones');

  // ===========================================
  // DEMO DATA
  // ===========================================
  console.log('\n👤 Creating demo enrollments and progress...');

  // Get some lessons for demo progress
  const jsLesson1 = await prisma.lesson.findUnique({ where: { id: 'js-lesson-1-1' } });
  const jsLesson2 = await prisma.lesson.findUnique({ where: { id: 'js-lesson-1-2' } });
  const mathLesson1 = await prisma.lesson.findUnique({ where: { id: 'math-lesson-1-1' } });
  const engLesson1 = await prisma.lesson.findUnique({ where: { id: 'eng-lesson-1-1' } });

  // Demo user enrollments
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

  // Demo user progress
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
    // General settings
    { key: 'site_name', value: 'FreeBuffGame', type: 'string', category: 'general', label: 'Nombre del Sitio', description: 'Nombre público de la plataforma', isPublic: true },
    { key: 'site_description', value: 'Aprende jugando con cursos interactivos, juegos y recompensas', type: 'string', category: 'general', label: 'Descripción del Sitio', description: 'Descripción para SEO y páginas públicas', isPublic: true },
    { key: 'contact_email', value: 'soporte@freebuffgame.com', type: 'string', category: 'general', label: 'Email de Contacto', description: 'Email para contacto del admin', isPublic: true },
    { key: 'maintenance_mode', value: 'false', type: 'boolean', category: 'general', label: 'Modo Mantenimiento', description: 'Bloquea el acceso a usuarios no-admin', isPublic: false },

    // Feature flags
    { key: 'enable_google_auth', value: 'true', type: 'boolean', category: 'features', label: 'Autenticación Google', description: 'Permite login con Google OAuth', isPublic: true },
    { key: 'enable_stripe_payments', value: 'false', type: 'boolean', category: 'features', label: 'Pagos con Stripe', description: 'Habilita compras con Stripe', isPublic: true },
    { key: 'enable_achievements', value: 'true', type: 'boolean', category: 'features', label: 'Sistema de Logros', description: 'Habilita el sistema de logros y recompensas XP', isPublic: true },
    { key: 'enable_leaderboard', value: 'true', type: 'boolean', category: 'features', label: 'Tabla de Posiciones', description: 'Muestra ranking de usuarios por XP', isPublic: true },
    { key: 'enable_shop', value: 'true', type: 'boolean', category: 'features', label: 'Tienda Virtual', description: 'Habilita la tienda de avatares y temas', isPublic: true },
    { key: 'enable_friends', value: 'true', type: 'boolean', category: 'features', label: 'Sistema de Amigos', description: 'Permite agregar y gestionar amigos', isPublic: true },
    { key: 'enable_streaks', value: 'true', type: 'boolean', category: 'features', label: 'Sistema de Rachas', description: 'Tracking de racha diaria de estudio', isPublic: true },

    // Limits
    { key: 'max_upload_size_mb', value: '10', type: 'number', category: 'limits', label: 'Tamaño Máximo de Upload (MB)', description: 'Tamaño máximo de archivos subidos por usuario', isPublic: false },
    { key: 'daily_xp_cap', value: '500', type: 'number', category: 'limits', label: 'Límite Diario de XP', description: 'XP máximo que un usuario puede ganar por día (0 = sin límite)', isPublic: false },
    { key: 'max_friends', value: '100', type: 'number', category: 'limits', label: 'Máximo de Amigos', description: 'Límite de amigos que un usuario puede tener', isPublic: false },
    { key: 'cooldown_hours_shop', value: '24', type: 'number', category: 'limits', label: 'Cooldown de Compra (horas)', description: 'Horas entre compras en la tienda', isPublic: false },

    // Content moderation
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
    // System notifications
    { key: 'welcome_user', title: '¡Bienvenido a FreeBuffGame!', message: '¡Hola {name}! Bienvenido a la plataforma de aprendizaje gamificado. Empieza tu primera lección y ganar XP desde el primer momento.', type: 'system', variables: ['name'] },
    { key: 'account_locked', title: 'Tu cuenta ha sido bloqueada', message: 'Hola {name}, tu cuenta ha sido bloqueada temporalmente. Contacta a soporte si crees que es un error.', type: 'system', variables: ['name'] },
    { key: 'maintenance_scheduled', title: 'Mantenimiento Programado', message: 'Hola {name}, el sistema estará en mantenimiento el {date} de {time}. Gracias por tu paciencia.', type: 'system', variables: ['name', 'date', 'time'] },

    // Achievement notifications
    { key: 'achievement_unlocked', title: '🏆 ¡Nuevo Logro Desbloqueado!', message: '¡Felicidades {name}! Has desbloqueado "{achievement}" y ganas {xp} XP extra.', type: 'achievement', variables: ['name', 'achievement', 'xp'] },
    { key: 'level_up', title: '⬆️ ¡Subiste de Nivel!', message: '¡Increíble {name}! Has alcanzado el nivel {level}. Sigue así, champion!', type: 'achievement', variables: ['name', 'level'] },
    { key: 'streak_milestone', title: '🔥 ¡Racha de {streak} días!', message: '{name}, has mantenido una racha de {streak} días. Estás en racha, no pares!', type: 'streak', variables: ['name', 'streak'] },

    // Course notifications
    { key: 'course_completed', title: '🎓 ¡Curso Completado!', message: '¡Felicidades {name}! Has completado "{course}". Tu conocimiento sigue creciendo!', type: 'course', variables: ['name', 'course'] },
    { key: 'new_course_enrolled', title: '📚 Nuevo Curso Disponible', message: '{name}, te has inscrito en "{course}". Empieza ahora y gana XP!', type: 'course', variables: ['name', 'course'] },
    { key: 'course_unlock', title: '🔓 ¡Curso Desbloqueado!', message: '{name}, el curso "{course}" ya está disponible para ti. Empieza tu aventura de aprendizaje!', type: 'course', variables: ['name', 'course'] },
    { key: 'pro_course_unlock', title: '👑 ¡Acceso PRO Desbloqueado!', message: '{name}, has desbloqueado acceso al curso PRO "{course}". Prepárate para dominar habilidades avanzadas!', type: 'course', variables: ['name', 'course'] },

    // Broadcast notifications
    { key: 'system_announcement', title: '📢 Anuncio del Sistema', message: '{message}', type: 'broadcast', variables: ['message'] },
    { key: 'event_reminder', title: '🎯 Recordatorio de Evento', message: '{name}, no olvides tu evento: {event}. ¡Te esperamos!', type: 'broadcast', variables: ['name', 'event'] },
    { key: 'weekly_challenge', title: '⚡ Desafío Semanal', message: '{name}, un nuevo desafío semanal ha comenzado. Complétalo para ganar {xp} XP extra!', type: 'broadcast', variables: ['name', 'xp'] },

    // Shop notifications
    { key: 'purchase_complete', title: '🛒 Compra Completada', message: '{name}, has comprado "{item}" exitosamente. Disfruta tu nueva adquisición!', type: 'system', variables: ['name', 'item'] },
    { key: 'purchase_failed', title: '❌ Compra Fallida', message: '{name}, tu compra de "{item}" no pudo ser procesada. Intenta de nuevo más tarde.', type: 'system', variables: ['name', 'item'] },

    // Streak notifications
    { key: 'streak_lost', title: '💔 Racha Perdida', message: '{name}, tu racha de {streak} días se ha roto. ¡Pero no te preocupes, puedes empezar una nueva hoy!', type: 'streak', variables: ['name', 'streak'] },
    { key: 'streak_warning', title: '⚠️ ¡Tu racha está en peligro!', message: '{name}, recuerda hacer tu lección diaria. Tu racha de {streak} días está por cumplirse, no la pierdas!', type: 'streak', variables: ['name', 'streak'] },
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
  console.log('\n📚 Courses created:');
  console.log('   PROGRAMMING:');
  console.log('   - JavaScript Fundamentals (3 módulos, 8 lecciones)');
  console.log('   - Python para Principiantes (3 módulos, 6 lecciones)');
  console.log('   - HTML & CSS desde Cero (2 módulos, 6 lecciones)');
  console.log('   MATH:');
  console.log('   - Matemáticas Básicas (3 módulos, 7 lecciones)');
  console.log('   - Álgebra Elemental (3 módulos, 6 lecciones)');
  console.log('   LANGUAGES:');
  console.log('   - Inglés para Principiantes (3 módulos, 9 lecciones)');
  console.log('   - Inglés Intermedio (2 módulos, 4 lecciones)');
  console.log('   OTHER:');
  console.log('   - Fundamentos de IA (2 módulos, 5 lecciones)');
  console.log('   - Finanzas Personales (2 módulos, 4 lecciones)');
  
  console.log('\n📝 Test accounts:');
  console.log('   Admin: admin@duobijac.com / admin123');
  console.log('   Demo: demo@duobijac.com / demo123');
  
  console.log('\n👤 Demo user progress:');
  console.log('   - Enrolled in: JavaScript, Matemáticas, Inglés');
  console.log('   - Completed lessons: 4');
  console.log('   - Total XP earned: ~65');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });