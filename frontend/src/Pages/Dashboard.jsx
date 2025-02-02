
import React, { useEffect, useState } from 'react';
import Nav from '../Components/Navbar';
import './Dashboard.css';
import { useWeb3 } from '../context/web3context';

function Dashboard() {
    const { contract, account } = useWeb3();
    const [nodes, setNodes] = useState([]);
    const [hash, setHash] = useState('');
    const [user, setUser] = useState([]);
    

    // Function to fetch data from the contract
    const fetchData = async () => {
          
        try {
            if (!contract) return;
            const result = await contract.methods.listProviders().call();
            const subscribed = await contract.methods.getUserSubscriptions(account).call();
            console.log(subscribed);
            const formattedUser = subscribed.map((user, index) => ({
                    id: index + 1,
               provider: user[3]
            }));
            setUser(formattedUser);
            console.log("result",user);
               // console.log(result);     
            // Format data properly (convert BigInt to string for rendering)
            const formattedNodes = result.map((node, index) => ({
                id: index + 1,
                providerAddress: node[0],  // Extract from indexed property
                stakedAmount: node[1].toString(), // Convert BigInt to string
                rewardBalance: node[2].toString(), // Convert BigInt to string
                isRegistered: node[3], 
                server: node[4],  // Extract server IP
                location: node[5]  // Extract country
            }));

            setNodes(formattedNodes);
        } catch (error) {
            console.error("Error fetching contract data:", error);
        }
    };
    const download = async (node) => {
     const ip = `${node.server}`;
     console.log(ip);
     try {
          const response = await fetch("http://localhost:8080/api/client", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({ "addr": ip }) // Send transaction hash to identify file
          });
  
          if (!response.ok) {
              throw new Error("Failed to download file");
          }
  
          const blob = await response.blob(); // Convert response to blob
          const url = window.URL.createObjectURL(blob); // Create object URL
  
          // Create an invisible anchor element to trigger the download
          const a = document.createElement("a");
          a.href = url;
          a.download = "vpn_client"; // Change the filename as needed
          document.body.appendChild(a);
          a.click();
  
          // Cleanup
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
      } catch (error) {
          console.error("Error downloading file:", error);
      }
    }

    useEffect(() => {
     
        fetchData();
    }, [contract]);
    const Buy = async(node) => {
          const buy = await contract.methods.subscriptionFee().call();
          console.log(buy);
          let value = Number(buy);
          console.log(nodes)
          const Purchase = await contract.methods.subscribe(node.providerAddress,1).send({from: account,value: value});

          console.log(Purchase);
          const subscribed = await contract.methods.getUserSubscriptions(account).call();
          console.log(subscribed);
          setUser(subscribed[3]);
          setHash(Purchase.blockHash);
    }
    const isProviderSubscribed = (providerAddress) => {
     return user.some((u) => u.provider === providerAddress);
 };
    return (
        <div className='Dashboard'>
            <Nav />
            <div className='Back2'>WHISPER</div>

            <div className='Statistics'>
                <h1>Stats</h1>
                <div className='Stats'>
                    <div className='Stat_box'>
                        <h2>Total VPN Nodes</h2>
                        <p>{nodes.length}</p>
                    </div>
                    <div className='Stat_box'>
                        <h2>Registered Nodes</h2>
                        <p>{nodes.filter(node => node.isRegistered).length}</p>
                    </div>
                    <div className='Stat_box'>
                        <h2>Active Nodes</h2>
                        <p>{user.length}</p>
                    </div>
                </div>

                <h1>Nodes Connected</h1>
                <div className='Nodes'>
                    <div className='Node_header'>
                        <h2>Nodes</h2>
                        <p>Location</p>
                        <p>Server</p>
                        <div className='Node_status'>
                            <p>Status</p>
                        </div>
                        <p>Purchase</p>
                    </div>
                    <div className='Line'></div>

                    {/* **Dynamically Render Nodes** */}
                    {nodes.map((node, index) => (
                        <React.Fragment key={index}>
                            <div className='Node'>
                                <h2>Node {node.id}</h2>
                                <p>{node.location || "Unknown"}</p>
                                <p>{node.server}</p>
                                <div className='Node_status'>
                                    <p>{(user[node.id]===node.provider) ? "Active" : "Inactive"}</p>
                                </div>
                                {isProviderSubscribed(node.providerAddress)? <button onClick={()=>download(node)}>Download</button>:<button onClick={()=>Buy(node)}>Buy</button>}
                                
                            </div>
                            <div className='Line'></div>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
