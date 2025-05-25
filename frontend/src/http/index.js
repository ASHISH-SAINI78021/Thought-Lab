import axios from 'axios';
import {url} from '../url';

const api = axios.create({
    baseURL : url , 
    withCredentials : true , // this is for cookie
    headers : {
        'Content-Type' : 'application/json' ,
        Accept : 'application/json'
    }
});


// list of all end points
export const sendOtp = (data)=> api.post('/api/send-otp' , {phone : data});
export const verifyOtp = (data)=> api.post('/api/verify-otp' , data);
export const activate = (data)=> api.post('/api/activate' , data);
export const logout = ()=> api.post('/api/logout');





export default api;