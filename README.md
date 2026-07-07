# Tennis Tour Calendar

Tennis Tour Calendar is a WeChat Mini Program for browsing the 2026 ATP, WTA,
and Grand Slam tournament schedule by date.

## Features

- Browse tournament dates in a calendar view
- Show ATP, WTA, and Grand Slam events for the selected date
- Display tournament name, city/country, level, surface, and date range
- Include ATP and WTA year-end finals
- Switch between Chinese and English UI labels (with visual symmetry toggle)
- Swipe left or right to move between months
- Quickly jump to any month using the native WeChat Year-Month selector
- Add selected tournaments to the phone calendar when supported by the device

## Data

The active app data is in `data/tennis_events.js`.

Each event contains:

- `tour`: `ATP`, `WTA`, or `Grand Slam`
- `eventName`
- `city`, `country`
- `level`: `大满贯`, `年终总决赛`, `Masters 1000`, `1000`, `500`, or `250`
- `surface`: source surface value
- `surfaceCn`, `surfaceEn`: display values such as `硬地`/`HARD`, `红土`/`CLAY`, `草地`/`GRASS`
- `startDate`, `endDate`

## Development

Open this project with WeChat Developer Tools:

1. Choose "Import Project".
2. Select this project directory.
3. Use the AppID configured in `project.config.json`.
4. Preview and test the Mini Program in the simulator or on a real device.
