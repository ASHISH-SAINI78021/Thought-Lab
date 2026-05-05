import React, { useEffect, useRef } from 'react';
import './About.css';

const PILLARS = [
    { icon: '🧠', label: 'Mental Wellness' },
    { icon: '🌿', label: 'Mindful Growth' },
    { icon: '🤝', label: 'Community Support' },
    { icon: '🔬', label: 'Evidence-Based' },
];

const About = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add('about-visible');
                    observer.disconnect();
                }
            },
            { threshold: 0.15 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <section className="about-dark" ref={sectionRef}>
            {/* Background mesh */}
            <div className="about-mesh" />

            <div className="about-inner">
                {/* Left column */}
                <div className="about-left">
                    <span className="about-eyebrow">Who We Are</span>
                    <h2 className="about-heading">
                        A Sanctuary for <br />
                        <span className="about-grad">Every RTU Mind.</span>
                    </h2>
                    <div className="about-accent-bar" />

                    {/* Pillar chips */}
                    <div className="about-pillars">
                        {PILLARS.map((p, i) => (
                            <div key={i} className="about-pillar">
                                <span>{p.icon}</span> {p.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right column */}
                <div className="about-right">
                    {/* Glass card */}
                    <div className="about-glass-card">
                        <p className="about-body">
                            <strong>Thought Lab</strong> is the official mental wellness platform of{' '}
                            <strong className="about-rtu">Rajasthan Technical University (RTU), Kota</strong>.
                            We are built by students, for students — a digital space where mental health
                            is never an afterthought.
                        </p>
                        <p className="about-body">
                            Through meditation tools, expert-led events, community challenges, and
                            face-recognition attendance, we make it easier for every RTU student to
                            prioritise their inner well-being without slowing down their academic journey.
                        </p>

                        {/* RTU + TIC badge row */}
                        <div className="about-badges">
                            <span className="about-badge about-badge-teal">🏛️ RTU, Kota</span>
                            <span className="about-badge about-badge-violet">🧠 Thought &amp; Innovation Centre</span>
                            <span className="about-badge about-badge-green">✅ Est. 2024</span>
                        </div>
                    </div>

                    {/* Mini stat grid */}
                    <div className="about-mini-stats">
                        {[
                            { n: '500+', l: 'Students' },
                            { n: '50+', l: 'Sessions' },
                            { n: '10+', l: 'Mentors' },
                            { n: '24/7', l: 'Support' },
                        ].map((s, i) => (
                            <div key={i} className="about-mini-stat">
                                <div className="about-mini-val">{s.n}</div>
                                <div className="about-mini-lbl">{s.l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;