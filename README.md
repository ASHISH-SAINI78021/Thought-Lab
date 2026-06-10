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
- **Interactive Focus Pet**: Gain XP, level up, and unlock badges for reading blogs and completing habits.
- **QRT Framework**: A "Quick Response Team" leadership model that rewards contributors with administrative privileges.
- **Role Mastery**: Multi-tier architecture for Students, Mentors, Administrators, and Super-Administrators.
- **Soul XP & Custom Badges**: Earn specific awards across various activities (mentorship, reading).

### ✍️ 5. Dynamic Blog System & Series Content
*Rich content platform with interconnected resources.*
- **Blog Series Organization**: Group related posts into series cards with internal navigation and chapter selection.
- **Local PDF Exports**: Development tool embedded to generate and download entire blog series as professional PDF documents.
- **Reactions & Comments**: Interactive community discussion and feedback elements.

### 🎬 6. Intelligent Course Video Player
*Educational asset delivery and tracking.*
- **Progress Tracking**: Users can mark specific videos or playlists "as seen".
- **View Counter**: Global view trackers with detailed admin oversight on specific user engagements.
- **Asset Management**: Secure cloud-based media handling with **Cloudinary**.

### 🧘 7. Mental Wellness & Immersive UX
*Innovative tools to reduce academic burnout.*
- **Utter Your Thoughts**: A psychological release module using **GSAP** and **Framer Motion** animations.
- **Adaptive Meditation**: A context-aware timer that switches audio environments every 5 minutes based on focus depth.
- **Premium Design**: Fluid interactions powered by **Lenis Smooth Scroll** and gorgeous glassmorphism aesthetics.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS + Ant Design + Vanilla CSS modules
- **Animations**: Framer Motion + GSAP + Spline (3D)
- **Mobile**: Capacitor.js (Hybrid Ready)

### Backend
- **Core**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **AI/ML**: Face-API.js (TensorFlow.js)
- **Communications**: Socket.io + EmailService (Nodemailer, Pushover API)

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js**: (v18 or higher recommended)
- **MongoDB**: A local MongoDB server or a MongoDB Atlas Cloud URI
- **Cloudinary Account**: For managing image and video assets
- **Git**: Version control system

### Installation & Setup

1. **Clone the Repository**
   Open your terminal and duplicate the repo to your local machine:
   ```bash
   git clone https://github.com/ASHISH-SAINI78021/Thought-Lab.git
   cd "Thought Lab 2"
   ```

2. **Backend Setup (Server)**
   Navigate to the backend directory, install dependencies, and configure environment variables:
   ```bash
   cd backend
   npm install
   ```
   *Environment Variables Configuration:*
   Create a `.env` file in the `backend` folder and add the following keys. Substitute with your own values:
   ```env
   # Database connection string
   MONGO_URI=mongodb://localhost:27017/thought_lab
   # For Authentication encryption
   JWT_SECRET=your_super_secret_jwt_key
   # Cloudinary Keys
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   # Push Notification details (Pushover API)
   PUSHOVER_USER_KEY=your_pushover_user_key
   PUSHOVER_API_TOKEN=your_pushover_api_token
   # Email Service (Nodemailer)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   ```

   *Run the Server:*
   ```bash
   npm start
   # or with nodemon for development
   npm run dev
   ```
   The backend server typically runs on `http://localhost:5000` (or another port if specified).

3. **Frontend Setup (Client)**
   Open a new terminal window, navigate to the frontend directory, and install its dependencies:
   ```bash
   cd thought-lab
   npm install
   ```
   *Environment Variables (if applicable for Vite):*
   Create a `.env` file in the `thought-lab` directory if you need specific frontend keys (like your API url).
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   *Run the Client:*
   ```bash
   npm run dev
   ```
   The Vite development server should now be running (usually on `http://localhost:5173`). Open this URL in your web browser.

---

## 🤝 Contribution & Impact

Thought Lab is more than just a project; it's a community initiative. If you want to contribute to the **QRT Framework**, enhance the **Focus Pet** logic, or implement innovative mental health modules, feel free to submit a pull request!

<p align="center">Made with ❤️ for the student community.</p>
