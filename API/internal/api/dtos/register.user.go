package dtos

type RegisterUser struct {
	Email           string `json:"email" validate:"required,email"`
	Password        string `json:"password" validate:"required,min=8"`
	PasswordConfirm string `json:"passwordConfirm" validate:"required,min=8"`
	Name            string `json:"name" validate:"required"`
	LastName        string `json:"lastName" validate:"required"`
}
