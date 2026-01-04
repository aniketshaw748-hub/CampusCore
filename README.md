# CampusCore

CampusCore is a role-based academic platform designed for college students and faculty, centered around **CampusGPT** — a syllabus-aware, exam-focused AI assistant for personalized learning and exam preparation.

---

## 🚀 Overview

CampusCore provides:
- Separate dashboards for **Students**, **Faculty**, and **Admins**
- Faculty-driven academic content (notices, syllabus, study materials)
- Student personal notes and uploads
- CampusGPT: an AI assistant tailored for college academics
- Exam-focused learning modes with syllabus and subject scoping

The goal is to offer a **college-first alternative to generic AI chatbots**, optimized for exams, coursework, and institutional workflows.

---

## 🧑‍🎓 Key Features

### Student
- Personalized dashboard
- Priority-based notices
- CampusGPT (normal mode + exam mode)
- Exam-scoped preparation (unit tests, midsems, endsems)
- Personal notes management

### Faculty
- Upload syllabus, notices, and study materials
- Set urgency, deadlines, and exam relevance
- Faculty dashboard with recent uploads

### Admin
- Separate admin dashboard
- User and content management (extensible)

---

## 🧠 CampusGPT Highlights

- Exam Mode with syllabus locking
- Subject- and unit-specific preparation
- Faculty material prioritized over student notes
- Persistent memory and custom instructions (planned backend integration)
- Academic tone and mark-optimized answers

---

## 🛠 Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Lucide Icons

### Architecture (Planned Backend)
- Gemini-powered AI (via RAG)
- Vector database for academic content
- Metadata-driven retrieval and personalization

---

## 📦 Getting Started (Local Development)

### Prerequisites
- Node.js (18+ recommended)
- npm (or compatible package manager)

### Setup

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate into the project
cd campuscore

# Install dependencies
npm install

# Start the development server
npm run dev

The app will be available at:
http://localhost:5173

### Project Structure
src/
├── components/
│   ├── dashboard/
│   ├── layout/
│   └── ui/
├── contexts/
├── pages/
├── lib/
└── types/

🧭 Roadmap

Backend ingestion pipeline for faculty & student content

Vector search + retrieval logic

Gemini-powered reasoning layer

Persistent AI memory and personalization

Faculty analytics and feedback loop

📄 License

This project is under active development.
License and usage terms will be defined later.

✨ Summary

CampusCore is a college-focused academic platform with an exam-aware AI assistant designed to help students prepare smarter, not harder.