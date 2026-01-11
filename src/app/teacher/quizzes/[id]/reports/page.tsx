"use client";

import React, { useState, useEffect, use } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  ShieldCheck, 
  Download,
  FileText,
  Activity,
  Award,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

export default function QuizReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: quizId } = use(params);
  const { classes, quizzes, attempts, fetchQuizAttempts } = useAuth();
  const router = useRouter();

  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const quiz = quizzes.find(q => q.id === quizId);
  const cls = classes.find(c => c.id === quiz?.classId);

  useEffect(() => {
    const loadAttempts = async () => {
      if (quizId) {
        setLoading(true);
        // We might need a specific API for quiz attempts if they aren't globally loaded
        const data = await fetchQuizAttempts(quizId);
        setQuizAttempts(data);
        setLoading(false);
      }
    };
    loadAttempts();
  }, [quizId, fetchQuizAttempts]);

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Activity className="w-12 h-12 text-muted-foreground/20" />
        <h2 className="text-2xl font-black text-foreground">Quiz Not Found</h2>
        <p className="text-muted-foreground font-medium">This quiz has no data or does not exist.</p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/teacher/quizzes">Back to Quizzes</Link>
        </Button>
      </div>
    );
  }

  const avgAccuracy = quizAttempts.length > 0 
    ? Math.round(quizAttempts.reduce((sum, a) => sum + a.accuracy, 0) / quizAttempts.length)
    : 0;

  const avgTime = quizAttempts.length > 0
    ? Math.round(quizAttempts.reduce((sum, a) => sum + a.timeTaken, 0) / quizAttempts.length)
    : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-8 pb-32">
      {/* Dynamic Header */}
      <div className="flex flex-col gap-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group w-fit"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          BACK TO QUIZZES
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-3">
              <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] tracking-widest uppercase">
                Quiz Report
              </Badge>
              <Badge variant="outline" className="font-mono text-[10px] uppercase border-border/50">
                Quiz ID: {quizId}
              </Badge>
            </div>
            <h1 className="text-5xl font-black text-foreground tracking-tighter leading-tight">
              {quiz.title}
            </h1>
            <p className="text-muted-foreground text-lg font-medium max-w-2xl">
              Student performance for the class <span className="text-foreground font-black">{cls?.name}</span>
            </p>
          </motion.div>

          <Button className="h-14 rounded-2xl bg-foreground text-background font-black gap-2 shadow-xl shadow-foreground/10 hover:scale-[1.02] active:scale-95 transition-all">
            <Download className="w-5 h-5" />
            EXPORT RESULTS
          </Button>
        </div>
      </div>

      {/* Stats Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Avg Accuracy', value: `${avgAccuracy}%`, sub: 'Class Average', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Attempts', value: quizAttempts.length, sub: 'Total Students', icon: Users, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Avg Time', value: formatTime(avgTime), sub: 'Time Spent', icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Flagged Attempts', value: quizAttempts.filter(a => a.isFlagged).length, sub: 'Cheat Alerts', icon: ShieldCheck, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className="glass-card border-none relative overflow-hidden h-full">
              <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl -mr-12 -mt-12 opacity-50 transition-colors ${stat.bg.replace('/10', '/20')}`} />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</CardTitle>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black text-foreground tracking-tight">{stat.value}</div>
                <p className={`text-[10px] font-black mt-1 uppercase tracking-widest ${stat.color}`}>{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Performance Roster */}
        <div className="lg:col-span-2">
          <Card className="glass-card border-none overflow-hidden h-full">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
            <CardHeader className="pb-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black flex items-center gap-3">
                    <Users className="w-6 h-6 text-primary" />
                    Student Analytics
                  </CardTitle>
                  <CardDescription className="text-base font-medium">Individual scores and progress for each student.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-20 rounded-[2rem] bg-secondary/10 animate-pulse" />
                  ))}
                </div>
              ) : quizAttempts.length === 0 ? (
                <div className="text-center py-20 bg-secondary/10 rounded-[3rem] border-2 border-dashed border-border/50">
                  <Activity className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="font-black text-muted-foreground text-lg uppercase tracking-tight">No attempt data found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quizAttempts.map((attempt, i) => (
                    <motion.div
                      key={attempt.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className={`flex flex-col md:flex-row md:items-center gap-6 p-5 rounded-[2rem] bg-secondary/20 border border-border/50 hover:bg-secondary/30 transition-all ${
                        attempt.isFlagged ? 'border-rose-500/30 bg-rose-500/5' : ''
                      }`}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-background border border-border/50 flex items-center justify-center font-black text-primary text-xl shadow-inner shrink-0">
                        {attempt.studentName?.charAt(0) || 'A'}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-lg font-black truncate">{attempt.studentName}</h4>
                           {attempt.isFlagged && (
                            <Badge className="bg-rose-500/10 text-rose-600 border-none font-black text-[8px] uppercase px-2 py-0.5">
                              Security Flag
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatTime(attempt.timeTaken)}</span>
                          <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> {attempt.score} / {attempt.maxScore}</span>
                          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Attempt #{attempt.attemptNumber}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`text-2xl font-black ${
                            attempt.accuracy >= 80 ? 'text-emerald-500' : 
                            attempt.accuracy >= 60 ? 'text-amber-500' : 'text-rose-500'
                          }`}>
                            {attempt.accuracy}%
                          </div>
                          <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Accuracy</div>
                        </div>
                        <Link href={`/teacher/attempts/${attempt.id}`}>
                          <Button size="icon" variant="ghost" className="rounded-xl hover:bg-primary/10 hover:text-primary">
                            <ChevronRight className="w-5 h-5" />
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <Card className="glass-card border-none overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Quiz Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-5 rounded-2xl bg-secondary/30 border border-border/50">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
                  <span>Difficulty Level</span>
                  <span className="text-primary font-black uppercase">{quiz.difficulty.replace('_', ' ')}</span>
                </div>
                <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-primary ${
                      quiz.difficulty.includes('hard') ? 'w-full' : 
                      quiz.difficulty.includes('medium') ? 'w-[60%]' : 'w-[30%]'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50 text-center">
                  <div className="text-2xl font-black text-foreground">{quiz.totalMarks}</div>
                  <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1">Total Points</div>
                </div>
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50 text-center">
                  <div className="text-2xl font-black text-foreground">{formatTime(quiz.timeLimit)}</div>
                  <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1">Time Limit</div>
                </div>
              </div>

              <div className="p-6 rounded-[2.5rem] bg-rose-500/5 border border-rose-500/10">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-rose-900">Security Status</h5>
                    <p className="text-xs font-bold text-rose-800/60 mt-1 leading-relaxed">
                      This quiz currently has {quizAttempts.filter(a => a.isFlagged).length} flagged security alerts. Please review these attempts.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-none overflow-hidden relative group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader>
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Live Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 animate-pulse" />
                  <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin relative z-10" />
                  <Activity className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-foreground uppercase tracking-tight">Active Monitoring</p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Waiting for data...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
