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
	GetRoomInfo(ctx context.Context, roomID string) (*models.Data, error)                                                                                                       // Devuelve la entidad sala
	CreateRoom(ctx context.Context, roomName string, name string, correo string, desc string, location string, lat float64, long float64, visible bool) error                   // Crea una sala
	SaveProject(ctx context.Context, data string, name string) error                                                                                                            // Guarda un nuevo proyecto en la base de datos
	SaveRoom(ctx context.Context, data []map[string]interface{}, config map[string]interface{}, fosil map[string]interface{}, name string, facies map[string]interface{}) error // Actualiza un proyecto en MongoDB
	AddUserToProject(ctx context.Context, email string, role string, roomID string) error                                                                                       // Guarda los usuarios en una sala en la base de datos
	DeleteProject(ctx context.Context, roomID string) error                                                                                                                     // Elimina un proyecto                                                                                                // Elimina un proyecto                                                                                                    // Elimina una sala de la base de datos

	// Profile - profile.repository.go
	GetProyects(ctx context.Context, email string) ([]models.Data, error) // Devuelve los proyectos de un usuario
	GetPermission(ctx context.Context, correo string, proyectID string) (int, error)
	HandleGetPublicProject(ctx context.Context) ([]models.Data, error) // Devuelve los proyectos publicos

	// Users - user.repository.go
	SaveUser(ctx context.Context, email, name, lastname, password string) error // Guarda un usuario en la base de datos
	GetUserByEmail(ctx context.Context, email string) (*entity.User, error)     // Devuelve la entidad usuario (OBJID, email, name, password, proyects)
	AddUser(ctx context.Context, email string, roomName string) error           // Agrega un usuario a una sala
	DeleteUserRoom(ctx context.Context, email string, roomName string) error    // Elimina un usuario de una sala

	// Comments - comments.repository.go
	HandleAddComment(ctx context.Context, comment models.Comment) error
}
type repo struct {
	db *mongo.Database
}

func New(db *mongo.Database) Repository {
	return &repo{
		db: db,
	}
}
