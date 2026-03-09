from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse, StreamingResponse
from typing import List
import os
import json
import shutil
import zipfile
import io
from datetime import datetime
from app.models.schemas import (
    Portfolio,
    PortfolioCreate,
    PortfolioUpdate,
    PublishRequest,
    PublishResponse,
)
from app.core.security import get_current_user
from app.core.config import settings
from app.services import firebase_db

router = APIRouter()

# Ensure directories exist
os.makedirs(settings.PORTFOLIO_BUILD_DIR, exist_ok=True)


@router.post("/create", response_model=Portfolio)
async def create_portfolio(
    portfolio_data: PortfolioCreate,
    current_user: dict = Depends(get_current_user),
):
    """Create a new portfolio"""

    user_id = current_user["user_id"]

    # Enforce plan limits (Free: 2 portfolios, Premium: unlimited)
    user_profile = firebase_db.get_user(user_id) or {}
    is_premium = user_profile.get('plan') == 'premium' or bool(user_profile.get('isPremium'))
    if not is_premium:
        existing = firebase_db.get_portfolios_by_user(user_id)
        if len(existing) >= 2:
            raise HTTPException(
                status_code=403,
                detail="Free plan allows only 2 portfolios. Upgrade to Premium for unlimited portfolios.",
            )
    
    # Generate unique portfolio ID
    import uuid
    portfolio_id = f"portfolio_{uuid.uuid4().hex[:12]}"
    
    # Create default theme if not provided
    if portfolio_data.theme is None:
        from app.models.schemas import PortfolioTheme
        portfolio_data.theme = PortfolioTheme()
    
    portfolio_dict = {
        "id": portfolio_id,
        "userId": user_id,
        "name": portfolio_data.name,
        "templateId": portfolio_data.templateId,
        "data": portfolio_data.data.dict(),
        "theme": portfolio_data.theme.dict() if portfolio_data.theme else None,
        "published": False,
        "publishedUrl": None,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
    }
    
    firebase_db.create_portfolio(portfolio_id, portfolio_dict)
    
    portfolio = Portfolio(**portfolio_dict)
    return portfolio


@router.get("/list", response_model=List[Portfolio])
async def list_portfolios(current_user: dict = Depends(get_current_user)):
    """Get all portfolios for the current user"""
    
    portfolios = firebase_db.get_portfolios_by_user(current_user["user_id"])
    return [Portfolio(**p) for p in portfolios]


@router.get("/{portfolio_id}", response_model=Portfolio)
async def get_portfolio(
    portfolio_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get a specific portfolio"""
    
    portfolio_dict = firebase_db.get_portfolio(portfolio_id)
    
    if not portfolio_dict:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Check ownership
    if portfolio_dict.get("userId") != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return Portfolio(**portfolio_dict)


@router.get("/public/{portfolio_slug}", response_model=Portfolio)
async def get_public_portfolio(portfolio_slug: str):
    """Get a published portfolio by slug (public access, no auth required)"""
    
    portfolio_dict = firebase_db.get_portfolio_by_published_url(portfolio_slug)
    
    if not portfolio_dict:
        raise HTTPException(status_code=404, detail="Published portfolio not found")
    
    return Portfolio(**portfolio_dict)


@router.put("/{portfolio_id}", response_model=Portfolio)
async def update_portfolio(
    portfolio_id: str,
    updates: PortfolioUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update a portfolio"""
    
    portfolio_dict = firebase_db.get_portfolio(portfolio_id)
    
    if not portfolio_dict:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Check ownership
    if portfolio_dict.get("userId") != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Build updates dict
    update_data = {"updatedAt": datetime.utcnow()}
    
    if updates.name is not None:
        update_data["name"] = updates.name
    if updates.templateId is not None:
        update_data["templateId"] = updates.templateId
    if updates.data is not None:
        update_data["data"] = updates.data.dict()
    if updates.theme is not None:
        update_data["theme"] = updates.theme.dict()
    
    updated_portfolio = firebase_db.update_portfolio(portfolio_id, update_data)
    
    if not updated_portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    return Portfolio(**updated_portfolio)


@router.delete("/{portfolio_id}")
async def delete_portfolio(
    portfolio_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a portfolio"""
    
    portfolio_dict = firebase_db.get_portfolio(portfolio_id)
    
    if not portfolio_dict:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Check ownership
    if portfolio_dict.get("userId") != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    firebase_db.delete_portfolio(portfolio_id)
    
    return {"message": "Portfolio deleted successfully"}


@router.post("/{portfolio_id}/publish", response_model=PublishResponse)
async def publish_portfolio(
    portfolio_id: str,
    publish_data: PublishRequest,
    current_user: dict = Depends(get_current_user),
):
    """Publish a portfolio with custom URL"""
    
    portfolio_dict = firebase_db.get_portfolio(portfolio_id)
    
    if not portfolio_dict:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Check ownership
    if portfolio_dict.get("userId") != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Generate published URL
    if publish_data.customUrl:
        # Use the custom URL from the modal
        url_slug = publish_data.customUrl
    else:
        # Generate default from portfolio name
        url_slug = portfolio_dict["name"].lower().replace(' ', '-')
    
    # Store as a relative path so it works across environments/ports.
    # The frontend will prefix with the current origin when opening the link.
    published_url = f"/Portfolio/{url_slug}"
    
    # Update portfolio
    update_data = {
        "published": True,
        "publishedUrl": published_url,
        "updatedAt": datetime.utcnow()
    }
    
    firebase_db.update_portfolio(portfolio_id, update_data)
    
    # In production: Build and deploy static files here
    
    return PublishResponse(
        url=published_url,
        message="Portfolio published successfully",
    )


@router.get("/{portfolio_id}/download")
async def download_portfolio(
    portfolio_id: str,
    format: str = "react",
    current_user: dict = Depends(get_current_user),
):
    """Download portfolio source code"""
    
    portfolio_dict = firebase_db.get_portfolio(portfolio_id)
    
    if not portfolio_dict:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Check ownership
    if portfolio_dict.get("userId") != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    portfolio = Portfolio(**portfolio_dict)
    
    if format not in ["react", "static"]:
        raise HTTPException(status_code=400, detail="Invalid format")
    
    # Create zip file in memory
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        if format == "react":
            # Generate React portfolio files
            
            # package.json
            package_json = {
                "name": portfolio.name.lower().replace(' ', '-'),
                "version": "1.0.0",
                "private": True,
                "dependencies": {
                    "react": "^18.2.0",
                    "react-dom": "^18.2.0",
                    "react-scripts": "5.0.1"
                },
                "scripts": {
                    "start": "react-scripts start",
                    "build": "react-scripts build",
                    "test": "react-scripts test",
                    "eject": "react-scripts eject"
                }
            }
            zip_file.writestr("package.json", json.dumps(package_json, indent=2))
            
            # README.md
            readme = f"""# {portfolio.name}

## Portfolio Website

This is a React-based portfolio website generated from your resume.

### Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Build for production:
   ```bash
   npm run build
   ```

### Template
Template ID: {portfolio.templateId}

### Generated
{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC
"""
            zip_file.writestr("README.md", readme)
            
            # public/index.html
            index_html = f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="{portfolio.theme.primaryColor}" />
    <meta name="description" content="{portfolio.data.name} - Portfolio" />
    <title>{portfolio.name}</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
"""
            zip_file.writestr("public/index.html", index_html)
            
            # src/App.js
            app_js = f"""import React from 'react';
import './App.css';

function App() {{
  const portfolio = {json.dumps(portfolio.model_dump(mode='json'), indent=2, default=str)};
  
  return (
    <div className="App" style={{{{ fontFamily: '{portfolio.theme.fontFamily}' }}}}>
      <header style={{{{ backgroundColor: '{portfolio.theme.primaryColor}', color: 'white', padding: '60px 20px', textAlign: 'center' }}}}>
        <h1>{portfolio.data.name}</h1>
        <p>{portfolio.data.email}</p>
      </header>
      
      <main style={{{{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}}}>
        {{portfolio.theme.sections.about && portfolio.data.summary && (
          <section style={{{{ marginBottom: '40px' }}}}>
            <h2 style={{{{ color: '{portfolio.theme.primaryColor}' }}}}>About</h2>
            <p>{portfolio.data.summary}</p>
          </section>
        )}}
        
        {{portfolio.theme.sections.experience && (
          <section style={{{{ marginBottom: '40px' }}}}>
            <h2 style={{{{ color: '{portfolio.theme.primaryColor}' }}}}>Experience</h2>
            {{portfolio.data.experience.map((exp, i) => (
              <div key={{i}} style={{{{ marginBottom: '20px', borderLeft: `3px solid {portfolio.theme.primaryColor}`, paddingLeft: '20px' }}}}>
                <h3>{{exp.title}}</h3>
                <p>{{exp.company}} • {{exp.duration}}</p>
                <p>{{exp.description}}</p>
              </div>
            ))}}
          </section>
        )}}
        
        {{portfolio.theme.sections.skills && (
          <section style={{{{ marginBottom: '40px' }}}}>
            <h2 style={{{{ color: '{portfolio.theme.primaryColor}' }}}}>Skills</h2>
            <div style={{{{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}}}>
              {{portfolio.data.skills.map((skill, i) => (
                <span key={{i}} style={{{{ padding: '8px 16px', backgroundColor: '#f3f4f6', borderRadius: '20px' }}}}>
                  {{skill}}
                </span>
              ))}}
            </div>
          </section>
        )}}
      </main>
      
      <footer style={{{{ backgroundColor: '#1f2937', color: 'white', padding: '20px', textAlign: 'center' }}}}>
        <p>© {{new Date().getFullYear()}} {portfolio.data.name}. All rights reserved.</p>
      </footer>
    </div>
  );
}}

export default App;
"""
            zip_file.writestr("src/App.js", app_js)
            
            # src/index.js
            index_js = """import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
"""
            zip_file.writestr("src/index.js", index_js)
            
            # src/App.css
            app_css = """* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.App {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

h1, h2, h3 {
  margin-bottom: 10px;
}

p {
  line-height: 1.6;
  color: #4b5563;
}
"""
            zip_file.writestr("src/App.css", app_css)
            
            # src/index.css
            index_css = """body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
"""
            zip_file.writestr("src/index.css", index_css)
            
        else:  # static HTML
            # Generate static HTML portfolio
            html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{portfolio.data.name} - Portfolio">
    <title>{portfolio.name}</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: '{portfolio.theme.fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            line-height: 1.6;
            color: #333;
        }}
        
        header {{
            background: {portfolio.theme.primaryColor};
            color: white;
            padding: 60px 20px;
            text-align: center;
        }}
        
        header h1 {{
            font-size: 2.5em;
            margin-bottom: 10px;
        }}
        
        main {{
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
        }}
        
        section {{
            margin-bottom: 50px;
        }}
        
        h2 {{
            color: {portfolio.theme.primaryColor};
            font-size: 2em;
            margin-bottom: 20px;
            border-bottom: 3px solid {portfolio.theme.primaryColor};
            padding-bottom: 10px;
        }}
        
        .experience-item {{
            margin-bottom: 30px;
            border-left: 3px solid {portfolio.theme.primaryColor};
            padding-left: 20px;
        }}
        
        .experience-item h3 {{
            font-size: 1.5em;
            margin-bottom: 5px;
        }}
        
        .experience-item .company {{
            color: #666;
            margin-bottom: 10px;
        }}
        
        .skills {{
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }}
        
        .skill {{
            padding: 10px 20px;
            background: #f3f4f6;
            border-radius: 25px;
            font-size: 0.9em;
        }}
        
        footer {{
            background: #1f2937;
            color: white;
            text-align: center;
            padding: 20px;
            margin-top: 50px;
        }}
        
        @media (max-width: 768px) {{
            header h1 {{
                font-size: 1.8em;
            }}
            
            h2 {{
                font-size: 1.5em;
            }}
        }}
    </style>
</head>
<body>
    <header>
        <h1>{portfolio.data.name}</h1>
        <p>{portfolio.data.email}</p>
    </header>
    
    <main>
"""
            
            # Add About section
            if portfolio.theme.sections.about and portfolio.data.summary:
                html_content += f"""
        <section id="about">
            <h2>About</h2>
            <p>{portfolio.data.summary}</p>
        </section>
"""
            
            # Add Experience section
            if portfolio.theme.sections.experience:
                html_content += """
        <section id="experience">
            <h2>Experience</h2>
"""
                for exp in portfolio.data.experience:
                    html_content += f"""
            <div class="experience-item">
                <h3>{exp.title}</h3>
                <p class="company">{exp.company} • {exp.duration}</p>
                <p>{exp.description}</p>
            </div>
"""
                html_content += """
        </section>
"""
            
            # Add Skills section
            if portfolio.theme.sections.skills:
                html_content += """
        <section id="skills">
            <h2>Skills</h2>
            <div class="skills">
"""
                for skill in portfolio.data.skills:
                    html_content += f"""
                <span class="skill">{skill}</span>
"""
                html_content += """
            </div>
        </section>
"""
            
            html_content += f"""
    </main>
    
    <footer>
        <p>&copy; {datetime.utcnow().year} {portfolio.data.name}. All rights reserved.</p>
    </footer>
</body>
</html>
"""
            
            zip_file.writestr("index.html", html_content)
            
            # Add README for static version
            readme_static = f"""# {portfolio.name}

## Static Portfolio Website

This is a static HTML portfolio website generated from your resume.

### Usage

Simply open `index.html` in your web browser to view your portfolio.

### Deployment

You can deploy this to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- AWS S3
- Any web server

Just upload the contents of this folder.

### Template
Template ID: {portfolio.templateId}

### Generated
{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC
"""
            zip_file.writestr("README.md", readme_static)
    
    # Prepare the zip file for download
    zip_buffer.seek(0)
    
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename={portfolio.name.replace(' ', '_')}_{format}.zip"
        }
    )
