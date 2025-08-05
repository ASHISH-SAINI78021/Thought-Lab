import React, { useState } from "react";
import Card from "../Card/Card";
import TextInput from '../TextInput/TextInput'
import Button from '../Button/Button';
import styles from "./StepOtp.module.css";
import { verifyOtp } from "../../../http";
import { useAuth } from "../../../Context/auth";
// import { useSelector } from "react-redux";
// import { setAuth } from "../../../store/authSlice.js"
// import { useDispatch } from "react-redux";


const StepOtp = ({ onNext }) => {
  const [otp, setOtp] = useState("");
  const [auth , setAuth] = useAuth();
  // const dispatch = useDispatch();
  // const {phone , hash} = useSelector((state)=> state.auth.otp);

  const submit = async ()=> {
    const phone = auth?.phone;
    const hash = auth?.hash;
    if (!otp || !phone || !hash){
      alert("All fields are required");
      return ;
    }
    try {
      const {data} = await verifyOtp({otp , phone : phone , hash : hash});
      console.log(data);
      // dispatch(setAuth(data));
      setAuth((prev)=> {
        return {...prev , data};
      })
      onNext(); 
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div className={styles.cardWrapper}>
      <Card title="Enter the code we just texted you" icon="lock">
        <TextInput value={otp} onChange={(e) => setOtp(e.target.value)} />
        <div className={styles.actionButtonWrap}>
          <Button onClick={submit} text="Next" />
        </div>
        <p className={styles.bottomParagraph}>
          By entering your number, you’re agreeing to our Terms of Service and
          Privacy Policy. Thanks!
        </p>
      </Card>
    </div>
  );
};

export default StepOtp;
