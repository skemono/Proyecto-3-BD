import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Reports API
export const reportsApi = {
  // Member Progress Report
  getMemberProgress: (filters) => api.post('/reportes/progreso', filters),
  exportMemberProgressCsv: (filters) => {
    const queryParams = new URLSearchParams(filters).toString();
    window.location.href = `${API_URL}/reportes/progreso/export_csv?${queryParams}`;
  },

  // Session Frequency Report
  getSessionFrequency: (filters) => api.post('/reportes/sesiones', filters),
  
  // Popular Exercises Report
  getPopularExercises: (filters) => api.post('/reportes/ejercicios', filters),
  
  // Trainer Workload Report
  getTrainerWorkload: (filters) => api.post('/reportes/entrenadores', filters),
  
  // Membership Trends Report
  getMembershipTrends: (filters) => api.post('/reportes/membresias', filters),

  // Dashboard summary data
  getDashboardStats: () => api.get('/reportes/dashboard')
};

export default api;
