package api

import (
	"encoding/json"
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
	Data     []string
	Temp     Stack
}

type Operation struct {
	Action string `json:"action"`
	ID     int    `json:"id"`
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
		log.Println(err)
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
	
	//enviar los datos que hay en la base de datos
	for i, row := range room.Data{
		log.Println(i)
		if err != nil {
			errMessage := "Error: Cannot read this document"
			conn.WriteMessage(websocket.TextMessage, []byte(errMessage))
			break
		}
		conn.WriteMessage(websocket.TextMessage, []byte(row))
	}

	if err == nil {
		//enviar datos actuales (no se que chucha con su front)
		//conn.WriteMessage(websocket.TextMessage, []byte(dataBytes))
		log.Printf("user %s: Permission %d", user, permission)
	
		for {
			_, msg, err := conn.ReadMessage()
			if err != nil {
				break
			}

			if permission != 2{
				log.Println(string(msg))
				if string(msg) == "undo" {
					log.Println("deshacer")
					for _, client := range proyect.Active {
						tempMsg := rooms[roomName].Temp.Pop()
						log.Println(tempMsg)
						err = client.WriteMessage(websocket.TextMessage, []byte(tempMsg))
						if err != nil {
							log.Println(err)
							break
						}
					}

				}else if string(msg) == "save"{
					log.Println("guardar")
					log.Println(room.Data)
					err = a.serv.SaveRoom(ctx, room.Data, roomName)
					if err != nil {
						log.Println("No se guardo la data")
					}

				}else{
					
					var dataMap map[string]interface{}
					err := json.Unmarshal([]byte(msg), &dataMap)
					if err != nil {
						log.Fatal(err)
					}
					id := int(dataMap["id"].(float64))
					operation := Operation{
						Action: "delete",
						ID:     id,
					}

					if len(rooms[roomName].Data) == id{
						rooms[roomName].Data = append(rooms[roomName].Data, string(msg))
						operationJSON, err := json.Marshal(operation)
						if err != nil {
							log.Println("Error al convertir a JSON:", err)
						}
						rooms[roomName].Temp.Push(string(operationJSON))
						
					}else{
						log.Println("actualizar")
						log.Println(rooms[roomName].Data[id])
						log.Println("hola")
						rooms[roomName].Temp.Push(rooms[roomName].Data[id])
						rooms[roomName].Data[id] = string(msg)
					}
					log.Printf("usuario %s a actualizado el archivo", user)

					//err = a.serv.SaveRoom(ctx, string(msg), roomName)
					if err != nil {
						log.Println("No se guardo la data")
					}
					for _, client := range proyect.Active {
						err = client.WriteMessage(websocket.TextMessage, msg)
						if err != nil {
							break
						}
					}
				}
				
			}else{
				errMessage := "Error: Don't have permission to edit this document"
				err = conn.WriteMessage(websocket.TextMessage, []byte(errMessage))
			}
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

	err = a.serv.AddUser(ctx, inviteRequest.Email, room) //actualizar el registro de usuario
	if err != nil {
        return c.JSON(http.StatusInternalServerError, responseMessage{Message: "Failed to save room"})
    }
    err = a.serv.SaveUsers(ctx, proyect)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, responseMessage{Message: "Failed to save room"})
    }

    return c.JSON(http.StatusOK, responseMessage{Message: "User invited successfully"})
}


func instanceRoom(roomName string, Clients map[string]models.Role, data []string) *Room {
    room, exists := rooms[roomName] //instancia el room con los datos de la bd
    if !exists {
		log.Println("hola")
		log.Println(data)
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

func (a *API) proyects(c echo.Context) error {

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
	type responseProyects struct {
		Proyects []string
	}

	proyects, err := a.serv.GetProyects(ctx, user)
	if err != nil {
		log.Println(err)
		return c.JSON(http.StatusUnauthorized, responseMessage{Message: "Error getting proyects"})
	}
	
    return c.JSON(http.StatusOK, responseProyects{Proyects: proyects})
}

//codigo de una pila, (pila de cambios, del control Z)
type Stack []string

func (s *Stack) Push(v string) {
	*s = append(*s, v)

	// Pila de tamaño 10
	if len(*s) > 10 {
		*s = (*s)[1:]
	}
}

func (s *Stack) Pop() string {
	index := len(*s) - 1
	element := (*s)[index]
	*s = (*s)[:index]

	return element
}