package repository

import (
	"context"
	"log"

	//"log"
	//"fmt"

	//entity "github.com/ProyectoT/api/internal/entity"
	"github.com/ProyectoT/api/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func (r *repo) GetProyects(ctx context.Context, correo string) ([]models.InfoProject, error) {
	users := r.db.Collection("projects")

	filter := bson.M{
		"$or": []bson.M{
			{"projectinfo.members.owner": correo},
			{"projectinfo.members.editors": correo},
			{"projectinfo.members.readers": correo},
		},
	}

	projection := bson.M{
		"projectinfo": 1,
	}

	// Realiza la consulta con la proyección
	cursor, err := users.Find(ctx, filter, options.Find().SetProjection(projection))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var projects []models.InfoProject

	if err := cursor.All(ctx, &projects); err != nil {
		return nil, err
	}

	return projects, nil
}

// func (r *repo) GetPermission(ctx context.Context, correo string, proyectID string) (int, error) {
// 	users := r.db.Collection("projects")

// 	objectID, err := primitive.ObjectIDFromHex(proyectID)
// 	if err != nil {
// 		log.Fatal(err)
// 	}

// 	// Define el filtro usando bson.M en lugar de bson.D
// 	filter := bson.M{
// 		"_id": objectID,
// 		"$or": []bson.M{
// 			{"projectinfo.members.0": correo},
// 			{"projectinfo.members.1": correo},
// 			{"projectinfo.members.2": correo},
// 		},
// 	}

// 	// Realiza la consulta
// 	var room models.ProjectInfo
// 	err = users.FindOne(ctx, filter).Decode(&room)
// 	if err != nil {
// 		// Manejar el error, por ejemplo, imprimirlo o devolverlo
// 		if err == mongo.ErrNoDocuments {
// 			// Si no se encuentra el proyecto, devolver un error específico o nil
// 			return -1, errors.New("project not found")
// 		}
// 		return -1, err
// 	}

// 	for i := 0; i < 3; i++ {
// 		// Verificar si el índice existe en la lista de miembros
// 		if miembro, ok := room.Members[strconv.Itoa(i)]; ok {
// 			switch v := miembro.(type) {
// 			case string:
// 				if v == correo {
// 					return i, nil
// 				}
// 			case primitive.A:
// 				for _, correoEnLista := range v {
// 					if correoStr, ok := correoEnLista.(string); ok && correoStr == correo {
// 						return i, nil
// 					}
// 				}
// 			}
// 		}
// 	}
// 	return -1, nil // Correo no encontrado en ninguna lista
// }

func (r *repo) HandleGetPublicProject(ctx context.Context) ([]models.ProjectInfo, error) {

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
	var projects []models.ProjectInfo

	if err := cursor.All(ctx, &projects); err != nil {
		// Manejar el error, por ejemplo, imprimirlo o devolverlo
		return nil, err
	}

	log.Println(projects)

	return projects, nil

}
