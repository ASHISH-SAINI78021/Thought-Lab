import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../Context/auth";
import { toast } from "react-hot-toast";
import { url } from "../../../url";
import styles from "./LoginStudent.module.css";
import { FiArrowRight, FiSkipForward } from "react-icons/fi";

const LoginStudent = () => {
  const [stream, setStream] = useState(null);
  const [auth, setAuth] = useAuth();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [step, setStep] = useState(1);
  const [rollNumber, setRollNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: false,
        });
        videoRef.current.srcObject = stream;
        setStream(stream);
      } catch (error) {
        console.error("Camera access error:", error);
        toast.error("Camera access required for facial login");
      }
    };

    initWebcam();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    if (step !== 1) return;

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
  }, [step]);

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCapturedImage(canvas.toDataURL("image/jpeg", 0.9));
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rollNumber.trim()) {
      toast.error("Roll number required");
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("rollNumber", rollNumber);

      if (capturedImage) {
        const blob = await fetch(capturedImage).then(res => res.blob());
        formData.append("image", blob, "face.jpg");
      }

      const response = await fetch(`${url}/api/attendance-login`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data?.success) {
        setAuth({ ...auth, token: data.token });
        toast.success("Attendance successfully marked");
      } else {
        toast.error(data.message || "Face not matched");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Network error. Try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Facial Recognition Login</h1>
        <p className={styles.subtitle}>Secure and contactless authentication</p>
      </header>

      {/* Steps */}
      <div className={styles.steps}>
        <div className={`${styles.step} ${step >= 1 ? styles.stepActive : ""}`}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepTitle}>Face Capture</div>
        </div>
        <div className={`${styles.step} ${step >= 2 ? styles.stepActive : ""}`}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepTitle}>Verify</div>
        </div>
      </div>

      {/* Step 1 */}
      {step === 1 && (
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
              <div className={styles.countdown}>{countdown}</div>
              <p className={styles.instruction}>Position your face in the center</p>
            </div>
          </div>
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className={styles.loginForm}>
          <h2 className={styles.formTitle}>Verify Your Identity</h2>

          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured Face"
              className={styles.facePreview}
            />
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="rollNumber" className={styles.label}>
                Roll Number
              </label>
              <input
                type="text"
                id="rollNumber"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className={styles.input}
                placeholder="Enter university roll number"
                autoFocus
                required
              />
            </div>

            <div className={styles.actions}>
              <button
                type="submit"
                className={`${styles.button} ${styles.buttonPrimary}`}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className={styles.spinner}></span> Processing...
                  </>
                ) : (
                  <>
                    <FiArrowRight /> Confirm Login
                  </>
                )}
              </button>

              <button
                type="button"
                className={`${styles.button} ${styles.buttonSecondary}`}
                onClick={() => navigate("/")}
              >
                <FiSkipForward /> Skip
              </button>
            </div>
          </form>

          <p className={styles.linkText}>
            Not registered?{" "}
            <Link to="/signup" className={styles.link}>
              Create account
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default LoginStudent;
