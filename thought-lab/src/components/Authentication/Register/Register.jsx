import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import {
    User, Hash, Mail, Lock, BookOpen, Clock,
    Image as ImageIcon, ChevronDown, Eye, EyeOff, BrainCircuit, GraduationCap
} from 'lucide-react';
import { studentRegister } from '../../../http';
import styles from './Register.module.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        rollNumber: '',
        year: '',
        branch: '',
        programme: '',
        email: '',
        password: '',
        checkPassword: ''
    });

    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const branches = [
        'Computer Science', 'Electronics and Communication', 'Mechanical',
        'Civil', 'Electrical', 'AI & Data Science', 'Mathematics',
        'IIoT', 'IT', 'Production', 'MCA', 'Robotics', 'Other'
    ];
    const programmes = ['B.Tech', 'M.Tech', 'PhD', 'Other'];
    const years = ['1st', '2nd', '3rd', '4th', '5th', 'Faculty'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error as user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Image size should be less than 2MB');
                return;
            }
            setProfilePicture(file);
            setProfilePicturePreview(URL.createObjectURL(file));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.rollNumber.trim()) newErrors.rollNumber = 'Roll Number is required';
        if (!formData.year) newErrors.year = 'Year is required';
        if (!formData.branch) newErrors.branch = 'Branch is required';
        if (!formData.programme) newErrors.programme = 'Programme is required';

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (formData.password !== formData.checkPassword) {
            newErrors.checkPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please fix the errors in the form.');
            return;
        }

        setIsSubmitting(true);
        try {
            const formDataToSend = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key !== 'checkPassword') formDataToSend.append(key, value);
            });
            if (profilePicture) formDataToSend.append('profilePicture', profilePicture);

            const response = await studentRegister(formDataToSend);
            const result = response.data;

            if (result?.success) {
                toast.success(result.message || 'Registration successful! You can now log in.');
                navigate('/login');
            } else {
                toast.error(result.message || 'Registration failed');
            }
        } catch (error) {
            console.error("Registration error:", error);
            const errorMessage = error.response?.data?.message || 'Network error or server unavailable. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.registerPage}>
            <div className={styles.registerCard}>

                {/* ============ Left Panel (Decorative) ============ */}
                <div className={styles.brandPanel}>
                    <div className={styles.decorativeOrb1}></div>
                    <div className={styles.decorativeOrb2}></div>

                    <div className={styles.brandContent}>
                        <div className={styles.brandMark}>
                            <BrainCircuit size={28} strokeWidth={2.5} />
                        </div>
                        <h2>Join <span className={styles.peachText}>Thought Lab</span></h2>
                        <p>Become part of our leading academic community. Access resources, courses, and connect with peers.</p>
                    </div>

                    <div className={styles.testimonial}>
                        <p className={styles.testimonialQuote}>
                            "I learned to stay silent—not because I’m weak, but because I’m building something louder than words.
                            "
                        </p>
                        <div className={styles.testimonialAuthor}>
                            <div className={styles.authorAvatar}>A</div>
                            <div className={styles.authorInfo}>
                                <span className={styles.authorName}>Ashish</span>
                                <span className={styles.authorRole}>Batch 2026</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============ Right Panel (Form) ============ */}
                <div className={styles.formPanel}>
                    <div className={styles.mobileHeader}>
                        <div className={styles.mobileBrandMark}>
                            <BrainCircuit size={24} strokeWidth={2.5} />
                        </div>
                    </div>

                    <div className={styles.formHeader}>
                        <h1>Student Registration</h1>
                        <p>Fill in your details to create your account.</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.registerForm}>
                        <div className={styles.formGrid}>

                            {/* --- Column 1: Personal & Academic ID --- */}
                            <div className={styles.formColumn}>

                                {/* Full Name */}
                                <div className={styles.inputGroup}>
                                    <label>Full Name <span className={styles.required}>*</span></label>
                                    <div className={styles.inputWrapper}>
                                        <User size={18} className={styles.inputIcon} />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            className={errors.name ? styles.errorInput : ''}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
                                </div>

                                {/* Roll Number */}
                                <div className={styles.inputGroup}>
                                    <label>Roll Number <span className={styles.required}>*</span></label>
                                    <div className={styles.inputWrapper}>
                                        <Hash size={18} className={styles.inputIcon} />
                                        <input
                                            type="text"
                                            name="rollNumber"
                                            value={formData.rollNumber}
                                            onChange={handleChange}
                                            placeholder="22010732"
                                            className={errors.rollNumber ? styles.errorInput : ''}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    {errors.rollNumber && <span className={styles.errorMessage}>{errors.rollNumber}</span>}
                                </div>

                                {/* Year */}
                                <div className={styles.inputGroup}>
                                    <label>Year <span className={styles.required}>*</span></label>
                                    <div className={styles.inputWrapper}>
                                        <Clock size={18} className={styles.inputIcon} />
                                        <select
                                            name="year"
                                            value={formData.year}
                                            onChange={handleChange}
                                            className={errors.year ? styles.errorInput : ''}
                                            disabled={isSubmitting}
                                        >
                                            <option value="" disabled>Select Year</option>
                                            {years.map(year => (
                                                <option key={year} value={year}>{year} {year === 'Faculty' ? '' : 'Year'}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={18} className={styles.selectArrow} />
                                    </div>
                                    {errors.year && <span className={styles.errorMessage}>{errors.year}</span>}
                                </div>

                                {/* Email */}
                                <div className={styles.inputGroup}>
                                    <label>Email Address <span className={styles.required}>*</span></label>
                                    <div className={styles.inputWrapper}>
                                        <Mail size={18} className={styles.inputIcon} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="student@example.com"
                                            className={errors.email ? styles.errorInput : ''}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
                                </div>

                                {/* Passwords (moved to left col on desktop if space allows, but grid is 1fr 1fr) */}
                                <div className={styles.inputGroup}>
                                    <label>Password <span className={styles.required}>*</span></label>
                                    <div className={styles.inputWrapper}>
                                        <Lock size={18} className={styles.inputIcon} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Min 8 characters"
                                            className={errors.password ? styles.errorInput : ''}
                                            disabled={isSubmitting}
                                        />
                                        <button
                                            type="button"
                                            className={styles.passwordToggle}
                                            onClick={() => setShowPassword(!showPassword)}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
                                </div>
                            </div>

                            {/* --- Column 2: Specifics & Pictures --- */}
                            <div className={styles.formColumn}>

                                {/* Programme */}
                                <div className={styles.inputGroup}>
                                    <label>Programme <span className={styles.required}>*</span></label>
                                    <div className={styles.radioGroup}>
                                        {programmes.map(prog => (
                                            <label key={prog} className={`${styles.radioLabel} ${formData.programme === prog ? styles.activeRadio : ''}`}>
                                                <input
                                                    type="radio"
                                                    name="programme"
                                                    value={prog}
                                                    checked={formData.programme === prog}
                                                    onChange={handleChange}
                                                    disabled={isSubmitting}
                                                />
                                                <span className={styles.radioButton}></span>
                                                {prog}
                                            </label>
                                        ))}
                                    </div>
                                    {errors.programme && <span className={styles.errorMessage}>{errors.programme}</span>}
                                </div>

                                {/* Branch */}
                                <div className={styles.inputGroup}>
                                    <label>Branch <span className={styles.required}>*</span></label>
                                    <div className={styles.branchesContainer}>
                                        <div className={styles.radioGroup} style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
                                            {branches.map(branch => (
                                                <label key={branch} className={`${styles.radioLabel} ${formData.branch === branch ? styles.activeRadio : ''}`} style={{ padding: '8px' }}>
                                                    <input
                                                        type="radio"
                                                        name="branch"
                                                        value={branch}
                                                        checked={formData.branch === branch}
                                                        onChange={handleChange}
                                                        disabled={isSubmitting}
                                                    />
                                                    <span className={styles.radioButton}></span>
                                                    {branch}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    {errors.branch && <span className={styles.errorMessage}>{errors.branch}</span>}
                                </div>

                                {/* Profile Picture */}
                                <div className={styles.inputGroup}>
                                    <label>Profile Picture</label>
                                    <label className={styles.uploadLabel}>
                                        {profilePicturePreview ? (
                                            <div className={styles.previewContainer}>
                                                <img src={profilePicturePreview} alt="Preview" className={styles.previewImage} />
                                                <span className={styles.previewText}>{profilePicture?.name || 'Selected Image'}</span>
                                                <button
                                                    type="button"
                                                    className={styles.removeImage}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setProfilePicture(null);
                                                        setProfilePicturePreview('');
                                                    }}
                                                    disabled={isSubmitting}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={styles.uploadPlaceholder}>
                                                <ImageIcon size={18} />
                                                <span>Upload Photo (Max 2MB)</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleProfilePictureChange}
                                            className={styles.fileInput}
                                            disabled={isSubmitting}
                                        />
                                    </label>
                                </div>

                                {/* Confirm Password */}
                                <div className={styles.inputGroup}>
                                    <label>Confirm Password <span className={styles.required}>*</span></label>
                                    <div className={styles.inputWrapper}>
                                        <Lock size={18} className={styles.inputIcon} />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="checkPassword"
                                            value={formData.checkPassword}
                                            onChange={handleChange}
                                            placeholder="Confirm password"
                                            className={errors.checkPassword ? styles.errorInput : ''}
                                            disabled={isSubmitting}
                                        />
                                        <button
                                            type="button"
                                            className={styles.passwordToggle}
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {errors.checkPassword && <span className={styles.errorMessage}>{errors.checkPassword}</span>}
                                </div>

                            </div>
                        </div>

                        {/* --- Footer / Submit --- */}
                        <div className={styles.formFooter}>
                            <p className={styles.termsText}>
                                By registering, you agree to our <Link to="/terms" className={styles.link}>Terms of Service</Link> and <Link to="/privacy" className={styles.link}>Privacy Policy</Link>
                            </p>

                            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <span className={styles.spinner}></span>
                                        Registering...
                                    </>
                                ) : (
                                    <>
                                        <GraduationCap size={20} />
                                        Create Account
                                    </>
                                )}
                            </button>

                            <div className={styles.loginRedirect}>
                                <p>Already have an account? <Link to="/login" className={styles.link}>Sign in here</Link></p>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;