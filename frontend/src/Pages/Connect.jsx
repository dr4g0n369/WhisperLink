import React, {useState, useEffect} from 'react'
import Nav from '../Components/Navbar'
import { useNavigate } from 'react-router-dom';
import useStore from '../../Store.js';
import { ethers } from "ethers";
import './Connect.css'
import { useWeb3 } from '../context/web3context.jsx';
import { use } from 'react';

function Connect() {
  const navigate = useNavigate();

  const { initializeProvider, account , contract} = useWeb3();
  const {ip, setIp} =useStore();
  const [ipaddr, setIpaddr] = useState("");
  // const [account, setAccount] = useState(null);
  useEffect(() => {
    console.log(ipaddr);
    setIp(ipaddr);
    console.log(ip);
  },[ipaddr])
  const [error, setError] = useState("");
  const count = useStore((state)=>state.count);
  const server = useStore(state => state.dashboard_server);
  const client = useStore(state => state.dashboard_client);
  
  console.log(account);
  const server_fn = async() => {
    server;
    
    const ipWithPort = `${ip}:8081`;
    let stake =  await contract.methods.providerStakeAmount().call({from: account});
    stake = Number(stake);
    console.log(stake);
    const res = await contract.methods.providers(account).call();
    console.log(res);
    console.log(ipWithPort);
    if(ipWithPort===res.ipAddr){
      navigate("/dashboard0");
    }
    else {
      const result = await contract.methods.registerProvider(ipWithPort,"IN").send({from: account, value: stake });
      navigate("/dashboard0");
    }
  
  
    // console.log(count);
  }
  const   client_fn = async() => {
    client;
    setIp(ipaddr);
    navigate("/dashboard");
  }
  // const connectWallet = async (walletType) => {
  //   if (!window.ethereum) {
  //     setError("No Ethereum provider found. Install MetaMask or Trust Wallet.");
  //     redirectToInstall(walletType);
  //     return;
  //   }

  //   try {
  //     let provider;
  //     if (walletType === "metamask" && window.ethereum.isMetaMask) {
  //       provider = new ethers.BrowserProvider(window.ethereum);
  //     } else if (walletType === "trustwallet") {
  //       provider = new ethers.BrowserProvider(window.ethereum);
  //     } else {
  //       setError("Wallet not detected. Please install MetaMask or Trust Wallet.");
  //       return;
  //     }

  //     const signer = await provider.getSigner();
  //     const address = await signer.getAddress();
  //     setAccount(address);
  //     setError("");
  //   } catch (err) {
  //     setError("Connection failed. Please try again.");
  //   }

  // };


  return (
    <div className='Connect'>
        <Nav />
        <div className='Back'>LINK</div>
        <div className='Content'>
            <h1>Welcome to DecentralVPN</h1>
            <div className='Description'>
            <p>Connect your wallet to access secure, decentralized VPN services and take control of your online privacy.</p>
            </div>
            {account?             <div className='Buttons'>
              
            <button onClick={server_fn}>
                <img src='/server.svg'></img>
                Want to be a node</button>
             <button  onClick={client_fn}>
                <img src='/client.svg'></img>
                Want to be a client</button>
             </div>
 :             <div className='Buttons'>
              
            <button onClick={() => initializeProvider()}>
                <img src='/key.svg'></img>
                Connect Metamask</button>
             <button  onClick={() => connectWallet("trustwallet")}>
                <img src='/wallet.svg'></img>
                Connect Wallet</button>
             </div>
 }
            <input placeholder={`Your ip is ${ip}`} onChange={(e)=>setIpaddr(e.target.value)}></input>
           {/* <a href='#'>Learn more...</a> */}
            {account && (
        <p className="mt-4 text-green-400">
          Connected: <span className="font-mono">{account}</span>
        </p>
      )}
      {error && <p className="mt-4 text-red-400">{error}</p>}
        </div>
    </div>
  )
}

export default Connect