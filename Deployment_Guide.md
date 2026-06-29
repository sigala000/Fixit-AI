# FIXIT AI AGENT - Deployment & Setup Guide

This guide outlines instructions to run the **FIXIT AI AGENT** platform locally on your machine, using Docker Compose, or deploying to free-tier cloud services.

---

## 1. Local Development Setup

To run the application fully on localhost, follow these steps.

### Prerequisites
* **Node.js** (v18 or higher) & **npm**
* **Python** (v3.11 or v3.12)
* **uv** package manager (`curl -LsSf https://astral.sh/uv/install.sh | sh`)
* **MongoDB** (running locally on port `27017` or a MongoDB Atlas URI)
* **Google Gemini API Key** (from Google AI Studio)

### Step 1: Install Dependencies
From the root of the project, run:
```bash
npm install
```
This will automatically install dependencies in the root, `backend`, `frontend`, and `mcp_server` folders.

Inside the `agent` folder, synchronize the Python environment:
```bash
cd agent
uv sync
cd ..
```

### Step 2: Configure Environment Variables
Create a `.env` file in the `backend/` folder:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fixit
JWT_SECRET=your_jwt_secret_key_here
AGENT_SERVICE_URL=http://localhost:8000
```

Create a `.env` file in the `agent/` folder:
```env
GOOGLE_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb://localhost:27017/fixit
```

### Step 3: Seed the Database
Seed the database with 50 technicians, 100 requests, 50 appointments, 200 reviews, and 100 quotations:
```bash
npm run seed
```

### Step 4: Run the Application
Start the backend, frontend, and Python agent concurrently:
```bash
npm run dev
```
* **Frontend**: `http://localhost:5173`
* **Express Backend**: `http://localhost:5000`
* **Python ADK Agent (FastAPI)**: `http://localhost:8000`

---

## 2. Docker Compose Setup

Run the entire stack in isolated Docker containers (including a MongoDB instance):

1. Set your Gemini API key in your terminal session:
   ```bash
   export GOOGLE_API_KEY="your_gemini_api_key_here"
   ```
2. Build and run the containers:
   ```bash
   docker-compose up --build
   ```
3. Run the database seed script inside the running backend container:
   ```bash
   docker exec -it fixit-backend npm run seed
   ```
4. Access the React app at `http://localhost:80`.

---

## 3. Free-Tier Cloud Deployment Guide

This project is optimized to run on free-tier services.

### Database: MongoDB Atlas (Free Tier)
1. Register for a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster.
3. Whitelist access from all IPs (`0.0.0.0/0`) for hackathon convenience.
4. Obtain your connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/fixit`

### Backend: Render (Free Tier)
1. Sign up on [Render](https://render.com/).
2. Create a new **Web Service** and link your GitHub repository.
3. Configure the following settings:
   * **Root Directory**: `backend`
   * **Build Command**: `npm install`
   * **Start Command**: `node server.js`
4. Add the environment variables:
   * `MONGODB_URI`: *Your MongoDB Atlas Connection String*
   * `JWT_SECRET`: *A secure random string*
   * `AGENT_SERVICE_URL`: *The URL of your deployed Python Agent*

### Python Agent: Render (Free Tier)
1. Create a new **Web Service** on Render and link your GitHub repository.
2. Configure settings:
   * **Root Directory**: `agent`
   * **Build Command**: `pip install uv && uv sync`
   * **Start Command**: `uv run uvicorn app.fast_api_app:app --host 0.0.0.0 --port 8000`
3. Add environment variables:
   * `GOOGLE_API_KEY`: *Your Gemini API Key*
   * `MONGODB_URI`: *Your MongoDB Atlas Connection String*

### Frontend: Vercel (Free Tier)
1. Sign up on [Vercel](https://vercel.com/).
2. Import your GitHub repository.
3. Configure settings:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `frontend`
   * **Output Directory**: `dist`
4. Add a `vercel.json` in the root of the frontend folder to proxy API requests:
   ```json
   {
     "rewrites": [
       { "source": "/api/:path*", "destination": "https://your-backend-render-url.onrender.com/api/:path*" }
     ]
   }
   ```
5. Deploy!
