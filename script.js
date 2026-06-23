/* ============================================================
   KalimTrip — script.js
   Handles: destination grid/filter,
            scroll reveal, language toggle, navbar scroll
   ============================================================ */

// ── Current state ──────────────────────────────────────────
let currentLang = 'id';
let activeCity = 'Semua';
let activeCat  = 'Semua';

// ── DOM ready ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initLanguage();
  initFilters();
  renderDestinations();
  initScrollReveal();
});

// ── NAVBAR scroll effect ───────────────────────────────────
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const onScroll = () => {
    navbar.classList.toggle('solid', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ── LANGUAGE ──────────────────────────────────────────────
function initLanguage() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      if (lang === currentLang) return;
      currentLang = lang;
      document.querySelectorAll('.lang-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.lang === lang)
      );
      applyTranslations();
      // Re-render pill labels too
      initFilters();
      renderDestinations();
    });
  });
}

function applyTranslations() {
  const t = translations[currentLang];
  // Nav links
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.textContent = t[key];
  });
}

// ── FILTER PILLS ──────────────────────────────────────────
function initFilters() {
  const t = translations[currentLang];

  // ── City pills ──
  const cityContainer = document.getElementById('city-pills');
  if (cityContainer) {
    cityContainer.innerHTML = '';
    cities.forEach(city => {
      const label = (city === 'Semua') ? t.allCities : city;
      const btn   = document.createElement('button');
      btn.className = 'pill' + (city === activeCity ? ' active' : '');
      btn.textContent = label;
      btn.dataset.city = city;
      btn.addEventListener('click', () => {
        activeCity = city;
        cityContainer.querySelectorAll('.pill').forEach(p =>
          p.classList.toggle('active', p.dataset.city === city)
        );
        renderDestinations();
      });
      cityContainer.appendChild(btn);
    });
  }

  // ── Category pills ──
  const catContainer = document.getElementById('cat-pills');
  if (catContainer) {
    catContainer.innerHTML = '';
    categories.forEach(cat => {
      const label = (cat === 'Semua') ? t.allCats : cat;
      const btn   = document.createElement('button');
      btn.className = 'pill' + (cat === activeCat ? ' active' : '');
      btn.textContent = label;
      btn.dataset.cat = cat;
      btn.addEventListener('click', () => {
        activeCat = cat;
        catContainer.querySelectorAll('.pill').forEach(p =>
          p.classList.toggle('active', p.dataset.cat === cat)
        );
        renderDestinations();
      });
      catContainer.appendChild(btn);
    });
  }
}

// ── DESTINATION GRID ──────────────────────────────────────
function renderDestinations() {
  const t    = translations[currentLang];
  const grid = document.getElementById('dest-grid');
  if (!grid) return;

  const filtered = destinations.filter(d => {
    const cityMatch = activeCity === 'Semua' || d.city === activeCity;
    const catMatch  = activeCat  === 'Semua' || d.category === activeCat;
    return cityMatch && catMatch;
  });

  grid.innerHTML = '';

  if (filtered.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'dest-empty';
    empty.setAttribute('data-reveal', '');
    empty.textContent = t.noResult;
    grid.appendChild(empty);
    initScrollReveal();
    return;
  }

  filtered.forEach(dest => {
    const card = document.createElement('div');
    card.className = 'dest-card';
    card.setAttribute('data-reveal', '');

    const imgSrc = dest.image || 'https://via.placeholder.com/600x400?text=No+Image';

    card.innerHTML = `
      <div class="dest-img-wrap">
        <img src="${imgSrc}" alt="${dest.name}" loading="lazy"
             onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Gatto_europeo4.jpg/320px-Gatto_europeo4.jpg'">
        <span class="dest-cat-badge">${dest.category}</span>
      </div>
      <div class="dest-body">
        <div class="dest-city">📍 ${dest.city}</div>
        <h3>${dest.name}</h3>
        <p>${dest.description}</p>
        <div class="dest-meta">
          <div class="dest-meta-row">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5z"/>
            </svg>
            <span><strong>${t.ticketLabel}:</strong> ${dest.ticket}</span>
          </div>
          <div class="dest-meta-row">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span><strong>${t.hoursLabel}:</strong> ${dest.hours}</span>
          </div>
        </div>
        <a class="dest-link" href="${dest.website}" target="_blank" rel="noopener">
          ${t.websiteLabel}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
          </svg>
        </a>
      </div>
    `;
    grid.appendChild(card);
  });

  // Re-trigger scroll reveal for newly added cards
  setTimeout(initScrollReveal, 50);
}

// ── SCROLL REVEAL ─────────────────────────────────────────
function initScrollReveal() {
  const els = document.querySelectorAll('[data-reveal]:not(.is-visible)');
  if (!els.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  els.forEach(el => observer.observe(el));
}
