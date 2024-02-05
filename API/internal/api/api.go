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
		AllowOrigins: []string{
			"http://192.168.1.20:4173",
			"http://192.168.56.1:4173",
			"http://127.168.1.20:4173",
		},
		AllowMethods:     []string{echo.GET, echo.POST},
		AllowHeaders:     []string{echo.HeaderContentType},
		AllowCredentials: true,
	}))

	return e.Start(address)
}
