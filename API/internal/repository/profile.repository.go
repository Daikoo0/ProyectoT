package repository

import (
	context "context"
	//"errors"
	//"log"
	//"fmt"

	//entity "github.com/ProyectoT/api/internal/entity"
	"go.mongodb.org/mongo-driver/bson"
	//"go.mongodb.org/mongo-driver/mongo"
	"github.com/ProyectoT/api/internal/models"
)

func (r *repo) GetProyects(ctx context.Context, correo string) ([]models.Data, error) {
    users := r.db.Collection("projects")

    // Define el filtro usando bson.M en lugar de bson.D
    filter := bson.D{
			{"$or",
				bson.A{
					bson.D{{"members", bson.D{{correo, 0}}}},
					bson.D{{"members", bson.D{{correo, 1}}}},
					bson.D{{"members", bson.D{{correo, 2}}}},
				},
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

    return projects, nil

	// result2, err := users.Find(ctx,   bson.D{
	// 	{"$or",
	// 		bson.A{
	// 			bson.D{{"members", bson.D{{correo, 0}}}},
	// 			bson.D{{"members", bson.D{{correo, 1}}}},
	// 			bson.D{{"members", bson.D{{correo, 2}}}},
	// 		},
	// 	},
	// })

	// if err != nil {
	// 	log.Println("Error finding rooms with email:", err)
	// 	return nil, err
	// }
	
	// if err := result2.Err(); err != nil {
		
    //  	log.Println("Se metio en el errrorAAAAAAAA")
	// 	if errors.Is(err, mongo.ErrNoDocuments) {
	// 		log.Println("AHHHHHHHHH")
	// 		log.Println(err)
	// 		return nil, nil // User not found
	// 	}
	// 	log.Println("Error finding user:", err)
	// 	return nil, err
	// }

	// var user2 models.Data
	// err = result2.Decode(&user2)
	// if err != nil {
	// 	log.Println("Error decoding user:", err)
	// 	return nil, err
	// }
	// log.Println(user2.Members)

	// return nil , err

	// result := users.FindOne(ctx, filter)
	// if err := result.Err(); err != nil {
	// 	if errors.Is(err, mongo.ErrNoDocuments) {
	// 		return nil, nil // User not found
	// 	}
	// 	log.Println("Error finding user:", err)
	// 	return nil, err
	// }

	// var user entity.User
	// err = result.Decode(&user)
	// if err != nil {
	// 	log.Println("Error decoding user:", err)
	// 	return nil, err
	// }
	// log.Println(user.Proyects)

	// return user.Proyects, nil
}