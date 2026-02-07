import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../Context/auth";
import { toast } from "react-hot-toast";
// Assuming the API call function is imported from an http utility file
import { studentAttendanceLogin } from "../../../http";
import styles from "./LoginStudent.module.css";
import { FiArrowRight, FiSkipForward, FiCamera } from "react-icons/fi";

const LoginStudent = () => {
    // refs
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null); // authoritative stream ref

    // state
    const [auth, setAuth] = useAuth();
    const [capturedImage, setCapturedImage] = useState(null);
    const [step, setStep] = useState(1);
    const [rollNumber, setRollNumber] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);

    const navigate = useNavigate();

    // helper to stop stream and clear video element
    const stopStream = (s) => {
        try {
            const active = s || streamRef.current || videoRef.current?.srcObject;
            if (active && typeof active.getTracks === "function") {
                active.getTracks().forEach((track) => {
                    try {
                        track.stop();
                    } catch (e) {
                        /* ignore */
                    }
                });
            }
        } catch (err) {
            console.warn("stopStream error", err);
        } finally {
            if (videoRef.current) {
                try {
                    videoRef.current.srcObject = null;
                } catch (e) {
                    /* ignore */
                }
            }
            streamRef.current = null;
            setIsStreaming(false);
        }
    };

    // initialize webcam
    const initWebcam = async () => {
        try {
            const s = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720 },
                audio: false,
            });
            streamRef.current = s;
            if (videoRef.current) {
                videoRef.current.srcObject = s;
            }
            setIsStreaming(true);
        } catch (error) {
            console.error("Camera access error:", error);
            toast.error("Camera access required for facial login");
            setIsStreaming(false);
        }
    };

    // start camera on mount (or when returning to step 1)
    useEffect(() => {
        if (step === 1) {
            stopStream();
            setCapturedImage(null);
            initWebcam();
        } else {
            // ensure stopped when leaving capture step
            stopStream();
        }

        return () => {
            stopStream();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step]);

    // capture image manually
    const captureImage = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!video) {
            toast.error("Camera not available");
            return;
        }

        const width = video.videoWidth || 1280;
        const height = video.videoHeight || 720;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedImage(dataUrl);

        // stop camera immediately after capture
        stopStream();

        // move to verification step
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!rollNumber.trim()) {
            toast.error("Roll number required");
            return;
        }

        // Show toast notification
        toast.success("We'll notify you via email once processing is complete!");

        // Prepare form data
        const formData = new FormData();
        formData.append("rollNumber", rollNumber.trim());

        if (capturedImage) {
            // Convert Data URL to Blob
            const blob = await fetch(capturedImage).then((res) => res.blob());
            formData.append("image", blob, "face.jpg");
        }

        // Redirect to processing page with form data
        navigate("/attendance-processing", {
            state: {
                formData: formData,
                rollNumber: rollNumber.trim(),
                capturedImage: capturedImage
            }
        });
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Mark Attendance</h1>
                <p className={styles.subtitle}>Secure and contactless marking</p>
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

            {/* Step 1: Manual Capture */}
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
                            <FiSkipForward /> Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Verify */}
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
                                disabled={isProcessing}
                            />
                        </div>

                        <div className={styles.actions}>
                            <button
                                type="submit"
                                className={`${styles.button} ${styles.buttonPrimary}`}
                                disabled={isProcessing || !rollNumber}
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
                                onClick={() => {
                                    // go back to capture to retake: reopen camera and clear image
                                    setCapturedImage(null);
                                    setStep(1);
                                }}
                                disabled={isProcessing}
                            >
                                Back to Capture
                            </button>
                        </div>
                    </form>

                    <p className={styles.linkText}>
                        Not registered?{" "}
                        <Link to="/register" className={styles.link}>
                            Create account
                        </Link>
                    </p>
                </div>
            )}
        </div>
    );
};

export default LoginStudent;