import React from "react";
import { Badge } from "antd";
import styles from "./Card.module.css";

const Card = ({content , number , text , description}) => {
  return (
    <div className={styles.container}>
    <div className={styles.container2}>
      <div>
        <p className={styles.a}>{content}</p>
      </div>
      <div className={styles.ribbon}>
        <h3>{number}</h3>
        <Badge.Ribbon text={`${text}`}></Badge.Ribbon>
      </div>
      </div>
      <div>
        <p className={styles.discription}>You made an extra <span className={styles.blue}>35,000</span> this year</p>
      </div>
    </div>
  );
};

export default Card;
