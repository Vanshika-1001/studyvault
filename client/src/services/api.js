import axios from 'axios';

const getBaseURL = () => {
  let url = import.meta.env.VITE_API_URL || '/api';
  url = url.trim().replace(/\/+$/, '');
  // If user provided origin URL without /api (e.g. https://studyvault-f2cw.onrender.com), ensure /api is appended
  if (url.startsWith('http') && !url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('studyvault_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle session expiry / errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If 401 and token exists, clear expired token
      if (localStorage.getItem('studyvault_token')) {
        localStorage.removeItem('studyvault_token');
        localStorage.removeItem('studyvault_user');
        // Only redirect if not already on login/register page
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Semester endpoints
export const semesterAPI = {
  getSemesters: () => api.get('/semesters'),
  getSemesterByNumber: (num) => api.get(`/semesters/${num}`),
  createSemester: (data) => api.post('/semesters', data),
  updateSemester: (id, data) => api.put(`/semesters/id/${id}`, data),
  deleteSemester: (id) => api.delete(`/semesters/id/${id}`),
};

// Subject endpoints
export const subjectAPI = {
  getSubjects: (params) => api.get('/subjects', { params }),
  getSubjectById: (id) => api.get(`/subjects/${id}`),
  createSubject: (data) => api.post('/subjects', data),
  updateSubject: (id, data) => api.put(`/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/subjects/${id}`),
};

// PYQ endpoints
export const pyqAPI = {
  getPYQs: (params) => api.get('/pyqs', { params }),
  getPYQById: (id) => api.get(`/pyqs/${id}`),
  createPYQ: (data) => api.post('/pyqs', data),
  updatePYQ: (id, data) => api.put(`/pyqs/${id}`, data),
  deletePYQ: (id) => api.delete(`/pyqs/${id}`),
};

// Resource endpoints
export const resourceAPI = {
  getResources: (params) => api.get('/resources', { params }),
  getResourceById: (id) => api.get(`/resources/${id}`),
  createResource: (data) => api.post('/resources', data),
  updateResource: (id, data) => api.put(`/resources/${id}`, data),
  deleteResource: (id) => api.delete(`/resources/${id}`),
};

// Practice endpoints
export const practiceAPI = {
  generate: (data) => api.post('/practice/generate', data),
  submit: (data) => api.post('/practice/submit', data),
  getHistory: () => api.get('/practice/history'),
};

// Bookmark endpoints
export const bookmarkAPI = {
  getBookmarks: () => api.get('/bookmarks'),
  toggle: (data) => api.post('/bookmarks/toggle', data),
  remove: (itemId) => api.delete(`/bookmarks/${itemId}`),
};

// Analytics endpoints
export const analyticsAPI = {
  getPYQAnalytics: (params) => api.get('/analytics/pyq', { params }),
  getPlatformStats: () => api.get('/analytics/platform'),
};

// User management endpoints (Admin)
export const userAPI = {
  getUsers: (params) => api.get('/users', { params }),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export default api;
