import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
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
import BlogItem from "./components/Blog/BlogItem/BlogItem";
import StepAvatar from "./components/Authentication/StepAvatar/StepAvatar";
import StepName from "./components/Authentication/StepName/StepName";
import StepOtp from "./components/Authentication/StepOtp/StepOtp";
import StepPhoneEmail from "./components/Authentication/StepPhoneEmail/StepPhoneEmail";


const App = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.9,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  });
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register-student" element={<RegisterStudent />} />


          <Route path="/step-avatar" element={<StepAvatar />} />
          <Route path="/step-name" element={<StepName />} />
          <Route path="/step-otp" element={<StepOtp />} />
          <Route path="/step-phone-email" element={<StepPhoneEmail />} />




          <Route path="/attendance" element={<RegisterStudent />} />
          <Route path="/about" element={<AboutMe />} />
          <Route path="/utter-your-thoughts" element={<UtterYourThoughts />} />
          <Route path="/leaderboard" element={<Table />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminPanel />} />
            <Route path="create-blog" element={<BlogEditor />} />
            <Route path="game-score-updater" element={<GameScoreUpdater />} />
            <Route path="create-blog/full-screen" element={<BlogEditor check="true" />} />
          </Route>
          <Route path="/create-blog/full-screen" element={<BlogEditor check="false" />} />
          <Route path="/blogs" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogItem />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
