# WhisperLink 🤫
> Empowering privacy and connectivity through decentralization on ***Ethereum***.

## ✨ Overview
**WhisperLink** is a next-generation decentralized VPN service built on **Ethereum**. Choose your role—whether as a **client** enjoying secure, private connections or as a **node** contributing to and earning from a global network. Experience the perfect blend of privacy, scalability, and efficiency, all while taking part in a transparent, blockchain-powered ecosystem.

---

## 🌟 Features

- **Decentralized VPN Service**  
  Enjoy a secure VPN service where you can either access the network as a client or contribute as a node on the Ethereum blockchain.

- **Dual Roles**  
  - **Clients:**  
    Subscribe to the service and choose from a wide range of VPN endpoints worldwide.
  - **Nodes:**  
    Operate a node, offer VPN services, and earn rewards in **ETH tokens**.

- **Powered by Ethereum**  
  Benefit from a secure and decentralized network.

- **Incentivized Nodes**  
  Earn **ETH tokens** for delivering reliable and high-quality VPN services.  
  💰 _Get rewarded for your contribution!_

- **Subscription Model**  
  Access premium VPN services via a flexible subscription model tailored to your needs.

- **Commission System**  
  A small commission is deducted from the fees paid to nodes to ensure continuous platform development and sustainability.

- **Staking Requirement**  
  Nodes must stake a fee to register, reinforcing network security and incentivizing quality service.

## 🛠️ Setup Guide


### 🚀 VPN Server (192.168.9.11) Commands

1. **Enable IP Forwarding**
    ```bash
    sudo sysctl -w net.ipv4.ip_forward=1
    echo "net.ipv4.ip_forward = 1" | sudo tee -a /etc/sysctl.conf
    sudo sysctl -p
    ```
2. **Configure Firewall Rules (iptables)**
    ```bash
    sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT  # Allow VPN connection port
    sudo iptables -A FORWARD -i tun0 -o eth0 -j ACCEPT    # Allow VPN traffic
    sudo iptables -A FORWARD -i eth0 -o tun0 -j ACCEPT
    sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE  # NAT for external traffic
    sudo iptables-save | sudo tee /etc/iptables.rules  # Save rules
    ```
    To persist firewall rules on reboot:
    ```bash
    sudo iptables-restore < /etc/iptables.rules
    ```
3. **Bring Up the TUN Interface**
    ```bash
    ip link set tun0 up
    ip addr add 192.168.9.11/24 dev tun0
    ```

### 💻 VPN Client (192.168.9.9) Commands

1. **Allow VPN Traffic**
    ```bash
    sudo iptables -A INPUT -i tun0 -j ACCEPT
    sudo iptables -A FORWARD -i tun0 -j ACCEPT
    ```
2. **Route Traffic Through VPN** (to be done after running the client binary)
    ```bash
    sudo ip route add default via 192.168.9.11 dev tun0
    ```

## 🔄 How It Works

1. **Registration:**
   - **Clients:**  
     Sign up, subscribe, and select VPN endpoints from a global network.
   - **Nodes:**  
     Register on the Ethereum blockchain by staking the required fee, then start providing VPN services.

2. **Transaction Flow:**
   - **Clients** pay their subscription fees through the Ethereum network.
   - **Nodes** earn a share of these fees in **ETH tokens**, with a portion deducted as commission.

3. **Incentives:**
   - **Earn ETH Tokens:**  
     Rewarding nodes for consistent, high-quality service.
   - **Secure the Network:**  
     The staking mechanism deters malicious behavior and ensures a stable, high-performance ecosystem.

## 💡 Benefits

- **Enhanced Privacy:**  
  Rely less on centralized providers and more on a secure, decentralized network.

- **User Empowerment:**  
  Whether you’re a client or a node, you play a vital role in maintaining and benefiting from the ecosystem.

- **Transparent Ecosystem:**  
  Every transaction is secure, transparent, and verifiable on the Ethereum blockchain.

- **Sustainable & Secure:**  
  The combined commission and staking systems ensure a self-sustaining network that rewards quality and commitment.
