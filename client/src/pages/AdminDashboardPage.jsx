import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Layers,
  BookOpen,
  HelpCircle,
  FileText,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  Search,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  semesterAPI,
  subjectAPI,
  pyqAPI,
  resourceAPI,
  userAPI,
  analyticsAPI,
} from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import { DifficultyBadge, ImportantBadge } from '../components/Badge';
import { StatCardSkeleton, TableRowSkeleton } from '../components/SkeletonLoader';

const AdminDashboardPage = () => {
  // Tabs: 'overview' | 'semesters' | 'subjects' | 'pyqs' | 'resources' | 'users'
  const [activeTab, setActiveTab] = useState('overview');

  // Overview Stats
  const [stats, setStats] = useState({
    totalSemesters: 8,
    totalSubjects: 0,
    totalPYQs: 0,
    totalResources: 0,
    totalStudents: 0,
    mostPracticedSubject: 'DBMS',
  });

  // Entity Lists
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [pyqs, setPyqs] = useState([]);
  const [resources, setResources] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'semester' | 'subject' | 'pyq' | 'resource' | 'user'
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Delete Confirm Dialog State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // { type, id, name }

  const [isLoading, setIsLoading] = useState(true);
  const { success, error, warning } = useToast();

  // Load Platform Stats & Initial Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, semRes, subjRes, pyqRes, resRes, userRes] = await Promise.allSettled([
        analyticsAPI.getPlatformStats(),
        semesterAPI.getSemesters(),
        subjectAPI.getSubjects(),
        pyqAPI.getPYQs({ limit: 50 }),
        resourceAPI.getResources(),
        userAPI.getUsers(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data?.data) {
        setStats(statsRes.value.data.data);
      }
      if (semRes.status === 'fulfilled' && semRes.value.data?.data) {
        setSemesters(semRes.value.data.data);
      }
      if (subjRes.status === 'fulfilled' && subjRes.value.data?.data) {
        setSubjects(subjRes.value.data.data);
      }
      if (pyqRes.status === 'fulfilled' && pyqRes.value.data?.data) {
        setPyqs(pyqRes.value.data.data);
      }
      if (resRes.status === 'fulfilled' && resRes.value.data?.data) {
        setResources(resRes.value.data.data);
      }
      if (userRes.status === 'fulfilled' && userRes.value.data?.data) {
        setUsersList(userRes.value.data.data);
      }
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open Create/Edit Modal
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);

    if (item) {
      // Edit mode: populate formData
      if (type === 'semester') {
        setFormData({ number: item.number, name: item.name, branch: item.branch });
      } else if (type === 'subject') {
        setFormData({
          name: item.name,
          code: item.code,
          semester: item.semester,
          branch: item.branch,
          credits: item.credits,
          description: item.description || '',
        });
      } else if (type === 'pyq') {
        setFormData({
          question: item.question,
          subject: item.subject?._id || item.subject,
          semester: item.semester,
          unit: item.unit,
          topic: item.topic,
          year: item.year,
          marks: item.marks,
          difficulty: item.difficulty,
          frequency: item.frequency,
          important: item.important,
          solution: item.solution || '',
        });
      } else if (type === 'resource') {
        setFormData({
          title: item.title,
          description: item.description || '',
          type: item.type,
          subject: item.subject?._id || item.subject,
          unit: item.unit,
          url: item.url,
        });
      } else if (type === 'user') {
        setFormData({
          name: item.name,
          role: item.role,
          branch: item.branch,
          semester: item.semester,
        });
      }
    } else {
      // Create mode: defaults
      if (type === 'semester') {
        setFormData({ number: semesters.length + 1, name: `Semester ${semesters.length + 1}`, branch: 'CSE' });
      } else if (type === 'subject') {
        setFormData({ name: '', code: '', semester: 5, branch: 'CSE', credits: 4, description: '' });
      } else if (type === 'pyq') {
        setFormData({
          question: '',
          subject: subjects[0]?._id || '',
          semester: 5,
          unit: 1,
          topic: '',
          year: 2025,
          marks: 10,
          difficulty: 'Medium',
          frequency: 1,
          important: false,
          solution: '',
        });
      } else if (type === 'resource') {
        setFormData({
          title: '',
          description: '',
          type: 'Notes',
          subject: subjects[0]?._id || '',
          unit: 1,
          url: '',
        });
      }
    }
    setIsModalOpen(true);
  };

  // Submit Modal (Create or Update)
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'semester') {
        if (editingItem) {
          await semesterAPI.updateSemester(editingItem._id, formData);
          success('Semester updated successfully');
        } else {
          await semesterAPI.createSemester(formData);
          success('Semester created successfully');
        }
      } else if (modalType === 'subject') {
        if (editingItem) {
          await subjectAPI.updateSubject(editingItem._id, formData);
          success('Subject updated successfully');
        } else {
          await subjectAPI.createSubject(formData);
          success('Subject created successfully');
        }
      } else if (modalType === 'pyq') {
        if (editingItem) {
          await pyqAPI.updatePYQ(editingItem._id, formData);
          success('PYQ updated successfully');
        } else {
          await pyqAPI.createPYQ(formData);
          success('PYQ created successfully');
        }
      } else if (modalType === 'resource') {
        if (editingItem) {
          await resourceAPI.updateResource(editingItem._id, formData);
          success('Resource updated successfully');
        } else {
          await resourceAPI.createResource(formData);
          success('Resource created successfully');
        }
      } else if (modalType === 'user') {
        if (editingItem) {
          await userAPI.updateUser(editingItem._id, formData);
          success('User updated successfully');
        }
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Operation failed');
    }
  };

  // Delete flow with confirmation dialog
  const promptDelete = (type, id, name) => {
    setItemToDelete({ type, id, name });
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.type === 'semester') {
        await semesterAPI.deleteSemester(itemToDelete.id);
      } else if (itemToDelete.type === 'subject') {
        await subjectAPI.deleteSubject(itemToDelete.id);
      } else if (itemToDelete.type === 'pyq') {
        await pyqAPI.deletePYQ(itemToDelete.id);
      } else if (itemToDelete.type === 'resource') {
        await resourceAPI.deleteResource(itemToDelete.id);
      } else if (itemToDelete.type === 'user') {
        await userAPI.deleteUser(itemToDelete.id);
      }
      success(`${itemToDelete.type} deleted successfully`);
      setIsConfirmOpen(false);
      setItemToDelete(null);
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete item');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Dashboard Overview', icon: ShieldCheck },
    { id: 'semesters', label: `Semesters (${semesters.length})`, icon: Layers },
    { id: 'subjects', label: `Subjects (${subjects.length})`, icon: BookOpen },
    { id: 'pyqs', label: `PYQ Bank (${pyqs.length})`, icon: HelpCircle },
    { id: 'resources', label: `Resources (${resources.length})`, icon: FileText },
    { id: 'users', label: `Users (${usersList.length})`, icon: Users },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Control Console</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Platform Management & Operations
          </h2>
        </div>

        {activeTab !== 'overview' && activeTab !== 'users' && (
          <button
            onClick={() => openModal(activeTab.slice(0, -1))} // e.g. 'subjects' -> 'subject'
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New {activeTab.slice(0, -1).toUpperCase()}</span>
          </button>
        )}
      </div>

      {/* Admin Tabs */}
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

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="academic-card p-6">
              <div className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">
                {stats.totalStudents}
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                Registered Students
              </div>
            </div>
            <div className="academic-card p-6">
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {stats.totalSubjects}
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                Active Subjects
              </div>
            </div>
            <div className="academic-card p-6">
              <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                {stats.totalPYQs}
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                Total PYQs Stored
              </div>
            </div>
            <div className="academic-card p-6">
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {stats.totalResources}
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                Notes & Resources
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="academic-card p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Most Practiced Subject
              </h3>
              <div className="text-xl font-bold text-brand-600 dark:text-brand-400">
                {stats.mostPracticedSubject || 'Database Management Systems'}
              </div>
              <p className="text-xs text-slate-500">
                Determined by aggregate student practice attempts and test completions.
              </p>
            </div>

            <div className="academic-card p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Platform Security & Roles
              </h3>
              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <p>• Admin authorization strictly enforced on all mutating REST endpoints.</p>
                <p>• Passwords securely hashed with bcrypt (salt rounds: 10).</p>
                <p>• Safe deletion guards prevent self-deletion of the active admin account.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SEMESTERS */}
      {activeTab === 'semesters' && (
        <div className="academic-card p-6 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Sem #</th>
                  <th className="pb-3 font-semibold">Name</th>
                  <th className="pb-3 font-semibold">Branch</th>
                  <th className="pb-3 font-semibold">Subjects</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {semesters.map((sem) => (
                  <tr key={sem._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-bold text-brand-600 dark:text-brand-400">
                      Sem {sem.number}
                    </td>
                    <td className="py-3 font-medium text-slate-900 dark:text-white">{sem.name}</td>
                    <td className="py-3 text-slate-500">{sem.branch}</td>
                    <td className="py-3 text-slate-500">{sem.subjectCount || 0} Subjects</td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        onClick={() => openModal('semester', sem)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => promptDelete('semester', sem._id, sem.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SUBJECTS */}
      {activeTab === 'subjects' && (
        <div className="academic-card p-6 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Code</th>
                  <th className="pb-3 font-semibold">Subject Name</th>
                  <th className="pb-3 font-semibold">Sem</th>
                  <th className="pb-3 font-semibold">Credits</th>
                  <th className="pb-3 font-semibold">Units</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {subjects.map((subj) => (
                  <tr key={subj._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-bold text-brand-600 dark:text-brand-400">
                      {subj.code}
                    </td>
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">
                      {subj.name}
                    </td>
                    <td className="py-3 text-slate-500">Sem {subj.semester}</td>
                    <td className="py-3 text-slate-500">{subj.credits} Credits</td>
                    <td className="py-3 text-slate-500">{subj.units?.length || 0} Units</td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        onClick={() => openModal('subject', subj)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => promptDelete('subject', subj._id, subj.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PYQS */}
      {activeTab === 'pyqs' && (
        <div className="academic-card p-6 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Question</th>
                  <th className="pb-3 font-semibold">Subject</th>
                  <th className="pb-3 font-semibold">Unit & Year</th>
                  <th className="pb-3 font-semibold">Difficulty</th>
                  <th className="pb-3 font-semibold">Important</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pyqs.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 max-w-sm truncate font-medium text-slate-900 dark:text-white">
                      {q.question}
                    </td>
                    <td className="py-3 text-slate-500">{q.subject?.name || 'DBMS'}</td>
                    <td className="py-3 text-slate-500">
                      Unit {q.unit} • {q.year}
                    </td>
                    <td className="py-3">
                      <DifficultyBadge difficulty={q.difficulty} />
                    </td>
                    <td className="py-3">
                      {q.important ? <ImportantBadge /> : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        onClick={() => openModal('pyq', q)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => promptDelete('pyq', q._id, q.question)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: RESOURCES */}
      {activeTab === 'resources' && (
        <div className="academic-card p-6 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Title</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Subject</th>
                  <th className="pb-3 font-semibold">Unit</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {resources.map((res) => (
                  <tr key={res._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-medium text-slate-900 dark:text-white max-w-sm truncate">
                      {res.title}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                        {res.type}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">{res.subject?.name || 'DBMS'}</td>
                    <td className="py-3 text-slate-500">Unit {res.unit}</td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        onClick={() => openModal('resource', res)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => promptDelete('resource', res._id, res.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: USERS */}
      {activeTab === 'users' && (
        <div className="academic-card p-6 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Name</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Branch & Sem</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-bold text-slate-900 dark:text-white">{u.name}</td>
                    <td className="py-3 text-slate-500">{u.email}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                          u.role === 'admin'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">
                      {u.branch} • Sem {u.semester}
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        onClick={() => openModal('user', u)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => promptDelete('user', u._id, u.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${editingItem ? 'Edit' : 'Create New'} ${modalType.toUpperCase()}`}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* SEMESTER FORM */}
          {modalType === 'semester' && (
            <>
              <div>
                <label className="block font-bold uppercase text-slate-500 mb-1">Semester Number</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  required
                  value={formData.number || ''}
                  onChange={(e) => setFormData({ ...formData, number: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-slate-500 mb-1">Semester Name</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-slate-500 mb-1">Branch</label>
                <input
                  type="text"
                  value={formData.branch || 'CSE'}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                />
              </div>
            </>
          )}

          {/* SUBJECT FORM */}
          {modalType === 'subject' && (
            <>
              <div>
                <label className="block font-bold uppercase text-slate-500 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Database Management Systems"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. CS501"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">Semester</label>
                  <select
                    value={formData.semester || 5}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={formData.credits || 4}
                    onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">Branch</label>
                  <input
                    type="text"
                    value={formData.branch || 'CSE'}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold uppercase text-slate-500 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Overview of curriculum..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                />
              </div>
            </>
          )}

          {/* PYQ FORM */}
          {modalType === 'pyq' && (
            <>
              <div>
                <label className="block font-bold uppercase text-slate-500 mb-1">Question Text</label>
                <textarea
                  rows="3"
                  required
                  value={formData.question || ''}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="State the university exam question..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">Subject</label>
                  <select
                    value={formData.subject || ''}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  >
                    {subjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.code} — {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">Unit</label>
                  <select
                    value={formData.unit || 1}
                    onChange={(e) => setFormData({ ...formData, unit: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  >
                    {[1, 2, 3, 4, 5].map((u) => (
                      <option key={u} value={u}>
                        Unit {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">Topic</label>
                  <input
                    type="text"
                    required
                    value={formData.topic || ''}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g. Normalization"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">Year</label>
                  <input
                    type="number"
                    required
                    value={formData.year || 2025}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">Marks</label>
                  <input
                    type="number"
                    value={formData.marks || 10}
                    onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty || 'Medium'}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">
                    Frequency (Times Asked)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.frequency || 1}
                    onChange={(e) => setFormData({ ...formData, frequency: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modalImportant"
                  checked={Boolean(formData.important)}
                  onChange={(e) => setFormData({ ...formData, important: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-600"
                />
                <label htmlFor="modalImportant" className="font-semibold text-slate-700 dark:text-slate-300">
                  Mark as High-Yield / Important Question
                </label>
              </div>
              <div>
                <label className="block font-bold uppercase text-slate-500 mb-1">Model Solution</label>
                <textarea
                  rows="4"
                  value={formData.solution || ''}
                  onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                  placeholder="Detailed answer or marking key..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                />
              </div>
            </>
          )}

          {/* RESOURCE FORM */}
          {modalType === 'resource' && (
            <>
              <div>
                <label className="block font-bold uppercase text-slate-500 mb-1">Resource Title</label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Unit 3 Normalization Solved Sheet"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">Subject</label>
                  <select
                    value={formData.subject || ''}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  >
                    {subjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.code} — {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">Type</label>
                  <select
                    value={formData.type || 'Notes'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  >
                    <option value="Notes">Notes</option>
                    <option value="PYQ">PYQ Compilation</option>
                    <option value="Syllabus">Syllabus</option>
                    <option value="Reference">Reference</option>
                    <option value="Practice">Practice Sheet</option>
                    <option value="Video">Video Link</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">Unit</label>
                  <select
                    value={formData.unit || 1}
                    onChange={(e) => setFormData({ ...formData, unit: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  >
                    {[1, 2, 3, 4, 5].map((u) => (
                      <option key={u} value={u}>
                        Unit {u}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">URL / Link</label>
                  <input
                    type="url"
                    required
                    value={formData.url || ''}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold uppercase text-slate-500 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of this material..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                />
              </div>
            </>
          )}

          {/* USER FORM */}
          {modalType === 'user' && (
            <>
              <div>
                <label className="block font-bold uppercase text-slate-500 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">Role</label>
                  <select
                    value={formData.role || 'student'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">Branch</label>
                  <input
                    type="text"
                    value={formData.branch || 'CSE'}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">Semester</label>
                  <select
                    value={formData.semester || 1}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Sem {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title={`Delete ${itemToDelete?.type?.toUpperCase()}`}
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default AdminDashboardPage;
