import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Context/auth';
import { toast } from 'react-hot-toast';
import { url } from '../../../url';
import styles from './RegisterStudent.module.css';
import { FiCamera, FiUser, FiRefreshCw, FiCheck, FiArrowRight } from 'react-icons/fi';

const RegisterStudent = () => {
  const [stream, setStream] = useState(null);
  const [auth, setAuth] = useAuth();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const navigate = useNavigate();

  // Initialize webcam with better constraints
  useEffect(() => {
    const initWebcam = async () => {
      try {
        const constraints = {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
            frameRate: { ideal: 30 }
          },
          audio: false
        };
        
        const s = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          setStream(s);
        }
      } catch (error) {
        console.error("Camera error:", error);
        toast.error("Camera access required for registration");
      }
    };

    initWebcam();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Countdown timer with better UX
  useEffect(() => {
    if (registrationStep !== 1) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          captureImage();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [registrationStep]);

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Use JPEG for smaller file size
    const imageData = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(imageData);
    setRegistrationStep(2);
  };

  const retakePhoto = () => {
    setCountdown(5);
    setRegistrationStep(1);
    toast.success('Ready to retake photo');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('rollNumber', rollNumber.trim());

      if (capturedImage) {
        const blob = await fetch(capturedImage).then(res => res.blob());
        formData.append('image', blob, 'registration_face.jpg');
      }

      const response = await fetch(`${url}/api/attendance-register`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setAuth({ ...auth, token: data.token });
        toast.success("Registration successful!");
        navigate('/dashboard');
      } else {
        throw new Error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Facial Registration</h1>
        <p className={styles.subtitle}>Secure your attendance with biometric verification</p>
      </header>

      {/* Progress Steps */}
      <div className={styles.progressSteps}>
        <div className={`${styles.step} ${registrationStep >= 1 ? styles.active : ''}`}>
          <div className={styles.stepIndicator}>
            {registrationStep > 1 ? (
              <div className={styles.stepCompleted}><FiCheck /></div>
            ) : (
              <div className={styles.stepNumber}>1</div>
            )}
          </div>
          <div className={styles.stepLabel}>Face Capture</div>
        </div>
        
        <div className={styles.stepConnector}></div>
        
        <div className={`${styles.step} ${registrationStep >= 2 ? styles.active : ''}`}>
          <div className={styles.stepIndicator}>
            {registrationStep > 2 ? (
              <div className={styles.stepCompleted}><FiCheck /></div>
            ) : (
              <div className={styles.stepNumber}>2</div>
            )}
          </div>
          <div className={styles.stepLabel}>Details</div>
        </div>
        
        <div className={styles.stepConnector}></div>
        
        <div className={`${styles.step} ${registrationStep >= 3 ? styles.active : ''}`}>
          <div className={styles.stepIndicator}>
            <div className={styles.stepNumber}>3</div>
          </div>
          <div className={styles.stepLabel}>Complete</div>
        </div>
      </div>

      {/* Step 1: Face Capture */}
      {registrationStep === 1 && (
        <div className={styles.captureSection}>
          <div className={styles.cameraContainer}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={styles.cameraFeed}
            />
            <div className={styles.overlay}>
              <div className={styles.countdown}>{countdown}</div>
              <p className={styles.instruction}>Position your face in the circle</p>
              <div className={styles.faceGuide}></div>
            </div>
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}

      {/* Step 2: Review & Details */}
      {registrationStep === 2 && (
        <div className={styles.reviewSection}>
          <h2 className={styles.sectionTitle}>Review Your Photo</h2>
          
          <div className={styles.facePreviewContainer}>
            {capturedImage && (
              <img 
                src={capturedImage} 
                alt="Captured face" 
                className={styles.facePreview}
              />
            )}
          </div>

          <form className={styles.detailsForm}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.inputLabel}>
                <FiUser className={styles.inputIcon} />
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.textInput}
                placeholder="Enter your full name"
                required
                autoFocus
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="rollNumber" className={styles.inputLabel}>
                <FiUser className={styles.inputIcon} />
                Roll Number
              </label>
              <input
                type="text"
                id="rollNumber"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className={styles.textInput}
                placeholder="Enter your roll number"
                required
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={retakePhoto}
                className={`${styles.button} ${styles.secondaryButton}`}
              >
                <FiRefreshCw /> Retake Photo
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!name.trim() || !rollNumber.trim()) {
                    toast.error("Please enter both name and roll number");
                    return;
                  }
                  setRegistrationStep(3);
                }}
                className={`${styles.button} ${styles.primaryButton}`}
              >
                Continue <FiArrowRight />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {registrationStep === 3 && (
        <div className={styles.confirmationSection}>
          <h2 className={styles.sectionTitle}>Confirm Registration</h2>
          
          <div className={styles.summaryCard}>
            <div className={styles.faceThumbnail}>
              {capturedImage && (
                <img src={capturedImage} alt="Your face" />
              )}
            </div>
            
            <div className={styles.detailsSummary}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Name:</span>
                <span className={styles.detailValue}>{name}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Roll Number:</span>
                <span className={styles.detailValue}>{rollNumber}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.confirmationForm}>
            <div className={styles.formActions}>
              <button
                type="button"
                onClick={() => setRegistrationStep(2)}
                className={`${styles.button} ${styles.secondaryButton}`}
              >
                Back to Edit
              </button>
              <button
                type="submit"
                className={`${styles.button} ${styles.primaryButton}`}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className={styles.spinner}></span>
                    Registering...
                  </>
                ) : 'Complete Registration'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RegisterStudent;