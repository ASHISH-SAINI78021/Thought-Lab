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

    if (!name.trim() || !rollNumber.trim() || !capturedImage) {
      toast.error("Missing required registration data");
      return;
    }

    setIsProcessing(true);
    toast.success("Starting registration flow...");

    // Redirect to processing page
    navigate('/registration-processing', {
      state: {
        name: name.trim(),
        rollNumber: rollNumber.trim(),
        capturedImage
      }
    });
  };

  // ---------- UI ----------
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Facial Registration</h1>
        <p className={styles.subtitle}>Secure your attendance with biometric verification</p>
      </header>

      {/* Steps Component visually matching Mark Attendance */}
      <div className={styles.steps}>
        <div className={`${styles.step} ${registrationStep >= 1 ? styles.stepActive : ''}`}>
          <div className={styles.stepNumber}>
            {registrationStep > 1 ? <FiCheck /> : "1"}
          </div>
          <div className={styles.stepTitle}>Face Capture</div>
        </div>
        <div className={`${styles.step} ${registrationStep >= 2 ? styles.stepActive : ''}`}>
          <div className={styles.stepNumber}>
            {registrationStep > 2 ? <FiCheck /> : "2"}
          </div>
          <div className={styles.stepTitle}>Details</div>
        </div>
        <div className={`${styles.step} ${registrationStep >= 3 ? styles.stepActive : ''}`}>
          <div className={styles.stepNumber}>
            {registrationStep > 3 ? <FiCheck /> : "3"}
          </div>
          <div className={styles.stepTitle}>Complete</div>
        </div>
      </div>

      {registrationStep === 1 && (
        <div className={styles.cameraSection}>
          <div className={styles.cameraContainer}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={styles.cameraFeed}
            />
            <div className={styles.overlay}>
              <p className={styles.instruction}>Position your face in the center and click Capture</p>
            </div>
          </div>

          <canvas ref={canvasRef} style={{ display: "none" }} />

          <div className={styles.actionsInline}>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={captureImage}
              disabled={isProcessing}
            >
              <FiCamera /> Capture Now
            </button>

            <button
              type="button"
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={() => {
                stopStream();
                navigate("/");
              }}
              disabled={isProcessing}
            >
              <FiX /> Cancel
            </button>
          </div>
        </div>
      )}

      {registrationStep === 2 && (
        <div className={styles.loginForm}>
          <h2 className={styles.formTitle}>Add Details</h2>

          <div className={styles.facePreviewContainer}>
            {capturedImage && (
              <img
                src={capturedImage}
                alt="Captured Face"
                className={styles.facePreview}
              />
            )}
          </div>

          <form className={styles.detailsForm}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                <FiUser className={styles.inputIcon} /> Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                placeholder="Enter your full name"
                required
                autoFocus
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="rollNumber" className={styles.label}>
                <FiUser className={styles.inputIcon} /> Roll Number
              </label>
              <input
                type="text"
                id="rollNumber"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className={styles.input}
                placeholder="Enter your university roll number"
                required
              />
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonPrimary}`}
                onClick={() => {
                  if (!name.trim() || !rollNumber.trim()) {
                    toast.error("Please enter both name and roll number");
                    return;
                  }
                  setRegistrationStep(3);
                }}
              >
                Continue <FiArrowRight />
              </button>

              <button
                type="button"
                className={`${styles.button} ${styles.buttonSecondary}`}
                onClick={() => setRegistrationStep(1)}
              >
                Back to Capture
              </button>
            </div>
          </form>
        </div>
      )}

      {registrationStep === 3 && (
        <div className={styles.loginForm}>
          <h2 className={styles.formTitle}>Confirm Registration</h2>
          <div className={styles.summaryCard}>
            <div className={styles.faceThumbnail}>
              {capturedImage && <img src={capturedImage} alt="Your face" />}
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

          <form onSubmit={handleSubmit}>
            <div className={styles.actions}>
              <button
                type="submit"
                className={`${styles.button} ${styles.buttonPrimary}`}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className={styles.spinner}></span> Registering...
                  </>
                ) : (
                  <>
                    Complete Registration <FiCheck />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setRegistrationStep(2)}
                className={`${styles.button} ${styles.buttonSecondary}`}
                disabled={isProcessing}
              >
                Back to Edit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RegisterStudent;
