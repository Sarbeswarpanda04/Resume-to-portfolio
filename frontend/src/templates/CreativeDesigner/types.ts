export interface PortfolioData {
  name: string;
  title?: string;
  role?: string;
  tagline?: string;
  email?: string;
  phone?: string;
  summary?: string;
  bio?: string;
  coursework?: string[];
  skills?: string[];
  experience?: Experience[];
  projects?: Project[];
  education?: Education[];
  certifications?: Certification[];
  portfolioItems?: PortfolioItem[];
  testimonials?: Testimonial[];
  links?: SocialLinks;
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
  category?: string;
  technologies?: string[];
  image?: string;
  images?: string[];
  github?: string;
  link?: string;
  behance?: string;
  dribbble?: string;
}

export interface PortfolioItem {
  title: string;
  category: string;
  description: string;
  image: string;
  images?: string[];
  tools?: string[];
  link?: string;
  behance?: string;
  dribbble?: string;
}

export interface Testimonial {
  name: string;
  role: string;
  company?: string;
  content: string;
  avatar?: string;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  behance?: string;
  dribbble?: string;
}

export interface ThemeConfig {
  primaryColor: string;
  accentColor?: string;
  fontFamily?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  textColor?: string;
  fontSize?: number;
  sections: {
    about?: boolean;
    skills?: boolean;
    projects?: boolean;
    experience?: boolean;
    education?: boolean;
    certifications?: boolean;
    testimonials?: boolean;
    contact?: boolean;
  };
}

export interface ComponentProps {
  data: PortfolioData;
  theme: ThemeConfig;
}
