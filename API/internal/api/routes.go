package api

import (
	"github.com/labstack/echo/v4"
	"net/http"
	"github.com/gorilla/websocket"
)

func (a *API) RegisterRoutes(e *echo.Echo) {

	users := e.Group("/users")

	users.POST("/register", a.RegisterUser) // users/register
	users.POST("/login", a.LoginUser) 		// users/login
	
	e.GET("/ws", func(c echo.Context) error { //websocket
		upgrader := websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		}

		conn, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
		if err != nil {
			return err
		}
	
		handleWebSocket(conn, c)

		return nil
	})
}