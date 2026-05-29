'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Trophy, Zap, Clock, ArrowLeft, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';
import { JacMascot, XPPopup, ConfettiCelebration } from '@/components/jac-mascot';
import { useClerkAPIs } from '@/lib/clerk-api';
import { useAuthStore } from '@/stores/auth-store';

// Game types
type GameType = 'speed-match' | 'word-puzzle' | 'true-false';

interface Game {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  bestScore: number | null;
}

// Speed Match Game Component
function SpeedMatchGame({ onComplete, onExit }: { onComplete: (score: number) => void; onExit: () => void }) {
  const [pairs, setPairs] = useState<{ id: number; text: string; matched: boolean }[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [mood, setMood] = useState<'idle' | 'happy' | 'sad' | 'celebrating' | 'thinking' | 'encouraging'>('idle');
  const [message, setMessage] = useState('¡Encuentra las parejas!');

  const concepts = [
    'IA', 'ML', 'Python', 'Datos', 'TensorFlow', 'Red Neuronal',
    'Deep Learning', 'Algoritmo', 'Modelo', 'Entrenamiento',
    'Validación', 'Predicción', 'Clasificación', 'Regresión', 'Clustering'
  ];

  useEffect(() => {
    const shuffled = [...concepts].sort(() => Math.random() - 0.5).slice(0, 8);
    const gamePairs = [...shuffled, ...shuffled]
      .map((text, i) => ({ id: i, text, matched: false }))
      .sort(() => Math.random() - 0.5);
    setPairs(gamePairs);
  }, []);

  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameOver(true);
          setMood('sad');
          setMessage('¡Se acabó el tiempo!');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver]);

  const handleSelect = (id: number) => {
    if (selected.length === 1) {
      const first = pairs.find((p) => p.id === selected[0]);
      const second = pairs.find((p) => p.id === id);
      
      if (first && second && first.text === second.text && first.id !== second.id) {
        setPairs(pairs.map(p => p.id === selected[0] || p.id === id ? { ...p, matched: true } : p));
        setScore(s => s + 10);
        setMood('happy');
        setMessage('¡Par encontrados!');
        setTimeout(() => setMood('thinking'), 500);
      }
      setSelected([]);
      
      if (pairs.filter(p => !p.matched).length === 2) {
        setGameOver(true);
        setMood('celebrating');
        setMessage('¡Juego completado!');
        onComplete(score + 10);
      }
    } else {
      setSelected([id]);
      setMood('thinking');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onExit}><ArrowLeft className="w-5 h-5 mr-2" />Salir</Button>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-yellow-500" />+{score}
            </Badge>
            <Badge variant={timeLeft <= 10 ? 'danger' : 'secondary'} className="flex items-center gap-1">
              <Clock className="w-4 h-4" />{timeLeft}s
            </Badge>
          </div>
        </div>

        {/* Game Board */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {pairs.map((pair) => (
            <motion.button
              key={pair.id}
              whileHover={{ scale: pair.matched ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => !pair.matched && !selected.includes(pair.id) && !gameOver && handleSelect(pair.id)}
              disabled={pair.matched || gameOver}
              className={`
                aspect-square rounded-xl text-sm font-bold transition-all
                ${pair.matched 
                  ? 'bg-primary text-white' 
                  : selected.includes(pair.id)
                    ? 'bg-secondary text-white ring-4 ring-secondary/30'
                    : 'bg-white hover:bg-primary/10 border-2 border-gray-200'}
              `}
            >
              {pair.matched || selected.includes(pair.id) ? pair.text : '?'}
            </motion.button>
          ))}
        </div>

        {/* Jac */}
        <div className="flex justify-center">
          <JacMascot mood={mood} message={message} size="md" />
        </div>
      </div>
    </div>
  );
}

// Word Puzzle Game Component
function WordPuzzleGame({ onComplete, onExit }: { onComplete: (score: number) => void; onExit: () => void }) {
  const words = ['ALGORITMO', 'MACHINE', 'TENSOR', 'NEURONA', 'PYTHON', 'DATOS'];
  const [currentWord, setCurrentWord] = useState('');
  const [scrambled, setScrambled] = useState<{ id: number; letter: string; placed: boolean }[]>([]);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [totalRounds] = useState(5);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [mood, setMood] = useState<'idle' | 'happy' | 'sad' | 'celebrating' | 'thinking' | 'encouraging'>('idle');
  const [message, setMessage] = useState('Ordena las letras para formar la palabra');

  useEffect(() => {
    const word = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(word);
    const letters = word.split('').sort(() => Math.random() - 0.5);
    setScrambled(letters.map((l, i) => ({ id: i, letter: l, placed: false })));
    setAnswer('');
  }, [round]);

  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (round >= totalRounds) {
            setGameOver(true);
            onComplete(score);
          } else {
            setRound(r => r + 1);
            setTimeLeft(30);
            setMood('sad');
            setMessage('¡Tiempo agotado!');
            setTimeout(() => setMood('thinking'), 1000);
          }
          return 30;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver, round, score]);

  const selectLetter = (id: number) => {
    const letter = scrambled.find(l => l.id === id);
    if (!letter || letter.placed) return;
    
    setScrambled(scrambled.map(l => l.id === id ? { ...l, placed: true } : l));
    setAnswer(a => a + letter.letter);
    setMood('thinking');
  };

  const removeLetter = (index: number) => {
    const letterToRemove = answer[index];
    const newAnswer = answer.split('').filter((_, i) => i !== index).join('');
    setAnswer(newAnswer);
    
    const unplaced = scrambled.map(l => {
      if (l.placed && l.letter === letterToRemove) {
        return {...l, placed: false};
      }
      return l;
    });
    setScrambled(unplaced);
  };

  const submitAnswer = () => {
    if (answer.length !== currentWord.length) return;
    
    if (answer === currentWord) {
      const timeBonus = Math.floor(timeLeft / 3);
      setScore(s => s + 20 + timeBonus);
      setMood('happy');
      setMessage(`¡Correcto! +${20 + timeBonus} puntos`);
    } else {
      setMood('sad');
      setMessage(`La palabra era: ${currentWord}`);
    }

    setTimeout(() => {
      if (round >= totalRounds) {
        setGameOver(true);
        onComplete(score + (answer === currentWord ? 20 + Math.floor(timeLeft / 3) : 0));
      } else {
        setRound(r => r + 1);
        setTimeLeft(30);
        setMood('thinking');
        setMessage('Ordena las letras para formar la palabra');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent-yellow/10 to-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onExit}><ArrowLeft className="w-5 h-5 mr-2" />Salir</Button>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">Ronda {round}/{totalRounds}</Badge>
            <Badge variant={timeLeft <= 10 ? 'danger' : 'secondary'} className="flex items-center gap-1">
              <Clock className="w-4 h-4" />{timeLeft}s
            </Badge>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-500 mb-4">Ordena las letras:</p>
            
            {/* Answer slots */}
            <div className="flex justify-center gap-2 mb-6">
              {currentWord.split('').map((_, i) => (
                <button
                  key={i}
                  onClick={() => removeLetter(i)}
                  className={`
                    w-12 h-14 rounded-lg font-bold text-xl flex items-center justify-center
                    ${answer[i] 
                      ? 'bg-secondary text-white border-2 border-secondary' 
                      : 'bg-gray-100 border-2 border-dashed border-gray-300'}
                  `}
                >
                  {answer[i] || ''}
                </button>
              ))}
            </div>

            {/* Letter bank */}
            <div className="flex justify-center gap-2 flex-wrap">
              {scrambled.filter(l => !l.placed).map((letter) => (
                <motion.button
                  key={letter.id}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => selectLetter(letter.id)}
                  className="w-12 h-12 bg-accent-yellow text-white rounded-lg font-bold text-xl shadow-lg"
                >
                  {letter.letter}
                </motion.button>
              ))}
            </div>

            <Button 
              onClick={submitAnswer}
              disabled={answer.length !== currentWord.length || gameOver}
              className="mt-6"
              size="lg"
            >
              Verificar
            </Button>
          </CardContent>
        </Card>

        {/* Jac */}
        <div className="flex justify-center">
          <JacMascot mood={mood} message={message} size="md" />
        </div>
      </div>
    </div>
  );
}

// True/False Sprint Game Component
function TrueFalseGame({ onComplete, onExit }: { onComplete: (score: number) => void; onExit: () => void }) {
  const questions = [
    { statement: 'La IA puede aprender de datos sin ser explícitamente programada', answer: true },
    { statement: 'Machine Learning es un subconjunto de la IA', answer: true },
    { statement: 'Las redes neuronales son inspiradas en el cerebro humano', answer: true },
    { statement: 'Deep Learning requiere pocos datos para funcionar bien', answer: false },
    { statement: 'Python es el lenguaje más popular para IA', answer: true },
    { statement: 'TensorFlow es una base de datos para IA', answer: false },
    { statement: 'Un algoritmo es un conjunto de pasos para resolver un problema', answer: true },
    { statement: 'La clasificación es un tipo de problema de ML supervisado', answer: true },
    { statement: 'Los datos de entrenamiento siempre son perfectos', answer: false },
    { statement: 'La regresión predice valores continuos', answer: true },
  ];

  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [gameOver, setGameOver] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [mood, setMood] = useState<'idle' | 'happy' | 'sad' | 'celebrating' | 'thinking' | 'encouraging'>('idle');
  const [message, setMessage] = useState('¿Verdadero o Falso?');
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameOver(true);
          setMood('sad');
          setMessage('¡Se acabó el tiempo!');
          onComplete(score);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver, score]);

  const handleAnswer = (userAnswer: boolean) => {
    if (answered) return;
    
    setAnswered(true);
    const correct = userAnswer === questions[currentQ].answer;
    
    if (correct) {
      const streakBonus = Math.min(streak + 1, 5) * 5;
      setScore(s => s + 10 + streakBonus);
      setStreak(s => s + 1);
      setMood('happy');
      setMessage(`¡Correcto! +${10 + streakBonus} (racha: ${streak + 1})`);
    } else {
      setStreak(0);
      setMood('sad');
      setMessage('Incorrecto');
    }

    setTimeout(() => {
      if (currentQ >= questions.length - 1) {
        setGameOver(true);
        setMood('celebrating');
        setMessage('¡Juego completado!');
        onComplete(score + (correct ? 10 + Math.min(streak, 5) * 5 : 0));
      } else {
        setCurrentQ(q => q + 1);
        setAnswered(false);
        setMood('thinking');
        setMessage('¿Verdadero o Falso?');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent-coral/10 to-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onExit}><ArrowLeft className="w-5 h-5 mr-2" />Salir</Button>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-yellow-500" />{score}
            </Badge>
            {streak > 0 && <Badge variant="warning" className="flex items-center gap-1">🔥 {streak}</Badge>}
            <Badge variant={timeLeft <= 15 ? 'danger' : 'secondary'} className="flex items-center gap-1">
              <Clock className="w-4 h-4" />{timeLeft}s
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <ProgressBar value={(currentQ / questions.length) * 100} className="h-2" />
          <p className="text-sm text-gray-500 text-center mt-2">{currentQ + 1} / {questions.length}</p>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardContent className="p-8 text-center">
            <p className="text-xl font-semibold mb-8">{questions[currentQ]?.statement}</p>
            
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => handleAnswer(true)}
                disabled={answered}
                size="lg"
                variant={answered && questions[currentQ].answer ? 'primary' : 'outline'}
                className="w-32"
              >
                ✅ Verdadero
              </Button>
              <Button
                onClick={() => handleAnswer(false)}
                disabled={answered}
                size="lg"
                variant={answered && !questions[currentQ].answer ? 'primary' : 'outline'}
                className="w-32"
              >
                ❌ Falso
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Jac */}
        <div className="flex justify-center">
          <JacMascot mood={mood} message={message} size="md" />
        </div>
      </div>
    </div>
  );
}

// Main Games Hub Page
export default function GamesPage() {
  const { user } = useAuthStore();
  const { gamesAPI } = useClerkAPIs();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [showXP, setShowXP] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [mood, setMood] = useState<'idle' | 'happy' | 'sad' | 'celebrating' | 'thinking' | 'encouraging'>('encouraging');
  const [message, setMessage] = useState('¡Elige un juego y diviertete!');

  useEffect(() => {
    const loadGames = async () => {
      try {
        const data = await gamesAPI.getAll();
        setGames(data.games);
      } catch (error) {
        console.error('Error loading games:', error);
        // Use demo games if API fails
        setGames([
          { id: '1', key: 'speed-match', title: 'Speed Match', description: 'Encuentra las parejas en tiempo récord', icon: '🎴', xpReward: 30, bestScore: null },
          { id: '2', key: 'word-puzzle', title: 'Word Puzzle', description: 'Ordena las letras para formar palabras', icon: '🔤', xpReward: 25, bestScore: null },
          { id: '3', key: 'true-false', title: 'True/False Sprint', description: 'Responde verdadero o falso lo más rápido posible', icon: '⚡', xpReward: 35, bestScore: null },
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadGames();
  }, []);

  const handleGameComplete = async (gameType: GameType, score: number) => {
    const game = games.find(g => g.key === gameType);
    if (!game) return;

    setMood('celebrating');
    setMessage(`¡Ganaste ${score} puntos!`);

    try {
      await gamesAPI.submitScore(game.id, score);
      // Only show XP after successful API submission
      setEarnedXP(game.xpReward);
      setShowXP(true);
      setShowConfetti(true);
    } catch (error) {
      console.error('Error submitting score:', error);
      setMood('sad');
      setMessage('No se pudo guardar tu puntuación');
    }

    setTimeout(() => {
      setShowXP(false);
      setShowConfetti(false);
      setActiveGame(null);
    }, 3000);
  };

  const startGame = (gameType: GameType) => {
    setActiveGame(gameType);
    setMood('thinking');
    setMessage('¡Buena suerte!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (activeGame) {
    return (
      <>
        {activeGame === 'speed-match' && (
          <SpeedMatchGame onComplete={(s) => handleGameComplete('speed-match', s)} onExit={() => setActiveGame(null)} />
        )}
        {activeGame === 'word-puzzle' && (
          <WordPuzzleGame onComplete={(s) => handleGameComplete('word-puzzle', s)} onExit={() => setActiveGame(null)} />
        )}
        {activeGame === 'true-false' && (
          <TrueFalseGame onComplete={(s) => handleGameComplete('true-false', s)} onExit={() => setActiveGame(null)} />
        )}
        <XPPopup xp={earnedXP} show={showXP} position="top" />
        <ConfettiCelebration show={showConfetti} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-accent-coral to-accent-yellow rounded-2xl flex items-center justify-center">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Mini-Juegos</h1>
            <p className="text-gray-500">Diviertete mientras aprendes y gana XP extra</p>
          </div>
        </motion.div>

        {/* Games Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hoverable className="overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative">
                  <span className="text-6xl">{game.icon}</span>
                  {game.bestScore && (
                    <Badge className="absolute top-3 right-3" variant="secondary">
                      <Trophy className="w-3 h-3 mr-1" />{game.bestScore}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <CardTitle className="mb-2">{game.title}</CardTitle>
                  <p className="text-sm text-gray-500 mb-4">{game.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="warning" className="flex items-center gap-1">
                      <Zap className="w-4 h-4" />+{game.xpReward} XP
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => startGame(game.key as GameType)}
                      className="gap-2"
                    >
                      <Play className="w-4 h-4" />Jugar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Jac helper */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <JacMascot mood={mood} message={message} size="lg" />
            <div>
              <h3 className="font-bold text-lg mb-1">¡Consejo de Jac!</h3>
              <p className="text-gray-600">
                Juega minijuegos todos los días para mantener tu racha y ganar bonus de XP. 
                ¡Cuanto más alta sea tu racha, más puntos extra obtendrás!
              </p>
            </div>
          </div>
        </Card>
      </main>

      <XPPopup xp={earnedXP} show={showXP} position="top" />
      <ConfettiCelebration show={showConfetti} />
    </div>
  );
}