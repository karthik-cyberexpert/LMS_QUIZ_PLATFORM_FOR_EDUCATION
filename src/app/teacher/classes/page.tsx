"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Link from 'next/link';
import { MOCK_STUDENTS } from '@/lib/mock-data';
import {
  Plus,
  Users,
  FileQuestion,
  Copy,
  Check,
  BookOpen,
} from 'lucide-react';

export default function TeacherClassesPage() {
  const { user, getTeacherClasses, quizzes, addClass } = useAuth();
  const teacherClasses = getTeacherClasses();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDescription, setNewClassDescription] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCreateClass = () => {
    if (!newClassName) {
      toast.error('Please enter a class name');
      return;
    }
    
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    addClass({
      name: newClassName,
      description: newClassDescription,
      inviteCode,
      teacherId: user?.id || '',
    });
    
    toast.success('Class created!', {
      description: `Invite code: ${inviteCode}`,
    });
    
    setNewClassName('');
    setNewClassDescription('');
    setCreateDialogOpen(false);
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Invite code copied!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Classes</h1>
          <p className="text-slate-600 mt-1">Manage your classes</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
              <Plus className="w-4 h-4" />
              New Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Class</DialogTitle>
              <DialogDescription>
                Create a class and share the invite code with your students.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Class Name</Label>
                <Input
                  placeholder="e.g., Introduction to Programming"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Brief description of the class..."
                  value={newClassDescription}
                  onChange={(e) => setNewClassDescription(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleCreateClass}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              >
                Create Class
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {teacherClasses.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-16 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No Classes Yet</h2>
            <p className="text-slate-600 mb-4">Create your first class to get started</p>
            <Button onClick={() => setCreateDialogOpen(true)}>Create Class</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teacherClasses.map((cls) => {
            const classQuizzes = quizzes.filter(q => q.classId === cls.id);
            const publishedQuizzes = classQuizzes.filter(q => q.isPublished);
            const students = MOCK_STUDENTS.filter(s => cls.studentIds.includes(s.id));
            
            return (
              <Link key={cls.id} href={`/teacher/classes/${cls.id}`}>
                <Card className="border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{cls.name}</CardTitle>
                        <CardDescription className="mt-1 line-clamp-2">{cls.description}</CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 shrink-0"
                        onClick={(e) => {
                          e.preventDefault();
                          copyInviteCode(cls.inviteCode);
                        }}
                      >
                        {copiedCode === cls.inviteCode ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        {cls.inviteCode}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {students.length} students
                      </div>
                      <div className="flex items-center gap-1">
                        <FileQuestion className="w-4 h-4" />
                        {publishedQuizzes.length} quizzes
                      </div>
                    </div>
                    
                    {students.length > 0 && (
                      <div className="flex -space-x-2 mt-4">
                        {students.slice(0, 5).map((student) => (
                          <div
                            key={student.id}
                            className="w-8 h-8 rounded-full bg-violet-100 border-2 border-white flex items-center justify-center text-xs font-medium text-violet-700"
                            title={student.name}
                          >
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        ))}
                        {students.length > 5 && (
                          <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-600">
                            +{students.length - 5}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
