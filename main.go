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
}

func configPath() string {
	exe, _ := os.Executable()
	return filepath.Join(filepath.Dir(exe), configFile)
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

func persist(cfg *Config) {
	saveConfig(*cfg)
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

func formatDuration(hours float64) string {
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

func parseLargeNumber(input string) (float64, error) {
	input = strings.TrimSpace(strings.ToLower(input))

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

	return container.NewGridWithColumns(
		2,
		keyLabel,
		value,
	)
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
	w.Resize(fyne.NewSize(430, 650))

	cashPerUnit := cfg.CashPerUnit
	boostPercent := cfg.BoostPercent
	boostMult := boostPercent / 100

	// INPUTS
	rateEntry := widget.NewEntry()
	rateEntry.SetText(strconv.FormatFloat(cfg.RatePerSecond, 'f', -1, 64))
	rateEntry.SetPlaceHolder("e.g. 30000")

	gasEntry := widget.NewEntry()
	gasEntry.SetPlaceHolder("e.g. 100k / 1.5M / 2B")

	countEntry := widget.NewEntry()
	countEntry.SetPlaceHolder("e.g. 10")

	saveStatus := widget.NewLabel("")

	// OUTPUT LABELS
	petrolLabel := widget.NewLabel("—")
	cashHrLabel := widget.NewLabel("—")
	timeLabel := widget.NewLabel("—")
	gasLabel := widget.NewLabel("—")

	// SLIDERS
	cashSlider := widget.NewSlider(1, 15)
	cashSlider.SetValue(cashPerUnit)
	cashValueLabel := widget.NewLabel(fmt.Sprintf("$%.0f", cashPerUnit))

	boostSlider := widget.NewSlider(100, 285)
	boostSlider.Step = 5
	boostSlider.SetValue(boostPercent)
	boostValueLabel := widget.NewLabel(fmt.Sprintf("%.0f%%", boostPercent))

	// DRILLS
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

	// UPDATE
	update := func() {
		rate, err := strconv.ParseFloat(rateEntry.Text, 64)
		if err != nil || rate <= 0 {
			return
		}

		petrol := rate * 3600
		cash := petrol * cashPerUnit * boostMult

		petrolLabel.SetText(formatLarge(petrol))
		cashHrLabel.SetText("$" + formatLarge(cash))

		count, err := strconv.Atoi(countEntry.Text)
		if err == nil && count > 0 {
			total := getDrill().Price * float64(count)
			timeLabel.SetText(formatDuration(total / cash))
		}
	}

	updateGas := func() {
		gas, err := parseLargeNumber(gasEntry.Text)
		if err != nil {
			return
		}
		gasLabel.SetText("$" + formatLarge(gas*cashPerUnit*boostMult))
	}

	// EVENTS
	cashSlider.OnChanged = func(v float64) {
		cashPerUnit = v
		cashValueLabel.SetText(fmt.Sprintf("$%.0f", v))
		cfg.CashPerUnit = v
		persist(&cfg)
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

	saveBtn := widget.NewButton("Save Rate", func() {
		rate, err := strconv.ParseFloat(rateEntry.Text, 64)
		if err != nil {
			saveStatus.SetText("invalid")
			return
		}
		cfg.RatePerSecond = rate
		saveConfig(cfg)
		saveStatus.SetText("✓ saved")
	})

	// UI
	statsCard := widget.NewCard(
		"📊 Stats",
		"",
		container.NewVBox(
			widget.NewLabel("Cash per Unit"),
			cashSlider,
			cashValueLabel,

			widget.NewLabel("Boost"),
			boostSlider,
			boostValueLabel,

			statRow("Petrol/hr:", petrolLabel),
			statRow("Cash/hr:", cashHrLabel),
		),
	)

	drillCard := widget.NewCard(
		"⛏ Drills",
		"",
		container.NewVBox(
			drillSelect,
			countEntry,
			statRow("Time to afford:", timeLabel),
		),
	)

	gasCard := widget.NewCard(
		"🛢 Gas",
		"",
		container.NewVBox(
			gasEntry,
			statRow("Total Profit:", gasLabel),
		),
	)

	rateCard := widget.NewCard(
		"⛽ Rate",
		"",
		container.NewVBox(
			rateEntry,
			saveBtn,
			saveStatus,
		),
	)

	w.SetContent(container.NewVScroll(container.NewVBox(
		rateCard,
		statsCard,
		drillCard,
		gasCard,
	)))

	update()
	updateGas()

	w.ShowAndRun()
}
