package repository

import (
	"context"
	"errors"
	"log"

	"github.com/ProyectoT/api/internal/entity"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func (r *repo) SaveUser(ctx context.Context, email, name, lastname, password string) error {
	user := entity.User{
		Email:    email,
		Name:     name,
		LastName: lastname,
		Password: password,
		Proyects: []string{},
	}

	users := r.db.Collection("users")
	_, err := users.InsertOne(ctx, user)
	if err != nil {
		log.Println("Error saving user:", err)
		return err
	}

	return nil
}

func (r *repo) GetUserByEmail(ctx context.Context, email string) (*entity.User, error) {
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

	return &user, nil
}

func (r *repo) AddUser(ctx context.Context, email string, roomName string) error {
	users := r.db.Collection("users")
	filter := bson.M{"email": email}
	update := bson.M{"$push": bson.M{"proyects": roomName}}
	opts := options.Update().SetUpsert(true)
	_, err := users.UpdateOne(ctx, filter, update, opts)
	if err != nil {
		log.Println("Error updating room:", err)
		return err
	}

	return nil
}

func (r *repo) DeleteUserRoom(ctx context.Context, email string, roomID string) error {
	// "members": {
	// 	"0": "a@a.com",
	// 	"1": [
	// 	  "tamara@mail.com",
	// 	  "dani@mail.com"
	// 	],
	// 	"2": []
	//   },
	users := r.db.Collection("projects")
	filter := bson.M{"id_project": roomID}
	update := bson.M{"$pull": bson.M{"members": bson.M{"$in": []string{email}}}}
	opts := options.Update().SetUpsert(true)
	result, err := users.UpdateOne(ctx, filter, update, opts)
	if err != nil {
		log.Println("Error updating room:", err)
		return err
	}
	if result.MatchedCount == 0 {
		log.Printf("User with email %s not found in room %s", email, roomID)
	} else {
		log.Printf("Successfully deleted user %s from room %s", email, roomID)
	}

	return nil
}
