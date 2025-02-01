import React, { useState } from 'react'
import  useStore  from '../../Store.js';
import './Navbar.css'
import { useNavigate } from 'react-router-dom'

function Navbar() {
    const navigate = useNavigate();
    const count = useStore((state)=>state.count);
    const check = () => {
        if (count === 0) {
            alert("Please connect your wallet first");
        } else if (count === 1) {
            navigate("/dashboard0");
        } else if (count === 2) {
            navigate("/dashboard");
        }
    }

  return (
    <div className='Nav'>
        <div className='Logo' onClick={() => navigate("/")}>WhisperLink</div>
        <div className='Right'>
            <ul className='NavLinks'>
                <li onClick={() => navigate("/")}>Home</li>
                <li onClick={() => navigate("/connect")}>Connect</li>
                <li onClick={check}>Dashboard</li>
            </ul>
        </div>
    </div>
  )
}

export default Navbar