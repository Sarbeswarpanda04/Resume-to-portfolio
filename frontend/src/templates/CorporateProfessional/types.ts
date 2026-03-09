export interface PortfolioData {
  name: string;
  title: string;
  industry?: string;
  department?: string;
  location?: string;
  email: string;
  phone?: string;
  summary: string;
  coursework?: string[];
  coreStrengths?: string[];
  photo?: string;
  
  metrics?: Metric[];
  experience: Experience[];
  skills: SkillCategory[];
  projects?: Project[];
  education: Education[];

  certifications?: Certification[];
  
  socialLinks?: SocialLinks;
  resume?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies?: string[];
  github?: string;
  link?: string;
}

export interface Certification {
  name: string;
  issuer?: string;
  year?: string;
  link?: string;
}

export interface Metric {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon?: string;
}

export interface Experience {
  title: string;
  company: string;
  duration: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  responsibilities: string[];
  achievements?: string[];
}

export interface SkillCategory {
  category: string;
  skills: Skill[];
}

export interface Skill {
  name: string;
  level?: number; // 0-100 for progress bar
  proficiency?: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  specialization?: string;
  gpa?: string;
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  twitter?: string;
  email?: string;
  phone?: string;
}

export interface ThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
  sections?: Record<string, boolean>;
}

export interface ComponentProps {
  data: PortfolioData;
  activeSection?: string;
}
