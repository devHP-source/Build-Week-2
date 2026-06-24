const dove = document.getElementById("where-btn");
const dateBtn = document.getElementById("date-btn");
const dropdown = document.getElementById("dropdown-container");

dove.addEventListener("click", () => {
  dropdown.classList.toggle("open");
  dropdown.innerHTML = `
     <div class="destination-menu">

    <h4 class="fade-item">Destinazioni suggerite</h4>

    <button class="destination-btn fade-item">Roma</button>

    <button class="destination-btn fade-item">Milano</button>

    <button class="destination-btn fade-item">Barcellona</button>

  </div>
  `;
});
let giorniGiugno = "";

for (let i = 1; i <= 30; i++) {
  giorniGiugno += `<button class="day-btn">${i}</button>`;
}

let giorniLuglio = "";

for (let i = 1; i <= 31; i++) {
  giorniLuglio += `<button class="day-btn">${i}</button>`;
}
dateBtn.addEventListener("click", () => {
  dropdown.classList.toggle("open");

  dropdown.innerHTML = `
    <div class="calendar-menu">

      <div class="months-container">

        <div class="month">
          <h4>Giugno</h4>
          <div class="weekdays">

    <span>L</span>

    <span>M</span>

    <span>M</span>

    <span>G</span>

    <span>V</span>

    <span>S</span>

    <span>D</span>

  </div>
  <div class="days-grid">
  ${giorniGiugno}
</div>
        </div>

        <div class="month">
          <h4>Luglio</h4>
          <div class="weekdays">

    <span>L</span>

    <span>M</span>

    <span>M</span>

    <span>G</span>

    <span>V</span>

    <span>S</span>

    <span>D</span>

  </div>
 <div class="days-grid">
  ${giorniLuglio}
</div>
        </div>

      </div>

    </div>
  `;
});
const guestBtn = document.getElementById("guest-btn")
guestBtn.addEventListener("click", () => {
  dropdown.classList.toggle("open")

 dropdown.innerHTML = `
  <div class="guest-menu">

    <div class="guest-row">
      <span>Adulti</span>

      <div class="counter">
        <button>-</button>
        <span>0</span>
        <button>+</button>
      </div>
    </div>

    <div class="guest-row">
      <span>Bambini</span>

      <div class="counter">
        <button>-</button>
        <span>0</span>
        <button>+</button>
      </div>
    </div>

  </div>
`
})

/* CAROUSEL SCROLL */
document.querySelectorAll(".places-section").forEach((section) => { // Ogni sezione ha i suoi button (indipendenti)
  const track = section.querySelector(".airbnb-track"); // in modo indipendente
  const btnPrev = section.querySelector(".btn-prev");
  const btnNext = section.querySelector(".btn-next");

  if (!track || !btnPrev || !btnNext) return;

  const getScrollAmount = () => { //
    const firstCard = track.firstElementChild;
    const cardWidth = firstCard ? firstCard.offsetWidth : track.clientWidth;
    const visible = Math.max(1, Math.floor(track.clientWidth / cardWidth));
    return cardWidth * visible; // la larghezza di una card * quante ne sono visibili
  };

  btnPrev.addEventListener("click", () => {
    track.scrollBy({ left: -getScrollAmount(), behavior: "smooth" });
  });

  btnNext.addEventListener("click", () => {
    track.scrollBy({ left: getScrollAmount(), behavior: "smooth" });
  });


  const updateButtons = () => {  // Abilita e disabilita i bottoni in base alla posizione di scroll
    const maxScroll = track.scrollWidth - track.clientWidth;
    btnPrev.disabled = track.scrollLeft <= 1;
    btnNext.disabled = track.scrollLeft >= maxScroll - 1;
  };

  track.addEventListener("scroll", updateButtons);
  window.addEventListener("resize", updateButtons);
  updateButtons();
});
