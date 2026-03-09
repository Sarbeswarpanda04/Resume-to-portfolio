import os
import json
import warnings
from typing import Dict, Any, Optional, List

# Keep local runs clean. The Gemini SDK emits a FutureWarning on import.
warnings.simplefilter("ignore", FutureWarning)

import google.generativeai as genai
from app.models.schemas import ParsedResumeData
from app.core.config import settings

class AIResumeParser:
    """
    AI-powered resume parser that intelligently extracts and structures data
    according to the selected template requirements using Google Gemini
    """
    
    def __init__(self):
        # Prefer real environment variables, but fall back to settings (.env)
        self.api_key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
    
    def get_template_requirements(self, template_id: str) -> str:
        """Get specific data requirements for each template"""
        requirements = {
            "minimal-dev": """
                Focus on: Technical skills, programming languages, frameworks, GitHub projects
                Categorize skills into: Languages, Frameworks, Tools
                Extract: Clean project descriptions, tech stack, GitHub links
                Emphasize: Code quality, open source contributions
            """,
            "student-academic": """
                Focus on: Academic achievements, GPA, coursework, academic projects
                Extract: Education details with GPA, relevant coursework, certifications
                Emphasize: Academic honors, research projects, university activities
                Include: Graduation year, degree specialization
            """,
            "creative-designer": """
                Focus on: Design tools, portfolio projects, creative work
                Extract: Visual projects, design software expertise, creative achievements
                Emphasize: Awards, featured work, design philosophy
                Include: Behance/Dribbble links, design-focused description
            """,
            "corporate-professional": """
                Focus on: Professional achievements, metrics, business impact
                Extract: Years of experience, quantifiable results, leadership roles
                Emphasize: Revenue impact, team size, cost savings, efficiency improvements
                Include: Professional certifications, industry expertise, KPIs
                Generate: Achievement metrics (e.g., "50+ projects delivered", "10+ years experience")
            """,
            "dark-modern": """
                Focus on: Modern tech stack, AI/ML expertise, cutting-edge technologies
                Extract: Latest technologies, technical innovations, tech leadership
                Emphasize: Modern frameworks, cloud platforms, DevOps, AI/ML
                Include: Technical blog, conference talks, tech community involvement
            """,
            "one-page-scroll": """
                Focus on: Concise summary, key highlights, most important achievements
                Extract: Top 3-5 experiences, key skills, standout projects
                Emphasize: Brevity, impact, memorable achievements
                Keep: Only essential information for one-page format
            """
        }
        return requirements.get(template_id, "Extract comprehensive professional information")
    
    def parse_with_ai(
        self,
        raw_text: str,
        template_id: str,
        basic_parsed_data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Use Gemini AI to intelligently parse resume and structure data
        according to template requirements
        """
        template_requirements = self.get_template_requirements(template_id)

        basic_context = ""
        if basic_parsed_data:
            # Keep this compact but readable; Gemini uses it as a grounding signal.
            try:
                basic_context = (
                    "\nBASIC EXTRACTED JSON (from a non-AI parser; may be incomplete):\n"
                    + json.dumps(basic_parsed_data, ensure_ascii=False, indent=2)
                    + "\n"
                )
            except Exception:
                basic_context = "\nBASIC EXTRACTED JSON (unavailable due to serialization error)\n"
        
        prompt = f"""You are an expert resume parser. Analyze the following resume text and extract structured information.

TEMPLATE TYPE: {template_id}
SPECIFIC REQUIREMENTS: {template_requirements}
{basic_context}

RESUME TEXT:
{raw_text}

Extract and structure the following information in JSON format:

{{
    "name": "Full name",
    "email": "Email address",
    "phone": "Phone number",
    "location": "City, Country",
    "title": "Professional title/role",
    "summary": "Professional summary (2-3 sentences)",
    "tagline": "Short tagline for hero section",
    
    "skills": [
        {{
            "category": "Programming Languages",
            "skills": ["Python", "JavaScript", "Java"]
        }},
        {{
            "category": "Frameworks & Libraries", 
            "skills": ["React", "Node.js", "Django"]
        }},
        {{
            "category": "Tools & Technologies",
            "skills": ["Git", "Docker", "AWS"]
        }}
    ],
    
    "experience": [
        {{
            "title": "Job title",
            "company": "Company name",
            "duration": "Jan 2020 - Present",
            "startDate": "2020-01",
            "endDate": "Present",
            "current": true,
            "description": "Brief description",
            "responsibilities": ["Key responsibility 1", "Key responsibility 2"],
            "achievements": ["Achievement with metrics 1", "Achievement with metrics 2"]
        }}
    ],
    
    "education": [
        {{
            "degree": "Bachelor of Science in Computer Science",
            "institution": "University Name",
            "year": "2015-2019",
            "specialization": "Software Engineering",
            "gpa": "3.8/4.0"
        }}
    ],
    
    "projects": [
        {{
            "name": "Project name",
            "description": "Clear, concise description",
            "technologies": ["Tech1", "Tech2"],
            "github": "GitHub URL",
            "link": "Live demo URL",
            "category": "Web Development"
        }}
    ],
    
    "certifications": [
        {{
            "name": "Certification name",
            "issuer": "Issuing organization",
            "date": "2023"
        }}
    ],
    
    "links": {{
        "linkedin": "LinkedIn URL",
        "github": "GitHub URL",
        "website": "Personal website URL",
        "twitter": "Twitter URL",
        "portfolio": "Portfolio URL"
    }},
    
    "metrics": [
        {{
            "label": "Years Experience",
            "value": "5+"
        }},
        {{
            "label": "Projects Completed",
            "value": "50+"
        }},
        {{
            "label": "Client Satisfaction",
            "value": "100%"
        }}
    ],
    
    "coreStrengths": ["Strength 1", "Strength 2", "Strength 3"],
    "techFocus": ["AI/ML", "Cloud Computing", "Web Development"]
}}

IMPORTANT INSTRUCTIONS:
1. Extract accurate information from the resume text
2. If BASIC EXTRACTED JSON is provided, use it as a starting point and refine it
3. Do NOT invent facts (companies, dates, degrees, numbers) that are not supported by the resume text or the basic JSON
4. Your output MUST be more structured and more complete than the BASIC EXTRACTED JSON:
    - Normalize fields (title, location, links)
    - Categorize skills (by category) when appropriate
    - Split experience into concise responsibilities/achievements when possible
    - Generate a strong, concise summary and tagline
    - Keep only relevant items for one-page template
5. For missing fields, use empty strings or arrays, not null
6. Categorize skills intelligently based on the template type
4. For corporate template: Generate impressive metrics from experience
5. For student template: Emphasize academic achievements and GPA
6. For creative template: Focus on design tools and portfolio
7. Ensure all URLs are complete and valid
8. Make descriptions concise and impactful
9. Extract or infer professional title from experience or summary
10. Return ONLY valid JSON, no additional text or markdown

Parse the resume now:"""

        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,
                    max_output_tokens=4000,
                )
            )
            
            response_text = response.text
            
            # Extract JSON from response (in case AI adds markdown formatting)
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            json_text = response_text[json_start:json_end]
            
            parsed_data = json.loads(json_text)
            return parsed_data
            
        except Exception as e:
            print(f"AI parsing error: {str(e)}")
            # Fallback to basic parsing if AI fails
            raise Exception(f"AI parsing failed: {str(e)}")

    def coerce_to_parsed_resume_data_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert rich Gemini output into the strict ParsedResumeData shape."""

        def _as_str(value: Any) -> str:
            if value is None:
                return ""
            if isinstance(value, (int, float)):
                return str(value)
            return str(value).strip()

        def _ensure_list(value: Any) -> List[Any]:
            return value if isinstance(value, list) else []

        # Skills: allow either List[str] or List[{category, skills: [...] }]
        raw_skills = data.get("skills", [])
        skills_flat: List[str] = []
        if isinstance(raw_skills, list) and raw_skills and isinstance(raw_skills[0], dict) and raw_skills[0].get("category"):
            for cat in raw_skills:
                for s in _ensure_list(cat.get("skills")):
                    if isinstance(s, str):
                        skills_flat.append(s.strip())
                    elif isinstance(s, dict) and s.get("name"):
                        skills_flat.append(_as_str(s.get("name")))
        elif isinstance(raw_skills, list):
            for s in raw_skills:
                if isinstance(s, str):
                    skills_flat.append(s.strip())
                elif isinstance(s, dict) and s.get("name"):
                    skills_flat.append(_as_str(s.get("name")))

        skills_flat = [s for s in skills_flat if s]

        # Experience: map rich entries to the strict model
        experience_out: List[Dict[str, Any]] = []
        for exp in _ensure_list(data.get("experience")):
            if not isinstance(exp, dict):
                continue
            description = _as_str(exp.get("description"))
            if not description:
                responsibilities = [
                    _as_str(r) for r in _ensure_list(exp.get("responsibilities")) if _as_str(r)
                ]
                description = "; ".join(responsibilities)
            experience_out.append(
                {
                    "title": _as_str(exp.get("title") or exp.get("role")),
                    "company": _as_str(exp.get("company")),
                    "duration": _as_str(exp.get("duration") or ""),
                    "description": description,
                }
            )

        # Education
        education_out: List[Dict[str, Any]] = []
        for edu in _ensure_list(data.get("education")):
            if not isinstance(edu, dict):
                continue
            education_out.append(
                {
                    "degree": _as_str(edu.get("degree")),
                    "institution": _as_str(edu.get("institution") or edu.get("school")),
                    "year": _as_str(edu.get("year")),
                    "description": _as_str(edu.get("description")) or None,
                }
            )

        # Projects
        projects_out: List[Dict[str, Any]] = []
        for proj in _ensure_list(data.get("projects")):
            if not isinstance(proj, dict):
                continue
            technologies = proj.get("technologies") or proj.get("techStack") or []
            tech_list: List[str] = []
            if isinstance(technologies, list):
                tech_list = [t.strip() for t in technologies if isinstance(t, str) and t.strip()]
            link = _as_str(proj.get("link") or proj.get("live") or proj.get("demo") or proj.get("github"))
            projects_out.append(
                {
                    "name": _as_str(proj.get("name") or proj.get("title")),
                    "description": _as_str(proj.get("description")),
                    "technologies": tech_list,
                    "link": link or None,
                }
            )

        # Certifications
        certs_out: List[Dict[str, Any]] = []
        for cert in _ensure_list(data.get("certifications")):
            if not isinstance(cert, dict):
                continue
            certs_out.append(
                {
                    "name": _as_str(cert.get("name")),
                    "issuer": _as_str(cert.get("issuer")),
                    "year": _as_str(cert.get("year") or cert.get("date")),
                }
            )

        # Coursework (optional)
        coursework_out: List[str] = []
        for item in _ensure_list(data.get("coursework") or data.get("relevantCoursework")):
            if isinstance(item, str) and item.strip():
                coursework_out.append(item.strip())

        links = data.get("links") if isinstance(data.get("links"), dict) else {}

        coerced: Dict[str, Any] = {
            "name": _as_str(data.get("name")),
            "email": _as_str(data.get("email")),
            "phone": _as_str(data.get("phone")),
            "summary": _as_str(data.get("summary")) or None,
            "coursework": coursework_out,
            "education": education_out,
            "experience": experience_out,
            "skills": skills_flat,
            "projects": projects_out,
            "certifications": certs_out,
            "links": {
                "linkedin": _as_str(links.get("linkedin")) or None,
                "github": _as_str(links.get("github")) or None,
                "website": _as_str(links.get("website")) or None,
                "twitter": _as_str(links.get("twitter")) or None,
            },
        }

        # Make sure the dict actually satisfies ParsedResumeData.
        # If it doesn't, let the exception bubble up to the caller.
        ParsedResumeData(**coerced)
        return coerced
    
    def enhance_data_for_template(self, data: Dict[str, Any], template_id: str) -> Dict[str, Any]:
        """
        Post-process AI-extracted data to ensure it meets template-specific requirements
        """
        enhanced_data = data.copy()
        
        # Template-specific enhancements
        if template_id == "corporate-professional":
            # Ensure metrics exist
            if not enhanced_data.get("metrics"):
                enhanced_data["metrics"] = self._generate_metrics_from_experience(
                    enhanced_data.get("experience", [])
                )
        
        elif template_id == "student-academic":
            # Ensure GPA is present in education
            for edu in enhanced_data.get("education", []):
                if not edu.get("gpa"):
                    edu["gpa"] = "N/A"
        
        elif template_id == "dark-modern":
            # Ensure techFocus exists
            if not enhanced_data.get("techFocus"):
                enhanced_data["techFocus"] = self._extract_tech_focus(
                    enhanced_data.get("skills", [])
                )
        
        return enhanced_data
    
    def _generate_metrics_from_experience(self, experience: list) -> list:
        """Generate professional metrics from experience data"""
        metrics = []
        
        # Calculate years of experience
        if experience:
            total_years = len(experience) * 2  # Rough estimate
            metrics.append({"label": "Years Experience", "value": f"{total_years}+"})
        
        # Add generic impressive metrics
        metrics.extend([
            {"label": "Projects Delivered", "value": "50+"},
            {"label": "Client Satisfaction", "value": "98%"},
            {"label": "Teams Led", "value": "5+"}
        ])
        
        return metrics
    
    def _extract_tech_focus(self, skills: list) -> list:
        """Extract tech focus areas from skills"""
        focus_areas = []
        
        for skill_category in skills:
            if isinstance(skill_category, dict):
                category = skill_category.get("category", "")
                if "AI" in category or "ML" in category or "Machine" in category:
                    focus_areas.append("AI/ML")
                elif "Cloud" in category or "AWS" in category or "Azure" in category:
                    focus_areas.append("Cloud Computing")
                elif "Web" in category or "Frontend" in category or "Backend" in category:
                    focus_areas.append("Web Development")
        
        return focus_areas[:3] if focus_areas else ["Software Development", "Technology", "Innovation"]
