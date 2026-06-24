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