let books = [];
let currentLang = 'en';
let booksPerYearChart, genreChart;

const translations = {
  en: {
    title: "📚 My Reading Dashboard",
    search: "Search books...",
    total: "📖 Total Books",
    avg: "⭐ Average Rating",
    perYear: "📅 Books per Year",
    allYears: "All Years",
    allGenres: "All Genres"
  },
  fr: {
    title: "📚 Mon Journal de Lecture",
    search: "Rechercher...",
    total: "📖 Nombre de livres",
    avg: "⭐ Note moyenne",
    perYear: "📅 Livres par année",
    allYears: "Toutes les années",
    allGenres: "Tous les genres"
  }
};

function setLanguage(lang) {
  currentLang = lang;
  applyTranslations();       // update site text
  populateFilters();         // update year & genre dropdowns
  updateFormPlaceholders();  // update Add Book form
  updateLanguageDropdown();  // update language filter labels
  renderBooks();             // redraw book cards
  renderCharts();            // redraw charts
}

function updateLanguageDropdown() {
  const langSelect = document.getElementById('langFilter');
  const t = translations[currentLang];

  langSelect.innerHTML = `
    <option value="">${t.langAll}</option>
    <option value="fr">${t.langFr}</option>
    <option value="en">${t.langEn}</option>
    <option value="both">${t.langBoth}</option>
  `;
}

function populateFilters() {
  const yearSet = new Set();
  const genreSet = new Set();
  books.forEach(b => { yearSet.add(b.year); genreSet.add(b.genre); });

  const yearSelect = document.getElementById('yearFilter');
  Array.from(yearSet).sort((a,b) => b-a).forEach(y => {
    const option = document.createElement('option');
    option.value = y; option.text = y;
    yearSelect.appendChild(option);
  });

  const genreSelect = document.getElementById('genreFilter');
  Array.from(genreSet).sort().forEach(g => {
    const option = document.createElement('option');
    option.value = g; option.text = g;
    genreSelect.appendChild(option);
  });
}

function applyTranslations() {
  const t = translations[currentLang];
  document.querySelector("h1").innerText = t.title;
  document.getElementById("search").placeholder = t.search;
  document.getElementById("totalBooks").innerText = `${t.total}: ${books.length}`;
  const avgRating = (books.reduce((a,b) => a+b.rating,0)/books.length).toFixed(2);
  document.getElementById("avgRating").innerText = `${t.avg}: ${avgRating}`;
  const booksPerYear = {};
  books.forEach(b => booksPerYear[b.year] = (booksPerYear[b.year] || 0) + 1);
  document.getElementById("booksPerYear").innerText = `${t.perYear}: ${JSON.stringify(booksPerYear)}`;
}

function renderBooks() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const yearFilter = document.getElementById('yearFilter').value;
  const genreFilter = document.getElementById('genreFilter').value;
  const langFilter = document.getElementById('langFilter').value;

  const container = document.getElementById('booksContainer');
  container.innerHTML = '';

  const filteredBooks = books.filter(b => 
    // search matches title, author, or note in the current language
    (b.title.toLowerCase().includes(query) ||
     b.author.toLowerCase().includes(query) ||
     (currentLang==='fr' ? (b.note_fr || '').toLowerCase().includes(query) : (b.note_en || '').toLowerCase().includes(query)) ||
     String(b.year).includes(query)
    ) &&
    // year filter
    (yearFilter === "" || b.year == yearFilter) &&
    // genre filter
    (genreFilter === "" || b.genre == genreFilter) &&
    // language filter
    (langFilter === "" || b.lang === langFilter || b.lang === "both")
  );

  if (filteredBooks.length === 0) {
    container.innerHTML = `<p>${currentLang==='fr' ? "Aucun livre trouvé" : "No books found"}</p>`;
    return;
  }

  filteredBooks.forEach(b => {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <h4>${b.title}</h4>
      <p>${b.author} (${b.year})</p>
      <p>${currentLang==='fr' ? (b.note_fr || "") : (b.note_en || "")}</p>
      <p>${"⭐".repeat(b.rating)}</p>
      <span class="genre-badge">${b.genre}</span>
    `;
    container.appendChild(card);
  });
}

function renderStats() {
  applyTranslations();
}

function renderCharts() {
  // Books per Year
  const booksPerYearData = {};
  books.forEach(b => booksPerYearData[b.year] = (booksPerYearData[b.year] || 0) + 1);
  const years = Object.keys(booksPerYearData).sort();
  const yearCounts = years.map(y => booksPerYearData[y]);
  if (booksPerYearChart) booksPerYearChart.destroy();
  booksPerYearChart = new Chart(document.getElementById('booksPerYearChart'), {
    type: 'bar',
    data: {
      labels: years,
      datasets: [{
        label: currentLang==='fr' ? 'Livres par année' : 'Books per Year',
        data: yearCounts,
        backgroundColor: '#66ccff'
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  // Genre Distribution
  const genreData = {};
  books.forEach(b => genreData[b.genre] = (genreData[b.genre] || 0) + 1);
  const genres = Object.keys(genreData);
  const counts = genres.map(g => genreData[g]);
  if (genreChart) genreChart.destroy();
  genreChart = new Chart(document.getElementById('genreChart'), {
    type: 'pie',
    data: {
      labels: genres,
      datasets: [{
        label: currentLang==='fr' ? 'Répartition par genre' : 'Genre Distribution',
        data: counts,
        backgroundColor: genres.map((_,i) => `hsl(${i*60},70%,60%)`)
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}
