export interface PortfolioData {
  name: string;
  role: string;
  tagline: string;
  email: string;
  phone?: string;
  about: string;
  coursework?: string[];
  techFocus?: string[];
  
  skills: SkillCategory[];
  projects: Project[];
  experience: Experience[];

  education?: Education[];
  certifications?: Certification[];
  
  socialLinks?: SocialLinks;
  resume?: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  description?: string;
}

export interface Certification {
  name: string;
  issuer?: string;
  year?: string;
  link?: string;
}

export interface SkillCategory {
  category: string;
  skills: string[];
  icon?: string;
}

export interface Project {
  name: string;
  description: string;
  techStack: string[];
  github?: string;
  live?: string;
  image?: string;
}

export interface Experience {
  role: string;
  company: string;
  duration: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  achievements: string[];
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  email?: string;
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
