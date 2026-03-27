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
  applyTranslations();
  renderBooks();
  renderCharts();
}

fetch('books.json')
  .then(res => res.json())
  .then(data => {
    books = data;
    populateFilters();
    renderBooks();
    renderStats();
    applyTranslations();
    renderCharts();
  });

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
  const container = document.getElementById('book-container');
  const query = document.getElementById('search').value.toLowerCase();
  const yearFilter = document.getElementById('yearFilter').value;
  const genreFilter = document.getElementById('genreFilter').value;

  container.innerHTML = '';

  books
    .filter(b => 
      (b.title.toLowerCase().includes(query) ||
       b.author.toLowerCase().includes(query) ||
       (currentLang==='fr' ? b.note_fr?.toLowerCase().includes(query) : b.note_en?.toLowerCase().includes(query)) ||
       String(b.year).includes(query)) &&
      (yearFilter === "" || b.year == yearFilter) &&
      (genreFilter === "" || b.genre == genreFilter)
    )
    .sort((a,b) => b.year - a.year)
    .forEach(b => {
      const stars = '⭐'.repeat(b.rating);
      const note = currentLang === 'fr' ? b.note_fr || b.note_en : b.note_en || b.note_fr;
      container.innerHTML += `
        <div class="book-card">
          <h2>${b.title}</h2>
          <div class="author">${b.author} (${b.year})</div>
          <div class="rating rating-${b.rating}">${stars}</div>
          <div class="note">${note}</div>
          <div class="genre">${b.genre}</div>
        </div>
      `;
    });
  renderCharts();
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
