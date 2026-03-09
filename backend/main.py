from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import resume, portfolio, auth, billing
from app.routers import statistics, ratings
from app.core.config import settings

app = FastAPI(
    title="Resume to Portfolio API",
    description="Backend API for Resume to Portfolio Generator",
    version="1.0.0",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(resume.router, prefix="/api/resume", tags=["Resume"])
app.include_router(portfolio.router, prefix="/api/portfolio", tags=["Portfolio"])
app.include_router(billing.router, prefix="/api/billing", tags=["Billing"])
app.include_router(statistics.router, prefix="/api", tags=["Statistics"])
app.include_router(ratings.router, prefix="/api", tags=["Ratings"])


@app.get("/")
async def root():
    return {
        "message": "Resume to Portfolio API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
