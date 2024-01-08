package dtos

import "github.com/gorilla/websocket"

type DataProject struct {
	Config         string `json:"config"`
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

type Add struct {
	RowIndex int `json:"rowIndex"`
	Height   int `json:"height"`
}

// case fosil

type Fosil struct {
	UpperLimit     int    `json:"upperLimit"`
	LowerLimit     int    `json:"lowerLimit"`
	SelectedFossil string `json:"selectedFosil"`
	RelativeX      int    `json:"relativeX"`
}

type EditFosil struct {
	IdFosil        int
	UpperLimit     int    `json:"upperLimit"`
	LowerLimit     int    `json:"lowerLimit"`
	SelectedFossil string `json:"selectedFosil"`
	RelativeX      int    `json:"relativeX"`
}
