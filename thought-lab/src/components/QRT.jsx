import React, { useEffect } from 'react';
import 'animate.css';
import styles from './QRT.module.css';

const QRTInfoPage = () => {
  useEffect(() => {
    const elementsToAnimate = document.querySelectorAll(`[data-animate]`);
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate__animated', entry.target.dataset.animate);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1 
    });
    
    elementsToAnimate.forEach(element => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.responsiveMeta}></div> {/* For responsive meta tag simulation */}
      <div className={`${styles.container} animate__animated animate__fadeIn`}>
        <h1><span className={styles.floatingIcon}>🌱</span> Thought Lab Quick Response Team (QRT)</h1>
        <p data-animate="animate__fadeIn">To strengthen our community and ensure the smooth execution of Thought Lab's activities, we are launching the <strong>Quick Response Team (QRT)</strong>.</p>
        
        <h2 data-animate="animate__fadeIn">🎯 Objectives</h2>
        <p data-animate="animate__fadeIn">The QRT will be a dynamic team of dedicated members responsible for ensuring that all initiatives of Thought Lab run efficiently and with creativity.</p>
        
        <h2 data-animate="animate__fadeIn">🛠️ Responsibilities</h2>
        <ul>
          <li data-animate="animate__fadeInUp">📢 Preparing advertisements for newspapers and social media</li>
          <li data-animate="animate__fadeInUp" style={{animationDelay: '0.1s'}}>📸 Capturing event moments through photos and videos</li>
          <li data-animate="animate__fadeInUp" style={{animationDelay: '0.2s'}}>💡 Proposing innovative ideas for club growth</li>
          <li data-animate="animate__fadeInUp" style={{animationDelay: '0.3s'}}>🎨 Designing posters, banners, and other promotional material</li>
          <li data-animate="animate__fadeInUp" style={{animationDelay: '0.4s'}}>📝 Creating Google Forms for registrations and feedback</li>
          <li data-animate="animate__fadeInUp" style={{animationDelay: '0.5s'}}>🎤 Anchoring and hosting club events</li>
          <li data-animate="animate__fadeInUp" style={{animationDelay: '0.6s'}}>👥 Managing and supporting teams during events</li>
        </ul>
        
        <h2 data-animate="animate__fadeIn">🏅 Points & Rewards System</h2>
        <p data-animate="animate__fadeIn">Each member, including the secretaries, will begin with <strong>100 points</strong>. Scores will increase or decrease based on the following factors:</p>
        <ul>
          <li data-animate="animate__fadeInRight">✅ Behavior with seniors & peers</li>
          <li data-animate="animate__fadeInRight" style={{animationDelay: '0.1s'}}>🧘 Meditation Score (regularity & sincerity)</li>
          <li data-animate="animate__fadeInRight" style={{animationDelay: '0.2s'}}>📆 Attendance in Thought Lab sessions</li>
          <li data-animate="animate__fadeInRight" style={{animationDelay: '0.3s'}}>📜 Certificate Contributions (extra participation in activities/events)</li>
          <li data-animate="animate__fadeInRight" style={{animationDelay: '0.4s'}}>👥 Team Score (collaboration & leadership during events)</li>
        </ul>
        
        <div className={`${styles.highlight} ${styles.pulse}`} data-animate="animate__fadeIn">
          <h2>🔑 Exclusive Privilege for QRT Members</h2>
          <p>All QRT members will be granted <strong>Admin Access</strong> to the official Thought Lab website <span className={styles.floatingIcon}>🌐</span>. This privilege allows them to directly contribute, manage, and innovate on our club's digital platform.</p>
        </div>
        
        <h2 data-animate="animate__fadeIn">🏆 Monthly Rewards</h2>
        <p data-animate="animate__fadeIn">At the end of each month, the <strong>top 3 candidates</strong> with the highest scores will receive exciting prizes <span className={styles.floatingIcon}>🎁</span>.</p>
        
        <h2 data-animate="animate__fadeIn">🎖️ Leadership Opportunities</h2>
        <p data-animate="animate__fadeIn">Final selection of <strong>future Thought Lab secretaries</strong> will be based on these scores, ensuring that only the most dedicated and impactful members rise to leadership roles.</p>
        
        <div className={styles.footer} data-animate="animate__fadeIn">
          This system ensures fair recognition, motivates members to stay active, and keeps the spirit of <strong>discipline + creativity + collaboration</strong> alive in Thought Lab.
        </div>
      </div>
    </div>
  );
};

export default QRTInfoPage;