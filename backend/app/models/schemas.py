from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    firebase_uid: str


class UserCreate(UserBase):
    pass


class User(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class Education(BaseModel):
    degree: str
    institution: str
    year: str
    description: Optional[str] = None


class Experience(BaseModel):
    title: str
    company: str
    duration: str
    description: str


class Project(BaseModel):
    name: str
    description: str
    technologies: List[str]
    link: Optional[str] = None


class Certification(BaseModel):
    name: str
    issuer: str
    year: str


class SocialLinks(BaseModel):
    linkedin: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None
    twitter: Optional[str] = None


class ParsedResumeData(BaseModel):
    name: str
    title: Optional[str] = None
    email: str
    phone: str
    location: Optional[str] = None
    summary: Optional[str] = None
    coursework: Optional[List[str]] = []
    education: List[Education]
    experience: List[Experience]
    skills: List[str]
    projects: List[Project]
    certifications: Optional[List[Certification]] = []
    links: SocialLinks


class ResumeUploadResponse(BaseModel):
    sessionId: str
    message: str


class ResumeParseRequest(BaseModel):
    sessionId: str
    templateId: Optional[str] = "minimal-dev"


class ResumeTextParseRequest(BaseModel):
    text: str
    templateId: Optional[str] = "minimal-dev"


class ResumeExtractTextResponse(BaseModel):
    text: str


class ResumePreviewResponse(BaseModel):
    text: str
    parsedData: ParsedResumeData


class ResumeGeminiOptimizeRequest(BaseModel):
    text: str
    templateId: Optional[str] = "minimal-dev"
    # Optional: basic parser output used as a starting point for Gemini refinement
    basicParsedData: Optional[Dict[str, Any]] = None


class ResumeGeminiOptimizeResponse(BaseModel):
    # Rich, template-optimized structure (may include metrics, categorized skills, etc.)
    structuredData: Dict[str, Any]
    # A strict, backwards-compatible shape used for portfolio creation/storage
    parsedData: ParsedResumeData


class PortfolioTheme(BaseModel):
    primaryColor: str = "#0ea5e9"
    secondaryColor: str = "#64748b"
    fontFamily: str = "Inter"
    sections: Optional[Dict[str, bool]] = None

    class Config:
        # Allow extra fields and use defaults if not provided
        extra = "allow"


class PortfolioBase(BaseModel):
    name: str
    templateId: str
    data: ParsedResumeData
    theme: Optional[PortfolioTheme] = None

    class Config:
        extra = "allow"


class PortfolioCreate(PortfolioBase):
    pass


class Portfolio(PortfolioBase):
    id: str
    userId: str
    published: bool = False
    publishedUrl: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True


class PortfolioUpdate(BaseModel):
    name: Optional[str] = None
    templateId: Optional[str] = None
    data: Optional[ParsedResumeData] = None
    theme: Optional[PortfolioTheme] = None

class PublishRequest(BaseModel):
    customUrl: Optional[str] = None

class PublishResponse(BaseModel):
    url: str
    message: str
