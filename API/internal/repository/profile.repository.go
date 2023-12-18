package repository

import (
	"context"
	"errors"
	"log"
	"strconv"

	//"log"
	//"fmt"

	//entity "github.com/ProyectoT/api/internal/entity"
	"github.com/ProyectoT/api/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func (r *repo) GetProyects(ctx context.Context, correo string) ([]models.Data, error) {
	users := r.db.Collection("projects")

	// Define el filtro usando bson.M en lugar de bson.D
	filter := bson.M{
		"$or": []bson.M{
			{"members.0": correo},
			{"members.1": correo},
			{"members.2": correo},
		},
	}

	// Realiza la consulta
	cursor, err := users.Find(ctx, filter)
	if err != nil {
		// Manejar el error, por ejemplo, imprimirlo o devolverlo
		return nil, err
	}
	defer cursor.Close(ctx)

	// Decodifica los resultados en una slice de la estructura que representa tus proyectos
	var projects []models.Data

	if err := cursor.All(ctx, &projects); err != nil {
		// Manejar el error, por ejemplo, imprimirlo o devolverlo
		return nil, err
	}

	log.Println(projects)

	return projects, nil
}

func (r *repo) GetPermission(ctx context.Context, correo string, proyectID string) (int, error) {
	users := r.db.Collection("projects")

	objectID, err := primitive.ObjectIDFromHex(proyectID)
	if err != nil {
		log.Fatal(err)
	}
	
	// Define el filtro usando bson.M en lugar de bson.D
	filter := bson.M{
		"_id": objectID,
		"$or": []bson.M{
			{"members.0": correo},
			{"members.1": correo},
			{"members.2": correo},
		},
	}

	// Realiza la consulta
	var room models.Data
	err = users.FindOne(ctx, filter).Decode(&room)
	if err != nil {
		// Manejar el error, por ejemplo, imprimirlo o devolverlo
		if err == mongo.ErrNoDocuments {
			// Si no se encuentra el proyecto, devolver un error específico o nil
			return -1, errors.New("project not found")
		}
		return -1, err
	}
	log.Println("///////////////////////////////")
	log.Println(room)

	// La consulta esta correcta, pero no se encontró el correo
	for i := 0; i < 3; i++ {
		// Supongamos que `members` es un slice dentro de `room`
		if len(room.Members) > i && room.Members[strconv.Itoa(i)] == correo {
			return i, nil
		}
	}

	return -1, nil // Correo no encontrado en ninguna lista	
}

func (r *repo) HandleGetPublicProject(ctx context.Context) ([]models.Data, error) {

	dbprojects := r.db.Collection("projects")

	// Define el filtro usando bson.M en lugar de bson.D
	filter := bson.M{
		"visible": true,
	}

	// Realiza la consulta
	cursor, err := dbprojects.Find(ctx, filter)
	if err != nil {
		// Manejar el error, por ejemplo, imprimirlo o devolverlo
		return nil, err
	}
	defer cursor.Close(ctx)

	// Decodifica los resultados en una slice de la estructura que representa tus proyectos
	var projects []models.Data

	if err := cursor.All(ctx, &projects); err != nil {
		// Manejar el error, por ejemplo, imprimirlo o devolverlo
		return nil, err
	}

	log.Println(projects)

	return projects, nil

}
	
