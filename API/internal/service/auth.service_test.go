package service

import (
	"context"
	"testing"

	"github.com/ProyectoT/api/encryption"
	"github.com/ProyectoT/api/internal/entity"
	"github.com/ProyectoT/api/internal/repository"
	"github.com/stretchr/testify/mock"
)
var s Service
var repo *repository.MockRepository

/*
func TestMain(m *testing.M) {
	validPassword, _ := encryption.Encrypt([]byte("validPassword"))
	encriptedPassword := encryption.ToBase64(validPassword)
	u := &entity.User{Email: "test@exist.com", Password: encriptedPassword}
	s = New(repo)
	
	repo = &repository.MockRepository{}
	repo.On("GetUserByEmail", mock.Anything, "test@test.com").Return(nil, nil)
	repo.On("GetUserByEmail", mock.Anything, "test@exists.com").Return(u, nil)
	repo.On("SaveUser", mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil)

	code := m.Run()
	os.Exit(code)
	
}
*/

func TestRegisterUser(t *testing.T) {
	testCases := []struct {
		Name          string
		Email         string
		UserName      string
		Password      string
		ExpectedError error
	}{
		{
			Name:          "RegisterUser_Success",
			Email:         "test@test.com",
			UserName:      "test",
			Password:      "validPassword",
			ExpectedError: nil,
		},
		{
			Name:          "RegisterUser_UserAlreadyExists",
			Email:         "test@exists.com",
			UserName:      "test",
			Password:      "validPassword",
			ExpectedError: ErrUserAlreadyExists,
		},
	}

	ctx := context.Background()
	
	for i := range testCases {
		tc := testCases[i]

		t.Run(tc.Name, func(t *testing.T) {
			validPassword, _ := encryption.Encrypt([]byte("validPassword"))
			encriptedPassword := encryption.ToBase64(validPassword)
			u := &entity.User{Email: "test@exist.com", Password: encriptedPassword}
			s = New(repo)
	
			repo = &repository.MockRepository{}
			repo.On("GetUserByEmail", mock.Anything, "test@test.com").Return(nil, nil)
			repo.On("GetUserByEmail", mock.Anything, "test@exists.com").Return(u, nil)
			repo.On("SaveUser", mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil)
			t.Parallel()
			repo.Mock.Test(t)

			err := s.RegisterUser(ctx, tc.Email, tc.UserName, tc.Password)

			if err != tc.ExpectedError {
				t.Errorf("Expected error %v, got %v", tc.ExpectedError, err)
			}

		})
	}
}

func TestLoginUser(t *testing.T) {
	testCases := []struct {
		Name          string
		Email         string
		Password      string
		ExpectedError error
	}{
		{
			Name:          "LoginUser_Success",
			Email:         "test@exists.com",
			Password:      "validPassword",
			ExpectedError: nil,
		},
		{
			Name:          "LoginUser_InvalidPassword",
			Email:         "test@exists.com",
			Password:      "invalidPassword",
			ExpectedError: ErrInvalidCredentials,
		},
	}

	ctx := context.Background()

	for i := range testCases {
		tc := testCases[i]
		repo := &repository.MockRepository{}
		validPassword, _ := encryption.Encrypt([]byte("validPassword"))
		encriptedPassword := encryption.ToBase64(validPassword)
		u := &entity.User{Email: "test@exist.com", Password: encriptedPassword}
		repo.On("GetUserByEmail", mock.Anything, "test@exists.com").Return(u, nil)
	
		s := New(repo)

		t.Run(tc.Name, func(t *testing.T) {

			t.Parallel()
			repo.Mock.Test(t)
			

			_, errr := s.LoginUser(ctx, tc.Email, tc.Password)

			if errr != tc.ExpectedError {
				t.Errorf("Expected error %v, got %v", tc.ExpectedError, errr)
			}

		})
	}
}

func TestAddUserRole(t *testing.T) {
	testCases := []struct {
		Name          string
		UserID        int64
		RoleID        int64
		ExpectedError error
	}{
		{
			Name:          "AddUserRole_Success",
			UserID:        1,
			RoleID:        2,
			ExpectedError: nil,
		},
		{
			Name:          "AddUserRole_UserAlreadyHasRole",
			UserID:        1,
			RoleID:        1,
			ExpectedError: ErrRoleAlreadyAdded,
		},
	}

	ctx := context.Background()

	for i := range testCases {
		tc := testCases[i]
		repo := &repository.MockRepository{}
		repo.On("GetUserRoles", mock.Anything, int64(1)).Return([]entity.UserRole{{UserID: 1, RoleID: 1}}, nil)
		repo.On("GetUserRoles", mock.Anything, int64(2)).Return([]entity.UserRole{{UserID: 2, RoleID: 3}}, nil)

		repo.On("SaveUserRole", mock.Anything, mock.Anything, mock.Anything).Return(nil)
		repo.On("RemoveUserRole", mock.Anything, mock.Anything, mock.Anything).Return(nil)

		s := New(repo)

		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()

			repo.Mock.Test(t)

			err := s.AddUserRole(ctx, tc.UserID, tc.RoleID)

			if err != tc.ExpectedError {
				t.Errorf("Expected error %v, got %v", tc.ExpectedError, err)
			}
		})
	}
}


func TestRemoveUserRole(t *testing.T) {
	testCases := []struct {
		Name          string
		UserID        int64
		RoleID        int64
		ExpectedError error
	}{
		{
			Name:          "RemoveUserRole_Success",
			UserID:        1,
			RoleID:        1,
			ExpectedError: nil,
		},
		{
			Name:          "RemoveUserRole_UserDoesNotHaveRole",
			UserID:        1,
			RoleID:        3,
			ExpectedError: ErrRoleNotFound,
		},
	}

	ctx := context.Background()
	repo := &repository.MockRepository{}
	repo.On("GetUserRoles", mock.Anything, int64(1)).Return([]entity.UserRole{{UserID: 1, RoleID: 1}}, nil)
	repo.On("GetUserRoles", mock.Anything, int64(2)).Return([]entity.UserRole{{UserID: 2, RoleID: 3}}, nil)

	repo.On("SaveUserRole", mock.Anything, mock.Anything, mock.Anything).Return(nil)
	repo.On("RemoveUserRole", mock.Anything, mock.Anything, mock.Anything).Return(nil)

	s := New(repo)

	for i := range testCases {
		tc := testCases[i]

		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()

			repo.Mock.Test(t)

			err := s.RemoveUserRole(ctx, tc.UserID, tc.RoleID)

			if err != tc.ExpectedError {
				t.Errorf("Expected error %v, got %v", tc.ExpectedError, err)
			}
		})
	}
}