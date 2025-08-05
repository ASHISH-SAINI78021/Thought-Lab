import React, { useState, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { DownloadOutlined, PrinterOutlined, TrophyFilled, CrownFilled } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import styles from './CertificateGenerator.module.css';

const CertificateGenerator = () => {
  const { gameId } = useParams();
  const location = useLocation();
  const { game, participant, result } = location.state || {};
  const certificateRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Premium default data
  const defaultGame = {
    name: "Elite Coding Championship",
    prize: "2500",
    date: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    organizer: "Tech Masters International"
  };

  const defaultParticipant = {
    name: "Alex Johnson",
    position: "1st Place Champion",
    score: "98/100"
  };

  const currentGame = game || defaultGame;
  const currentParticipant = participant || defaultParticipant;
  const isWinner = result === 'winner';

  const handleDownloadPDF = () => {
    if (!certificateRef.current) {
      console.error("Certificate reference is not available.");
      return;
    }
  
    setLoading(true);
  
    setTimeout(async () => {
      try {
        console.log("Starting PDF generation...");
  
        const canvas = await html2canvas(certificateRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        });
  
        console.log("Canvas captured:", canvas.width, canvas.height);
  
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('landscape', 'mm', 'a4');
        const imgWidth = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  
        const fileName = `${(currentParticipant?.name || 'Participant').replace(/\s+/g, '_')}_${(currentGame?.name || 'Game').replace(/\s+/g, '_')}_Certificate.pdf`;
        pdf.save(fileName);
  
        console.log("PDF downloaded:", fileName);
      } catch (error) {
        console.error("Error generating PDF:", error);
      } finally {
        setLoading(false);
      }
    }, 300);
  };
  

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `${currentParticipant.name} - ${currentGame.name} Certificate`;
    window.print();
    document.title = originalTitle;
  };

  return (
    <div className={styles.premiumContainer}>
      <div className={styles.controlPanel}>
        <h2 className={styles.panelTitle}>Certificate Generator</h2>
        <div className={styles.buttonGroup}>
          <button 
            onClick={handleDownloadPDF} 
            disabled={loading}
            className={`${styles.actionButton} ${styles.downloadButton}`}
          >
            <DownloadOutlined className={styles.buttonIcon} />
            {loading ? 'Generating...' : 'Download High-Res PDF'}
          </button>
          <button 
            onClick={handlePrint}
            className={`${styles.actionButton} ${styles.printButton}`}
          >
            <PrinterOutlined className={styles.buttonIcon} />
            Print Certificate
          </button>
        </div>
      </div>

      <div className={styles.certificateCanvas} ref={certificateRef}>
        <div className={`${styles.premiumCertificate} ${isWinner ? styles.goldTheme : styles.silverTheme}`}>
          
          {/* Decorative Elements */}
          <div className={styles.cornerDecoration}></div>
          <div className={styles.cornerDecoration}></div>
          <div className={styles.cornerDecoration}></div>
          <div className={styles.cornerDecoration}></div>
          
          {isWinner && (
            <div className={styles.trophyBadge}>
              <TrophyFilled className={styles.trophyIcon} />
            </div>
          )}

          <div className={styles.certificateContent}>
            <div className={styles.certificateHeader}>
              <p className={styles.presentedTo}>Presented To</p>
              <h1 className={styles.certificateTitle}>
                CERTIFICATE OF {isWinner ? 'EXCELLENCE' : 'PARTICIPATION'}
              </h1>
            </div>

            <div className={styles.recipientSection}>
              <h2 className={styles.recipientName}>{currentParticipant.name}</h2>
              {isWinner && <CrownFilled className={styles.crownIcon} />}
            </div>

            <div className={styles.achievementText}>
              <p>
                {isWinner 
                  ? `has demonstrated outstanding performance by achieving ${currentParticipant.position.toLowerCase()} 
                    in ${currentGame.name} with a remarkable score of ${currentParticipant.score}, 
                    showcasing exceptional skill and dedication.`
                  : `has successfully completed and participated in ${currentGame.name} 
                    held on ${currentGame.date}, demonstrating commitment and enthusiasm.`}
              </p>
            </div>

            {isWinner && (
              <div className={styles.prizeSection}>
                <div className={styles.prizeBadge}>
                  <span className={styles.prizeAmount}>${currentGame.prize}</span>
                  <span className={styles.prizeLabel}>Award Prize</span>
                </div>
              </div>
            )}

            <div className={styles.signatureSection}>
              <div className={styles.signatureBlock}>
                <div className={styles.signatureLine}></div>
                <p className={styles.signatureTitle}>Director of Competitions</p>
                <p className={styles.organization}>{currentGame.organizer}</p>
              </div>
              <div className={styles.signatureBlock}>
                <div className={styles.signatureLine}></div>
                <p className={styles.signatureTitle}>Date of Achievement</p>
                <p className={styles.date}>{currentGame.date}</p>
              </div>
            </div>

            <div className={styles.certificateFooter}>
              <p className={styles.certificateId}>
                Certificate ID: <span>{gameId || 'CERT-' + Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
              </p>
              <p className={styles.watermark}>{currentGame.organizer}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateGenerator;