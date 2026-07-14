# Updating tennis event data

Active app data lives in `data/tennis_events.js`.

## Manual update checklist

1. Edit the `rawEvents` tuples:
   `[tour, eventName, city, country, level, surface, startDate, endDate]`
2. Add Chinese names to `tournamentNameMap` / `cityCnMap` / `countryCnMap` when needed.
3. Run validation:

```bash
npm run validate:events
```

4. Run unit tests:

```bash
npm test
```

5. Smoke-test in WeChat DevTools (month swipe, language toggle, add-to-calendar).

## Stable event ids

Ids are generated as:

```text
{slug(tour)}__{slug(eventName)}__{startDate}
```

Example: `atp__australian-open__2026-01-18`

They do **not** depend on array order. Renaming a tournament or changing its start date will change the id.

## Data sources

- **WTA**: public WTA tournaments calendar/API when available
- **ATP**: published ATP Tour calendar; TBD/placeholder rows are intentionally omitted

There is no automated full scrape yet. Keep this file as the process entrypoint for future fetch scripts.
