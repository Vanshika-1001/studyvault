import React, { useEffect, useState } from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  Search,
  Filter,
  Bookmark,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { resourceAPI, subjectAPI, bookmarkAPI } from '../services/api';
import { CardSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

const ResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  const { success, error } = useToast();

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [subjRes, bookRes] = await Promise.allSettled([
          subjectAPI.getSubjects(),
          bookmarkAPI.getBookmarks(),
        ]);

        if (subjRes.status === 'fulfilled' && subjRes.value.data?.data) {
          setSubjectsList(subjRes.value.data.data);
        }

        if (bookRes.status === 'fulfilled' && bookRes.value.data?.data?.allResources) {
          const ids = new Set(bookRes.value.data.data.allResources.map((r) => r._id));
          setBookmarkedIds(ids);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchInitial();
  }, []);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const params = {
        search: search || undefined,
        subject: selectedSubject || undefined,
        unit: selectedUnit || undefined,
        type: selectedType !== 'All' ? selectedType : undefined,
      };

      const res = await resourceAPI.getResources(params);
      if (res.data?.data) {
        setResources(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedSubject, selectedUnit, selectedType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const handleBookmarkToggle = async (resourceId) => {
    try {
      const res = await bookmarkAPI.toggle({ itemType: 'Resource', itemId: resourceId });
      if (res.data?.success) {
        setBookmarkedIds((prev) => {
          const updated = new Set(prev);
          if (res.data.isBookmarked) {
            updated.add(resourceId);
            success('Resource bookmarked');
          } else {
            updated.delete(resourceId);
            success('Bookmark removed');
          }
          return updated;
        });
      }
    } catch (err) {
      error('Please sign in to bookmark resources');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Notes & Academic Resources
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Unit-wise lecture notes, official university syllabus, reference solutions, and practice sheets.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="academic-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or description..."
              className="w-full pl-10 pr-24 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="">All Subjects</option>
              {subjectsList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.code} — {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Unit
            </label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
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

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Resource Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="All">All Types</option>
              <option value="Notes">Lecture Notes</option>
              <option value="PYQ">PYQ Compilations</option>
              <option value="Syllabus">Official Syllabus</option>
              <option value="Reference">Reference Guides</option>
              <option value="Practice">Practice Sheets</option>
              <option value="Video">Video Lessons</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resources Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => {
            const isBookmarked = bookmarkedIds.has(res._id);

            return (
              <div
                key={res._id}
                className="academic-card p-6 flex flex-col justify-between hover:border-brand-500/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      {res.type}
                    </span>

                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-500 font-medium">
                        Unit {res.unit}
                      </span>
                      <button
                        onClick={() => handleBookmarkToggle(res._id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isBookmarked
                            ? 'text-amber-500'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                        title="Bookmark resource"
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {res.title}
                  </h4>

                  <div className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-1">
                    {res.subject?.code} • {res.subject?.name}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-3 leading-relaxed">
                    {res.description || 'Verified academic study material.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(res.createdAt).toLocaleDateString()}</span>
                  </div>

                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Open / Download</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No Resources Found"
          description="Try broadening your search term or adjusting filters."
        />
      )}
    </div>
  );
};

export default ResourcesPage;
