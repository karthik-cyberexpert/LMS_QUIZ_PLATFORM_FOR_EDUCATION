"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  shuffleArray, 
  generateWatermark, 
  calculateXP,
  detectAnomalousAttempt,
} from '@/lib/mock-data';
import { QuizAttempt, Warning, XPBreakdown, PRAISE_CATEGORIES, CORE_BADGES } from '@/lib/types';
import {
  Clock,
  AlertTriangle,
  Shield,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Flag,
  Send,
  Eye,
  CheckCircle,
  XCircle,
  Sparkles,
  Trophy,
  TrendingUp,
  Zap,
  Info,
  FileText,
} from 'lucide-react';

export default function QuizPage() {
  const params = useParams();
  const quizId = params.id as string;
  const { user, quizzes, attempts, addAttempt, updateUserXP, addBadge, addAuditLog, getStudentAttempts } = useAuth();
  const router = useRouter();

  const quiz = quizzes.find(q => q.id === quizId);
  const existingAttempts = user ? getStudentAttempts(user.id, quizId) : [];
  const attemptNumber = existingAttempts.length + 1;

  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(quiz?.timeLimit || 600);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [resizeCount, setResizeCount] = useState(0);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isAutoSubmit, setIsAutoSubmit] = useState(false);
  const [result, setResult] = useState<{ attempt: QuizAttempt; xpBreakdown: XPBreakdown } | null>(null);
  const [questionOrder, setQuestionOrder] = useState<string[]>([]);
  const [optionOrders, setOptionOrders] = useState<Record<string, string[]>>({});
  const [watermark, setWatermark] = useState('');

  const startTimeRef = useRef<Date | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const addWarning = useCallback((type: Warning['type'], message: string) => {
    const warning: Warning = {
      id: `warn-${Date.now()}`,
      type,
      timestamp: new Date(),
      message,
    };
    setWarnings(prev => [...prev, warning]);
    addAuditLog({
      userId: user?.id || '',
      action: 'WARNING_ISSUED',
      details: message,
      quizId,
    });
    return warning;
  }, [user?.id, quizId, addAuditLog]);

  const submitQuiz = useCallback((auto: boolean = false) => {
    if (!quiz || !user || !startTimeRef.current) return;

    const timeTaken = Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000);
    let score = 0;
    let correctCount = 0;

    quiz.questions.forEach(q => {
      const selectedOptionId = answers[q.id];
      const correctOption = q.options.find(o => o.isCorrect);
      if (selectedOptionId === correctOption?.id) {
        score += q.marks;
        correctCount++;
      }
    });

    const accuracy = Math.round((correctCount / quiz.questions.length) * 100);
    const xpBreakdown = calculateXP(score, quiz.totalMarks, timeTaken, quiz.timeLimit, quiz.difficulty, attemptNumber);

    const attempt: QuizAttempt = {
      id: `attempt-${Date.now()}`,
      quizId: quiz.id,
      studentId: user.id,
      answers,
      startedAt: startTimeRef.current,
      submittedAt: new Date(),
      score,
      maxScore: quiz.totalMarks,
      accuracy,
      timeTaken,
      xpEarned: xpBreakdown.finalXP,
      attemptNumber,
      warnings,
      isAutoSubmitted: auto,
      isFlagged: warnings.length > 2,
      flagReason: warnings.length > 2 ? 'Multiple integrity warnings' : undefined,
      questionOrder,
      optionOrders,
    };

    const anomalyCheck = detectAnomalousAttempt(attempt, existingAttempts, quiz);
    if (anomalyCheck.isSuspicious) {
      attempt.isFlagged = true;
      attempt.flagReason = anomalyCheck.reasons.join('; ');
    }

    addAttempt(attempt);
    updateUserXP(xpBreakdown.finalXP);

    if (attemptNumber === 1 && !user.badges.some(b => b.id === 'first_quiz')) {
      addBadge(CORE_BADGES[0]);
      toast.success('Badge Earned!', { description: 'First Steps - Complete your first quiz' });
    }
    if (accuracy === 100 && !user.badges.some(b => b.id === 'perfect_score')) {
      addBadge(CORE_BADGES[1]);
      toast.success('Badge Earned!', { description: 'Perfectionist - Score 100% on any quiz' });
    }
    if (timeTaken < quiz.timeLimit * 0.5 && accuracy >= 80 && !user.badges.some(b => b.id === 'speed_demon')) {
      addBadge(CORE_BADGES[2]);
      toast.success('Badge Earned!', { description: 'Speed Demon - Complete in under 50% time' });
    }

    addAuditLog({
      userId: user.id,
      action: auto ? 'QUIZ_AUTO_SUBMITTED' : 'QUIZ_SUBMITTED',
      details: `Score: ${score}/${quiz.totalMarks}, XP: ${xpBreakdown.finalXP}`,
      quizId,
      attemptId: attempt.id,
    });

    setResult({ attempt, xpBreakdown });
    setCompleted(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [quiz, user, answers, attemptNumber, warnings, questionOrder, optionOrders, existingAttempts, addAttempt, updateUserXP, addBadge, addAuditLog, quizId]);

  useEffect(() => {
    if (!started || completed) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsAutoSubmit(true);
          submitQuiz(true);
          toast.error('Time\'s up!', { description: 'Your quiz has been automatically submitted.' });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, completed, submitQuiz]);

  useEffect(() => {
    if (!started || completed) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const newCount = tabSwitchCount + 1;
        setTabSwitchCount(newCount);

        if (newCount === 1) {
          addWarning('tab_switch', 'First warning: Tab switch detected');
          setWarningMessage('You switched away from the quiz tab. This is your first warning.');
          setShowWarningDialog(true);
        } else if (newCount === 2) {
          addWarning('tab_switch', 'Final warning: Tab switch detected');
          setWarningMessage('Second tab switch detected. One more will auto-submit your quiz.');
          setShowWarningDialog(true);
        } else if (newCount >= 3) {
          addWarning('tab_switch', 'Auto-submit triggered: Multiple tab switches');
          toast.error('Quiz auto-submitted', { description: 'Multiple tab switches detected.' });
          setIsAutoSubmit(true);
          submitQuiz(true);
        }
      }
    };

    const handleBlur = () => {
      if (!document.hidden) {
        addWarning('tab_switch', 'Window blur detected');
      }
    };

    const handleResize = () => {
      const newCount = resizeCount + 1;
      setResizeCount(newCount);

      if (newCount >= 3) {
        addWarning('window_resize', 'Auto-submit triggered: Multiple window resizes');
        toast.error('Quiz auto-submitted', { description: 'Suspicious window resizing detected.' });
        setIsAutoSubmit(true);
        submitQuiz(true);
      } else if (newCount >= 1) {
        addWarning('window_resize', `Window resize warning ${newCount}`);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      addWarning('context_menu', 'Right-click attempt blocked');
      toast.warning('Right-click disabled', { description: 'Context menu is disabled during quiz.' });
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      addWarning('copy_attempt', 'Copy attempt blocked');
      toast.warning('Copy disabled', { description: 'Copying is disabled during quiz.' });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'a')) {
        e.preventDefault();
        addWarning('copy_attempt', `Keyboard shortcut blocked: ${e.key}`);
        toast.warning('Shortcut disabled', { description: 'This keyboard shortcut is disabled.' });
      }
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        addWarning('screenshot_attempt', 'Screenshot attempt detected');
        toast.warning('Screenshots discouraged', { description: 'Screenshot attempts are logged.' });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('resize', handleResize);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [started, completed, tabSwitchCount, resizeCount, addWarning, submitQuiz]);

  const startQuiz = () => {
    if (!quiz) return;

    const shuffledQuestionIds = shuffleArray(quiz.questions.map(q => q.id));
    setQuestionOrder(shuffledQuestionIds);

    const shuffledOptions: Record<string, string[]> = {};
    quiz.questions.forEach(q => {
      shuffledOptions[q.id] = shuffleArray(q.options.map(o => o.id));
    });
    setOptionOrders(shuffledOptions);

    setWatermark(generateWatermark(user?.id || '', quizId));
    startTimeRef.current = new Date();
    setStarted(true);

    addAuditLog({
      userId: user?.id || '',
      action: 'QUIZ_STARTED',
      details: `Started quiz: ${quiz.title}`,
      quizId,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPraiseMessage = (accuracy: number) => {
    if (accuracy === 100) return PRAISE_CATEGORIES.perfect[Math.floor(Math.random() * PRAISE_CATEGORIES.perfect.length)];
    if (accuracy >= 80) return PRAISE_CATEGORIES.excellent[Math.floor(Math.random() * PRAISE_CATEGORIES.excellent.length)];
    if (accuracy >= 60) return PRAISE_CATEGORIES.good[Math.floor(Math.random() * PRAISE_CATEGORIES.good.length)];
    return PRAISE_CATEGORIES.improvement[Math.floor(Math.random() * PRAISE_CATEGORIES.improvement.length)];
  };

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="w-full max-w-md glass-card border-none text-center p-8">
            <div className="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-rose-500" />
            </div>
            <h2 className="text-3xl font-black mb-2 text-foreground">Unit Not Found</h2>
            <p className="text-muted-foreground font-medium mb-8">This assessment module has been decoupled or access has been restricted.</p>
            <Button 
              onClick={() => router.push('/student')}
              className="w-full h-12 rounded-xl bg-primary font-bold shadow-lg shadow-primary/20"
            >
              Back to Command Center
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (attemptNumber > quiz.maxAttempts) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="w-full max-w-md glass-card border-none text-center p-8">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-amber-500" />
            </div>
            <h2 className="text-3xl font-black mb-2 text-foreground">Quota Exceeded</h2>
            <p className="text-muted-foreground font-medium mb-8">You have reached the maximum operational capacity of {quiz.maxAttempts} attempts for this unit.</p>
            <Button 
              onClick={() => router.push('/student')}
              className="w-full h-12 rounded-xl bg-foreground font-bold"
            >
              Return to Dashboard
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (completed && result) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-3xl mx-auto relative z-10"
        >
          <Card className="border-none glass-card shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] overflow-hidden rounded-[3rem]">
            <div className={`p-10 text-center relative ${
              result.attempt.accuracy >= 80 
                ? 'bg-gradient-to-br from-emerald-500/20 to-teal-600/20' 
                : result.attempt.accuracy >= 60 
                  ? 'bg-gradient-to-br from-amber-500/20 to-orange-600/20'
                  : 'bg-gradient-to-br from-rose-500/20 to-pink-600/20'
            }`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.2, type: 'spring', damping: 12 }}
                className="relative mb-8"
              >
                <div className={`w-28 h-28 mx-auto rounded-[2.5rem] flex items-center justify-center shadow-2xl ${
                  result.attempt.accuracy >= 80 ? 'bg-emerald-500' : result.attempt.accuracy >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                }`}>
                  {result.attempt.accuracy >= 80 ? (
                    <Trophy className="w-14 h-14 text-white" />
                  ) : result.attempt.accuracy >= 60 ? (
                    <TrendingUp className="w-14 h-14 text-white" />
                  ) : (
                    <Zap className="w-14 h-14 text-white" />
                  )}
                </div>
                {result.attempt.accuracy >= 80 && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-emerald-500/20 blur-3xl -z-10"
                  />
                )}
              </motion.div>

              <Badge className="mb-4 bg-foreground/5 text-foreground border-none font-black text-xs uppercase tracking-[0.2em] px-3 py-1">
                Mission Accomplished
              </Badge>
              <h1 className="text-5xl font-black mb-3 text-foreground tracking-tight">{getPraiseMessage(result.attempt.accuracy)}</h1>
              <p className="text-muted-foreground font-bold text-lg">Unit {quiz.title} Synchronized</p>
            </div>

            <CardContent className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Accuracy', value: `${result.attempt.accuracy}%`, color: 'text-primary' },
                  { label: 'Score', value: `${result.attempt.score}/${result.attempt.maxScore}`, color: 'text-foreground' },
                  { label: 'Time', value: formatTime(result.attempt.timeTaken), color: 'text-accent' }
                ].map((stat, i) => (
                  <div key={i} className="p-8 rounded-[2.5rem] bg-secondary/30 border border-border/50 text-center">
                    <div className={`text-3xl font-black mb-1 ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs font-black text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="p-8 rounded-[3rem] bg-amber-500/5 border-2 border-amber-500/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Sparkles className="w-24 h-24 text-amber-600" />
                </div>
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="font-black text-amber-900 uppercase tracking-tight text-sm">Experience Rewards</span>
                  </div>
                  <div className="text-4xl font-black text-amber-600">
                    +{result.xpBreakdown.finalXP}<span className="text-sm ml-1 uppercase">XP</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-x-12 gap-y-4 relative z-10">
                  <div className="flex justify-between items-center py-2 border-b border-amber-500/10">
                    <span className="text-sm font-bold text-amber-800/60 uppercase tracking-wider text-[10px]">Precision Bonus</span>
                    <span className="font-black text-amber-900">{result.xpBreakdown.accuracyXP} <span className="text-[10px]">XP</span></span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-amber-500/10">
                    <span className="text-sm font-bold text-amber-800/60 uppercase tracking-wider text-[10px]">Velocity Core</span>
                    <span className="font-black text-amber-900">{result.xpBreakdown.speedXP} <span className="text-[10px]">XP</span></span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-amber-500/10">
                    <span className="text-sm font-bold text-amber-800/60 uppercase tracking-wider text-[10px]">Complexity Level</span>
                    <span className="font-black text-amber-900">{result.xpBreakdown.difficultyMultiplier}x</span>
                  </div>
                  {result.xpBreakdown.retryPenalty < 1 && (
                    <div className="flex justify-between items-center py-2 border-b border-amber-500/10">
                      <span className="text-sm font-bold text-rose-800/60 uppercase tracking-wider text-[10px]">Efficiency Adjustment</span>
                      <span className="font-black text-rose-600">-{Math.round((1 - result.xpBreakdown.retryPenalty) * 100)}%</span>
                    </div>
                  )}
                </div>
              </div>

              {result.attempt.isFlagged && (
                <div className="p-8 rounded-[3rem] bg-rose-500/5 border border-rose-500/20 flex items-start gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="font-black text-rose-900 uppercase tracking-tight text-sm">Integrity Alert Detected</h4>
                    <p className="text-rose-800/80 font-bold text-sm mt-1 leading-relaxed">{result.attempt.flagReason}</p>
                    <p className="text-rose-600/60 text-[10px] uppercase font-black tracking-widest mt-4">Manual Oversight Initiated</p>
                  </div>
                </div>
              )}

              <div className="flex gap-4 p-2 bg-secondary/30 rounded-[2.5rem] border border-border/50">
                <Button 
                  variant="ghost" 
                  className="flex-1 h-14 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-background"
                  onClick={() => router.push('/student')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Command Center
                </Button>
                {attemptNumber < quiz.maxAttempts && (
                  <Button 
                    className="flex-1 h-14 rounded-2xl font-black uppercase text-xs tracking-widest bg-primary shadow-lg shadow-primary/20"
                    onClick={() => {
                      setCompleted(false);
                      setStarted(false);
                      setResult(null);
                      setAnswers({});
                      setWarnings([]);
                      setTabSwitchCount(0);
                      setResizeCount(0);
                      setCurrentQuestion(0);
                      setTimeRemaining(quiz.timeLimit);
                    }}
                  >
                    Re-Initalize Unit
                    <Zap className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 flex items-center justify-center relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full relative z-10"
        >
          <Card className="border-none glass-card shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary" />
            
            <CardHeader className="text-center pb-8 pt-10">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-6 border border-white/20"
              >
                <Shield className="w-8 h-8 text-primary" />
              </motion.div>
              <Badge className="mb-4 bg-primary/10 text-primary border-none font-black text-xs uppercase tracking-[0.2em] px-3 py-1">
                ATTEMPT {attemptNumber} / {quiz.maxAttempts}
              </Badge>
              <CardTitle className="text-4xl font-black text-foreground tracking-tight leading-tight px-4">{quiz.title}</CardTitle>
              <p className="text-muted-foreground mt-4 text-lg font-medium max-w-lg mx-auto leading-relaxed">
                {quiz.description}
              </p>
            </CardHeader>

            <CardContent className="space-y-8 px-8 pb-10">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 rounded-[2rem] bg-secondary/30 border border-border/50 text-center group hover:border-primary/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-2xl font-black text-foreground">{Math.floor(quiz.timeLimit / 60)}m</div>
                  <div className="text-xs font-black text-muted-foreground uppercase mt-1 tracking-widest">Temporal Limit</div>
                </div>
                <div className="p-6 rounded-[2rem] bg-secondary/30 border border-border/50 text-center group hover:border-accent/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-2xl font-black text-foreground">{quiz.questions.length} Units</div>
                  <div className="text-xs font-black text-muted-foreground uppercase mt-1 tracking-widest">Complexity</div>
                </div>
              </div>

              <div className="p-6 rounded-[2.5rem] bg-amber-500/5 border-2 border-amber-500/10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-black text-amber-900 uppercase tracking-tight text-sm">Security Protocols Active</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-xs font-bold text-amber-800/80 mt-3">
                      <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-amber-500" /> Tab Switch Detection</li>
                      <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-amber-500" /> Right-Click Restriction</li>
                      <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-amber-500" /> Session Anomaly Logging</li>
                      <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-amber-500" /> Dynamic Randomization</li>
                    </ul>
                  </div>
                </div>
              </div>

              {attemptNumber > 1 && (
                <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-4">
                    <Info className="w-5 h-5 text-primary" />
                    <p className="text-sm font-bold text-primary/80 leading-snug">
                      Retry detected. A <span className="text-primary font-black">{Math.round((1 - Math.pow(0.75, attemptNumber - 1)) * 100)}%</span> efficiency penalty applies to XP rewards. Best attempt is retained.
                    </p>
                  </div>
                </div>
              )}

              <Button 
                onClick={startQuiz}
                className="w-full h-16 rounded-[2rem] text-xl font-black bg-primary hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 gap-3 group"
              >
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Eye className="w-6 h-6" />
                </motion.div>
                Initialize Mission
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const currentQuestionId = questionOrder[currentQuestion];
  const currentQuestionData = quiz.questions.find(q => q.id === currentQuestionId);
  const currentOptions = currentQuestionData ? optionOrders[currentQuestionData.id] || [] : [];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = (answeredCount / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-background select-none font-sans">
      <div className="quiz-watermark top-10 left-10">{watermark}</div>
      <div className="quiz-watermark top-10 right-10">{watermark}</div>
      <div className="quiz-watermark bottom-10 left-10">{watermark}</div>
      <div className="quiz-watermark bottom-10 right-10">{watermark}</div>

      {/* Sticky Premium Header */}
      <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-3xl border-b border-border/50">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="hidden sm:block">
                <h2 className="text-sm font-black text-foreground/40 uppercase tracking-[0.2em]">Live Assessment</h2>
                <h3 className="text-lg font-black text-foreground tracking-tight leading-none mt-1">{quiz.title}</h3>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {warnings.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Badge variant="destructive" className="gap-2 px-3 py-1.5 rounded-lg font-black bg-rose-500/10 text-rose-500 border-none">
                    <AlertTriangle className="w-4 h-4" />
                    {warnings.length} <span className="hidden xs:inline">STATUS: COMPROMISED</span>
                  </Badge>
                </motion.div>
              )}
              
              <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-500 ${
                timeRemaining < 60 
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 ring-2 ring-rose-500/20' 
                  : timeRemaining < 300 
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                    : 'bg-secondary/50 border-border/50 text-foreground'
              }`}>
                <Clock className={`w-5 h-5 ${timeRemaining < 60 ? 'animate-pulse' : ''}`} />
                <span className="font-mono text-xl font-black tabular-nums">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 relative">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-muted-foreground/60">
              <span>Synchronization: {answeredCount} / {quiz.questions.length} Units</span>
              <span>Vector {currentQuestion + 1}</span>
            </div>
            <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-primary via-accent to-primary"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 pb-32">
        <AnimatePresence mode="wait">
          {currentQuestionData && (
            <motion.div
              key={currentQuestionId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: "circOut" }}
            >
              <Card className="border-none glass-card shadow-2xl relative overflow-hidden rounded-[3rem]">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                
                <CardHeader className="p-10 pb-6 border-b border-border/50">
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-black shrink-0 border border-primary/20">
                      {currentQuestion + 1}
                    </div>
                    <div className="space-y-4">
                      <CardTitle className="text-3xl font-black text-foreground leading-[1.3] tracking-tight">
                        {currentQuestionData.text}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-secondary text-muted-foreground font-black text-[10px] uppercase tracking-widest px-2 py-0.5 border-none">
                          {currentQuestionData.marks} Points
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-10 pt-8">
                  <RadioGroup
                    value={answers[currentQuestionData.id] || ''}
                    onValueChange={(value) => setAnswers(prev => ({ ...prev, [currentQuestionData.id]: value }))}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {currentOptions.map((optionId, index) => {
                      const option = currentQuestionData.options.find(o => o.id === optionId);
                      if (!option) return null;
                      const isSelected = answers[currentQuestionData.id] === optionId;
                      
                      return (
                        <div key={optionId} className="relative">
                          <Label
                            htmlFor={optionId}
                            className={`group flex items-center gap-4 p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 relative overflow-hidden ${
                              isSelected
                                ? 'border-primary bg-primary/5 shadow-inner'
                                : 'border-border/50 bg-secondary/30 hover:border-primary/30 hover:bg-secondary/50'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg transition-colors ${
                              isSelected ? 'bg-primary text-white' : 'bg-background text-muted-foreground border border-border group-hover:border-primary/50'
                            }`}>
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span className={`flex-1 text-lg font-bold leading-tight ${isSelected ? 'text-primary' : 'text-foreground/80'}`}>
                              {option.text}
                            </span>
                            <RadioGroupItem value={optionId} id={optionId} className="sr-only" />
                            
                            {isSelected && (
                              <motion.div 
                                layoutId="active-bg"
                                className="absolute right-6"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                              >
                                <CheckCircle className="w-6 h-6 text-primary" />
                              </motion.div>
                            )}
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Navigation Console */}
        <div className="fixed bottom-0 left-0 w-full p-6 z-40 bg-gradient-to-t from-background via-background to-transparent pointer-events-none">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-6 pointer-events-auto">
            <Button
              variant="ghost"
              onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
              className="h-14 rounded-2xl px-8 border-2 border-border/50 glass-card font-black uppercase text-xs tracking-widest hover:bg-secondary disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="hidden md:flex gap-2 p-2 bg-secondary/50 backdrop-blur-xl rounded-[2rem] border border-border/50">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-10 h-10 rounded-xl text-xs font-black transition-all duration-300 relative ${
                    currentQuestion === index
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110'
                      : answers[questionOrder[index]]
                        ? 'bg-primary/10 text-primary hover:bg-primary/20'
                        : 'bg-background/50 text-muted-foreground hover:bg-background'
                  }`}
                >
                  {index + 1}
                  {answers[questionOrder[index]] && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {currentQuestion === quiz.questions.length - 1 ? (
              <Button
                onClick={() => setShowSubmitConfirm(true)}
                className="h-14 rounded-2xl px-10 bg-primary hover:scale-[1.05] active:scale-95 transition-all shadow-xl shadow-primary/20 font-black uppercase text-xs tracking-widest gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Sync
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                className="h-14 rounded-2xl px-10 bg-foreground text-background hover:scale-[1.05] active:scale-95 transition-all font-black uppercase text-xs tracking-widest gap-2"
              >
                Next Step
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </main>

      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent className="glass-card border-none rounded-[3rem] p-10">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-4 text-2xl font-black tracking-tight">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
              </div>
              Security Breach Detected
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-bold text-lg mt-4 leading-relaxed">
              {warningMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8">
            <AlertDialogAction className="h-14 rounded-2xl bg-foreground font-black uppercase text-xs tracking-widest px-8">Acknowledged</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <AlertDialogContent className="glass-card border-none rounded-[3rem] p-10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl font-black tracking-tight">Finalize Synchronization?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-bold text-lg mt-4 leading-relaxed">
              You&apos;ve answered {answeredCount} of {quiz.questions.length} objective units.
              {answeredCount < quiz.questions.length && (
                <span className="block mt-4 p-4 rounded-2xl bg-rose-500/10 text-rose-600 border border-rose-500/20">
                  CRITICAL: {quiz.questions.length - answeredCount} units remain unmapped. Proceeding may result in operational inefficiency.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 gap-3">
            <AlertDialogCancel className="h-14 rounded-2xl font-black uppercase text-xs tracking-widest border-2 border-border/50">Abort</AlertDialogCancel>
            <AlertDialogAction onClick={() => submitQuiz(false)} className="h-14 rounded-2xl bg-primary font-black uppercase text-xs tracking-widest px-8 shadow-xl shadow-primary/20">
              Submit Command
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
