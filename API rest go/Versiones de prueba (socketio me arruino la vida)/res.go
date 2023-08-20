package main

import (
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	socketio "github.com/googollee/go-socket.io"
	log "github.com/sirupsen/logrus"
)

func main() {
	log.SetOutput(os.Stdout)
	log.SetLevel(log.DebugLevel)
	log.Debug("Inicializando")

	router := gin.Default()

	server := socketio.NewServer(nil)

	server.OnConnect("/", func(conn socketio.Conn) error {
		log.Debug("Client connected:", conn.ID())
		conn.Emit("debug", "Conectado")
		//conn.Join("chat")
		return nil
	})

	server.OnEvent("/", "debug", func(conn socketio.Conn, msg string) {
		log.Debug("Mensaje del cliente:", msg)
		conn.Emit("debug", "Hola, soy un mensaje del servidor")
	})

	server.OnDisconnect("/", func(conn socketio.Conn, reason string) {
		log.Debug("Client disconnected:", conn.ID())
	})

	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:3000"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	go func() {
		for {
			log.Debug("HOLA")
			time.Sleep(5 * time.Second)
			server.BroadcastToRoom("/", "chat", "Hola")
		}
	}()

	router.GET("/socket.io/*any", gin.WrapH(server))
	router.POST("/socket.io/*any", gin.WrapH(server))

	router.Run(":3001")
}