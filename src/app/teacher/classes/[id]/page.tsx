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
  Users, 
  FileText, 
  TrendingUp, 
  Plus,
  Copy,
  Check,
  Search,
  BookOpen,
  Zap,
  ShieldCheck,
  ChevronRight,
  MoreVertical,
  Activity,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

export default function TeacherClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, classes, quizzes, attempts, getClassStudents } = useAuth();
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  const cls = classes.find(c => c.id === id);
  const classQuizzes = quizzes.filter(q => q.classId === id);
  const classAttempts = attempts.filter(a => classQuizzes.some(q => q.id === a.quizId));

  useEffect(() => {
    const fetchStudents = async () => {
      if (id) {
        setLoadingStudents(true);
        const students = await getClassStudents(id);
        setClassStudents(students);
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [id, getClassStudents]);

  const copyInviteCode = () => {
    if (!cls?.inviteCode) return;
    
    if (!navigator.clipboard) {
      const textArea = document.createElement("textarea");
      textArea.value = cls.inviteCode;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedCode(true);
        toast.success('Invite code copied!');
        setTimeout(() => setCopiedCode(false), 2000);
      } catch (err) {
        toast.error('Failed to copy');
      }
      document.body.removeChild(textArea);
      return;
    }

    navigator.clipboard.writeText(cls.inviteCode)
      .then(() => {
        setCopiedCode(true);
        toast.success('Invite code copied!');
        setTimeout(() => setCopiedCode(false), 2000);
      });
  };

  if (!cls) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-20 h-20 rounded-[2rem] bg-secondary/20 flex items-center justify-center">
          <BookOpen className="w-10 h-10 text-muted-foreground/30" />
        </div>
        <h2 className="text-2xl font-black text-foreground">Class Not Found</h2>
        <p className="text-muted-foreground font-medium">The class you're looking for doesn't exist or has been deleted.</p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/teacher/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const averageAccuracy = classAttempts.length > 0 
    ? Math.round(classAttempts.reduce((sum, a) => sum + a.accuracy, 0) / classAttempts.length)
    : 0;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-6">
        <Link 
          href="/teacher/dashboard" 
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group w-fit"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          DASHBOARD
        </Link>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-3">
              <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] tracking-widest uppercase">
                Active Class
              </Badge>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border/50">
                <span className="text-xs font-black font-mono">{cls.inviteCode}</span>
                <button onClick={copyInviteCode} className="text-muted-foreground hover:text-primary transition-colors">
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <h1 className="text-5xl font-black text-foreground tracking-tighter">
              {cls.name}
            </h1>
            <p className="text-muted-foreground text-lg font-medium max-w-2xl">{cls.description}</p>
          </motion.div>

          <div className="flex flex-wrap gap-3">
            <Link href={`/teacher/quizzes/create?classId=${cls.id}`}>
              <Button className="h-14 rounded-2xl bg-primary px-8 font-black gap-2 shadow-xl shadow-primary/20">
                <Plus className="w-5 h-5" />
                NEW QUIZ
              </Button>
            </Link>
            <Button variant="outline" className="h-14 rounded-2xl border-2 border-border/50 px-8 font-black gap-2 backdrop-blur-sm">
              <Users className="w-5 h-5" />
              STUDENT LIST
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Class Average', value: `${averageAccuracy}%`, sub: 'Avg Accuracy', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Total Students', value: classStudents.length, sub: 'Enrolled Students', icon: Users, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Total Quizzes', value: classQuizzes.length, sub: 'Class Quizzes', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Security Alerts', value: classAttempts.filter(a => a.isFlagged).length, sub: 'Cheat Flags', icon: ShieldCheck, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className="glass-card border-none relative overflow-hidden group h-full">
              <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl -mr-12 -mt-12 transition-colors ${stat.bg.replace('/10', '/20')}`} />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</CardTitle>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black text-foreground">{stat.value}</div>
                <p className={`text-xs font-bold mt-1 uppercase tracking-tighter ${stat.color}`}>{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="glass-card border-none overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-primary" />
                  Class Quizzes
                </CardTitle>
                <CardDescription className="text-base font-medium">Manage and monitor class quizzes.</CardDescription>
              </div>
              <Button size="sm" variant="ghost" className="font-black text-xs gap-2">
                VIEW ALL QUIZZES <ChevronRight className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classQuizzes.length === 0 ? (
                  <div className="text-center py-12 bg-secondary/10 rounded-3xl border-2 border-dashed border-border/50">
                    <Zap className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="font-bold text-muted-foreground text-lg">No quizzes added yet.</p>
                    <p className="text-sm text-muted-foreground/70">Create your first quiz now.</p>
                  </div>
                ) : (
                  classQuizzes.map((quiz, i) => {
                    const quizAttempts = attempts.filter(a => a.quizId === quiz.id);
                    const avgAccuracy = quizAttempts.length > 0
                      ? Math.round(quizAttempts.reduce((sum, a) => sum + a.accuracy, 0) / quizAttempts.length)
                      : 0;

                    return (
                      <motion.div
                        key={quiz.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="group flex flex-col md:flex-row md:items-center gap-6 p-5 rounded-[2rem] bg-secondary/20 border-2 border-border/50 hover:border-primary/50 transition-all cursor-pointer"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-background flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Activity className="w-7 h-7 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-lg font-black truncate group-hover:text-primary transition-colors">{quiz.title}</h4>
                            {!quiz.isPublished && <Badge variant="secondary" className="font-black text-[8px] uppercase">Draft</Badge>}
                          </div>
                          <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {quizAttempts.length} Completed</span>
                            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {avgAccuracy}% Avg</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/teacher/quizzes/${quiz.id}/reports`}>
                            <Button size="sm" variant="ghost" className="rounded-xl font-black text-xs uppercase hover:bg-primary/10 hover:text-primary">Reports</Button>
                          </Link>
                          <Link href={`/teacher/quizzes/${quiz.id}`}>
                            <Button size="sm" className="rounded-xl bg-background border border-border/50 font-black text-xs uppercase text-foreground hover:bg-secondary transition-colors">Edit</Button>
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-none overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-accent" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black flex items-center gap-3">
                    <Users className="w-6 h-6 text-accent" />
                    Student List
                  </CardTitle>
                  <CardDescription className="text-base font-medium">See performance data of all enrolled students.</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Search students..." 
                    className="h-10 pl-10 pr-4 rounded-xl bg-secondary/50 border border-border/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 w-48 lg:w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingStudents ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 rounded-[2rem] bg-secondary/10 animate-pulse" />
                  ))}
                </div>
              ) : classStudents.length === 0 ? (
                <div className="text-center py-12 bg-secondary/10 rounded-3xl border-2 border-dashed border-border/50">
                  <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="font-black text-muted-foreground">No students enrolled yet.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {classStudents.map((student, i) => {
                    const studentAttempts = attempts.filter(a => a.studentId === student.id && classQuizzes.some(q => q.id === a.quizId));
                    const studentAvg = studentAttempts.length > 0
                      ? Math.round(studentAttempts.reduce((sum, a) => sum + a.accuracy, 0) / studentAttempts.length)
                      : 0;

                    return (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="flex items-center gap-4 p-4 rounded-[2rem] bg-secondary/10 border border-border/50 hover:bg-secondary/20 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary to-background border border-border/50 flex items-center justify-center font-black text-primary shadow-inner">
                          {student.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-foreground group-hover:text-primary transition-colors truncate">{student.name}</h4>
                          <p className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest">{student.email}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-black text-foreground">{studentAvg}%</div>
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Accuracy</p>
                        </div>
                        <div className="w-px h-8 bg-border/50 mx-2" />
                        <div className="text-right">
                          <div className="text-lg font-black text-primary">{student.totalXP || 0}</div>
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Points</p>
                        </div>
                        <Button size="icon" variant="ghost" className="rounded-xl ml-2 group-hover:bg-primary/10 group-hover:text-primary">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
           <Card className="glass-card border-none overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-rose-500/5 pointer-events-none" />
            <CardHeader>
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Top Students
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              {classStudents.length === 0 ? (
                <p className="text-sm font-medium text-muted-foreground italic text-center py-4">No data available.</p>
              ) : (
                [...classStudents]
                  .sort((a, b) => (b.totalXP || 0) - (a.totalXP || 0))
                  .slice(0, 5)
                  .map((student, i) => (
                    <div key={student.id} className="flex items-center justify-between p-3 rounded-2xl bg-background/40 border border-border/40 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                          i === 0 ? 'bg-amber-400 text-amber-950 shadow-lg shadow-amber-400/20' :
                          i === 1 ? 'bg-slate-300 text-slate-900' :
                          i === 2 ? 'bg-amber-600 text-amber-50' :
                          'bg-secondary text-muted-foreground'
                        }`}>
                          {i + 1}
                        </div>
                        <span className="text-xs font-black text-foreground truncate max-w-[100px]">{student.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-primary">{student.totalXP || 0}</span>
                        <span className="text-[8px] font-black text-muted-foreground ml-1 uppercase">Points</span>
                      </div>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>

          <Card className="glass-card border-none overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
            <CardHeader>
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {classAttempts.length === 0 ? (
                <p className="text-xs font-medium text-muted-foreground italic text-center py-4">No recent activity detected.</p>
              ) : (
                classAttempts
                  .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
                  .slice(0, 5)
                  .map((attempt, i) => {
                    const student = classStudents.find(s => s.id === attempt.studentId);
                    const quiz = classQuizzes.find(q => q.id === attempt.quizId);
                    return (
                      <div key={attempt.id} className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center font-black text-xs text-primary">
                          {student?.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-foreground truncate">{student?.name}</p>
                          <p className="text-[8px] font-black text-muted-foreground uppercase">{quiz?.title}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[10px] font-black text-emerald-500">+{attempt.xpEarned}</div>
                          <div className="text-[8px] font-black text-muted-foreground uppercase">{new Date(attempt.startedAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    );
                  })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
