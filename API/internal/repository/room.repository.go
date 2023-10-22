package repository

import (
	"context"
	"errors"
	"log"

	"github.com/ProyectoT/api/internal/entity"
	"github.com/ProyectoT/api/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func (r *repo) ConnectRoom(ctx context.Context, roomName string, user string) (*models.Room, error) {

	rooms := r.db.Collection("rooms")
	var room models.Room
	err := rooms.FindOne(ctx, bson.M{"name": roomName}).Decode(&room)
	if err == mongo.ErrNoDocuments {
		return nil, err
	}
	log.Println(room)

	return &room, nil
}

func (r *repo) GetRoom(ctx context.Context, roomName string) (*models.Room, error) {

	rooms := r.db.Collection("rooms")
	var room models.Room
	err := rooms.FindOne(ctx, bson.M{"name": roomName}).Decode(&room)
	if err != nil {
		return nil, err
	}

	return &room, nil
}

func (r *repo) CreateRoom(ctx context.Context, roomName string, owner string, participants map[string]models.Role) error {
	rooms := r.db.Collection("rooms")
	participants[owner] = models.Owner
	room := &models.Room{
		Name:    roomName,
		Clients: participants,
		Data:    []map[string]interface{}{},
		Config: map[string]interface{}{
			"columns": map[string]interface{}{
				"Arcilla-Limo-Arena-Grava": map[string]interface{}{"enabled": true},
				"Sistema":                  map[string]interface{}{"enabled": true},
				"Edad":                     map[string]interface{}{"enabled": true},
				"Formación":                map[string]interface{}{"enabled": true},
				"Miembro":                  map[string]interface{}{"enabled": true},
				"Estructuras y/o fósiles":  map[string]interface{}{"enabled": true},
				"Facie":                    map[string]interface{}{"enabled": true},
				"Ambiente depositacional":  map[string]interface{}{"enabled": true},
				"Descripción":              map[string]interface{}{"enabled": true},
			},
			"scale": 50,
		},
	}

	var existingRoom models.Room
	err := rooms.FindOne(ctx, bson.M{"name": roomName}).Decode(&existingRoom)
	if err != mongo.ErrNoDocuments {
		if err != nil {
			log.Println("Error checking project existence:", err)
			return err
		}
		return errors.New("room with this name already exists")
	}

	_, err = rooms.InsertOne(ctx, room)
	if err != nil {
		log.Println("Error creating room:", err)
		return err
	}

	//actualizar los documentos de los usuarios
	for p := range participants {
		r.AddUser(ctx, p, roomName)
	}

	return nil
}
func (r *repo) SaveRoom(ctx context.Context, data []map[string]interface{}, config map[string]interface{}, roomName string) error {
	filter := bson.M{"name": roomName}
	update := bson.M{"$set": bson.M{
		"data": data,
		"config": config,
	}}

	rooms := r.db.Collection("rooms")
	opts := options.Update().SetUpsert(true)
	_, err := rooms.UpdateOne(ctx, filter, update, opts)
	if err != nil {
		log.Println("Error updating room:", err)
		return err
	}

	return nil
}

func (r *repo) SaveUsers(ctx context.Context, room *models.Room) error {
	filter := bson.M{"name": room.Name}
	update := bson.M{"$set": bson.M{
		"clients": room.Clients,
	}}
	log.Println(update)

	rooms := r.db.Collection("rooms")
	opts := options.Update().SetUpsert(true)
	_, err := rooms.UpdateOne(ctx, filter, update, opts)
	if err != nil {
		log.Println("Error updating room:", err)
		return err
	}

	return nil
}
func (r *repo) SaveProject(ctx context.Context, data string, name string) error {
	project := entity.Project{
		Name: name,
		Data: data,
	}

	projects := r.db.Collection("projects")
	_, err := projects.InsertOne(ctx, project)
	if err != nil {
		log.Println("Error saving project:", err)
		return err
	}

	return nil
}
