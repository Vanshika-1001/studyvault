import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, Flame, Layers, Award, Star } from 'lucide-react';
import { analyticsAPI, subjectAPI } from '../services/api';
import { DifficultyBadge, ImportantBadge, FrequencyBadge, MarksBadge } from '../components/Badge';
import { CardSkeleton } from '../components/SkeletonLoader';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

const AnalyticsPage = () => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [subjectsList, setSubjectsList] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    topicFrequency: [],
    questionsByYear: [],
    unitDistribution: [],
    difficultyDistribution: [],
    topRepeated: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch subjects list for filter
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await subjectAPI.getSubjects();
        if (res.data?.data) {
          setSubjectsList(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const params = {
          subjectId: selectedSubject || undefined,
          semester: selectedSemester || undefined,
        };
        const res = await analyticsAPI.getPYQAnalytics(params);
        if (res.data?.data) {
          setAnalyticsData(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [selectedSubject, selectedSemester]);

  return (
    <div className="space-y-8">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            PYQ Trend Analytics & Insights
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time data visualization of question frequency by topic, exam years, units, and difficulty.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Semester Filter */}
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Sem {s}
              </option>
            ))}
          </select>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Subjects</option>
            {subjectsList.map((s) => (
              <option key={s._id} value={s._id}>
                {s.code} — {s.name.split(' ')[0]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <>
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 1. Topic Frequency Bar Chart */}
            <div className="academic-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>Question Frequency by Topic</span>
                </h3>
                <span className="text-[11px] text-slate-400">Top 10 Exam Topics</span>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.topicFrequency || []}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis
                      dataKey="topic"
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="frequency"
                      fill="#6366f1"
                      radius={[6, 6, 0, 0]}
                      name="Times Asked"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Questions by Year Line/Bar Chart */}
            <div className="academic-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-500" />
                  <span>Exam Questions by Year</span>
                </h3>
                <span className="text-[11px] text-slate-400">2022–2026 Trend</span>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.questionsByYear || []}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#8b5cf6"
                      radius={[6, 6, 0, 0]}
                      name="Total Questions"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3. Unit-wise Distribution Pie Chart */}
            <div className="academic-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  <span>Unit-wise Question Weightage</span>
                </h3>
                <span className="text-[11px] text-slate-400">Curriculum Units 1–5</span>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.unitDistribution || []}
                      dataKey="count"
                      nameKey="unit"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {(analyticsData.unitDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4. Difficulty Distribution Pie Chart */}
            <div className="academic-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-500" />
                  <span>Difficulty Level Distribution</span>
                </h3>
                <span className="text-[11px] text-slate-400">Easy / Medium / Hard</span>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.difficultyDistribution || []}
                      dataKey="count"
                      nameKey="difficulty"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {(analyticsData.difficultyDistribution || []).map((entry, index) => {
                        let fill = '#10b981';
                        if (entry.difficulty === 'Medium') fill = '#f59e0b';
                        if (entry.difficulty === 'Hard') fill = '#f43f5e';
                        return <Cell key={`cell-${index}`} fill={fill} />;
                      })}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 5. Top Repeated Questions Leaderboard Table */}
          <div className="academic-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span>Top Repeated University Questions</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Calculated directly from stored university exam occurrences (not hardcoded).
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Frequency</th>
                    <th className="pb-3 font-semibold">Question</th>
                    <th className="pb-3 font-semibold">Subject & Unit</th>
                    <th className="pb-3 font-semibold">Difficulty</th>
                    <th className="pb-3 font-semibold">Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {analyticsData.topRepeated?.map((q) => (
                    <tr key={q._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 pr-3">
                        <FrequencyBadge frequency={q.frequency} />
                      </td>
                      <td className="py-3.5 max-w-md font-medium text-slate-900 dark:text-white">
                        {q.question}
                      </td>
                      <td className="py-3.5 text-slate-500 dark:text-slate-400">
                        {q.subject?.name} • Unit {q.unit}
                      </td>
                      <td className="py-3.5">
                        <DifficultyBadge difficulty={q.difficulty} />
                      </td>
                      <td className="py-3.5">
                        <MarksBadge marks={q.marks} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
