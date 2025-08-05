import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home.js";
import AboutMe from "./components/AboutMe.js";
import Lenis from "lenis";
import { useEffect } from "react";
import UtterYourThoughts from "./components/UtterYourThoughts.js";
import AdminLayout from "./components/Admin/AdminLayout/AdminLayout.js";
import AdminPanel from "./components/Admin/AdminPanel/AdminPanel.js";
import Table from "./components/Table/Table.js";
import BlogEditor from "./components/Admin/BlogEditor/BlogEditor.js";
import Blog from "./components/Blog/Blog.js";
import GameScoreUpdater from "./components/Admin/Game/GameScoreUpdater/GameScoreUpdater.js";
import RegisterStudent from "./components/Attendence/Login/RegisterStudent.js";
import LoginStudent from "./components/Attendence/Login/LoginStudent.js";
import BlogItem from "./components/Blog/BlogItem/BlogItem.js";
import StepAvatar from "./components/Authentication/StepAvatar/StepAvatar.js";
import StepName from "./components/Authentication/StepName/StepName.js";
import StepOtp from "./components/Authentication/StepOtp/StepOtp.js";
import StepPhoneEmail from "./components/Authentication/StepPhoneEmail/StepPhoneEmail.js";
import AppointmentForm from "./components/AppointmentForm/AppointmentForm.js";
import ApproveAppointment from "./components/ApproveAppointment/ApproveAppointment.js";
import DownloadAttendance from "./components/Admin/DownloadAttendance/DownloadAttendance.js";
import Register from "./components/Authentication/Register/Register.js";
import Login from "./components/Authentication/Login/Login.js";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute.js";
import AdminRoute from "./components/AdminRoute/AdminRoute.js";
import Unauthorized from "./components/Unauthorized/Unauthorized.js";
import CreateGame from "./components/Admin/Game/GameForm/GameForm.js";
import GameManagement from "./components/Admin/Game/GameManagement/GameManagement.js";
import GameList from "./components/GameList/GameList.js";
import CertificateGenerator from "./components/Admin/CertificateGenerator/CertificateGenerator.js";

const App = () => {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.9 });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }, []);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutMe />} />
        <Route path="/utter-your-thoughts" element={<UtterYourThoughts />} />
        <Route path="/leaderboard" element={<Table />} />
        <Route path="/appointment-form" element={<AppointmentForm />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/all-events" element={<GameList />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Authenticated Student Routes */}
        <Route
          path="/attendance"
          element={
            // <PrivateRoute>
              <RegisterStudent />
            // </PrivateRoute>
          }
        />
        <Route
          path="/mark-attendance"
          element={
            // <PrivateRoute>
              <LoginStudent />
            // </PrivateRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
           // <AdminRoute>
              <AdminLayout />
           // </AdminRoute>
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
          <Route path="certificate/:gameId" element={<CertificateGenerator />} />
        </Route>

        {/* Blog Routes (Admin Protected) */}
        <Route
          path="/blogs"
          element={
            // <AdminRoute>
              <Blog />
          //  </AdminRoute>
          }
        />
        <Route
          path="/blog/:id"
          element={
            // <AdminRoute>
              <BlogItem />
            // </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
