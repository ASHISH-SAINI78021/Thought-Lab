import React, { useEffect } from 'react';
import { testimonials } from '../utils/Sources';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Testimonials = () => {
    useEffect(() => {
        let testCard = gsap.utils.toArray(".test-card");
        let testimonials = gsap.utils.toArray(".testimonials");

        gsap.to(testCard, {
            xPercent: 100,
            scrollTrigger: {
                trigger: testimonials,
                start: "top 65%",
                end: "bottom top",
                scrub: true,
            },
        });
    }, []);

    useEffect(() => {
        return () => {
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
    }, []);

    return (
        <div className="sticky px-[100px] testimonials h-[150vh] top-0 pt-[20vh] font-sans justify-center">
            <div className="flex items-center justify-center rounded-[15px]">
                <h2 className="font-display text-center text-[3.4rem] leading-[1.1] px-[25px] w-fit">
                    What People Are Saying!
                </h2>
            </div>
            <div className="flex overflow-hidden space-x-4 p-4 mt-[30px]">
                {testimonials.map((item, index) => (
                    <div
                        key={index}
                        className="test-card origin-left rounded-[15px] min-w-[17vw] p-[25px] shadow-lg flex flex-col justify-between min-h-[320px]"
                        style={{ backgroundColor: "#D5E8D4" }} // replaced bg-accent
                    >
                        <p className="text-justify">{item.statement}</p>
                        <div className="bottom-[25px] flex items-center">
                            <img src={item.image} className="w-[50px] rounded-full" />
                            <div className="ml-3">
                                <p className="text-left font-bold">{item.name}</p>
                                <p className="text-[15px]">{item.age}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Testimonials;
