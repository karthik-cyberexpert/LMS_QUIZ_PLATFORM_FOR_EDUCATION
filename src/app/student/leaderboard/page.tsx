"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateLeaderboard } from '@/lib/mock-data';
import { User } from '@/lib/types';
import { useEffect } from 'react';
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Clock,
  Target,
  Sparkles,
  Users,
} from 'lucide-react';

export default function LeaderboardPage() {
  const { user, getStudentClasses, quizzes, attempts, getClassStudents } = useAuth();
  const studentClasses = getStudentClasses();
  const [selectedClass, setSelectedClass] = useState(studentClasses[0]?.id || '');
  const [classStudents, setClassStudents] = useState<User[]>([]);

  useEffect(() => {
    if (selectedClass) {
      getClassStudents(selectedClass).then(setClassStudents);
    }
  }, [selectedClass, getClassStudents]);

  const leaderboard = selectedClass 
    ? calculateLeaderboard(selectedClass, classStudents, attempts, quizzes)
    : [];

  const currentUserRank = leaderboard.find(e => e.studentId === user?.id);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-amber-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-slate-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-700" />;
      default:
        return <span className="text-lg font-bold text-slate-400">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200';
      case 2:
        return 'bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200';
      default:
        return 'bg-white border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Leaderboard</h1>
          <p className="text-slate-600 mt-1">See how you rank among your classmates</p>
        </div>
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Select a class" />
          </SelectTrigger>
          <SelectContent>
            {studentClasses.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {currentUserRank && (
        <Card className="border-0 shadow-lg shadow-violet-200/50 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-violet-500/30">
                  #{currentUserRank.rank}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Your Current Rank</p>
                  <p className="text-sm text-slate-600">
                    {currentUserRank.totalXP.toLocaleString()} points • {Math.round(currentUserRank.accuracy)}% accuracy
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-violet-600">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">{currentUserRank.quizzesCompleted} quizzes</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {studentClasses.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-16 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No Classes Joined</h2>
            <p className="text-slate-600">Join a class to see the leaderboard</p>
          </CardContent>
        </Card>
      ) : leaderboard.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-16 text-center">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No Rankings Yet</h2>
            <p className="text-slate-600">Complete quizzes to appear on the leaderboard</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-lg shadow-slate-200/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Class Rankings
                </CardTitle>
                <CardDescription>Based on total points from class quizzes</CardDescription>
              </div>
              <Badge variant="secondary">{leaderboard.length} students</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.studentId}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${getRankBg(entry.rank)} ${
                    entry.studentId === user?.id ? 'ring-2 ring-violet-500' : ''
                  } transition-all hover:shadow-md`}
                >
                  <div className="w-10 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>

                  <Avatar className="w-12 h-12">
                    <AvatarImage src={entry.avatarUrl} />
                    <AvatarFallback className="bg-violet-100 text-violet-700">
                      {entry.studentName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 truncate">
                        {entry.studentName}
                        {entry.studentId === user?.id && (
                          <span className="ml-2 text-xs text-violet-600">(You)</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Target className="w-3.5 h-3.5" />
                        {Math.round(entry.accuracy)}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {Math.round(entry.averageTime / 60)}m avg
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 text-lg font-bold text-amber-600">
                      <Sparkles className="w-4 h-4" />
                      {entry.totalXP.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-500">{entry.quizzesCompleted} quizzes</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-xl">
              <h3 className="font-semibold text-slate-900 mb-2">Ranking Rules</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>1. Primary: Total points from class quizzes</li>
                <li>2. Tie-breaker: Higher accuracy percentage</li>
                <li>3. Tie-breaker: Faster average completion time</li>
                <li>4. Tie-breaker: Earlier first completion</li>
              </ul>
              <p className="text-xs text-slate-500 mt-3">
                Note: Practice mode points are not counted in class rankings.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
