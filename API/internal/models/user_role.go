package models

type UserRole struct {
	Email string `json:"email"`
	Role  int    `json:"role"`
}
