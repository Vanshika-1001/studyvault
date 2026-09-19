import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  HelpCircle,
  FileText,
  Trash2,
  Download,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { bookmarkAPI } from '../services/api';
import { CardSkeleton } from '../components/SkeletonLoader';
import { DifficultyBadge, UnitBadge, MarksBadge } from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

const BookmarksPage = () => {
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' | 'notes' | 'resources'
  const [bookmarks, setBookmarks] = useState({
    questions: [],
    notes: [],
    resources: [],
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const { success, error } = useToast();

  const fetchBookmarks = async () => {
    setIsLoading(true);
    try {
      const res = await bookmarkAPI.getBookmarks();
      if (res.data?.data) {
        setBookmarks(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleRemoveBookmark = async (itemId) => {
    try {
      const res = await bookmarkAPI.remove(itemId);
      if (res.data?.success) {
        success('Bookmark removed successfully');
        fetchBookmarks();
      }
    } catch (err) {
      error('Failed to remove bookmark');
    }
  };

  const tabs = [
    { id: 'questions', label: `Questions (${bookmarks.questions?.length || 0})`, icon: HelpCircle },
    { id: 'notes', label: `Notes (${bookmarks.notes?.length || 0})`, icon: FileText },
    { id: 'resources', label: `Resources (${bookmarks.resources?.length || 0})`, icon: BookOpen },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          My Saved Bookmarks
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Quickly review your saved previous-year exam questions, unit notes, and academic resources.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex space-x-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
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

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <>
          {/* TAB 1: Questions */}
          {activeTab === 'questions' && (
            <div>
              {bookmarks.questions?.length > 0 ? (
                <div className="space-y-4">
                  {bookmarks.questions.map((q) => (
                    <div
                      key={q._id}
                      className="academic-card p-6 space-y-4 border-slate-200/80 dark:border-slate-800/80 hover:border-brand-500/40 transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                            {q.subject?.code} • {q.subject?.name}
                          </span>
                          <UnitBadge unit={q.unit} />
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            Year {q.year}
                          </span>
                          <MarksBadge marks={q.marks} />
                          <DifficultyBadge difficulty={q.difficulty} />
                        </div>

                        <button
                          onClick={() => handleRemoveBookmark(q._id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                        {q.question}
                      </h3>

                      <div className="text-xs text-slate-500">
                        Topic: <span className="font-semibold text-slate-700 dark:text-slate-300">{q.topic}</span>
                      </div>

                      {q.solution && (
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                          <span className="font-bold block text-slate-900 dark:text-white mb-1">Model Solution:</span>
                          {q.solution}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Bookmark}
                  title="No Bookmarked Questions"
                  description="When browsing questions in the PYQ Explorer or during Practice Mode, click the bookmark icon to save questions here for quick revision."
                />
              )}
            </div>
          )}

          {/* TAB 2: Notes */}
          {activeTab === 'notes' && (
            <div>
              {bookmarks.notes?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bookmarks.notes.map((note) => (
                    <div
                      key={note._id}
                      className="academic-card p-6 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                            {note.type}
                          </span>
                          <button
                            onClick={() => handleRemoveBookmark(note._id)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {note.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                          {note.description}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-slate-400">Unit {note.unit}</span>
                        <a
                          href={note.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 text-brand-500" />
                          <span>Download</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No Bookmarked Notes"
                  description="You haven't bookmarked any lecture notes or revision summaries yet."
                />
              )}
            </div>
          )}

          {/* TAB 3: Other Resources */}
          {activeTab === 'resources' && (
            <div>
              {bookmarks.resources?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bookmarks.resources.map((res) => (
                    <div
                      key={res._id}
                      className="academic-card p-6 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                            {res.type}
                          </span>
                          <button
                            onClick={() => handleRemoveBookmark(res._id)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {res.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                          {res.description}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-slate-400">Unit {res.unit}</span>
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-brand-500" />
                          <span>Open Resource</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={BookOpen}
                  title="No Other Bookmarked Resources"
                  description="Save practice sheets, official syllabus files, or reference links here."
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BookmarksPage;
