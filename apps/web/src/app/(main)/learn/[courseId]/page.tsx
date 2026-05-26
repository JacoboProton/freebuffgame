'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, X, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
}

export default function LessonPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [inputAnswer, setInputAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [xpEarned, setXpEarned] = useState<number | null>(null);

  useEffect(() => {
    const demoLessons: Record<string, Lesson> = {
      'ai-lesson-1': { id: 'ai-lesson-1', title: 'Introduccion a la IA', type: 'multiple_choice', content: { question: 'Que es la Inteligencia Artificial?', options: ['Un tipo de robot', 'Sistemas que pueden aprender y tomar decisiones', 'Solo computadoras', 'Un lenguaje de programacion'], correctIndex: 1 }, xpReward: 20 },
    };
    setTimeout(() => { setLesson(demoLessons['ai-lesson-1']); setLoading(false); }, 300);
  }, [courseId]);

  const handleMultipleChoice = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
    setShowResult(true);
    setIsCorrect(index === lesson?.content.correctIndex);
    if (index === lesson?.content.correctIndex) setXpEarned(lesson?.xpReward || 0);
  };

  const handleFillBlank = () => {
    if (showResult) return;
    const correct = inputAnswer.toLowerCase().trim() === String(lesson?.content.correctAnswer).toLowerCase();
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) setXpEarned(lesson?.xpReward || 0);
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (!lesson) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Card className="p-8 text-center"><h2 className="text-xl font-bold mb-4">Leccion no encontrada</h2><Link href="/courses"><Button>Volver</Button></Link></Card></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow-card sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/courses" className="flex items-center gap-2 text-gray-600 hover:text-gray-900"><ArrowLeft className="w-5 h-5" /><span className="font-medium">Volver</span></Link>
          <Badge variant="secondary">+{lesson.xpReward} XP</Badge>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
          <Badge variant="default">{lesson.type.replace('_', ' ')}</Badge>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6 md:p-8">
            {lesson.type === 'multiple_choice' && lesson.content.question && (
              <div>
                <h2 className="text-xl font-semibold mb-6">{lesson.content.question}</h2>
                <div className="space-y-3">
                  {lesson.content.options?.map((option, index) => (
                    <button key={index} onClick={() => handleMultipleChoice(index)} disabled={showResult}
                      className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all ${selectedOption === index ? (isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : showResult && index === lesson.content.correctIndex ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-primary'}`}>
                      <span className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${selectedOption === index ? (isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white') : 'bg-gray-100'}`}>{String.fromCharCode(65 + index)}</span>
                        {option}
                        {showResult && index === lesson.content.correctIndex && <Check className="w-5 h-5 ml-auto text-green-500" />}
                        {showResult && selectedOption === index && !isCorrect && <X className="w-5 h-5 ml-auto text-red-500" />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {lesson.type === 'fill_blank' && (
              <div>
                <p className="text-xl font-semibold mb-6">Completa la frase:</p>
                <input type="text" value={inputAnswer} onChange={e => setInputAnswer(e.target.value)} disabled={showResult} placeholder="Escribe tu respuesta..." className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none text-lg disabled:bg-gray-100 mb-4" />
                {showHint && lesson.content.hint && <div className="flex items-center gap-2 p-3 bg-yellow-100 rounded-lg text-yellow-700"><Lightbulb className="w-5 h-5" /><span className="text-sm">{lesson.content.hint}</span></div>}
                {!showResult && !showHint && <Button variant="ghost" size="sm" onClick={() => setShowHint(true)}><Lightbulb className="w-4 h-4 mr-1" /> Ver pista</Button>}
                {!showResult && <Button onClick={handleFillBlank} disabled={!inputAnswer.trim()}>Verificar</Button>}
                {showResult && <div className={`p-4 rounded-xl flex items-center gap-3 ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}><Check className="w-6 h-6" /><span className="font-medium">{isCorrect ? 'Correcto!' : 'Incorrecto. La respuesta era: ' + lesson.content.correctAnswer}</span></div>}
              </div>
            )}
          </Card>
        </motion.div>
        {showResult && <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 flex justify-end"><Button size="lg">Continuar</Button></motion.div>}
      </main>
    </div>
  );
}
