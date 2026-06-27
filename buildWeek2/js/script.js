


const monthsData = [ /* DATI per i MESI */
  {
    name: "Giugno",
    days: 30,
  },
  {
    name: "Luglio",
    days: 31,
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

/* ho migliorate il codice di Antonio per far facilitare il render di HTML */
function weekdaysHTML() { // SETTIMANE
  return ["L", "M", "M", "G", "V", "S", "D"]
    .map((d) => `<span>${d}</span>`)
    .join("");
}

function monthHTML(month) { // MESI
  let days = "";
  for (let i = 1; i <= month.days; i++) {
    days += `<button class="day-btn" type="button" data-day="${i}" data-month="${month.name}">${i}</button>`;
  }
  return `
    <div class="month">
      <h4>${month.name}</h4>
      <div class="weekdays">${weekdaysHTML()}</div>
      <div class="days-grid">${days}</div>
    </div>`;
}

function calendarHTML() { // CALENDARIO
  return `<div class="months-container">${monthsData.map(monthHTML).join("")}</div>`;
}

function guestRowsHTML() { // GUEST
  return guestTypes
    .map(
      (g) => `
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
    </div>`,
    )
    .join("");
}

function destinationListHTML() { // DESTINAZIONI
  return destinations
    .map(
      (d, i) => `
    <li class="dest-item" data-dest="${i}">
      <span class="dest-icon"><i class="bi bi-geo-alt"></i></span>
      <div class="dest-text">
        <h6>${d.title}</h6>
        <p>${d.subtitle}</p>
      </div>
    </li>`,
    )
    .join("");
}

/* Collega i pulsanti +/- di un contenitore allo stato condiviso.
   onChange() viene richiamato dopo ogni variazione (per aggiornare i riepiloghi). */
function wireGuestCounters(scope, onChange) {
  scope.querySelectorAll(".guest-row").forEach((row) => {
    const key = row.dataset.guest;
    const valueEl = row.querySelector(".counter-value");

    row.querySelector(".counter-minus").addEventListener("click", () => {
      if (guestState[key] > 0) {
        guestState[key]--;
        valueEl.textContent = guestState[key];
        if (onChange) onChange();
      }
    });
    row.querySelector(".counter-plus").addEventListener("click", () => {
      guestState[key]++;
      valueEl.textContent = guestState[key];
      if (onChange) onChange();
    });
  });
}

/* NAVBAR - Gestione pulsante attivo */
const dropdown = document.getElementById("dropdown-container");
const searchBar = document.querySelector(".search-bar");

const desktopPanels = {
  "where-btn": () => `
    <div class="destination-menu">
      <h4 class="fade-item" style="animation-delay:0s">Destinazioni suggerite</h4>
      ${destinations
        .slice(0, 5)
        .map(
          (d, i) =>
            `<button class="destination-btn fade-item" type="button" style="animation-delay:${(i + 1) * 0.12}s">${d.title}</button>`,
        )
        .join("")}
    </div>`,
  "date-btn": () => `<div class="calendar-menu">${calendarHTML()}</div>`,
  "guest-btn": () => `<div class="guest-menu">${guestRowsHTML()}</div>`,
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
    dropdown.querySelectorAll(".destination-btn").forEach((b) => {
      b.addEventListener("click", () => {
        summary.textContent = b.textContent;
        closeDesktopPanel();
      });
    });
  }

  if (id === "guest-btn") { // Contatori ospiti per desktop e aggiornano il riepilogo "Chi" nella barra
    const summary = document.querySelector("#guest-btn p");
    const refreshChi = () => {
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
  Object.keys(desktopPanels).forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      showDesktopPanel(id);
    });
  });

  document.addEventListener("click", (e) => {
    // Se clicchiamo fuori dal modale, si chiude
    if (!openDesktopPanel) return;
    if (!dropdown.contains(e.target) && !searchBar.contains(e.target)) {
      closeDesktopPanel();
    }
  });

  window.matchMedia("(max-width: 840px)").addEventListener("change", (e) => { // Passando a mobile chiudi il pannello desktop, altrimenti lo stato resta "aperto"
    if (e.matches) closeDesktopPanel();
  });
}

/* Selezionando una categoria nella navbar, la STESSA categoria diventa
   reponsive sia per: Desktop, tablet, mobile e modale. */
function setupDependentCategories(selectors) {
  const groups = selectors
    .map((sel) => Array.from(document.querySelectorAll(sel)))
    .filter((group) => group.length > 0);

  const selectIndex = (index) => {
    groups.forEach((group) => {
      group.forEach((el, i) => el.classList.toggle("active", i === index));
    });
  };

  groups.forEach((group) => {
    group.forEach((el, i) => {
      el.addEventListener("click", () => selectIndex(i));
    });
  });
}
setupDependentCategories([".nav-item", ".mobile-cat", ".modal-cat"]);

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
  destListEl.innerHTML = destinationListHTML();
  calendarEl.innerHTML = calendarHTML();
  guestsEl.innerHTML = guestRowsHTML();

  function openAccPanel(panel) {
    panels.forEach((p) => p.classList.remove("acc-open")); // Accordion: un solo pannello aperto alla volta
    panel.classList.add("acc-open");
  }
  panels.forEach((panel) => {
    const summary = panel.querySelector(".acc-summary");
    if (summary) summary.addEventListener("click", () => openAccPanel(panel));
  });

  /* Alla riapertura del modal riparte da "Dove" e riallinea i contatori */
  const dovePanel = searchModalEl.querySelector('[data-panel="dove"]');
  searchModalEl.addEventListener("show.bs.modal", () => {
    openAccPanel(dovePanel);
    guestsEl.querySelectorAll(".guest-row").forEach((row) => {
      row.querySelector(".counter-value").textContent =
        guestState[row.dataset.guest];
    });
    updateChiValue();
  });

  destListEl.querySelectorAll(".dest-item").forEach((item) => { // Una volta riempiti i dati, passa al prossimo modale: DOVE, QUANDO, CHI
    item.addEventListener("click", () => {
      const d = destinations[item.dataset.dest];
      doveValue.textContent = d.title;
      if (doveInput) doveInput.value = d.title;
      openAccPanel(searchModalEl.querySelector('[data-panel="quando"]'));
    });
  });

  function updateChiValue() { //  Contatori ospiti e aggiorna riepilogo "Chi"
    const total = guestState.adulti + guestState.bambini;
    chiValue.textContent =
      total > 0 ? `${total} ospit${total > 1 ? "i" : "e"}` : "Aggiungi ospiti";
  }
  wireGuestCounters(guestsEl, updateChiValue);

  searchModalEl.querySelector("#modal-clear").addEventListener("click", () => { // Cancella tutto (reset button)
    guestState.adulti = 0;
    guestState.bambini = 0;
    guestsEl.innerHTML = guestRowsHTML();
    wireGuestCounters(guestsEl, updateChiValue);

    doveValue.textContent = "Cerca destinazioni";
    if (doveInput) doveInput.value = "";
    quandoValue.textContent = "Aggiungi date";
    chiValue.textContent = "Aggiungi ospiti";

    const desktopChi = document.querySelector("#guest-btn p");
    if (desktopChi) desktopChi.textContent = "Aggiungi ospiti";
  });

  // Logica di Ricerca, fai input e chiude appena completati
  searchModalEl.querySelector("#modal-search").addEventListener("click", () => {
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

  /* Se si passa a vista desktop/tablet (breakpoint > 840px) mentre il modal è aperto,
  chiudilo: il modale serve solo al mobile view */
  const mobileMq = window.matchMedia("(max-width: 840px)");
  mobileMq.addEventListener("change", (e) => {
    if (!e.matches) {
      const openInstance = bootstrap.Modal.getInstance(searchModalEl);
      if (openInstance) openInstance.hide();
    }
  });
}

/* HAMBURGER MENU */
const languageBtn = document.getElementById("language-btn");
const languageDropdown = document.getElementById("language-dropdown");

if (languageBtn && languageDropdown) languageBtn.addEventListener("click", () => {
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

if (languageBtn && languageDropdown) document.addEventListener("click", (event) => {
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

if (menuBtn && menuDropdown) menuBtn.addEventListener("click", () => {
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

if (menuBtn && menuDropdown) document.addEventListener("click", (event) => {
  if (!menuBtn.contains(event.target) && !menuDropdown.contains(event.target)) {
    menuDropdown.classList.remove("open");
    menuDropdown.innerHTML = "";
  }
});

/* CAROUSEL SCROLL */
document.querySelectorAll(".places-section").forEach((section) => { // Ogni sezione ha i suoi button (indipendenti)
  const track = section.querySelector(".airbnb-track");
  const btnPrev = section.querySelector(".btn-prev");
  const btnNext = section.querySelector(".btn-next");

  if (!track || !btnPrev || !btnNext) return;

  const getScrollAmount = () => {
    // prima card VISIBILE: con un filtro attivo la prima potrebbe essere nascosta
    // (offsetWidth 0) e darebbe una larghezza NaN -> scrollBy diventerebbe un no-op
    const firstCard = Array.from(track.children).find((c) => c.offsetWidth > 0);
    const cardWidth = firstCard ? firstCard.offsetWidth : track.clientWidth;
    if (!cardWidth) return track.clientWidth;
    const visible = Math.max(1, Math.floor(track.clientWidth / cardWidth));
    return cardWidth * visible; // larghezza di una card * quante ne sono visibili
  };

  btnPrev.addEventListener("click", () => {
    track.scrollBy({ left: -getScrollAmount(), behavior: "smooth" });
  });

  btnNext.addEventListener("click", () => {
    track.scrollBy({ left: getScrollAmount(), behavior: "smooth" });
  });

  const updateButtons = () => { // Abilita/disabilita i bottoni in base alla posizione di scroll
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

  const open = () => {
    drawer.classList.add("drawer-open");
    if (backdrop) backdrop.classList.add("show");
    document.body.style.overflow = "hidden";
  };
  const close = () => {
    drawer.classList.remove("drawer-open");
    if (backdrop) backdrop.classList.remove("show");
    document.body.style.overflow = "";
  };

  btn.addEventListener("click", open);
  if (closeBtn) closeBtn.addEventListener("click", close);
  if (backdrop) backdrop.addEventListener("click", close);

  window.matchMedia("(max-width: 840px)").addEventListener("change", (e) => { // chiudo il 'prenotazione mobile' quando si superano gli 840px.
    if (!e.matches) close();
  });
}
setupBookingDrawer();

function fillRoomCalendars() { // Riempie i dropdown CHECK-IN / CHECK-OUT con un calendario statico
  let days = "";
  for (let i = 1; i <= 31; i++) {
    days += `<button class="day-btn" type="button">${i}</button>`;
  }
  const calendar = `<div class="calendar-menu"><div class="month"><h4>Luglio 2026</h4><div class="weekdays"><span>L</span><span>M</span><span>M</span><span>G</span><span>V</span><span>S</span><span>D</span></div><div class="days-grid">${days}</div></div></div>`;
  document.querySelectorAll(".room-date-dd").forEach((el) => {
    el.innerHTML = calendar;
  });
}
fillRoomCalendars();

/* "MOSTRA TUTTO": mostra l'header "Stays in <città>" e filtra la sezione cliccata */
(function setupStaysHeader() {
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
    heroTimer = setInterval(() => {
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
  desktopMq.addEventListener("change", (e) => {
    if (e.matches) {
      if (header.classList.contains("is-open")) {
        document.body.classList.add("has-hero");
        startHero();
      }
    } else {
      stopHero();
    }
  });


  const listingCols = (section) => // Le colonne-card "alloggio" di una sezione (esclude la card "Mostra tutto")
    Array.from(section.querySelectorAll(".airbnb-track > div")).filter((col) =>
      col.querySelector(".airbnb-card"),
    );

  document.querySelectorAll(".places-section").forEach((section) => { // Assegna uno stato available/booked a ogni card, in modo deterministico
    listingCols(section).forEach((col, i) => {
      col.dataset.status = i % 3 === 2 ? "booked" : "available";
    });
  });

  function applyFilter(section, filter) { // Mostra/nasconde le card della sezione in base al filtro e aggiorna il contatore
    let visible = 0;
    listingCols(section).forEach((col) => {
      const show = filter === "all" || col.dataset.status === filter;
      col.classList.toggle("is-hidden", !show);
      if (show) visible++;
    });
    countEl.textContent = visible;
    window.dispatchEvent(new Event("resize")); // cambia la larghezza dei button carousel prev e next
  }

  function setActivePill(filter) {
    pills.forEach((p) => p.classList.toggle("active", p.dataset.filter === filter));
  }

  function openFor(card) {
    const section = card.closest(".places-section");
    if (!section) return;

    if (activeSection && activeSection !== section) { // ripristina la sezione filtrata in precedenza, così non resta nascosta 
      listingCols(activeSection).forEach((col) => col.classList.remove("is-hidden"));
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
      startHero();
    }

    (showHero ? hero : header).scrollIntoView({ behavior: "smooth", block: "start" }); // porta in cima all'hero se presente, altrimenti alla "Stays in <città>" 
  }

  showAllCards.forEach((card) => {
    card.addEventListener("click", () => openFor(card));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault(); // evita lo scroll della pagina sulla barra spaziatrice
        openFor(card);
      }
    });
  });

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      setActivePill(pill.dataset.filter);
      if (activeSection) applyFilter(activeSection, pill.dataset.filter);
    });
  });
})();

/* SCROLL Animation: ogni .places-section fa il fadeUp SOLO entrando scrollando verso il basso.
   Si resetta solo uscendo dal FONDO (scroll verso l'alto): uscendo dall'alto resta visibile,
   così risalendo non "salta" dentro e ri-anima solo se si riscende di nuovo fin qui. */
(function setupScrollReveal() {
  const sections = document.querySelectorAll(".places-section");
  if (!sections.length || !("IntersectionObserver" in window)) return;

  let lastY = window.scrollY; // direzione di scroll: true = verso il basso (default anche al primo caricamento)
  let scrollingDown = true;
  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      if (y !== lastY) scrollingDown = y > lastY;
      lastY = y;
    },
    { passive: true },
  );

  const io = new IntersectionObserver( // https://www.html.it/pag/69654/intersection-observer-gestire-la-visibilita-degli-elementi/
    (entries) => {
      entries.forEach((entry) => {
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

  sections.forEach((section) => {
    section.classList.add("reveal");
    io.observe(section);
  });
})();