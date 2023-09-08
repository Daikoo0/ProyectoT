package repository

import (
	"context"
	"errors"
	"log"

	"github.com/ProyectoT/api/internal/entity"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func (r *repo) SaveUser(ctx context.Context, email, name, password string) error {
	user := entity.User{
		Email:    email,
		Name:     name,
		Password: password,
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

func (r *repo) SaveUserRole(ctx context.Context, userEmail string, roleID int64) error {
	rol := r.db.Collection("rol")
	data := entity.UserRole{
		UserEmail: userEmail,
		RoleID: roleID,
	}
	_, err := rol.InsertOne(ctx, data)
	if err != nil {
		log.Println("Error giving permission:", err)
		return err
	}

	return nil
}

func (r *repo) RemoveUserRole(ctx context.Context, userEmail string, roleID int64) error {
	rol := r.db.Collection("rol")
	filter := bson.M{"UserEmail": userEmail, "RoleID": roleID}

	result := rol.FindOneAndDelete(ctx, filter)

	if err := result.Err(); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil // objeto no encontrado
		}
		log.Println("Error finding user:", err)
		return err
	}


	return nil
}

func (r *repo) GetUserRoles(ctx context.Context, email string) ([]entity.UserRole, error) {
	roles := []entity.UserRole{}
	rol := r.db.Collection("rol")
	filter := bson.M{"useremail": email}
	cursor, err := rol.Find(context.Background(), filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())
	for cursor.Next(context.Background()) {
		var match entity.UserRole
		if err := cursor.Decode(&match); err != nil {
			return nil, err
		}
		roles = append(roles, match)
	}
	return roles, nil
}
