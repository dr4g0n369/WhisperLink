import React, { useEffect, useState } from 'react'
import Nav from '../Components/Navbar'
import './Dashboard.css'
import { useWeb3 } from '../context/web3context'

function Dashboard0() {
     const { contract, account } = useWeb3();
     const [reward, setReward] = useState('');
  
     const details = async() =>{

          const result = await contract.methods.providers(account).call();
          console.log(result);
          setReward(result.rewardBalance.toString());
          console.log(reward);
          
     }
     const withdraw = async() =>{
          const result = await contract.methods.withdrawProviderFunds().send({from: account});
          console.log(result);
     }
     useEffect(() => {
          details();
     });
     const downloadFile = async () => {
          try {
              const response = await fetch("http://localhost:8080/api/server", {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json", // Adjust based on your file type
                  },
                  body: JSON.stringify({ "port": "8081" }),
              });
      
              if (!response.ok) throw new Error("Failed to download file");
      
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
      
              // Create a temporary <a> element to trigger download
              const a = document.createElement("a");
              a.href = url;
              a.download = "downloaded_file"; // Change filename if needed
              document.body.appendChild(a);
              a.click();
      
              // Cleanup
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
          } catch (error) {
              console.error("Error downloading file:", error);
          }
      };
      
  return (
    <div className='Dashboard'>
        <Nav />
        <div className='Back2'>WHISPER</div>

        <div className='Statistics'>
          <a href='#'></a>
            <h1>Stats</h1>
            <div className='Stats'>
                <div className='Stat_box'>
                    <h2>Number of Device Connected</h2>
                    <p>10</p>
                </div>
                 <div className='Stat_box'>
                    <h2>Total bandwidth shared</h2>
                    <p>10</p>
                </div>
                  <div className='Stat_box'>
                    <h2>Total prize earned</h2>
                    <p>{reward}</p>
                </div>
            
           </div>
          </div>
          {/* <a href="http://localhost:8080/api/server">Download</a> */}
          {/* <p onClick={}>Download</p> */}
          <div className='div'>
            <p>Download your server binary</p>
          <button className='download' onClick={downloadFile}>Download File</button>
            </div>
          <button className='btn' onClick={withdraw}>Withdraw</button>
    </div>
  )
}
  
export default Dashboard0