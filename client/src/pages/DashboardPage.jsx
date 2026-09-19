import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  HelpCircle,
  PlayCircle,
  FileText,
  Star,
  Bookmark,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subjectAPI, practiceAPI, bookmarkAPI, pyqAPI } from '../services/api';
import { CardSkeleton, StatCardSkeleton } from '../components/SkeletonLoader';
import { DifficultyBadge, ImportantBadge } from '../components/Badge';

const DashboardPage = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [practiceStats, setPracticeStats] = useState({
    totalPracticed: 0,
    accuracy: 0,
    recentSessions: [],
  });
  const [bookmarkStats, setBookmarkStats] = useState({
    total: 0,
    recentQuestions: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [subjRes, practiceRes, bookmarkRes] = await Promise.allSettled([
          subjectAPI.getSubjects({ semester: user?.semester || 5 }),
          practiceAPI.getHistory(),
          bookmarkAPI.getBookmarks(),
        ]);

        if (subjRes.status === 'fulfilled' && subjRes.value.data?.data) {
          setSubjects(subjRes.value.data.data);
        }

        if (practiceRes.status === 'fulfilled' && practiceRes.value.data?.data) {
          const { stats, sessions } = practiceRes.value.data.data;
          setPracticeStats({
            totalPracticed: stats?.totalQuestionsAnswered || 0,
            accuracy: stats?.overallAccuracy || 0,
            recentSessions: sessions?.slice(0, 3) || [],
          });
        }

        if (bookmarkRes.status === 'fulfilled' && bookmarkRes.value.data?.data) {
          const { total, questions } = bookmarkRes.value.data.data;
          setBookmarkStats({
            total: total || 0,
            recentQuestions: questions?.slice(0, 3) || [],
          });
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const quickActions = [
    {
      title: 'Browse Subjects',
      desc: 'Explore syllabus & units',
      icon: BookOpen,
      link: '/semesters',
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Practice PYQs',
      desc: 'Simulate university exams',
      icon: PlayCircle,
      link: '/practice',
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'View Study Notes',
      desc: 'Unit summaries & guides',
      icon: FileText,
      link: '/resources',
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Important Questions',
      desc: 'Repeated university topics',
      link: '/pyqs?important=true',
      icon: Star,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md mb-3">
            Academic Status: Active
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Student'} 👋
          </h2>
          <p className="mt-2 text-indigo-100 text-sm sm:text-base leading-relaxed">
            Ready to prepare for Semester {user?.semester || 5} exams? Review your syllabus, practice authentic questions, and track your revision.
          </p>
        </div>

        {/* Academic Stat Badges inside Welcome card */}
        <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
          <div>
            <div className="text-xs text-indigo-200">Current Semester</div>
            <div className="text-lg font-bold">Semester {user?.semester || 5}</div>
          </div>
          <div>
            <div className="text-xs text-indigo-200">Branch</div>
            <div className="text-lg font-bold">{user?.branch || 'CSE'}</div>
          </div>
          <div>
            <div className="text-xs text-indigo-200">Practiced PYQs</div>
            <div className="text-lg font-bold">{practiceStats.totalPracticed} Solved</div>
          </div>
          <div>
            <div className="text-xs text-indigo-200">Practice Accuracy</div>
            <div className="text-lg font-bold">{practiceStats.accuracy}%</div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <span>Quick Actions</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={idx}
                to={action.link}
                className="academic-card-interactive p-5 flex items-center gap-4 group"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${action.color}`}>
                  <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{action.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* My Subjects Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              My Subjects (Semester {user?.semester || 5})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Assigned subjects for your current branch and semester
            </p>
          </div>
          <Link
            to="/semesters"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>All Semesters</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Link
                key={subject._id}
                to={`/subjects/${subject._id}`}
                className="academic-card-interactive p-6 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                      {subject.code}
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {subject.credits} Credits
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {subject.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {subject.description || 'Comprehensive curriculum study and exam question repository.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-3">
                    <span>{subject.units?.length || 5} Units</span>
                    <span>•</span>
                    <span className="text-brand-600 dark:text-brand-400 font-semibold">
                      {subject.pyqCount || 0} PYQs
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="academic-card p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
            No subjects found for Semester {user?.semester || 5}. Visit the{' '}
            <Link to="/semesters" className="text-brand-600 underline">
              Semesters page
            </Link>{' '}
            to explore all available subjects.
          </div>
        )}
      </div>

      {/* Two Column Grid: Recent Practice & Bookmarked Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Practice Sessions */}
        <div className="academic-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-500" />
              <span>Recent Practice Sessions</span>
            </h3>
            <Link
              to="/practice"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Start New
            </Link>
          </div>

          {practiceStats.recentSessions.length > 0 ? (
            <div className="space-y-3">
              {practiceStats.recentSessions.map((session) => (
                <div
                  key={session._id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {session.subject?.name || 'Subject Practice'}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                      {session.unit ? `Unit ${session.unit} • ` : 'All Units • '}
                      {session.difficulty} • {new Date(session.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">
                      {session.score}/{session.totalQuestions} ({session.accuracy}%)
                    </div>
                    <div className="text-slate-400 text-[10px]">
                      {Math.round(session.timeTaken / 60)}m {session.timeTaken % 60}s
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              No practice sessions recorded yet. Start practicing to test your knowledge!
            </div>
          )}
        </div>

        {/* Bookmarked Questions Preview */}
        <div className="academic-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-500" />
              <span>Bookmarked Questions ({bookmarkStats.total})</span>
            </h3>
            <Link
              to="/bookmarks"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              View All
            </Link>
          </div>

          {bookmarkStats.recentQuestions.length > 0 ? (
            <div className="space-y-3">
              {bookmarkStats.recentQuestions.map((q) => (
                <div
                  key={q._id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-brand-600 dark:text-brand-400">
                      {q.subject?.name} • Unit {q.unit}
                    </span>
                    <DifficultyBadge difficulty={q.difficulty} />
                  </div>
                  <p className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                    {q.question}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              No questions bookmarked yet. Click the bookmark icon on any PYQ to save it for revision.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
