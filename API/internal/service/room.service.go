package service

import (
	"context"

	"github.com/ProyectoT/api/internal/models"
)

func (s *serv) ConnectRoom(ctx context.Context, roomName string, user string) (*models.Data_project, error) {

	room, err := s.repo.ConnectRoom(ctx, roomName, user)
	if err != nil {
		return nil, err
	}

	// Guardar la información en la base de datos
	/*
		err = s.repo.SaveRoom(ctx, room)
		if err != nil {
			return nil, err
		}
	*/
	// Realizar otras operaciones necesarias con la conexión y la sala

	return room, nil
}
func (s *serv) GetRoom(ctx context.Context, roomName string) (*models.Data_project, error) {
	room, err := s.repo.GetRoom(ctx, roomName)
	if err != nil {
		return nil, err
	}
	return room, nil
}

func (s *serv) GetRoomInfo(ctx context.Context, roomName string) (*models.Data, error) {
	room, err := s.repo.GetRoomInfo(ctx, roomName)
	if err != nil {
		return nil, err
	}
	return room, nil
}

func (s *serv) CreateRoom(ctx context.Context, roomName string, name string, correo string, desc string, location string, lat float64, long float64, visible bool) error {

	return s.repo.CreateRoom(ctx, roomName, name, correo, desc, location, lat, long, visible)
}

func (s *serv) SaveRoom(ctx context.Context, data []map[string]interface{}, config map[string]interface{}, fosil map[string]interface{}, roomName string, facies map[string]interface{}) error {
	//implementar logica de procesamiento del temporal
	//por ahora es raw
	return s.repo.SaveRoom(ctx, data, config, fosil, roomName, facies)
}

func (s *serv) SaveProject(ctx context.Context, data string, name string) error {
	//implementar logica de procesamiento del temporal
	//por ahora es raw
	return s.repo.SaveProject(ctx, data, name)
}

func (s *serv) GetPermission(ctx context.Context, correo string, proyectName string) (int, error) {

	return s.repo.GetPermission(ctx, correo, proyectName)
}
