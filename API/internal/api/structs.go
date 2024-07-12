package api

import (
	"fmt"
	"reflect"

	"github.com/ProyectoT/api/internal/models"
)

func UpdateField(litologia *models.LitologiaStruc, field string, value interface{}) {
	structValue := reflect.ValueOf(litologia).Elem()
	structField := structValue.FieldByName(field)

	if !structField.IsValid() {
		fmt.Println("Campo no reconocido:", field)
		return
	}

	if !structField.CanSet() {
		fmt.Println("No se puede establecer el valor del campo:", field)
		return
	}

	val := reflect.ValueOf(value)
	if val.Type().ConvertibleTo(structField.Type()) {
		structField.Set(val.Convert(structField.Type()))
	} else {
		fmt.Printf("Valor inválido para %s: se esperaba %s pero se obtuvo %s\n", field, structField.Type(), val.Type())
	}
}

// func UpdateField(litologia *models.LitologiaStruc, field string, value interface{}) {
// 	switch field {
// 	case "ColorFill":
// 		if v, ok := value.(string); ok {
// 			litologia.ColorFill = v
// 		} else {
// 			fmt.Println("Valor inválido para ColorFill")
// 		}
// 	case "colorStroke":
// 		if v, ok := value.(string); ok {
// 			litologia.ColorStroke = v
// 		} else {
// 			fmt.Println("Valor inválido para ColorStroke")
// 		}
// 	case "zoom":
// 		if v, ok := value.(int); ok {
// 			litologia.Zoom = v
// 		} else {
// 			fmt.Println("Valor inválido para Zoom")
// 		}
// 	case "rotation":
// 		if v, ok := value.(int); ok {
// 			litologia.Rotation = v
// 		} else {
// 			fmt.Println("Valor inválido para Rotation")
// 		}
// 	case "tension":
// 		if v, ok := value.(float32); ok {
// 			litologia.Tension = v
// 		} else {
// 			fmt.Println("Valor inválido para Tension")
// 		}
// 	case "file":
// 		if v, ok := value.(string); ok {
// 			litologia.File = v
// 		} else {
// 			fmt.Println("Valor inválido para File")
// 		}
// 	case "height":
// 		if v, ok := value.(int); ok {
// 			litologia.Height = v
// 		} else {
// 			fmt.Println("Valor inválido para Height")
// 		}
// 	case "circles":
// 		if v, ok := value.([]models.CircleStruc); ok {
// 			litologia.Circles = v
// 		} else {
// 			fmt.Println("Valor inválido para Circles")
// 		}
// 	default:
// 		fmt.Println("Campo no reconocido")
// 	}
// }
