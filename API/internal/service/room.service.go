package service

import (
	"context"

	"github.com/ProyectoT/api/internal/models"
)

func (s *serv) GetRoom(ctx context.Context, roomName string) (*models.Project, error) {
	room, err := s.repo.GetRoom(ctx, roomName)
	if err != nil {
		return nil, err
	}
	return room, nil
}

func (s *serv) GetRoomInfo(ctx context.Context, roomName string) (*models.ProjectInfo, error) {
	room, err := s.repo.GetRoomInfo(ctx, roomName)
	if err != nil {
		return nil, err
	}
	return room, nil
}

func (s *serv) CreateRoom(ctx context.Context, roomName string, name string, correo string, desc string, location string, lat float64, long float64, visible bool) error {

	return s.repo.CreateRoom(ctx, roomName, name, correo, desc, location, lat, long, visible)
}

func (s *serv) SaveRoom(ctx context.Context, data []models.DataInfo, config models.Config, fosil map[string]models.Fosil, roomName string, facies map[string][]models.FaciesSection) error {
	//implementar logica de procesamiento del temporal
	//por ahora es raw
	return s.repo.SaveRoom(ctx, data, config, fosil, roomName, facies)
}

func (s *serv) SaveProject(ctx context.Context, data string, name string) error {
	//implementar logica de procesamiento del temporal
	//por ahora es raw
	return s.repo.SaveProject(ctx, data, name)
}

// func (s *serv) GetPermission(ctx context.Context, correo string, proyectName string) (int, error) {

// 	return s.repo.GetPermission(ctx, correo, proyectName)
// }
