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

// --- LANGUAGE SWITCH ---
function setLanguage(lang) {
  currentLang = lang;
  applyTranslations();
  populateFilters();
  updateLanguageDropdown();
  renderBooks();
  renderCharts();
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

// --- FILTERS ---
function populateFilters() {
  const yearSet = new Set();
  books.forEach(b => yearSet.add(b.year));

  const yearSelect = document.getElementById('yearFilter');
  yearSelect.innerHTML = '';
  const t = translations[currentLang];
  const defaultYear = document.createElement('option');
  defaultYear.value = '';
  defaultYear.text = t.allYears;
  yearSelect.appendChild(defaultYear);
  Array.from(yearSet).sort((a,b)=>b-a).forEach(y=>{
    const opt = document.createElement('option'); opt.value=y; opt.text=y;
    yearSelect.appendChild(opt);
  });

  // Genres (bilingual)
  const genreSet = new Set();
  books.forEach(b => genreSet.add(currentLang==='fr'?b.genre:b.genre_en));

  const genreSelect = document.getElementById('genreFilter');
  genreSelect.innerHTML = '';
  const defaultGenre = document.createElement('option');
  defaultGenre.value=''; defaultGenre.text=t.allGenres;
  genreSelect.appendChild(defaultGenre);

  Array.from(genreSet).sort().forEach(g=>{
    const opt = document.createElement('option'); opt.value=g; opt.text=g;
    genreSelect.appendChild(opt);
  });
}

// --- APPLY TRANSLATIONS ---
function applyTranslations() {
  const t = translations[currentLang];
  document.querySelector("h1").innerText = t.title;
  document.getElementById("searchInput").placeholder = t.search;
  document.getElementById("totalBooks").innerText = `${t.total}: ${books.length}`;
  const avgRating = books.length ? (books.reduce((a,b)=>a+b.rating,0)/books.length).toFixed(2) : 0;
  document.getElementById("avgRating").innerText = `${t.avg}: ${avgRating}`;
  const booksPerYear = {};
  books.forEach(b => booksPerYear[b.year] = (booksPerYear[b.year]||0)+1);
  document.getElementById("booksPerYear").innerText = `${t.perYear}: ${JSON.stringify(booksPerYear)}`;
}

// --- RENDER BOOK CARDS ---
function renderBooks() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const yearFilter = document.getElementById('yearFilter').value;
  const genreFilter = document.getElementById('genreFilter').value;
  const langFilter = document.getElementById('langFilter').value;

  const container = document.getElementById('booksContainer');
  container.innerHTML = '';

  const filteredBooks = books.filter(b=>{
    const genreDisplay = currentLang==='fr'?b.genre:b.genre_en;
    return (
      (b.title.toLowerCase().includes(query) ||
       b.author.toLowerCase().includes(query) ||
       (currentLang==='fr'? (b.note_fr||'').toLowerCase() : (b.note_en||'').toLowerCase()) ||
       String(b.year).includes(query)
      ) &&
      (yearFilter==='' || b.year==yearFilter) &&
      (genreFilter==='' || genreDisplay==genreFilter) &&
      (langFilter==='' || b.lang===langFilter || b.lang==='both')
    );
  });

  if(filteredBooks.length===0){
    container.innerHTML=`<p>${currentLang==='fr'?"Aucun livre trouvé":"No books found"}</p>`;
    return;
  }

  // Crée la liste unique des genres pour les couleurs
  const allGenres = Array.from(new Set(books.map(b => currentLang==='fr'?b.genre:b.genre_en)));

  filteredBooks.forEach(b=>{
    const genreDisplay = currentLang==='fr'?b.genre:b.genre_en;
    const card = document.createElement('div');
    card.className='book-card';
    card.innerHTML = `
      <h4>${b.title}</h4>
      <p>${b.author} (${b.year})</p>
      <p class="star-rating">${"⭐".repeat(b.rating)}</p>
      <span class="genre-badge genre-${genreDisplay.replace(/\s/g,'-')}">${genreDisplay}</span>
      ${ (currentLang==='fr' ? b.note_fr : b.note_en) ? `<span class="note-tooltip">${currentLang==='fr'?b.note_fr:b.note_en}</span>` : '' }
    `;

    // --- assigner l'index pour la couleur ---
    const genreIndex = allGenres.indexOf(genreDisplay);
    card.querySelector('.genre-badge').style.setProperty('--genre-index', genreIndex);

    container.appendChild(card);
  });
}

// --- RENDER CHARTS ---
function renderCharts() {
  // Books per Year
  const booksPerYearData = {};
  books.forEach(b=>booksPerYearData[b.year]=(booksPerYearData[b.year]||0)+1);
  const years = Object.keys(booksPerYearData).sort();
  const yearCounts = years.map(y=>booksPerYearData[y]);
  if(booksPerYearChart) booksPerYearChart.destroy();
  booksPerYearChart=new Chart(document.getElementById('booksPerYearChart'),{
    type:'bar',
    data:{labels:years,datasets:[{label:currentLang==='fr'?'Livres par année':'Books per Year',data:yearCounts,backgroundColor:'#66ccff'}]},
    options:{responsive:true, maintainAspectRatio:false}
  });

  // Genre Distribution
  const genreData = {};
  books.forEach(b=>{
    const genreDisplay = currentLang==='fr'?b.genre:b.genre_en;
    genreData[genreDisplay]=(genreData[genreDisplay]||0)+1;
  });
  const genres = Object.keys(genreData); 
  const counts = genres.map(g=>genreData[g]);
  if(genreChart) genreChart.destroy();
  genreChart=new Chart(document.getElementById('genreChart'),{
    type:'pie',
    data:{labels:genres,datasets:[{label:currentLang==='fr'?'Répartition par genre':'Genre Distribution',data:counts,backgroundColor:genres.map((_,i)=>`hsl(${i*60},70%,60%)`)}]},
    options:{responsive:true, maintainAspectRatio:false}
  });
}

// --- LOAD books.json ---
document.addEventListener("DOMContentLoaded",()=>{
  fetch('books.json')
    .then(res=>res.json())
    .then(data=>{
      books=data;
      populateFilters();
      updateLanguageDropdown();
      renderBooks();
      renderCharts();
    })
    .catch(err=>console.error("Failed to load books.json",err));
});
