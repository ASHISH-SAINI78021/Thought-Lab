import React, { useState } from "react";
import Card from "../../Card/Card";
import Button from "../../Button/Button";
import TextInput from "../../TextInput/TextInput";
import styles from "../StepPhoneEmail.module.css";

const Email = ({onNext}) => {
  const [email, setEmail] = useState("");
  return (
    <Card title="Enter your email" icon="mail">
      <TextInput value={email} onChange={(e) => setEmail(e.target.value)} />
      <div className={styles.actionButtonWrap}>
        <Button text="Next" onClick={onNext} />
      </div>
      <p className={styles.bottomParagraph}>
        By entering your number, you’re agreeing to our Terms of Service and
        Privacy Policy. Thanks!
      </p>
    </Card>
  );
};

export default Email;
