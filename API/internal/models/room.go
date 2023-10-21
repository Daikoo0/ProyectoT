package models

type Room struct {
	Name    string
	Clients map[string]Role
	Data    []map[string]interface{}
}
