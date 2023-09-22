package api

import (
	"github.com/labstack/echo/v4"
)

func (a *API) RegisterRoutes(e *echo.Echo) {

	users := e.Group("/users")
 
	users.POST("/register", a.RegisterUser) // users/register
	users.POST("/login", a.LoginUser) 		// users/login

	e.GET("/ws/:room", a.HandleWebSocket)   //ws/sala
	e.POST("/rooms/:room/invite", a.HandleInviteUser) //rooms/sala/usuario
	e.POST("/rooms/:room/create", a.HandleCreateProyect) //rooms/sala/usuario

}