import api from './api';

export const submitRating = async (portfolioId: string, rating: number) => {
  const response = await api.post('/api/ratings', {
    portfolioId,
    rating,
  });
  return response.data;
};
