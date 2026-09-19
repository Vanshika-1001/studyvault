import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  HelpCircle,
  Search,
  Filter,
  RotateCcw,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowUpDown,
  BookOpen,
} from 'lucide-react';
import { pyqAPI, subjectAPI, bookmarkAPI } from '../services/api';
import { CardSkeleton } from '../components/SkeletonLoader';
import { DifficultyBadge, ImportantBadge, FrequencyBadge, MarksBadge, UnitBadge } from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

const PYQsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [semester, setSemester] = useState(searchParams.get('semester') || '');
  const [subject, setSubject] = useState(searchParams.get('subject') || '');
  const [unit, setUnit] = useState(searchParams.get('unit') || '');
  const [year, setYear] = useState(searchParams.get('year') || '');
  const [marks, setMarks] = useState(searchParams.get('marks') || '');
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || 'All');
  const [important, setImportant] = useState(searchParams.get('important') === 'true');
  const [frequent, setFrequent] = useState(searchParams.get('frequent') === 'true');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  // Data State
  const [pyqs, setPyqs] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [userBookmarks, setUserBookmarks] = useState(new Set());
  const [expandedSolutions, setExpandedSolutions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const { success, error } = useToast();

  // Fetch subjects list for the filter dropdown
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await subjectAPI.getSubjects();
        if (res.data?.data) {
          setSubjectsList(res.data.data);
        }
      } catch (err) {
        console.error('Error loading subjects:', err);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch user bookmarks
  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await bookmarkAPI.getBookmarks();
        if (res.data?.data?.questions) {
          const ids = new Set(res.data.data.questions.map((q) => q._id));
          setUserBookmarks(ids);
        }
      } catch (err) {
        // Guest mode / not logged in is fine
      }
    };
    fetchBookmarks();
  }, []);

  // Fetch PYQs based on active filters
  const fetchPYQs = async () => {
    setIsLoading(true);
    try {
      const params = {
        search: search || undefined,
        semester: semester || undefined,
        subject: subject || undefined,
        unit: unit || undefined,
        year: year || undefined,
        marks: marks || undefined,
        difficulty: difficulty !== 'All' ? difficulty : undefined,
        important: important ? true : undefined,
        frequent: frequent ? true : undefined,
        sort,
      };

      const res = await pyqAPI.getPYQs(params);
      if (res.data?.data) {
        setPyqs(res.data.data);
        setTotalCount(res.data.total || res.data.count || 0);
      }
    } catch (err) {
      console.error('Error fetching PYQs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPYQs();
  }, [semester, subject, unit, year, marks, difficulty, important, frequent, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPYQs();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSemester('');
    setSubject('');
    setUnit('');
    setYear('');
    setMarks('');
    setDifficulty('All');
    setImportant(false);
    setFrequent(false);
    setSort('newest');
  };

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
      error('Please sign in to bookmark questions');
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Previous Year Questions (PYQs)
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Search and multi-filter across semesters, subjects, units, marks, and repeated university patterns.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="academic-card p-5 sm:p-6 space-y-4">
        {/* Search Bar & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search question text, topic, or subject..."
              className="w-full pl-10 pr-24 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Search
            </button>
          </form>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="newest">Sort: Newest Year</option>
              <option value="oldest">Sort: Oldest Year</option>
              <option value="frequency">Sort: Most Frequent</option>
              <option value="difficulty">Sort: Difficulty</option>
              <option value="marks">Sort: Marks</option>
            </select>
          </div>
        </div>

        {/* Multi-Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          {/* Semester Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Semester
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Sem {s}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="">All Subjects</option>
              {subjectsList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.code} - {s.name.split(' ')[0]}
                </option>
              ))}
            </select>
          </div>

          {/* Unit Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="">All Units</option>
              {[1, 2, 3, 4, 5].map((u) => (
                <option key={u} value={u}>
                  Unit {u}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Exam Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="">All Years</option>
              {[2026, 2025, 2024, 2023, 2022].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Marks Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Marks
            </label>
            <select
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="">All Marks</option>
              <option value="5">5 Marks</option>
              <option value="7">7 Marks</option>
              <option value="10">10 Marks</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Checkbox Flags & Clear Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={important}
                onChange={(e) => setImportant(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
              />
              <span className="font-medium">⭐ Important Only</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={frequent}
                onChange={(e) => setFrequent(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
              />
              <span className="font-medium">🔥 Frequently Asked (2+ times)</span>
            </label>
          </div>

          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Showing {pyqs.length} of {totalCount} university exam questions</span>
      </div>

      {/* Questions List */}
      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : pyqs.length > 0 ? (
        <div className="space-y-4">
          {pyqs.map((pyq) => {
            const isBookmarked = userBookmarks.has(pyq._id);
            const isExpanded = !!expandedSolutions[pyq._id];

            return (
              <div
                key={pyq._id}
                className="academic-card p-6 space-y-4 border-slate-200/80 dark:border-slate-800/80 hover:border-brand-500/40 transition-colors"
              >
                {/* Header row: Subject, Badges, Bookmark */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                      {pyq.subject?.code || 'CS501'} • {pyq.subject?.name || 'DBMS'}
                    </span>
                    <UnitBadge unit={pyq.unit} />
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

                {/* Question Text */}
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                  {pyq.question}
                </h3>

                {/* Topic Metadata */}
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span>Topic:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {pyq.topic}
                  </span>
                </div>

                {/* Collapsible Solution Box */}
                {pyq.solution && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      onClick={() => toggleSolution(pyq._id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      <span>{isExpanded ? 'Hide Solution & Answer' : 'Show Solution & Answer'}</span>
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
          title="No PYQs Found"
          description="No previous year questions match your current search and filter settings. Try clearing some filters."
          actionText="Reset All Filters"
          onAction={handleClearFilters}
        />
      )}
    </div>
  );
};

export default PYQsPage;
