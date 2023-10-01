package dtos

import "github.com/gorilla/websocket"

type Room struct {
	Name           string
	WebSocketConns map[string]*websocket.Conn
}