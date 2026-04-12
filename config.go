package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
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

func saveConfig(cfg Config) error {
	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(configPath(), data, 0644)
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
