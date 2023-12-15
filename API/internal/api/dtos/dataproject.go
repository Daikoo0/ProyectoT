package dtos

import "github.com/gorilla/websocket"

type DataProject struct {
	Config         string `json: "config"`
	Data           string `json:"data"`
	WebSocketConns map[string]*websocket.Conn
}
