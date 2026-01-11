"use client";
// HMR verification comment
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const AnimatePresence = dynamic(() => import('framer-motion').then(mod => mod.AnimatePresence), { ssr: false });
import {
  Brain,
  GraduationCap,
  Users,
  Shield,
  Sparkles,
  Trophy,
  Target,
  Zap,
  BookOpen,
  ChevronRight,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function Home() {
  const { user, isAuthenticated, login, register } = useAuth();
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState<'teacher' | 'student'>('student');

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(user.role === 'teacher' ? '/teacher' : '/student');
    }
  }, [isAuthenticated, user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const success = await login(loginEmail, loginPassword);
    
    if (success) {
      toast.success('Welcome back!', {
        description: 'Redirecting to your dashboard...',
      });
      router.push(user?.role === 'teacher' ? '/teacher' : '/student');
      return; // Stop loading state here as we are navigating
    } else {
      toast.error('Login failed', {
        description: 'Invalid email or password.',
      });
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const success = await register(registerName, registerEmail, registerPassword, registerRole);
    
    if (success) {
      toast.success('Account created!', {
        description: 'Welcome to QuizMaster AI!',
      });
      router.push(registerRole === 'teacher' ? '/teacher' : '/student');
      return;
    } else {
      toast.error('Registration failed', {
        description: 'Please try again.',
      });
    }
    setLoading(false);
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Quizzes',
      description: 'Generate quizzes from topics or PDFs using advanced AI',
      color: 'from-violet-500 to-purple-600',
    },
    {
      icon: Shield,
      title: 'Anti-Cheat Protection',
      description: 'Defense-in-depth security with behavior monitoring',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Trophy,
      title: 'Gamification',
      description: 'XP system, badges, and leaderboards to motivate learning',
      color: 'from-amber-500 to-orange-600',
    },
    {
      icon: Target,
      title: 'Adaptive Practice',
      description: 'Infinite practice mode with difficulty adjustment',
      color: 'from-rose-500 to-pink-600',
    },
  ];

  const stats = [
    { value: '50K+', label: 'Questions Generated' },
    { value: '10K+', label: 'Active Students' },
    { value: '500+', label: 'Teachers' },
    { value: '99.9%', label: 'Uptime' },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 100, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] will-change-transform" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
            x: [0, -80, 0],
            y: [0, 70, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[30%] -left-[10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[100px] will-change-transform" 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <nav className="relative z-50 px-6 py-6 border-b border-border/40 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-black text-gradient">
              QuizMaster AI
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <button
              onClick={() => { setShowAuth(true); setAuthTab('login'); }}
              className="text-foreground/70 hover:text-primary font-medium transition-colors hidden sm:block"
            >
              Sign In
            </button>
            <Button
              onClick={() => { setShowAuth(true); setAuthTab('register'); }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 rounded-full px-8 py-6 text-lg font-bold"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        <section className="px-6 pt-24 pb-32">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8 animate-float">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-bold uppercase tracking-widest">Smart Learning</span>
                </div>
                
                <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-tight">
                  <span className="text-foreground">Elevate Your </span>
                  <br className="hidden md:block" />
                  <span className="text-gradient">Knowledge</span>
                </h1>
                
                <p className="text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                  Learn better with AI quizzes, secure testing, 
                  and fun rewards to track your progress.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
                  <Button
                    size="lg"
                    onClick={() => { setShowAuth(true); setAuthTab('register'); setRegisterRole('teacher'); }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-16 px-10 text-xl font-bold shadow-2xl shadow-primary/30 rounded-2xl group w-full sm:w-auto"
                  >
                    <GraduationCap className="w-6 h-6 mr-3" />
                    For Teachers
                    <ChevronRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => { setShowAuth(true); setAuthTab('register'); setRegisterRole('student'); }}
                    className="border-2 border-border h-16 px-10 text-xl font-bold hover:bg-secondary/50 rounded-2xl w-full sm:w-auto backdrop-blur-sm"
                  >
                    <Users className="w-6 h-6 mr-3" />
                    Join as Student
                  </Button>
                </div>

              </motion.div>
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section className="px-6 py-24 relative">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4">Master Every Feature</h2>
              <p className="text-xl text-muted-foreground font-medium">Built to help you teach and learn better.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[280px]">
              {/* Feature 1: AI Power */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="md:col-span-8 group relative overflow-hidden rounded-3xl glass-card p-8 flex flex-col justify-end"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] -mr-32 -mt-32 group-hover:bg-primary/30 transition-colors" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20 mb-6 font-black text-white">
                    <Brain className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-black mb-3">AI Powered Quizzes</h3>
                  <p className="text-lg text-muted-foreground max-w-md font-medium">Create smart quizzes from any topic or document in seconds.</p>
                </div>
              </motion.div>

              {/* Feature 2: Stats */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="md:col-span-4 rounded-3xl bg-accent p-8 flex flex-col justify-center text-white"
              >
                <div className="space-y-6">
                  {stats.slice(0, 2).map(s => (
                    <div key={s.label}>
                      <div className="text-5xl font-black mb-1">{s.value}</div>
                      <div className="text-white/80 font-bold uppercase tracking-widest text-xs">{s.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Feature 3: Anti-Cheat */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="md:col-span-4 group relative overflow-hidden rounded-3xl bg-slate-900 border border-white/10 p-8 flex flex-col justify-between"
              >
                <Shield className="w-12 h-12 text-primary" />
                <div>
                  <h3 className="text-2xl font-black text-white mb-2">Secure Testing</h3>
                  <p className="text-slate-400 font-medium">Stay fair with built-in security and monitoring.</p>
                </div>
              </motion.div>

              {/* Feature 4: Gamification */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="md:col-span-8 group relative overflow-hidden rounded-3xl glass-card p-8 flex items-center justify-between"
              >
                <div className="max-w-md">
                  <h3 className="text-3xl font-black mb-4">Fun Rewards</h3>
                  <p className="text-lg text-muted-foreground font-medium">
                    Stay motivated with points, badges, and class rankings to see how you are doing.
                  </p>
                </div>
                <div className="hidden lg:flex gap-4">
                  <div className="w-20 h-20 rounded-[2rem] bg-amber-400/20 flex items-center justify-center animate-bounce">
                    <Trophy className="w-10 h-10 text-amber-500" />
                  </div>
                  <div className="w-20 h-20 rounded-[2rem] bg-primary/20 flex items-center justify-center animate-bounce duration-200">
                    <Zap className="w-10 h-10 text-primary" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="px-6 py-32 bg-slate-900 overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-5xl md:text-7xl font-black text-white mb-8">
              Ready to <span className="text-primary italic">Start</span> Learning?
            </h2>
            <p className="text-2xl text-slate-400 mb-12 font-medium">
              Join our community of teachers and students.
            </p>
            <Button
              size="lg"
              onClick={() => { setShowAuth(true); setAuthTab('register'); }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-16 px-12 text-xl font-bold shadow-2xl shadow-primary/30 rounded-2xl"
            >
              Get Started for Free
              <Zap className="w-6 h-6 ml-3" />
            </Button>
          </div>
          {/* Background decoration */}
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/20 rounded-full blur-[100px]" />
        </section>
      </main>

      <footer className="relative z-10 px-6 py-12 bg-background border-t border-border/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black text-foreground">QuizMaster AI</span>
          </div>
          <div className="text-muted-foreground font-medium text-center md:text-right">
            <p>© 2026 QuizMaster AI. All rights reserved.</p>
            <p className="text-sm mt-1">Secure and reliable platform for everyone.</p>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showAuth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl"
            onClick={(e) => e.target === e.currentTarget && setShowAuth(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md"
            >
              <Card className="border border-white/10 shadow-2xl bg-card overflow-hidden rounded-[2.5rem]">
                <CardHeader className="text-center pb-1 pt-3">
                  <div className="w-10 h-10 mx-auto mb-1 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle className="text-lg font-black tracking-tight">Sign In / Register</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-3">
                  <Tabs value={authTab} onValueChange={(v) => setAuthTab(v as 'login' | 'register')}>
                    <TabsList className="grid w-full grid-cols-2 mb-3 bg-secondary/50 p-1 rounded-xl overflow-hidden h-9">
                      <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md font-black text-[10px] uppercase">Sign In</TabsTrigger>
                      <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md font-black text-[10px] uppercase">Register</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                      <form onSubmit={handleLogin} className="space-y-3">
                        <div className="space-y-1">
                          <Label htmlFor="login-email" className="text-xs font-bold ml-1">Email Address</Label>
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="user@system.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="h-10 rounded-xl px-4 text-sm bg-secondary/30 focus:bg-background transition-all"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="login-password" className="text-xs font-bold ml-1">Password</Label>
                          <div className="relative">
                            <Input
                              id="login-password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              className="h-10 rounded-xl px-4 text-sm"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                        <Button
                          type="submit"
                          className="w-full h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 mt-2"
                          disabled={loading}
                        >
                          {loading ? 'Entering...' : 'Sign In'}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="register">
                      <form onSubmit={handleRegister} className="space-y-3">
                        <div className="space-y-1">
                          <Label htmlFor="register-name" className="text-xs font-bold ml-1">Full Name</Label>
                          <Input
                            id="register-name"
                            type="text"
                            placeholder="John Doe"
                            value={registerName}
                            onChange={(e) => setRegisterName(e.target.value)}
                            className="h-10 rounded-xl px-4 text-sm"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="register-email" className="text-xs font-bold ml-1">Email</Label>
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="your@email.com"
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                            className="h-10 rounded-xl px-4 text-sm"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="register-password" className="text-xs font-bold ml-1">Password</Label>
                          <div className="relative">
                            <Input
                              id="register-password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Create a password"
                              value={registerPassword}
                              onChange={(e) => setRegisterPassword(e.target.value)}
                              className="h-10 rounded-xl px-4 text-sm"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-bold ml-1">I am a...</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setRegisterRole('teacher')}
                              className={`p-2 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                                registerRole === 'teacher'
                                  ? 'border-violet-500 bg-violet-50 text-violet-700'
                                  : 'border-slate-200 hover:border-violet-200'
                              }`}
                            >
                              <GraduationCap className="w-4 h-4" />
                              <span className="text-xs font-medium">Teacher</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setRegisterRole('student')}
                              className={`p-2 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                                registerRole === 'student'
                                  ? 'border-violet-500 bg-violet-50 text-violet-700'
                                  : 'border-slate-200 hover:border-violet-200'
                              }`}
                            >
                              <BookOpen className="w-4 h-4" />
                              <span className="text-xs font-medium">Student</span>
                            </button>
                          </div>
                        </div>
                        <Button
                          type="submit"
                          className="w-full h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 mt-2"
                          disabled={loading}
                        >
                          {loading ? 'Creating account...' : 'Create Account'}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>

                  <button
                    onClick={() => setShowAuth(false)}
                    className="w-full mt-1 text-[10px] font-bold text-slate-400 hover:text-primary transition-colors tracking-widest uppercase"
                  >
                    Cancel
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
