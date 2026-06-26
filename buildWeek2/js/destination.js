function mostraDettaglio(citta) {
    // 1. Gestione Visibilità (Mostra/Nascondi)
    const home = document.getElementById('home-container');
    if (home) home.style.display = 'none';

    const detailPage = document.getElementById('detail-page');
    if (detailPage) detailPage.style.display = 'block';

    // 2. Generazione Intestazione (Titolo e Sottotitolo)
    const detailHeader = document.getElementById('detail-header');
    if (detailHeader) {
        detailHeader.innerHTML = ''; // Svuotiamo il vecchio contenuto safely
        
        const cityName = citta.charAt(0).toUpperCase() + citta.slice(1);
        
        const h1 = document.createElement('h1');
        h1.classList.add('fw-bold', 'mb-1');
        h1.textContent = cityName;
        
        const p = document.createElement('p');
        p.classList.add('text-muted', 'mb-4');
        p.textContent = `Scopri i migliori alloggi a ${cityName} e dintorni`;
        
        detailHeader.appendChild(h1);
        detailHeader.appendChild(p);
    }

    // 3. Generazione delle Card tramite createElement
    const cardsGrid = document.getElementById('cards-grid');
    if (!cardsGrid) return;
    cardsGrid.innerHTML = ''; // Svuotiamo la griglia

    const alloggi = destinations[citta];
    if (!alloggi) return;

    alloggi.forEach((alloggio, index) => {
        const carouselId = `carousel-${citta}-${index}`;

        // Colonna Bootstrap
        const colDiv = document.createElement('div');
        colDiv.classList.add('col');

        // Card principale
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card', 'h-100', 'border-0', 'shadow-sm');

        // Contenitore Carosello
        const carouselDiv = document.createElement('div');
        carouselDiv.id = carouselId;
        carouselDiv.classList.add('carousel', 'slide');
        carouselDiv.setAttribute('data-bs-ride', 'false');

        // Contenitore Immagini (carousel-inner)
        const carouselInner = document.createElement('div');
        carouselInner.classList.add('carousel-inner');

        // Ciclo per creare i 5 item del carosello
        alloggio.images.forEach((imgUrl, imgIndex) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('carousel-item');
            if (imgIndex === 0) itemDiv.classList.add('active'); // La prima deve essere active

            const img = document.createElement('img');
            img.src = imgUrl;
            img.classList.add('airbnb-card-img');
            img.alt = `Foto ${imgIndex + 1}`;

            itemDiv.appendChild(img);
            carouselInner.appendChild(itemDiv);
        });

        // Freccia Prev
        const btnPrev = document.createElement('button');
        btnPrev.classList.add('carousel-control-prev');
        btnPrev.type = 'button';
        btnPrev.setAttribute('data-bs-target', `#${carouselId}`);
        btnPrev.setAttribute('data-bs-slide', 'prev');
        btnPrev.innerHTML = '<span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="visually-hidden">Previous</span>';

        // Freccia Next
        const btnNext = document.createElement('button');
        btnNext.classList.add('carousel-control-next');
        btnNext.type = 'button';
        btnNext.setAttribute('data-bs-target', `#${carouselId}`);
        btnNext.setAttribute('data-bs-slide', 'next');
        btnNext.innerHTML = '<span class="carousel-control-next-icon" aria-hidden="true"></span><span class="visually-hidden">Next</span>';

        // Corpo della card (Testi sotto le foto)
        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body', 'px-1', 'py-2');
        
        const cardTitle = document.createElement('h6');
        cardTitle.classList.add('card-title', 'fw-bold', 'mb-0');
        cardTitle.textContent = 'Bellissimo appartamento';
        
        const cardText = document.createElement('p');
        cardText.classList.add('card-text', 'text-muted', 'small', 'mb-0');
        cardText.textContent = 'Disponibile ora';

        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardText);

        // Assemblaggio finale (AppendChild)
        carouselDiv.appendChild(carouselInner);
        carouselDiv.appendChild(btnPrev);
        carouselDiv.appendChild(btnNext);
        
        cardDiv.appendChild(carouselDiv);
        cardDiv.appendChild(cardBody);
        
        colDiv.appendChild(cardDiv);
        cardsGrid.appendChild(colDiv);
    });
}

function tornaAllaHome() {
    // 1. Nascondi la pagina di dettaglio
    const detailPage = document.getElementById('detail-page');
    if (detailPage) detailPage.style.display = 'none';

    // 2. Mostra la home
    const homeContainer = document.getElementById('home-container');
    if (homeContainer) homeContainer.style.display = 'block';
    
    //scrolla la pagina verso l'alto
    window.scrollTo(0, 0);
}