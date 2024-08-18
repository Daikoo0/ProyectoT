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
	GetRoom(ctx context.Context, roomName string) (*models.Project, error)
	GetRoomInfo(ctx context.Context, roomID string) (*models.ProjectInfo, error)
	CreateRoom(ctx context.Context, roomName string, name string, correo string, desc string, location string, lat float64, long float64, visible bool) error
	SaveRoom(ctx context.Context, data []models.DataInfo, config models.Config, fosil map[string]models.Fosil, roomName string, facies map[string][]models.FaciesSection) error
	SaveProject(ctx context.Context, data string, name string) error
	//GetPermission(ctx context.Context, correo string, proyectID string) (int, error)

	// Profile - profile.service.go
	GetProyects(ctx context.Context, user string) ([]models.InfoProject, error)
	HandleGetPublicProject(ctx context.Context) ([]models.ProjectInfo, error)
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
