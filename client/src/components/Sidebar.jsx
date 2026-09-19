import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  HelpCircle,
  PlayCircle,
  Bookmark,
  FileText,
  BarChart3,
  ShieldCheck,
  LogOut,
  ChevronRight,
  BookOpen,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const studentNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Semesters', path: '/semesters', icon: Layers },
    { name: 'PYQ Question Bank', path: '/pyqs', icon: HelpCircle },
    { name: 'Practice Mode', path: '/practice', icon: PlayCircle },
    { name: 'Notes & Resources', path: '/resources', icon: FileText },
    { name: 'My Bookmarks', path: '/bookmarks', icon: Bookmark },
    { name: 'PYQ Analytics', path: '/analytics', icon: BarChart3 },
  ];

  const adminNavItems = [
    { name: 'Admin Console', path: '/admin', icon: ShieldCheck },
    { name: 'Student Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'PYQ Question Bank', path: '/pyqs', icon: HelpCircle },
    { name: 'Practice Mode', path: '/practice', icon: PlayCircle },
    { name: 'PYQ Analytics', path: '/analytics', icon: BarChart3 },
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-sm shadow-brand-500/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
              StudyVault
            </span>
          </NavLink>
        </div>

        {/* User Academic Badge */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600/10 dark:bg-brand-400/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm">
            {user?.name?.substring(0, 2).toUpperCase() || 'SV'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {user?.name}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {isAdmin ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Administrator</span>
              ) : (
                `${user?.branch || 'CSE'} • Sem ${user?.semester || 1}`
              )}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{item.name}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
