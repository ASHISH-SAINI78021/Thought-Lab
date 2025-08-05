import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./components/Home";
import AboutMe from "./components/AboutMe";
import Lenis from "lenis";
import { useEffect } from "react";
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
          <Route path="certificate/:gameId" element={<CertificateGenerator />} />
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
        <Route
          path="/blog/:id"
          element={
            <AdminRoute>
              <BlogItem />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
