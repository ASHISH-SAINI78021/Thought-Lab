import styles from "./Home.module.css";
import { Link } from "react-router-dom";
import About from "./About";
import Team from "./Team/Team";
import Testimonials from "./Testimonials";
import Footer from "./Footer/Footer";
import TopPerformers from "./TopPerformers/TopPerformers";
import { useEffect, useRef, useState } from "react";
import SplashCursor from "./react-bits/SplashCursor";
import Ashish from "../assets/Ashish.jpg";

const FEATURES = [
  {
    icon: "🧘",
    title: "Meditation & Sadhna",
    desc: "Guided sessions, breathing timers, and daily wellness rituals built for RTU students.",
    link: "/meditation-timer",
    color: "#00d4ff",
  },
  {
    icon: "📅",
    title: "Events & Activities",
    desc: "Stay updated with Thought Lab workshops, seminars, and campus wellness drives.",
    link: "/all-events",
    color: "#a855f7",
  },
  {
    icon: "🪪",
    title: "Facial Attendance",
    desc: "Biometric face-recognition powered attendance — secure, fast, and effortless.",
    link: "/attendance",
    color: "#10b981",
  },
];

const STATS = [
  { value: "500+", label: "RTU Students" },
  { value: "50+", label: "Events Hosted" },
  { value: "100+", label: "Wellness Sessions" },
  { value: "98%", label: "Satisfaction" },
];

const QUICK_LINKS = [
  { label: "Intro", link: "/intro", icon: "✨" },
  { label: "Tracker", link: "/meditation-tracker", icon: "📊" },
  { label: "Blogs", link: "/blogs", icon: "✍️" },
  { label: "Courses", link: "/courses", icon: "📚" },
  { label: "Leaderboard", link: "/leaderboard", icon: "🏆" },
  { label: "QRT", link: "/quick-response-team", icon: "⚡" },
  { label: "Tasks", link: "/task-dashboard", icon: "✅" },
  { label: "Devices", link: "/devices", icon: "🧠" },
];

const Home = () => {
  const canvasRef = useRef(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} the install prompt`);
    setDeferredPrompt(null);
  };

  /* ── Animated dot-grid canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animFrameId;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COLS = 24;
    const ROWS = 14;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const colGap = w / COLS;
      const rowGap = h / ROWS;

      for (let c = 0; c <= COLS; c++) {
        for (let r = 0; r <= ROWS; r++) {
          const x = c * colGap;
          const y = r * rowGap;
          const wave = Math.sin(t * 0.9 + c * 0.4 + r * 0.3);
          const alpha = 0.08 + wave * 0.06;
          const radius = 1.5 + wave * 0.8;
          ctx.beginPath();
          ctx.arc(x, y, Math.max(0.5, radius), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 212, 255, ${alpha})`;
          ctx.fill();
        }
      }
      t += 0.018;
      animFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <SplashCursor />
      <TopPerformers />

      <div className={styles.page}>
        {/* ══════════════════ HERO ══════════════════ */}
        <section className={styles.hero}>
          {/* Dot-grid canvas */}
          <canvas ref={canvasRef} className={styles.dotCanvas} />

          {/* Neon orbs */}
          <div className={styles.orbTeal} />
          <div className={styles.orbViolet} />

          <div className={styles.heroInner}>
            {/* RTU badge */}
            <div className={styles.rtiBadge}>
              <span className={styles.rtiBadgeDot} />
              🏛️ Rajasthan Technical University, Kota &nbsp;·&nbsp; Official Mental Wellness Platform
            </div>

            {/* Main heading */}
            <h1 className={styles.heroHeading}>
              <span className={styles.heroLine1}>Find Your</span>
              <span className={styles.heroAccent}>Inner Peace.</span>
              <span className={styles.heroLine3}>Rise Together.</span>
            </h1>

            {/* Subtext */}
            <p className={styles.heroSub}>
              Thought Lab is RTU's dedicated space for mental wellness, growth, and balance.
              Explore meditation, events, courses, and community — all in one place.
            </p>

            {/* Primary CTAs */}
            <div className={styles.heroCtas}>
              <Link to="/register" className={styles.ctaPrimary}>
                <span>✨ Get Started Free</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>

              {deferredPrompt && (
                <button onClick={handleInstallClick} className={styles.ctaInstall}>
                  <span>📱 Install App</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                </button>
              )}

              <Link to="/intro" className={styles.ctaGhost}>
                Welcome Intro
              </Link>
              <Link to="/meditation-tracker" className={styles.ctaGhost}>
                Meditation Tracker
              </Link>
              <Link to="/all-events" className={styles.ctaGhost}>
                View Events
              </Link>
            </div>

            {/* Quick link pills */}
            <div className={styles.quickLinks}>
              {QUICK_LINKS.map((q) => (
                <Link key={q.label} to={q.link} className={styles.quickPill}>
                  {q.icon} {q.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Scroll hint */}
          <div className={styles.scrollHint}>
            <span />
          </div>
        </section>

        {/* ══════════════════ STATS ══════════════════ */}
        <div className={styles.statsBar}>
          {STATS.map((s, i) => (
            <div key={i} className={styles.statCell}>
              <div className={styles.statVal}>{s.value}</div>
              <div className={styles.statLbl}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ══════════════════ FEATURE CARDS ══════════════════ */}
        <section className={styles.featuresSection}>
          <p className={styles.sectionEyebrow}>What We Offer</p>
          <h2 className={styles.sectionTitle}>
            Everything you need for <span className={styles.glowWord}>holistic wellness</span>
          </h2>
          <div className={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <Link to={f.link} key={i} className={styles.featureCard} style={{ "--accent": f.color }}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
                <div className={styles.featureArrow}>Explore →</div>
                <div className={styles.featureGlow} />
              </Link>
            ))}
          </div>
        </section>

        {/* ══════════════════ ABOUT ══════════════════ */}
        <About />

        {/* ══════════════════ TEAM ══════════════════ */}
        <Team />

        {/* ══════════════════ TESTIMONIALS ══════════════════ */}
        <Testimonials />

        {/* ══════════════════ CREATOR ══════════════════ */}
        <section className={styles.creatorSection}>
          <div className={styles.creatorInner}>

            {/* Left: Image */}
            <div className={styles.creatorLeft}>
              <div className={styles.creatorImageRing}>
                <img src={Ashish} alt="Ashish Saini" className={styles.creatorImage} />
              </div>
              <div className={styles.creatorOrb1} />
              <div className={styles.creatorOrb2} />
            </div>

            {/* Right: Info */}
            <div className={styles.creatorRight}>
              <span className={styles.creatorBadge}>⚡ Built by</span>
              <h2 className={styles.creatorName}>Ashish Saini</h2>
              <p className={styles.creatorRole}>Full-Stack Engineer · NIT Kurukshetra</p>

              <p className={styles.creatorBio}>
                Thought Lab exists because of <strong>one developer's obsession</strong> with blending neuroscience, real-time tech, and student wellness. Architected with WebSockets, face recognition, and a full MERN backbone — to serve thousands of RTU students daily.
              </p>

              {/* Stats inline */}
              <div className={styles.creatorStats}>

                <div className={styles.cStatDiv} />
                <div className={styles.cStat}><span className={styles.cStatNum}>1000+</span><span className={styles.cStatLbl}>GitHub Contributions</span></div>
                <div className={styles.cStatDiv} />
                <div className={styles.cStat}><span className={styles.cStatNum}>1000+</span><span className={styles.cStatLbl}>Active Users</span></div>
              </div>

              {/* Achievement chips */}
              <div className={styles.creatorAchievements}>
                {["🏆 SIH College Winner", "🎯 Excalibur Top 7/60", "📦 Flipkart Grid Semifinalist"].map((a) => (
                  <span key={a} className={styles.achieveChip}>{a}</span>
                ))}
              </div>

              {/* CTAs */}
              <div className={styles.creatorCtas}>
                <a href="https://ashish-portfoliov1.netlify.app/" target="_blank" rel="noopener noreferrer" className={styles.ctaPrimary}>
                  <span>View Portfolio</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                </a>
                <a href="https://github.com/ASHISH-SAINI78021" target="_blank" rel="noopener noreferrer" className={styles.creatorGhostBtn}>
                  GitHub Profile
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* ══════════════════ FOOTER ══════════════════ */}
        <div className={styles.footerWrap}>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Home;