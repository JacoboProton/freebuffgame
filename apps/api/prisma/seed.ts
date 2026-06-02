import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ===========================================
// HELPER FUNCTIONS
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
    update: { 
      title, 
      description, 
      category, 
      difficulty, 
      estimatedHours, 
      imageUrl, 
      isPublished: true, 
      ...options 
    },
    create: { 
      id, 
      title, 
      description, 
      category, 
      difficulty, 
      estimatedHours, 
      imageUrl, 
      isPublished: true, 
      ...options 
    },
  });
};

const createModule = async (id: string, courseId: string, title: string, order: number) => {
  return prisma.module.upsert({
    where: { id },
    update: { title, order },
    create: { id, courseId, title, order },
  });
};

const createLesson = async (
  id: string, 
  moduleId: string, 
  title: string, 
  type: string, 
  content: any, 
  xpReward: number, 
  order: number
) => {
  return prisma.lesson.upsert({
    where: { id },
    update: { title, type, content, xpReward, order },
    create: { id, moduleId, title, type, content, xpReward, order },
  });
};

// ===========================================
// MAIN SEED FUNCTION
// ===========================================

async function main() {
  console.log('🌱 Starting ENHANCED seed with practical coding exercises...\n');

  // ===========================================
  // USERS
  // ===========================================
  
  const adminPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@duobijac.com' },
    update: {},
    create: {
      email: 'admin@duobijac.com',
      passwordHash: adminPassword,
      name: 'Jac Admin',
      role: 'admin',
      xp: 8500,
      level: 15,
      coins: 1200,
      currentStreak: 28,
      longestStreak: 45,
    },
  });

  const demoPassword = await bcrypt.hash('demo123', 12);
  await prisma.user.upsert({
    where: { email: 'demo@duobijac.com' },
    update: {},
    create: {
      email: 'demo@duobijac.com',
      passwordHash: demoPassword,
      name: 'María García',
      role: 'user',
      xp: 1250,
      level: 4,
      coins: 280,
      currentStreak: 7,
      longestStreak: 12,
    },
  });

  console.log('✅ Users created (admin + demo)');

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
    { key: 'code_ninja', title: 'Código Ninja', description: 'Completa 10 ejercicios de código', icon: '🥷', xpReward: 100 },
    { key: 'project_builder', title: 'Constructor de Proyectos', description: 'Completa tu primer mini-proyecto', icon: '🔧', xpReward: 150 },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: achievement,
      create: achievement,
    });
  }
  console.log('✅ Achievements created (15 achievements)');

  // ===========================================
  // GAMES
  // ===========================================
  
  const games = [
    { key: 'speed_match', title: 'Speed Match', description: 'Combina conceptos antes de que se acabe el tiempo', icon: '🎮', xpReward: 30 },
    { key: 'word_puzzle', title: 'Word Puzzle', description: 'Ordena las letras para formar palabras', icon: '🧩', xpReward: 25 },
    { key: 'true_false_sprint', title: 'True/False Sprint', description: 'Responde verdadero o falso lo más rápido posible', icon: '⚡', xpReward: 20 },
    { key: 'quiz_duel', title: 'Quiz Duel', description: 'Compite contra otros en quizzes', icon: '🏆', xpReward: 50 },
    { key: 'memory_match', title: 'Memory Match', description: 'Encuentra pares de conceptos relacionados', icon: '🃏', xpReward: 25 },
    { key: 'code_runner', title: 'Code Runner', description: 'Ejecuta código y corre para resolver problemas', icon: '💻', xpReward: 40 },
  ];

  for (const game of games) {
    await prisma.game.upsert({
      where: { key: game.key },
      update: game,
      create: game,
    });
  }
  console.log('✅ Games created (6 games)');

  // ===========================================
  // SHOP ITEMS
  // ===========================================
  
  const shopItems = [
    { key: 'avatar_cool', name: 'Avatar Cool', description: 'Un avatar genial para tu perfil', type: 'avatar', price: 100, icon: '😎' },
    { key: 'avatar_ninja', name: 'Avatar Ninja', description: 'Un ninja misterioso', type: 'avatar', price: 150, icon: '🥷' },
    { key: 'avatar_astronaut', name: 'Avatar Astronauta', description: 'Un astronauta espacial', type: 'avatar', price: 200, icon: '🚀' },
    { key: 'avatar_wizard', name: 'Avatar Mago', description: 'Un mago poderoso', type: 'avatar', price: 180, icon: '🧙' },
    { key: 'avatar_robot', name: 'Avatar Robot', description: 'Un robot del futuro', type: 'avatar', price: 160, icon: '🤖' },
    { key: 'streak_freeze', name: 'Freeze de Racha', description: 'Protege tu racha por un día', type: 'streak_freeze', price: 50, icon: '🧊' },
    { key: 'xp_boost', name: 'Boost de XP', description: 'Duplica tus XP por 1 hora', type: 'boost', price: 75, icon: '⚡' },
    { key: 'badge_vip', name: 'Badge VIP', description: 'Un badge exclusivo para usuarios VIP', type: 'badge', price: 300, icon: '👑' },
    { key: 'badge_champion', name: 'Badge Campeón', description: 'Muestra tu estatus de campeón', type: 'badge', price: 250, icon: '🏅' },
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
  console.log('✅ Shop items created (11 items)');

  // ===========================================
  // JAVASCRIPT FUNDAMENTALS COURSE - ENHANCED
  // ===========================================
  console.log('\n📚 Creating ENHANCED JavaScript Fundamentals course...');

  const jsCourse = await createCourse(
    'course-js-fundamentals',
    'JavaScript Fundamentals',
    'Domina los fundamentos de JavaScript, el lenguaje que impulsa la web moderna. Aprende desde variables hasta funciones, de forma práctica con ejercicios interactivos.',
    'Programación',
    'beginner',
    25,
    'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&h=400&fit=crop'
  );

  // MODULE 1: Introducción a JavaScript
  const jsM1 = await createModule('js-m1', jsCourse.id, 'Introducción a JavaScript', 1);
  
  await createLesson('js-l1-1', jsM1.id, '¿Qué es JavaScript y para qué sirve?', 'reading', {
    introduction: 'JavaScript es un lenguaje de programación que permite crear contenido interactivo en páginas web. Es el tercer pilar de la web junto con HTML y CSS.',
    content: `JavaScript fue creado en 1995 por Brendan Eich mientras trabajaba en Netscape. Originalmente se llamaba "Mocha" y luego "LiveScript", pero finalmente se renombró a JavaScript como estrategia de marketing (aunque no tiene relación directa con Java).

Hoy en día, JavaScript es:
• El único lenguaje de programación que funciona nativamente en los navegadores
• Usado para desarrollo web (frontend y backend con Node.js)
• La tecnología más demandada en la industria de software
• Extensible a través de frameworks como React, Vue, Angular

Con JavaScript puedes:
- Crear páginas web interactivas
- Desarrollar aplicaciones móviles (React Native)
- Crear juegos para navegador
- Desarrollar servidores y APIs (Node.js)
- Controlar dispositivos IoT`,
    keyPoints: ['JavaScript se ejecuta en el navegador', 'Es interpretado, no compilado', 'Es flexible y dinámico', 'Tiene una comunidad enorme'],
    xpExplanation: 'Completando esta lección has aprendido qué es JavaScript y su importancia en el desarrollo web moderno.'
  }, 15, 1, 5);

  await createLesson('js-l1-2', jsM1.id, 'Tu primer programa en JavaScript', 'multiple_choice', {
    preamble: 'Vamos a practicar con tu primer código JavaScript. Responde las siguientes preguntas:',
    questions: [
      { question: '¿Cuál es la función correcta para mostrar "Hola Mundo" en la consola?', options: ['console.write("Hola Mundo")', 'console.log("Hola Mundo")', 'print("Hola Mundo")', 'echo "Hola Mundo"'], correctIndex: 1, explanation: 'console.log() es la función estándar para mostrar mensajes en la consola del navegador o terminal.' },
      { question: '¿Qué aparecería en consola al ejecutar: console.log("Hello" + " " + "World")?', options: ['Hello + World', 'HelloWorld', 'Hello World', 'Error de sintaxis'], correctIndex: 2, explanation: 'El operador + concatena strings en JavaScript, uniendo "Hello", el espacio, y "World".' },
      { question: '¿Dónde se puede ejecutar código JavaScript?', options: ['Solo en el navegador', 'Solo en el servidor', 'En el navegador, servidor y más', 'Solo en archivos .js'], correctIndex: 2, explanation: 'JavaScript puede ejecutarse en múltiples entornos: navegadores, servidores (Node.js), dispositivos móviles, y más.' }
    ],
    tips: ['Usa console.log() para debugging', 'Los strings pueden usar comillas simples o dobles', 'Punto y coma al final es opcional pero recomendado']
  }, 25, 2, 8);

  await createLesson('js-l1-3', jsM1.id, 'Variables: let, const y var', 'quiz', {
    questions: [
      { question: '¿Cuál es la diferencia principal entre const y let?', options: ['const es más rápido que let', 'const no puede ser reasignado, let sí', 'let no puede ser reasignado, const sí', 'No hay diferencia'], correctIndex: 1, explanation: 'const crea una constante que no puede ser reasignada. let crea una variable que sí puede cambiar.' },
      { question: '¿Cuál declaración es CORRECTA para una constante en JavaScript?', options: ['constant PI = 3.14', 'var PI = 3.14', 'const PI = 3.14', 'let PI = 3.14'], correctIndex: 2, explanation: 'La palabra clave "const" se usa para declarar constantes en JavaScript moderno.' },
      { question: '¿Qué sucede al ejecutar: const nombre = "Ana"; nombre = "María";?', options: ['Se muestra "María"', 'Error: Assignment to constant variable', 'Se muestra "Ana"', 'undefined'], correctIndex: 1, explanation: 'Una vez que una variable const es inicializada, no puede ser reasignada. Intentar hacerlo causa un error.' },
      { question: '¿Cuál es el mejor uso de "var" en JavaScript moderno?', options: ['Para variables que cambiarán', 'Para constantes', 'Evitar var, usar let y const', 'Para crear variables globales'], correctIndex: 2, explanation: 'var tiene un comportamiento de scope complejo (function scope vs block scope) que puede causar confusión. let y const son más predecibles.' }
    ]
  }, 30, 3, 12);

  // EJERCICIO DE CÓDIGO PRÁCTICO
  await createLesson('js-l1-4', jsM1.id, '🎮 Ejercicio Práctico: Variables y Constantes', 'coding', {
    instructions: 'Practica declarando variables y constantes. Completa los siguientes retos:',
    exercise: {
      task: 'Declara las variables correctas para los siguientes escenarios',
      challenges: [
        {
          id: 'js-code-1',
          description: 'Declara una constante PI con valor 3.14159',
          initialCode: '// Declara la constante PI\n',
          expectedOutput: 'PI debe ser 3.14159',
          hint: 'Usa const PI = ...',
          solution: 'const PI = 3.14159;'
        },
        {
          id: 'js-code-2', 
          description: 'Declara una variable nombre con tu nombre (puede cambiar)',
          initialCode: '// Declara la variable nombre\n',
          expectedOutput: 'nombre debe tener un string como valor',
          hint: 'Usa let o var para variables que pueden cambiar',
          solution: 'let nombre = "María";'
        },
        {
          id: 'js-code-3',
          description: 'Calcula el área de un círculo usando PI y radio=5',
          initialCode: 'const PI = 3.14159;\nlet radio = 5;\n// Calcula el área y almacénala en la variable area\n',
          expectedOutput: 'area debe ser aproximadamente 78.54',
          hint: 'Área = PI * radio * radio',
          solution: 'const area = PI * radio * radio;'
        }
      ]
    },
    tips: ['Usa console.log() para verificar tus resultados', 'const para valores que no cambiarán', 'let para valores que sí cambiarán']
  }, 50, 4, 15);

  // MODULE 2: Tipos de Datos
  const jsM2 = await createModule('js-m2', jsCourse.id, 'Tipos de Datos', 2);

  await createLesson('js-l2-1', jsM2.id, 'Strings, Numbers y Booleans', 'reading', {
    introduction: 'JavaScript tiene varios tipos de datos fundamentales que debes conocer. Cada tipo tiene sus propias características y usos.',
    content: `TIPOS DE DATOS PRIMITIVOS:

1. STRING (Texto)
   - Secuencia de caracteres entre comillas
   - Ejemplos: "Hola", 'Mundo', \u0060Plantilla\u0060
   - Operaciones: concatenación, búsqueda, manipulación

2. NUMBER (Números)
   - Enteros: 42, -17, 0
   - Decimales: 3.14, -0.5
   - Especiales: Infinity, -Infinity, NaN

3. BOOLEAN (Lógico)
   - Solo dos valores: true y false
   - Usado en condicionales y operaciones lógicas`,
    examples: [
      { code: 'let nombre = "María";', explanation: 'String con comillas dobles' },
      { code: 'let edad = 25;', explanation: 'Number entero' },
      { code: 'let esMayor = true;', explanation: 'Boolean true' },
      { code: 'typeof "hola" // "string"', explanation: 'Verificar tipo con typeof' }
    ],
    keyPoints: ['JavaScript tiene 6 tipos primitivos', 'typeof permite verificar el tipo de una variable', 'null es intencional, undefined es por omisión']
  }, 20, 1, 8);

  await createLesson('js-l2-2', jsM2.id, 'Operadores de Comparación', 'quiz', {
    questions: [
      { question: '¿Cuál es el resultado de 5 === "5"?', options: ['true', 'false', 'undefined', 'Error'], correctIndex: 1, explanation: '=== compara tanto valor como tipo. 5 (number) !== "5" (string), por lo tanto es false.' },
      { question: '¿Cuál es el resultado de 5 == "5"?', options: ['true', 'false', 'undefined', 'Error'], correctIndex: 0, explanation: '== hace coerción de tipos antes de comparar. Convierte "5" a 5 y luego compara, dando true.' },
      { question: '¿Qué operador significa "mayor o igual"?', options: ['>', '>>', '>=', '=>'], correctIndex: 2, explanation: '>= significa "mayor o igual". No uses => que es para arrow functions.' },
      { question: '¿Cuál es el resultado de null == undefined?', options: ['true', 'false', 'Error', 'undefined'], correctIndex: 0, explanation: 'Por diseño del lenguaje, null y undefined son considerados iguales con == (pero no con ===).' }
    ],
    tips: ['Siempre usa === en lugar de ==', 'Compara strings con localeCompare para orden natural', 'NaN no es igual a nada, ni a sí mismo']
  }, 25, 2, 10);

  await createLesson('js-l2-3', jsM2.id, '🎮 Ejercicio: Tipos y Conversión', 'coding', {
    instructions: 'Practica trabajando con tipos de datos y conversiones:',
    exercise: {
      task: 'Manipula tipos de datos y verifica conversiones',
      challenges: [
        {
          id: 'js-type-1',
          description: 'Convierte el string "42" a número y almacénalo en la variable numero',
          initialCode: 'let texto = "42";\n// Convierte texto a número\n',
          hint: 'Usa Number() o parseInt()',
          solution: 'let numero = Number("42");'
        },
        {
          id: 'js-type-2',
          description: 'Concatena "Hola" y "Mundo" con un espacio en medio',
          initialCode: 'let palabra1 = "Hola";\nlet palabra2 = "Mundo";\n// Crea la frase usando concatenación\n',
          expectedOutput: 'frase debe ser "Hola Mundo"',
          hint: 'Usa el operador + o template literals',
          solution: 'let frase = palabra1 + " " + palabra2;'
        },
        {
          id: 'js-type-3',
          description: 'Verifica si el tipo de 3.14 es "number"',
          initialCode: 'let decimal = 3.14;\n// Almacena el resultado de typeof en tipo\n',
          expectedOutput: 'tipo debe ser "number"',
          hint: 'Usa el operador typeof',
          solution: 'let tipo = typeof decimal;'
        }
      ]
    }
  }, 50, 3, 15);

  // MODULE 3: Control de Flujo
  const jsM3 = await createModule('js-m3', jsCourse.id, 'Control de Flujo', 3);

  await createLesson('js-l3-1', jsM3.id, 'Condicionales if/else', 'quiz', {
    questions: [
      { question: '¿Cuál es la salida de: if(5 > 3) { console.log("A"); } else { console.log("B"); }?', options: ['A', 'B', 'AB', 'Error'], correctIndex: 0, explanation: '5 > 3 es true, por lo tanto se ejecuta el bloque del if y se imprime "A".' },
      { question: '¿Qué palabra clave se usa para agregar una condición alternativa?', options: ['elsif', 'elif', 'else if', 'otherwise'], correctIndex: 2, explanation: 'JavaScript usa "else if" (dos palabras separadas) para condiciones adicionales.' },
      { question: '¿Qué retorna: 5 > 3 ? "sí" : "no"?', options: ['"sí"', '"no"', 'true', 'Error'], correctIndex: 0, explanation: 'El operador ternario (?:) evalúa la condición y retorna el primer valor si es true, el segundo si es false.' }
    ],
    tips: ['Usa else if, no elif ni elsif', 'El operador ternario es útil para asignaciones simples', 'Evita anidar muchos if/else']
  }, 30, 1, 12);

  await createLesson('js-l3-2', jsM3.id, 'Bucles for y while', 'quiz', {
    questions: [
      { question: '¿Cuántas veces se ejecuta: for(let i = 0; i < 5; i++) { console.log(i); }?', options: ['4', '5', '6', 'Infinito'], correctIndex: 1, explanation: 'El bucle va de i=0 a i=4 (i<5), ejecutándose 5 veces: 0, 1, 2, 3, 4.' },
      { question: '¿Qué hace break dentro de un bucle?', options: ['Salta a la siguiente iteración', 'Termina el bucle completamente', 'Reinicia el bucle', 'No hace nada'], correctIndex: 1, explanation: 'break termina inmediatamente el bucle y continúa con el código después del bucle.' },
      { question: '¿Qué hace continue dentro de un bucle?', options: ['Salta a la siguiente iteración', 'Termina el bucle', 'Reinicia el bucle', 'Sale de la función'], correctIndex: 0, explanation: 'continue salta el resto del código de la iteración actual y pasa a la siguiente iteración.' }
    ],
    examples: [
      { code: 'for(let i = 0; i < 3; i++) { console.log(i); } // 0, 1, 2', explanation: 'Bucle for estándar' },
      { code: 'let i = 0; while(i < 3) { console.log(i); i++; }', explanation: 'Bucle while' },
      { code: 'for(let item of array) { console.log(item); }', explanation: 'for...of para iterar arrays' }
    ]
  }, 35, 2, 15);

  await createLesson('js-l3-3', jsM3.id, '🎮 Ejercicio: Condicionales y Bucles', 'coding', {
    instructions: 'Practica condicionales y bucles resolviendo estos problemas:',
    exercise: {
      task: 'Implementa lógica de control de flujo',
      challenges: [
        {
          id: 'js-loop-1',
          description: 'Crea una función esPar(numero) que retorne true si el número es par',
          initialCode: 'function esPar(numero) {\n  // Retorna true si es par, false si es impar\n}\n',
          expectedOutput: 'esPar(4) → true, esPar(7) → false',
          hint: 'Usa el operador módulo (%) para verificar si es divisible por 2',
          solution: 'function esPar(numero) {\n  return numero % 2 === 0;\n}'
        },
        {
          id: 'js-loop-2',
          description: 'Suma todos los números del 1 al 10 usando un bucle for',
          initialCode: '// Usa un bucle for para sumar 1+2+3+...+10\nlet suma = 0;\n',
          expectedOutput: 'suma debe ser 55',
          hint: 'Itera de 1 a 10 y acumula en suma',
          solution: 'let suma = 0;\nfor(let i = 1; i <= 10; i++) {\n  suma += i;\n}'
        },
        {
          id: 'js-loop-3',
          description: 'Encuentra el número mayor en el array [3, 7, 2, 9, 5]',
          initialCode: 'let numeros = [3, 7, 2, 9, 5];\nlet mayor = numeros[0];\n// Encuentra el mayor\n',
          expectedOutput: 'mayor debe ser 9',
          hint: 'Itera por el array y compara cada elemento',
          solution: 'let numeros = [3, 7, 2, 9, 5];\nlet mayor = numeros[0];\nfor(let num of numeros) {\n  if(num > mayor) mayor = num;\n}'
        }
      ]
    }
  }, 60, 3, 20);

  // MINI PROYECTO: Calculadora Simple
  await createLesson('js-l3-4', jsM3.id, '🚀 Mini-Proyecto: Calculadora Simple', 'project', {
    title: 'Calculadora de Propinas',
    description: 'Crea una calculadora que determine la propia apropiada basada en el total de la cuenta y el porcentaje deseado.',
    objectives: [
      'Practicar el uso de variables y operadores',
      'Implementar condicionales para manejar casos especiales',
      'Usar funciones para organizar el código'
    ],
    requirements: [
      'Función que calcule la propina (cuenta × porcentaje)',
      'Función que calcule el total (cuenta + propina)',
      'Maneje casos: cuenta negativa, porcentaje inválido',
      'Muestre un desglose completo'
    ],
    exampleCode: `function calcularPropina(cuenta, porcentaje) {
  if (cuenta < 0) return "La cuenta no puede ser negativa";
  if (porcentaje < 0 || porcentaje > 100) return "Porcentaje inválido";
  return (cuenta * porcentaje / 100).toFixed(2);
}`,
    tips: ['Usa toFixed(2) para mostrar solo 2 decimales', 'Considera usar condicionales para validar entradas'],
    xpReward: 100
  }, 80, 4, 25);

  // MODULE 4: Arrays
  const jsM4 = await createModule('js-m4', jsCourse.id, 'Arrays (Arreglos)', 4);

  await createLesson('js-l4-1', jsM4.id, 'Crear y acceder a arrays', 'reading', {
    introduction: 'Los arrays son estructuras de datos fundamentales que permiten almacenar múltiples valores en una sola variable.',
    content: `CREAR ARRAYS:

const frutas = ["manzana", "pera", "uva"];
const numeros = [1, 2, 3, 4, 5];

ACCEDER ELEMENTOS:
- Los índices empiezan en 0
- frutas[0] → "manzana"
- frutas[2] → "uva"

MODIFICAR ARRAYS:
- push(elemento) → añade al final
- pop() → elimina del final
- unshift(elemento) → añade al inicio
- shift() → elimina del inicio`,
    examples: [
      { code: 'let arr = [1, 2, 3]; arr.push(4); // [1, 2, 3, 4]', explanation: 'Añadir al final' },
      { code: 'let arr = [1, 2, 3]; arr.pop(); // [1, 2]', explanation: 'Eliminar del final' },
      { code: 'arr.length // número de elementos', explanation: 'Obtener longitud' }
    ]
  }, 25, 1, 10);

  await createLesson('js-l4-2', jsM4.id, 'Métodos map, filter y reduce', 'quiz', {
    questions: [
      { question: '¿Qué retorna: [1, 2, 3].map(x => x * 2)?', options: ['[2, 4, 6]', '[1, 2, 3]', 'undefined', 'Error'], correctIndex: 0, explanation: 'map() transforma cada elemento. Multiplica cada uno por 2: [1*2, 2*2, 3*2] = [2, 4, 6].' },
      { question: '¿Qué retorna: [1, 2, 3, 4].filter(x => x > 2)?', options: ['[1, 2]', '[3, 4]', '[2, 3, 4]', 'Error'], correctIndex: 1, explanation: 'filter() mantiene solo los elementos que cumplen la condición.' },
      { question: '¿Qué retorna: [1, 2, 3].reduce((acc, x) => acc + x, 0)?', options: ['6', '[1, 2, 3]', 'undefined', 'Error'], correctIndex: 0, explanation: 'reduce() acumula valores. Suma todos: 0+1+2+3 = 6.' }
    ],
    tips: ['Encadena métodos: arr.filter().map()', 'reduce puede hacer lo que map, filter y otros hacen']
  }, 35, 2, 15);

  await createLesson('js-l4-3', jsM4.id, '🎮 Ejercicio: Manipulación de Arrays', 'coding', {
    instructions: 'Practica manipulando arrays con estos desafíos:',
    exercise: {
      task: 'Manipula arrays usando métodos funcionales',
      challenges: [
        {
          id: 'js-arr-1',
          description: 'Duplica cada número del array [1, 2, 3, 4, 5]',
          initialCode: 'let numeros = [1, 2, 3, 4, 5];\n// Crea un nuevo array con cada número duplicado\n',
          expectedOutput: 'resultado debe ser [2, 4, 6, 8, 10]',
          hint: 'Usa el método map()',
          solution: 'let resultado = numeros.map(x => x * 2);'
        },
        {
          id: 'js-arr-2',
          description: 'Filtra solo los números mayores a 10 del array [5, 12, 8, 20, 3]',
          initialCode: 'let numeros = [5, 12, 8, 20, 3];\n// Crea un array solo con números > 10\n',
          expectedOutput: 'filtrados debe ser [12, 20]',
          hint: 'Usa el método filter()',
          solution: 'let filtrados = numeros.filter(x => x > 10);'
        },
        {
          id: 'js-arr-3',
          description: 'Suma todos los elementos del array [10, 20, 30, 40]',
          initialCode: 'let numeros = [10, 20, 30, 40];\n// Calcula la suma total\n',
          expectedOutput: 'suma debe ser 100',
          hint: 'Usa el método reduce()',
          solution: 'let suma = numeros.reduce((acc, x) => acc + x, 0);'
        }
      ]
    }
  }, 60, 3, 20);

  // MODULE 5: Objetos
  const jsM5 = await createModule('js-m5', jsCourse.id, 'Objetos', 5);

  await createLesson('js-l5-1', jsM5.id, 'Crear y usar objetos', 'reading', {
    introduction: 'Los objetos son colecciones de pares clave-valor que permiten representar entidades complejas.',
    content: `CREAR OBJETOS:

const usuario = {
  nombre: "María",
  edad: 28,
  email: "maria@ejemplo.com"
};

ACCEDER PROPIEDADES:
- Notación punto: usuario.nombre → "María"
- Notación corchetes: usuario["nombre"] → "María"

MÉTODOS:
const persona = {
  nombre: "Juan",
  saludar: function() {
    return "Hola, soy " + this.nombre;
  }
};`,
    examples: [
      { code: 'const user = { name: "Ana", age: 25 };', explanation: 'Objeto simple' },
      { code: 'user.name // "Ana" - notación punto', explanation: 'Acceder con punto' },
      { code: '"name" in user // true', explanation: 'Verificar si existe propiedad' }
    ]
  }, 25, 1, 10);

  await createLesson('js-l5-2', jsM5.id, 'Destructuring y spread operator', 'quiz', {
    questions: [
      { question: '¿Qué es destructuring en JavaScript?', options: ['Destruir objetos', 'Extraer valores de arrays/objetos en variables', 'Copiar objetos', 'Eliminar propiedades'], correctIndex: 1, explanation: 'Destructuring permite extraer múltiples propiedades de un objeto/array en variables individuales.' },
      { question: '¿Qué valor tiene "nombre" después de: const { nombre, edad } = { nombre: "Ana", edad: 30 };?', options: ['undefined', '"Ana"', '30', 'Error'], correctIndex: 1, explanation: 'Destructuring extrae "nombre" y le asigna el valor "Ana".' },
      { question: '¿Cuál es el resultado de: [...[1,2], ...[3,4]]?', options: ['[[1,2],[3,4]]', '[1,2,3,4]', '[1,2,[3,4]]', 'Error'], correctIndex: 1, explanation: 'El spread operator expande ambos arrays y los combina en uno nuevo: [1, 2, 3, 4].' }
    ],
    examples: [
      { code: 'const { name, age } = person; // destructuring', explanation: 'Destructuring de objeto' },
      { code: 'const [first, ...rest] = [1, 2, 3]; // first=1, rest=[2,3]', explanation: 'Rest en arrays' }
    ]
  }, 30, 2, 12);

  await createLesson('js-l5-3', jsM5.id, '🎮 Ejercicio: Objetos y Destructuring', 'coding', {
    instructions: 'Practica trabajando con objetos:',
    exercise: {
      task: 'Manipula objetos usando destructuring y spread',
      challenges: [
        {
          id: 'js-obj-1',
          description: 'Usa destructuring para extraer nombre y edad del objeto persona',
          initialCode: 'const persona = { nombre: "Carlos", edad: 28, ciudad: "Madrid" };\n// Extrae solo nombre y edad\n',
          expectedOutput: 'nombre debe ser "Carlos", edad debe ser 28',
          hint: 'Usa const { nombre, edad } = persona',
          solution: 'const { nombre, edad } = persona;'
        },
        {
          id: 'js-obj-2',
          description: 'Crea una copia del objeto usuario usando spread',
          initialCode: 'const usuario = { nombre: "Ana", nivel: 5 };\n// Crea una copia llamada usuarioCopia\n',
          hint: 'Usa el operador spread {...objeto}',
          solution: 'const usuarioCopia = { ...usuario };'
        },
        {
          id: 'js-obj-3',
          description: 'Actualiza el nivel del objeto a 10 sin modificar el original',
          initialCode: 'const stats = { nombre: "Heroe", nivel: 1, xp: 0 };\n// Crea un nuevo objeto con nivel actualizado a 10\n',
          expectedOutput: 'nuevoStats.nivel debe ser 10, stats.nivel debe ser 1',
          hint: 'Usa spread y sobrescribe el valor',
          solution: 'const nuevoStats = { ...stats, nivel: 10 };'
        }
      ]
    }
  }, 60, 3, 20);

  // MINI PROYECTO: Gestor de Tareas
  await createLesson('js-l5-4', jsM5.id, '🚀 Mini-Proyecto: Gestor de Tareas', 'project', {
    title: 'Gestor de Tareas Simple',
    description: 'Crea un sistema básico para administrar tareas con objetos y arrays.',
    objectives: [
      'Practicar el uso de objetos para representar datos',
      'Manipular arrays de objetos',
      'Implementar operaciones CRUD básicas'
    ],
    requirements: [
      'Objeto tarea con propiedades: id, titulo, completada, prioridad',
      'Array de tareas con al menos 3 tareas iniciales',
      'Función para agregar tarea',
      'Función para marcar tarea como completada',
      'Función para filtrar tareas completadas/no completadas'
    ],
    exampleCode: `const tareas = [
  { id: 1, titulo: "Aprender JavaScript", completada: false, prioridad: "alta" },
  { id: 2, titulo: "Hacer ejercicio", completada: true, prioridad: "media" }
];

function agregarTarea(titulo, prioridad) {
  const nuevaTarea = {
    id: tareas.length + 1,
    titulo,
    completada: false,
    prioridad
  };
  tareas.push(nuevaTarea);
  return nuevaTarea;
}`,
    tips: ['Usa Date.now() para generar IDs únicos', 'Filtra con filter() para mostrar tareas activas'],
    xpReward: 150
  }, 100, 4, 30);

  // MODULE 6: Funciones
  const jsM6 = await createModule('js-m6', jsCourse.id, 'Funciones Avanzadas', 6);

  await createLesson('js-l6-1', jsM6.id, 'Funciones: Declaration, Expression y Arrow', 'reading', {
    introduction: 'Las funciones son bloques de código reutilizables que realizan una tarea específica.',
    content: `TIPOS DE FUNCIONES:

1. Function Declaration:
function sumar(a, b) {
  return a + b;
}

2. Function Expression:
const sumar = function(a, b) {
  return a + b;
};

3. Arrow Function:
const sumar = (a, b) => a + b;

PARÁMETROS:
- Default parameters:
  function saludar(nombre = "mundo") { }
- Rest parameters:
  function sumar(...numeros) { }`,
    examples: [
      { code: 'function greet(name) { return "Hola, " + name; }', explanation: 'Función tradicional' },
      { code: 'const greet = (name) => "Hola, " + name;', explanation: 'Arrow function' },
      { code: 'const add = (a, b = 0) => a + b; add(5); // 5', explanation: 'Parámetro default' }
    ]
  }, 25, 1, 10);

  await createLesson('js-l6-2', jsM6.id, 'Closures y Scope', 'quiz', {
    questions: [
      { question: '¿Qué es un closure en JavaScript?', options: ['Cerrar el navegador', 'Una función que recuerda su scope externo', 'Terminar una variable', 'Importar módulos'], correctIndex: 1, explanation: 'Un closure es una función que tiene acceso a variables de su scope externo incluso después de que la función externa haya terminado.' },
      { question: '¿Qué imprimirá: function counter() { let count = 0; return () => ++count; } const c = counter(); c(); c(); console.log(c());?', options: ['1', '2', '3', '0'], correctIndex: 2, explanation: 'counter() retorna una función que usa count. Cada llamada incrementa count: 1, 2, 3.' }
    ],
    tips: ['Las closures son útiles para crear funciones factory', 'Evita variables globales excesivas']
  }, 30, 2, 12);

  await createLesson('js-l6-3', jsM6.id, '🎮 Ejercicio: Funciones y Closures', 'coding', {
    instructions: 'Practica creando funciones y closures:',
    exercise: {
      task: 'Implementa funciones avanzadas',
      challenges: [
        {
          id: 'js-func-1',
          description: 'Crea una función flecha llamada duplicar que tome un número y lo multiplique por 2',
          initialCode: '// Crea la función flecha duplicar\n',
          expectedOutput: 'duplicar(5) → 10',
          hint: 'Usa la sintaxis: const nombre = (parametros) => expresión',
          solution: 'const duplicar = (num) => num * 2;'
        },
        {
          id: 'js-func-2',
          description: 'Crea una función crearContador que retorne una función que incremente un contador interno',
          initialCode: 'function crearContador() {\n  // Debe retornar una función que incremente y retorne el contador\n}\n',
          expectedOutput: 'crearContador()() → 1, crearContador()() → 1 (cada contador es independiente)',
          hint: 'Usa closure: declara una variable dentro de crearContador y retorne una función que la use',
          solution: 'function crearContador() {\n  let count = 0;\n  return () => ++count;\n}'
        },
        {
          id: 'js-func-3',
          description: 'Crea una función saludarFormal(nombre) que use un parámetro default para el saludo',
          initialCode: '// Crea la función con saludo por defecto "Buenos días"\n',
          expectedOutput: 'saludarFormal("Ana") → "Buenos días, Ana"',
          hint: 'Usa parametro = valorDefault en la definición',
          solution: 'const saludarFormal = (nombre, saludo = "Buenos días") => `${saludo}, ${nombre}`;'
        }
      ]
    }
  }, 60, 3, 20);

  // PROYECTO FINAL: Generador de Estadísticas
  await createLesson('js-l6-4', jsM6.id, '🚀 Proyecto Final: Generador de Estadísticas', 'project', {
    title: 'Generador de Estadísticas de Clase',
    description: 'Crea un sistema que procese un array de estudiantes y genere estadísticas.',
    objectives: [
      'Combinar todos los conceptos aprendidos',
      'Trabajar con arrays de objetos',
      'Implementar lógica de negocio compleja'
    ],
    requirements: [
      'Array de estudiantes con: nombre, edad, calificaciones (array de números)',
      'Función para calcular promedio de un estudiante',
      'Función para encontrar el estudiante con mejor promedio',
      'Función para filtrar estudiantes aprovados (promedio >= 7)',
      'Función para obtener la calificación más alta de todos los estudiantes',
      'Bonus: ordenar estudiantes por promedio'
    ],
    exampleCode: `const estudiantes = [
  { nombre: "Ana", calificaciones: [8, 9, 7] },
  { nombre: "Carlos", calificaciones: [6, 7, 8] },
  { nombre: "María", calificaciones: [9, 10, 9] }
];

function calcularPromedio(estudiante) {
  const sum = estudiante.calificaciones.reduce((a, b) => a + b, 0);
  return sum / estudiante.calificaciones.length;
}`,
    tips: ['Usa map() para transformar el array', 'Usa sort() con una función comparadora para ordenar'],
    xpReward: 200
  }, 120, 4, 40);

  console.log('✅ JavaScript Fundamentals completed (6 modules, 18 lessons, 4 coding exercises, 2 mini-projects)');

  // ===========================================
  // PYTHON COURSE - ENHANCED
  // ===========================================
  console.log('\n🐍 Creating ENHANCED Python para Principiantes course...');

  const pyCourse = await createCourse(
    'course-python-beginner',
    'Python para Principiantes',
    'Aprende Python, el lenguaje más versátil y fácil de leer. Ideal para automatización, análisis de datos, inteligencia artificial y desarrollo web.',
    'Programación',
    'beginner',
    30,
    'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&h=400&fit=crop'
  );

  // MODULE 1: Primeros Pasos
  const pyM1 = await createModule('py-m1', pyCourse.id, 'Introducción a Python', 1);

  await createLesson('py-l1-1', pyM1.id, '¿Qué es Python y por qué aprenderlo?', 'reading', {
    introduction: 'Python es un lenguaje de programación creado por Guido van Rossum en 1991. Se ha convertido en uno de los lenguajes más populares del mundo.',
    content: `¿POR QUÉ PYTHON?

1. Fácil de aprender y leer
   - Sintaxis clara y simple
   - Usa indentación en lugar de llaves
   - Código que parece pseudocódigo

2. Versátil
   - Desarrollo web (Django, Flask)
   - Análisis de datos (Pandas, NumPy)
   - Inteligencia artificial (TensorFlow, PyTorch)
   - Automatización (scripts, bots)

3. Gran comunidad
   - Miles de librerías disponibles
   - Documentación extensiva

PHILOSOPHY (The Zen of Python):
- Simple es mejor que complejo
- Legible es mejor que escribible
- Explícito es mejor que implícito`,
    keyPoints: ['Python fue creado por Guido van Rossum', 'Su filosofía es simplicidad y legibilidad', 'Tiene miles de librerías']
  }, 20, 1, 8);

  await createLesson('py-l1-2', pyM1.id, 'Tu primer programa en Python', 'quiz', {
    questions: [
      { question: '¿Cuál es la salida de: print("Hola" + " " + "Mundo")?', options: ['HolaMundo', 'Hola Mundo', 'Error', '"Hola Mundo"'], correctIndex: 1, explanation: 'El operador + concatena strings.' },
      { question: '¿Cómo se escribe un comentario de una línea en Python?', options: ['// esto es un comentario', '# esto es un comentario', '/* comentario */', '-- comentario'], correctIndex: 1, explanation: 'En Python, el símbolo # indica el inicio de un comentario.' },
      { question: '¿Python necesita punto y coma al final de las líneas?', options: ['Sí, siempre', 'No, es opcional', 'Depende del IDE', 'Solo en funciones'], correctIndex: 1, explanation: 'Python no requiere punto y coma. La indentación define los bloques.' }
    ],
    examples: [
      { code: 'print("Hola Mundo")', explanation: 'Primer programa' },
      { code: '# Esto es un comentario', explanation: 'Comentario' },
      { code: 'nombre = input("¿Cómo te llamas? ")', explanation: 'input() para recibir datos' }
    ]
  }, 25, 2, 10);

  await createLesson('py-l1-3', pyM1.id, 'Variables y tipos de datos', 'quiz', {
    questions: [
      { question: '¿Cómo se declara una variable en Python?', options: ['int x = 5', 'var x = 5', 'x = 5', 'let x = 5'], correctIndex: 2, explanation: 'Python infiere el tipo automáticamente.' },
      { question: '¿Qué tipo de dato es: x = "Hola"?', options: ['int', 'float', 'str', 'char'], correctIndex: 2, explanation: 'En Python, las cadenas de texto son de tipo str.' },
      { question: '¿Cómo se llama la función para saber el tipo de una variable?', options: ['typeof()', 'getType()', 'type()', 'whatType()'], correctIndex: 2, explanation: 'type() retorna el tipo de una variable.' }
    ],
    examples: [
      { code: 'edad = 25  # int', explanation: 'Entero' },
      { code: 'precio = 19.99  # float', explanation: 'Decimal' },
      { code: 'es_estudiante = True  # bool', explanation: 'Booleano' }
    ]
  }, 30, 3, 12);

  await createLesson('py-l1-4', pyM1.id, '🎮 Ejercicio: Variables y Tipos en Python', 'coding', {
    instructions: 'Practica declarando variables y trabajando con tipos en Python:',
    exercise: {
      task: 'Manipula variables y verifica tipos en Python',
      challenges: [
        {
          id: 'py-var-1',
          description: 'Crea una variable llamada nombre con tu nombre',
          initialCode: '# Crea la variable nombre\n',
          hint: 'Simplemente usa nombre = "tu_nombre"',
          solution: 'nombre = "María"'
        },
        {
          id: 'py-var-2',
          description: 'Crea una variable edad de tipo entero con valor 25',
          initialCode: '# Crea la variable edad\n',
          hint: 'En Python no necesitas declarar el tipo',
          solution: 'edad = 25'
        },
        {
          id: 'py-var-3',
          description: 'Usa f-string para crear: "Hola, {nombre}! Tienes {edad} años."',
          initialCode: 'nombre = "Carlos"\nedad = 28\n# Crea la variable mensaje usando f-string\n',
          expectedOutput: 'mensaje debe ser "Hola, Carlos! Tienes 28 años."',
          hint: 'Usa f"Hola, {nombre}..."',
          solution: 'mensaje = f"Hola, {nombre}! Tienes {edad} años."'
        }
      ]
    }
  }, 50, 4, 15);

  // MODULE 2: Estructuras de Datos
  const pyM2 = await createModule('py-m2', pyCourse.id, 'Estructuras de Datos', 2);

  await createLesson('py-l2-1', pyM2.id, 'Listas y operaciones básicas', 'reading', {
    introduction: 'Las listas son colecciones ordenadas y mutables de elementos en Python.',
    content: `CREAR LISTAS:

frutas = ["manzana", "pera", "uva"]
numeros = [1, 2, 3, 4, 5]

ACCEDER POR ÍNDICE:
- Primera posición: frutas[0] → "manzana"
- Última posición: frutas[-1] → "uva"
- Rango: frutas[0:2] → ["manzana", "pera"]

MÉTODOS PRINCIPALES:
- append(item) → añade al final
- insert(pos, item) → inserta en posición
- remove(item) → elimina primera ocurrencia
- pop() → elimina y retorna el último`,
    examples: [
      { code: 'frutas = ["manzana", "pera"]; frutas.append("uva")', explanation: 'Añadir elemento' },
      { code: 'frutas[0]  # "manzana"', explanation: 'Acceder por índice' },
      { code: 'frutas[-1]  # "uva" (último)', explanation: 'Índice negativo' }
    ]
  }, 25, 1, 10);

  await createLesson('py-l2-2', pyM2.id, 'Diccionarios', 'quiz', {
    questions: [
      { question: '¿Cómo se crea un diccionario en Python?', options: ['dict = (1, 2, 3)', 'dict = [1, 2, 3]', 'dict = {"clave": "valor"}', 'dict = <1, 2, 3>'], correctIndex: 2, explanation: 'Los diccionarios usan llaves con pares clave:valor.' },
      { question: '¿Cómo se accede al valor de "nombre" en: persona = {"nombre": "Ana", "edad": 30}?', options: ['persona[0]', 'persona["nombre"]', 'persona.nombre', 'persona.get(0)'], correctIndex: 1, explanation: 'Se accede con corchetes y la clave como string.' },
      { question: '¿Qué hace dict.get("clave", "default")?', options: ['Elimina la clave', 'Retorna el valor o default si no existe', 'Actualiza el valor', 'Crea la clave'], correctIndex: 1, explanation: 'get() retorna el valor de la clave si existe, o el valor default.' }
    ],
    examples: [
      { code: 'usuario = {"nombre": "Juan", "edad": 28}', explanation: 'Diccionario simple' },
      { code: 'for clave, valor in usuario.items(): print(clave, valor)', explanation: 'Iterar diccionario' }
    ]
  }, 30, 2, 12);

  await createLesson('py-l2-3', pyM2.id, '🎮 Ejercicio: Listas y Diccionarios', 'coding', {
    instructions: 'Practica manipulando listas y diccionarios:',
    exercise: {
      task: 'Trabaja con estructuras de datos en Python',
      challenges: [
        {
          id: 'py-list-1',
          description: 'Crea una lista llamada colores con ["rojo", "verde", "azul"]',
          initialCode: '# Crea la lista colores\n',
          expectedOutput: 'colores debe ser ["rojo", "verde", "azul"]',
          hint: 'Usa corchetes y comas',
          solution: 'colores = ["rojo", "verde", "azul"]'
        },
        {
          id: 'py-list-2',
          description: 'Agrega "amarillo" a la lista colores',
          initialCode: 'colores = ["rojo", "verde", "azul"]\n# Agrega "amarillo"\n',
          expectedOutput: 'colores debe incluir "amarillo"',
          hint: 'Usa el método append()',
          solution: 'colores.append("amarillo")'
        },
        {
          id: 'py-list-3',
          description: 'Crea un diccionario estudiante con claves "nombre" y "edad"',
          initialCode: '# Crea el diccionario estudiante\n',
          expectedOutput: 'estudiante["nombre"] debe existir',
          hint: 'Usa llaves con clave:valor',
          solution: 'estudiante = {"nombre": "Ana", "edad": 22}'
        }
      ]
    }
  }, 50, 3, 15);

  await createLesson('py-l2-4', pyM2.id, '🚀 Mini-Proyecto: Lista de Tareas', 'project', {
    title: 'Gestor de Tareas en Python',
    description: 'Crea un sistema de gestión de tareas usando listas y diccionarios.',
    objectives: [
      'Practicar estructuras de datos complejas',
      'Implementar operaciones CRUD',
      'Usar loops y condicionales'
    ],
    requirements: [
      'Lista de diccionarios representando tareas',
      'Cada tarea tiene: id, titulo, completada (bool)',
      'Función para agregar tarea',
      'Función para marcar como completada',
      'Función para mostrar tareas pendientes'
    ],
    exampleCode: `tareas = [
    {"id": 1, "titulo": "Comprar comida", "completada": False},
    {"id": 2, "titulo": "Estudiar Python", "completada": True}
]

def agregar_tarea(titulo):
    nuevo_id = len(tareas) + 1
    tareas.append({"id": nuevo_id, "titulo": titulo, "completada": False})`,
    tips: ['Usa append() para agregar elementos', 'Filtra con una list comprehension'],
    xpReward: 120
  }, 90, 4, 25);

  // MODULE 3: Control de Flujo
  const pyM3 = await createModule('py-m3', pyCourse.id, 'Control de Flujo', 3);

  await createLesson('py-l3-1', pyM3.id, 'Condicionales if/elif/else', 'quiz', {
    questions: [
      { question: '¿Cuál es la salida: if 5 > 3: print("A") else: print("B")?', options: ['A', 'B', 'AB', 'Error'], correctIndex: 0, explanation: '5 > 3 es True, por lo tanto se ejecuta el bloque del if.' },
      { question: '¿Qué palabra clave se usa para múltiples condiciones en Python?', options: ['else if', 'elif', 'elsif', 'when'], correctIndex: 1, explanation: 'Python usa "elif" para múltiples condiciones.' },
      { question: '¿Python usa llaves {} para definir bloques?', options: ['Sí', 'No, usa indentación', 'Depende del IDE', 'Para funciones sí'], correctIndex: 1, explanation: 'Python usa indentación, no llaves.' }
    ]
  }, 25, 1, 10);

  await createLesson('py-l3-2', pyM3.id, 'Bucles for y while', 'quiz', {
    questions: [
      { question: '¿Cuántas veces se ejecuta: for i in range(5): print(i)?', options: ['4', '5', '6', 'Infinito'], correctIndex: 1, explanation: 'range(5) genera 0, 1, 2, 3, 4. El bucle se ejecuta 5 veces.' },
      { question: '¿Qué hace: for char in "python": print(char)?', options: ['Imprime "python" 5 veces', 'Imprime cada letra en una línea', 'Error', 'Solo imprime "p"'], correctIndex: 1, explanation: 'Iterar sobre un string recorre cada carácter.' },
      { question: '¿Cómo se sale de un bucle prematuramente en Python?', options: ['break', 'exit', 'stop', 'return'], correctIndex: 0, explanation: 'break termina el bucle inmediatamente.' }
    ],
    examples: [
      { code: 'for i in range(5): print(i)  # 0, 1, 2, 3, 4', explanation: 'Bucle for con range' },
      { code: 'for item in lista: print(item)', explanation: 'Iterar lista' }
    ]
  }, 30, 2, 12);

  await createLesson('py-l3-3', pyM3.id, 'List Comprehensions', 'quiz', {
    questions: [
      { question: '¿Qué es una list comprehension?', options: ['Un tipo de función', 'Una forma concisa de crear listas', 'Un método de ordenamiento', 'Un error de sintaxis'], correctIndex: 1, explanation: 'List comprehension es una sintaxis compacta para generar listas.' },
      { question: '¿Qué resulta de: [x**2 for x in range(5)]?', options: ['[0, 1, 2, 3, 4]', '[0, 1, 4, 9, 16]', '[1, 4, 9, 16, 25]', 'Error'], correctIndex: 1, explanation: 'x**2 para cada x en range(5): 0², 1², 2², 3², 4².' }
    ],
    examples: [
      { code: '[x**2 for x in range(5)]  # [0, 1, 4, 9, 16]', explanation: 'Cuadrados de 0-4' },
      { code: '[x for x in range(10) if x % 2 == 0]  # [0, 2, 4, 6, 8]', explanation: 'Solo pares' }
    ]
  }, 25, 3, 10);

  await createLesson('py-l3-4', pyM3.id, '🎮 Ejercicio: Control de Flujo', 'coding', {
    instructions: 'Practica condicionales y bucles:',
    exercise: {
      task: 'Implementa lógica de control en Python',
      challenges: [
        {
          id: 'py-flow-1',
          description: 'Crea una función es_par(numero) que retorne True si es par',
          initialCode: 'def es_par(numero):\n    # Retorna True si es par, False si es impar\n',
          expectedOutput: 'es_par(4) → True, es_par(7) → False',
          hint: 'Usa el operador % (módulo)',
          solution: 'def es_par(numero):\n    return numero % 2 == 0'
        },
        {
          id: 'py-flow-2',
          description: 'Usa list comprehension para obtener los cuadrados de los números 1-5',
          initialCode: '# Crea una lista con los cuadrados de 1 a 5\n',
          expectedOutput: 'cuadrados debe ser [1, 4, 9, 16, 25]',
          hint: 'Usa [x**2 for x in range(1, 6)]',
          solution: 'cuadrados = [x**2 for x in range(1, 6)]'
        },
        {
          id: 'py-flow-3',
          description: 'Filtra los números negativos de la lista [-1, 2, -3, 4, -5]',
          initialCode: 'numeros = [-1, 2, -3, 4, -5]\n# Crea positivos solo con números > 0\n',
          expectedOutput: 'positivos debe ser [2, 4]',
          hint: 'Usa list comprehension con condición if',
          solution: 'positivos = [x for x in numeros if x > 0]'
        }
      ]
    }
  }, 50, 4, 15);

  // MODULE 4: Funciones
  const pyM4 = await createModule('py-m4', pyCourse.id, 'Funciones', 4);

  await createLesson('py-l4-1', pyM4.id, 'Definir y llamar funciones', 'reading', {
    introduction: 'Las funciones son bloques de código reutilizables que realizan una tarea específica.',
    content: `SINTÁXIS BÁSICA:

def nombre_funcion(parametros):
    """Docstring - descripción de la función"""
    # código
    return resultado

PARAMETROS DEFAULT:
def greet(nombre, saludo="Hola"):
    return f"{saludo}, {nombre}!"

RETURN:
- return termina la función
- Sin return, retorna None
- Puede retornar múltiples valores como tupla`,
    examples: [
      { code: 'def sumar(a, b): return a + b', explanation: 'Función simple' },
      { code: 'def saludar(nombre="Mundo"): return f"Hola {nombre}"', explanation: 'Con valor default' }
    ]
  }, 25, 1, 10);

  await createLesson('py-l4-2', pyM4.id, 'Args, kwargs y funciones lambda', 'quiz', {
    questions: [
      { question: '¿Qué hace *args en una función?', options: ['Multiplica argumentos', 'Captura argumentos variables en una tupla', 'Convierte a enteros', 'Elimina argumentos'], correctIndex: 1, explanation: '*args permite pasar un número variable de argumentos.' },
      { question: '¿Qué es una función lambda?', options: ['Una función muy grande', 'Una función anónima de una línea', 'Un tipo de error', 'Una función matemática'], correctIndex: 1, explanation: 'Lambda crea funciones anónimas de una línea.' },
      { question: '¿Cuál es el resultado de: (lambda x, y: x + y)(2, 3)?', options: ['5', '23', '6', 'Error'], correctIndex: 0, explanation: 'La lambda recibe 2 y 3 y retorna 2 + 3 = 5.' }
    ],
    examples: [
      { code: 'def suma(*args): return sum(args)', explanation: '*args variable arguments' },
      { code: 'doble = lambda x: x * 2; doble(5)  # 10', explanation: 'Función lambda' }
    ]
  }, 30, 2, 12);

  await createLesson('py-l4-3', pyM4.id, '🎮 Ejercicio: Funciones', 'coding', {
    instructions: 'Practica creando funciones:',
    exercise: {
      task: 'Implementa funciones en Python',
      challenges: [
        {
          id: 'py-func-1',
          description: 'Crea una función saludar(nombre) que retorne "Hola, {nombre}!"',
          initialCode: '# Define la función saludar\n',
          expectedOutput: 'saludar("Ana") → "Hola, Ana!"',
          hint: 'Usa def y return',
          solution: 'def saludar(nombre):\n    return f"Hola, {nombre}!"'
        },
        {
          id: 'py-func-2',
          description: 'Crea una función lambda llamada cuadrado que elevé al cuadrado',
          initialCode: '# Crea la función lambda cuadrado\n',
          expectedOutput: 'cuadrado(4) → 16',
          hint: 'Usa lambda x: expresion',
          solution: 'cuadrado = lambda x: x ** 2'
        },
        {
          id: 'py-func-3',
          description: 'Crea una función promedio(*numeros) que calcule el promedio',
          initialCode: '# Define la función promedio\n',
          expectedOutput: 'promedio(10, 20, 30) → 20.0',
          hint: 'Usa *args y sum()/len()',
          solution: 'def promedio(*numeros):\n    return sum(numeros) / len(numeros)'
        }
      ]
    }
  }, 50, 3, 15);

  // PROYECTO FINAL PYTHON
  await createLesson('py-l4-4', pyM4.id, '🚀 Proyecto Final: Analizador de Calificaciones', 'project', {
    title: 'Analizador de Calificaciones',
    description: 'Crea un sistema para analizar calificaciones de estudiantes.',
    objectives: [
      'Combinar funciones y estructuras de datos',
      'Implementar lógica de análisis estadístico',
      'Usar funciones lambda y comprehensions'
    ],
    requirements: [
      'Diccionario con estudiantes y sus calificaciones (lista de números)',
      'Función para calcular promedio de un estudiante',
      'Función para encontrar el mejor promedio',
      'Función para obtener todos los estudiantes aprobados (promedio >= 7)',
      'Función para calcular el promedio general de la clase'
    ],
    exampleCode: `calificaciones = {
    "Ana": [8, 9, 7, 10],
    "Carlos": [6, 7, 8, 7],
    "María": [9, 10, 9, 10]
}

def promedio_estudiante(califs):
    return sum(califs) / len(califs)

def mejor_promedio():
    promedios = {nombre: promedio_estudiante(califs) for nombre, califs in calificaciones.items()}
    return max(promedios, key=promedios.get)`,
    tips: ['Usa comprehensions para crear diccionarios de promedios', 'max() con key parameter para encontrar el mejor'],
    xpReward: 200
  }, 120, 4, 40);

  console.log('✅ Python para Principiantes completed (4 modules, 14 lessons, 3 coding exercises, 2 mini-projects)');

  // ===========================================
  // MATH COURSE - ENHANCED WITH REAL PROBLEMS
  // ===========================================
  console.log('\n📐 Creating ENHANCED Mathematics Applied course...');

  const mathCourse = await createCourse(
    'course-math-basics',
    'Matemáticas Aplicadas',
    'Refresca y profundiza tus habilidades matemáticas con problemas del mundo real. Desde aritmética básica hasta álgebra y estadística.',
    'Matemáticas',
    'beginner',
    20,
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop'
  );

  const mathM1 = await createModule('math-m1', mathCourse.id, 'Aritmética y Porcentajes', 1);

  await createLesson('math-l1-1', mathM1.id, 'Orden de operaciones (PEMDAS)', 'quiz', {
    questions: [
      { question: '¿Cuál es el resultado de 2 + 3 × 4?', options: ['20', '14', '24', '11'], correctIndex: 1, explanation: 'PEMDAS: Multiplicación antes que suma. 3×4=12, luego 2+12=14.' },
      { question: '¿Qué significa PEMDAS?', options: ['Parentheses, Exponents, Multiplication, Division, Addition, Subtraction', 'Prime Numbers, Exponents, Math, Division, Addition, Subtraction', 'Parenthesis, Equations, Multiplication, Division, Addition, Subtraction', 'Problems, Examples, Math, Division, Addition, Subtraction'], correctIndex: 0, explanation: 'PEMDAS indica el orden: Paréntesis → Exponentes → Multiplicación/División → Suma/Resta.' },
      { question: '¿Cuál es el resultado de (2 + 3) × 4?', options: ['14', '20', '24', '11'], correctIndex: 1, explanation: 'Los paréntesis se evalúan primero. (2+3)=5, luego 5×4=20.' }
    ]
  }, 25, 1, 10);

  await createLesson('math-l1-2', mathM1.id, 'Porcentajes en la vida real', 'quiz', {
    questions: [
      { question: '¿Cuánto es el 25% de 80?', options: ['20', '25', '200', '8'], correctIndex: 0, explanation: '25% = 0.25. 80 × 0.25 = 20.' },
      { question: 'Si un producto cuesta $150 y tiene 20% de descuento, ¿cuánto pagas?', options: ['$130', '$120', '$135', '$145'], correctIndex: 1, explanation: 'Descuento = 150 × 0.20 = $30. Precio final = 150 - 30 = $120.' },
      { question: '¿De qué número es 45 el 15%?', options: ['300', '450', '200', '600'], correctIndex: 0, explanation: 'Si 45 = 15% × X, entonces X = 45 / 0.15 = 300.' },
      { question: '¿Qué significa "aumentar un valor en 30%"?', options: ['Multiplicar por 0.30', 'Multiplicar por 1.30', 'Sumar 30', 'Dividir entre 1.30'], correctIndex: 1, explanation: 'Aumentar 30% significa tener el 100% + 30% = 130%, multiplicar por 1.30.' }
    ],
    realWorldExample: 'En una tienda, ves un jacket de $80 con 25% de descuento. ¿Cuánto pagas? El descuento es $20, entonces pagas $60.'
  }, 30, 2, 12);

  await createLesson('math-l1-3', mathM1.id, '🎮 Ejercicio: Calcula tu Ahorro', 'coding', {
    instructions: 'Resuelve problemas matemáticos prácticos:',
    exercise: {
      task: 'Calcula porcentajes y descuentos',
      challenges: [
        {
          id: 'math-1',
          description: 'Calcula el 15% de 200',
          initialCode: '# Calcula el 15% de 200\n',
          expectedOutput: 'resultado debe ser 30',
          hint: 'Multiplica por 0.15 o divide por 100 y multiplica por 15',
          solution: 'resultado = 200 * 0.15'
        },
        {
          id: 'math-2',
          description: 'Un producto de $90 tiene 30% de descuento. ¿Cuánto es el descuento?',
          initialCode: 'precio_original = 90\ndescuento_porcentaje = 30\n# Calcula el monto del descuento\n',
          expectedOutput: 'descuento debe ser 27',
          hint: 'precio_original × (descuento_porcentaje / 100)',
          solution: 'descuento = precio_original * (descuento_porcentaje / 100)'
        },
        {
          id: 'math-3',
          description: '¿Qué porcentaje es 45 de 180? (Respuesta en número, no %)',
          initialCode: 'parte = 45\ntodo = 180\n# Calcula qué porcentaje es la parte del todo\n',
          expectedOutput: 'porcentaje debe ser 25 (porque 45 es el 25% de 180)',
          hint: '(parte / todo) × 100',
          solution: 'porcentaje = (parte / todo) * 100'
        }
      ]
    }
  }, 40, 3, 12);

  // MODULE 2: Álgebra Básica
  const mathM2 = await createModule('math-m2', mathCourse.id, 'Álgebra Básica', 2);

  await createLesson('math-l2-1', mathM2.id, 'Ecuaciones de primer grado', 'quiz', {
    questions: [
      { question: 'Si 2x + 5 = 15, ¿cuánto vale x?', options: ['5', '10', '7.5', '4'], correctIndex: 0, explanation: '2x + 5 = 15 → 2x = 15 - 5 → 2x = 10 → x = 10/2 = 5.' },
      { question: '¿Cuál es el primer paso para resolver 3(x - 2) = 12?', options: ['Dividir entre 3', 'Restar 2', 'Aplicar propiedad distributiva: 3x - 6 = 12', 'Sumar 2'], correctIndex: 2, explanation: 'Primero aplica distributiva: 3×x - 3×2 = 3x - 6 = 12.' },
      { question: '¿Qué significa "despejar x"?', options: ['Eliminar x', 'Aislar x en un lado de la ecuación', 'Multiplicar x', 'Dividir entre x'], correctIndex: 1, explanation: 'Despejar significa dejar la variable sola en un lado.' }
    ],
    tips: ['Lo que hagas a un lado, hazlo al otro', 'Mantén la ecuación balanceada']
  }, 30, 1, 12);

  await createLesson('math-l2-2', mathM2.id, '🎮 Ejercicio: Resuelve Ecuaciones', 'coding', {
    instructions: 'Practica resolviendo ecuaciones algebraicas:',
    exercise: {
      task: 'Implementa la resolución de ecuaciones simples',
      challenges: [
        {
          id: 'math-eq-1',
          description: 'Si 3x = 27, ¿cuánto vale x?',
          initialCode: '# Calcula el valor de x\n',
          expectedOutput: 'x debe ser 9',
          hint: 'x = 27 / 3',
          solution: 'x = 27 / 3'
        },
        {
          id: 'math-eq-2',
          description: 'Resuelve: 2x + 4 = 14. ¿Cuánto vale x?',
          initialCode: '# Calcula x: 2x + 4 = 14\n',
          expectedOutput: 'x debe ser 5 (porque 2*5 + 4 = 14)',
          hint: '2x = 14 - 4, luego x = 10/2',
          solution: 'x = (14 - 4) / 2'
        },
        {
          id: 'math-eq-3',
          description: 'Si y/4 = 7, ¿cuánto vale y?',
          initialCode: '# Calcula y: y/4 = 7\n',
          expectedOutput: 'y debe ser 28',
          hint: 'Multiplica ambos lados por 4',
          solution: 'y = 7 * 4'
        }
      ]
    }
  }, 40, 2, 12);

  // ===========================================
  // ENGLISH COURSE - ENHANCED
  // ===========================================
  console.log('\n🌍 Creating ENHANCED English course...');

  const engCourse = await createCourse(
    'course-english-beginner',
    'Inglés para Principiantes',
    'Tu guía completa para aprender inglés desde cero. Vocabulario esencial, gramática básica y frases prácticas para comunicarte desde el primer día.',
    'Idiomas',
    'beginner',
    25,
    'https://images.unsplash.com/photo-1551179613-3ada17f87b8b?w=600&h=400&fit=crop'
  );

  const engM1 = await createModule('eng-m1', engCourse.id, 'Saludos y Conversaciones', 1);

  await createLesson('eng-l1-1', engM1.id, 'Saludos formales e informales', 'quiz', {
    questions: [
      { question: '¿Cómo saludas a un amigo en inglés informalmente?', options: ['Good morning', 'Hey, what up?', 'How do you do?', 'Good evening'], correctIndex: 1, explanation: '"Hey, what up?" es un saludo muy informal entre amigos.' },
      { question: '¿Qué respondes a "How are you?"?', options: ['I am fine, thank you', 'Yes, I am', 'I am 25 years old', 'Good morning'], correctIndex: 0, explanation: 'La respuesta estándar a "How are you?" es "I am fine, thank you".' },
      { question: '¿Cuál es la traducción correcta de "Mucho gusto"?', options: ['Good morning', 'Nice to meet you', 'How are you', 'See you later'], correctIndex: 1, explanation: '"Nice to meet you" se usa cuando conoces a alguien por primera vez.' }
    ],
    phrases: [
      { english: 'Hello!', spanish: '¡Hola!' },
      { english: 'How are you?', spanish: '¿Cómo estás?' },
      { english: 'Nice to meet you', spanish: 'Mucho gusto' },
      { english: 'See you later!', spanish: '¡Hasta luego!' }
    ]
  }, 25, 1, 10);

  await createLesson('eng-l1-2', engM1.id, 'Presentarte formalmente', 'multiple_choice', {
    preamble: 'En contextos profesionales o formales, hay formas específicas de presentarse:',
    questions: [
      { question: '¿Cuál es la forma correcta de darte a conocer?', options: ['My name is John', 'I am John', 'Both are correct', 'My is John'], correctIndex: 2, explanation: 'Both "My name is John" y "I am John" son correctos.' },
      { question: '¿Cómo preguntarías el nombre de alguien formalmente?', options: ['What is your name?', 'Who are you?', 'Your name is what?', 'Tell me your name'], correctIndex: 0, explanation: '"What is your name?" es la forma estándar.' },
      { question: '¿Qué significa "I am from..."?', options: ['Vivo en...', 'Soy de... (país/ciudad)', 'Trabajo en...', 'Voy a...'], correctIndex: 1, explanation: '"I am from Mexico" significa "Soy de México".' }
    ],
    examples: [
      { code: '"Nice to meet you. My name is Sarah."', explanation: 'Presentación formal' },
      { code: '"I am from Spain. Where are you from?"', explanation: 'Decir de dónde eres' }
    ]
  }, 20, 2, 8);

  await createLesson('eng-l1-3', engM1.id, '🎮 Speaking Practice: Tu Primera Conversación', 'speaking', {
    instructions: 'Practica las frases más comunes para presentarte:',
    exercise: {
      scenario: 'Estás en una fiesta y conoces a alguien nuevo. Practica la conversación:',
      dialogue: [
        { speaker: 'You', prompt: 'Saluda a la persona de manera informal', expectedPhrase: 'Hi! How are you?' },
        { speaker: 'Them', response: 'I am good, thanks! And you?' },
        { speaker: 'You', prompt: 'Preséntate diciendo tu nombre', expectedPhrase: 'I am [tu nombre]. Nice to meet you!' },
        { speaker: 'Them', response: 'Nice to meet you too! Where are you from?' },
        { speaker: 'You', prompt: 'Dide dónde eres', expectedPhrase: 'I am from [tu país/ciudad]' }
      ],
      tips: ['La práctica de conversación es clave para aprender un idioma', 'No tengas miedo de cometer errores', 'Escuchar es tan importante como hablar']
    }
  }, 40, 3, 12);

  const engM2 = await createModule('eng-m2', engCourse.id, 'Vocabulario Cotidiano', 2);

  await createLesson('eng-l2-1', engM2.id, 'Números, días y meses', 'quiz', {
    questions: [
      { question: '¿Cómo se dice "once" (11) en inglés?', options: ['Ten', 'Eleven', 'One', 'Twelve'], correctIndex: 1, explanation: 'Eleven = 11.' },
      { question: '¿Cuál es el día que viene después del Thursday?', options: ['Wednesday', 'Friday', 'Saturday', 'Tuesday'], correctIndex: 1, explanation: 'Los días: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.' },
      { question: '¿Cómo dices "el año que viene" en inglés?', options: ['Last year', 'This year', 'Next year', 'Every year'], correctIndex: 2, explanation: '"Next year" = año que viene.' }
    ],
    vocabulary: [
      { category: 'Days', words: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      { category: 'Months', words: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] },
      { category: 'Numbers 1-12', words: ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'] }
    ]
  }, 25, 1, 10);

  await createLesson('eng-l2-2', engM2.id, 'Colores y adjetivos básicos', 'multiple_choice', {
    preamble: 'El vocabulario de colores y adjetivos básicos es fundamental:',
    questions: [
      { question: '¿Qué color es "purple"?', options: ['Azul', 'Verde', 'Morado/Púrpura', 'Rojo'], correctIndex: 2, explanation: 'Purple = morado.' },
      { question: '¿Cómo describes algo que es muy grande?', options: ['Tiny', 'Huge', 'Small', 'Short'], correctIndex: 1, explanation: '"Huge" = muy grande.' },
      { question: '¿Qué significa "a little"?', options: ['Mucho', 'Poco', 'Nada', 'Todo'], correctIndex: 1, explanation: '"A little" = un poco.' }
    ],
    examples: [
      { code: 'The sky is blue. / The grass is green.', explanation: 'Colores básicos' },
      { code: 'That house is huge! / This is a tiny insect.', explanation: 'Tamaño' },
      { code: 'I am a little tired. / I have a few friends.', explanation: 'A little vs A few' }
    ]
  }, 20, 2, 8);

  await createLesson('eng-l2-3', engM2.id, 'Verbos comunes y presente simple', 'quiz', {
    questions: [
      { question: '¿Cuál es la tercera persona singular de "to work"?', options: ['Work', 'Works', 'Working', 'Worked'], correctIndex: 1, explanation: 'She works, He works, It works (se añade -s o -es).' },
      { question: '¿Cómo se dice "Yo como manzanas" en presente simple?', options: ['I eats apples', 'I eat apples', 'I am eating apples', 'I eat apple'], correctIndex: 1, explanation: 'Primera persona sin -s: I eat, you eat, we eat, they eat.' },
      { question: '¿Qué verbo completa: "She ___ to school every day" (ir)?', options: ['go', 'goes', 'going', 'goed'], correctIndex: 1, explanation: 'She goes (tercera persona singular necesita -s).' }
    ],
    commonVerbs: [
      { base: 'to be', past: 'was/were', meaning: 'ser/estar' },
      { base: 'to have', past: 'had', meaning: 'tener' },
      { base: 'to do', past: 'did', meaning: 'hacer' },
      { base: 'to go', past: 'went', meaning: 'ir' },
      { base: 'to eat', past: 'ate', meaning: 'comer' },
      { base: 'to drink', past: 'drank', meaning: 'beber' }
    ]
  }, 25, 3, 10);

  await createLesson('eng-l2-4', engM2.id, '🎮 Ejercicio: Construye Oraciones', 'coding', {
    instructions: 'Practica formando oraciones correctas en presente simple:',
    exercise: {
      task: 'Completa las oraciones con la forma correcta del verbo',
      challenges: [
        {
          id: 'eng-1',
          description: 'Completa: She ___ (to work) at a hospital.',
          initialCode: '# Escribe el verbo en la forma correcta\noracion = "She ___ at a hospital."\n',
          expectedOutput: 'La oración completa debe ser "She works at a hospital."',
          hint: 'Usa "works" para tercera persona singular',
          solution: 'oracion = "She works at a hospital."'
        },
        {
          id: 'eng-2',
          description: 'Haz negativa: They ___ (to like) pizza.',
          initialCode: "# Completa con forma negativa: They don't like pizza.\n",
          expectedOutput: "They don't like pizza.",
          hint: "Usa doesn't para tercera persona singular",
          solution: 'oracion = "They don\'t like pizza."'
        },
        {
          id: 'eng-3',
          description: 'Haz pregunta: ___ you ___ (to want) coffee? (yes/no)',
          initialCode: '# Completa la pregunta en presente simple\n',
          expectedOutput: 'Do you want coffee?',
          hint: 'Usa Do al inicio para preguntas',
          solution: 'pregunta = "Do you want coffee?"'
        }
      ]
    }
  }, 40, 4, 12);

  // ===========================================
  // PRO COURSES
  // ===========================================
  console.log('\n👑 Creating PRO courses...');

  // JavaScript Avanzado PRO
  const jsProCourse = await createCourse(
    'course-js-advanced',
    'JavaScript Avanzado PRO',
    'Domina los aspectos más avanzados de JavaScript: async/await, promises, closures, patrones de diseño y más.',
    'Programación',
    'intermediate',
    35,
    'https://images.unsplash.com/photo-1581089778245-3ce67677f718?w=600&h=400&fit=crop',
    { isPro: true, price: 29.99, requiredLevel: 5 }
  );

  const jsProM1 = await createModule('js-pro-m1', jsProCourse.id, 'JavaScript Asíncrono', 1);
  
  await createLesson('js-pro-l1-1', jsProM1.id, 'Callbacks y Promises', 'reading', {
    introduction: 'La programación asíncrona es fundamental en JavaScript para manejar operaciones que toman tiempo.',
    content: `CALLBACKS:
Un callback es una función que se pasa como argumento a otra función para ejecutarse cuando algo sucede.

PROMISES:
Un Promise representa un valor que puede estar disponible ahora, en el futuro, o nunca.

Estados de un Promise:
- Pending (pendiente): estado inicial
- Fulfilled (cumplido): operación exitosa
- Rejected (rechazado): operación fallida

CREAR UN PROMISE:
const miPromesa = new Promise((resolve, reject) => {
  // operación asíncrona
  if (exitoso) resolve(resultado);
  else reject(error);
});`,
    examples: [
      { code: 'fetch(url).then(res => res.json()).then(data => console.log(data))', explanation: 'Encadenar promises' },
      { code: 'async function getData() { const data = await fetch(url); return data; }', explanation: 'Async/await' }
    ]
  }, 30, 1, 12);

  await createLesson('js-pro-l1-2', jsProM1.id, 'Async/Await', 'quiz', {
    questions: [
      { question: '¿Qué es async/await?', options: ['Una forma de definir variables', 'Una forma de escribir código asíncrono que parece síncrono', 'Un tipo de función', 'Un operador lógico'], correctIndex: 1, explanation: 'async/await permite escribir código asíncrono de manera secuencial y más legible.' },
      { question: '¿Qué retorna una función async?', options: ['undefined', 'Un valor normal', 'Un Promise', 'Una función', 'Error'], correctIndex: 2, explanation: 'Una función async siempre retorna un Promise, incluso si retornas un valor simple.' },
      { question: '¿Qué hace await?', options: ['Declara una variable', 'Pausa la ejecución hasta que el Promise se resuelva', 'Crea un Promise', 'Maneja errores'], correctIndex: 1, explanation: 'await pausa la ejecución hasta que el Promise se resuelva y retorna su valor.' }
    ],
    examples: [
      { code: 'async function fetchData() { const res = await fetch(url); return res.json(); }', explanation: 'Función async completa' },
      { code: 'try { const data = await promise; } catch(e) { console.error(e); }', explanation: 'Manejo de errores con async/await' }
    ]
  }, 35, 2, 15);

  await createLesson('js-pro-l1-3', jsProM1.id, '🎮 Ejercicio: Promesas y Async/Await', 'coding', {
    instructions: 'Practica con promesas y async/await:',
    exercise: {
      task: 'Implementa funciones asíncronas',
      challenges: [
        {
          id: 'js-async-1',
          description: 'Crea una función async llamada esperar que retorne el número 42 después de 1 segundo',
          initialCode: '// Crea la función async esperar\n',
          expectedOutput: 'Debería retornar un Promise que resuelve a 42',
          hint: 'Usa async function y await new Promise(resolve => setTimeout(...))',
          solution: 'const esperar = async () => {\n  await new Promise(resolve => setTimeout(resolve, 1000));\n  return 42;\n};'
        },
        {
          id: 'js-async-2',
          description: 'Crea una función fetchUser(id) que simule obtener un usuario con Promise',
          initialCode: '// Simula una API que retorna usuario después de 500ms\n',
          expectedOutput: 'Debe retornar un Promise que resuelve a {id, name}',
          hint: 'Usa new Promise con setTimeout',
          solution: 'const fetchUser = (id) => new Promise(resolve => {\n  setTimeout(() => resolve({ id, name: "Usuario " + id }), 500);\n});'
        },
        {
          id: 'js-async-3',
          description: 'Usa async/await para obtener 2 usuarios secuencialmente',
          initialCode: 'const fetchUser = (id) => new Promise(resolve => {\n  setTimeout(() => resolve({ id, name: "Usuario " + id }), 500);\n});\n// Crea getTwoUsers() que obtenga user1 e user2\n',
          expectedOutput: 'getTwoUsers() debe retornar [{id:1, name:"Usuario 1"}, {id:2, name:"Usuario 2"}]',
          hint: 'Usa await dos veces secuencialmente',
          solution: 'const getTwoUsers = async () => {\n  const user1 = await fetchUser(1);\n  const user2 = await fetchUser(2);\n  return [user1, user2];\n};'
        }
      ]
    }
  }, 60, 3, 20);

  console.log('✅ JavaScript Avanzado PRO completed');

  // React Mastery PRO
  const reactProCourse = await createCourse(
    'course-react-mastery',
    'React Mastery PRO',
    'Domina React desde fundamentos hasta patrones avanzados, hooks personalizados, context API, y desarrollo de aplicaciones escalables.',
    'Programación',
    'intermediate',
    40,
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop',
    { isPro: true, price: 49.99, requiredLevel: 8 }
  );

  const reactProM1 = await createModule('react-pro-m1', reactProCourse.id, 'React hooks avanzados', 1);

  await createLesson('react-pro-l1-1', reactProM1.id, 'useState y useEffect', 'reading', {
    introduction: 'Los hooks son funciones que permiten usar estado y otras características de React en componentes funcionales.',
    content: `useState:
Permite agregar estado a componentes funcionales.

const [count, setCount] = useState(0);

useEffect:
Ejecuta efectos secundarios después del renderizado.

useEffect(() => {
  // código
  return () => { /* cleanup */ };
}, [dependencias]);

PATRONES COMUNES:
- Inicialización lazy: useState(() => expensiveComputation())
- Estado derivado: const [items, setItems] = useState([])
- Efectos de limpieza: retornar función en useEffect`,
    examples: [
      { code: 'const [count, setCount] = useState(0);', explanation: 'useState básico' },
      { code: 'useEffect(() => { document.title = count; }, [count]);', explanation: 'useEffect con dependencias' },
      { code: 'useEffect(() => { const id = setInterval(...); return () => clearInterval(id); }, []);', explanation: 'Cleanup en useEffect' }
    ]
  }, 30, 1, 12);

  await createLesson('react-pro-l1-2', reactProM1.id, 'useCallback y useMemo', 'quiz', {
    questions: [
      { question: '¿Qué hace useCallback?', options: ['Memoiza un valor', 'Memoiza una función', 'Memoiza un componente', 'Nada'], correctIndex: 1, explanation: 'useCallback memoiza una función para evitar recrearla en cada render.' },
      { question: '¿Qué hace useMemo?', options: ['Memoiza una función', 'Memoiza un valor calculado', 'Memoiza un componente', 'Memoiza un estado'], correctIndex: 1, explanation: 'useMemo memoiza el resultado de una computación costosa.' },
      { question: '¿Cuándo usar useMemo?', options: ['Siempre', 'Cuando la computación es costosa y las dependencias cambian poco', 'Nunca', 'Solo en componentes de clase'], correctIndex: 1, explanation: 'useMemo es útil para optimizaciones cuando hay cálculos costosos.' }
    ],
    examples: [
      { code: 'const memoizedValue = useMemo(() => expensiveCompute(a, b), [a, b]);', explanation: 'useMemo para valor costoso' },
      { code: 'const onClick = useCallback(() => doSomething(a), [a]);', explanation: 'useCallback para función' }
    ]
  }, 35, 2, 15);

  console.log('✅ React Mastery PRO completed');

  // ===========================================
  // ENROLLMENTS FOR DEMO USER
  // ===========================================
  const demo = await prisma.user.findUnique({ where: { email: 'demo@duobijac.com' } });
  const jsCourseRecord = await prisma.course.findUnique({ where: { id: 'course-js-fundamentals' } });
  const pyCourseRecord = await prisma.course.findUnique({ where: { id: 'course-python-beginner' } });
  
  if (jsCourseRecord && demo) {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: demo.id, courseId: jsCourseRecord.id } },
      update: {},
      create: { userId: demo.id, courseId: jsCourseRecord.id },
    });
  }

  if (pyCourseRecord && demo) {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: demo.id, courseId: pyCourseRecord.id } },
      update: {},
      create: { userId: demo.id, courseId: pyCourseRecord.id },
    });
  }

  console.log('✅ Demo enrollments created');

  console.log('\n🎉 ENHANCED Seed completed successfully!');
  console.log('\n📚 Courses Summary:');
  console.log('   - JavaScript Fundamentals: 6 modules, 18 lessons, 4 coding exercises, 2 mini-projects');
  console.log('   - Python para Principiantes: 4 modules, 14 lessons, 3 coding exercises, 2 mini-projects');
  console.log('   - Matemáticas Aplicadas: 2 modules, 6 lessons, 1 coding exercise');
  console.log('   - Inglés para Principiantes: 2 modules, 7 lessons, 1 speaking exercise');
  console.log('   - JavaScript Avanzado PRO: 1 module, 3 lessons, 1 coding exercise');
  console.log('   - React Mastery PRO: 1 module, 2 lessons');
  console.log('\n📝 Test accounts:');
  console.log('   Admin: admin@duobijac.com / admin123');
  console.log('   Demo: demo@duobijac.com / demo123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    throw e; // Don't exit - let the caller handle the error
  })
  .finally(async () => {
    await prisma.$disconnect();
  });