package main

import (
	"encoding/json"
	"os"
)

type DrillSize struct {
	Width  int `json:"width"`
	Height int `json:"height"`
}

type Drill struct {
	Name  string    `json:"Name"`
	Price int       `json:"Price"`
	Rate  int       `json:"rate"`
	Size  DrillSize `json:"size"`
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
	data, err := os.ReadFile("data.json")
	if err != nil {
		return err
	}

	var gameData GameData
	err = json.Unmarshal(data, &gameData)
	if err != nil {
		return err
	}

	Drills = []Drill{}
	for _, drillData := range gameData.Drills {
		drill := Drill{
			Name:  drillData["name"].(string),
			Price: int(drillData["price"].(float64)),
			Rate:  int(drillData["rate"].(float64)),
			Size: DrillSize{
				Width:  int(drillData["width"].(float64)),
				Height: int(drillData["height"].(float64)),
			},
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
	data, err := os.ReadFile("data.json")
	if err != nil {
		return GameData{}, err
	}

	var gameData GameData
	err = json.Unmarshal(data, &gameData)
	return gameData, err
}
