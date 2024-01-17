package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"

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

type RoomData struct {
	Id_project primitive.ObjectID
	Data       map[string]interface{}
	Config     map[string]interface{}
	Active     []*websocket.Conn
	Temp       Stack
}

//var rooms = make(map[string]*Room) //map temporal que almacena todas las salas activas

var rooms = make(map[string]*RoomData) //map temporal que almacena todas las salas activas

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

	// Setear la cookie
	cookie := &http.Cookie{
		Name:     "Authorization",
		Value:    token,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
		HttpOnly: true,
		Path:     "/",
		//Expires:  time.Now().Add(10 * time.Second), // tiempo de vida de la cookie
	}

	c.SetCookie(cookie)                                                // Setea la cookie en el navegador
	return c.JSON(http.StatusOK, map[string]string{"success": "true"}) // HTTP 200 OK
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
	room, err := a.serv.GetRoom(ctx, roomID)
	if err != nil {
		errMessage := "Error: Room not found"
		err = conn.WriteMessage(websocket.TextMessage, []byte(errMessage))
		conn.Close()
		return nil
	}

	permission, e := a.serv.GetPermission(ctx, user, roomID)
	if permission == -1 {
		log.Println(e)
		errMessage := "Error: Unauthorized"
		err = conn.WriteMessage(websocket.TextMessage, []byte(errMessage))
		conn.Close()
		return nil
	}

	objectID, err := primitive.ObjectIDFromHex(roomID)

	//conectar a la sala
	proyect := instanceRoom(objectID,
		room.Data,
		room.Config)
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
		"action": "data",
		"data":   proyect.Data,
		"config": claves,
	}
	// Trnasformar el mapa a JSON y envio a clientes
	databytes, err := json.Marshal(dataRoom)
	if err != nil {
		errMessage := "Error: cannot sent room config"
		conn.WriteMessage(websocket.TextMessage, []byte(errMessage))
	}
	conn.WriteMessage(websocket.TextMessage, databytes)

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
				var dataMap GeneralMessage
				err := json.Unmarshal([]byte(msg), &dataMap)
				//undo := true
				if err != nil {
					log.Println("le falta el id a la wea")
					log.Fatal(err)
				}

				log.Println(dataMap, "eeee") // Informacion recibida

				// Switch para las acciones
				switch dataMap.Action {
				case "añadir":

					var addData dtos.Add
					err := json.Unmarshal(dataMap.Data, &addData)
					if err != nil {
						log.Println("Error al deserializar: ", err)
					}

					rowIndex := addData.RowIndex
					height := addData.Height

					newShape := map[string]interface{}{
						"x":           0,
						"y":           0,
						"ColorFill":   "white",
						"colorStroke": "black",
						"zoom":        100,
						"rotation":    0,
						"tension":     0.5,
						"file":        0,
						"fileOption":  0,
						"height":      height,
						"circles": []map[string]interface{}{
							{"x": 0, "y": 0, "radius": 5, "movable": false},
							{"x": 0.5, "y": 0, "radius": 5, "movable": true},
							{"x": 0.5, "y": 1, "radius": 5, "movable": true},
							{"x": 0, "y": 1, "radius": 5, "movable": false},
						},
					}

					if rowIndex == -1 { // Agrega al final

						litologia := rooms[roomID].Data["Litologia"].(map[string]interface{})

						litologia[strconv.Itoa(len(litologia))] = newShape

						// Enviar informacion a los clientes
						msgData := map[string]interface{}{
							"action":   "añadirEnd",
							"rowIndex": len(litologia) - 1,
							"value":    newShape,
						}

						jsonBytes, err := json.Marshal(msgData)
						if err != nil {
							log.Fatalf("Error al convertir el mapa a JSON: %v", err)
						}

						for _, client := range proyect.Active {
							err = client.WriteMessage(websocket.TextMessage, jsonBytes)
							if err != nil {
								log.Println(err)
							}
						}

					} else { // Agrega en el índice encontrado
						InsertRowInLitologiaAndUpdateIndices(roomID, rowIndex, newShape)

						msgData := map[string]interface{}{
							"action": "añadir",
							"data":   rooms[roomID].Data,
						}

						jsonBytes, err := json.Marshal(msgData)
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

				case "delete":

					var deleteData dtos.Delete
					err := json.Unmarshal(dataMap.Data, &deleteData)
					if err != nil {
						log.Println("Error al deserializar: ", err)
					}

					rowIndex := deleteData.RowIndex

					// Eliminar el elemento en el índice encontrado
					RemoveRowAndUpdateIndices(roomID, rowIndex)

					// Para revisar:
					//rooms[roomID].Data["Litologia"] = append(rooms[roomID].Data["Litologia"][:rowIndex], rooms[roomID].Data["Litologia"][rowIndex+1:]...)

					msgData := map[string]interface{}{
						"action": "delete",
						"data":   rooms[roomID].Data,
					}

					jsonBytes, err := json.Marshal(msgData)
					if err != nil {
						log.Fatalf("Error al convertir el mapa a JSON: %v", err)
					}

					for _, client := range proyect.Active {
						err = client.WriteMessage(websocket.TextMessage, jsonBytes)
						if err != nil {
							log.Println(err)
						}
					}

				case "addCircle":

					var addCircleData dtos.AddCircle
					err := json.Unmarshal(dataMap.Data, &addCircleData)
					if err != nil {
						log.Println("Error al deserializar: ", err)
					}

					rowIndex := addCircleData.RowIndex
					newCircle := addCircleData.NewCircle

					litologia := rooms[roomID].Data["Litologia"].(map[string]interface{})

					// Agregar el nuevo círculo
					innerMap := litologia[strconv.Itoa(rowIndex)].(map[string]interface{})
					innerMap["circles"] = newCircle

					// Enviar informacion a los clientes
					msgData := map[string]interface{}{
						"action":    "addCircle",
						"rowIndex":  rowIndex,
						"newCircle": newCircle,
					}

					jsonMsg, err := json.Marshal(msgData)
					if err != nil {
						log.Fatalf("Error al convertir el mapa a JSON: %v", err)
					}

					for _, client := range proyect.Active {
						err = client.WriteMessage(websocket.TextMessage, jsonMsg)
						if err != nil {
							log.Println(err)
						}
					}

				// Edicion de texto
				case "editText":

					var editTextData dtos.EditText
					err := json.Unmarshal(dataMap.Data, &editTextData)
					if err != nil {
						log.Println("Error")
					}

					key := editTextData.Key
					value := editTextData.Value
					rowIndex := editTextData.RowIndex

					//Modificamos el valor del texto, en rooms
					innerMap := rooms[roomID].Data[key].(map[string]interface{})
					innerMap[strconv.Itoa(rowIndex)] = value

					// Enviar informacion a los clientes
					msgData := map[string]interface{}{
						"action":   "editText",
						"key":      key,
						"value":    value,
						"rowIndex": rowIndex,
					}

					jsonMsg, err := json.Marshal(msgData)
					if err != nil {
						log.Fatal(err)
					}

					for _, client := range proyect.Active {
						err = client.WriteMessage(websocket.TextMessage, jsonMsg)
						if err != nil {
							log.Println(err)
						}
					}

				case "addFosil":
					var fosil dtos.Fosil
					err := json.Unmarshal(dataMap.Data, &fosil)
					if err != nil {
						log.Println("Error", err)
					}

					upper := fosil.UpperLimit
					lower := fosil.LowerLimit
					posImage := (lower + upper) / 2
					srcFosil := fosil.SelectedFossil
					relativeX := fosil.RelativeX

					innerMap := rooms[roomID].Data["Estructura fosil"].(primitive.A)

					concatenatedInt, err := strconv.Atoi(strconv.Itoa(posImage) + strconv.Itoa(relativeX))
					if err != nil {
						log.Println("Error al convertir la cadena a entero:", err)
					}

					// Enviar informacion a los clientes
					msgData := map[string]interface{}{
						"action":        "addFosil",
						"idFosil":       concatenatedInt,
						"posImage":      posImage,
						"lower":         lower,
						"upper":         upper,
						"selectedFosil": srcFosil,
						"relativeX":     relativeX,
					}

					innerMap = append(innerMap, msgData)
					rooms[roomID].Data["Estructura fosil"] = innerMap

					jsonMsg, err := json.Marshal(msgData)
					if err != nil {
						log.Fatal(err)
					}

					for _, client := range proyect.Active {
						err = client.WriteMessage(websocket.TextMessage, jsonMsg)
						if err != nil {
							log.Println(err)
						}
					}

				case "save":
					log.Println("guardando...")
					err = a.serv.SaveRoom(ctx, rooms[roomID].Data, rooms[roomID].Config, roomID)
					if err != nil {
						log.Println("No se guardo la data")
					}

				case "editFosil":
					var fosilEdit dtos.EditFosil
					err := json.Unmarshal(dataMap.Data, &fosilEdit)
					if err != nil {
						log.Println("Error deserializando fósil:", err)
						break
					}

					idFosilEdit := fosilEdit.IdFosil
					innerMap := rooms[roomID].Data["Estructura fosil"].(primitive.A)
					var newInnerMap primitive.A
					// Eliminar el fósil antiguo
					for _, item := range innerMap {
						fosilMap := item.(map[string]interface{})
						elid := int(fosilMap["idFosil"].(int))
						if elid != idFosilEdit {
							newInnerMap = append(newInnerMap, fosilMap)
						}
					}

					// Agregar el nuevo fósil
					posImage := (fosilEdit.LowerLimit + fosilEdit.UpperLimit) / 2
					concatenatedInt, err := strconv.Atoi(strconv.Itoa(posImage) + strconv.Itoa(fosilEdit.RelativeX))
					if err != nil {
						log.Println("Error al convertir la cadena a entero:", err)
					}

					msgData := map[string]interface{}{
						"action":        "editFosil",
						"idFosil":       concatenatedInt,
						"posImage":      posImage,
						"lower":         fosilEdit.LowerLimit,
						"upper":         fosilEdit.UpperLimit,
						"selectedFosil": fosilEdit.SelectedFossil,
						"relativeX":     fosilEdit.RelativeX,
					}

					newInnerMap = append(newInnerMap, msgData)
					rooms[roomID].Data["Estructura fosil"] = newInnerMap

					// Enviar información actualizada a los clientes
					jsonMsg, err := json.Marshal(msgData)
					if err != nil {
						log.Fatal("Error al serializar mensaje:", err)
					}

					for _, client := range proyect.Active {
						err = client.WriteMessage(websocket.TextMessage, jsonMsg)
						if err != nil {
							log.Println("Error al enviar mensaje:", err)
						}
					}

				case "deleteFosil":
					var fosilID dtos.DeleteFosil
					err := json.Unmarshal(dataMap.Data, &fosilID)
					if err != nil {
						log.Println("Error deserializando fósil:", err)
						break
					}

					innerMap := rooms[roomID].Data["Estructura fosil"].(primitive.A)
					var newInnerMap primitive.A

					for _, item := range innerMap {
						fosilMap := item.(map[string]interface{})
						elid := int(fosilMap["idFosil"].(int))
						if elid != fosilID.IdFosil {
							newInnerMap = append(newInnerMap, fosilMap)
						}
					}
					rooms[roomID].Data["Estructura fosil"] = newInnerMap

					msgData := map[string]interface{}{
						"action":  "deleteFosil",
						"idFosil": fosilID,
					}

					// Enviar información actualizada a los clientes
					jsonMsg, err := json.Marshal(msgData)
					if err != nil {
						log.Fatal("Error al serializar mensaje:", err)
					}

					for _, client := range proyect.Active {
						err = client.WriteMessage(websocket.TextMessage, jsonMsg)
						if err != nil {
							log.Println("Error al enviar mensaje:", err)
						}
					}

				case "columns":
					var column dtos.Column
					err := json.Unmarshal(dataMap.Data, &column)
					if err != nil {
						log.Println("Error deserializando fósil:", err)
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

					jsonMsg, err := json.Marshal(msgData)
					if err != nil {
						log.Fatal("Error al serializar mensaje:", err)
					}

					for _, client := range proyect.Active {
						err = client.WriteMessage(websocket.TextMessage, jsonMsg)
						if err != nil {
							log.Println("Error al enviar mensaje:", err)
						}
					}
				}

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
				err = conn.WriteMessage(websocket.TextMessage, []byte(errMessage))
			}
		}
	}

	conn.Close()
	RemoveElement(roomID, conn)
	return nil
}

func RemoveRowAndUpdateIndices(roomID string, rowIndex int) {
	roomData, exists := rooms[roomID]
	if !exists {
		fmt.Println("Room not found")
		return
	}

	for key, value := range roomData.Data {

		if key == "Estructura fosil" {
			continue
		}

		innerMap, ok := value.(map[string]interface{})
		if !ok {
			fmt.Println("Invalid data type for key:", key)
			continue
		}

		newMap := make(map[string]interface{})

		// Elimina el elemento en rowIndex y actualiza los índices de los elementos restantes
		for k, v := range innerMap {
			i, err := strconv.Atoi(k)
			if err != nil {
				fmt.Println("Invalid key type, expected integer:", k)
				continue
			}

			if i == rowIndex {
				// No incluir este elemento
				continue
			}

			if i > rowIndex {
				newMap[strconv.Itoa(i-1)] = v
			} else {
				newMap[k] = v
			}
		}

		roomData.Data[key] = newMap
	}
}

func InsertRowInLitologiaAndUpdateIndices(roomID string, rowIndex int, newLitologiaData interface{}) {
	roomData, exists := rooms[roomID]
	if !exists {
		fmt.Println("Room not found")
		return
	}

	// Procesa la clave "Litologia" de manera especial
	if litologia, ok := roomData.Data["Litologia"].(map[string]interface{}); ok {
		// Desplaza los elementos existentes en "Litologia" para hacer espacio para el nuevo
		for i := len(litologia) - 1; i >= rowIndex; i-- {
			litologia[strconv.Itoa(i+1)] = litologia[strconv.Itoa(i)]
		}
		// Inserta los nuevos datos en "Litologia"
		litologia[strconv.Itoa(rowIndex)] = newLitologiaData
	} else {
		fmt.Println("Litologia data not found or invalid type")
	}

	// Para todas las otras claves, solo mueve los índices
	for key, value := range roomData.Data {
		// Ignora "Litologia" y "Estructura fosil"
		if key == "Litologia" || key == "Estructura fosil" {
			continue
		}

		innerMap, ok := value.(map[string]interface{})
		if !ok {
			fmt.Println("Invalid data type for key:", key)
			continue
		}

		newMap := make(map[string]interface{})

		// Recorre el mapa original
		for k, v := range innerMap {
			i, err := strconv.Atoi(k)
			if err != nil {
				fmt.Println("Invalid key type, expected integer:", k)
				continue
			}

			if i >= rowIndex {
				newMap[strconv.Itoa(i+1)] = v
			} else {
				newMap[k] = v
			}
		}

		roomData.Data[key] = newMap

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

func instanceRoom(Id_project primitive.ObjectID,
	Data map[string]interface{},
	Config map[string]interface{}) *RoomData {

	projectIDString := Id_project.Hex()

	room, exists := rooms[projectIDString]

	//room, exists := rooms[Id_project] //instancia el room con los datos de la bd
	if !exists {
		room = &RoomData{
			Id_project: Id_project,
			Data:       Data,
			Config:     Config,
			Active:     make([]*websocket.Conn, 0),
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

	type responseProyects struct {
		Proyects []string
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
		return nil, errors.New("La pila esta vacia")
	}
	index := len(*s) - 1
	element := (*s)[index]
	*s = (*s)[:index]

	return element, nil
}
