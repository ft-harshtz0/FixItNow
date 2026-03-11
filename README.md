# FixItNow

**FixItNow** is a comprehensive service marketplace platform designed to connect consumers with skilled workers. The platform seamlessly facilitates job posting, application, real-time communication, and AI-powered features to enhance the user experience.

## Features & Workflow

The platform provides a streamlined workflow for both consumers and workers:
1. **Authentication:** Users register and log in to the platform.
2. **Job Posting (Consumers):** Consumers can post job requirements, specifying the task details.
3. **Job Hunting (Workers):** Workers browse available jobs on the platform.
4. **Real-Time Communication:** Integrated real-time chat (via Socket.io) allows consumers and workers to discuss job specifics.
5. **AI Integration:** Uses Gemini AI for advanced platform features (embedded within the backend).
6. **Ratings & Feedback:** A rating system helps maintain community trust and service quality.

## User Roles

The platform is built around two primary user roles:
- **Consumer:** Can create job postings, view worker applicants, initiate chats, and manage their service requests (via the Consumer Dashboard).
- **Worker:** Can browse available jobs, communicate with consumers securely, and manage their accepted tasks (via the Worker Dashboard).

## Technology Stack

### Frontend
- **Framework:** React 18, Vite
- **Routing:** React Router DOM
- **Styling:** Tailwind CSS, PostCSS, Autoprefixer
- **Networking/Real-Time:** Axios, Socket.io-client

### Backend
- **Server:** Node.js, Express
- **Real-Time Engine:** Socket.io
- **AI Integration:** `@google/generative-ai` (Gemini API)
- **Authentication:** `bcryptjs`, local storage utilities (`utils/storage.js`)
- **File Uploads:** Multer (for handling multipart/form-data)
- **Utilities:** `dotenv`, `uuid`, `cors`

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm package manager

### Installation

1. Clone the repository and navigate to the project root:
   ```bash
   cd FixItNow
   ```

2. Install dependencies for all components:
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. Configure Environment Variables:
   - Create a `.env` file in the `backend` directory with reference to `.env.example`.
   - Setup any necessary API keys (like Google Gemini API key) inside it.
   - If required, create `.env` in the frontend directory.

### Running the Application

You can use `concurrently` from the project root to run both the frontend and backend simultaneously:
```bash
npm run dev
```

Alternatively, you can run them in separate terminals:
- **Backend:**
  ```bash
  cd backend
  npm run dev
  ```

- **Frontend:**
  ```bash
  cd frontend
  npm run dev
  ```

The frontend will be accessible at `http://localhost:5173` while the backend runs on `http://localhost:5000`.
