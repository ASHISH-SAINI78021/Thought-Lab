import React, { useState } from 'react'
import Card from "../Card/Card";
import Button from '../Button/Button';
import TextInput from '../TextInput/TextInput'
// import { setName } from '../../../store/activateSlice';
import styles from './StepName.module.css';
import { useAuth } from '../../../Context/auth';

const StepName = ({onNext}) => {
  // const {name} = useSelector((state)=> state.activate);
  const [auth , setAuth] = useAuth();
  const [fullname , setFullname] = useState(auth?.name);

  function nextStep(){
    if (!fullname){
      return ;
    }
    setAuth((prev)=> {
      return {...prev , name : fullname};
    });
    onNext();
  }

  return (
    <div className={styles.container}>
      <Card title="What's your full name? " icon="goggle-emoji">
        <TextInput value={fullname} onChange={(e) => setFullname(e.target.value)} />
        <p className={styles.paragraph}>
          People use real names at ThoughtLab :) 
        </p>
        <div>
          <Button onClick={nextStep} text="Next" />
        </div>
      </Card>
    </div>
  )
}

export default StepName;
