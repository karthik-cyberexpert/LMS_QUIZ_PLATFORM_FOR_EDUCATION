"use client";

import React, { useState, useEffect, use } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { AIQuizConfig, Difficulty, Quiz, QuizQuestion } from '@/lib/types';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Check,
  Save,
  Clock,
  Target,
  Settings2,
  Loader2,
  FileText,
} from 'lucide-react';
import Link from 'next/link';

export default function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: quizId } = use(params);
  const { user, getTeacherClasses, updateQuiz, quizzes } = useAuth();
  const router = useRouter();
  const teacherClasses = getTeacherClasses();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [timeLimit, setTimeLimit] = useState(600);
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadline, setDeadline] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    const fetchQuizDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/quizzes/${quizId}`);
        if (res.ok) {
          const data = await res.json();
          const quiz = data.quiz as Quiz;
          
          setQuizTitle(quiz.title);
          setQuizDescription(quiz.description);
          setSelectedClass(quiz.classId);
          setDifficulty(quiz.difficulty);
          setTimeLimit(quiz.timeLimit);
          setIsPublished(quiz.isPublished);
          setQuestions(quiz.questions || []);
          
          if (quiz.deadline) {
            setHasDeadline(true);
            const date = new Date(quiz.deadline);
            setDeadline(date.toISOString().slice(0, 16));
          }
        } else {
          toast.error('Failed to load quiz details');
          router.push('/teacher/quizzes');
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        toast.error('An error occurred while loading the quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizDetails();
  }, [quizId, router]);

  const addQuestion = () => {
    const newId = `q-${Date.now()}`;
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
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: string, value: string | number) => {
    const updated = [...questions];
    (updated[index] as any)[field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, field: string, value: string | boolean) => {
    const updated = [...questions];
    if (field === 'isCorrect' && value === true) {
      updated[qIndex].options = updated[qIndex].options.map((opt, i) => ({
        ...opt,
        isCorrect: i === oIndex,
      }));
    } else {
      (updated[qIndex].options[oIndex] as any)[field] = value;
    }
    setQuestions(updated);
  };

  const addOption = (qIndex: number) => {
    const updated = [...questions];
    const newId = `opt-${Date.now()}`;
    updated[qIndex].options.push({ id: newId, text: '', isCorrect: false });
    setQuestions(updated);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    if (updated[qIndex].options.length > 2) {
      updated[qIndex].options = updated[qIndex].options.filter((_, i) => i !== oIndex);
      if (!updated[qIndex].options.some(o => o.isCorrect)) {
        updated[qIndex].options[0].isCorrect = true;
      }
      setQuestions(updated);
    }
  };

  const handleSaveQuiz = async (publish?: boolean) => {
    if (!quizTitle) {
      toast.error('Please enter a quiz title');
      return;
    }
    if (!selectedClass) {
      toast.error('Please select a class');
      return;
    }
    if (questions.some(q => !q.text || q.options.some(o => !o.text))) {
      toast.error('Please fill in all questions and options');
      return;
    }

    setSaving(true);
    const updatedQuiz: Partial<Quiz> & { id: string } = {
      id: quizId,
      title: quizTitle,
      description: quizDescription,
      classId: selectedClass,
      difficulty,
      timeLimit,
      isPublished: publish !== undefined ? publish : isPublished,
      deadline: hasDeadline && deadline ? new Date(deadline) : undefined,
      totalMarks: questions.reduce((sum, q) => sum + q.marks, 0),
      questions,
    };

    try {
      const res = await fetch(`/api/quizzes/${quizId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedQuiz),
      });

      if (res.ok) {
        // Update local status as well if needed, though most things come from API
        toast.success(publish ? 'Quiz published!' : 'Quiz updated successfully!');
        router.push('/teacher/quizzes');
      } else {
        toast.error('Failed to update quiz');
      }
    } catch (error) {
      console.error('Error updating quiz:', error);
      toast.error('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="font-black text-muted-foreground uppercase tracking-widest text-xs">Loading Quiz Data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32">
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
                Editor Mode
              </Badge>
              <span className="text-muted-foreground/40 font-black text-[10px] tracking-widest uppercase">ID: {quizId}</span>
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tight leading-tight">Edit Quiz</h1>
            <p className="text-muted-foreground font-bold mt-1">Change quiz settings and questions</p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Button 
            variant="ghost" 
            className="h-14 px-8 rounded-2xl font-black uppercase text-xs tracking-widest border border-border/50 bg-background/50"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button 
            className="h-14 px-10 rounded-2xl font-black uppercase text-xs tracking-widest bg-primary text-white hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/10 flex items-center gap-2"
            onClick={() => handleSaveQuiz()}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none glass-card shadow-2xl rounded-[3rem] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-50" />
            <CardHeader className="p-10 pb-6 border-b border-border/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black tracking-tight">Quiz Settings</CardTitle>
                  <CardDescription className="font-bold text-muted-foreground">Basic details for this quiz</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Quiz Title</Label>
                  <Input
                    placeholder="Quiz Title"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    className="h-14 rounded-2xl bg-secondary/30 border-2 border-border/50 focus:border-primary transition-all font-bold px-6"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Target Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="h-14 rounded-2xl bg-secondary/30 border-2 border-border/50 focus:border-primary transition-all font-bold px-6">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-2 border-border/50 glass-card">
                      {teacherClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id} className="font-bold rounded-xl m-1">{cls.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Quiz Description</Label>
                <Textarea
                  placeholder="Quiz Description"
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  className="min-h-[120px] rounded-[2rem] bg-secondary/30 border-2 border-border/50 focus:border-primary transition-all font-bold p-6"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Difficulty</Label>
                  <Select value={difficulty} onValueChange={(v: Difficulty) => setDifficulty(v)}>
                    <SelectTrigger className="h-14 rounded-2xl bg-secondary/30 border-2 border-border/50 focus:border-primary transition-all font-bold px-6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-2 border-border/50 glass-card">
                      <SelectItem value="very_easy" className="font-bold rounded-xl m-1">Very Easy</SelectItem>
                      <SelectItem value="easy" className="font-bold rounded-xl m-1">Easy</SelectItem>
                      <SelectItem value="medium" className="font-bold rounded-xl m-1">Medium</SelectItem>
                      <SelectItem value="hard" className="font-bold rounded-xl m-1">Hard</SelectItem>
                      <SelectItem value="very_hard" className="font-bold rounded-xl m-1">Very Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center ml-1">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Time Limit</Label>
                    <span className="font-black text-primary text-sm">{Math.floor(timeLimit / 60)} minutes</span>
                  </div>
                  <Slider
                    value={[timeLimit]}
                    onValueChange={([v]) => setTimeLimit(v)}
                    min={60}
                    max={3600}
                    step={60}
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
                      <p className="text-xs text-muted-foreground font-bold">Close quiz after this date</p>
                    </div>
                  </div>
                  <Switch checked={hasDeadline} onCheckedChange={setHasDeadline} />
                </div>
                {hasDeadline && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <Input
                      type="datetime-local"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="h-14 rounded-2xl bg-background border-2 border-border/50 focus:border-accent transition-all font-bold px-6 mt-4"
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
                  <h2 className="text-xl font-black tracking-tight uppercase">Quiz Questions</h2>
                  <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">{questions.length} Question(s)</p>
                </div>
              </div>
              <Button 
                onClick={addQuestion} 
                className="h-12 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-primary hover:scale-[1.05] active:scale-95 transition-all shadow-lg shadow-primary/20 gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </Button>
            </div>

            <AnimatePresence mode="popLayout">
              {questions.map((question, qIndex) => (
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
                        <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Question Text</Label>
                        <Input
                          placeholder="Enter question text..."
                          value={question.text}
                          onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                          className="h-14 rounded-2xl bg-secondary/30 border-2 border-border/50 focus:border-primary transition-all font-bold px-6"
                        />
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        {question.options.map((option, oIndex) => (
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
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Points</span>
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
              Add New Question
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-none glass-card shadow-xl rounded-[2.5rem] p-8">
            <CardTitle className="text-xl font-black mb-6 flex items-center gap-3">
              <Activity className="w-5 h-5 text-primary" />
              Publish Status
            </CardTitle>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                  <span className="font-black text-xs uppercase tracking-widest">Published</span>
                </div>
                <Switch checked={isPublished} onCheckedChange={setIsPublished} />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  <span>Total Points</span>
                  <span className="text-foreground">{questions.reduce((sum, q) => sum + q.marks, 0)}</span>
                </div>
                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  <span>Questions</span>
                  <span className="text-foreground">{questions.length}</span>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Button 
                  className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest bg-primary shadow-lg shadow-primary/20"
                  onClick={() => handleSaveQuiz()}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Quiz
                </Button>
                <Button 
                  variant="outline"
                  className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest border-2"
                  onClick={() => handleSaveQuiz(!isPublished)}
                  disabled={saving}
                >
                  {isPublished ? 'Unpublish Quiz' : 'Publish Quiz'}
                </Button>
              </div>
            </div>
          </Card>

          <Card className="border-none glass-card shadow-xl rounded-[2.5rem] p-8 bg-rose-500/5 border-rose-500/10">
            <CardTitle className="text-xl font-black mb-4 text-rose-900 flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-rose-600" />
              Danger Zone
            </CardTitle>
            <p className="text-xs font-bold text-rose-800/60 mb-6 leading-relaxed uppercase tracking-tighter">
              Permanently delete this quiz. This action cannot be undone.
            </p>
            <Button 
              variant="destructive"
              className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-600/20"
              onClick={() => {
                if (confirm('Are you sure you want to delete this quiz?')) {
                  // Logic for delete would go here, usually calling useAuth().deleteQuiz(quizId)
                  toast.error('Delete failed: Feature not yet implemented.');
                }
              }}
            >
              Delete Quiz
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Activity({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
