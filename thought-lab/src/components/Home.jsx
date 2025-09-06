import heroImage from "../assets/calm-women.png";
import "../styles/Home.css";
import { Link } from "react-router-dom";
import Features from "./Features";
import About from "./About";
import Testimonials from "./Testimonials";
import Footer from "./Footer/Footer";

const Home = () => {
  const buttonStyle = `transition-color duration-400 text-lg font-sans rounded-full px-8 py-3 font-medium`;

  return (
    <>
      <div className="">
        <div
          className={`relative px-[100px] h-[87vh] flex justify-center items-center`}
        >
          <div className="absolute bottom-[-5px] flex items-start">
            <div className={`flex flex-col shrink-0 heroImage`}>
              <img
                src={heroImage}
                className="h-[65vh] rise-up"
                alt="Calm-Lady-Breathing"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col ml-[100px] space-y-2 w-[50rem]">
              <h1
                id="heading"
                className={`font-display text-[5rem] leading-[0.9] rise-up`}
                style={{ color: "#2f3d61" }} // text-secondary
              >
                Pause. Breathe. Heal.
              </h1>
              <p
                className={`text-justify font-sans text-[1rem] p-[10px] rise-up-delayed`}
              >
                Your safe space for mental wellness, growth, and balance. At
                Thought Lab, we’re here to support you through life’s
                challenges and celebrate your victories.
              </p>
              <div className="flex space-x-3 pt-11 rise-up-more-delayed flex-wrap gap-3.5">
                <Link
                  to="/blogs"
                  className={`${buttonStyle} text-white hover:text-black`}
                  style={{
                    backgroundColor: "#2f3d61", // bg-secondary
                    hover: { backgroundColor: "#FFC3A0" }, // hover:bg-primary
                  }}
                >
                  Explore
                </Link>
                <Link
                  to="/register"
                  className={`${buttonStyle} border-[1px] text-black hover:bg-primary hover:border-primary`}
                  style={{
                    borderColor: "#FFC3A0", // border-primary
                  }}
                >
                  Join Our Community
                </Link>
                <Link
                  to="/all-events"
                  className={`${buttonStyle} border-[1px] text-black hover:bg-primary hover:border-primary`}
                  style={{
                    borderColor: "#FFC3A0", // border-primary
                  }}
                >
                  Events
                </Link>
                <Link
                  to="/quick-response-team"
                  className={`${buttonStyle} border-[1px] text-black hover:bg-primary hover:border-primary`}
                  style={{
                    borderColor: "#FFC3A0", // border-primary
                  }}
                >
                  QRT
                </Link>
                <Link
                  to="/developer"
                  className={`${buttonStyle} border-[1px] text-black hover:bg-primary hover:border-primary`}
                  style={{
                    borderColor: "#FFC3A0", // border-primary
                  }}
                >
                  Developer
                </Link>
                
                 <Link
                  to="/Almuni"
                  className={`${buttonStyle} border-[1px] text-black hover:bg-primary hover:border-primary`}
                  style={{
                    borderColor: "#FFC3A0", // border-primary
                  }}
                >
                  Alumni
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <About />
      {/* <Features /> */}
      <Testimonials />
      <div className="footer h-40px w-full" style={{ backgroundColor: "#D5E8D4",zIndex:100000 }}>
        <Footer />
      </div>
    </>
  );
};

export default Home;
