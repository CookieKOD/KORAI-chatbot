import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API = axios.create({ baseURL: 'http://localhost:8000/api' });  // Changez pour prod

API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  login: (user) => API.post('/auth/login', user),
  signup: (user) => API.post('/auth/signup', user),
};

export const chatAPI = {
  sendMessage: (message) => API.post('/chat', { question: message }),
};

export const imageAPI = {
  analyze: (formData) => API.post('/analyze_image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const reportAPI = {
  generate: (data) => API.post('/generate_report', data),
  getReports: () => API.get('/reports'),  // Ajoutez endpoint si besoin
};

export default API;