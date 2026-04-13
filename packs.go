package main

import (
	"encoding/json"
	"fmt"
	"math"
	"os"
)

type PackDrill struct {
	Name     string  `json:"name"`
	DropRate float64 `json:"drop_rate"`
	Rate     int     `json:"rate"`
	Width    int     `json:"width"`
	Height   int     `json:"height"`
}

type PackData struct {
	Infinity []PackDrill `json:"infinity"`
	Rainbow  []PackDrill `json:"rainbow"`
}

var Packs = PackData{}

func init() {
	LoadPacks()
}

func LoadPacks() error {
	data, err := os.ReadFile("data.json")
	if err != nil {
		return err
	}

	var gameData struct {
		Packs PackData `json:"packs"`
	}

	err = json.Unmarshal(data, &gameData)
	if err != nil {
		return err
	}

	Packs = gameData.Packs
	return nil
}

func GetPackDrills(packType string) []PackDrill {
	switch packType {
	case "infinity":
		return Packs.Infinity
	case "rainbow":
		return Packs.Rainbow
	default:
		return []PackDrill{}
	}
}

func GetPackDrill(packType, drillName string) *PackDrill {
	drills := GetPackDrills(packType)
	for i := range drills {
		if drills[i].Name == drillName {
			return &drills[i]
		}
	}
	return nil
}

// CalculatePacksNeeded99Confidence calculates the number of packs needed
// to guarantee targetQuantity drills with 99% confidence
// Uses the formula: trials = (target/p) + (z * sqrt(target * (1-p) / p)) / p
// Where z = 2.576 for 99% confidence level
func CalculatePacksNeeded99Confidence(targetQuantity, dropRate float64) int {
	if targetQuantity <= 0 || dropRate <= 0 || dropRate > 100 {
		return 0
	}

	// Convert drop rate from percentage to decimal
	p := dropRate / 100.0

	// Z-score for 99% confidence level
	z := 2.576

	// Expected value
	expectedTrials := targetQuantity / p

	// Standard deviation component
	variance := targetQuantity * (1 - p) / p
	stdDev := math.Sqrt(variance)
	confidenceMargin := (z * stdDev) / p

	// Total trials needed
	totalTrials := expectedTrials + confidenceMargin

	// Round up to nearest integer
	return int(math.Ceil(totalTrials))
}

// CalculateBulkRainbowPackCost calculates the cheapest cost to buy a specific number of Rainbow packs
// considering bulk pricing: 1 for 229, 3 for 569, 8 for 1399
func CalculateBulkRainbowPackCost(packCount int) map[string]interface{} {
	// Bulk pricing options
	single := 229    // 1 pack
	triple := 569    // 3 packs (189.67 per pack)
	bulk8 := 1399    // 8 packs (174.875 per pack)

	if packCount <= 0 {
		return map[string]interface{}{
			"total_cost": 0,
			"packs": map[string]interface{}{
				"single": 0,
				"triple": 0,
				"bulk_8": 0,
			},
			"breakdown": "0 packs needed",
		}
	}

	// Calculate best combination
	var best8 int    // Number of 8-packs
	var bestTriple int // Number of 3-packs
	var bestSingle int // Number of 1-packs
	var minCost int

	// Try different combinations to find cheapest
	for num8 := packCount / 8; num8 >= 0; num8-- {
		remaining := packCount - (num8 * 8)
		for num3 := remaining / 3; num3 >= 0; num3-- {
			num1 := remaining - (num3 * 3)
			cost := (num8 * bulk8) + (num3 * triple) + (num1 * single)
			
			if num8 == packCount/8 {
				minCost = cost
				best8 = num8
				bestTriple = num3
				bestSingle = num1
			} else if cost < minCost {
				minCost = cost
				best8 = num8
				bestTriple = num3
				bestSingle = num1
			}
		}
	}

	breakdown := ""
	if best8 > 0 {
		breakdown += fmt.Sprintf("%d×8-pack", best8)
	}
	if bestTriple > 0 {
		if breakdown != "" {
			breakdown += " + "
		}
		breakdown += fmt.Sprintf("%d×3-pack", bestTriple)
	}
	if bestSingle > 0 {
		if breakdown != "" {
			breakdown += " + "
		}
		breakdown += fmt.Sprintf("%d×1-pack", bestSingle)
	}

	return map[string]interface{}{
		"total_cost": minCost,
		"packs": map[string]interface{}{
			"single": bestSingle,
			"triple": bestTriple,
			"bulk_8": best8,
		},
		"breakdown": breakdown,
	}
}
