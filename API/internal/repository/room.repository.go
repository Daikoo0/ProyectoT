package repository

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/ProyectoT/api/internal/entity"
	"github.com/ProyectoT/api/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func (r *repo) ConnectRoom(ctx context.Context, roomID string, user string) (*models.Data_project, error) {

	rooms := r.db.Collection("data-projects")
	var room models.Data_project

	objectID, err := primitive.ObjectIDFromHex(roomID)
	if err != nil {
		log.Fatal(err)
	}
	err = rooms.FindOne(ctx, bson.M{"id_project": objectID}).Decode(&room)
	if err == mongo.ErrNoDocuments {
		return nil, err
	}
	log.Println(room)

	return &room, nil
}

// Obtiene el contenido de la sala (shapes, configuracion, etc)
func (r *repo) GetRoom(ctx context.Context, roomID string) (*models.Data_project, error) {

	rooms := r.db.Collection("data-projects")
	var room models.Data_project
	objectID, err := primitive.ObjectIDFromHex(roomID)
	if err != nil {
		log.Fatal(err)
	}

	err = rooms.FindOne(ctx, bson.M{"id_project": objectID}).Decode(&room)
	if err != nil {
		return nil, err
	}

	return &room, nil
}

// Obtiene la informacion general de la sala (miembros, etc)
func (r *repo) GetRoomInfo(ctx context.Context, roomID string) (*models.Data, error) {

	rooms := r.db.Collection("projects")
	var room models.Data
	objectID, err := primitive.ObjectIDFromHex(roomID)
	if err != nil {
		log.Fatal(err)
	}

	err = rooms.FindOne(ctx, bson.M{"_id": objectID}).Decode(&room)
	if err != nil {
		return nil, err
	}

	return &room, nil
}

func (r *repo) CreateRoom(ctx context.Context, roomName string, name string, correo string, desc string, location string, lat float64, long float64, visible bool) error {
	rooms := r.db.Collection("projects")
	data_projects := r.db.Collection("data-projects")
	anio, mes, dia := time.Now().Date()
	creationDate := fmt.Sprintf("%d-%02d-%02d", anio, mes, dia)

	room := &models.Data{
		Name:  roomName,
		Owner: name,
		Members: map[string]interface{}{
			"0": correo,
			"1": []string{},
			"2": []string{},
		},
		CreationDate: creationDate,
		Description:  desc,
		Location:     location,
		Lat:          lat,
		Long:         long,
		Visible:      visible,
	}

	var existingRoom models.Data
	//var existingDataProject models.Data_project

	//emailKey := fmt.Sprintf("members.%s", correo)
	err := rooms.FindOne(ctx, bson.M{"name": roomName, "members": bson.M{"0": correo}}).Decode(&existingRoom)
	if err != mongo.ErrNoDocuments {
		if err != nil {
			log.Println("Error checking project existence:", err)
			return err
		}
		return errors.New("room with this name and email/user already exists")
	}

	log.Println(existingRoom)

	var result, errd = rooms.InsertOne(ctx, room)
	if errd != nil {
		log.Println("Error creating room:", err)
		return err
	}

	roomID := result.InsertedID.(primitive.ObjectID)

	data_project := &models.Data_project{
		Id_project: roomID,
		Data:       []models.DataInfo{},
		Fosil:      map[string]interface{}{},
		Facies:     map[string]interface{}{},
		Config: map[string]interface{}{
			"columns": map[string]bool{
				"Sistema":                 true,
				"Edad":                    true,
				"Formacion":               true,
				"Miembro":                 true,
				"Espesor":                 true,
				"Litologia":               true,
				"Estructura fosil":        true,
				"Facie":                   true,
				"Ambiente Depositacional": true,
				"Descripcion":             true,
			},
			"scale":      50,
			"isInverted": false,
		},
	}

	_, err = data_projects.InsertOne(ctx, data_project)
	if err != nil {
		log.Println("Error creating room:", err)
		return err
	}

	//actualizar los documentos de los usuarios
	// for p := range participants {
	// 	r.AddUser(ctx, p, roomName)
	// }

	return nil
}

func (r *repo) DeleteProject(ctx context.Context, roomID string) error {
	dbProject := r.db.Collection("projects")
	dbDataProject := r.db.Collection("data-projects")

	projectID, err := primitive.ObjectIDFromHex(roomID)
	if err != nil {
		return fmt.Errorf("invalid project ID: %w", err)
	}

	res, err := dbProject.DeleteOne(ctx, bson.M{"_id": projectID})
	if err != nil {
		log.Println("Error deleting room:", err)
		return err
	}
	if res.DeletedCount == 0 {
		return fmt.Errorf("project not found in projects collection")
	}

	_, err = dbDataProject.DeleteOne(ctx, bson.M{"id_project": projectID})
	if err != nil {
		log.Println("Error deleting room:", err)
		return err
	}

	return nil
}

func (r *repo) SaveRoom(ctx context.Context, data []models.DataInfo, config map[string]interface{}, fosil map[string]interface{}, roomName string, facies map[string]interface{}) error {
	objectID, err := primitive.ObjectIDFromHex(roomName)
	if err != nil {
		return fmt.Errorf("invalid project ID: %w", err)
	}
	filter := bson.M{"id_project": objectID}
	update := bson.M{"$set": bson.M{
		"data":   data,
		"config": config,
		"fosil":  fosil,
		"facies": facies,
	}}

	rooms := r.db.Collection("data-projects")
	opts := options.Update().SetUpsert(true)
	_, err = rooms.UpdateOne(ctx, filter, update, opts)
	if err != nil {
		log.Println("Error updating room:", err)
		return err
	}

	return nil
}

func (r *repo) AddUserToProject(ctx context.Context, email string, role string, roomID string) error {
	// Obtener la colección "projects" de la base de datos
	users := r.db.Collection("projects")
	projectID, err := primitive.ObjectIDFromHex(roomID)
	if err != nil {
		return fmt.Errorf("invalid project ID: %w", err)
	}

	// Filtrar por id_project
	filter := bson.M{"_id": projectID}

	// Definir una actualización para agregar el correo electrónico a la lista correspondiente
	update := bson.M{
		"$push": bson.M{
			"members." + role: email,
		},
	}

	// Opciones de actualización
	opts := options.Update().SetUpsert(false)

	// Realizar la actualización en la base de datos
	result, err := users.UpdateOne(ctx, filter, update, opts)
	if err != nil {
		log.Println("Error updating room:", err)
		return err
	}

	if result.MatchedCount == 0 {
		log.Printf("Room with id %s not found", roomID)
	} else {
		log.Printf("Successfully added user %s to role %s in room %s", email, role, roomID)
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
