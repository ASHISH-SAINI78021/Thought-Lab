import React, { useEffect, useState } from 'react';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import './About.css';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
        // Check if device is mobile
        const checkMobile = () => {
            const isMobileDevice = window.innerWidth < 768;
            setIsMobile(isMobileDevice);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        // Only run animations on non-mobile devices
        if (!isMobile) {
            let aboutUs = gsap.utils.toArray(".aboutUs");
            let aboutUsHeading = gsap.utils.toArray(".aboutUsHeading");
            let aboutUsContent = gsap.utils.toArray(".aboutUsContent");
            let aboutUsWelcome = gsap.utils.toArray(".aboutUsWelcome");

            gsap.to(aboutUs, {
                opacity: 0,
                scale: 0.8,
                y: "-50%",
                scrollTrigger: {
                    trigger: aboutUs,
                    start: "35% top",
                    end: "top -250%",
                    scrub: 0.2,
                    markers: false
                },
            });

            gsap.fromTo(aboutUsHeading,
                {
                    y: 100,
                    opacity: 0
                },
                {
                    delay: 2,
                    opacity: 1,
                    y: 0,
                    scrollTrigger: {
                        trigger: aboutUs,
                        start: "top 45%",
                        end: "top 10%",
                        scrub: 0.5,
                    },
                });

            gsap.fromTo(aboutUsContent,
                {
                    opacity: 0
                },
                {
                    opacity: 1,
                    delay: 4,
                    duration: 3,
                    y: 0,
                    scrollTrigger: {
                        trigger: aboutUs,
                        start: "top 55%",
                        end: "top top",
                        scrub: true,
                    },
                });

            gsap.fromTo(aboutUsWelcome,
                {
                    y: 200,
                    opacity: 0
                },
                {
                    opacity: 1,
                    delay: 4,
                    y: 0,
                    scrollTrigger: {
                        trigger: aboutUs,
                        start: "top 65%",
                        end: "top 25%",
                        scrub: 1,
                    },
                });
        }
        
        return () => {
            window.removeEventListener('resize', checkMobile);
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        }
    }, [isMobile]);

    return (
        <div className="aboutUs">
            <div className="about-container">
                <p className={`aboutUsWelcome ${isMobile ? 'mobile-visible' : ''}`}>
                    Welcome to Thought Lab
                </p>
                <div className="content">
                    <h1 className={`aboutUsHeading ${isMobile ? 'mobile-visible' : ''}`}>
                        Who We Are?
                    </h1>
                    <div className="about-content-text">
                        <p className={`aboutUsContent ${isMobile ? 'mobile-visible' : ''}`}>
                            Thought Lab is a supportive platform for students and young
                            adults, making mental wellness approachable and actionable.
                            "We're committed to creating a safe space where everyone feels
                            heard, supported, and empowered to prioritize their mental
                            well-being."
                        </p>
                    </div>
                </div>
                <div className="aboutUsImage"></div>
            </div>
        </div>
    )
}

export default About;