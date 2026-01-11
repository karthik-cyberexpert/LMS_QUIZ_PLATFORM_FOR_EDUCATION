"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  Plus,
  Users,
  FileQuestion,
  Copy,
  Check,
  BookOpen,
} from 'lucide-react';

export default function TeacherClassesPage() {
  const { user, getTeacherClasses, quizzes } = useAuth();
  const teacherClasses = getTeacherClasses();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);


  const copyInviteCode = (code: string) => {
    if (!navigator.clipboard) {
      // Fallback for non-secure contexts
      const textArea = document.createElement("textarea");
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedCode(code);
        toast.success('Invite code copied!');
        setTimeout(() => setCopiedCode(null), 2000);
      } catch (err) {
        toast.error('Failed to copy invite code');
      }
      document.body.removeChild(textArea);
      return;
    }

    navigator.clipboard.writeText(code)
      .then(() => {
        setCopiedCode(code);
        toast.success('Invite code copied!');
        setTimeout(() => setCopiedCode(null), 2000);
      })
      .catch(() => {
        toast.error('Failed to copy invite code');
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Classes</h1>
          <p className="text-slate-600 mt-1">Manage your classes</p>
        </div>
        <Button asChild className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-md">
          <Link href="/teacher/classes/create">
            <Plus className="w-4 h-4" />
            New Class
          </Link>
        </Button>
      </div>

      {teacherClasses.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-16 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No Classes Yet</h2>
            <p className="text-slate-600 mb-4">Create your first class to get started</p>
            <Button asChild>
              <Link href="/teacher/classes/create">Create Class</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teacherClasses.map((cls) => {
            const publishedQuizzesCount = cls.quizCount || 0;
            const studentCount = cls.studentCount || 0;
            
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
                        {studentCount} students
                      </div>
                      <div className="flex items-center gap-1">
                        <FileQuestion className="w-4 h-4" />
                        {publishedQuizzesCount} quizzes
                      </div>
                    </div>
                    
                    {/* Avatars omitted for now as we don't fetch full student lists for all classes at once */}
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
