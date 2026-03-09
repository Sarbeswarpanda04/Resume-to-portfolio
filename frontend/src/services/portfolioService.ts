import api from './api';
import { ParsedResumeData } from './resumeService';

export interface Portfolio {
  id: string;
  name: string;
  templateId: string;
  data: ParsedResumeData;
  theme: PortfolioTheme;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  publishedUrl?: string;
}

export interface PortfolioTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  textColor?: string;
  fontSize?: number;
  fontFamily: string;
  sections: {
    about: boolean;
    education: boolean;
    experience: boolean;
    skills: boolean;
    projects: boolean;
    certifications: boolean;
    contact: boolean;
  };
}

export const createPortfolio = async (
  data: ParsedResumeData,
  templateId: string,
  name: string
): Promise<Portfolio> => {
  const response = await api.post('/api/portfolio/create', {
    data,
    templateId,
    name,
  });
  return response.data;
};

export const getPortfolios = async (): Promise<Portfolio[]> => {
  const response = await api.get('/api/portfolio/list');
  return response.data;
};

export const getPortfolio = async (id: string): Promise<Portfolio> => {
  const response = await api.get(`/api/portfolio/${id}`);
  return response.data;
};

export const updatePortfolio = async (
  id: string,
  updates: Partial<Portfolio>
): Promise<Portfolio> => {
  const response = await api.put(`/api/portfolio/${id}`, updates);
  return response.data;
};

export const deletePortfolio = async (id: string): Promise<void> => {
  await api.delete(`/api/portfolio/${id}`);
};

export const publishPortfolio = async (
  id: string,
  customUrl?: string
): Promise<{ url: string }> => {
  const response = await api.post(`/api/portfolio/${id}/publish`, {
    customUrl,
  });
  return response.data;
};

export const downloadPortfolio = async (
  id: string,
  format: 'react' | 'static'
): Promise<Blob> => {
  const response = await api.get(`/api/portfolio/${id}/download`, {
    params: { format },
    responseType: 'blob',
  });
  return response.data;
};
