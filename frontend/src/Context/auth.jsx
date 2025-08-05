import React, { createContext, useContext, useEffect, useState } from 'react'

// creating auth context
const AuthContext = createContext();

export const AuthProvider = ({children})=> {
    const [auth , setAuth] = useState({
        id : "",
        phone : "" ,
        activated : "" ,
        createdAt : "" ,
        name : "" ,
        avatar : "" ,
        rollNumber : 0 ,
        branch : "" ,
        token : ""
    });

    useEffect(()=> {
        try {
            const data = localStorage.getItem('auth');
            const parsedData = JSON.parse(data);
            if (parsedData){
                setAuth((prev)=> {
                    return parsedData || prev;
                });
            }
        } catch (error) {
            console.error("Error parsing auth data from localStorage" , error);
        }
    } , []);

    return (
        <AuthContext.Provider value={[auth , setAuth]}>
            {children}
        </AuthContext.Provider>
    )
}


// Custom Hook
export const useAuth = ()=> useContext(AuthContext);

