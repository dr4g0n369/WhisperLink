package main

import (
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"vpn/cmd"

	"github.com/gorilla/websocket"

	"github.com/google/gopacket"
	"github.com/google/gopacket/layers"
	"github.com/songgao/water"
)

var serverPort string
var upgrader = websocket.Upgrader{}
var wsClients = make(map[*websocket.Conn]bool)

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade failed:", err)
		return
	}
	defer conn.Close()
	wsClients[conn] = true

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			log.Println("WebSocket connection closed")
			delete(wsClients, conn)
			break
		}
		conn.WriteMessage(websocket.TextMessage, []byte("Server is up"))
	}
}

func parsePacket(packetData []byte) {
	packet := gopacket.NewPacket(packetData, layers.LayerTypeIPv4, gopacket.Default)

	if ipLayer := packet.Layer(layers.LayerTypeIPv4); ipLayer != nil {
		ip, _ := ipLayer.(*layers.IPv4)
		log.Printf("IPv4 Layer: %+v", ip)
		log.Printf("Source IP: %v, Destination IP: %v", ip.SrcIP, ip.DstIP)
		parseTransportLayer(packet)
	} else if ipLayer := packet.Layer(layers.LayerTypeIPv6); ipLayer != nil {
		ip, _ := ipLayer.(*layers.IPv6)
		log.Printf("IPv6 Layer: %+v", ip)
		log.Printf("Source IP: %v, Destination IP: %v", ip.SrcIP, ip.DstIP)
		parseTransportLayer(packet)
	} else {
		log.Println("No IPv4 or IPv6 layer detected.")
	}
}

func parseTransportLayer(packet gopacket.Packet) {
	if tcpLayer := packet.Layer(layers.LayerTypeTCP); tcpLayer != nil {
		tcp, _ := tcpLayer.(*layers.TCP)
		log.Printf("TCP Layer: %+v", tcp)
		log.Printf("Source Port: %d, Destination Port: %d", tcp.SrcPort, tcp.DstPort)
	} else if udpLayer := packet.Layer(layers.LayerTypeUDP); udpLayer != nil {
		udp, _ := udpLayer.(*layers.UDP)
		log.Printf("UDP Layer: %+v", udp)
		log.Printf("Source Port: %d, Destination Port: %d", udp.SrcPort, udp.DstPort)
	} else {
		log.Println("No TCP/UDP layer detected.")
	}
}

var listener net.Listener
var conn net.Conn

func main() {
	go func() {
		http.HandleFunc("/ws", wsHandler)
		fmt.Println("Websocket Server started on port 8080...")
		log.Fatal(http.ListenAndServe(":8080", nil))
	}()
	iface, err := createTun("192.168.9.11")
	if err != nil {
		log.Fatalf("Failed to create TUN interface: %v", err)
	}

	listener, err = net.Listen("tcp", fmt.Sprintf("0.0.0.0:%s", serverPort))
	if err != nil {
		log.Fatalf("Failed to start TCP listener: %v", err)
	}

	conn, err = listener.Accept()
	if err != nil {
		log.Fatalf("Failed to accept client connection: %v", err)
	}

	go forwardFromClient(iface)
	go forwardFromInterface(iface)

	termSignal := make(chan os.Signal, 1)
	signal.Notify(termSignal, os.Interrupt, syscall.SIGTERM)
	<-termSignal
	fmt.Println("Shutting down VPN server...")
}

func forwardFromClient(iface *water.Interface) {
	buffer := make([]byte, 65535)
	for {
		n, err := conn.Read(buffer)
		if err != nil {
			log.Println("Error reading from client:", err)
			break
		}

		_, err = iface.Write(buffer[:n])
		if err != nil {
			log.Println("Error writing to TUN interface:", err)
		}

		parsePacket(buffer[:n])

		forwardPacket(buffer[:n])
	}
}

func forwardFromInterface(iface *water.Interface) {
	buffer := make([]byte, 65535)
	for {
		n, err := iface.Read(buffer)
		if err != nil {
			log.Println("Error reading from TUN:", err)
			break
		}

		_, err = conn.Write(buffer[:n])
		if err != nil {
			log.Println("Error sending packet to client:", err)
		}

		parsePacket(buffer[:n])
	}
}

func forwardPacket(packet []byte) {
	pkt := gopacket.NewPacket(packet, layers.LayerTypeIPv4, gopacket.Default)

	ipLayer := pkt.Layer(layers.LayerTypeIPv4)
	if ipLayer == nil {
		ipLayer = pkt.Layer(layers.LayerTypeIPv6)
		if ipLayer == nil {
			log.Printf("ERROR: No IPv4 or IPv6 layer in packet of size %d bytes", len(packet))
			return
		}
		log.Printf("INFO: IPv6 layer found: %v", ipLayer)
	} else {
		log.Printf("INFO: IPv4 layer found: %v", ipLayer)
	}

	switch ipLayer := ipLayer.(type) {
	case *layers.IPv4:
		log.Printf("INFO: IPv4 Packet: %v", ipLayer)
		forwardToDestination(ipLayer.DstIP, packet)
	case *layers.IPv6:
		log.Printf("INFO: IPv6 Packet: %v", ipLayer)
		forwardToDestination(ipLayer.DstIP, packet)
	}
}
func forwardToDestination(destIP net.IP, packet []byte) {
	var destAddr string
	var port uint16

	pkt := gopacket.NewPacket(packet, layers.LayerTypeEthernet, gopacket.Default)
	if tcpLayer := pkt.Layer(layers.LayerTypeTCP); tcpLayer != nil {
		tcp := tcpLayer.(*layers.TCP)
		port = uint16(tcp.DstPort)
		destAddr = fmt.Sprintf("%s:%d", destIP, port)
		log.Printf("INFO: Forwarding TCP packet to %s", destAddr)
	} else if udpLayer := pkt.Layer(layers.LayerTypeUDP); udpLayer != nil {
		udp := udpLayer.(*layers.UDP)
		port = uint16(udp.DstPort)
		destAddr = fmt.Sprintf("%s:%d", destIP, port)
		log.Printf("INFO: Forwarding UDP packet to %s", destAddr)
	} else {
		log.Printf("ERROR: No TCP or UDP layer found in packet of size %d bytes", len(packet))
		return
	}

	conn, err := net.Dial("udp", destAddr)
	if err != nil {
		log.Printf("ERROR: Failed to forward packet to %s: %v", destAddr, err)
		return
	}
	defer conn.Close()

	_, err = conn.Write(packet)
	if err != nil {
		log.Printf("ERROR: Failed to send packet to %s: %v", destAddr, err)
	} else {
		log.Printf("INFO: Successfully forwarded packet to %s", destAddr)
	}
}

func createTun(ip string) (*water.Interface, error) {
	config := water.Config{DeviceType: water.TUN}
	iface, err := water.New(config)
	if err != nil {
		return nil, err
	}

	log.Printf("Interface created: %s", iface.Name())

	_, err = cmd.RunCommand(fmt.Sprintf("sudo ip addr add %s/24 dev %s", ip, iface.Name()))
	if err != nil {
		return nil, err
	}

	_, err = cmd.RunCommand(fmt.Sprintf("sudo ip link set dev %s up", iface.Name()))
	if err != nil {
		return nil, err
	}

	return iface, nil
}
