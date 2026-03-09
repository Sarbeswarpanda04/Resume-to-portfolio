import api from './api';

export interface ParsedResumeData {
  name: string;
  title?: string;
  email: string;
  phone: string;
  location?: string;
  summary?: string;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    description?: string;
  }>;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  skills: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    year: string;
  }>;
  links: {
    linkedin?: string;
    github?: string;
    website?: string;
    twitter?: string;
  };
}

export interface GeminiOptimizeResponse {
  structuredData: any;
  parsedData: ParsedResumeData;
}

export const previewResumeSession = async (
  sessionId: string
): Promise<{ text: string; parsedData: ParsedResumeData }> => {
  const response = await api.post('/api/resume/preview-session', {
    sessionId,
    templateId: 'minimal-dev',
  });
  return response.data;
};

export const cleanupResumeSession = async (sessionId: string): Promise<{ ok: boolean }> => {
  const response = await api.post('/api/resume/cleanup-session', {
    sessionId,
    templateId: 'minimal-dev',
  });
  return response.data;
};

const parseFilenameFromContentDisposition = (value?: string): string | null => {
  if (!value) return null;
  // Handles: attachment; filename="abc.pdf" or filename=abc.pdf
  const match = value.match(/filename\*?=(?:UTF-8''|\")?([^;\"\n]+)\"?/i);
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
};

export const fetchResumeFileBlob = async (
  sessionId: string
): Promise<{ blob: Blob; contentType: string; fileName: string }> => {
  const response = await api.get(`/api/resume/file/${sessionId}`, {
    responseType: 'blob',
  });

  const contentType = (response.headers?.['content-type'] as string) || 'application/octet-stream';
  const fileNameFromHeader = parseFilenameFromContentDisposition(
    response.headers?.['content-disposition'] as string | undefined
  );

  const fallbackExt = contentType.includes('pdf')
    ? 'pdf'
    : contentType.includes('word')
    ? 'docx'
    : 'bin';

  return {
    blob: response.data as Blob,
    contentType,
    fileName: fileNameFromHeader || `resume.${fallbackExt}`,
  };
};

export const uploadResume = async (file: File): Promise<{ sessionId: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/api/resume/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const parseResume = async (sessionId: string, templateId?: string): Promise<ParsedResumeData> => {
  const response = await api.post('/api/resume/parse', { 
    sessionId,
    templateId: templateId || 'minimal-dev'
  });
  return response.data;
};

export const parseResumeText = async (text: string, templateId?: string): Promise<ParsedResumeData> => {
  const response = await api.post('/api/resume/parse-text', { 
    text,
    templateId: templateId || 'minimal-dev'
  });
  return response.data;
};

export const extractResumeText = async (sessionId: string): Promise<{ text: string }> => {
  const response = await api.post('/api/resume/extract-text', {
    sessionId,
    templateId: 'minimal-dev',
  });
  return response.data;
};

export const previewAndBasicParseResumeText = async (
  text: string
): Promise<{ text: string; parsedData: ParsedResumeData }> => {
  const response = await api.post('/api/resume/preview-text', {
    text,
    templateId: 'minimal-dev',
  });
  return response.data;
};

export const geminiOptimizeFromParsed = async (
  text: string,
  templateId: string,
  basicParsedData?: any
): Promise<GeminiOptimizeResponse> => {
  const response = await api.post('/api/resume/gemini-optimize', {
    text,
    templateId: templateId || 'minimal-dev',
    basicParsedData: basicParsedData || undefined,
  });
  return response.data;
};
