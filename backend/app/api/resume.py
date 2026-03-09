from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
from typing import Dict
import os
import uuid
import aiofiles
from datetime import datetime
import glob
from app.models.schemas import (
    ParsedResumeData,
    ResumeUploadResponse,
    ResumeParseRequest,
    ResumeTextParseRequest,
    ResumeExtractTextResponse,
    ResumePreviewResponse,
    ResumeGeminiOptimizeRequest,
    ResumeGeminiOptimizeResponse,
)
from app.services.resume_parser import resume_parser
from app.services.ai_parser import AIResumeParser
from app.core.security import get_current_user
from app.core.config import settings
from app.services import firebase_db

router = APIRouter()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.TEMP_DIR, exist_ok=True)

# Temporary storage for uploaded files
file_sessions: Dict[str, str] = {}


def _guess_media_type(file_path: str) -> str:
    ext = file_path.split('.')[-1].lower()
    if ext == 'pdf':
        return 'application/pdf'
    if ext == 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    if ext == 'doc':
        return 'application/msword'
    return 'application/octet-stream'


def _resolve_session_file_path(session_id: str) -> str | None:
    """Resolve a session file path.

    Uvicorn reload / server restarts clear in-memory state, but the file may still exist on disk.
    This helper rehydrates the mapping by looking for `{session_id}.*` inside TEMP_DIR.
    """

    existing = file_sessions.get(session_id)
    if existing and os.path.exists(existing):
        return existing

    pattern = os.path.join(settings.TEMP_DIR, f"{session_id}.*")
    candidates = [p for p in glob.glob(pattern) if os.path.isfile(p)]
    if not candidates:
        return None

    # Prefer known resume extensions
    preferred_exts = {'.pdf': 0, '.docx': 1, '.doc': 2}
    candidates.sort(key=lambda p: preferred_exts.get(os.path.splitext(p)[1].lower(), 99))
    resolved = candidates[0]
    file_sessions[session_id] = resolved
    return resolved


@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """Upload resume file (PDF or DOCX)"""
    
    # Validate file type
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    file_ext = file.filename.split('.')[-1].lower()
    if file_ext not in ['pdf', 'docx', 'doc']:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only PDF and DOCX files are supported.",
        )
    
    # Generate session ID
    session_id = str(uuid.uuid4())
    
    # Save file temporarily
    file_path = os.path.join(settings.TEMP_DIR, f"{session_id}.{file_ext}")
    
    try:
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Store file path with session ID
        file_sessions[session_id] = file_path
        
        return ResumeUploadResponse(
            sessionId=session_id,
            message="File uploaded successfully",
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")


@router.get("/file/{session_id}")
async def get_uploaded_file(
    session_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Download the original uploaded file for preview (auth required)."""

    file_path = _resolve_session_file_path(session_id)
    if not file_path:
        raise HTTPException(status_code=404, detail="Session not found")

    return FileResponse(
        path=file_path,
        media_type=_guess_media_type(file_path),
        filename=os.path.basename(file_path),
    )


@router.post("/preview-session", response_model=ResumePreviewResponse)
async def preview_and_basic_parse_session(
    request: ResumeParseRequest,
    current_user: dict = Depends(get_current_user),
):
    """Return extracted text + basic parsed data for an uploaded file session (does not delete the file)."""

    file_path = _resolve_session_file_path(request.sessionId)
    if not file_path:
        raise HTTPException(status_code=404, detail="Session not found")

    try:
        file_ext = file_path.split('.')[-1].lower()
        if file_ext == 'pdf':
            text = resume_parser.parse_pdf(file_path)
        elif file_ext in ['docx', 'doc']:
            text = resume_parser.parse_docx(file_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")

        if not text or len(text) < 50:
            raise HTTPException(status_code=400, detail="Extracted text is too short")

        parsed_data = resume_parser.parse_resume(text)
        return ResumePreviewResponse(text=text, parsedData=parsed_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to preview resume: {str(e)}")


@router.post("/cleanup-session")
async def cleanup_resume_session(
    request: ResumeParseRequest,
    current_user: dict = Depends(get_current_user),
):
    """Delete the temp file for a session and remove it from memory."""

    file_path = _resolve_session_file_path(request.sessionId)
    if not file_path:
        return {"ok": True}

    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    finally:
        try:
            del file_sessions[request.sessionId]
        except Exception:
            pass

    return {"ok": True}


@router.post("/parse", response_model=ParsedResumeData)
async def parse_resume_file(
    request: ResumeParseRequest,
    current_user: dict = Depends(get_current_user),
):
    """Parse uploaded resume file using AI"""

    file_path = _resolve_session_file_path(request.sessionId)
    if not file_path:
        raise HTTPException(status_code=404, detail="Session not found")
    
    try:
        # Extract text based on file type
        file_ext = file_path.split('.')[-1].lower()
        
        if file_ext == 'pdf':
            text = resume_parser.parse_pdf(file_path)
        elif file_ext in ['docx', 'doc']:
            text = resume_parser.parse_docx(file_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")
        
        # Try AI parsing first
        try:
            ai_parser = AIResumeParser()
            template_id = request.templateId if hasattr(request, 'templateId') else 'minimal-dev'
            ai_data = ai_parser.parse_with_ai(text, template_id)
            enhanced_data = ai_parser.enhance_data_for_template(ai_data, template_id)

            # Convert to strict ParsedResumeData model (Gemini may return richer structures)
            parsed_dict = ai_parser.coerce_to_parsed_resume_data_dict(enhanced_data)
            parsed_data = ParsedResumeData(**parsed_dict)
        except Exception as ai_error:
            print(f"AI parsing failed, falling back to basic parser: {str(ai_error)}")
            # Fallback to basic parsing
            parsed_data = resume_parser.parse_resume(text)
        
        # Store resume in Firebase
        try:
            resume_id = f"resume_{uuid.uuid4().hex[:12]}"
            resume_record = {
                "id": resume_id,
                "userId": current_user["user_id"],
                "fileName": os.path.basename(file_path),
                "parsedData": parsed_data.dict(),
                "uploadedAt": datetime.utcnow(),
            }
            firebase_db.create_resume(resume_id, resume_record)
        except Exception as store_error:
            print(f"Failed to store resume in database: {str(store_error)}")
        
        # Clean up: delete temporary file
        try:
            os.remove(file_path)
            del file_sessions[request.sessionId]
        except:
            pass
        
        return parsed_data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")


@router.post("/extract-text", response_model=ResumeExtractTextResponse)
async def extract_text_from_upload(
    request: ResumeParseRequest,
    current_user: dict = Depends(get_current_user),
):
    """Extract raw text from an uploaded resume (by sessionId)."""

    file_path = _resolve_session_file_path(request.sessionId)
    if not file_path:
        raise HTTPException(status_code=404, detail="Session not found")

    try:
        file_ext = file_path.split('.')[-1].lower()
        if file_ext == 'pdf':
            text = resume_parser.parse_pdf(file_path)
        elif file_ext in ['docx', 'doc']:
            text = resume_parser.parse_docx(file_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")

        # Cleanup: once text is extracted, we no longer need the temp file
        try:
            os.remove(file_path)
            del file_sessions[request.sessionId]
        except:
            pass

        return ResumeExtractTextResponse(text=text)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract text: {str(e)}")


@router.post("/preview-text", response_model=ResumePreviewResponse)
async def preview_and_basic_parse_text(
    request: ResumeTextParseRequest,
    current_user: dict = Depends(get_current_user),
):
    """Return document preview text + basic parsed data (no Gemini)."""

    if not request.text or len(request.text) < 50:
        raise HTTPException(status_code=400, detail="Resume text is too short or empty")

    try:
        parsed_data = resume_parser.parse_resume(request.text)
        return ResumePreviewResponse(text=request.text, parsedData=parsed_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")


@router.post("/gemini-optimize", response_model=ResumeGeminiOptimizeResponse)
async def gemini_optimize_from_basic_parse(
    request: ResumeGeminiOptimizeRequest,
    current_user: dict = Depends(get_current_user),
):
    """Use Gemini to refine/structure already-parsed JSON for the selected template."""

    if not request.text or len(request.text) < 50:
        raise HTTPException(status_code=400, detail="Resume text is too short or empty")

    try:
        try:
            ai_parser = AIResumeParser()
            structured = ai_parser.parse_with_ai(
                request.text,
                request.templateId,
                basic_parsed_data=request.basicParsedData,
            )
            structured = ai_parser.enhance_data_for_template(structured, request.templateId)
            parsed_dict = ai_parser.coerce_to_parsed_resume_data_dict(structured)
            parsed_data = ParsedResumeData(**parsed_dict)
            return ResumeGeminiOptimizeResponse(structuredData=structured, parsedData=parsed_data)
        except Exception as ai_error:
            print(f"Gemini optimize failed, falling back to basic parser: {str(ai_error)}")
            parsed_data = resume_parser.parse_resume(request.text)
            return ResumeGeminiOptimizeResponse(
                structuredData=parsed_data.dict(),
                parsedData=parsed_data,
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to optimize resume: {str(e)}")


@router.post("/parse-text", response_model=ParsedResumeData)
async def parse_resume_text(
    request: ResumeTextParseRequest,
    current_user: dict = Depends(get_current_user),
):
    """Parse resume from text input using AI"""
    
    if not request.text or len(request.text) < 50:
        raise HTTPException(
            status_code=400,
            detail="Resume text is too short or empty",
        )
    
    try:
        # Try AI parsing first
        try:
            ai_parser = AIResumeParser()
            ai_data = ai_parser.parse_with_ai(request.text, request.templateId)
            enhanced_data = ai_parser.enhance_data_for_template(ai_data, request.templateId)

            # Convert to strict ParsedResumeData model (Gemini may return richer structures)
            parsed_dict = ai_parser.coerce_to_parsed_resume_data_dict(enhanced_data)
            parsed_data = ParsedResumeData(**parsed_dict)
        except Exception as ai_error:
            print(f"AI parsing failed, falling back to basic parser: {str(ai_error)}")
            # Fallback to basic parsing
            parsed_data = resume_parser.parse_resume(request.text)
        
        # Store resume in Firebase
        try:
            resume_id = f"resume_{uuid.uuid4().hex[:12]}"
            resume_record = {
                "id": resume_id,
                "userId": current_user["user_id"],
                "fileName": "text_input",
                "parsedData": parsed_data.dict(),
                "uploadedAt": datetime.utcnow(),
            }
            firebase_db.create_resume(resume_id, resume_record)
        except Exception as store_error:
            print(f"Failed to store resume in database: {str(store_error)}")
        
        return parsed_data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")
