package main

import (
	"context"
	"sync"
)

type App struct {
	ctx    context.Context
	config Config
}

type CalculationResult struct {
	PetrolPerHr float64 `json:"petrol_per_hr"`
	CashPerHr   float64 `json:"cash_per_hr"`
}

type DrillAffordResult struct {
	TotalCost float64 `json:"total_cost"`
	TimeLeft  string  `json:"time_left"`
}

type BatchCalculateParams struct {
	RatePerSecond   float64                   `json:"rate_per_second"`
	CurrentCash     float64                   `json:"current_cash"`
	CashPerUnit     float64                   `json:"cash_per_unit"`
	BoostPercent    float64                   `json:"boost_percent"`
	GasAmountStr    string                    `json:"gas_amount_str"`
	GoalAmountStr   string                    `json:"goal_amount_str"`
	DrillSelections []map[string]interface{} `json:"drill_selections"`
}

type BatchCalculationResult struct {
	Production CalculationResult `json:"production"`
	GasProfit  float64           `json:"gas_profit"`
	GoalTime   string            `json:"goal_time"`
	DrillTime  DrillAffordResult `json:"drill_time"`
}

func NewApp() *App {
	return &App{config: loadConfig()}
}

func (a *App) startup(ctx context.Context) { a.ctx = ctx }

func (a *App) GetConfig() Config { return a.config }

func (a *App) SaveConfig(cfg Config) error {
	a.config = cfg
	return saveConfig(cfg)
}

func (a *App) UpdateConfig(ratePerSecond, cashPerUnit, boostPercent, currentCash float64) error {
	a.config.RatePerSecond = ratePerSecond
	a.config.CashPerUnit = cashPerUnit
	a.config.BoostPercent = boostPercent
	a.config.CurrentCash = currentCash
	return saveConfig(a.config)
}

func (a *App) GetDrill(name string) Drill { return GetDrill(name) }

func (a *App) GetAllDrills() []Drill { return Drills }

func (a *App) GetRefinery(name string) Refinery { return GetRefinery(name) }

func (a *App) GetAllRefineries() []Refinery { return Refineries }

func (a *App) ParseLargeNumber(input string) float64 {
	num, _ := parseLargeNumber(input)
	return num
}

func (a *App) FormatLarge(num float64) string {
	return formatLarge(num)
}

func (a *App) FormatDuration(hours float64) string {
	return formatDuration(hours)
}

func (a *App) CalculateProduction(ratePerSecond, cashPerUnit, boostPercent float64) CalculationResult {
	petrolPerHr := ratePerSecond * 3600
	boostMult := boostPercent / 100
	cashPerHr := petrolPerHr * cashPerUnit * boostMult
	return CalculationResult{
		PetrolPerHr: petrolPerHr,
		CashPerHr:   cashPerHr,
	}
}

func (a *App) CalculateGasProfit(gasAmountStr string, cashPerUnit, boostPercent float64) float64 {
	gasAmount, _ := parseLargeNumber(gasAmountStr)
	boostMult := boostPercent / 100
	return gasAmount * cashPerUnit * boostMult
}

func (a *App) CalculateGoalTime(ratePerSecondStr, currentCashStr, goalAmountStr string, cashPerUnit, boostPercent float64) string {
	ratePerSecond, _ := parseLargeNumber(ratePerSecondStr)
	currentCash, _ := parseLargeNumber(currentCashStr)
	goalAmount, _ := parseLargeNumber(goalAmountStr)

	if ratePerSecond <= 0 || goalAmount <= 0 {
		return "—"
	}

	petrolPerHr := ratePerSecond * 3600
	boostMult := boostPercent / 100
	cashPerHr := petrolPerHr * cashPerUnit * boostMult

	if cashPerHr <= 0 {
		return "—"
	}

	remaining := goalAmount - currentCash
	if remaining <= 0 {
		return "Complete!"
	}

	hours := remaining / cashPerHr
	return formatDuration(hours)
}

func (a *App) CalculateDrillAffordTime(ratePerSecondStr, currentCashStr string, cashPerUnit, boostPercent float64, drillSelections []map[string]interface{}) DrillAffordResult {
	ratePerSecond, _ := parseLargeNumber(ratePerSecondStr)
	currentCash, _ := parseLargeNumber(currentCashStr)

	if ratePerSecond <= 0 {
		return DrillAffordResult{TotalCost: 0, TimeLeft: "—"}
	}

	petrolPerHr := ratePerSecond * 3600
	boostMult := boostPercent / 100
	cashPerHr := petrolPerHr * cashPerUnit * boostMult

	totalCost := 0.0
	for _, selection := range drillSelections {
		if drillName, ok := selection["drillName"].(string); ok {
			if count, ok := selection["count"].(float64); ok && count > 0 {
				drill := GetDrill(drillName)
				totalCost += float64(drill.Price) * count
			}
		}
	}

	if totalCost <= 0 || cashPerHr <= 0 {
		return DrillAffordResult{TotalCost: totalCost, TimeLeft: "—"}
	}

	remaining := totalCost - currentCash
	if remaining <= 0 {
		return DrillAffordResult{TotalCost: totalCost, TimeLeft: "Complete!"}
	}

	hours := remaining / cashPerHr
	return DrillAffordResult{
		TotalCost: totalCost,
		TimeLeft:  formatDuration(hours),
	}
}

func (a *App) BatchCalculate(params BatchCalculateParams) BatchCalculationResult {
	result := BatchCalculationResult{}
	var wg sync.WaitGroup

	// Production calculation
	wg.Add(1)
	go func() {
		defer wg.Done()
		petrolPerHr := params.RatePerSecond * 3600
		boostMult := params.BoostPercent / 100
		cashPerHr := petrolPerHr * params.CashPerUnit * boostMult
		result.Production = CalculationResult{
			PetrolPerHr: petrolPerHr,
			CashPerHr:   cashPerHr,
		}
	}()

	// Gas profit calculation
	wg.Add(1)
	go func() {
		defer wg.Done()
		gasAmount, _ := parseLargeNumber(params.GasAmountStr)
		boostMult := params.BoostPercent / 100
		result.GasProfit = gasAmount * params.CashPerUnit * boostMult
	}()

	// Goal time calculation
	wg.Add(1)
	go func() {
		defer wg.Done()
		goalAmount, _ := parseLargeNumber(params.GoalAmountStr)

		if params.RatePerSecond <= 0 || goalAmount <= 0 {
			result.GoalTime = "—"
			return
		}

		petrolPerHr := params.RatePerSecond * 3600
		boostMult := params.BoostPercent / 100
		cashPerHr := petrolPerHr * params.CashPerUnit * boostMult

		if cashPerHr <= 0 {
			result.GoalTime = "—"
			return
		}

		remaining := goalAmount - params.CurrentCash
		if remaining <= 0 {
			result.GoalTime = "Complete!"
			return
		}

		hours := remaining / cashPerHr
		result.GoalTime = formatDuration(hours)
	}()

	// Drill time calculation
	wg.Add(1)
	go func() {
		defer wg.Done()

		if params.RatePerSecond <= 0 {
			result.DrillTime = DrillAffordResult{TotalCost: 0, TimeLeft: "—"}
			return
		}

		petrolPerHr := params.RatePerSecond * 3600
		boostMult := params.BoostPercent / 100
		cashPerHr := petrolPerHr * params.CashPerUnit * boostMult

		totalCost := 0.0
		for _, selection := range params.DrillSelections {
			if drillName, ok := selection["drillName"].(string); ok {
				if count, ok := selection["count"].(float64); ok && count > 0 {
					drill := GetDrill(drillName)
					totalCost += float64(drill.Price) * count
				}
			}
		}

		if totalCost <= 0 || cashPerHr <= 0 {
			result.DrillTime = DrillAffordResult{TotalCost: totalCost, TimeLeft: "—"}
			return
		}

		remaining := totalCost - params.CurrentCash
		if remaining <= 0 {
			result.DrillTime = DrillAffordResult{TotalCost: totalCost, TimeLeft: "Complete!"}
			return
		}

		hours := remaining / cashPerHr
		result.DrillTime = DrillAffordResult{
			TotalCost: totalCost,
			TimeLeft:  formatDuration(hours),
		}
	}()

	wg.Wait()
	return result
}