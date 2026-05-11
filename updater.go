package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

const Version = "v0.3-beta.3"

const githubRepo = "h263cs/OilEmpireCalculator"

type UpdateInfo struct {
	Available      bool   `json:"available"`
	LatestVersion  string `json:"latest_version"`
	CurrentVersion string `json:"current_version"`
	ReleaseURL     string `json:"release_url"`
	ReleaseNotes   string `json:"release_notes"`
}

type githubRelease struct {
	TagName string `json:"tag_name"`
	HTMLURL string `json:"html_url"`
	Body    string `json:"body"`
}

func (a *App) GetVersion() string { return Version }

func (a *App) CheckForUpdate() UpdateInfo {
	url := fmt.Sprintf("https://api.github.com/repos/%s/releases/latest", githubRepo)

	client := &http.Client{}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return UpdateInfo{Available: false, CurrentVersion: Version}
	}
	req.Header.Set("Accept", "application/vnd.github+json")

	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != 200 {
		return UpdateInfo{Available: false, CurrentVersion: Version}
	}
	defer resp.Body.Close()

	var release githubRelease
	if err := json.NewDecoder(resp.Body).Decode(&release); err != nil {
		return UpdateInfo{Available: false, CurrentVersion: Version}
	}

	return UpdateInfo{
		Available:      isNewerVersion(release.TagName, Version),
		LatestVersion:  release.TagName,
		CurrentVersion: Version,
		ReleaseURL:     release.HTMLURL,
		ReleaseNotes:   release.Body,
	}
}

func (a *App) OpenURL(url string) {
	runtime.BrowserOpenURL(a.ctx, url)
}

func isNewerVersion(latest, current string) bool {
	latest = strings.TrimPrefix(latest, "v")
	current = strings.TrimPrefix(current, "v")

	// Split main version from pre-release suffix (e.g. "0.3-beta.2" → ["0.3", "beta.2"])
	lParts := strings.SplitN(latest, "-", 2)
	cParts := strings.SplitN(current, "-", 2)

	var l, c [2]int
	fmt.Sscanf(lParts[0], "%d.%d", &l[0], &l[1])
	fmt.Sscanf(cParts[0], "%d.%d", &c[0], &c[1])

	for i := range l {
		if l[i] > c[i] {
			return true
		}
		if l[i] < c[i] {
			return false
		}
	}

	// Same main version — a full release beats a pre-release
	lHasPre := len(lParts) > 1
	cHasPre := len(cParts) > 1
	if !lHasPre && cHasPre {
		return true
	}
	if lHasPre && !cHasPre {
		return false
	}
	if !lHasPre {
		return false
	}

	// Both are pre-releases: compare the trailing number (e.g. "beta.2" vs "beta.1")
	var lPre, cPre int
	lLabel, cLabel := lParts[1], cParts[1]
	if idx := strings.LastIndex(lLabel, "."); idx >= 0 {
		fmt.Sscanf(lLabel[idx+1:], "%d", &lPre)
		lLabel = lLabel[:idx]
	}
	if idx := strings.LastIndex(cLabel, "."); idx >= 0 {
		fmt.Sscanf(cLabel[idx+1:], "%d", &cPre)
		cLabel = cLabel[:idx]
	}
	if lLabel != cLabel {
		return false // different pre-release labels, can't compare
	}
	return lPre > cPre
}
