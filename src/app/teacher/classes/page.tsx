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
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { useResponsivePageSize } from '@/lib/calculate-page-size';

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

  // Responsive page size for grid-3 layout
  const defaultPageSize = useResponsivePageSize('grid-3');

  // Pagination
  const {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination(teacherClasses, {
    defaultItemsPerPage: defaultPageSize,
    persistInUrl: true,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Classes</h1>
          <p className="text-muted-foreground text-lg mt-1 font-medium">Manage your classes</p>
        </div>
        <Button asChild className="h-12 px-6 rounded-2xl bg-primary font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform group">
          <Link href="/teacher/classes/create">
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
            New Class
          </Link>
        </Button>
      </div>

      {teacherClasses.length === 0 ? (
        <Card className="border-0 shadow-lg glass-card">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-2">No Classes Yet</h2>
            <p className="text-muted-foreground mb-6 text-base">Create your first class to get started</p>
            <Button asChild className="rounded-2xl px-8 h-12 font-bold">
              <Link href="/teacher/classes/create">Create Class</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedItems.map((cls, index) => {
              const publishedQuizzesCount = cls.quizCount || 0;
              const studentCount = cls.studentCount || 0;
              
              // Rotate through gradient colors
              const gradients = [
                'from-violet-500/10 to-purple-500/10',
                'from-blue-500/10 to-cyan-500/10',
                'from-emerald-500/10 to-teal-500/10',
                'from-amber-500/10 to-orange-500/10',
                'from-rose-500/10 to-pink-500/10',
              ];
              const gradient = gradients[index % gradients.length];
              
              const iconColors = [
                'text-violet-600',
                'text-blue-600',
                'text-emerald-600',
                'text-amber-600',
                'text-rose-600',
              ];
              const iconColor = iconColors[index % iconColors.length];
              
              return (
                <Link key={cls.id} href={`/teacher/classes/${cls.id}`}>
                  <Card className="border-none glass-card relative overflow-hidden group h-full hover:shadow-2xl transition-all cursor-pointer">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`} />
                    
                    <CardHeader className="relative">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl font-black text-foreground group-hover:text-primary transition-colors leading-tight">{cls.name}</CardTitle>
                          <CardDescription className="mt-2 line-clamp-2 text-base">{cls.description}</CardDescription>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 shrink-0 rounded-xl border-2 font-bold hover:bg-secondary/50"
                          onClick={(e) => {
                            e.preventDefault();
                            copyInviteCode(cls.inviteCode);
                          }}
                        >
                          {copiedCode === cls.inviteCode ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          {cls.inviteCode}
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="relative">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center ${iconColor}`}>
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-2xl font-black text-foreground">{studentCount}</div>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Students</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className={`w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center ${iconColor}`}>
                            <FileQuestion className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-2xl font-black text-foreground">{publishedQuizzesCount}</div>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Quizzes</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            pageSizeOptions={[3, 6, 9, 12, 15]}
          />
        </>
      )}
    </div>
  );
}
