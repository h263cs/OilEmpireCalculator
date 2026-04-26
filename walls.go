package main

import (
	"encoding/json"
)

type Wall struct {
	Price     int     `json:"price"`
	CashBoost float64 `json:"cash_boost"`
}

var Walls = []Wall{}

type WallGameData struct {
	Walls []map[string]interface{} `json:"walls"`
}

func init() {
	LoadWalls()
}

func LoadWalls() error {
	var gameData WallGameData
	err := json.Unmarshal([]byte(dataContent), &gameData)
	if err != nil {
		return err
	}

	Walls = []Wall{}
	for _, wallData := range gameData.Walls {
		var price int
		if p, ok := wallData["price"]; ok && p != nil {
			price = int(p.(float64))
		}

		var cashBoost float64
		if cb, ok := wallData["cash_boost"]; ok && cb != nil {
			cashBoost = cb.(float64)
		}

		wall := Wall{
			Price:     price,
			CashBoost: cashBoost,
		}
		Walls = append(Walls, wall)
	}

	return nil
}

func GetAllWalls() []Wall {
	return Walls
}
