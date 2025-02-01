import React from 'react'
import Nav from '../Components/Navbar'
import { useNavigate } from 'react-router-dom'
import useStore from '../../Store'

import './Home.css'
import { use } from 'react'

function Home() {
    const navigate = useNavigate();
    const {ip, setIp} =useStore();
    const connect = () => {
        fetch("https://geo.ipify.org/api/v2/country?apiKey=at_jXOUXgW4nBBMDQ26O8UxORvlKTdOu")
        .then(response => {
        if (!response.ok) {
         throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
            })
        .then(data => setIp(data.ip))
        .catch(error => console.error("Error fetching data:", error));
        console.log(ip);
        navigate("/connect");
    }
  return (
    <div className='Home'>
        <Nav/>
        <div className='Back3'>CONNECT</div>

        <div className='Wrapper'>
            <h1>Secure. Fast. Decentralized</h1>
            <p>Experience the future of o   nline privacy with our blockchain-powered VPN technology. Anonymity meets performance in a decentralized network.</p>
            <button onClick={connect}>
                Connect Now

                <img src="arrow.svg"></img>
                </button>
            <h2>Why Choose WhisperLink for Your VPN?</h2>
            <div className='Container'>
                <div>
                    <img src='shield.svg'></img>
                    <h3>Enhanced Privacy</h3>
                    <h4>Our decentralized infrastructure ensures your data remains private and secure, free from central points of failure.</h4>
                </div>
                <div>
                    <img src='speed.svg'></img>
                    <h3>Enhanced Privacy</h3>
                    <h4>Our decentralized infrastructure ensures your data remains private and secure, free from central points of failure.</h4>
                </div>
                <div>
                    <img src='globe.svg'></img>
                    <h3>Enhanced Privacy</h3>
                    <h4>Our decentralized infrastructure ensures your data remains private and secure, free from central points of failure.</h4>
                </div>



            </div>
            <h2>How It Works?</h2>
            <div className='Container2'>
                <p>Connect your Web3 wallet to our platform</p>
                <p>Stake DVPN tokens to access the network</p>
                <p>Choose from our global network of decentralized nodes</p>
                <p>Enjoy secure, private browsing while earning rewards</p>
            </div>
        </div>
        <div className='Footer'>
            <div className='Footer_content'>
                <div className='Footer_logo'>
                    <h1>WhisperLink</h1>
                </div>
                <div className='Footer_links'>
                    <a href='#'>Home</a>
                    <a href='#'>About</a>
                    <a href='#'>Contact</a>
                    <a href='#'>FAQ</a>
                </div>
                <div className='Footer_social'>
                    <a>Connect with us</a>
                    <img src='youtube.png'></img>
                    <img src='instagram.png'></img>
                    <img src='linkedin.png'></img>
                </div>
                <a href="http://localhost:">Download</a>
                <img src="download.jpeg"></img>
            </div>

        </div>

    </div>
  )
}

export default Home