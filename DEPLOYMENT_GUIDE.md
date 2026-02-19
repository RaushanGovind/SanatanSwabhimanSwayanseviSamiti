
# 🚀 Deployment Guide: Live on Render (Backend) & Vercel (Frontend)

This guide will walk you through deploying your `Jagdamba Samiti` application.

## 📋 Prerequisites
- A GitHub account
- A Render account (render.com)
- A Vercel account (vercel.com)
- MongoDB Atlas account (already set up)

---

## 1️⃣ Push Code to GitHub

First, you need to push your local changes to a GitHub repository.

1.  **Open Terminal** in `e:\Jagdama Samiti`
2.  Run these commands:
    ```bash
    git init
    git add .
    git commit -m "Prepare for deployment"
    ```
3.  **Create a New Repository** on GitHub (e.g., `jagdamba-samiti`).
4.  Copy the remote URL (e.g., `https://github.com/yourusername/jagdamba-samiti.git`).
5.  Link and Push:
    ```bash
    git remote add origin https://github.com/yourusername/jagdamba-samiti.git
    git branch -M main
    git push -u origin main
    ```

---

## 2️⃣ Deploy Backend to Render

1.  Go to **[dashboard.render.com](https://dashboard.render.com)**.
2.  Click **New +** -> **Web Service**.

3.  Connect your GitHub repository (`SanatanSwabhimanSwayanseviSamiti`).
4.  **Configure Settings**:
    *   **Name**: `jagdamba-backend`
    *   **Region**: Singapore (or closest to you)
    *   **Branch**: `main`
    *   **Root Directory**: `backend`  <-- IMPORTANT
    *   **Runtime**: `Python 3`
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 10000`
5.  **Environment Variables**:
    *   Key: `MONGO_URI` (Value: your connection string)
    *   Key: `DB_NAME`: `MaaJagdambaSamiti`
    *   Key: `PYTHON_VERSION`: `3.11.0`  <-- Add this for stability

6.  Click **Create Web Service**.
7.  Wait for the build to finish. Once live, copy the **Backend URL** (e.g., `https://jagdamba-backend.onrender.com`).

---

## 3️⃣ Deploy Frontend to Vercel

1.  Go to **[vercel.com/new](https://vercel.com/new)**.
2.  Import your GitHub repository (`jagdamba-samiti`).
3.  **Configure Project**:
    *   **Framework Preset**: Vite (should be auto-detected)
    *   **Root Directory**: Click "Edit" and select `frontend`.
        *   *Important*: Ensure this is set to `frontend`!
    *   **Build Command**: `npm run build` (Default)
    *   **Output Directory**: `dist` (Default)
    *   **Install Command**: `npm install` (Default)
4.  **Environment Variables**:
    *   Key: `VITE_API_URL`
    *   Value: `https://jagdamba-backend.onrender.com/api`
        *   *Note*: Use the Backend URL from Step 2 and append `/api`.
        *   Example: If backend is `https://myapp.onrender.com`, value is `https://myapp.onrender.com/api`.
5.  Click **Deploy**.

---

## 4️⃣ Configure MongoDB Atlas (Critical)

Your database must allow connections from Render/Vercel.

1.  Go to **MongoDB Atlas Dashboard**.
2.  Navigate to **Security** -> **Network Access**.
3.  Click **Add IP Address**.
4.  Select **Allow Access from Anywhere** (0.0.0.0/0).
    *   *Why?* Render and Vercel use dynamic IPs.
5.  Click **Confirm**.

---


### ⚠️ Important: File Storage
Render uses an **ephemeral filesystem**. This means any files uploaded (like profile photos or proof documents) to the `uploads/` folder will be **deleted** every time the server restarts or goes to sleep.
*   **For Production**: You should eventually integrate a service like **Cloudinary** or **AWS S3** for persistent storage.
*   **For Now**: Standard uploads will work but won't persist across restarts.

---

## ✅ You're Live!


Visit the URL provided by Vercel (e.g., `https://jagdamba-samiti.vercel.app`) to access your application.

### Troubleshooting
- **Backend Logs**: Check Render "Logs" tab if the API isn't working.
- **Frontend Errors**: Check Browser Console (F12) for network errors.
- **CORS Issues**: The backend (`backend/main.py`) is already configured to allow all origins (`allow_origins=["*"]`), so it should work out of the box.
