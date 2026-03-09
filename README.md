# Resume to Portfolio Generator

Transform your resume into a stunning portfolio website in minutes using AI-powered parsing and customizable templates.

## Overview

Upload your resume (PDF or DOCX), let the AI extract your information, choose a template, customize it, and share your portfolio with a public link — no coding required.

## Features

- **AI Resume Parsing** — Automatically extracts work experience, skills, education, projects, and certifications using Google Gemini AI
- **6 Portfolio Templates** — Corporate Professional, Creative Designer, Dark Modern, Minimal Dev, One Page Scroll, Student Academic
- **Portfolio Editor** — Edit and customize parsed data before publishing
- **Public Portfolio Links** — Share your portfolio via a unique public URL
- **Dark/Light Mode** — Supported across all templates
- **Authentication** — Firebase-based email/password and social login
- **Billing & Payments** — Razorpay integration for premium features
- **Statistics & Ratings** — Track portfolio views and collect ratings

## Tech Stack

### Frontend
| Technology | Version |
|---|---|
| React | 18 |
| TypeScript | 5 |
| Vite | 5 |
| Tailwind CSS | 3 |
| Framer Motion | 10 |
| GSAP | 3 |
| Firebase SDK | 10 |
| React Router | 6 |

### Backend
| Technology | Version |
|---|---|
| Python | 3.10+ |
| FastAPI | 0.109+ |
| Uvicorn | 0.27+ |
| Firebase Admin SDK | 6.4+ |
| Google Generative AI | 0.8+ |
| pdfplumber / python-docx | latest |
| Razorpay | 1.4+ |

## Project Structure

```
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── requirements.txt
│   ├── firebase-credentials.json
│   └── app/
│       ├── api/                 # Route handlers (auth, resume, portfolio, billing)
│       ├── core/                # Config, database, security
│       ├── models/              # Pydantic schemas
│       ├── routers/             # Statistics & ratings routes
│       └── services/            # AI parser, Firebase DB, resume parser
├── frontend/
│   ├── src/
│   │   ├── pages/               # HomePage, Dashboard, UploadResume, etc.
│   │   ├── components/          # Shared components
│   │   ├── templates/           # Portfolio templates
│   │   ├── services/            # API clients
│   │   ├── context/             # Auth context
│   │   └── utils/               # Data transformers
│   └── package.json
├── setup.sh                     # Linux/macOS setup script
└── setup.bat                    # Windows setup script
```

## Prerequisites

- **Node.js** 18+
- **Python** 3.10+
- **Firebase** project with Firestore and Authentication enabled
- **Google Gemini API** key
- **Razorpay** account (optional, for billing)

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd "Resume to portfolio"
```

### 2. Run the automated setup script

**Windows:**
```bat
setup.bat
```

**Linux / macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

The setup script installs all dependencies for both frontend and backend.

### 3. Configure environment variables

Create a `.env` file in the `backend/` directory:

```env
SECRET_KEY=your_secret_key_here
GOOGLE_API_KEY=your_gemini_api_key_here
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 4. Add Firebase credentials

Copy `backend/firebase-credentials.example.json` to `backend/firebase-credentials.json` and fill in your Firebase service account details.

Configure Firebase for the frontend in `frontend/src/config/firebase.ts`:

```ts
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Running the Application

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API will be available at `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App will be available at `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/resume/upload` | Upload and parse resume |
| GET | `/api/portfolio/{id}` | Get portfolio by ID |
| PUT | `/api/portfolio/{id}` | Update portfolio |
| GET | `/api/portfolio/public/{slug}` | Public portfolio view |
| POST | `/api/billing/order` | Create payment order |
| GET | `/api/statistics` | Get platform statistics |
| POST | `/api/ratings` | Submit a rating |

## Portfolio Templates

| Template | Best For |
|---|---|
| Corporate Professional | Business, finance, management roles |
| Creative Designer | UI/UX, graphic design, creative fields |
| Dark Modern | Software engineers, developers |
| Minimal Dev | Minimalist style for tech professionals |
| One Page Scroll | Clean single-page scroll experience |
| Student Academic | Students and recent graduates |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

## License

This project is licensed under the terms found in the [LICENSE](LICENSE) file.
