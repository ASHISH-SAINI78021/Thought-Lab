import React, { useState } from "react";
import Card from "../../Card/Card";
import Button from "../../Button/Button";
import TextInput from "../../TextInput/TextInput";
import styles from "../StepPhoneEmail.module.css";
import { sendOtp } from "../../../../http/index";
import { useAuth } from "../../../../Context/auth";
// import { useDispatch } from "react-redux";
// import { setOtp } from "../../../../store/authSlice";

const Phone = ({ onNext }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [auth , setAuth] = useAuth();
  // const dispatch = useDispatch();

  const submit = async () => {
    if (!phoneNumber) {
      alert("All fields are required");
      return;
    }
    try {
      const { data } = await sendOtp({ phone: phoneNumber });
      console.log(data);
      // dispatch(setOtp({ phone: data.phone, hash: data.hash }));
      setAuth((prev)=> {
        return {...prev , phone : data?.phone , hash : data?.hash};
      });
      onNext();
    } catch (error) {
      console.log(error);
    }
    // server request
  };
  return (
    <Card title="Enter your phone number" icon="Phone">
      <TextInput
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <div className={styles.actionButtonWrap}>
        <Button text="Next" onClick={submit} />
      </div>
      <p className={styles.bottomParagraph}>
        By entering your number, you’re agreeing to our Terms of Service and
        Privacy Policy. Thanks!
      </p>
    </Card>
  );
};

export default Phone;
