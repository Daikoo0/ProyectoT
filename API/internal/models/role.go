package models

type Role int

const (
	Owner Role = iota
	Editor
	Reader
)