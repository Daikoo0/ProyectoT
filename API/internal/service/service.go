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
	
	AddUserRole(ctx context.Context, userEmail string, roleID int64) error
	RemoveUserRole(ctx context.Context, userEmail string, roleID int64) error

	SaveProject(ctx context.Context, data string, name string) error
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