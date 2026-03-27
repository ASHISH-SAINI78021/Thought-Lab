import React, { useState } from 'react'
import styles from './New.module.css';
import { ClockCircleOutlined, LoginOutlined, LogoutOutlined, FullscreenOutlined, FullscreenExitOutlined, KeyOutlined, MenuOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Context/auth';
import NIT_Logo from '../../../assets/NIT-logo.png'



const New = ({ children }) => {
    const [auth] = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const goTo = (path) => {
        navigate(path);
        setSidebarOpen(false); // close sidebar on mobile after nav
    };

    return (
        <div className={styles.container}>
            {/* Overlay (click to close) */}
            {sidebarOpen && (
                <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
            )}

            <div className={`${styles.slider} ${sidebarOpen ? styles.sliderOpen : ''}`}>
                <div className={styles.first}>
                    <img src={NIT_Logo} alt="" className={styles.logo} />
                    <p className={styles.p}>NIT KKR</p>
                </div>
                <div className={styles.navigation}>
                    <p className={`${styles.a} ${styles.b}`}>Navigation</p>
                    <div className={styles.second}>
                        <p className={styles.b}><ClockCircleOutlined /></p>
                        <p onClick={() => goTo("/admin")}>Dashboard</p>
                    </div>
                </div>
                <div className={styles.navigation}>
                    <p className={`${styles.a} ${styles.b}`}>Authentication</p>
                    <div className={styles.second}>
                        <p className={styles.b}><LogoutOutlined /></p>
                        <p onClick={() => goTo("/admin/promote-admin")}>Register</p>
                    </div>
                    {(auth?.user?.role === 'superAdmin' || auth?.user?.role === 'admin') && (
                        <div className={styles.second}>
                            <p className={styles.b}><KeyOutlined /></p>
                            <p onClick={() => goTo("/admin/change-password")}>Change Password</p>
                        </div>
                    )}
                    <div className={styles.second}>
                        <p className={styles.b}><LoginOutlined /></p>
                        <p onClick={() => goTo("/login")}>Login</p>
                    </div>
                </div>
                <div className={styles.navigation}>
                    <p className={`${styles.a} ${styles.b}`}>Blogs</p>
                    <div className={styles.second}>
                        <p className={styles.b}><FullscreenOutlined /></p>
                        <p onClick={() => goTo("/admin/create-blog")}>Create New Blog</p>
                    </div>
                    <div className={styles.second}>
                        <p className={styles.b}><FullscreenExitOutlined /></p>
                        <p>All Blogs</p>
                    </div>
                </div>
                <div className={styles.navigation}>
                    <p className={`${styles.a} ${styles.b}`}>Games</p>
                    <div className={styles.second}>
                        <p className={styles.b}><FullscreenOutlined /></p>
                        <p onClick={() => goTo("/admin/create-game")}>Create New Game</p>
                    </div>
                    <div className={styles.second}>
                        <p className={styles.b}><FullscreenExitOutlined /></p>
                        <p onClick={() => goTo("/admin/all-games")}>All Games</p>
                    </div>
                    <div className={styles.second}>
                        <p className={styles.b}><FullscreenExitOutlined /></p>
                        <p onClick={() => goTo("/admin/game-score-updater")}>Game Score Updater</p>
                    </div>
                </div>
                <div className={styles.navigation}>
                    <p className={`${styles.a} ${styles.b}`}>Task Delegation</p>
                    <div className={styles.second}>
                        <p className={styles.b}><FullscreenOutlined /></p>
                        <p onClick={() => goTo("/task-manager")}>Task Manager</p>
                    </div>
                </div>
                <div className={styles.navigation}>
                    <p className={`${styles.a} ${styles.b}`}>Courses</p>
                    <div className={styles.second}>
                        <p className={styles.b}><FullscreenOutlined /></p>
                        <p onClick={() => goTo("/admin/create-course")}>Create New Course</p>
                    </div>
                    <div className={styles.second}>
                        <p className={styles.b}><FullscreenExitOutlined /></p>
                        <p onClick={() => goTo("/admin/all-games")}>All Courses</p>
                    </div>
                </div>
                <div className={styles.navigation}>
                    <p className={`${styles.a} ${styles.b}`}>Counselling</p>
                    <div className={styles.second}>
                        <p className={styles.b}><FullscreenOutlined /></p>
                        <p onClick={() => goTo("/admin/appointments")}>Appointments</p>
                    </div>
                </div>
                <div className={styles.navigation}>
                    <p className={`${styles.a} ${styles.b}`}>Attendance</p>
                    <div className={styles.second}>
                        <p className={styles.b}><FullscreenOutlined /></p>
                        <p onClick={() => goTo("/admin/download-attendance")}>Download Attendance</p>
                    </div>
                    <div className={styles.second}>
                        <p className={styles.b}><FullscreenOutlined /></p>
                        <p onClick={() => goTo("/admin/attendance-records")}>View Records</p>
                    </div>
                </div>
                <div className={styles.navigation}>
                    <p className={`${styles.a} ${styles.b}`}>Certificates</p>
                    <div className={styles.second}>
                        <p className={styles.b}><FullscreenOutlined /></p>
                        <p onClick={() => goTo("/admin/create-certificates")}>Create Certificates</p>
                    </div>
                </div>
            </div>
            <div className={styles.mainPage}>
                <div className={styles.header}>
                    {/* Mobile hamburger button moved inside header */}
                    <button
                        className={styles.hamburger}
                        onClick={() => setSidebarOpen(prev => !prev)}
                        aria-label="Toggle navigation"
                    >
                        {sidebarOpen ? <CloseOutlined /> : <MenuOutlined />}
                    </button>
                </div>
                <div className={styles.main}>
                    {children}
                </div>
            </div>
        </div>
    )
}

export default New
