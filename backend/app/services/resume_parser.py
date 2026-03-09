import re
import pdfplumber
from docx import Document
from typing import Dict, List, Optional
from app.models.schemas import (
    ParsedResumeData,
    Education,
    Experience,
    Project,
    Certification,
    SocialLinks,
)


class ResumeParser:
    def __init__(self):
        # spaCy support is optional for enhanced parsing
        self.nlp = None

    def parse_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n"
        return text

    def parse_docx(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        doc = Document(file_path)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text

    def extract_email(self, text: str) -> str:
        """Extract email address"""
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        matches = re.findall(email_pattern, text)
        return matches[0] if matches else ""

    def extract_phone(self, text: str) -> str:
        """Extract phone number"""
        phone_pattern = r'[\+\(]?[1-9][0-9 .\-\(\)]{8,}[0-9]'
        matches = re.findall(phone_pattern, text)
        return matches[0].strip() if matches else ""

    def extract_name(self, text: str) -> str:
        """Extract name (usually first line or using NLP)"""
        # First, try to find explicit "Name:" pattern
        name_patterns = [
            r'Name\s*:\s*([A-Z][a-z]+(?: [A-Z][a-z]+)+)',  # Name: FirstName LastName
            r'^([A-Z][a-z]+(?: [A-Z][a-z]+)+)\s*$',  # FirstName LastName on its own line
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, text, re.MULTILINE | re.IGNORECASE)
            if match:
                name = match.group(1).strip()
                # Make sure it's not a common header
                if name.lower() not in ['curriculum vitae', 'resume', 'cv']:
                    return name
        
        # Fallback: first line that looks like a name (2-4 capitalized words)
        lines = text.strip().split('\n')
        for line in lines[1:5]:  # Skip first line, check next 4 lines
            line = line.strip()
            if line and not re.search(r'@|http|www|curriculum|resume|vitae|address|phone|email', line.lower()):
                # Check if it looks like a name (2-4 words, each capitalized)
                words = line.split()
                if 2 <= len(words) <= 4 and all(w[0].isupper() for w in words if w):
                    return line
        
        return "Unknown"

    def extract_links(self, text: str) -> SocialLinks:
        """Extract social media and web links"""
        links = SocialLinks()
        
        # LinkedIn
        linkedin_pattern = r'linkedin\.com/in/[\w-]+'
        linkedin_match = re.search(linkedin_pattern, text, re.IGNORECASE)
        if linkedin_match:
            links.linkedin = "https://" + linkedin_match.group()
        
        # GitHub
        github_pattern = r'github\.com/[\w-]+'
        github_match = re.search(github_pattern, text, re.IGNORECASE)
        if github_match:
            links.github = "https://" + github_match.group()
        
        # Website
        website_pattern = r'https?://(?:www\.)?[\w\-\.]+\.[\w]{2,}'
        website_matches = re.findall(website_pattern, text)
        for match in website_matches:
            if 'linkedin' not in match and 'github' not in match:
                links.website = match
                break
        
        return links

    def extract_skills(self, text: str) -> List[str]:
        """Extract skills section"""
        skills = []
        
        # Common skill keywords
        skill_patterns = [
            r'Skills?\s*:?\s*(.+?)(?=\n\n|\n[A-Z]|$)',
            r'Technical Skills?\s*:?\s*(.+?)(?=\n\n|\n[A-Z]|$)',
            r'Technologies?\s*:?\s*(.+?)(?=\n\n|\n[A-Z]|$)',
        ]
        
        for pattern in skill_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                skills_text = match.group(1)
                # Split by common delimiters
                skills = re.split(r'[,;•\n]', skills_text)
                skills = [s.strip() for s in skills if s.strip()]
                break
        
        # If no skills section found, extract common tech keywords
        if not skills:
            common_skills = [
                'Python', 'JavaScript', 'Java', 'C++', 'React', 'Node.js',
                'SQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'TypeScript',
                'Angular', 'Vue', 'Django', 'Flask', 'FastAPI', 'HTML',
                'CSS', 'Machine Learning', 'Data Science', 'AI'
            ]
            for skill in common_skills:
                if re.search(r'\b' + re.escape(skill) + r'\b', text, re.IGNORECASE):
                    skills.append(skill)
        
        return list(set(skills))[:20]  # Limit to 20 unique skills

    def extract_summary(self, text: str) -> Optional[str]:
        """Extract profile summary / summary section if present."""

        summary_patterns = [
            r'(?:Profile\s+Summary|Summary)\s*\n(.+?)(?=\n\s*(?:Relevant\s+Coursework|Experience|Work|Projects?|Technical\s+Skill|Skills?|Education|Certifications?)\b|$)',
        ]

        for pattern in summary_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                summary_text = match.group(1)
                summary_text = re.sub(r'\s+', ' ', summary_text).strip()
                return summary_text or None

        return None

    def extract_coursework(self, text: str) -> List[str]:
        """Extract relevant coursework items (optional)."""

        coursework_pattern = r'Relevant\s+Coursework\s*\n(.+?)(?=\n\s*(?:Experience|Work|Projects?|Technical\s+Skill|Skills?|Education|Certifications?)\b|$)'
        match = re.search(coursework_pattern, text, re.IGNORECASE | re.DOTALL)
        if not match:
            return []

        block = match.group(1)
        block = block.replace('\u2022', ' ')
        block = re.sub(r'\s+', ' ', block).strip()

        # Coursework is often a space-separated list; split on double spaces / pipes / commas where possible.
        # Fallback: split on "  "-like separators by first normalizing common delimiters.
        candidates = re.split(r'\s{2,}|\||,|;|/|\u00b7', block)
        items = [c.strip() for c in candidates if c.strip()]

        # If the split didn't do much (single long string), attempt to split by title-cased phrases.
        if len(items) <= 1 and block:
            # Split on transitions that look like separate course names.
            items = [s.strip() for s in re.split(r'(?<=\w)\s+(?=[A-Z][a-z])', block) if s.strip()]

        # De-duplicate while preserving order
        seen = set()
        out: List[str] = []
        for it in items:
            key = it.lower()
            if key in seen:
                continue
            seen.add(key)
            out.append(it)

        return out[:25]

    def extract_certifications(self, text: str) -> List[Certification]:
        """Extract certifications section (optional)."""

        cert_pattern = r'Certifications?\s*\n(.+?)(?=\n\s*(?:Education|Experience|Projects?|Technical\s+Skill|Skills?)\b|$)'
        match = re.search(cert_pattern, text, re.IGNORECASE | re.DOTALL)
        if not match:
            return []

        block = match.group(1).strip()
        lines = [l.strip() for l in block.split('\n') if l.strip()]

        # Sometimes certifications are on one line separated by "Credential" markers.
        if len(lines) == 1:
            parts = re.split(r'\bCredential\b', lines[0], flags=re.IGNORECASE)
            lines = [p.strip(' -|\t') for p in parts if p.strip()]

        certs: List[Certification] = []
        for line in lines[:10]:
            # Try to parse "Title (Issuer)" style.
            issuer = ""
            name = line
            m = re.search(r'\(([^\)]+)\)', line)
            if m:
                issuer = m.group(1).strip()
                name = re.sub(r'\([^\)]+\)', '', line).strip(' -|')

            certs.append(Certification(name=name[:120], issuer=issuer[:120], year=""))

        return certs

    def extract_education(self, text: str) -> List[Education]:
        """Extract education information"""
        education_list = []
        
        # Find education section
        education_pattern = r'Education\s*:?\s*(.+?)(?=Experience|Work|Projects?|Skills?|$)'
        match = re.search(education_pattern, text, re.IGNORECASE | re.DOTALL)
        
        if match:
            edu_text = match.group(1)
            # Split by year patterns or bullet points
            entries = re.split(r'\n(?=\d{4}|[•\-\*])', edu_text)
            
            for entry in entries[:5]:  # Limit to 5 education entries
                entry = entry.strip()
                if not entry:
                    continue
                
                # Extract year
                year_match = re.search(r'(19|20)\d{2}', entry)
                year = year_match.group() if year_match else "Present"
                
                lines = entry.split('\n')
                degree = lines[0].strip() if lines else entry[:50]
                institution = lines[1].strip() if len(lines) > 1 else "Unknown"
                
                education_list.append(
                    Education(
                        degree=degree,
                        institution=institution,
                        year=year,
                    )
                )
        
        return education_list

    def extract_experience(self, text: str) -> List[Experience]:
        """Extract work experience"""
        experience_list = []
        
        # Find experience section
        exp_pattern = r'(?:Experience|Work History|Employment)\s*:?\s*(.+?)(?=Education|Projects?|Skills?|$)'
        match = re.search(exp_pattern, text, re.IGNORECASE | re.DOTALL)
        
        if match:
            exp_text = match.group(1)
            # Split by bullet points or job titles
            entries = re.split(r'\n(?=[•\-\*]|\d{4})', exp_text)
            
            for entry in entries[:10]:  # Limit to 10 experiences
                entry = entry.strip()
                if not entry or len(entry) < 20:
                    continue
                
                lines = [l.strip() for l in entry.split('\n') if l.strip()]
                if not lines:
                    continue
                
                title = lines[0]
                company = lines[1] if len(lines) > 1 else "Unknown Company"
                
                # Extract duration
                duration_match = re.search(
                    r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\s*[-–]\s*(?:Present|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}))',
                    entry,
                    re.IGNORECASE
                )
                duration = duration_match.group() if duration_match else "Unknown"
                
                description = ' '.join(lines[2:]) if len(lines) > 2 else entry
                
                experience_list.append(
                    Experience(
                        title=title,
                        company=company,
                        duration=duration,
                        description=description[:500],  # Limit description length
                    )
                )
        
        return experience_list

    def extract_projects(self, text: str) -> List[Project]:
        """Extract projects"""
        projects_list = []
        
        # Find projects section
        proj_pattern = r'Projects?\s*:?\s*(.+?)(?=Education|Experience|Skills?|Certifications?|$)'
        match = re.search(proj_pattern, text, re.IGNORECASE | re.DOTALL)
        
        if match:
            proj_text = match.group(1)
            entries = re.split(r'\n(?=[•\-\*])', proj_text)
            
            for entry in entries[:8]:  # Limit to 8 projects
                entry = entry.strip()
                if not entry or len(entry) < 20:
                    continue
                
                lines = [l.strip() for l in entry.split('\n') if l.strip()]
                if not lines:
                    continue
                
                name = lines[0]
                description = ' '.join(lines[1:]) if len(lines) > 1 else entry
                
                # Extract technologies
                tech_pattern = r'(?:Technologies?|Tech Stack|Built with)\s*:?\s*(.+?)(?=\n|$)'
                tech_match = re.search(tech_pattern, description, re.IGNORECASE)
                technologies = []
                if tech_match:
                    tech_text = tech_match.group(1)
                    technologies = [t.strip() for t in re.split(r'[,;]', tech_text)]
                
                projects_list.append(
                    Project(
                        name=name,
                        description=description[:300],
                        technologies=technologies[:5],
                    )
                )
        
        return projects_list

    def parse_resume(self, text: str) -> ParsedResumeData:
        """Main parsing function"""
        return ParsedResumeData(
            name=self.extract_name(text),
            email=self.extract_email(text),
            phone=self.extract_phone(text),
            summary=self.extract_summary(text),
            coursework=self.extract_coursework(text),
            education=self.extract_education(text),
            experience=self.extract_experience(text),
            skills=self.extract_skills(text),
            projects=self.extract_projects(text),
            certifications=self.extract_certifications(text),
            links=self.extract_links(text),
        )


# Singleton instance
resume_parser = ResumeParser()
