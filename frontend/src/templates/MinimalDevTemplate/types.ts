export interface PortfolioData {
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  coursework?: string[];
  skills?: string[];
  experience?: Experience[];
  projects?: Project[];
  education?: Education[];
  certifications?: Certification[];
  links?: SocialLinks;
}

export interface Experience {
  title: string;
  company: string;
  duration: string;
  description: string;
  responsibilities?: string[];
}

export interface Project {
  name: string;
  description: string;
  technologies?: string[];
  github?: string;
  link?: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  description?: string;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

export interface Certification {
  name: string;
  issuer?: string;
  year?: string;
  link?: string;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
  sections: {
    about?: boolean;
    skills?: boolean;
    projects?: boolean;
    experience?: boolean;
    education?: boolean;
    certifications?: boolean;
    contact?: boolean;
  };
}

export interface ComponentProps {
  data: PortfolioData;
  theme: ThemeConfig;
}
