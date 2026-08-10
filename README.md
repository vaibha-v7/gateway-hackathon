# FRONTLINE

FRONTLINE is a hackathon project that combines a React frontend with an Express backend to triage customer messages using AI. Users can enter one or more customer messages, submit them for analysis, and receive structured results such as category, priority, confidence, and suggested action.

## Features

- Modern React + Vite frontend with Tailwind styling
- Dynamic API base URL configuration via `VITE_API_URL`
- Single-message and batch-message triage flow
- AI-generated response details including:
  - category
  - priority
  - confidence score
  - human-review requirement
  - summary and suggested action

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS

### Backend
- Node.js
- Express
- dotenv
- CORS

## Project Structure

```text
frontend/   # React + Vite client
backend/    # Express API server
```

## Prerequisites

- Node.js 18+ recommended
- npm

## Setup

### 1. Install frontend dependencies

```bash
cd frontend
npm install
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure environment variables

#### Frontend
Create a `.env` file inside `frontend/` with:

```env
VITE_API_URL=http://localhost:5000
```

#### Backend
Create a `.env` file inside `backend/` with the required values for your services, for example:

```env
MONGO_DB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

## Running the app

### Start the backend

```bash
cd backend
node app.js
```

### Start the frontend

```bash
cd frontend
npm run dev
```

Then open the local Vite URL shown in the terminal.

## API Overview

The frontend sends requests to these backend endpoints:

- `POST /api/triage`
- `POST /api/triage/batch`

## Notes

- The frontend is designed to work with a configurable API base URL so it can be easily switched between local development and deployment environments.
- If you deploy the app, make sure the frontend environment variable points to the correct backend URL.
