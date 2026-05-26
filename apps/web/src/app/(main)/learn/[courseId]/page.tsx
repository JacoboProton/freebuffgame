'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, Lightbulb, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JacMascot, ConfettiCelebration, XPPopup } from '@/components/jac-mascot';
import { lessonsAPI, userAPI } from '@/lib/api-client';
import { useUserStore } from '@/stores/user-store';

interface LessonContent {
  question?: string;
  options?: string[];
  correctIndex?: number;
  correctAnswer?: string;
  hint?: string;
}

interface Lesson {
  id: string;
  title: string;
  type: string;
  content: LessonContent;
  xpReward: number;
  moduleTitle?: string;
  courseId?: string;
  courseTitle?: string;
}

type JacMood = 'idle' | 'happy' | 'sad' | 'celebrating' | 'thinking' | 'encouraging';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const { updateLocalStats, fetchStats } = useUserStore();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<{ completed: boolean; score: number; xpEarned: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [inputAnswer, setInputAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [jacMood, setJacMood] = useState<JacMood>('idle');
  const [jacMessage, setJacMessage] = useState<string>('¡Hola! Soy Jac. Vamos a aprender juntos 🐐');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);
  const [leveledUp, setLeveledUp] = useState(false);
  const [startTime] = useState(Date.now());

  // Fetch lesson from API
  useEffect(() => {
    const loadLesson = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch from API - use demo lesson ID for now if courseId doesn't match
        const lessonId = courseId || 'ai-lesson-1';
        
        // For demo purposes, use the first lesson from the course
        // In a real app, we'd navigate to a specific lesson
        const response = await lessonsAPI.getById(lessonId).catch(() => null);
        
        if (response?.lesson) {
          setLesson(response.lesson);
          setProgress(response.progress);
          setJacMessage(`Veo que quieres aprender sobre ${response.lesson.moduleTitle || 'este tema'}. ¡Vamos allá!`);
        } else {
          // Use demo data if API fails
          const demoLessons: Record<string, Lesson> = {
            'ai-lesson-1': { 
              id: 'ai-lesson-1', 
              title: 'Introduccion a la IA', 
              type: 'multiple_choice', 
              content: { 
                question: '¿Qué es la Inteligencia Artificial?', 
                options: ['Un tipo de robot', 'Sistemas que pueden aprender y tomar decisiones', 'Solo computadoras', 'Un lenguaje de programación'], 
                correctIndex: 1,
                hint: 'Piensa en sistemas que pueden pensar como humanos...'
              }, 
              xpReward: 20,
              moduleTitle: 'Introducción a la IA',
              courseTitle: 'Fundamentos de IA'
            },
          };
          
          const demoLesson = demoLessons[courseId] || demoLessons['ai-lesson-1'];
          setLesson(demoLesson);
          setJacMessage('¡Hola! Soy Jac. Vamos a aprender juntos 🐐');
        }
      } catch (err) {
        setError('Error al cargar la lección');
        setJacMood('sad');
        setJacMessage('¡Ups! No pude cargar la lección. ¿Intentamos de nuevo? 😅');
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
  }, [courseId]);

  // Jac reactions based on user actions
  const updateJacReaction = (mood: JacMood, message: string) => {
    setJacMood(mood);
    setJacMessage(message);
    
    // Reset to idle after a while
    setTimeout(() => {
      if (mood !== 'celebrating') {
        setJacMood('idle');
        setJacMessage('¡Sigue así! Tú puedes 🐐');
      }
    }, 3000);
  };

  const handleMultipleChoice = (index: number) => {
    if (showResult) return;
    
    setSelectedOption(index);
    setShowResult(true);
    const correct = index === lesson?.content.correctIndex;
    setIsCorrect(correct);

    if (correct) {
      setJacMood('happy');
      setJacMessage('¡Excelente! ¡Respuesta correcta! 🎉');
      setXpAmount(lesson?.xpReward || 0);
      setShowXP(true);
      setShowConfetti(true);
    } else {
      setJacMood('sad');
      setJacMessage(`Casi... La respuesta correcta era: ${lesson?.content.options?.[lesson.content.correctIndex ?? 0]}`);
    }
  };

  const handleFillBlank = () => {
    if (showResult) return;
    
    const correct = inputAnswer.toLowerCase().trim() === String(lesson?.content.correctAnswer).toLowerCase().trim();
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setJacMood('celebrating');
      setJacMessage('¡Perfecto! ¡Lo lograste! 🌟');
      setXpAmount(lesson?.xpReward || 0);
      setShowXP(true);
      setShowConfetti(true);
    } else {
      setJacMood('thinking');
      setJacMessage(`La respuesta era: ${lesson?.content.correctAnswer}. ¡Sigue intentando! 💪`);
    }
  };

  const handleSubmitProgress = async () => {
    if (!lesson || !showResult) return;

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const score = isCorrect ? 100 : 0;

    try {
      const response = await lessonsAPI.submitProgress(lesson.id, { score, timeSpent });
      
      setProgress(response.progress);
      
      if (response.user) {
        updateLocalStats({
          xp: response.user.xp,
          coins: response.user.coins,
          level: response.user.level,
        });
      }

      if (response.leveledUp) {
        setLeveledUp(true);
        setJacMood('celebrating');
        setJacMessage(`¡LEVEL UP! Ahora eres nivel ${response.newLevel} 🎊`);
        setShowConfetti(true);
      }
    } catch (err) {
      console.error('Error submitting progress:', err);
    }
  };

  const handleContinue = () => {
    if (showResult && !progress?.completed) {
      handleSubmitProgress();
    }
    router.push('/courses');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-4">
        <JacMascot mood="thinking" message="Cargando la lección..." size="lg" showMessage />
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <JacMascot mood="sad" message="¡Algo salió mal!" size="lg" showMessage />
          <h2 className="text-xl font-bold mb-4 mt-4">Lección no encontrada</h2>
          <p className="text-gray-500 mb-4">{error || 'No pudimos cargar esta lección'}</p>
          <Link href="/courses">
            <Button>Volver a Cursos</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Confetti and XP Popup */}
      <ConfettiCelebration show={showConfetti} onComplete={() => setShowConfetti(false)} />
      <XPPopup xp={xpAmount} show={showXP} position="top" />

      {/* Header */}
      <header className="bg-white shadow-card sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/courses" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver</span>
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              +{lesson.xpReward} XP
            </Badge>
            {progress?.completed && (
              <Badge variant="default" className="bg-green-500">
                <Check className="w-4 h-4 mr-1" /> Completada
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Jac mascot with message */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 flex items-start gap-4"
        >
          <JacMascot 
            mood={jacMood} 
            message={jacMessage} 
            size="md" 
            showMessage={true}
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
            {lesson.moduleTitle && (
              <p className="text-gray-500 text-sm">{lesson.moduleTitle}</p>
            )}
          </div>
        </motion.div>

        {/* Lesson Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 md:p-8 relative overflow-hidden">
            {/* Type badge */}
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="capitalize">
                {lesson.type.replace('_', ' ')}
              </Badge>
            </div>

            {/* Multiple Choice */}
            {lesson.type === 'multiple_choice' && lesson.content.question && (
              <div>
                <h2 className="text-xl font-semibold mb-6 pr-20">{lesson.content.question}</h2>
                <div className="space-y-3">
                  {lesson.content.options?.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: showResult ? 1 : 1.02 }}
                      whileTap={{ scale: showResult ? 1 : 0.98 }}
                      onClick={() => handleMultipleChoice(index)}
                      disabled={showResult}
                      className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all ${
                        selectedOption === index
                          ? isCorrect
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : showResult && index === lesson.content.correctIndex
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-primary'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          selectedOption === index
                            ? isCorrect
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                            : 'bg-gray-100'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        {option}
                        {showResult && index === lesson.content.correctIndex && (
                          <Check className="w-5 h-5 ml-auto text-green-500" />
                        )}
                        {showResult && selectedOption === index && !isCorrect && (
                          <X className="w-5 h-5 ml-auto text-red-500" />
                        )}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Fill in the Blank */}
            {lesson.type === 'fill_blank' && (
              <div>
                <p className="text-xl font-semibold mb-6">Completa la frase:</p>
                
                {/* Show the question with blank */}
                <div className="bg-gray-50 p-4 rounded-xl mb-6 text-lg">
                  {lesson.content.question?.split('___').map((part, i, arr) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <span className={`inline-block min-w-[100px] border-b-2 mx-1 ${
                          showResult 
                            ? isCorrect 
                              ? 'border-green-500 bg-green-100' 
                              : 'border-red-500 bg-red-100'
                            : 'border-primary'
                        } px-2 py-1 text-center font-semibold`}>
                          {showResult && isCorrect && lesson.content.correctAnswer}
                          {showResult && !isCorrect && inputAnswer}
                          {!showResult && '___'}
                        </span>
                      )}
                    </span>
                  ))}
                </div>

                <input
                  type="text"
                  value={inputAnswer}
                  onChange={(e) => setInputAnswer(e.target.value)}
                  disabled={showResult}
                  placeholder="Escribe tu respuesta..."
                  className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none text-lg disabled:bg-gray-100 mb-4"
                />

                {/* Hint */}
                {showHint && lesson.content.hint && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center gap-2 p-3 bg-yellow-100 rounded-lg text-yellow-700 mb-4"
                  >
                    <Lightbulb className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{lesson.content.hint}</span>
                  </motion.div>
                )}

                {/* Actions */}
                {!showResult && !showHint && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setShowHint(true);
                      setJacMood('thinking');
                      setJacMessage('¡Pista!灵 Piensa bien la respuesta...');
                    }}
                  >
                    <Lightbulb className="w-4 h-4 mr-1" /> Ver pista
                  </Button>
                )}

                {!showResult && (
                  <Button 
                    onClick={handleFillBlank} 
                    disabled={!inputAnswer.trim()}
                    className="mt-2"
                  >
                    Verificar
                  </Button>
                )}

                {/* Result */}
                {showResult && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-xl flex items-center gap-3 ${
                      isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {isCorrect ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <X className="w-6 h-6" />
                    )}
                    <span className="font-medium">
                      {isCorrect 
                        ? '¡Correcto! ¡Bien hecho!' 
                        : `Incorrecto. La respuesta era: ${lesson.content.correctAnswer}`}
                    </span>
                  </motion.div>
                )}
              </div>
            )}

            {/* Completed state */}
            {showResult && progress?.completed && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
              >
                <Trophy className="w-6 h-6 text-yellow-500" />
                <div>
                  <p className="font-semibold text-green-800">¡Lección completada!</p>
                  <p className="text-sm text-green-600">
                    {progress.xpEarned > 0 ? `+${progress.xpEarned} XP ganado` : 'Ya completaste esta lección'}
                  </p>
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Continue button */}
        {showResult && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex justify-end gap-4"
          >
            <Button variant="outline" onClick={() => router.push('/courses')}>
              Salir
            </Button>
            <Button size="lg" onClick={handleContinue}>
              {progress?.completed ? 'Continuar' : 'Guardar y continuar'}
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}