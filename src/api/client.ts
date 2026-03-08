import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://a855-35-212-160-75.ngrok-free.app',
});

export interface Settings {
  ignoreSites: string[];
  unavailableSites: string[];
  ignoreTitles: string[];
  maxSalary?: number | null;
  nowResume: number;
}

export interface Job {
  _id: string;
  jobId: string;
  title: string;
  company: string;
  location: string;
  posted: string;
  salary: string;
  remote: boolean;
  applyLink: string;
  summary: string;
  coreResponsibilities: string[];
  skillSummaries: string[];
  mustHave: string[];
  preferredHave: string[];
  skill: string[];
  resumePath?: string;
  coverPath?: string;
  resumeStatus?: 'none' | 'in_progress' | 'done' | 'failed';
  status?: 'new' | 'applied';
  opened?: boolean;
  openedAt?: string;
  appliedAt?: string;
  dateOfJobAdded: string;
  dateOfResumeAdded?: string;
}

export async function fetchSettings() {
  const res = await api.get<Settings>('/settings');
  return res.data;
}

export async function updateSettings(payload: Partial<Settings>) {
  const res = await api.put<Settings>('/settings', payload);
  return res.data;
}

export async function fetchJobs() {
  const res = await api.get<Job[]>('/jobs');
  return res.data;
}

export async function openNextJobs() {
  const res = await api.post<{ jobs: Job[] }>('/jobs/open-next', {});
  return res.data.jobs;
}

// --------- authentication helpers ---------

type AuthResponse = { token: string };

export async function login(email: string, password: string) {
  const res = await api.post<AuthResponse>('/auth/login', { email, password });
  return res.data;
}

export async function signup(email: string, password: string) {
  const res = await api.post<AuthResponse>('/auth/signup', { email, password });
  return res.data;
}

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('authToken', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('authToken');
  }
}

// initialize axios with existing token if present
const existingToken = localStorage.getItem('authToken');
if (existingToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${existingToken}`;
}

// global response interceptor to catch unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // remove token and redirect to login
      setAuthToken(null);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

