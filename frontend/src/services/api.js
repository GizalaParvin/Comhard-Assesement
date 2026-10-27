import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization header if token exists
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taskflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle unauthorized responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired/invalid, but only redirect if currently logged in
      if (localStorage.getItem('taskflow_token')) {
        localStorage.removeItem('taskflow_token');
        localStorage.removeItem('taskflow_user');
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authService = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getMe: () => API.get('/auth/me'),
};

// Task endpoints
export const taskService = {
  getTasks: (params) => API.get('/tasks', { params }),
  getTaskById: (id) => API.get(`/tasks/${id}`),
  createTask: (taskData) => API.post('/tasks', taskData),
  updateTask: (id, taskData) => API.put(`/tasks/${id}`, taskData),
  updateTaskStatus: (id, status) => API.patch(`/tasks/${id}/status`, { status }),
  deleteTask: (id) => API.delete(`/tasks/${id}`),
};

// Section endpoints
export const sectionService = {
  getSections: () => API.get('/sections'),
  createSection: (data) => API.post('/sections', data),
  renameSection: (id, data) => API.put(`/sections/${id}`, data),
  deleteSection: (id) => API.delete(`/sections/${id}`),
};

export default API;
