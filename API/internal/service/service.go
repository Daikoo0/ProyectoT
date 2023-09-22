package service

import (
	"context"
	"log"

	"github.com/ProyectoT/api/internal/models"
	"github.com/ProyectoT/api/internal/repository"
)

// Service is the business logic of the application.
//go:generate mockery --name=Service --output=service --inpackage
type Service interface {
	RegisterUser(ctx context.Context, email, name, password string) error
	LoginUser(ctx context.Context, email, password string) (*models.User, error)
	
	ConnectRoom(ctx context.Context, roomName string, user string) (*models.Room, error)
	GetRoom(ctx context.Context, roomName string) (*models.Room, error)
	CreateRoom(ctx context.Context, roomName string, user string, participants map[string]models.Role) error

	SaveProject(ctx context.Context, data string, name string) error
	SaveRoom(ctx context.Context, data string, roomName string) error
	SaveUsers(ctx context.Context, room *models.Room) error
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