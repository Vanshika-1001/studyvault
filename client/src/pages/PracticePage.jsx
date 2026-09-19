import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  PlayCircle,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Award,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { practiceAPI, subjectAPI, bookmarkAPI } from '../services/api';
import { DifficultyBadge, UnitBadge, MarksBadge } from '../components/Badge';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';

const PracticePage = () => {
  const [searchParams] = useSearchParams();
  const preSelectedSubject = searchParams.get('subject');

  // Mode: 'setup' | 'practicing' | 'result'
  const [mode, setMode] = useState('setup');

  // Setup Form State
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(preSelectedSubject || '');
  const [selectedUnit, setSelectedUnit] = useState(0); // 0 = all
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [questionCount, setQuestionCount] = useState(5);

  // Active Practice State
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [index]: { userStatus: 'correct' | 'incorrect', markedForRevision: boolean } }
  const [showSolution, setShowSolution] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  // Result State
  const [resultData, setResultData] = useState(null);
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthenticated } = useAuth();
  const { success, error, warning } = useToast();

  // Load subjects & practice history on mount
  useEffect(() => {
    const initData = async () => {
      try {
        const [subjRes, historyRes, bookmarkRes] = await Promise.allSettled([
          subjectAPI.getSubjects(),
          practiceAPI.getHistory(),
          bookmarkAPI.getBookmarks(),
        ]);

        if (subjRes.status === 'fulfilled' && subjRes.value.data?.data) {
          setSubjects(subjRes.value.data.data);
          if (!selectedSubject && subjRes.value.data.data.length > 0) {
            setSelectedSubject(subjRes.value.data.data[0]._id);
          }
        }

        if (historyRes.status === 'fulfilled' && historyRes.value.data?.data?.sessions) {
          setPracticeHistory(historyRes.value.data.data.sessions);
        }

        if (bookmarkRes.status === 'fulfilled' && bookmarkRes.value.data?.data?.questions) {
          setBookmarkedIds(new Set(bookmarkRes.value.data.data.questions.map((q) => q._id)));
        }
      } catch (err) {
        console.error('Error loading practice page data:', err);
      }
    };
    initData();
  }, []);

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Start Practice
  const handleStartPractice = async () => {
    if (!selectedSubject) {
      warning('Please select a subject to practice.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await practiceAPI.generate({
        subjectId: selectedSubject,
        unit: Number(selectedUnit),
        difficulty: selectedDifficulty,
        count: Number(questionCount),
      });

      if (res.data?.data && res.data.data.length > 0) {
        setPracticeQuestions(res.data.data);
        setCurrentIndex(0);
        setUserAnswers({});
        setElapsedTime(0);
        setIsTimerRunning(true);
        setMode('practicing');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to generate practice test.');
    } finally {
      setIsLoading(false);
    }
  };

  // Mark answer status for current question
  const handleMarkStatus = (status) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: {
        ...prev[currentIndex],
        userStatus: status,
      },
    }));
  };

  const handleToggleRevision = () => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: {
        ...prev[currentIndex],
        markedForRevision: !prev[currentIndex]?.markedForRevision,
      },
    }));
  };

  const handleBookmarkToggle = async (questionId) => {
    try {
      const res = await bookmarkAPI.toggle({ itemType: 'PYQ', itemId: questionId });
      if (res.data?.success) {
        setBookmarkedIds((prev) => {
          const updated = new Set(prev);
          if (res.data.isBookmarked) {
            updated.add(questionId);
            success('Question added to bookmarks');
          } else {
            updated.delete(questionId);
            success('Question removed from bookmarks');
          }
          return updated;
        });
      }
    } catch (err) {
      error('Please sign in to bookmark questions');
    }
  };

  // Submit Practice Session
  const handleSubmitPractice = async () => {
    setIsTimerRunning(false);
    setIsLoading(true);

    const formattedQuestions = practiceQuestions.map((q, idx) => {
      const ans = userAnswers[idx];
      return {
        questionId: q._id,
        userStatus: ans?.userStatus || 'incorrect',
        markedForRevision: Boolean(ans?.markedForRevision),
        topic: q.topic,
      };
    });

    try {
      const res = await practiceAPI.submit({
        subjectId: selectedSubject,
        unit: Number(selectedUnit),
        difficulty: selectedDifficulty,
        questions: formattedQuestions,
        timeTaken: elapsedTime,
      });

      if (res.data?.data) {
        setResultData(res.data.data);
        setMode('result');
        success('Practice session saved successfully!');
        // Refresh practice history
        const historyRes = await practiceAPI.getHistory();
        if (historyRes.data?.data?.sessions) {
          setPracticeHistory(historyRes.data.data.sessions);
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to record practice session.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = practiceQuestions[currentIndex];
  const currentAnswer = userAnswers[currentIndex] || {};

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* ========================================================================= */}
      {/* MODE 1: SETUP SCREEN                                                      */}
      {/* ========================================================================= */}
      {mode === 'setup' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Interactive PYQ Practice Mode
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Configure and launch a targeted practice session. Answer questions, check official solutions, and identify topics needing revision.
            </p>
          </div>

          <div className="academic-card p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Configure Practice Session
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Select Subject */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Select Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                >
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.code} — {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Unit */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Select Unit
                </label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                >
                  <option value={0}>All Units (Comprehensive)</option>
                  {[1, 2, 3, 4, 5].map((u) => (
                    <option key={u} value={u}>
                      Unit {u}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Difficulty */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                >
                  <option value="All">All Difficulties (Mixed)</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              {/* Number of Questions */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Number of Questions
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setQuestionCount(count)}
                      className={`py-2.5 rounded-xl text-sm font-bold border transition-colors ${
                        questionCount === count
                          ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={handleStartPractice}
                disabled={isLoading}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-brand-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <PlayCircle className="w-4 h-4" />
                <span>{isLoading ? 'Generating Questions...' : 'Start Practice Session'}</span>
              </button>
            </div>
          </div>

          {/* Past Practice History Table */}
          {practiceHistory.length > 0 && (
            <div className="academic-card p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-500" />
                <span>Past Practice History</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Subject</th>
                      <th className="pb-3 font-semibold">Scope</th>
                      <th className="pb-3 font-semibold">Score</th>
                      <th className="pb-3 font-semibold">Accuracy</th>
                      <th className="pb-3 font-semibold">Duration</th>
                      <th className="pb-3 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {practiceHistory.map((s) => (
                      <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">
                          {s.subject?.name}
                        </td>
                        <td className="py-3 text-slate-500 dark:text-slate-400">
                          {s.unit ? `Unit ${s.unit}` : 'All Units'} • {s.difficulty}
                        </td>
                        <td className="py-3 font-bold text-brand-600 dark:text-brand-400">
                          {s.score}/{s.totalQuestions}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold ${
                              s.accuracy >= 70
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                          >
                            {s.accuracy}%
                          </span>
                        </td>
                        <td className="py-3 text-slate-500">
                          {Math.floor(s.timeTaken / 60)}m {s.timeTaken % 60}s
                        </td>
                        <td className="py-3 text-slate-400">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: ACTIVE PRACTICE SESSION (Question by Question)                     */}
      {/* ========================================================================= */}
      {mode === 'practicing' && currentQuestion && (
        <div className="space-y-6">
          {/* Top Progress & Timer Bar */}
          <div className="academic-card p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Question {currentIndex + 1} of {practiceQuestions.length}
              </span>
              <div className="hidden sm:block w-32 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-brand-600 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / practiceQuestions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5 text-brand-500" />
                <span>{formatTime(elapsedTime)}</span>
              </div>

              <button
                onClick={handleSubmitPractice}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
              >
                Finish Session
              </button>
            </div>
          </div>

          {/* Active Question Card */}
          <div className="academic-card p-6 sm:p-8 space-y-6 border-slate-200/80 dark:border-slate-800/80">
            {/* Badges & Bookmark */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <UnitBadge unit={currentQuestion.unit} />
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Year {currentQuestion.year}
                </span>
                <MarksBadge marks={currentQuestion.marks} />
                <DifficultyBadge difficulty={currentQuestion.difficulty} />
              </div>

              <button
                onClick={() => handleBookmarkToggle(currentQuestion._id)}
                className={`p-2 rounded-xl transition-colors ${
                  bookmarkedIds.has(currentQuestion._id)
                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50'
                    : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Bookmark this question"
              >
                <Bookmark
                  className={`w-4 h-4 ${bookmarkedIds.has(currentQuestion._id) ? 'fill-amber-500' : ''}`}
                />
              </button>
            </div>

            {/* Question Text */}
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQuestion.question}
            </h3>

            {/* Topic */}
            <div className="text-xs text-slate-500">
              Topic:{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {currentQuestion.topic}
              </span>
            </div>

            {/* Self Evaluation Buttons */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Self-Evaluation / Practice Feedback:
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleMarkStatus('correct')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    currentAnswer.userStatus === 'correct'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-emerald-600 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I Solved / Know This</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMarkStatus('incorrect')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    currentAnswer.userStatus === 'incorrect'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-rose-600 border border-rose-300 dark:border-rose-800 hover:bg-rose-50'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>I Struggled / Got It Wrong</span>
                </button>

                <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer ml-auto">
                  <input
                    type="checkbox"
                    checked={Boolean(currentAnswer.markedForRevision)}
                    onChange={handleToggleRevision}
                    className="w-4 h-4 rounded text-brand-600"
                  />
                  <span>Mark for Revision</span>
                </label>
              </div>
            </div>

            {/* Solution Toggle */}
            {currentQuestion.solution && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowSolution(!showSolution)}
                  className="flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  {showSolution ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <span>{showSolution ? 'Hide Model Answer & Notes' : 'Show Model Answer & Notes'}</span>
                </button>

                {showSolution && (
                  <div className="mt-3 p-5 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {currentQuestion.solution}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setShowSolution(false);
                setCurrentIndex((prev) => Math.max(0, prev - 1));
              }}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentIndex < practiceQuestions.length - 1 ? (
              <button
                onClick={() => {
                  setShowSolution(false);
                  setCurrentIndex((prev) => prev + 1);
                }}
                className="flex items-center gap-1 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitPractice}
                className="flex items-center gap-1 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit & View Results</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: RESULTS SUMMARY                                                   */}
      {/* ========================================================================= */}
      {mode === 'result' && resultData && (
        <div className="space-y-8">
          <div className="academic-card p-6 sm:p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto shadow-sm">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Practice Session Completed!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Your performance and revision list have been recorded in your student profile.
              </p>
            </div>

            {/* Score Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {resultData.totalQuestions}
                </div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                  Total Questions
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {resultData.correctCount}
                </div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                  Correct
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                  {resultData.incorrectCount}
                </div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                  Incorrect
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-2xl font-black text-brand-600 dark:text-brand-400">
                  {resultData.accuracy}%
                </div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                  Accuracy
                </div>
              </div>
            </div>

            {/* Revision Topics List */}
            {resultData.revisionTopics?.length > 0 && (
              <div className="max-w-xl mx-auto text-left p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <h4 className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-2">
                  Topics Requiring Further Revision:
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {resultData.revisionTopics.map((topic, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span className="font-semibold">{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setMode('setup')}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
              >
                Practice Another Set
              </button>
              <Link
                to="/dashboard"
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticePage;
