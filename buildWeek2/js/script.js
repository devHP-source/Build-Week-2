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
