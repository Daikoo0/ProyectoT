package repository

import (
	"context"

	"github.com/ProyectoT/api/internal/entity"
	"github.com/ProyectoT/api/internal/models"
	"go.mongodb.org/mongo-driver/mongo"
)

// mockery se configura con comentarios, mockery sirve para debugear el code
//
//go:generate mockery --name=Repository --output=repository --inpackage
type Repository interface { //comunicaciones con la base de datos

	// Room - room.repository.go
	ConnectRoom(ctx context.Context, roomName string, user string) (*models.Data_project, error) // Conecta a un usuario a una sala
	GetRoom(ctx context.Context, roomName string) (*models.Data_project, error)
	GetRoomInfo(ctx context.Context, roomID string) (*models.Data, error)                                                                                     // Devuelve la entidad sala
	CreateRoom(ctx context.Context, roomName string, name string, correo string, desc string, location string, lat float64, long float64, visible bool) error // Crea una sala
	SaveProject(ctx context.Context, data string, name string) error                                                                                          // Guarda un proyecto en la base de datos
	SaveRoom(ctx context.Context, data []map[string]interface{}, config map[string]interface{}, name string) error                                            // Guarda una sala en la base de datos
	SaveUsers(ctx context.Context, room *models.Data) error                                                                                                   // Guarda los usuarios de una sala en la base de datos

	// Profile - profile.repository.go
	GetProyects(ctx context.Context, email string) ([]models.Data, error) // Devuelve los proyectos de un usuario
	GetPermission(ctx context.Context, correo string, proyectID string) (int, error)
	HandleGetPublicProject(ctx context.Context) ([]models.Data, error) // Devuelve los proyectos publicos

	// Users - user.repository.go
	SaveUser(ctx context.Context, email, name, lastname, password string) error // Guarda un usuario en la base de datos
	GetUserByEmail(ctx context.Context, email string) (*entity.User, error)     // Devuelve la entidad usuario (OBJID, email, name, password, proyects)
	AddUser(ctx context.Context, email string, roomName string) error           // Agrega un usuario a una sala
}
type repo struct {
	db *mongo.Database
}

func New(db *mongo.Database) Repository {
	return &repo{
		db: db,
	}
}
