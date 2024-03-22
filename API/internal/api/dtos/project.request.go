package dtos

// import "github.com/ProyectoT/api/internal/models"

type Project struct {
	RoomName string  `json:"roomName" validate:"required"`
	Location string  `json:"location" validate:"required"`
	Lat      float64 `json:"lat"`
	Long     float64 `json:"long"`
	Desc     string  `json:"desc"`
	Visible  bool    `json:"visible"`
}
