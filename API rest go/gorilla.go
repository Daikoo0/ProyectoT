package main

import (
	"log"
	"net/http"
	"fmt"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Room struct {
	clients map[*websocket.Conn]bool
}

func (r *Room) broadcast(message []byte) {
	for client := range r.clients {
		err := client.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			log.Println("Error al enviar mensaje:", err)
			client.Close()
			delete(r.clients, client)
		}
	}
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error al actualizar la conexión:", err)
		return
	}
	defer conn.Close()

	// Obtener el nombre de la sala desde los parámetros de la URL
	roomName := r.URL.Query().Get("room")

	// Obtener o crear la sala correspondiente
	room := getOrCreateRoom(roomName)

	// Agregar el cliente a la sala
	room.clients[conn] = true
	log.Println("Cliente conectado a la sala:", roomName)
	message := []byte(fmt.Sprintf("Te has conectado a la sala %s", roomName))
	err = conn.WriteMessage(websocket.TextMessage, message)

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Println("Error al leer el mensaje:", err)
			break
		}

		// Enviar el mensaje a todos los clientes de la sala
		room.broadcast(message)
	}
	// Eliminar el cliente de la sala al cerrar la conexión
	delete(room.clients, conn)
}

// Mapa para almacenar las salas existentes
var rooms = make(map[string]*Room)

// Obtener o crear una sala
func getOrCreateRoom(name string) *Room {
	if room, ok := rooms[name]; ok {
		return room
	}

	room := &Room{
		clients: make(map[*websocket.Conn]bool),
	}
	rooms[name] = room

	return room
}

func main() {
	http.HandleFunc("/ws", handleWebSocket)

	log.Println("Servidor escuchando en http://localhost:3001")
	log.Fatal(http.ListenAndServe(":3001", nil))
}