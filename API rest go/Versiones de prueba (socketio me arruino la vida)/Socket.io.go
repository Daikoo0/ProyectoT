package main

import (
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/googollee/go-socket.io"
	log "github.com/sirupsen/logrus"
)

func main() {
	gin.SetMode(gin.ReleaseMode)

	log.SetOutput(os.Stdout)
	log.SetLevel(log.DebugLevel)
	log.Debug("Inicializando")

	router := gin.Default()

	server := socketio.NewServer(nil)

	server.OnConnect("/", func(conn socketio.Conn) error {
		log.Debug("Cliente conectado")
		conn.Emit("debug", "Conectado")
		//conn.Join("chat")
		return nil
	})
	io.on("connection", func(socket socketio.Socket) {
		log.Debug("Cliente conectado")
	})
	
	server.OnEvent("/", "debug", func(conn socketio.Conn, msg string) {
		log.Debug("Mensaje del cliente:", msg)
		conn.Emit("debug", "Hola, soy un mensaje del servidor")
	})

	server.OnDisconnect("/", func(conn socketio.Conn, reason string) {
		log.Debug("Client disconnected:", conn.ID())
	})

	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://127.0.0.1:3000"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type"},
	}))

	router.GET("/socket.io/*any", gin.WrapH(server))
	router.POST("/socket.io/*any", gin.WrapH(server))

	router.Run(":3001")
}