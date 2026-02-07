import "./App.css";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./components/Home";
import AboutMe from "./components/AboutMe";
import Lenis from "lenis";
import { useEffect, useState } from "react";
import UtterYourThoughts from "./components/UtterYourThoughts";
import AdminLayout from "./components/Admin/AdminLayout/AdminLayout";
import AdminPanel from "./components/Admin/AdminPanel/AdminPanel";
import Table from "./components/Table/Table";
import BlogEditor from "./components/Admin/BlogEditor/BlogEditor";
import Blog from "./components/Blog/Blog";
import GameScoreUpdater from "./components/Admin/Game/GameScoreUpdater/GameScoreUpdater";
import RegisterStudent from "./components/Attendence/Login/RegisterStudent";
import LoginStudent from "./components/Attendence/Login/LoginStudent";
import BlogItem from "./components/Blog/BlogItem/BlogItem";
import StepAvatar from "./components/Authentication/StepAvatar/StepAvatar";
import StepName from "./components/Authentication/StepName/StepName";
import StepOtp from "./components/Authentication/StepOtp/StepOtp";
import StepPhoneEmail from "./components/Authentication/StepPhoneEmail/StepPhoneEmail";
import AppointmentForm from "./components/AppointmentForm/AppointmentForm";
import ApproveAppointment from "./components/ApproveAppointment/ApproveAppointment";
import DownloadAttendance from "./components/Admin/DownloadAttendance/DownloadAttendance";
import Register from "./components/Authentication/Register/Register";
import Login from "./components/Authentication/Login/Login";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import AdminRoute from "./components/AdminRoute/AdminRoute";
import Unauthorized from "./components/Unauthorized/Unauthorized";
import CreateGame from "./components/Admin/Game/GameForm/GameForm";
import GameManagement from "./components/Admin/Game/GameManagement/GameManagement";
import GameList from "./components/GameList/GameList";
import CertificateGenerator from "./components/Admin/CertificateGenerator/CertificateGenerator";
import RegisterAdmin from "./components/Admin/RegisterAdmin/RegisterAdmin";
import QRTInfoPage from "./components/QRT";
import Developer from "./components/Developer/Developer";
import Alumni from "./components/Alumni/Almuni";
import StudentProfile from "./components/StudentProfile/StudentProfile";
import MeditationTracker from "./components/MeditationTracker/MeditationTracker";
import AttendanceSuccess from "./components/Attendence/AttendanceSuccess/AttendanceSuccess";
import TaskAssigner from "./components/Admin/TaskAssigner/TaskAssigner";
import TaskDashboard from "./components/TaskDashboard/TaskDashboard";
import MeditationTimer from "./components/Meditation Timer/MeditationTimer";
import FaceRecognitionSuccess from "./components/Attendence/FacialRecognitionSuccess/FacialRecognitionSuccess";
import CourseCreator from "./components/Admin/Course/CourseCreater";
import CourseList from "./components/CourseList/CourseList";
import CoursePlayer from "./components/CoursePlayer/CoursePlayer";
import CourseVideoManager from "./components/Admin/CourseVideoManager/CourseVideoManager";
<<<<<<< HEAD
import AttendanceProcessing from "./components/Attendence/Processing/AttendanceProcessing";
=======
import Events from "./components/Events/events.jsx";
import EventItem from "./components/Events/EventItem/EventItem.jsx";
import UploadWinner from "./components/Winner/AdminAddWinner/AddWinner.jsx";
import Winners from "./components/Winner/winners.jsx";
>>>>>>> be7c22751ec08d02280f735e28483afcda19ce6a

const AppContent = () => {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.9 });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }, []);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/developer" element={<Developer />} />
        <Route path='/almuni' element={<Alumni />} />
      </Routes>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutMe />} />
        <Route path="/utter-your-thoughts" element={<UtterYourThoughts />} />
        <Route path="/leaderboard" element={<Table />} />
        <Route path="/leaderboard/:id" element={<StudentProfile />} />
        <Route path="/appointment-form" element={<AppointmentForm />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/all-events" element={<GameList />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/quick-response-team" element={<QRTInfoPage />} />
        <Route path="/task-manager" element={<TaskAssigner />} />
        <Route path="/task-dashboard" element={<TaskDashboard />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:courseId" element={<CoursePlayer />} />
        <Route path="/courses/:courseId/videos" element={<CourseVideoManager />} />
<<<<<<< HEAD

=======
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventItem />} />
         <Route path="/upload-winner" element={<UploadWinner />} />
        <Route path="/winners" element={<Winners />} />


        
>>>>>>> be7c22751ec08d02280f735e28483afcda19ce6a

        {/* Authenticated Student Routes */}
        <Route
          path="/attendance"
          element={
            <PrivateRoute>
              <RegisterStudent />
            </PrivateRoute>
          }
        />
        <Route
          path="/mark-attendance"
          element={
            <PrivateRoute>
              <LoginStudent />
            </PrivateRoute>
          }
        />
        <Route
          path="/attendance-processing"
          element={
            <PrivateRoute>
              <AttendanceProcessing />
            </PrivateRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminPanel />} />
          <Route path="create-blog" element={<BlogEditor />} />
          <Route path="create-blog/full-screen" element={<BlogEditor check="true" />} />
          <Route path="game-score-updater" element={<GameScoreUpdater />} />
          <Route path="appointments" element={<ApproveAppointment />} />
          <Route path="download-attendance" element={<DownloadAttendance />} />
          <Route path="create-game" element={<CreateGame />} />
          <Route path="all-games" element={<GameManagement />} />
          <Route path="promote-admin" element={<RegisterAdmin />} />
          <Route path="create-certificates" element={<CertificateGenerator />} />
          <Route path="create-course" element={<CourseCreator />} />
        </Route>

        {/* Blog Routes (Admin Protected) */}
        <Route
          path="/blogs"
          element={
            <PrivateRoute>
              <Blog />
            </PrivateRoute>
          }
        />
        <Route path="/meditation-timer" element={
          <PrivateRoute>
            <MeditationTimer />
          </PrivateRoute>
        } />
        <Route
          path="/blog/:id"
          element={
            <PrivateRoute>
              <BlogItem />
            </PrivateRoute>
          }
        />

        <Route path="/meditation-tracker" element={
          <PrivateRoute>
            <MeditationTracker />
          </PrivateRoute>
        } />
        <Route path="/attendance-success" element={<AttendanceSuccess />} />
        <Route path="/face-recognition-success" element={<FaceRecognitionSuccess />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;