import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Layers, BookOpen, ChevronRight, HelpCircle, FileText, Award } from 'lucide-react';
import { semesterAPI, subjectAPI } from '../services/api';
import { CardSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

const SemestersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSem = searchParams.get('sem') ? Number(searchParams.get('sem')) : 5;

  const [selectedSemester, setSelectedSemester] = useState(initialSem);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all semesters
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const res = await semesterAPI.getSemesters();
        if (res.data?.data) {
          setSemesters(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching semesters:', err);
      }
    };
    fetchSemesters();
  }, []);

  // Fetch subjects for currently selected semester
  useEffect(() => {
    const fetchSubjects = async () => {
      setIsLoading(true);
      try {
        const res = await subjectAPI.getSubjects({ semester: selectedSemester });
        if (res.data?.data) {
          setSubjects(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
    setSearchParams({ sem: selectedSemester });
  }, [selectedSemester]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Semester Curriculum & Subjects
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Select any semester to view assigned subjects, units, previous-year questions, and notes.
        </p>
      </div>

      {/* Semester Selector Tabs (1 through 8) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((semNum) => {
          const isSelected = selectedSemester === semNum;
          return (
            <button
              key={semNum}
              onClick={() => setSelectedSemester(semNum)}
              className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                isSelected
                  ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/25 font-bold scale-[1.02]'
                  : 'academic-card text-slate-700 dark:text-slate-300 hover:border-brand-500/40'
              }`}
            >
              <span className="text-xs uppercase tracking-wider opacity-80">Sem</span>
              <span className="text-xl font-extrabold">{semNum}</span>
            </button>
          );
        })}
      </div>

      {/* Semester Details Header */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
            S{selectedSemester}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Semester {selectedSemester} — B.Tech Computer Science & Engineering
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {subjects.length} active subjects
            </p>
          </div>
        </div>
      </div>

      {/* Subject Cards Grid */}
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
                {/* Badges row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                    {subject.code}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <Award className="w-3.5 h-3.5 text-brand-500" />
                    {subject.credits} Credits
                  </span>
                </div>

                {/* Subject Name */}
                <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {subject.name}
                </h4>

                {/* Description */}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {subject.description || 'Comprehensive curriculum study, syllabus, unit notes, and PYQs.'}
                </p>

                {/* Units preview */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {subject.units?.slice(0, 3).map((u, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400"
                    >
                      U{u.unitNumber}: {u.title.split(' ')[0]}
                    </span>
                  ))}
                  {subject.units?.length > 3 && (
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-400">
                      +{subject.units.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom statistics bar */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {subject.pyqCount || 0}
                    </span>{' '}
                    PYQs
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {subject.resourceCount || 0}
                    </span>{' '}
                    Notes
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Layers}
          title={`No subjects found for Semester ${selectedSemester}`}
          description="Subjects for this semester have not yet been published or are being updated by administrators."
          actionText="Switch to Semester 5"
          onAction={() => setSelectedSemester(5)}
        />
      )}
    </div>
  );
};

export default SemestersPage;
