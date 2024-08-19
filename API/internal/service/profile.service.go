package service

import (
	"context"

	"github.com/ProyectoT/api/internal/models"
)

func (s *serv) GetProyects(ctx context.Context, user string) ([]models.InfoProject, error) {
	proyects, err := s.repo.GetProyects(ctx, user)
	if err != nil {
		return nil, err
	}
	return proyects, nil
}

func (s *serv) AddUser(ctx context.Context, user string, roomName string) error {
	err := s.repo.AddUser(ctx, user, roomName)
	if err != nil {
		return err
	}
	return nil
}
