import React from 'react';
import { motion } from 'framer-motion';
import { FaReact, FaNodeJs, FaDatabase, FaCloud, FaGitAlt, FaLinkedin, FaGithub, FaTwitter, FaHtml5, FaCss3Alt } from 'react-icons/fa';
import { SiMongodb, SiExpress, SiJavascript } from 'react-icons/si';
import { CgArrowsExchangeV } from 'react-icons/cg'; 
import { BsCameraVideoFill } from 'react-icons/bs';
import styles from './Developer.module.css';
import Ashish from '../../assets/Ashish.jpg';
import ThoughtLab from '../../assets/thought-lab.png';
import CodeCollab from '../../assets/code-collab.png';
import Codershouse from '../../assets/codershouse.png';
import FaceDetection from '../../assets/face-detection.jpg';
import TheCards from '../../assets/the-cards.png';

// --- Helper for animations ---
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
};

const Developer = () => {
  const developer = {
    name: "Ashish Saini",
    title: "Full-Stack Web Developer | Software Engineer | AI Enthusiast",
    
    // --- THIS IS THE FIX ---
    // Use backticks (`) for multi-line strings
    bio: `I’m Ashish Saini, a passionate Full-Stack Developer and final-year B.Tech Information Technology student at the National Institute of Technology, Kurukshetra (Batch of 2026). With over 1000+ DSA problems solved, two-time hackathon wins, and hands-on experience in developing scalable web applications, I thrive at the intersection of creativity, problem-solving, and technology.

    I specialize in MERN stack development, real-time web applications, and backend systems, with projects ranging from collaborative coding platforms to IoT-based monitoring solutions. My notable work includes the Thought Lab Portal—a fully functional club management platform with real-time leaderboards, facial recognition-based attendance, automated event blogs, and certificate generation—and Code Collaborator, a live coding environment with shared whiteboards and instant code sync.
    
    Beyond technical skills, I’ve honed my leadership and teamwork abilities as the Secretary of Thought Lab, where I organized flagship events, mentored juniors, and built an inclusive tech community. My interests extend to machine learning, system design, and creating impactful solutions that enhance productivity and user experience.
    
    When I’m not coding, you’ll probably find me exploring new technologies, contributing to open-source projects, or brainstorming ideas for my next innovation. My goal is to keep learning, keep building, and keep making a positive impact through technology.`,
    
    profileImage: Ashish,
    skills: [
        { name: 'HTML5', icon: <FaHtml5 /> },
        { name: 'CSS3', icon: <FaCss3Alt /> },
        { name: 'JavaScript', icon: <SiJavascript /> },
        { name: 'React', icon: <FaReact /> },
        { name: 'Node.js', icon: <FaNodeJs /> },
        { name: 'Express', icon: <SiExpress /> },
        { name: 'MongoDB', icon: <SiMongodb /> },
        { name: 'SQL', icon: <FaDatabase /> },
        { name: 'WebSockets', icon: <CgArrowsExchangeV /> },
        { name: 'WebRTC', icon: <BsCameraVideoFill /> },
        { name: 'Git', icon: <FaGitAlt /> },
        { name: 'Cloud Services', icon: <FaCloud /> },
      ],
    projects: [
      {
        title: "Thought Lab (Real World Project)",
        description: "A comprehensive club management platform built with the MERN stack, featuring real-time leaderboards via WebSockets, facial recognition-based attendance, blog publishing, and automated certificate generation. Integrated a counsellor appointment system with email notifications, daily meditation reminders, and dynamic game management to enhance student engagement and wellness.",
        tech: ["React", "Node.js", "MongoDB", "WebSockets", "Deep Learning"],
        liveUrl: "https://thought-labv2.netlify.app",
        repoUrl: "https://github.com/ASHISH-SAINI78021/Thought-Lab",
        imageUrl: ThoughtLab
      },
      {
        title: "Code-Collab",
        description: `A MERN-based real-time collaborative coding platform with an integrated whiteboard for seamless team discussions, visual explanations, and simultaneous project contributions. Features include code sharing, download, and synchronized editing for an efficient workflow.`,
        tech: ["MERN", "Websockets", "Monaco-Editor", "Lottie-Files", "Ant Design"],
        liveUrl: "https://hilarious-madeleine-38b690.netlify.app/",
        repoUrl: "https://github.com/ASHISH-SAINI78021/code-collab.git",
        imageUrl: CodeCollab
      },
      {
        title: "Codershouse",
        description: `A secure WebRTC/WebSocket-powered platform for creating and managing public or private rooms with real-time communication. Implemented an OTP-based stateless authentication system to enhance speed and reduce database overhead.`,
        tech: ["MERN", "Websockets", "WebRTC"],
        liveUrl: "#",
        repoUrl: "#",
        imageUrl: Codershouse
      },
      {
        title: "Real-Time Face Reaction Identifier",
        description: ``,
        tech: ["MERN", "Deep Learning"],
        liveUrl: "https://face-recognition-teal.vercel.app/",
        repoUrl: "https://github.com/ASHISH-SAINI78021/face-recognition",
        imageUrl: FaceDetection
      },
      {
        title: "The Cards",
        description: ``,
        tech: ["HTML", "CSS", "JAVASCRIPT"],
        liveUrl: "https://lighthearted-cascaron-814208.netlify.app/",
        repoUrl: "#",
        imageUrl: TheCards
      }
    ],
    socials: {
      linkedin: "https://www.linkedin.com/in/ashish-saini-a641902b3/",
      github: "https://github.com/ASHISH-SAINI78021",
      twitter: "https://twitter.com",
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>

        {/* --- HERO SECTION --- */}
        <motion.section className={styles.hero} initial="initial" animate="animate" variants={fadeInUp}>
          <div className={styles.heroText}>
            <h1>{developer.name}</h1>
            <h2 className={styles.heroTitle}>{developer.title}</h2>
            {/* The <p> tag will not render the line breaks correctly by default */}
            {/* We can split the string by newline and map over it to fix this */}
            <div className={styles.heroBio}>
              {developer.bio.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            <div className={styles.heroButtons}>
              <a href="#contact" className={`${styles.btn} ${styles.btnPrimary}`}>Get In Touch</a>
              <a href="#projects" className={styles.btn}>View My Work</a>
            </div>
          </div>
          <motion.div className={styles.heroImageContainer} whileHover={{ scale: 1.05 }}>
            <div className={styles.imageGlow}></div>
            <img src={developer.profileImage} alt={developer.name} className={styles.heroImage} />
          </motion.div>
        </motion.section>
        
        {/* --- SKILLS SECTION --- */}
        <motion.section className={styles.section} initial="initial" animate="animate" variants={fadeInUp}>
          <h2 className={styles.sectionTitle}>My Tech Stack</h2>
          <div className={styles.skillsGrid}>
            {developer.skills.map(skill => (
              <motion.div key={skill.name} className={styles.skillCard} whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}>
                <div className={styles.skillIcon}>{skill.icon}</div>
                <span>{skill.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* --- PROJECTS SECTION --- */}
        <motion.section id="projects" className={styles.section} initial="initial" animate="animate" variants={fadeInUp}>
          <h2 className={styles.sectionTitle}>Featured Projects</h2>
          <div className={styles.projectsGrid}>
            {developer.projects.map(project => (
              <motion.div key={project.title} className={styles.projectCard} whileHover={{ scale: 1.03 }}>
                <img src={project.imageUrl} alt={project.title} className={styles.projectImage} />
                <div className={styles.projectContent}>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className={styles.projectTech}>
                    {project.tech.map(t => <span key={t}>{t}</span>)}
                  </div>
                  <div className={styles.projectLinks}>
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={styles.btn}>Live Demo</a>
                    <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.btnSecondary}`}>GitHub Repo</a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* --- CONTACT SECTION --- */}
        <motion.section id="contact" className={styles.section} initial="initial" animate="animate" variants={fadeInUp}>
          <h2 className={styles.sectionTitle}>Let's Connect</h2>
          <p className={styles.contactText}>
            I'm currently open to new opportunities and collaborations. Feel free to reach out!
          </p>
          <div className={styles.contactLinks}>
            <a href={developer.socials.linkedin} aria-label="LinkedIn" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
            <a href={developer.socials.github} aria-label="GitHub" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
            <a href={developer.socials.twitter} aria-label="Twitter" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
          </div>
          <a href="mailto:ashu78021@gmail.com" className={`${styles.btn} ${styles.btnPrimary} ${styles.emailButton}`}>
            ashu78021@gmail.com
          </a>
        </motion.section>

      </div>
      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} {developer.name}. Crafted with passion.</p>
      </footer>
    </div>
  );
};

export default Developer;