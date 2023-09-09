package service

import (
	"context"
	"errors"
	"log"

	"github.com/ProyectoT/api/encryption"
	"github.com/ProyectoT/api/internal/models"
)

var (
	ErrUserAlreadyExists  = errors.New("user already exists")
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrRoleAlreadyAdded   = errors.New("role was already added for this user")
	ErrRoleNotFound       = errors.New("role not found")
)

func (s *serv) RegisterUser(ctx context.Context, email, name, password string) error {

	u, _ := s.repo.GetUserByEmail(ctx, email)
	if u != nil {
		return ErrUserAlreadyExists
	}

	bb, err := encryption.Encrypt([]byte(password))
	if err != nil {
		return err
	}

	pass := encryption.ToBase64(bb) //cifrar contraseña
	return s.repo.SaveUser(ctx, email, name, pass)
}

func (s *serv) LoginUser(ctx context.Context, email, password string) (*models.User, error) {
	u, err := s.repo.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, err
	}

	bb, err := encryption.FromBase64(u.Password)
	if err != nil {
		return nil, err
	}
	decryptedPassword, err := encryption.Decrypt(bb) //leer contraseña de la bd
	if err != nil {
		return nil, err
	}
	if string(decryptedPassword) != password {
		return nil, ErrInvalidCredentials
	}

	return &models.User{
		ID:    u.ID,
		Email: u.Email,
		Name:  u.Name,
	}, nil
}

func (s *serv) AddUserRole(ctx context.Context, userEmail string, roleID int64) error {

	roles, err := s.repo.GetUserRoles(ctx, userEmail)
	if err != nil {
		return err
	}

	for _, r := range roles {
		if r.RoleID == roleID {
			return ErrRoleAlreadyAdded
		}
	}

	return s.repo.SaveUserRole(ctx, userEmail, roleID)
}

func (s *serv) RemoveUserRole(ctx context.Context, userEmail string, roleID int64) error {
	roles, err := s.repo.GetUserRoles(ctx, userEmail)
	if err != nil {
		return err
	}

	roleFound := false
	for _, r := range roles {
		if r.RoleID == roleID {
			roleFound = true
			break
		}
	}

	if !roleFound {
		log.Println("role not found")
		return ErrRoleNotFound
	}
	return s.repo.RemoveUserRole(ctx, userEmail, roleID)
}

func (s *serv) SaveProject(ctx context.Context, data string, name string,) error {
	//implementar logica de procesamiento del temporal
	//por ahora es raw
	return s.repo.SaveProject(ctx, data, name)
}