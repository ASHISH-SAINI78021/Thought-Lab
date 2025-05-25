import heroImage from "../assets/calm-women.png";
import "../styles/Home.css";
import { Link } from "react-router-dom";
import Features from "./Features";
import About from "./About";
import Testimonials from "./Testimonials";


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
                className={`font-display text-[5rem] leading-[0.9] rise-up text-secondary`}
              >
                Pause. Breathe. Heal.
              </h1>
              <p
                className={`text-justify font-sans text-[1rem] p-[10px]  rise-up-delayed`}
              >
                Your safe space for mental wellness, growth, and balance. At
                Deep Breathes, we’re here to support you through life’s
                challenges and celebrate your victories.
              </p>
              <div className="flex space-x-3 pt-11 items-center">
                <Link
                  to="/"
                  className={`${buttonStyle} text-white bg-secondary hover:text-black hover:bg-primary`}
                >
                  Explore
                </Link>
                <Link
                  to="/"
                  className={`${buttonStyle} border-[1px] text-black hover:bg-primary hover:border-primary`}
                >
                  Join Our Community
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <About />
      <Features />
      <Testimonials />
      <div className="footer h-40px w-full bg-accent">
        dfsf
      </div>
    </>
  );
};

export default Home;
