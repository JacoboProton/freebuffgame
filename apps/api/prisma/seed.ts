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
    'Domina la Inteligencia Artificial de principio a fin: fundamentos, machine learning, redes neuronales, ética, NLP, Computer Vision, herramientas prácticas y despliegue en producción.',
    'Inteligencia Artificial',
    'beginner',
    18,
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

  // MÓDULO 6: Procesamiento de Lenguaje Natural (NLP)
  const aiM6 = await createModule('ai-mod-6', aiCourse.id, 'Procesamiento de Lenguaje Natural (NLP)', 6);

  await createLesson('ai-6-1', aiM6.id, 'NLP: Enseñándole a las Máquinas a Entender el Lenguaje', 'reading', {
    introduction: 'El Procesamiento de Lenguaje Natural (NLP) es la rama de la IA que permite a las máquinas leer, comprender y generar texto y voz humana. Es lo que hace posible a ChatGPT, los traductores automáticos y los asistentes de voz.',
    content: `¿QUÉ ES EL NLP?

NLP combina lingüística computacional y machine learning para que las computadoras procesen el lenguaje humano. El lenguaje natural es ambiguo, contextual y lleno de matices — hacer que una máquina lo entienda es uno de los mayores desafíos de la IA.

TAREAS FUNDAMENTALES DE NLP:

1. TOKENIZACIÓN
   Dividir texto en unidades más pequeñas (tokens).
   Ej: "La IA cambia el mundo" → ["La", "IA", "cambia", "el", "mundo"]
   Subword tokenization (BPE): "inteligencia" → ["inteli", "gencia"]

2. ANÁLISIS DE SENTIMIENTO
   Determinar si un texto es positivo, negativo o neutral.
   Ejemplo: "¡Me encanta este producto!" → Positivo (0.95)
            "Es horrible, no lo recomiendo" → Negativo (0.89)
   Aplicaciones: reseñas de productos, redes sociales, atención al cliente

3. CLASIFICACIÓN DE TEXTO
   Asignar categorías a documentos.
   Ejemplo: Clasificar emails en spam/no spam, categorizar noticias

4. RESPUESTA A PREGUNTAS (QA)
   Extraer respuestas de un contexto dado.
   Ejemplo: Contexto + pregunta → respuesta precisa
   Base de sistemas como FAQ bots y recherche en documentos

5. TRADUCCIÓN AUTOMÁTICA
   Traducir texto de un idioma a otro.
   Evolución: reglas → estadístico → neural → Transformer
   Google Translate usa modelos Transformer con atención

6. RESUMEN AUTOMÁTICO
   Generar un resumen conciso de un texto largo.
   Extractivo: selecciona frases clave del original
   Abstractivo: genera nuevas frases que capturan la idea

7. GENERACIÓN DE TEXTO
   Crear texto nuevo que sea coherente y relevante.
   GPT, Claude, LLaMA: modelos autoregresivos que predicen la siguiente palabra
   Aplicaciones: chatbots, creación de contenido, programación

LOS TRANSFORMERS REVOLUCIONARON EL NLP:

Antes de Transformers (2017):
• RNN/LSTM procesaban texto secuencialmente (lento)
• Olvidaban información de contextos largos
• Difíciles de paralelizar

Después de Transformers:
• Procesan todo el texto simultáneamente (paralelo)
• Mecanismo de atención: entiende relaciones entre palabras
  sin importar la distancia
• Escalan con datos masivos (scaling laws)

EVOLUCIÓN DE LOS LLMs:
• GPT-1 (2018): 117M parámetros
• GPT-2 (2019): 1.5B parámetros
• GPT-3 (2020): 175B parámetros
• GPT-4 (2023): ~1.8T parámetros (estimado)
• LLaMA (2023): Modelos open-source de Meta
• Claude (2023-): Modelo de Anthropic enfocado en seguridad`,
    keyPoints: [
      'NLP permite a las máquinas entender, generar y traducir lenguaje humano',
      'Los Transformers revolucionaron el NLP con el mecanismo de atención',
      'Los LLMs son modelos de lenguaje masivos que generan texto coherente',
      'Las aplicaciones de NLP van desde chatbots hasta análisis de sentimiento'
    ]
  }, 25, 1);

  await createLesson('ai-6-2', aiM6.id, 'Aplicaciones y Desafíos del NLP', 'quiz', {
    questions: [
      {
        question: '¿Qué es la "tokenización" en NLP?',
        options: [
          'Crear tokens de criptomonedas',
          'Dividir texto en unidades más pequeñas (palabras o subpalabras) para procesarlo',
          'Encriptar un mensaje',
          'Traducir texto a otro idioma'
        ],
        correctIndex: 1,
        explanation: 'La tokenización es el primer paso en NLP: dividir el texto en tokens (palabras, subpalabras o caracteres). Los modelos como GPT usan BPE (Byte Pair Encoding) que divide palabras en subpalabras frecuentes para manejar vocabulario eficientemente.'
      },
      {
        question: '¿Qué es el "análisis de sentimiento" y dónde se usa?',
        options: [
          'Analizar la gramática de un texto',
          'Determinar la emoción o actitud expresada en un texto (positivo/negativo/neutral)',
          'Traducir texto a otros idiomas',
          'Resumir textos largos'
        ],
        correctIndex: 1,
        explanation: 'El análisis de sentimiento clasifica el tono emocional de un texto. Se usa masivamente en redes sociales (monitorear opiniones sobre marcas), reseñas de productos, y atención al cliente para detectar quejas automáticamente.'
      },
      {
        question: '¿Por qué los Transformers son superiores a las RNNs para NLP?',
        options: [
          'Usan menos memoria',
          'Procesan texto en paralelo y capturan dependencias largas con atención',
          'Son más simples de programar',
          'No necesitan datos de entrenamiento'
        ],
        correctIndex: 1,
        explanation: 'Los Transformers procesan toda la secuencia simultáneamente (paralelo) usando self-attention, mientras que las RNNs procesan secuencialmente. Esto permite que los Transformers capturen relaciones entre palabras lejanas y entrenen mucho más rápido.'
      },
      {
        question: '¿Qué diferencia hay entre resumen extractivo y abstractivo?',
        options: [
          'No hay diferencia',
          'Extractivo selecciona frases del original; abstractivo genera nuevas frases',
          'Extractivo es más preciso, abstractivo es más rápido',
          'Extractivo usa IA, abstractivo no'
        ],
        correctIndex: 1,
        explanation: 'El extractivo copia las frases más importantes del texto original. El abstractivo "entiende" el contenido y genera un resumen nuevo con sus propias palabras, como haría un humano. Los LLMs modernos hacen resumen abstractivo.'
      },
      {
        question: '¿Cuál es el desafío principal de la "ambigüedad" en NLP?',
        options: [
          'El texto siempre es claro',
          'Las palabras y frases pueden tener múltiples significados según el contexto',
          'Los computadores no pueden leer texto',
          'El NLP solo funciona en inglés'
        ],
        correctIndex: 1,
        explanation: 'La ambigüedad es uno de los mayores desafíos: "bank" puede ser banco (institución) o orilla (río). "Banco sentado en el parque" — ¿es una institución o una persona? El contexto resuelve la ambigüedad, y los Transformers lo hacen bien.'
      }
    ]
  }, 30, 2);

  await createLesson('ai-6-3', aiM6.id, 'Ejercicio: Análisis de Sentimiento con JavaScript', 'coding', {
    instructions: 'Implementa un sistema básico de análisis de sentimiento para entender cómo la IA procesa el lenguaje:',
    exercise: {
      task: 'Crea un analizador de sentimiento paso a paso',
      challenges: [
        {
          id: 'nlp-sent-1',
          description: 'Crea un diccionario de palabras con scores de sentimiento (positivas y negativas)',
          initialCode: '// Crea un diccionario con palabras y sus scores\n// Positivas: 1, Negativas: -1\nconst sentimientos = {\n  // Agrega al menos 5 positivas y 5 negativas\n};\n',
          hint: 'Ejemplo: "genial": 1, "horrible": -1, "bueno": 0.8',
          solution: 'const sentimientos = {\n  genial: 1, excelente: 1, amor: 1, feliz: 1, bueno: 0.8,\n  horrible: -1, terrible: -1, odio: -1, triste: -1, malo: -0.8\n};'
        },
        {
          id: 'nlp-sent-2',
          description: 'Escribe una función que analice un texto y calcule el sentimiento promedio',
          initialCode: 'function analizarSentimiento(texto, sentimientos) {\n  const palabras = texto.toLowerCase().split(/\\s+/);\n  // Calcula el score promedio de todas las palabras conocidas\n  // Retorna: { score, positivas, negativas, total }\n}',
          hint: 'Busca cada palabra en el diccionario, promedia los scores encontrados',
          solution: 'function analizarSentimiento(texto, sentimientos) {\n  const palabras = texto.toLowerCase().split(/\\s+/);\n  let positivas = 0, negativas = 0, totalScore = 0, conocidas = 0;\n  for (const p of palabras) {\n    if (sentimientos[p] !== undefined) {\n      totalScore += sentimientos[p];\n      conocidas++;\n      if (sentimientos[p] > 0) positivas++;\n      if (sentimientos[p] < 0) negativas++;\n    }\n  }\n  const score = conocidas > 0 ? totalScore / conocidas : 0;\n  return { score: Math.round(score * 100) / 100, positivas, negativas, total: conocidas };\n}'
        },
        {
          id: 'nlp-sent-3',
          description: 'Prueba tu analizador con 3 frases y clasifícalas como positiva, negativa o neutral',
          initialCode: '// Prueba con estas frases:\n// 1. "Me encanta este producto, es excelente"\n// 2. "Esto es horrible y terrible"\n// 3. "El gato está en la mesa"\n\nfunction clasificar(score) {\n  // Retorna "positivo", "negativo" o "neutral" según el score\n}',
          hint: 'Score > 0.1 = positivo, < -0.1 = negativo, resto = neutral',
          solution: 'function clasificar(score) {\n  if (score > 0.1) return "positivo";\n  if (score < -0.1) return "negativo";\n  return "neutral";\n}'
        }
      ]
    }
  }, 50, 3);

  // MÓDULO 7: Computer Vision
  const aiM7 = await createModule('ai-mod-7', aiCourse.id, 'Computer Vision: La IA que Ve el Mundo', 7);

  await createLesson('ai-7-1', aiM7.id, 'Computer Vision: Cómo las Máquinas "Ven"', 'reading', {
    introduction: 'Computer Vision (CV) es la rama de la IA que permite a las computadoras interpretar y comprender imágenes y videos. Desde el reconocimiento facial hasta los coches autónomos, CV está transformando nuestra interacción con el mundo visual.',
    content: `¿QUÉ ES COMPUTER VISION?

Computer Vision busca replicar la capacidad del ojo y cerebro humano para procesar información visual. Las máquinas "ven" como matrices de números (píxeles), no como nosotros.

CÓMO FUNCIONA UNA IMAGEN PARA UNA COMPUTADORA:
• Imagen en blanco y negro: matriz 2D de valores 0-255
  [0 = negro, 255 = blanco]
• Imagen a color: 3 canales (RGB) — cada píxel tiene 3 valores
  [R: 255, G: 0, B: 0] = rojo puro
• Una foto 1920x1080 = 2,073,600 píxeles × 3 canales = 6,220,800 valores

TAREAS PRINCIPALES DE COMPUTER VISION:

1. CLASIFICACIÓN DE IMÁGENES
   ¿Qué hay en esta imagen? (perro, gato, auto, persona)
   Redes CNN: detectan bordes → texturas → patrones → objetos
   Ejemplo: Medical imaging — detectar tumores en radiografías

2. DETECCIÓN DE OBJETOS
   ¿Qué hay y DÓNDE está? (bounding boxes)
   Modelos: YOLO, SSD, Faster R-CNN
   Aplicaciones: conducción autónoma, vigilancia, retail

3. SEGMENTACIÓN
   Clasificar CADA píxel de la imagen
   Semántica: todos los "cielo" en azul, todas las "personas" en rojo
   Instancia: cada persona individual tiene su color
   Aplicaciones:自动驾驶, edición de imágenes, medicina

4. RECONOCIMIENTO FACIAL
   Identificar o verificar quién es una persona
   Passo 1: detectar cara (bounding box)
   Passo 2: extraer features ("face embedding")
   Passo 3: comparar con base de datos
   Aplicaciones: desbloqueo de celular, aeropuertos, tag en fotos

5. ESTIMACIÓN DE POSE
   Detectar puntos clave del cuerpo (articulaciones)
   17-33 puntos: hombros, codos, muñecas, caderas, rodillas...
   Aplicaciones: deportes, fitness, control de gestos, realidad aumentada

6. GENERACIÓN DE IMÁGENES
   Crear imágenes nuevas que no existen
   DALL-E, Midjourney, Stable Diffusion: difusión latent
   Proceso: ruido →逐步 denoising → imagen coherente

APLICACIONES REALES:
• Conducción autónoma: detectar peatones, señales, otros autos
• Medicina: detectar cáncer en mamografías, retinografía, patología
• Agricultura: monitorear cultivos con drones, detectar plagas
• Retail: cajas sin checkout (Amazon Go), análisis de tráfico
• Arte: style transfer, upscaling de imágenes antiguas
• Seguridad: detección de objetos sospechosos, control de acceso`,
    keyPoints: [
      'Las computadoras ven imágenes como matrices de números (píxeles RGB)',
      'Las CNNs son la base de la mayoría de sistemas de Computer Vision',
      'Tareas clave: clasificación, detección, segmentación, reconocimiento facial',
      'CV tiene aplicaciones en medicina, autonomía, agricultura y más'
    ]
  }, 25, 1);

  await createLesson('ai-7-2', aiM7.id, 'Aplicaciones y Tecnologías de CV', 'quiz', {
    questions: [
      {
        question: '¿Cómo "ve" una computadora una imagen?',
        options: [
          'Igual que los humanos, con ojos',
          'Como una matriz de números donde cada píxel tiene valores RGB (0-255)',
          'Como un archivo de texto con descripciones',
          'Como una secuencia de sonidos'
        ],
        correctIndex: 1,
        explanation: 'Una imagen digital es una matriz de píxeles. En color, cada píxel tiene 3 valores (Red, Green, Blue) de 0-255. Una foto de 1920x1080 es literalmente 6+ millones de números que la computadora procesa matemáticamente.'
      },
      {
        question: '¿Qué diferencia hay entre "detección de objetos" y "segmentación"?',
        options: [
          'Son lo mismo',
          'Detección pone bounding boxes; segmentación clasifica cada píxel individual',
          'Detección es para video, segmentación para fotos',
          'Segmentación es más simple que detección'
        ],
        correctIndex: 1,
        explanation: 'La detección dibuja rectángulos (bounding boxes) alrededor de objetos. La segmentación es más precisa: asigna una etiqueta a CADA píxel de la imagen, creando "máscaras" que siguen el contorno exacto del objeto.'
      },
      {
        question: '¿Cómo funciona el reconocimiento facial paso a paso?',
        options: [
          'Compara fotos directamente pixel por pixel',
          'Detecta la cara, extrae un "embedding" numérico y lo compara con una base de datos',
          'Lee el nombre de la persona en la imagen',
          'Usa reconocimiento de voz junto con la imagen'
        ],
        correctIndex: 1,
        explanation: 'El proceso es: 1) Detectar dónde está la cara (bounding box), 2) Normalizar y extraer un "face embedding" (vector numérico de 128-512 dimensiones que representa la cara), 3) Comparar con embeddings almacenados usando distancia euclidiana.'
      },
      {
        question: '¿Qué tipo de red neuronal es la estándar para procesamiento de imágenes?',
        options: [
          'Red Recurrente (RNN)',
          'Red Convolucional (CNN)',
          'Red Generativa Antagónica (GAN)',
          'Autoencoder'
        ],
        correctIndex: 1,
        explanation: 'Las CNNs (Convolutional Neural Networks) son la arquitectura estándar para imágenes. Usan filtros convolucionales que se deslizan sobre la imagen detectando patrones jerárquicos: bordes → texturas → formas → objetos completos.'
      },
      {
        question: '¿En qué领域的medicina se usa Computer Vision para detectar enfermedades?',
        options: [
          'Solo en cirugías robóticas',
          'En radiología, patología, dermatología y oftalmología para detectar anomalías',
          'Solo para medir la presión arterial',
          'No se usa en medicina'
        ],
        correctIndex: 1,
        explanation: 'CV revoluciona la medicina: detecta tumores en mamografías, analiza radiografías de pulmón, identifica lesiones en piel, revisa imágenes de retina para diabetes, y analiza biopsias patológicas. A veces supera la precisión de radiólogos humanos.'
      }
    ]
  }, 30, 2);

  await createLesson('ai-7-3', aiM7.id, '🚀 Mini-Proyecto: Análisis de Imágenes con IA', 'project', {
    title: 'Explora Computer Vision con Herramientas Reales',
    description: 'Usa APIs y herramientas de Computer Vision para analizar imágenes y entender cómo la IA interpreta el mundo visual.',
    objectives: [
      'Comprender cómo las CNNs procesan imágenes',
      'Usar APIs de Computer Vision reales',
      'Evaluar la precisión y limitaciones de los sistemas de CV'
    ],
    requirements: [
      'Usa Google Vision API o similar para clasificar 5 imágenes diferentes',
      'Compara los resultados entre imágenes de buena y mala calidad',
      'Documenta: ¿qué acierta la IA? ¿Qué errores comete?',
      'Investiga un caso de uso de CV en tu campo de interés',
      'Evalúa las implicaciones éticas (privacidad, sesgo en reconocimiento facial)'
    ],
    exampleCode: `// Ejemplo: Usando la API de Google Vision (pseudocódigo)

// 1. Clasificar una imagen
const resultado = await visionAPI.classify(imagenUrl);
// → [{ label: "golden retriever", score: 0.94 },
//    { label: "dog", score: 0.91 },
//    { label: "animal", score: 0.88 }]

// 2. Detectar objetos con bounding boxes
const objetos = await visionAPI.detect(imagenUrl);
// → [{ label: "person", bbox: [x,y,w,h], score: 0.96 },
//    { label: "car", bbox: [x,y,w,h], score: 0.89 }]

// 3. Análisis de sentimiento en rostros
const rostros = await visionAPI.faceDetect(imagenUrl);
// → [{ joy: 0.9, sorrow: 0.02, anger: 0.01, surprise: 0.3 }]

// Preguntas de reflexión:
// 1. ¿La IA detectó correctamente todos los objetos?
// 2. ¿Qué tipo de imagen confunde más a la IA?
// 3. ¿Cuáles son los riesgos del reconocimiento facial masivo?`,
    tips: ['Prueba con imágenes difíciles: oscuras, borrosas, multitudinarias', 'Compara resultados entre APIs diferentes', 'Piensa siempre en la ética: ¿debería la IA identificar personas sin consentimiento?']
  }, 50, 3);

  // MÓDULO 8: IA en Producción y el Futuro
  const aiM8 = await createModule('ai-mod-8', aiCourse.id, 'IA en Producción: Del Laboratorio al Mundo Real', 8);

  await createLesson('ai-8-1', aiM8.id, 'MLOps: Cómo se Despliega la IA en Producción', 'reading', {
    introduction: 'Entrenar un modelo es solo el 20% del trabajo. MLOps (Machine Learning Operations) es el conjunto de prácticas para desplegar, monitorear y mantener modelos de IA en producción de forma confiable.',
    content: `EL CICLO DE VIDA DE UN MODELO DE IA:

1. DEFINIR EL PROBLEMA
   • ¿Qué queremos predecir/clasificar/generar?
   • ¿Cuáles son las métricas de éxito?
   • ¿Tenemos los datos necesarios?

2. RECOPILAR Y PREPARAR DATOS
   • Limpiar datos faltantes, duplicados, errores
   • Balancear clases (si hay desbalanceo)
   • Dividir: entrenamiento (70%), validación (15%), test (15%)
   • Ingeniería de features: crear variables útiles

3. ENTRENAR EL MODELO
   • Seleccionar arquitectura/algoritmo
   • Entrenar con datos de entrenamiento
   • Evaluar con datos de validación
   • Ajustar hiperparámetros (grid search, random search)

4. EVALUAR Y VALIDAR
   • Métricas de clasificación: Accuracy, Precision, Recall, F1
   • Métricas de regresión: MSE, MAE, R²
   • Validación cruzada (k-fold)
   • Análisis de errores: ¿dónde falla el modelo?

5. DESPLEGAR EN PRODUCCIÓN
   • Model serving: API REST, batch predictions, edge
   • Frameworks: TensorFlow Serving, TorchServe, ONNX Runtime
   • Containers: Docker + Kubernetes
   • Cloud: AWS SageMaker, GCP Vertex AI, Azure ML

6. MONITOREAR Y MANTENER
   • Data drift: ¿los datos de producción cambian?
   • Model drift: ¿el modelo decae en rendimiento?
   • Retraining automático cuando el rendimiento baja
   • A/B testing: comparar versiones del modelo

MÉTRICAS CLAVE DE EVALUACIÓN:

EXACTITUD (Accuracy):
Porcentaje de predicciones correctas.
Ej: 95/100 correctas = 95% accuracy
⚠️ Engañosa con datos desbalanceados

PRECISIÓN (Precision):
De todos los que predije como positivos, ¿cuántos realmente lo son?
Ej: 90 de 100 spam detectado realmente era spam → 90%

RECUPERACIÓN (Recall):
De todos los positivos reales, ¿cuántos detecté?
Ej: 90 de 120 spams totales detecté → 75%

F1-SCORE:
Media armónica de precisión y recall. Balance entre ambos.
F1 = 2 × (Precision × Recall) / (Precision + Recall)

EL PROBLEMA DEL DATA DRIFT:
Los datos del mundo real cambian constantemente:
• Patrones de compra cambian con estaciones
• Lenguaje en redes sociales evoluciona
• Imágenes de cámaras cambian con iluminación
Un modelo entrenado en 2023 puede ser inútil en 2025 si no se actualiza.`,
    keyPoints: [
      'Entrenar un modelo es solo el 20% del trabajo; MLOps es clave para producción',
      'El data drift puede degradar modelos que funcionaban bien',
      'Métricas como F1-score son más informativas que accuracy alone',
      'Los modelos necesitan retraining continuo para mantenerse relevantes'
    ]
  }, 25, 1);

  await createLesson('ai-8-2', aiM8.id, 'El Futuro de la IA: Tendencias y Desafíos', 'quiz', {
    questions: [
      {
        question: '¿Qué es "data drift" y por qué es un problema para los modelos de IA?',
        options: [
          'Cuando los datos se mueven de un servidor a otro',
          'Cuando la distribución de datos en producción cambia respecto a los datos de entrenamiento',
          'Cuando se pierden datos por errores de hardware',
          'Cuando los datos son demasiado grandes para procesar'
        ],
        correctIndex: 1,
        explanation: 'Data drift ocurre cuando los datos del mundo real cambian con el tiempo respecto a los datos con los que se entrenó el modelo. Ejemplo: un modelo de detección de spam entrenado en 2020 puede fallar con spam de 2026 porque el lenguaje y las tácticas cambiaron.'
      },
      {
        question: '¿Qué es MLOps?',
        options: [
          'Un nuevo lenguaje de programación',
          'Prácticas para desplegar, monitorear y mantener modelos de IA en producción',
          'Una empresa de tecnología',
          'Un tipo de algoritmo de machine learning'
        ],
        correctIndex: 1,
        explanation: 'MLOps es la intersección de Machine Learning, DevOps y ingeniería de datos. Incluye versionado de modelos, CI/CD para ML, monitoreo de rendimiento, A/B testing, y retraining automático.'
      },
      {
        question: '¿Cuál es la diferencia entre AGI (Inteligencia Artificial General) e IA actual?',
        options: [
          'No hay diferencia, es lo mismo',
          'AGI sería capaz de realizar cualquier tarea intelectual humana; la IA actual es especializada',
          'AGI es más lenta que la IA actual',
          'AGI ya existe y se usa en producción'
        ],
        correctIndex: 1,
        explanation: 'La IA actual (Narrow AI) es excelente en tareas específicas pero no puede generalizar. La AGI sería una IA con inteligencia flexible comparable a la humana: capaz de aprender cualquier tarea, razonar abstractamente y transferir conocimiento entre dominios. Aún no existe.'
      },
      {
        question: '¿Qué es el "alignment problem" en IA?',
        options: [
          'Alinear los datos en columnas',
          'El desafío de asegurar que los objetivos de la IA coincidan con los valores humanos',
          'Un error de programación común',
          'El problema de alinear servidores en un data center'
        ],
        correctIndex: 1,
        explanation: 'El alignment problem es uno de los mayores desafíos: ¿cómo nos aseguramos de que una IA cada vez más poderosa actúe de acuerdo con los valores e intenciones humanas? Incluso una IA "beneficiosa" mal alineada puede causar daño involuntario.'
      }
    ]
  }, 30, 2);

  await createLesson('ai-8-3', aiM8.id, '🚀 Proyecto Final: Diseña tu Solución de IA', 'project', {
    title: 'Diseña una Solución de IA para un Problema Real',
    description: 'Usa todo lo que aprendiste en el curso para diseñar una solución de IA completa: desde la definición del problema hasta el plan de despliegue.',
    objectives: [
      'Integrar todos los conceptos del curso en un proyecto práctico',
      'Diseñar el pipeline completo de un sistema de IA',
      'Considerar aspectos éticos y de producción'
    ],
    requirements: [
      'Elige un problema real de tu comunidad, trabajo o interés personal',
      'Define: ¿qué tipo de IA usarías? (ML, NLP, CV, combinación)',
      'Describe los datos necesarios y cómo los Obtendrías',
      'Diseña la arquitectura: modelo, API, interfaz de usuario',
      'Incluye: métricas de evaluación, plan de monitoreo, consideraciones éticas',
      'Crea un "pitch deck" de 5 diapositivas presentando tu solución'
    ],
    exampleCode: `// Estructura del proyecto final

const proyectoFinal = {
  problema: "Descripción clara del problema a resolver",
  
  tipoIA: "NLP | Computer Vision | RecSys | Reinforcement Learning | Mixto",
  
  datos: {
    fuentes: ["API pública", "Web scraping", "Datos propios"],
    volumen: "~10,000 registros",
    preprocesamiento: "Limpieza, normalización, split 70/15/15"
  },
  
  modelo: {
    algoritmo: "Random Forest | CNN | Transformer | etc",
    justificacion: "Por qué este modelo para este problema",
    metricas: { accuracy: 0.92, f1: 0.89, recall: 0.95 }
  },
  
  arquitectura: {
    frontend: "React / Flutter",
    backend: "FastAPI / Express",
    modelo: "FastAPI + scikit-learn / PyTorch",
    hosting: "AWS / GCP / Vercel"
  },
  
  produccion: {
    monitoreo: "Data drift detection, métricas en tiempo real",
    retraining: "Mensual con datos nuevos",
    ABTesting: "Comparar v1 vs v2"
  },
  
  etica: {
    sesgo: "Evaluar fairness entre grupos demográficos",
    privacidad: "GDPR compliance, datos anonimizados",
    transparencia: "Explicabilidad del modelo (SHAP/LIME)"
  }
};

// Presenta tu proyecto como si fueras el CTO de un startup
// Explica: el problema, la solución, cómo funciona, métricas, ética`,
    tips: ['Elige un problema que te apasiona — el mejor proyecto es uno que usarías', 'No necesitas entrenar el modelo real; el diseño y la arquitectura son lo importante', 'Piensa siempre en el usuario final: ¿cómo interactuaría con tu solución?']
  }, 80, 3);

  // MÓDULO 9: Examen Final del Curso
  const aiM9 = await createModule('ai-mod-9', aiCourse.id, 'Examen Final: Demuestra tu Dominio de la IA', 9);

  await createLesson('ai-9-1', aiM9.id, 'Quiz Final: Fundamentos de Inteligencia Artificial', 'quiz', {
    questions: [
      {
        question: '¿Qué fue el \"invierno de la IA\" y por qué ocurrió?',
        options: [
          'Una temporada de nieve en un laboratorio de investigación',
          'Períodos donde las promesas de la IA no se cumplieron y el financiamiento se redujo drásticamente',
          'La primera vez que una IA funcionó correctamente',
          'Una actualización de software que eliminó datos de entrenamiento'
        ],
        correctIndex: 1,
        explanation: 'Los inviernos de la IA (décadas de 1970 y 1980-90) fueron períodos de desilusión donde las promesas exageradas no se cumplieron, provocando recortes masivos de financiamiento. Aprendizaje de la historia: la IA requiere datos, cómputo y algoritmos para funcionar.'
      },
      {
        question: '¿Qué tipo de Machine Learning se usa para detectar anomalías en transacciones bancarias SIN datos etiquetados?',
        options: [
          'Aprendizaje supervisado (clasificación)',
          'Aprendizaje por refuerzo',
          'Aprendizaje no supervisado (clustering / detección de anomalías)',
          'Deep Learning supervisado'
        ],
        correctIndex: 2,
        explanation: 'El aprendizaje NO supervisado trabaja sin etiquetas y busca patrones anómalos en los datos. Algoritmos como Isolation Forest, DBSCAN o Autoencoders pueden detectar transacciones inusuales comparándolas con el patrón normal, sin necesidad de ejemplos previos de fraude.'
      },
      {
        question: '¿Qué hace que los Transformers sean superiores a las RNNs para procesamiento de lenguaje?',
        options: [
          'Usan menos memoria y son más rápidos de entrenar siempre',
          'Procesan todo el texto en paralelo usando mecanismos de atención, capturando dependencias largas',
          'No necesitan datos de entrenamiento',
          'Solo funcionan con textos en inglés'
        ],
        correctIndex: 1,
        explanation: 'Los Transformers procesan toda la secuencia simultáneamente (paralelo) usando self-attention, mientras que las RNNs procesan secuencialmente. Esto permite capturar relaciones entre palabras lejanas y entrenar mucho más rápido. El paper \"Attention Is All You Need\" (2017) revolucionó el NLP.'
      },
      {
        question: '¿Qué es el \"data drift\" y por qué es crítico en producción?',
        options: [
          'Cuando los datos se mueven entre servidores en la nube',
          'Cuando la distribución de datos en producción cambia respecto a los datos de entrenamiento, degradando el rendimiento del modelo',
          'Cuando se pierden datos por errores de hardware',
          'Cuando los datos son demasiado grandes para procesar'
        ],
        correctIndex: 1,
        explanation: 'El data drift es uno de los mayores desafíos en MLOps. Los patrones del mundo real cambian con el tiempo (estaciones, tendencias, comportamiento). Un modelo entrenado en 2023 puede fallar en 2025 si no se monitorea y reentrena. Por eso MLOps y el monitoreo continuo son esenciales.'
      },
      {
        question: '¿Qué es un \"alucinación\" (hallucination) en un LLM y cómo se maneja?',
        options: [
          'Cuando el modelo se congela durante el procesamiento',
          'Cuando el modelo genera información falsa con apariencia de ser cierta; se maneja verificando con fuentes confiables',
          'Un error de sintaxis en el código generado',
          'Cuando el modelo tarda más de 10 segundos en responder'
        ],
        correctIndex: 1,
        explanation: 'Las alucinaciones son respuestas que parecen convincentes pero contienen información falsa. Los LLMs pueden inventar fuentes, datos estadísticos o hechos. La solución: siempre verificar con fuentes confiables, usar RAG (Retrieval-Augmented Generation), y mejorar los prompts para reducir alucinaciones.'
      },
      {
        question: '¿En Computer Vision, qué diferencia hay entre \"detección de objetos\" y \"segmentación\"?',
        options: [
          'Son exactamente lo mismo técnicamente',
          'Detección pone rectángulos (bounding boxes); segmentación clasifica cada píxel individual de la imagen',
          'Detección es para video únicamente, segmentación para fotos',
          'Segmentación es más rápida pero menos precisa'
        ],
        correctIndex: 1,
        explanation: 'La detección dibuja bounding boxes alrededor de objetos (YOLO, SSD). La segmentación es más precisa: asigna una etiqueta a CADA píxel, creando máscaras que siguen el contorno exacto del objeto. Modelos como U-Net y Mask R-CNN hacen segmentación.'
      },
      {
        question: '¿Qué es el \"sesgo algorítmico\" y dónde se ha demostrado ser un problema real?',
        options: [
          'Un error de programación que hace lento al algoritmo',
          'Cuando el algoritmo perpetúa prejuicios de los datos de entrenamiento, como el sistema de contratación de Amazon que discriminaba mujeres',
          'Cuando el algoritmo usa mucha memoria RAM',
          'Una actualización automática del modelo'
        ],
        correctIndex: 1,
        explanation: 'El sesgo algorítmico ocurre cuando los datos de entrenamiento contienen prejuicios que el modelo aprende y perpetúa. Ejemplo real: Amazon creó un sistema de contratación que penalizaba CVs con la palabra \"mujer\" porque se entrenó con 20 años de datos donde la mayoría de empleados eran hombres.'
      },
      {
        question: '¿Qué es el \"transfer learning\" y por qué es revolucionario?',
        options: [
          'Mover datos de un servidor a otro',
          'Reutilizar un modelo pre-entrenado con millones de datos para una tarea similar con pocos datos nuevos, ahorrando tiempo y recursos enormemente',
          'Copiar código de un proyecto a otro',
          'Un tipo de red neuronal recurrente'
        ],
        correctIndex: 1,
        explanation: 'Transfer learning toma un modelo ya entrenado (ej: BERT para texto, ResNet para imágenes) y lo ajusta para una tarea específica. Esto permite lograr resultados impresionantes con pocos datos y sin costos masivos de entrenamiento. Es la base de la IA moderna accesible.'
      },
      {
        question: '¿Qué es el \"alignment problem\" en IA y por qué preocupa a los investigadores?',
        options: [
          'El problema de alinear servidores en un data center',
          'El desafío de asegurar que los objetivos de la IA cada vez más poderosa coincidan con los valores e intenciones humanas',
          'Un error común en la tokenización de texto',
          'El problema de que las GPUs no son suficientemente rápidas'
        ],
        correctIndex: 1,
        explanation: 'El alignment problem es uno de los mayores desafíos existenciales de la IA: cómo nos aseguramos de que una IA cada vez más poderosa actúe de acuerdo con los valores humanos? Incluso una IA \"beneficiosa\" mal alineada puede causar daño involuntario. Organizaciones como Anthropic y OpenAI invierten miles de millones en resolver esto.'
      },
      {
        question: 'Según el curso completo, ¿cuál es la secuencia CORRECTA del pipeline de ML en producción?',
        options: [
          'Desplegar → Entrenar → Recolectar datos → Evaluar',
          'Recolectar datos → Limpiar → Entrenar → Evaluar → Desplegar → Monitorear y reentrenar',
          'Escribir código → Probar → Subir a GitHub → Olvidar',
          'Entrenar una vez → Desplegar → Nunca actualizar'
        ],
        correctIndex: 1,
        explanation: 'El pipeline completo de ML es: 1) Recolectar datos, 2) Limpiar y preparar, 3) Entrenar el modelo, 4) Evaluar métricas (accuracy, F1, recall), 5) Desplegar en producción (API, containers), 6) Monitorear data drift y reentrenar cuando el rendimiento baje. El paso 6 es el que más se olvida pero es crítico.'
      }
    ]
  }, 100, 1);

  console.log('✅ Fundamentos de IA completed (9 modules, 24 lessons)');

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
    16,
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

  // MÓDULO 5: Impuestos y Planificación Fiscal
  const finM5 = await createModule('fin-mod-5', finanzasCourse.id, 'Impuestos y Planificación Fiscal', 5);

  await createLesson('fin-5-1', finM5.id, 'Entendiendo los Impuestos Personales', 'reading', {
    introduction: 'Los impuestos son la mayor salida de dinero para la mayoría de personas. Entender cómo funcionan te permite legalmente pagar menos y optimizar tu situación fiscal.',
    content: `TIPOS DE IMPUESTOS PERSONALES:

1. IMPUESTO SOBRE LA RENTA (ISR)
   • Se paga sobre los ingresos ganados (salario, freelance, inversiones)
   • En la mayoría de países es PROGRESIVO: a mayor ingreso, mayor porcentaje
   • Ejemplo España: tramos del 19% al 47%
   • Ejemplo México: tramos del 1.92% al 35%
   • Ejemplo Colombia: tramos del 0% al 39%

2. IVA / IPTU (Impuesto al Consumo)
   • Se paga al comprar bienes y servicios
   • España: 21% general, 10% reducido, 4% superreducido
   • México: 16%
   • No lo "ves" directamente, pero está en todo lo que compras

3. IMPUESTOS SOBRE INVERSIONES
   • Ganancias de capital: vender acciones por encima del precio de compra
   • Dividendos: beneficios que pagan las empresas
   • Intereses: rendimientos de cuentas de ahorro
   • Varía enormemente por país y tipo de inversión

ESTRATEGIAS DE AHORRO FISCAL LEGAL:

1. APORTACIONES A PLANES DE JUBILACIÓN
   • En España: planes de pensiones (deducción de hasta 1,500€/año)
   • En México: AFORE con aportaciones voluntarias
   • En EE.UU.: 401(k), IRA (deducción fiscal inmediata)

2. DEDUCCIONES PERMITIDAS
   • Gastos médicos
   • Intereses hipotecarios
   • Donaciones a organizaciones sin fines de lucro
   • Gastos educativos
   • Gastos de trabajo (herramientas, capacitación)

3. CUENTAS DE INVERSIÓN CON VENTAJA FISCAL
   • ISA (UK): hasta £20,000/año libres de impuestos
   • Planes de pensiones: tributación diferida
   • Cuentas de ahorro con beneficios fiscales

4. ESTRUCTURACIÓN DE INGRESOS
   • Distinguir entre ingresos activos y pasivos
   • Aprovechar tasas impositivas diferentes
   • Timing de ventas de inversiones (esperar el plazo mínimo)

EL ERROR MÁS GRANDE: NO DECLARAR
• Las multas por no declarar son mucho mayores que el impuesto
• La evasión fiscal es ILEGAL; la elusión fiscal (usar la ley a tu favor) es inteligente
• Consulta a un contador profesional para optimización fiscal`,
    keyPoints: [
      'El ISR es progresivo: a más ingreso, más porcentaje pagas',
      'Las aportaciones a planes de jubilación reducen tu base imponible',
      'Las deducciones legales pueden ahorrarte cientos o miles al año',
      'Consulta a un contador para optimizar tu situación fiscal'
    ]
  }, 25, 1);

  await createLesson('fin-5-2', finM5.id, 'Optimización Fiscal para Principiantes', 'quiz', {
    questions: [
      {
        question: '¿Qué es una "deducción fiscal"?',
        options: [
          'Un gasto extra que debes pagar al gobierno',
          'Un gasto que puedes restar de tu ingreso gravable para pagar menos impuestos',
          'Un tipo de multa fiscal',
          'Un reembolso del gobierno'
        ],
        correctIndex: 1,
        explanation: 'Las deducciones fiscales son gastos permitidos por la ley que se restan de tus ingresos gravables. Ejemplo: si ganas $50,000 y tienes $3,000 en deducciones, solo pagas impuestos sobre $47,000. Esto reduce legalmente tu carga fiscal.'
      },
      {
        question: '¿Por qué es importante empezar a invertir en planes de jubilación desde joven?',
        options: [
          'Porque el gobierno lo exige',
          'Porque las deducciones fiscales son mayores cuando estás joven',
          'Porque el interés compuesto tiene más tiempo para crecer y la tributación se difiere',
          'Porque los bancos lo requieren'
        ],
        correctIndex: 2,
        explanation: 'Invertir joven tiene dos beneficios: 1) El interés compuesto tiene décadas para crecer exponencialmente, y 2) Las ganancias no se gravan hasta que retires el dinero (tributación diferida), permitiendo que crezcan sin impuestos intermedios.'
      },
      {
        question: '¿Cuál es la diferencia entre elusión y evasión fiscal?',
        options: [
          'No hay diferencia, ambas son ilegales',
          'Evasión es ilegal (ocultar ingresos); elusión es legal (usar la ley a tu favor)',
          'Elusión es ilegal, evasión es legal',
          'Ambas son completamente legales'
        ],
        correctIndex: 1,
        explanation: 'Evasión fiscal = ocultar ingresos o mentir → ILEGAL con multas y cárcel. Elusión fiscal = usar deducciones, planeación y estructura legal → PERFECTAMENTE LEGAL. Un buen contador te ayuda a elusar fiscalmente (pagar lo mínimo legal).'
      }
    ]
  }, 30, 2);

  // MÓDULO 6: Inversión Avanzada
  const finM6 = await createModule('fin-mod-6', finanzasCourse.id, 'Inversión Avanzada y Diversificación', 6);

  await createLesson('fin-6-1', finM6.id, 'Más Allá de los Fondos Indexados', 'reading', {
    introduction: 'Una vez que dominas lo básico de la inversión, es hora de explorar estrategias más avanzadas que pueden optimizar tu portafolio y maximizar rendimientos a largo plazo.',
    content: `CLASES DE ACTIVOS (ASSET CLASSES):

1. ACCIONES (STOCKS)
   • Small-cap: empresas pequeñas (<$2B), alto riesgo, alto potencial
   • Mid-cap: empresas medianas ($2B-$10B)
   • Large-cap: empresas grandes (>$$10B), más estables
   • Growth vs Value: empresas en crecimiento vs empresas "baratas"

2. BONOS (BONDS)
   • Gobierno: los más seguros (treasuries)
   • Corporativos: mayor rendimiento, algo más de riesgo
   • High-yield (basura): alto rendimiento, alto riesgo de default
   • Bonos internacionales: diversificación geográfica

3. BIENES RAÍCES (REAL ESTATE)
   • REITs (Real Estate Investment Trusts): invertir en bienes raíces sin comprar propiedad
   • Crowdfunding inmobiliario
   • Propiedades físicas (requiere más capital)
   • Rendimiento histórico: 8-12% anual

4. MATERIAS PRIMAS (COMMODITIES)
   • Oro: refugio seguro en tiempos de incertidumbre
   • Plata, petróleo, agricultura
   • ETFs de commodities para diversificar

5. CRIPTOMONEDAS
   • Bitcoin, Ethereum: alto riesgo, alta volatilidad
   • Máximo 5-10% del portafolio para principiantes
   • Nunca inviertas dinero que no puedas perder

ASIGNACIÓN DE ACTIVOS (ALLOCATION):
La distribución de tu dinero entre diferentes clases de activos es la decisión MÁS importante de tu portafolio.

EJEMPLOS POR EDAD:
• 25 años: 80% acciones, 10% bonos, 10% otros
• 35 años: 70% acciones, 20% bonos, 10% otros
• 45 años: 60% acciones, 30% bonos, 10% otros
• 55 años: 50% acciones, 40% bonos, 10% otros
• 65+ años: 40% acciones, 50% bonos, 10% efectivo

REBALANCEO:
Cada 6-12 meses, ajusta tu portafolio a la distribución objetivo.
Ejemplo: Si las acciones subieron mucho y ahora son 85% de tu portafolio, vende parte y compra bonos para volver al 70/20/10. Esto sistemáticamente vende caro y compra barato.

DIVIDENDOS:
Algunas acciones pagan dividendos (parte de las ganancias).
• Dividend aristocrats: empresas que han aumentado dividendos 25+ años consecutivos
• Reinvertir dividendos acelera el crecimiento significativamente
• Pueden generar ingresos pasivos en jubilación`,
    keyPoints: [
      'Diversificar entre clases de activos reduce el riesgo del portafolio',
      'La asignación por edad es una guía: más acciones jóvenes, más bonos con la edad',
      'El rebalanceo vende sistemáticamente caro y compra barato',
      'Los dividendos reinvertidos aceleran el crecimiento exponencialmente'
    ]
  }, 25, 1);

  await createLesson('fin-6-2', finM6.id, 'Estrategias de Inversión', 'quiz', {
    questions: [
      {
        question: '¿Qué es "rebalanceo" de un portafolio?',
        options: [
          'Vender todo y empezar de cero cada año',
          'Ajustar la distribución de activos de vuelta a los porcentajes objetivo',
          'Solo comprar acciones que estén subiendo',
          'Cerrar la cuenta de inversión'
        ],
        correctIndex: 1,
        explanation: 'El rebalanceo es vender activos que crecieron más de lo planeado (vender caro) y comprar los que quedaron atrás (comprar barato). Ej: si tu objetivo es 70% acciones y ahora son 80%, vendes 10% y compras bonos. Esto se hace cada 6-12 meses.'
      },
      {
        question: '¿Por qué el oro se considera un "refugio seguro"?',
        options: [
          'Porque siempre da el mayor rendimiento',
          'Porque tiende a mantener su valor o subir en tiempos de crisis económica e incertidumbre',
          'Porque no paga impuestos',
          'Porque todos los bancos lo recomiendan'
        ],
        correctIndex: 1,
        explanation: 'El oro históricamente mantiene su valor cuando las acciones caen, hay inflación alta o crisis geopolíticas. Los inversores compran oro como protección, lo que aumenta su precio en tiempos turbulentos. No genera dividendos ni intereses.'
      },
      {
        question: 'Si tienes 30 años, ¿cuál sería una asignación de activos razonable?',
        options: [
          '100% en efectivo para seguridad',
          '70% acciones, 20% bonos, 10% otros (REITs, commodities)',
          '100% en criptomonedas para máximo rendimiento',
          '50% acciones, 50% bonos'
        ],
        correctIndex: 1,
        explanation: 'A los 30 años tienes 30+ años hasta la jubilación, así que puedes tolerar más volatilidad a cambio de mayor rendimiento. 70% acciones (crecimiento), 20% bonos (estabilidad), 10% otros (diversificación adicional). Con la edad, gradually reduces acciones.'
      }
    ]
  }, 30, 2);

  await createLesson('fin-6-3', finM6.id, '🎮 Ejercicio: Diseña tu Portafolio', 'coding', {
    instructions: 'Crea una función que calcule la distribución ideal de un portafolio según la edad y tolerancia al riesgo:',
    exercise: {
      task: 'Diseña un portafolio de inversión personalizado',
      challenges: [
        {
          id: 'fin-alloc-1',
          description: 'Crea una función que retorne la asignación de activos basada en la edad (20-65+)',
          initialCode: 'function asignacionPorEdad(edad) {\n  // Retorna: { acciones: %, bonos: %, otros: % }\n  // Regla: a menor edad, más acciones\n}',
          hint: 'Usa un switch o if-else. Jóvenes (20-30): 80/10/10, Medios (31-50): 65/25/10, Mayores (51+): 50/40/10',
          solution: 'function asignacionPorEdad(edad) {\n  if (edad <= 30) return { acciones: 80, bonos: 10, otros: 10 };\n  if (edad <= 40) return { acciones: 70, bonos: 20, otros: 10 };\n  if (edad <= 50) return { acciones: 60, bonos: 30, otros: 10 };\n  return { acciones: 50, bonos: 40, otros: 10 };\n}'
        },
        {
          id: 'fin-alloc-2',
          description: 'Calcula cuánto dinero va a cada clase de activo con un portafolio de $50,000 para alguien de 35 años',
          initialCode: 'const portafolio = 50000;\nconst edad = 35;\n// Usa la función anterior para calcular montos\n',
          expectedOutput: 'acciones=$35000, bonos=$10000, otros=$5000',
          hint: 'Multiplica el porcentaje (como decimal) por el total del portafolio',
          solution: 'const asignacion = asignacionPorEdad(edad);\nconst acciones = portafolio * (asignacion.acciones / 100);\nconst bonos = portafolio * (asignacion.bonos / 100);\nconst otros = portafolio * (asignacion.otros / 100);'
        }
      ]
    }
  }, 40, 3);

  // MÓDULO 7: Planificación de Retiro y Libertad Financiera
  const finM7 = await createModule('fin-mod-7', finanzasCourse.id, 'Planificación de Retiro y Libertad Financiera', 7);

  await createLesson('fin-7-1', finM7.id, 'Planificando tu Retiro', 'reading', {
    introduction: 'La planificación de retiro no es solo para personas mayores. Cuanto antes empieces a planificar, más opciones tendrás y menos tendrás que sacrificar. La libertad financiera es alcanzable con disciplina y conocimiento.',
    content: `¿CUÁNTO NECESITAS PARA RETIRARTE?

LA REGLA DEL 4%:
Si retiras el 4% de tu portafolio cada año, con alta probabilidad durará 30+ años.

Ejemplo:
• Gastos anuales de $40,000 → necesitas $1,000,000 invertidos
• Gastos anuales de $60,000 → necesitas $1,500,000 invertidos
• Gastos anuales de $80,000 → necesitas $2,000,000 invertidos

La regla funciona porque el portafolio sigue generando rendimientos (7-10% promedio) mientras retiras el 4%.

¿CUÁNDO EMPEZAR?

Si inviertes $500/mes al 8% promedio anual:
• Empiezas a los 25: tendrás ~$1,745,000 a los 65
• Empiezas a los 30: tendrás ~$1,173,000 a los 65 (pierdes $572K)
• Empiezas a los 35: tendrás ~$745,000 a los 65 (pierdes $1M)
• Empiezas a los 40: tendrás ~$436,000 a los 65 (pierdes $1.3M)

Cada década que esperas CORTAS tus posibilidades a la mitad.

LA PIRÁMIDE FINANCIERA DEL RETIRO:

1. FONDO DE EMERGENCIA (6 meses) → Seguridad base
2. DEUDA DE TASA ALTA (tarjetas) → Eliminar primero
3. PLAN DE JUBILACIÓN EMPLEADOR → Aprovechar match del empleador (dinero gratis)
4. PLAN JUBILACIÓN PROPIO → IRA, planes de pensiones
5. INVERSIÓN GENERAL → Fondos indexados, acciones, bonos

LIBERTAD FINANCIERA (FIRE):
FIRE = Financial Independence, Retire Early

Para alcanzar FIRE necesitas:
1. Ahorrar e invertir 50-70% de tus ingresos
2. Vivir con el 30-50% de tus ingresos
3. Alcanzar 25x tus gastos anuales invertidos

Ejemplo:
• Gastos: $30,000/año → necesitas $750,000 para FIRE
• Gastos: $50,000/año → necesitas $1,250,000 para FIRE

ESTRATEGIAS PARA ACELERAR FIRE:
• Aumentar ingresos (side hustles, promociones, skills)
• Reducir gastos fijos (vivienda, transporte, seguro)
• Optimizar impuestos (aprovechar deducciones)
• Invertir consistentemente en fondos indexados
• Evitar lifestyle inflation (cuando ganes más, ahorra más)`,
    keyPoints: [
      'La regla del 4% dice que necesitas 25x tus gastos anuales para jubilarte',
      'Cada década de espera reduce aproximadamente a la mitad tu patrimonio a los 65',
      'FIRE requiere ahorrar 50-70% de tus ingresos e invertir consistentemente',
      'Empiezar a planificar HOY es la mejor decisión financiera que puedes tomar'
    ]
  }, 25, 1);

  await createLesson('fin-7-2', finM7.id, 'Estrategias de Retiro y FIRE', 'quiz', {
    questions: [
      {
        question: 'Según la regla del 4%, ¿cuánto necesitas invertir para retirarte con gastos de $50,000/año?',
        options: [
          '$500,000',
          '$1,000,000',
          '$1,250,000',
          '$2,000,000'
        ],
        correctIndex: 2,
        explanation: 'La regla del 4% dice que necesitas 25x tus gastos anuales: $50,000 × 25 = $1,250,000. Con ese portafolio, retiras 4% ($50,000) cada año y el resto sigue creciendo, durando 30+ años.'
      },
      {
        question: '¿Qué es FIRE y qué lo hace diferente del retiro tradicional?',
        options: [
          'Un tipo de inversión en bienes raíces',
          'Financial Independence, Retire Early — jubilarse décadas antes de la edad tradicional',
          'Un plan de pensiones del gobierno',
          'Una aseguradora de retiro'
        ],
        correctIndex: 1,
        explanation: 'FIRE significa independencia financiera y retiro temprano. En lugar de esperar a los 65, los practicantes de FIRE buscan jubilarse a los 30-50 años ahorrando e invirtiendo agresivamente (50-70% de sus ingresos).'
      },
      {
        question: '¿Por qué es tan importante empezar a invertir para el retiro desde joven?',
        options: [
          'Porque los jóvenes pagan menos impuestos',
          'Porque el interés compuesto necesita décadas para crecer exponencialmente',
          'Porque los bancos ofrecen mejores tasas a jóvenes',
          'Porque no hay otra opción'
        ],
        correctIndex: 1,
        explanation: 'El interés compuesto es una función del TIEMPO. $500/mes desde los 25 = $1.7M a los 65. Desde los 35 = solo $745K. Esa década de diferencia cuesta más de $1 millón porque el interés compuesto necesita tiempo para "despegar".'
      }
    ]
  }, 30, 2);

  await createLesson('fin-7-3', finM7.id, '🚀 Proyecto Final: Tu Plan Financiero Integral', 'project', {
    title: 'Crea tu Plan Financiero Personal Completo',
    description: 'Diseña un plan financiero integral que incluya presupuesto, ahorro, inversión y metas de retiro.',
    objectives: [
      'Integrar todos los conceptos del curso en un plan personal',
      'Establecer metas financieras claras a corto, mediano y largo plazo',
      'Crear un sistema sostenible de administración del dinero'
    ],
    requirements: [
      'Calcula tu patrimonio neto actual (activos - pasivos)',
      'Establece metas para: 1 año, 5 años, 10 años, jubilación',
      'Crea tu presupuesto mensual con el método 50/30/20',
      'Define tu estrategia de inversión según tu edad y tolerancia al riesgo',
      'Calcula cuánto necesitas para jubilarte con la regla del 4%',
      'Crea un plan de acción con pasos concretos para los próximos 6 meses'
    ],
    exampleCode: `// Template: Mi Plan Financiero

const miPlan = {
  patrimonioNeto: {
    activos: { ahorros: 5000, inversiones: 12000, otros: 0 },
    pasivos: { tarjetas: 2000, prestamo_auto: 8000 },
    neto: 7000
  },
  
  metas: {
    corto: ['Pagar tarjetas de crédito en 6 meses', 'Fondo emergencia $5,000'],
    mediano: ['Invertir $20,000 en fondos indexados', 'Comprar casa en 5 años'],
    largo: ['Retiro a los 60 con $1,500,000', 'Viajar 3 meses al año']
  },
  
  presupuesto: {
    ingresos: 3000,
    necesidades: 1500, // 50%
    deseos: 900,       // 30%
    ahorro: 600        // 20%
  },
  
  estrategiaInversion: {
    asignacion: { acciones: 70, bonos: 20, otros: 10 },
    instruments: ['Fondo S&P 500 ETF', 'Bonos globales ETF', 'REITs'],
    rebalanceo: 'Cada 6 meses'
  },
  
  metaRetiro: {
    gastosAnuales: 40000,
    metaPatrimonio: 1000000, // 25x
    mesesParaRetiro: 300,
    ahorroMensualNecesario: 800
  },
  
  accionInmediata: [
    'Abrir cuenta de ahorro de alto rendimiento',
    'Configurar transferencia automática de $600/mes a inversión',
    'Pagar tarjeta de crédito con método avalancha',
    'Revisar plan de jubilación del empleador'
  ]
};

// Ejecuta un paso cada semana durante 6 meses`,
    tips: ['Empieza con lo que tienes, no esperes a tener más', 'La consistencia es más importante que la cantidad', 'Revisa tu plan cada 3 meses y ajusta']
  }, 80, 3);

  // MÓDULO 8: Examen Final del Curso de Finanzas Personales
  const finM8 = await createModule('fin-mod-8', finanzasCourse.id, 'Examen Final: Demuestra tu Dominio de las Finanzas', 8);

  await createLesson('fin-8-1', finM8.id, 'Quiz Final: Finanzas Personales para Principiantes', 'quiz', {
    questions: [
      {
        question: '\u00bfQu\u00e9 es el "inter\u00e9s compuesto" y por qu\u00e9 se le llama la "octava maravilla del mundo"?',
        options: [
          'Un tipo de pr\u00e9stamo con tasa fija',
          'Inter\u00e9s que se calcula sobre el capital m\u00e1s los intereses acumulados, creciendo exponencialmente con el tiempo',
          'Un impuesto que aplica el gobierno sobre los ahorros',
          'Una comisi\u00f3n que cobran los bancos por guardar tu dinero'
        ],
        correctIndex: 1,
        explanation: 'El inter\u00e9s compuesto genera intereses sobre los intereses ya acumulados, creciendo exponencialmente. Ej: $200/mes al 7% desde los 25 da ~$525K a los 65, pero empezar a los 35 solo da ~$244K. La paciencia y el tiempo son tu mayor ventaja.'
      },
      {
        question: '\u00bfQu\u00e9 porcentaje de tus ingresos netos deber\u00edas destinar a ahorro e inversi\u00f3n seg\u00fan el m\u00e9todo 50/30/20?',
        options: [
          '50% a ahorro, 30% a necesidades, 20% a deseos',
          '30% a ahorro, 50% a necesidades, 20% a deseos',
          '20% a ahorro e inversi\u00f3n, 50% a necesidades, 30% a deseos',
          '10% a ahorro, 60% a necesidades, 30% a deseos'
        ],
        correctIndex: 2,
        explanation: 'El m\u00e9todo 50/30/20 asigna: 50% a necesidades (alquiler, comida, servicios), 30% a deseos (restaurantes, entretenimiento, ropa), y 20% a ahorro e inversi\u00f3n. Es un excelente punto de partida para principiantes.'
      },
      {
        question: '\u00bfCu\u00e1l es la diferencia entre una deuda "buena" y una deuda "mala"?',
        options: [
          'No hay diferencia, todas las deudas son iguales',
          'La deuda buena tiene tasa baja y genera valor (hipoteca); la mala tiene tasa alta y consume valor (tarjeta de cr\u00e9dito)',
          'La deuda buena es la que paga el gobierno; la mala es la que t\u00fa pagas',
          'La deuda buena es la que tienes con amigos; la mala es con bancos'
        ],
        correctIndex: 1,
        explanation: 'Una hipoteca al 5% es "buena deuda" porque el inmueble se aprecia y la tasa es baja. Una tarjeta de cr\u00e9dito al 22% es "mala deuda" porque consume tu dinero en intereses sin generar valor. Las tarjetas de payday (al 200-400%) son las peores.'
      },
      {
        question: '\u00bfQu\u00e9 es un "fondo de emergencia" y cu\u00e1nto deber\u00edas tener?',
        options: [
          'Un pr\u00e9stamo de emergencia del banco',
          'Ahorros de 3-6 meses de gastos fijos, accesibles inmediatamente para emergencias reales',
          'Una inversi\u00f3n en criptomonedas para ganar r\u00e1pido',
          'Un seguro de vida que cubre tus deudas'
        ],
        correctIndex: 1,
        explanation: 'El fondo de emergencia cubre 3-6 meses de gastos fijos (alquiler, comida, servicios) en una cuenta l\u00edquida y segura. Se usa para p\u00e9rdida de empleo, reparaciones m\u00e9dicas, etc. NUNCA se toca para compras o vacaciones.'
      },
      {
        question: '\u00bfQu\u00e9 estrategia de pago de deudas ahorra M\u00c1S dinero en intereses totales?',
        options: [
          'M\u00e9todo bola de nieve (pagar la deuda m\u00e1s peque\u00f1a primero)',
          'M\u00e9todo avalancha (pagar primero la deuda con mayor tasa de inter\u00e9s)',
          'Pagar solo el m\u00ednimo en todas las deudas por igual',
          'Consolidar todas las deudas en una sola sin cambiar h\u00e1bitos'
        ],
        correctIndex: 1,
        explanation: 'El m\u00e9todo avalancha prioriza la deuda con mayor tasa de inter\u00e9s (ej: tarjeta al 22% antes que pr\u00e9stamo al 8%). Esto minimiza el dinero total pagado en intereses. La bola de nieve da m\u00e1s motivaci\u00f3n al eliminar deudas r\u00e1pidamente, pero cuesta m\u00e1s.'
      },
      {
        question: '\u00bfQu\u00e9 es un "fondo indexado" y por qu\u00e9 es ideal para principiantes?',
        options: [
          'Una cartera de acciones individuales que elegiste t\u00fa',
          'Un fondo que replica autom\u00e1ticamente un \u00edndice (como S&P 500), con diversificaci\u00f3n autom\u00e1tica y comisiones bajas',
          'Una cuenta de ahorro de alto rendimiento del banco',
          'Un pr\u00e9stamo que te da el gobierno para invertir'
        ],
        correctIndex: 1,
        explanation: 'Un fondo indexado del S&P 500 compra autom\u00e1ticamente acciones de las 500 empresas m\u00e1s grandes de EE.UU. Con una sola inversi\u00f3n, diversificas en todas. Comisiones de 0.03-0.20% y rendimiento hist\u00f3rico del ~10% anual. No necesitas elegir acciones individuales.'
      },
      {
        question: '\u00bfQu\u00e9 es "Dollar Cost Averaging" (DCA) y por qu\u00e9 reduce el riesgo?',
        options: [
          'Cambiar d\u00f3lares a otra moneda antes de invertir',
          'Invertir una cantidad fija peri\u00f3dicamente sin importar si el mercado est\u00e1 alto o bajo, promediando el precio de compra',
          'Esperar a que el mercado baje para invertir todo de golpe',
          'Vender acciones cada vez que el mercado sube 5%'
        ],
        correctIndex: 1,
        explanation: 'DCA significa invertir la misma cantidad regularmente (ej: $300 cada mes) sin importar el precio. Esto promedia tu precio de compra: compras m\u00e1s acciones cuando est\u00e1n baratas y menos cuando est\u00e1n caras, eliminando el riesgo de "mal timing".'
      },
      {
        question: '\u00bfQu\u00e9 es la "utilizaci\u00f3n de cr\u00e9dito" y qu\u00e9 porcentaje deber\u00edas mantener?',
        options: [
          'El total de deudas que tienes; ideal es $0',
          'El porcentaje de tu l\u00edmite de cr\u00e9dito que est\u00e1s usando; ideal es bajo 30%',
          'El n\u00famero de tarjetas que tienes; ideal es 1-2',
          'Los intereses que pagas al a\u00f1o; ideal es 0%'
        ],
        correctIndex: 1,
        explanation: 'Utilizaci\u00f3n = saldo actual / l\u00edmite total x 100. Si debes $3,000 en una tarjeta con l\u00edmite $10,000, tu utilizaci\u00f3n es 30%. Mantenerla bajo 30% (idealmente bajo 10%) mejora significativamente tu score de cr\u00e9dito (300-850).'
      },
      {
        question: '\u00bfQu\u00e9 porcentaje m\u00e1ximo del portafolio se recomienda invertir en criptomonedas para principiantes?',
        options: [
          '50% o m\u00e1s para maximizar ganancias',
          '25-30% porque son la inversi\u00f3n del futuro',
          '5-10% m\u00e1ximo, ya que son extremadamente vol\u00e1tiles',
          '0%, las criptomonedas son una estafa'
        ],
        correctIndex: 2,
        explanation: 'Las criptomonedas son extremadamente volátiles (pueden bajar 50%+ en semanas). Para principiantes, máximo 5-10% del portafolio. Nunca inviertas dinero que no puedas perder. Los fondos indexados son la base sólida para la mayoría.'
      },
      {
        question: '\u00bfQu\u00e9 es la "tributaci\u00f3n diferida" y por qu\u00e9 es ventajosa?',
        options: [
          'No pagar impuestos nunca, lo cual es ilegal',
          'Que las ganancias de inversi\u00f3n no se gravan hasta que retires el dinero, permitiendo que crezcan sin impuestos intermedios',
          'Pagar impuestos m\u00e1s r\u00e1pido para que el gobierno no te persiga',
          'Un tipo de multa fiscal por no declarar a tiempo'
        ],
        correctIndex: 1,
        explanation: 'Planes de jubilaci\u00f3n (401k, IRA, planes de pensiones) permiten que tus inversiones crezcan sin pagar impuestos sobre las ganancias hasta que retires el dinero. Esto acelera el crecimiento del interés compuesto significativamente a largo plazo.'
      }
    ]
  }, 100, 1);

  console.log('\u2705 Finanzas Personales completed (8 modules, 18 lessons)');

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
    14,
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

  // MÓDULO 4: Pan Italiano y Repostería
  const cocM4 = await createModule('coc-mod-4', cocinaCourse.id, 'Pan Italiano y Repostería Clásica', 4);

  await createLesson('coc-4-1', cocM4.id, 'El Arte del Pan Italiano', 'reading', {
    introduction: 'El pan en Italia no es solo un accompañamiento — es un elemento sagrado de la mesa. Cada región tiene su pan característico.',
    content: `LOS PANES MÁS FAMOSOS DE ITALIA:

1. CIABATTA (Liguria)
   Masa muy hidratada (75-80% agua), corteza crujiente, miga alveolada.

2. FOCACCIA (Liguria)
   Plana, suave, con aceite de oliva abundante.

3. GRISSINI (Piamonte)
   Palitos de pan crujientes.

MASA MADRE:
Colonia viva de levaduras. Tarda 7-10 días en crear pero dura indefinidamente.

RECETAS: Ciabatta (500g harina + 375g agua + 10g sal + 5g levadura) y Focaccia al Romero. Hornear 220-230°C con vapor.`,
    keyPoints: ['La ciabatta se hace con masa muy hidratada', 'La focaccia lleva abundante aceite de oliva', 'La masa madre dura indefinidamente', 'El pan se hornea a alta temperatura']
  }, 25, 1);

  await createLesson('coc-4-2', cocM4.id, 'Repostería Italiana Clásica', 'reading', {
    introduction: 'La repostería italiana es elegante en su simplicidad.',
    content: `LOS POSTRES MÁS FAMOSOS:

1. CANNOLI SICILIANI - Tubos de masa frita rellenos de ricotta. SE RELLENA AL MOMENTO.

2. SFGLIATELLE - Hojaldre relleno de pasta de almendras.

3. PANETTONE - Pan dulce navideño milanés.

CREMA PASTELERA: 500ml leche + 100g azúcar + 4 yemas + 40g maicena. Cubrir con film.`,
    keyPoints: ['Los cannoli se rellenan AL MOMENTO', 'La crema pastelera se cubre con film', 'El panettone se enfría boca abajo', 'La simplicidad es clave']
  }, 25, 2);

  await createLesson('coc-4-3', cocM4.id, 'Mini-Proyecto: Pan y Postre Italiano', 'project', {
    title: 'Hornea Focaccia Casera y Cannoli',
    description: 'Prepara dos clasicos de la reposteria italiana desde cero.',
    objectives: ['Dominar tecnicas de masa italiana', 'Comprender la fermentacion', 'Combinar texturas autenticas'],
    requirements: ['Prepara focaccia con 2 toppings', 'Documenta la fermentacion', 'Prepara crema de ricotta', 'Monta los cannoli al momento'],
    exampleCode: 'Focaccia: 500g harina + 375ml agua + 10g sal + 5g levadura + 60ml aceite',
    tips: ['No tengas prisa con la fermentacion', 'El vapor en el horno es clave']
  }, 60, 3);

  // MODULO 5: Vinos y Maridaje Italiano
  const cocM5 = await createModule('coc-mod-5', cocinaCourse.id, 'Vinos Italianos y Maridaje Perfecto', 5);

  await createLesson('coc-5-1', cocM5.id, 'Guia de Vinos Italianos', 'reading', {
    introduction: 'Italia es uno de los mayores productores de vino del mundo, con mas de 500 variedades de uva nativas.',
    content: `REGIONES VINICOLAS:

1. Piamonte: Barolo, Barbaresco, Barbera
2. Toscana: Chianti, Brunello
3. Veneto: Prosecco, Amarone
4. Sicilia: Nero d'Avola

REGLAS DE MARIDAJE:
1. Lo local con lo local
2. Tinto con carne, blanco con pescado
3. El vino debe ser mas suave que la comida

MARIDAJES CLASICOS:
Carbonara -> Frascati o Chianti
Pizza -> Chianti
Risotto -> Soave
Tiramisu -> Vin Santo

CANTIDAD: 1 botella por 4 personas.`,
    keyPoints: ['Chianti es el vino de mesa italiano', 'Prosecco es ideal para aperitivo', 'Lo local con lo local siempre funciona', 'El vino debe ser mas suave que la comida']
  }, 25, 1);

  await createLesson('coc-5-2', cocM5.id, 'Maridaje de Vinos y Comida', 'quiz', {
    questions: [
      {
        question: 'Que vino se marida con Carbonara?',
        options: ['Prosecco espumoso', 'Barolo tinto potente', 'Frascati o Chianti', 'Moscato dulce'],
        correctIndex: 2,
        explanation: 'Frascati o Chianti complementan sin dominar la Carbonara.'
      },
      {
        question: 'Que dice la regla lo local con lo local?',
        options: ['Vino importado siempre', 'Vinos de la region con platos de la misma region', 'Solo vino de la misma botella', 'Nunca mezclar vinos'],
        correctIndex: 1,
        explanation: 'Vinos y platos de la misma region se complementan naturalmente.'
      },
      {
        question: 'Cual es el error mas comun en maridaje?',
        options: ['Beber demasiado vino', 'Elegir un vino mas pesado que la comida', 'No enfriar el vino blanco', 'Servir vino tinto frio'],
        correctIndex: 1,
        explanation: 'El vino debe ser mas suave que la comida para complementar, no competir.'
      },
      {
        question: 'Vino para aperitivo?',
        options: ['Barolo tinto', 'Prosecco o Moscato', 'Amarone', 'Vin Santo'],
        correctIndex: 1,
        explanation: 'Prosecco y Moscato son ligeros y festivos, perfectos para el aperitivo.'
      }
    ]
  }, 30, 2);

  await createLesson('coc-5-3', cocM5.id, 'Ejercicio: Menu con Maridaje', 'quiz', {
    questions: [
      {
        question: 'Vino para risotto ai funghi?',
        options: ['Prosecco espumoso', 'Barolo tinto', 'Soave o Gavi (blanco mineral)', 'Moscato dulce'],
        correctIndex: 2,
        explanation: 'Un blanco mineral como Soave complementa los hongos sin dominar.'
      },
      {
        question: 'Vino para pizza margherita?',
        options: ['Brunello caro', 'Chianti o Montepulciano', 'Prosecco', 'Vin Santo'],
        correctIndex: 1,
        explanation: 'Chianti es la combinacion italiana clasica con pizza.'
      },
      {
        question: 'Alternativa sin alcohol en Italia?',
        options: ['Solo agua del grifo', 'Agua con gas (San Pellegrino) o limonata siciliana', 'Cafe espresso', 'No hay alternativas'],
        correctIndex: 1,
        explanation: 'Agua con gas y limonata siciliana son alternativas italianas perfectas.'
      }
    ]
  }, 30, 3);

  // MÓDULO 6: Examen Final del Curso de Cocina Italiana
  const cocM6 = await createModule('coc-mod-6', cocinaCourse.id, 'Examen Final: Demuestra tu Dominio de la Cocina Italiana', 6);

  await createLesson('coc-6-1', cocM6.id, 'Quiz Final: Cocina Italiana Tradicional', 'quiz', {
    questions: [
      {
        question: '\u00bfCu\u00e1l es la filosof\u00eda fundamental de la cocina italiana?',
        options: [
          'Usar los ingredientes m\u00e1s caros disponibles',
          'Resaltar la calidad de los ingredientes frescos y de temporada con preparaci\u00f3n sencilla',
          'Crear platos con la mayor cantidad de ingredientes posible',
          'Copiar las t\u00e9cnicas francesas cl\u00e1sicas'
        ],
        correctIndex: 1,
        explanation: 'La cocina italiana se basa en la simplicidad y la calidad de los ingredientes. Menos ingredientes de alta calidad siempre superan a muchos ingredientes mediocres. La temporada y la frescura son clave.'
      },
      {
        question: '\u00bfQu\u00e9 tipo de pasta se recomienda para salsas ligeras como la aglio e olio?',
        options: [
          'Pasta rellena como ravioli',
          'Pasta larga y delgada como espagueti o linguine',
          'Pasta corta y tubular como rigatoni',
          'Cualquier tipo de pasta funciona igual'
        ],
        correctIndex: 1,
        explanation: 'Las salsas ligeras como aglio e olio (aceite de oliva y ajo) se adhieren mejor a pastas largas y delgadas. La pasta corta y tubular es ideal para salsas espesas que se alojan dentro del tubo.'
      },
      {
        question: '\u00bfCu\u00e1l es la regla de oro del maridaje italiano?',
        options: [
          'Siempre elegir el vino m\u00e1s caro',
          'Lo local con lo local: combinar vinos y platos de la misma regi\u00f3n',
          'Los vinos tintos siempre van mejor que los blancos',
          'Nunca combinar vino con pasta'
        ],
        correctIndex: 1,
        explanation: 'La regla "lo local con lo local" es fundamental: un Chianti de Toscana con un plato toscano, un Frascati de Lacio con una pasta romana. Los vinos y platos de la misma regi\u00f3n evolucionaron juntos.'
      },
      {
        question: '\u00bfCu\u00e1l es la diferencia principal entre la salsa bolo\u00f1esa aut\u00e9ntica y la versi\u00f3n internacional?',
        options: [
          'La bolo\u00f1esa lleva m\u00e1s tomate',
          'La aut\u00e9ntica lleva carne molida (ternera y cerdo), vino tinto y se cocina a fuego lento por horas',
          'No hay diferencia, son iguales',
          'La italiana lleva crema de leche'
        ],
        correctIndex: 1,
        explanation: 'La rag\u00f9 alla bolo\u00f1ense aut\u00e9ntica (de Bolonia) lleva mezcla de carne molida de res y cerdo, vino tinto, y se cocina a fuego lento 2-4 horas. La versi\u00f3n internacional a menudo exagera el tomate y es mucho m\u00e1s r\u00e1pida.'
      },
      {
        question: '\u00bfQu\u00e9 pan italiano es el m\u00e1s ic\u00f3nico y qu\u00e9 lo hace especial?',
        options: [
          'Pan de molde suave',
          'Focaccia: pan plano con aceite de oliva, sal gruesa y hierbas frescas',
          'Baguette franc\u00e9s',
          'Pan integral americano'
        ],
        correctIndex: 1,
        explanation: 'La focaccia es uno de los pans m\u00e1s ic\u00f3nicos de Italia. Su caracter\u00edstica es la textura suave y esponjosa con una superficie aceitosa y salada. Se hornea con romero, tomates cherry o aceitunas.'
      },
      {
        question: '\u00bfQu\u00e9 vino italiano se recomienda cl\u00e1sicamente con una pizza margherita?',
        options: [
          'Prosecco espumoso',
          'Chianti de la regi\u00f3n de Toscana',
          'Amarone de Venecia',
          'Vino dulce de Moscato'
        ],
        correctIndex: 1,
        explanation: 'El Chianti, elaborado con la uva Sangiovese en Toscana, es el maridaje cl\u00e1sico con pizza margherita. Su acidez media y notas de cereza equilibran perfectamente la salsa de tomate y la mozzarella.'
      },
      {
        question: '\u00bfQu\u00e9 es el "al dente" y por qu\u00e9 es importante?',
        options: [
          'Una marca de pasta italiana premium',
          'El punto de cocci\u00f3n donde la pasta tiene una textura firme al centro, ni cruda ni sobrecocida',
          'Un tipo de salsa para pasta',
          'Una t\u00e9cnica para cortar verduras'
        ],
        correctIndex: 1,
        explanation: '"Al dente" significa "al diente" en italiano: la pasta debe ofrecer ligera resistencia al morder. Este punto es crucial porque la pasta sigue absorbiendo salsa despu\u00e9s del plato, y una pasta sobrecocida se vuelve pastosa.'
      },
      {
        question: '\u00bfCu\u00e1les son los ingredientes esenciales de una aut\u00e9ntica carbonara romana?',
        options: [
          'Pasta, huevo, queso, panceta, pimienta negra y ajo',
          'Pasta, guanciale (o panceta), yemas de huevo, pecorino romano y pimienta negra',
          'Pasta, crema de leche, tocino, parmesano y perejil',
          'Pasta, salsa de tomate, albahaca y mozzarella'
        ],
        correctIndex: 1,
        explanation: 'La carbonara aut\u00e9ntica romana es sorprendentemente simple: guanciale (o panceta), yemas de huevo, pecorino romano y pimienta negra. NUNCA lleva crema de leche (eso es una corrupci\u00f3n internacional) ni ajo.'
      },
      {
        question: '\u00bfQu\u00e9 t\u00e9cnica italiana consiste en pasar la pasta directamente de la olla a la sart\u00e9n con la salsa?',
        options: [
          'Mantecare: mezclar la pasta con la salsa a fuego vivo, usando el agua de cocci\u00f3n para crear una emulsi\u00f3n cremosa',
          'Saltare: saltar la pasta en el aire',
          'Ripassare: recocer la pasta dos veces',
          'Affogare: ahogar la pasta en aceite'
        ],
        correctIndex: 0,
        explanation: 'La "mantecatura" es la t\u00e9cnica de terminar la pasta en la sart\u00e9n con la salsa, usando un poco del agua de cocci\u00f3n (rica en almidón) para crear una emulsi\u00f3n sedosa y cremosa que une todo el plato.'
      },
      {
        question: '\u00bfQu\u00e9 diferencia al tiramis\u00fa aut\u00e9ntico de las versiones comerciales?',
        options: [
          'El aut\u00e9ntico lleva chocolate fundido',
          'El aut\u00e9ntico usa bizcochos de Soletta empapados en caf\u00e9 espresso, crema de mascarpone y cacao en polvo, sin hornear',
          'El aut\u00e9ntico siempre se hornea a 180\u00b0C',
          'El aut\u00e9ntico lleva frutas frescas'
        ],
        correctIndex: 1,
        explanation: 'El tiramis\u00fa aut\u00e9ntico es un postre fr\u00edo: bizcochos de Soletta (Savoiardi) empapados en caf\u00e9 espresso, capas de crema de mascarpone con yemas de huevo y az\u00facar, espolvoreado con cacao en polvo amargo. Nunca se hornea.'
      }
    ]
  }, 100, 1);

  console.log('Cocina Italiana Tradicional completed (6 modules, 18 lessons)');

  // ===========================================
  // ===========================================
  // CURSO 4: DESARROLLO WEB COMPLETO
  // ===========================================
  console.log('\n💻 Creating Desarrollo Web Completo course...');

  const webCourse = await createCourse(
    'course-desarrollo-web',
    'Desarrollo Web Completo',
    'Aprende a crear sitios web profesionales desde cero. HTML, CSS, JavaScript, React y Node.js.',
    'Programacion',
    'beginner',
    20,
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop'
  );

  const webM1 = await createModule('web-mod-1', webCourse.id, 'HTML y CSS: Los Cimientos del Web', 1);

  await createLesson('web-1-1', webM1.id, 'HTML: La Estructura de la Web', 'reading', {
    introduction: 'HTML (HyperText Markup Language) es el lenguaje que da estructura a todas las paginas web.',
    content: `ETIQUETAS HTML BASICAS:\n\nEstructura basica:\n<!DOCTYPE html>\n<html lang="es">\n<head>\n  <meta charset="UTF-8">\n  <title>Mi pagina</title>\n</head>\n<body>\n  <h1>Titulo principal</h1>\n  <p>Parrafo de texto</p>\n</body>\n</html>\n\nETIQUETAS DE TEXTO:\n<h1> a <h6> - Titulos\n<p> - Parrafos\n<strong> - Negrita\n<em> - Italica\n\nETIQUETAS SEMANTICAS:\n<header>, <nav>, <main>, <section>, <article>, <footer>\n\nFORMULARIOS:\n<form>, <input>, <textarea>, <select>, <button>\n\nREGLAS DE ORO:\n1. Usa etiquetas semanticas\n2. Siempre incluye alt en imagenes\n3. Un solo h1 por pagina`,
    keyPoints: ['HTML da estructura a la web', 'Usa etiquetas semanticas', 'Un solo h1 por pagina', 'Siempre agrega alt a imagenes']
  }, 20, 1);

  await createLesson('web-1-2', webM1.id, 'CSS: El Estilo Visual', 'reading', {
    introduction: 'CSS controla la apariencia visual: colores, fuentes, espaciado, layouts y animaciones.',
    content: `SELECTORES CSS:\n- p { color: blue; } (elemento)\n- .clase { } (clase)\n- #id { } (ID)\n\nBOX MODEL:\ncontent -> padding -> border -> margin\n\nFLEXBOX (layout 1D):\ndisplay: flex; justify-content: center;\n\nGRID (layout 2D):\ndisplay: grid; grid-template-columns: 1fr 2fr;\n\nRESPONSIVE:\n@media (max-width: 768px) { ... }\n\nUNIDADES: px, %, em, rem, vh, vw`,
    keyPoints: ['Flexbox para layouts 1D, Grid para 2D', 'Siempre usa responsive design', 'Las variables CSS mejoran mantenibilidad']
  }, 20, 2);

  await createLesson('web-1-3', webM1.id, 'Ejercicio: Tu Primera Pagina Web', 'coding', {
    instructions: 'Crea una pagina web completa con HTML y CSS:',
    exercise: {
      task: 'Crea una pagina de perfil personal',
      challenges: [
        {
          id: 'web-html-1',
          description: 'Escribe la estructura HTML basica con DOCTYPE, head y body',
          initialCode: '<!DOCTYPE html>\n<html lang="es">\n<head>\n  <!-- charset y title -->\n</head>\n<body>\n  <!-- h1 con tu nombre -->\n</body>\n</html>',
          hint: 'Usa <meta charset="UTF-8"> y <title>Mi Perfil</title>',
          solution: '<!DOCTYPE html>\n<html lang="es">\n<head>\n  <meta charset="UTF-8">\n  <title>Mi Perfil</title>\n</head>\n<body>\n  <h1>Juan Perez</h1>\n</body>\n</html>'
        }
      ]
    }
  }, 40, 3);

  const webM2 = await createModule('web-mod-2', webCourse.id, 'JavaScript: Interactividad', 2);

  await createLesson('web-2-1', webM2.id, 'JavaScript Basico', 'reading', {
    introduction: 'JavaScript da vida interactiva a tus paginas web.',
    content: `VARIABLES:\nlet nombre = 'Juan'; (mutable)\nconst edad = 25; (inmutable)\n\nTIPOS: string, number, boolean, null, undefined, array, object\n\nFUNCIONES:\nconst saludar = (nombre) => \`Hola \${nombre}!\`;\n\nCONDICIONALES: if/else\nBUCLES: for, forEach, map, filter\n\nDOM:\ndocument.querySelector('#id')\nbtn.addEventListener('click', () => {})\n\nEVENTOS: click, submit, keydown, input`,
    keyPoints: ['Usa const por defecto', 'Arrow functions modernas', 'DOM para manipular la pagina', 'Maneja errores con try/catch']
  }, 20, 1);

  await createLesson('web-2-2', webM2.id, 'DOM y Eventos', 'quiz', {
    questions: [
      { question: 'Diferencia entre let y const?', options: ['No hay diferencia', 'let reasigna, const no', 'const es mas rapido', 'let es para strings'], correctIndex: 1, explanation: 'const no puede reasignarse. let si.' },
      { question: 'Metodo para seleccionar por ID?', options: ['document.getElement()', 'document.querySelector("#id")', 'document.findById()', 'document.get("id")'], correctIndex: 1, explanation: 'querySelector usa selectores CSS.' },
      { question: 'Que hace .map() en un array?', options: ['Filtra', 'Crea nuevo array transformando cada elemento', 'Ordena', 'Elimina duplicados'], correctIndex: 1, explanation: '.map() crea un nuevo array aplicando una funcion a cada elemento.' }
    ]
  }, 30, 2);

  const webM3 = await createModule('web-mod-3', webCourse.id, 'React: Interfaces Modernas', 3);

  await createLesson('web-3-1', webM3.id, 'React: Componentes y JSX', 'reading', {
    introduction: 'React es la libreria mas popular para interfaces de usuario.',
    content: `COMPONENTE:\nfunction MiBoton() {\n  return <button>Haz click</button>;\n}\n\nPROPS:\nfunction Saludo({ nombre }) {\n  return <h1>Hola {nombre}!</h1>;\n}\n\nESTADO:\nconst [count, setCount] = useState(0);\n\nEFECTOS:\nuseEffect(() => { ... }, [dependencia]);\n\nREGLAS:\n1. Nombres con mayuscula\n2. Props son solo lectura\n3. Estado es inmutable`,
    keyPoints: ['Componentes reutilizables', 'useState para estado', 'useEffect para efectos', 'Siempre incluye key en listas']
  }, 25, 1);

    // MÓDULO 4: Examen Final del Curso de Desarrollo Web
  const webM4 = await createModule('web-mod-4', webCourse.id, 'Examen Final: Demuestra tu Dominio del Desarrollo Web', 4);

  await createLesson('web-4-1', webM4.id, 'Quiz Final: Desarrollo Web Completo', 'quiz', {
    questions: [
      {
        question: '¿Qué etiqueta HTML se usa para crear un enlace de hipertexto?',
        options: [
          '<link>',
          '<a>',
          '<href>',
          '<url>'
        ],
        correctIndex: 1,
        explanation: "La etiqueta <a> (anchor) crea enlaces de hipertexto. Se usa con el atributo href para especificar la URL de destino. Ejemplo: <a href='https://google.com'>Google</a>."
      },
      {
        question: '¿Qué propiedad CSS se usa para cambiar el color de fondo?',
        options: [
          'color',
          'background-color',
          'background-style',
          'bg-color'
        ],
        correctIndex: 1,
        explanation: "background-color establece el color de fondo. La propiedad 'color' cambia el color del texto, no del fondo."
      },
      {
        question: '¿Qué es el "box model" en CSS y por qué es importante?',
        options: [
          'Un modelo 3D para renderizar elementos',
          'El sistema que define cómo se calcula el tamaño y espaciado: contenido + padding + border + margin',
          'Una librería para crear layouts',
          'Un tipo de grid para diseño responsivo'
        ],
        correctIndex: 1,
        explanation: 'El box model define que cada elemento es una caja con 4 capas: contenido (content), relleno (padding), borde (border) y margen (margin). Comprenderlo es esencial para controlar el diseño.'
      },
      {
        question: "¿Qué hace document.querySelector con selector ID en JavaScript?",
        options: [
          'Selecciona TODOS los elementos con esa clase',
          'Selecciona el primer elemento que coincida con el selector CSS dado',
          'Crea un nuevo elemento con ese ID',
          'Elimina el elemento con ese ID'
        ],
        correctIndex: 1,
        explanation: "querySelector selecciona el primer elemento que coincida con el selector CSS. El prefijo # indica un ID, y el punto (.) indica una clase."
      },
      {
        question: '¿Qué es "event delegation" en JavaScript?',
        options: [
          'Pasar eventos de un componente a otro',
          'Adjuntar un único listener a un elemento padre que maneja eventos de sus hijos',
          'Crear eventos personalizados',
          'Eliminar listeners después de usarlos'
        ],
        correctIndex: 1,
        explanation: 'Event delegation adjunta un único listener al padre en lugar de uno por cada hijo. Es más eficiente y funciona con elementos aún no creados.'
      },
      {
        question: '¿Qué es JSX en React?',
        options: [
          'Un lenguaje de programación nuevo',
          'Una sintaxis que permite escribir HTML dentro de JavaScript que se transforma en React.createElement()',
          'Un framework CSS para React',
          'Un type checker como TypeScript'
        ],
        correctIndex: 1,
        explanation: 'JSX (JavaScript XML) es una extensión de sintaxis que parece HTML pero se compila a JavaScript mediante React.createElement().'
      },
      {
        question: '¿Qué es un "componente funcional" en React?',
        options: [
          'Una clase que extiende React.Component',
          'Una función que recibe props como parámetro y retorna JSX',
          'Una función que solo puede retornar strings',
          'Un archivo de configuración de React'
        ],
        correctIndex: 1,
        explanation: 'Los componentes funcionales son funciones que reciben props (propiedades) y retornan JSX. Son la forma moderna de crear componentes en React.'
      },
      {
        question: '¿Qué es el "Virtual DOM" y por qué React lo usa?',
        options: [
          'Una copia del DOM en una base de datos',
          'Una representación ligera en memoria del DOM real que permite actualizaciones eficientes',
          'Un reemplazo completo del DOM del navegador',
          'Una herramienta de depuración del navegador'
        ],
        correctIndex: 1,
        explanation: 'El Virtual DOM es una copia ligera del DOM real en memoria. React compara el anterior con el nuevo y solo actualiza las partes que cambiaron, mucho más rápido que re-renderizar todo.'
      },
      {
        question: '¿Qué hace "display: flex" en CSS y por qué es importante?',
        options: [
          'Oculta el elemento completamente',
          'Crea un contenedor flexible que alinea y distribuye hijos de forma sencilla',
          'Muestra el elemento como una tabla',
          'Activa animaciones CSS'
        ],
        correctIndex: 1,
        explanation: 'Flexbox simplifica enormemente el alineamiento y distribución de elementos. Con justify-content, align-items y flex-direction se crean layouts que antes requerían hacks complejos.'
      },
      {
        question: '¿Qué es "responsive design" y qué herramienta CSS es fundamental?',
        options: [
          'Diseñar siempre para pantallas grandes',
          'Diseño que se adapta a diferentes tamaños de pantalla usando media queries y unidades relativas',
          'Usar siempre tamaños fijos en píxeles',
          'Crear una app móvil separada'
        ],
        correctIndex: 1,
        explanation: 'Responsive design asegura que el sitio se vea bien en cualquier dispositivo. Las @media queries aplican estilos diferentes según el tamaño de pantalla.'
      }
    ]
  }, 100, 1);

console.log('Desarrollo Web completed (4 modules, 7 lessons)');


  // ===========================================
  // CURSO 5: MARKETING DIGITAL
  // ===========================================
  console.log('\n📣 Creating Marketing Digital course...');

  const marketingCourse = await createCourse(
    'course-marketing-digital',
    'Marketing Digital Moderno',
    'Domina SEO, redes sociales, email marketing y analytics.',
    'Marketing',
    'beginner',
    14,
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop'
  );

  const mktM1 = await createModule('mkt-mod-1', marketingCourse.id, 'Fundamentos del Marketing Digital', 1);

  await createLesson('mkt-1-1', mktM1.id, 'Que es el Marketing Digital', 'reading', {
    introduction: 'El marketing digital usa canales online para promocionar productos. Permite medir cada accion en tiempo real.',
    content: `LOS 4 PILARES:\n1. ATRAER: SEO, contenido, redes sociales\n2. CONVERTIR: Landing pages, lead magnets\n3. CERRAR: Email marketing, CRM\n4. DELEITAR: Contenido de valor, fidelizacion\n\nFUNNEL:\nTOFU: Conocimiento\nMOFU: Interes\nBOFU: Decision\n\nKPIs:\n- CAC: Costo por adquisicion\n- LTV: Valor de vida del cliente\n- ROI: Retorno de inversion`,
    keyPoints: ['Atraer, Convertir, Cerrar, Deleitar', 'Funnel guia al cliente', 'CAC < LTV para rentabilidad', 'Inbound mas efectivo']
  }, 20, 1);

  await createLesson('mkt-1-2', mktM1.id, 'Conceptos Clave', 'quiz', {
    questions: [
      { question: 'Que es un funnel de marketing?', options: ['Un embudo fisico', 'El proceso de conversion de visitante a cliente', 'Un tipo de grafico', 'Una herramienta email'], correctIndex: 1, explanation: 'El funnel representa las etapas del cliente.' },
      { question: 'Que es el CAC?', options: ['Costo total del producto', 'Cuanto cuesta conseguir un cliente', 'Precio de venta', 'Ganancia'], correctIndex: 1, explanation: 'CAC = gasto en marketing / clientes nuevos.' },
      { question: 'Diferencia inbound vs outbound?', options: ['No hay', 'Inbound atrae con contenido; outbound interrumpe con publicidad', 'Inbound es mas caro', 'Outbound solo TV'], correctIndex: 1, explanation: 'Inbound genera confianza, outbound interrumpe.' }
    ]
  }, 25, 2);

  const mktM2 = await createModule('mkt-mod-2', marketingCourse.id, 'SEO: Posicionamiento en Buscadores', 2);

  await createLesson('mkt-2-1', mktM2.id, 'SEO On-Page y Off-Page', 'reading', {
    introduction: 'SEO posiciona tu sitio en Google. El 75% de usuarios no pasa de la primera pagina.',
    content: `SEO ON-PAGE:\n1. Palabras clave en titulo, meta, H1, URL\n2. Contenido 1500+ palabras, original\n3. Technical SEO: velocidad, responsive, HTTPS\n4. Meta tags: title 50-60 chars, description 150-160\n\nSEO OFF-PAGE:\n1. Backlinks de calidad > cantidad\n2. Guest posting, directorios\n3. Menciones en redes sociales\n\nRANKING FACTORS:\n- Contenido (40%)\n- Backlinks (30%)\n- UX (20%)\n- Technical (10%)\n\nHERRAMIENTAS: Google Search Console, Analytics, Ubersuggest`,
    keyPoints: ['75% no pasa de pagina 1', 'Contenido es el factor mas importante', 'Backlinks de calidad', 'Technical SEO obligatorio']
  }, 25, 1);

  await createLesson('mkt-2-2', mktM2.id, 'SEO Practico', 'quiz', {
    questions: [
      { question: 'Longitud ideal de title tag?', options: ['10-20 chars', '50-60 chars', '100-120 chars', 'Sin limite'], correctIndex: 1, explanation: 'Google muestra ~60 caracteres.' },
      { question: 'Que es un backlink?', options: ['Link que borra', 'Enlace de otro sitio hacia el tuyo', 'Boton de retroceso', 'Enlace interno'], correctIndex: 1, explanation: 'Backlinks son votos de confianza de otros sitios.' },
      { question: 'Que son Core Web Vitals?', options: ['Estadisticas de visitas', 'Metricas de UX: velocidad, interactividad, estabilidad', 'Tipos de contenido', 'Algoritmos'], correctIndex: 1, explanation: 'LCP, FID, CLS son factores de ranking de Google.' }
    ]
  }, 30, 2);

  const mktM3 = await createModule('mkt-mod-3', marketingCourse.id, 'Redes Sociales y Contenido', 3);

  await createLesson('mkt-3-1', mktM3.id, 'Estrategia de Redes Sociales', 'reading', {
    introduction: 'No se trata de estar en todas las plataformas, sino donde ESTA tu audiencia.',
    content: `PLATAFORMAS:\n- Instagram: Visual, 18-34 anos\n- TikTok: Video corto, Gen Z\n- LinkedIn: Profesional, B2B\n- YouTube: Video largo, evergreen\n\nESTRATEGIA:\n1. Define buyer persona\n2. Elige 2-3 plataformas maximo\n3. Calendario de contenido\n4. Regla 80/20: 80% valor, 20% venta\n5. Mide engagement, no solo seguidores\n\nHERRAMIENTAS: Canva, CapCut, Buffer`,
    keyPoints: ['2-3 plataformas donde esta tu audiencia', 'Regla 80/20', 'Primeros 3 segundos del video son criticos', 'Engagement > seguidores']
  }, 25, 1);

  console.log('Marketing Digital completed (3 modules, 5 lessons)');

  // ===========================================
  // CURSO 6: FOTOGRAFIA DIGITAL
  // ===========================================
  console.log('\n📸 Creating Fotografia Digital course...');

  const fotoCourse = await createCourse(
    'course-fotografia',
    'Fotografia Digital Creativa',
    'Aprende composicion, iluminacion, retrato y edicion digital.',
    'Arte',
    'beginner',
    12,
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&h=400&fit=crop'
  );

  const fotoM1 = await createModule('foto-mod-1', fotoCourse.id, 'Fundamentos de Fotografia', 1);

  await createLesson('foto-1-1', fotoM1.id, 'El Triangulo de Exposicion', 'reading', {
    introduction: 'La exposicion correcta se controla con apertura, velocidad e ISO.',
    content: `EL TRIANGULO:\n1. APERTURA (f-stop)\n   f/1.8 = mucha luz, fondo desenfocado\n   f/16 = poca luz, todo enfocado\n   Retrato: f/1.8-2.8 | Paisaje: f/8-11\n\n2. VELOCIDAD\n   1/1000s = congela accion\n   1/60s = limite mano firme\n   30s = efecto seda\n\n3. ISO\n   ISO 100 = maxima calidad\n   ISO 3200 = mucho ruido\n   Usa lo mas bajo posible\n\nREGLA DE LOS TERCIOS:\nDivide en 9 cuadros, sujeto en intersecciones.\nComposiciones dinamicas > centrar.`,
    keyPoints: ['f bajo = bokeh', 'Velocidad congela o muestra movimiento', 'ISO bajo = mejor calidad', 'Regla de los tercios mejora todo']
  }, 25, 1);

  await createLesson('foto-1-2', fotoM1.id, 'Exposicion y Composicion', 'quiz', {
    questions: [
      { question: 'Para fondo desenfocado, que apertura?', options: ['f/16', 'f/1.8', 'f/8', 'f/22'], correctIndex: 1, explanation: 'f/1.8 crea maximo desenfoque (bokeh).' },
      { question: 'Que es la regla de los tercios?', options: ['Dividir en 3 partes iguales', 'Componer en puntos de interseccion de grilla 3x3', 'Tomar 3 fotos', 'Usar 3 focos'], correctIndex: 1, explanation: 'Grilla 3x3, sujeto en intersecciones.' },
      { question: 'Para rio con efecto seda?', options: ['1/1000s', '1/60s', '1s o mas', '1/200s'], correctIndex: 2, explanation: 'Velocidad lenta captura agua como seda.' }
    ]
  }, 30, 2);

  const fotoM2 = await createModule('foto-mod-2', fotoCourse.id, 'Iluminacion y Edicion', 2);

  await createLesson('foto-2-1', fotoM2.id, 'Iluminacion Natural y Artificial', 'reading', {
    introduction: 'La luz es el elemento mas importante en fotografia.',
    content: `LUZ NATURAL:\n- Golden hour: 1h despues/antes del sol\n- Blue hour: antes/despues del sol\n- Evita luz dura del mediodia\n\nDIRECCION:\n- Frontal: uniforme\n- Lateral: dramatismo\n- Contraluz: siluetas\n\nEDICION:\n1. Exposicion\n2. Contraste\n3. Highlights/Shadows\n4. White balance\n5. Recorte\n6. Nitidez\n\nSiempre edita en RAW.`,
    keyPoints: ['Golden hour es la mejor luz', 'Luz lateral crea dramatismo', 'RAW > JPEG para edicion', 'Edicion es parte creativa']
  }, 25, 1);

  console.log('Fotografia Digital completed (2 modules, 4 lessons)');

  // ===========================================
  // CURSO 7: PRODUCTIVIDAD PERSONAL
  // ===========================================
  console.log('\n⏰ Creating Productividad Personal course...');

  const prodCourse = await createCourse(
    'course-productividad',
    'Productividad Personal de Alto Rendimiento',
    'Optimiza tu tiempo, energia y atencion con metodos comprobados.',
    'Desarrollo Personal',
    'beginner',
    10,
    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=400&fit=crop'
  );

  const prodM1 = await createModule('prod-mod-1', prodCourse.id, 'Gestion del Tiempo', 1);

  await createLesson('prod-1-1', prodM1.id, 'Metodos de Gestion del Tiempo', 'reading', {
    introduction: 'Gestionar tiempo no es trabajar mas horas, sino trabajar en lo correcto.',
    content: `METODOS:\n1. MATRIZ DE EISENHOWER\n   Urgente+Importante: HACER\n   Importante+No urgente: PLANIFICAR\n   Urgente+No importante: DELEGAR\n   Ni urgente ni importante: ELIMINAR\n\n2. POMODORO\n   25 min foco + 5 min descanso\n   Cada 4 pomodoros: 15-30 min largo\n\n3. TIME BLOCKING\n   Bloquea horas en calendario\n   Batching de tareas similares\n\n4. MIT\n   1-3 tareas mas importantes ANTES de email\n\n5. 2-MINUTE RULE\n   Si toma < 2 min, hazlo AHORA\n\nENERGIA > TIEMPO\n   Trabaja en horas de mayor energia\n   Tareas dificiles = manana\n   Tareas simples = tarde`,
    keyPoints: ['Eisenhower clasifica por urgencia/importancia', 'Pomodoro: 25+5', 'Multitasking reduce 40%', 'Energia > tiempo']
  }, 20, 1);

  await createLesson('prod-1-2', prodM1.id, 'Metodos de Productividad', 'quiz', {
    questions: [
      { question: 'Urgentes pero no importantes?', options: ['Hacer', 'Delegar', 'Planificar', 'Eliminar'], correctIndex: 1, explanation: 'Delegar libera tiempo para lo importante.' },
      { question: 'Que es Pomodoro?', options: ['Cocinar tomates', '25 min foco + 5 min descanso', 'Dieta italiana', 'Metodo para dormir'], correctIndex: 1, explanation: 'Bloques de 25 min de foco total.' },
      { question: 'Por que multitasking es malo?', options: ['Es mito', 'Reduce productividad 40%', 'Mas lento pero preciso', 'Solo malo para creativas'], correctIndex: 1, explanation: 'El cerebro no puede hacer dos tareas cognitivas a la vez.' }
    ]
  }, 25, 2);

  const prodM2 = await createModule('prod-mod-2', prodCourse.id, 'Habitos y Enfoque', 2);

  await createLesson('prod-2-1', prodM2.id, 'Construyendo Habitos que Duran', 'reading', {
    introduction: 'El 40% de tus acciones son habitos. Cambiar tus habitos cambia tu vida.',
    content: `CICLO DEL HABITO:\n1. SENAL: detonante\n2. RUTINA: accion\n3. RECOMPENSA: beneficio\n\nCREAR NUEVO HABITO:\n- Empezar MINUSCULO (2 minutos)\n- Stack: "Despues de X, hare Y"\n- Identidad: "soy corredor" > "quiero correr"\n\nROMPER HABITO:\n- Invisible la senal\n- Dificil la rutina\n- Insatisfactoria la recompensa\n\nREGLA DEL 1%:\n1.01^365 = 37x mejor en 1 ano`,
    keyPoints: ['Senal + Rutina + Recompensa', 'Habito de 2 minutos', 'Identidad guia el habito', '1% diario = 37x en 1 ano']
  }, 20, 1);

  await createLesson('prod-2-2', prodM2.id, 'Habitos y Enfoque', 'quiz', {
    questions: [
      { question: 'Clave para nuevo habito?', options: ['Meta grande', 'Algo tan pequeno que sea imposible fallar', '66 dias', 'Cambiar todo de golpe'], correctIndex: 1, explanation: 'Empezar minusculo es la clave de James Clear.' },
      { question: 'Que es context switching?', options: ['Cambiar idioma', 'Costo cognitivo de cambiar entre tareas', 'Meditacion', 'Cambiar trabajo'], correctIndex: 1, explanation: 'Cada cambio cuesta 15-25 min de reconcentracion.' },
      { question: 'Regla del 1%?', options: ['1% ingresos a caridad', 'Mejorar 1% diario = 37x en 1 ano', 'Trabajar 1% del dia', '1% cafeina'], correctIndex: 1, explanation: 'Consistencia minima diaria supera cambios dramaticos.' }
    ]
  }, 25, 2);

  console.log('Productividad Personal completed (2 modules, 4 lessons)');

  // ===========================================
  // CURSO 8: EMPRENDIMIENTO
  // ===========================================
  console.log('\n🚀 Creating Emprendimiento course...');

  const emprendCourse = await createCourse(
    'course-emprendimiento',
    'Emprendimiento: De Idea a Negocio',
    'Transforma tu idea en negocio real. MVP, lean startup, pitch deck.',
    'Negocios',
    'beginner',
    14,
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop'
  );

  const empM1 = await createModule('emp-mod-1', emprendCourse.id, 'Validacion de Ideas', 1);

  await createLesson('emp-1-1', empM1.id, 'Validacion de Ideas de Negocio', 'reading', {
    introduction: 'El 90% de startups fallan porque construyen algo que nadie quiere.',
    content: `VALIDACION:\n1. IDENTIFICA EL PROBLEMA\n   - Que problema resuelves?\n   - Para quien?\n   - Cuanto les cuesta no resolverlo?\n\n2. HABLA CON CLIENTES (10-20 entrevistas)\n   - "Cuentame como manejas [problema]"\n   - NO preguntes si les gusta tu idea\n\n3. CREA UN MVP\n   - Version mas simple que resuelve el problema\n   - Landing page + formulario\n   - Video explicativo\n   - Concierge MVP (hacerlo manualmente)\n\n4. MIDE Y APRENDE\n   - Conversion > 5% es bueno\n   - Disposicion a pagar\n   - Signups para waitlist\n\nCANVAS DE MODELO DE NEGOCIO:\n9 bloques: clientes, propuesta de valor,\ncanales, ingresos, costos, etc.`,
    keyPoints: ['90% fallan por no validar', '10-20 entrevistas ANTES de construir', 'MVP = prueba mas barata', 'Canvas define la estrategia']
  }, 25, 1);

  await createLesson('emp-1-2', empM1.id, 'Conceptos de Emprendimiento', 'quiz', {
    questions: [
      { question: 'Que es un MVP?', options: ['Producto mas barato', 'Version mas simple que valida la idea', 'Prototipo grafico', 'Primer release completo'], correctIndex: 1, explanation: 'MVP permite medir comportamiento real de clientes.' },
      { question: 'Error mas comun?', options: ['Sin dinero', 'Construir sin validar primero', 'Miedo a empezar', 'Nombre incorrecto'], correctIndex: 1, explanation: '"Build it and they will come" es el error #1.' },
      { question: 'Que es el Canvas?', options: ['Lienzo para pintar', 'Herramienta visual de 9 bloques de estrategia', 'Plan de 50 paginas', 'Hoja de calculo'], correctIndex: 1, explanation: 'Canvas condensa la estrategia en 9 bloques visuales.' }
    ]
  }, 30, 2);

  const empM2 = await createModule('emp-mod-2', emprendCourse.id, 'Lean Startup y Growth', 2);

  await createLesson('emp-2-1', empM2.id, 'Metodologia Lean Startup', 'reading', {
    introduction: 'Lean Startup: construir, medir, aprender en ciclos rapidos.',
    content: `CICLO BUILD-MEASURE-LEARN:\n1. CONSTRUIR: version mas simple\n2. MEDIR: datos reales de usuarios\n3. APRENDER: pivot o perseverar\n\nMETRICAS QUE IMPORTAN:\n- Retencion: % que vuelve\n- Revenue: cuanto pagan\n- Referral: cuantos recomiendan\nNO: likes, visitas (metricas vanidosas)\n\nPIVOT:\n- Problem: cambia el problema\n- Solution: cambia la solucion\n- Segment: cambia a quien\n- Channel: cambia como llegas\n\nPRODUCT-MARKET FIT:\n40% de usuarios dirian "muy decepcionado"\nsi el producto desapareciera.\n\nPRIMEROS 100 CLIENTES:\n- Contacto directo\n- Comunidades\n- Content marketing\n- Partnerships\n- PR`,
    keyPoints: ['Build-Measure-Learn', 'Retencion es la metrica clave', 'Pivot = cambiar de direccion', '40% dice "muy decepcionado" = PMF']
  }, 25, 1);

  await createLesson('emp-2-2', empM2.id, 'Lean Startup y Growth', 'quiz', {
    questions: [
      { question: 'Metodologia central de Lean Startup?', options: ['Planificar todo', 'Construir, Medir, Aprender en ciclos rapidos', 'Copiar exitosos', 'Vender antes de construir'], correctIndex: 1, explanation: 'Ciclo rapido de validacion continua.' },
      { question: 'Product-Market Fit se mide con?', options: ['1000 seguidores', '40% dirian "muy decepcionado" si desaparece', 'Landing con 100 signups', '$1000/mes ingresos'], correctIndex: 1, explanation: 'Sean Ellis test: 40%+ = PMF.' },
      { question: 'Que es un pivot?', options: ['Cambiar nombre', 'Cambio de estrategia basado en datos', 'Cerrar negocio', 'Cambiar oficina'], correctIndex: 1, explanation: 'Pivot es cambiar direccion con aprendizaje real.' }
    ]
  }, 30, 2);

  console.log('Emprendimiento completed (2 modules, 4 lessons)');


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
            score: Math.floor(Math.random() * 20) + 80,
            xpEarned: lesson.xpReward,
            timeSpent: Math.floor(Math.random() * 120) + 60,
            attempts: 1,
            completedAt: new Date(),
          },
        });
      }
    }
  }

  console.log('Demo enrollments and progress created');

  console.log('Seed completed successfully!');
  console.log('Courses Summary:');
  console.log('  Fundamentos de IA: 9 modules, 24 lessons (reading, quiz, coding, project, final exam)');
  console.log('  Finanzas Personales: 8 modules, 18 lessons (reading, quiz, coding, project, final exam)');
  console.log('  Cocina Italiana: 6 modules, 18 lessons (reading, quiz, project, final exam)');
    console.log('  Desarrollo Web: 4 modules, 7 lessons (reading, quiz, coding, project, final exam)');
    console.log('  Marketing Digital: 3 modules, 5 lessons (reading, quiz, project)');
    console.log('  Fotografia Digital: 2 modules, 4 lessons (reading, quiz, project)');
    console.log('  Productividad Personal: 2 modules, 4 lessons (reading, quiz, project)');
    console.log('  Emprendimiento: 2 modules, 4 lessons (reading, quiz, project)');
  console.log('Test accounts:');
  console.log('  Admin: admin@duobijac.com / admin123');
  console.log('  Demo: demo@duobijac.com / demo123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
