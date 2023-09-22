package dtos

type InviteRequest struct {
    Email string    `json:"email"`
    Role  int       `json:"role"`
}