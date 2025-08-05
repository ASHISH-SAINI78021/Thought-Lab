import React , {useState} from 'react'
import StepPhoneEmail from "./StepPhoneEmail/StepPhoneEmail"
import StepOtp from "./StepOtp/StepOtp"

const steps = {
    1: StepPhoneEmail,
    2: StepOtp,
};

const Authenticate = () => {
    const [step , setStep] = useState(1);
  const Step = steps[step];

  const onNext = ()=> {
    setStep(step + 1);
  }
  return (
    <div>
      <Step onNext={onNext} />
    </div>
  )
}

export default Authenticate
