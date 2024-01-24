package api

import (
	"github.com/ProyectoT/api/internal/service"
	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type API struct {
	serv          service.Service
	dataValidator *validator.Validate
}

func New(serv service.Service) *API {
	return &API{
		serv:          serv,
		dataValidator: validator.New(),
	}
}

func (a *API) Start(e *echo.Echo, address string) error {
	a.RegisterRoutes(e)

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000", "http://127.0.0.1:4173"},
		AllowMethods:     []string{echo.POST},
		AllowHeaders:     []string{echo.HeaderContentType},
		AllowCredentials: true,
	}))

	return e.Start(address)
}
