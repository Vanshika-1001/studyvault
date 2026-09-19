import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  HelpCircle,
  BarChart3,
  Star,
  Info,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Bookmark,
  CheckCircle2,
  Award,
  Layers,
  Search,
} from 'lucide-react';
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
  Legend,
} from 'recharts';
import { subjectAPI, bookmarkAPI, analyticsAPI } from '../services/api';
import { CardSkeleton } from '../components/SkeletonLoader';
import { DifficultyBadge, ImportantBadge, FrequencyBadge, MarksBadge } from '../components/Badge';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

const SubjectDetailPage = () => {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  // PYQ inline filter state
  const [pyqSearch, setPyqSearch] = useState('');
  const [pyqUnitFilter, setPyqUnitFilter] = useState('All');
  const [expandedSolutions, setExpandedSolutions] = useState({});
  const [userBookmarks, setUserBookmarks] = useState(new Set());

  // Analytics data for subject
  const [analyticsData, setAnalyticsData] = useState({
    topicFrequency: [],
    questionsByYear: [],
    unitDistribution: [],
    difficultyDistribution: [],
  });

  const { user } = useAuth();
  const { success, error } = useToast();

  useEffect(() => {
    const fetchSubjectData = async () => {
      setIsLoading(true);
      try {
        const [subjRes, analyticsRes, bookmarkRes] = await Promise.allSettled([
          subjectAPI.getSubjectById(id),
          analyticsAPI.getPYQAnalytics({ subjectId: id }),
          bookmarkAPI.getBookmarks(),
        ]);

        if (subjRes.status === 'fulfilled' && subjRes.value.data?.data) {
          setSubject(subjRes.value.data.data);
        }

        if (analyticsRes.status === 'fulfilled' && analyticsRes.value.data?.data) {
          setAnalyticsData(analyticsRes.value.data.data);
        }

        if (bookmarkRes.status === 'fulfilled' && bookmarkRes.value.data?.data) {
          const bookmarkedIds = new Set(
            bookmarkRes.value.data.data.questions.map((q) => q._id)
          );
          setUserBookmarks(bookmarkedIds);
        }
      } catch (err) {
        console.error('Error fetching subject details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjectData();
  }, [id]);

  const toggleSolution = (pyqId) => {
    setExpandedSolutions((prev) => ({
      ...prev,
      [pyqId]: !prev[pyqId],
    }));
  };

  const handleBookmarkToggle = async (pyqId) => {
    try {
      const res = await bookmarkAPI.toggle({ itemType: 'PYQ', itemId: pyqId });
      if (res.data?.success) {
        setUserBookmarks((prev) => {
          const updated = new Set(prev);
          if (res.data.isBookmarked) {
            updated.add(pyqId);
            success('Question added to bookmarks');
          } else {
            updated.delete(pyqId);
            success('Question removed from bookmarks');
          }
          return updated;
        });
      }
    } catch (err) {
      error('Failed to update bookmark');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-36 bg-white dark:bg-slate-900 rounded-3xl animate-pulse"></div>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!subject) {
    return (
      <EmptyState
        title="Subject Not Found"
        description="The requested subject could not be located. It may have been modified or removed."
      />
    );
  }

  // Filter PYQs for the PYQ tab
  const filteredPYQs = (subject.pyqs || []).filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(pyqSearch.toLowerCase()) ||
      q.topic.toLowerCase().includes(pyqSearch.toLowerCase());
    const matchesUnit =
      pyqUnitFilter === 'All' || q.unit === Number(pyqUnitFilter);
    return matchesSearch && matchesUnit;
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'syllabus', label: 'Syllabus (5 Units)', icon: BookOpen },
    { id: 'notes', label: `Notes & Resources (${subject.resources?.length || 0})`, icon: FileText },
    { id: 'pyqs', label: `PYQs (${subject.pyqs?.length || 0})`, icon: HelpCircle },
    { id: 'important', label: 'Important Topics', icon: Star },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="space-y-8">
      {/* Subject Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-lg text-xs font-extrabold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                {subject.code}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Semester {subject.semester} • {subject.branch}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md">
                <Award className="w-3.5 h-3.5" />
                {subject.credits} Credits
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {subject.name}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              {subject.description || 'Comprehensive curriculum study, syllabus, unit notes, and PYQs.'}
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`/practice?subject=${subject._id}`}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              Practice Questions
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        <nav className="flex space-x-2 sm:space-x-4 min-w-max pb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* TAB CONTENT: 1. Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="academic-card p-6 md:col-span-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
                Subject Course Outline
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                {subject.description}
              </p>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Unit Coverage Summary
              </h4>
              <div className="space-y-2">
                {subject.units?.map((u) => (
                  <div
                    key={u.unitNumber}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Unit {u.unitNumber}: {u.title}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {u.topics?.length || 0} Core Topics
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="academic-card p-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                  Academic Metrics
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Subject Code</span>
                    <span className="font-bold text-slate-900 dark:text-white">{subject.code}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Credit Load</span>
                    <span className="font-bold text-slate-900 dark:text-white">{subject.credits} Credits</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Total Units</span>
                    <span className="font-bold text-slate-900 dark:text-white">{subject.units?.length || 5} Units</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Available PYQs</span>
                    <span className="font-bold text-brand-600 dark:text-brand-400">{subject.pyqCount || 0} Questions</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Notes & Resources</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{subject.resourceCount || 0} Materials</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. Syllabus */}
      {activeTab === 'syllabus' && (
        <div className="space-y-6">
          {subject.units?.map((unit) => (
            <div
              key={unit.unitNumber}
              className="academic-card p-6 space-y-4 hover:border-brand-500/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
                    U{unit.unitNumber}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Unit {unit.unitNumber}: {unit.title}
                  </h3>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {unit.topics?.length || 0} Topics
                </span>
              </div>

              {unit.description && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {unit.description}
                </p>
              )}

              <div>
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Key Topics & Sub-themes:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {unit.topics?.map((topic, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: 3. Notes & Resources */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          {subject.resources?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subject.resources.map((res) => (
                <div
                  key={res._id}
                  className="academic-card p-6 flex flex-col justify-between hover:border-brand-500/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                        {res.type}
                      </span>
                      <span className="text-xs text-slate-500">Unit {res.unit}</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {res.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      {res.description || 'Curated study material and reference notes.'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {new Date(res.createdAt).toLocaleDateString()}
                    </span>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-brand-500" />
                      <span>Open / Download</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No Resources Available"
              description="Notes and study materials for this subject will be posted soon."
            />
          )}
        </div>
      )}

      {/* TAB CONTENT: 4. PYQs Tab */}
      {activeTab === 'pyqs' && (
        <div className="space-y-6">
          {/* Inline Filter Controls */}
          <div className="academic-card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={pyqSearch}
                onChange={(e) => setPyqSearch(e.target.value)}
                placeholder="Search subject questions..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 shrink-0">Filter Unit:</span>
              <select
                value={pyqUnitFilter}
                onChange={(e) => setPyqUnitFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="All">All Units</option>
                {[1, 2, 3, 4, 5].map((u) => (
                  <option key={u} value={u}>
                    Unit {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Questions List */}
          {filteredPYQs.length > 0 ? (
            <div className="space-y-4">
              {filteredPYQs.map((pyq) => {
                const isBookmarked = userBookmarks.has(pyq._id);
                const isExpanded = !!expandedSolutions[pyq._id];

                return (
                  <div
                    key={pyq._id}
                    className="academic-card p-6 space-y-4 border-slate-200/80 dark:border-slate-800/80"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                          Unit {pyq.unit}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          Year {pyq.year}
                        </span>
                        <MarksBadge marks={pyq.marks} />
                        <DifficultyBadge difficulty={pyq.difficulty} />
                        {pyq.important && <ImportantBadge />}
                        {pyq.frequency > 1 && <FrequencyBadge frequency={pyq.frequency} />}
                      </div>

                      <button
                        onClick={() => handleBookmarkToggle(pyq._id)}
                        className={`p-2 rounded-xl transition-colors ${
                          isBookmarked
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Question'}
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                      </button>
                    </div>

                    <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                      {pyq.question}
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Topic: <span className="font-medium text-slate-700 dark:text-slate-300">{pyq.topic}</span>
                    </div>

                    {/* Solution Toggle */}
                    {pyq.solution && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => toggleSolution(pyq._id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          <span>{isExpanded ? 'Hide Solution & Notes' : 'Show Solution & Notes'}</span>
                        </button>

                        {isExpanded && (
                          <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                            {pyq.solution}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={HelpCircle}
              title="No Matching Questions Found"
              description="Try adjusting your unit filter or search query."
            />
          )}
        </div>
      )}

      {/* TAB CONTENT: 5. Important Topics */}
      {activeTab === 'important' && (
        <div className="space-y-6">
          <div className="academic-card p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              High-Frequency Exam Topics
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              These topics have been tested multiple times in university examinations and represent key scoring areas.
            </p>

            <div className="space-y-3">
              {analyticsData.topicFrequency?.map((t, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {t.topic}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Appeared in {t.count} distinct exam questions
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                    Frequency: {t.frequency || t.count}×
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 6. Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Topic Frequency Bar Chart */}
            <div className="academic-card p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                Question Frequency by Topic
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.topicFrequency || []}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="topic" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }} />
                    <Bar dataKey="frequency" fill="#6366f1" radius={[4, 4, 0, 0]} name="Frequency Asked" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Questions by Year Chart */}
            <div className="academic-card p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                Questions Distribution by Exam Year
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.questionsByYear || []}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Questions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Unit-wise Distribution Chart */}
            <div className="academic-card p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                Unit-wise Question Weightage
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.unitDistribution || []}
                      dataKey="count"
                      nameKey="unit"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {(analyticsData.unitDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Difficulty Distribution Chart */}
            <div className="academic-card p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                Difficulty Level Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.difficultyDistribution || []}
                      dataKey="count"
                      nameKey="difficulty"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {(analyticsData.difficultyDistribution || []).map((entry, index) => {
                        let fill = '#10b981';
                        if (entry.difficulty === 'Medium') fill = '#f59e0b';
                        if (entry.difficulty === 'Hard') fill = '#f43f5e';
                        return <Cell key={`cell-${index}`} fill={fill} />;
                      })}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectDetailPage;
