package main

import (
	"encoding/json"
	_ "embed"
)

//go:embed data.json
var dataContent string

type Drill struct {
	Name     string  `json:"name"`
	Price    int     `json:"price,omitempty"`
	DropRate float64 `json:"drop_rate,omitempty"`
	Rate     int     `json:"rate"`
	Width    int     `json:"width"`
	Height   int     `json:"height"`
}

type GameData struct {
	Drills    []map[string]interface{} `json:"drills"`
	Refineries []map[string]interface{} `json:"refineries"`
	Totems    []map[string]interface{} `json:"totems"`
	Misc      []map[string]interface{} `json:"misc"`
}

var Drills = []Drill{}

func init() {
	LoadDrills()
}

func LoadDrills() error {
	var gameData GameData
	err := json.Unmarshal([]byte(dataContent), &gameData)
	if err != nil {
		return err
	}

	Drills = []Drill{}
	for _, drillData := range gameData.Drills {
		// Safely convert price if it exists
		var price int
		if p, ok := drillData["price"]; ok && p != nil {
			price = int(p.(float64))
		}

		// Safely convert drop_rate if it exists
		var dropRate float64
		if d, ok := drillData["drop_rate"]; ok && d != nil {
			dropRate = d.(float64)
		}

		drill := Drill{
			Name:     drillData["name"].(string),
			Price:    price,
			DropRate: dropRate,
			Rate:     int(drillData["rate"].(float64)),
			Width:    int(drillData["width"].(float64)),
			Height:   int(drillData["height"].(float64)),
		}
		Drills = append(Drills, drill)
	}

	return nil
}

func GetDrill(name string) Drill {
	for _, d := range Drills {
		if d.Name == name {
			return d
		}
	}
	return Drill{}
}

func LoadGameData() (GameData, error) {
	var gameData GameData
	err := json.Unmarshal([]byte(dataContent), &gameData)
	return gameData, err
}
