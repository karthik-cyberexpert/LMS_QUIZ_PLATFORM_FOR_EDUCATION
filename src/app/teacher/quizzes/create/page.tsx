"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  simulateAIQuizGeneration, 
  simulatePDFQuizGeneration 
} from '@/lib/mock-data';
import { Quiz, QuizQuestion, Difficulty, AIQuizConfig, PDFQuizConfig } from '@/lib/types';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Brain,
  FileText,
  Wand2,
  Upload,
  Loader2,
  Check,
  GripVertical,
  Eye,
  Save,
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Settings2,
} from 'lucide-react';
import Link from 'next/link';

export default function CreateQuizPage() {
  const { user, getTeacherClasses, addQuiz } = useAuth();
  const router = useRouter();
  const teacherClasses = getTeacherClasses();

  const [creationMethod, setCreationMethod] = useState<'manual' | 'ai_topic' | 'ai_pdf'>('manual');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);

  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [timeLimit, setTimeLimit] = useState(600);
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadline, setDeadline] = useState('');

  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: '1',
      text: '',
      options: [
        { id: '1a', text: '', isCorrect: true },
        { id: '1b', text: '', isCorrect: false },
        { id: '1c', text: '', isCorrect: false },
        { id: '1d', text: '', isCorrect: false },
      ],
      marks: 10,
    },
  ]);

  const [aiConfig, setAiConfig] = useState<AIQuizConfig>({
    subject: 'Computer Science',
    topic: '',
    description: '',
    difficulty: 'medium',
    numberOfQuestions: 5,
    optionsPerQuestion: 4,
    marksPerQuestion: 10,
    timeLimit: 600,
  });

  const [pdfConfig, setPdfConfig] = useState<PDFQuizConfig>({
    fileName: '',
    fileContent: '',
    difficulty: 'medium',
    numberOfQuestions: 5,
    optionsPerQuestion: 4,
    marksPerQuestion: 10,
    timeLimit: 600,
  });

  const addQuestion = () => {
    const newId = String(questions.length + 1);
    setQuestions([
      ...questions,
      {
        id: newId,
        text: '',
        options: [
          { id: `${newId}a`, text: '', isCorrect: true },
          { id: `${newId}b`, text: '', isCorrect: false },
          { id: `${newId}c`, text: '', isCorrect: false },
          { id: `${newId}d`, text: '', isCorrect: false },
        ],
        marks: 10,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_: unknown, i: number) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: string, value: string | number) => {
    const updated = [...questions];
    (updated[index] as Record<string, unknown>)[field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, field: string, value: string | boolean) => {
    const updated = [...questions];
    if (field === 'isCorrect' && value === true) {
      updated[qIndex].options = updated[qIndex].options.map((opt: { isCorrect: boolean }, i: number) => ({
        ...opt,
        isCorrect: i === oIndex,
      }));
    } else {
      (updated[qIndex].options[oIndex] as Record<string, unknown>)[field] = value;
    }
    setQuestions(updated);
  };

  const addOption = (qIndex: number) => {
    const updated = [...questions];
    const newId = `${updated[qIndex].id}${String.fromCharCode(97 + updated[qIndex].options.length)}`;
    updated[qIndex].options.push({ id: newId, text: '', isCorrect: false });
    setQuestions(updated);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    if (updated[qIndex].options.length > 2) {
      updated[qIndex].options = updated[qIndex].options.filter((_: unknown, i: number) => i !== oIndex);
      if (!updated[qIndex].options.some((o: { isCorrect: boolean }) => o.isCorrect)) {
        updated[qIndex].options[0].isCorrect = true;
      }
      setQuestions(updated);
    }
  };

  const handleAIGenerate = async () => {
    if (!aiConfig.topic) {
      toast.error('Please enter a topic');
      return;
    }
    setLoading(true);
    try {
      const quiz = await simulateAIQuizGeneration(aiConfig);
      setGeneratedQuiz(quiz);
      setShowPreview(true);
      toast.success('Quiz generated successfully!', {
        description: 'Review the questions before publishing.',
      });
    } catch {
      toast.error('Failed to generate quiz');
    }
    setLoading(false);
  };

  const handlePDFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfConfig((prev: PDFQuizConfig) => ({
        ...prev,
        fileName: file.name,
        fileContent: 'mock-content',
      }));
      toast.success('PDF uploaded', {
        description: file.name,
      });
    }
  };

  const handlePDFGenerate = async () => {
    if (!pdfConfig.fileName) {
      toast.error('Please upload a PDF file');
      return;
    }
    setLoading(true);
    try {
      const quiz = await simulatePDFQuizGeneration(pdfConfig);
      setGeneratedQuiz(quiz);
      setShowPreview(true);
      toast.success('Quiz generated from PDF!', {
        description: 'Review the questions before publishing.',
      });
    } catch {
      toast.error('Failed to generate quiz from PDF');
    }
    setLoading(false);
  };

  const handleAcceptGeneratedQuiz = () => {
    if (!generatedQuiz) return;
    
    setQuizTitle(generatedQuiz.title);
    setQuizDescription(generatedQuiz.description);
    setDifficulty(generatedQuiz.difficulty);
    setTimeLimit(generatedQuiz.timeLimit);
    setQuestions(generatedQuiz.questions);
    setGeneratedQuiz(null);
    setShowPreview(false);
    toast.success('Neural vectors merged into core assessment.');
  };

  const handleSaveQuiz = (publish: boolean) => {
    if (!selectedClass) {
      toast.error('Please select a class');
      return;
    }

    let finalQuiz: Quiz;

    if (generatedQuiz) {
      finalQuiz = {
        ...generatedQuiz,
        classId: selectedClass,
        teacherId: user?.id || '',
        title: quizTitle || generatedQuiz.title,
        description: quizDescription || generatedQuiz.description,
        isPublished: publish,
        deadline: hasDeadline && deadline ? new Date(deadline) : undefined,
      };
    } else {
      if (!quizTitle) {
        toast.error('Please enter a quiz title');
        return;
      }
      if (questions.some((q: QuizQuestion) => !q.text || q.options.some((o: { text: string }) => !o.text))) {
        toast.error('Please fill in all questions and options');
        return;
      }

      finalQuiz = {
        id: `quiz-${Date.now()}`,
        title: quizTitle,
        description: quizDescription,
        classId: selectedClass,
        teacherId: user?.id || '',
        questions,
        difficulty,
        totalMarks: questions.reduce((sum: number, q: QuizQuestion) => sum + q.marks, 0),
        timeLimit,
        maxAttempts: 3,
        isPublished: publish,
        createdAt: new Date(),
        subject: 'General',
        topic: quizTitle,
        creationMethod: 'manual',
        deadline: hasDeadline && deadline ? new Date(deadline) : undefined,
      };
    }

    addQuiz(finalQuiz);
    toast.success(publish ? 'Quiz published!' : 'Quiz saved as draft', {
      description: publish ? 'Students can now attempt this quiz.' : 'You can publish it later.',
    });
    router.push('/teacher/quizzes');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-secondary/30 p-8 rounded-[2.5rem] border border-border/50 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Settings2 className="w-32 h-32" />
        </div>
        
        <div className="flex items-center gap-6 relative z-10">
          <Link href="/teacher/quizzes">
            <Button variant="outline" size="icon" className="w-12 h-12 rounded-2xl border-2 hover:bg-background transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest px-2 py-0.5">
                Architect Mode
              </Badge>
              <span className="text-muted-foreground/40 font-black text-[10px] tracking-widest uppercase">ID: ALPHA-QUIZ-NEW</span>
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tight leading-tight">Create Mission</h1>
            <p className="text-muted-foreground font-bold mt-1">Configure assessment module and operational protocols</p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Button 
            variant="ghost" 
            className="h-14 px-8 rounded-2xl font-black uppercase text-xs tracking-widest border border-border/50 bg-background/50"
            onClick={() => router.push('/teacher/quizzes')}
          >
            Abort
          </Button>
          <Button 
            className="h-14 px-10 rounded-2xl font-black uppercase text-xs tracking-widest bg-foreground text-background hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-foreground/10 flex items-center gap-2"
            onClick={() => handleSaveQuiz(false)}
          >
            <Save className="w-4 h-4" />
            Archive Draft
          </Button>
        </div>
      </div>

      <Tabs 
        value={creationMethod} 
        onValueChange={(v: string) => {
          setCreationMethod(v as 'manual' | 'ai_topic' | 'ai_pdf');
          setGeneratedQuiz(null);
          setShowPreview(false);
        }}
        className="space-y-8"
      >
        <div className="max-w-2xl mx-auto p-2 bg-secondary/50 backdrop-blur-xl rounded-[2rem] border border-border/50">
          <TabsList className="grid w-full grid-cols-3 bg-transparent h-auto p-0 border-none">
            <TabsTrigger 
              value="manual" 
              className="gap-3 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-primary"
            >
              <FileText className="w-4 h-4" />
              Manual Sync
            </TabsTrigger>
            <TabsTrigger 
              value="ai_topic" 
              className="gap-3 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-accent"
            >
              <Brain className="w-4 h-4" />
              Neural Logic
            </TabsTrigger>
            <TabsTrigger 
              value="ai_pdf" 
              className="gap-3 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-violet-500"
            >
              <Upload className="w-4 h-4" />
              Source Intake
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TabsContent value="manual" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-200">
              <Card className="border-none glass-card shadow-2xl rounded-[3rem] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-50" />
                <CardHeader className="p-10 pb-6 border-b border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black tracking-tight">Quiz Metadata</CardTitle>
                      <CardDescription className="font-bold text-muted-foreground">Primary configuration for the assessment unit</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Quiz Designation</Label>
                      <Input
                        placeholder="e.g., QUANTUM COMPUTING 101"
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                        className="h-14 rounded-2xl bg-secondary/30 border-2 border-border/50 focus:border-primary transition-all font-bold px-6"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Target Cohort</Label>
                      <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger className="h-14 rounded-2xl bg-secondary/30 border-2 border-border/50 focus:border-primary transition-all font-bold px-6">
                          <SelectValue placeholder="Select Deployment Class" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-2 border-border/50 glass-card">
                          {teacherClasses.map((cls: { id: string; name: string }) => (
                            <SelectItem key={cls.id} value={cls.id} className="font-bold rounded-xl m-1">{cls.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Mission Briefing</Label>
                    <Textarea
                      placeholder="Detailed operational instructions for students..."
                      value={quizDescription}
                      onChange={(e) => setQuizDescription(e.target.value)}
                      className="min-h-[120px] rounded-[2rem] bg-secondary/30 border-2 border-border/50 focus:border-primary transition-all font-bold p-6"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Complexity Level</Label>
                      <Select value={difficulty} onValueChange={(v: Difficulty) => setDifficulty(v)}>
                        <SelectTrigger className="h-14 rounded-2xl bg-secondary/30 border-2 border-border/50 focus:border-primary transition-all font-bold px-6">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-2 border-border/50 glass-card">
                          <SelectItem value="very_easy" className="font-bold rounded-xl m-1">NEOPHYTE (0.6x XP)</SelectItem>
                          <SelectItem value="easy" className="font-bold rounded-xl m-1">INITIATE (0.8x XP)</SelectItem>
                          <SelectItem value="medium" className="font-bold rounded-xl m-1">OPERATIVE (1.0x XP)</SelectItem>
                          <SelectItem value="hard" className="font-bold rounded-xl m-1">VETERAN (1.25x XP)</SelectItem>
                          <SelectItem value="very_hard" className="font-bold rounded-xl m-1">ELITE (1.5x XP)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center ml-1">
                        <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Temporal Limit</Label>
                        <span className="font-black text-primary text-sm">{Math.floor(timeLimit / 60)}:00 Units</span>
                      </div>
                      <Slider
                        value={[timeLimit]}
                        onValueChange={([v]) => setTimeLimit(v)}
                        min={60}
                        max={3600}
                        step={60}
                        className="py-4"
                      />
                    </div>
                  </div>
                  
                  <div className="p-8 rounded-[2.5rem] bg-secondary/30 border-2 border-border/50 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <Label className="text-sm font-black uppercase tracking-tight">Submission Deadline</Label>
                          <p className="text-xs text-muted-foreground font-bold">Lock mission synchronization after date</p>
                        </div>
                      </div>
                      <Switch checked={hasDeadline} onCheckedChange={setHasDeadline} />
                    </div>
                    {hasDeadline && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="pt-2"
                      >
                        <Input
                          type="datetime-local"
                          value={deadline}
                          onChange={(e) => setDeadline(e.target.value)}
                          className="h-14 rounded-2xl bg-background border-2 border-border/50 focus:border-accent transition-all font-bold px-6"
                        />
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
                      <Target className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-tight uppercase">Operational Units</h2>
                      <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">{questions.length} Vector(s)</p>
                    </div>
                  </div>
                  <Button 
                    onClick={addQuestion} 
                    className="h-12 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-primary hover:scale-[1.05] active:scale-95 transition-all shadow-lg shadow-primary/20 gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Inject Unit
                  </Button>
                </div>

                <AnimatePresence mode="popLayout">
                  {questions.map((question: QuizQuestion, qIndex: number) => (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="p-8 glass-card border-none shadow-xl rounded-[2.5rem] space-y-8 relative overflow-hidden group"
                    >
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-border/50 group-hover:bg-primary transition-colors" />
                      
                      <div className="flex items-start gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-foreground font-black text-xl shrink-0 border border-border/50 shadow-inner">
                          {qIndex + 1}
                        </div>
                        <div className="flex-1 space-y-6">
                          <div className="space-y-2">
                            <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Question Vector</Label>
                            <Input
                              placeholder="Enter operational query..."
                              value={question.text}
                              onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                              className="h-14 rounded-2xl bg-secondary/30 border-2 border-border/50 focus:border-primary transition-all font-bold px-6"
                            />
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            {question.options.map((option, oIndex: number) => (
                              <div key={option.id} className="relative flex items-center gap-3 bg-background/50 p-2 rounded-[1.5rem] border border-border/50 group/opt">
                                <button
                                  type="button"
                                  onClick={() => updateOption(qIndex, oIndex, 'isCorrect', true)}
                                  className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${
                                    option.isCorrect
                                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                      : 'border-border bg-background hover:border-emerald-200'
                                  }`}
                                >
                                  {option.isCorrect ? <Check className="w-5 h-5" /> : <span className="font-black text-[10px]">{String.fromCharCode(65 + oIndex)}</span>}
                                </button>
                                <Input
                                  placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                  value={option.text}
                                  onChange={(e) => updateOption(qIndex, oIndex, 'text', e.target.value)}
                                  className="h-12 border-none bg-transparent focus-visible:ring-0 font-bold"
                                />
                                {question.options.length > 2 && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeOption(qIndex, oIndex)}
                                    className="h-10 w-10 rounded-xl text-muted-foreground/30 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover/opt:opacity-100"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addOption(qIndex)}
                              disabled={question.options.length >= 6}
                              className="rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 hover:bg-secondary"
                            >
                              <Plus className="w-4 h-4" />
                              Add Option
                            </Button>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-3 px-4 py-2 bg-secondary/30 rounded-xl border border-border/50">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Weight</Label>
                                <Input
                                  type="number"
                                  value={question.marks}
                                  onChange={(e) => updateQuestion(qIndex, 'marks', parseInt(e.target.value) || 0)}
                                  className="w-16 h-8 bg-transparent border-none text-right font-black p-0 focus-visible:ring-0"
                                />
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">XP</span>
                              </div>
                              {questions.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeQuestion(qIndex)}
                                  className="h-12 w-12 rounded-2xl text-muted-foreground/30 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                <Button 
                  variant="outline"
                  onClick={addQuestion} 
                  className="w-full h-20 rounded-[2.5rem] border-2 border-dashed border-border/50 hover:border-primary hover:bg-primary/5 transition-all font-black uppercase text-xs tracking-[0.2em] gap-4"
                >
                  <Plus className="w-6 h-6 text-primary" />
                  Append New Operational Unit
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="ai_topic" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-200">
              <Card className="border-none glass-card shadow-2xl rounded-[3rem] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-primary to-accent opacity-50" />
                <CardHeader className="p-10 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black tracking-tight uppercase">Neural Synthesis</CardTitle>
                      <CardDescription className="font-bold text-muted-foreground">Generate assessment vectors using advanced AI logic</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Subject domain</Label>
                      <Select 
                        value={aiConfig.subject} 
                        onValueChange={(v) => setAiConfig(prev => ({ ...prev, subject: v }))}
                      >
                        <SelectTrigger className="h-14 rounded-2xl bg-secondary/30 border-2 border-border/50 focus:border-accent transition-all font-bold px-6">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-2 border-border/50 glass-card">
                          <SelectItem value="Computer Science" className="font-bold rounded-xl m-1">Computer Science</SelectItem>
                          <SelectItem value="Mathematics" className="font-bold rounded-xl m-1">Mathematics</SelectItem>
                          <SelectItem value="History" className="font-bold rounded-xl m-1">History</SelectItem>
                          <SelectItem value="Science" className="font-bold rounded-xl m-1">Science</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Topic node</Label>
                      <Input
                        placeholder="e.g., QUANTUM ENTANGLEMENT"
                        value={aiConfig.topic}
                        onChange={(e) => setAiConfig(prev => ({ ...prev, topic: e.target.value }))}
                        className="h-14 rounded-2xl bg-secondary/30 border-2 border-border/50 focus:border-accent transition-all font-bold px-6 uppercase"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Prompt modifiers (Optional)</Label>
                    <Textarea
                      placeholder="Specify focus areas or target learning objectives..."
                      value={aiConfig.description}
                      onChange={(e) => setAiConfig(prev => ({ ...prev, description: e.target.value }))}
                      className="min-h-[100px] rounded-[2rem] bg-secondary/30 border-2 border-border/50 focus:border-accent transition-all font-bold p-6"
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { label: 'Complexity', key: 'difficulty', options: [
                        { v: 'very_easy', l: 'NEO' }, { v: 'easy', l: 'INIT' }, { v: 'medium', l: 'OPER' }, { v: 'hard', l: 'VET' }, { v: 'very_hard', l: 'ELITE' }
                      ]},
                      { label: 'Quantity', key: 'numberOfQuestions', options: [3, 5, 10, 15, 20].map(n => ({ v: n, l: `${n} Units` })) },
                      { label: 'Variants', key: 'optionsPerQuestion', options: [2, 3, 4, 5, 6].map(n => ({ v: n, l: `${n} Opt` })) },
                      { label: 'XP Weight', key: 'marksPerQuestion', options: [5, 10, 15, 20].map(n => ({ v: n, l: `${n} XP` })) },
                    ].map((cfg) => (
                      <div key={cfg.key} className="space-y-3">
                        <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">{cfg.label}</Label>
                        <Select 
                          value={String((aiConfig as any)[cfg.key])} 
                          onValueChange={(v) => setAiConfig(prev => ({ ...prev, [cfg.key]: isNaN(Number(v)) ? v : parseInt(v) }))}
                        >
                          <SelectTrigger className="h-12 rounded-xl bg-secondary/30 border-2 border-border/50 focus:border-accent transition-all font-bold px-4 text-xs uppercase">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-2 border-border/50 glass-card">
                            {cfg.options.map((o: any) => (
                              <SelectItem key={o.v} value={String(o.v)} className="font-bold rounded-lg m-1 text-xs">{o.l}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center ml-1">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Temporal Matrix</Label>
                      <span className="font-black text-accent text-sm">{Math.floor(aiConfig.timeLimit / 60)}:00 Units</span>
                    </div>
                    <Slider
                      value={[aiConfig.timeLimit]}
                      onValueChange={([v]) => setAiConfig(prev => ({ ...prev, timeLimit: v }))}
                      min={60}
                      max={3600}
                      step={60}
                    />
                  </div>
                  <Button
                    onClick={handleAIGenerate}
                    disabled={loading || !aiConfig.topic}
                    className="w-full h-16 rounded-[2rem] font-black uppercase text-sm tracking-widest bg-gradient-to-r from-accent to-primary hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-accent/20 gap-3"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Synthesizing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        Execute Synthesis
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai_pdf" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-200">
              <Card className="border-none glass-card shadow-2xl rounded-[3rem] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-primary to-violet-500 opacity-50" />
                <CardHeader className="p-10 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-violet-500" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black tracking-tight uppercase">Source Extraction</CardTitle>
                      <CardDescription className="font-bold text-muted-foreground">Hydrate assessment logic from raw documentation (PDF)</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-primary rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                    <div className="relative border-2 border-dashed border-border/50 rounded-[2.5rem] p-12 text-center bg-secondary/30 backdrop-blur-xl group-hover:border-violet-300 transition-all cursor-pointer overflow-hidden">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setPdfConfig(prev => ({
                              ...prev,
                              fileName: file.name,
                              fileContent: 'mock-content',
                            }));
                            toast.success('Source Uploaded', { description: file.name });
                          }
                        }}
                        className="hidden"
                        id="pdf-upload"
                      />
                      <label htmlFor="pdf-upload" className="cursor-pointer block">
                        {pdfConfig.fileName ? (
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 rounded-3xl bg-violet-100 flex items-center justify-center shadow-lg">
                              <FileText className="w-10 h-10 text-violet-600" />
                            </div>
                            <div>
                              <p className="text-xl font-black text-foreground uppercase tracking-tight">{pdfConfig.fileName}</p>
                              <p className="text-xs text-muted-foreground font-bold flex items-center justify-center gap-2 mt-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                SOURCE VALIDATED - CLICK TO REPLACE
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Upload className="w-16 h-16 text-muted-foreground/20 mx-auto" />
                            <div>
                              <p className="text-xl font-black text-foreground uppercase tracking-tight">Deposit Source PDF</p>
                              <p className="text-sm text-muted-foreground font-bold mt-1 uppercase tracking-widest border-t border-border/50 pt-4 w-fit mx-auto">
                                MAX PAYLOAD: 10MB
                              </p>
                            </div>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Complexity', key: 'difficulty', options: [
                        { v: 'very_easy', l: 'NEO' }, { v: 'easy', l: 'INIT' }, { v: 'medium', l: 'OPER' }, { v: 'hard', l: 'VET' }, { v: 'very_hard', l: 'ELITE' }
                      ]},
                      { label: 'Quantity', key: 'numberOfQuestions', options: [3, 5, 10, 15, 20].map(n => ({ v: n, l: `${n} Units` })) },
                      { label: 'Variants', key: 'optionsPerQuestion', options: [2, 3, 4, 5, 6].map(n => ({ v: n, l: `${n} Opt` })) },
                      { label: 'XP Weight', key: 'marksPerQuestion', options: [5, 10, 15, 20].map(n => ({ v: n, l: `${n} XP` })) },
                    ].map((cfg) => (
                      <div key={cfg.key} className="space-y-3">
                        <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">{cfg.label}</Label>
                        <Select 
                          value={String((pdfConfig as any)[cfg.key])} 
                          onValueChange={(v) => setPdfConfig(prev => ({ ...prev, [cfg.key]: isNaN(Number(v)) ? v : parseInt(v) }))}
                        >
                          <SelectTrigger className="h-12 rounded-xl bg-secondary/30 border-2 border-border/50 focus:border-violet-500 transition-all font-bold px-4 text-xs uppercase">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-2 border-border/50 glass-card">
                            {cfg.options.map((o: any) => (
                              <SelectItem key={o.v} value={String(o.v)} className="font-bold rounded-lg m-1 text-xs">{o.l}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center ml-1">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Temporal Matrix</Label>
                      <span className="font-black text-violet-500 text-sm">{Math.floor(pdfConfig.timeLimit / 60)}:00 Units</span>
                    </div>
                    <Slider
                      value={[pdfConfig.timeLimit]}
                      onValueChange={([v]) => setPdfConfig(prev => ({ ...prev, timeLimit: v }))}
                      min={60}
                      max={3600}
                      step={60}
                    />
                  </div>
                  <Button
                    onClick={handlePDFGenerate}
                    disabled={loading || !pdfConfig.fileName}
                    className="w-full h-16 rounded-[2rem] font-black uppercase text-sm tracking-widest bg-gradient-to-r from-violet-600 to-primary hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-violet-500/20 gap-3"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Extracting Intelligence...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5" />
                        Execute Extraction
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {generatedQuiz && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="animate-in fade-in slide-in-from-bottom-4 duration-200"
              >
                <Card className="border-none glass-card shadow-2xl rounded-[3rem] overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-primary to-emerald-500 opacity-50" />
                  <CardHeader className="p-10 pb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-black tracking-tight uppercase">Neural Result</CardTitle>
                          <CardDescription className="font-bold text-muted-foreground">Verify synthesized vectors before deployment</CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-xs uppercase px-4 py-1.5 rounded-full">
                        {generatedQuiz.questions.length} Units Synthesized
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Assigned Title</Label>
                        <Input
                          value={quizTitle || generatedQuiz.title}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuizTitle(e.target.value)}
                          className="h-14 rounded-2xl bg-secondary/30 border-2 border-border/50 focus:border-emerald-500 transition-all font-bold px-6"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Target Class</Label>
                        <Select value={selectedClass} onValueChange={setSelectedClass}>
                          <SelectTrigger className="h-14 rounded-2xl bg-secondary/30 border-2 border-border/50 focus:border-emerald-500 transition-all font-bold px-6">
                            <SelectValue placeholder="SELECT TARGET" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-2 border-border/50 glass-card">
                            {teacherClasses.map((cls: { id: string; name: string }) => (
                              <SelectItem key={cls.id} value={cls.id} className="font-bold rounded-xl m-1">{cls.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Assessment Brief</Label>
                      <Textarea
                        value={quizDescription || generatedQuiz.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQuizDescription(e.target.value)}
                        className="min-h-[100px] rounded-[2rem] bg-secondary/30 border-2 border-border/50 focus:border-emerald-500 transition-all font-bold p-6"
                      />
                    </div>
                    
                    <div className="space-y-6">
                      <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Vector Preview</h3>
                      <div className="grid gap-4">
                        {generatedQuiz.questions.map((q, i) => (
                          <div key={q.id} className="p-6 bg-secondary/20 rounded-[2rem] border-2 border-border/30 hover:border-emerald-500/30 transition-all group">
                            <div className="flex items-start gap-4">
                              <span className="w-10 h-10 rounded-xl bg-background border-2 border-border/50 flex items-center justify-center font-black text-xs text-muted-foreground group-hover:text-emerald-500 group-hover:border-emerald-500/50 transition-all">
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              <div className="flex-1 space-y-4">
                                <p className="font-bold text-sm text-foreground leading-relaxed">{q.text}</p>
                                <div className="grid sm:grid-cols-2 gap-3">
                                  {q.options.map((opt) => (
                                    <div 
                                      key={opt.id} 
                                      className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                                        opt.isCorrect 
                                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' 
                                          : 'bg-background/40 border-border/50 text-muted-foreground opacity-60'
                                      }`}
                                    >
                                      <div className={`w-2 h-2 rounded-full ${opt.isCorrect ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-muted-foreground/30'}`} />
                                      <span className="text-[10px] font-bold tracking-tight">{opt.text}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-4 pt-6 border-t border-border/50">
                      <Button 
                        variant="outline" 
                        onClick={() => setGeneratedQuiz(null)}
                        className="flex-1 h-16 rounded-[2rem] border-2 font-black uppercase text-xs tracking-widest hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all"
                      >
                        Purge Memory
                      </Button>
                      <Button 
                        onClick={handleAcceptGeneratedQuiz}
                        className="flex-[2] h-16 rounded-[2rem] bg-emerald-600 hover:bg-emerald-700 font-black uppercase text-xs tracking-widest text-white shadow-xl shadow-emerald-500/20"
                      >
                        Accept & Initialize
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border-none glass-card shadow-2xl rounded-[3rem] sticky top-8 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Target className="w-32 h-32" />
              </div>
              <CardHeader className="p-10 border-b border-border/50">
                <CardTitle className="text-xl font-black tracking-tight uppercase">Mission Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="space-y-4">
                  {[
                    { label: 'Deployment Status', value: <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-black text-[10px] uppercase">Draft</Badge> },
                    { label: 'Active Vectors', value: `${generatedQuiz ? generatedQuiz.questions.length : questions.length} Units` },
                    { label: 'Net XP Reward', value: `${generatedQuiz ? generatedQuiz.totalMarks : questions.reduce((sum: number, q: QuizQuestion) => sum + q.marks, 0)} XP`, highlighted: true },
                    { label: 'Temporal Limit', value: <div className="flex items-center gap-2 font-black"><Clock className="w-4 h-4 text-muted-foreground" /> {Math.floor((generatedQuiz?.timeLimit || timeLimit) / 60)}:00</div> },
                    { label: 'Difficulty Grade', value: <Badge variant="outline" className="font-black text-[10px] uppercase bg-secondary/50 border-border/50">{(generatedQuiz?.difficulty || difficulty).replace('_', ' ')}</Badge> },
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center group">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                      <span className={`font-black ${item.highlighted ? 'text-primary' : 'text-foreground'}`}>{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-10 border-t border-border/50">
                  <Button
                    onClick={() => handleSaveQuiz(true)}
                    disabled={!selectedClass}
                    className="w-full h-16 rounded-[2rem] font-black uppercase text-sm tracking-[0.2em] bg-gradient-to-r from-primary via-primary to-accent hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 gap-3"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Deploy Assessment
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowPreview(true)}
                    className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all border-2 border-transparent hover:border-border/50"
                  >
                    <Eye className="w-4 h-4" />
                    Simulation Mode
                  </Button>
                </div>

                {!selectedClass && (
                  <p className="text-[10px] text-center font-bold text-destructive animate-pulse uppercase tracking-widest">
                    Identify target class to enable deployment
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
