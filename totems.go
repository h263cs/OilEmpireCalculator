package main

import "encoding/json"

type Totem struct {
	Name   string  `json:"name"`
	Price  int     `json:"price"`
	Boost  float64 `json:"boost"`
	Width  int     `json:"width"`
	Height int     `json:"height"`
}

var Totems = []Totem{}

type TotemGameData struct {
	Totems []map[string]interface{} `json:"totems"`
}

func init() {
	LoadTotems()
}

func LoadTotems() error {
	var gameData TotemGameData
	err := json.Unmarshal([]byte(dataContent), &gameData)
	if err != nil {
		return err
	}

	Totems = []Totem{}
	for _, t := range gameData.Totems {
		var name string
		if n, ok := t["name"]; ok && n != nil {
			name = n.(string)
		}
		var price int
		if p, ok := t["price"]; ok && p != nil {
			price = int(p.(float64))
		}
		var boost float64
		if b, ok := t["boost"]; ok && b != nil {
			boost = b.(float64)
		}
		var width, height int
		if w, ok := t["width"]; ok && w != nil {
			width = int(w.(float64))
		}
		if h, ok := t["height"]; ok && h != nil {
			height = int(h.(float64))
		}
		Totems = append(Totems, Totem{Name: name, Price: price, Boost: boost, Width: width, Height: height})
	}
	return nil
}

func GetAllTotems() []Totem {
	return Totems
}
