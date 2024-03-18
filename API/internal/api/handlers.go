package api

import (
	"encoding/json"
	"errors"

	"crypto/rand"
	"encoding/hex"
	"log"
	"net/http"

	"time"

	"github.com/ProyectoT/api/encryption"
	"github.com/ProyectoT/api/internal/api/dtos"
	"github.com/ProyectoT/api/internal/models"
	"github.com/ProyectoT/api/internal/service"
	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
	"github.com/lithammer/shortuuid/v4"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type responseMessage struct {
	Message string `json:"message"`
}

type GeneralMessage struct {
	Action string          `json:"action"`
	Data   json.RawMessage `json:"data"`
}

// type SectionInfo struct {
// 	Name  string
// 	Color string
// }

type ProjectResponse struct {
	Projects []models.Data `json:"projects"`
}

type RoomData struct {
	Id_project      primitive.ObjectID
	Data            []map[string]interface{}
	Config          map[string]interface{}
	Fosil           map[string]interface{}
	Active          []*websocket.Conn
	Temp            Stack
	SectionsEditing map[string]interface{}
	UserColors      map[string]string
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

	log.Println(params.Email, params.Name, params.Password, params.LastName)

	err = a.serv.RegisterUser(ctx, params.Email, params.Name, params.LastName, params.Password)
	if err != nil {
		if err == service.ErrUserAlreadyExists {
			return c.JSON(http.StatusConflict, responseMessage{Message: "User already exists"}) // HTTP 409 Conflict
		}

		return c.JSON(http.StatusInternalServerError, responseMessage{Message: "Internal server error"}) // HTTP 500 Internal Server Error
	}

	return c.JSON(http.StatusCreated, nil) // HTTP 201 Created
}

func RemoveElement(roomID string, conn *websocket.Conn) {
	var index int = -1
	for i, c := range rooms[roomID].Active {
		if c == conn { // asumiendo que conn es comparable directamente
			index = i
			break
		}
	}

	if index != -1 {
		// Eliminar el elemento en el índice encontrado

		rooms[roomID].Active = append(rooms[roomID].Active[:index], rooms[roomID].Active[index+1:]...)
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
		room.Fosil)
	proyect.Active = append(proyect.Active, conn)

	log.Println(proyect.Active)

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

	// Enviar configuracion y datos de la sala
	dataRoom := map[string]interface{}{
		"action":          "data",
		"data":            proyect.Data,
		"config":          claves,
		"fosil":           proyect.Fosil,
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
			cualquierwea, msg, err := conn.ReadMessage()
			if err != nil {
				break
			}

			log.Println(cualquierwea, "eeeeeeeeeee")

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
								err = a.serv.SaveRoom(ctx, rooms[roomID].Data, rooms[roomID].Config, rooms[roomID].Fosil, roomID)
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
								err = a.serv.SaveRoom(ctx, rooms[roomID].Data, rooms[roomID].Config, rooms[roomID].Fosil, roomID)
								if err != nil {
									log.Println("Error guardando la sala automáticamente: ", err)
								} else {
									log.Println("Sala guardada: ", roomID)
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

				case "editingUser":

					var editing dtos.UserEditingState
					err := json.Unmarshal(dataMap.Data, &editing)
					if err != nil {
						log.Println("Error al deserializar: ", err)
					}

					var name = claims["name"].(string)
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
						"userName": name,
						"color":    color,
						"value":    section,
					}

					roomData.SectionsEditing[section] = map[string]interface{}{
						"name":  name,
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

					if roomData.SectionsEditing != nil {
						if _, ok := roomData.SectionsEditing[section]; ok {
							delete(roomData.SectionsEditing, section)

							msgData := map[string]interface{}{
								"action": "deleteEditingUser",
								"value":  section,
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

					log.Println("a", rowIndex, index)
					var prevShape string

					if index-1 >= 0 && index-1 < len(roomData.Data) {
						innermap := roomData.Data[index-1]["Litologia"].(map[string]interface{})
						prevShape := innermap["contact"]
						log.Println("prevshape", prevShape)
					} else {
						prevShape = ""
						log.Println("prevshap", prevShape)
					}

					newShape := map[string]interface{}{
						"Sistema":                 "",
						"Edad":                    "",
						"Formacion":               "",
						"Miembro":                 "",
						"Espesor":                 "",
						"Facie":                   "",
						"Ambiente Depositacional": "",
						"Descripcion":             "",
						"Litologia": map[string]interface{}{
							"ColorFill":   "#ffffff", //white
							"colorStroke": "#000000", //black
							"zoom":        100,
							"rotation":    0,
							"tension":     0.5,
							"file":        "Sin Pattern",
							"height":      height,
							"circles": []map[string]interface{}{
								{"x": 0, "y": 0, "radius": 5, "movable": false},
								{"x": 0.5, "y": 0, "radius": 5, "movable": true, "name": "none"},
								{"x": 0.5, "y": 1, "radius": 5, "movable": true, "name": "none"},
								{"x": 0, "y": 1, "radius": 5, "movable": false},
							},
							"contact":     "111",
							"prevContact": prevShape,
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

						roomData.Data = append(roomData.Data[:rowIndex], append([]map[string]interface{}{newShape}, roomData.Data[rowIndex:]...)...)

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

					roomData.Data = append(roomData.Data[:rowIndex], roomData.Data[rowIndex+1:]...)

					msgData := map[string]interface{}{
						"action":   "delete",
						"rowIndex": rowIndex,
					}

					sendSocketMessage(msgData, proyect, "delete")

				case "addCircle":

					var addCircleData dtos.AddCircle
					err := json.Unmarshal(dataMap.Data, &addCircleData)
					if err != nil {
						log.Println("Error al deserializar: ", err)
					}

					rowIndex := addCircleData.RowIndex
					insertIndex := addCircleData.InsertIndex
					point := addCircleData.Point

					roomData := rooms[roomID].Data[rowIndex]["Litologia"].(map[string]interface{})

					circles := roomData["circles"].([]map[string]interface{})

					newCircle2 := map[string]interface{}{
						"x":       0.5,
						"y":       point,
						"radius":  5,
						"movable": true,
						"name":    nil,
					}

					circles = append(circles[:insertIndex], append([]map[string]interface{}{newCircle2}, circles[insertIndex:]...)...)

					roomData["circles"] = circles

					// Enviar informacion a los clientes
					msgData := map[string]interface{}{
						"action":   "addCircle",
						"rowIndex": rowIndex,
						"value":    circles,
					}

					sendSocketMessage(msgData, proyect, "addCircle")

				case "deleteCircle":
					var deleteCircleData dtos.DeleteCircle
					err := json.Unmarshal(dataMap.Data, &deleteCircleData)
					if err != nil {
						log.Println("Error al deserializar: ", err)
					}

					rowIndex := deleteCircleData.RowIndex
					deleteIndex := deleteCircleData.DeleteIndex

					roomData := rooms[roomID].Data[rowIndex]["Litologia"].(map[string]interface{})

					circles := roomData["circles"].([]map[string]interface{})

					circles = append(circles[:deleteIndex], circles[deleteIndex+1:]...)

					roomData["circles"] = circles

					msgData := map[string]interface{}{
						"action":   "addCircle",
						"rowIndex": rowIndex,
						"value":    circles,
					}

					sendSocketMessage(msgData, proyect, "deleteCircle")

				case "editCircle":
					var editCircleData dtos.EditCircle

					err := json.Unmarshal(dataMap.Data, &editCircleData)
					if err != nil {
						log.Println("Error al deserializar: ", err)
					}

					rowIndex := editCircleData.RowIndex
					editIndex := editCircleData.EditIndex
					x := editCircleData.X
					name := editCircleData.Name

					roomData := rooms[roomID].Data[rowIndex]["Litologia"].(map[string]interface{})

					circles := roomData["circles"].([]map[string]interface{})

					circles[editIndex]["x"] = x
					circles[editIndex]["name"] = name

					roomData["circles"] = circles

					msgData := map[string]interface{}{
						"action":   "addCircle",
						"rowIndex": rowIndex,
						"value":    circles,
					}

					sendSocketMessage(msgData, proyect, "editCircle")

				// Edicion de texto
				case "editText":

					var editTextData dtos.EditText
					err := json.Unmarshal(dataMap.Data, &editTextData)
					if err != nil {
						log.Println("Error, Datos malos")
					}

					key := editTextData.Key
					value := editTextData.Value
					rowIndex := editTextData.RowIndex

					//Modificamos el valor del texto, en rooms
					innerMap := rooms[roomID].Data[rowIndex]
					innerMap[key] = value

					// Enviar informacion a los clientes
					msgData := map[string]interface{}{
						"action":   "editText",
						"key":      key,
						"value":    value,
						"rowIndex": rowIndex,
					}

					sendSocketMessage(msgData, proyect, "editText")

				case "addFosil":
					var fosil dtos.AddFosil
					err := json.Unmarshal(dataMap.Data, &fosil)
					if err != nil {
						log.Println("Error", err)
					}

					id := shortuuid.New()
					upper := fosil.Upper
					lower := fosil.Lower
					fosilImg := fosil.FosilImg
					x := fosil.X

					newFosil := map[string]interface{}{
						"upper":    upper,
						"lower":    lower,
						"fosilImg": fosilImg,
						"x":        x,
					}

					innerMap := rooms[roomID].Fosil
					innerMap[id] = newFosil

					msgData := map[string]interface{}{
						"action":  "addFosil",
						"idFosil": id,
						"value":   newFosil,
					}

					sendSocketMessage(msgData, proyect, "addFosil")

				case "deleteFosil":
					var fosilID dtos.DeleteFosil
					err := json.Unmarshal(dataMap.Data, &fosilID)
					if err != nil {
						log.Println("Error deserializando fósil:", err)
						break
					}

					id := fosilID.IdFosil

					innerMap := rooms[roomID].Fosil
					delete(innerMap, id)

					msgData := map[string]interface{}{
						"action":  "deleteFosil",
						"idFosil": id,
					}

					sendSocketMessage(msgData, proyect, "deleteFosil")

				case "editFosil":
					var fosilEdit dtos.EditFosil
					err := json.Unmarshal(dataMap.Data, &fosilEdit)
					if err != nil {
						log.Println("Error deserializando fósil:", err)
						break
					}

					id := fosilEdit.IdFosil
					upper := fosilEdit.Upper
					lower := fosilEdit.Lower
					fosilImg := fosilEdit.FosilImg
					x := fosilEdit.X

					newFosil := map[string]interface{}{
						"upper":    upper,
						"lower":    lower,
						"fosilImg": fosilImg,
						"x":        x,
					}

					innerMap := rooms[roomID].Fosil
					innerMap[id] = newFosil

					msgData := map[string]interface{}{
						"action":  "editFosil",
						"idFosil": id,
						"value":   newFosil,
					}

					sendSocketMessage(msgData, proyect, "editFosil")

				case "save":
					log.Println("guardando...")
					err = a.serv.SaveRoom(ctx, rooms[roomID].Data, rooms[roomID].Config, rooms[roomID].Fosil, roomID)
					if err != nil {
						log.Println("No se guardo la data")
					}

				case "columns":
					var column dtos.Column
					err := json.Unmarshal(dataMap.Data, &column)
					if err != nil {
						log.Println("Error deserializando columna:", err)
						break
					}
					datos := rooms[roomID].Config["columns"].(map[string]interface{})
					datos[column.Column] = column.IsVisible

					// Crear un slice para almacenar las columnas ordenadas
					//orderedColumns := make([]interface{}, len(orden))
					var orderedVisibleColumns []string

					// Llenar el slice con los datos de las columnas en el orden correcto
					for _, colName := range orden {
						if isVisible, ok := datos[colName].(bool); ok && isVisible {
							// Si la columna es visible (IsVisible == true), agregar su nombre al slice.
							orderedVisibleColumns = append(orderedVisibleColumns, colName)
						}
					}

					msgData := map[string]interface{}{
						"action":  "columns",
						"columns": orderedVisibleColumns,
					}

					sendSocketMessage(msgData, proyect, "columns")

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

					// litologia := rooms[roomID].Data["Litologia"].(map[string]interface{})
					// innerMap := litologia[strconv.Itoa(rowIndex)].(map[string]interface{})

					roomData := rooms[roomID].Data[rowIndex]

					innerMap := roomData["Litologia"].(map[string]interface{})
					innerMap[column] = value

					msgData := map[string]interface{}{
						"action":   "editPolygon",
						"rowIndex": rowIndex,
						"key":      column,
						"value":    value,
					}

					log.Println("aquiii", msgData)

					sendSocketMessage(msgData, proyect, "editPolygon")

				}

				/////////////////////////////---------------------------//////////////////////////////

				// if dataMap["action"] == "undo" {
				// 	log.Println("deshacer")
				// 	temp, err := rooms[roomID].Temp.Pop() // esto estaba con el nombre no con la id
				// 	log.Println(temp)
				// 	if err != nil {
				// 		errMessage := "Error: la pila esta vacia"
				// 		log.Println(errMessage)
				// 	} else {
				// 		dataMap = temp
				// 		undo = false
				// 	}
				// }

				// if dataMap["action"] == "delete" {
				// 	id := int(dataMap["id"].(float64))
				// 	log.Printf("Borrando capa %s", string(rune(id)))

				// 	if undo {
				// 		temporal := make(map[string]interface{})
				// 		temporal["action"] = "Add"
				// 		temporal["id"] = float64(id)
				// 		temporal["polygon"] = rooms[roomID].Data["polygon"]
				// 		temporal["text"] = rooms[roomID].Data["text"]

				// 		rooms[roomID].Temp.Push(temporal)
				// 		//variacion := int(rooms[roomName].Data[:id]["polygon"]["y2"])-int(rooms[roomName].Data[:id]["polygon"]["y1"])
				// 		//log.Println(variacion)
				// 		/*

				// 			for estrato := range rooms[roomName].Data[:id]["polygon"]
				// 			estrato["y1"] = estrato["y1"] - variacion
				// 			estrato["y2"] = estrato["y2"] - variacion
				// 			for circle := range estrato["circles"]
				// 				circle["y"] = circle["y"] - variacion
				// 			}
				// 		*/
				// 	}

				// 	rooms[roomID].Data = append(rooms[roomID].Data[:id], rooms[roomID].Data[id+1:]...)
				// 	log.Println(id)
				// 	log.Println(rooms[roomID].Data)
				// 	responseJSON, err := json.Marshal(dataMap)
				// 	if err != nil {
				// 		log.Println("Error al convertir a JSON:", err)
				// 	}

				// 	for _, client := range proyect.Active {
				// 		err = client.WriteMessage(websocket.TextMessage, []byte(responseJSON))
				// 		if err != nil {
				// 			log.Println(err)
				// 		}
				// 	}

				// }
				// if dataMap["action"] == "text" {
				// 	id := int(dataMap["id"].(float64))
				// 	log.Printf("Editando texto capa %s", string(rune(id)))

				// 	if undo {
				// 		temporal := make(map[string]interface{})
				// 		temporal["action"] = "text"
				// 		temporal["id"] = float64(id)
				// 		temporal["text"] = rooms[roomID].Data["text"]

				// 		rooms[roomID].Temp.Push(temporal)
				// 	}
				// 	rooms[roomID].Data["text"] = dataMap["text"]

				// 	responseJSON, err := json.Marshal(dataMap)
				// 	if err != nil {
				// 		log.Println("Error al convertir a JSON:", err)
				// 	}

				// 	for _, client := range proyect.Active {
				// 		err = client.WriteMessage(websocket.TextMessage, []byte(responseJSON))
				// 		if err != nil {
				// 			log.Println(err)
				// 		}
				// 	}
				// }

				// if dataMap["action"] == "polygon" {
				// 	id := int(dataMap["id"].(float64))
				// 	log.Println(id)
				// 	log.Printf("Editando polygon capa %s", fmt.Sprint(id))

				// 	if undo {
				// 		temporal := make(map[string]interface{})
				// 		temporal["action"] = "polygon"
				// 		temporal["id"] = float64(id)
				// 		temporal["polygon"] = rooms[roomID].Data["polygon"]

				// 		rooms[roomID].Temp.Push(temporal)
				// 	}

				// 	rooms[roomID].Data["polygon"] = dataMap["polygon"]

				// 	responseJSON, err := json.Marshal(dataMap)
				// 	if err != nil {
				// 		log.Println("Error al convertir a JSON:", err)
				// 	}

				// 	for _, client := range proyect.Active {
				// 		err = client.WriteMessage(websocket.TextMessage, []byte(responseJSON))
				// 		log.Println(string(responseJSON))
				// 		if err != nil {
				// 			log.Println(err)
				// 		}
				// 	}
				// }

				// if dataMap["action"] == "settingsRoom" {
				// 	log.Printf("Editando config room")

				// 	if undo {
				// 		temporal := make(map[string]interface{})
				// 		temporal["action"] = "settingsRoom"
				// 		temporal["config"] = rooms[roomID].Config
				// 		rooms[roomID].Temp.Push(temporal)
				// 	}

				// 	for key, newValue := range dataMap["config"].(map[string]interface{}) {
				// 		rooms[roomID].Config[key] = newValue
				// 	}

				// 	responseJSON, err := json.Marshal(dataMap["config"])
				// 	if err != nil {
				// 		log.Println("Error al convertir a JSON:", err)
				// 	}

				// 	for _, client := range proyect.Active {
				// 		err = client.WriteMessage(websocket.TextMessage, []byte(responseJSON))
				// 		log.Println(string(responseJSON))
				// 		if err != nil {
				// 			log.Println(err)
				// 		}
				// 	}
				// }

				//if dataMap["action"] == "añadir" {
				// 	id := int(dataMap["id"].(float64))
				// 	log.Printf("Añadiendo capa %s", string(rune(id)))
				// 	if undo {
				// 		temp := make(map[string]interface{})
				// 		temp["action"] = "delete"
				// 		temp["id"] = float64(id)

				// 		rooms[roomID].Temp.Push(temp)
				// 	}

				// 	rooms[roomID].Data = append(rooms[roomID].Data, dataMap)

				// 	jsonBytes, err := json.Marshal(dataMap)
				// 	if err != nil {
				// 		log.Fatalf("Error al convertir el mapa a JSON: %v", err)
				// 	}

				// 	for _, client := range proyect.Active {
				// 		err = client.WriteMessage(websocket.TextMessage, jsonBytes)
				// 		if err != nil {
				// 			log.Println(err)
				// 		}
				// 	}

				// idPolygon := int(dataMap["id"].(float64))

				// if val, ok := dataMap["id"]; ok && val != nil {
				// 	idPolygon := int(val.(float64))
				// 	XPolygon := dataMap["x"].(float64)
				// 	YPolygon := dataMap["y"].(float64)
				// 	height := dataMap["height"].(float64)
				// 	width := dataMap["width"].(float64)

				// 	log.Println("agregar")

				// 	type Property struct {
				// 		Content  string
				// 		Optional bool
				// 		Vertical bool
				// 	}

				// 	initialTexts := map[string]Property{
				// 		"Arcilla-Limo-Arena-Grava": {Content: "vacío", Optional: false, Vertical: false},
				// 		"Sistema":                  {Content: "vacío", Optional: true, Vertical: true},
				// 		"Edad":                     {Content: "vacío", Optional: true, Vertical: true},
				// 		"Formación":                {Content: "vacío", Optional: true, Vertical: true},
				// 		"Miembro":                  {Content: "vacío", Optional: true, Vertical: true},
				// 		"Facie":                    {Content: "vacío", Optional: true, Vertical: false},
				// 		"Ambiente depositacional":  {Content: "vacío", Optional: true, Vertical: false},
				// 		"Descripción":              {Content: "vacío", Optional: true, Vertical: false},
				// 	}

				// 	type Circle struct {
				// 		X       float64
				// 		Y       float64
				// 		Radius  float64
				// 		Movable bool
				// 	}

				// 	Define la estructura para un Polígono.
				// 	type Polygon struct {
				// 		X           float64
				// 		Y           float64
				// 		ColorFill   string
				// 		ColorStroke string
				// 		Zoom        float64
				// 		Rotation    float64
				// 		Tension     float64
				// 		File        int
				// 		FileOption  int
				// 		Height      float64
				// 		Circles     []Circle
				// 	}

				// 	Define la estructura principal.
				// 	type Shape struct {
				// 		Id      int
				// 		Polygon Polygon
				// 		Text    map[string]Property
				// 	}

				// 	newShape := Shape{
				// 		Id: idPolygon, // numero de fila
				// 		Polygon: Polygon{
				// 			X:           0,
				// 			Y:           0,
				// 			ColorFill:   "white",
				// 			ColorStroke: "black",
				// 			Zoom:        100,
				// 			Rotation:    0,
				// 			Tension:     0.5,
				// 			File:        0,
				// 			FileOption:  0,
				// 			Height:      100,
				// 			Circles: []Circle{
				// 				{X: XPolygon, Y: YPolygon, Radius: 5, Movable: false},
				// 				{X: XPolygon + width, Y: YPolygon, Radius: 5, Movable: true},
				// 				{X: XPolygon + width, Y: YPolygon + height, Radius: 5, Movable: true},
				// 				{X: XPolygon, Y: YPolygon + height, Radius: 5, Movable: false},
				// 			},
				// 		},
				// 		Text: initialTexts,
				// 	}
				// 	jsonBytes, err := json.Marshal(newShape)
				// 	if err != nil {
				// 		log.Fatalf("Error al convertir el mapa a JSON: %v", err)
				// 	}

				// 	for _, client := range proyect.Active {
				// 		err = client.WriteMessage(websocket.TextMessage, jsonBytes)
				// 		if err != nil {
				// 			log.Println(err)
				// 		}
				// 	}
				// 	} else {
				// 		// Manejar el error o el caso de valor nulo
				// 		log.Println(val, ok)
				// 	}

				// }

				// if dataMap["action"] == "save" {
				// 	log.Println("guardando...")
				// 	err = a.serv.SaveRoom(ctx, rooms[roomID].Data, rooms[roomID].Config, roomID)
				// 	if err != nil {
				// 		log.Println("No se guardo la data")
				// 	}
				// }

				// if dataMap["action"] == "height" {
				// 	id := int(dataMap["id"].(float64)) // id de la capa seleccionada

				// 	log.Println("id", id)

				// 	circlesp, err := json.Marshal(dataMap["circles"]) // trasforma el datamap a json

				// 	log.Println("circles", string(circlesp))
				// 	fmt.Print(circlesp)

				// 	newHeight := int(dataMap["newHeight"].(float64))

				// 	log.Println(newHeight, err)
				// 	//log.Println(id, "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")

				// 	//rooms[roomName].Data = append(rooms[roomName].Data[:id], rooms[roomName].Data[id+1:]...)// todos los shapes

				// 	updatedShapes := rooms[roomID].Data // Copia de la data de la sala
				// 	//updatedShapes := append(rooms[roomName].Data)

				// 	for _, shape := range rooms[roomID].Data {

				// 		shap := make(map[string]interface{})
				// 		cu, err := json.Marshal(shape["polygon"])
				// 		json.Unmarshal(cu, &shap)
				// 		log.Println(shap["y1"], err)
				// 		deltaY := newHeight - (int(shap["y2"].(float64)) - int(shap["y1"].(float64)))

				// 		var cir []circle
				// 		json.Unmarshal([]byte(circlesp), &cir)

				// 		// Modifica el tamaño de la capa seleccionada
				// 		if shap["id"] == id {
				// 			newY2 := int(shap["y1"].(float64)) + newHeight
				// 			if newY2 < int(shap["y2"].(float64)) {
				// 				var filteredCircles []any

				// 				for i, circle := range cir {
				// 					if i < 2 || i >= len(cir)-2 || circle.y <= newY2 {
				// 						filteredCircles = append(filteredCircles, circle)
				// 					}
				// 				}

				// 				shap["y2"] = newY2
				// 				cir, err := json.Marshal(filteredCircles)
				// 				log.Println(cir, err)
				// 			} else {
				// 				shap["y2"] = newY2
				// 			}

				// 			//Modifica las coordenadas de las capas que estan debajo de la seleccionada
				// 		} else if int(shap["y1"].(float64)) >= int(shap["y2"].(float64)) {
				// 			shap["y1"] = int(shap["y1"].(float64)) + deltaY
				// 			shap["y2"] = int(shap["y2"].(float64)) + deltaY
				// 		}
				// 		updatedShapes = append(updatedShapes, shap)
				// 		rooms[roomID].Data = updatedShapes
				// 		//log.Println(rooms[roomName].Data, "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb")
				// 	}
				// 	//err = a.serv.SaveRoom(ctx, rooms[roomName].Data, rooms[roomName].Config, roomName)
				// 	if err != nil {
				// 		log.Println("No se guardo la data")
				// 	}
				// }
			} else {
				errMessage := "Error: Don't have permission to edit this document"
				conn.WriteMessage(websocket.TextMessage, []byte(errMessage))
			}
		}
	}

	conn.Close()

	RemoveElement(roomID, conn)
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
	//value, exists := proyect.Clients[user]
	value, exists := a.serv.GetPermission(ctx, user, room)
	if value == -1 {
		log.Println(exists)
		log.Println("no forma parte de la sala")
		return c.JSON(http.StatusForbidden, responseMessage{Message: "Unauthorized"})
	} else if value != 0 {
		log.Println("no eres admin")
		return c.JSON(http.StatusForbidden, responseMessage{Message: "Unauthorized"})
	}

	//agregar el usuario al room
	//	proyect.Clients[inviteRequest.Email] = models.Role(inviteRequest.Role)
	info, err := a.serv.GetRoomInfo(ctx, room)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, responseMessage{Message: "Failed to get room info"})
	}
	info.Members[inviteRequest.Email] = inviteRequest.Role

	err = a.serv.AddUser(ctx, inviteRequest.Email, room) //actualizar el registro de usuario
	if err != nil {
		return c.JSON(http.StatusInternalServerError, responseMessage{Message: "Failed to save room"})
	}
	err = a.serv.SaveUsers(ctx, info)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, responseMessage{Message: "Failed to save room"})
	}

	return c.JSON(http.StatusOK, responseMessage{Message: "User invited successfully"})
}

func instanceRoom(Id_project primitive.ObjectID, Data []map[string]interface{}, Config map[string]interface{}, Fosil map[string]interface{}) *RoomData {

	projectIDString := Id_project.Hex()
	room, exists := rooms[projectIDString]
	//room, exists := rooms[Id_project] //instancia el room con los datos de la bd
	if !exists {

		for _, element := range Data {
			data := element["Litologia"].(map[string]interface{})
			circles := make([]map[string]interface{}, 0) // Create an empty slice to store the circles

			for _, c := range data["circles"].(primitive.A) {
				circle := c.(map[string]interface{})
				circles = append(circles, circle)
			}

			data["circles"] = circles
		}

		var sectionsEditing map[string]interface{}
		userColors := make(map[string]string)

		room = &RoomData{
			Id_project:      Id_project,
			Data:            Data,
			Config:          Config,
			Fosil:           Fosil,
			Active:          make([]*websocket.Conn, 0),
			SectionsEditing: sectionsEditing,
			UserColors:      userColors,
		}

		rooms[projectIDString] = room
	}

	return room
}

func (a *API) HandleCreateProyect(c echo.Context) error {

	ctx := c.Request().Context()
	cookie, err := c.Cookie("Authorization")

	//Revisa si existe el token
	if err != nil {
		log.Println(err)
		return c.JSON(http.StatusUnauthorized, responseMessage{Message: "Unauthorized"})
	}

	// Si existe, revisa si es valido
	claims, err := encryption.ParseLoginJWT(cookie.Value)
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

	// DELETEABLE
	// participantsRequest := new(dtos.CreateProjectRequest)
	// log.Println(participantsRequest)

	// //validar mas datos
	// if err := c.Bind(participantsRequest); err != nil {
	// 	log.Println(err)
	// 	return c.JSON(http.StatusBadRequest, responseMessage{Message: "Invalid request"})
	// }
	// participantMap := make(map[string]models.Role)

	// for _, participant := range participantsRequest.Participants {
	// 	participantMap[participant.Email] = models.Role(participant.Role)
	// }
	// log.Println(participantMap)
	// DELETEABLE

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
	_, err := c.Cookie("Authorization")

	if err != nil {
		log.Println(err)
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
		return nil, errors.New("la pila esta vacia")
	}
	index := len(*s) - 1
	element := (*s)[index]
	*s = (*s)[:index]

	return element, nil
}
