import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Context/auth';
import { toast } from 'react-hot-toast';
import { url } from '../../../url';
import styles from './RegisterStudent.module.css';
import { FiCamera, FiUser, FiCheck, FiArrowRight, FiX } from 'react-icons/fi';

const RegisterStudent = () => {
  // refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null); // single authoritative stream reference

  // state
  const [auth, setAuth] = useAuth();
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const navigate = useNavigate();

  // ---------- helper: stop stream ----------
  const stopStream = (s) => {
    try {
      const active = s || streamRef.current || videoRef.current?.srcObject;
      if (active && typeof active.getTracks === 'function') {
        active.getTracks().forEach(track => {
          try { track.stop(); } catch (e) { /* ignore */ }
        });
      }
    } catch (err) {
      console.warn('stopStream error', err);
    } finally {
      // ensure video element is cleared
      if (videoRef.current) {
        try { videoRef.current.srcObject = null; } catch (e) { /* ignore */ }
      }
      streamRef.current = null;
      setIsStreaming(false);
    }
  };

  // ---------- init webcam (re-usable) ----------
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
      // request media
      const s = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      setIsStreaming(true);
    } catch (error) {
      console.error("Camera error:", error);
      toast.error("Camera access required for registration");
      setIsStreaming(false);
    }
  };

  // ---------- initialize webcam when entering capture step ----------
  useEffect(() => {
    if (registrationStep === 1) {
      // stop any previous stream synchronously
      stopStream();

      // clear previous photo so user gets a fresh start
      setCapturedImage(null);

      // request camera
      initWebcam();
    } else {
      // leaving capture step -> ensure camera stopped
      stopStream();
    }

    // cleanup on unmount
    return () => {
      stopStream();
    };
    // intentionally depend only on registrationStep
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registrationStep]);

  // ---------- capture image ----------
  const captureImage = () => {
    // guard: don't capture twice
    if (capturedImage || registrationStep !== 1) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video) {
      toast.error("Camera not available");
      return;
    }

    // protect against zero dimensions
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(imageData);

    // Immediately stop any active stream and clear video srcObject
    stopStream();

    // finalize capture state: move to review/details step
    setRegistrationStep(2);
  };

  // ---------- submit registration ----------
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
        headers: {
          Authorization: auth?.token || ''
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setAuth({ ...auth, token: data.token });
        toast.success("Registration successful!");
        navigate('/mark-attendance');
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

  // ---------- UI ----------
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Facial Registration</h1>
        <p className={styles.subtitle}>Secure your attendance with biometric verification</p>
      </header>

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
              <p className={styles.instruction}>Position your face in the circle and click Capture</p>
              <div className={styles.faceGuide}></div>
            </div>
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          <div className={styles.captureActions}>
            <button
              type="button"
              onClick={() => {
                stopStream();
                navigate(-1);
              }}
              className={`${styles.button} ${styles.secondaryButton}`}
            >
              <FiX /> Cancel
            </button>
            <button
              type="button"
              onClick={captureImage}
              className={`${styles.button} ${styles.primaryButton}`}
            >
              <FiCamera /> Capture Now
            </button>
          </div>
        </div>
      )}

      {registrationStep === 2 && (
        <div className={styles.reviewSection}>
          <h2 className={styles.sectionTitle}>Review Your Photo</h2>
          <div className={styles.facePreviewContainer}>
            {capturedImage && <img src={capturedImage} alt="Captured face" className={styles.facePreview} />}
          </div>

          <form className={styles.detailsForm}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.inputLabel}>
                <FiUser className={styles.inputIcon} /> Full Name
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
                <FiUser className={styles.inputIcon} /> Roll Number
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
              {/* No Retake button per your request.
                  If user wants to retake, they can click Back to Capture (we'll reopen camera). */}
              <button
                type="button"
                onClick={() => setRegistrationStep(1)}
                className={`${styles.button} ${styles.secondaryButton}`}
              >
                Back to Capture
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

      {registrationStep === 3 && (
        <div className={styles.confirmationSection}>
          <h2 className={styles.sectionTitle}>Confirm Registration</h2>
          <div className={styles.summaryCard}>
            <div className={styles.faceThumbnail}>{capturedImage && <img src={capturedImage} alt="Your face" />}</div>
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
              <button type="button" onClick={() => setRegistrationStep(2)} className={`${styles.button} ${styles.secondaryButton}`}>
                Back to Edit
              </button>
              <button type="submit" className={`${styles.button} ${styles.primaryButton}`} disabled={isProcessing}>
                {isProcessing ? (<><span className={styles.spinner}></span> Registering...</>) : 'Complete Registration'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RegisterStudent;
