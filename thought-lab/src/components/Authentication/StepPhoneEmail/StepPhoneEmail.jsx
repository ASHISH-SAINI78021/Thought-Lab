import React, { useState } from "react";
import styles from "./StepPhoneEmail.module.css";
import Phone from "./Phone/Phone";
import Email from "./Email/Email";

const PhoneEmailMap = {
  phone: Phone,
  email: Email,
};

const StepPhoneEmail = ({ onNext }) => {
  const [type, setType] = useState("phone");
  const Component = PhoneEmailMap[type];

  return (
    <div className={styles.container}>
      <div className={styles.cardWrapper}>
        <div>
          <div className={styles.buttonWrap}>
            <button className={`${styles.tabButton} ${type === "phone" ? styles.active: ""}`} onClick={() => setType("phone")}>
              <img src="/images/phone_android.png" alt="phone" />
            </button>
            <button className={`${styles.tabButton} ${type === "email" ? styles.active: ""}`} onClick={() => setType("email")}>
              <img src="/images/mail.png" alt="" />
            </button>
          </div>
        </div>
      </div>

      <Component onNext={onNext} />
    </div>
  );
};

export default StepPhoneEmail;
