package repository

import (
	context "context"
	"errors"
	"log"

	entity "github.com/ProyectoT/api/internal/entity"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func (r *repo) GetProyects(ctx context.Context, email string) ([]string, error) {

	users := r.db.Collection("users")
	filter := bson.M{"email": email}

	result := users.FindOne(ctx, filter)
	if err := result.Err(); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil // User not found
		}
		log.Println("Error finding user:", err)
		return nil, err
	}

	var user entity.User
	err := result.Decode(&user)
	if err != nil {
		log.Println("Error decoding user:", err)
		return nil, err
	}
	log.Println(user.Proyects)

	return user.Proyects, nil
}