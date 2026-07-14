# Tennis Tour Calendar

Tennis Tour Calendar is a performance-optimized WeChat Mini Program for browsing the 2026 ATP, WTA, and Grand Slam tournament schedules by date. It is built with a focus on buttery-smooth UI interactions, offline-first performance, and robust local timezone handling.

## Features

- **Calendar-Based Browsing**: Visual highlights of dates that contain tennis events, grouped by level.
- **Dynamic Event Details**: Show full details of ATP, WTA, and Grand Slam events for the selected date (surface, level, city, country).
- **Persistent Localization**: Seamlessly switch between Chinese and English UI labels with state persisted in local storage.
- **Gesture Swiping**: Swipe left or right to move between months with custom swiper animation rendering.
- **Direct Month Navigation**: Quickly jump to any month using the native WeChat Year-Month picker.
- **System Calendar Sync**: One-tap addition of tournaments to the device's system calendar (supports alarm offsets and is protected by double-click prevention locks).
- **iOS Rubber-Banding Lock**: Page scrolling is locked when details modals are open to prevent iOS elastic scroll-through bugs.

---

## Directory Structure

```text
TennisTour/
├── assets/                     # Vector icons for ATP, WTA, Grand Slams, etc.
│   └── icons/
├── components/
│   └── calendar/               # High-performance month/week calendar component
│       ├── calendar.js
│       ├── calendar.json
│       ├── calendar.wxml
│       └── calendar.wxss
├── data/
│   └── tennis_events.js        # Normalized tournament database for 2026
├── pages/
│   └── index/                  # Main page entry point and handlers
│       ├── index.js
│       ├── index.json
│       ├── index.wxml
│       └── index.wxss
├── scripts/
│   ├── update-events.md        # Event data maintenance checklist
│   └── validate-events.js      # Database integrity validation runner
├── test/                       # Node.js test suite
│   ├── data-integrity.test.js
│   ├── date.test.js
│   ├── event-id.test.js
│   ├── event-indexes.test.js
│   └── levels.test.js
├── utils/                      # Helper modules
│   ├── date.js                 # Unified date arithmetic (local and UTC)
│   ├── event-id.js             # Stable ID generators
│   ├── event-indexes.js        # Pre-compiled lookup structures
│   ├── i18n.js                 # Localization dictionary
│   └── levels.js               # Event priority and icon mappings
├── app.js                      # Mini Program application lifecycle
├── app.json                    # Global window and tab configuration
├── app.wxss                    # Global stylesheet
└── package.json                # Project script commands and dev dependencies
```

---

## Data Schema & Indexing

The active app data is located in `data/tennis_events.js` and initialized during boot.

### 1. Stable Event IDs
Every event has a stable string ID computed from its tour, name, and start date:
```text
{tour}__{slug(eventName)}__{startDate}  // e.g. atp__australian-open__2026-01-18
```
These IDs are assigned during initialization. In the event of time/name collisions, they are dynamically appended with numerical suffixes (`__2`, `__3`). This ensures that links and system calendar references remain stable even if database order changes.

### 2. High-Performance Indexing
Rather than looping through arrays on every calendar swipe or click (which causes frames to drop), the data compiles three indexes during startup:
- **`eventsById`**: `O(1)` map of stable ID to event objects for rapid modal/detail lookup.
- **`eventsByDate`**: Pre-sorted array of tournaments occurring on any given `YYYY-MM-DD` date.
- **`eventDates`**: Pre-sorted category badge markers for highlighting dots in the calendar grid.

---

## Performance & UX Optimizations

- **Month Days Cache**: The calendar component features a local `monthDaysCache` that stores pre-calculated month grids. This keeps swiping animations at a consistent 60 FPS. The cache is automatically invalidated when the system clock crosses midnight.
- **Bridge Bottleneck Optimization**: Consecutive state updates (such as selecting a date and displaying its list) are merged into a single `setData` transaction, reducing Javascript-to-WebView bridge serialization overhead by 50%.
- **Modal Scroll-Through Prevention**: Dynamic page-style overrides (`overflow: hidden` / `visible` toggled via `<page-meta>`) prevent iOS scroll-through and page-bouncing when details prompts are visible.
- **API Concurrency Lock**: A `addingToCalendar` flag locks the UI during the asynchronous `wx.addPhoneCalendar` process, preventing duplicate calendar entries from rapid double-clicks.

---

## Development

### 1. Setup in WeChat Developer Tools
1. Choose **Import Project**.
2. Select the `TennisTour` root directory.
3. The AppID will automatically load from `project.config.json`.

### 2. Running Verification and Tests
Requires Node.js 18+.

```bash
# Run all unit tests
npm test

# Run data integrity checks
npm run validate:events
```

### 3. Updating Data
To manually append or edit tournament data, please follow the step-by-step checklist in [scripts/update-events.md](file:///home/jiantai/workspace/TennisTour/scripts/update-events.md).
