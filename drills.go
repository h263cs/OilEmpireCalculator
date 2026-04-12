package main

type DrillSize struct {
	Width  int `json:"width"`
	Height int `json:"height"`
}

type Drill struct {
	Name string    `json:"Name"`
	Price int       `json:"Price"`
	Rate  int       `json:"rate"`
	Size  DrillSize `json:"size"`
}

func GetDrill(name string) Drill {
	for _, d := range Drills {
		if d.Name == name {
			return d
		}
	}
	return Drill{}
}

var Drills = []Drill{
	{Name: "Basic Drill", Price: 500, Rate: 1, Size: DrillSize{Width: 1, Height: 1}},
	{Name: "Strong Drill", Price: 1800, Rate: 3, Size: DrillSize{Width: 1, Height: 1}},
	{Name: "Enhanced Drill", Price: 3600, Rate: 4, Size: DrillSize{Width: 1, Height: 1}},
	{Name: "Speed Drill", Price: 7200, Rate: 6, Size: DrillSize{Width: 1, Height: 1}},
	{Name: "Reinforced Drill", Price: 12000, Rate: 8, Size: DrillSize{Width: 1, Height: 1}},
	{Name: "Industrial Drill", Price: 20000, Rate: 10, Size: DrillSize{Width: 1, Height: 1}},
	{Name: "Double Industrial Drill", Price: 30000, Rate: 12, Size: DrillSize{Width: 2, Height: 1}},
	{Name: "Turbo Drill", Price: 80000, Rate: 16, Size: DrillSize{Width: 1, Height: 1}},
	{Name: "Mega Drill", Price: 140000, Rate: 20, Size: DrillSize{Width: 1, Height: 1}},
	{Name: "Mega Emerald Drill", Price: 400000, Rate: 25, Size: DrillSize{Width: 1, Height: 1}},
	{Name: "Hell Drill", Price: 1225000, Rate: 35, Size: DrillSize{Width: 1, Height: 1}},
	{Name: "Plasma Drill", Price: 4500000, Rate: 50, Size: DrillSize{Width: 1, Height: 1}},
	{Name: "Huge Long Drill", Price: 40000000, Rate: 220, Size: DrillSize{Width: 2, Height: 2}},
	{Name: "Mega Plasma Drill", Price: 95000000, Rate: 275, Size: DrillSize{Width: 2, Height: 2}},
	{Name: "Multi Drill", Price: 280000000, Rate: 350, Size: DrillSize{Width: 2, Height: 2}},
	{Name: "Lava Drill", Price: 900000000, Rate: 600, Size: DrillSize{Width: 2, Height: 2}},
	{Name: "Ice Plasma Drill", Price: 2400000000, Rate: 800, Size: DrillSize{Width: 2, Height: 2}},
	{Name: "Crystal Drill", Price: 9000000000, Rate: 1500, Size: DrillSize{Width: 2, Height: 2}},
	{Name: "Diamond Drill", Price: 27500000000, Rate: 2750, Size: DrillSize{Width: 2, Height: 2}},
	{Name: "Ruby Drill", Price: 85500000000, Rate: 4500, Size: DrillSize{Width: 2, Height: 2}},
	{Name: "Quantum Drill", Price: 0, Rate: 175, Size: DrillSize{Width: 2, Height: 1}},
	{Name: "Mini Ruby Drill", Price: 0, Rate: 67, Size: DrillSize{Width: 1, Height: 1}},
}