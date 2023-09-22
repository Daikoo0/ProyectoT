package api

import (
	"log"
	"net/http"

	"github.com/ProyectoT/api/encryption"
	"github.com/ProyectoT/api/internal/api/dtos"
	"github.com/ProyectoT/api/internal/models"
	"github.com/ProyectoT/api/internal/service"
	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

type responseMessage struct {
	Message string `json:"message"`
}

type Room struct {
	Name     string
	Active   []*websocket.Conn
	Clients  map[string]models.Role
	Data     string
	//Data 	 []string
}

var rooms = make(map[string]*Room) //map temporal que almacena todas las salas activas

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

func (a *API) HandleWebSocket(c echo.Context) error {
	ctx := c.Request().Context()
	roomName := c.Param("room")

	//convertir la peticion en websocket (lo coloco antes de las validaciones para devolver mensajes de error)
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}

	conn, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return err
	}

	//validar datos
	cookie, err := c.Cookie("Authorization")
	if err != nil {
		errMessage := "Error: Unauthorized"
		err = conn.WriteMessage(websocket.TextMessage, []byte(errMessage))
		conn.Close()
		return nil
	}

	claims, err := encryption.ParseLoginJWT(cookie.Value)
	if err != nil {
		errMessage := "Error: Unauthorized"
		err = conn.WriteMessage(websocket.TextMessage, []byte(errMessage))
		conn.Close()
		return nil
	}
	
    user := claims["email"].(string)

	//validar aun mas datos (forma parte de la sala)
	room, err := a.serv.GetRoom(ctx, roomName)
    if err != nil {
		errMessage := "Error: Room not found"
		err = conn.WriteMessage(websocket.TextMessage, []byte(errMessage))
		conn.Close()
		return nil
    }

	permission, exists := room.Clients[user]
    if !exists {
		errMessage := "Error: Unauthorized"
		err = conn.WriteMessage(websocket.TextMessage, []byte(errMessage))
		conn.Close()
        return nil
    }

	//conectar a la sala
	proyect := instanceRoom(roomName, room.Clients, room.Data)
	proyect.Active = append(proyect.Active, conn)
	log.Printf("user %s: Permission %d", user, permission)
	
	for {
        _, msg, err := conn.ReadMessage()
        if err != nil {
            break
        }

		if permission != 2{
			log.Printf("usuario %s a actualizado el archivo:\n. %s\n", user, string(msg))

        	//proyect.Data = append(proyect.Data, string(msg)) //temporal pal ctrl Z

			err = a.serv.SaveRoom(ctx, string(msg), roomName)
			if err != nil {
				log.Println("No se guardo la data")
			}
        	for _, client := range proyect.Active {
           		err = client.WriteMessage(websocket.TextMessage, []byte(msg))
            	if err != nil {
                	break
            	}
			}
        }else{
			errMessage := "Error: Don't have permission to edit this document"
			err = conn.WriteMessage(websocket.TextMessage, []byte(errMessage))
		}
    }
		
        

    conn.Close()
	return nil
}

func (a *API) HandleInviteUser(c echo.Context) error {

	ctx := c.Request().Context()
	cookie, err := c.Cookie("Authorization")

	//validar datos
	if err != nil {
		log.Println(err)
		return c.JSON(http.StatusUnauthorized, responseMessage{Message: "Unauthorized"})
	}
	claims, err := encryption.ParseLoginJWT(cookie.Value)
	if err != nil {
		log.Println(err)
		return c.JSON(http.StatusUnauthorized, responseMessage{Message: "Unauthorized"})
	}

    user := claims["email"].(string)
    room := c.Param("room")
    inviteRequest := new(dtos.InviteRequest)

	//validar mas datos
    if err := c.Bind(inviteRequest); err != nil {
        return c.JSON(http.StatusBadRequest, responseMessage{Message: "Invalid request"})
    }

    if inviteRequest.Email == "" || inviteRequest.Role == 0 {
        return c.JSON(http.StatusBadRequest, responseMessage{Message: "Invalid request"})
    }

    //obtener el room
    proyect, err := a.serv.GetRoom(ctx, room)
	log.Println(proyect)
    if err != nil {
        return c.JSON(http.StatusNotFound, responseMessage{Message: "Room not found"})
    }

    //validar aun mas datos (corroborar permisos)
	value, exists := proyect.Clients[user]
    if !exists {
		log.Println("no forma parte de la sala")
        return c.JSON(http.StatusForbidden, responseMessage{Message: "Unauthorized"})
    } else if value != 0{
		log.Println("no eres admin")
        return c.JSON(http.StatusForbidden, responseMessage{Message: "Unauthorized"})
	}

    //agregar el usuario al room
    proyect.Clients[inviteRequest.Email] = models.Role(inviteRequest.Role)

    err = a.serv.SaveUsers(ctx, proyect)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, responseMessage{Message: "Failed to save room"})
    }

    return c.JSON(http.StatusOK, responseMessage{Message: "User invited successfully"})
}


func instanceRoom(roomName string, Clients map[string]models.Role, data string) *Room {
    room, exists := rooms[roomName] //instancia el room con los datos de la bd
    if !exists {
        room = &Room{
            Name:     roomName,
            Clients:  Clients,
            Active: make([]*websocket.Conn, 0),
			Data: data,
        }
        rooms[roomName] = room
    }
    return room
}

func (a *API) HandleCreateProyect(c echo.Context) error {

	ctx := c.Request().Context()
	cookie, err := c.Cookie("Authorization")

	//validar datos
	if err != nil {
		log.Println(err)
		return c.JSON(http.StatusUnauthorized, responseMessage{Message: "Unauthorized"})
	}
	claims, err := encryption.ParseLoginJWT(cookie.Value)
	if err != nil {
		log.Println(err)
		return c.JSON(http.StatusUnauthorized, responseMessage{Message: "Unauthorized"})
	}

    user := claims["email"].(string)
    room := c.Param("room")
	participantsRequest := new(dtos.CreateProjectRequest)

	//validar mas datos
    if err := c.Bind(participantsRequest); err != nil {
		log.Println(err)
        return c.JSON(http.StatusBadRequest, responseMessage{Message: "Invalid request"})
    }
	participantMap := make(map[string]models.Role)

    for _, participant := range participantsRequest.Participants {
        participantMap[participant.Email] = models.Role(participant.Role)
    }
	
    err = a.serv.CreateRoom(ctx, room, user, participantMap)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, responseMessage{Message: "Failed to create a room"})
    }

    return c.JSON(http.StatusOK, responseMessage{Message: "Room created successfully"})
}
