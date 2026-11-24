# RESUMIND AI — AI-Powered Resume Analyzer & Career Assistant

An intelligent career companion designed to help job seekers analyze resumes, identify skill gaps, prepare for interviews, and improve their career readiness.

**Repository:** [RESUMIND-AI](https://github.com/codebysakshiii/RESUMIND-AI)

---

## Overview

RESUMIND AI is a full-stack web application that brings multiple resume analysis and career preparation tools together in one platform.

It helps users understand their resume strengths, discover improvement opportunities, explore job matches, and prepare for their next career opportunity.

## Features

- **Resume Analyzer** — Analyze uploaded resumes and receive improvement insights.
- **ATS Tracker** — Explore resume compatibility with Applicant Tracking Systems.
- **Job Matching** — Compare resume skills with job descriptions.
- **Job Recommendations** — Discover relevant job opportunities.
- **Skill Gap Analysis** — Identify missing skills and areas to improve.
- **Learning Roadmap** — Organize learning goals and career preparation.
- **Mock Interview** — Practice interview questions and review feedback.
- **Career Agent** — Get career-related assistance.
- **Resume Builder** — Create and improve professional resumes.
- **Resume Comparison** — Compare different resume versions.
- **Resume Analytics** — Review resume-related insights.
- **Resume Version Management** — Manage resume versions.

*Feature availability may depend on backend configuration and external API credentials.*

## Technology Stack

### Frontend
- React.js
- Vite
- JavaScript
- CSS
- Axios
- Lucide React

### Backend
- Python
- FastAPI
- Pydantic
- MongoDB
- Google Gemini API

### Development Tools
- Visual Studio Code
- Git & GitHub
- npm
- Python Virtual Environment

## Project Structure

```text
RESUMIND-AI/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   ├── core/
│   │   ├── database/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── .env.example
│
├── run_all.bat
├── run_backend.bat
├── run_frontend.bat
└── README.md
```

## Getting Started

Follow these steps to run RESUMIND AI locally.

### Prerequisites

Install the following before starting:

- Python 3.10 or compatible version
- Node.js and npm
- MongoDB (local installation or MongoDB Atlas)
- Google Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/codebysakshiii/RESUMIND-AI.git
cd RESUMIND-AI
```

### 2. Backend Setup

Open a terminal:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create your environment file:

```powershell
Copy-Item .env.example .env
```

Open `backend/.env` and configure your MongoDB connection and Gemini API key.

Example:

```env
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=resumind_ai
JWT_SECRET=replace_with_a_secure_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_supported_gemini_model
PORT=8000
HOST=0.0.0.0
```

Start the backend:

```powershell
uvicorn app.main:app --reload
```

Backend API:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### 3. Frontend Setup

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

Make sure the frontend API base URL points to your running backend.

## Environment Variables & Security

- Never upload your actual `.env` files.
- Never expose API keys, database credentials, or JWT secrets.
- Use `.env.example` as a configuration template.
- Configure production secrets through your hosting provider's environment settings.

## Future Improvements

- Enhanced AI-powered resume insights.
- More personalized career recommendations.
- Advanced interview evaluation.
- Improved analytics and reporting.
- Production deployment and performance improvements.

## Author

**Sakshi Bari**

B.Tech Computer Science Engineering Student

GitHub: [@codebysakshiii](https://github.com/codebysakshiii)

---

If you find this project interesting, consider giving the repository a ⭐ on GitHub!

**Project:** [RESUMIND AI](https://github.com/codebysakshiii/RESUMIND-AI)