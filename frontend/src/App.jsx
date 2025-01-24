import { useState } from 'react'
import {Routes , Route} from "react-router-dom";
import './App.css'
import Attendance from './Components/Attendence/Login/Attendance';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>This is App.jsx</h1>
      <Routes>
        <Route path='/attendance' element={<Attendance/>} />
      </Routes>
    </>
  )
}

export default App
