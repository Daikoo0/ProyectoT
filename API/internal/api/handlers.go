package api

import (
	"log"
	"net/http"

	"github.com/ProyectoT/api/encryption"
	"github.com/ProyectoT/api/internal/api/dtos"
	"github.com/ProyectoT/api/internal/service"
	"github.com/labstack/echo/v4"
	"github.com/gorilla/websocket"
	"github.com/dgrijalva/jwt-go"
)

type responseMessage struct {
	Message string `json:"message"`
}

func (a *API) RegisterUser(c echo.Context) error {
	ctx := c.Request().Context()
	params := dtos.RegisterUser{}

	err := c.Bind(&params)
	if err != nil {
		return c.JSON(http.StatusBadRequest, responseMessage{Message: "Invalid request"})
	}

	err = a.dataValidator.Struct(params)
	if err != nil {
		return c.JSON(http.StatusBadRequest, responseMessage{Message: err.Error()})
	}

	err = a.serv.RegisterUser(ctx, params.Email, params.Name, params.Password)
	if err != nil {
		if err == service.ErrUserAlreadyExists {
			return c.JSON(http.StatusConflict, responseMessage{Message: "User already exists"})
		}

		return c.JSON(http.StatusInternalServerError, responseMessage{Message: "Internal server error"})
	}

	return c.JSON(http.StatusCreated, nil)
}

func (a *API) LoginUser(c echo.Context) error {
	ctx := c.Request().Context()
	params := dtos.LoginUser{}

	err := c.Bind(&params)
	if err != nil {
		log.Println(err)
		return c.JSON(http.StatusBadRequest, responseMessage{Message: "Invalid request"})
	}

	err = a.dataValidator.Struct(params)
	if err != nil {
		log.Println(err)
		return c.JSON(http.StatusBadRequest, responseMessage{Message: err.Error()})
	}

	u, err := a.serv.LoginUser(ctx, params.Email, params.Password)
	if err != nil {
		log.Println(err)
		return c.JSON(http.StatusInternalServerError, responseMessage{Message: "Internal server error"})
	}

	token, err := encryption.SignedLoginToken(u)
	if err != nil {
		log.Println(err)
		return c.JSON(http.StatusInternalServerError, responseMessage{Message: "Internal server error"})
	}
	log.Println(token)

	cookie := &http.Cookie{
		Name:     "Authorization",
		Value:    token,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
		HttpOnly: true,
		Path:     "/",
	}

	c.SetCookie(cookie)
	return c.JSON(http.StatusOK, map[string]string{"success": "true"})
}

func handleWebSocket(conn *websocket.Conn, c echo.Context, room string) {
	cookies := c.Cookies()
	token, _ := jwt.Parse(cookies[0].Value, func(token *jwt.Token) (interface{}, error) {
		return []byte("01234567890123456789012345678901"), nil
	})
	if token.Valid {
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			log.Println("inreadeable token")
			return
		}
		name = claims["name"].(string)
	} else {
		log.Println("invalid token")
	}

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			break
		}

		log.Printf("%s: %s. (data obtenida de la cookie fuiste hackeado)\n",name,string(msg))
		

		err = conn.WriteMessage(websocket.TextMessage, []byte(msg))
		if err != nil {
			break
		}
	}

	conn.Close()
}

