package repository

import (
	"context"

	"github.com/ProyectoT/api/internal/entity"
	"github.com/ProyectoT/api/internal/models"
	"go.mongodb.org/mongo-driver/mongo"
)

//mockery se configura con comentarios, mockery sirve para debugear el code
//go:generate mockery --name=Repository --output=repository --inpackage
type Repository interface { //comunicaciones con la base de datos
	SaveUser(ctx context.Context, email, name, password string) error //guarda un usuario en la base de datos
	GetUserByEmail(ctx context.Context, email string) (*entity.User, error) //devuelve la entidad usuario

	ConnectRoom(ctx context.Context, roomName string, user string) (*models.Room, error)
	GetRoom(ctx context.Context, roomName string) (*models.Room, error)

	SaveProject(ctx context.Context, data string, name string) error
	SaveRoom(ctx context.Context, roomName string, data string) error
	
	SaveUsers(ctx context.Context, room *models.Room) error
	CreateRoom(ctx context.Context, roomName string, owner string, participants map[string]models.Role) error

	GetProyects(ctx context.Context, email string) ([]string, error)
	AddUser(ctx context.Context, email string, roomName string) error

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