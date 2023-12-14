package models

type Room struct {
	Name    string
	Clients map[string]Role
	Data    []map[string]interface{}
	Config  map[string]interface{}
}

type Data struct {
	Name    string
	Owner   string
	Members map[string]interface{}
	CreationDate string
	Description string
	Location string
	Lat float64
	Long float64
	Visible bool
}
