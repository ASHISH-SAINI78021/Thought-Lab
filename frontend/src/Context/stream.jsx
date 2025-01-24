import React, { createContext, useContext, useEffect, useRef, useState } from 'react'


// creating a context for the media streaming
export const StreamContext = createContext();

export const StreamProvider = ({ children }) => {
    const [stream , setStream] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [capturedImage , setCapturedImage] = useState(null);
    const [change , setChange] = useState(2);

    useEffect(()=> {
        const initWebcam = async()=> {
            try {
                const s = await navigator.mediaDevices.getUserMedia({video : true});
                videoRef.current.srcObject = s;

                setStream(s);
            } catch (error) {
                console.error("Error accessing webcam: " , err);
            }
        };

        initWebcam();

        return ()=> {
            // clean up the media stream when the component tends to unomount
            if (stream){
                stream.getTracks().forEach(track=> track.stop());
            }
        }
    } , []);

    const captureImage = ()=> {
        const context = canvasRef.current.getContext('2d'); // initialising 2d rendering context to draw images , shapes and other objects.
        context.drawImage(videoRef.current , 0 , 0 , canvasRef.current.width , canvasRef.current.height);

        // Explaination of arguments
        // videoRef.current -> provide reference of the element to be drawn
        // (0 , 0) -> where the top left corner of the image should be placed
        // (canvasRef.width , canvas.current.height) -> size of image
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
  return (
    <StreamContext.Provider value={{stream , videoRef , capturedImage , canvasRef , change , setChange}}>
        {children}
    </StreamContext.Provider>
  )
}

const useStream = ()=> useContext(StreamContext);
export {useStream};
