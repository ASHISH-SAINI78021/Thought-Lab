import React, { useEffect, useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { setAvatar } from '../../../store/activateSlice';
import Card from "../Card/Card";
import Button from '../Button/Button';
import { activate } from '../../../http';
// import {setAuth} from "../../../store/authSlice";
import styles from './StepAvatar.module.css';
import Loader from '../Loader/Loader';
import { useAuth } from '../../../Context/auth';

const StepAvatar = ({ onNext }) => {
  // const dispatch = useDispatch();
  // const { name, avatar } = useSelector((state) => state.activate);
  const [image, setImage] = useState('/images/Ashish.jpg');
  const [loading , setLoading] = useState(false);
  const [unMounted , setUnMounted] = useState(false);
  const [auth , setAuth] = useAuth();

  const captureImage = (e) => {
   
    console.log("File input triggered"); // Debugging
    const file = e.target.files[0];
    if (!file) {
      console.log("No file selected"); // Handle empty file selection
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64Image = reader.result;
      console.log("Base64 Image:", base64Image); 
      setImage(base64Image);
      setAuth((prev)=> {
        return {...prev , avatar : base64Image};
      })
    };

    reader.onerror = () => {
      console.error("Error reading file:", reader.error);
    };
  };

  const submit = async () => {
    const name = auth?.name;
    const avatar = auth?.avatar;
    if (!name || !avatar){
      alert("All fields are required");
      return ;
    }
    setLoading(true);
    try {
      const { data } = await activate({ name, avatar });
      if (data.auth){
        // check
        if (!unMounted){
          // dispatch(setAuth(data));
          setAuth(data);
        }
      }
      console.log("Response from backend:", data);
      setLoading(false);
      // onNext();
    } catch (error) {
      console.error("Error during activation:", error);
      setLoading(false);
    }
  };

  useEffect(()=>{
    return ()=> {
      setUnMounted(true);
    }
  } , []);

  if (loading){
    return <Loader messsage="Activation in progress" />;
  }

  return (
    <div className={styles.container}>
      <Card title={`Okay, ${auth?.name}`} icon="monkey-emoji">
        <p className={styles.subheading}>How's this photo?</p>
        <div className={styles.container2}>
        <div className={styles.avatarWrapper}>
          <img className={styles.avatarImage} src={image} alt="avatar" />
        </div>
        </div>
        <div>
          <input
            onChange={captureImage}
            id="avatarInput"
            type="file"
            className={styles.avatarInput}
          />
          <label className={styles.avatarLabel} htmlFor="avatarInput">
            Choose a different photo
          </label>
        </div>
        <div>
          <Button onClick={submit} text="Next" />
        </div>
      </Card>
    </div>
  );
};

export default StepAvatar;
