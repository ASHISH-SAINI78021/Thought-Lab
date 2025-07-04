import React from 'react'
import styles from './New.module.css';
import { ClockCircleOutlined , LoginOutlined , LogoutOutlined , FullscreenOutlined , FullscreenExitOutlined } from '@ant-design/icons';
import AdminHeader from '../AdminHeader/AdminHeader';
import { useNavigate } from 'react-router-dom';



const New = ({children}) => {
  
    const navigate = useNavigate();
  return (
    <div className={styles.container}>
        <div className={styles.slider}>
            <div className={styles.first}>
                <img src="../../../../../assets/NIT-logo.png" alt="" className={styles.logo} />
                <p className={styles.p}>NIT KKR</p>
            </div>
            <div className={styles.navigation}>
                <p className={`${styles.a} ${styles.b}`}>Navigation</p>
                <div className={styles.second}>
                    <p className={styles.b}><ClockCircleOutlined /></p>
                    <p onClick={()=> navigate("/admin")}>Dashboard</p>
                </div>
            </div>
            <div className={styles.navigation}>
                <p className={`${styles.a} ${styles.b}`}>Authentication</p>
                <div className={styles.second}>
                    <p className={styles.b}><LogoutOutlined /></p>
                    <p onClick={() => navigate("/recruitment-portal")}>Register</p>
                </div>
                <div className={styles.second}>
                    <p className={styles.b}><LoginOutlined /></p>
                    <p onClick={() => navigate("/recruitment-portal")}>Login</p>
                </div>
            </div>
            <div className={styles.navigation}>
                <p className={`${styles.a} ${styles.b}`}>Blogs</p>
                <div className={styles.second}>
                    <p className={styles.b}><FullscreenOutlined /></p>
                    <p onClick={()=> navigate("/admin/create-blog")}>Create New Blog</p>
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
                    <p onClick={()=> navigate("/admin/create-game")}>Create New Game</p>
                </div>
                <div className={styles.second}>
                    <p className={styles.b}><FullscreenExitOutlined /></p>
                    <p onClick={()=> navigate("/admin/all-games")}>All Games</p>
                </div>
                <div className={styles.second}>
                    <p className={styles.b}><FullscreenExitOutlined /></p>
                    <p onClick={()=> navigate("/admin/game-score-updater")}>Game Score Updater</p>
                </div>
            </div>
            <div className={styles.navigation}>
                <p className={`${styles.a} ${styles.b}`}>Counselling</p>
                <div className={styles.second}>
                    <p className={styles.b}><FullscreenOutlined /></p>
                    <p onClick={()=> navigate("/admin/appointments")}>Appointments</p>
                </div>
            </div>
            <div className={styles.navigation}>
                <p className={`${styles.a} ${styles.b}`}>Attendance</p>
                <div className={styles.second}>
                    <p className={styles.b}><FullscreenOutlined /></p>
                    <p onClick={()=> navigate("/admin/download-attendance")}>Download Attendance</p>
                </div>
            </div>
        </div>
        <div className={styles.mainPage}>
            <div className={styles.header}>
                <AdminHeader />
            </div>
            <div className={styles.main}>
                {children}
            </div>
        </div>
    </div>
  )
}

export default New
