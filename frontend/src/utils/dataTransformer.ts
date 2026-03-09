/**
 * Transform portfolio data from backend format to template-specific format
 */

export const getDefaultTheme = () => ({
  primaryColor: '#0ea5e9',
  secondaryColor: '#64748b',
  fontFamily: 'Inter',
  sections: {
    about: true,
    education: true,
    experience: true,
    skills: true,
    projects: true,
    certifications: true,
    contact: true,
  },
});

export const transformPortfolioData = (portfolioData: any, templateId: string): any => {
  const baseData = {
    name: portfolioData.name || '',
    title: portfolioData.title || portfolioData.role || '',
    role: portfolioData.title || portfolioData.role || '',
    email: portfolioData.email || '',
    phone: portfolioData.phone || '',
    summary: portfolioData.summary || portfolioData.about || '',
    about: portfolioData.summary || portfolioData.about || '',
    tagline: portfolioData.tagline || portfolioData.summary || '',
    location: portfolioData.location || '',
    coursework: portfolioData.coursework || portfolioData.relevantCoursework || [],
  };

  // Transform experience
  const experience = (portfolioData.experience || []).map((exp: any) => ({
    title: exp.title || exp.role || '',
    role: exp.title || exp.role || '',
    company: exp.company || '',
    duration: exp.duration || '',
    startDate: exp.startDate || '',
    endDate: exp.endDate || '',
    current: exp.current || false,
    description: exp.description || '',
    responsibilities: exp.responsibilities || [exp.description].filter(Boolean),
    achievements: exp.achievements || [],
  }));

  const rawSkills = portfolioData.skills || [];

  // Transform projects
  const projects = (portfolioData.projects || []).map((proj: any) => ({
    name: proj.name || proj.title || '',
    description: proj.description || '',
    techStack: proj.technologies || proj.techStack || [],
    technologies: proj.technologies || proj.techStack || [],
    github: proj.github || proj.githubUrl || '',
    live: proj.link || proj.liveUrl || proj.demo || '',
    link: proj.link || proj.liveUrl || proj.demo || '',
    image: proj.image || '',
    category: proj.category || '',
  }));

  // Transform education
  const education = (portfolioData.education || []).map((edu: any) => ({
    degree: edu.degree || '',
    institution: edu.institution || edu.school || '',
    year: edu.year || '',
    specialization: edu.specialization || '',
    gpa: edu.gpa || '',
  }));

  // Social links
  const socialLinks = portfolioData.links || portfolioData.socialLinks || {};

  // Template-specific transformations
  switch (templateId) {
    case 'student-academic':
      // Flatten categorized skills to simple array
      const studentSkills = Array.isArray(rawSkills) && rawSkills.length > 0 && typeof rawSkills[0] === 'object' && rawSkills[0].category
        ? rawSkills.flatMap((cat: any) => cat.skills || [])
        : rawSkills;
      
      return {
        ...baseData,
        degree: education[0]?.degree || '',
        institution: education[0]?.institution || '',
        academicYear: education[0]?.year || '',
        gpa: education[0]?.gpa || '',
        coreStrengths: portfolioData.coreStrengths || [],
        education,
        experience,
        skills: studentSkills,
        projects,
        certifications: portfolioData.certifications || [],
        socialLinks,
        resume: portfolioData.resume || '',
      };

    case 'corporate-professional':
      // Transform skills to corporate format with progress bars
      const corporateSkills = Array.isArray(rawSkills) && rawSkills.length > 0 && typeof rawSkills[0] === 'object' && rawSkills[0].category
        ? rawSkills.map((cat: any) => ({
            category: cat.category,
            skills: (cat.skills || []).map((skill: any) => 
              typeof skill === 'string' 
                ? { name: skill, level: 75, proficiency: 'Advanced' }
                : skill
            )
          }))
        : [{ category: 'Skills', skills: rawSkills.map((s: string) => ({ name: s, level: 75, proficiency: 'Advanced' })) }];
      
      return {
        ...baseData,
        industry: portfolioData.industry || '',
        department: portfolioData.department || '',
        coreStrengths: portfolioData.coreStrengths || [],
        metrics: portfolioData.metrics || [],
        experience,
        skills: corporateSkills,
        projects,
        education,
        certifications: portfolioData.certifications || [],
        socialLinks,
        resume: portfolioData.resume || '',
      };

    case 'creative-designer':
      // Flatten categorized skills to simple array
      const creativeSkills = Array.isArray(rawSkills) && rawSkills.length > 0 && typeof rawSkills[0] === 'object' && rawSkills[0].category
        ? rawSkills.flatMap((cat: any) => cat.skills || [])
        : rawSkills;
      
      return {
        ...baseData,
        bio: portfolioData.bio || portfolioData.summary || '',
        portfolioItems: projects,
        testimonials: portfolioData.testimonials || [],
        experience,
        skills: creativeSkills,
        education,
        certifications: portfolioData.certifications || [],
        links: {
          ...socialLinks,
          instagram: socialLinks.instagram || '',
          behance: socialLinks.behance || '',
          dribbble: socialLinks.dribbble || '',
        },
        resume: portfolioData.resume || '',
      };

    case 'dark-modern':
      // Keep categorized skills structure for dark-modern (expects SkillCategory[])
      const darkModernSkills = Array.isArray(rawSkills) && rawSkills.length > 0 && typeof rawSkills[0] === 'object' && rawSkills[0].category
        ? rawSkills
        : [{ category: 'Technical Skills', skills: rawSkills }];
      
      return {
        ...baseData,
        techFocus: portfolioData.techFocus || [],
        skills: darkModernSkills,
        projects,
        experience,
        education,
        certifications: portfolioData.certifications || [],
        socialLinks,
        resume: portfolioData.resume || '',
      };

    case 'one-page-scroll':
      // Flatten categorized skills to simple array
      const scrollSkills = Array.isArray(rawSkills) && rawSkills.length > 0 && typeof rawSkills[0] === 'object' && rawSkills[0].category
        ? rawSkills.flatMap((cat: any) => cat.skills || [])
        : rawSkills;
      
      return {
        ...baseData,
        skills: scrollSkills,
        projects,
        experience,
        education,
        certifications: portfolioData.certifications || [],
        links: socialLinks,
        resume: portfolioData.resume || '',
      };

    case 'minimal-dev':
    default:
      // Flatten categorized skills to simple array for minimal-dev template
      const flatSkills = Array.isArray(rawSkills) && rawSkills.length > 0 && typeof rawSkills[0] === 'object' && rawSkills[0].category
        ? rawSkills.flatMap((cat: any) => cat.skills || [])
        : rawSkills;
      
      return {
        ...baseData,
        skills: flatSkills,
        experience,
        projects,
        education,
        links: socialLinks,
        resume: portfolioData.resume || '',
      };
  }
};
