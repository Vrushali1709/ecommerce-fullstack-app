# 🛍️ Full-Stack E-Commerce Mobile App & Backend

A modern, high-performance full-stack mobile e-commerce platform built with **React Native (Expo)**, **FastAPI (Python)**, and **PostgreSQL**.

---

## 🏗️ Architecture

- **Frontend (`MyFirstApp/`)**:
  - React Native / Expo (SDK 52)
  - NativeWind (TailwindCSS)
  - React Navigation / Expo Router
  - Context API (Cart, Wishlist, Authentication, Theme)
  - Lucide React Native Icons

- **Backend (`backend/`)**:
  - Python 3.11+ / FastAPI
  - SQLAlchemy ORM & Pydantic V2
  - PostgreSQL Database
  - JWT Authentication (OAuth2 Password Bearer)
  - RESTful APIs for Products, Categories, Cart, Orders, Wishlist & Users

---

## 📁 Project Structure

```
react native/
├── backend/
│   ├── app/
│   │   ├── api/          # API Route endpoints
│   │   ├── core/         # Config, Database, Security & Auth
│   │   ├── models/       # SQLAlchemy Database Models
│   │   └── schemas/      # Pydantic validation schemas
│   ├── scripts/          # Seed data and DB init scripts
│   ├── requirements.txt  # Python backend dependencies
│   └── run.py            # Backend launch entrypoint
│
└── MyFirstApp/
    ├── src/
    │   ├── app/          # Expo router screens (Home, Cart, Profile, etc.)
    │   ├── components/   # Reusable UI components
    │   ├── config/       # API configuration
    │   ├── context/      # React contexts (Cart, Auth, Wishlist)
    │   └── services/     # API integration services
    ├── app.json          # Expo configuration
    └── package.json      # Frontend dependencies
```

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python run.py
```

### 2. Frontend Setup
```bash
cd MyFirstApp
npm install
npx expo start
```
