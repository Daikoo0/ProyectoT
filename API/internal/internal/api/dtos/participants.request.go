package dtos

import "github.com/ProyectoT/api/internal/models"

type Participant struct {
	Email string
	Role  models.Role
}

type CreateProjectRequest struct {
	Participants []Participant `json:"participants"`
}