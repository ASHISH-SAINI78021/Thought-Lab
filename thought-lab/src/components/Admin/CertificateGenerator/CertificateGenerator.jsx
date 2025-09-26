import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaCertificate, FaUserTie, FaCalendarAlt, FaMagic } from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import styles from './CertificateGenerator.module.css';
import NIT_Logo from '../../../assets/NIT-logo.png';

const CertificateGenerator = () => {
  const [formData, setFormData] = useState({
    eventName: 'Thought Lab Workshop',
    participant: { name: 'John Doe', position: 'Active Participant' },
    date: new Date().toISOString().split('T')[0],
    design: 'classic'
  });


  const [isGenerating, setIsGenerating] = useState(false);

  const certificateRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('participant.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        participant: { ...prev.participant, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsGenerating(true);

    const certificateElement = certificateRef.current;
    if (!certificateElement) {
        setIsGenerating(false);
        alert("Error: Certificate preview element not found.");
        return;
    }

    
    html2canvas(certificateElement, { 
        scale: 3, 
        useCORS: true 
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });


      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`certificate-${formData.participant.name.replace(/ /g, '_')}.pdf`);

      setIsGenerating(false);
    }).catch(err => {
        console.error("Error generating PDF:", err);
        alert("An error occurred while generating the PDF. See console for details.");
        setIsGenerating(false);
    });
  };

  const designOptions = [
    { value: 'classic', label: 'Classic Elegance' },
    { value: 'modern', label: 'Modern Minimal' },
    { value: 'vintage', label: 'Vintage Charm' },
    { value: 'corporate', label: 'Corporate Professional' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={styles.container}
    >
      <div className={styles.wrapper}>
        <motion.div initial={{ y: -20 }} animate={{ y: 0 }} className={styles.header}>
          <FaCertificate className={styles.headerIcon} />
          <h2 className={styles.headerTitle}>Certificate Generator</h2>
          <p className={styles.headerSubtitle}>Create beautiful certificates in seconds</p>
        </motion.div>

        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={styles.card}
        >
          <div className={styles.formWrapper}>
            <form onSubmit={handleSubmit} className={styles.form}>
              
              <div>
                <label htmlFor="eventName" className={styles.formLabel}>Event Name</label>
                <div className={styles.inputGroup}>
                  <div className={styles.inputIcon}><FaCertificate /></div>
                  <input type="text" name="eventName" id="eventName" value={formData.eventName} onChange={handleChange} className={styles.inputField} placeholder="Annual Tech Conference 2023" required />
                </div>
              </div>

              <div>
                <label htmlFor="participant.name" className={styles.formLabel}>Participant Name</label>
                <div className={styles.inputGroup}>
                  <div className={styles.inputIcon}><FaUserTie /></div>
                  <input type="text" name="participant.name" id="participant.name" value={formData.participant.name} onChange={handleChange} className={styles.inputField} placeholder="John Doe" required />
                </div>
              </div>

              <div>
                <label htmlFor="participant.position" className={styles.formLabel}>Position/Role</label>
                <div className={styles.inputGroup}>
                  <div className={styles.inputIcon}><FaUserTie /></div>
                  <input type="text" name="participant.position" id="participant.position" value={formData.participant.position} onChange={handleChange} className={styles.inputField} placeholder="Senior Developer" required />
                </div>
              </div>

              <div>
                <label htmlFor="date" className={styles.formLabel}>Date of Issue</label>
                <div className={styles.inputGroup}>
                  <div className={styles.inputIcon}><FaCalendarAlt /></div>
                  <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} className={styles.inputField} required />
                </div>
              </div>

              <div>
                <label className={styles.formLabel}>Certificate Design</label>
                <div className={styles.designGrid}>
                  {designOptions.map((option) => (
                    <motion.div
                      key={option.value}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className={`${styles.designOption} ${formData.design === option.value ? styles.selected : ''}`}
                      onClick={() => setFormData({ ...formData, design: option.value })}
                    >
                      <div className={styles.designLabel}>
                        <div className={styles.designCheckmark}></div>
                        <span>{option.label}</span>
                      </div>
                      <div className={styles.designPreview}></div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isGenerating}
                  className={styles.submitButton}
                >
                  {isGenerating ? (
                    <>
                      <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle style={{opacity: 0.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path style={{opacity: 0.75}} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <FaMagic style={{ marginRight: '0.5rem' }} />
                      Generate Certificate
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Live Preview Section */}
        <div className={styles.previewWrapper}>
            <h3 className={styles.previewHeader}>Live Preview</h3>
            
            <div className={styles.certificateWrapper}>
                <div ref={certificateRef} className={styles.certificate}>
                    
                    <div className={styles.certHeader}>
                        <div className={styles.headerLeft}>
                            <h4 className={styles.headerTitleText}>Thought Lab</h4>
                            <p className={styles.headerSubtitleText}>Inspiring Innovation</p>
                        </div>
                        <div className={styles.headerRight}>
                            {/* IMPORTANT: Place your logo in the `public` folder */}
                            <img 
                                src={NIT_Logo} 
                                alt="NIT Kurukshetra Logo" 
                                className={styles.certLogo}
                            />
                        </div>
                    </div>

                    <div className={styles.certMainContent}>
                        <h1 className={styles.certTitle}>Certificate of Achievement</h1>
                        <p className={styles.certSubtitle}>This certificate is proudly presented to</p>
                        <p className={styles.certParticipantName}>
                            {formData.participant.name || "Participant Name"}
                        </p>
                        <div className={styles.certLine}></div>
                        <p className={styles.certDescription}>
                            For outstanding performance and dedication in the 
                            <strong> {formData.eventName || "Event Name"}</strong>, 
                            achieving the position of 
                            <strong> {formData.participant.position || "Participant"}.</strong>
                        </p>
                    </div>

                    <div className={styles.certFooter}>
                        <div className={styles.certDate}>
                            <p>{formData.date || "YYYY-MM-DD"}</p>
                            <hr/>
                            <p>Date</p>
                        </div>
                        <div className={styles.certSignature}>
                            {/* IMPORTANT: Place your signature image in the `public` folder */}
                            <img 
                                src="/signature.png" 
                                alt="Coordinator's Signature" 
                                className={styles.signatureImage}
                            />
                            <hr/>
                            <p>Event Coordinator</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CertificateGenerator;