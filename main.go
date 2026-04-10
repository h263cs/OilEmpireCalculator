package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strconv"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/theme"
	"fyne.io/fyne/v2/widget"
)

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const (
	cashPerUnit = 15.0
	boostMult   = 2.85
	configFile  = "config.json"
)

// ---------------------------------------------------------------------------
// Drills
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
// Config — persisted to disk next to the executable
// ---------------------------------------------------------------------------

type Config struct {
	RatePerSecond float64 `json:"rate_per_second"`
}

func configPath() string {
	exe, err := os.Executable()
	if err != nil {
		return configFile
	}
	return filepath.Join(filepath.Dir(exe), configFile)
}

func loadConfig() Config {
	data, err := os.ReadFile(configPath())
	if err != nil {
		return Config{}
	}
	var cfg Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		return Config{}
	}
	return cfg
}

func saveConfig(cfg Config) error {
	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(configPath(), data, 0644)
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

func formatLarge(v float64) string {
	switch {
	case v >= 1_000_000_000_000:
		return strconv.FormatFloat(v/1_000_000_000_000, 'f', -1, 64) + "T"
	case v >= 1_000_000_000:
		return strconv.FormatFloat(v/1_000_000_000, 'f', -1, 64) + "B"
	case v >= 1_000_000:
		return strconv.FormatFloat(v/1_000_000, 'f', -1, 64) + "M"
	case v >= 1_000:
		return strconv.FormatFloat(v/1_000, 'f', -1, 64) + "K"
	default:
		return strconv.FormatFloat(v, 'f', -1, 64)
	}
}

func formatLargeTrimmed(v float64) string {
	switch {
	case v >= 1_000_000_000_000:
		return trimDecimals(v/1_000_000_000_000) + "T"
	case v >= 1_000_000_000:
		return trimDecimals(v/1_000_000_000) + "B"
	case v >= 1_000_000:
		return trimDecimals(v/1_000_000) + "M"
	case v >= 1_000:
		return trimDecimals(v/1_000) + "K"
	default:
		return trimDecimals(v)
	}
}

func trimDecimals(v float64) string {
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

// ---------------------------------------------------------------------------
// UI helpers
// ---------------------------------------------------------------------------

func statRow(key string, valueLabel *widget.Label) *fyne.Container {
	keyLabel := widget.NewLabelWithStyle(key, fyne.TextAlignLeading, fyne.TextStyle{})
	keyLabel.Importance = widget.LowImportance
	return container.NewGridWithColumns(2, keyLabel, valueLabel)
}

func boldLabel(text string) *widget.Label {
	return widget.NewLabelWithStyle(text, fyne.TextAlignLeading, fyne.TextStyle{Bold: true})
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

func main() {
	cfg := loadConfig()

	a := app.New()
	w := a.NewWindow("Oil Empire Calculator")
	w.Resize(fyne.NewSize(420, 520))

	// ── Rate input ──────────────────────────────────────────────────────────
	rateEntry := widget.NewEntry()
	rateEntry.SetPlaceHolder("e.g. 30000")
	if cfg.RatePerSecond > 0 {
		rateEntry.SetText(strconv.FormatFloat(cfg.RatePerSecond, 'f', -1, 64))
	}

	saveStatus := widget.NewLabel("")

	// ── Stats labels ────────────────────────────────────────────────────────
	petrolPerHrLabel := boldLabel("—")
	cashPerHrLabel := boldLabel("—")

	// ── Drill UI ────────────────────────────────────────────────────────────
	drillSelect := widget.NewSelect([]string{}, nil)
	for _, d := range drills {
		drillSelect.Options = append(drillSelect.Options, d.Name)
	}
	drillSelect.SetSelected(drills[0].Name)

	countEntry := widget.NewEntry()
	countEntry.SetPlaceHolder("e.g. 10")

	timeToAffordLabel := boldLabel("—")

	getSelectedDrill := func() Drill {
		for _, d := range drills {
			if d.Name == drillSelect.Selected {
				return d
			}
		}
		return drills[0]
	}

	// ── Update logic ────────────────────────────────────────────────────────
	updateStats := func(rate float64) {
		petrolPerHr := rate * 3600
		cashPerHr := petrolPerHr * cashPerUnit * boostMult

		petrolPerHrLabel.SetText(formatLargeTrimmed(petrolPerHr))
		cashPerHrLabel.SetText("$" + formatLargeTrimmed(cashPerHr))

		count, err := strconv.Atoi(countEntry.Text)
		if err != nil || count <= 0 {
			timeToAffordLabel.SetText("—")
			return
		}

		drill := getSelectedDrill()
		totalCost := drill.Price * float64(count)

		if cashPerHr <= 0 {
			timeToAffordLabel.SetText("—")
			return
		}

		hours := totalCost / cashPerHr
		timeToAffordLabel.SetText(formatDuration(hours))
	}

	if cfg.RatePerSecond > 0 {
		updateStats(cfg.RatePerSecond)
	}

	// ── Save button ─────────────────────────────────────────────────────────
	applyBtn := widget.NewButtonWithIcon("Save & Apply", theme.ConfirmIcon(), func() {
		rate, err := strconv.ParseFloat(rateEntry.Text, 64)
		if err != nil || rate <= 0 {
			saveStatus.SetText("⚠ Invalid number")
			return
		}

		cfg.RatePerSecond = rate
		if err := saveConfig(cfg); err != nil {
			saveStatus.SetText("⚠ Save failed")
			return
		}

		updateStats(rate)
		saveStatus.SetText("✓ Saved")
	})

	// ── Event hooks ─────────────────────────────────────────────────────────
	drillSelect.OnChanged = func(string) {
		rate, _ := strconv.ParseFloat(rateEntry.Text, 64)
		updateStats(rate)
	}

	countEntry.OnChanged = func(string) {
		rate, _ := strconv.ParseFloat(rateEntry.Text, 64)
		updateStats(rate)
	}

	// ── Sections ────────────────────────────────────────────────────────────
	rateSection := widget.NewCard(
		"Production Rate",
		"",
		container.NewVBox(rateEntry, applyBtn, saveStatus),
	)

	statsSection := widget.NewCard(
		"Hourly Stats",
		fmt.Sprintf("$%.0f/unit × %.0f%% boost", cashPerUnit, boostMult*100),
		container.NewVBox(
			statRow("Petrol / hr", petrolPerHrLabel),
			statRow("Cash / hr", cashPerHrLabel),
		),
	)

	drillSection := widget.NewCard(
		"Drill Target",
		"Time to afford selected drills",
		container.NewVBox(
			widget.NewLabel("Drill Type"),
			drillSelect,
			widget.NewLabel("Count"),
			countEntry,
			statRow("Time to afford", timeToAffordLabel),
		),
	)

	scroll := container.NewVScroll(
		container.NewVBox(
			rateSection,
			statsSection,
			drillSection,
		),
	)

	w.SetContent(scroll)
	w.ShowAndRun()
}
