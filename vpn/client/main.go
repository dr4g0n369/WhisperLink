package main

import (
	"fmt"
	"log"
	"net"
	"os"
	"os/signal"
	"syscall"
	"vpn/cmd"

	"github.com/songgao/water"
)

var conn net.Conn
var addr string

func main() {
	iface, err := createTun("192.168.9.9")
	if err != nil {
		fmt.Println("interface can not be created:", err)
		return
	}

	conn, err = createConn()
	if err != nil {
		fmt.Println("tcp conn create error:", err)
	}

	go listen(iface)
	go listenInterface(iface)

	termSignal := make(chan os.Signal, 1)
	signal.Notify(termSignal, os.Interrupt, syscall.SIGTERM)
	<-termSignal
	fmt.Println("closing")
}

func createConn() (net.Conn, error) {
	return net.Dial("tcp", addr) // "52.184.83.67:3000"
}

func listen(iface *water.Interface) {
	for {
		message := make([]byte, 65535)
		n, err := conn.Read(message)
		if err != nil {
			log.Printf("conn read error: %v", err)
			continue
		}

		log.Printf("Read %d bytes from TCP connection", n)
		if iface != nil {
			_, err = iface.Write(message[:n])
			if err != nil {
				log.Printf("iface write error: %v", err)
			} else {
				log.Println("Written packet to TUN interface")
			}
		}

		log.Println("Forwarding packet to the server...")
		cmd.WritePacket(message[:n])
	}
}

func listenInterface(iface *water.Interface) {
	fmt.Println("interface listening")
	packet := make([]byte, 65535)
	for {
		n, err := iface.Read(packet)
		if err != nil {
			log.Printf("interface read error: %v", err)
			continue
		}

		log.Printf("Read %d bytes from TUN interface", n)
		_, err = conn.Write(packet[:n])
		if err != nil {
			log.Printf("conn write error: %v", err)
			continue
		}
		log.Println("Forwarding packet to the server...")
		cmd.WritePacket(packet[:n])
	}
}

func createTun(ip string) (*water.Interface, error) {
	config := water.Config{
		DeviceType: water.TUN,
	}

	iface, err := water.New(config)
	if err != nil {
		return nil, err
	}
	log.Printf("Interface Name: %s\n", iface.Name())

	out, err := cmd.RunCommand(fmt.Sprintf("sudo ip addr add %s/24 dev %s", ip, iface.Name()))
	if err != nil {
		fmt.Println(out)
		return nil, err
	}

	out, err = cmd.RunCommand(fmt.Sprintf("sudo ip link set dev %s up", iface.Name()))
	if err != nil {
		fmt.Println(out)
		return nil, err
	}
	return iface, nil
}
