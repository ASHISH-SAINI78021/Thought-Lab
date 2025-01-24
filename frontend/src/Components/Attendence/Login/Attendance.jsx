import React, { useEffect, useState , useRef } from 'react'
import {Link , useNavigate} from 'react-router-dom';
import { useAuth } from '../../../Context/auth';
import {toast} from "react-hot-toast";
import {url} from "../../../../url.js";

const Attendance = () => {
    const [stream , setStream] = useState(null);
    const [auth , setAuth] = useAuth();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [capturedImage , setCapturedImage] = useState(null);
    const [change , setChange] = useState(2);
    const navigate = useNavigate();

    useEffect(()=> {
      const initWebcam = async()=> {
        try {
          const s = await navigator.mediaDevices.getUserMedia({video : true , audio : false});
          videoRef.current.srcObject = s;
          
          setStream(s);
        } catch (error) {
          console.error("Error accessing webcam: " , error);
        }
      };

      initWebcam();

      return ()=> {
        // clean up function
        if (stream){
          stream.getTracks().forEach((track)=> track.stop());
        }
      }
    } , []);

    const captureImage = ()=> {
      const context = canvasRef.current.getContext('2d'); // Initialising 2d rendering context to draw images , shapes and other objects
      context.drawImage(videoRef.current , 0 , 0 , canvasRef.current.width , canvasRef.current.height);

      // Explaination of arguments
      // VideoRef.current -> provide reference of the element to be drawn

      // (0 , 0) -> where the top left corner of the image should be placed

      // (canvasRef.current.width  , canvas.current.height) -> size of the image
    }


    useEffect(()=> {
      const id = setInterval(()=> {
        setChange((prev)=> {
          if (prev == 1){
            clearInterval(id);
            captureImage();
            return 0;
          }

          return prev - 1;
        });
      } , 1000);

      // clean up code
      return ()=> {
        clearInterval(id);
      }
    } , []);


    const handleSubmit = async(event)=> {
        event.preventDefault();
        try {
          const formData = new FormData(); // it is used to send multipart/form data
          formData.append('name' , auth?.name);
          formData.append('rollNumber' , auth?.rollNumber);
          formData.append('image' , capturedImage);

          let response = await fetch(`${url}/api/attendance-system` , {
            method : "POST" ,
            body : formData
          });

          if (response.ok){
            response = await response.json();
            if (response.success){
              setAuth({...auth , token : response.token});
              toast.success("successfully marked attendance");
            } else {
              toast.error("Try again");
            }
          }
        } catch (error) {
            console.log(error);
            toast.error("error" , error);
        }
    }
    
    return (
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '100vh', backgroundColor: '#f0f0f0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection:"column"}}>
          <video ref={videoRef} autoPlay width="400" ></video>
          <canvas ref={canvasRef}  width="200px" height="200px" />
          {(change != 0) ? <h2>Capturing image in {change} seconds</h2> : null }
          </div>

      
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>
              
              <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Login</button>
              <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Skip for now</button>
              <Link to="/signup">Don't have an account ?</Link>
          </form>
      </div>
  );
}

export default Attendance;
