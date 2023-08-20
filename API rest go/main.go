package main

import (
	"context"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/rs/cors"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/bson"
)

type Message struct {
	ID      string `bson:"_id,omitempty"`
	Room    string `bson:"room"`
	Message string `bson:"message"`
}

func connectToMongoDB() (*mongo.Client, error) {
	clientOptions := options.Client().ApplyURI("mongodb+srv://Hexzzard:homerochino@cluster0.6iqmxms.mongodb.net/")
	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		log.Fatal(err)
	}
	return client, err
}

func insertMessage(client *mongo.Client, message Message) error {
	collection := client.Database("chat").Collection("messages")
	_, err := collection.InsertOne(context.Background(), message)
	if err != nil {
		log.Fatal(err)
	}
	return err
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Room struct {
	name    string
	clients map[*websocket.Conn]bool
}

var rooms = make(map[string]*Room)

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

func sendMessageToRoom(room *Room, message []byte, client *mongo.Client) {
	// Guardar el mensaje en MongoDB con el nombre de la sala como ID
	msg := Message{
		ID:      room.name,
		Room:    room.name,
		Message: string(message),
	}
	err := insertMessage(client, msg)
	if err != nil {
		log.Println("Error al guardar el mensaje en MongoDB:", err)
	}

	// Enviar el mensaje a todos los clientes de la sala
	for client := range room.clients {
		err := client.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			log.Println("Error al enviar mensaje al cliente:", err)
			delete(room.clients, client)
		}
	}
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	// Obtener el nombre de la sala de chat de la URL
	roomName := r.URL.Query().Get("room")

	// Conectarse a MongoDB
	client, err := connectToMongoDB()
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(context.Background())

	// Obtener o crear la sala de chat correspondiente
	room := getOrCreateRoom(roomName)

	// Actualizar la conexión HTTP a una conexión WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error al actualizar la conexión:", err)
		return
	}
	defer conn.Close()

	// Obtener el último mensaje almacenado en la base de datos
	collection := client.Database("chat").Collection("messages")
	filter := bson.M{"room": roomName}
	cursor, err := collection.Find(context.Background(), filter)
	if err != nil {
		log.Fatal(err)
	}
	defer cursor.Close(context.Background())

	// Enviar los mensajes almacenados en la base de datos al cliente
	for cursor.Next(context.Background()) {
		var message Message
		err := cursor.Decode(&message)
		if err != nil {
			log.Fatal(err)
		}
		err = conn.WriteMessage(websocket.TextMessage, []byte(message.Message))
		if err != nil {
			log.Println("Error al enviar mensaje al cliente:", err)
			return
		}
	}
	// Agregar el cliente a la sala de chat
	room.clients[conn] = true
	log.Println("Cliente conectado a la sala:", roomName)

	// Escuchar mensajes entrantes
	for {
		// Leer un mensaje del cliente
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			log.Println("Error al leer el mensaje:", err)
			break
		}

		// Insertar el mensaje en MongoDB y enviarlo a todos los clientes de la sala
		sendMessageToRoom(room, p, client)

		// Enviar un mensaje de respuesta al cliente
		err = conn.WriteMessage(messageType, p)
		if err != nil {
			log.Println("Error al enviar el mensaje:", err)
			break
		}
	}

	// Eliminar al cliente de la sala si se cierra la conexión
	delete(room.clients, conn)
}

func main() {
	http.HandleFunc("/ws", handleWebSocket)

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000"},
	})

	handler := c.Handler(http.DefaultServeMux)

	log.Println("Servidor iniciado en http://localhost:3001")
	err := http.ListenAndServe(":3001", handler)
	if err != nil {
		log.Fatal("Error al iniciar el servidor:", err)
	}
}
