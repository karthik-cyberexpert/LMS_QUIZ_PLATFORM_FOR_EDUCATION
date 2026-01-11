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
import {
  Plus,
  BookOpen,
  FileQuestion,
  Clock,
  Play,
  Calendar,
  Users,
  Target,
} from 'lucide-react';

export default function StudentClassesPage() {
  const { user, getStudentClasses, quizzes, attempts, joinClass } = useAuth();
  const studentClasses = getStudentClasses();
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const myAttempts = attempts.filter(a => a.studentId === user?.id);
  const completedQuizIds = new Set(myAttempts.map(a => a.quizId));

  const handleJoinClass = async () => {
    if (await joinClass(inviteCode.toUpperCase())) {
      toast.success('Class joined successfully!');
      setInviteCode('');
      setJoinDialogOpen(false);
    } else {
      toast.error('Failed to join class', {
        description: 'Invalid code or already enrolled.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Classes</h1>
          <p className="text-slate-600 mt-1">View your enrolled classes</p>
        </div>
        <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
              <Plus className="w-4 h-4" />
              Join Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join a Class</DialogTitle>
              <DialogDescription>
                Enter the invite code from your teacher.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Enter invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="text-center text-lg tracking-wider font-mono"
              />
              <Button 
                onClick={handleJoinClass}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600"
                disabled={!inviteCode}
              >
                Join Class
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {studentClasses.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-16 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No Classes Yet</h2>
            <p className="text-slate-600 mb-4">Join a class with an invite code from your teacher</p>
            <Button onClick={() => setJoinDialogOpen(true)}>Join Class</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {studentClasses.map((cls) => {
            const classQuizzes = quizzes.filter(q => q.classId === cls.id && q.isPublished);
            const completedInClass = classQuizzes.filter(q => completedQuizIds.has(q.id)).length;
            const progress = classQuizzes.length > 0 
              ? Math.round((completedInClass / classQuizzes.length) * 100) 
              : 0;

            return (
              <Card key={cls.id} className="border-0 shadow-lg shadow-slate-200/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{cls.name}</CardTitle>
                      <CardDescription>{cls.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-violet-600">{progress}%</div>
                      <p className="text-xs text-slate-500">Complete</p>
                    </div>
                  </div>
                  <Progress value={progress} className="h-2 mt-4" />
                </CardHeader>
                <CardContent>
                  <h4 className="font-medium text-slate-900 mb-4">Available Quizzes</h4>
                  {classQuizzes.length === 0 ? (
                    <p className="text-slate-500 text-sm">No quizzes available yet</p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {classQuizzes.map((quiz) => {
                        const quizAttempts = myAttempts.filter(a => a.quizId === quiz.id);
                        const bestAttempt = quizAttempts.sort((a, b) => b.accuracy - a.accuracy)[0];
                        const canRetry = quizAttempts.length < quiz.maxAttempts;
                        const hasAttempted = quizAttempts.length > 0;

                        return (
                          <div 
                            key={quiz.id} 
                            className={`p-4 rounded-xl border ${
                              hasAttempted ? 'bg-slate-50 border-slate-200' : 'border-violet-200 bg-violet-50/50'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-slate-900">{quiz.title}</h5>
                              <Badge variant="outline" className="text-xs capitalize">
                                {quiz.difficulty.replace('_', ' ')}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                              <span className="flex items-center gap-1">
                                <FileQuestion className="w-3.5 h-3.5" />
                                {quiz.questionCount ?? 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {Math.floor(quiz.timeLimit / 60)}m
                              </span>
                              {quiz.deadline && (
                                <span className="flex items-center gap-1 text-amber-600">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {new Date(quiz.deadline).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            {hasAttempted && bestAttempt && (
                              <div className="flex items-center gap-2 mb-3 text-sm">
                                <Target className="w-4 h-4 text-emerald-600" />
                                <span className="text-slate-600">
                                  Best: <span className="font-medium text-slate-900">{bestAttempt.accuracy}%</span>
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {quizAttempts.length}/{quiz.maxAttempts} attempts
                                </Badge>
                              </div>
                            )}

                            <Link href={`/student/quiz/${quiz.id}`}>
                              <Button 
                                size="sm" 
                                className="w-full gap-2"
                                variant={hasAttempted ? "outline" : "default"}
                                disabled={!canRetry}
                              >
                                <Play className="w-3.5 h-3.5" />
                                {hasAttempted ? (canRetry ? 'Retry' : 'Max Attempts') : 'Start Quiz'}
                              </Button>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
