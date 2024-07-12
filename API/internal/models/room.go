package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

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
	Data       []DataInfo             `bson:"data"`
	Config     map[string]interface{} `bson:"config"`
	Fosil      map[string]interface{} `bson:"fosil"`
	Facies     map[string]interface{} `bson:"facies"`
}

type DataInfo struct {
	Sistema                string         `json:"Sistema"`
	Edad                   string         `json:"Edad"`
	Formacion              string         `json:"Formacion"`
	Miembro                string         `json:"Miembro"`
	Espesor                string         `json:"Espesor"`
	Facie                  string         `json:"Facie"`
	AmbienteDepositacional string         `json:"Ambiente Depositacional"`
	Descripcion            string         `json:"Descripcion"`
	Litologia              LitologiaStruc `json:"Litologia"`
}

type LitologiaStruc struct {
	ColorFill   string        `json:"ColorFill"`
	ColorStroke string        `json:"ColorStroke"`
	File        string        `json:"File"`
	Contact     string        `json:"Contact"`
	PrevContact string        `json:"PrevContact"`
	Zoom        int           `json:"Zoom"`
	Rotation    int           `json:"Rotation"`
	Height      int           `json:"Height"`
	Tension     float32       `json:"Tension"`
	Circles     []CircleStruc `json:"Circles"`
}

type CircleStruc struct {
	X       float64 `json:"X"`
	Y       float64 `json:"Y"`
	Radius  float64 `json:"Radius"`
	Movable bool    `json:"Movable"`
	Name    string  `json:"Name"`
}
