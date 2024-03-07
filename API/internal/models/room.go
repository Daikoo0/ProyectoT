package models

import "go.mongodb.org/mongo-driver/bson/primitive"

// type Room struct {
// 	Name    string
// 	Clients map[string]Role
// 	Data    []map[string]interface{}
// 	Config  map[string]interface{}
// }

type Data struct {
	ID           primitive.ObjectID `bson:"_id,omitempty"`
	Name         string
	Owner        string
	Members      map[string]interface{}
	CreationDate string
	Description  string
	Location     string
	Lat          float64
	Long         float64
	Visible      bool
}

type Data_project struct {
	Id_project primitive.ObjectID
	Data       []map[string]interface{} `bson:"data"`
	Config     map[string]interface{}   `bson:"config"`
	Fosil      map[string]interface{}   `bson:"fosil"`
}
