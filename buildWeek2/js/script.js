const destinations = [ /* DATI per le DESTINATIONZI (possiamo modificarli anche dopo) */
  {
    title: "Nelle vicinanze",
    subtitle: "Scopri le opzioni intorno a te",
  },
  {
    title: "Parigi, Francia",
    subtitle:
      "Perché hai aggiunto alloggi nei preferiti per questa località: Parigi",
  },
  {
    title: "Barcellona, Spagna",
    subtitle: "Famosa meta balneare",
  },
  {
    title: "Firenze, Toscana",
    subtitle: "Ideale per un weekend fuori porta",
  },
  {
    title: "Napoli, Campania",
    subtitle: 'Per attrazioni come "Parco archeologico di Pompei"',
  },
  {
    title: "Città di Londra, Regno Unito",
    subtitle: "Per la sua animata vita notturna",
  },
  {
    title: "Torino, Piemonte",
    subtitle: "Per la splendida architettura",
  },
  {
    title: "Budapest, Ungheria",
    subtitle: "Per la sua eccezionale cucina",
  },
  {
    title: "Praga, Cechia",
    subtitle: 'Per attrazioni come "Castello di Praga"',
  },
  {
    title: "Valencia, Spagna",
    subtitle: "Per la splendida architettura",
  },
  {
    title: "Vienna, Austria",
    subtitle: "Per la sua eccezionale cucina",
  },
];

const monthsData = [ /* DATI per i MESI */
  {
    name: "Giugno",
    days: 30,
    month: 5, // indice mese 0-based (Giugno = 5), per calcolare il primo weekday
    year: 2026,
  },
  {
    name: "Luglio",
    days: 31,
    month: 6, // Luglio = 6
    year: 2026,
  },
];

const guestTypes = [ /* DATI per i TIPI di guest */
  {
    key: "adulti",
    label: "Adulti",
    sub: "Da 13 anni in su",
  },
  {
    key: "bambini",
    label: "Bambini",
    sub: "Da 2 a 12 anni",
  },
];

const guestState = { // lo stato inizio
  adulti: 0,
  bambini: 0,
};

/* ho migliorato il codice di Antonio per far facilitare il render di HTML */
function renderWeekdays() { // SETTIMANE
  return ["L", "M", "M", "G", "V", "S", "D"]
    .map(function (d) {
      return `<span>${d}</span>`;
    })
    .join("");
}

function renderMonth(month) { // MESI
  let days = "";
  // celle vuote iniziali per allineare il giorno 1 alla colonna del weekday giusto (L=0 ... D=6)
  const firstWeekday = (new Date(month.year, month.month, 1).getDay() + 6) % 7;
  for (let i = 0; i < firstWeekday; i++) {
    days += `<span class="day-empty" aria-hidden="true"></span>`;
  }
  for (let i = 1; i <= month.days; i++) {
    days += `<button class="day-btn" type="button" data-day="${i}" data-month="${month.name}">${i}</button>`;
  }
  return `
    <div class="month">
      <h4>${month.name}</h4>
      <div class="weekdays">${renderWeekdays()}</div>
      <div class="days-grid">${days}</div>
    </div>`;
}

function renderCalendar() { // CALENDARIO
  return `<div class="months-container">${monthsData.map(renderMonth).join("")}</div>`;
}

function renderGuestRows() { // GUEST
  return guestTypes
    .map(function (g) {
      return `
    <div class="guest-row" data-guest="${g.key}">
      <div>
        <div class="guest-label">${g.label}</div>
        <div class="guest-sub">${g.sub}</div>
      </div>
      <div class="counter">
        <button class="counter-minus" type="button" aria-label="Diminuisci ${g.label}">-</button>
        <span class="counter-value">${guestState[g.key]}</span>
        <button class="counter-plus" type="button" aria-label="Aumenta ${g.label}">+</button>
      </div>
    </div>`;
    })
    .join("");
}

function renderDestinationList() { // DESTINAZIONI
  return destinations
    .map(function (d, i) {
      return `
    <li class="dest-item" data-dest="${i}">
      <span class="dest-icon"><i class="bi bi-geo-alt"></i></span>
      <div class="dest-text">
        <h6>${d.title}</h6>
        <p>${d.subtitle}</p>
      </div>
    </li>`;
    })
    .join("");
}

/* una funzione di condizione sui GUEST */
const MAX_GUESTS = 16; // limite ospiti totali, come su Airbnb
/* Regole ospiti:
   - per aggiungere bambini serve almeno 1 adulto
   - il totale non può superare MAX_GUESTS
   - non si può togliere l'ultimo adulto se ci sono ancora bambini */
function canIncrementGuest(key) {
  return (
    guestState.adulti + guestState.bambini < MAX_GUESTS && !(key === "bambini" && guestState.adulti === 0)
  );
}
function canDecrementGuest(key) {
  return (
    guestState[key] > 0 &&
    !(key === "adulti" && guestState.adulti === 1 && guestState.bambini > 0)
  );
}

/* Collega i pulsanti +/- di un contenitore allo stato condiviso.
   onChange() viene richiamato dopo ogni variazione (per aggiornare i riepiloghi). */
function wireGuestCounters(scope, onChange) {
  const rows = Array.from(scope.querySelectorAll(".guest-row"));

  // Allinea numeri mostrati e stato abilitato dei pulsanti alle regole correnti
  function refresh() {
    rows.forEach(function (row) {
      const key = row.dataset.guest;
      row.querySelector(".counter-value").textContent = guestState[key];
      row.querySelector(".counter-minus").disabled = !canDecrementGuest(key);
      row.querySelector(".counter-plus").disabled = !canIncrementGuest(key);
    });
  }

  rows.forEach(function (row) {
    const key = row.dataset.guest;

    row.querySelector(".counter-minus").addEventListener("click", function () {
      if (!canDecrementGuest(key)) return;
      guestState[key]--;
      refresh();
      if (onChange) onChange();
    });
    row.querySelector(".counter-plus").addEventListener("click", function () {
      if (!canIncrementGuest(key)) return;
      guestState[key]++;
      refresh();
      if (onChange) onChange();
    });
  });

  refresh(); // stato iniziale coerente con guestState (es. "+" bambini disabilitato senza adulti)
}

/* Calendario, selezione di un giorno dentro un calendario.
Toglie .selected dagli altri giorni e lo applica a quello cliccato. */
function selectDay(root, dayBtn) {
  root.querySelectorAll(".day-btn.selected").forEach(function (b) {
    b.classList.remove("selected");
  });
  dayBtn.classList.add("selected");
}

/* NAVBAR - Gestione pulsante attivo */
const dropdown = document.getElementById("dropdown-container");
const searchBar = document.querySelector(".search-bar");

const desktopPanels = {
  "where-btn": function () {
    return `
    <div class="destination-menu">
      <h4 class="fade-item" style="animation-delay:0s">Destinazioni suggerite</h4>
      ${destinations
        .slice(0, 5)
        .map(function (d, i) {
          return `<button class="destination-btn fade-item" type="button" style="animation-delay:${(i + 1) * 0.12}s">${d.title}</button>`;
        })
        .join("")}
    </div>`;
  },
  "date-btn": function () {
    return `<div class="calendar-menu">${renderCalendar()}</div>`;
  },
  "guest-btn": function () {
    return `<div class="guest-menu">${renderGuestRows()}</div>`;
  },
};

let openDesktopPanel = null;

function showDesktopPanel(id) {
  if (openDesktopPanel === id) {
    closeDesktopPanel();
    return;
  }
  openDesktopPanel = id;

  if (languageDropdown) { // chiudi gli altri menu (lingua / hamburger) quando si apre un pannello di ricerca
    languageDropdown.classList.remove("open");
    languageDropdown.innerHTML = "";
  }
  if (menuDropdown) {
    menuDropdown.classList.remove("open");
    menuDropdown.innerHTML = "";
  }

  dropdown.innerHTML = desktopPanels[id]();
  dropdown.classList.add("open");

  if (id === "where-btn") { // Destinazioni per desktop scrivono "Dove" e chiudono il pannello
    const summary = document.querySelector("#where-btn p");
    dropdown.querySelectorAll(".destination-btn").forEach(function (b) {
      b.addEventListener("click", function () {
        summary.textContent = b.textContent;
        closeDesktopPanel();
      });
    });
  }

  if (id === "guest-btn") { // Contatori ospiti per desktop e aggiornano il riepilogo "Chi" nella barra
    const summary = document.querySelector("#guest-btn p");
    const refreshChi = function () {
      const total = guestState.adulti + guestState.bambini;
      summary.textContent =
        total > 0
          ? `${total} ospit${total > 1 ? "i" : "e"}`
          : "Aggiungi ospiti";
    };
    refreshChi(); // allinea il riepilogo allo stato condiviso all'apertura
    wireGuestCounters(dropdown, refreshChi);
  }
}

function closeDesktopPanel() {
  openDesktopPanel = null;
  dropdown.classList.remove("open");
}

if (dropdown && searchBar) {
  Object.keys(desktopPanels).forEach(function (id) { // https://it.javascript.info/object
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", function (e) {
      e.stopPropagation();
      showDesktopPanel(id);
    });
  });

  document.addEventListener("click", function (e) {
    if (!openDesktopPanel) return; // Se clicchiamo fuori dal modale, si chiude
    if (!dropdown.contains(e.target) && !searchBar.contains(e.target)) {
      closeDesktopPanel();
    }
  });

  window.matchMedia("(max-width: 840px)").addEventListener("change", function (e) { // Passando a mobile chiudi il pannello desktop, altrimenti lo stato resta "aperto"
    if (e.matches) closeDesktopPanel();
  });
}

/* Pannello "Date" su desktop, selezione di un giorno nel calendario su #dropdown-container
(elemento stabile) così funziona anche se il contenuto viene rigenerato a ogni apertura. */
if (dropdown) {
  dropdown.addEventListener("click", function (e) {
    const dayBtn = e.target.closest(".day-btn");
    if (!dayBtn || !dropdown.contains(dayBtn)) return;
    selectDay(dropdown, dayBtn);
    const summary = document.querySelector("#date-btn p");
    if (summary) summary.textContent = `${dayBtn.dataset.day} ${dayBtn.dataset.month}`;
  });
}

/* Selezionando una categoria nella navbar, la STESSA categoria diventa
   reponsive sia per: Desktop, tablet, mobile e modale. */
function setupDependentCategories(selectors) {
  const groups = selectors
    .map(function (sel) {
      return Array.from(document.querySelectorAll(sel));
    })
    .filter(function (group) {
      return group.length > 0;
    });

  const selectIndex = function (index) {
    groups.forEach(function (group) {
      group.forEach(function (el, i) {
        el.classList.toggle("active", i === index);
      });
    });
  };

  groups.forEach(function (group) {
    group.forEach(function (el, i) {
      el.addEventListener("click", function () {
        selectIndex(i);
      });
    });
  });
}
setupDependentCategories([".nav-item", ".mobile-cat", ".modal-cat"]);

/* Pulsante di ricerca: apre la pagina room in una nuova scheda non usando il tag <a>*/
document.querySelectorAll(".search-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    window.open("./room.html", "_blank");
  });
});

/* SEARCH MODALE per mobile */
const searchModalEl = document.getElementById("searchModal");

if (searchModalEl) {
  const doveValue = searchModalEl.querySelector("#dove-value");
  const doveInput = searchModalEl.querySelector("#modal-destination-input");
  const quandoValue = searchModalEl.querySelector("#quando-value");
  const chiValue = searchModalEl.querySelector("#chi-value");
  const destListEl = searchModalEl.querySelector("#modal-dest-list");
  const calendarEl = searchModalEl.querySelector("#modal-calendar");
  const guestsEl = searchModalEl.querySelector("#modal-guests");
  const panels = searchModalEl.querySelectorAll(".acc-panel");

  /* Popolamento contenuti */
  destListEl.innerHTML = renderDestinationList();
  calendarEl.innerHTML = renderCalendar();
  guestsEl.innerHTML = renderGuestRows();

  function openAccPanel(panel) { // Accordion: un solo pannello aperto alla volta
    panels.forEach(function (p) {
      p.classList.remove("acc-open");
    });
    panel.classList.add("acc-open");
  }
  panels.forEach(function (panel) {
    const summary = panel.querySelector(".acc-summary");
    if (summary) summary.addEventListener("click", function () {
      openAccPanel(panel);
    });
  });

  /* Alla riapertura del modal riparte da "Dove" e riallinea i contatori */
  const dovePanel = searchModalEl.querySelector('[data-panel="dove"]');
  searchModalEl.addEventListener("show.bs.modal", function () {
    openAccPanel(dovePanel);
    // Ricrea le righe ospiti: così sia i valori sia lo stato disabilitato dei +/- restano
    // coerenti con guestState anche se è stato cambiato dal pannello desktop.
    guestsEl.innerHTML = renderGuestRows();
    wireGuestCounters(guestsEl, updateChiValue);
    updateChiValue();
    applyDestFilter();
  });

  destListEl.querySelectorAll(".dest-item").forEach(function (item) { // Una volta riempiti i dati, passa al prossimo modale: DOVE, QUANDO, CHI
    item.addEventListener("click", function () {
      const d = destinations[item.dataset.dest];
      doveValue.textContent = d.title;
      if (doveInput) doveInput.value = d.title;
      openAccPanel(searchModalEl.querySelector('[data-panel="quando"]'));
    });
  });

  calendarEl.addEventListener("click", function (e) { // QUANDO: scegli una data e passa a "Chi"
    const dayBtn = e.target.closest(".day-btn");
    if (!dayBtn) return;
    selectDay(calendarEl, dayBtn);
    quandoValue.textContent = `${dayBtn.dataset.day} ${dayBtn.dataset.month}`;
    openAccPanel(searchModalEl.querySelector('[data-panel="chi"]'));
  });

  function applyDestFilter() { // DOVE: filtra le destinazioni suggerite in base al testo digitato
    const q = (doveInput ? doveInput.value : "").trim().toLowerCase();
    destListEl.querySelectorAll(".dest-item").forEach(function (item) {
      const title = destinations[item.dataset.dest].title.toLowerCase();
      item.style.display = !q || title.includes(q) ? "" : "none";
    });
  }
  if (doveInput) doveInput.addEventListener("input", applyDestFilter);

  function updateChiValue() { //  Contatori ospiti e aggiorna riepilogo "Chi"
    const total = guestState.adulti + guestState.bambini;
    chiValue.textContent =
      total > 0 ? `${total} ospit${total > 1 ? "i" : "e"}` : "Aggiungi ospiti";
  }
  wireGuestCounters(guestsEl, updateChiValue);

  searchModalEl.querySelector("#modal-clear").addEventListener("click", function () { // Cancella tutto (reset button)
    guestState.adulti = 0;
    guestState.bambini = 0;
    guestsEl.innerHTML = renderGuestRows();
    wireGuestCounters(guestsEl, updateChiValue);

    doveValue.textContent = "Cerca destinazioni";
    if (doveInput) doveInput.value = "";
    applyDestFilter(); // ripristina l'elenco completo delle destinazioni
    quandoValue.textContent = "Aggiungi date";
    chiValue.textContent = "Aggiungi ospiti";

    const desktopChi = document.querySelector("#guest-btn p");
    if (desktopChi) desktopChi.textContent = "Aggiungi ospiti";
  });

  /* Logica di Ricerca, fai input e chiude appena completati */
  searchModalEl.querySelector("#modal-search").addEventListener("click", function () {
    console.log("Ricerca:", {
      destinazione: doveValue.textContent,
      date: quandoValue.textContent,
      ospiti: { ...guestState },
    });
    const instance =
      bootstrap.Modal.getInstance(searchModalEl) ||
      new bootstrap.Modal(searchModalEl);
    instance.hide();
  });

  /* Se si passa a vista desktop e tablet (breakpoint > 840px) mentre il modal è aperto,
  chiudilo: il modale serve solo al mobile view */
  const mobileMq = window.matchMedia("(max-width: 840px)");
  mobileMq.addEventListener("change", function (e) {
    if (!e.matches) {
      const openInstance = bootstrap.Modal.getInstance(searchModalEl);
      if (openInstance) openInstance.hide();
    }
  });
}

/* HAMBURGER MENU */
const languageBtn = document.getElementById("language-btn");
const languageDropdown = document.getElementById("language-dropdown");

if (languageBtn && languageDropdown) languageBtn.addEventListener("click", function () {
  languageDropdown.classList.toggle("open");

  if (languageDropdown.classList.contains("open")) {
    languageDropdown.innerHTML = `
  <div class="language-menu">

    <h3>Lingua e paese</h3>

    <div class="language-section">
      <h4>Paesi</h4>

      <button>Italia</button>
      <button>Spagna</button>
      <button>Francia</button>
      <button>Regno Unito</button>
    </div>

    <div class="language-section">
      <h4>Lingue</h4>

      <button>Italiano</button>
      <button>English</button>
      <button>Español</button>
      <button>Français</button>
    </div>

  </div>
`;
  } else {
    languageDropdown.innerHTML = "";
  }
});

if (languageBtn && languageDropdown) document.addEventListener("click", function (event) {
  if (
    !languageBtn.contains(event.target) &&
    !languageDropdown.contains(event.target)
  ) {
    languageDropdown.classList.remove("open");
    languageDropdown.innerHTML = "";
  }
});
const menuBtn = document.getElementById("menu-btn");
const menuDropdown = document.getElementById("menu-dropdown");

if (menuBtn && menuDropdown) menuBtn.addEventListener("click", function () {
  menuDropdown.classList.toggle("open");

  if (menuDropdown.classList.contains("open")) {
    menuDropdown.innerHTML = `
     <div class="hamburger-menu">

  <button class="menu-item">
    <ion-icon name="help-circle-outline"></ion-icon>
    Centro assistenza
  </button>

  <hr>

<div class="host-card">

  <div class="host-card-text">
    <h4>Inizia a ospitare</h4>

    <p>
      Iniziare a ospitare e guadagnare un extra è facile.
    </p>
  </div>

  <ion-icon name="home-outline"></ion-icon>

</div>

  <hr>

  <button class="menu-item">Invita un host</button>

  <button class="menu-item">Trova un co-host</button>

  <button class="menu-item">Gift card</button>

  <hr>

  <button class="menu-item">Accedi o registrati</button>

</div>
    `;
  } else {
    menuDropdown.innerHTML = "";
  }
});

if (menuBtn && menuDropdown) document.addEventListener("click", function (event) {
  if (!menuBtn.contains(event.target) && !menuDropdown.contains(event.target)) {
    menuDropdown.classList.remove("open");
    menuDropdown.innerHTML = "";
  }
});

/* CAROUSEL SCROLL */
document.querySelectorAll(".places-section").forEach(function (section) { // Ogni sezione ha i suoi button (indipendenti)
  const track = section.querySelector(".airbnb-track");
  const btnPrev = section.querySelector(".btn-prev");
  const btnNext = section.querySelector(".btn-next");

  if (!track || !btnPrev || !btnNext) return;

  const getScrollAmount = function () { // prima card VISIBILE: con un filtro attivo la prima potrebbe essere nascosta
    const firstCard = Array.from(track.children).find(function (c) {
      return c.offsetWidth > 0; // (offsetWidth 0) e darebbe una larghezza NaN -> scrollBy diventerebbe un no-op
    });
    const cardWidth = firstCard ? firstCard.offsetWidth : track.clientWidth;
    if (!cardWidth) return track.clientWidth;
    const visible = Math.max(1, Math.floor(track.clientWidth / cardWidth));
    return cardWidth * visible; // larghezza di una card * quante ne sono visibili
  };

  btnPrev.addEventListener("click", function () {
    track.scrollBy({ left: -getScrollAmount(), behavior: "smooth" });
  });

  btnNext.addEventListener("click", function () {
    track.scrollBy({ left: getScrollAmount(), behavior: "smooth" });
  });

  const updateButtons = function () { // Abilita/disabilita i bottoni in base alla posizione di scroll
    const maxScroll = track.scrollWidth - track.clientWidth;
    btnPrev.disabled = track.scrollLeft <= 1;
    btnNext.disabled = track.scrollLeft >= maxScroll - 1;
  };

  track.addEventListener("scroll", updateButtons);
  window.addEventListener("resize", updateButtons);
  updateButtons();
});


function setupBookingDrawer() { // prenotazione mobile (la barra in basso apre e chiude la booking-card)
  const btn = document.querySelector(".mobile-booking-btn");
  const drawer = document.getElementById("check-dates");
  const backdrop = document.querySelector(".drawer-backdrop");
  const closeBtn = document.querySelector(".drawer-close");
  if (!btn || !drawer) return;

  const open = function () {
    drawer.classList.add("drawer-open");
    if (backdrop) backdrop.classList.add("show");
    document.body.style.overflow = "hidden";
  };
  const close = function () {
    drawer.classList.remove("drawer-open");
    if (backdrop) backdrop.classList.remove("show");
    document.body.style.overflow = "";
  };

  btn.addEventListener("click", open);
  if (closeBtn) closeBtn.addEventListener("click", close);
  if (backdrop) backdrop.addEventListener("click", close);

  window.matchMedia("(max-width: 840px)").addEventListener("change", function (e) { // chiudo il 'prenotazione mobile' quando si superano gli 840px.
    if (!e.matches) close();
  });
}
setupBookingDrawer();

function fillRoomCalendars() { // Riempie i dropdown CHECK-IN / CHECK-OUT con un calendario (Luglio 2026)
  let days = "";
  const firstWeekday = (new Date(2026, 6, 1).getDay() + 6) % 7; // allinea il giorno 1 (L=0)
  for (let i = 0; i < firstWeekday; i++) {
    days += `<span class="day-empty" aria-hidden="true"></span>`;
  }
  for (let i = 1; i <= 31; i++) {
    days += `<button class="day-btn" type="button" data-day="${i}">${i}</button>`;
  }
  const calendar = `<div class="calendar-menu"><div class="month"><h4>Luglio 2026</h4><div class="weekdays"><span>L</span><span>M</span><span>M</span><span>G</span><span>V</span><span>S</span><span>D</span></div><div class="days-grid">${days}</div></div></div>`;
  document.querySelectorAll(".room-date-dd").forEach(function (el) {
    el.innerHTML = calendar;
    el.addEventListener("click", function (e) { // CHECK-IN / CHECK-OUT: scegli una data e chiudi il dropdown
      const dayBtn = e.target.closest(".day-btn");
      if (!dayBtn) return;
      selectDay(el, dayBtn);
      const field = el.closest(".dropdown");
      if (!field) return;
      const summary = field.querySelector('[data-bs-toggle="dropdown"] p');
      if (summary) summary.textContent = `${dayBtn.dataset.day} luglio`;
      const toggle = field.querySelector('[data-bs-toggle="dropdown"]');
      if (toggle && window.bootstrap) {
        bootstrap.Dropdown.getOrCreateInstance(toggle).hide();
      }
    });
  });
}
fillRoomCalendars();

/* Contatore OSPITI della booking card (room.html): aggiustato
e aggiorna l'etichetta del pulsante su index.html non esiste .room-guest-dd → esce. */
function setupRoomGuests() {
  const dd = document.querySelector(".room-guest-dd");
  if (!dd) return;
  const field = dd.closest(".dropdown");
  const summary = field ? field.querySelector('[data-bs-toggle="dropdown"] p') : null;
  const updateSummary = function () {
    const total = guestState.adulti + guestState.bambini;
    if (summary) {
      summary.textContent =
        total > 0 ? `${total} ospit${total > 1 ? "i" : "e"}` : "Aggiungi ospiti";
    }
  };
  const render = function () { // (ri)crea le righe e le ricollega: numeri e stato +/- coerenti con guestState
    dd.innerHTML = `<div class="guest-menu">${renderGuestRows()}</div>`;
    wireGuestCounters(dd, updateSummary);
  };
  render();
  updateSummary();
  // Riallinea i numeri all'apertura: lo stato può essere stato cambiato altrove (modale di ricerca)
  const toggle = field ? field.querySelector('[data-bs-toggle="dropdown"]') : null;
  if (toggle) {
    toggle.addEventListener("show.bs.dropdown", function () {
      render();
      updateSummary();
    });
  }
}
setupRoomGuests();

/* "MOSTRA TUTTO": mostra l'header "Stays in <città>" e filtra la sezione cliccata */
function setupStaysHeader() {
  const header = document.getElementById("stays-header");
  const cityEl = document.getElementById("stays-city");
  const countEl = document.getElementById("stays-count");
  const showAllCards = document.querySelectorAll(".card-show-all");
  if (!header || !cityEl || !countEl || !showAllCards.length) return;

  const pills = header.querySelectorAll(".stays-pill");
  let activeSection = null;

  /* HERO fadeAnimation attivato al click su "Mostra tutto", solo desktop e tablet (min-width 841px) */
  const hero = document.getElementById("hero");
  const heroImgs = hero ? hero.querySelectorAll(".hero-img") : [];
  const desktopMq = window.matchMedia("(min-width: 841px)");
  const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  let heroTimer = null;
  let heroIdx = 0;

  function startHero() {
    if (heroTimer || reduceMq.matches || heroImgs.length < 2) return;
    heroTimer = setInterval(function () {
      heroImgs[heroIdx].classList.remove("is-active");
      heroIdx = (heroIdx + 1) % heroImgs.length;
      heroImgs[heroIdx].classList.add("is-active");
    }, 10000); // cambia immagine ogni 10 secondi
  }

  function stopHero() {
    if (heroTimer) {
      clearInterval(heroTimer);
      heroTimer = null;
    }
  }

  /* Sotto 841px l'hero section si nasconde e ferma il timer. Tornando sopra, se una sezione è già
     aperta, mostra/riavvia l'hero section (anche se il click "Mostra tutto" era avvenuto su mobile) */
  desktopMq.addEventListener("change", function (e) {
    if (e.matches) {
      if (header.classList.contains("is-open")) {
        document.body.classList.add("has-hero");
        if (hero) hero.setAttribute("aria-hidden", "false");
        startHero();
      }
    } else {
      stopHero();
      if (hero) hero.setAttribute("aria-hidden", "true"); // sotto 841px l'hero è nascosto via CSS
    }
  });


  const listingCols = function (section) {
    // Le colonne-card "alloggio" di una sezione (esclude la card "Mostra tutto")
    return Array.from(section.querySelectorAll(".airbnb-track > div")).filter(
      function (col) {
        return col.querySelector(".airbnb-card");
      },
    );
  };

  document.querySelectorAll(".places-section").forEach(function (section) { // Assegna uno stato available/booked a ogni card, in modo deterministico
    listingCols(section).forEach(function (col, i) {
      col.dataset.status = i % 3 === 2 ? "booked" : "available";
    });
  });

  function applyFilter(section, filter) { // Mostra/nasconde le card della sezione in base al filtro e aggiorna il contatore
    let visible = 0;
    listingCols(section).forEach(function (col) {
      const show = filter === "all" || col.dataset.status === filter;
      col.classList.toggle("is-hidden", !show);
      if (show) visible++;
    });
    countEl.textContent = visible;
    window.dispatchEvent(new Event("resize")); // cambia la larghezza dei button carousel prev e next
  }

  function setActivePill(filter) {
    pills.forEach(function (p) {
      p.classList.toggle("active", p.dataset.filter === filter);
    });
  }

  function openFor(card) {
    const section = card.closest(".places-section");
    if (!section) return;

    if (activeSection && activeSection !== section) { // ripristina la sezione filtrata in precedenza, così non resta nascosta
      listingCols(activeSection).forEach(function (col) {
        col.classList.remove("is-hidden");
      });
    }
    activeSection = section;
    cityEl.textContent = card.dataset.city || "";
    setActivePill("all");
    applyFilter(section, "all");
    header.classList.add("is-open");

    /* HERO solo desktop e tablet (min-width 841px) e sotto 841px resta nascosto */
    const showHero = !!hero && desktopMq.matches;
    if (showHero) {
      document.body.classList.add("has-hero");
      hero.setAttribute("aria-hidden", "false"); // ora visibile: leggibile dagli screen reader
      startHero();
    }

    (showHero ? hero : header).scrollIntoView({ behavior: "smooth", block: "start" }); // porta in cima all'hero se presente, altrimenti alla "Stays in <città>"
  }

  showAllCards.forEach(function (card) {
    card.addEventListener("click", function () {
      openFor(card);
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault(); // evita lo scroll della pagina sulla barra spaziatrice
        openFor(card);
      }
    });
  });

  pills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      setActivePill(pill.dataset.filter);
      if (activeSection) applyFilter(activeSection, pill.dataset.filter);
    });
  });
}
setupStaysHeader();

/* SCROLL Animation: ogni .places-section fa il fadeUp SOLO entrando scrollando verso il basso.
   Si resetta solo uscendo dal FONDO (scroll verso l'alto): uscendo dall'alto resta visibile,
   così risalendo non "salta" dentro e ri-anima solo se si riscende di nuovo fin qui. */
function setupScrollReveal() {
  const sections = document.querySelectorAll(".places-section");
  if (!sections.length || !("IntersectionObserver" in window)) return;

  let lastY = window.scrollY; // direzione di scroll: true = verso il basso (default anche al primo caricamento)
  let scrollingDown = true;
  window.addEventListener(
    "scroll",
    function () {
      const y = window.scrollY;
      if (y !== lastY) scrollingDown = y > lastY;
      lastY = y;
    },
    { passive: true },
  );

  const io = new IntersectionObserver( // https://www.html.it/pag/69654/intersection-observer-gestire-la-visibilita-degli-elementi/
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          // .reveal-down innesca il fadeUp: presente solo se entro scrollando verso il basso
          entry.target.classList.toggle("reveal-down", scrollingDown);
        } else if (!scrollingDown) {
          // reset SOLO quando esce dal fondo (scroll verso l'alto): uscendo dall'alto
          // (scroll giù) resta visibile, così risalendo non riappare di colpo
          entry.target.classList.remove("is-visible", "reveal-down");
        }
      });
    },
    { threshold: 0.12 },
  );

  sections.forEach(function (section) {
    section.classList.add("reveal");
    io.observe(section);
  });
}
setupScrollReveal();