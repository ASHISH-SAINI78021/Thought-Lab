// src/components/Team/Team.jsx
import React from 'react';
import StarBorder from '../react-bits/StarBorder';
import styles from './Team.module.css';

import drLataImg from '../../assets/dr-lata-gidwani.jpg';
import drBhagwaanImg from '../../assets/dr-bhagwaan-das-gidwani.jpg';
import mrPradeepImg from '../../assets/mr-pradeep-gupta.jpg';
import mrVinodImg from '../../assets/mr-vinod-gocher.jpg';

const teamMembers = [
    {
        name: "Dr. Lata Gidwani",
        role: "Chief Coordinator",
        org: "Thought & Innovation Centre, RTU Kota",
        initials: "LG",
        color: "#2f3d61",
        accent: "#FFC3A0",
        image: drLataImg,
    },
    {
        name: "Dr. Bhagwaan Das Gidwani",
        role: "Coordinator",
        org: "Thought & Innovation Centre, RTU Kota",
        initials: "BG",
        color: "#3d5088",
        accent: "#ffb380",
        image: drBhagwaanImg,
    },
    {
        name: "Bk Pradeep Gupta",
        role: "Faculty",
        org: "Thought Lab",
        initials: "PG",
        color: "#c06030",
        accent: "#ffe0cc",
        image: mrPradeepImg,
    },
    {
        name: "Bk Vinod Gocher",
        role: "Counsellor",
        org: "Thought Lab",
        initials: "VG",
        color: "#2f3d61",
        accent: "#FFC3A0",
        image: mrVinodImg,
    }
];

const Team = () => {
    return (
        <section className={styles.section}>
            <div className={styles.waveDivider}>
                <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#f0e4d6" />
                </svg>
            </div>

            <div className={styles.inner}>
                {/* Left: Label Column */}
                <div className={styles.labelCol}>
                    <p className={styles.eyebrow}>Leadership</p>
                    <h2 className={styles.title}>Meet the<br />Guiding<br />Minds</h2>
                    <p className={styles.desc}>
                        The dedicated faculty and coordinators who lead Thought Lab's mission of mental wellness and student empowerment.
                    </p>
                    <div className={styles.accentLine} />
                </div>

                {/* Right: Cards Column */}
                <div className={styles.cardCol}>
                    {teamMembers.map((m, i) => (
                        <StarBorder
                            key={i}
                            className={styles.cardWrapper}
                            color={m.accent}
                            speed="4s"
                            style={{ animationDelay: `${i * 0.12}s` }}
                        >
                            <div className={styles.cardContent}>
                                {m.image ? (
                                    <img src={m.image} alt={m.name} className={styles.avatar} style={{ objectFit: 'cover' }} />
                                ) : (
                                    <div
                                        className={styles.avatar}
                                        style={{ background: `linear-gradient(135deg, ${m.color}, ${m.accent})` }}
                                    >
                                        <span className={styles.initials}>{m.initials}</span>
                                    </div>
                                )}
                                <div className={styles.textBlock}>
                                    <h3 className={styles.name}>{m.name}</h3>
                                    <p className={styles.role}>{m.role}</p>
                                    <p className={styles.org}>{m.org}</p>
                                </div>
                                <div
                                    className={styles.badge}
                                    style={{ background: m.accent, color: m.color }}
                                >
                                    #{i + 1}
                                </div>
                            </div>
                        </StarBorder>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Team;
