package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

const Version = "v0.3-beta.2"

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

	var l, c [3]int
	fmt.Sscanf(latest, "%d.%d.%d", &l[0], &l[1], &l[2])
	fmt.Sscanf(current, "%d.%d.%d", &c[0], &c[1], &c[2])

	for i := range l {
		if l[i] > c[i] {
			return true
		}
		if l[i] < c[i] {
			return false
		}
	}
	return false
}
