"use client";

import { use, useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft, 
  BookOpen, 
  FileQuestion, 
  Clock, 
  Play, 
  Calendar,
  Target,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function StudentClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, classes, quizzes, attempts } = useAuth();
  
  const cls = classes.find(c => c.id === id);
  const classQuizzes = quizzes.filter(q => q.classId === id && q.isPublished);
  const myAttempts = attempts.filter(a => a.studentId === user?.id);
  const completedQuizIds = new Set(myAttempts.map(a => a.quizId));

  const completedInClass = classQuizzes.filter(q => completedQuizIds.has(q.id)).length;
  const progress = classQuizzes.length > 0 
    ? Math.round((completedInClass / classQuizzes.length) * 100) 
    : 0;

  if (!cls) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
          <BookOpen className="w-10 h-10 text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Class Not Found</h2>
        <p className="text-slate-500">The class you're looking for doesn't exist or you don't have access.</p>
        <Button asChild variant="outline">
          <Link href="/student/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-6">
        <Link 
          href="/student/dashboard" 
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group w-fit"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          BACK TO DASHBOARD
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 text-primary font-bold mb-2">
              <BookOpen className="w-5 h-5 shadow-sm" />
              <span className="uppercase tracking-[0.2em] text-xs">Class Details</span>
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tight">
              {cls.name}
            </h1>
            <p className="text-muted-foreground text-lg mt-1 font-medium max-w-2xl">{cls.description}</p>
          </motion.div>

          <Card className="glass-card border-none px-6 py-4 flex items-center gap-6 min-w-[200px]">
            <div className="text-right">
              <div className="text-3xl font-black text-primary">{progress}%</div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Progress</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-right">
              <div className="text-3xl font-black text-foreground">{completedInClass}/{classQuizzes.length}</div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quizzes Done</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Available Quizzes
            </h3>
            <Badge variant="secondary" className="font-black text-[10px] tracking-wider">
              {classQuizzes.length} TOTAL QUIZZES
            </Badge>
          </div>

          <div className="grid gap-4">
            {classQuizzes.length === 0 ? (
              <Card className="glass-card border-none py-12 text-center">
                <FileQuestion className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="font-bold text-muted-foreground">No quizzes scheduled for this class yet.</p>
              </Card>
            ) : (
              classQuizzes.map((quiz, i) => {
                const quizAttempts = myAttempts.filter(a => a.quizId === quiz.id);
                const bestAttempt = quizAttempts.sort((a, b) => b.accuracy - a.accuracy)[0];
                const canRetry = quizAttempts.length < quiz.maxAttempts;
                const isCompleted = quizAttempts.length > 0;

                return (
                  <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className={`glass-card border-2 transition-all hover:shadow-xl group overflow-hidden ${
                      isCompleted ? 'border-emerald-500/20' : 'border-border/50 hover:border-primary/50'
                    }`}>
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row md:items-center">
                          <div className={`p-6 flex-1 space-y-4 ${
                            isCompleted ? 'bg-emerald-500/[0.02]' : ''
                          }`}>
                            <div className="flex items-center justify-between">
                              <h4 className="text-xl font-black group-hover:text-primary transition-colors">
                                {quiz.title}
                              </h4>
                              <Badge className={`${
                                quiz.difficulty === 'hard' ? 'bg-rose-500/10 text-rose-500' :
                                quiz.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                                'bg-emerald-500/10 text-emerald-500'
                              } border-none font-black text-[10px] uppercase`}>
                                {quiz.difficulty}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-6 text-sm font-bold text-muted-foreground">
                              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-background/50">
                                <Clock className="w-4 h-4 text-primary" />
                                {Math.floor(quiz.timeLimit / 60)}m
                              </div>
                              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-background/50">
                                <FileQuestion className="w-4 h-4 text-accent" />
                                {quiz.questionCount ?? quiz.questions?.length ?? 0} Questions
                              </div>
                              {quiz.deadline && (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/5 text-amber-600">
                                  <Calendar className="w-4 h-4" />
                                  Ends: {new Date(quiz.deadline).toLocaleDateString()}
                                </div>
                              )}
                            </div>

                            {isCompleted && bestAttempt && (
                              <div className="flex items-center gap-4 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                <Target className="w-5 h-5 text-emerald-500" />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Best Score</span>
                                    <span className="text-sm font-black text-emerald-600">{bestAttempt.accuracy}% Accuracy</span>
                                  </div>
                                  <Progress value={bestAttempt.accuracy} className="h-1.5 mt-1 bg-emerald-500/10" />
                                </div>
                                <div className="text-right">
                                  <div className="text-xs font-black text-muted-foreground uppercase">{quizAttempts.length}/{quiz.maxAttempts}</div>
                                  <div className="text-[8px] font-black text-muted-foreground tracking-tighter uppercase">ATTEMPTS</div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="p-6 md:border-l md:border-dashed border-border bg-secondary/10 flex items-center justify-center min-w-[200px]">
                            <Link href={`/student/quiz/${quiz.id}`} className="w-full">
                              <Button 
                                className={`w-full h-14 rounded-2xl font-black text-lg gap-3 shadow-lg transition-all active:scale-95 ${
                                  !canRetry 
                                    ? 'bg-muted text-muted-foreground cursor-not-allowed shadow-none' 
                                    : isCompleted 
                                      ? 'bg-secondary text-primary hover:bg-primary hover:text-white' 
                                      : 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
                                }`}
                                disabled={!canRetry}
                              >
                                {isCompleted ? (
                                  canRetry ? (
                                    <>
                                      <Play className="w-5 h-5 fill-current" />
                                      Retry Quiz
                                    </>
                                  ) : (
                                    <>
                                      <Target className="w-5 h-5" />
                                      No More Attempts
                                    </>
                                  )
                                ) : (
                                  <>
                                    <Play className="w-5 h-5 fill-current" />
                                    Start
                                  </>
                                )}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-8">
          <Card className="glass-card border-none overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
            <CardHeader>
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Class Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="text-primary">{progress}%</span>
                </div>
                <Progress value={progress} className="h-3 bg-secondary/50 rounded-full overflow-hidden" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-secondary/20 border border-border/50">
                  <div className="text-2xl font-black text-foreground">{completedInClass}</div>
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Completed</div>
                </div>
                <div className="p-4 rounded-2xl bg-secondary/20 border border-border/50">
                  <div className="text-2xl font-black text-foreground">{classQuizzes.length - completedInClass}</div>
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Remaining</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-none overflow-hidden relative group">
             <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-primary/5 pointer-events-none" />
            <CardHeader>
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                Latest Rewards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               {myAttempts.filter(a => classQuizzes.some(q => q.id === a.quizId)).length === 0 ? (
                 <p className="text-sm font-medium text-muted-foreground italic text-center py-4 bg-secondary/10 rounded-2xl">
                   No scores found for this class yet.
                 </p>
               ) : (
                 myAttempts
                   .filter(a => classQuizzes.some(q => q.id === a.quizId))
                   .sort((a, b) => b.xpEarned - a.xpEarned)
                   .slice(0, 3)
                   .map((attempt, i) => (
                    <div key={attempt.id} className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-black text-xs">
                          +{attempt.xpEarned}
                        </div>
                        <span className="text-xs font-bold text-foreground">Points Earned</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    </div>
                  ))
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
