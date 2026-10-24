# 🚀 Complete Deployment Guide - SocialPulse App

This guide will show you how to deploy both the **Backend** and **Frontend** for **FREE** and connect them seamlessly in under 5 minutes.

---

## 🏗️ Architecture Overview

| Component | Recommended Free Platform | Why? |
|---|---|---|
| **Backend (Server + Socket.io)** | [Render.com](https://render.com) | Free Web Service, native WebSocket support for real-time chat, free SSL. |
| **Frontend (React + Vite)** | [Vercel](https://vercel.com) | Superfast global CDN, instant deployments, custom domains. |
| **Database** | [MongoDB Atlas](https://cloud.mongodb.com) | Free 512MB cloud database (Already configured!). |

---

## 📌 Step 1: Upload Code to GitHub

1. Open your terminal or GitHub Desktop in `D:\Social App\social-app`.
2. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of full-stack social app"
   ```
3. Create a new repository on [GitHub](https://github.com/new) (named `social-app`).
4. Link and push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/social-app.git
   git branch -M main
   git push -u origin main
   ```

---

## 📌 Step 2: Deploy Backend on Render.com (Free)

1. Sign up / Log in to [Render.com](https://dashboard.render.com).
2. Click **New +** ➔ **Web Service**.
3. Connect your GitHub repository (`social-app`).
4. Fill in the following settings:
   - **Name**: `social-app-backend` (or your preferred name)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Click **Advanced** ➔ **Add Environment Variables**:
   Add the variables from your `server/.env`:
   - `PORT` = `5000`
   - `MONGO_URI` = `mongodb+srv://maizbhojani17_db_user:J6MPal9iY9MUYhKv@cluster0.0w3tnrd.mongodb.net/socialapp?retryWrites=true&w=majority`
   - `JWT_SECRET` = `mysecretkey12345`
   - `CLIENT_URL` = `*` *(or your Vercel frontend URL after Step 3)*
   - `EMAIL_USER` = `your_email@gmail.com`
   - `EMAIL_PASS` = `your_email_app_password`
6. Click **Create Web Service**.
7. Wait 1-2 minutes for Render to deploy. Copy your live backend URL (e.g., `https://social-app-backend.onrender.com`).

---

## 📌 Step 3: Deploy Frontend on Vercel (Free)

1. Sign up / Log in to [Vercel](https://vercel.com).
2. Click **Add New...** ➔ **Project**.
3. Import your GitHub repository (`social-app`).
4. Configure the Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select **`client`**
5. Expand **Environment Variables**:
   Add the following variables using your Render URL from Step 2:
   - `VITE_API_URL` = `https://social-app-backend.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://social-app-backend.onrender.com`
6. Click **Deploy**.
7. In ~30 seconds, Vercel will give you a live URL (e.g., `https://social-app-client.vercel.app`)!

---

## 📌 Step 4: Final Connect (Frontend ➔ Backend ➔ Frontend)

1. Go back to your **Render Dashboard** ➔ `social-app-backend` ➔ **Environment**.
2. Update `CLIENT_URL` to your actual Vercel domain:
   - `CLIENT_URL` = `https://social-app-client.vercel.app`
3. Click **Save Changes**. Render will automatically restart with full CORS security!

---

## 🎉 Congratulations!
Your Social Media application is now deployed live on the internet with:
- ✅ Secure MongoDB Database
- ✅ Real-time Socket.io Chatting
- ✅ Image upload handling
- ✅ Full Post CRUD, Likes, Comments, Profiles & Pagination
- ✅ Free HTTPS (SSL) on both Frontend and Backend
