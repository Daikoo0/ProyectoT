package api

import (
	"github.com/labstack/echo/v4"
)

func (a *API) RegisterRoutes(e *echo.Echo) {

	users := e.Group("/users")
 
	users.POST("/register", a.RegisterUser) // users/register
	users.POST("/login", a.LoginUser) 		// users/login
	users.GET("/", a.proyects)             // users

	e.GET("/ws/:room", a.HandleWebSocket)   //ws/sala
	e.POST("/rooms/:room/invite", a.HandleInviteUser) //rooms/sala/usuario
	e.POST("/rooms/create", a.HandleCreateProyect) //rooms/sala/usuario

}