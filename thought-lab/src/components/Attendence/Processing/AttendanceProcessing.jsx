import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { studentAttendanceLogin } from '../../../http';
import styles from './AttendanceProcessing.module.css';
import { FiCheck, FiLoader, FiMail, FiHome, FiAlertCircle } from 'react-icons/fi';

const AttendanceProcessing = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentStep, setCurrentStep] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const steps = [
        { id: 1, label: 'Uploading image...', icon: '📤' },
        { id: 2, label: 'Analyzing face...', icon: '🔍' },
        { id: 3, label: 'Verifying identity...', icon: '🎯' },
        { id: 4, label: 'Marking attendance...', icon: '✅' },
        { id: 5, label: 'Sending notification...', icon: '📧' }
    ];

    useEffect(() => {
        // Check if we have the required data
        if (!location.state?.rollNumber || !location.state?.capturedImage) {
            toast.error("Missing attendance data. Please try again.");
            navigate('/mark-attendance');
            return;
        }

        // Process attendance with real backend
        const processAttendance = async () => {
            try {
                // Step 1: Uploading
                setCurrentStep(1);
                await new Promise(resolve => setTimeout(resolve, 500));

                // Prepare form data
                const formData = new FormData();
                formData.append("rollNumber", location.state.rollNumber);

                if (location.state.capturedImage) {
                    const blob = await fetch(location.state.capturedImage).then((res) => res.blob());
                    formData.append("image", blob, "face.jpg");
                }

                // Step 2: Analyzing
                setCurrentStep(2);
                await new Promise(resolve => setTimeout(resolve, 300));

                // Step 3: Verifying
                setCurrentStep(3);

                // Make actual API call
                const response = await studentAttendanceLogin(formData);
                const data = response.data;

                // Step 4: Marking
                setCurrentStep(4);
                await new Promise(resolve => setTimeout(resolve, 500));

                // Step 5: Sending notification
                setCurrentStep(5);
                await new Promise(resolve => setTimeout(resolve, 500));

                // Complete
                setIsComplete(true);

                if (data?.success) {
                    setResult({
                        success: true,
                        message: data.message || "Attendance marked successfully!",
                        user: data.user
                    });
                } else {
                    setResult({
                        success: false,
                        message: data.message || "Failed to mark attendance"
                    });
                }

            } catch (error) {
                console.error("Attendance processing error:", error);
                setCurrentStep(5);
                setIsComplete(true);
                setError(error.response?.data?.message || "An error occurred while processing your attendance");
                setResult({
                    success: false,
                    message: error.response?.data?.message || "Network error. Please try again."
                });
            }
        };

        processAttendance();
    }, [location.state, navigate]);

    const handleLeave = () => {
        navigate('/');
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const handleTryAgain = () => {
        navigate('/mark-attendance');
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Processing Your Attendance</h1>
                    <p className={styles.subtitle}>
                        {isComplete
                            ? (result?.success ? '✅ Processing Complete!' : '❌ Processing Failed')
                            : 'Please wait while we verify your attendance...'}
                    </p>
                </div>

                {/* Progress Steps */}
                <div className={styles.stepsContainer}>
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className={`${styles.step} ${index < currentStep ? styles.stepComplete :
                                    index === currentStep ? styles.stepActive :
                                        styles.stepPending
                                }`}
                        >
                            <div className={styles.stepIcon}>
                                {index < currentStep ? (
                                    <FiCheck className={styles.checkIcon} />
                                ) : index === currentStep && !isComplete ? (
                                    <FiLoader className={styles.spinnerIcon} />
                                ) : index === currentStep && isComplete && !result?.success ? (
                                    <FiAlertCircle className={styles.errorIcon} />
                                ) : (
                                    <span className={styles.emoji}>{step.icon}</span>
                                )}
                            </div>
                            <div className={styles.stepContent}>
                                <p className={styles.stepLabel}>{step.label}</p>
                                {index === currentStep && !isComplete && (
                                    <div className={styles.progressBar}>
                                        <div className={styles.progressFill}></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Result Message */}
                {isComplete && result && (
                    <div className={styles.completionMessage}>
                        {result.success ? (
                            <div className={styles.emailNotice}>
                                <FiMail className={styles.mailIcon} />
                                <div>
                                    <h3>Email Notification Sent!</h3>
                                    <p>
                                        {result.message} We've sent you a confirmation email with the details.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.errorNotice}>
                                <FiAlertCircle className={styles.errorMailIcon} />
                                <div>
                                    <h3>Attendance Marking Failed</h3>
                                    <p>
                                        {result.message} We've sent you an email with more details and tips to try again.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className={styles.actions}>
                    {!isComplete ? (
                        <>
                            <button
                                className={`${styles.button} ${styles.buttonSecondary}`}
                                onClick={handleLeave}
                            >
                                Leave (Processing continues)
                            </button>
                            <button
                                className={`${styles.button} ${styles.buttonPrimary}`}
                                disabled
                            >
                                <FiLoader className={styles.buttonSpinner} />
                                Waiting...
                            </button>
                        </>
                    ) : result?.success ? (
                        <button
                            className={`${styles.button} ${styles.buttonSuccess}`}
                            onClick={handleGoHome}
                        >
                            <FiHome />
                            Go to Home
                        </button>
                    ) : (
                        <>
                            <button
                                className={`${styles.button} ${styles.buttonSecondary}`}
                                onClick={handleGoHome}
                            >
                                <FiHome />
                                Go to Home
                            </button>
                            <button
                                className={`${styles.button} ${styles.buttonPrimary}`}
                                onClick={handleTryAgain}
                            >
                                Try Again
                            </button>
                        </>
                    )}
                </div>

                {/* Info Box */}
                {!isComplete && (
                    <div className={styles.infoBox}>
                        <p>
                            💡 <strong>Tip:</strong> You can leave this page. We'll send you an email
                            notification once your attendance is processed.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendanceProcessing;
