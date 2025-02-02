package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
)

type requestData struct {
	Addr string `json:"addr,omitempty"`
	Port string `json:"port,omitempty"`
}

func buildClientHandler(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*") // Allow all origins
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS") // Allow specific methods
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type") // Allow content-type header

	// Handle preflight requests
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var data requestData
	if r.Header.Get("Content-Type") != "application/json" {
		http.Error(w, "Content-Type must be application/json", http.StatusBadRequest)
		return
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to read request body: %v", err), http.StatusInternalServerError)
		return
	}

	err = json.Unmarshal(body, &data)
	if err != nil || data.Addr == "" {
		http.Error(w, "Invalid or missing 'addr' parameter", http.StatusBadRequest)
		return
	}

	currentDir, err := os.Getwd()
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to get current working directory: %v", err), http.StatusInternalServerError)
		return
	}

	clientDir := filepath.Join(currentDir, "client")

	cmd := exec.Command("go", "build", "-o", "client", "-ldflags", fmt.Sprintf("-X main.addr=%s", data.Addr), "main.go")
	cmd.Dir = clientDir

	output, err := cmd.CombinedOutput()
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to build client binary: %v\nOutput: %s", err, string(output)), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Content-Disposition", "attachment; filename=client")

	http.ServeFile(w, r, filepath.Join(cmd.Dir, "client"))

	defer os.Remove(filepath.Join(cmd.Dir, "client"))
}



func buildServerHandler(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*") // Allow all origins
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS") // Allowed methods
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type") // Allowed headers

	// Handle preflight requests
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var data requestData
	if r.Header.Get("Content-Type") != "application/json" {
		http.Error(w, "Content-Type must be application/json", http.StatusBadRequest)
		return
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to read request body: %v", err), http.StatusInternalServerError)
		return
	}

	err = json.Unmarshal(body, &data)
	if err != nil || data.Port == "" {
		http.Error(w, "Invalid or missing 'Port' parameter", http.StatusBadRequest)
		return
	}

	currentDir, err := os.Getwd()
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to get current working directory: %v", err), http.StatusInternalServerError)
		return
	}

	serverDir := filepath.Join(currentDir, "server")

	cmd := exec.Command("go", "build", "-o", "server", "-ldflags", fmt.Sprintf("-X main.serverPort=%s", data.Port), "main.go")
	cmd.Dir = serverDir

	err = cmd.Run()
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to build server binary: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Content-Disposition", "attachment; filename=server")

	http.ServeFile(w, r, filepath.Join(cmd.Dir, "server"))

	defer os.Remove(filepath.Join(cmd.Dir, "server"))
}


func main() {
	http.HandleFunc("/api/client", buildClientHandler)
	http.HandleFunc("/api/server", buildServerHandler)

	fmt.Println("Server started on port 8080...")
	http.ListenAndServe(":8080", nil)
}
