package service

import (
	"context"
	"log"

	"github.com/ProyectoT/api/internal/models"
	"github.com/ProyectoT/api/internal/repository"
)

// Service is the business logic of the application.
//
//go:generate mockery --name=Service --output=service --inpackage
type Service interface {

	// --- Todas se comunican con repository --- //

	// Room - room.service.go
	ConnectRoom(ctx context.Context, roomName string, user string) (*models.Data_project, error)
	GetRoom(ctx context.Context, roomName string) (*models.Data_project, error) // Devuelve la entidad data-project :  data, config
	GetRoomInfo(ctx context.Context, roomID string) (*models.Data, error)
	CreateRoom(ctx context.Context, roomName string, name string, correo string, desc string, location string, lat float64, long float64, visible bool) error
	SaveRoom(ctx context.Context, data []map[string]interface{}, config map[string]interface{}, fosil map[string]interface{}, roomName string) error
	SaveUsers(ctx context.Context, room *models.Data) error
	SaveProject(ctx context.Context, data string, name string) error

	// Profile - profile.service.go
	GetProyects(ctx context.Context, user string) ([]models.Data, error)
	GetPermission(ctx context.Context, correo string, proyectID string) (int, error)
	HandleGetPublicProject(ctx context.Context) ([]models.Data, error)
	AddUser(ctx context.Context, user string, roomName string) error

	// Auth - auth.service.go
	RegisterUser(ctx context.Context, email, name, lastname, password string) error
	LoginUser(ctx context.Context, email, password string) (*models.User, error)
}

type serv struct {
	repo repository.Repository
}

func New(repo repository.Repository) Service {
	log.Println("hola desde services")
	return &serv{
		repo: repo,
	}
}
