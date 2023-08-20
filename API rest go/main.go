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

type Room struct { //clase room
	name    string
	clients map[*websocket.Conn]bool
}
var rooms = make(map[string]*Room) //todas las rooms disponibles

type Message struct { //clase mensaje
	ID      string `bson:"_id,omitempty"`
	Room    string `bson:"room"`
	Message string `bson:"message"`
}

//conectar a mongodb
func connectToMongoDB() (*mongo.Client, error) {
	clientOptions := options.Client().ApplyURI("mongodb+srv://Hexzzard:homerochino@cluster0.6iqmxms.mongodb.net/") //usar .env
	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		log.Fatal(err)
	}
	return client, err
}

//guarda un mensaje en la base de datos
func insertMessage(client *mongo.Client, message Message) error {
	collection := client.Database("chat").Collection("messages")
	_, err := collection.InsertOne(context.Background(), message)
	if err != nil {
		log.Fatal(err)
	}
	return err
}

//transforma una peticion http en un websocket, permitido para todos los origenes
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

//obtiene el room a trabajar, si no existe lo crea
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

//envia un mensaje a todos los clientes conectados a la room
func sendMessageToRoom(room *Room, message []byte, client *mongo.Client) {
	msg := Message{
		ID:      room.name,
		Room:    room.name,
		Message: string(message),
	}
	err := insertMessage(client, msg)
	if err != nil {
		log.Println("Error al guardar el mensaje en MongoDB:", err)
	}

	for client := range room.clients {
		err := client.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			log.Println("Error al enviar mensaje al cliente:", err)
			delete(room.clients, client)
		}
	}
}

//funcion que maneja el websocket
func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	//obtenemos el nombre de la sala por parametros de url
	roomName := r.URL.Query().Get("room")

	//conexion a mongodb
	client, err := connectToMongoDB()
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(context.Background())

	//conectarse a la sala
	room := getOrCreateRoom(roomName)

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error al actualizar la conexión:", err)
		return
	}
	defer conn.Close()

	//obtener el documento asociado a el room
	collection := client.Database("chat").Collection("messages")
	filter := bson.M{"room": roomName}
	cursor, err := collection.Find(context.Background(), filter)
	if err != nil {
		log.Fatal(err)
	}
	defer cursor.Close(context.Background())

	//enviar la informacion al cliente
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
	//conectar el cliente a el room
	room.clients[conn] = true
	log.Println("Cliente conectado a la sala:", roomName)

	//escuchar los mensajes entrantes
	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			log.Println("Error al leer el mensaje:", err)
			break
		}

		//guardar el mensaje tambien en mongoDB
		sendMessageToRoom(room, p, client)

		err = conn.WriteMessage(messageType, p)
		if err != nil {
			log.Println("Error al enviar el mensaje:", err)
			break
		}
	}

	//si es que se cierra la conexion el cliente debe ser eliminado de la sala
	delete(room.clients, conn)
}

func main() {
	http.HandleFunc("/ws", handleWebSocket)

	//CORS
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
