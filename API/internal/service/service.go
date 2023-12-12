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
	ConnectRoom(ctx context.Context, roomName string, user string) (*models.Room, error)
	GetRoom(ctx context.Context, roomName string) (*models.Room, error) // Devuelve la entidad sala - name, clients, data, config
	CreateRoom(ctx context.Context, roomName string, user string, participants map[string]models.Role) error
	SaveRoom(ctx context.Context, data []map[string]interface{}, config map[string]interface{}, roomName string) error
	SaveUsers(ctx context.Context, room *models.Room) error
	SaveProject(ctx context.Context, data string, name string) error

	// Profile - profile.service.go
	GetProyects(ctx context.Context, user string) ([]string, error)
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
