"use client";

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Plus,
  FileQuestion,
  Clock,
  Users,
  Calendar,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Brain,
  FileText,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function TeacherQuizzesPage() {
  const { getTeacherClasses, quizzes, attempts, deleteQuiz, updateQuiz } = useAuth();
  const teacherClasses = getTeacherClasses();
  const teacherQuizzes = quizzes.filter(q => teacherClasses.some(c => c.id === q.classId));

  const getClassById = (classId: string) => teacherClasses.find(c => c.id === classId);
  const getAttemptCount = (quizId: string) => attempts.filter(a => a.quizId === quizId).length;

  const getCreationMethodIcon = (method: string) => {
    switch (method) {
      case 'ai_topic':
        return <Brain className="w-4 h-4" />;
      case 'ai_pdf':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileQuestion className="w-4 h-4" />;
    }
  };

  const handleTogglePublish = (quiz: typeof teacherQuizzes[0]) => {
    updateQuiz({ ...quiz, isPublished: !quiz.isPublished });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quizzes</h1>
          <p className="text-slate-600 mt-1">Manage your quizzes</p>
        </div>
        <Link href="/teacher/quizzes/create">
          <Button className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
            <Plus className="w-4 h-4" />
            Create Quiz
          </Button>
        </Link>
      </div>

      {teacherQuizzes.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-16 text-center">
            <FileQuestion className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No Quizzes Yet</h2>
            <p className="text-slate-600 mb-4">Create your first quiz to get started</p>
            <Link href="/teacher/quizzes/create">
              <Button>Create Quiz</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {teacherQuizzes.map((quiz) => {
            const cls = getClassById(quiz.classId);
            const attemptCount = getAttemptCount(quiz.id);
            
            return (
              <Card key={quiz.id} className="border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      quiz.isPublished ? 'bg-emerald-100' : 'bg-slate-100'
                    }`}>
                      {getCreationMethodIcon(quiz.creationMethod)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-slate-900 truncate">{quiz.title}</h3>
                        <Badge variant={quiz.isPublished ? 'default' : 'secondary'}>
                          {quiz.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {quiz.difficulty.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-slate-500 mt-1">{cls?.name}</p>
                      
                      <div className="flex items-center gap-6 mt-3 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <FileQuestion className="w-4 h-4" />
                          {quiz.questions.length} questions
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {Math.floor(quiz.timeLimit / 60)}m
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {attemptCount} attempts
                        </span>
                        {quiz.deadline && (
                          <span className="flex items-center gap-1 text-amber-600">
                            <Calendar className="w-4 h-4" />
                            Due: {new Date(quiz.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTogglePublish(quiz)}>
                          {quiz.isPublished ? 'Unpublish' : 'Publish'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => deleteQuiz(quiz.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
