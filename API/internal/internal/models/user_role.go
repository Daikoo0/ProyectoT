package models

type UserRole struct {
	UserEmail   string		`db:"user_email"`
	RoleID 		int64 		`json:"role_id"`
}