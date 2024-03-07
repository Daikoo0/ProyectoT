package api

import (
	"sync"

	"github.com/ProyectoT/api/internal/service"
	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type API struct {
	serv          service.Service
	dataValidator *validator.Validate
	saveMutex     sync.Mutex
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
		AllowOrigins:     []string{"http://localhost:*", "http://127.0.0.1:*"},
		AllowMethods:     []string{echo.GET, echo.POST},
		AllowHeaders:     []string{echo.HeaderContentType, echo.HeaderAuthorization},
		AllowCredentials: true,
	}))

	return e.Start(address)
}
