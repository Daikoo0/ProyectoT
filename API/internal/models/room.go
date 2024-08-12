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
	Data       []DataInfo                 `bson:"data"`
	Config     map[string]interface{}     `bson:"config"`
	Fosil      map[string]Fosil           `bson:"fosil"`
	Facies     map[string][]FaciesSection `bson:"facies"`
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
	X       float32 `json:"X"`
	Y       float32 `json:"Y"`
	Radius  float32 `json:"Radius"`
	Movable bool    `json:"Movable"`
	Name    string  `json:"Name"`
}

type FaciesSection struct {
	Y1 float32 `json:"y1"`
	Y2 float32 `json:"y2"`
}

type Fosil struct {
	Upper    int     `json:"upper"`
	Lower    int     `json:"lower"`
	FosilImg string  `json:"fosilImg"`
	X        float32 `json:"x"`
}

func NewFosil(upper int, lower int, fosilImg string, x float32) Fosil {
	return Fosil{
		Upper:    upper,
		Lower:    lower,
		FosilImg: fosilImg,
		X:        x,
	}
}

func NewCircle(point float32) CircleStruc {
	return CircleStruc{
		X:       0.5,
		Y:       point,
		Radius:  5,
		Movable: true,
		Name:    "none",
	}
}

func NewShape() DataInfo {
	return DataInfo{
		Sistema:                "",
		Edad:                   "",
		Formacion:              "",
		Miembro:                "",
		Espesor:                "",
		Facie:                  "",
		AmbienteDepositacional: "",
		Descripcion:            "",
		Litologia: LitologiaStruc{
			ColorFill:   "#ffffff",
			ColorStroke: "#000000",
			Zoom:        100,
			Rotation:    0,
			Tension:     0.5,
			File:        "Sin Pattern",
			Height:      100,
			Circles: []CircleStruc{
				{X: 0, Y: 0, Radius: 5, Movable: false},
				{X: 0.5, Y: 0, Radius: 5, Movable: true, Name: "none"},
				{X: 0.5, Y: 1, Radius: 5, Movable: true, Name: "none"},
				{X: 0, Y: 1, Radius: 5, Movable: false},
			},
			Contact:     "111",
			PrevContact: "111",
		},
	}
}
