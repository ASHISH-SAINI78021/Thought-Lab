// From your theme:
// --primary: #FFC3A0;
// --secondary: #2f3d61;
// --accent: #D5E8D4;
// --text: #4A4A4A;
// --background: #faf2eb ;
// --black: #000000;

import logo from "../assets/logo.png";
import { Link, useLocation } from "react-router-dom";
import { Avatar, Tooltip } from 'antd';
import "../styles/Navbar.css";
import { useAuth } from "../Context/auth";

function Navbar() {
  const location = useLocation();
  const [auth, setAuth] = useAuth();

  const Links = [
    { name: "Home", link: "/" },
    { name: "Utter Your Thoughts", link: "/utter-your-thoughts" },
    { name: "Blogs", link: "/blogs" },
    { name: "Leaderboard", link: "/leaderboard" },
    { name: "Counsellor Support", link: "/appointment-form" },
    { name: "Attendance", link: "/mark-attendance" },
  ];

  return (
    <nav className="sticky top-0 pt-[10px] z-50 backdrop-blur-[80px]">
      <div className="z-50 top-0 flex items-center justify-between px-[100px] py-2 relative">
        {
          // Logo
          <Link to={"/"} className="">
            <div className="flex items-center space-x-5">
              <div
                id="logo-div"
                className="rounded-full p-3"
                style={{ backgroundColor: "#FFC3A0" }} // replaced bg-primary
              >
                <img src={logo} alt="logo" className="h-[3.5vw]" />
              </div>
              <span className="font-display text-3xl leading-[1] font-extrabold">
                Thought
                <br />
                Lab
              </span>
            </div>
          </Link>
        }

        {
          // Desktop Nav Items
          <div className="flex items-center">
            <ul className="flex space-x-[0.4vw]">
              {Links.map((items) => (
                <li key={items.name}>
                  <Link
                    to={items.link}
                    className={`text-[1.2em] font-sans px-[14px] rounded-full font-medium ${
                      location.pathname === items.link
                        ? "active-link"
                        : "inactive-link"
                    }`}
                  >
                    {items.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        }

        <Tooltip title={`${auth?.user?.name}`} placement="top">
          <Avatar src={`${auth?.user?.profilePicture}`} />
        </Tooltip>
      </div>
    </nav>
  );
}

export default Navbar;
