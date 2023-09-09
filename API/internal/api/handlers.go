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
		return c.JSON(http.StatusInternalServerError, responseMessage{Message: "Invalid Credentials"})
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

var rooms = make(map[string]*Room)

type Room struct {
    Name     string
    Clients  []*websocket.Conn
    Messages []string
}

func handleWebSocket(a *API, conn *websocket.Conn, c echo.Context, roomName string) {
	ctx := c.Request().Context()
    room := getOrCreateRoom(roomName)
	user := ""
	cookie, err := c.Cookie("Authorization")
	if err != nil {
		conn.WriteMessage(websocket.TextMessage, []byte("Invalid Session"))
		conn.WriteMessage(websocket.TextMessage, []byte("Mi loco inicie sesion"))
		return 
	}

    token, _ := jwt.Parse(cookie.Value, func(token *jwt.Token) (interface{}, error) {
        return []byte("01234567890123456789012345678901"), nil
    })

	log.Println("piola3")
    if token.Valid {
        claims, ok := token.Claims.(jwt.MapClaims)
        if !ok {
            log.Println("inreadeable token")
            return
        }
        user, ok = claims["name"].(string)
        if !ok {
            log.Println("invalid name claim")
            return
        }
	} else {
			log.Println("Invalid Session")
			conn.WriteMessage(websocket.TextMessage, []byte("Error: User not authenticated"))
			conn.Close()
			return
		}

    room.Clients = append(room.Clients, conn)

    for {
        _, msg, err := conn.ReadMessage()
        if err != nil {
            break
        }

        log.Printf("usuario %s a actualizado el archivo:\n. %s\n", user, string(msg))

        room.Messages = append(room.Messages, string(msg)) //temporal pal ctrl Z

		err = a.serv.SaveProject(ctx, string(msg), roomName )
		if err != nil {
			log.Println("No se guardo la data")
		}

        for _, client := range room.Clients {
            err = client.WriteMessage(websocket.TextMessage, []byte(msg))
            if err != nil {
                break
            }
        }
    }

    conn.Close()
}

func getOrCreateRoom(roomName string) *Room {
    room, exists := rooms[roomName] //revisar la bd tambien (crear service y repository para el caso)
    if !exists {
        room = &Room{
            Name:     roomName,
            Clients:  make([]*websocket.Conn, 0),
            Messages: make([]string, 0),
        }
        rooms[roomName] = room
    }
    return room
}