package models

type Message struct { //clase mensaje
	ID      string `bson:"_id,omitempty"`
	Room    string `bson:"room"`
	Message string `bson:"message"`
}