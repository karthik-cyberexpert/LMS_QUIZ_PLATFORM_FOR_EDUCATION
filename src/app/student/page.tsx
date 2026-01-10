"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Trophy,
  Target,
  Clock,
  BookOpen,
  Plus,
  ArrowRight,
  Play,
  Calendar,
  Award,
  TrendingUp,
  Zap,
  FileText,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, getStudentClasses, quizzes, attempts, joinClass } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const studentClasses = getStudentClasses();

  const availableQuizzes = quizzes.filter(q => 
    q.isPublished && 
    studentClasses.some(c => c.id === q.classId) &&
    (!q.deadline || new Date(q.deadline) > new Date())
  );

  const myAttempts = attempts.filter(a => a.studentId === user?.id);
  const completedQuizIds = new Set(myAttempts.map(a => a.quizId));

  const pendingQuizzes = availableQuizzes.filter(q => !completedQuizIds.has(q.id));
  const recentAttempts = myAttempts.sort((a, b) => 
    new Date(b.submittedAt || b.startedAt).getTime() - new Date(a.submittedAt || a.startedAt).getTime()
  ).slice(0, 5);

  const handleJoinClass = () => {
    if (joinClass(inviteCode.toUpperCase())) {
      toast.success('Class joined successfully!', {
        description: 'You can now access quizzes from this class.',
      });
      setInviteCode('');
      setJoinDialogOpen(false);
    } else {
      toast.error('Failed to join class', {
        description: 'Invalid invite code or you\'re already in this class.',
      });
    }
  };

  const getQuizById = (quizId: string) => quizzes.find(q => q.id === quizId);

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-2 text-primary font-bold mb-2">
            <Sparkles className="w-5 h-5" />
            <span>Dashboard Overview</span>
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">
            Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span>!
          </h1>
          <p className="text-muted-foreground text-lg mt-1 font-medium">Ready to dominate your assessments today?</p>
        </motion.div>
        
        <div className="flex items-center gap-4">
          <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-12 px-6 rounded-2xl border-2 border-border font-bold hover:bg-secondary/50 group">
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                Join Class
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2rem] border-white/10 glass-card">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Initialize Enrollment</DialogTitle>
                <DialogDescription className="text-base font-medium">
                  Enter the secure invite code provided by your instructor.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 pt-6">
                <Input
                  placeholder="CODE-X123"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="h-16 text-center text-3xl font-black tracking-[0.2em] rounded-2xl bg-secondary/30 border-2 border-border focus:border-primary transition-all"
                />
                <Button 
                  onClick={handleJoinClass} 
                  className="w-full h-14 text-lg font-bold rounded-2xl bg-primary shadow-xl shadow-primary/20"
                  disabled={!inviteCode}
                >
                  Confirm Join
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Link href="/student/practice">
            <Button className="h-12 px-6 rounded-2xl bg-primary font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform group">
              <Target className="w-5 h-5 mr-2" />
              Training Zone
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
          <Card className="glass-card border-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 blur-3xl -mr-16 -mt-16 group-hover:bg-amber-400/20 transition-colors" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Total XP</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-foreground">{user?.totalXP?.toLocaleString()}</div>
              <p className="text-sm text-amber-600 font-bold mt-1">Earning: +250/day</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
          <Card className="glass-card border-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -mr-16 -mt-16" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Completions</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-foreground">{completedQuizIds.size}</div>
              <p className="text-sm text-emerald-600 font-bold mt-1">{pendingQuizzes.length} remaining units</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
          <Card className="glass-card border-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Achievements</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-foreground">{user?.badges?.length || 0}</div>
              <div className="flex gap-2 mt-2">
                {user?.badges?.slice(0, 4).map((badge) => (
                  <motion.span 
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    key={badge.id} 
                    className="text-xl filter drop-shadow-md cursor-help" 
                    title={badge.name}
                  >
                    {badge.icon}
                  </motion.span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
          <Card className="glass-card border-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl -mr-16 -mt-16" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Active Units</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-rose-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-foreground">{studentClasses.length}</div>
              <p className="text-sm text-rose-600 font-bold mt-1">Enrolled Ecosystems</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {pendingQuizzes.length > 0 && (
        <Card className="border-none glass-card relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 bg-gradient-to-b from-primary to-accent h-full" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black flex items-center gap-3">
                  <Zap className="w-6 h-6 text-primary fill-primary/20" />
                  Mission Critical: Pending Units
                </CardTitle>
                <CardDescription className="text-base font-medium">Prioritized assessments for your active classes.</CardDescription>
              </div>
              <Link href="/student/classes">
                <Button variant="ghost" className="font-bold hover:text-primary transition-colors group">
                  Explore All
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pendingQuizzes.slice(0, 3).map((quiz, i) => {
                const cls = studentClasses.find(c => c.id === quiz.classId);
                const existingAttempts = myAttempts.filter(a => a.quizId === quiz.id);
                const canRetry = existingAttempts.length < quiz.maxAttempts;

                return (
                  <motion.div 
                    key={quiz.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="group relative p-6 rounded-[2rem] border-2 border-border/50 hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/5 bg-secondary/20 backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{cls?.name}</span>
                        <h3 className="text-xl font-black leading-tight text-foreground group-hover:text-primary transition-colors">{quiz.title}</h3>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase px-2 py-0.5">
                        {quiz.difficulty.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground mb-6">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-background/50">
                        <Clock className="w-4 h-4 text-primary" />
                        {Math.floor(quiz.timeLimit / 60)}m
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-background/50">
                        <FileText className="w-4 h-4 text-accent" />
                        {quiz.questions.length} Q
                      </div>
                    </div>

                    {quiz.deadline && (
                      <div className="flex items-center gap-2 text-xs font-black text-amber-600 mb-6 bg-amber-500/5 p-2 rounded-xl">
                        <Calendar className="w-4 h-4" />
                        EXPIRY: {new Date(quiz.deadline).toLocaleDateString()}
                      </div>
                    )}

                    <Link href={`/student/quiz/${quiz.id}`}>
                      <Button 
                        className="w-full h-12 rounded-xl bg-foreground text-background font-black hover:bg-primary hover:text-white transition-all shadow-xl shadow-black/5"
                        disabled={!canRetry}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {existingAttempts.length > 0 ? 'Retry Mission' : 'Initiate Unit'}
                      </Button>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border-none glass-card overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-black flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
              Activity Feed
            </CardTitle>
            <CardDescription className="font-medium text-base">Your latest operational metrics.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAttempts.length === 0 ? (
              <div className="text-center py-12 bg-secondary/20 rounded-3xl border-2 border-dashed border-border">
                <Target className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground font-bold">No active history detected.</p>
                <p className="text-sm text-muted-foreground/70">Complete your first mission to initialize metrics.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentAttempts.map((attempt) => {
                  const quiz = getQuizById(attempt.quizId);
                  if (!quiz) return null;
                  return (
                    <motion.div 
                      key={attempt.id} 
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-5 p-4 rounded-2xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all cursor-pointer"
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg ${
                        attempt.accuracy >= 80 
                          ? 'bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10 border-2 border-emerald-500/20' 
                          : attempt.accuracy >= 60 
                            ? 'bg-amber-500/10 text-amber-500 shadow-amber-500/10 border-2 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-500 shadow-rose-500/10 border-2 border-rose-500/20'
                      }`}>
                        {attempt.accuracy}%
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-foreground truncate text-lg leading-tight">{quiz.title}</h4>
                        <p className="text-sm font-bold text-muted-foreground/80 mt-1">
                          {attempt.score}/{attempt.maxScore} Pts • <span className="text-primary">+{attempt.xpEarned} XP</span>
                        </p>
                      </div>
                      <Badge variant={attempt.isFlagged ? 'destructive' : 'secondary'} className="rounded-lg font-black text-[10px] uppercase shadow-sm">
                        ATTEMPT {attempt.attemptNumber}
                      </Badge>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none glass-card overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-black flex items-center gap-3">
              <Award className="w-6 h-6 text-primary" />
              Trophy Room
            </CardTitle>
            <CardDescription className="font-medium text-base">Achievements decrypted and active.</CardDescription>
          </CardHeader>
          <CardContent>
            {!user?.badges || user.badges.length === 0 ? (
              <div className="text-center py-12 bg-secondary/20 rounded-3xl border-2 border-dashed border-border">
                <Award className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground font-bold">Trophy cabinet empty.</p>
                <p className="text-sm text-muted-foreground/70">Complete achievements to unlock relics.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {user.badges.map((badge) => (
                  <motion.div 
                    key={badge.id} 
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className={`p-5 rounded-[2rem] border-2 text-center transition-all bg-secondary/10 group cursor-help ${
                      badge.rarity === 'legendary' || badge.rarity === 'prestige'
                        ? 'border-amber-400/30 bg-amber-400/5'
                        : badge.rarity === 'epic'
                          ? 'border-primary/30 bg-primary/5'
                          : badge.rarity === 'rare'
                            ? 'border-accent/30 bg-accent/5'
                            : 'border-border/50'
                    }`}
                  >
                    <span className="text-4xl block mb-2 filter drop-shadow-md group-hover:animate-bounce">{badge.icon}</span>
                    <p className="text-xs font-black text-foreground truncate uppercase tracking-tight">{badge.name}</p>
                    <Badge className={`text-[9px] mt-2 font-black uppercase border-none ${
                        badge.rarity === 'legendary' ? 'bg-amber-400 text-amber-950' :
                        badge.rarity === 'epic' ? 'bg-primary text-white' :
                        'bg-secondary text-muted-foreground'
                    }`}>
                      {badge.rarity}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-none glass-card relative overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-rose-500" />
                Enrollment Overview
              </CardTitle>
              <CardDescription className="font-medium text-base">Current academic ecosystems in operation.</CardDescription>
            </div>
            <Link href="/student/classes">
              <Button variant="ghost" className="font-bold hover:text-primary transition-colors group">
                All Systems
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {studentClasses.length === 0 ? (
            <div className="text-center py-12 bg-secondary/20 rounded-3xl border-2 border-dashed border-border">
              <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-bold">No active enrollments.</p>
              <Button variant="link" onClick={() => setJoinDialogOpen(true)} className="mt-2 text-primary font-black">
                Initialize First Enrollment
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {studentClasses.map((cls, i) => {
                const classQuizzes = quizzes.filter(q => q.classId === cls.id && q.isPublished);
                const completedInClass = classQuizzes.filter(q => completedQuizIds.has(q.id)).length;
                const progress = classQuizzes.length > 0 
                  ? Math.round((completedInClass / classQuizzes.length) * 100) 
                  : 0;

                return (
                  <motion.div
                    key={cls.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link href={`/student/classes/${cls.id}`}>
                      <div className="group p-6 rounded-[2.5rem] bg-secondary/20 border-2 border-border/50 hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/5 cursor-pointer h-full flex flex-col">
                        <div className="flex-1">
                          <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors">{cls.name}</h3>
                          <p className="text-muted-foreground font-medium mt-2 line-clamp-2 leading-tight">{cls.description}</p>
                        </div>
                        <div className="mt-8 space-y-3">
                          <div className="flex items-center justify-between text-sm font-black uppercase tracking-wider">
                            <span className="text-muted-foreground">Progression</span>
                            <span className="text-foreground">{completedInClass}/{classQuizzes.length} UNITS</span>
                          </div>
                          <div className="relative h-3 w-full bg-background/50 rounded-full overflow-hidden border border-border/30">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-accent" 
                            />
                          </div>
                          <div className="text-[10px] font-black text-primary text-right italic">{progress}% SYSTEM SYNC</div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
