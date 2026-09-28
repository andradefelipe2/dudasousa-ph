// Elementos da Interface
const eventsContainer = document.getElementById('events-container');
const galleryContainer = document.getElementById('gallery-container');
const currentEventTitle = document.getElementById('current-event-title');
const loadingSpinner = document.getElementById('loading-spinner');

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');

// Botões de Tema e Idioma
const themeToggle = document.getElementById('theme-toggle');
const langToggle = document.getElementById('lang-toggle');

let eventosData = [];
let currentLang = localStorage.getItem('site_lang') || 'pt';

// --- 1. LÓGICA DE TEMA (SOL / LUA) ---
function initTheme() {
  const savedTheme = localStorage.getItem('site_theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
  } else {
    themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
  }
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  
  themeToggle.innerHTML = isLight 
    ? '<i class="fa-solid fa-sun"></i>' 
    : '<i class="fa-solid fa-moon"></i>';
    
  localStorage.setItem('site_theme', isLight ? 'light' : 'dark');
});

// --- 2. LÓGICA DE IDIOMA (PT / EN) ---
function updateLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('site_lang', lang);
  langToggle.textContent = lang === 'pt' ? 'EN' : 'PT';

  // Atualiza todos os elementos estáticos que possuem atributos data-pt e data-en
  document.querySelectorAll('[data-pt]').forEach(el => {
    el.textContent = el.getAttribute(`data-${lang}`);
  });
}

langToggle.addEventListener('click', () => {
  const nextLang = currentLang === 'pt' ? 'en' : 'pt';
  updateLanguage(nextLang);
});

// --- 3. LÓGICA DA GALERIA ---
async function init() {
  initTheme();
  updateLanguage(currentLang);

  try {
    const res = await fetch('eventos.json');
    eventosData = await res.json();
    
    renderEventsScroll();

    if (eventosData.length > 0) {
      selectEvent(eventosData[0]);
    }
  } catch (error) {
    console.error('Erro ao carregar lista de eventos:', error);
    currentEventTitle.textContent = currentLang === 'pt' ? 'Erro ao carregar projetos.' : 'Error loading projects.';
  }
}

function renderEventsScroll() {
  eventsContainer.innerHTML = '';

  eventosData.forEach((evento, index) => {
    const card = document.createElement('div');
    card.classList.add('event-card');
    if (index === 0) card.classList.add('active');
    card.dataset.id = evento.id;

    card.innerHTML = `
      <img src="${evento.capa}" alt="${evento.titulo}">
      <div class="card-overlay">
        <span>${evento.titulo}</span>
      </div>
    `;

    card.addEventListener('click', () => {
      document.querySelectorAll('.event-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectEvent(evento);
    });

    eventsContainer.appendChild(card);
  });
}

async function selectEvent(evento) {
  currentEventTitle.textContent = evento.titulo;
  galleryContainer.innerHTML = '';
  loadingSpinner.style.display = 'block';

  try {
    const response = await fetch(`/api/galeria?folderId=${evento.driveFolderId}`);
    const data = await response.json();

    loadingSpinner.style.display = 'none';

    if (!data.files || data.files.length === 0) {
      galleryContainer.innerHTML = `<p style="color: var(--text-secondary);">${currentLang === 'pt' ? 'Nenhuma foto encontrada.' : 'No photos found.'}</p>`;
      return;
    }

    data.files.forEach(file => {
      const imgUrl = `https://lh3.googleusercontent.com/d/${file.id}`;

      const item = document.createElement('div');
      item.classList.add('gallery-item');
      item.innerHTML = `<img src="${imgUrl}" alt="${file.name}" loading="lazy">`;

      item.addEventListener('click', () => openLightbox(imgUrl));

      galleryContainer.appendChild(item);
    });
  } catch (error) {
    loadingSpinner.style.display = 'none';
    console.error('Erro ao carregar fotos do Drive:', error);
    galleryContainer.innerHTML = `<p style="color: var(--text-secondary);">${currentLang === 'pt' ? 'Erro ao carregar fotos.' : 'Error loading photos.'}</p>`;
  }
}

// Lightbox
function openLightbox(url) {
  lightboxImg.src = url;
  lightbox.classList.add('active');
}

lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) lightbox.classList.remove('active');
});

init();
