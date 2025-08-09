import React, { useState, useEffect } from "react";
import styles from './AdminPanel.module.css';
import Card from "../../Card/Card";
import {toast} from 'react-hot-toast';
import { useAuth } from "../../../Context/auth";
import {url} from '../../../url'
import io from "socket.io-client";

const socket = io(`${url}`);


const AdminPanel = () => {
  const [users, setUsers] = useState();
  const [auth, setAuth] = useAuth();
  const [liveUsers, setLiveUsers] = useState(0);
  const [events, setEvents] = useState(0);

  useEffect(() => {
    if (!socket) return;

    socket.on('active-users-update', (count) => {
      // console.log(`Live user count updated: ${count}`);
      setLiveUsers(count);
    });

    return () => {
      socket.off('active-users-update');
    };
  }, [socket]);

  useEffect(()=> {
    const init = async()=> {
      try {
        let response = await fetch(`${url}/all-users-count`, {
          headers : {
            Authorization : auth?.token
          }
        });
        if (response.ok){
          response = await response.json();
          if (response.success){
            setUsers(response.users);
          }
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }

    const init2 = async()=> {
      try {
        let response = await fetch(`${url}/all-events-count`, {
          headers : {
            Authorization : auth?.token
          }
        });
        if (response.ok){
          response = await response.json();
          if (response.success){
            setEvents(response.events);
          }
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }

    init();
    init2();
  }, []);

  return (
    <div>
      <div>
      <p style={{ fontSize: "1.5rem" , margin : "1rem" , color: "rgb(21, 118, 255)" }}>Dashboard</p>
      </div>
      <div className={styles.cards}>
        <Card content="Total Events" number={events} text="59.6%"  />
        <Card content="Total Users" number={users} text="70.5%"  />
        <Card content="Total Live Users" number={liveUsers} text="27.4%"  />
      </div>
    </div>
  );
};

export default AdminPanel;
