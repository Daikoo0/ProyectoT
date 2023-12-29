package dtos

import "github.com/gorilla/websocket"

type DataProject struct {
	Config         string `json: "config"`
	Data           string `json:"data"`
	WebSocketConns map[string]*websocket.Conn
}

// Case editText
type EditText struct {
	Key      string      `json:"key"`
	Value    interface{} `json:"value"`
	RowIndex int         `json:"rowIndex"`
}

// Case add
