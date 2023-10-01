package encryption

import (
	"github.com/ProyectoT/api/internal/models"
	"github.com/golang-jwt/jwt/v4"
)

func SignedLoginToken(u *models.User) (string, error) { //JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{ //HS256 validacion unidireccional
		"email": u.Email,
		"name":  u.Name,
	})

	return token.SignedString([]byte(key))
}

func ParseLoginJWT(value string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(value, func(token *jwt.Token) (interface{}, error) {
		return []byte(key), nil
	})

	if err != nil {
		return nil, err
	}

	return token.Claims.(jwt.MapClaims), nil
}