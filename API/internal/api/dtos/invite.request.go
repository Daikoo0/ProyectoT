package dtos

type InviteUserRequest struct {
	Email string `json:"email"`
	Role  string `json:"role"`
}
