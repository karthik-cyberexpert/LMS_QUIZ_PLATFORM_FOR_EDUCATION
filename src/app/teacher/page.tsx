"use client";

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  Plus,
  ArrowRight,
  BookOpen,
  Zap,
  GraduationCap,
  BarChart3,
  AlertCircle,
  ShieldCheck,
  FileText,
  ChevronRight,
} from 'lucide-react';

export default function TeacherDashboard() {
  const { user, getTeacherClasses, quizzes, attempts } = useAuth();
  const teacherClasses = getTeacherClasses();

  const totalStudents = teacherClasses.reduce((sum, c) => sum + c.studentIds.length, 0);
  const publishedQuizzes = quizzes.filter(q => q.isPublished && teacherClasses.some(c => c.id === q.classId)).length;
  
  const teacherAttempts = attempts.filter(a => 
    quizzes.some(q => q.id === a.quizId && teacherClasses.some(c => c.id === q.classId))
  );

  const flaggedAttempts = teacherAttempts.filter(a => a.isFlagged);

  const getClassAverage = (classId: string) => {
    const classQuizzes = quizzes.filter(q => q.classId === classId);
    const classAttempts = attempts.filter(a => classQuizzes.some(q => q.id === a.quizId));
    if (classAttempts.length === 0) return 0;
    return Math.round(classAttempts.reduce((sum, a) => sum + a.accuracy, 0) / classAttempts.length);
  };

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-2 text-primary font-bold mb-2">
            <GraduationCap className="w-5 h-5" />
            <span>Instructor Console</span>
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">
            Greetings, <span className="text-gradient">Professor {user?.name?.split(' ').pop()}</span>
          </h1>
          <p className="text-muted-foreground text-lg mt-1 font-medium">System status: All educational modules operational.</p>
        </motion.div>
        
        <div className="flex items-center gap-4">
          <Link href="/teacher/quizzes/create">
            <Button className="h-12 px-6 rounded-2xl bg-primary font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform group">
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
              New Assessment
            </Button>
          </Link>
          <Link href="/teacher/classes/create">
            <Button variant="outline" className="h-12 px-6 rounded-2xl border-2 border-border font-bold hover:bg-secondary/50">
              <Plus className="w-5 h-5 mr-2" />
              Build Class
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <Card className="glass-card border-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Total Units</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-foreground">{teacherClasses.length}</div>
              <p className="text-sm text-primary font-bold mt-1">Active Ecosystems</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <Card className="glass-card border-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl -mr-16 -mt-16" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Enrolled</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-foreground">{totalStudents}</div>
              <p className="text-sm text-accent font-bold mt-1">Verified Identities</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <Card className="glass-card border-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -mr-16 -mt-16" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Published</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-foreground">{publishedQuizzes}</div>
              <p className="text-sm text-emerald-600 font-bold mt-1">Live Assessments</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <Card className="glass-card border-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl -mr-16 -mt-16" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Submissions</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-foreground">{teacherAttempts.length}</div>
              <p className="text-sm text-amber-600 font-bold mt-1">Processing cycles</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border-none glass-card relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 bg-gradient-to-b from-primary to-accent h-full" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-primary" />
                  Performance Analytics
                </CardTitle>
                <CardDescription className="text-base font-medium">Average throughput across all active units.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {teacherClasses.map((cls, i) => {
                const avgScore = getClassAverage(cls.id);
                return (
                  <motion.div 
                    key={cls.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="font-black text-foreground uppercase tracking-wider">{cls.name}</span>
                      </div>
                      <span className="font-black text-primary">{avgScore}% Efficiency</span>
                    </div>
                    <div className="relative h-4 w-full bg-background/50 rounded-full overflow-hidden border border-border/30 p-1">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${avgScore}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full" 
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none glass-card overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-rose-500" />
                  Integrity Alerts
                </CardTitle>
                <CardDescription className="font-medium text-base">Flagged student behavioral anomalies.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {flaggedAttempts.length === 0 ? (
              <div className="text-center py-12 bg-secondary/20 rounded-3xl border-2 border-dashed border-border">
                <ShieldCheck className="w-16 h-16 text-emerald-500/30 mx-auto mb-4" />
                <p className="text-muted-foreground font-bold">Protocol fully secure.</p>
                <p className="text-sm text-muted-foreground/70">No integrity violations detected in this cycle.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {flaggedAttempts.slice(0, 5).map((attempt, i) => {
                  const quiz = quizzes.find(q => q.id === attempt.quizId);
                  return (
                    <motion.div 
                      key={attempt.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-5 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 hover:bg-rose-500/10 transition-all cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-rose-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-foreground truncate">{quiz?.title}</h4>
                        <p className="text-sm font-bold text-muted-foreground">Student ID: {attempt.studentId.slice(0, 8)}...</p>
                      </div>
                      <Badge variant="destructive" className="rounded-lg font-black text-[10px] uppercase">
                        CRITICAL
                      </Badge>
                    </motion.div>
                  );
                })}
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
                <BookOpen className="w-6 h-6 text-primary" />
                Ecosystem Management
              </CardTitle>
              <CardDescription className="font-medium text-base">Current classes under your jurisdiction.</CardDescription>
            </div>
            <Link href="/teacher/classes">
              <Button variant="ghost" className="font-bold hover:text-primary transition-colors group">
                All Systems
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teacherClasses.map((cls, i) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Link href={`/teacher/classes/${cls.id}`}>
                  <div className="group p-6 rounded-[2.5rem] bg-secondary/20 border-2 border-border/50 hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/5 cursor-pointer h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors leading-tight">{cls.name}</h3>
                        <Badge variant="outline" className="font-black text-[10px] border-primary/20 text-primary uppercase">
                          {cls.inviteCode}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground font-medium line-clamp-2 mb-6">{cls.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-border/40">
                      <div className="flex items-center gap-2 text-sm font-black text-muted-foreground">
                        <Users className="w-4 h-4 text-primary" />
                        {cls.studentIds.length} ENROLLED
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
