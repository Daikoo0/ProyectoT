package api

import (
	"fmt"
	"strings"
	"time"
)

func MakeChange(changes []*Change, data map[string]interface{}, actionType, key string, newValue interface{}) {
	oldValue, _ := GetValueByKeyPath(data, key)

	if len(changes) >= 10 {
		changes = changes[1:]
	}
	//changes = append(changes, Change{actionType, key, oldValue, newValue, time.Now()})
	changes = append(changes, &Change{actionType, key, oldValue, newValue, time.Now()})

}

func GetIndexFromKey(key string) (int, error) {
	var index int
	n, err := fmt.Sscanf(key, "[%d]", &index)
	if n != 1 || err != nil {
		return 0, fmt.Errorf("invalid index")
	}
	return index, nil
}

// Obtiene el valor de un campo en un objeto JSON a partir de un path
func GetValueByKeyPath(data interface{}, path string) (interface{}, error) {
	keys := strings.Split(path, ".")
	current := data

	for _, key := range keys {
		switch current.(type) {
		case map[string]interface{}:
			current = current.(map[string]interface{})[key]
		case []map[string]interface{}:
			index, err := GetIndexFromKey(key)
			if err != nil {
				return nil, err
			}
			arr := current.([]map[string]interface{})
			if index >= len(arr) {
				return nil, fmt.Errorf("index out of range")
			}
			current = arr[index]
		default:
			return nil, fmt.Errorf("invalid data type")
		}
	}
	fmt.Println(current)
	return current, nil
}

// Añade un valor a un campo en un objeto JSON a partir de un path
func AddValueAtKeyPath(data map[string]interface{}, path string, newValue interface{}) error {
	keys := strings.Split(path, ".")
	lastKey := keys[len(keys)-1]

	if strings.HasPrefix(lastKey, "[") && strings.HasSuffix(lastKey, "]") {
		return AddValueAtKeyPathSlice(data, path, newValue)
	} else {
		return assignValueByKey(data, path, newValue)
	}
}

// Añade un valor a un campo slice en un objeto JSON a partir de un path
func AddValueAtKeyPathSlice(data map[string]interface{}, path string, newValue interface{}) error {
	keys := strings.Split(path, ".")
	var current interface{} = data
	var lastMap map[string]interface{} = nil
	var lastKey string

	for i, key := range keys {
		if i == len(keys)-1 { // última parte del camino
			if strings.HasPrefix(key, "[") && strings.HasSuffix(key, "]") {
				// Última parte es un índice de lista
				slice, ok := current.([]map[string]interface{})
				if !ok {
					return fmt.Errorf("expected a slice at the path: %s", path)
				}

				index, err := GetIndexFromKey(key)
				if err != nil {
					return err
				}
				if index < 0 || index > len(slice) {
					return fmt.Errorf("index out of range")
				}

				slice = append(slice, nil)
				copy(slice[index+1:], slice[index:])
				slice[index] = newValue.(map[string]interface{})

				if lastMap != nil {
					lastMap[lastKey] = slice
				}
				return nil
			} else {
				// Última parte es una nueva clave de mapa
				if lastMap == nil {
					return fmt.Errorf("path does not resolve to a map")
				}
				lastMap[key] = newValue
				return nil
			}
		}

		lastKey = key
		switch typed := current.(type) {
		case map[string]interface{}:
			lastMap = typed
			current = typed[key]
		case []map[string]interface{}:
			index, err := GetIndexFromKey(key)
			if err != nil {
				return err
			}
			if index < 0 || index >= len(typed) {
				return fmt.Errorf("index out of range")
			}
			current = typed[index]
		default:
			return fmt.Errorf("invalid data type in path: %s", path)
		}
	}

	return fmt.Errorf("path does not end with a slice or a valid map key")
}

func assignValueByKey(data interface{}, path string, value interface{}) error {
	keys := strings.Split(path, ".")
	current := data
	lastKey := keys[len(keys)-1]

	// Traverse the path until the second last key
	for _, key := range keys[:len(keys)-1] {
		switch current.(type) {
		case map[string]interface{}:
			// If the key does not exist, create a new map
			if current.(map[string]interface{})[key] == nil {
				current.(map[string]interface{})[key] = make(map[string]interface{})
			}
			current = current.(map[string]interface{})[key]
		case []map[string]interface{}:
			index, err := GetIndexFromKey(key)
			if err != nil {
				return err
			}
			arr := current.([]map[string]interface{})
			if index >= len(arr) {
				return fmt.Errorf("index out of range")
			}
			current = arr[index]
		default:
			return fmt.Errorf("invalid data type")
		}
	}

	// Check if the last key represents an index in a slice
	if index, err := GetIndexFromKey(lastKey); err == nil {
		arr := current.([]map[string]interface{})
		if index < len(arr) {
			arr[index] = value.(map[string]interface{})
		} else {
			return fmt.Errorf("index out of range")
		}
		return nil
	}

	// Set the value at the last key
	switch current.(type) {
	case map[string]interface{}:
		current.(map[string]interface{})[lastKey] = value
	default:
		return fmt.Errorf("invalid data type")
	}

	return nil
}

func DeleteValueKeyPath(data map[string]interface{}, path string) error {
	keys := strings.Split(path, ".")
	var current interface{} = data
	var lastMap map[string]interface{} = nil
	var lastKey string

	for i, key := range keys {
		if i == len(keys)-1 { // última parte del camino
			if lastMap == nil {
				return fmt.Errorf("invalid path: %s", path)
			}

			switch typed := current.(type) {
			case map[string]interface{}:
				delete(typed, key)
			case []map[string]interface{}:
				index, err := GetIndexFromKey(key)
				if err != nil {
					return err
				}
				if index < 0 || index >= len(typed) {
					return fmt.Errorf("index out of range")
				}
				typed = append(typed[:index], typed[index+1:]...)
				lastMap[lastKey] = typed
			default:
				return fmt.Errorf("invalid data type in path")
			}
			return nil
		}

		lastKey = key // Guardar la última clave válida antes de un slice
		switch typed := current.(type) {
		case map[string]interface{}:
			lastMap = typed
			current = typed[key]
		case []map[string]interface{}:
			index, err := GetIndexFromKey(key)
			if err != nil {
				return err
			}
			if index < 0 || index >= len(typed) {
				return fmt.Errorf("index out of range")
			}
			current = typed[index]
		default:
			return fmt.Errorf("invalid data type in path")
		}
	}

	return fmt.Errorf("path does not end with a slice")
}
