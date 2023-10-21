package service

import (
	"context"

	"github.com/ProyectoT/api/internal/models"
)

func (s *serv) ConnectRoom(ctx context.Context, roomName string, user string) (*models.Room, error) {

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
func (s *serv) GetRoom(ctx context.Context, roomName string) (*models.Room, error) {
	room, err := s.repo.GetRoom(ctx, roomName)
	if err != nil {
		return nil, err
	}
	return room, nil
}
func (s *serv) CreateRoom(ctx context.Context, roomName string, user string, participants map[string]models.Role) error {

	return s.repo.CreateRoom(ctx, roomName, user, participants)
}

func (s *serv) SaveRoom(ctx context.Context, data []map[string]interface{}, roomName string) error {
	//implementar logica de procesamiento del temporal
	//por ahora es raw
	return s.repo.SaveRoom(ctx, data, roomName)
}

func (s *serv) SaveUsers(ctx context.Context, room *models.Room) error {
	//implementar logica de procesamiento del temporal
	//por ahora es raw
	return s.repo.SaveUsers(ctx, room)
}

func (s *serv) SaveProject(ctx context.Context, data string, name string) error {
	//implementar logica de procesamiento del temporal
	//por ahora es raw
	return s.repo.SaveProject(ctx, data, name)
}
