"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { simulatePracticeQuestionGeneration } from '@/lib/mock-data';
import { QuizQuestion, Difficulty, CORE_BADGES } from '@/lib/types';
import {
  Target,
  Play,
  Pause,
  RotateCcw,
  Check,
  X,
  Sparkles,
  Brain,
  Clock,
  TrendingUp,
  Zap,
  ChevronRight,
  Settings,
  Award,
} from 'lucide-react';

export default function PracticeModePage() {
  const { user, updateUserXP, addBadge } = useAuth();

  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [subject, setSubject] = useState('Computer Science');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [timePerQuestion, setTimePerQuestion] = useState(60);

  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionHistory, setQuestionHistory] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    questionsAnswered: 0,
    correctAnswers: 0,
    totalXP: 0,
    streak: 0,
    bestStreak: 0,
    startTime: new Date(),
  });

  const loadNextQuestion = useCallback(async () => {
    setLoading(true);
    setShowResult(false);
    setSelectedAnswer('');
    
    const question = await simulatePracticeQuestionGeneration(
      subject,
      topic || subject,
      difficulty,
      questionHistory
    );
    
    setCurrentQuestion(question);
    setQuestionHistory(prev => [...prev, question.id]);
    setTimeRemaining(timePerQuestion);
    setLoading(false);
  }, [subject, topic, difficulty, questionHistory, timePerQuestion]);

  useEffect(() => {
    if (!isActive || isPaused || showResult || !currentQuestion) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAnswer(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isPaused, showResult, currentQuestion]);

  const startPractice = async () => {
    setStats({
      questionsAnswered: 0,
      correctAnswers: 0,
      totalXP: 0,
      streak: 0,
      bestStreak: 0,
      startTime: new Date(),
    });
    setQuestionHistory([]);
    setIsActive(true);
    setIsPaused(false);
    await loadNextQuestion();
  };

  const handleAnswer = (timeout: boolean = false) => {
    if (!currentQuestion) return;

    const correctOption = currentQuestion.options.find(o => o.isCorrect);
    const correct = !timeout && selectedAnswer === correctOption?.id;
    
    setIsCorrect(correct);
    setShowResult(true);

    const xpEarned = correct ? Math.round(10 * (difficulty === 'very_hard' ? 1.5 : difficulty === 'hard' ? 1.25 : difficulty === 'medium' ? 1 : difficulty === 'easy' ? 0.8 : 0.6)) : 0;
    
    setStats(prev => {
      const newStreak = correct ? prev.streak + 1 : 0;
      return {
        ...prev,
        questionsAnswered: prev.questionsAnswered + 1,
        correctAnswers: prev.correctAnswers + (correct ? 1 : 0),
        totalXP: prev.totalXP + xpEarned,
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
      };
    });

    if (xpEarned > 0) {
      updateUserXP(xpEarned);
    }

    if (stats.questionsAnswered + 1 === 50 && user && !user.badges.some(b => b.id === 'practice_master')) {
      addBadge(CORE_BADGES[8]);
      toast.success('Badge Earned!', { description: 'Practice Master - Complete 50 practice questions' });
    }

    if (correct) {
      const messages = ['Correct!', 'Nice!', 'Great job!', 'Well done!'];
      toast.success(messages[Math.floor(Math.random() * messages.length)], {
        description: `+${xpEarned} XP`,
      });
    } else if (!timeout) {
      toast.error('Incorrect', {
        description: 'Keep practicing!',
      });
    } else {
      toast.warning("Time's up!", {
        description: 'Try to answer faster next time.',
      });
    }
  };

  const continueToNext = async () => {
    await loadNextQuestion();
  };

  const endPractice = () => {
    setIsActive(false);
    setIsPaused(false);
    setCurrentQuestion(null);
    setShowResult(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const accuracy = stats.questionsAnswered > 0 
    ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100) 
    : 0;

  if (!isActive) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Practice Mode</h1>
          <p className="text-slate-600 mt-1">Infinite practice with AI-generated questions</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg shadow-slate-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-violet-600" />
                  Practice Settings
                </CardTitle>
                <CardDescription>Configure your practice session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="History">History</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Topic (optional)</Label>
                    <Input
                      placeholder="e.g., Data Structures"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very_easy">Very Easy (0.6x XP)</SelectItem>
                      <SelectItem value="easy">Easy (0.8x XP)</SelectItem>
                      <SelectItem value="medium">Medium (1.0x XP)</SelectItem>
                      <SelectItem value="hard">Hard (1.25x XP)</SelectItem>
                      <SelectItem value="very_hard">Very Hard (1.5x XP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Time per Question: {timePerQuestion} seconds</Label>
                  <Slider
                    value={[timePerQuestion]}
                    onValueChange={([v]) => setTimePerQuestion(v)}
                    min={15}
                    max={120}
                    step={5}
                  />
                </div>

                <Button
                  onClick={startPractice}
                  size="lg"
                  className="w-full gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                >
                  <Play className="w-5 h-5" />
                  Start Practice
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-lg shadow-slate-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-violet-600" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-semibold shrink-0">1</div>
                  <p>AI generates unique questions based on your settings</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-semibold shrink-0">2</div>
                  <p>Questions don&apos;t repeat within a session</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-semibold shrink-0">3</div>
                  <p>Earn XP for correct answers (not counted in leaderboard)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-semibold shrink-0">4</div>
                  <p>Build streaks for motivation</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg shadow-slate-200/50 bg-gradient-to-br from-amber-50 to-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-6 h-6 text-amber-600" />
                  <span className="font-semibold text-amber-800">Practice Master Badge</span>
                </div>
                <p className="text-sm text-amber-700">Complete 50 practice questions to earn the Practice Master badge!</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Practice Mode</h1>
          <p className="text-slate-600">{subject} {topic && `- ${topic}`}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
            className="gap-2"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={endPractice}
            className="gap-2 text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
            End
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="pt-4 text-center">
            <Target className="w-5 h-5 text-violet-600 mx-auto mb-1" />
            <div className="text-2xl font-bold">{stats.questionsAnswered}</div>
            <div className="text-xs text-slate-500">Questions</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="pt-4 text-center">
            <TrendingUp className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <div className="text-2xl font-bold">{accuracy}%</div>
            <div className="text-xs text-slate-500">Accuracy</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="pt-4 text-center">
            <Zap className="w-5 h-5 text-amber-600 mx-auto mb-1" />
            <div className="text-2xl font-bold">{stats.streak}</div>
            <div className="text-xs text-slate-500">Streak</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="pt-4 text-center">
            <Sparkles className="w-5 h-5 text-amber-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-amber-700">{stats.totalXP}</div>
            <div className="text-xs text-amber-600">XP Earned</div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-16 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Generating question...</p>
          </CardContent>
        </Card>
      ) : currentQuestion ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="capitalize">
                    {difficulty.replace('_', ' ')}
                  </Badge>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                    timeRemaining < 10 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-slate-100 text-slate-700'
                  }`}>
                    <Clock className="w-4 h-4" />
                    <span className="font-mono font-semibold">{timeRemaining}s</span>
                  </div>
                </div>
                <Progress value={(timeRemaining / timePerQuestion) * 100} className="h-1 mt-2" />
              </CardHeader>
              <CardContent className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900">{currentQuestion.text}</h2>

                <RadioGroup
                  value={selectedAnswer}
                  onValueChange={setSelectedAnswer}
                  disabled={showResult || isPaused}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === option.id;
                    const showCorrectness = showResult;
                    
                    return (
                      <Label
                        key={option.id}
                        htmlFor={option.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          showCorrectness
                            ? option.isCorrect
                              ? 'border-emerald-500 bg-emerald-50'
                              : isSelected
                                ? 'border-red-500 bg-red-50'
                                : 'border-slate-200'
                            : isSelected
                              ? 'border-violet-500 bg-violet-50'
                              : 'border-slate-200 hover:border-violet-200'
                        } ${isPaused ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <RadioGroupItem value={option.id} id={option.id} />
                        <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-semibold text-slate-600">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1">{option.text}</span>
                        {showCorrectness && option.isCorrect && (
                          <Check className="w-5 h-5 text-emerald-600" />
                        )}
                        {showCorrectness && isSelected && !option.isCorrect && (
                          <X className="w-5 h-5 text-red-600" />
                        )}
                      </Label>
                    );
                  })}
                </RadioGroup>

                {!showResult ? (
                  <Button
                    onClick={() => handleAnswer()}
                    disabled={!selectedAnswer || isPaused}
                    className="w-full gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                  >
                    <Check className="w-4 h-4" />
                    Submit Answer
                  </Button>
                ) : (
                  <Button
                    onClick={continueToNext}
                    className="w-full gap-2"
                  >
                    Next Question
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      ) : null}

      {isPaused && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <Pause className="w-12 h-12 text-violet-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Practice Paused</h2>
              <p className="text-slate-600 mb-6">Take a break. Your progress is saved.</p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={endPractice}
                >
                  End Session
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600"
                  onClick={() => setIsPaused(false)}
                >
                  Resume
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
