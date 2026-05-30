import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './HowItWorks.module.css';

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
    {
        icon: '🧘',
        title: 'Meditation & Sadhna',
        desc: 'Log daily meditation sessions with a smart timer. Track your consistency with GitHub-style heatmaps and climb the leaderboard.',
        link: '/meditation-tracker',
        color: '#00d4ff',
        tag: 'Wellness',
    },
    {
        icon: '✅',
        title: 'Task Management',
        desc: 'Admin posts real tasks. You bid on them, get assigned, complete them, and earn Leaderboard Points. Fail? A small penalty applies.',
        link: '/task-dashboard',
        color: '#a855f7',
        tag: 'Earn Points',
    },
    {
        icon: '✍️',
        title: 'Blogs & Articles',
        desc: 'Read educational blogs posted by the team. Every blog you read rewards your Focus Pet with +15 XP.',
        link: '/blogs',
        color: '#f59e0b',
        tag: 'Earn XP',
    },
    {
        icon: '🏆',
        title: 'Live Leaderboard',
        desc: 'Real-time score rankings powered by WebSockets. Completing tasks updates your rank instantly for everyone to see.',
        link: '/leaderboard',
        color: '#10b981',
        tag: 'Compete',
    },
    {
        icon: '🐾',
        title: 'Focus Pet',
        desc: 'Your virtual companion that grows as you engage. It evolves from a Seed to a Sprout to a full Plant based on XP earned.',
        link: '/badges',
        color: '#ec4899',
        tag: 'Gamified',
    },
    {
        icon: '🏅',
        title: 'Badges & Milestones',
        desc: 'Unlock achievement badges by hitting milestones — like reading 5 blogs, completing 10 meditation sessions, or levelling your pet.',
        link: '/badges',
        color: '#f97316',
        tag: 'Achievements',
    },
    {
        icon: '🪪',
        title: 'Facial Attendance',
        desc: 'Mark your attendance using biometric face recognition — no hardware needed. Built on Face-API.js with 128D descriptors.',
        link: '/attendance',
        color: '#6366f1',
        tag: 'Biometric',
    },
    {
        icon: '📚',
        title: 'Courses',
        desc: 'Access curated educational courses with a built-in video player. Track your lesson progress and grow your knowledge.',
        link: '/courses',
        color: '#14b8a6',
        tag: 'Learn',
    },
    {
        icon: '📅',
        title: 'Events & Activities',
        desc: 'Stay connected with campus wellness drives, workshops, and seminars. Register and track upcoming Thought Lab events.',
        link: '/all-events',
        color: '#e879f9',
        tag: 'Community',
    },
    {
        icon: '⚡',
        title: 'QRT Leadership',
        desc: 'The Quick Response Team framework rewards top contributors with admin privileges — a merit-based leadership model.',
        link: '/quick-response-team',
        color: '#fb923c',
        tag: 'Leadership',
    },
];

const STUDENT_PORTAL_FEATURES = [
    {
        icon: '👤',
        title: 'Personal Profile',
        desc: 'Your identity on Thought Lab — avatar, name, roll number, branch, year, and role badge. Upload a custom profile picture anytime.',
        link: '/leaderboard',
        color: '#00d4ff',
    },
    {
        icon: '🪪',
        title: 'Attendance Tab',
        desc: 'View your full biometric attendance history. See which sessions you were present or absent and track your overall percentage.',
        link: '/leaderboard',
        color: '#10b981',
    },
    {
        icon: '📈',
        title: 'Points History',
        desc: 'A paginated feed of every point you\'ve earned or lost — from completed tasks, failed tasks, and meditation sessions — sorted by date.',
        link: '/leaderboard',
        color: '#a855f7',
    },
    {
        icon: '📊',
        title: 'Habit Tracker',
        desc: 'Details the ability to create customizable habits (either tracking checkboxes or logging time with embedded timers), accompanied by GitHub-style heatmap timelines and streak tracking.',
        link: '/student',
        color: '#06b6d4',
    },
    {
        icon: '🧑‍🏫',
        title: 'Mentor Teams',
        desc: 'Highlights the 5-student capacity and emphasizes the urgency of picking a mentor through the dashboard.',
        link: '/student',
        color: '#f59e0b',
    },
    {
        icon: '✏️',
        title: 'Edit Profile',
        desc: 'Update your personal info — name, email, phone, branch, programme, and year — directly from your portal with instant save.',
        link: '/leaderboard',
        color: '#ec4899',
    },
    {
        icon: '⚡',
        title: 'Soul XP & Tier',
        desc: 'Your meditation score accumulates as "Soul XP" which places you in an ascension tier visible on your profile and the leaderboard.',
        link: '/leaderboard',
        color: '#fb923c',
    },
];

const EARN_POINTS = [
    {
        icon: '✅',
        action: 'Complete a Task',
        reward: '+Score Reward',
        type: 'Leaderboard Points',
        color: '#10b981',
        detail: 'Admin assigns you a task. Once they mark it complete, your score reward is added to the live leaderboard instantly.',
        isPositive: true,
    },
    {
        icon: '🧘',
        action: 'Log 1 Minute of Meditation',
        reward: '+1 Pet XP',
        type: 'Per Minute',
        color: '#00d4ff',
        detail: 'Every minute of a logged meditation session awards 1 XP to your Focus Pet. More time = more growth.',
        isPositive: true,
    },
    {
        icon: '📖',
        action: 'Read a Blog Post',
        reward: '+15 Pet XP',
        type: 'Per Blog',
        color: '#f59e0b',
        detail: 'Opening and reading any blog on the platform rewards your pet with a flat 15 XP boost.',
        isPositive: true,
    },
    {
        icon: '❌',
        action: 'Fail an Assigned Task',
        reward: '-Score Penalty',
        type: 'Minimum: 0',
        color: '#ef4444',
        detail: "The admin can mark a task as failed, deducting the set penalty from your score. Your score can never go below zero.",
        isPositive: false,
    },
];

const BADGES = [
    { icon: '🐣', name: 'First Steps', desc: 'Nurture your Focus Pet to Level 2 Mastery', condition: 'Pet Level ≥ 2' },
    { icon: '🧘', name: 'Zen Seeker', desc: 'Reach Level 5 Enlightenment through mindfulness', condition: 'Pet Level ≥ 5' },
    { icon: '🌳', name: 'Garden Master', desc: 'Level 10 Zenith — A master of your internal garden', condition: 'Pet Level ≥ 10' },
    { icon: '📖', name: 'Blog Maven', desc: 'Wisdom gained through reading educational blogs', condition: 'Read 5+ Blogs' },
    { icon: '🙏', name: 'Meditation Monk', desc: 'Deep focus and persistence in meditation sessions', condition: '10+ Sessions' },
];

const PET_TIERS = [
    { emoji: '🌱', name: 'Seed', range: 'Level 1–4', desc: 'Your journey begins. Every session plants a seed of focus.', color: '#86efac' },
    { emoji: '🌿', name: 'Sprout', range: 'Level 5–9', desc: 'Consistent effort is paying off. Your focus is growing strong.', color: '#34d399' },
    { emoji: '🌳', name: 'Plant', range: 'Level 10+', desc: 'You\'ve mastered inner focus. A fully evolved mind and companion.', color: '#10b981' },
];

// ─── Component ─────────────────────────────────────────────────────────────────

const HowItWorks = () => {
    const observerRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(styles.visible);
                    }
                });
            },
            { threshold: 0.1 }
        );

        const els = document.querySelectorAll(
            `.${styles.reveal}, .${styles.revealUp}`
        );
        els.forEach((el) => observer.observe(el));
        observerRef.current = observer;

        return () => observer.disconnect();
    }, []);

    return (
        <div className={styles.page}>
            {/* ── Ambient BG ── */}
            <div className={styles.bgOrb1} />
            <div className={styles.bgOrb2} />
            <div className={styles.bgOrb3} />

            {/* ══════════════ HERO ══════════════ */}
            <section className={styles.hero}>
                <span className={styles.heroBadge}>🚀 Platform Guide</span>
                <h1 className={styles.heroTitle}>
                    How <span className={styles.accent}>Thought Lab</span> Works
                </h1>
                <p className={styles.heroSub}>
                    A gamified cognitive operating system for RTU students. Earn points,
                    grow your Focus Pet, unlock badges — all while building real mental
                    discipline.
                </p>
                <div className={styles.heroStats}>
                    <div className={styles.heroStat}><span className={styles.heroStatNum}>+15</span><span className={styles.heroStatLbl}>XP per Blog</span></div>
                    <div className={styles.heroStatDiv} />
                    <div className={styles.heroStat}><span className={styles.heroStatNum}>+1</span><span className={styles.heroStatLbl}>XP per Meditation Minute</span></div>
                    <div className={styles.heroStatDiv} />
                    <div className={styles.heroStat}><span className={styles.heroStatNum}>5</span><span className={styles.heroStatLbl}>Badges to Unlock</span></div>
                </div>
            </section>

            {/* ══════════════ FEATURES ══════════════ */}
            <section className={styles.section}>
                <div className={`${styles.sectionHeader} ${styles.reveal}`}>
                    <span className={styles.sectionTag}>What We Offer</span>
                    <h2 className={styles.sectionTitle}>Platform Features</h2>
                    <p className={styles.sectionDesc}>
                        From biometric attendance to a live leaderboard — here's everything
                        Thought Lab packs in for you.
                    </p>
                </div>
                <div className={styles.featuresGrid}>
                    {FEATURES.map((f, i) => (
                        <Link
                            to={f.link}
                            key={i}
                            className={`${styles.featureCard} ${styles.revealUp}`}
                            style={{ '--accent': f.color, animationDelay: `${i * 0.05}s` }}
                        >
                            <div className={styles.featureTopRow}>
                                <span className={styles.featureIcon}>{f.icon}</span>
                                <span className={styles.featureTag} style={{ color: f.color, borderColor: f.color }}>{f.tag}</span>
                            </div>
                            <h3 className={styles.featureTitle}>{f.title}</h3>
                            <p className={styles.featureDesc}>{f.desc}</p>
                            <div className={styles.featureArrow} style={{ color: f.color }}>Explore →</div>
                            <div className={styles.featureGlow} style={{ background: f.color }} />
                        </Link>
                    ))}
                </div>
            </section>

            {/* ══════════════ STUDENT PORTAL ══════════════ */}
            <section className={`${styles.section} ${styles.portalSection}`}>
                <div className={`${styles.sectionHeader} ${styles.reveal}`}>
                    <span className={styles.sectionTag}>Your Personal Hub</span>
                    <h2 className={styles.sectionTitle}>Student Portal</h2>
                    <p className={styles.sectionDesc}>
                        Your Student Portal is your personal command centre — a single place
                        where your entire Thought Lab journey is tracked, displayed, and
                        managed.
                    </p>
                </div>

                <div className={`${styles.portalHighlight} ${styles.reveal}`}>
                    <div className={styles.portalHighlightLeft}>
                        <div className={styles.portalBigIcon}>🎓</div>
                        <div>
                            <div className={styles.portalHighlightTitle}>Access your portal via the Leaderboard</div>
                            <div className={styles.portalHighlightSub}>
                                Click on any student's name on the Leaderboard, or navigate directly to{' '}
                                <code className={styles.portalCode}>/profile/your-id</code> to view your full dashboard.
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.portalGrid}>
                    {STUDENT_PORTAL_FEATURES.map((f, i) => (
                        <Link
                            to={f.link}
                            key={i}
                            className={`${styles.portalCard} ${styles.revealUp}`}
                            style={{ '--pcolor': f.color, animationDelay: `${i * 0.07}s`, textDecoration: 'none' }}
                        >
                            <div className={styles.portalCardIcon} style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}>
                                <span>{f.icon}</span>
                            </div>
                            <div className={styles.portalCardBody}>
                                <div className={styles.portalCardTitle}>{f.title}</div>
                                <p className={styles.portalCardDesc}>{f.desc}</p>
                            </div>
                            <div className={styles.portalCardAccent} style={{ background: f.color }} />
                        </Link>
                    ))}
                </div>
            </section>

            {/* ══════════════ EARN POINTS ══════════════ */}
            <section className={`${styles.section} ${styles.earnSection}`}>
                <div className={`${styles.sectionHeader} ${styles.reveal}`}>
                    <span className={styles.sectionTag}>Rewards System</span>
                    <h2 className={styles.sectionTitle}>How to Earn Points & XP</h2>
                    <p className={styles.sectionDesc}>
                        Every positive action gets rewarded. Here's exactly how the scoring
                        works.
                    </p>
                </div>
                <div className={styles.earnGrid}>
                    {EARN_POINTS.map((item, i) => (
                        <div
                            key={i}
                            className={`${styles.earnCard} ${styles.revealUp} ${!item.isPositive ? styles.earnNegative : ''}`}
                            style={{ '--ecolor': item.color, animationDelay: `${i * 0.08}s` }}
                        >
                            <div className={styles.earnIcon}>{item.icon}</div>
                            <div className={styles.earnBody}>
                                <div className={styles.earnAction}>{item.action}</div>
                                <div className={styles.earnDetail}>{item.detail}</div>
                            </div>
                            <div className={styles.earnRewardBadge} style={{ background: `${item.color}22`, borderColor: `${item.color}55`, color: item.color }}>
                                <span className={styles.earnRewardNum}>{item.reward}</span>
                                <span className={styles.earnRewardType}>{item.type}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Leaderboard note */}
                <div className={`${styles.infoBox} ${styles.reveal}`}>
                    <span className={styles.infoBoxIcon}>💡</span>
                    <p>
                        <strong>Leaderboard Points</strong> are separate from{' '}
                        <strong>Pet XP</strong>. Leaderboard Points come from Tasks.
                        Pet XP comes from reading Blogs and logging Meditation — and your
                        score can <em>never</em> drop below zero.
                    </p>
                </div>
            </section>

            {/* ══════════════ FOCUS PET TIERS ══════════════ */}
            <section className={styles.section}>
                <div className={`${styles.sectionHeader} ${styles.reveal}`}>
                    <span className={styles.sectionTag}>Your Digital Companion</span>
                    <h2 className={styles.sectionTitle}>Focus Pet Evolution</h2>
                    <p className={styles.sectionDesc}>
                        Your Focus Pet grows alongside your discipline. The more XP you earn,
                        the more it evolves.
                    </p>
                </div>

                <div className={styles.petFormula}>
                    <div className={`${styles.formulaCard} ${styles.reveal}`}>
                        <span className={styles.formulaIcon}>🧮</span>
                        <div>
                            <div className={styles.formulaTitle}>Level-Up Formula</div>
                            <div className={styles.formulaDesc}>XP needed to level up = <code>current level × 50</code>. Excess XP carries over.</div>
                        </div>
                    </div>
                </div>

                <div className={styles.petTiersRow}>
                    {PET_TIERS.map((tier, i) => (
                        <div
                            key={i}
                            className={`${styles.petTierCard} ${styles.revealUp}`}
                            style={{ '--tcolor': tier.color, animationDelay: `${i * 0.1}s` }}
                        >
                            {i < PET_TIERS.length - 1 && <div className={styles.petArrow}>→</div>}
                            <div className={styles.petEmoji}>{tier.emoji}</div>
                            <div className={styles.petName}>{tier.name}</div>
                            <div className={styles.petRange} style={{ color: tier.color }}>{tier.range}</div>
                            <p className={styles.petDesc}>{tier.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════ BADGES ══════════════ */}
            <section className={`${styles.section} ${styles.badgesSection}`}>
                <div className={`${styles.sectionHeader} ${styles.reveal}`}>
                    <span className={styles.sectionTag}>Achievement System</span>
                    <h2 className={styles.sectionTitle}>Badges to Unlock</h2>
                    <p className={styles.sectionDesc}>
                        Hit milestones and collect exclusive badges that appear on your
                        profile as proof of your journey.
                    </p>
                </div>
                <div className={styles.badgesGrid}>
                    {BADGES.map((badge, i) => (
                        <div
                            key={i}
                            className={`${styles.badgeCard} ${styles.revealUp}`}
                            style={{ animationDelay: `${i * 0.08}s` }}
                        >
                            <div className={styles.badgeIconWrap}>
                                <span className={styles.badgeIcon}>{badge.icon}</span>
                                <div className={styles.badgeGlow} />
                            </div>
                            <div className={styles.badgeName}>{badge.name}</div>
                            <p className={styles.badgeDesc}>{badge.desc}</p>
                            <div className={styles.badgeCondition}>
                                <span className={styles.badgeConditionDot} />
                                {badge.condition}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════ HOW TO START ══════════════ */}
            <section className={styles.section}>
                <div className={`${styles.sectionHeader} ${styles.reveal}`}>
                    <span className={styles.sectionTag}>Get Started</span>
                    <h2 className={styles.sectionTitle}>Your First 3 Steps</h2>
                </div>
                <div className={styles.stepsRow}>
                    {[
                        { num: '01', icon: '📝', title: 'Create an Account', desc: 'Register with your RTU email. It takes under a minute.' },
                        { num: '02', icon: '🧘', title: 'Log Your First Session', desc: 'Open the Meditation Timer, sit for 5 minutes, and submit. Your pet earns its first XP!' },
                        { num: '03', icon: '✅', title: 'Bid on a Task', desc: 'Visit the Task Dashboard, find an open task, and place your bid. Complete it to earn Leaderboard Points.' },
                    ].map((step, i) => (
                        <div key={i} className={`${styles.stepCard} ${styles.revealUp}`} style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className={styles.stepNum}>{step.num}</div>
                            <div className={styles.stepIcon}>{step.icon}</div>
                            <div className={styles.stepTitle}>{step.title}</div>
                            <p className={styles.stepDesc}>{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════ CTA ══════════════ */}
            <section className={styles.ctaSection}>
                <div className={`${styles.ctaBox} ${styles.reveal}`}>
                    <div className={styles.ctaOrb1} />
                    <div className={styles.ctaOrb2} />
                    <h2 className={styles.ctaTitle}>Ready to Start Your Journey?</h2>
                    <p className={styles.ctaSub}>Join Thought Lab, grow your Focus Pet, climb the leaderboard, and transform your mind.</p>
                    <div className={styles.ctaBtns}>
                        <Link to="/register" className={styles.ctaPrimary}>✨ Register Now</Link>
                        <Link to="/login" className={styles.ctaSecondary}>Already a member? Login</Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HowItWorks;
