# `script.js` — Documentation

This is the single JavaScript file that powers the whole Airbnb-clone project. It runs on **both pages** (`index.html` and `room.html`) and there is **no page-specific JS file** — instead, each block guards itself (`if (!element) return`), so code meant for one page simply does nothing on the other.

> Note: this document is in English for clarity, but the code and its comments are in Italian. Tell me if you'd prefer the README in Italian too.

---

## Table of contents

1. [How the file is organized](#1-how-the-file-is-organized)
2. [Core design ideas](#2-core-design-ideas)
3. [Data (the "database")](#3-data-the-database)
4. [HTML render helpers](#4-html-render-helpers)
5. [Guest counter system](#5-guest-counter-system)
6. [Calendar day selection](#6-calendar-day-selection)
7. [Desktop search panels (navbar)](#7-desktop-search-panels-navbar)
8. [Category synchronization](#8-category-synchronization)
9. [Search button](#9-search-button)
10. [Mobile search modal](#10-mobile-search-modal)
11. [Language & hamburger menus](#11-language--hamburger-menus)
12. [Card carousels](#12-card-carousels)
13. [Booking drawer (mobile, room page)](#13-booking-drawer-mobile-room-page)
14. [Room check-in / check-out calendars](#14-room-check-in--check-out-calendars)
15. [Room guests counter](#15-room-guests-counter)
16. ["Mostra tutto" / Stays header + hero](#16-mostra-tutto--stays-header--hero)
17. [Scroll reveal animation](#17-scroll-reveal-animation)
18. [My honest opinion](#18-my-honest-opinion)

---

## 1. How the file is organized

The file has no build step and no modules. It is read top-to-bottom:

1. **Data** at the top (`destinations`, `monthsData`, `guestTypes`, `guestState`).
2. **Pure render helpers** that return HTML strings.
3. **Guest business rules** (`MAX_GUESTS`, `canIncrementGuest`, `canDecrementGuest`, `wireGuestCounters`).
4. **Feature blocks**, each wired to the DOM. Most are wrapped in a `setupX()` function that is **called immediately** at the bottom of its block (es: `setupBookingDrawer()`, `setupStaysHeader()`, `setupScrollReveal()`).

Everything lives in the top-level (module) scope, so functions and constants are effectively global to the page.

---

## 2. Core design ideas

Three patterns repeat across the file — understanding them makes the rest obvious:

- **One shared source of truth for guests.** `guestState` is a single object holding `adulti` and `bambini`. The desktop panel, the mobile modal, and the room booking card all read from and write to the *same* object, so a change in one place is reflected everywhere.
- **"Render then wire".** Many blocks first inject an HTML string (via `renderGuestRows()`, `renderCalendar()`, etc.) and then attach event listeners to the freshly injected nodes. When state may have changed elsewhere, the block **re-renders and re-wires** on open so the displayed numbers and the disabled state of `+`/`-` buttons stay correct.
- **Defensive guard clauses.** Almost every DOM lookup is followed by `if (!el) return`. This is what lets a single file serve two different pages without throwing errors when an element only exists on one of them.

---

## 3. Data (the "database")

### `destinations`
Array of **11** objects, each `{ title:, subtitle: }` (e.s. Parigi, Barcellona, Firenze..). Used to build the suggested-destinations lists on both desktop and mobile.

### `monthsData`
Array of **2** month objects used to build the search calendar:
```js
{ name, days, month, year }
```
- `name` — display label (`"Giugno"`, `"Luglio"`).
- `days` — number of days in the month.
- `month` — the **0-based** month index (Giugno = 5, Luglio = 6). Used to compute which weekday the 1st falls on.
- `year` — `2026`.

### `guestTypes`
Array of **2** objects describing the counter rows: `{ key, label, sub }` for `adulti` ("Da 13 anni in su") and `bambini` ("Da 2 a 12 anni"). `key` is used both as the object key into `guestState` and as a `data-guest` attribute.

### `guestState`
The **mutable shared state**: `{ adulti: 0, bambini: 0 }`. This is the single source of truth for how many guests are selected, read/written by every guest counter on the site.

### `MAX_GUESTS`
Constant `16` — the maximum total guests, mirroring Airbnb's cap. Used by the increment rule.

---

## 4. HTML render helpers

These are **pure functions**: they take data and return an HTML **string** (they do not touch the DOM themselves).

### `renderWeekdays()`
Returns the weekday header as `<span>` elements: `L M M G V S D` (Italian: Lunedì, Martedì, Mercoledì, Giovedì, Venerdì, Sabato, Domenica — the two `M`s are intentional).

### `renderMonth(month)`
Builds the HTML for **one** month grid from a `monthsData` entry:
- Computes `firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7`. `getDay()` returns 0 = Sunday … 6 = Saturday; the `+6 % 7` shift converts it to a **Monday-first** index (Monday = 0 … Sunday = 6).
- Inserts that many empty `.day-empty` cells so day **1** lands under the correct weekday column.
- Renders one `<button class="day-btn">` per day, each carrying `data-day` and `data-month` (the month name).
- Returns a `.month` block containing the title, the weekday header, and the day grid.

### `renderCalendar()`
Maps every month in `monthsData` through `renderMonth` and wraps them in a `.months-container`. This is the full search calendar (Giugno + Luglio 2026).

### `renderGuestRows()`
Maps `guestTypes` into counter rows. Each row shows the label/subtitle and a `-` / value / `+` counter, where the value is the **current** `guestState[key]`. Buttons carry accessible `aria-label`s ("Aumenta Adulti", etc.).

### `renderDestinationList()`
Maps `destinations` into `<li class="dest-item">` items (icon + title + subtitle), each tagged with `data-dest="<index>"` so click handlers can look the destination back up.

---

## 5. Guest counter system

### `canIncrementGuest(key)`
Returns `true` if a guest can be added. Rules:
- total (`adulti + bambini`) is below `MAX_GUESTS`, **and**
- you are **not** trying to add a child (`bambini`) while there are **0 adults** (you need at least one adult first).

### `canDecrementGuest(key)`
Returns `true` if a guest can be removed. Rules:
- the current count for that key is `> 0`, **and**
- you are **not** removing the **last adult** while children still remain (`adulti === 1 && bambini > 0`).

### `wireGuestCounters(scope, onChange)`
The reusable engine behind every guest counter. Given a container element `scope` and an optional `onChange` callback:
- Finds every `.guest-row` inside `scope`.
- Defines an internal `refresh()` that, for each row, syncs the displayed number to `guestState` and enables/disables the `-` / `+` buttons according to `canDecrementGuest` / `canIncrementGuest`.
- Binds click handlers: `-` decrements (if allowed), `+` increments (if allowed); each then calls `refresh()` and, if provided, `onChange()` (used to update the "Chi" / guests summary text elsewhere).
- Calls `refresh()` once at the end so the initial UI matches `guestState` (es: the children `+` starts disabled when there are no adults).

Because it operates on whatever `scope` you pass, the **same** function drives the desktop panel, the mobile modal, and the room booking card.

---

## 6. Calendar day selection

### `selectDay(root, dayBtn)`
Enforces single-selection inside one calendar: removes `.selected` from any currently selected day within `root`, then adds `.selected` to the clicked `dayBtn`. Used by the desktop calendar, the mobile modal calendar, and the room check-in/out calendars.

---

## 7. Desktop search panels (navbar)

Variables:
- `dropdown` — `#dropdown-container`, the stable container where desktop panels are injected.
- `searchBar` — `.search-bar` element.
- `desktopPanels` — an object mapping a trigger button id to a function returning that panel's HTML:
  - `"where-btn"` → suggested destinations (first 5, with staggered `fade-item` animation delays).
  - `"date-btn"` → the calendar (`renderCalendar()`).
  - `"guest-btn"` → the guest rows (`renderGuestRows()`).
- `openDesktopPanel` — tracks which panel id is currently open (`null` when none).

Functions:

### `showDesktopPanel(id)`
Opens the requested panel. If it's already open, it **toggles closed** instead. On open it also closes the language and hamburger menus, injects the panel HTML, and adds `.open`. Special wiring:
- For `where-btn`: clicking a suggested destination writes its name into the "Dove" summary and closes the panel.
- For `guest-btn`: wires the counters via `wireGuestCounters`, and keeps the navbar "Chi" summary (`#guest-btn p`) in sync — showing `"N ospiti"` / `"N ospite"` (singular vs plural) or `"Aggiungi ospiti"` when empty.

### `closeDesktopPanel()`
Clears `openDesktopPanel` and removes `.open` from the dropdown.

Event wiring — inside `if (dropdown && searchBar)` (runs only if **both** exist):
- Each panel trigger button gets a click listener that stops propagation and calls `showDesktopPanel`.
- A document-level click closes the panel when clicking **outside** both the dropdown and the search bar.
- A `matchMedia("(max-width: 840px)")` listener closes the desktop panel when the viewport drops to mobile.

Day selection — in a **separate** block guarded by `if (dropdown)` alone (so it runs even if `.search-bar` is absent):
- A **delegated** click listener on `#dropdown-container` handles day selection in the date panel — attached to the stable container so it keeps working even though the panel's inner HTML is regenerated on each open. It calls `selectDay` and writes the chosen date into the "Quando" summary (`#date-btn p`).

---

## 8. Category synchronization

### `setupDependentCategories(selectors)`
Keeps several parallel category rows in sync. Given an array of selectors, it collects each into a group (dropping empty ones), then:
- Clicking an item at index `i` in any group toggles the `active` class on the item at the **same index** in **every** group.

Called with `[".nav-item", ".mobile-cat", ".modal-cat"]`, so selecting a category on desktop, tablet, mobile, or in the modal highlights the matching category everywhere. (It relies on the groups being index-aligned — see the opinion section.)

---

## 9. Search button

Every `.search-btn` opens the listing page in a **new tab** via `window.open("./room.html", "_blank")` — deliberately using JS instead of an `<a>` tag.

---

## 10. Mobile search modal

Guarded by `const searchModalEl = document.getElementById("searchModal")`; the whole block runs only if the modal exists.

On load it populates the three sections with the render helpers (`renderDestinationList()`, `renderCalendar()`, `renderGuestRows()`) and sets up an **accordion** ("Dove / Quando / Chi"):

- `openAccPanel(panel)` — closes all `.acc-panel`s and opens the given one (one open at a time). Each panel's `.acc-summary` header toggles it open.
- `show.bs.modal` (Bootstrap event) — on every reopen, resets to the "Dove" panel, **re-renders and re-wires** the guest rows (so numbers stay consistent with `guestState` even if it was changed from the desktop panel), refreshes the "Chi" value, and reapplies the destination filter.
- Clicking a destination sets the "Dove" value (and the input), then advances to "Quando".
- Clicking a calendar day selects it, sets the "Quando" value, then advances to "Chi".
- `applyDestFilter()` — filters the suggested destinations live, showing only those whose title contains the typed text (bound to the input's `input` event).
- `updateChiValue()` — updates the "Chi" summary text (`"N ospiti"` / `"Aggiungi ospiti"`).
- `#modal-clear` — **reset**: zeroes `guestState`, re-renders/re-wires guests, and resets every summary back to its placeholder (Dove/Quando/Chi), including the desktop "Chi" summary.
- `#modal-search` — logs the current selection (`{ destinazione, date, ospiti }`) to the console and closes the modal via Bootstrap. **This is where a real app would perform the search** — currently it only logs.
- A `matchMedia("(max-width: 840px)")` listener hides the modal if the viewport grows to desktop/tablet while it's open (the modal is mobile-only).

---

## 11. Language & hamburger menus

Two independent navbar dropdowns:

- `languageBtn` / `languageDropdown` — clicking toggles `.open` and injects the "Lingua e paese" menu (country and language buttons), or clears it when closing. A document-level click closes it when clicking outside.
- `menuBtn` / `menuDropdown` — clicking toggles `.open` and injects the hamburger menu (Centro assistenza, "Inizia a ospitare" card, invite/co-host/gift-card, "Accedi o registrati"), or clears it. A document-level click closes it when clicking outside.

Each menu's markup is stored as a template string and injected on open / removed on close.

---

## 12. Card carousels

For every `.places-section`, this block wires an independent horizontal carousel:
- Looks up the `.airbnb-track` and the `.btn-prev` / `.btn-next` buttons; bails if any are missing.
- `getScrollAmount()` — measures the **first visible** card (skipping cards with `offsetWidth === 0`, which happens when a filter hides the first card — otherwise the width would be `NaN` and `scrollBy` would do nothing), works out how many fit in view, and returns `cardWidth × visibleCount` as the scroll distance.
- Prev/Next buttons scroll the track by that amount with smooth behavior.
- `updateButtons()` — disables `prev` at the start and `next` at the end of the scroll range. Re-runs on `scroll` and on window `resize`, and once at setup.

---

## 13. Booking drawer (mobile, room page)

### `setupBookingDrawer()`
Wires the mobile bottom bar that opens/closes the booking card as a drawer:
- Looks up the trigger (`.mobile-booking-btn`), the drawer (`#check-dates`), the backdrop, and the close button; bails if the essential ones are missing (so it no-ops on `index.html`).
- `open()` adds `.drawer-open` / shows the backdrop / locks body scroll; `close()` reverses it.
- Opens on button click; closes on the close button or backdrop click.
- A `matchMedia("(max-width: 840px)")` listener closes the drawer when the viewport grows past mobile.

---

## 14. Room check-in / check-out calendars

### `fillRoomCalendars()`
Fills the check-in / check-out dropdowns (`.room-date-dd`) with a **Luglio 2026** calendar:
- Builds the days the same way as `renderMonth` (empty leading cells via `(new Date(2026, 6, 1).getDay() + 6) % 7`, then 31 day buttons — note these buttons carry only `data-day`, no `data-month`).
- Injects the same calendar into every `.room-date-dd`, and on day click: selects the day, writes `"<day> luglio"` into that field's toggle summary, and closes the Bootstrap dropdown.

> Heads-up: this month is **hardcoded** here rather than reusing `monthsData` / `renderMonth` (see the opinion section).

---

## 15. Room guests counter

### `setupRoomGuests()`
The guest counter inside the room booking card:
- Bails immediately if `.room-guest-dd` doesn't exist (so it no-ops on `index.html`).
- `updateSummary()` — updates the dropdown toggle's label with `"N ospiti"` / `"Aggiungi ospiti"`.
- `render()` — (re)injects the guest rows and re-wires them with `wireGuestCounters`.
- On the Bootstrap `show.bs.dropdown` event it re-renders and re-updates, so the numbers stay consistent with `guestState` even if it was changed elsewhere (es: in the search modal).

---

## 16. "Mostra tutto" / Stays header + hero

### `setupStaysHeader()`
The largest feature. It powers the "Mostra tutto" flow that reveals a `Stays in <city>` header and filters listings. It bails unless the header, city/count elements, and at least one `.card-show-all` exist.

Inside it manages several things:

- **Hero slideshow** — rotates `.hero-img` images inside `#hero` every **10 seconds** (`startHero` / `stopHero`), but only on desktop/tablet (`min-width: 841px`), only if there are at least 2 images, and **not** when the user prefers reduced motion. Crossing the 841px breakpoint starts/stops the hero and toggles its `aria-hidden` accordingly.
- **`listingCols(section)`** — returns the listing card columns of a section, excluding the "Mostra tutto" card.
- **Deterministic availability** — assigns each card `data-status` of `booked` or `available` using `i % 3 === 2` (every third card is "booked"). This is a demo stand-in for real availability.
- **`applyFilter(section, filter)`** — shows/hides cards by status (`all` / `available` / `booked`), updates the visible count, and dispatches a `resize` event so the carousel buttons recompute.
- **`setActivePill(filter)`** — highlights the active filter pill.
- **`openFor(card)`** — the click target of a "Mostra tutto" card: restores any previously filtered section, sets the city name, resets to the "all" filter, opens the header, optionally reveals the hero (desktop only), and smooth-scrolls to the hero (or the header on mobile).
- **Accessibility** — the "Mostra tutto" cards respond to both click and keyboard (Enter / Space), with `preventDefault` so Space doesn't scroll the page.
- The filter **pills** call `setActivePill` + `applyFilter` on the active section.

### 17. Scroll reveal animation

### `setupScrollReveal()`
Adds a scroll-triggered fade-up to each `.places-section` using `IntersectionObserver` (bails if unsupported or if there are no sections):
- Tracks scroll **direction** via a passive `scroll` listener (`scrollingDown`).
- When a section enters view it gets `.is-visible`, and `.reveal-down` is toggled on **only** if you were scrolling **down** (so the fade-up only plays on downward entry).
- A section is reset (classes removed) **only** when it leaves through the **bottom** (scrolling up) — leaving through the top keeps it visible, so scrolling back up doesn't make it "pop" in again.

---

## 18. My honest opinion

You asked for honesty, so here it is — the good and the rough edges.

### What's genuinely good
- **The shared-`guestState` + "render then re-wire" pattern is the strongest idea in the file.** Keeping one source of truth and rebuilding the counters on open is exactly how you avoid the classic bug where three different guest widgets drift out of sync. Well done.
- **The guard clauses are disciplined.** `if (!el) return` everywhere is what makes one file safely serve two pages. It's not glamorous but it's correct.
- **Real accessibility touches**: `aria-label` on counters, `aria-hidden` toggling on the hero, keyboard support (Enter/Space) on the "Mostra tutto" cards, and respecting `prefers-reduced-motion`. Most bootcamp projects skip all of this.
- **Event delegation on the stable `#dropdown-container`** for day clicks is a genuinely thoughtful solution to "the inner HTML gets regenerated."
- **The `offsetWidth === 0` guard in `getScrollAmount`** shows you actually thought about the hidden-card edge case. That's a subtle bug most people would only find at runtime.

### Where I'd push back / things to improve
- **Repetition of the "N ospiti / N ospite" summary logic.** The exact same ternary appears in at least four places (`showDesktopPanel`, `updateChiValue`, `setupRoomGuests`, and the modal reset). One tiny helper — es: `guestSummary(total)` returning the string — would remove the duplication and guarantee they never diverge.
- **`fillRoomCalendars` hardcodes Luglio 2026 and 31 days** instead of reusing `renderMonth`/`monthsData`. The rest of the file is nicely data-driven, so this one is inconsistent. Reusing `renderMonth` (or adding the month to `monthsData`) would be cleaner and keep the two calendars from drifting. The `(getDay() + 6) % 7` first-weekday math is also duplicated between here and `renderMonth`.
- **`setupStaysHeader` does too much.** Hero slideshow, availability tagging, filtering, pills, and scrolling all live in one ~130-line function. It works, but splitting the hero slideshow into its own `setupHero()` would make it much easier to read and test.
- **`#modal-search` only `console.log`s.** That's fine for a demo, but it's worth a comment (or a small "coming soon") so a reviewer doesn't think the search is broken. Also, leftover `console.log` is something to remember to strip for a "final" version.
- **`setupDependentCategories` assumes the groups are index-aligned.** If `.nav-item`, `.mobile-cat`, and `.modal-cat` ever have different counts or a different order, clicking will highlight the wrong category in another group. It's fine as long as the markup stays parallel — just a fragility worth knowing about.
- **Everything is global/top-level.** For a project this size that's acceptable (and consistent with your "single `script.js`" approach), but wrapping the whole file in one IIFE would avoid leaking ~30 names onto `window` and prevent accidental clashes with Bootstrap or future scripts.
- **Tiny nit:** the comment on line 1 says `DESTINATIONZI` (typo for "destinazioni"). Harmless, but since you asked for no mistakes — that one's in a comment, not the code.

### Bottom line
This is **above-average bootcamp code**: the state management and accessibility choices are things I'd normally expect from someone more experienced. Nothing here is broken. The improvements above are about **reducing duplication and splitting large functions** — polish, not rescue. If you only do one thing, extract the guest-summary string helper; it's the cheapest win and it kills the most copy-paste.
