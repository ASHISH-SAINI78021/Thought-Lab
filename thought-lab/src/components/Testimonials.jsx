// Testimonials.js
import React, { useEffect } from 'react';
import { testimonials } from '../utils/Sources';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SpotlightCard from './react-bits/SpotlightCard';
import TiltedCard from './react-bits/TiltedCard';
import './Testimonials.css'; // Import the CSS file

gsap.registerPlugin(ScrollTrigger);

const Testimonials = () => {
    useEffect(() => {
        // Only run the animation on desktop screens
        if (window.innerWidth > 768) {
            let testCard = gsap.utils.toArray(".test-card");
            let testimonialsSection = gsap.utils.toArray(".testimonials-section");

            gsap.to(testCard, {
                xPercent: 100,
                scrollTrigger: {
                    trigger: testimonialsSection,
                    start: "top 65%",
                    end: "bottom top",
                    scrub: true,
                },
            });
        }
    }, []);

    useEffect(() => {
        return () => {
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
    }, []);

    return (
        <div className="testimonials-section">
            <div className="testimonials-header">
                <h2>What People Are Saying!</h2>
            </div>

            {/* Mobile/Tablet Layout - Vertical Stack */}
            <div className="testimonials-grid">
                {testimonials.map((item, index) => (
                    <div
                        key={index}
                        className="test-card-wrapper"
                    >
                        <div className="test-card">
                            <div className="quote-icon">“</div>
                            <p className="testimonial-text">{item.statement}</p>
                            <div className="testimonial-author">
                                <div className="author-image-wrapper">
                                    <img src={item.image} className="author-image" alt={item.name} />
                                </div>
                                <div className="author-info">
                                    <p className="author-name">{item.name}</p>
                                    <p className="author-age">{item.age}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Layout - Horizontal Scroll */}
            <div className="testimonials-horizontal">
                {testimonials.map((item, index) => (
                    <SpotlightCard
                        key={index}
                        className="test-card-wrapper"
                        spotlightColor="rgba(0, 212, 255, 0.15)"
                    >
                        <TiltedCard className="test-card">
                            <div className="quote-icon">“</div>
                            <p className="testimonial-text">{item.statement}</p>
                            <div className="testimonial-author">
                                <div className="author-image-wrapper">
                                    <img src={item.image} className="author-image" alt={item.name} />
                                </div>
                                <div className="author-info">
                                    <p className="author-name">{item.name}</p>
                                    <p className="author-age">{item.age}</p>
                                </div>
                            </div>
                        </TiltedCard>
                    </SpotlightCard>
                ))}
            </div>
        </div>
    );
};

export default Testimonials;