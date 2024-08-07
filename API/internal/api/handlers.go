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
	Facies          map[string][]models.FaciesSection
	Fosil           map[string]interface{}
	Active          []*websocket.Conn
	SectionsEditing map[string]interface{}
	UserColors      map[string]string
	Changes         []Change
}

var rooms = make(map[string]*RoomData)

var roomTimers = make(map[string]*time.Timer)
var roomActions = make(map[string]int)

var roomActionsThreshold = 10

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
								err = a.serv.SaveRoom(context.Background(), rooms[roomID].Data, rooms[roomID].Config, rooms[roomID].Fosil, roomID, rooms[roomID].Facies)
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
									err = a.serv.SaveRoom(context.Background(), rooms[roomID].Data, rooms[roomID].Config, rooms[roomID].Fosil, roomID, rooms[roomID].Facies)
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

					añadir(proyect, dataMap, models.NewShape())

				case "addCircle":

					addCircle(proyect, dataMap)

				case "addFosil":

					addFosil(proyect, dataMap)

				case "addFacie":

					addFacie(proyect, dataMap)

				case "addFacieSection":

					addFacieSection(proyect, dataMap)

				case "editCircle":

					editCircle(proyect, dataMap)

				case "editText":

					editText(proyect, dataMap)

				case "editPolygon":

					editPolygon(proyect, dataMap)

				case "editFosil":

					editFosil(proyect, dataMap)

				case "delete":

					deleteRow(proyect, dataMap)

				case "deleteCircle":

					deleteCircle(proyect, dataMap)

				case "deleteFosil":

					deleteFosil(proyect, dataMap)

				case "deleteFacie":

					deleteFacie(proyect, dataMap)

				case "deleteFacieSection":

					deleteFacieSection(proyect, dataMap)

				case "isInverted":

					isInverted(proyect, dataMap)

				case "save":

					a.save(proyect, roomID)

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

func instanceRoom(Id_project primitive.ObjectID, Data []models.DataInfo, Config map[string]interface{}, Fosil map[string]interface{}, Facies map[string][]models.FaciesSection) *RoomData {

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

func (a *API) HandleGetActiveProject(c echo.Context) error {

	var keys []string

	for key := range rooms {
		keys = append(keys, key)
	}

	return c.JSON(http.StatusOK, keys)
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

func añadir(project *RoomData, dataMap GeneralMessage, newShape models.DataInfo) {

	var addData dtos.Add
	err := json.Unmarshal(dataMap.Data, &addData)
	if err != nil {
		log.Println("Error al deserializar: ", err)
		return
	}

	rowIndex := addData.RowIndex
	height := addData.Height

	var index int

	if rowIndex == -1 { // al final
		index = len(project.Data)

	} else { //  índice encontrado
		index = rowIndex
	}

	if index-1 >= 0 && index-1 < len(project.Data) {
		newShape.Litologia.PrevContact = project.Data[index-1].Litologia.Contact

	}

	if index < len(project.Data) {
		project.Data[index].Litologia.PrevContact = newShape.Litologia.Contact

		msgData := map[string]interface{}{
			"action":   "editPolygon",
			"rowIndex": index,
			"key":      "PrevContact",
			"value":    newShape.Litologia.Contact,
		}

		sendSocketMessage(msgData, project, "editPolygon")

	}

	newShape.Litologia.Height = height

	if rowIndex == -1 { // Agrega al final
		project.Data = append(project.Data, newShape)

		msgData := map[string]interface{}{
			"action": "añadirEnd",
			"value":  newShape,
		}

		sendSocketMessage(msgData, project, "añadir")

	} else { // Agrega en el índice encontrado
		project.Data = append(project.Data[:rowIndex], append([]models.DataInfo{newShape}, project.Data[rowIndex:]...)...)

		msgData := map[string]interface{}{
			"action":   "añadir",
			"rowIndex": rowIndex,
			"value":    newShape,
		}

		sendSocketMessage(msgData, project, "añadir")

	}

}

func deleteRow(project *RoomData, dataMap GeneralMessage) {

	var deleteData dtos.Delete
	err := json.Unmarshal(dataMap.Data, &deleteData)
	if err != nil {
		log.Println("Error al deserializar: ", err)
		return
	}

	rowIndex := deleteData.RowIndex

	if rowIndex < 0 || rowIndex >= len(project.Data) {
		log.Println("Índice fuera de los límites")
		return
	}

	if rowIndex+1 < len(project.Data) {
		if rowIndex-1 >= 0 {
			project.Data[rowIndex+1].Litologia.PrevContact = project.Data[rowIndex-1].Litologia.Contact
		} else {
			project.Data[rowIndex+1].Litologia.PrevContact = "111"
		}

		msgData2 := map[string]interface{}{
			"action":   "editPolygon",
			"rowIndex": rowIndex + 1,
			"key":      "PrevContact",
			"value":    project.Data[rowIndex+1].Litologia.PrevContact,
		}
		sendSocketMessage(msgData2, project, "editPolygon")
	}

	project.Data = append(project.Data[:rowIndex], project.Data[rowIndex+1:]...)

	msgData := map[string]interface{}{
		"action":   "delete",
		"rowIndex": rowIndex,
	}
	sendSocketMessage(msgData, project, "delete")
}

func editText(project *RoomData, dataMap GeneralMessage) {

	var editTextData dtos.EditText
	err := json.Unmarshal(dataMap.Data, &editTextData)
	if err != nil {
		log.Println("Error al deserializar: ", err)
	}

	key := editTextData.Key
	value := editTextData.Value
	rowIndex := editTextData.RowIndex

	roomData := &project.Data[rowIndex]

	UpdateFieldAll(roomData, key, value)

	// Enviar informacion a los clientes
	msgData := map[string]interface{}{
		"action":   "editText",
		"key":      key,
		"value":    value,
		"rowIndex": rowIndex,
	}

	sendSocketMessage(msgData, project, "editText")

}

func editPolygon(project *RoomData, dataMap GeneralMessage) {

	var polygon dtos.EditPolygon
	err := json.Unmarshal(dataMap.Data, &polygon)
	if err != nil {
		log.Println("Error deserializando el polygon:", err)
		return
	}
	rowIndex := polygon.RowIndex
	column := polygon.Column
	value := polygon.Value

	roomData := &project.Data[rowIndex].Litologia

	UpdateFieldLit(roomData, column, value)

	msgData := map[string]interface{}{
		"action":   "editPolygon",
		"rowIndex": rowIndex,
		"key":      column,
		"value":    value,
	}

	if column == "Contact" && rowIndex+1 < len(project.Data) {

		project.Data[rowIndex+1].Litologia.PrevContact = value.(string)

		msgData2 := map[string]interface{}{
			"action":   "editPolygon",
			"rowIndex": rowIndex + 1,
			"key":      "PrevContact",
			"value":    value,
		}
		sendSocketMessage(msgData2, project, "editPolygon")
	}

	sendSocketMessage(msgData, project, "editPolygon")

}

func addCircle(project *RoomData, dataMap GeneralMessage) {

	var addCircleData dtos.AddCircle
	err := json.Unmarshal(dataMap.Data, &addCircleData)
	if err != nil {
		log.Println("Error al deserializar: ", err)
		return
	}

	rowIndex := addCircleData.RowIndex
	insertIndex := addCircleData.InsertIndex
	point := addCircleData.Point

	roomData := &project.Data[rowIndex].Litologia.Circles

	newCircle := models.CircleStruc{
		X:       0.5,
		Y:       point,
		Radius:  5,
		Movable: true,
		Name:    "none",
	}

	*roomData = append((*roomData)[:insertIndex], append([]models.CircleStruc{newCircle}, (*roomData)[insertIndex:]...)...)

	// Enviar informacion a los clientes
	msgData := map[string]interface{}{
		"action":   "addCircle",
		"rowIndex": rowIndex,
		"value":    roomData,
	}

	sendSocketMessage(msgData, project, "addCircle")

}

func deleteCircle(project *RoomData, dataMap GeneralMessage) {

	var deleteCircleData dtos.DeleteCircle
	err := json.Unmarshal(dataMap.Data, &deleteCircleData)
	if err != nil {
		log.Println("Error al deserializar: ", err)
		return
	}

	rowIndex := deleteCircleData.RowIndex
	deleteIndex := deleteCircleData.DeleteIndex

	roomData := &project.Data[rowIndex].Litologia.Circles

	*roomData = append((*roomData)[:deleteIndex], (*roomData)[deleteIndex+1:]...)

	msgData := map[string]interface{}{
		"action":   "addCircle",
		"rowIndex": rowIndex,
		"value":    roomData,
	}

	sendSocketMessage(msgData, project, "deleteCircle")

}

func editCircle(project *RoomData, dataMap GeneralMessage) {

	var editCircleData dtos.EditCircle
	err := json.Unmarshal(dataMap.Data, &editCircleData)
	if err != nil {
		log.Println("Error al deserializar: ", err)
		return
	}

	rowIndex := editCircleData.RowIndex
	editIndex := editCircleData.EditIndex
	x := editCircleData.X
	name := editCircleData.Name

	roomData := &project.Data[rowIndex].Litologia.Circles

	(*roomData)[editIndex].X = x
	(*roomData)[editIndex].Name = name

	msgData := map[string]interface{}{
		"action":   "addCircle",
		"rowIndex": rowIndex,
		"value":    roomData,
	}

	sendSocketMessage(msgData, project, "editCircle")

}

func addFosil(project *RoomData, dataMap GeneralMessage) {

	var fosil dtos.AddFosil
	err := json.Unmarshal(dataMap.Data, &fosil)
	if err != nil {
		log.Println("Error", err)
		return
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

	roomData := &project.Fosil
	(*roomData)[id] = newFosil

	msgData := map[string]interface{}{
		"action":  "addFosil",
		"idFosil": id,
		"value":   newFosil,
	}

	sendSocketMessage(msgData, project, "addFosil")

}

func deleteFosil(project *RoomData, dataMap GeneralMessage) {

	var fosilID dtos.DeleteFosil
	err := json.Unmarshal(dataMap.Data, &fosilID)
	if err != nil {
		log.Println("Error deserializando fósil:", err)
		return
	}

	id := fosilID.IdFosil

	roomData := &project.Fosil
	delete(*roomData, id)

	msgData := map[string]interface{}{
		"action":  "deleteFosil",
		"idFosil": id,
	}

	sendSocketMessage(msgData, project, "deleteFosil")

}

func editFosil(project *RoomData, dataMap GeneralMessage) {

	var fosilEdit dtos.EditFosil
	err := json.Unmarshal(dataMap.Data, &fosilEdit)
	if err != nil {
		log.Println("Error deserializando fósil:", err)
		return
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

	roomData := &project.Fosil
	(*roomData)[id] = newFosil

	msgData := map[string]interface{}{
		"action":  "editFosil",
		"idFosil": id,
		"value":   newFosil,
	}

	sendSocketMessage(msgData, project, "editFosil")

}

func addFacie(project *RoomData, dataMap GeneralMessage) {
	var facie dtos.Facie
	err := json.Unmarshal(dataMap.Data, &facie)
	if err != nil {
		log.Println("Error", err)
		return
	}

	name := facie.Facie

	if project.Facies == nil {
		project.Facies = make(map[string][]models.FaciesSection)
	}

	project.Facies[name] = []models.FaciesSection{}

	msgData := map[string]interface{}{
		"action": "addFacie",
		"facie":  name,
	}

	sendSocketMessage(msgData, project, "addFacie")

}

func deleteFacie(project *RoomData, dataMap GeneralMessage) {
	var facie dtos.Facie
	err := json.Unmarshal(dataMap.Data, &facie)
	if err != nil {
		log.Println("Error", err)
		return
	}

	id := facie.Facie

	roomData := &project.Facies
	delete(*roomData, id)

	msgData := map[string]interface{}{
		"action": "deleteFacie",
		"facie":  id,
	}

	sendSocketMessage(msgData, project, "deleteFacie")

}

func isInverted(project *RoomData, dataMap GeneralMessage) {

	var isInverted dtos.IsInverted
	err := json.Unmarshal(dataMap.Data, &isInverted)
	if err != nil {
		log.Println("Error deserializando columna:", err)
		return
	}

	project.Config["isInverted"] = isInverted.IsInverted

	msgData := map[string]interface{}{
		"action":     "isInverted",
		"isInverted": isInverted.IsInverted,
	}

	sendSocketMessage(msgData, project, "isInverted")

}

func (a *API) save(project *RoomData, roomID string) {

	err := a.serv.SaveRoom(context.Background(), project.Data, project.Config, project.Fosil, roomID, project.Facies)
	if err != nil {
		log.Println("No se guardo la data")
	}

}

func addFacieSection(project *RoomData, dataMap GeneralMessage) {
	var f dtos.AddFacieSection
	err := json.Unmarshal(dataMap.Data, &f)
	if err != nil {
		log.Println("Error", err)
		return
	}
	name := f.Facie
	y1 := f.Y1
	y2 := f.Y2

	innerMap := project.Facies[name]

	newSectionFacie := models.FaciesSection{
		Y1: y1,
		Y2: y2,
	}

	innerMap = append(innerMap, newSectionFacie)
	project.Facies[name] = innerMap

	msgData := map[string]interface{}{
		"action": "addFacieSection",
		"facie":  name,
		"y1":     y1,
		"y2":     y2,
	}

	sendSocketMessage(msgData, project, "addFacieSection")

}

func deleteFacieSection(project *RoomData, dataMap GeneralMessage) {
	var f dtos.DeleteFacieSection
	err := json.Unmarshal(dataMap.Data, &f)
	if err != nil {
		log.Println("Error", err)
		return
	}

	name := f.Facie
	index := f.Index

	innerMap := project.Facies[name]

	innerMap = append(innerMap[:index], innerMap[index+1:]...)

	project.Facies[name] = innerMap

	msgData := map[string]interface{}{
		"action": "deleteFacieSection",
		"facie":  name,
		"index":  index,
	}

	sendSocketMessage(msgData, project, "deleteFacieSection")

}
