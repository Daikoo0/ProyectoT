package api

import (
	"context"
	"encoding/json"

	"crypto/rand"
	"encoding/hex"
	"log"
	"net/http"
	"reflect"
	"strings"

	"time"

	"github.com/ProyectoT/api/encryption"
	"github.com/ProyectoT/api/internal/api/dtos"
	"github.com/ProyectoT/api/internal/models"
	"github.com/ProyectoT/api/internal/service"
	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type responseMessage struct {
	Message string `json:"message"`
}

type GeneralMessage struct {
	Action string          `json:"action"`
	Data   json.RawMessage `json:"data"`
}

type ProjectResponse struct {
	Projects []models.Data `json:"projects"`
}

type Change struct {
	ActionType       string      // Puede ser "add", "modify" o "delete"
	Key              string      // La clave del campo que se cambió
	OldValue         interface{} // El valor antiguo del campo
	NewValue         interface{} // El nuevo valor del campo
	ModificationTime time.Time   // Fecha de modificación del campo
}

type RoomData struct {
	Id_project      primitive.ObjectID
	Data            []models.DataInfo
	Config          map[string]interface{}
	Facies          map[string]interface{}
	Fosil           map[string]interface{}
	Active          []*websocket.Conn
	SectionsEditing map[string]interface{}
	UserColors      map[string]string
	Changes         []Change
}

func generateRandomColor() string {
	// Generar un color aleatorio en formato hexadecimal
	color := make([]byte, 3)
	_, err := rand.Read(color)
	if err != nil {
		panic(err)
	}
	return "#" + hex.EncodeToString(color)
}

var rooms = make(map[string]*RoomData)

// Modificar - tienen que ir dentro del roomData
var roomTimers = make(map[string]*time.Timer)
var roomActions = make(map[string]int)

var roomActionsThreshold = 10

// registerUser recibe un email, un nombre y una contraseña, y registra un usuario en la base de datos
func (a *API) RegisterUser(c echo.Context) error {
	ctx := c.Request().Context()
	params := dtos.RegisterUser{}

	err := c.Bind(&params)
	if err != nil {
		return c.JSON(http.StatusBadRequest, responseMessage{Message: "Invalid request"}) // HTTP 400 Bad Request
	}

	err = a.dataValidator.Struct(params)
	if err != nil {
		return c.JSON(http.StatusBadRequest, responseMessage{Message: err.Error()})
	}

	if params.Password != params.PasswordConfirm {
		return c.JSON(http.StatusBadRequest, responseMessage{Message: "Passwords do not match"}) // HTTP 400 Bad Request
	}

	err = a.serv.RegisterUser(ctx, params.Email, params.Name, params.LastName, params.Password)
	if err != nil {
		if err == service.ErrUserAlreadyExists {
			return c.JSON(http.StatusConflict, responseMessage{Message: "User already exists"}) // HTTP 409 Conflict
		}

		return c.JSON(http.StatusInternalServerError, responseMessage{Message: "Internal server error"}) // HTTP 500 Internal Server Error
	}

	return c.JSON(http.StatusCreated, nil) // HTTP 201 Created
}

func RemoveElement(a *API, ctx context.Context, roomID string, conn *websocket.Conn, name string, project *RoomData) {
	var index int = -1
	for i, c := range rooms[roomID].Active {
		if c == conn { // asumiendo que conn es comparable directamente
			index = i
			break
		}
	}

	if index != -1 {
		// Eliminar el elemento en el índice encontrado
		for key, value := range rooms[roomID].SectionsEditing {
			if value.(map[string]interface{})["name"] == name {
				delete(rooms[roomID].SectionsEditing, key)
				msgData := map[string]interface{}{
					"action": "deleteEditingUser",
					"value":  key,
					"name":   name,
				}

				sendSocketMessage(msgData, project, "deleteEditingUser")
			}
		}
		rooms[roomID].Active = append(rooms[roomID].Active[:index], rooms[roomID].Active[index+1:]...)

		if len(rooms[roomID].Active) == 0 {
			//guardar la sala
			err := a.serv.SaveRoom(ctx, rooms[roomID].Data, rooms[roomID].Config, rooms[roomID].Fosil, roomID, rooms[roomID].Facies)
			if err != nil {
				return
			}
			//	Eliminar la sala del mapa de salas si no hay usuarios conectados
			delete(rooms, roomID)
		}

		if _, exists := rooms[roomID]; exists {
			log.Println("La habitación", roomID, "no fue eliminada correctamente.")
		} else {
			log.Println("La habitación", roomID, "fue eliminada correctamente.")
		}
		log.Print("////////////////////////////////////////")
		log.Print(rooms)

	}

}

// LoginUser recibe un email y una contraseña, y devuelve un token de autenticación enviado en una cookie
func (a *API) LoginUser(c echo.Context) error {
	ctx := c.Request().Context() // Context.Context es una interfaz que permite el paso de valores entre funciones
	params := dtos.LoginUser{}

	err := c.Bind(&params) // llena a params con los datos de la solicitud

	// Sin error  == nil - Con error != nil
	if err != nil {
		return c.JSON(http.StatusBadRequest, responseMessage{Message: "Invalid request"})
		//return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"}) //HTTP 400 Bad Request
	}

	err = a.dataValidator.Struct(params) // valida los datos de la solicitud
	if err != nil {
		log.Println(err)
		return c.JSON(http.StatusBadRequest, responseMessage{Message: err.Error()}) // HTTP 400 Bad Request
	}

	u, err := a.serv.LoginUser(ctx, params.Email, params.Password) // OBJID, email, name
	if err != nil {
		log.Println(err)
		return c.JSON(http.StatusInternalServerError, responseMessage{Message: "Invalid Credentials"})
	}

	token, err := encryption.SignedLoginToken(u) // Genera el token con los datos del usuario (OBJID, email, name)
	if err != nil {
		log.Println(err)
		return c.JSON(http.StatusInternalServerError, responseMessage{Message: "Internal server error"}) // HTTP 500 Internal Server Error
	}

	return c.JSON(http.StatusOK, map[string]string{"token": token}) // HTTP 200 OK
}

// LogoutUser elimina la cookie de autenticación
func (a *API) LogoutUser(c echo.Context) error {

	expiredCookie := &http.Cookie{
		Name:     "Authorization",
		Value:    "",
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
		HttpOnly: true,
		Path:     "/",
	}

	c.SetCookie(expiredCookie) // Setea la cookie en el navegador

	return c.JSON(http.StatusOK, map[string]string{"success": "true"}) // HTTP 200 OK
}

func (a *API) AddComment(c echo.Context) error {
	ctx := c.Request().Context() // Context.Context es una interfaz que permite el paso de valores entre funciones
	params := models.Comment{}

	err := c.Bind(&params) // llena a params con los datos de la solicitud

	// Sin error  == nil - Con error != nil
	if err != nil {
		return c.JSON(http.StatusBadRequest, responseMessage{Message: "Invalid request"})
	}

	err = a.repo.HandleAddComment(ctx, params)
	if err != nil {
		log.Println(err)
		return c.JSON(http.StatusInternalServerError, responseMessage{Message: "Invalid Credentials"})
	}

	return c.JSON(http.StatusOK, map[string]string{"success": "true"}) // HTTP 200 OK
}

// Verifica si existe una cookie de autenticación
func (a *API) AuthUser(c echo.Context) error {

	_, err := c.Cookie("Authorization")
	if err != nil {
		return c.NoContent(http.StatusUnauthorized) // HTTP 401 Unauthorized
	}

	return c.NoContent(http.StatusOK) // HTTP 200 OK
}

func (a *API) HandleWebSocket(c echo.Context) error {
	ctx := c.Request().Context()
	roomID := c.Param("room") // ID de la sala conectada

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

	auth := c.QueryParam("token")

	//validar datos
	if auth == "" {
		errMessage := "Error: Unauthorized"
		conn.WriteMessage(websocket.TextMessage, []byte(errMessage))
		conn.Close()
		return nil
	}

	claims, err := encryption.ParseLoginJWT(auth)
	if err != nil {
		errMessage := "Error: Unauthorized"
		conn.WriteMessage(websocket.TextMessage, []byte(errMessage))
		conn.Close()
		return nil
	}

	user := claims["email"].(string)

	//validar aun mas datos (forma parte de la sala)
	room, err := a.serv.GetRoom(ctx, roomID)
	if err != nil {
		errMessage := "Error: Room not found"
		conn.WriteMessage(websocket.TextMessage, []byte(errMessage))
		conn.Close()
		return nil
	}

	//revisa los permisos del usuario
	permission, e := a.serv.GetPermission(ctx, user, roomID)
	if permission == -1 {
		log.Println(e)
		errMessage := "Error: Unauthorized"
		conn.WriteMessage(websocket.TextMessage, []byte(errMessage))
		conn.Close()
		return nil
	}

	objectID, _ := primitive.ObjectIDFromHex(roomID)

	//conectar a la sala
	proyect := instanceRoom(objectID,
		room.Data,
		room.Config,
		room.Fosil,
		room.Facies,
	)
	proyect.Active = append(proyect.Active, conn)

	//log.Print(rooms)
	//log.Println(proyect.Active)

	// Sacamos la conf y la transformamos a []
	datos := proyect.Config["columns"].(map[string]interface{})

	orden := []string{"Sistema", "Edad", "Formacion", "Miembro", "Espesor", "Litologia", "Estructura fosil", "Facie", "Ambiente Depositacional", "Descripcion"}

	var claves []string

	for _, clave := range orden {
		if valor, existe := datos[clave]; existe {
			// Comprobar si el valor es bool y es true
			if boolVal, ok := valor.(bool); ok && boolVal {
				claves = append(claves, clave)
			}
		}
	}

	msgData := map[string]interface{}{
		"header":     claves,
		"isInverted": proyect.Config["isInverted"],
	}

	// Enviar configuracion y datos de la sala
	dataRoom := map[string]interface{}{
		"action":          "data",
		"data":            proyect.Data,
		"config":          msgData,
		"fosil":           proyect.Fosil,
		"facies":          proyect.Facies,
		"sectionsEditing": proyect.SectionsEditing,
	}
	// Trnasformar el mapa a JSON y envio a clientes
	databytes, err := json.Marshal(dataRoom)
	if err != nil {
		errMessage := "Error: cannot sent room config"
		conn.WriteMessage(websocket.TextMessage, []byte(errMessage))
	}
	conn.WriteMessage(websocket.TextMessage, databytes)

	if err == nil {
		//conn.WriteMessage(websocket.TextMessage, []byte(dataBytes))
		log.Printf("user %s: Permission %d", user, permission)
		// var v interface{}
		// conn.ReadJSON(v)
		// log.Println(v, "aaaa")

		for {
			_, msg, err := conn.ReadMessage()
			if err != nil {
				break
			}

			if permission != 2 {
				var dataMap GeneralMessage
				err := json.Unmarshal([]byte(msg), &dataMap)
				//undo := true
				if err != nil {
					log.Println("le falta el id a la wea")
					log.Fatal(err)
				}

				if dataMap.Action != "editingUser" && dataMap.Action != "deleteEditingUser" && dataMap.Action != "columns" {
					go func() {
						// Bloquear acceso al mapa de timers para evitar condiciones de carrera
						a.saveMutex.Lock()
						defer a.saveMutex.Unlock()

						// Verificar si ya hay un timer activo para esta sala
						if timer, exists := roomTimers[roomID]; exists {

							if roomActions[roomID] >= roomActionsThreshold {

								// Función de guardado
								err = a.serv.SaveRoom(ctx, rooms[roomID].Data, rooms[roomID].Config, rooms[roomID].Fosil, roomID, rooms[roomID].Facies)
								if err != nil {
									log.Println("Error guardando la sala automáticamente: ", err)
								} else {
									log.Println("Sala guardada: ", roomID)
								}

								roomActions[roomID] = 0

								//salir de la funcion
								return
							}

							log.Println("Reiniciando el timer: ", roomID)
							log.Println("Acciones: ", roomActions[roomID])
							timer.Reset(5 * time.Second)
							roomActions[roomID]++

						} else {
							// Si no hay un timer, se crea uno
							log.Println("Creando un nuevo timer: ", roomID)
							timer := time.NewTimer(5 * time.Second)
							roomTimers[roomID] = timer

							go func() {
								<-timer.C

								// Función de guardado
								if rooms[roomID] != nil {
									err = a.serv.SaveRoom(ctx, rooms[roomID].Data, rooms[roomID].Config, rooms[roomID].Fosil, roomID, rooms[roomID].Facies)
									if err != nil {
										log.Println("Error guardando la sala automáticamente: ", err)
									} else {
										log.Println("Sala guardada: ", roomID)
									}
								}

								// Eliminar el timer del mapa una vez que la sala ha sido guardada
								a.saveMutex.Lock()
								delete(roomTimers, roomID)
								a.saveMutex.Unlock()
							}()
						}
					}()
				}
				// Switch para las acciones
				switch dataMap.Action {

				case "undo":
					if len(proyect.Changes) == 0 {
						log.Printf("No hay cambios")
						break
					}

					log.Printf("%v", proyect.Changes)
					lastChange := proyect.Changes[len(proyect.Changes)-1]

					// Separa la clave principal y el subpath
					parts := strings.SplitN(lastChange.Key, ".", 2)
					if len(parts) < 2 {
						log.Printf("Error: key must include at least one dot separator.")
						break
					}
					mainKey := parts[0]
					subPath := parts[1]

					// Accede al campo principal usando reflect
					fieldValue := reflect.ValueOf(proyect).Elem().FieldByName(mainKey)
					if !fieldValue.IsValid() {
						log.Printf("Error: main key is not a valid field name.")
						break
					}

					// Ejecuta la acción correspondiente al tipo de cambio
					switch lastChange.ActionType {
					case "add":
						DeleteValueKeyPath(fieldValue.Interface(), subPath)
					case "modify":
						AssignValueByKey(fieldValue.Interface(), subPath, lastChange.OldValue)
					case "delete":
						AddValueAtKeyPath(fieldValue.Interface(), subPath, lastChange.OldValue)
					}

					proyect.Changes = proyect.Changes[:len(proyect.Changes)-1]

				case "editingUser":

					var editing dtos.UserEditingState
					err := json.Unmarshal(dataMap.Data, &editing)
					if err != nil {
						log.Println("Error al deserializar: ", err)
					}

					//var name = claims["name"].(string)
					section := editing.Section
					roomData := rooms[roomID]

					color, exists := roomData.UserColors[user]
					if !exists {
						// Generar un color único para el usuario y guardarlo en el mapa
						color = generateRandomColor()
						roomData.UserColors[user] = color
					}

					if roomData.SectionsEditing == nil {
						// Si no está inicializado, inicialízalo
						roomData.SectionsEditing = make(map[string]interface{})
					}

					msgData := map[string]interface{}{
						"action":   "editingUser",
						"userName": user,
						"color":    color,
						"value":    section,
					}

					roomData.SectionsEditing[section] = map[string]interface{}{
						"name":  user,
						"color": color,
						//"section" : section,
					}
					sendSocketMessage(msgData, proyect, "editingUser")

				case "deleteEditingUser":
					var editing dtos.UserEditingState
					err := json.Unmarshal(dataMap.Data, &editing)
					if err != nil {
						log.Println("Error al deserializar: ", err)
					}
					section := editing.Section
					roomData := rooms[roomID]
					name := editing.Name

					if roomData.SectionsEditing != nil {
						if _, ok := roomData.SectionsEditing[section]; ok {
							delete(roomData.SectionsEditing, section)

							msgData := map[string]interface{}{
								"action": "deleteEditingUser",
								"value":  section,
								"name":   name,
							}

							sendSocketMessage(msgData, proyect, "deleteEditingUser")
						} else {
							log.Println("El elemento a eliminar no existe")
						}
					}

				case "añadir":

					var addData dtos.Add
					err := json.Unmarshal(dataMap.Data, &addData)
					if err != nil {
						log.Println("Error al deserializar: ", err)
					}

					rowIndex := addData.RowIndex
					height := addData.Height
					roomData := rooms[roomID]

					var index int

					if rowIndex == -1 {
						index = len(roomData.Data)
					} else {
						index = rowIndex
					}

					var prevShape string
					var lit = roomData.Data

					if index+1 > 0 && index+1 < len(roomData.Data) {
						lit[index+1].Litologia.PrevContact = "111"
						rooms[roomID].Data = lit
					}

					if index-1 >= 0 && index-1 < len(roomData.Data) {
						prevShape = roomData.Data[index-1].Litologia.Contact
					} else if index == 0 {
						prevShape = "111"
					} else {
						prevShape = "111"
					}

					newShape := models.DataInfo{
						Sistema:                "",
						Edad:                   "",
						Formacion:              "",
						Miembro:                "",
						Espesor:                "",
						Facie:                  "",
						AmbienteDepositacional: "",
						Descripcion:            "",
						Litologia: models.LitologiaStruc{
							ColorFill:   "#ffffff",
							ColorStroke: "#000000",
							Zoom:        100,
							Rotation:    0,
							Tension:     0.5,
							File:        "Sin Pattern",
							Height:      height,
							Circles: []models.CircleStruc{
								{X: 0, Y: 0, Radius: 5, Movable: false},
								{X: 0.5, Y: 0, Radius: 5, Movable: true, Name: "none"},
								{X: 0.5, Y: 1, Radius: 5, Movable: true, Name: "none"},
								{X: 0, Y: 1, Radius: 5, Movable: false},
							},
							Contact:     "111",
							PrevContact: prevShape,
						},
					}

					if rowIndex == -1 { // Agrega al final
						roomData.Data = append(roomData.Data, newShape)

						// Enviar informacion a los clientes
						msgData := map[string]interface{}{
							"action": "añadirEnd",
							"value":  newShape,
						}

						sendSocketMessage(msgData, proyect, "añadir")

					} else { // Agrega en el índice encontrado
						roomData.Data = append(roomData.Data[:rowIndex], append([]models.DataInfo{newShape}, roomData.Data[rowIndex:]...)...)

						msgData := map[string]interface{}{
							"action":   "añadir",
							"rowIndex": rowIndex,
							"value":    newShape,
						}

						sendSocketMessage(msgData, proyect, "añadir")

					}

				case "delete":

					var deleteData dtos.Delete
					err := json.Unmarshal(dataMap.Data, &deleteData)
					if err != nil {
						log.Println("Error al deserializar: ", err)
					}

					rowIndex := deleteData.RowIndex
					roomData := rooms[roomID]

					if rowIndex+1 > 0 && rowIndex+1 < len(roomData.Data) {
						if rowIndex-1 >= 0 {
							lit := roomData.Data
							lit[rowIndex+1].Litologia.PrevContact = roomData.Data[rowIndex-1].Litologia.Contact
							rooms[roomID].Data = lit

							var newPrev string
							if rowIndex-1 >= 0 {
								newPrev = roomData.Data[rowIndex-1].Litologia.Contact
							} else {
								newPrev = "111"
							}

							msgData2 := map[string]interface{}{
								"action":   "editPolygon",
								"rowIndex": rowIndex + 1,
								"key":      "prevContact",
								"value":    newPrev,
							}
							sendSocketMessage(msgData2, proyect, "editPolygon")
						}
					}

					roomData.Data = append(roomData.Data[:rowIndex], roomData.Data[rowIndex+1:]...)

					msgData := map[string]interface{}{
						"action":   "delete",
						"rowIndex": rowIndex,
					}
					sendSocketMessage(msgData, proyect, "delete")

				// case "addCircle":

				// 	var addCircleData dtos.AddCircle
				// 	err := json.Unmarshal(dataMap.Data, &addCircleData)
				// 	if err != nil {
				// 		log.Println("Error al deserializar: ", err)
				// 	}

				// 	rowIndex := addCircleData.RowIndex
				// 	insertIndex := addCircleData.InsertIndex
				// 	point := addCircleData.Point

				// 	roomData := rooms[roomID].Data[rowIndex]["Litologia"].(map[string]interface{})

				// 	circles := roomData["circles"].([]map[string]interface{})

				// 	newCircle2 := map[string]interface{}{
				// 		"x":       0.5,
				// 		"y":       point,
				// 		"radius":  5,
				// 		"movable": true,
				// 		"name":    "none",
				// 	}

				// 	circles = append(circles[:insertIndex], append([]map[string]interface{}{newCircle2}, circles[insertIndex:]...)...)

				// 	roomData["circles"] = circles

				// 	// Enviar informacion a los clientes
				// 	msgData := map[string]interface{}{
				// 		"action":   "addCircle",
				// 		"rowIndex": rowIndex,
				// 		"value":    circles,
				// 	}

				// 	sendSocketMessage(msgData, proyect, "addCircle")

				// case "deleteCircle":
				// 	var deleteCircleData dtos.DeleteCircle
				// 	err := json.Unmarshal(dataMap.Data, &deleteCircleData)
				// 	if err != nil {
				// 		log.Println("Error al deserializar: ", err)
				// 	}

				// 	rowIndex := deleteCircleData.RowIndex
				// 	deleteIndex := deleteCircleData.DeleteIndex

				// 	roomData := rooms[roomID].Data[rowIndex]["Litologia"].(map[string]interface{})

				// 	circles := roomData["circles"].([]map[string]interface{})

				// 	circles = append(circles[:deleteIndex], circles[deleteIndex+1:]...)

				// 	roomData["circles"] = circles

				// 	msgData := map[string]interface{}{
				// 		"action":   "addCircle",
				// 		"rowIndex": rowIndex,
				// 		"value":    circles,
				// 	}

				// 	sendSocketMessage(msgData, proyect, "deleteCircle")

				// case "editCircle":
				// 	var editCircleData dtos.EditCircle

				// 	err := json.Unmarshal(dataMap.Data, &editCircleData)
				// 	if err != nil {
				// 		log.Println("Error al deserializar: ", err)
				// 	}

				// 	rowIndex := editCircleData.RowIndex
				// 	editIndex := editCircleData.EditIndex
				// 	x := editCircleData.X
				// 	name := editCircleData.Name

				// 	roomData := rooms[roomID].Data[rowIndex]["Litologia"].(map[string]interface{})

				// 	circles := roomData["circles"].([]map[string]interface{})

				// 	circles[editIndex]["x"] = x
				// 	circles[editIndex]["name"] = name

				// 	roomData["circles"] = circles

				// 	msgData := map[string]interface{}{
				// 		"action":   "addCircle",
				// 		"rowIndex": rowIndex,
				// 		"value":    circles,
				// 	}

				// 	sendSocketMessage(msgData, proyect, "editCircle")

				// // Edicion de texto
				case "editText":

					var editTextData dtos.EditText
					err := json.Unmarshal(dataMap.Data, &editTextData)
					if err != nil {
						log.Println("Error, Datos malos")
					}

					key := editTextData.Key
					value := editTextData.Value
					rowIndex := editTextData.RowIndex

					//MakeChange(proyect, "modify", "Data.["+strconv.Itoa(rowIndex)+"]."+key, value)

					roomData := &rooms[roomID].Data[rowIndex]
					structValue := reflect.ValueOf(roomData).Elem()

					field := structValue.FieldByName(key)
					if field.IsValid() {
						if field.CanSet() {
							fieldValue := reflect.ValueOf(value)
							field.Set(fieldValue)
						}
					}

					// Enviar informacion a los clientes
					msgData := map[string]interface{}{
						"action":   "editText",
						"key":      key,
						"value":    value,
						"rowIndex": rowIndex,
					}

					sendSocketMessage(msgData, proyect, "editText")

				// case "addFosil":
				// 	var fosil dtos.AddFosil
				// 	err := json.Unmarshal(dataMap.Data, &fosil)
				// 	if err != nil {
				// 		log.Println("Error", err)
				// 	}

				// 	id := shortuuid.New()
				// 	upper := fosil.Upper
				// 	lower := fosil.Lower
				// 	fosilImg := fosil.FosilImg
				// 	x := fosil.X

				// 	newFosil := map[string]interface{}{
				// 		"upper":    upper,
				// 		"lower":    lower,
				// 		"fosilImg": fosilImg,
				// 		"x":        x,
				// 	}

				// 	innerMap := rooms[roomID].Fosil
				// 	innerMap[id] = newFosil

				// 	msgData := map[string]interface{}{
				// 		"action":  "addFosil",
				// 		"idFosil": id,
				// 		"value":   newFosil,
				// 	}

				// 	sendSocketMessage(msgData, proyect, "addFosil")

				// case "deleteFosil":
				// 	var fosilID dtos.DeleteFosil
				// 	err := json.Unmarshal(dataMap.Data, &fosilID)
				// 	if err != nil {
				// 		log.Println("Error deserializando fósil:", err)
				// 		break
				// 	}

				// 	id := fosilID.IdFosil

				// 	innerMap := rooms[roomID].Fosil
				// 	delete(innerMap, id)

				// 	msgData := map[string]interface{}{
				// 		"action":  "deleteFosil",
				// 		"idFosil": id,
				// 	}

				// 	sendSocketMessage(msgData, proyect, "deleteFosil")

				// case "editFosil":
				// 	var fosilEdit dtos.EditFosil
				// 	err := json.Unmarshal(dataMap.Data, &fosilEdit)
				// 	if err != nil {
				// 		log.Println("Error deserializando fósil:", err)
				// 		break
				// 	}

				// 	id := fosilEdit.IdFosil
				// 	upper := fosilEdit.Upper
				// 	lower := fosilEdit.Lower
				// 	fosilImg := fosilEdit.FosilImg
				// 	x := fosilEdit.X

				// 	newFosil := map[string]interface{}{
				// 		"upper":    upper,
				// 		"lower":    lower,
				// 		"fosilImg": fosilImg,
				// 		"x":        x,
				// 	}

				// 	innerMap := rooms[roomID].Fosil
				// 	innerMap[id] = newFosil

				// 	msgData := map[string]interface{}{
				// 		"action":  "editFosil",
				// 		"idFosil": id,
				// 		"value":   newFosil,
				// 	}

				// 	sendSocketMessage(msgData, proyect, "editFosil")

				// case "save":
				// 	log.Println("guardando...")
				// 	err = a.serv.SaveRoom(ctx, rooms[roomID].Data, rooms[roomID].Config, rooms[roomID].Fosil, roomID, rooms[roomID].Facies)
				// 	if err != nil {
				// 		log.Println("No se guardo la data")
				// 	}

				// case "columns":
				// 	var column dtos.Column
				// 	err := json.Unmarshal(dataMap.Data, &column)
				// 	if err != nil {
				// 		log.Println("Error deserializando columna:", err)
				// 		break
				// 	}
				// 	datos := rooms[roomID].Config["columns"].(map[string]interface{})
				// 	datos[column.Column] = column.IsVisible

				// 	// Crear un slice para almacenar las columnas ordenadas
				// 	//orderedColumns := make([]interface{}, len(orden))
				// 	var orderedVisibleColumns []string

				// 	// Llenar el slice con los datos de las columnas en el orden correcto
				// 	for _, colName := range orden {
				// 		if isVisible, ok := datos[colName].(bool); ok && isVisible {
				// 			// Si la columna es visible (IsVisible == true), agregar su nombre al slice.
				// 			orderedVisibleColumns = append(orderedVisibleColumns, colName)
				// 		}
				// 	}

				// 	msgData := map[string]interface{}{
				// 		"action":  "columns",
				// 		"columns": orderedVisibleColumns,
				// 	}

				// 	sendSocketMessage(msgData, proyect, "columns")

				// case "isInverted":
				// 	var isInverted dtos.IsInverted
				// 	err := json.Unmarshal(dataMap.Data, &isInverted)
				// 	if err != nil {
				// 		log.Println("Error deserializando columna:", err)
				// 		break
				// 	}

				// 	rooms[roomID].Config["isInverted"] = isInverted.IsInverted

				// 	msgData := map[string]interface{}{
				// 		"action":     "isInverted",
				// 		"isInverted": isInverted.IsInverted,
				// 	}

				// 	sendSocketMessage(msgData, proyect, "isInverted")

				case "editPolygon":

					var polygon dtos.EditPolygon
					err := json.Unmarshal(dataMap.Data, &polygon)
					if err != nil {
						log.Println("Error deserializando el polygon:", err)
						break
					}
					rowIndex := polygon.RowIndex
					column := polygon.Column
					value := polygon.Value

					roomData := &proyect.Data[rowIndex].Litologia

					UpdateField(roomData, column, value)

					msgData := map[string]interface{}{
						"action":   "editPolygon",
						"rowIndex": rowIndex,
						"key":      column,
						"value":    value,
					}

					// if column == "contact" && rowIndex+1 < len(rooms[roomID].Data) {
					// 	roomData2 := rooms[roomID].Data
					// 	innerMap2 := roomData2[rowIndex+1]["Litologia"].(map[string]interface{})
					// 	innerMap2["prevContact"] = roomData["Litologia"].(map[string]interface{})["contact"].(string)
					// 	rooms[roomID].Data = roomData2
					// 	msgData2 := map[string]interface{}{
					// 		"action":   "editPolygon",
					// 		"rowIndex": rowIndex + 1,
					// 		"key":      "prevContact",
					// 		"value":    roomData["Litologia"].(map[string]interface{})["contact"],
					// 	}
					// 	sendSocketMessage(msgData2, proyect, "editPolygon")
					// }

					sendSocketMessage(msgData, proyect, "editPolygon")

					log.Printf(proyect.Data[rowIndex].Litologia.File)

					// case "deleteFacie":
					// 	var facie dtos.Facie
					// 	err := json.Unmarshal(dataMap.Data, &facie)
					// 	if err != nil {
					// 		log.Println("Error deserializando el polygon:", err)
					// 		break
					// 	}

					// 	id := facie.Facie

					// 	innerMap := rooms[roomID].Facies
					// 	delete(innerMap, id)

					// 	msgData := map[string]interface{}{
					// 		"action": "deleteFacie",
					// 		"facie":  id,
					// 	}

					// 	sendSocketMessage(msgData, proyect, "deleteFacie")

					// case "addFacieSection":
					// 	var f dtos.AddFacieSection
					// 	err := json.Unmarshal(dataMap.Data, &f)
					// 	if err != nil {
					// 		log.Println("Error", err)
					// 	}
					// 	name := f.Facie
					// 	y1 := f.Y1
					// 	y2 := f.Y2

					// 	innerMap, ok := rooms[roomID].Facies[name].([]map[string]interface{})
					// 	if !ok {
					// 		// Manejar el error, por ejemplo inicializar innerMap o logear un error.
					// 		fmt.Println("error")
					// 	}

					// 	newSectionFacie := map[string]interface{}{
					// 		"y1": y1,
					// 		"y2": y2,
					// 	}

					// 	innerMap = append(innerMap, newSectionFacie)
					// 	rooms[roomID].Facies[name] = innerMap

					// 	msgData := map[string]interface{}{
					// 		"action": "addFacieSection",
					// 		"facie":  name,
					// 		"y1":     y1,
					// 		"y2":     y2,
					// 	}

					// 	sendSocketMessage(msgData, proyect, "addFacieSection")

					// case "addFacie":
					// 	var facie dtos.Facie
					// 	err := json.Unmarshal(dataMap.Data, &facie)
					// 	if err != nil {
					// 		log.Println("Error", err)
					// 	}

					// 	name := facie.Facie

					// 	fmt.Println(name, "esta es la linea")

					// 	if rooms[roomID].Facies == nil {
					// 		rooms[roomID].Facies = make(map[string]interface{})
					// 	}

					// 	rooms[roomID].Facies[name] = []map[string]interface{}{}

					// 	msgData := map[string]interface{}{
					// 		"action": "addFacie",
					// 		"facie":  name,
					// 	}

					// 	sendSocketMessage(msgData, proyect, "addFacie")

				}

			} else {
				errMessage := "Error: Don't have permission to edit this document"
				conn.WriteMessage(websocket.TextMessage, []byte(errMessage))
			}
		}
	}

	conn.Close()

	RemoveElement(a, ctx, roomID, conn, claims["email"].(string), proyect)
	return nil
}

func sendSocketMessage(msgData map[string]interface{}, proyect *RoomData, action string) {

	jsonMsg, err := json.Marshal(msgData)
	if err != nil {
		log.Fatal("Error al serializar mensaje:", err)
	}

	for _, client := range proyect.Active {
		err = client.WriteMessage(websocket.TextMessage, jsonMsg)
		if err != nil {
			log.Println("Error al enviar mensaje:", err)
			log.Println("action: ", action)
		}
	}

}

func (a *API) HandleInviteUser(c echo.Context) error {

	ctx := c.Request().Context()
	auth := c.Request().Header.Get("Authorization")

	//validar datos
	if auth == "" {
		return c.JSON(http.StatusUnauthorized, responseMessage{Message: "Unauthorized"})
	}

	claims, err := encryption.ParseLoginJWT(auth)
	if err != nil {
		log.Println(err)
		return c.JSON(http.StatusUnauthorized, responseMessage{Message: "Unauthorized"})
	}

	user := claims["email"].(string)
	id := c.Param("id")

	var newUser dtos.InviteUserRequest

	err = c.Bind(&newUser) // llena a params con los datos de la solicitud

	if err != nil {
		return c.JSON(http.StatusBadRequest, responseMessage{Message: "Invalid request"})
		//return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"}) //HTTP 400 Bad Request
	}

	log.Print(newUser)

	if newUser.Email == "" || newUser.Role == "0" {
		return c.JSON(http.StatusBadRequest, responseMessage{Message: "Invalid request"})
	}

	//obtener el proyecto
	proyect, err := a.serv.GetRoomInfo(ctx, id)
	if err != nil {
		return c.JSON(http.StatusNotFound, responseMessage{Message: "Room not found"})
	}

	//validar si el usuario tiene permisos
	if proyect.Members["0"] != user {
		return c.JSON(http.StatusUnauthorized, responseMessage{Message: "Unauthorized"})
	}

	//validar si el usuario ya esta en el proyecto dentro de Members[0], Members[1][array], Members[2][array]
	if proyect.Members["0"] == newUser.Email {
		return c.JSON(http.StatusBadRequest, responseMessage{Message: "User already in the project"})
	}

	members1 := proyect.Members["1"].(primitive.A)
	members2 := proyect.Members["2"].(primitive.A)

	for _, member := range members1 {
		if member == newUser.Email {
			return c.JSON(http.StatusBadRequest, responseMessage{Message: "User already in the project"})
		}
	}

	for _, member := range members2 {
		if member == newUser.Email {
			return c.JSON(http.StatusBadRequest, responseMessage{Message: "User already in the project"})
		}
	}

	err = a.repo.AddUserToProject(ctx, newUser.Email, newUser.Role, id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, responseMessage{Message: "Failed to invite user"})
	}

	return c.JSON(http.StatusOK, responseMessage{Message: "User invited successfully"})
}

func instanceRoom(Id_project primitive.ObjectID, Data []models.DataInfo, Config map[string]interface{}, Fosil map[string]interface{}, Facies map[string]interface{}) *RoomData {

	projectIDString := Id_project.Hex()
	room, exists := rooms[projectIDString]
	//room, exists := rooms[Id_project] //instancia el room con los datos de la bd
	if !exists {

		// for _, element := range Data {
		// 	data := element["Litologia"].(map[string]interface{})
		// 	circles := make([]map[string]interface{}, 0) // Create an empty slice to store the circles

		// 	for _, c := range data["circles"].(primitive.A) {
		// 		circle := c.(map[string]interface{})
		// 		circles = append(circles, circle)
		// 	}

		// 	data["circles"] = circles
		// }

		var sectionsEditing map[string]interface{}
		userColors := make(map[string]string)

		room = &RoomData{
			Id_project:      Id_project,
			Data:            Data,
			Config:          Config,
			Fosil:           Fosil,
			Facies:          Facies,
			Active:          make([]*websocket.Conn, 0),
			SectionsEditing: sectionsEditing,
			UserColors:      userColors,
			Changes:         make([]Change, 0),
		}

		rooms[projectIDString] = room
	}

	return room
}

func (a *API) HandleCreateProyect(c echo.Context) error {

	ctx := c.Request().Context()

	auth := c.Request().Header.Get("Authorization")
	if auth == "" {
		return c.JSON(http.StatusUnauthorized, responseMessage{Message: "Unauthorized"})
	}

	// Si existe, revisa si es valido
	claims, err := encryption.ParseLoginJWT(auth)
	if err != nil {
		log.Println(err)
		return c.JSON(http.StatusUnauthorized, responseMessage{Message: "Unauthorized"})
	}

	correo := claims["email"].(string)
	name := claims["name"].(string)
	log.Println(correo)
	log.Println(name)

	var params dtos.Project

	err = c.Bind(&params) // llena a params con los datos de la solicitud

	log.Print(params)

	// Sin error  == nil - Con error != nil
	if err != nil {
		return c.JSON(http.StatusBadRequest, responseMessage{Message: "Invalid request"})
		//return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"}) //HTTP 400 Bad Request
	}

	err = a.dataValidator.Struct(params) // valida los datos de la solicitud
	if err != nil {
		log.Println(err)
		return c.JSON(http.StatusBadRequest, responseMessage{Message: err.Error()}) // HTTP 400 Bad Request
	}

	err = a.serv.CreateRoom(ctx, params.RoomName, name, correo, params.Desc, params.Location, params.Lat, params.Long, params.Visible)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, responseMessage{Message: "Failed to create a room"})
	}

	return c.JSON(http.StatusOK, responseMessage{Message: "Room created successfully"})
}

func (a *API) projects(c echo.Context) error {

	ctx := c.Request().Context()
	auth := c.Request().Header.Get("Authorization")

	log.Print(auth)

	//validar datos
	if auth == "" {
		return c.JSON(http.StatusUnauthorized, responseMessage{Message: "Unauthorized"})
	}

	claims, err := encryption.ParseLoginJWT(auth)
	if err != nil {
		log.Println(err)
		return c.JSON(http.StatusUnauthorized, responseMessage{Message: "Unauthorized"})
	}

	user := claims["email"].(string)

	proyects, err := a.serv.GetProyects(ctx, user)
	if err != nil {
		log.Println(err)
		return c.JSON(http.StatusUnauthorized, responseMessage{Message: "Error getting proyects"})
	}

	// Crear una instancia de ProjectResponse con los proyectos obtenidos
	response := ProjectResponse{
		Projects: proyects,
	}

	// Devolver la respuesta JSON con los proyectos
	return c.JSON(http.StatusOK, response)
}

func (a *API) HandleGetPublicProject(c echo.Context) error {

	ctx := c.Request().Context()
	auth := c.Request().Header.Get("Authorization")
	if auth == "" {
		return c.JSON(http.StatusUnauthorized, responseMessage{Message: "Unauthorized"})
	}

	proyects, err := a.serv.HandleGetPublicProject(ctx)
	if err != nil {
		log.Println(err)
		return c.JSON(http.StatusUnauthorized, responseMessage{Message: "Error getting proyects"})
	}

	// Crear una instancia de ProjectResponse con los proyectos obtenidos
	response := ProjectResponse{
		Projects: proyects,
	}

	// Devolver la respuesta JSON con los proyectos
	return c.JSON(http.StatusOK, response)
}

func (a *API) DeleteProject(c echo.Context) error {

	ctx := c.Request().Context()

	auth := c.Request().Header.Get("Authorization")

	if auth == "" {
		return c.JSON(http.StatusUnauthorized, responseMessage{Message: "Unauthorized"})
	}

	claims, err := encryption.ParseLoginJWT(auth)
	if err != nil {
		log.Println(err)
		return c.JSON(http.StatusUnauthorized, responseMessage{Message: "Unauthorized"})
	}

	user := claims["email"].(string)

	id := c.Param("id")
	proyect, err := a.serv.GetRoomInfo(ctx, id)
	if err != nil {
		return c.JSON(http.StatusNotFound, responseMessage{Message: "Room not found"})
	}

	if proyect.Members["0"] != user {
		err = a.repo.DeleteUserRoom(ctx, user, id)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, responseMessage{Message: "Failed to delete user"})
		}

	} else {
		err = a.repo.DeleteProject(ctx, id)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, responseMessage{Message: "Failed to delete room"})
		}

	}

	return c.JSON(http.StatusOK, responseMessage{Message: "Room deleted successfully"})
}

func (a *API) HandleGetActiveProject(c echo.Context) error {

	var keys []string

	for key := range rooms {
		keys = append(keys, key)
	}

	return c.JSON(http.StatusOK, keys)
}
