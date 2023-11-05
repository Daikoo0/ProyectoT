package encryption

import (
	//"fmt"

	"github.com/ProyectoT/api/internal/models"
	"github.com/golang-jwt/jwt/v4"
)

func SignedLoginToken(u *models.User) (string, error) { //JWT
	// Se genera el token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{ //HS256 validacion unidireccional
		"email": u.Email,
		"name":  u.Name,
	})
	//fmt.Print(u.Email)
	return token.SignedString([]byte(key)) // Se firma el token con la llave
}

func ParseLoginJWT(value string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(value, func(token *jwt.Token) (interface{}, error) {
		return []byte(key), nil
	})

	if err != nil {
		return nil, err
	}
	//fmt.Print(token)
	return token.Claims.(jwt.MapClaims), nil
}
