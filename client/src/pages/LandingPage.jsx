import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers,
  HelpCircle,
  Star,
  BarChart3,
  Search,
  TrendingUp,
  CheckCircle2,
  Users,
  GraduationCap,
  FileCheck2,
  FolderGit2,
} from 'lucide-react';
import { analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalSemesters: 8,
    totalSubjects: '50+',
    totalPYQs: '500+',
    totalResources: '1000+',
    totalStudents: '120+',
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await analyticsAPI.getPlatformStats();
        if (res.data?.data) {
          const d = res.data.data;
          setStats({
            totalSemesters: d.totalSemesters || 8,
            totalSubjects: d.totalSubjects > 0 ? `${d.totalSubjects}+` : '50+',
            totalPYQs: d.totalPYQs > 0 ? `${d.totalPYQs}+` : '500+',
            totalResources: d.totalResources > 0 ? `${d.totalResources}+` : '1000+',
            totalStudents: d.totalStudents > 0 ? `${d.totalStudents}+` : '120+',
          });
        }
      } catch (err) {
        // Fallback default numbers are already configured in state
      }
    };
    fetchStats();
  }, []);

  const features = [
    {
      icon: Layers,
      title: 'Semester Management',
      desc: 'Organized curriculum from Semester 1 through 8. View credit loads, units, and subject outlines at a glance.',
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50',
    },
    {
      icon: HelpCircle,
      title: 'Previous Year Questions',
      desc: 'Extensive repository of university exam questions classified by year, marks, unit, and difficulty.',
      color: 'text-brand-500 bg-brand-50 dark:bg-brand-950/50',
    },
    {
      icon: Star,
      title: 'Important & Repeated Questions',
      desc: 'Algorithmic identification of high-yield exam questions and frequently repeated university concepts.',
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/50',
    },
    {
      icon: BarChart3,
      title: 'PYQ Analytics & Trends',
      desc: 'Interactive Recharts visualizations depicting topic weightage, unit distribution, and year-by-year patterns.',
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/50',
    },
    {
      icon: Search,
      title: 'Smart Multi-Filtering Search',
      desc: 'Instant full-text search with simultaneous filters by semester, subject, unit, marks, and difficulty.',
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50',
    },
    {
      icon: TrendingUp,
      title: 'Interactive Practice Mode',
      desc: 'Simulate university exams, practice unit-by-unit with solutions, and track revision topics with accuracy scoring.',
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/50',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Select Your Semester',
      desc: 'Choose from Semester 1 to Semester 8 to immediately access your relevant branch subjects.',
    },
    {
      step: '02',
      title: 'Choose Your Subject',
      desc: 'Explore subjects like DBMS, OS, and CN with 5-unit syllabus guides and curated study materials.',
    },
    {
      step: '03',
      title: 'Study Notes & Syllabus',
      desc: 'Read lecture notes, unit summaries, and official exam schemes directly on the platform.',
    },
    {
      step: '04',
      title: 'Practice PYQs with Solutions',
      desc: 'Solve authentic university exam questions with comprehensive solutions and instant feedback.',
    },
    {
      step: '05',
      title: 'Analyze Repeated Topics',
      desc: 'Use data visualizers to identify recurring questions and optimize your revision strategy.',
    },
  ];

  return (
    <div className="space-y-24 py-8 sm:py-16">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs sm:text-sm font-semibold mb-8 shadow-sm">
          <Sparkles className="w-4 h-4 text-brand-500" />
          <span>Semester Academic & PYQ Management System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Master Every Semester With{' '}
          <span className="bg-gradient-to-r from-brand-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
            StudyVault
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          "Your Semester. Your Subjects. Your PYQs. One Place."
        </p>
        <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Organize subjects, notes, previous-year questions, and exam preparation in one intelligent academic platform designed for college engineering students.
        </p>

        {/* Hero CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/semesters"
            className="px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2 text-base"
          >
            <span>Explore Subjects</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/practice"
            className="px-6 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-medium rounded-xl shadow-sm transition-all flex items-center gap-2 text-base"
          >
            <HelpCircle className="w-4 h-4 text-brand-500" />
            <span>Practice PYQs</span>
          </Link>
          {isAuthenticated && (
            <Link
              to={isAdmin ? '/admin' : '/dashboard'}
              className="px-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-xl shadow-sm hover:opacity-95 transition-all text-base"
            >
              Go to {isAdmin ? 'Admin Console' : 'Dashboard'}
            </Link>
          )}
        </div>

        {/* Live Academic Statistics Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
          <div className="academic-card p-6 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-600 dark:text-brand-400">
              {stats.totalSemesters}
            </div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Semesters
            </div>
          </div>
          <div className="academic-card p-6 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {stats.totalSubjects}
            </div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Subjects
            </div>
          </div>
          <div className="academic-card p-6 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-purple-600 dark:text-purple-400">
              {stats.totalPYQs}
            </div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              PYQs Solved
            </div>
          </div>
          <div className="academic-card p-6 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {stats.totalResources}
            </div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Resources
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Platform Capabilities
          </h2>
          <h3 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Everything You Need For Semester Excellence
          </h3>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
            Engineered to bridge the gap between syllabus lectures and university exam performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="academic-card p-8 hover:-translate-y-1 transition-all duration-200 border-slate-200/80 dark:border-slate-800/80"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${feature.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Structured Learning Flow
          </h2>
          <h3 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            How StudyVault Powers Your Preparation
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-6">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="academic-card p-6 flex flex-col relative group hover:border-brand-500/50 transition-colors"
            >
              <div className="text-3xl font-black text-slate-300 dark:text-slate-700 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mb-4">
                {item.step}
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {item.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Showcase Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-700 p-8 sm:p-12 lg:p-16 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Ace Your University Exams?
            </h3>
            <p className="mt-4 text-base sm:text-lg text-indigo-100 leading-relaxed">
              Join students who use StudyVault to systematically tackle previous year questions, identify repeated topics, and achieve higher grades with less stress.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="px-6 py-3.5 bg-white text-brand-700 hover:bg-slate-100 font-semibold rounded-xl shadow-md transition-all"
              >
                Create Student Account
              </Link>
              <Link
                to="/pyqs"
                className="px-6 py-3.5 bg-brand-700/60 hover:bg-brand-700 text-white font-semibold rounded-xl border border-white/20 transition-all"
              >
                Browse Question Bank
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
