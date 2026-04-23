<p align="center">
  <img width="300" src="https://media.giphy.com/media/fwbzI2kV3Qrlpkh59e/giphy.gif" alt="Thought Lab Logo">
  <h1 align="center">Thought Lab</h1>
  <p align="center">A High-Performance Cognitive Operating System for Students</p>
  <p align="center">
    <img src="https://img.shields.io/badge/MERN-Stack-green?style=for-the-badge" alt="MERN">
    <img src="https://img.shields.io/badge/FaceAPI.js-Biometrics-red?style=for-the-badge&logo=tensorflow" alt="FaceAPI">
    <img src="https://img.shields.io/badge/Socket.io-Realtime-blue?style=for-the-badge" alt="Socket.io">
    <img src="https://img.shields.io/badge/Vite-Fast-646CFF?style=for-the-badge&logo=vite" alt="Vite">
  </p>
</p>

---

## 🌱 Introduction

**Thought Lab** is a premier student-centric platform designed to bridge the gap between academic discipline and mental well-being. Originally built to revive the meditation culture at NIT Kurukshetra, it has evolved into a comprehensive **Cognitive Operating System** that integrates biometric attendance, real-time gamification, and advanced productivity tracking.

**Impact**: 🚀 100+ active users | 📈 85% session regularity | 💎 2x Engagement Growth

---

## 🧩 Key Features

### 🚀 1. Biometric Attendance (Face-API.js)
*Cutting-edge identity verification without hardware costs.*
- **Zero-Cost Biometrics**: Uses `face-api.js` to extract **128-dimensional facial descriptors**.
- **Edge Deployment**: Implemented server-side facial recognition via Node.js monkey-patching (simulated Canvas environment).
- **Security**: Euclidean distance matching with a strict 0.3 threshold and automated failure emails.

### 🧠 2. Advanced Habit Tracking & Visualization
*Data-driven discipline for high-performing students.*
- **Activity Heatmaps**: GitHub-style visual tracking of student consistency.
- **Persistent Global Timer**: A session tracker that persists across page navigations using synchronized local storage.
- **Intensity Mapping**: Dynamic duration logging with intensity-based color coding.

### 📜 3. Automated Certificate Engine
*Professional-grade recognition in seconds.*
- **High-Fidelity PDF**: Automated certificate generation using `html2canvas` and `jsPDF`.
- **Dynamic Themes**: Multiple professional designs (Classic, Modern, Vintage).
- **Scaling**: 3x resolution scaling for high-print quality.

### ⚡ 4. Real-Time Gamified Ecosystem
*Collective motivation through synchronization.*
- **Live Leaderboard**: Atomic score updates powered by **Socket.io**.
- **QRT Framework**: A "Quick Response Team" leadership model that rewards contributors with administrative privileges.
- **Role Mastery**: Multi-tier architecture for Students, Mentors, and Administrators.

### 🧘 5. Mental Wellness & Immersive UX
*Innovative tools to reduce academic burnout.*
- **Utter Your Thoughts**: A psychological release module using **GSAP** and **Framer Motion** animations.
- **Adaptive Meditation**: A context-aware timer that switches audio environments every 5 minutes based on focus depth.
- **Premium Design**: Fluid interactions powered by **Lenis Smooth Scroll**.

### 🛠️ 6. Enterprise-Grade Admin Control
*Streamlined data management for mentors.*
- **Forensic Exports**: Attendance and performance reporting via **ExcelJS**.
- **Asset Management**: Secure cloud-based media handling with **Cloudinary**.
- **Course Player**: Integrated educational lesson player with progress management.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS + Ant Design + MUI
- **Animations**: Framer Motion + GSAP + Spline (3D)
- **Mobile**: Capacitor.js (Hybrid Ready)

### Backend
- **Core**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **AI/ML**: Face-API.js (TensorFlow.js)
- **Communications**: Socket.io + EmailService (Nodemailer)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account
- Cloudinary API Key

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/ASHISH-SAINI78021/Thought-Lab.git
   cd "Thought Lab 2"
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env with MONGODB_URI, CLOUDINARY_URL, JWT_SECRET
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd thought-lab
   npm install
   npm run dev
   ```

---

## 🤝 Contribution & Impact

Thought Lab is more than just a project; it's a community initiative. If you want to contribute to the **QRT Framework** or innovative mental health modules, feel free to submit a pull request!

<p align="center">Made with ❤️ for the student community.</p>
