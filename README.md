# Airbnb Clone — Build Week 2

A two-page Airbnb front-end, rebuilt from scratch as our second Build Week project at EPICODE. We tried to get as close as we could to how the real site feels: the home page with its category nav and city carousels, and a full listing page with a booking card. Everything is plain HTML, CSS, Bootstrap and vanilla JavaScript, no framework underneath.

The whole interface is in Italian, since that's the version of Airbnb we were copying.

## What's here

The project is two pages that share the same header, footer and script:

- **`buildWeek2/index.html`** — the home page (search, category nav, city carousels, experiences).
- **`buildWeek2/room.html`** — a single listing ("Minicasa Crabtree", Crabtree, Tasmania) with photos, host info, reviews, a map and a booking card.

The search button on the home page opens the room page in a new tab, which is how you move between the two.

## Features

### Home page

- Header with the logo, the category nav (*Tutto / Alloggi / Esperienze / Servizi*), a "host" button, and the language / hamburger menu buttons.
- The big search bar (*Dove / Date / Chi*) opens dropdown panels on desktop: suggested destinations, a two-month calendar (Giugno–Luglio 2026), and a guest counter. Picking something writes the choice back into the bar.
- The guest counter follows Airbnb's actual rules: up to 16 guests total, you need at least one adult before you can add children, and you can't remove the last adult while there are still children. The count stays in sync across the desktop panel, the mobile modal and the room page, because they all read from the same state.
- One horizontal carousel per city (Barcellona, Parigi, Firenze, Napoli, and a "nearby" row of Palermo listings), each with prev/next buttons that scroll a full page of cards at a time and disable themselves at the ends.
- A separate row of *Esperienze* category cards.
- Every carousel ends with a "Mostra tutto" collage card. Clicking it reveals a *Stays in &lt;city&gt;* header with **Available / Booked / All** filter pills, and on desktop and tablet it also brings up a hero image slideshow that rotates every 10 seconds.
- Sections fade up as you scroll down the page.
- A full footer with the usual Airbnb link columns, the language/currency switch and social icons.

### Mobile and tablet (≤ 840px)

- The desktop search bar collapses into a single search pill plus a scrollable category strip.
- Tapping the pill opens a fullscreen search modal built as an accordion: *Dove → Quando → Chi*. You can filter destinations as you type, pick a date, and set guests with the same counter, then *Cancella tutto* or *Ricerca*.
- The language and menu buttons open their own dropdown panels.

### Room page

- A photo grid (one large image plus four smaller ones) with the share / save header.
- Listing details: host card, self check-in, the "what you'll find" amenities, and where you'll sleep.
- A sticky booking card with check-in / check-out calendars (Luglio 2026) in dropdowns and a guest selector.
- Guest reviews, an embedded Google map of the area, the full host section and the house rules.
- On mobile the booking card becomes a bottom bar that opens a slide-up drawer.

## Built with

- HTML5 and CSS3 (custom stylesheets, plus the Bootstrap 5 grid and utilities)
- Vanilla JavaScript — no framework, all the interactivity lives in one file
- [Bootstrap 5](https://getbootstrap.com/) (bundled locally) for the grid, modal and dropdown components
- [Bootstrap Icons](https://icons.getbootstrap.com/) and [Ionicons](https://ionic.io/ionicons)
- Google Fonts — Raleway / Nunito Sans / Montserrat on the home page, Figtree on the room page
- A Google Maps embed for the location section

## Running it

There's no build step and nothing to install.

1. Clone the repo:
   ```bash
   git clone https://github.com/devHP-source/Build-Week-2.git
   ```
2. Open `buildWeek2/index.html` in your browser.

A local server (for example VS Code's **Live Server**) is the easiest way to run it, since the icon scripts and navigation between pages behave better over `http://` than over `file://`.

## Project structure

```
buildWeek2/
├── index.html          # home page
├── room.html           # listing / room detail page
├── css/
│   ├── style.css       # main styles (shared header & footer, home page)
│   ├── room-style.css  # room page styles
│   └── bootstrap*.css  # Bootstrap 5
├── js/
│   ├── script.js       # all the interactivity, shared by both pages
│   └── bootstrap*.js    # Bootstrap 5 bundle
└── assets/             # images, icons, logo
```

One thing worth knowing about the code: there are no `<script>` blocks inside the HTML and no per-page JS files. Everything is in `js/script.js`, and the parts that only belong to one page are guarded with simple checks (if the element isn't on the page, that block just returns and does nothing). That's why the same script can be loaded by both pages without breaking either one.

## The team

Built by Team 2:

- **Paulo Del Poso** — [@devHP-source](https://github.com/devHP-source)
- **Antonio Puca** — [@Antonio-Puca](https://github.com/Antonio-Puca)
- **Serena Melfa** — [@Serena-94](https://github.com/Serena-94)
- **Serena Napoletana** — [@serenap06](https://github.com/serenap06) — built the room page (`room.html` and `room-style.css`)

The code comments still carry traces of who did what: the footer came from Paulo, the calendar grew out of Antonio's version, and the experiences row was Serena Melfa's idea.

## A note

This is a learning project and isn't affiliated with Airbnb in any way. The Airbnb name, logo and look belong to Airbnb, Inc. All the listings, prices, reviews and host details are made up and used only to fill the layout.