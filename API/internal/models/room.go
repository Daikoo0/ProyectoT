package models
import(
	"github.com/gorilla/websocket"
)

type Room struct { //clase room
	name    string
	clients map[*websocket.Conn]bool
}