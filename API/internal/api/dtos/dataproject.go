package dtos

import (
	"github.com/gorilla/websocket"
)

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

// Case delete
type Delete struct {
	RowIndex int `json:"rowIndex"`
}

// Circle
type Circle struct {
	X       float32 `json:"x"`
	Y       float32 `json:"y"`
	Radius  int     `json:"radius"`
	Movable bool    `json:"movable"`
}

// AddCircle
type AddCircle struct {
	RowIndex    int     `json:"rowIndex"`
	InsertIndex int     `json:"insertIndex"`
	Point       float32 `json:"point"`
}

// DeleteCircle
type DeleteCircle struct {
	RowIndex    int `json:"rowIndex"`
	DeleteIndex int `json:"deleteIndex"`
}

// EditCircle
type EditCircle struct {
	RowIndex  int     `json:"rowIndex"`
	EditIndex int     `json:"editIndex"`
	X         float32 `json:"x"`
	Name      string  `json:"name"`
}

// case fosil
type AddFosil struct {
	Upper    int     `json:"upper"`
	Lower    int     `json:"lower"`
	FosilImg string  `json:"fosilImg"`
	X        float32 `json:"x"`
}

type EditFosil struct {
	IdFosil  string  `json:"idFosil"`
	Upper    int     `json:"upper"`
	Lower    int     `json:"lower"`
	FosilImg string  `json:"fosilImg"`
	X        float32 `json:"x"`
}

type DeleteFosil struct {
	IdFosil string `json:"idFosil"`
}

type Column struct {
	Column    string `json:"column"`
	IsVisible bool   `json:"isVisible"`
}

type EditPolygon struct {
	RowIndex int    `json:"rowIndex"`
	Column   string `json:"column"`
	Value    string `json:"value"`
}

type UserEditingState struct {
	Section string
}
