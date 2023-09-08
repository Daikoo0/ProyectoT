package repository

import (
	"context"

	"github.com/ProyectoT/api/internal/entity"
	"go.mongodb.org/mongo-driver/mongo"
)
//mockery se configura con comentarios, mockery sirve para debugear el code
//go:generate mockery --name=Repository --output=repository --inpackage
type Repository interface { //comunicaciones con la base de datos
	SaveUser(ctx context.Context, email, name, password string) error //guarda un usuario en la base de datos
	GetUserByEmail(ctx context.Context, email string) (*entity.User, error) //devuelve la entidad usuario

	SaveUserRole(ctx context.Context, userEmail string, roleID int64) error
	RemoveUserRole(ctx context.Context, userEmail string, roleID int64) error
	GetUserRoles(ctx context.Context, email string) ([]entity.UserRole, error)


	//se reciben y se devuelven interfaces
	//no trabajo en funcion de structs por que el main recibe interfaces
	//(no quiero convertir a struct enviar y reconvertir a interfaz)
}
type repo struct {
	db *mongo.Database
}


func New(db *mongo.Database) Repository {
	return &repo{
		db: db,
	}
}