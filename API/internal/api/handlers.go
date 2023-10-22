package api

import (
	"encoding/json"
	"errors"
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
	Name    string
	Config  map[string]interface{}
	Active  []*websocket.Conn
	Clients map[string]models.Role
	Data    []map[string]interface{}
	Temp    Stack
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
	proyect := instanceRoom(roomName, room.Clients, room.Data, room.Config)
	proyect.Active = append(proyect.Active, conn)

	//enviar los datos que hay en la base de datos
	for _, row := range proyect.Data {
		rowBytes, err := json.Marshal(row)
		if err != nil {
			errMessage := "Error: Incorrect format"
			conn.WriteMessage(websocket.TextMessage, []byte(errMessage))
		}
		conn.WriteMessage(websocket.TextMessage, rowBytes)
	}
	configRoom := make(map[string]interface{})
	configRoom["action"] = "settingsRoom"
	configRoom["config"] = room.Config

	configBytes, err := json.Marshal(configRoom)
		if err != nil {
			errMessage := "Error: cannot sent room config"
			conn.WriteMessage(websocket.TextMessage, []byte(errMessage))
		}
		conn.WriteMessage(websocket.TextMessage, configBytes)


	if err == nil {
		//enviar datos actuales (no se que chucha con su front)
		//conn.WriteMessage(websocket.TextMessage, []byte(dataBytes))
		log.Printf("user %s: Permission %d", user, permission)

		for {
			_, msg, err := conn.ReadMessage()
			if err != nil {
				break
			}

			if permission != 2 {
				var dataMap map[string]interface{}
				err := json.Unmarshal([]byte(msg), &dataMap)
				undo := true
				if err != nil {
					log.Println("le falta el id a la wea")
					log.Fatal(err)
				}
				if dataMap["action"] == "undo" {
					log.Println("deshacer")
					temp, err := rooms[roomName].Temp.Pop()
					log.Println(temp)
					if err != nil {
						errMessage := "Error: la pila esta vacia"
						log.Println(errMessage)
					} else {
						dataMap = temp
						undo = false
					}
				}
				log.Println(dataMap)

				if dataMap["action"] == "delete" {
					id := int(dataMap["id"].(float64))
					log.Printf("Borrando capa %s", string(rune(id)))

					if undo {
						temporal := make(map[string]interface{})
						temporal["action"] = "añadir"
						temporal["id"] = float64(id)
						temporal["polygon"] = rooms[roomName].Data[id]["polygon"]
						temporal["text"] = rooms[roomName].Data[id]["text"]

						rooms[roomName].Temp.Push(temporal)
						//variacion := int(rooms[roomName].Data[:id]["polygon"]["y2"])-int(rooms[roomName].Data[:id]["polygon"]["y1"])
						//log.Println(variacion)
						/*

						for estrato := range rooms[roomName].Data[:id]["polygon"]
						estrato["y1"] = estrato["y1"] - variacion
						estrato["y2"] = estrato["y2"] - variacion
						for circle := range estrato["circles"]
							circle["y"] = circle["y"] - variacion
						}
						*/
					}

					rooms[roomName].Data = append(rooms[roomName].Data[:id], rooms[roomName].Data[id+1:]...)

					responseJSON, err := json.Marshal(dataMap)
					if err != nil {
						log.Println("Error al convertir a JSON:", err)
					}

					for _, client := range proyect.Active {
						err = client.WriteMessage(websocket.TextMessage, []byte(responseJSON))
						if err != nil {
							log.Println(err)
						}
					}

				}
				if dataMap["action"] == "text" {
					id := int(dataMap["id"].(float64))
					log.Printf("Editando texto capa %s", string(rune(id)))

					if undo {
						temporal := make(map[string]interface{})
						temporal["action"] = "text"
						temporal["id"] = float64(id)
						temporal["text"] = rooms[roomName].Data[id]["text"]

						rooms[roomName].Temp.Push(temporal)
					}
					rooms[roomName].Data[id]["text"] = dataMap["text"]

					responseJSON, err := json.Marshal(dataMap)
					if err != nil {
						log.Println("Error al convertir a JSON:", err)
					}

					for _, client := range proyect.Active {
						err = client.WriteMessage(websocket.TextMessage, []byte(responseJSON))
						if err != nil {
							log.Println(err)
						}
					}
				}

				if dataMap["action"] == "polygon" {
					id := int(dataMap["id"].(float64))
					log.Printf("Editando polygon capa %s", string(rune(id)))

					if undo {
						temporal := make(map[string]interface{})
						temporal["action"] = "polygon"
						temporal["id"] = float64(id)
						temporal["polygon"] = rooms[roomName].Data[id]["polygon"]

						rooms[roomName].Temp.Push(temporal)
					}

					rooms[roomName].Data[id]["polygon"] = dataMap["polygon"]

					responseJSON, err := json.Marshal(dataMap)
					if err != nil {
						log.Println("Error al convertir a JSON:", err)
					}

					for _, client := range proyect.Active {
						err = client.WriteMessage(websocket.TextMessage, []byte(responseJSON))
						log.Println(string(responseJSON))
						if err != nil {
							log.Println(err)
						}
					}
				}

				if dataMap["action"] == "settingsRoom" {
					log.Printf("Editando config room")

					if undo {
						temporal := make(map[string]interface{})
						temporal["action"] = "settingsRoom"
						temporal["config"] = rooms[roomName].Config
						rooms[roomName].Temp.Push(temporal)
					}

					for key, newValue := range dataMap["config"].(map[string]interface{}){
						rooms[roomName].Config[key] = newValue
					}

					responseJSON, err := json.Marshal(dataMap["config"])
					if err != nil {
						log.Println("Error al convertir a JSON:", err)
					}

					for _, client := range proyect.Active {
						err = client.WriteMessage(websocket.TextMessage, []byte(responseJSON))
						log.Println(string(responseJSON))
						if err != nil {
							log.Println(err)
						}
					}
				}

				if dataMap["action"] == "añadir" {
					id := int(dataMap["id"].(float64))
					log.Printf("Añadiendo capa %s", string(rune(id)))
					if undo {
						temp := make(map[string]interface{})
						temp["action"] = "delete"
						temp["id"] = float64(id)

						rooms[roomName].Temp.Push(temp)
					}

					rooms[roomName].Data = append(rooms[roomName].Data, dataMap)

					jsonBytes, err := json.Marshal(dataMap)
					if err != nil {
						log.Fatalf("Error al convertir el mapa a JSON: %v", err)
					}

					for _, client := range proyect.Active {
						err = client.WriteMessage(websocket.TextMessage, jsonBytes)
						if err != nil {
							log.Println(err)
						}
					}
				}

				if dataMap["action"] == "save" {
					log.Println("guardando...")
					err = a.serv.SaveRoom(ctx, rooms[roomName].Data,rooms[roomName].Config, roomName)
					if err != nil {
						log.Println("No se guardo la data")
					}
				}

			} else {
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
	} else if value != 0 {
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

func instanceRoom(roomName string, Clients map[string]models.Role, data []map[string]interface{}, config map[string]interface{}) *Room {
	room, exists := rooms[roomName] //instancia el room con los datos de la bd
	if !exists {
		room = &Room{
			Name:    roomName,
			Clients: Clients,
			Active:  make([]*websocket.Conn, 0),
			Data:    data,
			Config:  config,
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

// codigo de una pila, (pila de cambios, del control Z)
type Stack []map[string]interface{}

func (s *Stack) Push(v map[string]interface{}) {
	*s = append(*s, v)

	// Pila de tamaño 10
	if len(*s) > 10 {
		*s = (*s)[1:]
	}
}

func (s *Stack) Pop() (map[string]interface{}, error) {
	if len(*s) == 0 {
		return nil, errors.New("La pila esta vacia")
	}
	index := len(*s) - 1
	element := (*s)[index]
	*s = (*s)[:index]

	return element, nil
}
