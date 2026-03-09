import axios from './api';

export interface Statistics {
  activeUsers: number;
  portfoliosCreated: number;
  successRate: number;
  userRating: number;
}

export const getStatistics = async (): Promise<Statistics> => {
  const response = await axios.get('/api/statistics');
  return response.data;
};
