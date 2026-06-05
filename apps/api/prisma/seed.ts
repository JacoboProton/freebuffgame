import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

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
  console.log('🌱 Starting seed with demo courses...\n');

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
  // 🤖 CURSO 1: FUNDAMENTOS DE INTELIGENCIA ARTIFICIAL
  // ===========================================
  console.log('\n🤖 Creating Fundamentos de Inteligencia Artificial course...');

  const aiCourse = await createCourse(
    'course-ai-fundamentals',
    'Fundamentos de Inteligencia Artificial',
    'Aprende los conceptos fundamentales de la IA, desde machine learning hasta redes neuronales. Descubre cómo la inteligencia artificial está transformando el mundo y cómo puedes empezar a usarla.',
    'Inteligencia Artificial',
    'beginner',
    12,
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop'
  );

  // MÓDULO 1: ¿Qué es la IA?
  const aiM1 = await createModule('ai-mod-1', aiCourse.id, '¿Qué es la Inteligencia Artificial?', 1);

  await createLesson('ai-1-1', aiM1.id, 'Introducción a la Inteligencia Artificial', 'reading', {
    introduction: 'La Inteligencia Artificial es una rama de la informática que busca crear sistemas capaces de realizar tareas que normalmente requieren inteligencia humana: aprender, razonar, percibir, comprender lenguaje y tomar decisiones.',
    content: `La IA fue fundada como disciplina en 1956 en la Conferencia de Dartmouth, donde John McCarthy acuñó el término "Inteligencia Artificial". Desde entonces, ha pasado por épocas de gran entusiasmo y de "inviernos de la IA" donde el financiamiento se redujo.

Hoy vivimos una tercera ola de la IA impulsada por:
• Grandes volúmenes de datos disponibles
• Poder de cómputo masivo (GPUs)
• Mejoras en algoritmos de deep learning

TIPOS DE IA SEGÚN CAPACIDAD:
1. IA Débil (Narrow AI): Sistemas diseñados para tareas específicas. Ej: asistentes de voz, recomendaciones de Netflix, filtros de spam.

2. IA General (AGI): Una IA con capacidades cognitivas equivalentes a las humanas. Aún no existe, pero es el objetivo de muchos investigadores.

3. Superinteligencia (ASI): Una IA que supera la inteligencia humana en todos los aspectos. Es un concepto teórico discutido por Nick Bostrom.

EJEMPLOS REALES DE IA HOY:
• ChatGPT y Bard: procesamiento de lenguaje natural
• Tesla Autopilot: conducción autónoma
• AlphaFold: predicción de estructuras de proteínas
• DALL-E: generación de imágenes
• DeepMind AlphaGo: jugó Go mejor que cualquier humano`,
    keyPoints: [
      'La IA busca crear sistemas que imiten la inteligencia humana',
      'La IA Narrow es lo que usamos todos los días hoy',
      'La IA General (AGI) aún no existe',
      'Los avances actuales se deben a datos, cómputo y algoritmos'
    ],
    xpExplanation: '¡Has aprendido los fundamentos de qué es la IA y sus diferentes tipos!'
  }, 20, 1);

  await createLesson('ai-1-2', aiM1.id, 'Historia de la IA: De Turing a los LLMs', 'quiz', {
    questions: [
      {
        question: '¿Quién propuso el famoso "Test de Turing" para evaluar si una máquina puede pensar?',
        options: ['Alan Turing', 'John von Neumann', 'Ada Lovelace', 'Alan Kay'],
        correctIndex: 0,
        explanation: 'Alan Turing propuso su famoso test en 1950 en el artículo "Computing Machinery and Intelligence". El test evalúa si una máquina puede engañar a un humano haciéndole creer que es otro humano.'
      },
      {
        question: '¿En qué año se acuñó el término "Inteligencia Artificial"?',
        options: ['1943', '1950', '1956', '1969'],
        correctIndex: 2,
        explanation: 'El término "Inteligencia Artificial" fue acuñado por John McCarthy en la Conferencia de Dartmouth en 1956, considerada el nacimiento oficial de la disciplina.'
      },
      {
        question: '¿Qué es un Large Language Model (LLM)?',
        options: [
          'Un tipo de robot humanoide',
          'Un modelo de IA entrenado con grandes cantidades de texto para generar y comprender lenguaje',
          'Un programa de traducción automática',
          'Una base de datos de lenguas'
        ],
        correctIndex: 1,
        explanation: 'Los LLMs como GPT-4, PaLM y LLaMA son modelos de redes neuronales entrenados con billones de tokens de texto que pueden generar, resumir, traducir y responder preguntas.'
      },
      {
        question: '¿Qué fue el "invierno de la IA"?',
        options: [
          'Una temporada de nieve en un laboratorio de IA',
          'Un período de reducción de financiamiento e interés en IA',
          'El primer robot que funcionó en invierno',
          'Un virus que afectó servidores de IA'
        ],
        correctIndex: 1,
        explanation: 'Los "inviernos de la IA" fueron períodos (principalmente en los 70s y 80s-90s) donde las promesas de la IA no se cumplieron y el financiamiento y la investigación se redujeron significativamente.'
      }
    ]
  }, 25, 2);

  await createLesson('ai-1-3', aiM1.id, 'La IA en tu vida diaria', 'quiz', {
    questions: [
      {
        question: '¿Qué tecnología de IA usa Netflix para recomendarte contenido?',
        options: [
          'Reconocimiento facial',
          'Filtros de spam',
          'Sistemas de recomendación basados en ML',
          'Asistentes de voz'
        ],
        correctIndex: 2,
        explanation: 'Netflix usa algoritmos de filtrado colaborativo y de contenido que analizan tu historial de visualización, calificaciones y patrones de otros usuarios similares para recomendarte series y películas.'
      },
      {
        question: '¿Cómo usa Google Maps la IA para predecir el tiempo de llegada?',
        options: [
          'Solo usa la velocidad promedio',
          'Analiza tráfico en tiempo real con ML y datos históricos',
          'Pide al conductor que estime el tiempo',
          'No usa IA, solo GPS'
        ],
        correctIndex: 1,
        explanation: 'Google Maps combina datos GPS en tiempo real de millones de dispositivos, historial de tráfico, eventos, clima y patrones de conducción con modelos de ML para hacer predicciones precisas.'
      },
      {
        question: '¿Qué asistente virtual de IA se integra con dispositivos inteligentes del hogar?',
        options: [
          'Solo Alexa',
          'Alexa, Google Assistant, Siri y otros',
          'Solo Siri de Apple',
          'Ninguno usa IA real'
        ],
        correctIndex: 1,
        explanation: 'Varios asistentes virtuales (Alexa, Google Assistant, Siri) usan procesamiento de lenguaje natural y aprendizaje automático para controlar dispositivos, responder preguntas y ejecutar tareas.'
      }
    ]
  }, 25, 3);

  // MÓDULO 2: Machine Learning
  const aiM2 = await createModule('ai-mod-2', aiCourse.id, 'Machine Learning: Aprendizaje Automático', 2);

  await createLesson('ai-2-1', aiM2.id, '¿Qué es Machine Learning?', 'reading', {
    introduction: 'Machine Learning (ML) es el corazón del sistema de aprendizaje automático. Es un enfoque que permite a las computadoras aprender de los datos sin ser programadas explícitamente para cada tarea.',
    content: `Arthur Samuel definió ML en 1959 como "el campo de estudio que da a las computadoras la capacidad de aprender sin ser programadas explícitamente".

TRES TIPOS PRINCIPALES DE MACHINE LEARNING:

1. APRENDIZAJE SUPERVISADO (Supervised Learning)
   • Se entrena con datos etiquetados (input → output conocido)
   • El modelo aprende la relación entre entrada y salida
   • Ejemplos: clasificación de emails (spam/no spam), predicción de precios
   • Algoritmos: Regresión Lineal, Árboles de Decisión, Random Forest, SVM, Redes Neuronales

2. APRENDIZAJE NO SUPERVISADO (Unsupervised Learning)
   • Trabaja con datos SIN etiquetas
   • Busca patrones y estructuras ocultas
   • Ejemplos: segmentación de clientes, detección de anomalías, agrupación
   • Algoritmos: K-Means, DBSCAN, PCA, Autoencoders

3. APRENDIZAJE POR REFUERZO (Reinforcement Learning)
   • Un agente aprende mediante prueba y error
   • Recibe recompensas o penalizaciones por sus acciones
   • Ejemplos: AlphaGo, robots que aprenden a caminar, juegos
   • Conceptos: agente, estado, acción, recompensa, política

EL PROCESO DE ML:
1. Recopilar datos relevantes
2. Limpiar y preparar los datos
3. Elegir un modelo
4. Entrenar el modelo con los datos
5. Evaluar el rendimiento
6. Ajustar y optimizar
7. Desplegar en producción`,
    keyPoints: [
      'ML permite a las computadoras aprender de los datos',
      'Supervised Learning usa datos etiquetados',
      'Unsupervised Learning busca patrones sin etiquetas',
      'Reinforcement Learning aprende por recompensa y castigo'
    ]
  }, 20, 1);

  await createLesson('ai-2-2', aiM2.id, 'Algoritmos de Machine Learning', 'quiz', {
    questions: [
      {
        question: '¿Qué tipo de ML se usa para predecir el precio de una casa basado en metros cuadrados y ubicación?',
        options: [
          'Aprendizaje no supervisado',
          'Aprendizaje supervisado (regresión)',
          'Aprendizaje por refuerzo',
          'Deep Learning'
        ],
        correctIndex: 1,
        explanation: 'Predecir un valor numérico continuo (precio) a partir de características conocidas es un problema de REGRESIÓN, que es un tipo de aprendizaje supervisado.'
      },
      {
        question: '¿Qué algoritmo es mejor para encontrar grupos de clientes similares sin etiquetas previas?',
        options: [
          'Regresión Lineal',
          'Árbol de Decisión',
          'K-Means (clustering)',
          'Redes Neuronales Convolucionales'
        ],
        correctIndex: 2,
        explanation: 'K-Means es un algoritmo de CLUSTERING que agrupa datos similares sin necesidad de etiquetas previas. Es ideal para segmentación de clientes, donde no sabemos de antemano cuántos grupos hay.'
      },
      {
        question: '¿Qué es un "feature" en Machine Learning?',
        options: [
          'Una función del código',
          'Una característica o variable de entrada del modelo',
          'Un tipo de error',
          'Un resultado del modelo'
        ],
        correctIndex: 1,
        explanation: 'Un "feature" (característica) es cada variable de entrada que el modelo usa para hacer predicciones. Ej: para predecir el precio de una casa, los features serían metros cuadrados, número de habitaciones, ubicación, etc.'
      },
      {
        question: '¿Qué es el "overfitting" en Machine Learning?',
        options: [
          'Cuando el modelo es perfecto en todos los datos',
          'Cuando el modelo memoriza los datos de entrenamiento pero falla con datos nuevos',
          'Cuando el modelo es demasiado simple',
          'Cuando el modelo tarda mucho en entrenar'
        ],
        correctIndex: 1,
        explanation: 'Overfitting ocurre cuando el modelo "memoriza" los datos de entrenamiento con demasiada detalle, incluyendo el ruido, y luego falla al predecir con datos que nunca ha visto. Es como estudiar solo un examen específico y no poder resolver otros.'
      }
    ]
  }, 30, 2);

  await createLesson('ai-2-3', aiM2.id, 'Regresión Lineal: El algoritmo más simple', 'coding', {
    instructions: 'La regresión lineal es el algoritmo de ML más básico: busca una línea que mejor se ajuste a los datos. Practica con estos ejercicios:',
    exercise: {
      task: 'Implementa conceptos básicos de regresión lineal',
      challenges: [
        {
          id: 'ml-reg-1',
          description: 'Dado el conjunto de datos [(1, 2), (2, 4), (3, 5), (4, 4), (5, 5)], calcula el promedio de X e Y',
          initialCode: 'const datos = [[1,2], [2,4], [3,5], [4,4], [5,5]];\n// Calcula promedioX y promedioY\n',
          hint: 'Suma todas las X y divide por la cantidad, luego haz lo mismo con Y',
          solution: 'const promedioX = datos.reduce((s, [x]) => s + x, 0) / datos.length; // 3\nconst promedioY = datos.reduce((s, [,y]) => s + y, 0) / datos.length; // 4'
        },
        {
          id: 'ml-reg-2',
          description: 'Calcula la pendiente (m) de la regresión lineal con la fórmula: m = Σ[(xi - x̄)(yi - ȳ)] / Σ[(xi - x̄)²]',
          initialCode: 'const promedioX = 3;\nconst promedioY = 4;\nconst datos = [[1,2], [2,4], [3,5], [4,4], [5,5]];\n// Calcula la pendiente m\n',
          hint: 'Usa reduce para calcular el numerador y denominador por separado',
          solution: 'const numerador = datos.reduce((s, [x,y]) => s + (x - promedioX) * (y - promedioY), 0);\nconst denominador = datos.reduce((s, [x]) => s + (x - promedioX) ** 2, 0);\nconst m = numerador / denominador;'
        },
        {
          id: 'ml-reg-3',
          description: 'Usa la fórmula y = mx + b para predecir el valor de Y cuando X = 6',
          initialCode: '// Usa los valores m y b que calcularás\nconst m = 0.6; // pendiente calculada\n// Calcula b (intercepto) usando b = ȳ - m * x̄\nconst promedioX = 3;\nconst promedioY = 4;\n// Predice Y para X = 6\n',
          expectedOutput: 'prediccion debe ser 5.2',
          hint: 'b = promedioY - m * promedioX, luego predice con y = m*6 + b',
          solution: 'const b = promedioY - m * promedioX; // 2.2\nconst prediccion = m * 6 + b; // 5.2'
        }
      ]
    }
  }, 50, 3);

  // MÓDULO 3: Redes Neuronales
  const aiM3 = await createModule('ai-mod-3', aiCourse.id, 'Redes Neuronales y Deep Learning', 3);

  await createLesson('ai-3-1', aiM3.id, 'Redes Neuronales: El cerebro artificial', 'reading', {
    introduction: 'Las redes neuronales artificiales están inspiradas en el cerebro humano. Cada neurona artificial recibe entradas, las pondera y produce una salida que puede ser enviada a otras neuronas.',
    content: `¿CÓMO FUNCIONA UNA NEURONA ARTIFICIAL?

Una neurona artificial recibe:
1. Múltiples entradas (x1, x2, x3...)
2. Cada entrada tiene un peso asociado (w1, w2, w3...)
3. Se suma: z = w1*x1 + w2*x2 + w3*x3 + bias
4. Se aplica una función de activación: a = f(z)
5. La salida se envía a la siguiente capa

FUNCIONES DE ACTIVACIÓN COMUNES:
• Sigmoid: convierte cualquier número a un valor entre 0 y 1
• ReLU: output = max(0, z) — la más usada actualmente
• Softmax: convierte salidas en probabilidades (suma = 1)

ESTRUCTURA DE UNA RED NEURONAL:
• Capa de entrada (Input): recibe los datos originales
• Capas ocultas (Hidden): procesan la información
• Capa de salida (Output): produce la predicción

DEEP LEARNING = Redes con MÚLTIPLES capas ocultas

TIPOS DE REDES NEURONALES:

1. ANN (Artificial Neural Network): Red feedforward básica
2. CNN (Convolutional Neural Network): Excelente para imágenes
   - Usa filtros para detectar bordes, texturas, patrones
   - Aplicaciones: reconocimiento facial, diagnóstico médico
3. RNN/LSTM: Para secuencias (texto, audio, series temporales)
   - Tiene "memoria" de datos anteriores
   - Aplicaciones: traducción, predicción de texto
4. Transformers: Arquitectura dominante actualmente
   - Base de GPT, BERT, y todos los LLMs modernos
   - Usa "attention" para entender relaciones en los datos`,
    keyPoints: [
      'Las neuronas artificiales ponderan entradas con pesos',
      'Deep Learning usa redes con muchas capas ocultas',
      'CNNs son excelentes para procesar imágenes',
      'Transformers son la base de los LLMs modernos como GPT'
    ]
  }, 25, 1);

  await createLesson('ai-3-2', aiM3.id, 'Arquitecturas de Deep Learning', 'quiz', {
    questions: [
      {
        question: '¿Qué tipo de red neuronal es la mejor para clasificar imágenes de fotos de animales?',
        options: [
          'Red Neuronal Recurrente (RNN)',
          'Red Convolucional (CNN)',
          'Red Generativa Antagónica (GAN)',
          'Regresión Lineal'
        ],
        correctIndex: 1,
        explanation: 'Las CNNs son las redes estándar para procesamiento de imágenes. Usan filtros convolucionales para detectar patrones visuales como bordes, formas, texturas y objetos.'
      },
      {
        question: '¿Qué arquitectura de red se usa en ChatGPT y otros Large Language Models?',
        options: [
          'CNN (Convolucional)',
          'GAN (Generativa Antagónica)',
          'Transformer',
          'KNN (K-Nearest Neighbors)'
        ],
        correctIndex: 2,
        explanation: 'Los LLMs como GPT-4 se basan en la arquitectura Transformer, introducida por Google en 2017 en el paper "Attention Is All You Need". Los Transformers usan mecanismos de atención para procesar secuencias.'
      },
      {
        question: '¿Qué es una Red Generativa Antagónica (GAN)?',
        options: [
          'Una red que clasifica datos',
          'Un sistema de dos redes que compiten: una genera y otra evalúa',
          'Una red que solo hace predicciones',
          'Un algoritmo de clustering'
        ],
        correctIndex: 1,
        explanation: 'Las GANs tienen dos redes: el Generador (crea contenido falso) y el Discriminador (intenta detectar si es falso). Compiten entre sí, lo que permite al Generador crear contenido cada vez más realista. Se usan para generar imágenes, deepfakes, arte, etc.'
      },
      {
        question: '¿Qué es el "backpropagation" (retropropagación)?',
        options: [
          'Enviar datos hacia adelante en la red',
          'Un algoritmo para ajustar los pesos de la red minimizando el error',
          'Eliminar neuronas innecesarias',
          'Copiar una red existente'
        ],
        correctIndex: 1,
        explanation: 'Backpropagation es el algoritmo fundamental de entrenamiento de redes neuronales. Calcula el gradiente del error con respecto a cada peso y lo ajusta usando descenso gradiente para minimizar el error de predicción.'
      }
    ]
  }, 30, 2);

  await createLesson('ai-3-3', aiM3.id, 'Deep Learning en la práctica', 'quiz', {
    questions: [
      {
        question: '¿Qué es "transfer learning" en deep learning?',
        options: [
          'Mover datos entre servidores',
          'Reutilizar un modelo pre-entrenado para una tarea similar',
          'Copiar código de otro proyecto',
          'Un tipo de red neuronal'
        ],
        correctIndex: 1,
        explanation: 'Transfer learning permite tomar un modelo ya entrenado con millones de datos (como ImageNet) y ajustarlo para una tarea específica con pocos datos. Esto ahorra tiempo y recursos enormemente.'
      },
      {
        question: '¿Cuál es la principal desventaja del deep learning?',
        options: [
          'Es demasiado lento para producción',
          'Requiere grandes cantidades de datos y poder de cómputo',
          'No puede manejar imágenes',
          'Solo funciona con Python'
        ],
        correctIndex: 1,
        explanation: 'El deep learning necesita grandes volúmenes de datos etiquetados y potente hardware (GPUs/TPUs) para entrenar. Un modelo GPT puede costar millones de dólares en entrenamiento.'
      }
    ]
  }, 25, 3);

  // MÓDULO 4: IA Ética y Sociedad
  const aiM4 = await createModule('ai-mod-4', aiCourse.id, 'IA Ética y Sociedad', 4);

  await createLesson('ai-4-1', aiM4.id, 'Ética en la Inteligencia Artificial', 'reading', {
    introduction: 'A medida que la IA se integra más en nuestra vida, surgen preguntas éticas cruciales: ¿Quién es responsable cuando la IA comete errores? ¿Cómo evitamos el sesgo algorítmico?',
    content: `PRINCIPALES PROBLEMAS ÉTICOS DE LA IA:

1. SESGO ALGORÍTMICO (Algorithmic Bias)
   Los datos de entrenamiento pueden contener prejuicios sociales que la IA aprende y perpetúa.
   Ejemplo real: Amazon creó un sistema de contratación que discriminaba mujeres porque se entrenó con 20 años de datos donde la mayoría de empleados eran hombres.

2. PRIVACIDAD DE DATOS
   La IA necesita datos, pero ¿cómo protegemos la información personal?
   - Regulaciones: GDPR (Europa), CCPA (California)
   - Tecnología: aprendizaje federado, Differential Privacy

3. TRANSPARENCIA EXPLICABLE (XAI)
   Muchos modelos de IA son "cajas negras" — producen resultados sin explicar el por qué.
   Ejemplo: Un banco rechaza tu préstamo pero no puede explicar exactamente por qué.

4. RESPONSABILIDAD
   ¿Quién es responsable cuando la IA falla?
   - ¿El desarrollador del algoritmo?
   - ¿La empresa que lo implementó?
   - ¿El usuario que lo usó?

5. IMPACTO EN EL EMPLEO
   La IA automatiza tareas, pero también crea nuevos empleos.
   - Empleos en riesgo: datos repetitivos, clasificación simple
   - Empleos nuevos: ingenieros de ML, éticos de IA, curadores de datos

PRINCIPIOS DE IA ÉTICA:
• Justicia: evitar discriminación
• Transparencia: explicar decisiones
• Privacidad: proteger datos
• Seguridad: minimizar riesgos
• Responsabilidad: rendir cuentas`,
    keyPoints: [
      'El sesgo algorítmico perpetúa discriminación existente',
      'La transparencia es clave para la confianza en la IA',
      'La regulación de IA está evolucionando rápidamente',
      'La IA ética requiere esfuerzo de toda la sociedad'
    ]
  }, 25, 1);

  await createLesson('ai-4-2', aiM4.id, 'Desafíos Éticos y Regulación', 'quiz', {
    questions: [
      {
        question: '¿Qué es el "sesgo algorítmico" y por qué es un problema?',
        options: [
          'Cuando el algoritmo es demasiado rápido',
          'Cuando el algoritmo perpetúa o amplifica prejuicios presentes en los datos de entrenamiento',
          'Cuando el algoritmo es ineficiente',
          'Cuando el algoritmo usa mucha memoria'
        ],
        correctIndex: 1,
        explanation: 'El sesgo algorítmico ocurre cuando los datos de entrenamiento contienen prejuicios históricos (racismo, sexismo, etc.) que el modelo aprende y perpetúa en sus decisiones. Ej: sistemas de contratación que discriminan por género o raza.'
      },
      {
        question: '¿Qué reglamento europeo regula el uso de la IA y protección de datos?',
        options: [
          'HIPAA',
          'GDPR y AI Act',
          'DMCA',
          'FERPA'
        ],
        correctIndex: 1,
        explanation: 'El GDPR (2018) protege datos personales, y el AI Act (2024) es la primera regulación integral del mundo para la IA, clasificando sistemas por riesgo y estableciendo requisitos obligatorios.'
      },
      {
        question: '¿Qué es la "transparencia explicable" en IA?',
        options: [
          'Mostrar el código del algoritmo',
          'La capacidad de explicar y comprender cómo la IA toma decisiones',
          'Hacer que los datos sean públicos',
          'Usar pantallas transparentes para mostrar IA'
        ],
        correctIndex: 1,
        explanation: 'La transparencia explicable (XAI) busca que los modelos de IA puedan explicar POR QUÉ tomaron una decisión. Es crucial para generar confianza y poder detectar errores o sesgos.'
      }
    ]
  }, 30, 2);

  // MÓDULO 5: Aplicaciones Prácticas
  const aiM5 = await createModule('ai-mod-5', aiCourse.id, 'Herramientas y Aplicaciones Prácticas de la IA', 5);

  await createLesson('ai-5-1', aiM5.id, 'Herramientas de IA para el Día a Día', 'reading', {
    introduction: 'La IA ya está disponible como herramientas que cualquiera puede usar. Conoce las principales categorías y cómo sacarles el máximo provecho.',
    content: `CATEGORÍAS DE HERRAMIENTAS DE IA:

1. CHATBOTS Y ASISTENTES (LLMs)
   • ChatGPT: El más popular, versátil para escritura, código, análisis
   • Claude: Enfocado en seguridad y conversaciones largas
   • Google Gemini: Integrado con servicios de Google
   • Copilot (Microsoft): Integrado en Office y Windows

2. GENERACIÓN DE IMÁGENES
   • DALL-E 3: Genera imágenes desde texto (integrado en ChatGPT)
   • Midjourney: Alta calidad artística
   • Stable Diffusion: Open source, ejecutable localmente
   • Adobe Firefly: Integrado en Photoshop

3. GENERACIÓN DE CÓDIGO
   • GitHub Copilot: Sugiere código en tu editor
   • Cursor: IDE con IA integrada
   • Replit AI: Genera y ejecuta código en línea

4. PRODUCTIVIDAD
   • Notion AI: Organiza notas y genera contenido
   • Otter.ai: Transcribe reuniones automáticamente
   • Gamma: Crea presentaciones con IA

5. ANÁLISIS DE DATOS
   • ChatGPT Code Interpreter: Analiza datasets
   • Julius AI: Análisis de datos con lenguaje natural
   • Obviously AI: ML sin código

CÓMO ESCRIBIR BUENOS PROMPTS:
1. Sé específico: no digas "escríbeme algo", di "escribe un email formal para solicitar una reunión con..."
2. Da contexto: explica tu situación, audiencia y objetivo
3. Formato: especifica si quieres una lista, párrafo, tabla, código
4. Itera: ajusta tu prompt basándote en los resultados
5. Rol: "Actúa como un experto en..." mejora la respuesta`,
    keyPoints: [
      'Existen herramientas de IA para prácticamente cualquier tarea',
      'Los prompts claros y específicos producen mejores resultados',
      'La IA es una herramienta poderosa que amplifica tu capacidad',
      'Es importante verificar los resultados de la IA'
    ]
  }, 20, 1);

  await createLesson('ai-5-2', aiM5.id, 'Prompt Engineering: El Arte de Hablar con la IA', 'quiz', {
    questions: [
      {
        question: '¿Cuál de estos prompts producirá MEJORES resultados de ChatGPT?',
        options: [
          '"Escríbeme algo sobre marketing"',
          '"Actúa como un consultor de marketing digital. Escribe 5 estrategias de marketing en redes sociales para una tienda de ropa juvenil en España, con un tono informal y ejemplos prácticos."',
          '"Marketing. 5 cosas."',
          '"Hola, necesito ayuda con marketing"'
        ],
        correctIndex: 1,
        explanation: 'El prompt más efectivo incluye: un rol claro (consultor), contexto específico (tienda de ropa juvenil en España), formato (5 estrategias), tono (informal) y ejemplos prácticos. La especificidad es clave.'
      },
      {
        question: '¿Qué es "hallucination" (alucinación) en un LLM?',
        options: [
          'Cuando el modelo funciona perfectamente',
          'Cuando el modelo genera información falsa o inventada con apariencia de ser cierta',
          'Cuando el modelo tarda mucho en responder',
          'Cuando el modelo no entiende español'
        ],
        correctIndex: 1,
        explanation: 'Las alucinaciones son respuestas que parecen convincentes pero contienen información falsa. Los LLMs pueden inventar fuentes, datos estadísticos o hechos que no existen. Siempre verifica la información importante.'
      },
      {
        question: '¿Por qué es importante verificar los resultados de la IA?',
        options: [
          'Porque la IA siempre da respuestas correctas',
          'Porque los LLMs pueden cometer errores, alucinar datos y tener sesgos',
          'Porque la IA es ilegal',
          'Porque solo funciona en inglés'
        ],
        correctIndex: 1,
        explanation: 'Los LLMs pueden contener errores, generar información falsa (alucinaciones), tener sesgos de sus datos de entrenamiento, y no tener información actualizada. Siempre verifica con fuentes confiables.'
      }
    ]
  }, 25, 2);

  await createLesson('ai-5-3', aiM5.id, '🚀 Mini-Proyecto: Tu Primer Análisis con IA', 'project', {
    title: 'Análisis de Datos con IA',
    description: 'Usa herramientas de IA para analizar un conjunto de datos y generar insights accionables.',
    objectives: [
      'Aprender a usar IA para análisis de datos',
      'Formular prompts efectivos para obtención de datos',
      'Interpretar y evaluar los resultados de la IA'
    ],
    requirements: [
      'Elige un dataset público (Kaggle, Google Dataset Search)',
      'Usa ChatGPT o similar para generar 5 preguntas de análisis',
      'Solicita a la IA que genere código de Python para analizar los datos',
      'Documenta los insights más importantes encontrados',
      'Evalúa la calidad de las respuestas de la IA (¿son correctas? ¿hay errores?)'
    ],
    exampleCode: `# Prompt para ChatGPT:
"Actúa como un analista de datos senior. Tengo un dataset de ventas 
de una tienda online con columnas: fecha, producto, categoría, 
cantidad, precio, cliente_id. 

1. Sugiere 5 análisis importantes para este dataset
2. Escribe el código Python usando pandas para cada análisis
3. Interpreta los posibles resultados"

# Ejemplo de código que la IA podría generar:
import pandas as pd
df = pd.read_csv('ventas.csv')
ventas_por_categoria = df.groupby('categoria')['precio'].sum()
top_productos = df.groupby('producto')['cantidad'].sum().nlargest(10)`,
    tips: ['La IA es un asistente, no un reemplazo de tu criterio', 'Siempre verifica datos y código generado', 'Experimenta con diferentes prompts para comparar resultados']
  }, 50, 3);

  console.log('✅ Fundamentos de IA completed (5 modules, 13 lessons)');

  // ===========================================
  // 💰 CURSO 2: FINANZAS PERSONALES PARA PRINCIPIANTES
  // ===========================================
  console.log('\n💰 Creating Finanzas Personales para Principiantes course...');

  const finanzasCourse = await createCourse(
    'course-finanzas-personales',
    'Finanzas Personales para Principiantes',
    'Aprende a tomar el control de tu dinero. Desde crear tu primer presupuesto hasta invertir con confianza. Herramientas prácticas para construir tu libertad financiera.',
    'Finanzas',
    'beginner',
    10,
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop'
  );

  // MÓDULO 1: Mentalidad y Fundamentos Financieros
  const finM1 = await createModule('fin-mod-1', finanzasCourse.id, 'Mentalidad y Fundamentos Financieros', 1);

  await createLesson('fin-1-1', finM1.id, 'Tu Relación con el Dinero', 'reading', {
    introduction: 'Antes de hablar de números, es importante entender cómo piensas sobre el dinero. Tu mentalidad financiera determina tus decisiones y resultados a largo plazo.',
    content: `TU RELACIÓN CON EL DINERO:
La mayoría de personas nunca fueron enseñadas a manejar dinero. La educación financiera formal es rara en escuelas, lo que crea patrones que se repiten generación tras generación.

LOS 3 PILARES DE LA LIBERTAD FINANCIERA:

1. AHORRO → Tener un fondo de emergencia
   • Objetivo: 3-6 meses de gastos fijos
   • Regla: paga primero a ti mismo (antes de gastar)

2. DEUDA → Eliminar deudas tóxicas
   • Deudas buenas: hipoteca, préstamo estudiantil (tasas bajas, generan valor)
   • Deudas malas: tarjetas de crédito, préstamos de consumo (tasas altas)

3. INVERSIÓN → Hacer crecer tu dinero
   • El interés compuesto es la fuerza más poderosa del universo financiero
   • Einstein lo llamó "la octava maravilla del mundo"

EL COSTO DE NO SABER:
• Una persona que ahorra $200/mes desde los 25 años al 7% anual tendría ~$525,000 a los 65 años
• Si empieza a los 35, tendría solo ~$244,000 — pierde más de la mitad por esperar 10 años

LAS 5 REGLAS DE ORO:
1. Vive por debajo de tus posibilidades
2. Paga todas tus deudas (excepto hipoteca) antes de invertir
3. Ten un fondo de emergencia de 3-6 meses
4. Invierte el 15-20% de tus ingresos consistentemente
5. Nunca inviertas en lo que no entiendes`,
    keyPoints: [
      'Tu mentalidad financiera es tan importante como los números',
      'El fondo de emergencia es la base de la seguridad financiera',
      'El interés compuesto premia a quien empieza temprano',
      'No todas las deudas son iguales'
    ]
  }, 20, 1);

  await createLesson('fin-1-2', finM1.id, 'Conceptos Clave de Finanzas', 'quiz', {
    questions: [
      {
        question: '¿Qué es el "interés compuesto"?',
        options: [
          'Un interés que se paga una sola vez',
          'Interés que se calcula sobre el capital más los intereses acumulados',
          'Una tasa de interés fija',
          'Un tipo de préstamo'
        ],
        correctIndex: 1,
        explanation: 'El interés compuesto genera intereses sobre los intereses ya acumulados. Ej: si inviertes $1000 al 10%, al año siguiente tienes $1100, y al año siguiente el 10% se calcula sobre $1100 (no sobre $1000). Crece exponencialmente.'
      },
      {
        question: '¿Cuál es la diferencia entre ingresos brutos y netos?',
        options: [
          'No hay diferencia',
          'Brutos son antes de impuestos, netos son después de impuestos y deducciones',
          'Netos son antes de impuestos',
          'Brutos incluyen inversiones'
        ],
        correctIndex: 1,
        explanation: 'Ingresos brutos = lo que ganas antes de deducciones. Ingresos netos = lo que realmente recibes después de impuestos, seguridad social y otras deducciones. Si ganas $3000 brutos, podrías recibir $2400 netos.'
      },
      {
        question: '¿Qué es un "fondo de emergencia"?',
        options: [
          'Un préstamo de emergencia del banco',
          'Ahorros destinados a cubrir gastos inesperados sin recurrir a deudas',
          'Una inversión de alto riesgo',
          'Un seguro de vida'
        ],
        correctIndex: 1,
        explanation: 'El fondo de emergencia es dinero líquido (fácil de accesible) que cubre 3-6 meses de gastos. Se usa para emergencias reales: pérdida de empleo, reparación del auto, gasto médico. NUNCA se toca para compras o vacaciones.'
      },
      {
        question: '¿Qué tipo de deuda se considera "buena"?',
        options: [
          'Tarjeta de crédito con tasa del 25%',
          'Préstamo para un auto deportivo de lujo',
          'Hipoteca con tasa baja que te permite vivir en una zona con buenos trabajos',
          'Préstamo de payday con tasa del 400%'
        ],
        correctIndex: 2,
        explanation: 'Una hipoteca con tasa baja es "buena deuda" porque el inmueble tiende a apreciarse con el tiempo, la tasa es baja comparada con otras formas de crédito, y te proporciona un activo que genera valor (vivienda, possibly rental income).'
      }
    ]
  }, 25, 2);

  // MÓDULO 2: Presupuesto y Ahorro
  const finM2 = await createModule('fin-mod-2', finanzasCourse.id, 'Presupuesto y Estrategias de Ahorro', 2);

  await createLesson('fin-2-1', finM2.id, 'Cómo Crear un Presupuesto Efectivo', 'reading', {
    introduction: 'Un presupuesto no es una restricción, es un plan que te da libertad. Saber a dónde va tu dinero te permite tomar decisiones conscientes y alcanzar tus metas.',
    content: `EL MÉTODO 50/30/20:

Asígnate un porcentaje de tus ingresos netos:

50% NECESIDADES (Needs)
• Alquiler/hipoteca
• Servicios (luz, agua, internet)
• Comida básica
• Transporte
• Seguros
• Pagos mínimos de deudas

30% DESEOS (Wants)
• Restaurantes y delivery
• Entretenimiento (Netflix, cine, conciertos)
• Ropa
• Viajes
• Suscripciones
• Compras personales

20% AHORRO E INVERSIÓN
• Fondo de emergencia
• Inversiones (acciones, fondos indexados)
• Pago extra de deudas
• Metas de ahorro específicas

EJEMPLO PRÁCTICO:
Si ganas $2,000 netos al mes:
• $1,000 → Necesidades
• $600 → Deseos
• $400 → Ahorro e inversión

PASOS PARA CREAR TU PRESUPUESTO:
1. Calcula tus ingresos netos mensuales
2. Lista TODOS tus gastos fijos
3. Categoriza tus gastos variables
4. Asigna montos según 50/30/20
5. Registra gastos reales vs presupuestados
6. Ajusta mensualmente

HERRAMIENTAS GRATUITAS:
• Hoja de cálculo (Google Sheets, Excel)
• Apps: Mint, YNAB (You Need A Budget), Fintonic
• Método del sobre: retira efectivo en sobres por categoría`,
    keyPoints: [
      'El método 50/30/20 es un excelente punto de partida',
      'Un presupuesto te da control, no restricciones',
      'Registra TODOS tus gastos al menos un mes para entender tus patrones',
      'Ajusta tu presupuesto mensualmente'
    ]
  }, 20, 1);

  await createLesson('fin-2-2', finM2.id, 'Estrategias de Ahorro y Fondo de Emergencia', 'quiz', {
    questions: [
      {
        question: '¿Cuánto debería tener en tu fondo de emergencia?',
        options: [
          '$1,000 y ya está',
          '1 mes de gastos',
          '3-6 meses de gastos fijos',
          '2 años de ingresos'
        ],
        correctIndex: 2,
        explanation: 'El fondo de emergencia ideal cubre 3-6 meses de gastos fijos (alimentación, alquiler, servicios, transporte). Si eres freelance o tu empleo es inestable, apunta a 6-9 meses. No es para vacaciones, es para emergencias reales.'
      },
      {
        question: '¿Dónde DEBERÍAS guardar tu fondo de emergencia?',
        options: [
          'En una cuenta de ahorro normal o money market',
          'En inversiones de riesgo para que crezca más',
          'Debajo del colchón en efectivo',
          'En una tarjeta de crédito'
        ],
        correctIndex: 0,
        explanation: 'El fondo de emergencia debe estar en una cuenta líquida (accesible inmediatamente) y segura. Una cuenta de ahorro o money market con buena tasa funciona. NUNCA en inversiones de riesgo porque podrías necesitar el dinero cuando el mercado esté abajo.'
      },
      {
        question: '¿Qué es la "regla de los 24 horas" para compras impulsivas?',
        options: [
          'Esperar 24 horas antes de comprar algo que cuesta más de $50',
          'Solo comprar los martes',
          'Hacer todas tus compras en 24 horas',
          'Un descuento que dura 24 horas'
        ],
        correctIndex: 0,
        explanation: 'La regla de las 24 horas dice que antes de comprar algo no esencial que cuesta más de cierto monto, esperas 24 horas. Si después de esperar todavía lo quieres y lo necesitas, cómpralo. Elimina el 80% de las compras impulsivas.'
      },
      {
        question: '¿Cuál es la "tasa de ahorro" y por qué importa?',
        options: [
          'El interés que paga tu banco',
          'El porcentaje de tus ingresos que ahorras e inviertes',
          'El costo de vida en tu ciudad',
          'La inflación anual'
        ],
        correctIndex: 1,
        explanation: 'Tu tasa de ahorro = (ingresos - gastos) / ingresos × 100. Si ganas $2000 y ahorras $400, tu tasa es 20%. Un adulto joven debería aspirar a 20%+, y con la edad idealmente aumentar. Es la métrica más importante de salud financiera.'
      }
    ]
  }, 30, 2);

  await createLesson('fin-2-3', finM2.id, '🎮 Ejercicio: Calcula tu Presupuesto', 'coding', {
    instructions: 'Practica creando un presupuesto y calculando tu tasa de ahorro:',
    exercise: {
      task: 'Calcula tu presupuesto mensual y métricas financieras',
      challenges: [
        {
          id: 'fin-bud-1',
          description: 'Si ganas $2500 netos al mes, calcula cuánto va a necesidades (50%), deseos (30%) y ahorro (20%)',
          initialCode: 'const ingresosNetos = 2500;\n// Calcula cada categoría con el método 50/30/20\nconst necesidades = ingresosNetos * ???;\nconst deseos = ingresosNetos * ???;\nconst ahorro = ingresosNetos * ???;\n',
          expectedOutput: 'necesidades=1250, deseos=750, ahorro=500',
          hint: '50% = 0.50, 30% = 0.30, 20% = 0.20',
          solution: 'const necesidades = ingresosNetos * 0.50; // 1250\nconst deseos = ingresosNetos * 0.30; // 750\nconst ahorro = ingresosNetos * 0.20; // 500'
        },
        {
          id: 'fin-bud-2',
          description: 'Calcula tu tasa de ahorro: si ganas $3000 y gastas $2200, ¿cuánto es tu tasa?',
          initialCode: 'const ingresos = 3000;\nconst gastos = 2200;\n// Calcula la tasa de ahorro como porcentaje\nconst tasaAhorro = ???;\n',
          expectedOutput: 'tasaAhorro debe ser 26.67 (porcentaje)',
          hint: 'Tasa = ((ingresos - gastos) / ingresos) * 100',
          solution: 'const tasaAhorro = ((ingresos - gastos) / ingresos) * 100; // 26.67'
        },
        {
          id: 'fin-bud-3',
          description: 'Si tienes $5000 en ahorros y pierdes tu empleo con gastos fijos de $1200/mes, ¿cuántos meses duras?',
          initialCode: 'const ahorros = 5000;\nconst gastosMensuales = 1200;\n// Calcula cuántos meses cubre tu fondo\nconst mesesDeEmergencia = ???;\n',
          expectedOutput: 'mesesDeEmergencia debe ser ~4.17',
          hint: 'Meses = ahorros / gastos mensuales',
          solution: 'const mesesDeEmergencia = ahorros / gastosMensuales; // 4.17'
        }
      ]
    }
  }, 40, 3);

  // MÓDULO 3: Deudas y Crédito
  const finM3 = await createModule('fin-mod-3', finanzasCourse.id, 'Manejo de Deudas y Crédito', 3);

  await createLesson('fin-3-1', finM3.id, 'Entendiendo las Deudas y el Crédito', 'reading', {
    introduction: 'Las deudas no son inherentemente malas — depende del tipo, la tasa de interés y para qué las uses. Aprender a manejarlas es fundamental para tu salud financiera.',
    content: `TIPOS DE DEUDA:

DEUDA "BUENA" (tasa baja, genera valor):
• Hipoteca: tasa típica 3-7%, el inmueble se aprecia
• Préstamo estudiantil: tasa 4-8%, aumenta tu capacidad de ingresos
• Préstamo business: tasa variable, financia un negocio

DEUDA "MALA" (tasa alta, consume valor):
• Tarjeta de crédito: tasa 15-30%, se usa para consumo
• Préstamo de payday: tasa 200-400%, trampa financiera
• Préstamo de auto de lujo: se devalúa rápidamente

EL INTERÉS COMPUESTO TRABAJA CONTRA TI:
Si debes $5,000 en tarjeta de crédito al 22% de tasa anual y solo pagas el mínimo:
• En 5 años habrás pagado ~$7,000 pero seguirás debiendo ~$3,500
• Total pagado: ~$10,500 por una deuda original de $5,000

ESTRATEGIAS PARA PAGAR DEUDAS:

1. MÉTODO BOLA DE NIEVE (Dave Ramsey)
   • Ordena deudas de menor a mayor saldo
   • Paga el mínimo en todas
   • El extra va a la deuda más pequeña
   • Ventaja: motivación al eliminar deudas rápidamente

2. MÉTODO AVALACHA
   • Ordena deudas de mayor a menor tasa de interés
   • El extra va a la deuda con mayor tasa
   • Ventaja: ahorra más dinero en intereses total

¿CUÁL ELEGIR?
• Si necesitas motivación rápida → Bola de nieve
• Si quieres optimizar dinero → Avalancha

TU SCORE DE CRÉDITO (300-850):
• 300-579: Pobre
• 580-669: Regular
• 670-739: Bueno
• 740-799: Muy bueno
• 800-850: Excelente

Factores del score:
• 35% historial de pagos (paga a tiempo SIEMPRE)
• 30% utilización de crédito (mantén bajo 30% del límite)
• 15% antigüedad de crédito
• 10% tipos de crédito
• 10% nuevas solicitudes de crédito`,
    keyPoints: [
      'Las deudas de tasa alta son las más peligrosas',
      'El método avalancha ahorra más dinero, la bola de nieve da más motivación',
      'Mantén la utilización de tarjeta bajo 30% de tu límite',
      'Paga SIEMPRE a tiempo para proteger tu score de crédito'
    ]
  }, 25, 1);

  await createLesson('fin-3-2', finM3.id, 'Estrategias para Salir de Deudas', 'quiz', {
    questions: [
      {
        question: 'Si debes $3,000 en tarjeta al 22% y $8,000 en préstamo personal al 8%, ¿cuál es la deuda que deberías atacar primero con el método avalancha?',
        options: [
          'El préstamo personal de $8,000 porque es la deuda más grande',
          'La tarjeta de crédito de $3,000 porque tiene la tasa más alta',
          'Pagan igual para ambas',
          'Ninguna, paga solo los mínimos'
        ],
        correctIndex: 1,
        explanation: 'Con el método avalancha, atacas primero la deuda con la MAYOR tasa de interés. La tarjeta al 22% cuesta mucho más que el préstamo al 8%. Cada dólar extra va a la tarjeta hasta pagarla, luego al préstamo.'
      },
      {
        question: '¿Qué es la "utilización de crédito" y cuál es el porcentaje ideal?',
        options: [
          'El total de deudas que tienes; ideal es $0',
          'El porcentaje de tu límite de crédito que estás usando; ideal es bajo 30%',
          'El número de tarjetas que tienes; ideal es 1-2',
          'Los intereses que pagas; ideal es 0%'
        ],
        correctIndex: 1,
        explanation: 'Utilización de crédito = saldo actual / límite total × 100. Si tienes una tarjeta con límite $10,000 y debes $3,000, tu utilización es 30%. Mantenerla bajo 30% (idealmente bajo 10%) mejora significativamente tu score de crédito.'
      },
      {
        question: '¿Qué es una "consolidación de deudas"?',
        options: [
          'Juntar todas las deudas en un solo préstamo con tasa más baja',
          'Pedir más deudas para pagar las existentes',
          'Eliminar deudas sin pagarlas',
          'Un tipo de bankruptcy'
        ],
        correctIndex: 0,
        explanation: 'La consolidación junta múltiples deudas de alta tasa en un solo préstamo de tasa más baja. Ej: pagar tarjetas al 22% con un préstamo personal al 8%. Cuidado: solo funciona si no vuelves a usar las tarjetas.'
      }
    ]
  }, 30, 2);

  // MÓDULO 4: Inversiones y Crecimiento
  const finM4 = await createModule('fin-mod-4', finanzasCourse.id, 'Inversión y Crecimiento Patrimonial', 4);

  await createLesson('fin-4-1', finM4.id, 'Introducción a las Inversiones', 'reading', {
    introduction: 'Invertir no es un lujo ni algo solo para ricos. Es la forma de hacer crecer tu dinero por encima de la inflación. Cuanto antes empieces, más beneficios del interés compuesto.',
    content: `¿POR QUÉ INVERTIR?
Si guardas dinero debajo del colchón, pierde valor cada año por la inflación (3-5% anual). Invertir permite que tu dinero crezca más rápido que la inflación.

EL ESPECTRO DE RIESGO-RENDIMIENTO:

BAJO RIESGO / BAJO RENDIMIENTO:
• Cuenta de ahorro de alto rendimiento: 4-5% anual
• Certificados de depósito (CDs): 4-6%
• Bonos del gobierno: 3-6%

RIESGO MEDIO / RENDIMIENTO MEDIO:
• Fondos indexados (ETFs): 7-10% anual promedio histórico
• Fondos mutuos: 6-12%
• Bonos corporativos: 4-7%

ALTO RIESGO / ALTO RENDIMIENTO:
• Acciones individuales: -100% a +50% o más
• Criptomonedas: extremadamente volátil
• Startups: alto riesgo de perderlo todo

LA ESTRATEGIA MÁS RECOMENDADA PARA PRINCIPIANTES:

FONDOS INDEXADOS:
• Diversifican automáticamente (compras "todas" las empresas)
• Comisiones muy bajas (0.03-0.20%)
• Rendimiento histórico del ~10% anual (S&P 500)
• No requieren conocimiento de mercado

EJEMPLO:
Si inviertes $300/mes en un fondo indexado del S&P 500 al 10% promedio:
• En 10 años: ~$61,000 (invertiste $36,000)
• En 20 años: ~$229,000 (invertiste $72,000)
• En 30 años: ~$678,000 (invertiste $108,000)

EL PODER DEL INTERÉS COMPUESTO:
Nota cómo los últimos 10 años generan más que los primeros 20. Eso es el interés compuesto trabajando a tu favor.

REGLAS DE INVERSIÓN:
1. Empieza HOY, no mañana
2. Invierte consistentemente (DCA: Dollar Cost Averaging)
3. Diversifica (nunca pongas todo en un solo lugar)
4. No intentes "ganarle al mercado"
5. Piensa a largo plazo (5+ años)
6. No inviertas dinero que necesites en corto plazo`,
    keyPoints: [
      'Invertir protege tu dinero de la inflación',
      'Los fondos indexados son ideales para principiantes',
      'El interés compuesto premia la paciencia y consistencia',
      'El S&P 500 ha dado ~10% anual promedio históricamente'
    ]
  }, 25, 1);

  await createLesson('fin-4-2', finM4.id, 'Instrumentos de Inversión', 'quiz', {
    questions: [
      {
        question: '¿Qué es un fondo indexado como el S&P 500?',
        options: [
          'Una sola empresa que cotiza en bolsa',
          'Un fondo que replica automáticamente las 500 empresas más grandes de EE.UU.',
          'Un préstamo al gobierno',
          'Un tipo de criptomoneda'
        ],
        correctIndex: 1,
        explanation: 'Un fondo indexado del S&P 500 compra automáticamente acciones de las 500 empresas más grandes de EE.UU. (Apple, Microsoft, Amazon, etc.). Con una sola inversión, diversificas en todas ellas. Es la inversión más recomendada para principiantes.'
      },
      {
        question: '¿Cuál es la diferencia entre acciones y bonos?',
        options: [
          'No hay diferencia',
          'Acciones son parte de una empresa (riesgo mayor), bonos son préstamos al gobierno o empresas (riesgo menor)',
          'Acciones son para ricos, bonos para pobres',
          'Bonos generan más rendimiento que acciones'
        ],
        correctIndex: 1,
        explanation: 'Acciones = compras una parte de la empresa. Suben y bajan con el mercado. Bonos = prestas dinero (al gobierno o empresa) y te pagan intereses. Son más estables pero con menor rendimiento histórico.'
      },
      {
        question: '¿Qué es Dollar Cost Averaging (DCA)?',
        options: [
          'Cambiar dólares a otra moneda',
          'Invertir una cantidad fija periódicamente sin importar el precio del mercado',
          'Esperar a que el mercado baje para invertir todo de golpe',
          'Un tipo de impuesto'
        ],
        correctIndex: 1,
        explanation: 'DCA significa invertir la misma cantidad de dinero regularmente (ej: $300 cada mes) sin importar si el mercado está alto o bajo. Esto promedia tu precio de compra y elimina el riesgo de "mal timing".'
      },
      {
        question: '¿Qué es la "diversificación" en inversiones?',
        options: [
          'Poner todo tu dinero en la mejor acción',
          'Distribuir inversiones en diferentes tipos de activos para reducir el riesgo',
          'Invertir solo en criptomonedas',
          'Comprar y vender rápido'
        ],
        correctIndex: 1,
        explanation: 'Diversificar es no poner todos los huevos en la misma canasta. Si inviertes solo en una empresa y quiebra, pierdes todo. Si tienes acciones, bonos, bienes raíces y diferentes sectores, el riesgo se distribuye.'
      }
    ]
  }, 30, 2);

  await createLesson('fin-4-3', finM4.id, '🚀 Mini-Proyecto: Tu Plan de Inversión', 'project', {
    title: 'Crea tu Primer Plan de Inversión Personal',
    description: 'Diseña un plan de inversión basado en tus objetivos financieros y tolerancia al riesgo.',
    objectives: [
      'Aplicar los conceptos de riesgo y rendimiento',
      'Crear un plan de inversión personalizado',
      'Calcular proyecciones de crecimiento a largo plazo'
    ],
    requirements: [
      'Define tu horizonte temporal (5, 10, 20, 30 años)',
      'Calcula cuánto puedes invertir mensualmente (20% de ingresos)',
      'Elige tu asignación de activos según tu tolerancia al riesgo',
      'Calcula proyecciones usando interés compuesto',
      'Explica por qué elegiste esa estrategia'
    ],
    exampleCode: `// Calculadora de interés compuesto
function calcularCrecimiento(inversionMensual, anios, tasaAnual) {
  const tasaMensual = tasaAnual / 12 / 100;
  let total = 0;
  for (let i = 0; i < anios * 12; i++) {
    total = (total + inversionMensual) * (1 + tasaMensual);
  }
  return total;
}

// Ejemplo: $300/mes, 20 años, 10% anual
console.log(calcularCrecimiento(300, 20, 0.10));
// Resultado: ~$229,000

// Estrategia sugerida para principiantes:
// 80% fondos indexados (S&P 500)
// 20% bonos del gobierno
// Rebalancear cada 6 meses`,
    tips: ['Empieza con poco si es necesario, pero empieza', 'No intentes predecir el mercado', 'La consistencia es más importante que la cantidad']
  }, 60, 3);

  console.log('✅ Finanzas Personales completed (4 modules, 9 lessons)');

  // ===========================================
  // 🍝 CURSO 3: COCINA ITALIANA TRADICIONAL
  // ===========================================
  console.log('\n🍝 Creating Cocina Italiana Tradicional course...');

  const cocinaCourse = await createCourse(
    'course-cocina-italiana',
    'Cocina Italiana Tradicional',
    'Descubre los secretos de la auténtica cocina italiana: desde la pasta fresca hasta los platos emblemáticos de cada región. Cocina como un nonno italiano.',
    'Cocina',
    'beginner',
    8,
    'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&h=400&fit=crop'
  );

  // MÓDULO 1: Fundamentos de la Cocina Italiana
  const cocM1 = await createModule('coc-mod-1', cocinaCourse.id, 'Fundamentos de la Tradición Italiana', 1);

  await createLesson('coc-1-1', cocM1.id, 'La Filosofía de la Cocina Italiana', 'reading', {
    introduction: 'La cocina italiana no se trata de complicación, sino de ingredientes de la más alta calidad preparados con respeto y simplicidad. Cada región tiene sus especialidades.',
    content: `LOS 4 PILARES DE LA COCINA ITALIANA:

1. INGREDIENTES FRESCOS Y DE TEMPORADA
   Los italianos compran diariamente en mercados. La calidad del ingrediente es lo más importante.
   • Tomates San Marzano (Nápoles)
   • Aceite de oliva extra virgen de buena calidad
   • Albahaca fresca (nunca se congela)
   • Quesos recién hechos

2. SIMPLICIDAD
   Los mejores platos italianos tienen 4-6 ingredientes. La sobrecarga de ingredientes destruye el sabor.
   Ejemplo: una Carbonara auténtica solo tiene: guanciale, huevo, pecorino, pimienta negra. NADA MÁS.

3. REGIONALIDAD
   Cada región tiene su identidad culinaria:
   • Norte: Risotto, polenta, mantequilla, crema (Lombardía, Piamonte)
   • Centro: Pasta al huevo, cecina, aceite de oliva toscano
   • Sur: Pasta seca, tomates, mariscos, mozzarella (Nápoles, Sicilia)

4. EL ORDEN DE LOS PLATOS (La Comida Italiana)
   Aperitivo: aperol spritz, aceitunas
   Antipasto: bruschetta, caprese, prosciutto
   Primo: pasta, risotto, sopa (minestrone)
   Secondo: carne o pescado
   Contorno: verduras (insalata, verduras al horno)
   Dolce: tiramisú, panna cotta, gelato
   Caffè: espresso (nunca cappuccino después de las 11am!)
   Digestivo: limoncello, grappa

ERRORES COMUNES A EVITAR:
❌ Usar aceite de oliva para freír a alta temperatura (usa aceite de semillas)
❌ Cocinar la pasta en agua sin suficiente sal
❌ Mezclar pasta con queso parmesano en mariscos (nunca queso con pescado)
❌ Agregar aceite de oliva a la carbonara (no va)
❌ Usar queso parmesano de lata (usa Parmigiano Reggiano auténtico)`,
    keyPoints: [
      'La cocina italiana valora la simplicidad y los ingredientes frescos',
      'Cada región italiana tiene sus propias tradiciones culinarias',
      'El orden de los platos es una tradición importante',
      'Menos ingredientes = más sabor auténtico'
    ]
  }, 20, 1);

  await createLesson('coc-1-2', cocM1.id, 'Ingredientes Básicos Italianos', 'quiz', {
    questions: [
      {
        question: '¿Cuál es la base de prácticamente TODA la cocina italiana?',
        options: [
          'La mantequilla',
          'El aceite de oliva extra virgen',
          'La crema de leche',
          'El vinagre balsámico'
        ],
        correctIndex: 1,
        explanation: 'El aceite de oliva extra virgen (EVOO) es el pilar fundamental. Se usa para aliñar, cocinar a fuego medio, en salsas y para terminar platos. La calidad varía enormemente: busca "extra virgen" de una sola origen.'
      },
      {
        question: '¿Qué tipo de tomate es el más valorado para salsas en Italia?',
        options: [
          'Tomate cherry',
          'Tomate pera (Roma)',
          'Tomate San Marzano',
          'Tomate verde'
        ],
        correctIndex: 2,
        explanation: 'El tomate San Marzano (de la región de Nápoles) es considerado el mejor tomate del mundo para cocinar. Es alargado, menos ácido, con pocas semillas y más dulce. En latas es la mejor opción fuera de temporada.'
      },
      {
        question: '¿Qué queso italiano se usa en una auténtica Carbonara?',
        options: [
          'Mozzarella',
          'Parmesano (Parmigiano Reggiano)',
          'Pecorino Romano',
          'Ricotta'
        ],
        correctIndex: 2,
        explanation: 'La Carbonara usa Pecorino Romano (hecho de leche de oveja), no Parmesano. El Pecorino tiene un sabor más fuerte y salado que complementa perfectamente el guanciale y el huevo.'
      },
      {
        question: '¿Qué es el "soffritto" en la cocina italiana?',
        options: [
          'Un postre de crema',
          'La base aromática de cebolla, zanahoria y apio picada finamente',
          'Un tipo de pasta',
          'Una bebida alcohólica'
        ],
        correctIndex: 1,
        explanation: 'El soffritto (o "holy trinity" italiana) es cebolla + zanahoria + apio picados muy finamente y sofreídos lentamente en aceite de oliva. Es la base de ragús, sopas, guisos y muchos platos italianos.'
      }
    ]
  }, 25, 2);

  await createLesson('coc-1-3', cocM1.id, 'Técnicas Básicas de Cocina Italiana', 'quiz', {
    questions: [
      {
        question: '¿Qué significa "al dente" cuando se refiere a la pasta?',
        options: [
          'Cocida hasta que esté muy suave',
          'Cocida con un punto firme al centro, ligeramente resistente al morder',
          'Cocida solo 1 minuto',
          'Cruda por dentro'
        ],
        correctIndex: 1,
        explanation: 'Al dente significa "al diente" en italiano. La pasta debe tener una ligera resistencia al centro al morderla. Esto garantiza textura y permite que la pasta absorba la salsa mejor. Cocinar 1-2 minutos MENOS de lo que indica el paquete.'
      },
      {
        question: '¿Cuál es la temperatura correcta para el agua al cocinar pasta?',
        options: [
          'Tibia (50°C)',
          'Hirviendo a borbotones (100°C)',
          'Temperatura ambiente',
          'Con hielo'
        ],
        correctIndex: 1,
        explanation: 'El agua debe hervir a borbotones (rolling boil, 100°C) ANTES de añadir la pasta. Nunca añadas pasta a agua tibia. El agua debe estar bien salada: "sabe como el mar" — aproximadamente 1 cucharada de sal por litro de agua.'
      },
      {
        question: '¿Cuál es el error más común al hacer risotto?',
        options: [
          'Usar demasiado arroz',
          'Agregar todo el caldo de golpe',
          'Agregar el caldo caliente poco a poco, revolviendo constantemente',
          'Usar cualquier tipo de arroz'
        ],
        correctIndex: 1,
        explanation: 'El error #1 es agregar todo el caldo de golpe. El risotto se cocina AGREGANDO el caldo caliente de a poco, cucharón por cucharón, esperando a que se absorba antes de agregar más, y revolviendo constantemente para liberar el almidón.'
      },
      {
        question: '¿Qué arroz se usa tradicionalmente para risotto italiano?',
        options: [
          'Arroz basmati',
          'Arroz jazmín',
          'Arroz Arborio o Carnaroli',
          'Arroz integral'
        ],
        correctIndex: 2,
        explanation: 'Arborio y Carnaroli son variedades de arroz italiano de grano corto y alto contenido de almidón. Este almidón es lo que crea la cremosidad característica del risotto. El basmati y jazmín NO funcionan.'
      }
    ]
  }, 25, 3);

  // MÓDULO 2: Pasta y Salsas
  const cocM2 = await createModule('coc-mod-2', cocinaCourse.id, 'El Arte de la Pasta y las Salsas', 2);

  await createLesson('coc-2-1', cocM2.id, 'Guía Completa de Pastas Italianas', 'reading', {
    introduction: 'Existen más de 300 formas de pasta en Italia. Cada forma tiene un propósito: ciertas salsas se adhieren mejor a ciertas pastas. Conocer los pares correctos eleva tu cocina.',
    content: `CLASIFICACIÓN DE PASTAS:

POR TIPO DE COCCIÓN:
• Pasta seca (seca): Penne, spaghetti, fusilli, rigatoni
• Pasta fresca (fresca): Tagliatelle, fettuccine, ravioli

POR FORMA Y USO IDEAL:

LARGA (se come con tenedor):
• Spaghetti: Salsas ligeras (carbonara, aglio e olio, amatriciana)
• Fettuccine: Salsas cremosas (alfredo, carbonara)
• Tagliatelle: Ragús de carne (boloñesa)
• Pappardelle: Ragús de caza, salsas ricas

CORTA (se come con cuchara):
• Penne: Salsas con trozos (marinara, arrabbiata)
• Rigatoni: Salsas espesas, al horno
• Fusilli: Pesto, salsas con verduras
• Farfalle: Salsas ligeras, ensaladas de pasta

HOJA ANCHA:
• Lasagna: Para horno, capas con ragús y bechamel
• Orecchiette: Brócoli, salsas ligeras

RELLANA:
• Ravioli: Queso, espinaca, carne
• Tortellini: Caldo, salsas ligeras
• Cannelloni: Relleno de carne, al horno

REGLA DE ORO:
• Pasta con surcos/agujeros → salsas espesas (se adhieren)
• Pasta lisa → salsas ligeras (se deslizan)
• Pasta larga → salsas que se enrollan (se envuelven en el tenedor)
• Pasta corta → salsas con trozos (se capturan en la forma)

CUÁNTA PASTA POR PERSONA:
• Pasta fresca: 100-120g
• Pasta seca: 80-100g (parece poco, pero dobla de tamaño)`,
    keyPoints: [
      'Cada forma de pasta tiene una salsa ideal',
      'Pasta con surcos/agujeros funciona con salsas espesas',
      'Pasta seca: 80-100g por persona, pasta fresca: 100-120g',
      'La pasta al dente se cocina 1-2 minutos menos de lo indicado'
    ]
  }, 20, 1);

  await createLesson('coc-2-2', cocM2.id, 'Salsas Italianas Clásicas', 'reading', {
    introduction: 'Las salsas son el alma de la pasta italiana. Cada una tiene una historia y tradición centenaria. Aprende a hacer las 5 salsas fundamentales.',
    content: `LAS 5 SALSAS FUNDAMENTALES:

1. MARINARA (Salsa de Tomate Básica)
   Ingredientes: tomate San Marzano, ajo, albahaca, aceite de oliva, sal
   Preparación: Sofreír ajo en aceite, agregar tomate aplastado, cocinar 20-30 min, albahaca al final
   Para: spaghetti, penne, cualquier pasta

2. CARBONARA (La reina de Roma)
   Ingredientes: guanciale (o panceta), yema de huevo + huevo entero, pecorino romano, pimienta negra
   PREPARACIÓN:
   - Cortar guanciale en tiras, cocinar hasta dorar (sin aceite addicional)
   - Batir yemas con huevo entero y pecorino rallado
   - Cocinar pasta al dente, reservar 1 taza de agua de cocción
   - FUERA DEL FUEGO: mezclar pasta con guanciale, luego con la mezcla de huevo
   - Agregar agua de cocción para cremosidad
   ⚠️ NUNCA: usar crema de leche (NO es carbonara auténtica)
   ⚠️ NUNCA: agregar aceite de oliva
   ⚠️ NUNCA: cocinar la mezcla de huevo (se hace fuera del fuego)

3. BOLOÑESA (Ragù alla Bolognese)
   Ingredientes: carne molida (mezcla de res y cerdo), cebolla, zanahoria, apio, tomate, vino tinto, leche, nuez moscada
   Preparación: soffritto → carne → vino → tomate → leche → cocinar 2-3 horas a fuego bajo
   Para: tagliatelle (NO spaghetti)

4. PESTO ALLA GENOVESE
   Ingredientes: albahaca fresca, piñones, ajo, pecorino/parmesano, aceite de oliva, sal
   Preparación: todo en mortar (o licuadora pulsando) hasta形成 pasta homogénea
   ⚠️ Nunca calentar el pesto — se agrega a la pasta recién salida del agua

5. AGLIO E OLIO (La más simple)
   Ingredientes: ajo, aceite de oliva, guindilla, perejil, pasta
   Preparación: dorar ajo laminado en abundante aceite (sin quemar), agregar guindilla, mezclar con pasta
   Para: spaghetti, es la cena perfecta de medianoche en Italia`,
    keyPoints: [
      'La Carbonara NO lleva crema — solo huevo, pecorino, guanciale',
      'La boloñesa se cocina 2-3 horas a fuego bajo',
      'El pesto nunca se calienta',
      'Aglio e olio es la cena italiana por excelencia'
    ]
  }, 25, 2);

  await createLesson('coc-2-3', cocM2.id, '🎮 Ejercicio: Combina Pasta y Salsa', 'quiz', {
    questions: [
      {
        question: '¿Con qué salsa tradicional se sirve el Spaghetti alla Carbonara?',
        options: [
          'Marinara de tomate',
          'Alfredo con crema',
          'Huevo, guanciale, pecorino y pimienta (sin crema)',
          'Pesto genovés'
        ],
        correctIndex: 2,
        explanation: 'La Carbonara auténtica es: guanciale + yema de huevo + pecorino romano + pimienta negra. NO lleva crema, NO lleva ajo, NO lleva aceite de oliva. Es pura simplicidad italiana.'
      },
      {
        question: '¿Qué pasta acompaña mejor un ragù boloñés espeso?',
        options: [
          'Spaghetti',
          'Tagliatelle',
          'Farfalle',
          'Orzo'
        ],
        correctIndex: 1,
        explanation: 'Tagliatelle (pasta fresca plana y ancha) es la pasta tradicional con boloñesa en Bolonia. Los surcos de la pasta atrapan el ragù espeso. Spaghetti es demasiado fino para un ragù pesado.'
      },
      {
        question: '¿Cuál es la regla de oro para el pesto genovés?',
        options: [
          'Cocinarlo 30 minutos para desarrollar sabor',
          'Agregarlo a la pasta caliente pero NUNCA calentar el pesto directamente',
          'Servirlo con parmesano y albahaca extra',
          'Congelarlo para mantener la frescura'
        ],
        correctIndex: 1,
        explanation: 'El pesto se prepara crudo (la albahaca se oscurece y pierde sabor al calentarse). Se mezcla con la pasta recién salida del agua, que tiene enough heat para "activar" los aromas sin cocinar el pesto.'
      },
      {
        question: '¿Qué tipo de pasta elegirías para una salsa con trozos de verduras asadas?',
        options: [
          'Espaguetis lisos',
          'Fusilli o penne rigati (con surcos)',
          'Lasagna',
          'Cappellini'
        ],
        correctIndex: 1,
        explanation: 'Los fusilli (espiral) y penne rigati (con surcos) son ideales para salsas con trozos: las espirales y surcos atrapan los pedazos de verdura y la salsa. La pasta lisa no retiene bien los trozos.'
      }
    ]
  }, 30, 3);

  await createLesson('coc-2-4', cocM2.id, 'Cómo Hacer Pasta Fresca en Casa', 'reading', {
    introduction: 'Hacer pasta fresca en casa es una de las experiencias culinarias más gratificantes. Solo necesitas 2 ingredientes: harina y huevos. El resultado es incomparablemente superior a la pasta industrial.',
    content: `RECETA BÁSICA: PASTA FRESCA (para 4 personas)

INGREDIENTES:
• 400g de harina de tipo "00" (o harina de trigo común)
• 4 huevos grandes (uno extra si la masa está seca)
• 1 pizca de sal
• 1 cucharadita de aceite de oliva (opcional)

PROCESO PASO A PASO:

1. HACER EL VOLCÁN
   - En una superficie limpia, hacer un volcán con la harina
   - Los huevos van en el centro
   - Agregar sal y aceite

2. MEZCLAR
   - Con un tenedor, batir los huevos gradualmente incorporando la harina
   - Cuando esté demasiado espeso para el tenedor, usar las manos

3. AMASAR (10 minutos)
   - Amasar la masa sobre la superficie
   - Debe quedar suave, elástica y no pegajosa
   - Si está muy seca: mojar las manos
   - Si está muy pegajosa: agregar un poco de harina

4. REPOSAR (30 minutos)
   - Envolver en film plástico
   - Dejar reposar a temperatura ambiente 30 minutos
   - Esto relaja el gluten y facilita el estirado

5. ESTIRAR
   - Dividir en 4 porciones
   - Estirar con rodillo o máquina de pasta
   - Grosor deseado: 1-2mm para tagliatelle, más grueso para ravioli

6. CORTAR
   - Tagliatelle: enrollar la masa y cortar tiras de 8-10mm
   - Fettuccine: tiras de 6-7mm
   - Pappardelle: tiras de 2-3cm
   - Ravioli: cortar cuadrados, rellenar, sellar

COCCIÓN:
• Agregar a agua hirviendo con MUCHA sal
• Cocinar solo 2-3 minutos (la fresca se cocina rápido)
• Probar antes de escurrir — debe estar al dente

CONSERVACIÓN:
• Fresca: usar el mismo día (mejor resultado)
• Secar: colgar 24 horas en ambiente seco
• Congelar: poner en bandeja con harina, congelar, luego guardar en bolsa (dura 3 meses)`,
    keyPoints: [
      'Solo necesitas harina y huevos para pasta fresca',
      'Amasa 10 minutos para desarrollar el gluten',
      'La pasta fresca se cocina solo 2-3 minutos',
      'Reposar la masa 30 minutos es esencial para facilitar el estirado'
    ]
  }, 30, 4);

  // MÓDULO 3: Platos Principales y Postres
  const cocM3 = await createModule('coc-mod-3', cocinaCourse.id, 'Platos Principales Icónicos de Italia', 3);

  await createLesson('coc-3-1', cocM3.id, 'Los 5 Platos Más Famosos de Italia', 'reading', {
    introduction: 'De norte a sur, Italia tiene platos icónicos que han conquistado el mundo. Cada uno cuenta la historia de su región.',
    content: `1. RISOTTO ALLA MILANESE (Milán, Norte)
   El risotto cremoso con azafrán es el plato insignia de Milán.
   • Arroz Arborio/Carnaroli
   • Caldo caliente (pollo o verduras)
   • Azafrán (el ingrediente estrella — da color y sabor único)
   • Mantequilla y Parmigiano al final (mantecatura)
   Técnica clave: agregar caldo poco a poco, revolver constantemente

2. PIZZA MARGHERITA (Nápoles, Sur)
   Creada en 1889 en honor a la Reina Margherita, con los colores de la bandera italiana:
   • Salsa de tomate San Marzano (rojo)
   • Mozzarella di Bufala (blanco)
   • Albahaca fresca (verde)
   • Aceite de oliva
   Secreto: horno a máxima temperatura (250-300°C), masa fermentada 24-72 horas

3. LASAGNA ALLA BOLOGNESE (Bolonia, Centro)
   Capas de:
   • Lasagna (láminas de pasta)
   • Ragù boloñese (cocinado 3 horas)
   • Bechamel (mantequilla + harina + leche)
   • Parmigiano rallado
   Secreto: las capas finas y la cocción lenta

4. OSSOBUCO ALLA MILANESE (Milán)
   • Jarrete de ternera cocinado lentamente en vino blanco
   • Con gremolata (limón, ajo, perejil)
   • Servido con risotto
   El tuétano del hueso es la parte más codiciada

5. TIRAMISÚ (Veneto)
   El postre italiano más famoso del mundo:
   • Bizcochos de soletilla empapados en café espresso
   • Crema de mascarpone + yemas de huevo + azúcar
   • Cacao amargo en polvo
   Secreto: reposar mínimo 4 horas (mejor toda la noche) en el refrigerador`,
    keyPoints: [
      'Cada plato italiano icónico viene de una región específica',
      'La paciencia es clave: ragù se cocina 3 horas, tiramisú necesita reposar',
      'La Margherita es perfecta por su simplicidad: solo 4 ingredientes',
      'El risotto requiere atención constante y caldo caliente poco a poco'
    ]
  }, 25, 1);

  await createLesson('coc-3-2', cocM3.id, 'Recetas Clásicas: Ingredientes y Pasos', 'quiz', {
    questions: [
      {
        question: '¿Qué le da al risotto alla milanese su color dorado característico?',
        options: [
          'Azafrán',
          'Curcuma',
          'Mantequilla',
          'Tomate'
        ],
        correctIndex: 0,
        explanation: 'El azafrán (zafferano en italiano) es una especia extremadamente valiosa hecha de los estigmas del azafrán. Solo unas hebras dan al risotto su color dorado intenso y un sabor terroso, ligeramente dulce y floral.'
      },
      {
        question: '¿Cuántas capas tiene típicamente una lasagna boloñesa?',
        options: [
          '2-3 capas',
          '5-7 capas',
          '10-15 capas',
          'Solo 1 capa'
        ],
        correctIndex: 1,
        explanation: 'Una lasagna típica tiene 5-7 capas alternando: pasta-ragù-bechamel-queso. Demasiadas capas dificultan el horneado y la proporción no es ideal. Lo importante es que cada capa sea fina y uniforme.'
      },
      {
        question: '¿Por qué se llama "Margherita" a la pizza clásica de Nápoles?',
        options: [
          'Por la forma redonda como una margarita',
          'En honor a la Reina Margherita de Saboya',
          'Por el ingrediente principal: la margarita de jardín',
          'Porque se come en primavera'
        ],
        correctIndex: 1,
        explanation: 'La pizza fue creada en 1889 por el pizzero Raffaele Esposito en Nápoles en honor a la Reina Margherita de Saboya. Los colores de la pizza (rojo, blanco, verde) representan la bandera italiana.'
      },
      {
        question: '¿Qué es la "mantecatura" en un risotto?',
        options: [
          'Agregar mantequilla y queso al final para cremosidad',
          'Cocinar el arroz en mantequilla desde el inicio',
          'Agregar leche al risotto',
          'Servir el risotto con pan'
        ],
        correctIndex: 0,
        explanation: 'La mantecatura es la técnica final: fuera del fuego, se agregan mantequilla fría y Parmigiano rallado, y se agita vigorosamente. Esto crea la cremosidad sedosa característica del risotto. Es el paso que diferencia un buen risotto de uno excepcional.'
      }
    ]
  }, 30, 2);

  await createLesson('coc-3-3', cocM3.id, 'Postres Italianos: Tiramisú y Panna Cotta', 'reading', {
    introduction: 'Los postres italianos son elegantemente simples. No necesitan decorationes elaboradas — su sabor habla por sí solo.',
    content: `TIRAMISÚ — EL REY DE LOS POSTRES ITALIANOS

Nombre literal: "levántame" o "empújame hacia arriba" — por el efecto energizante del café

INGREDIENTES (6-8 porciones):
• 6 yemas de huevo
• 150g de azúcar
• 500g de mascarpone
• 300ml de nata (crema para montar)
• 300ml de café espresso frío
• 200g de bizcochos de soletilla (savoiardi)
• Cacao amargo en polvo

PREPARACIÓN:
1. Montar las yemas con el azúcar hasta obtener una crema pálida y espumosa
2. Agregar el mascarpone y mezclar suavemente hasta integrar
3. Montar la nata aparte y incorporar a la mezcla con movimientos envolventes
4. Preparar el café espresso y dejar enfriar
5. Mojar rápidamente cada bizcocho en el café (no empapar — solo 1 segundo por lado)
6. Formar capas: bizcochos → crema → bizcochos → crema
7. Espolvorear cacao amargo por encima
8. REFRIGERAR MÍNIMO 4 HORAS (ideal: toda la noche)

ERRORES COMUNES:
❌ Empapar demasiado los bizcochos (se deshacen)
❌ Usar café frío sin sabor (usa espresso de calidad)
❌ No refrigerar suficiente tiempo
❌ Usar queso crema en lugar de mascarpone (son diferentes)

PANNA COTTA — "CREMA COCIDA"

INGREDIENTES:
• 500ml de nata (crema de leche)
• 100g de azúcar
• 1 sobre de gelatina en hojas (o 7g en polvo)
• 1 vaina de vainilla
• Frutas frescas para servir

PREPARACIÓN:
1. Hidratar la gelatina en agua fría 5 minutos
2. Calentar la nata con azúcar y vainilla (sin hervir)
3. Escurrir la gelatina y agregar a la nata caliente, mezclar hasta disolver
4. Verter en moldes
5. Refrigerar mínimo 6 horas
6. Desmoldar pasando el molde por agua caliente 3 segundos
7. Servir con frutas frescas, coulis de frambuesa o chocolate`,
    keyPoints: [
      'El tiramisú necesita refrigerarse mínimo 4 horas para que los sabores se fusionen',
      'El mascarpone NO es lo mismo que queso crema',
      'La panna cotta es extremadamente simple: nata + azúcar + gelatina',
      'Ambos postres son perfectos para preparar con antelación'
    ]
  }, 25, 3);

  await createLesson('coc-3-4', cocM3.id, '🚀 Mini-Proyecto: Diseña tu Menú Italiano', 'project', {
    title: 'Crea tu Menú Italiano Completo',
    description: 'Diseña y planifica un menú italiano tradicional completo para 4 personas, desde el aperitivo hasta el postre.',
    objectives: [
      'Aplicar el conocimiento de platos italianos por regiones',
      'Planificar tiempos de cocción y preparación',
      'Combinar sabores y texturas armoniosamente'
    ],
    requirements: [
      'Incluir al menos: 1 aperitivo, 1 primo (pasta), 1 secondo (carne/pescado), 1 dolce (postre)',
      'Especificar ingredientes exactos y cantidades',
      'Incluir tiempos de preparación y cocción',
      'Asegurar que los tiempos sean compatibles (¿qué se puede preparar con antelación?)',
      'Incluir al menos 1 plato que uses técnica de pasta fresca o salsa casera'
    ],
    exampleCode: `// Ejemplo de planificación de menú
const menuItaliano = {
  aperitivo: {
    plato: "Bruschetta al Pomodoro",
    tiempo: "10 min",
    preparar_con_antelacion: true,
    ingredientes: ["pan ciabatta", "tomates cherry", "albahaca", "aceite de oliva", "ajo"]
  },
  primo: {
    plato: "Penne all'Arrabbiata",
    tiempo: "25 min",
    notas: "Salsa picante con tomate. Cocinar pasta al dente."
  },
  secondo: {
    plato: "Pollo al Limone",
    tiempo: "35 min",
    notas: "Pollo con salsa de limón, alcaparras y mantequilla"
  },
  contorno: {
    plato: "Insalata Mista",
    tiempo: "5 min",
    notas: "Lechuga, tomate, pepino, vinagreta de limón"
  },
  dolce: {
    plato: "Panna Cotta con Frutos Rojos",
    tiempo: "15 min + 6h refrigeración",
    preparar_con_antelacion: "SÍ — hacer la noche anterior"
  }
};

// Tip: empezar por el postre (necesita más tiempo de reposo)
// y terminar con el aperitivo (se prepara rápido)`,
    tips: ['El tiramisú y panna cotta se preparan el día anterior', 'Empieza la pasta cuando el secondo esté casi listo', 'El aperitivo se prepara en los últimos 10 minutos']
  }, 60, 4);

  console.log('✅ Cocina Italiana Tradicional completed (3 modules, 11 lessons)');

  // ===========================================
  // ENROLLMENTS AND PROGRESS FOR DEMO USER
  // ===========================================
  const demo = await prisma.user.findUnique({ where: { email: 'demo@duobijac.com' } });

  const enrollments = [
    { courseId: 'course-ai-fundamentals' },
    { courseId: 'course-finanzas-personales' },
    { courseId: 'course-cocina-italiana' },
  ];

  for (const enrollment of enrollments) {
    const course = await prisma.course.findUnique({ where: { id: enrollment.courseId } });
    if (course && demo) {
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId: demo.id, courseId: course.id } },
        update: {},
        create: { userId: demo.id, courseId: course.id },
      });
    }
  }

  // Add some progress for the demo user
  if (demo) {
    const firstLessons = ['ai-1-1', 'fin-1-1', 'coc-1-1'];
    for (const lessonId of firstLessons) {
      const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
      if (lesson) {
        await prisma.lessonProgress.upsert({
          where: { userId_lessonId: { userId: demo.id, lessonId } },
          update: {},
          create: {
            userId: demo.id,
            lessonId,
            completed: true,
            score: Math.floor(Math.random() * 20) + 80, // 80-100
            xpEarned: lesson.xpReward,
            timeSpent: Math.floor(Math.random() * 120) + 60, // 60-180 seconds
            attempts: 1,
            completedAt: new Date(),
          },
        });
      }
    }
  }

  console.log('✅ Demo enrollments and progress created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📚 Courses Summary:');
  console.log('   🤖 Fundamentos de IA: 5 modules, 13 lessons (reading, quiz, coding, project)');
  console.log('   💰 Finanzas Personales: 4 modules, 9 lessons (reading, quiz, coding, project)');
  console.log('   🍝 Cocina Italiana: 3 modules, 11 lessons (reading, quiz, project)');
  console.log('\n📝 Test accounts:');
  console.log('   Admin: admin@duobijac.com / admin123');
  console.log('   Demo: demo@duobijac.com / demo123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
