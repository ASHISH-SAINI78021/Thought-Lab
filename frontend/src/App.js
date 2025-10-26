import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar.jsx";
import Home from "./Components/Home";
import AboutMe from "./Components/AboutMe";
import Lenis from "lenis";
import { useEffect } from "react";
import UtterYourThoughts from "./Components/UtterYourThoughts";
import AdminLayout from "./Components/Admin/AdminLayout/AdminLayout";
import AdminPanel from "./Components/Admin/AdminPanel/AdminPanel";
import Table from "./Components/Table/Table";
import BlogEditor from "./Components/Admin/BlogEditor/BlogEditor";
import Blog from "./Components/Blog/Blog";
import GameScoreUpdater from "./Components/Admin/Game/GameScoreUpdater/GameScoreUpdater";
import RegisterStudent from "./Components/Attendence/Login/RegisterStudent";
import LoginStudent from "./Components/Attendence/Login/LoginStudent";
import BlogItem from "./Components/Blog/BlogItem/BlogItem";
import StepAvatar from "./Components/Authentication/StepAvatar/StepAvatar";
import StepName from "./Components/Authentication/StepName/StepName";
import StepOtp from "./Components/Authentication/StepOtp/StepOtp";
import StepPhoneEmail from "./Components/Authentication/StepPhoneEmail/StepPhoneEmail";
import AppointmentForm from "./Components/AppointmentForm/AppointmentForm";
import ApproveAppointment from "./Components/ApproveAppointment/ApproveAppointment";
import DownloadAttendance from "./Components/Admin/DownloadAttendance/DownloadAttendance";
import Register from "./Components/Authentication/Register/Register";
import Login from "./Components/Authentication/Login/Login";
import PrivateRoute from "./Components/PrivateRoute/PrivateRoute";
import AdminRoute from "./Components/AdminRoute/AdminRoute";
import Unauthorized from "./Components/Unauthorized/Unauthorized";
import CreateGame from "./Components/Admin/Game/GameForm/GameForm";
import GameManagement from "./Components/Admin/Game/GameManagement/GameManagement";
import GameList from "./Components/GameList/GameList";
import CertificateGenerator from "./Components/Admin/CertificateGenerator/CertificateGenerator";
import Events from "./Components/Events/events.jsx";
import EventItem from "./Components/Events/EventItem/EventItem.jsx";


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
        <Route path="/events" element={<Events/>} />
        <Route path="/events/:id" element={<EventItem />} />

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