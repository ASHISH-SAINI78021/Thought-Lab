import React from 'react'
import { Input } from 'antd';
import { Avatar, Divider, Tooltip , Badge } from 'antd';
import { NotificationOutlined } from '@ant-design/icons';
import styles from "./AdminHeader.module.css";
const { Search } = Input;

const AdminHeader = () => {
  return (
    <div className={styles.container}>
      <div className={styles.search}>
        <Search placeholder="CTRL + K" />
      </div>
      <div className={styles.right}>
        <div className={styles.notification}></div>
        <div className={styles.auth}>
            <div className={`${styles.cursor} ${styles.notification}`} >
                <Badge count={100}>
                    <NotificationOutlined style={{ fontSize: '1.5rem' }} />
                </Badge>
            </div>
            <Tooltip title="Ant User" placement="top">
                <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" />
            </Tooltip>
            <p className={`${styles.name} ${styles.cursor}`}>Ant User</p>
        </div>
      </div>
    </div>
  )
}

export default AdminHeader;
