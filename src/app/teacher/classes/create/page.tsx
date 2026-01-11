"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  BookOpen, 
  Sparkles,
  Layout,
  Info
} from 'lucide-react';
import Link from 'next/link';

export default function CreateClassPage() {
  const { addClass } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a class name");
      return;
    }

    setIsSubmitting(true);
    try {
      await addClass({
        name,
        description,
        inviteCode: '', // Generated on the backend
        teacherId: '', // Added by the context from current user
      });
      router.push('/teacher/classes');
    } catch (error) {
      toast.error("Failed to create class. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/teacher/classes">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create New Class</h1>
          <p className="text-slate-500">Set up a new learning environment for your students</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-0 shadow-2xl shadow-slate-200/60 overflow-hidden bg-white/80 backdrop-blur-xl">
              <div className="h-2 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="w-5 h-5 text-violet-600" />
                  Class Information
                </CardTitle>
                <CardDescription>
                  Enter the core details for your new classroom
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="className" className="text-slate-700 font-medium">Class Name</Label>
                    <Input
                      id="className"
                      placeholder="e.g. Advanced Web Development"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 bg-slate-50/50 border-slate-200 focus:ring-2 focus:ring-violet-500/20 transition-all"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-slate-700 font-medium">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the goals and topics covered in this class..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[150px] bg-slate-50/50 border-slate-200 focus:ring-2 focus:ring-violet-500/20 transition-all"
                    />
                  </div>

                  <div className="pt-4 flex items-center gap-4">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="flex-1 h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold transition-all shadow-lg shadow-violet-200"
                    >
                      {isSubmitting ? "Creating..." : "Create Class"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="h-12 px-8"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="border-0 shadow-lg shadow-slate-100 bg-violet-600 text-white overflow-hidden relative">
              <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-white/10 rotate-12" />
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-violet-50">
                <div className="flex gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold">1</span>
                  </div>
                  <p className="text-sm">Keep names concise so students can identify them easily on their dashboards.</p>
                </div>
                <div className="flex gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold">2</span>
                  </div>
                  <p className="text-sm">Add a clear description to help students understand what to expect.</p>
                </div>
                <div className="flex gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold">3</span>
                  </div>
                  <p className="text-sm">Once created, you'll get a unique invite code to share with your class.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg shadow-slate-100 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-slate-900 border-b pb-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  What's Next?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Invite Students
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    Create Assessments
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    Monitor Analytics
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
