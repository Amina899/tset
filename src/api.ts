import axios from 'axios';
import { DashboardStats } from './types';

const API_BASE_URL = 'http://127.0.0.1:8000'; 
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await axios.get<DashboardStats>(`${API_BASE_URL}/api/dashboard/`);
  return response.data;
};
