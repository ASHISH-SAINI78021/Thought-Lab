import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../Context/auth';
import { url } from '../../../url';
import styles from './AttendanceProcessing.module.css';
import { FiCheck, FiLoader, FiMail, FiHome, FiAlertCircle } from 'react-icons/fi';

const RegistrationProcessing = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [auth] = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const steps = [
        { id: 1, label: 'Uploading data...', icon: '📤' },
        { id: 2, label: 'Extracting features...', icon: '🔍' },
        { id: 3, label: 'Saving profile...', icon: '💾' },
        { id: 4, label: 'Finalizing registration...', icon: '✅' },
        { id: 5, label: 'Sending confirmation...', icon: '📧' }
    ];

    useEffect(() => {
        if (!location.state?.rollNumber || !location.state?.name || !location.state?.capturedImage) {
            toast.error("Missing registration data. Please try again.");
            navigate('/attendance');
            return;
        }

        const processRegistration = async () => {
            try {
                // Step 1: Uploading
                setCurrentStep(1);
                await new Promise(resolve => setTimeout(resolve, 800));

                const formData = new FormData();
                formData.append("name", location.state.name);
                formData.append("rollNumber", location.state.rollNumber);

                if (location.state.capturedImage) {
                    const blob = await fetch(location.state.capturedImage).then((res) => res.blob());
                    formData.append("image", blob, "registration_face.jpg");
                }

                // Step 2: Extracting features
                setCurrentStep(2);
                await new Promise(resolve => setTimeout(resolve, 600));

                // Step 3: Saving
                setCurrentStep(3);

                // Make actual API call
                const response = await fetch(`${url}/api/attendance-register`, {
                    method: "POST",
                    headers: {
                        Authorization: auth?.token || ''
                    },
                    body: formData
                });

                const data = await response.json();

                if (!response.ok || !data?.success) {
                    throw new Error(data?.message || "Registration failed");
                }

                // Step 4: Finalizing
                setCurrentStep(4);
                await new Promise(resolve => setTimeout(resolve, 500));

                // Step 5: Sending notification
                setCurrentStep(5);
                await new Promise(resolve => setTimeout(resolve, 500));

                setIsComplete(true);
                setResult({
                    success: true,
                    message: data.message || "Registration successful!"
                });

            } catch (error) {
                console.error("Registration processing error:", error);
                setCurrentStep(5);
                setIsComplete(true);
                setError(error.message || "An error occurred while processing registration");
                setResult({
                    success: false,
                    message: error.message || "Network error. Please try again."
                });
            }
        };

        processRegistration();
    }, [location.state, navigate, auth]);

    const handleLeave = () => navigate('/');
    const handleGoHome = () => navigate('/');
    const handleTryAgain = () => navigate('/attendance');

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Processing Your Registration</h1>
                    <p className={styles.subtitle}>
                        {isComplete
                            ? (result?.success ? '✅ Registration Complete!' : '❌ Registration Failed')
                            : 'Please wait while we set up your facial profile...'}
                    </p>
                </div>

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

                {isComplete && result && (
                    <div className={styles.completionMessage}>
                        {result.success ? (
                            <div className={styles.emailNotice}>
                                <FiMail className={styles.mailIcon} />
                                <div>
                                    <h3>Welcome!</h3>
                                    <p>
                                        {result.message} Your biometric data has been securely saved.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.errorNotice}>
                                <FiAlertCircle className={styles.errorMailIcon} />
                                <div>
                                    <h3>Registration Failed</h3>
                                    <p>
                                        {result.message} Please check the constraints or try an alternative image.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className={styles.actions}>
                    {!isComplete ? (
                        <>
                            <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={handleLeave}>
                                Leave (Processing continues)
                            </button>
                            <button className={`${styles.button} ${styles.buttonPrimary}`} disabled>
                                <FiLoader className={styles.buttonSpinner} />
                                Waiting...
                            </button>
                        </>
                    ) : result?.success ? (
                        <button className={`${styles.button} ${styles.buttonSuccess}`} onClick={() => navigate('/face-recognition-success')}>
                            <FiCheck />
                            Continue
                        </button>
                    ) : (
                        <>
                            <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={handleGoHome}>
                                <FiHome />
                                Go to Home
                            </button>
                            <button className={`${styles.button} ${styles.buttonPrimary}`} onClick={handleTryAgain}>
                                Try Again
                            </button>
                        </>
                    )}
                </div>

                {!isComplete && (
                    <div className={styles.infoBox}>
                        <p>
                            💡 <strong>Tip:</strong> This might take a moment. We're securely encrypting and storing your biometric signature.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegistrationProcessing;
