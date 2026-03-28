let books = []; // your books.json data will be loaded here
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
    allGenres: "All Genres",
    langAll: "All Languages",
    langFr: "French",
    langEn: "English",
    langBoth: "Both"
  },
  fr: {
    title: "📚 Mon Journal de Lecture",
    search: "Rechercher...",
    total: "📖 Nombre de livres",
    avg: "⭐ Note moyenne",
    perYear: "📅 Livres par année",
    allYears: "Toutes les années",
    allGenres: "Tous les genres",
    langAll: "Toutes les langues",
    langFr: "Français",
    langEn: "Anglais",
    langBoth: "Les deux"
  }
};

// ----- Language toggle -----
function setLanguage(lang) {
  currentLang = lang;
  applyTranslations();       // update site text
  populateFilters();         // update year & genre dropdowns
  updateFormPlaceholders();  // update Add Book form if you have one
  updateLanguageDropdown();  // update language filter labels
  renderBooks();             // redraw book cards
  renderCharts();            // redraw charts
}

// ----- Language dropdown -----
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

// ----- Populate year & genre filters -----
function populateFilters() {
  const yearSet = new Set();
  const genreSet = new Set();
  books.forEach(b => { yearSet.add(b.year); genreSet.add(b.genre); });

  const yearSelect = document.getElementById('yearFilter');
  yearSelect.innerHTML = ''; // clear old options
  const t = translations[currentLang];
  const defaultYear = document.createElement('option');
  defaultYear.value = '';
  defaultYear.text = t.allYears;
  yearSelect.appendChild(defaultYear);
  Array.from(yearSet).sort((a,b) => b-a).forEach(y => {
    const option = document.createElement('option');
    option.value = y; option.text = y;
    yearSelect.appendChild(option);
  });

  const genreSelect = document.getElementById('genreFilter');
  genreSelect.innerHTML = ''; // clear old options
  const defaultGenre = document.createElement('option');
  defaultGenre.value = '';
  defaultGenre.text = t.allGenres;
  genreSelect.appendChild(defaultGenre);
  Array.from(genreSet).sort().forEach(g => {
    const option = document.createElement('option');
    option.value = g; option.text = g;
    genreSelect.appendChild(option);
  });
}

// ----- Apply translations to static text -----
function applyTranslations() {
  const t = translations[currentLang];
  document.querySelector("h1").innerText = t.title;
  document.getElementById("searchInput").placeholder = t.search;
  document.getElementById("totalBooks").innerText = `${t.total}: ${books.length}`;
  const avgRating = books.length ? (books.reduce((a,b) => a+b.rating,0)/books.length).toFixed(2) : 0;
  document.getElementById("avgRating").innerText = `${t.avg}: ${avgRating}`;
  const booksPerYear = {};
  books.forEach(b => booksPerYear[b.year] = (booksPerYear[b.year] || 0) + 1);
  document.getElementById("booksPerYear").innerText = `${t.perYear}: ${JSON.stringify(booksPerYear)}`;
}

// ----- Render books -----
function renderBooks() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const yearFilter = document.getElementById('yearFilter').value;
  const genreFilter = document.getElementById('genreFilter').value;
  const langFilter = document.getElementById('langFilter').value;

  const container = document.getElementById('booksContainer');
  container.innerHTML = '';

  const filteredBooks = books.filter(b => 
    (b.title.toLowerCase().includes(query) ||
     b.author.toLowerCase().includes(query) ||
     (currentLang==='fr' ? (b.note_fr || '').toLowerCase().includes(query) : (b.note_en || '').toLowerCase().includes(query)) ||
     String(b.year).includes(query)
    ) &&
    (yearFilter === "" || b.year == yearFilter) &&
    (genreFilter === "" || b.genre == genreFilter) &&
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

// ----- Optional Add Book form placeholders -----
function updateFormPlaceholders() {
  // Only if you implement an Add Book form
}

// ----- Charts -----
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

// ----- Initial load (example) -----
document.addEventListener("DOMContentLoaded", () => {
  // load your books here or via fetch('books.json')
  // Example: books = [...]; 
  populateFilters();
  updateLanguageDropdown();
  renderBooks();
  renderCharts();
});
