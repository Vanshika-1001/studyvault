import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github, Heart, Shield, Code2, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                StudyVault
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              "Your Semester. Your Subjects. Your PYQs. One Place."
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Built for B.Tech & CSE college students to organize subjects, master previous-year questions, and track semester performance.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/semesters" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Semester Management
                </Link>
              </li>
              <li>
                <Link to="/pyqs" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  PYQ Question Bank
                </Link>
              </li>
              <li>
                <Link to="/practice" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Interactive Practice Mode
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  PYQ Trend Analytics
                </Link>
              </li>
              <li>
                <Link to="/bookmarks" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  My Saved Bookmarks
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Subjects & Notes
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/resources" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Download Study Notes
                </Link>
              </li>
              <li>
                <Link to="/pyqs?subject=CS501" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Database Systems (DBMS)
                </Link>
              </li>
              <li>
                <Link to="/pyqs?subject=CS502" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Operating Systems (OS)
                </Link>
              </li>
              <li>
                <Link to="/pyqs?subject=CS503" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Computer Networks (CN)
                </Link>
              </li>
              <li>
                <Link to="/pyqs?subject=CS301" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Data Structures (DSA)
                </Link>
              </li>
            </ul>
          </div>

          {/* Developer / Portfolio Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Showcase & Tech
            </h4>
            <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-400">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>GitHub Repository</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
              <div className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2">
                <Code2 className="w-4 h-4 text-brand-500" />
                <span>MERN Stack (MongoDB, Express, React, Node)</span>
              </div>
              <div className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>JWT Authentication & Role-based Access</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} StudyVault Academic Platform. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for engineering students everywhere.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
