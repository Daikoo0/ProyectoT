package settings

import (
	_ "embed"

	"gopkg.in/yaml.v3"
)

//go:embed settings.yaml
var settingsFile []byte

type Settings struct{
	Port string `yaml:"port"`
	DB string `yaml:"database"`
	Name string `yaml:"dbname"`
	Key string `yaml:"key"`
}
func New() (*Settings, error){
	var s Settings

	err := yaml.Unmarshal(settingsFile, &s)
	if err != nil{
		return nil, err
	}
	return &s, nil
}