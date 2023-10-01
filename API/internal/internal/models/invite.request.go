package models

type InviteRequest struct {
    Email string `json:"email"`
    Role  string `json:"role"`
}