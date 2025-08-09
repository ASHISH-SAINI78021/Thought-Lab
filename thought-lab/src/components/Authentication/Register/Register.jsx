import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import styles from './Register.module.css';
import {url} from '../../../url'
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const branches = ['Computer Science', 'Electronics and Communication', 'Mechanical', 'Civil', 'Electrical', 'AI & Data Science', 'Mathematics', 'IIoT', 'IT', 'Production', 'MCA', 'Robotics', 'Other'];
  const programmes = ['B.Tech', 'M.Tech', 'PhD', 'Other'];
  const years = ['1st', '2nd', '3rd', '4th', '5th', 'Pass out'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'checkPassword') formDataToSend.append(key, value);
      });
      if (profilePicture) formDataToSend.append('profilePicture', profilePicture);

      const response = await fetch(`${url}/register`, {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(result.message || 'Registration successful!');
        // Reset form
        setFormData({
          name: '',
          rollNumber: '',
          year: '',
          branch: '',
          programme: '',
          email: '',
          password: '',
          checkPassword: ''
        });
        setProfilePicture(null);
        setProfilePicturePreview('');
        navigate('/');
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>Student Registration</h1>
          <p>Join our academic community</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            {/* Personal Info Column */}
            <div className={styles.formColumn}>
              <div className={styles.inputGroup}>
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={errors.name ? styles.errorInput : ''}
                />
                {errors.name && <span className={styles.error}>{errors.name}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label>Roll Number</label>
                <input
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  placeholder="22010732"
                  className={errors.rollNumber ? styles.errorInput : ''}
                />
                {errors.rollNumber && <span className={styles.error}>{errors.rollNumber}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label>Year</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={errors.year ? styles.errorInput : ''}
                >
                  <option value="">Select Year</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year} Year</option>
                  ))}
                </select>
                {errors.year && <span className={styles.error}>{errors.year}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label>Profile Picture</label>
                <div className={styles.fileUpload}>
                  <label className={styles.uploadLabel}>
                    {profilePicturePreview ? (
                      <img src={profilePicturePreview} alt="Preview" className={styles.previewImage} />
                    ) : (
                      <div className={styles.uploadPlaceholder}>
                        <svg className={styles.uploadIcon} viewBox="0 0 24 24">
                          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                        <span>Upload Photo</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className={styles.fileInput}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Academic Info Column */}
            <div className={styles.formColumn}>
              <div className={styles.inputGroup}>
                <label>Branch</label>
                <div className={styles.radioGroup}>
                  {branches.map(branch => (
                    <label key={branch} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="branch"
                        value={branch}
                        checked={formData.branch === branch}
                        onChange={handleChange}
                      />
                      <span className={styles.radioButton}></span>
                      {branch}
                    </label>
                  ))}
                </div>
                {errors.branch && <span className={styles.error}>{errors.branch}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label>Programme</label>
                <div className={styles.radioGroup}>
                  {programmes.map(programme => (
                    <label key={programme} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="programme"
                        value={programme}
                        checked={formData.programme === programme}
                        onChange={handleChange}
                      />
                      <span className={styles.radioButton}></span>
                      {programme}
                    </label>
                  ))}
                </div>
                {errors.programme && <span className={styles.error}>{errors.programme}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@example.com"
                  className={errors.email ? styles.errorInput : ''}
                />
                {errors.email && <span className={styles.error}>{errors.email}</span>}
              </div>
            </div>

            {/* Password Column */}
            <div className={styles.formColumn}>
              <div className={styles.inputGroup}>
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={errors.password ? styles.errorInput : ''}
                />
                {errors.password && <span className={styles.error}>{errors.password}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="checkPassword"
                  value={formData.checkPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={errors.checkPassword ? styles.errorInput : ''}
                />
                {errors.checkPassword && <span className={styles.error}>{errors.checkPassword}</span>}
              </div>
            </div>
          </div>

          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className={styles.spinner}></span>
                Registering...
              </>
            ) : 'Register Now'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;