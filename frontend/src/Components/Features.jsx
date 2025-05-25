import React, { useEffect, useRef } from "react";
import { features } from "../utils/Sources";
import "../styles/Features.css"
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import cardImage from "../assets/card-background.jpg";

gsap.registerPlugin(ScrollTrigger);


const Features = () => {
  const featuresRef = useRef(null);
  const cardRefs = useRef([]);
  const frontElRefs = useRef([]);
  const backElRefs = useRef([]);

  useEffect(() => {
    const cards = cardRefs.current;
    const frontEls = frontElRefs.current;
    const backEls = backElRefs.current;
    const featuresEl = featuresRef.current;

    if (!featuresEl || cards.length === 0 || frontEls.length === 0 || backEls.length === 0) return;

    const totalScrollHeight = window.innerHeight * 3;
    const positions = [10, 30, 50, 70];
    const rotations = [-15, -7.5, 7.5, 15];

    // Pin cards
    ScrollTrigger.create({
      trigger: featuresEl,
      start: "top top",
      end: () => `+=${totalScrollHeight}`,
      pin: true,
      pinSpacing: true,
    });

    // Spread Cards
    cards.forEach((card, index) => {
      gsap.to(card, {
        left: `${positions[index]}%`,
        rotate: `${rotations[index]}`,
        ease: "none",
        scrollTrigger: {
          trigger: featuresEl,
          start: "top top",
          end: () => `+=${totalScrollHeight / 3}`,
          scrub: 0.5,
          id: `spread-${index}`,
        },
      });
    });

    // Flip Cards and reset rotation
    ScrollTrigger.create({
      trigger: featuresEl,
      start: "top top",
      end: () => `+=${totalScrollHeight}`,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        cards.forEach((card, index) => {
          const staggerOffset = index * 0.05;
          const startOffset = 1 / 3 + staggerOffset;
          const endOffset = 2 / 3 + staggerOffset;
          if (progress >= startOffset && progress <= endOffset) {
            const animationProgress = (progress - startOffset) * 3;
            const frontRotation = -180 * animationProgress;
            const backRotation = 180 - 180 * animationProgress;
            const cardRotation = rotations[index] * (1 - animationProgress);

            gsap.to(frontEls[index], { rotateY: frontRotation, ease: "power1.out" });
            gsap.to(backEls[index], { rotateY: backRotation, ease: "power1.out" });
            gsap.to(card, { rotateZ: cardRotation, ease: "power1.out" });
          }
        });
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);
  return (
    <div
      ref={featuresRef}
      className="bg-primary font-sans sticky top-0 pt-[18vh] features flex flex-col items-center mt-[3px] h-[150vh]"
    >
      <div className="featuresHeading flex items-center justify-center">
        <h1 className="text-black text-center font-display font-semibold text-[4rem]">
          What We Offer?
        </h1>
      </div>

      {features.map((feature, index) => (
        <div
          ref={(el) => (cardRefs.current[index] = el)}
          key={index}
          className="card relative w-[350px] h-[500px]"
        >
          <div className="card-wrapper">
            <div className="flip-card-inner">
              <div ref={(el) => (frontElRefs.current[index] = el)} className="flip-card-front">
                <img
                  src={cardImage}
                  alt=""
                  className="card-image object-cover h-[100%] w-[100%]"
                  loading="lazy"
                />
              </div>
              <div ref={(el) => (backElRefs.current[index] = el)}
                className="flip-card-back flex flex-col bg-accent detail space-y-2 ">
                <h1 className="font-semibold text-[1.2rem] text-nowrap">{feature.title}</h1>
                <p className="text-justify text-[1rem]">{feature.description}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Features;