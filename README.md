# 🚀 Digital Time Capsule – Full Stack Web Application

Digital Time Capsule is a secure, modern full-stack web application that allows users to create, store, and collaboratively contribute digital memories (text, images, videos) inside **time-locked capsules** that unlock on a future date.

This project is maintained as a **single repository** containing both the **frontend** and **backend** codebases.

---

## ✨ Key Features

- ⏳ Time-locked digital capsules
- 📝 Text, image, and video contributions
- 🔐 Secure authentication & protected routes
- ☁️ Scalable media storage using AWS S3

---

## 🛠️ Technology Stack

### Frontend
- React (Vite)
- React Router
- Axios

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- Bcrypt Password Hashing

### Storage & AI
- AWS S3 (Media Storage)
- Sentiment Analysis Service

---

## 📁 Project Structure



---

## ⚙️ Prerequisites

- Node.js (v18+)
- npm
- Git
- PostgreSQL (Cloud recommended)
- AWS S3 Bucket
- AWS IAM User with S3 access

---

## 🗄️ Database Setup (PostgreSQL)

1. Create a PostgreSQL database (local or cloud).
2. Copy the database connection string:
    postgresql://USER:PASSWORD@HOST:5432/DBNAME


---

## ☁️ AWS S3 Setup

1. Create an S3 bucket
2. Create an IAM user
3. Grant S3 permissions
4. Save:
   - Bucket name
   - Region
   - Access Key ID
   - Secret Access Key

---

## 🖥️ Backend Setup & 🌐 Frontend Setup

```bash
# =========================
# BACKEND SETUP
# =========================

# Go to backend folder
cd digital-time-capsule-backend

# Install dependencies
npm install

# Create environment file (.env) with the following variables:
# DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME
# JWT_SECRET=your_super_secret_key
# AWS_BUCKET_NAME=your-bucket-name
# AWS_REGION=us-east-1
# AWS_ACCESS_KEY_ID=AKIA...
# AWS_SECRET_ACCESS_KEY=...

# Run database schema
psql -d DBNAME -f schema.sql

# Start backend server
npm run dev


# =========================
# FRONTEND SETUP
# =========================

# Go to frontend folder
cd ../digital-time-capsule-frontend

# Install dependencies
npm install

# Configure backend API URL
# Open: src/context/authcontext.jsx
# Set:
# const API_BASE_URL = "http://localhost:5000/api";

# Start frontend server
npm run dev
