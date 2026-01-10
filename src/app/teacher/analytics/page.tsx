"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { generateTeacherAnalytics, MOCK_STUDENTS } from '@/lib/mock-data';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function TeacherAnalyticsPage() {
  const { getTeacherClasses, quizzes, attempts } = useAuth();
  const teacherClasses = getTeacherClasses();
  const [selectedClass, setSelectedClass] = useState(teacherClasses[0]?.id || '');
  const [selectedQuiz, setSelectedQuiz] = useState('');

  const classQuizzes = quizzes.filter(q => q.classId === selectedClass);
  const analytics = selectedClass ? generateTeacherAnalytics(selectedClass) : null;

  const classAttempts = attempts.filter(a => classQuizzes.some(q => q.id === a.quizId));
  const flaggedAttempts = classAttempts.filter(a => a.isFlagged);
  const avgAccuracy = classAttempts.length > 0
    ? Math.round(classAttempts.reduce((sum, a) => sum + a.accuracy, 0) / classAttempts.length)
    : 0;
  const avgTime = classAttempts.length > 0
    ? Math.round(classAttempts.reduce((sum, a) => sum + a.timeTaken, 0) / classAttempts.length / 60)
    : 0;

  const difficultyData = analytics?.difficultyVsPerformance.map(d => ({
    name: d.difficulty.replace('_', ' ').charAt(0).toUpperCase() + d.difficulty.replace('_', ' ').slice(1),
    score: d.averageScore,
    time: Math.round(d.averageTime / 60),
  })) || [];

  const questionData = analytics?.questionStats.map((q, i) => ({
    name: `Q${i + 1}`,
    failureRate: Math.round(q.failureRate * 100),
    avgTime: q.averageTime,
  })) || [];

  const performanceDistribution = [
    { name: 'Excellent (80-100%)', value: classAttempts.filter(a => a.accuracy >= 80).length, color: '#10b981' },
    { name: 'Good (60-79%)', value: classAttempts.filter(a => a.accuracy >= 60 && a.accuracy < 80).length, color: '#f59e0b' },
    { name: 'Needs Improvement (<60%)', value: classAttempts.filter(a => a.accuracy < 60).length, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-600 mt-1">Insights into student performance</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {teacherClasses.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg shadow-slate-200/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Attempts</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-violet-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{classAttempts.length}</div>
            <p className="text-sm text-slate-500 mt-1">across {classQuizzes.length} quizzes</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-slate-200/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Average Score</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{avgAccuracy}%</div>
            <p className="text-sm text-slate-500 mt-1">class average</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-slate-200/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Avg Completion Time</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{avgTime}m</div>
            <p className="text-sm text-slate-500 mt-1">average time</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-slate-200/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Flagged Attempts</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{flaggedAttempts.length}</div>
            <p className="text-sm text-slate-500 mt-1">requires review</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="integrity">Integrity</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg shadow-slate-200/50">
              <CardHeader>
                <CardTitle>Difficulty vs Performance</CardTitle>
                <CardDescription>Average scores by difficulty level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={difficultyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg shadow-slate-200/50">
              <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
                <CardDescription>Breakdown of student performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={performanceDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {performanceDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {performanceDistribution.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-sm text-slate-600">{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <Card className="border-0 shadow-lg shadow-slate-200/50">
            <CardHeader>
              <CardTitle>Question Failure Rates</CardTitle>
              <CardDescription>Identify challenging questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={questionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="failureRate" fill="#ef4444" radius={[4, 4, 0, 0]} name="Failure Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-slate-200/50">
            <CardHeader>
              <CardTitle>Time per Question</CardTitle>
              <CardDescription>Average time students spend on each question</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {questionData.map((q, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-8 text-sm font-medium text-slate-600">{q.name}</span>
                    <div className="flex-1">
                      <Progress value={(q.avgTime / 120) * 100} className="h-3" />
                    </div>
                    <span className="w-16 text-sm text-slate-600 text-right">{q.avgTime}s</span>
                    {q.failureRate > 30 && (
                      <Badge variant="destructive" className="text-xs">High Fail</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card className="border-0 shadow-lg shadow-slate-200/50">
            <CardHeader>
              <CardTitle>Student Performance</CardTitle>
              <CardDescription>Individual student metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.studentPerformance.map((student) => {
                  const studentData = MOCK_STUDENTS.find(s => s.id === student.studentId);
                  return (
                    <div key={student.studentId} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{studentData?.name || 'Unknown'}</p>
                        <p className="text-sm text-slate-500">{student.quizzesCompleted} quizzes completed</p>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${
                          student.averageScore >= 80 ? 'text-emerald-600' :
                          student.averageScore >= 60 ? 'text-amber-600' : 'text-rose-600'
                        }`}>
                          {student.averageScore}%
                        </div>
                        <p className="text-xs text-slate-500">Avg Score</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-violet-600">{student.totalXP}</div>
                        <p className="text-xs text-slate-500">Total XP</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrity" className="space-y-6">
          <Card className="border-0 shadow-lg shadow-slate-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Flagged Attempts
              </CardTitle>
              <CardDescription>Attempts that require review</CardDescription>
            </CardHeader>
            <CardContent>
              {flaggedAttempts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <p className="text-slate-600">No flagged attempts</p>
                  <p className="text-sm text-slate-500">All quiz attempts look legitimate</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {flaggedAttempts.map((attempt) => {
                    const quiz = quizzes.find(q => q.id === attempt.quizId);
                    const student = MOCK_STUDENTS.find(s => s.id === attempt.studentId);
                    return (
                      <div key={attempt.id} className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-900">{student?.name}</p>
                            <p className="text-sm text-slate-600">{quiz?.title}</p>
                            <p className="text-sm text-amber-700 mt-2">{attempt.flagReason}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                              {attempt.warnings.length} warnings
                            </Badge>
                            <p className="text-sm text-slate-500 mt-2">{attempt.accuracy}% score</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
