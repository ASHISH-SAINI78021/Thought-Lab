import React, { useState, useEffect, useRef } from 'react';

const UtterYourThoughts = () => {
  const [animateDiv, setAnimateDiv] = useState(false);
  const [thought, setThought] = useState('');
  var message = "";

  const readThought = () => {
    setAnimateDiv(!animateDiv);
    if (message.trim() != '') {
      setThought(message);
    }
    else {
      setThought(message);
      message = 0;
    }
  };
  return (
    <>
      <div className='flex py-8 px-[100px] flex-col items-center h-[85vh]'>
        <div className='flex flex-col items-center'>
          <h1 className='font-display text-5xl text-secondary'>
            Utter Your Thoughts
          </h1>
          <h2 className='font-sans mt-4 text-[18px]'>Enable Full Screen for Immersive Experience</h2>
        </div>
        <div className='relative mt-6 w-full flex flex-col items-center justify-between h-[800px] bg-white rounded-[18px] p-3'>
          {
            <div
              className={`rounded-full px-6 py-3 text-[20px] font-sans font-light bg-primary transition-all duration-[800ms] left-[30%]`}>
              {thought}
            </div>
          }
          <div className='absolute bottom-3 flex items-center justify-center w-[80%]'>
            <input
              className='rounded-full px-6 py-3 w-[40%] text-[20px] text-secondary font-sans font-light bg-accent'
              placeholder={'Write here, whatever is bothering you!'
              }
              onChange={(e) => { message = e.target.value }}
            />
            <button onClick={readThought} className='ml-4 bg-secondary font-sans text-[16px] text-white rounded-full py-3 px-6'>
              Let it go!
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default UtterYourThoughts;