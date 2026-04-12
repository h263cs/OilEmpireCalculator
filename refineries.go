package main

type RefinerySize struct {
	Width  int `json:"width"`
	Height int `json:"height"`
}

type Refinery struct {
	Name    string       `json:"name"`
	Price   int          `json:"price"`
	Storage int          `json:"storage"`
	Size    RefinerySize `json:"size"`
}

var Refineries = []Refinery{}

func init() {
	LoadRefineries()
}

func LoadRefineries() error {
	gameData, err := LoadGameData()
	if err != nil {
		return err
	}

	Refineries = []Refinery{}
	for _, refineryData := range gameData.Refineries {
		refinery := Refinery{
			Name:    refineryData["name"].(string),
			Price:   int(refineryData["price"].(float64)),
			Storage: int(refineryData["storage"].(float64)),
			Size: RefinerySize{
				Width:  int(refineryData["width"].(float64)),
				Height: int(refineryData["height"].(float64)),
			},
		}
		Refineries = append(Refineries, refinery)
	}

	return nil
}

func GetRefinery(name string) Refinery {
	for _, r := range Refineries {
		if r.Name == name {
			return r
		}
	}
	return Refinery{}
}
