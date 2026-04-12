# Oil Empire Calculator
[Oil Empire](https://www.roblox.com/games/107095834793267/Oil-Empire) is a Roblox game; At later stages of the game it becomes very time dependant to get the best items, and I found myself reaching for a calculator more often than I'd like, so I decided to make an application to automate this process!

<img width="1439" height="839" alt="Screenshot 2026-04-12 013753" src="https://github.com/user-attachments/assets/5633025d-a543-4a2c-b70a-1aaf6fbe2c14" />

## Web Version Available!
There is a [web version](https://crudekings.kyzen7.dev/) of this application being developed by kyzen ([Github](https://github.com/kyzenlabs)/[Portfolio](https://kyzen7.dev/)) you can use if you wish. Thanks for saving me from more frontend design and conversion ♥️.

## Features
This calculator provides you with the following information:

### Production Stats
- How much Petrol/hour you're making
- How much Cash/hour you're making
- Real-time production rate calculations based on your current drills and boosts

### Goals & Planning
- How long it'll take you to reach a specific cash goal
- How long it'll take you to buy a certain number of a specific drill (For example, how long it takes for you to buy 3 Diamond Drills)
- How much money you'd make from selling your Petrol at certain shop prices and with different cash totem boost percentages

### Layout Designer
- **Visual grid layout** to design and plan your base layout
- **Drag-and-drop placement** of drills and refineries on a 15×20 grid
- **Zone-based multipliers**: Red zones (3x/5x), beige zones (2x), green zones (1x)
- **Real-time production calculations** showing pre-boost and post-boost rates based on drill placement and zone multipliers
- **Refinery storage tracking**: See total storage capacity from all placed refineries
- **Save/Load layouts** to persist your designs
- **Item rotation** support (press R to rotate items)
- **Support for all 22 drills and 17 refineries** with distinct icons and color coding

## Installation
Head to the [releases page](https://github.com/h263cs/OilEmpireCalculator/releases) and download the latest `OilEmpireCalculator.exe`, or build it from source.

## Building from Source
*Pre-requisites:*
 - Golang *1.21 or later*
 - Node.js *18 or later* (or Bun.js)
 - Wails CLI (`go install github.com/wailsapp/wails/v2/cmd/wails@latest`)

To build from source:
1. Clone the repository
2. Run `bun install` in the `frontend` directory to install frontend dependencies
3. Run `wails build -platform windows/amd64 -o OilEmpireCalculator.exe` to create the executable

The compiled executable will be available in `build/bin/OilEmpireCalculator.exe`.

## Usage
Using the calculator is straightforward with multiple useful features:

### Production Stats Tab
1. Hop in-game and check your current production rate
2. Input your production rate and other stats in the Production Stats tab
3. The calculator will display your hourly petrol and cash production

### Goals Tab
1. Set a cash goal or select a drill you want to buy
2. The calculator will tell you how long it takes to reach your goal
3. Test different cash totem boost percentages to plan your farming strategy

### Layout Designer Tab
1. Click on the **Drills** or **Refineries** tab to select an item
2. Click anywhere on the grid to place the selected item
3. Drag items to move them (they snap to 5×5 grid zones)
4. Press **R** to rotate an item
5. Double-click an item to delete it
6. Use **Save Layout** to persist your design to local storage
7. Use **Load Layout** to restore a previously saved design
8. View real-time production rates and storage capacity based on your placement

Items are color-coded and display icons:
- ⛏️ Drills (grayscale and colorful variants)
- 🏭 Refineries (warm tones)

### Data Management
All drill and refinery data is loaded from a centralized `data.json` file, making it easy to update when new items are added to the game.

## Notes
This project is open to pull-requests, feel free to submit features you'd like to see! I'm also willing to take suggestions in the Issues tab or in the [Oil Empire Discord](https://discord.com/invite/hdYnSvD5JV) server.
