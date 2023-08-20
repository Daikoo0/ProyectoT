package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/rs/cors"
)

//convierte una peticion http en Websocket, permitido para cualquier origen
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}
type Room struct { //objeto room
	name    string
	clients map[*websocket.Conn]bool
}

var rooms = make(map[string]*Room) //almacena los rooms

//obtiene el room a trabajar, lo crea si no existe
func getOrCreateRoom(name string) *Room {
	room, ok := rooms[name]
	if !ok {
		room = &Room{
			name:    name,
			clients: make(map[*websocket.Conn]bool),
		}
		rooms[name] = room
	}
	return room
}

//enviar un mensaje a los participantes de la sala
func sendMessageToRoom(room *Room, message []byte) {
	for client := range room.clients {
		err := client.WriteMessage(websocket.TextMessage, message)
		log.Println(string(message)) //debug
		if err != nil {
			log.Println("Error al enviar mensaje al cliente:", err)
			delete(room.clients, client)
		}
	}
}

//funcion que maneja el Websocket
func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error al actualizar la conexión:", err)
		return
	}
	defer conn.Close()

	//obtener el proyecto a trabajar, operando bajo la logica de rooms
	roomName := r.URL.Query().Get("room")
	room := getOrCreateRoom(roomName)

	room.clients[conn] = true //conectar el cliente
	log.Println("Cliente conectado a la sala:", roomName)

	for { //enviar un mensaje a todos los miembros de la room
		_, message, err := conn.ReadMessage() 
		if err != nil {
			log.Println("Error al leer el mensaje:", err)
			break
		}
		sendMessageToRoom(room, message)
	}

	//eliminar al cliente de la sala si se cierra la conexion
	delete(room.clients, conn)
}

func main() {
	http.HandleFunc("/ws", handleWebSocket)

	//CORS Websocket lo pide debido a que vite no opera bajo localhost
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://127.0.0.1:3000"},
	})

	handler := c.Handler(http.DefaultServeMux)

	log.Println("Servidor iniciado en http://localhost:3001")
	err := http.ListenAndServe(":3001", handler)
	if err != nil {
		log.Fatal("Error al iniciar el servidor:", err)
	}
}
