# Oil Empire Calculator
[Oil Empire](https://www.roblox.com/games/107095834793267/Oil-Empire) is a Roblox game; At later stages of the game it becomes very time dependant to get the best items, and I found myself reaching for a calculator more often than I'd like, so I decided to make an application to automate this process!

## Installation
Head to the releases page and download the latest executable file, or build it from source.

## Building from Source
*Pre-requisites:*
 - Golang *1.26.1 or later*
 - Clang *21.1.8 or later*

To build from source, simply download the source code from the repository, run ```go mod tidy``` to install all the dependencies, and finally run ./build.sh. *Alternatively* run this Powershell command to build the executable:
```powershell
$env:CC="clang"
$env:CXX="clang++"
go build -ldflags "-H windowsgui" -o oilempire.exe .
```

## Usage
Using the calculator is pretty straight forward, simply hop in game, check your production rate, and input the value into the calculator in the top input field.

Then you can use the dropdown menu at the bottom to select which drill you want to buy, and input how many you want to buy, and the calculator will tell you how long it will take for you to get those drills!

<img width="524" height="686" alt="Screenshot 2026-04-10 140056" src="https://github.com/user-attachments/assets/cb601580-4ff8-496d-9bfb-5762f414676b" />

## Notes
This project is open to pull-requests, feel free to submit features you'd like to see! I'm also willing to take suggestions in the Issues tab or in the [Oil Empire Discord](https://discord.com/invite/hdYnSvD5JV) server.
