package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"
)

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------

const configFile = "config.json"

type Config struct {
	RatePerSecond float64 `json:"rate_per_second"`
	BoostPercent  float64 `json:"boost_percent"`
	CashPerUnit   float64 `json:"cash_per_unit"`
	CurrentCash   float64 `json:"current_cash"`
}

func configPath() string {
	exe, err := os.Executable()
	if err != nil {
		wd, _ := os.Getwd()
		return filepath.Join(wd, configFile)
	}
	dir := filepath.Dir(exe)
	if strings.Contains(dir, "go-build") ||
		strings.Contains(dir, "tmp") ||
		strings.Contains(dir, "Temp") {
		wd, _ := os.Getwd()
		return filepath.Join(wd, configFile)
	}
	return filepath.Join(dir, configFile)
}

func loadConfig() Config {
	data, err := os.ReadFile(configPath())
	if err != nil {
		return Config{}
	}
	var cfg Config
	_ = json.Unmarshal(data, &cfg)
	return cfg
}

func saveConfig(cfg Config) {
	data, _ := json.MarshalIndent(cfg, "", "  ")
	_ = os.WriteFile(configPath(), data, 0644)
}

// ---------------------------------------------------------------------------
// FORMATTING
// ---------------------------------------------------------------------------

func trim(v float64) string {
	s := fmt.Sprintf("%.2f", v)
	for len(s) > 0 && s[len(s)-1] == '0' {
		s = s[:len(s)-1]
	}
	if len(s) > 0 && s[len(s)-1] == '.' {
		s = s[:len(s)-1]
	}
	return s
}

func formatLarge(v float64) string {
	switch {
	case v >= 1e12:
		return trim(v/1e12) + "T"
	case v >= 1e9:
		return trim(v/1e9) + "B"
	case v >= 1e6:
		return trim(v/1e6) + "M"
	case v >= 1e3:
		return trim(v/1e3) + "K"
	default:
		return trim(v)
	}
}

// formatWithCommas formats a float as a whole number with comma separators.
// e.g. 1234567.0 → "1,234,567"
func formatWithCommas(v float64) string {
	s := fmt.Sprintf("%.0f", v)
	n := len(s)
	if n <= 3 {
		return s
	}
	var result []byte
	for i, c := range s {
		if i > 0 && (n-i)%3 == 0 {
			result = append(result, ',')
		}
		result = append(result, byte(c))
	}
	return string(result)
}

// stripCommas removes commas so a comma-formatted string can be parsed.
func stripCommas(s string) string {
	return strings.ReplaceAll(s, ",", "")
}

func formatDuration(hours float64) string {
	if hours <= 0 {
		return "—"
	}
	totalSeconds := int(hours * 3600)
	h := totalSeconds / 3600
	m := (totalSeconds % 3600) / 60
	s := totalSeconds % 60
	if h > 0 {
		return fmt.Sprintf("%dh %dm %ds", h, m, s)
	}
	if m > 0 {
		return fmt.Sprintf("%dm %ds", m, s)
	}
	return fmt.Sprintf("%ds", s)
}

// parseLargeNumber accepts plain numbers, comma-separated numbers, or
// suffixed shorthand like 1.5M, 2B, 500K, 3T.
func parseLargeNumber(input string) (float64, error) {
	input = strings.TrimSpace(strings.ToLower(input))
	input = stripCommas(input)

	mult := 1.0
	switch {
	case strings.HasSuffix(input, "k"):
		mult = 1e3
		input = strings.TrimSuffix(input, "k")
	case strings.HasSuffix(input, "m"):
		mult = 1e6
		input = strings.TrimSuffix(input, "m")
	case strings.HasSuffix(input, "b"):
		mult = 1e9
		input = strings.TrimSuffix(input, "b")
	case strings.HasSuffix(input, "t"):
		mult = 1e12
		input = strings.TrimSuffix(input, "t")
	}

	val, err := strconv.ParseFloat(input, 64)
	if err != nil {
		return 0, err
	}
	return val * mult, nil
}

// ---------------------------------------------------------------------------
// DRILLS
// ---------------------------------------------------------------------------

type Drill struct {
	Name  string
	Price float64
}

var drills = []Drill{
	{"Basic Drill", 500},
	{"Strong Drill", 1800},
	{"Enhanced Drill", 3600},
	{"Speed Drill", 7200},
	{"Reinforced Drill", 12000},
	{"Industrial Drill", 20000},
	{"Double Industrial Drill", 30000},
	{"Turbo Drill", 80000},
	{"Mega Drill", 140000},
	{"Mega Emerald Drill", 400000},
	{"Hell Drill", 1225000},
	{"Plasma Drill", 4500000},
	{"Huge Long Drill", 40000000},
	{"Mega Plasma Drill", 95000000},
	{"Multi Drill", 280000000},
	{"Lava Drill", 900000000},
	{"Ice Plasma Drill", 2400000000},
	{"Crystal Drill", 9000000000},
	{"Diamond Drill", 27500000000},
	{"Ruby Drill", 85500000000},
}

// ---------------------------------------------------------------------------
// UI HELPERS
// ---------------------------------------------------------------------------

func statRow(key string, value *widget.Label) *fyne.Container {
	keyLabel := widget.NewLabel(key)
	keyLabel.Importance = widget.LowImportance
	value.Importance = widget.HighImportance
	return container.NewGridWithColumns(2, keyLabel, value)
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------

func main() {
	cfg := loadConfig()

	if cfg.CashPerUnit <= 0 {
		cfg.CashPerUnit = 15
	}
	if cfg.BoostPercent <= 0 {
		cfg.BoostPercent = 285
	}

	a := app.New()
	w := a.NewWindow("Oil Empire Calculator")
	w.Resize(fyne.NewSize(430, 800))

	cashPerUnit := cfg.CashPerUnit
	boostPercent := cfg.BoostPercent
	boostMult := boostPercent / 100

	// ── Inputs ───────────────────────────────────────────────────────────────

	// Rate entry: accepts plain numbers or comma-separated, no forced formatting
	rateEntry := widget.NewEntry()
	rateEntry.SetPlaceHolder("e.g. 30000 or 30,000")
	if cfg.RatePerSecond > 0 {
		rateEntry.SetText(formatWithCommas(cfg.RatePerSecond))
	}

	gasEntry := widget.NewEntry()
	gasEntry.SetPlaceHolder("e.g. 100k / 1.5M / 2B")

	countEntry := widget.NewEntry()
	countEntry.SetPlaceHolder("e.g. 10")

	// Current cash — lives in the rate card, offsets all time calculations
	currentCashEntry := widget.NewEntry()
	currentCashEntry.SetPlaceHolder("e.g. 500K / 1.2B (optional)")
	if cfg.CurrentCash > 0 {
		currentCashEntry.SetText(formatLarge(cfg.CurrentCash))
	}

	// Cash goal — how long until you accumulate this much cash
	cashGoalEntry := widget.NewEntry()
	cashGoalEntry.SetPlaceHolder("e.g. 1B / 27.5B")

	saveStatus := widget.NewLabel("")

	// ── Output labels ────────────────────────────────────────────────────────

	petrolLabel := widget.NewLabel("—")
	cashHrLabel := widget.NewLabel("—")
	timeLabel   := widget.NewLabel("—")
	gasLabel    := widget.NewLabel("—")
	goalLabel   := widget.NewLabel("—")

	// ── Sliders ──────────────────────────────────────────────────────────────

	cashSlider := widget.NewSlider(1, 15)
	cashSlider.SetValue(cashPerUnit)
	cashValueLabel := widget.NewLabel(fmt.Sprintf("$%.0f", cashPerUnit))

	boostSlider := widget.NewSlider(100, 285)
	boostSlider.Step = 5
	boostSlider.SetValue(boostPercent)
	boostValueLabel := widget.NewLabel(fmt.Sprintf("%.0f%%", boostPercent))

	// ── Drill selector ───────────────────────────────────────────────────────

	drillSelect := widget.NewSelect([]string{}, nil)
	for _, d := range drills {
		drillSelect.Options = append(drillSelect.Options, d.Name)
	}
	drillSelect.SetSelected(drills[0].Name)

	getDrill := func() Drill {
		for _, d := range drills {
			if d.Name == drillSelect.Selected {
				return d
			}
		}
		return drills[0]
	}

	// ── Core update logic ─────────────────────────────────────────────────────

	getCurrentCash := func() float64 {
		v, err := parseLargeNumber(currentCashEntry.Text)
		if err != nil {
			return 0
		}
		return v
	}

	update := func() {
		rate, err := parseLargeNumber(stripCommas(rateEntry.Text))
		if err != nil || rate <= 0 {
			return
		}

		petrolPerHr := rate * 3600
		cashPerHr := petrolPerHr * cashPerUnit * boostMult

		petrolLabel.SetText(formatLarge(petrolPerHr))
		cashHrLabel.SetText("$" + formatLarge(cashPerHr))

		wallet := getCurrentCash()

		// Drill: time to afford N of selected drill
		count, err := strconv.Atoi(countEntry.Text)
		if err == nil && count > 0 && cashPerHr > 0 {
			totalCost := getDrill().Price * float64(count)
			remaining := totalCost - wallet
			if remaining <= 0 {
				timeLabel.SetText("Already affordable!")
			} else {
				timeLabel.SetText(formatDuration(remaining / cashPerHr))
			}
		} else {
			timeLabel.SetText("—")
		}

		// Cash goal: time to reach target cash amount
		goal, err := parseLargeNumber(cashGoalEntry.Text)
		if err == nil && goal > 0 && cashPerHr > 0 {
			remaining := goal - wallet
			if remaining <= 0 {
				goalLabel.SetText("Already reached!")
			} else {
				goalLabel.SetText(formatDuration(remaining / cashPerHr))
			}
		} else {
			goalLabel.SetText("—")
		}
	}

	updateGas := func() {
		gas, err := parseLargeNumber(gasEntry.Text)
		if err != nil {
			gasLabel.SetText("—")
			return
		}
		gasLabel.SetText("$" + formatLarge(gas*cashPerUnit*boostMult))
	}

	// ── Wire up events ────────────────────────────────────────────────────────

	cashSlider.OnChanged = func(v float64) {
		cashPerUnit = v
		cashValueLabel.SetText(fmt.Sprintf("$%.0f", v))
		cfg.CashPerUnit = v
		saveConfig(cfg)
		update()
		updateGas()
	}

	boostSlider.OnChanged = func(v float64) {
		boostPercent = v
		boostMult = v / 100
		boostValueLabel.SetText(fmt.Sprintf("%.0f%%", v))
		cfg.BoostPercent = v
		saveConfig(cfg)
		update()
		updateGas()
	}

	rateEntry.OnChanged = func(string) { update() }

	countEntry.OnChanged = func(string) { update() }
	gasEntry.OnChanged = func(string) { updateGas() }
	drillSelect.OnChanged = func(string) { update() }
	currentCashEntry.OnChanged = func(string) {
		if v, err := parseLargeNumber(currentCashEntry.Text); err == nil {
			cfg.CurrentCash = v
			saveConfig(cfg)
		}
		update()
	}
	cashGoalEntry.OnChanged = func(string) { update() }

	saveBtn := widget.NewButton("Save Config", func() {
		rate, err := parseLargeNumber(stripCommas(rateEntry.Text))
		if err != nil || rate <= 0 {
			saveStatus.SetText("⚠ Invalid rate")
			return
		}
		cfg.RatePerSecond = rate
		if v, err := parseLargeNumber(currentCashEntry.Text); err == nil {
			cfg.CurrentCash = v
		}
		saveConfig(cfg)
		saveStatus.SetText("✓ Saved")
	})

	// ── Layout ────────────────────────────────────────────────────────────────

	rateCard := widget.NewCard("⛽ Rate", "", container.NewVBox(
		rateEntry,
		widget.NewSeparator(),
		widget.NewLabel("Current Cash (optional)"),
		currentCashEntry,
		saveBtn,
		saveStatus,
	))

	statsCard := widget.NewCard("📊 Stats", "", container.NewVBox(
		widget.NewLabel("Cash per Unit"),
		cashSlider,
		cashValueLabel,
		widget.NewLabel("Boost"),
		boostSlider,
		boostValueLabel,
		statRow("Petrol/hr:", petrolLabel),
		statRow("Cash/hr:", cashHrLabel),
	))

	drillCard := widget.NewCard("⛏ Drills", "", container.NewVBox(
		drillSelect,
		countEntry,
		statRow("Time to afford:", timeLabel),
	))

	gasCard := widget.NewCard("🛢 Gas", "", container.NewVBox(
		gasEntry,
		statRow("Total Profit:", gasLabel),
	))

	goalCard := widget.NewCard("🎯 Cash Goal", "", container.NewVBox(
		widget.NewLabel("Goal Amount"),
		cashGoalEntry,
		statRow("Time to goal:", goalLabel),
	))

	w.SetContent(container.NewVScroll(container.NewVBox(
		rateCard,
		statsCard,
		drillCard,
		gasCard,
		goalCard,
	)))

	update()
	updateGas()

	w.ShowAndRun()
}
